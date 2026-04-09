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
import { getFamilyContext } from './family.js';
import { enterChapter } from './interview.js';
import { updateGullmolaMapTile } from './gullmoli.js';

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

  const gullCount = S.gullmolar?.length || 0;
  const gullCountLabel = gullCount === 1
    ? (S.lang === 'en' ? '1 phrase' : '1 gullmola')
    : (S.lang === 'en' ? `${gullCount} phrases` : `${gullCount} gullmolar`);

  grid.innerHTML = chapters.map((ch, i) => {
    const cs = getChapterState(ch.id);
    const answered = cs.answers.length;
    const p = Math.min((answered / 20) * 100, 100);
    const isComplete = cs.complete;
    const locked = !S.isPaid && ch.id > 1;
    if (locked) {
      return `
      <div class="chapter-card chapter-locked" onclick="window.location.href='pricing.html'">
        <span class="chapter-emoji">${ch.emoji}</span>
        <div class="chapter-num">${t("chapterOf")} ${i + 1}</div>
        <div class="chapter-name">${ch.title}</div>
        <div class="chapter-lock-msg">🔒 ${S.lang === 'en' ? 'Get full access' : 'Kaupa fullan aðgang'} →</div>
      </div>`;
    }
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
  }).join("") + `
    <div class="chapter-card gullmola-tile" onclick="openGullmolaBank()">
      <span class="chapter-emoji">💬</span>
      <div class="chapter-name" style="color:var(--gold);">Gullmolabanki</div>
      <div class="chapter-desc">${S.lang === 'en' ? 'Funny and memorable things your child says' : 'Fyndnar og eftirminnilegur setningar barnsins'}</div>
      <div class="gullmola-tile-count" id="gullmola-tile-count-wrap">${gullCount > 0 ? gullCountLabel : (S.lang === 'en' ? 'Add first phrase →' : 'Bæta við fyrstu →')}</div>
    </div>`;
  updateGullmolaMapTile();
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
      <div style="text-align:center;padding:60px 20px;">
        <div class="spinner" style="font-size:40px;margin-bottom:20px;">✦</div>
        <p class="preview-loading-text" style="font-family:'Fredoka One',cursive;font-size:20px;color:var(--orange);margin-bottom:8px;">${msg}</p>
        <p style="font-size:13px;color:var(--mid);margin-bottom:32px;opacity:0.8;">Augnablik...</p>
        <div style="width:280px;margin:0 auto;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:12px;color:var(--mid);">
            <span id="cp-step-1" style="opacity:0.4;">✍️ ${S.lang==='en'?'Read':'Lesa'}</span>
            <span id="cp-step-2" style="opacity:0.4;">🖋 ${S.lang==='en'?'Shape':'Móta'}</span>
            <span id="cp-step-3" style="opacity:0.4;">✨ ${S.lang==='en'?'Polish':'Fínpússa'}</span>
          </div>
          <div style="background:var(--border);border-radius:99px;height:6px;overflow:hidden;">
            <div id="chapter-preview-bar" style="height:100%;background:var(--gold);border-radius:99px;width:0%;transition:width 0.8s ease;"></div>
          </div>
        </div>
      </div>`;
    setTimeout(() => {
      const bar = document.getElementById("chapter-preview-bar");
      if (bar) bar.style.width = "33%";
      const s1 = document.getElementById("cp-step-1");
      if (s1) s1.style.opacity = "1";
    }, 50);
  };

  setLoading(phrases[0]);
  const interval = setInterval(() => {
    phraseIdx = (phraseIdx + 1) % phrases.length;
    const p = document.querySelector("#chapter-preview-body .preview-loading-text");
    if (p) p.textContent = phrases[phraseIdx];
    const bar = document.getElementById("chapter-preview-bar");
    const steps = [document.getElementById("cp-step-1"), document.getElementById("cp-step-2"), document.getElementById("cp-step-3")];
    const pcts = ["33%", "66%", "90%"];
    if (bar) bar.style.width = pcts[phraseIdx];
    steps.forEach((s, i) => { if (s) s.style.opacity = i <= phraseIdx ? "1" : "0.4"; });
  }, 2500);

  const pairs = cs.questions.slice(0, cs.answers.length)
    .map((q, i) => `Q: ${q}\nA: ${cs.answers[i]}`).join("\n\n");

  const { STORY_STYLES } = await import('./chapters.js');
  const prompt = STORY_STYLES.hlylegt.prompt;
  const familyCtx = getFamilyContext(S.lang);
  const msg = `Búðu til ítarlega og fallega frásögn fyrir þennan kafla. Notaðu ALLAR sérstakar upplýsingar úr svörunum: nöfn, dagsetningar, tíma, staði, þyngd, lengd, nöfn aðstandenda og önnur sérstök smáatriði. Þetta eru dýrmætar minningar og hvert smáatriði skiptir máli.${familyCtx}\n\n=== ${ch.title} ===\n${pairs}`;

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
