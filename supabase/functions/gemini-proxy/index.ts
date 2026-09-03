const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Verify the caller is a signed-in Supabase user (signature-checked via Auth server).
// Robust across env-var naming: new projects may expose the API key as
// SUPABASE_PUBLISHABLE_KEY instead of SUPABASE_ANON_KEY.
function getApiKey(): string {
  return Deno.env.get("SUPABASE_ANON_KEY") ??
         Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
}

async function verifyUser(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) { console.log("verifyUser: enginn Authorization header"); return false; }
  const apikey = getApiKey();
  if (!apikey) console.error("verifyUser: hvorki SUPABASE_ANON_KEY né SUPABASE_PUBLISHABLE_KEY í env!");
  try {
    const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey },
    });
    if (!res.ok) {
      console.log("verifyUser: auth server svarar", res.status, await res.text());
      return false;
    }
    const user = await res.json();
    return !!user?.id;
  } catch (e) {
    console.error("verifyUser villa:", e);
    return false;
  }
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  if (!(await verifyUser(req))) {
    return new Response(
      JSON.stringify({ error: { message: "Unauthorized" } }),
      { status: 401, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  try {
    const keys = getGeminiKeys();
    if (keys.length === 0) {
      return new Response(
        JSON.stringify({ error: { message: "Gemini API key not configured" } }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const { systemPrompt, userMsg, model, audio, temperature } = await req.json();

    // Only the two models this app actually uses — the model string comes
    // from the client and must never reach the URL unchecked.
    const ALLOWED_MODELS = ["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-3.1-pro-preview"];
    if (!ALLOWED_MODELS.includes(model)) {
      return new Response(
        JSON.stringify({ error: { message: "Unsupported model" } }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }
    // Cap the audio payload (~15MB binary ≈ 20MB base64)
    if (audio?.data && audio.data.length > 21_000_000) {
      return new Response(
        JSON.stringify({ error: { message: "Audio too large" } }),
        { status: 413, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Two modes: text generation, or audio transcription (audio = { mimeType, data(base64) })
    const parts: Record<string, unknown>[] = [];
    if (audio?.data && audio?.mimeType) {
      parts.push({ text: systemPrompt });
      parts.push({ inlineData: { mimeType: audio.mimeType, data: audio.data } });
    } else {
      parts.push({ text: systemPrompt + "\n\n" + userMsg });
    }

    const body = JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        // transcription must be literal; decisions want low temp; prose wants 0.8
        temperature: audio ? 0.1
          : (typeof temperature === "number" ? Math.min(1, Math.max(0, temperature)) : 0.8),
        maxOutputTokens: 16384,
      },
    });

    // Try each key once on quota/key errors, retry 3x on 503
    let lastGoogleError = "";
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
          lastGoogleError = data.error.message;
          if (attempt < 3) await new Promise((r) => setTimeout(r, 5000));
          continue;
        }

        // Invalid key, leaked key, or quota/rate exceeded — try next key
        if (
          data.error?.status === "INVALID_ARGUMENT" ||
          data.error?.status === "RESOURCE_EXHAUSTED" ||
          data.error?.status === "PERMISSION_DENIED" ||
          data.error?.message?.includes("leaked") ||
          data.error?.message?.includes("quota")
        ) {
          lastGoogleError = data.error.message;
          break;
        }

        return new Response(JSON.stringify(data), {
          headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(
      JSON.stringify({ error: { message: `Allir Gemini lyklar úr gildi — ${lastGoogleError || "óþekkt villa"}` } }),
      { status: 429, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: { message: String(err) } }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
