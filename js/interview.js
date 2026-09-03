// ══════════════════════════════════════════════
//  INTERVIEW
// ══════════════════════════════════════════════
import { S } from './state.js';
import { t } from './i18n.js';
import { getChapters, CHAPTERS, CHAPTERS_EN } from './chapters.js';
import { getChapterState, saveState, uploadPhoto, deletePhoto } from './supabase-client.js';
import { decideNextQuestion, generateNextQuestion, warmUpProxy, validateQuestion } from './gemini.js';
import { stopListening, hideMicError } from './speech.js';
import { showScreen } from './modals.js';
import { showMap } from './modals.js';

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

let bonusMode = false;

// ── Þráðamódelið ──────────────────────────────
// Spyrillinn fylgir sögunni sem foreldrið var að segja (allt að THREAD_MAX
// djúpt) og þunn svör fá næstu kjarnaspurningu í stað yfirheyrslu.

const THREAD_MAX = 3;

function closingQuestion(ch) {
  return S.lang === "en"
    ? "Is there anything else from this chapter you would like to tell?"
    : "Er eitthvað fleira úr þessum kafla sem þú vilt segja frá?";
}

function isThinAnswer(a) {
  const t = String(a || "").trim().toLowerCase();
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length <= 2) return true;
  return /^(nei|já|man (það )?ekki|veit (það )?ekki|ekkert sérstakt|ég man (það )?ekki)[.!…]*$/.test(t);
}

function isSimilarToAsked(text, askedQuestions) {
  const norm = x => String(x).toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(w => w.length >= 4);
  const a = new Set(norm(text));
  if (a.size === 0) return false;
  return askedQuestions.some(q => {
    const b = new Set(norm(q));
    if (b.size === 0) return false;
    let overlap = 0;
    for (const w of a) if (b.has(w)) overlap++;
    return overlap / Math.min(a.size, b.size) >= 0.6;
  });
}

function nextUnansweredCore(cs) {
  return cs.coreTexts.find(tq => !cs.questions.includes(tq));
}

function hasScriptedLeft(cs, fuSeeds) {
  if (nextUnansweredCore(cs)) return true;
  const fuIdx = cs.fuIdx || 0;
  return !!fuSeeds.slice(fuIdx).find(f => !cs.questions.includes(f));
}

// Næsta akkeri → ónotuð handritsspurning → ein lokaspurning → kafla lokið
function pushAnchorOrWrapUp(cs, ch, fuSeeds) {
  cs.threadDepth = 0;
  const nextCore = nextUnansweredCore(cs);
  if (nextCore) { cs.questions.push(nextCore); return; }
  const fuIdx = cs.fuIdx || 0;
  const unusedFu = fuSeeds.slice(fuIdx).find(f => !cs.questions.includes(f));
  if (unusedFu) {
    cs.fuIdx = fuSeeds.indexOf(unusedFu) + 1;
    cs.questions.push(unusedFu);
    return;
  }
  const closing = closingQuestion(ch);
  if (cs.questions.includes(closing)) { cs.complete = true; return; }
  cs.questions.push(closing);
}

