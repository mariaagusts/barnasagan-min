const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

  try {
    const keys = getGeminiKeys();
    if (keys.length === 0) {
      return new Response(
        JSON.stringify({ error: { message: "Gemini API key not configured" } }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const { systemPrompt, userMsg, model } = await req.json();

    const body = JSON.stringify({
      contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + userMsg }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 16384 },
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
          if (attempt < 3) await new Promise((r) => setTimeout(r, 5000));
          continue;
        }

        if (
          data.error?.status === "INVALID_ARGUMENT" ||
          data.error?.message?.includes("leaked") ||
          data.error?.message?.includes("quota")
        ) {
          break;
        }

        return new Response(JSON.stringify(data), {
          headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(
      JSON.stringify({ error: { message: "Allir Gemini lyklar úr gildi" } }),
      { status: 429, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: { message: String(err) } }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
