import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    if (!code) {
      return new Response(JSON.stringify({ error: "No code" }), { status: 400, headers: corsHeaders });
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get the user from the JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: corsHeaders });
    }
    const sbUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await sbUser.auth.getUser();
    if (!user?.email) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: corsHeaders });
    }

    // Look up the code
    const { data: gift, error: fetchError } = await sb
      .from("gift_codes")
      .select("id, used")
      .eq("code", code.toUpperCase().trim())
      .maybeSingle();

    if (fetchError || !gift) {
      return new Response(JSON.stringify({ success: false, reason: "invalid" }), { headers: corsHeaders });
    }
    if (gift.used) {
      return new Response(JSON.stringify({ success: false, reason: "used" }), { headers: corsHeaders });
    }

    // Mark code as used
    await sb.from("gift_codes").update({
      used: true,
      used_by: user.email.toLowerCase(),
      used_at: new Date().toISOString(),
    }).eq("id", gift.id);

    // Grant access
    await sb.from("paid_users").upsert(
      { email: user.email.toLowerCase(), gift_code: code.toUpperCase().trim() },
      { onConflict: "email" }
    );

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (err) {
    console.error("Redeem error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: corsHeaders });
  }
});
