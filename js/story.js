// ══════════════════════════════════════════════
//  STORY
// ══════════════════════════════════════════════
import { S } from './state.js';
import { t, safeText } from './i18n.js';
import { getChapters, STORY_STYLES } from './chapters.js';
import { getChapterState, saveState } from './supabase-client.js';
import { callGemini } from './gemini.js';
import { showScreen } from './modals.js';

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

export function renderMarkdown(text) {
  return text.split("\n").map(l => {
    if (l.startsWith("# "))  return `<h1>${esc(l.slice(2))}</h1>`;
    if (l.startsWith("## ")) return `<h2>${esc(l.slice(3))}</h2>`;
    if (l.trim())             return `<p>${esc(l)}</p>`;
    return "";
  }).join("");
}

export function renderMarkdownWithPhotos(text) {
  const chaptersWithAnswers = S.chapters.chapters.filter(c => c.answers.length > 0);
  const lines = text.split("\n");
  const out = [];
  let chIdx = -1;
  let pendingPhotos = null;

  function flushPhotos() {
    if (!pendingPhotos || pendingPhotos.length === 0) { pendingPhotos = null; return; }
    const imgs = pendingPhotos.map(p =>
      `<img src="${p.url || p.data || ""}" style="width:90px;height:90px;object-fit:cover;margin:4px;border:1px solid #e2ceb0;border-radius:2px;">`
    ).join("");
    out.push(`<div style="text-align:center;margin:20px 0 8px;">${imgs}</div>`);
    pendingPhotos = null;
  }

  for (const l of lines) {
    if (l.startsWith("# ")) {
      out.push(`<h1 style="font-family:Georgia,serif;font-size:28pt;font-style:italic;color:#2c1a0e;text-align:center;margin:60px 0 8px;">${esc(l.slice(2))}</h1>`);
      continue;
    }
    if (l.startsWith("## ")) {
      flushPhotos();
      chIdx++;
      const ch = chaptersWithAnswers[chIdx];
      pendingPhotos = (ch?.photos?.length > 0) ? ch.photos : null;
      out.push(`<br clear="all" style="page-break-before:always;"><h2 style="font-family:Georgia,serif;font-size:18pt;font-style:italic;color:#8b5e3c;text-align:center;margin:40px 0 8px;border-bottom:1px solid #c49a6c;padding-bottom:8px;">${esc(l.slice(3))}</h2>`);
      continue;
    }
    if (l.trim()) out.push(`<p style="font-family:Georgia,serif;font-size:12pt;line-height:1.9;text-align:justify;margin:0 0 12px;text-indent:2em;">${esc(l)}</p>`);
  }
  flushPhotos();
  return out.join("");
}

export function injectStoryPhotos() {
  const body = document.getElementById("story-body");
  if (!body) return;
  // Remove previously injected galleries (idempotent)
  body.querySelectorAll(".story-chapter-photos").forEach(el => el.remove());
  const headings = Array.from(body.querySelectorAll("h2"));
  const chaptersWithAnswers = S.chapters.chapters.filter(c => c.answers.length > 0);
  headings.forEach((h2, i) => {
    const ch = chaptersWithAnswers[i];
    if (!ch || !ch.photos || ch.photos.length === 0) return;
    // Find the last element of this chapter (before next h2 or end of body)
    const nextH2 = headings[i + 1] || null;
    let insertAfter = h2;
    let sibling = h2.nextElementSibling;
    while (sibling && sibling !== nextH2) {
      insertAfter = sibling;
      sibling = sibling.nextElementSibling;
    }
    const div = document.createElement("div");
    div.className = "story-chapter-photos";
    ch.photos.forEach(photo => {
      const img = document.createElement("img");
      img.src = photo.url || photo.data || "";
      img.className = "story-photo-img";
      img.alt = photo.name || "";
      div.appendChild(img);
    });
    insertAfter.insertAdjacentElement("afterend", div);
  });
}

