// ══════════════════════════════════════════════
//  HEIGHTS — child growth tracker
// ══════════════════════════════════════════════
import { S } from './state.js';
import { getSupabase } from './supabase-client.js';

// ── Data layer ──────────────────────────────────

export async function loadHeights() {
  if (!S.user || !S.activeChildId) { S.heights = []; return; }
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data } = await sb.from('heights')
      .select('id, height_cm, weight_kg, measured_at, note, created_at')
      .eq('user_id', S.user.id)
      .eq('child_id', S.activeChildId)
      .order('measured_at', { ascending: false });
    S.heights = data || [];
  } catch(e) {
    console.warn('loadHeights villa:', e);
    S.heights = [];
  }
}

export async function addHeight(heightCm, weightKg, measuredAt, note) {
  const sb = getSupabase();
  if (!sb || !S.user || !S.activeChildId) return null;
  const { data, error } = await sb.from('heights').insert({
    user_id: S.user.id,
    child_id: S.activeChildId,
    height_cm: parseFloat(heightCm),
    weight_kg: weightKg ? parseFloat(weightKg) : null,
    measured_at: measuredAt || new Date().toISOString().split('T')[0],
    note: note?.trim() || null,
  }).select('id, height_cm, weight_kg, measured_at, note, created_at').single();
  if (error) throw error;
  S.heights.push(data);
  S.heights.sort((a, b) => b.measured_at.localeCompare(a.measured_at));
  return data;
}

export async function updateHeight(id, heightCm, weightKg, measuredAt, note) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from('heights').update({
    height_cm: parseFloat(heightCm),
    weight_kg: weightKg ? parseFloat(weightKg) : null,
    measured_at: measuredAt,
    note: note?.trim() || null,
  }).eq('id', id).eq('user_id', S.user.id);
  const idx = S.heights.findIndex(h => h.id === id);
  if (idx !== -1) {
    S.heights[idx] = { ...S.heights[idx], height_cm: parseFloat(heightCm), weight_kg: weightKg ? parseFloat(weightKg) : null, measured_at: measuredAt, note: note?.trim() || null };
    S.heights.sort((a, b) => b.measured_at.localeCompare(a.measured_at));
  }
}

export async function deleteHeight(id) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from('heights').delete().eq('id', id).eq('user_id', S.user.id);
  S.heights = S.heights.filter(h => h.id !== id);
}

// ── Helpers ──────────────────────────────────────

function _fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(S.lang === 'en' ? 'en-GB' : 'is-IS', { day: 'numeric', month: 'long', year: 'numeric' });
}

function _esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── Map tile ──────────────────────────────────────

export function updateHeightsMapTile() {
  const wrap = document.getElementById('heights-tile-count-wrap');
  if (!wrap) return;
  const count = S.heights.length;
  if (count === 0) {
    wrap.textContent = S.lang === 'en' ? 'Add first measurement →' : 'Bæta við fyrstu mælingu →';
    return;
  }
  const latest = S.heights[0];
  wrap.textContent = `📏 ${latest.height_cm} cm`;
}

// ── Collection modal ──────────────────────────────

export function openHeightsModal() {
  const overlay = document.getElementById('heights-modal-overlay');
  if (!overlay) return;
  renderHeightsModal();
  overlay.style.display = 'flex';
}

export function closeHeightsModal() {
  document.getElementById('heights-modal-overlay').style.display = 'none';
}

