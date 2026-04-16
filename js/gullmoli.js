// ══════════════════════════════════════════════
//  GULLMÓLABANKI — golden phrases from children
// ══════════════════════════════════════════════
import { S } from './state.js';
import { getSupabase } from './supabase-client.js';

// ── Data layer ──────────────────────────────────

export async function loadGullmolar() {
  if (!S.user || !S.activeChildId) { S.gullmolar = []; return; }
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data } = await sb.from('gullmolar')
      .select('id, quote, context, said_at, created_at')
      .eq('user_id', S.user.id)
      .eq('child_id', S.activeChildId)
      .order('said_at', { ascending: false });
    S.gullmolar = data || [];
  } catch(e) {
    console.warn('loadGullmolar villa:', e);
    S.gullmolar = [];
  }
}

export async function addGullmoli(quote, context, saidAt) {
  const sb = getSupabase();
  if (!sb || !S.user || !S.activeChildId) return null;
  const { data, error } = await sb.from('gullmolar').insert({
    user_id: S.user.id,
    child_id: S.activeChildId,
    quote: quote.trim(),
    context: context?.trim() || null,
    said_at: saidAt || new Date().toISOString().split('T')[0],
  }).select('id, quote, context, said_at, created_at').single();
  if (error) throw error;
  S.gullmolar.unshift(data);
  return data;
}

export async function updateGullmoli(id, quote, context, saidAt) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from('gullmolar')
    .update({ quote: quote.trim(), context: context?.trim() || null, said_at: saidAt })
    .eq('id', id)
    .eq('user_id', S.user.id);
  const idx = S.gullmolar.findIndex(g => g.id === id);
  if (idx !== -1) {
    S.gullmolar[idx] = { ...S.gullmolar[idx], quote: quote.trim(), context: context?.trim() || null, said_at: saidAt };
  }
}

export async function deleteGullmoli(id) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from('gullmolar').delete().eq('id', id).eq('user_id', S.user.id);
  S.gullmolar = S.gullmolar.filter(g => g.id !== id);
}

// ── UI helpers ──────────────────────────────────

function _fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(S.lang === 'en' ? 'en-GB' : 'is-IS', { day: 'numeric', month: 'long', year: 'numeric' });
}

function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── FAB visibility ──────────────────────────────

export function updateGullmolaFab() {
  const fab = document.getElementById('gullmola-fab');
  if (!fab) return;
  fab.dataset.loggedIn = S.user ? "1" : "0";
  const activeScreen = document.querySelector(".screen.active")?.id?.replace("screen-", "") || "";
  const appScreens = ["map", "interview", "story"];
  fab.style.display = (S.user && appScreens.includes(activeScreen)) ? 'flex' : 'none';
}

// ── Map tile ─────────────────────────────────────

export function updateGullmolaMapTile() {
  const wrap = document.getElementById('gullmola-tile-count-wrap');
  if (!wrap) return;
  const count = S.gullmolar.length;
  const label = count === 1
    ? (S.lang === 'en' ? '1 phrase' : '1 gullmola')
    : (S.lang === 'en' ? `${count} phrases` : `${count} gullmolar`);
  wrap.textContent = count > 0 ? label : (S.lang === 'en' ? 'Add first phrase →' : 'Bæta við fyrstu →');
}

// ── Quick-add modal ─────────────────────────────

export function openGullmolaQuickAdd() {
  const overlay = document.getElementById('gullmola-quickadd-overlay');
  if (!overlay) return;
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('gullmola-qa-quote').value = '';
  document.getElementById('gullmola-qa-context').value = '';
  document.getElementById('gullmola-qa-date').value = today;
  overlay.style.display = 'flex';
  setTimeout(() => document.getElementById('gullmola-qa-quote').focus(), 50);
}

export function closeGullmolaQuickAdd() {
  document.getElementById('gullmola-quickadd-overlay').style.display = 'none';
}

export async function saveGullmolaQuickAdd() {
  const quote = document.getElementById('gullmola-qa-quote').value.trim();
  if (!quote) {
    document.getElementById('gullmola-qa-quote').focus();
    return;
  }
  const context = document.getElementById('gullmola-qa-context').value.trim();
  const saidAt = document.getElementById('gullmola-qa-date').value;
  const btn = document.getElementById('gullmola-qa-save');
  btn.disabled = true;
  btn.textContent = S.lang === 'en' ? 'Saving...' : 'Vista...';
  try {
    await addGullmoli(quote, context, saidAt);
    closeGullmolaQuickAdd();
    updateGullmolaMapTile();
  } catch(e) {
    console.error('saveGullmolaQuickAdd villa:', e);
  } finally {
    btn.disabled = false;
    btn.textContent = S.lang === 'en' ? 'Save' : 'Vista';
  }
}

// ── Collection modal ─────────────────────────────

export function openGullmolaBank() {
  const overlay = document.getElementById('gullmola-bank-overlay');
  if (!overlay) return;
  renderGullmolaBank();
  overlay.style.display = 'flex';
}

