import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const email = data?.custom_data?.email as string | undefined;
    const transactionId = data?.id as string | undefined;

    if (!email) {
      console.error("No email in custom_data", JSON.stringify(body));
      return new Response("No email", { status: 400 });
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

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
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Error", { status: 500 });
  }
});
