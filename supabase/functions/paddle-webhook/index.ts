import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function generateGiftCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BARN-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function sendGiftCodeEmail(buyerEmail: string, code: string, resendKey: string) {
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;">
      <h2 style="color:#3E2723;font-size:22px;margin-bottom:8px;">Gjafakóðinn þinn er tilbúinn 🎁</h2>
      <p style="color:#795548;">Þú hefur keypt fullan aðgang að <strong>Barnasagan mín</strong> sem gjöf. Hér er gjafakóðinn:</p>
      <div style="background:#FFF3E0;border:2px solid #FF9800;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
        <span style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#E65100;">${code}</span>
      </div>
      <p style="color:#795548;">Sendu þennan kóða á viðtakandann. Hann innleysir hann á <a href="https://barnasagan.is/pricing.html" style="color:#FF9800;">barnasagan.is/pricing.html</a> undir „Innleysa gjafakóða".</p>
      <hr style="border:none;border-top:1px solid #FFE0B2;margin:24px 0;">
      <p style="color:#BCAAA4;font-size:13px;">Barnasagan mín · barnasagan.is<br>Multa Bene Agere ehf. · kt. 471025-0380</p>
    </div>
  `;

  const enHtml = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;">
      <h2 style="color:#3E2723;font-size:22px;margin-bottom:8px;">Your gift code is ready 🎁</h2>
      <p style="color:#795548;">You have purchased full access to <strong>Barnasagan mín</strong> as a gift. Here is the gift code:</p>
      <div style="background:#FFF3E0;border:2px solid #FF9800;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
        <span style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#E65100;">${code}</span>
      </div>
      <p style="color:#795548;">Send this code to the recipient. They redeem it at <a href="https://barnasagan.is/pricing.html" style="color:#FF9800;">barnasagan.is/pricing.html</a> under "Redeem gift code".</p>
      <hr style="border:none;border-top:1px solid #FFE0B2;margin:24px 0;">
      <p style="color:#BCAAA4;font-size:13px;">Barnasagan mín · barnasagan.is<br>Multa Bene Agere ehf. · kt. 471025-0380</p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Barnasagan mín <hallo@saganmin.is>",
      to: buyerEmail,
      subject: "Gjafakóðinn þinn · Your gift code — Barnasagan mín",
      html: html + enHtml,
    }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const eventType = body?.event_type;

    if (eventType !== "transaction.completed") {
      return new Response("Ignored", { status: 200 });
    }

    const data = body?.data;
    const GIFT_PRICE_ID = "pri_01kmyfmm00s0ycnkfhpk3v1wb1";
    const isGift = data?.items?.some((item: { price?: { id?: string } }) => item?.price?.id === GIFT_PRICE_ID);
    const transactionId = data?.id as string | undefined;

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (isGift) {
      const buyerEmail = (data?.custom_data?.email || data?.customer?.email) as string | undefined;
      if (!buyerEmail) {
        console.error("Gift purchase: no buyer email", JSON.stringify(body));
        return new Response("No buyer email", { status: 400 });
      }

      const code = generateGiftCode();

      const { error } = await sb.from("gift_codes").insert({
        code,
        buyer_email: buyerEmail.toLowerCase(),
        transaction_id: transactionId,
      });

      if (error) {
        console.error("gift_codes insert error:", error);
        return new Response("DB error", { status: 500 });
      }

      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        await sendGiftCodeEmail(buyerEmail, code, resendKey);
      }

      console.log("Gift code created:", code, "for:", buyerEmail);
      return new Response("OK", { status: 200 });

    } else {
      const email = data?.custom_data?.email as string | undefined;
      if (!email) {
        console.error("No email in custom_data", JSON.stringify(body));
        return new Response("No email", { status: 400 });
      }

      const { error } = await sb.from("paid_users").upsert(
        { email: email.toLowerCase(), paddle_transaction_id: transactionId },
        { onConflict: "email" },
      );

      if (error) {
        console.error("DB error:", error);
        return new Response("DB error", { status: 500 });
      }

      console.log("Payment recorded for:", email);
      return new Response("OK", { status: 200 });
    }

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Error", { status: 500 });
  }
});
