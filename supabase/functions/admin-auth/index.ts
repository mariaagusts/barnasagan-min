// ══════════════════════════════════════════════
//  ADMIN AUTH
//  Verifies admin / CS-preview passwords server-side.
//  Secrets (set with `supabase secrets set`):
//    ADMIN_PASSWORD  — admin mode
//    CS_PASSWORD     — customer-preview mode
//  Rate limited: 5 attempts per IP per minute.
// ══════════════════════════════════════════════

const ALLOWED_ORIGINS = [
  "https://barnasagan.is",
  "https://www.barnasagan.is",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;
const attempts = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (attempts.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  attempts.set(ip, arr);
  if (attempts.size > 2000) attempts.clear();
  return arr.length > MAX_ATTEMPTS;
}

function corsFor(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

// Constant-time comparison to avoid timing attacks
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  const CORS = corsFor(req.headers.get("origin"));
  const jsonRes = (obj: unknown, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (rateLimited(ip)) {
      return jsonRes({ ok: false, error: "Of margar tilraunir — reyndu aftur eftir mínútu" }, 429);
    }

    const { password, kind } = await req.json();
    if (typeof password !== "string" || !["admin", "cs"].includes(kind)) {
      return jsonRes({ ok: false }, 400);
    }

    const expected = Deno.env.get(kind === "admin" ? "ADMIN_PASSWORD" : "CS_PASSWORD");
    if (!expected) {
      return jsonRes({ ok: false, error: "Password not configured on server" }, 500);
    }

    if (safeEqual(password, expected)) {
      return jsonRes({ ok: true });
    }
    return jsonRes({ ok: false }, 401);
  } catch {
    return jsonRes({ ok: false }, 400);
  }
});
