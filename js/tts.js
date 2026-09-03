// ══════════════════════════════════════════════
//  TTS — les spurningar upp með íslenskri rödd (Guðrún hjá Azure)
//  Óvirkt þar til TTS_ENABLED er sett í true í config.js
//  og AZURE_SPEECH_KEY/REGION komin í tts-proxy fallið.
// ══════════════════════════════════════════════
import { S } from './state.js';
import { SUPABASE_URL, SUPABASE_KEY, TTS_ENABLED } from './config.js';
import { getSupabase } from './supabase-client.js';

const TTS_URL = `${SUPABASE_URL}/functions/v1/tts-proxy`;
let audio = null;
let available = TTS_ENABLED;

export function ttsAvailable() { return available; }

export function stopSpeaking() {
  if (audio) { audio.pause(); audio = null; }
}

export async function speakText(text) {
  if (!available || !text) return false;
  try {
    let token = SUPABASE_KEY;
    const sb = getSupabase();
    if (sb) {
      const { data: { session } } = await sb.auth.getSession();
      if (session?.access_token) token = session.access_token;
    }
    const res = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "apikey": SUPABASE_KEY,
      },
      body: JSON.stringify({ text, lang: S.lang || "is" }),
    });
    if (!res.ok) {
      console.warn("TTS villa:", res.status);
      if (res.status === 500) available = false; // ekki stillt — hættum að reyna
      return false;
    }
    const blob = await res.blob();
    stopSpeaking();
    audio = new Audio(URL.createObjectURL(blob));
    audio.onended = () => { audio = null; };
    await audio.play();
    return true;
  } catch (e) {
    console.warn("TTS villa:", e);
    return false;
  }
}

// 🔊 hnappurinn við spurninguna
window.speakQuestion = function() {
  const el = document.getElementById("question-text");
  if (!el) return;
  // fyrsti textahnúturinn er spurningin sjálf (á undan + og 🔊 hnöppunum)
  const text = (el.childNodes[0]?.textContent || el.textContent || "").trim();
  speakText(text);
};