export function showStoryScreen() {
  const overlay = document.createElement("div");
  overlay.className = "style-modal-overlay";
  const isIS = S.lang === "is";
  const heading = isIS ? "Veldu ritunarlegt form" : "Choose a writing style";
  const { getSavedVersions } = window; // access via window to avoid circular
  const savedVersionsCount = getSavedVersions ? getSavedVersions().length : 0;
  const buttons = Object.entries(STORY_STYLES).map(([key, s]) => `
    <button class="style-btn" onclick="startStoryWithStyle('${key}', '${S.lang}')">
      <span class="style-btn-label">${isIS ? s.label : s.labelEn}</span>
      <span class="style-btn-desc">${isIS ? s.desc : s.descEn}</span>
    </button>
  `).join("");
  overlay.innerHTML = `
    <div class="style-modal" style="max-width:500px;position:relative;">
      <button onclick="document.querySelector('.style-modal-overlay').remove()" style="position:absolute;top:-8px;right:-8px;background:var(--dark);color:var(--cream);border:none;border-radius:50%;width:28px;height:28px;font-size:16px;cursor:pointer;line-height:1;">✕</button>
      <p style="font-size:14px;color:var(--mid);margin-bottom:24px;">${heading}</p>
      <div class="style-grid">${buttons}</div>
      <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--border);text-align:center;">
  <p style="font-size:12px;color:var(--mid);margin-bottom:12px;">— eða —</p>
  <button class="btn-outline" onclick="document.querySelector('.style-modal-overlay').remove(); toggleVersionsSidebar(true);"
    style="font-size:13px;padding:10px 24px;">
    📚 Skoða vistaðar útgáfur
    ${savedVersionsCount === 0 ? '' : `<span style="font-size:11px;color:var(--mid);display:block;margin-top:4px;">⚠️ Inniheldur ekki nýjustu svör</span>`}
  </button>
</div>
    </div>
  `;
  document.body.appendChild(overlay);
}

export function updateLoadingStep(step) {
  const steps = ["loading-step-1", "loading-step-2", "loading-step-3"];
  const widths = ["33%", "66%", "100%"];
  steps.forEach((id, i) => {
    document.getElementById(id).style.opacity = i < step ? "1" : "0.4";
  });
  document.getElementById("loading-progress-bar").style.width = widths[step - 1] || "0%";
}

export async function startStoryWithStyle(styleKey, lang) {
  S.styleKey = styleKey;
  window.currentStyleKey = styleKey;
  document.querySelector(".style-modal-overlay")?.remove();
  showScreen("story");
  document.getElementById("story-loading").style.display = "block";
  updateLoadingStep(1);

  document.getElementById("story-card").style.display = "none";
  S.storyText = "";

  const loadingPhrases = lang === "en"
    ? ["Gathering your memories...", "Writing your story in English...", "Translating into Icelandic...", "Proofreading the final text..."]
    : ["Söfnum saman minningum þínum...", "Mótar frásögnina...", "Fínpússar málfarið...", "Leggur lokahönd á textann..."];

  let phraseIdx = 0;
  const phraseInterval = setInterval(() => {
    const el = document.getElementById("story-loading-sub");
    if (!el || document.getElementById("story-loading").style.display === "none") {
      clearInterval(phraseInterval);
      return;
    }
    el.textContent = loadingPhrases[phraseIdx % loadingPhrases.length];
    phraseIdx++;
  }, 2500);

  const prompt = lang === "en" ? STORY_STYLES[styleKey].promptEn : STORY_STYLES[styleKey].prompt;
  const userMsg = lang === "en"
    ? `Write a beautiful life story based on this data:\n\n`
    : `Búðu til fallega lífssögu út frá þessum gögnum:\n\n`;
  await generateStory(prompt, userMsg);
}

