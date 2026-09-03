// ══════════════════════════════════════════════
//  FJÖLSKYLDAN: spurningar frá fjölskyldunni
//  - Foreldri býr til boðshlekk fyrir virka barnið (family_links)
//  - Fjölskyldan sendir inn spurningar (fjolskylda.html)
//  - Foreldri samþykkir/hafnar; samþykkt spurning
//    fer fremst í valinn kafla sem "NAFN spyr: ..."
//  - Deildir kaflar birtast á fjölskyldusíðunni
// ══════════════════════════════════════════════
import { S } from './state.js';
import { getSupabase, getChapterState, saveState } from './supabase-client.js';
import { getChapters } from './chapters.js';

let pendingCache = [];
let childTokens = [];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function makeToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Sækir tokens virka barnsins (boðshlekkur er á hvert barn)
async function loadChildTokens() {
  childTokens = [];
  const sb = getSupabase();
  if (!sb || !S.user || !S.activeChildId) return;
  const { data } = await sb.from("family_links")
    .select("token").eq("user_id", S.user.id).eq("child_id", S.activeChildId).eq("active", true);
  childTokens = (data || []).map(l => l.token);
}

async function getOrCreateFamilyLink() {
  const sb = getSupabase();
  if (!sb || !S.user || !S.activeChildId) return null;
  await loadChildTokens();
  if (childTokens.length > 0) return childTokens[0];
  const token = makeToken();
  const { error } = await sb.from("family_links")
    .insert({ token, user_id: S.user.id, child_id: S.activeChildId });
  if (error) { console.error("family_links villa:", error); return null; }
  childTokens = [token];
  return token;
}

export async function showFamilyInviteModal() {
  const overlay = document.getElementById("family-invite-overlay");
  const linkEl = document.getElementById("family-invite-link");
  if (!overlay || !linkEl) return;
  overlay.style.display = "flex";
  linkEl.value = S.lang === "en" ? "Fetching the link..." : "Sæki hlekk...";
  const token = await getOrCreateFamilyLink();
  if (!token) {
    linkEl.value = S.lang === "en" ? "Could not create a link. Try again." : "Ekki tókst að búa til hlekk. Reyndu aftur.";
    return;
  }
  linkEl.value = `${location.origin}/fjolskylda.html?t=${token}`;
}

export function closeFamilyInviteModal() {
  const overlay = document.getElementById("family-invite-overlay");
  if (overlay) overlay.style.display = "none";
}

export async function copyFamilyLink() {
  const linkEl = document.getElementById("family-invite-link");
  const btn = document.getElementById("family-copy-btn");
  const done = S.lang === "en" ? "✓ Copied!" : "✓ Afritað!";
  const label = S.lang === "en" ? "Copy the link" : "Afrita hlekkinn";
  if (!linkEl) return;
  try {
    await navigator.clipboard.writeText(linkEl.value);
    if (btn) { btn.textContent = done; setTimeout(() => { btn.textContent = label; }, 2000); }
  } catch {
    linkEl.select();
    document.execCommand("copy");
    if (btn) { btn.textContent = done; setTimeout(() => { btn.textContent = label; }, 2000); }
  }
}

export async function loadFamilyQuestions() {
  const sb = getSupabase();
  if (!sb || !S.user) return;
  try {
    await loadChildTokens();
    if (childTokens.length === 0) { pendingCache = []; renderFamilySection(); return; }
    const { data, error } = await sb.from("family_questions")
      .select("id, asker_name, question, created_at")
      .in("token", childTokens)
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (error) { console.warn("family_questions villa:", error); return; }
    pendingCache = data || [];
    renderFamilySection();
  } catch (e) { console.warn("loadFamilyQuestions villa:", e); }
}

