// ══════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════
import { S } from './state.js';
import { t } from './i18n.js';
import { getSupabase } from './supabase-client.js';
import { loadStateFromSupabase } from './supabase-client.js';

export function switchTab(mode) {
  S.authMode = mode;
  document.querySelectorAll(".auth-tab").forEach((tab, i) => {
    tab.classList.toggle("active", (i === 0 && mode === "login") || (i === 1 && mode === "signup"));
  });
  document.getElementById("auth-btn").textContent = mode === "login" ? t("loginBtn") : t("signupBtn");
  document.getElementById("auth-note").textContent = mode === "login" ? t("loginNote") : t("signupNote");
  hideAuthMessages();
}

export function showAuthError(msg) {
  const el = document.getElementById("auth-error");
  el.textContent = msg; el.classList.add("visible");
  document.getElementById("auth-success").classList.remove("visible");
}

export function showAuthSuccess(msg) {
  const el = document.getElementById("auth-success");
  el.textContent = msg; el.classList.add("visible");
  document.getElementById("auth-error").classList.remove("visible");
}

export function hideAuthMessages() {
  document.getElementById("auth-error").classList.remove("visible");
  document.getElementById("auth-success").classList.remove("visible");
}

export async function handleAuth() {
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const btn = document.getElementById("auth-btn");
  const sb = getSupabase();
  if (!sb) return;

  if (!email || !password) { showAuthError("Vinsamlegast fylltu út alla reiti."); return; }
  btn.disabled = true;
  btn.textContent = "Bíð...";

  if (S.authMode === "login") {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { showAuthError("Innskráning mistókst: " + error.message); }
    else { S.user = data.user; onSignedIn(); }
  } else {
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) { showAuthError("Nýskráning mistókst: " + error.message); }
    else { showAuthSuccess("✓ Staðfestingarpóstur sendur! Athugaðu pósthólfið þitt."); }
  }

  btn.disabled = false;
  btn.textContent = S.authMode === "login" ? "Innskrá →" : "Nýskrá →";
}

export async function onSignedIn() {
  document.getElementById("map-user-email").textContent = S.user.email;
  await loadStateFromSupabase();
  // Import showMap lazily to avoid circular dependency
  const { showMap } = await import('./modals.js');
  showMap();
  const { updateNav } = await import('./app.js');
  updateNav();
}

export async function forgotPassword() {
  const email = document.getElementById("auth-email").value.trim();
  if (!email) { showAuthError("Sláðu inn netfangið þitt fyrst."); return; }
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: "https://saganmin.is"
  });
  if (error) { showAuthError(error.message); }
  else { showAuthSuccess("✓ Hlekk til að endurstilla lykilorð hefur verið sendur á " + email); }
}

export async function signOut() {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  S.user = null;
  const { showScreen } = await import('./modals.js');
  showScreen("landing");
  const { updateNav } = await import('./app.js');
  updateNav();
}

window.switchTab = switchTab;
window.handleAuth = handleAuth;
window.forgotPassword = forgotPassword;
window.signOut = signOut;