export async function generateStory(systemPrompt, userMsg) {
  const prompt = systemPrompt || STORY_STYLES.natural.prompt;
  let msg = userMsg || `Búðu til fallega lífssögu út frá þessum gögnum:\n\n`;

  if (S.uploadedPhotos.length > 0) {
    const photoContext = S.lang === "en"
      ? `\nNote: The book contains photos of: ${S.uploadedPhotos.map(p => p.caption || "an uncaptioned image").join(", ")}. Please weave subtle references to these images into the story where appropriate.\n\n`
      : `\nAthugið: Bókin inniheldur myndir af: ${S.uploadedPhotos.map(p => p.caption || "mynd án skýringar").join(", ")}. Reyndu að flétta stuttum vísunum í þessar myndir inn í frásögnina þar sem það á við.\n\n`;
    msg = photoContext + msg;
  }

  const chapters = getChapters();
  const allParts = [];
  const chapterTitles = [];
  for (const ch of chapters) {
    const cs = getChapterState(ch.id);
    if (cs.answers.length === 0) continue;
    const pairs = cs.questions.slice(0, cs.answers.length)
      .map((q, i) => `Q: ${q}\nA: ${cs.answers[i]}`).join("\n\n");
    allParts.push(`=== ${ch.title} ===\n${pairs}`);
    chapterTitles.push(ch.title);
  }
  if (allParts.length === 0) {
    document.getElementById("story-body").innerHTML = "<p>Engin svör fundust. Vinsamlegast svaraðu nokkrum spurningum fyrst.</p>";
    document.getElementById("story-loading").style.display = "none";
    document.getElementById("story-card").style.display = "block";
    renderBookAuthor();
    return;
  }
  const chapterRule = S.lang === "en"
    ? `\nIMPORTANT: You MUST write a separate ## section for every one of these ${chapterTitles.length} chapters: ${chapterTitles.join(", ")}. Do not skip, merge, or omit any chapter.\n`
    : `\nMIKILVÆGT: Þú VERÐUR að skrifa sérstakan ## kafla fyrir hvern og einn af þessum ${chapterTitles.length} köflum: ${chapterTitles.join(", ")}. Ekki sleppa, sameina eða fella niður neinn kafla.\n`;
  const promptWithRule = prompt + chapterRule;

  try {
    const isIcelandic = S.lang !== "en";

    if (isIcelandic) {
      const englishPromptBase = S.lang === "en" ? prompt : STORY_STYLES[S.styleKey || "natural"].promptEn;
      const englishPrompt = englishPromptBase + `\nIMPORTANT: You MUST write a separate ## section for every one of these ${chapterTitles.length} chapters: ${chapterTitles.join(", ")}. Do not skip, merge, or omit any chapter.\n`;
      updateLoadingStep(1);
      const englishStory = await callGemini(englishPrompt, msg + allParts.join("\n\n"), true);

      const styleLabel = STORY_STYLES[S.styleKey || "natural"].label;
      const translatePrompt = `Þú ert sérfræðingur í íslenskri þýðingu og ævisöguritun.
Þýddu eftirfarandi enska lífssögu yfir á íslensku í stílnum: ${styleLabel}
MIKILVÆGT:
- Skilaðu EINGÖNGU þýddum texta — engar útskýringar, engar kynningar, ekkert fyrir utan textann sjálfan
- Haltu stílnum: ${styleLabel}. Ef stíllinn er einlægur skaltu nota hlýtt og náttúrulegt mál, ef ljóðrænn skaltu leggja áherslu á skynrænar myndir o.s.frv.
- Forðastu beinlínis þýðingar úr ensku — skrifaðu eins og texti hafi verið skrifaður beint á íslensku
- Forðastu enskuskot og klisjur eins og „vegferð"
- Haltu sömu uppbyggingu og # og ## fyrirsögnum
- Þýddu fyrirsagnirnar líka yfir á íslensku
- Skrifaðu í fyrstu persónu (ég-form)
- Bannað er að nota niðurstöðu- eða lærdómssetningar í lok kafla
- Engin hrós, ekkert væmið mál

Enska textinn:
${englishStory}`;
      updateLoadingStep(2);
      let translated = await callGemini(translatePrompt, "Þýddu textann:", true);
      translated = translated.replace(/^.*?þýdd.*?íslensku[:\.]?\s*/i, "");
      translated = translated.replace(/^.*?lífssagan.*?íslensku[:\.]?\s*/i, "");
      S.storyText = translated.trim();
    } else {
      S.storyText = await callGemini(promptWithRule, msg + allParts.join("\n\n"), true);
    }

    const proofPrompt = `Þú ert vandvirkur íslenskur prófarkalesari.
Lestu yfir eftirfarandi texta og skilaðu hreinsuðri útgáfu þar sem:
- Málfræðivillur eru leiðréttar (fallstjórn, beyging, samræmi)
- Orð sem hljóma eins og bein þýðing úr ensku eru skipt út fyrir náttúrulegar íslenskar hliðstæður
- Setningabygging sem hljómar gervileg eða vélræn er greidd upp
- # og ## fyrirsagnir eru óbreyttar
- Efni og röð er ALDREI breytt — eingöngu málfar
Skilaðu EINGÖNGU leiðréttum texta, engar útskýringar.`;
    updateLoadingStep(3);
    S.storyText = await callGemini(proofPrompt, S.storyText);

    document.getElementById("story-body").innerHTML = renderMarkdown(S.storyText);
    injectStoryPhotos();
  } catch(e) {
    console.error("Gemini villa í sögugjörð:", e);
    document.getElementById("story-body").innerHTML = `
    <p style="color:#c0392b;margin-bottom:16px;">${e.message || e}</p>
    <button onclick="startStoryWithStyle(window.currentStyleKey, '${S.lang}')" style="background:var(--dark);color:var(--cream);border:none;padding:12px 28px;font-size:13px;font-family:'Lato',sans-serif;font-weight:700;letter-spacing:0.1em;cursor:pointer;border-radius:3px;">🔄 Reyna aftur</button>`;
  }
  // Dynamic import to avoid circular dep with versions.js
  const { saveStoryVersion } = await import('./versions.js');
  saveStoryVersion(S.styleKey || "natural", S.lang);
  document.getElementById("story-loading").style.display = "none";
  document.getElementById("story-card").style.display = "block";
  document.getElementById("btn-edit-story").style.display = "inline-block";
  document.getElementById("btn-text-warning").style.display = "inline-flex";
  document.getElementById("floating-warning-btn").style.display = "flex";
}

