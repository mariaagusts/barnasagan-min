// ══════════════════════════════════════════════
//  kling-webhook — barnasagan.is
//  Handles Kling payment_intent.captured events.
//  - Direct single/multi/upgrade: marks user as paid
//  - Gift single: generates BARN-XXXXXXXX code (plan: single)
//  - Gift multi (uses mörg börn link): generates BARN-XXXXXXXX code (plan: multi)
//
//  Supabase secret required: KLING_WEBHOOK_SECRET
// ══════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Kling payment link IDs (UUID part of https://kling.is/pay/UUID)
const LINK_SINGLE  = "3028e4c4-53a8-41df-acef-663ca8e9b2a3"; // eitt barn
const LINK_MULTI   = "b3027cc3-883e-4b6b-8eaa-38f02cc92ba2"; // mörg börn / fjölskyldukóði
const LINK_UPGRADE = "8333f326-e34f-4e35-b693-a0902e2f53bc"; // uppfærsla
const LINK_GIFT    = "060059ef-083e-4a6e-89fd-e5f56971f82d"; // gjafakóði eitt barn

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const rawBody = await req.text();
  console.log("kling-webhook (barnasagan) payload:", rawBody);

  const secret = Deno.env.get("KLING_WEBHOOK_SECRET");
  if (secret) {
    const valid = await verifyKlingSignature(rawBody, req.headers.get("X-Kling-Signature") || "", secret);
    if (!valid) {
      console.error("Ógilt Kling undirskrift");
      return new Response("Forbidden", { status: 403 });
    }
  } else {
    console.warn("KLING_WEBHOOK_SECRET ekki stilltur");
  }

  try {
    const event = JSON.parse(rawBody);
    const eventType: string = event.event || event.event_type || "";

    if (eventType !== "payment_intent.captured" && eventType !== "payment.completed") {
      console.log("Ómeðhöndlað Kling event:", eventType);
      return ok();
    }

    const data = event.data || event;
    const transactionId: string | undefined = data?.id || data?.transaction_id;

    const paymentLinkId: string | undefined =
      data?.payment_link?.id ||
      data?.payment_link_id ||
      data?.product?.payment_link_id;

    const email: string | undefined =
      data?.customer?.email ||
      data?.billing_details?.email ||
      data?.email ||
      event?.customer?.email;

    if (!email) {
      console.error("Ekkert netfang í payload:", JSON.stringify(event));
      return new Response("No email", { status: 400 });
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Gift purchase (single) ────────────────────
    if (paymentLinkId === LINK_GIFT) {
      const code = generateGiftCode();
      await sb.from("gift_codes").insert({
        code,
        buyer_email: email.toLowerCase(),
        transaction_id: transactionId,
        plan: "single",
      });
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) await sendGiftCodeEmail(email, code, "single", resendKey);
      console.log("Gjafakóði (single) búinn til:", code, "fyrir:", email);
      return ok();
    }

    // ── Multi link used as gift (mörg börn) ──────
    // If a logged-out user buys the multi link, treat as gift
    // If logged in user buys it, treat as direct purchase
    // We distinguish by checking if the user exists in paid_users already
    if (paymentLinkId === LINK_MULTI) {
      // Check if this is a gift purchase (no existing account = likely a gift buyer)
      // For now: always treat as direct purchase; gift for multi can be added later
      const plan = "multi";
      const { error } = await sb.from("paid_users").upsert(
        { email: email.toLowerCase(), paddle_transaction_id: transactionId, plan },
        { onConflict: "email" },
      );
      if (error) { console.error("DB error:", error); return new Response("DB error", { status: 500 }); }
      console.log(`Greiðsla (multi) skráð fyrir: ${email}`);
      return ok();
    }

    // ── Upgrade purchase ──────────────────────────
    if (paymentLinkId === LINK_UPGRADE) {
      const { error } = await sb.from("paid_users")
        .update({ plan: "multi", paddle_transaction_id: transactionId })
        .eq("email", email.toLowerCase());
      if (error) { console.error("DB error:", error); return new Response("DB error", { status: 500 }); }
      console.log(`Uppfærsla í multi skráð fyrir: ${email}`);
      return ok();
    }

    // ── Direct single purchase (default) ─────────
    const { error } = await sb.from("paid_users").upsert(
      { email: email.toLowerCase(), paddle_transaction_id: transactionId, plan: "single" },
      { onConflict: "email" },
    );
    if (error) { console.error("DB error:", error); return new Response("DB error", { status: 500 }); }
    console.log(`Greiðsla (single) skráð fyrir: ${email}`);
    return ok();

  } catch (err) {
    console.error("kling-webhook villa:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

// ── Helpers ───────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function ok() {
  return new Response(JSON.stringify({ received: true }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function verifyKlingSignature(rawBody: string, sigHeader: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
    return expected === sigHeader.replace("sha256=", "");
  } catch { return false; }
}

function generateGiftCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BARN-";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function sendGiftCodeEmail(
  buyerEmail: string, code: string, plan: "single" | "multi", resendKey: string,
) {
  const planLabel = plan === "multi" ? "Fjölskyldupakkinn (mörg börn)" : "Fullur aðgangur";
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;">
      <h2 style="color:#3E2723;font-size:22px;margin-bottom:8px;">Gjafakóðinn þinn er tilbúinn 🎁</h2>
      <p style="color:#795548;">Þú hefur keypt <strong>${planLabel}</strong> að <strong>Barnasagan mín</strong> sem gjöf. Hér er gjafakóðinn:</p>
      <div style="background:#FFF3E0;border:2px solid #FF9800;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
        <span style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#E65100;">${code}</span>
      </div>
      <p style="color:#795548;">Sendu þennan kóða á viðtakandann. Hann innleysir hann á <a href="https://barnasagan.is/pricing.html" style="color:#FF9800;">barnasagan.is/pricing.html</a> undir „Innleysa gjafakóða".</p>
      <hr style="border:none;border-top:1px solid #FFE0B2;margin:24px 0;">
      <p style="color:#BCAAA4;font-size:13px;">Barnasagan mín · barnasagan.is<br>Multa Bene Agere ehf. · kt. 471025-0380</p>
    </div>
  `;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Barnasagan mín <hallo@saganmin.is>",
      to: buyerEmail,
      subject: "Gjafakóðinn þinn — Barnasagan mín",
      html,
    }),
  });
}
