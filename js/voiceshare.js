// ══════════════════════════════════════════════
//  RÖDD BÓKARINNAR: foreldri velur hvaða upptökur af
//  rödd barnsins fá QR-kóða aftast í PDF-bókinni.
//  Hver valin upptaka fær opinberan deilihlekk
//  (langt tilviljunarnafn) og sinn eigin QR-kóða
//  með lýsingu og dagsetningu (allt að 10).
// ══════════════════════════════════════════════
import { S } from './state.js';
import { getSupabase, saveState, getVoiceUrl } from './supabase-client.js';

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function randName() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(S.lang === "en" ? "en-GB" : "is-IS", { day: "numeric", month: "long", year: "numeric" });
}

// Deilingarnar; flytur eldri stöku deilinguna (voiceShare) yfir í listann
export function getVoiceShares() {
  if (!S.chapters) return [];
  if (!Array.isArray(S.chapters.voiceShares)) {
    S.chapters.voiceShares = S.chapters.voiceShare?.sharePath ? [S.chapters.voiceShare] : [];
    delete S.chapters.voiceShare;
  }
  return S.chapters.voiceShares;
}

export function renderVoiceShareStatus() {
  const status = document.getElementById("voice-share-status");
  const btn = document.getElementById("voice-share-btn");
  if (!status || !btn) return;
  const shares = getVoiceShares();
  if (shares.length > 0) {
    const label = S.lang === "en"
      ? (shares.length === 1 ? "1 recording gets a QR code at the back of the PDF book." : `${shares.length} recordings get QR codes at the back of the PDF book.`)
      : (shares.length === 1 ? "1 upptaka fær QR-kóða aftast í PDF-bókinni." : `${shares.length} upptökur fá QR-kóða aftast í PDF-bókinni.`);
    status.innerHTML = `
      <div style="background:var(--warm);border-radius:12px;padding:14px 16px;font-size:14px;color:var(--text);margin-bottom:12px;">
        ✅ ${label}
      </div>`;
    btn.textContent = S.lang === "en" ? "🗣️ Change selection" : "🗣️ Breyta vali";
  } else {
    status.innerHTML = "";
    btn.textContent = S.lang === "en" ? "🗣️ Choose recordings" : "🗣️ Velja upptökur";
  }
}

export function toggleVoiceSharePicker() {
  const picker = document.getElementById("voice-share-picker");
  if (!picker) return;
  if (picker.style.display === "block") { picker.style.display = "none"; return; }
  renderVoiceSharePicker();
  picker.style.display = "block";
}

export function renderVoiceSharePicker() {
  const picker = document.getElementById("voice-share-picker");
  if (!picker) return;
  const recs = S.barnsrodd || [];
  if (recs.length === 0) {
    picker.innerHTML = `<p style="font-size:14px;color:var(--mid);padding:12px 0;">${S.lang === "en"
      ? "No recordings of your child's voice yet. Open \u201EThe child's voice\u201C on the overview and record the first one."
      : "Engar upptökur af rödd barnsins enn. Opnaðu \u201ER\u00f6dd barnsins\u201C á yfirlitinu og taktu upp þá fyrstu."}</p>`;
    return;
  }
  const shares = getVoiceShares();
  picker.innerHTML = recs.map((r, i) => {
    const isShared = shares.some(sh => sh.srcPath === r.path);
    return `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:white;border:1px solid ${isShared ? "var(--gold)" : "var(--border)"};border-radius:12px;margin-bottom:8px;">
      <button onclick="previewVoiceShare(${i})" title="${S.lang === "en" ? "Listen" : "Hlusta"}" style="background:var(--warm);border:1px solid var(--border);border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:14px;flex-shrink:0;">▶</button>
      <div style="min-width:0;flex:1;">
        <div style="font-size:13px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(r.label || (S.lang === "en" ? "Recording" : "Upptaka"))}</div>
        <div style="font-size:12px;color:var(--mid);">${fmtDate(r.recorded_at)}</div>
      </div>
      <button id="voice-share-toggle-${i}" onclick="toggleShareRecording(${i})" style="background:${isShared ? "var(--mid)" : "var(--orange)"};color:#fff;border:none;border-radius:999px;padding:8px 16px;font-size:13px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;flex-shrink:0;">${isShared
        ? (S.lang === "en" ? "✓ In the book" : "✓ Í bókinni")
        : (S.lang === "en" ? "Put in the book" : "Setja í bókina")}</button>
    </div>`;
  }).join("");
}

let previewAudio = null;
export async function previewVoiceShare(i) {
  const rec = (S.barnsrodd || [])[i];
  if (!rec) return;
  const url = await getVoiceUrl(rec.path);
  if (!url) return;
  if (previewAudio) { previewAudio.pause(); previewAudio = null; }
  previewAudio = new Audio(url);
  previewAudio.play();
}

export async function toggleShareRecording(i) {
  const rec = (S.barnsrodd || [])[i];
  if (!rec) return;
  const btn = document.getElementById(`voice-share-toggle-${i}`);
  const status = document.getElementById("voice-share-status");
  if (btn) btn.disabled = true;
  const shares = getVoiceShares();
  const sb = getSupabase();
  try {
    if (!sb || !S.user) throw new Error("ekki innskráð");
    const idx = shares.findIndex(sh => sh.srcPath === rec.path);
    if (idx !== -1) {
      // Taka úr bókinni: eyða opinbera afritinu
      const old = shares[idx];
      if (old.sharePath) {
        try { await sb.storage.from("voice-shares").remove([old.sharePath]); } catch { /* no-op */ }
      }
      shares.splice(idx, 1);
    } else {
      if (shares.length >= 10) return;
      const signed = await getVoiceUrl(rec.path);
      if (!signed) throw new Error("upptaka fannst ekki");
      const blob = await (await fetch(signed)).blob();
      const ext = rec.path.split(".").pop() || "webm";
      const sharePath = `${S.user.id}/${randName()}.${ext}`;
      const { error } = await sb.storage.from("voice-shares")
        .upload(sharePath, blob, { contentType: blob.type || "audio/webm", upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = sb.storage.from("voice-shares").getPublicUrl(sharePath);
      const label = rec.label || "";
      const playerUrl = `${location.origin}/rodd.html?f=${encodeURIComponent(sharePath)}` + (label ? `&l=${encodeURIComponent(label)}` : "");
      shares.push({ srcPath: rec.path, sharePath, url: playerUrl, audioUrl: publicUrl, label, recorded_at: rec.recorded_at || null });
    }
    await saveState();
    renderVoiceSharePicker();
    renderVoiceShareStatus();
  } catch (e) {
    console.error("voiceShare villa:", e);
    if (status) status.innerHTML = `<p style="font-size:14px;color:#c0392b;padding:8px 0;">${S.lang === "en" ? "Could not update the selection. Does the voice-shares bucket exist? Try again." : "Ekki tókst að uppfæra valið. Er voice-shares fatan til? Reyndu aftur."}</p>`;
  } finally {
    if (btn) btn.disabled = false;
  }
}

window.toggleVoiceSharePicker = toggleVoiceSharePicker;
window.previewVoiceShare = previewVoiceShare;
window.toggleShareRecording = toggleShareRecording;