export function renderHeightsModal() {
  const body = document.getElementById('heights-modal-body');
  if (!body) return;
  const title = document.getElementById('heights-modal-title');
  if (title) {
    const child = S.children.find(c => c.id === S.activeChildId);
    title.textContent = child
      ? (S.lang === 'en' ? `${child.child_name}'s Height` : `Hæð ${child.child_name}`)
      : (S.lang === 'en' ? "Child's Height" : 'Hæð barnsins');
  }

  if (S.heights.length === 0) {
    body.innerHTML = `
      <div style="text-align:center;padding:48px 20px;color:var(--mid);">
        <div style="font-size:3rem;margin-bottom:16px;">📏</div>
        <p style="font-size:15px;line-height:1.7;">
          ${S.lang === 'en'
            ? 'No measurements yet — tap the button above to add the first one!'
            : 'Engar mælingar enn — smelltu á hnappinn hér að ofan til að bæta við fyrstu!'}
        </p>
      </div>`;
    return;
  }

  body.innerHTML = S.heights.map((h, i) => {
    const next = S.heights[i + 1]; // older entry
    const diff = next ? (h.height_cm - next.height_cm) : null;
    const diffLabel = diff !== null
      ? `<span class="height-diff">+${diff.toFixed(1)} cm</span>`
      : '';
    return `
      <div class="height-card" id="height-card-${h.id}">
        <div class="height-main">
          <span class="height-value">${h.height_cm} <span class="height-unit">cm</span></span>
          ${h.weight_kg ? `<span class="height-weight">${h.weight_kg} kg</span>` : ''}
          ${diffLabel}
        </div>
        ${h.note ? `<div class="height-note">${_esc(h.note)}</div>` : ''}
        <div class="height-meta">
          <span class="height-date">📅 ${_fmtDate(h.measured_at)}</span>
          <div class="height-actions">
            <button class="gullmoli-edit-btn" onclick="editHeightInline('${h.id}')" title="${S.lang === 'en' ? 'Edit' : 'Breyta'}">✏️</button>
            <button class="gullmoli-delete-btn" onclick="confirmDeleteHeight('${h.id}')" title="${S.lang === 'en' ? 'Delete' : 'Eyða'}">🗑</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── Add modal ─────────────────────────────────────

export function openHeightAdd() {
  const overlay = document.getElementById('height-add-overlay');
  if (!overlay) return;
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('height-add-cm').value = '';
  document.getElementById('height-add-kg').value = '';
  document.getElementById('height-add-date').value = today;
  document.getElementById('height-add-note').value = '';
  overlay.style.display = 'flex';
  setTimeout(() => document.getElementById('height-add-cm').focus(), 50);
}

export function closeHeightAdd() {
  document.getElementById('height-add-overlay').style.display = 'none';
}

export async function saveHeightAdd() {
  const cm = document.getElementById('height-add-cm').value.trim();
  if (!cm || isNaN(parseFloat(cm))) {
    document.getElementById('height-add-cm').focus();
    return;
  }
  const kg = document.getElementById('height-add-kg').value.trim();
  const date = document.getElementById('height-add-date').value;
  const note = document.getElementById('height-add-note').value.trim();
  const btn = document.getElementById('height-add-save');
  btn.disabled = true;
  btn.textContent = S.lang === 'en' ? 'Saving...' : 'Vista...';
  try {
    await addHeight(cm, kg || null, date, note);
    closeHeightAdd();
    renderHeightsModal();
    updateHeightsMapTile();
  } catch(e) {
    console.error('saveHeightAdd villa:', e);
  } finally {
    btn.disabled = false;
    btn.textContent = S.lang === 'en' ? 'Save' : 'Vista';
  }
}

// ── Inline edit ───────────────────────────────────

export function editHeightInline(id) {
  const h = S.heights.find(x => x.id === id);
  if (!h) return;
  const card = document.getElementById(`height-card-${id}`);
  if (!card) return;
  card.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:8px;">
      <div style="flex:1;">
        <label style="font-size:11px;color:var(--mid);">${S.lang === 'en' ? 'Height (cm)' : 'Hæð (cm)'}</label>
        <input type="number" step="0.1" class="height-edit-cm" value="${h.height_cm}"
          style="width:100%;border:1.5px solid var(--gold);border-radius:10px;padding:8px 10px;font-size:16px;font-weight:700;background:white;outline:none;box-sizing:border-box;">
      </div>
      <div style="flex:1;">
        <label style="font-size:11px;color:var(--mid);">${S.lang === 'en' ? 'Weight (kg, optional)' : 'Þyngd (kg, valfrjálst)'}</label>
        <input type="number" step="0.1" class="height-edit-kg" value="${h.weight_kg || ''}"
          style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:8px 10px;font-size:14px;background:white;outline:none;box-sizing:border-box;">
      </div>
    </div>
    <input type="date" class="height-edit-date" value="${h.measured_at}"
      style="border:1.5px solid var(--border);border-radius:10px;padding:7px 10px;font-size:13px;background:white;margin-bottom:8px;width:100%;box-sizing:border-box;">
    <input type="text" class="height-edit-note" placeholder="${S.lang === 'en' ? 'Note (optional)' : 'Athugasemd (valfrjálst)'}" value="${_esc(h.note || '')}"
      style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:8px 10px;font-size:13px;background:white;outline:none;margin-bottom:10px;box-sizing:border-box;">
    <div style="display:flex;gap:8px;">
      <button class="gullmoli-save-btn" onclick="saveHeightEdit('${id}')">${S.lang === 'en' ? 'Save' : 'Vista'}</button>
      <button class="gullmoli-cancel-btn" onclick="renderHeightsModal()">${S.lang === 'en' ? 'Cancel' : 'Hætta við'}</button>
    </div>`;
}

export async function saveHeightEdit(id) {
  const card = document.getElementById(`height-card-${id}`);
  if (!card) return;
  const cm = card.querySelector('.height-edit-cm').value.trim();
  if (!cm) return;
  const kg = card.querySelector('.height-edit-kg').value.trim();
  const date = card.querySelector('.height-edit-date').value;
  const note = card.querySelector('.height-edit-note').value.trim();
  await updateHeight(id, cm, kg || null, date, note);
  renderHeightsModal();
  updateHeightsMapTile();
}

export async function confirmDeleteHeight(id) {
  const h = S.heights.find(x => x.id === id);
  if (!h) return;
  const msg = S.lang === 'en'
    ? `Delete this measurement?\n\n${h.height_cm} cm — ${_fmtDate(h.measured_at)}`
    : `Eyða þessari mælingu?\n\n${h.height_cm} cm — ${_fmtDate(h.measured_at)}`;
  if (!confirm(msg)) return;
  await deleteHeight(id);
  renderHeightsModal();
  updateHeightsMapTile();
}

window.openHeightsModal = openHeightsModal;
window.closeHeightsModal = closeHeightsModal;
window.renderHeightsModal = renderHeightsModal;
window.openHeightAdd = openHeightAdd;
window.closeHeightAdd = closeHeightAdd;
window.saveHeightAdd = saveHeightAdd;
window.editHeightInline = editHeightInline;
window.saveHeightEdit = saveHeightEdit;
window.confirmDeleteHeight = confirmDeleteHeight;
