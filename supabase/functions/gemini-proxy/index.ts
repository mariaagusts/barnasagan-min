// ══════════════════════════════════════════════
//  GEMINI PROXY
//  - Rotates between up to 5 API keys
//  - Origin allowlist + model allowlist + prompt size cap
//  - Per-IP rate limiting (in-memory, per isolate)
//  - Client may request maxTokens (clamped server-side)
// ══════════════════════════════════════════════

const ALLOWED_ORIGINS = [
  "https://barnasagan.is",
  "https://www.barnasagan.is",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

const ALLOWED_MODELS = [
  "gemini-3.5-flash",        // stable flash (GA May 2026)
  "gemini-3-flash-preview",  // legacy — kept for rollback
  "gemini-3.1-pro-preview",  // no GA successor yet
];

const MAX_PROMPT_CHARS = 60_000;   // system + user combined
const DEFAULT_MAX_TOKENS = 256;    // follow-up questions
const MAX_MAX_TOKENS = 16_384;     // full story passes

// ── Rate limiting (per isolate — resets on cold start, still blunts abuse) ──
const RATE_LIMIT = 30;             // requests
const RATE_WINDOW_MS = 60_000;     // per minute
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear(); // avoid unbounded growth
  return arr.length > RATE_LIMIT;
}

function corsFor(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

function getGeminiKeys(): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const k = Deno.env.get(`GEMINI_KEY_${i}`);
    if (k) keys.push(k);
  }
  const single = Deno.env.get("GEMINI_KEY");
  if (single && !keys.includes(single)) keys.push(single);
  return keys;
}

let keyIdx = 0;
function nextKey(keys: string[]): string {
  const key = keys[keyIdx % keys.length];
  keyIdx++;
  return key;
}

Deno.serve(async (req: Request) => {
  const CORS = corsFor(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const jsonRes = (obj: unknown, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  try {
    const payload = await req.json();

    // Warm-up ping: wake the isolate WITHOUT burning a Gemini call
    if (payload.ping) return jsonRes({ ok: true });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (rateLimited(ip)) {
      return jsonRes({ error: { message: "Of margar beiðnir — reyndu aftur eftir smá stund" } }, 429);
    }

    const { systemPrompt, userMsg, model } = payload;

    if (typeof systemPrompt !== "string" || typeof userMsg !== "string") {
      return jsonRes({ error: { message: "Vantar systemPrompt/userMsg" } }, 400);
    }
    if (!ALLOWED_MODELS.includes(model)) {
      return jsonRes({ error: { message: "Óleyfilegt módel" } }, 400);
    }
    if (systemPrompt.length + userMsg.length > MAX_PROMPT_CHARS) {
      return jsonRes({ error: { message: "Beiðni of stór" } }, 413);
    }

    const maxTokens = Math.min(
      Math.max(parseInt(payload.maxTokens, 10) || DEFAULT_MAX_TOKENS, 1),
      MAX_MAX_TOKENS
    );

    const keys = getGeminiKeys();
    if (keys.length === 0) {
      return jsonRes({ error: { message: "Gemini API key not configured" } }, 500);
    }

    const body = JSON.stringify({
      contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + userMsg }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: maxTokens },
    });

    for (let ki = 0; ki < keys.length; ki++) {
      const key = nextKey(keys);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

      for (let attempt = 1; attempt <= 3; attempt++) {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
        const data = await res.json();

        if (data.error?.code === 503 || data.error?.status === "UNAVAILABLE") {
          if (attempt < 3) await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        if (
          data.error?.status === "INVALID_ARGUMENT" ||
          data.error?.message?.includes("leaked") ||
          data.error?.message?.includes("quota")
        ) {
          break;
        }

        return jsonRes(data);
      }
    }

    return jsonRes({ error: { message: "Allir Gemini lyklar úr gildi" } }, 429);
  } catch (err) {
    return jsonRes({ error: { message: String(err) } }, 500);
  }
});
