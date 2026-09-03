// ══════════════════════════════════════════════
//  SPEECH / MIC — audio recording + AI transcription
//  Records with MediaRecorder and lets Gemini transcribe
//  the audio. Works on every browser and device, including
//  iPhone/iPad — unlike the old Web Speech recognition.
// ══════════════════════════════════════════════
import { S } from './state.js';
import { transcribeAudio } from './gemini.js';
import { uploadVoiceRecording } from './supabase-client.js';

let recorder = null;
let chunks = [];
let timerInt = null;
let seconds = 0;
let discardRecording = false;
let pendingBlob = null;   // kept when transcription fails, so nothing is lost
let pendingType = null;
let audioCtx = null;      // live level meter, so the user SEES the mic hears them
let meterRaf = null;

const MAX_SECONDS = 480; // 8 min — plenty for one answer, keeps upload small

export function toggleMic() { S.isListening ? stopListening() : startListening(); }

function pickMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  if (window.MediaRecorder?.isTypeSupported) {
    for (const c of candidates) if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return ""; // let the browser choose
}

function fmtTime(s) {
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

function setRecordingUI(on) {
  const btn = document.getElementById("btn-mic");
  const li = document.getElementById("listen-indicator");
  if (btn) {
    btn.textContent = on
      ? (S.lang === "en" ? "⏹ Stop talking" : "⏹ Hætta að tala")
      : (S.lang === "en" ? "🎙 Speak" : "🎙 Segja frá");
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.disabled = false;
  }
  if (li) {
    if (on) li.innerHTML = '<span id="mic-timer"></span> <span id="mic-level" aria-hidden="true" style="letter-spacing:1px;"></span>';
    li.classList.toggle("visible", on);
  }
}

function updateTimer() {
  const t = document.getElementById("mic-timer");
  if (t) {
    t.textContent = (S.lang === "en"
      ? "🔴 Recording… just speak naturally · "
      : "🔴 Tek upp… talaðu bara eðlilega · ") + fmtTime(seconds);
  }
}

function startMeter(stream) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    audioCtx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇"];
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (let k = 0; k < data.length; k++) {
        const d = Math.abs(data[k] - 128);
        if (d > peak) peak = d;
      }
      const lvl = Math.min(1, peak / 45);
      const el = document.getElementById("mic-level");
      if (el) {
        const n = Math.max(1, Math.round(lvl * blocks.length));
        el.textContent = blocks.slice(0, n).join("");
      }
      meterRaf = requestAnimationFrame(tick);
    };
    meterRaf = requestAnimationFrame(tick);
  } catch (e) { console.warn("hljóðmælir villa:", e); }
}

function stopMeter() {
  if (meterRaf) cancelAnimationFrame(meterRaf);
  meterRaf = null;
  try { if (audioCtx) audioCtx.close(); } catch { /* no-op */ }
  audioCtx = null;
}

export async function startListening() {
  hideMicError();

  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    showMicError(S.lang === "en"
      ? "Your browser does not support recording. Try updating it."
      : "Vafrinn þinn styður ekki upptöku. Prófaðu að uppfæra vafrann.");
    return;
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    showMicError(S.lang === "en"
      ? "Microphone access was denied. Allow the microphone in your browser settings."
      : "Hljóðnemaleyfi hafnað. Leyfðu hljóðnema í vafrastillingum.");
    return;
  }

  const mime = pickMimeType();
  try {
    recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  } catch (e) {
    recorder = new MediaRecorder(stream);
  }
  chunks = [];
  discardRecording = false;

  recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };

  recorder.onstop = async () => {
    stopMeter();
    stream.getTracks().forEach(t => t.stop());
    clearInterval(timerInt);
    S.isListening = false;
    setRecordingUI(false);
    if (discardRecording) { chunks = []; return; }

    const type = (recorder?.mimeType || mime || "audio/webm").split(";")[0];
    const blob = new Blob(chunks, { type });
    chunks = [];

    if (blob.size < 1500) {
      showMicError(S.lang === "en" ? "No speech was recorded. Try again." : "Engin rödd greindist. Reyndu aftur.");
      return;
    }
    if (blob.size > 15 * 1024 * 1024) {
      showMicError(S.lang === "en"
        ? "The recording is too long. Try shorter recordings, you can record as often as you like."
        : "Upptakan er of löng. Taktu styttri upptökur, þú mátt taka upp eins oft og þú vilt.");
      return;
    }
    await transcribeBlob(blob, type);
  };

  recorder.start(1000); // collect data every second so nothing is lost
  startMeter(stream);
  S.isListening = true;
  seconds = 0;
  setRecordingUI(true);
  updateTimer();
  timerInt = setInterval(() => {
    seconds++;
    updateTimer();
    if (seconds >= MAX_SECONDS) stopListening();
  }, 1000);
}