async function advanceQuestion(cs) {
  const ch = getChapters().find(c => c.id === S.chapterId);
  const fuSeeds = ch?.seeds?.filter(s => !s.isCore).map(s => s.text) || [];

  // Aðeins ýtt í tóman reit — aldrei skrifað yfir spurningu sem er til
  const nextIdx = cs.answers.length;
  if (cs.questions[nextIdx] !== undefined) { saveState(); return; }

  const lastQ = cs.questions[cs.answers.length - 1];
  const lastA = cs.answers[cs.answers.length - 1];
  if (cs.coreTexts.includes(lastQ)) cs.coreAnswered++;

  // Þunnt svar: góður spyrill yfirheyrir aldrei "man það ekki".
  // Meðan handritsspurningar eru til fer hann beint í þá næstu (ekkert AI).
  // Þegar þær klárast opnar EITT þunnt svar nýjan vinkil — kaflinn lokast
  // aðeins eftir tvö þunn svör í röð.
  const thin = isThinAnswer(lastA);
  cs.thinStreak = thin ? (cs.thinStreak || 0) + 1 : 0;
  if (thin && (hasScriptedLeft(cs, fuSeeds) || cs.thinStreak >= 2)) {
    pushAnchorOrWrapUp(cs, ch, fuSeeds);
    saveState();
    return;
  }

  const depth = cs.threadDepth || 0;
  let decision = null;
  try {
    decision = await Promise.race([
      decideNextQuestion(cs, depth, thin),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 30000))
    ]);
  } catch (err) {
    console.warn("AI ákvörðun mistókst, nota fasta spurningu:", err);
  }

  // Notandinn gæti hafa aðhafst á meðan beðið var — aldrei skrifa yfir
  if (cs.questions[nextIdx] !== undefined) { saveState(); return; }

  if (!decision || !decision.question || decision.action === "next_anchor") {
    pushAnchorOrWrapUp(cs, ch, fuSeeds);
  } else if (decision.action === "dig" && depth < THREAD_MAX &&
             !cs.questions.includes(decision.question)) {
    cs.questions.push(decision.question);
    cs.threadDepth = depth + 1;
  } else if (nextUnansweredCore(cs)) {
    // Þráður endaði og akkeri eru eftir: akkerin ERU nýju vinklarnir
    pushAnchorOrWrapUp(cs, ch, fuSeeds);
  } else if (!isSimilarToAsked(decision.question, cs.questions)) {
    cs.questions.push(decision.question);
    cs.threadDepth = 1;
  } else {
    pushAnchorOrWrapUp(cs, ch, fuSeeds);
  }
  saveState();
}

function pushFallbackQuestion(cs) {
  const ch = getChapters().find(c => c.id === S.chapterId);
  const fuSeeds = ch?.seeds?.filter(s => !s.isCore).map(s => s.text) || [];
  const nextIdx = cs.answers.length;
  if (cs.questions[nextIdx] !== undefined) { saveState(); return; }
  const lastQ = cs.questions[cs.answers.length - 1];
  if (cs.coreTexts.includes(lastQ)) cs.coreAnswered++;
  pushAnchorOrWrapUp(cs, ch, fuSeeds);
  saveState();
}

// ── Core UI functions ─────────────────────────

export function enterChapter(id) {
  bonusMode = false;
  S.chapterId = id;
  warmUpProxy(); // Wake up Edge Function before user answers
  const chapters = getChapters();
  const ch = chapters.find(c => c.id === id);
  document.getElementById("banner-emoji").textContent = ch.emoji;
  document.getElementById("banner-num").textContent = t("chapterOf") + " " + (chapters.indexOf(ch) + 1);
  document.getElementById("banner-title").textContent = ch.title;
  document.getElementById("chapter-complete-wrap").style.display = "none";
  document.getElementById("question-card").style.display = "block";
  renderInterviewQuestion();
  showScreen("interview");
}

