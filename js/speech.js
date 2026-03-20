// ══════════════════════════════════════════════
//  SPEECH / MIC
// ══════════════════════════════════════════════
import { S } from './state.js';

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export function toggleMic() { S.isListening ? stopListening() : startListening(); }

export function startListening() {
  hideMicError();
  if (isIOS()) {
    showMicError("📱 Notaðu 🎤 hljóðnematáknið á lyklaborðinu til að tala.");
    document.getElementById("answer-input").focus();
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { showMicError("Vafrinn þinn styður ekki talgreiningu. Notaðu Chrome eða Edge."); return; }
  S.recognition = new SR();
  S.recognition.lang = "is-IS";
  S.recognition.continuous = true;
  S.recognition.interimResults = false;
  S.recognition.onstart = () => {
    S.isListening = true;
    document.getElementById("btn-mic").textContent = "⏹ Hætta";
    document.getElementById("btn-mic").classList.add("active");
    document.getElementById("listen-indicator").classList.add("visible");
    document.getElementById("answer-input").disabled = true;
  };
  S.recognition.onresult = (e) => {
    let text = "";
    for (let i = e.resultIndex; i < e.results.length; i++)
      if (e.results[i].isFinal) text += e.results[i][0].transcript + " ";
    if (text) {
      const ta = document.getElementById("answer-input");
      ta.value = (ta.value ? ta.value + " " : "") + text.trim();
      document.getElementById("btn-next").disabled = false;
    }
  };
  S.recognition.onend = () => {
    S.isListening = false;
    document.getElementById("btn-mic").textContent = "🎙 Segja frá";
    document.getElementById("btn-mic").classList.remove("active");
    document.getElementById("listen-indicator").classList.remove("visible");
    document.getElementById("answer-input").disabled = false;
  };
  S.recognition.onerror = (e) => {
    const msgs = {
      "not-allowed": "Hljóðnemaleyfi hafnað. Leyfðu hljóðnema í vafrastillingum.",
      "service-not-allowed": "📱 Á iPhone/iPad: Smelltu á textareitinn og notaðu 🎤 hljóðnematáknið á lyklaborðinu til að tala.",
      "no-speech": "Engin rödd greindist. Reyndu aftur.",
      "network": "Netvillu. Athugaðu tenginguna.",
      "audio-capture": "Hljóðnemi ekki tiltækur.",
      "language-not-supported": "Íslenska talgreining er ekki studd í þessum vafra."
    };
    showMicError(msgs[e.error] || "Villa: " + e.error);
  };
  S.recognition.start();
}

export function stopListening() {
  if (S.recognition) { S.recognition.stop(); S.recognition = null; }
  S.isListening = false;
  const mic = document.getElementById("btn-mic");
  if (mic) { mic.textContent = "🎙 Segja frá"; mic.classList.remove("active"); }
  const li = document.getElementById("listen-indicator");
  if (li) li.classList.remove("visible");
  const ta = document.getElementById("answer-input");
  if (ta) ta.disabled = false;
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
