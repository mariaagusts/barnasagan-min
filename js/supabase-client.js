// ══════════════════════════════════════════════
//  SUPABASE CLIENT
// ══════════════════════════════════════════════
import { S } from './state.js';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
import { CHAPTERS } from './chapters.js';

export function getSupabase() {
  if (!S.sbClient) {
    const lib = window.supabase || window.Supabase;
    if (!lib) return null;
    S.sbClient = lib.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return S.sbClient;
}

export function buildFreshState() {
  return {
    chapters: CHAPTERS.map(ch => ({
      id: ch.id, questions: [...ch.seeds], answers: [], complete: false, photos: []
    }))
  };
}

export function initState() {
  const saved = localStorage.getItem("barnasaga_state");
  if (saved) {
    try { S.chapters = JSON.parse(saved); } catch { S.chapters = buildFreshState(); }
  } else {
    S.chapters = buildFreshState();
  }
}

export async function saveState() {
  localStorage.setItem("barnasaga_state", JSON.stringify(S.chapters));
  const ind = document.getElementById("save-indicator");
  if (ind && S.user) { ind.textContent = "💾 Vístar..."; ind.classList.remove("error"); ind.classList.add("visible"); }
  if (S.user) {
    try {
      const sb = getSupabase();
      if (sb) {
        await sb.from("user_progress").upsert({
          user_id: S.user.id,
          state_json: JSON.stringify(S.chapters),
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });
      }
    } catch (e) {
      console.warn("Supabase vista villa:", e);
      const indErr = document.getElementById("save-indicator");
      if (indErr) {
        indErr.textContent = "⚠️ Ekki vistað — athugaðu netsamband";
        indErr.classList.add("visible", "error");
        setTimeout(() => { indErr.classList.remove("visible", "error"); indErr.textContent = "✓ Framvinda vistuð"; }, 4000);
      }
      return;
    }
  }
  if (ind) {
    ind.textContent = "✓ Framvinda vistuð"; ind.classList.remove("error"); ind.classList.add("visible");
    setTimeout(() => ind.classList.remove("visible"), 2000);
  }
}

export async function loadStateFromSupabase() {
  if (!S.user) return;
  try {
    const sb = getSupabase();
    if (!sb) return;
    const { data, error } = await sb.from("user_progress")
      .select("state_json")
      .eq("user_id", S.user.id)
      .single();
    if (data && data.state_json) {
      S.chapters = JSON.parse(data.state_json);
      localStorage.setItem("barnasaga_state", data.state_json);
    } else {
      initState();
    }
  } catch (e) {
    console.warn("Supabase hlaða villa:", e);
    initState();
  }
}

export function getChapterState(id) { return S.chapters.chapters.find(c => c.id === id); }
export function totalAnswers() { return S.chapters.chapters.reduce((s, c) => s + c.answers.length, 0); }
export function completedChapters() { return S.chapters.chapters.filter(c => c.complete).length; }

export function resizePhotoForUpload(file, maxDim = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale); h = Math.round(h * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error("toBlob failed")),
        "image/jpeg", 0.88
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image load failed")); };
    img.src = objectUrl;
  });
}

export async function uploadPhoto(file, chapterId) {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase ekki tiltækt");
  if (!S.user) throw new Error("Notandi ekki innskráður");
  const blob = await resizePhotoForUpload(file);
  const path = `${S.user.id}/${chapterId}/${Date.now()}-${file.name}`;
  const { error } = await sb.storage
    .from("story-photos")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  const { data: { publicUrl } } = sb.storage.from("story-photos").getPublicUrl(path);
  return { url: publicUrl, path, name: file.name };
}

export async function deletePhoto(path) {
  if (!path) return;
  const sb = getSupabase();
  if (!sb) return;
  try { await sb.storage.from("story-photos").remove([path]); }
  catch (e) { console.warn("deletePhoto villa:", e); }
}
