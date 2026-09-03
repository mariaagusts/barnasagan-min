// ══════════════════════════════════════════════
//  tts-proxy — les spurningar upp með íslenskri rödd (Azure Speech)
//  Secrets sem þarf: AZURE_SPEECH_KEY, AZURE_SPEECH_REGION (t.d. "westeurope")
//  Dreifing: eins og gemini-proxy — og MUNA að slökkva á
//  "Verify JWT with legacy secret" í Settings eftir Deploy!
// ══════════════════════════════════════════════

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getApiKey(): string {
  return Deno.env.get("SUPABASE_ANON_KEY") ??
         Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
}

async function verifyUser(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return false;
  try {
    const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: getApiKey() },
    });
    if (!res.ok) return false;
    const user = await res.json();
    return !!user?.id;
  } catch {
    return false;
  }
}

// Framburðarorðabók: orð sem röddin ber vitlaust fram fá IPA-hljóðritun.
// Bættu við eftir eyranu — orð í lágstöfum, IPA-framburður sem gildi.
const PRONUNCIATIONS: Record<string, string> = {
  // "ball" (dansleikur) er tökuorð: langt l, EKKI fjall/svell-framburður
  "ballið": "ˈpalːɪð",
  "ballinu": "ˈpalːɪnʏ",
  "balli": "ˈpalːɪ",
  "ball": "ˈpalː",
  "böllin": "ˈpœlːɪn",
  "böll": "ˈpœlː",
};

function withPronunciations(escapedText: string): string {
  let out = escapedText;
  for (const [word, ipa] of Object.entries(PRONUNCIATIONS)) {
    try {
      const re = new RegExp(`(?<![\\p{L}])${word}(?![\\p{L}])`, "giu");
      out = out.replace(re, (m) => `<phoneme alphabet="ipa" ph="${ipa}">${m}</phoneme>`);
    } catch { /* skip word on regex issues */ }
  }
  return out;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (!(await verifyUser(req))) {
    return new Response(JSON.stringify({ error: { message: "Unauthorized" } }),
      { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  try {
    const key = Deno.env.get("AZURE_SPEECH_KEY");
    const region = Deno.env.get("AZURE_SPEECH_REGION");
    if (!key || !region) {
      return new Response(JSON.stringify({ error: { message: "TTS not configured" } }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const { text, lang, voice } = await req.json();
    if (!text || typeof text !== "string" || text.length > 600) {
      return new Response(JSON.stringify({ error: { message: "Bad text" } }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const isEn = lang === "en";
    const voiceName = voice === "gunnar" ? "is-IS-GunnarNeural"
      : isEn ? "en-GB-SoniaNeural" : "is-IS-GudrunNeural";
    const xmlLang = isEn ? "en-GB" : "is-IS";

    const ssml = `<speak version="1.0" xml:lang="${xmlLang}"><voice name="${voiceName}"><prosody rate="-8%">${withPronunciations(escapeXml(text))}</prosody></voice></speak>`;

    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "barnasagan-tts",
      },
      body: ssml,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Azure TTS villa:", res.status, errText);
      return new Response(JSON.stringify({ error: { message: `TTS failed: ${res.status}` } }),
        { status: 502, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const audio = await res.arrayBuffer();
    return new Response(audio, {
      headers: { ...CORS, "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=3600" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: { message: String(err) } }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
