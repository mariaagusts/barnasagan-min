import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAILS = ["mariaagusts@gmail.com", "ragnara@gmail.com"];
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function verifyAdmin(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  try {
    const payload = JSON.parse(atob(auth.replace(/^Bearer\s+/i, "").split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
    return ADMIN_EMAILS.includes(payload.email) ? payload.email : null;
  } catch { return null; }
}

function makeSb(url: string, key: string) {
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  if (!verifyAdmin(req)) {
    return new Response("Unauthorized", { status: 401, headers: CORS });
  }

  const saganSb   = makeSb(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const barnaSb   = makeSb(Deno.env.get("BARNASAGAN_SUPABASE_URL")!, Deno.env.get("BARNASAGAN_SERVICE_ROLE_KEY")!);

  // POST — create a new code
  if (req.method === "POST") {
    const { code, note, site } = await req.json();
    if (!code) return new Response(JSON.stringify({ error: "No code" }), { status: 400, headers: CORS });
    const upper = code.toUpperCase().trim();
    const row = { code: upper, used: false, note: note || null };

    const targets = site === "sagan" ? [saganSb] : site === "barna" ? [barnaSb] : [saganSb, barnaSb];
    for (const sb of targets) {
      const { error } = await sb.from("gift_codes").insert(row);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS });
    }
    return new Response(JSON.stringify({ success: true, code: upper }), { headers: { ...CORS, "Content-Type": "application/json" } });
  }

  // GET — list all codes from both sites
  const [saganRes, barnaRes] = await Promise.all([
    saganSb.from("gift_codes").select("id, code, used, used_by, used_at, note, created_at").order("created_at", { ascending: false }),
    barnaSb.from("gift_codes").select("id, code, used, used_by, used_at, note, created_at").order("created_at", { ascending: false }),
  ]);

  return new Response(JSON.stringify({
    sagan: saganRes.data || [],
    barna: barnaRes.data || [],
  }), { headers: { ...CORS, "Content-Type": "application/json" } });
});