export function closeGullmolaBank() {
  document.getElementById('gullmola-bank-overlay').style.display = 'none';
}

export function renderGullmolaBank() {
  const body = document.getElementById('gullmola-bank-body');
  if (!body) return;
  const title = document.getElementById('gullmola-bank-title');
  if (title) {
    const child = S.children.find(c => c.id === S.activeChildId);
    title.textContent = child
      ? (S.lang === 'en' ? `${child.child_name}'s Golden Phrases` : `Gullmolar ${child.child_name}`)
      : (S.lang === 'en' ? 'Golden Phrase Bank' : 'Gullmolabanki');
  }

  if (S.gullmolar.length === 0) {
    body.innerHTML = `
      <div style="text-align:center;padding:48px 20px;color:var(--mid);">
        <div style="font-size:3.5rem;margin-bottom:16px;">✨</div>
        <p style="font-size:15px;line-height:1.7;">
          ${S.lang === 'en'
            ? 'No golden phrases yet — tap the button above to add the first one!'
            : 'Engir gullmolar enn — smelltu á hnappinn hér að ofan til að skrá þá fyrstu!'}
        </p>
      </div>`;
    return;
  }

  body.innerHTML = S.gullmolar.map(g => `
    <div class="gullmoli-card" id="gullmoli-card-${g.id}">
      <div class="gullmoli-quote">"${_esc(g.quote)}"</div>
      ${g.context ? `<div class="gullmoli-context">${_esc(g.context)}</div>` : ''}
      <div class="gullmoli-meta">
        <span class="gullmoli-date">📅 ${_fmtDate(g.said_at)}</span>
        <div class="gullmoli-actions">
          <button class="gullmoli-edit-btn" onclick="editGullmoliInline('${g.id}')" title="${S.lang === 'en' ? 'Edit' : 'Breyta'}">✏️</button>
          <button class="gullmoli-delete-btn" onclick="confirmDeleteGullmoli('${g.id}')" title="${S.lang === 'en' ? 'Delete' : 'Eyða'}">🗑</button>
        </div>
      </div>
    </div>`).join('');
}

export function editGullmoliInline(id) {
  const g = S.gullmolar.find(x => x.id === id);
  if (!g) return;
  const card = document.getElementById(`gullmoli-card-${id}`);
  if (!card) return;
  card.innerHTML = `
    <textarea class="gullmoli-edit-textarea" placeholder="${S.lang === 'en' ? 'What did they say?' : 'Hvað sagði barnið?'}">${_esc(g.quote)}</textarea>
    <input type="text" class="gullmoli-edit-input" placeholder="${S.lang === 'en' ? 'Context — e.g. at breakfast, age 3 (optional)' : 'Samhengi, t.d. í morgunmat, 3ja ára (valfrjálst)'}" value="${_esc(g.context || '')}">
    <input type="date" class="gullmoli-edit-date" value="${g.said_at}">
    <div style="display:flex;gap:8px;margin-top:4px;">
      <button class="gullmoli-save-btn" onclick="saveGullmoliEdit('${id}')">${S.lang === 'en' ? 'Save' : 'Vista'}</button>
      <button class="gullmoli-cancel-btn" onclick="renderGullmolaBank()">${S.lang === 'en' ? 'Cancel' : 'Hætta við'}</button>
    </div>`;
  card.querySelector('.gullmoli-edit-textarea').focus();
}

export async function saveGullmoliEdit(id) {
  const card = document.getElementById(`gullmoli-card-${id}`);
  if (!card) return;
  const quote = card.querySelector('.gullmoli-edit-textarea').value.trim();
  if (!quote) return;
  const context = card.querySelector('.gullmoli-edit-input').value.trim();
  const saidAt = card.querySelector('.gullmoli-edit-date').value;
  await updateGullmoli(id, quote, context, saidAt);
  renderGullmolaBank();
  updateGullmolaMapTile();
}

export async function confirmDeleteGullmoli(id) {
  const g = S.gullmolar.find(x => x.id === id);
  if (!g) return;
  const msg = S.lang === 'en'
    ? `Delete this phrase?\n\n"${g.quote}"`
    : `Eyða þessum gullmola?\n\n"${g.quote}"`;
  if (!confirm(msg)) return;
  await deleteGullmoli(id);
  renderGullmolaBank();
  updateGullmolaMapTile();
}

window.openGullmolaQuickAdd = openGullmolaQuickAdd;
window.closeGullmolaQuickAdd = closeGullmolaQuickAdd;
window.saveGullmolaQuickAdd = saveGullmolaQuickAdd;
window.openGullmolaBank = openGullmolaBank;
window.closeGullmolaBank = closeGullmolaBank;
window.renderGullmolaBank = renderGullmolaBank;
window.editGullmoliInline = editGullmoliInline;
window.saveGullmoliEdit = saveGullmoliEdit;
window.confirmDeleteGullmoli = confirmDeleteGullmoli;