async function transcribeBlob(blob, mimeType) {
  const btn = document.getElementById("btn-mic");
  const li = document.getElementById("listen-indicator");
  if (btn) { btn.disabled = true; btn.textContent = S.lang === "en" ? "✍️ Writing…" : "✍️ Skrifa niður…"; }
  if (li) {
    li.textContent = S.lang === "en" ? "✍️ Turning your words into text…" : "✍️ Breyti orðunum þínum í texta…";
    li.classList.add("visible");
  }

  try {
    const base64 = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result).split(",")[1]);
      fr.onerror = () => reject(new Error("Gat ekki lesið upptökuna"));
      fr.readAsDataURL(blob);
    });

    const text = await transcribeAudio(base64, mimeType);
    pendingBlob = null;
    pendingType = null;

    if (!text) {
      showMicError(S.lang === "en" ? "No speech was heard. Try again." : "Engin rödd greindist. Reyndu aftur.");
    } else {
      // Röddin sjálf er dýrmæt: geymum upptökuna með sögunni (fail-soft)
      uploadVoiceRecording(blob, S.chapterId).then(path => {
        if (path) (S.pendingVoicePaths = S.pendingVoicePaths || []).push(path);
      });
      const ta = document.getElementById("answer-input");
      if (ta) {
        ta.value = (ta.value.trim() ? ta.value.trim() + " " : "") + text;
        const next = document.getElementById("btn-next");
        if (next) next.disabled = !ta.value.trim();
      }
    }
  } catch (e) {
    console.error("Talgreining villa:", e);
    pendingBlob = blob;
    pendingType = mimeType;
    showMicRetry();
  } finally {
    setRecordingUI(false);
    if (li) li.classList.remove("visible");
  }
}

// discard=true throws the recording away (used when the answer is submitted mid-recording)
export function stopListening(discard = false) {
  discardRecording = !!discard;
  if (recorder && recorder.state !== "inactive") {
    recorder.stop(); // onstop handles UI + transcription
  } else {
    clearInterval(timerInt);
    S.isListening = false;
    setRecordingUI(false);
  }
  const ta = document.getElementById("answer-input");
  if (ta) ta.disabled = false;
}

// Transcription failed. The recording is kept in memory so the user's
// words are never lost; show an error with a working retry button.
function showMicRetry() {
  const el = document.getElementById("mic-error");
  if (!el) return;
  el.style.background = "#fdf0ee";
  el.style.borderColor = "#e8b4b0";
  el.style.color = "#c0392b";
  el.innerHTML = "";
  el.append(S.lang === "en"
    ? "Could not send the recording. Don't worry, it is safely stored. Check your connection and press the button:"
    : "Ekki tókst að senda upptökuna. Ekki hafa áhyggjur, hún er í öruggri geymslu. Athugaðu nettenginguna og ýttu svo á hnappinn:");
  const btn = document.createElement("button");
  btn.textContent = S.lang === "en" ? "↻ Try again" : "↻ Reyna aftur";
  btn.style.cssText = "display:block;margin:10px auto 0;padding:10px 22px;font-size:16px;border:1.5px solid #c0392b;background:#fff;color:#c0392b;border-radius:8px;cursor:pointer;font-family:inherit;";
  btn.onclick = retryTranscription;
  el.appendChild(btn);
  el.classList.add("visible");
}

export async function retryTranscription() {
  if (!pendingBlob) return;
  hideMicError();
  await transcribeBlob(pendingBlob, pendingType);
}

export function showMicError(msg) {
  const el = document.getElementById("mic-error");
  if (!el) return;
  const isInfo = msg.startsWith("📱");
  el.style.background = isInfo ? "#f0f7ff" : "#fdf0ee";
  el.style.borderColor = isInfo ? "#93c5fd" : "#e8b4b0";
  el.style.color = isInfo ? "#1e40af" : "#c0392b";
  el.textContent = msg;
  el.classList.add("visible");
}

export function hideMicError() {
  const el = document.getElementById("mic-error");
  if (el) el.classList.remove("visible");
}

window.toggleMic = toggleMic;
window.retryTranscription = retryTranscription;
