// ══════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════
import { S } from './state.js';
import { t } from './i18n.js';
import { getSupabase, loadStateFromSupabase, loadPaidStatus, loadChildren, createFirstChild } from './supabase-client.js';
import { loadGullmolar, updateGullmolaFab } from './gullmoli.js';

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

function authErrorMsg(msg) {
  if (!msg) return "Eitthvað fór úrskeiðis. Prófaðu aftur.";
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
    return "Rangt netfang eða lykilorð. Prófaðu aftur.";
  if (m.includes("email not confirmed"))
    return "Netfangið þitt hefur ekki verið staðfest. Athugaðu pósthólfið þitt.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Þetta netfang er þegar skráð. Reyndu að skrá þig inn í staðinn.";
  if (m.includes("password should be at least") || m.includes("password is too short"))
    return "Lykilorðið þarf að vera að minnsta kosti 6 stafir.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Netfangið lítur ekki rétt út. Athugaðu að það sé rétt skrifað.";
  if (m.includes("rate limit") || m.includes("too many requests"))
    return "Of margar tilraunir. Bíddu aðeins og prófaðu aftur.";
  return "Eitthvað fór úrskeiðis. Prófaðu aftur.";
}

export async function handleAuth() {
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const btn = document.getElementById("auth-btn");
  const sb = getSupabase();
  if (!sb) return;

  if (!email || !password) { showAuthError("Netfang og lykilorð verða að vera fyllt út."); return; }
  btn.disabled = true;
  btn.textContent = "Bíð...";

  if (S.authMode === "login") {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { showAuthError(authErrorMsg(error.message)); }
    else { S.user = data.user; onSignedIn(); }
  } else {
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) { showAuthError(authErrorMsg(error.message)); }
    else { showAuthSuccess("✓ Staðfestingarpóstur sendur! Athugaðu pósthólfið þitt."); }
  }

  btn.disabled = false;
  btn.textContent = S.authMode === "login" ? "Innskrá →" : "Nýskrá →";
}

export async function onSignedIn() {
  document.getElementById("map-user-email").textContent = S.user.email;
  await Promise.all([loadChildren(), loadPaidStatus()]);
  const { updateNav } = await import('./app.js');
  updateNav();

  if (S.children.length === 0) {
    // Brand new user — create first child slot, then show family setup
    await createFirstChild();
    const { showFamilySetup } = await import('./family.js');
    showFamilySetup();
  } else {
    await Promise.all([loadStateFromSupabase(), loadGullmolar()]);
    updateGullmolaFab();
    const { renderChildSwitcher } = await import('./children.js');
    renderChildSwitcher();
    if (!S.chapters.familyType) {
      const { showFamilySetup } = await import('./family.js');
      showFamilySetup();
    } else {
      const { showMap } = await import('./modals.js');
      showMap();
    }
  }
}

export async function forgotPassword() {
  const email = document.getElementById("auth-email").value.trim();
  if (!email) { showAuthError("Sláðu inn netfangið þitt fyrst."); return; }
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: "https://barnasagan.is"
  });
  if (error) { showAuthError(authErrorMsg(error.message)); }
  else { showAuthSuccess("✓ Hlekk til að endurstilla lykilorð hefur verið sendur á " + email); }
}

export async function signOut() {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  S.user = null;
  S.children = [];
  S.activeChildId = null;
  S.plan = "single";
  S.gullmolar = [];
  updateGullmolaFab();
  const { showScreen } = await import('./modals.js');
  showScreen("landing");
  const { updateNav } = await import('./app.js');
  updateNav();
  const switcher = document.getElementById("child-switcher");
  if (switcher) switcher.style.display = "none";
}

window.switchTab = switchTab;
window.handleAuth = handleAuth;
window.forgotPassword = forgotPassword;
window.signOut = signOut;
