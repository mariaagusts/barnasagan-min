// ══════════════════════════════════════════════
//  DAGBÓKIN
//  Notandinn skrifar frjálst, spyrillinn finnur
//  réttan kafla og býr til spurninguna sem
//  textinn svarar. Notandinn staðfestir áður en
//  færslan fer inn í söguna.
// ══════════════════════════════════════════════
import { S } from './state.js';
import { fileFreeEntry } from './gemini.js';
import { getChapters } from './chapters.js';
import { getChapterState, saveState } from './supabase-client.js';

let pending = [];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function el(id) { return document.getElementById(id); }

function setStatus(msg, isError) {
  const s = el("dagbok-status");
  if (!s) return;
  s.textContent = msg || "";
  s.style.color = isError ? "#c0392b" : "var(--mid)";
}

export async function analyseDagbok() {
  const ta = el("dagbok-input");
  const btn = el("dagbok-btn");
  if (!ta) return;
  const text = ta.value.trim();
  if (text.length < 10) {
    setStatus(S.lang === "en" ? "Write a little more and we will find its place." : "Skrifaðu aðeins meira, þá finnum við réttan stað fyrir það.", true);
    ta.focus();
    return;
  }
  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = S.lang === "en" ? "Reading…" : "Les…";
  setStatus(S.lang === "en" ? "Finding the right chapter…" : "Finn réttan kafla…");
  try {
    pending = await fileFreeEntry(text);
    if (!pending.length) {
      setStatus(S.lang === "en"
        ? "Could not place this one. Try writing it a little differently, or answer a question in a chapter instead."
        : "Ekki tókst að finna stað fyrir þetta. Prófaðu að orða það örlítið öðruvísi, eða svaraðu spurningu inni í kafla.", true);
      return;
    }
    setStatus("");
    renderPreview();
  } catch (e) {
    console.error("dagbok villa:", e);
    setStatus(S.lang === "en" ? "Something went wrong. Try again." : "Eitthvað fór úrskeiðis. Reyndu aftur.", true);
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

export function cancelDagbok() {
  pending = [];
  const p = el("dagbok-preview");
  if (p) { p.innerHTML = ""; p.style.display = "none"; }
  const form = el("dagbok-form");
  if (form) form.style.display = "";
  setStatus("");
}

export function removeDagbokEntry(i) {
  pending.splice(i, 1);
  if (!pending.length) { cancelDagbok(); return; }
  renderPreview();
}

function renderPreview() {
  const p = el("dagbok-preview");
  const form = el("dagbok-form");
  if (!p) return;
  const chapters = getChapters();
  const isEn = S.lang === "en";
  p.innerHTML = pending.map((it, i) => {
    if (it.type === "quote") {
      return `
      <div class="dagbok-card">
        <div class="dagbok-where">✨ ${isEn ? "Into the golden phrase bank" : "Fer í Gullmolabankann"}</div>
        <div class="dagbok-quote">„${esc(it.quote)}“</div>
        ${it.context ? `<div class="dagbok-ctx">${esc(it.context)}</div>` : ``}
        <button class="dagbok-drop" onclick="removeDagbokEntry(${i})">${isEn ? "Leave this out" : "Sleppa þessu"}</button>
      </div>`;
    }
    const opts = chapters.map((c, n) =>
      `<option value="${c.id}"${c.id === it.chapterId ? " selected" : ""}>${n + 1}. ${esc(c.title)}</option>`).join("");
    return `
    <div class="dagbok-card">
      <div class="dagbok-where">${isEn ? "Goes into" : "Fer í kaflann"}</div>
      <select class="dagbok-select" id="dagbok-ch-${i}">${opts}</select>
      <div class="dagbok-qlbl">${isEn ? "As an answer to" : "Sem svar við spurningunni"}</div>
      <input class="dagbok-qinput" id="dagbok-q-${i}" value="${esc(it.question)}" maxlength="180">
      <div class="dagbok-answer">${esc(it.answer)}</div>
      ${pending.length > 1 ? `<button class="dagbok-drop" onclick="removeDagbokEntry(${i})">${isEn ? "Leave this out" : "Sleppa þessu"}</button>` : ``}
    </div>`;
  }).join("") + `
    <div class="dagbok-actions">
      <button class="dagbok-save" id="dagbok-save-btn" onclick="saveDagbokEntries()">${isEn ? "Save into the story" : "Vista í söguna"}</button>
      <button class="dagbok-cancel" onclick="cancelDagbok()">${isEn ? "Cancel" : "Hætta við"}</button>
    </div>`;
  p.style.display = "block";
  if (form) form.style.display = "none";
}

export async function saveDagbokEntries() {
  const btn = el("dagbok-save-btn");
  if (btn) { btn.disabled = true; btn.textContent = S.lang === "en" ? "Saving…" : "Vista…"; }
  const chapterTitles = [];
  let quotes = 0;
  try {
    for (let i = 0; i < pending.length; i++) {
      const it = pending[i];
      if (it.type === "quote") {
        const m = await import('./gullmoli.js');
        await m.addGullmoli(it.quote, it.context, new Date().toISOString().split("T")[0]);
        m.updateGullmolaMapTile();
        quotes++;
        continue;
      }
      const sel = el("dagbok-ch-" + i);
      const cid = sel ? parseInt(sel.value, 10) : it.chapterId;
      const qEl = el("dagbok-q-" + i);
      const question = qEl && qEl.value.trim() ? qEl.value.trim() : it.question;
      const cs = getChapterState(cid);
      if (!cs) continue;
      cs.questions.splice(cs.answers.length, 0, question);
      cs.answers.push(it.answer);
      const ch = getChapters().find(c => c.id === cid);
      if (ch) chapterTitles.push(ch.title);
    }
    await saveState();
    const ta = el("dagbok-input");
    if (ta) ta.value = "";
    cancelDagbok();
    const { renderMap } = await import('./map.js');
    renderMap();
    const parts = [];
    if (chapterTitles.length) {
      parts.push(S.lang === "en"
        ? "Saved into " + chapterTitles.join(" and ")
        : "Komið inn í " + chapterTitles.join(" og "));
    }
    if (quotes) {
      parts.push(quotes === 1
        ? (S.lang === "en" ? "and one phrase into the golden phrase bank" : "og einn gullmoli í bankann")
        : (S.lang === "en" ? "and " + quotes + " phrases into the golden phrase bank" : "og " + quotes + " gullmolar í bankann"));
    }
    setStatus("✓ " + parts.join(" ") + ".");
    setTimeout(() => setStatus(""), 6000);
  } catch (e) {
    console.error("dagbok vistun villa:", e);
    setStatus(S.lang === "en" ? "Saving failed. Try again." : "Vistun mistókst. Reyndu aftur.", true);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = S.lang === "en" ? "Save into the story" : "Vista í söguna"; }
  }
}

window.analyseDagbok = analyseDagbok;
window.saveDagbokEntries = saveDagbokEntries;
window.cancelDagbok = cancelDagbok;
window.removeDagbokEntry = removeDagbokEntry;