export function renderBookAuthor() {
  const cs = getChapterState(0);
  if (!S.chapters.bookAuthor && cs.answers.length > 0) {
    const raw = cs.answers[0].split(/[,\.]/)[0]
      .replace(/^(ég heiti|my name is|I am|I'm)\s*/i, "").trim();
    if (raw.length > 2 && raw.length < 60) S.chapters.bookAuthor = raw;
  }
  const el = document.getElementById("book-author-display");
  if (el) el.textContent = S.chapters.bookAuthor ? `— ${S.chapters.bookAuthor}` : "";
}

export function editBookAuthor() {
  const current = S.chapters.bookAuthor || "";
  const newName = prompt("Nafn höfundar á forsíðu bókarinnar:", current);
  if (newName !== null) {
    S.chapters.bookAuthor = newName.trim();
    saveState();
    renderBookAuthor();
  }
}

export function showPrintModal() {
  const isEn = S.lang === "en";
  safeText("print-modal-title", isEn ? "🖨️ How do I order a printed book?" : "🖨️ Hvernig panta ég prentaða bók?");
  safeText("print-modal-sub", isEn ? "Turn your life story into a real book!" : "Breyttu lífssögunni þinni í alvöru bók!");
  safeText("print-modal-note", isEn ? "💡 Lulu.com is free to use — you only pay for printing. Ships internationally, approx. $15–25 per copy." : "💡 Lulu.com er ókeypis að nota — þú greiðir aðeins fyrir prentunina. Sendir til Íslands, kostar ca. $15–25 fyrir eitt eintak.");
  document.getElementById("print-modal-overlay").classList.add("open");
}

export function closePrintModal() {
  document.getElementById("print-modal-overlay").classList.remove("open");
}

export function showInfoModal() {
  document.getElementById("info-modal-overlay").style.display = "flex";
}

export function closeInfoModal() {
  document.getElementById("info-modal-overlay").style.display = "none";
}

export function showWarningModal() {
  document.getElementById("warning-modal-overlay").style.display = "flex";
}

export function closeWarningModal() {
  document.getElementById("warning-modal-overlay").style.display = "none";
}

window.showStoryScreen = showStoryScreen;
window.startStoryWithStyle = startStoryWithStyle;
window.editBookAuthor = editBookAuthor;
window.showPrintModal = showPrintModal;
window.closePrintModal = closePrintModal;
window.showInfoModal = showInfoModal;
window.closeInfoModal = closeInfoModal;
window.showWarningModal = showWarningModal;
window.closeWarningModal = closeWarningModal;
