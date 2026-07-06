// ══════════════════════════════════════════════
//  ADMIN
//  Passwords are verified server-side via the
//  admin-auth edge function (see supabase/functions/admin-auth).
// ══════════════════════════════════════════════
import { S } from './state.js';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const ADMIN_AUTH_URL = `${SUPABASE_URL}/functions/v1/admin-auth`;

async function verifyPassword(password, kind) {
  try {
    const res = await fetch(ADMIN_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "apikey": SUPABASE_KEY,
      },
      body: JSON.stringify({ password, kind }),
    });
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

export function openAdminLogin() {
  document.getElementById("admin-overlay").style.display = "flex";
  setTimeout(() => document.getElementById("admin-pw-input").focus(), 60);
}

export function closeAdminLogin() {
  document.getElementById("admin-overlay").style.display = "none";
  document.getElementById("admin-pw-input").value = "";
  document.getElementById("admin-pw-error").classList.remove("visible");
}

export async function checkAdminLogin() {
  const val = document.getElementById("admin-pw-input").value;
  const ok = await verifyPassword(val, "admin");
  if (ok) {
    S.adminMode = true;
    localStorage.setItem("saganmin_admin", "true");
    closeAdminLogin();
    const adminBarEl = document.getElementById("admin-bar");
    if (adminBarEl) adminBarEl.style.display = "flex";
    const { initApp } = await import('./app.js');
    initApp();
  } else {
    const err = document.getElementById("admin-pw-error");
    err.classList.add("visible");
    document.getElementById("admin-pw-input").value = "";
    document.getElementById("admin-pw-input").focus();
    setTimeout(() => err.classList.remove("visible"), 2500);
  }
  const { updateNav } = await import('./app.js');
  updateNav();
}

export function exitAdminMode() {
  S.adminMode = false;
  localStorage.removeItem("saganmin_admin");
  document.getElementById("admin-bar").style.display = "none";
  location.reload();
}

export function toggleCsPw() {
  const box = document.getElementById("cs-pw-box");
  box.classList.toggle("visible");
  if (box.classList.contains("visible"))
    document.getElementById("cs-pw-input").focus();
}

export async function checkCsPw() {
  const val = document.getElementById("cs-pw-input").value;
  const ok = await verifyPassword(val, "cs");
  if (ok) {
    localStorage.setItem("saganmin_preview", "true");
    document.getElementById("cs-pw-input").value = "";
    document.getElementById("cs-pw-box").classList.remove("visible");
    const { initApp } = await import('./app.js');
    initApp();
  } else {
    const err = document.getElementById("cs-pw-error");
    err.classList.add("visible");
    document.getElementById("cs-pw-input").value = "";
    setTimeout(() => err.classList.remove("visible"), 2500);
  }
}

window.openAdminLogin = openAdminLogin;
window.closeAdminLogin = closeAdminLogin;
window.checkAdminLogin = checkAdminLogin;
window.exitAdminMode = exitAdminMode;
window.toggleCsPw = toggleCsPw;
window.checkCsPw = checkCsPw;
