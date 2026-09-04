// ══════════════════════════════════════════════
//  RÖDD BARNSINS — dýrmæt hljóðbrot af barninu
//  Foreldrar taka upp barnið sjálft; upptökurnar
//  eru geymdar (ólíkt svörum foreldra, sem er hent
//  eftir umritun). Þak: 10 upptökur × 2 mín á barn.
// ══════════════════════════════════════════════
import { S } from './state.js';
import { getSupabase, uploadVoiceRecording, getVoiceUrl, deleteVoiceRecording } from './supabase-client.js';

export const MAX_RECORDINGS = 10;
const MAX_SECONDS = 120;

// ── Gagnalag ────────────────────────────────────

export async function loadBarnsrodd() {
  if (!S.user || !S.activeChildId) { S.barnsrodd = []; return; }
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data } = await sb.from('child_recordings')
      .select('id, path, label, recorded_at, duration_sec, created_at')
      .eq('user_id', S.user.id)
      .eq('child_id', S.activeChildId)
      .order('recorded_at', { ascending: false });
    S.barnsrodd = data || [];
  } catch (e) {
    console.warn('loadBarnsrodd villa:', e);
    S.barnsrodd = [];
  }
}

async function addRecording(blob, label, recordedAt, durationSec) {
  const sb = getSupabase();
  if (!sb || !S.user || !S.activeChildId) return null;
  const path = await uploadVoiceRecording(blob, 'barnsrodd');
  if (!path) throw new Error('Upptakan vistadist ekki i geymsluna');
  const { data, error } = await sb.from('child_recordings').insert({
    user_id: S.user.id,
    child_id: S.activeChildId,
    path,
    label: label?.trim() || null,
    recorded_at: recordedAt || new Date().toISOString().split('T')[0],
    duration_sec: durationSec || null,
  }).select('id, path, label, recorded_at, duration_sec, created_at').single();
  if (error) { deleteVoiceRecording(path); throw error; }
  S.barnsrodd.unshift(data);
  return data;
}

async function removeRecording(id) {
  const sb = getSupabase();
  if (!sb) return;
  const rec = S.barnsrodd.find(r => r.id === id);
  if (rec?.path) await deleteVoiceRecording(rec.path);
  await sb.from('child_recordings').delete().eq('id', id).eq('user_id', S.user.id);
  S.barnsrodd = S.barnsrodd.filter(r => r.id !== id);
}

// ── Hjálparföll ─────────────────────────────────

function _esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(S.lang === 'en' ? 'en-GB' : 'is-IS', { day: 'numeric', month: 'long', year: 'numeric' });
}

