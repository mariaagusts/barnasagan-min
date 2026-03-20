// ══════════════════════════════════════════════
//  MAP
// ══════════════════════════════════════════════
import { S } from './state.js';
import { t } from './i18n.js';
import { getChapters } from './chapters.js';
import { getChapterState, totalAnswers } from './supabase-client.js';
import { callGemini } from './gemini.js';
import { renderMarkdown } from './story.js';
import { showScreen } from './modals.js';
import { enterChapter } from './interview.js';

export function renderMap() {
  const chapters = getChapters();
  const grid = document.getElementById("chapter-grid");
  const total = totalAnswers();
  const maxTotal = chapters.length * 20;
  const pct = Math.min((total / maxTotal) * 100, 100);

  document.getElementById("map-total-label").textContent = total;
  const fill = document.getElementById("map-progress-fill");
  if (fill) fill.style.width = pct + "%";

  const enough = total >= 1;
  const btn = document.getElementById("btn-generate-story");
  btn.style.display = enough ? "inline-block" : "none";
  btn.textContent = enough ? `✨ ${t("previewBtn").replace("✨ ","")} (${total} ${t("mapAnswers").toLowerCase()})` : "";

  grid.innerHTML = chapters.map((ch, i) => {
    const cs = getChapterState(ch.id);
    const answered = cs.answers.length;
    const p = Math.min((answered / 20) * 100, 100);
    const isComplete = cs.complete;
    return `
      <div class="chapter-card ${isComplete ? 'complete' : ''}" onclick="enterChapter(${ch.id})">
        ${isComplete ? `<span class="chapter-badge">${t("completed")}</span>` : ''}
        <span class="chapter-emoji">${ch.emoji}</span>
        <div class="chapter-num">${t("chapterOf")} ${i + 1}</div>
        <div class="chapter-name">${ch.title}</div>
        <div class="chapter-desc">${ch.desc}</div>
        <div class="chapter-progress-wrap">
          <div class="chapter-progress-bar"><div class="chapter-progress-fill" style="width:${p}%"></div></div>
          <span class="chapter-progress-label">${answered > 20 ? answered + "/20 (100%)" : answered + "/20"} ${t("answersOf")}</span>
        </div>
        ${answered > 0 ? `<button class="chapter-preview-btn" onclick="event.stopPropagation();previewChapter(${ch.id})">👁 Forskoða kafla</button>` : ''}
        </div>`;
  }).join("");
}

export async function previewChapter(id) {
  const chapters = getChapters();
  const ch = chapters.find(c => c.id === id);
  const cs = getChapterState(id);
  if (cs.answers.length === 0) return;

  document.getElementById("chapter-preview-overlay").style.display = "block";

  const phrases = S.lang === "en"
    ? ["Reading your answers…", "Crafting the narrative…", "Polishing the prose…"]
    : ["Les svörin þín…", "Mótar frásögnina…", "Fínpússar textann…"];
  let phraseIdx = 0;

  const setLoading = (msg) => {
    document.getElementById("chapter-preview-body").innerHTML = `
      <div style="text-align:center;padding:40px 0;">
        <div class="loading-dots" style="justify-content:center;margin-bottom:20px;">
          <span class="dot1">•</span><span class="dot2">•</span><span class="dot3">•</span>
        </div>
        <p style="color:var(--mid);font-size:13px;letter-spacing:0.04em;">${msg}</p>
        <div style="background:var(--border);border-radius:99px;height:4px;overflow:hidden;width:200px;margin:16px auto 0;">
          <div id="chapter-preview-bar" style="height:100%;background:var(--gold);border-radius:99px;width:0%;transition:width 0.8s ease;"></div>
        </div>
      </div>`;
    setTimeout(() => {
      const bar = document.getElementById("chapter-preview-bar");
      if (bar) bar.style.width = "80%";
    }, 50);
  };

  setLoading(phrases[0]);
  const interval = setInterval(() => {
    phraseIdx = (phraseIdx + 1) % phrases.length;
    const p = document.querySelector("#chapter-preview-body p");
    if (p) p.textContent = phrases[phraseIdx];
  }, 2500);

  const pairs = cs.questions.slice(0, cs.answers.length)
    .map((q, i) => `Q: ${q}\nA: ${cs.answers[i]}`).join("\n\n");

  const { STORY_STYLES } = await import('./chapters.js');
  const prompt = STORY_STYLES.natural.prompt;
  const msg = `Búðu til stutta fallega frásögn fyrir þennan kafla eingöngu:\n\n=== ${ch.title} ===\n${pairs}`;

  try {
    const text = await callGemini(prompt, msg, true);
    clearInterval(interval);
    document.getElementById("chapter-preview-body").innerHTML = renderMarkdown(`## ${ch.title}\n\n${text}`);
  } catch(e) {
    clearInterval(interval);
    document.getElementById("chapter-preview-body").innerHTML = "<p>Villa kom upp. Reyndu aftur.</p>";
  }
}

export function closeChapterPreview() {
  document.getElementById("chapter-preview-overlay").style.display = "none";
}

window.previewChapter = previewChapter;
window.closeChapterPreview = closeChapterPreview;
