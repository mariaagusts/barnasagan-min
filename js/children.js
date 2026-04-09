// ══════════════════════════════════════════════
//  CHILDREN — child switcher UI and management
// ══════════════════════════════════════════════
import { S } from './state.js';
import { loadStateFromSupabase, buildFreshState, addChild, renameChild } from './supabase-client.js';
import { loadGullmolar, updateGullmolaMapTile } from './gullmoli.js';
import { loadHeights, updateHeightsMapTile } from './heights.js';

export function renderChildSwitcher() {
  const switcher = document.getElementById("child-switcher");
  if (!switcher) return;

  if (!S.user) { switcher.style.display = "none"; return; }
  switcher.style.display = "flex";

  const activeChild = S.children.find(c => c.id === S.activeChildId);
  const nameEl = document.getElementById("child-switcher-name");
  if (nameEl) nameEl.textContent = activeChild?.child_name || "Barn 1";

  _renderChildList();
  _renderInnerMenuChildSection();
}

function _renderChildList() {
  const list = document.getElementById("child-switcher-list");
  if (!list) return;
  list.innerHTML = S.children.map(child => `
    <div class="child-item${child.id === S.activeChildId ? " active" : ""}">
      <span class="child-item-name" onclick="switchToChild('${child.id}')">${_esc(child.child_name)}</span>
      <button class="child-rename-btn" onclick="renameChildPrompt('${child.id}', '${_esc(child.child_name)}')">✏️</button>
    </div>`).join("");
}

function _renderInnerMenuChildSection() {
  const section = document.getElementById("inner-menu-child-section");
  if (!section) return;
  if (S.children.length === 0) { section.style.display = "none"; return; }
  section.style.display = "block";
  const list = document.getElementById("inner-menu-child-list");
  if (list) {
    list.innerHTML = S.children.map(child => `
      <button onclick="switchToChild('${child.id}');closeInnerMenu();" style="${child.id === S.activeChildId ? 'font-weight:700;color:var(--orange);' : ''}">${_esc(child.child_name)}</button>`
    ).join("");
  }
  const addBtn = document.getElementById("inner-menu-add-child");
  if (addBtn) {
    addBtn.style.display = "block";
    addBtn.textContent = S.plan === "multi"
      ? (S.lang === "en" ? "+ Add child" : "+ Bæta við barni")
      : (S.lang === "en" ? "🔒 Add child (upgrade)" : "🔒 Bæta við barni (uppfæra)");
  }
}

export async function switchToChild(childId) {
  if (childId === S.activeChildId) { closeChildSwitcher(); return; }
  S.activeChildId = childId;
  S.chapters = buildFreshState();
  localStorage.removeItem("barnasaga_state");
  await Promise.all([loadStateFromSupabase(), loadGullmolar(), loadHeights()]);
  renderChildSwitcher();
  closeChildSwitcher();
  const { renderMap } = await import('./map.js');
  renderMap();
  updateGullmolaMapTile();
  updateHeightsMapTile();
  const { showMap } = await import('./modals.js');
  showMap();
}

export function toggleChildSwitcher() {
  document.getElementById("child-switcher-dropdown")?.classList.toggle("open");
}

export function closeChildSwitcher() {
  document.getElementById("child-switcher-dropdown")?.classList.remove("open");
}

export async function handleAddChild() {
  closeChildSwitcher();
  if (S.plan !== "multi") {
    const msg = S.lang === "en"
      ? "To add multiple children you need the Family plan (€80 one-time).\n\nGo to pricing page?"
      : "Til að bæta við fleiri börnum þarftu Fjölskyldupakkann (€80 ein greiðsla).\n\nFara á verðskrásíðuna?";
    if (confirm(msg)) window.location.href = "/pricing.html";
    return;
  }

  const defaultName = S.lang === "en" ? `Child ${S.children.length + 1}` : `Barn ${S.children.length + 1}`;
  const name = prompt(
    S.lang === "en" ? "Child's name (you can change this later):" : "Nafn barns (þú getur breytt þessu seinna):",
    defaultName
  );
  if (!name || !name.trim()) return;

  try {
    const newChild = await addChild(name.trim());
    S.activeChildId = newChild.id;
    S.chapters = buildFreshState();
    renderChildSwitcher();
    const { showFamilySetup } = await import('./family.js');
    showFamilySetup();
  } catch (e) {
    console.error("handleAddChild villa:", e);
  }
}

export async function renameChildPrompt(childId, currentName) {
  const newName = prompt(S.lang === "en" ? "New name:" : "Nýtt nafn:", currentName);
  if (!newName || !newName.trim() || newName.trim() === currentName) return;
  await renameChild(childId, newName.trim());
  renderChildSwitcher();
}

function _esc(str) {
  return String(str).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  const sw = document.getElementById("child-switcher");
  if (sw && !sw.contains(e.target)) closeChildSwitcher();
});

window.switchToChild = switchToChild;
window.toggleChildSwitcher = toggleChildSwitcher;
window.closeChildSwitcher = closeChildSwitcher;
window.handleAddChild = handleAddChild;
window.renameChildPrompt = renameChildPrompt;
