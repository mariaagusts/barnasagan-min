// ══════════════════════════════════════════════
//  APP — entry point, imports all modules
// ══════════════════════════════════════════════
import { S } from './state.js';
import { setLang, applyLang } from './i18n.js';
import './chapters.js';
import { getSupabase, initState } from './supabase-client.js';
import { onSignedIn } from './auth.js';
import './map.js';
import './family.js';
import './speech.js';
import './gemini.js';
import './interview.js';
import './story.js';
import './versions.js';
import './export.js';
import './admin.js';
import { showScreen } from './modals.js';
import './modals.js';

export async function initApp() {
  setLang(S.lang);
  const sb = getSupabase();
  if (!sb) { showScreen("landing"); return; }
  const { data: { session } } = await sb.auth.getSession();
  if (session) { S.user = session.user; onSignedIn(); }
  else { showScreen("landing"); }
  sb.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session && !S.user) {
      S.user = session.user;
      onSignedIn();
    }
    else if (event === "SIGNED_OUT") { S.user = null; showScreen("landing"); }
  });
  updateNav();
}

export function updateNav() {
  const loginBtn = document.getElementById('nav-login-btn');
  const ctaBtn = document.getElementById('nav-cta-btn');
  if (!loginBtn || !ctaBtn) return;
  if (S.user) {
    loginBtn.textContent = S.lang === 'en' ? 'My Story' : 'Mín síða';
    loginBtn.onclick = () => window.showMap();
    ctaBtn.style.display = 'none';
  } else {
    loginBtn.textContent = S.lang === 'en' ? 'Sign in' : 'Innskrá';
    loginBtn.onclick = () => showScreen('auth');
    ctaBtn.style.display = '';
  }
}

export function toggleDark() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('dark-toggle-btn').textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// Dark mode initialization
const savedTheme = localStorage.getItem('theme');
if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
if (savedTheme === 'dark') document.getElementById('dark-toggle-btn').textContent = '☀️';

// Keyboard shortcut: Ctrl + Shift + A
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === "A") {
    e.preventDefault();
    if (S.adminMode) { window.exitAdminMode(); } else { window.openAdminLogin(); }
  }
});

// IIFE init entry point
(async function init() {
  if (localStorage.getItem("saganmin_admin") === "true") {
    S.adminMode = true;
    document.getElementById("admin-bar").style.display = "flex";
  }
  initApp();
})();

window.toggleDark = toggleDark;
window.updateNav = updateNav;

window.toggleHamburger = function() {
  document.getElementById("nav-mobile-menu").classList.toggle("open");
};
window.closeHamburger = function() {
  document.getElementById("nav-mobile-menu").classList.remove("open");
};
window.toggleInnerMenu = function() {
  document.getElementById("nav-inner-menu").classList.toggle("open");
};
window.closeInnerMenu = function() {
  document.getElementById("nav-inner-menu").classList.remove("open");
};
window.showDemoTab = function(tab, btn) {
  document.querySelectorAll('.demo-panel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.demo-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('demo-panel-' + tab).style.display = 'block';
  btn.classList.add('active');
};
