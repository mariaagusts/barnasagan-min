// ══════════════════════════════════════════════
//  MODALS / SCREENS
// ══════════════════════════════════════════════
import { S } from './state.js';
import { switchTab } from './auth.js';

export function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("screen-" + name).classList.add("active");
  const nav = document.querySelector(".landing-nav");
  const innerScreens = ["map", "interview", "story", "coming-soon", "faq", "privacy", "about"];
  if (nav) nav.style.display = innerScreens.includes(name) ? "none" : "flex";
  const infoBtn = document.getElementById("floating-info-btn");
  const innerUserScreens = ["map", "interview", "story"];
  if (infoBtn) infoBtn.style.display = innerUserScreens.includes(name) ? "flex" : "none";
  const warningBtn = document.getElementById("floating-warning-btn");
  if (warningBtn) warningBtn.style.display = innerUserScreens.includes(name) ? "flex" : "none";
  const fab = document.getElementById("gullmola-fab");
  if (fab) fab.style.display = (innerUserScreens.includes(name) && fab.dataset.loggedIn === "1") ? "flex" : "none";
  if (name === "auth") switchTab("login");
}

export function showFaq() {
  const active = document.querySelector(".screen.active");
  window._faqReturnScreen = S._faqReturnScreen = active ? active.id.replace("screen-", "") : "landing";
  showScreen("faq");
}

export function showPrivacy() {
  const active = document.querySelector(".screen.active");
  window._privacyReturnScreen = S._privacyReturnScreen = active ? active.id.replace("screen-", "") : "landing";
  showScreen("privacy");
}

export function showAbout() {
  const active = document.querySelector(".screen.active");
  window._aboutReturnScreen = S._aboutReturnScreen = active ? active.id.replace("screen-", "") : "landing";
  showScreen("about");
}

export function showMap() {
  import('./map.js').then(m => m.renderMap());
  showScreen("map");
}

export function showFaqQuestion(topic) {
  showScreen('faq');
  setTimeout(() => {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const q = item.querySelector('.faq-q');
      if (q && (q.textContent.toLowerCase().includes('villur') || q.textContent.toLowerCase().includes('error'))) {
        item.open = true;
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }, 300);
}

export function resetConfirm() {
  import('./i18n.js').then(({ t }) => {
    const overlay = document.getElementById("reset-modal-overlay");
    const input = document.getElementById("reset-confirm-input");
    const btn = document.getElementById("reset-confirm-btn");
    const title = document.getElementById("reset-modal-title");
    const body = document.getElementById("reset-modal-body");
    if (title) title.textContent = t("resetModalTitle");
    if (body) body.innerHTML = t("resetModalBody");
    if (input) input.placeholder = t("resetModalPlaceholder");
    if (btn) btn.textContent = t("resetModalBtn");
    if (input) input.value = "";
    if (btn) { btn.disabled = true; btn.style.opacity = "0.4"; btn.style.pointerEvents = "none"; }
    if (overlay) overlay.style.display = "flex";
    if (input) setTimeout(() => input.focus(), 50);
  });
}

export function closeResetModal() {
  const overlay = document.getElementById("reset-modal-overlay");
  if (overlay) overlay.style.display = "none";
}

export function checkResetInput() {
  import('./i18n.js').then(({ t }) => {
    const input = document.getElementById("reset-confirm-input");
    const btn = document.getElementById("reset-confirm-btn");
    const word = t("resetConfirmWord");
    const match = input && input.value.trim().toUpperCase() === word.toUpperCase();
    if (btn) {
      btn.disabled = !match;
      btn.style.opacity = match ? "1" : "0.4";
      btn.style.pointerEvents = match ? "auto" : "none";
    }
  });
}

export function executeReset() {
  closeResetModal();
  import('./supabase-client.js').then(({ buildFreshState, saveState }) => {
    localStorage.removeItem("barnasaga_state");
    S.chapters = buildFreshState();
    saveState();
    import('./map.js').then(m => m.renderMap());
  });
}

export function toggleFaqAll() {
  const items = document.querySelectorAll("#faq-list details.faq-item");
  const anyOpen = Array.from(items).some(d => d.open);
  items.forEach(d => { d.open = !anyOpen; });
  const btn = document.getElementById("faq-toggle-all-btn");
  if (btn) {
    const isSpan = btn.querySelector(".lang-is");
    const enSpan = btn.querySelector(".lang-en");
    if (isSpan) isSpan.textContent = anyOpen ? "Opna allt" : "Loka allt";
    if (enSpan) enSpan.textContent = anyOpen ? "Expand all" : "Collapse all";
  }
}

window.toggleFaqAll = toggleFaqAll;
window.showScreen = showScreen;
window.showFaq = showFaq;
window.showPrivacy = showPrivacy;
window.showAbout = showAbout;
window.showMap = showMap;
window.showFaqQuestion = showFaqQuestion;
window.resetConfirm = resetConfirm;
window.closeResetModal = closeResetModal;
window.checkResetInput = checkResetInput;
window.executeReset = executeReset;