export function renderInterviewQuestion() {
  try {
    const cs = getChapterState(S.chapterId);
    const qIdx = cs.answers.length;
    const isChapterDone = (cs.complete || qIdx >= 10) && !bonusMode;
    if (isChapterDone) { showChapterComplete(); return; }

    const ch = getChapters().find(c => c.id === S.chapterId);
    const chTitle = ch?.title || "";
    const fallback = S.lang === "en"
      ? `Is there anything else you'd like to share about ${chTitle}?`
      : `Er eitthvað fleira sem þú vilt deila um ${chTitle}?`;
    const q = cs.questions[qIdx] || fallback;

    // Progress label
    const qNumEl = document.getElementById("q-num");
    if (qNumEl) {
      const isCurrentCore = cs.coreTexts?.includes(q);
      if (isCurrentCore) {
        const coreNum = cs.coreTexts.indexOf(q) + 1;
        const coreTotal = cs.coreTexts.length;
        qNumEl.textContent = S.lang === "en"
          ? `Core question ${coreNum} of ${coreTotal}`
          : `Kjarnaspurning ${coreNum} af ${coreTotal}`;
      } else {
        qNumEl.textContent = S.lang === "en" ? "Follow-up" : "Fylgispurning";
      }
    }

    // Nudge if unanswered cores remain and approaching limit
    const nudgeEl = document.getElementById("core-nudge");
    if (nudgeEl) {
      const coresLeft = (cs.coreTexts?.length || 0) - (cs.coreAnswered || 0);
      const showNudge = coresLeft > 0 && qIdx >= 7;
      nudgeEl.style.display = showNudge ? "block" : "none";
      if (showNudge) {
        nudgeEl.textContent = S.lang === "en"
          ? `💡 ${coresLeft} core question${coresLeft > 1 ? "s" : ""} still unanswered`
          : `💡 ${coresLeft} kjarnaspurning${coresLeft > 1 ? "ar" : ""} eftir`;
      }
    }

    if (document.getElementById("question-text")) {
      document.getElementById("question-text").textContent = q;
      document.getElementById("question-text").innerHTML += ` <button onclick="showCustomQuestionInput()" title="${S.lang === "en" ? "Add your own question" : "Bæta við eigin spurningu"}" style="background:none;border:1px solid var(--border);border-radius:50%;width:22px;height:22px;font-size:12px;cursor:pointer;color:var(--brown);padding:0;vertical-align:middle;margin-left:8px;">+</button>`;
      // Regenerate button — only for AI/bonus questions, not core ones
      const isCore = cs.coreTexts?.includes(q);
      if (!isCore && cs.answers.length > 0) {
        document.getElementById("question-text").innerHTML += ` <button onclick="regenerateQuestion()" title="${S.lang === "en" ? "Get a different question" : "Fá aðra spurningu"}" style="background:none;border:1px solid var(--border);border-radius:50%;width:22px;height:22px;font-size:12px;cursor:pointer;color:var(--brown);padding:0;vertical-align:middle;margin-left:4px;">↻</button>`;
      }
    }

    const ta = document.getElementById("answer-input");
    ta.value = "";
    ta.disabled = false;
    ta.placeholder = t("placeholder");
    document.getElementById("btn-next").disabled = true;
    document.getElementById("btn-next").textContent = t("nextBtn");
    ta.oninput = () => { document.getElementById("btn-next").disabled = !ta.value.trim(); };

    const pct = Math.min((qIdx / 10) * 100, 100);
    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-label").textContent = qIdx > 10 ? qIdx + "/10 (100%)" : qIdx + "/10";
    hideMicError();
    renderInterviewPhotos();

    if (cs.answers.length > 0) {
      document.getElementById("history-wrap").style.display = "block";
      const histCount = document.getElementById("history-count");
      if (histCount) histCount.textContent = cs.answers.length;
      renderHistory();
    } else {
      document.getElementById("history-wrap").style.display = "none";
    }
  } catch(err) {
    console.error("renderInterviewQuestion villa:", err);
    showMap();
  }
}

export function renderHistory() {
  const cs = getChapterState(S.chapterId);
  const histWrap = document.getElementById("history-wrap");
  if (histWrap) {
    const summary = histWrap.querySelector("summary");
    if (summary) summary.textContent = `${t("historyLabel")} (${cs.answers.length})`;
  }
  document.getElementById("history-list").innerHTML = cs.answers.map((a, i) => `
    <div class="history-item" id="history-item-${i}">
      <div class="history-q">
        ${esc(cs.questions[i])}
        <button class="history-delete-btn" onclick="deleteAnswer(${i})" title="${t("deleteBtn")}">${t("deleteBtn")}</button>
        <button class="history-edit-btn" onclick="editAnswer(${i})">${t("editBtn")}</button>
      </div>
      <div class="history-a" id="history-a-${i}">${esc(a)}</div>
    </div>`).join("");
}

export function editAnswer(i) {
  const cs = getChapterState(S.chapterId);
  const aDiv = document.getElementById(`history-a-${i}`);
  aDiv.innerHTML = `
    <textarea class="history-edit-textarea" id="edit-input-${i}" rows="3">${esc(cs.answers[i])}</textarea>
    <div class="history-edit-actions">
      <button class="history-cancel-btn" onclick="renderHistory()">${t("cancelBtn")}</button>
      <button class="history-save-btn" onclick="saveAnswer(${i})">${t("saveBtn")}</button>
    </div>`;
  document.getElementById(`edit-input-${i}`).focus();
}

