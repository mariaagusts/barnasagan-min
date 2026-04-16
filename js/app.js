// ══════════════════════════════════════════════
//  APP — entry point, imports all modules
// ══════════════════════════════════════════════
import { S } from './state.js';
import { setLang, applyLang } from './i18n.js';
import './chapters.js';
import { getSupabase, initState, redeemGiftCode } from './supabase-client.js';
import { onSignedIn } from './auth.js';
import './map.js';
import './family.js';
import './speech.js';
import './gemini.js';
import './interview.js';
import './story.js';
import './versions.js';
import './export.js';
import './children.js';
import './gullmoli.js';
import './heights.js';
import './admin.js';
import { showScreen } from './modals.js';
import './modals.js';

export async function initApp() {
  setLang(S.lang);
  if (new URLSearchParams(window.location.search).has('landing')) {
    showScreen("landing"); return;
  }
  const sb = getSupabase();
  if (!sb) { showScreen("landing"); return; }
  const { data: { session } } = await sb.auth.getSession();
  if (session) { S.user = session.user; onSignedIn(); }
  else { showScreen("landing"); }
  sb.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      S.user = session.user;
      import('./auth.js').then(m => m.showPasswordResetForm());
    }
    else if (event === "SIGNED_IN" && session && !S.user) {
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

window.toggleGiftCodeBox = function() {
  const box = document.getElementById("hero-gift-box");
  if (!box) return;
  const open = box.style.display === "block";
  box.style.display = open ? "none" : "block";
  if (!open) document.getElementById("hero-gift-input")?.focus();
};

window.submitHeroGiftCode = async function() {
  const input = document.getElementById("hero-gift-input");
  const msg = document.getElementById("hero-gift-msg");
  const code = input?.value.trim().toUpperCase();
  if (!code) return;
  const lang = S.lang || 'is';

  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    // Save code and send to auth — will be redeemed after sign in
    sessionStorage.setItem('pendingGiftCode', code);
    msg.style.color = '#2e7d32';
    msg.textContent = lang === 'en' ? 'Great! Now sign in or create an account to redeem your code.' : 'Frábært! Skráðu þig inn eða stofnaðu aðgang til að innleysa kóðann.';
    setTimeout(() => showScreen('auth'), 1500);
    return;
  }

  msg.style.color = '#888';
  msg.textContent = lang === 'en' ? 'Checking...' : 'Athuga...';
  try {
    const result = await redeemGiftCode(code);
    if (result.success) {
      msg.style.color = '#2e7d32';
      msg.textContent = lang === 'en' ? 'Code redeemed! You now have full access.' : 'Gjafakóðinn er innleystur! Þú hefur nú fullan aðgang.';
      setTimeout(() => { import('./supabase-client.js').then(m => m.loadPaidStatus()).then(() => showScreen('map')); }, 1500);
    } else {
      msg.style.color = '#c62828';
      msg.textContent = lang === 'en' ? 'Invalid or already used code.' : 'Kóðinn er ekki gildur eða hefur þegar verið notaður.';
    }
  } catch(e) {
    msg.style.color = '#c62828';
    msg.textContent = lang === 'en' ? 'Something went wrong.' : 'Eitthvað fór úrskeiðis.';
  }
};

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
