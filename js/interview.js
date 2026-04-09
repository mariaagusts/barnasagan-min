// ══════════════════════════════════════════════
//  INTERVIEW
// ══════════════════════════════════════════════
import { S } from './state.js';
import { t } from './i18n.js';
import { getChapters, CHAPTERS, CHAPTERS_EN } from './chapters.js';
import { getChapterState, saveState, uploadPhoto, deletePhoto } from './supabase-client.js';
import { generateNextQuestion } from './gemini.js';
import { stopListening, hideMicError } from './speech.js';
import { showScreen } from './modals.js';
import { showMap } from './modals.js';

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

let bonusMode = false;

// ── Sandwich helpers ──────────────────────────

function shouldAskFollowUp(answer) {
  if (!answer) return false;
  const trimmed = answer.trim();
  const skipPhrases = /^(já|nei|veit\s*ekki|kannski|ekkert|—|no|yes|don't\s*know|nothing|i\s*don't\s*know)\.?$/i;
  if (skipPhrases.test(trimmed)) return false;
  return trimmed.split(/\s+/).length > 3;
}

async function advanceQuestion(cs) {
  const wasFollowUp = cs.awaitingFollowUp;
  cs.awaitingFollowUp = false;

  const askAI = () => Promise.race([
    generateNextQuestion(cs),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 15000))
  ]);

  if (wasFollowUp) {
    // After a follow-up: always go to next isCore (or free-form if all cores done)
    const nextCoreQ = cs.coreTexts[cs.coreAnswered];
    if (nextCoreQ) {
      cs.questions.push(nextCoreQ);
    } else {
      cs.questions.push(await askAI());
    }
  } else {
    // After an isCore: increment counter, decide whether to ask follow-up
    cs.coreAnswered++;
    const lastAns = cs.answers[cs.answers.length - 1];
    if (shouldAskFollowUp(lastAns)) {
      cs.questions.push(await askAI());
      cs.awaitingFollowUp = true;
    } else {
      const nextCoreQ = cs.coreTexts[cs.coreAnswered];
      if (nextCoreQ) {
        cs.questions.push(nextCoreQ);
      } else {
        cs.questions.push(await askAI());
      }
    }
  }
  saveState();
}

function pushFallbackQuestion(cs) {
  const fallbackTexts = cs.coreTexts || [];
  const nextCore = fallbackTexts[cs.coreAnswered];
  const generic = S.lang === "en" ? "Tell me more about this period of your child's life." : "Segðu mér meira um þetta tímabil í lífi barnsins.";
  cs.questions.push(nextCore || generic);
  cs.awaitingFollowUp = false;
  saveState();
}

// ── Core UI functions ─────────────────────────

export function enterChapter(id) {
  bonusMode = false;
  S.chapterId = id;
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

    const fallback = S.lang === "en" ? "Tell me more about this period of your child's life." : "Segðu mér meira um þetta tímabil í lífi barnsins.";
    const q = cs.questions[qIdx] || fallback;

    // Progress label: core question number or follow-up indicator
    const qNumEl = document.getElementById("q-num");
    if (qNumEl) {
      if (cs.awaitingFollowUp) {
        qNumEl.textContent = S.lang === "en" ? "Follow-up" : "Fylgispurning";
      } else {
        const coreNum = (cs.coreAnswered || 0) + 1;
        const coreTotal = cs.coreTexts?.length || 0;
        if (coreNum > coreTotal) {
          qNumEl.textContent = S.lang === "en" ? "Follow-up" : "Fylgispurning";
        } else {
          qNumEl.textContent = S.lang === "en"
            ? `Core question ${coreNum} of ${coreTotal}`
            : `Kjarnaspurning ${coreNum} af ${coreTotal}`;
        }
      }
    }

    if (document.getElementById("question-text")) {
      document.getElementById("question-text").textContent = q;
      document.getElementById("question-text").innerHTML += ` <button onclick="showCustomQuestionInput()" title="Bæta við eigin spurningu" style="background:none;border:1px solid var(--border);border-radius:50%;width:22px;height:22px;font-size:12px;cursor:pointer;color:var(--brown);padding:0;vertical-align:middle;margin-left:8px;">+</button>`;
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
    const img = document.createElement("img");
    img.src = photo.url || photo.data || "";
    img.className = "chapter-photo-thumb";
    img.title = photo.name;
    img.onclick = () => removeChapterPhoto(i);
    grid.appendChild(img);
  });

  const addBtn = document.createElement("button");
  addBtn.className = "btn-add-photo";
  addBtn.onclick = addChapterPhoto;
  addBtn.title = S.lang === "en" ? "Add photo" : "Bæta við mynd";
  addBtn.textContent = "+";
  grid.appendChild(addBtn);
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

  // Skip always goes to next core (no follow-up after a skip)
  const wasFollowUp = cs.awaitingFollowUp;
  cs.awaitingFollowUp = false;
  if (!wasFollowUp) cs.coreAnswered++;

  const nextCoreQ = cs.coreTexts[cs.coreAnswered];
  const generic = S.lang === "en" ? "Tell me more about this period of your child's life." : "Segðu mér meira um þetta tímabil í lífi barnsins.";
  cs.questions.push(nextCoreQ || generic);
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
}

window.continueChapter = continueChapter;
window.enterChapter = enterChapter;
window.editAnswer = editAnswer;
window.saveAnswer = saveAnswer;
window.showCustomQuestionInput = showCustomQuestionInput;
window.cancelCustomQuestion = cancelCustomQuestion;
window.addCustomQuestion = addCustomQuestion;
window.submitAnswer = submitAnswer;
window.skipQuestion = skipQuestion;
window.addChapterPhoto = addChapterPhoto;
window.handleChapterPhotos = handleChapterPhotos;
window.removeChapterPhoto = removeChapterPhoto;
window.renderHistory = renderHistory;