function renderFamilySection() {
  const section = document.getElementById("family-questions-section");
  const list = document.getElementById("family-questions-list");
  if (!section || !list) return;
  if (pendingCache.length === 0) { section.style.display = "none"; return; }
  section.style.display = "block";
  const chapters = getChapters();
  const options = chapters.map((ch, i) =>
    `<option value="${ch.id}">${i + 1}. ${esc(ch.title)}</option>`).join("");
  const heading = document.getElementById("family-questions-heading");
  if (heading) heading.textContent = S.lang === "en"
    ? (pendingCache.length === 1
      ? "A question from your family is waiting"
      : `${pendingCache.length} questions from your family are waiting`)
    : (pendingCache.length === 1
      ? "Spurning frá fjölskyldunni bíður þín"
      : `${pendingCache.length} spurningar frá fjölskyldunni bíða þín`);
  list.innerHTML = pendingCache.map(q => `
    <div class="family-q-item" id="family-q-${q.id}">
      <div class="family-q-asker">${esc(q.asker_name)} ${S.lang === "en" ? "asks" : "spyr"}:</div>
      <div class="family-q-text">${esc(q.question)}</div>
      <div class="family-q-actions">
        <select class="family-q-chapter" id="family-q-chapter-${q.id}" aria-label="Veldu kafla">${options}</select>
        <button class="family-q-approve" onclick="approveFamilyQuestion(${q.id})">✓ ${S.lang === "en" ? "Approve" : "Samþykkja"}</button>
        <button class="family-q-reject" onclick="rejectFamilyQuestion(${q.id})">${S.lang === "en" ? "Decline" : "Hafna"}</button>
      </div>
    </div>`).join("");
}

export async function approveFamilyQuestion(id) {
  const q = pendingCache.find(x => x.id === id);
  if (!q) return;
  const sel = document.getElementById(`family-q-chapter-${id}`);
  const chapterId = parseInt(sel?.value ?? "1", 10);
  const cs = getChapterState(chapterId);
  if (!cs) return;
  const text = `${q.asker_name} spyr: ${q.question}`;
  // Fremst í röðina af ósvöruðum spurningum kaflans
  cs.questions.splice(cs.answers.length, 0, text);
  if (cs.complete) cs.complete = false; // kaflinn opnast aftur fyrir nýju spurninguna
  await saveState();
  const sb = getSupabase();
  if (sb) await sb.from("family_questions")
    .update({ status: "approved", chapter_id: chapterId }).eq("id", id);
  pendingCache = pendingCache.filter(x => x.id !== id);
  renderFamilySection();
  const { renderMap } = await import('./map.js');
  renderMap();
}

export async function rejectFamilyQuestion(id) {
  const sb = getSupabase();
  if (sb) await sb.from("family_questions")
    .update({ status: "rejected" }).eq("id", id);
  pendingCache = pendingCache.filter(x => x.id !== id);
  renderFamilySection();
}

// ── Deildir kaflar ────────────────────────────
export const sharedChapterIds = new Set();

export async function loadSharedChapters() {
  const sb = getSupabase();
  if (!sb || !S.user) return;
  try {
    await loadChildTokens();
    sharedChapterIds.clear();
    if (childTokens.length === 0) return;
    const { data } = await sb.from("shared_chapters")
      .select("chapter_id").in("token", childTokens);
    (data || []).forEach(r => sharedChapterIds.add(r.chapter_id));
  } catch (e) { console.warn("loadSharedChapters villa:", e); }
}

export async function shareChapter(chapterId, title, content) {
  const sb = getSupabase();
  if (!sb || !S.user || !content) return false;
  const token = await getOrCreateFamilyLink();
  if (!token) return false;
  const { error } = await sb.from("shared_chapters").upsert(
    { token, chapter_id: chapterId, title, content, updated_at: new Date().toISOString() },
    { onConflict: "token,chapter_id" }
  );
  if (error) { console.error("shareChapter villa:", error); return false; }
  sharedChapterIds.add(chapterId);
  return true;
}

export async function unshareChapter(chapterId) {
  const sb = getSupabase();
  if (!sb || !S.user) return false;
  await loadChildTokens();
  if (childTokens.length === 0) return true;
  const { error } = await sb.from("shared_chapters")
    .delete().eq("chapter_id", chapterId).in("token", childTokens);
  if (error) { console.error("unshareChapter villa:", error); return false; }
  sharedChapterIds.delete(chapterId);
  return true;
}

window.showFamilyInviteModal = showFamilyInviteModal;
window.closeFamilyInviteModal = closeFamilyInviteModal;
window.copyFamilyLink = copyFamilyLink;
window.approveFamilyQuestion = approveFamilyQuestion;
window.rejectFamilyQuestion = rejectFamilyQuestion;