export function saveAnswer(i) {
  const cs = getChapterState(S.chapterId);
  const newVal = document.getElementById(`edit-input-${i}`).value.trim();
  if (newVal) {
    cs.answers[i] = newVal;
    saveState();
  }
  renderHistory();
}

export function deleteAnswer(i) {
  const cs = getChapterState(S.chapterId);
  const wasCore = cs.coreTexts.includes(cs.questions[i]);
  cs.questions.splice(i, 1);
  cs.answers.splice(i, 1);
  if (wasCore && cs.coreAnswered > 0) cs.coreAnswered--;
  cs.complete = false;
  saveState();
  renderHistory();
  const histCount = document.getElementById("history-count");
  if (histCount) histCount.textContent = cs.answers.length;
}

export function showCustomQuestionInput() {
  document.getElementById("custom-question-area").style.display = "block";
  document.getElementById("answer-input").style.display = "none";
  document.getElementById("custom-question-input").focus();
}

export function cancelCustomQuestion() {
  document.getElementById("custom-question-area").style.display = "none";
  document.getElementById("custom-question-input").value = "";
  document.getElementById("answer-input").style.display = "block";
}

export async function addCustomQuestion() {
  const input = document.getElementById("custom-question-input");
  const customQ = input.value.trim();
  if (!customQ) return;

  const cs = getChapterState(S.chapterId);
  const qIdx = cs.answers.length;

  cs.questions[qIdx] = customQ;
  saveState();

  cancelCustomQuestion();

  document.getElementById("question-area").innerHTML = `<p class="question" id="question-text"></p>`;
  renderInterviewQuestion();
}

export async function submitAnswer() {
  const ta = document.getElementById("answer-input");
  const ans = ta.value.trim();
  if (!ans) return;
  if (S.isListening) stopListening();

  const cs = getChapterState(S.chapterId);
  cs.answers.push(ans);
  saveState();

  if (cs.answers.length >= 10 && !bonusMode) {
    cs.complete = true;
    saveState();
    showChapterComplete();
    return;
  }

  document.getElementById("question-area").innerHTML = `<div class="loading-dots"><span class="dot1">•</span><span class="dot2">•</span><span class="dot3">•</span></div>`;
  document.getElementById("btn-next").disabled = true;
  ta.value = "";
  ta.disabled = true;

  try {
    await advanceQuestion(cs);
  } catch(err) {
    console.error("Gemini villa:", err);
    pushFallbackQuestion(cs);
    const ind = document.getElementById("save-indicator");
    if (ind) { ind.textContent = "⚠️ Gemini villa — nota staðgengilsspurningu"; ind.classList.add("visible"); setTimeout(() => { ind.textContent = "✓ Framvinda vistuð"; ind.classList.remove("visible"); }, 3000); }
  }

  document.getElementById("question-area").innerHTML = `<p class="question" id="question-text"></p>`;
  ta.disabled = false;
  renderInterviewQuestion();
}

export function addChapterPhoto() {
  document.getElementById("chapter-photo-input").click();
}

export async function handleChapterPhotos(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;
  const chIdx = S.chapterId;
  if (!S.chapters.chapters[chIdx].photos) S.chapters.chapters[chIdx].photos = [];

  for (const file of files) {
    if (S.user) {
      try {
        const meta = await uploadPhoto(file, chIdx);
        S.chapters.chapters[chIdx].photos.push(meta);
        saveState();
        renderInterviewPhotos();
      } catch (e) {
        console.warn("Storage upload villa, nota base64:", e);
        await _readAsBase64(file, chIdx);
      }
    } else {
      await _readAsBase64(file, chIdx);
    }
  }
  event.target.value = "";
}

function _readAsBase64(file, chIdx) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = (e) => {
      S.chapters.chapters[chIdx].photos.push({ data: e.target.result, name: file.name });
      saveState();
      renderInterviewPhotos();
      resolve();
    };
    reader.readAsDataURL(file);
  });
}

