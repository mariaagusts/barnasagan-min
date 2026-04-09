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
    chapters: CHAPTERS.map(ch => {
      const coreSeeds = ch.seeds.filter(s => s.isCore);
      const firstQ = coreSeeds[0]?.text ?? ch.seeds[0]?.text ?? "";
      return {
        id: ch.id,
        questions: firstQ ? [firstQ] : [],
        answers: [],
        coreTexts: coreSeeds.map(s => s.text),
        coreAnswered: 0,
        awaitingFollowUp: false,
        complete: false,
        photos: []
      };
    })
  };
}

function migrateChapterState(cs, chDef) {
  if (cs.coreTexts !== undefined) return;
  const coreSeeds = chDef.seeds.filter(s => s.isCore);
  cs.coreTexts = coreSeeds.map(s => s.text);
  cs.coreAnswered = 0;
  cs.fuIdx = cs.fuIdx ?? 0;
  for (let i = 0; i < Math.min(cs.questions.length, cs.answers.length); i++) {
    if (cs.coreTexts.includes(cs.questions[i])) cs.coreAnswered++;
  }
}

function applyMigrations(state) {
  if (!state?.chapters) return;
  state.chapters.forEach(cs => {
    const chDef = CHAPTERS.find(c => c.id === cs.id);
    if (chDef) migrateChapterState(cs, chDef);
  });
}

export function initState() {
  const saved = localStorage.getItem("barnasaga_state");
  if (saved) {
    try {
      S.chapters = JSON.parse(saved);
      applyMigrations(S.chapters);
    } catch { S.chapters = buildFreshState(); }
  } else {
    S.chapters = buildFreshState();
  }
}

export async function loadChildren() {
  if (!S.user) return;
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data } = await sb.from("children")
      .select("id, child_name, family_type")
      .eq("user_id", S.user.id)
      .order("created_at");
    S.children = data || [];
    if (S.children.length > 0 && !S.activeChildId) {
      S.activeChildId = S.children[0].id;
    }
  } catch (e) {
    console.warn("loadChildren villa:", e);
  }
}

export async function createFirstChild() {
  const sb = getSupabase();
  if (!sb || !S.user) return null;
  try {
    const { data, error } = await sb.from("children")
      .insert({ user_id: S.user.id, child_name: "Barn 1" })
      .select("id, child_name, family_type")
      .single();
    if (error) throw error;
    S.children = [data];
    S.activeChildId = data.id;
    return data;
  } catch (e) {
    console.warn("createFirstChild villa:", e);
    return null;
  }
}

export async function addChild(childName) {
  const sb = getSupabase();
  if (!sb || !S.user) return null;
  const { data, error } = await sb.from("children")
    .insert({ user_id: S.user.id, child_name: childName })
    .select("id, child_name, family_type")
    .single();
  if (error) throw error;
  S.children.push(data);
  return data;
}

export async function renameChild(childId, newName) {
  const sb = getSupabase();
  if (!sb || !S.user) return;
  await sb.from("children")
    .update({ child_name: newName })
    .eq("id", childId)
    .eq("user_id", S.user.id);
  const child = S.children.find(c => c.id === childId);
  if (child) child.child_name = newName;
}

export async function saveState() {
  localStorage.setItem("barnasaga_state", JSON.stringify(S.chapters));
  const ind = document.getElementById("save-indicator");
  if (ind && S.user) { ind.textContent = "💾 Vístar..."; ind.classList.remove("error"); ind.classList.add("visible"); }
  if (S.user && S.activeChildId) {
    try {
      const sb = getSupabase();
      if (sb) {
        await sb.from("user_progress").upsert({
          user_id: S.user.id,
          child_id: S.activeChildId,
          state_json: JSON.stringify(S.chapters),
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id,child_id" });
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
  if (!S.user || !S.activeChildId) return;
  try {
    const sb = getSupabase();
    if (!sb) return;
    const { data, error } = await sb.from("user_progress")
      .select("state_json")
      .eq("user_id", S.user.id)
      .eq("child_id", S.activeChildId)
      .maybeSingle();
    if (data && data.state_json) {
      S.chapters = JSON.parse(data.state_json);
      applyMigrations(S.chapters);
      localStorage.setItem("barnasaga_state", data.state_json);
    } else {
      initState();
    }
  } catch (e) {
    console.warn("Supabase hlaða villa:", e);
    initState();
  }
}

export async function loadPaidStatus() {
  if (!S.user) return;
  try {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.from("paid_users")
      .select("email, plan")
      .eq("email", S.user.email.toLowerCase())
      .maybeSingle();
    const grandfathered = new Date(S.user.created_at) < new Date("2026-03-30");
    S.isPaid = !!data || grandfathered;
    S.plan = data?.plan || "single";
  } catch (e) {
    console.warn("loadPaidStatus villa:", e);
  }
}

export async function redeemGiftCode(code) {
  const sb = getSupabase();
  if (!sb) return { success: false, error: "no_client" };
  const { data, error } = await sb.functions.invoke('redeem-gift-code', { body: { code } });
  if (error || !data?.success) return { success: false };
  return { success: true };
}

export function getChapterState(id) {
  return S.chapters.chapters.find(c => c.id === id)
    ?? { id, questions: [], answers: [], coreTexts: [], coreAnswered: 0, awaitingFollowUp: false, complete: false, photos: [] };
}
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
  const childSegment = S.activeChildId ? `${S.activeChildId}/` : "";
  const path = `${S.user.id}/${childSegment}${chapterId}/${Date.now()}-${file.name}`;
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
