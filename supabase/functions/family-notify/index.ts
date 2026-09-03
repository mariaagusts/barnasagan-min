// ══════════════════════════════════════════════
//  family-notify — barnasagan.is
//  Sendir foreldri tölvupóst þegar fjölskyldan
//  sendir inn nýja spurningu (kallað frá fjolskylda.html).
//  Treystir ALDREI efni frá klíenti: les nýjustu spurninguna
//  úr gagnagrunninum út frá token.
//
//  Secrets: RESEND_API_KEY
//  MUNA: slökkva á "Verify JWT with legacy secret" eftir Deploy!
// ══════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const { token } = await req.json().catch(() => ({}));
    if (!token || typeof token !== "string" || token.length < 20) {
      return json({ ok: false }, 400);
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Gildur hlekkur?
    const { data: link } = await sb.from("family_links")
      .select("user_id, child_id, active").eq("token", token).maybeSingle();
    if (!link?.active) return json({ ok: false }, 403);

    // Nýjasta ósvaraða spurningin frá síðustu 5 mínútum (efnið kemur úr
    // gagnagrunninum, ekki frá klíentinum)
    const cutoff = new Date(Date.now() - 5 * 60_000).toISOString();
    const { data: q } = await sb.from("family_questions")
      .select("id, asker_name, question, created_at")
      .eq("token", token).eq("status", "pending")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(1).maybeSingle();
    if (!q) return json({ ok: true, sent: false });

    // Hóflegt: ekki fleiri en 5 póstar per hlekk per klukkustund
    const hourAgo = new Date(Date.now() - 60 * 60_000).toISOString();
    const { count } = await sb.from("family_questions")
      .select("id", { count: "exact", head: true })
      .eq("token", token).gte("created_at", hourAgo);
    if ((count ?? 0) > 5) return json({ ok: true, sent: false });

    // Nafn barnsins (fyrir efnislínuna)
    const { data: child } = await sb.from("children")
      .select("child_name").eq("id", link.child_id).maybeSingle();
    const childName = child?.child_name || "";

    // Netfang foreldrisins
    const { data: userData, error: userErr } = await sb.auth.admin.getUserById(link.user_id);
    const email = userData?.user?.email;
    if (userErr || !email) return json({ ok: true, sent: false });

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return json({ ok: true, sent: false });

    const asker = escapeHtml(q.asker_name);
    const questionHtml = escapeHtml(q.question);
    const childHtml = escapeHtml(childName);
    const aboutChild = childName ? ` um söguna um ${childHtml}` : "";
    const html = `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#FFF8F0;">
        <h2 style="color:#3E2723;font-size:22px;margin-bottom:8px;">${asker} sendi þér spurningu 🧡</h2>
        <p style="color:#7A5F4D;font-size:15px;line-height:1.7;">Einhvern úr fjölskyldunni þinni langar að vita meira${aboutChild}. Spurningin bíður þín á Barnasagan mín:</p>
        <div style="background:#ffffff;border-left:4px solid #E06C00;border-radius:12px;padding:18px 20px;margin:24px 0;">
          <div style="font-size:13px;color:#E06C00;font-weight:bold;margin-bottom:6px;">${asker} spyr:</div>
          <div style="font-size:17px;color:#3E2723;line-height:1.6;">${questionHtml}</div>
        </div>
        <p style="color:#7A5F4D;font-size:15px;line-height:1.7;">Þú ræður hvort og hvenær þú svarar. Opnaðu söguna og spurningin birtist efst á kaflayfirlitinu.</p>
        <p style="text-align:center;margin:28px 0;">
          <a href="https://www.barnasagan.is" style="background:#E06C00;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;display:inline-block;">Opna söguna</a>
        </p>
        <hr style="border:none;border-top:1px solid #F2DCB8;margin:24px 0;">
        <p style="color:#B3A08F;font-size:13px;">Barnasagan mín · barnasagan.is<br>Multa Bene Agere ehf. · kt. 471025-0380</p>
      </div>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Barnasagan mín <hallo@barnasagan.is>",
        to: email,
        subject: childName
          ? `${q.asker_name} sendi þér spurningu um söguna um ${childName}`
          : `${q.asker_name} sendi þér spurningu á Barnasagan mín`,
        html,
      }),
    });

    return json({ ok: true, sent: true });
  } catch (err) {
    console.error("family-notify villa:", err);
    return json({ ok: false }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function escapeHtml(s: string) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