export function renderInterviewPhotos() {
  const chIdx = S.chapterId;
  const photos = S.chapters.chapters[chIdx]?.photos || [];
  const section = document.getElementById("interview-photos-section");
  const grid = document.getElementById("interview-photos-grid");
  if (!section || !grid) return;

  section.style.display = "block";
  grid.innerHTML = "";

  photos.forEach((photo, i) => {
    const wrap = document.createElement("div");
    wrap.style.cssText = "position:relative;display:inline-block;";

    const img = document.createElement("img");
    img.src = photo.url || photo.data || "";
    img.className = "chapter-photo-thumb";
    img.title = photo.caption || (S.lang === "en" ? "Click to add a caption" : "Smelltu til að bæta við lýsingu");
    // Click = edit caption (captions are woven into the story text)
    img.onclick = () => editChapterPhotoCaption(i);
    wrap.appendChild(img);

    const del = document.createElement("button");
    del.textContent = "✕";
    del.title = S.lang === "en" ? "Remove photo" : "Fjarlægja mynd";
    del.style.cssText = "position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;border:none;background:var(--dark,#3C2A1E);color:#fff;font-size:10px;line-height:1;cursor:pointer;padding:0;";
    del.onclick = (e) => { e.stopPropagation(); removeChapterPhoto(i); };
    wrap.appendChild(del);

    if (photo.caption) {
      const cap = document.createElement("div");
      cap.textContent = photo.caption;
      cap.style.cssText = "font-size:10px;color:var(--mid,#8b7355);max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;";
      wrap.appendChild(cap);
    }
    grid.appendChild(wrap);
  });

  const addBtn = document.createElement("button");
  addBtn.className = "btn-add-photo";
  addBtn.onclick = addChapterPhoto;
  addBtn.title = S.lang === "en" ? "Add photo" : "Bæta við mynd";
  addBtn.textContent = "+";
  grid.appendChild(addBtn);
}

export function editChapterPhotoCaption(index) {
  const chIdx = S.chapterId;
  const photo = S.chapters.chapters[chIdx]?.photos?.[index];
  if (!photo) return;
  const msg = S.lang === "en"
    ? "Caption for this photo (used in the story):"
    : "Lýsing á myndinni (notuð í sögunni):";
  const val = prompt(msg, photo.caption || "");
  if (val === null) return;
  photo.caption = val.trim();
  saveState();
  renderInterviewPhotos();
}

export async function removeChapterPhoto(index) {
  if (!confirm(S.lang === "en" ? "Remove this photo?" : "Fjarlægja þessa mynd?")) return;
  const chIdx = S.chapterId;
  const photo = S.chapters.chapters[chIdx].photos[index];
  if (photo?.path) await deletePhoto(photo.path);
  S.chapters.chapters[chIdx].photos.splice(index, 1);
  saveState();
  renderInterviewPhotos();
}

// "Get a different question" — replaces the current AI question with a fresh
// one. Rejected questions are remembered so they don't come back.
export async function regenerateQuestion() {
  const cs = getChapterState(S.chapterId);
  const qIdx = cs.answers.length;
  const currentQ = cs.questions[qIdx];
  if (!currentQ || cs.coreTexts.includes(currentQ)) return;

  cs.rejected = cs.rejected || [];
  if (!cs.rejected.includes(currentQ)) cs.rejected.push(currentQ);

  document.getElementById("question-area").innerHTML = `<div class="loading-dots"><span class="dot1">•</span><span class="dot2">•</span><span class="dot3">•</span></div>`;

  let newQ = null;
  try {
    const raw = await Promise.race([
      generateNextQuestion(cs, cs.rejected),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 30000))
    ]);
    const text = validateQuestion(raw);
    if (text && !cs.questions.includes(text) && !cs.rejected.includes(text)) newQ = text;
  } catch (err) {
    console.error("Gemini villa við endurgerð:", err);
  }

  if (!newQ) {
    // Fallback: next unused bonus seed
    const ch = getChapters().find(c => c.id === S.chapterId);
    const fuSeeds = ch?.seeds?.filter(s => !s.isCore).map(s => s.text) || [];
    newQ = fuSeeds.find(f => !cs.questions.includes(f) && !cs.rejected.includes(f)) || currentQ;
  }

  cs.questions[qIdx] = newQ;
  saveState();
  document.getElementById("question-area").innerHTML = `<p class="question" id="question-text"></p>`;
  renderInterviewQuestion();
}