function _fmtDur(sec) {
  if (!sec) return '';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function isFull() { return (S.barnsrodd?.length || 0) >= MAX_RECORDINGS; }

// ── Reitur á kaflayfirlitinu ────────────────────

export function updateBarnsroddMapTile() {
  const wrap = document.getElementById('barnsrodd-tile-count-wrap');
  if (!wrap) return;
  const count = S.barnsrodd?.length || 0;
  const label = count === 1
    ? (S.lang === 'en' ? '1 recording' : '1 upptaka')
    : (S.lang === 'en' ? `${count} recordings` : `${count} upptökur`);
  wrap.textContent = count > 0
    ? `${label} ${S.lang === 'en' ? 'of' : 'af'} ${MAX_RECORDINGS}`
    : (S.lang === 'en' ? 'Record the first one →' : 'Taktu upp þá fyrstu →');
}

// ── Safnglugginn ────────────────────────────────

export function openBarnsroddBank() {
  const overlay = document.getElementById('barnsrodd-bank-overlay');
  if (!overlay) return;
  renderBarnsroddBank();
  overlay.style.display = 'flex';
}

export function closeBarnsroddBank() {
  _stopPlayback();
  document.getElementById('barnsrodd-bank-overlay').style.display = 'none';
}

export function renderBarnsroddBank() {
  const body = document.getElementById('barnsrodd-bank-body');
  if (!body) return;
  const title = document.getElementById('barnsrodd-bank-title');
  if (title) {
    const child = S.children.find(c => c.id === S.activeChildId);
    title.textContent = child
      ? (S.lang === 'en' ? `${child.child_name}'s voice` : `Rödd ${child.child_name}`)
      : (S.lang === 'en' ? "The child's voice" : 'Rödd barnsins');
  }
  const addBtn = document.getElementById('barnsrodd-bank-add-btn');
  if (addBtn) {
    addBtn.disabled = isFull();
    addBtn.textContent = isFull()
      ? (S.lang === 'en' ? 'Storage full (10 of 10)' : 'Geymslan er full (10 af 10)')
      : (S.lang === 'en' ? '+ New recording' : '+ Ný upptaka');
  }
  const hint = document.getElementById('barnsrodd-bank-hint');
  if (hint) {
    const count = S.barnsrodd?.length || 0;
    hint.textContent = isFull()
      ? (S.lang === 'en'
          ? 'Delete a recording to make room for a new one.'
          : 'Eyddu upptöku til að rýma fyrir nýrri.')
      : (S.lang === 'en'
          ? `${count} of ${MAX_RECORDINGS} recordings used · up to 2 minutes each · ⬇ saves a copy to your own device`
          : `${count} af ${MAX_RECORDINGS} upptökum nýttar · allt að 2 mínútur hver · ⬇ vistar afrit hjá þér`);
  }

  if (!S.barnsrodd || S.barnsrodd.length === 0) {
    body.innerHTML = `
      <div style="text-align:center;padding:48px 20px;color:var(--mid);">
        <div style="font-size:3.5rem;margin-bottom:16px;">🗣️</div>
        <p style="font-size:15px;line-height:1.7;">
          ${S.lang === 'en'
            ? 'No recordings yet. Capture a little moment of your child\u2019s voice: the first words, a song, a giggle.'
            : 'Engar upptökur enn. Fangaðu lítið augnablik af röddinni: fyrstu orðin, söngl eða hlátur.'}
        </p>
      </div>`;
    return;
  }

  body.innerHTML = S.barnsrodd.map(r => `
    <div class="gullmoli-card" id="barnsrodd-card-${r.id}">
      <div style="display:flex;align-items:center;gap:12px;">
        <button class="voice-play-big" onclick="playBarnsrodd('${r.id}', this)" title="${S.lang === 'en' ? 'Play' : 'Spila'}">▶</button>
        <div style="flex:1;min-width:0;">
          <div class="gullmoli-quote" style="font-size:1rem;">${_esc(r.label || (S.lang === 'en' ? 'Recording' : 'Upptaka'))}</div>
          <div class="gullmoli-meta" style="margin-top:4px;">
            <span class="gullmoli-date">📅 ${_fmtDate(r.recorded_at)}${r.duration_sec ? ' · ' + _fmtDur(r.duration_sec) : ''}</span>
          </div>
        </div>
        <button class="gullmoli-edit-btn" onclick="downloadBarnsrodd('${r.id}', this)" title="${S.lang === 'en' ? 'Download the recording' : 'Sækja upptökuna'}">⬇</button>
        <button class="gullmoli-delete-btn" onclick="confirmDeleteBarnsrodd('${r.id}')" title="${S.lang === 'en' ? 'Delete' : 'Eyða'}">🗑</button>
      </div>
    </div>`).join('');
}

let _audio = null, _audioBtn = null;
function _stopPlayback() {
  if (_audio) { _audio.pause(); _audio = null; }
  if (_audioBtn) { _audioBtn.textContent = '▶'; _audioBtn = null; }
}

export async function playBarnsrodd(id, btn) {
  if (_audioBtn === btn) { _stopPlayback(); return; }
  _stopPlayback();
  const rec = S.barnsrodd.find(r => r.id === id);
  if (!rec) return;
  btn.textContent = '…';
  const url = await getVoiceUrl(rec.path);
  if (!url) { btn.textContent = '▶'; return; }
  _audio = new Audio(url);
  _audioBtn = btn;
  btn.textContent = '⏸';
  _audio.onended = _stopPlayback;
  _audio.play().catch(_stopPlayback);
}

export async function confirmDeleteBarnsrodd(id) {
  const rec = S.barnsrodd.find(r => r.id === id);
  if (!rec) return;
  const name = rec.label || (S.lang === 'en' ? 'this recording' : 'þessari upptöku');
  const msg = S.lang === 'en'
    ? `Delete "${name}"? The recording cannot be recovered.`
    : `Eyða \u201E${name}\u201C? Ekki er hægt að endurheimta upptökuna.`;
  if (!confirm(msg)) return;
  _stopPlayback();
  await removeRecording(id);
  renderBarnsroddBank();
  updateBarnsroddMapTile();
}

// ── Upptökuglugginn ─────────────────────────────

let recStream = null, recRecorder = null, recChunks = [], recTimer = null, recSeconds = 0;
let recBlob = null;

export function openBarnsroddRecorder() {
  if (!S.user) return;
  if (isFull()) {
    openBarnsroddBank();
    return;
  }
  const overlay = document.getElementById('barnsrodd-rec-overlay');
  if (!overlay) return;
  _resetRecorderUI();
  overlay.style.display = 'flex';
}

export function closeBarnsroddRecorder() {
  _stopRecStream();
  recBlob = null;
  document.getElementById('barnsrodd-rec-overlay').style.display = 'none';
}

function _resetRecorderUI() {
  recBlob = null;
  recSeconds = 0;
  document.getElementById('barnsrodd-rec-timer').textContent = '0:00';
  document.getElementById('barnsrodd-rec-btn').textContent = S.lang === 'en' ? '🔴 Start recording' : '🔴 Hefja upptöku';
  document.getElementById('barnsrodd-rec-btn').style.display = '';
  document.getElementById('barnsrodd-rec-preview').style.display = 'none';
  document.getElementById('barnsrodd-rec-error').textContent = '';
  const audioEl = document.getElementById('barnsrodd-rec-audio');
  if (audioEl) { audioEl.pause?.(); audioEl.removeAttribute('src'); }
  document.getElementById('barnsrodd-rec-label').value = '';
  document.getElementById('barnsrodd-rec-date').value = new Date().toISOString().split('T')[0];
}

function _stopRecStream() {
  clearInterval(recTimer);
  if (recRecorder && recRecorder.state !== 'inactive') { try { recRecorder.stop(); } catch (e) {} }
  if (recStream) { recStream.getTracks().forEach(t => t.stop()); recStream = null; }
  recRecorder = null;
}

export async function toggleBarnsroddRec() {
  const btn = document.getElementById('barnsrodd-rec-btn');
  if (recRecorder && recRecorder.state === 'recording') {
    recRecorder.stop();
    return;
  }
  try {
    recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    document.getElementById('barnsrodd-rec-error').textContent = S.lang === 'en'
      ? 'Microphone access was denied.'
      : 'Aðgangur að hljóðnemanum fékkst ekki.';
    return;
  }
  const type = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
    : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
  recRecorder = new MediaRecorder(recStream, type ? { mimeType: type } : undefined);
  recChunks = [];
  recRecorder.ondataavailable = e => { if (e.data.size) recChunks.push(e.data); };
  recRecorder.onstop = () => {
    clearInterval(recTimer);
    if (recStream) { recStream.getTracks().forEach(t => t.stop()); recStream = null; }
    recBlob = new Blob(recChunks, { type: type || 'audio/webm' });
    const audioEl = document.getElementById('barnsrodd-rec-audio');
    if (audioEl) audioEl.src = URL.createObjectURL(recBlob);
    document.getElementById('barnsrodd-rec-btn').style.display = 'none';
    document.getElementById('barnsrodd-rec-preview').style.display = 'block';
    setTimeout(() => document.getElementById('barnsrodd-rec-label').focus(), 50);
  };
  recRecorder.start(1000);
  recSeconds = 0;
  btn.textContent = S.lang === 'en' ? '⏹ Stop' : '⏹ Stöðva';
  recTimer = setInterval(() => {
    recSeconds++;
    const m = Math.floor(recSeconds / 60), s = recSeconds % 60;
    document.getElementById('barnsrodd-rec-timer').textContent = `${m}:${String(s).padStart(2, '0')}`;
    if (recSeconds >= MAX_SECONDS && recRecorder?.state === 'recording') recRecorder.stop();
  }, 1000);
}

export function retakeBarnsrodd() { _resetRecorderUI(); }

export async function saveBarnsroddRec() {
  if (!recBlob) return;
  const btn = document.getElementById('barnsrodd-rec-save');
  const label = document.getElementById('barnsrodd-rec-label').value;
  const date = document.getElementById('barnsrodd-rec-date').value;
  btn.disabled = true;
  btn.textContent = S.lang === 'en' ? 'Saving…' : 'Vista…';
  try {
    await addRecording(recBlob, label, date, recSeconds || null);
    closeBarnsroddRecorder();
    updateBarnsroddMapTile();
    if (document.getElementById('barnsrodd-bank-overlay')?.style.display === 'flex') renderBarnsroddBank();
  } catch (e) {
    console.error('saveBarnsroddRec villa:', e);
    document.getElementById('barnsrodd-rec-error').textContent = S.lang === 'en'
      ? 'Saving failed. Please try again.'
      : 'Vistun mistókst. Reyndu aftur.';
  } finally {
    btn.disabled = false;
    btn.textContent = S.lang === 'en' ? 'Save' : 'Vista';
  }
}


// ── Sækja upptöku til sín: röddin varðveitist óháð vefnum ──
function safeFileName(txt) {
  const base = String(txt || "rodd-barnsins")
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return base || "rodd-barnsins";
}

export async function downloadBarnsrodd(id, btn) {
  const rec = S.barnsrodd.find(r => r.id === id);
  if (!rec) return;
  const original = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = "…"; }
  try {
    const url = await getVoiceUrl(rec.path);
    if (!url) throw new Error("upptaka fannst ekki");
    const blob = await (await fetch(url)).blob();
    const ext = (rec.path.split(".").pop() || "webm").split("?")[0];
    const child = S.children.find(c => c.id === S.activeChildId);
    const name = [child?.child_name, rec.label, rec.recorded_at].filter(Boolean).join(" ");
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${safeFileName(name)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 10000);
  } catch (e) {
    console.error("niðurhal raddar villa:", e);
    alert(S.lang === "en" ? "Could not download the recording. Please try again." : "Ekki tókst að sækja upptökuna. Reyndu aftur.");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = original; }
  }
}

window.openBarnsroddBank = openBarnsroddBank;
window.closeBarnsroddBank = closeBarnsroddBank;
window.renderBarnsroddBank = renderBarnsroddBank;
window.playBarnsrodd = playBarnsrodd;
window.downloadBarnsrodd = downloadBarnsrodd;
window.confirmDeleteBarnsrodd = confirmDeleteBarnsrodd;
window.openBarnsroddRecorder = openBarnsroddRecorder;
window.closeBarnsroddRecorder = closeBarnsroddRecorder;
window.toggleBarnsroddRec = toggleBarnsroddRec;
window.retakeBarnsrodd = retakeBarnsrodd;
window.saveBarnsroddRec = saveBarnsroddRec;