export function skipQuestion() {
  const cs = getChapterState(S.chapterId);
  cs.answers.push("—");
  saveState();

  if (cs.answers.length >= 10 && !bonusMode) {
    cs.complete = true;
    saveState();
    showChapterComplete();
    return;
  }

  // Skip: same flow as normal advance but no AI call
  const skippedQ = cs.questions[cs.answers.length - 1];
  const skippedWasCore = cs.coreTexts.includes(skippedQ);
  if (skippedWasCore) cs.coreAnswered++;

  const nextCoreQ = cs.coreTexts[cs.coreAnswered];
  const skipCh = getChapters().find(c => c.id === S.chapterId);
  const skipTitle = skipCh?.title || "";
  cs.questions.push(nextCoreQ || (S.lang === "en"
    ? `Is there anything else you'd like to share about ${skipTitle}?`
    : `Er eitthvað fleira sem þú vilt deila um ${skipTitle}?`));
  saveState();

  document.getElementById("question-area").innerHTML = `<p class="question" id="question-text"></p>`;
  document.getElementById("answer-input").value = "";
  document.getElementById("answer-input").disabled = false;
  document.getElementById("btn-next").disabled = true;
  renderInterviewQuestion();
}

export function showChapterComplete() {
  const chapters = getChapters();
  const ch = chapters.find(c => c.id === S.chapterId);
  const chIdx = chapters.indexOf(ch);
  const nextCh = chapters[chIdx + 1];
  document.getElementById("question-card").style.display = "none";
  document.getElementById("chapter-complete-wrap").style.display = "block";
  const cs = getChapterState(S.chapterId);
  if (cs.answers.length > 0) {
    document.getElementById("history-wrap").style.display = "block";
    renderHistory();
  }
  document.getElementById("chapter-complete-wrap").innerHTML = `
    <div class="complete-card">
      <div style="font-size:40px;margin-bottom:16px;">${ch.emoji}</div>
      <h2>${t("chapterOf")} ${chIdx + 1} ${t("chapterDone")}</h2>
      <p>${t("chapterDoneMsg")}</p>
      <div class="complete-card-actions">
        ${nextCh ? `<button class="btn-gold" onclick="enterChapter(${nextCh.id})">${t("nextChapter")} ${nextCh.emoji} ${nextCh.title} →</button>` : ''}
        <button class="btn-light" onclick="showMap()">${t("backOverview")}</button>
        <button class="btn-light" onclick="continueChapter()">+ ${t("addMoreQuestions")}</button>
      </div>
    </div>`;
}

export function continueChapter() {
  bonusMode = true;
  document.getElementById("chapter-complete-wrap").style.display = "none";
  document.getElementById("question-card").style.display = "block";
  renderInterviewQuestion();
  // In bonus mode, no AI generates questions — show custom input directly
  setTimeout(() => showCustomQuestionInput(), 50);
}

window.continueChapter = continueChapter;
window.enterChapter = enterChapter;
window.editAnswer = editAnswer;
window.saveAnswer = saveAnswer;
window.deleteAnswer = deleteAnswer;
window.showCustomQuestionInput = showCustomQuestionInput;
window.cancelCustomQuestion = cancelCustomQuestion;
window.addCustomQuestion = addCustomQuestion;
window.submitAnswer = submitAnswer;
window.skipQuestion = skipQuestion;
window.regenerateQuestion = regenerateQuestion;
window.addChapterPhoto = addChapterPhoto;
window.handleChapterPhotos = handleChapterPhotos;
window.removeChapterPhoto = removeChapterPhoto;
window.editChapterPhotoCaption = editChapterPhotoCaption;
window.renderHistory = renderHistory;
