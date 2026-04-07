// ══════════════════════════════════════════════
//  STORY VERSIONS
// ══════════════════════════════════════════════
import { S } from './state.js';
import { MAX_VERSIONS } from './config.js';
import { renderMarkdown, injectStoryPhotos } from './story.js';
import { showScreen } from './modals.js';

export const STYLE_LABELS = {
  hlylegt:      { is: "💛 Persónulegt",   en: "💛 Warm"         },
  gamansamur:   { is: "😄 Gamansamur",    en: "😄 Playful"      },
  barnid_segir: { is: "🧒 Barnið segir",  en: "🧒 Child's Voice" },
  aventurulegur:{ is: "🦄 Ævintýralegur", en: "🦄 Adventurous"  },
  hnitmiðaður:  { is: "📄 Hnitmiðaður",   en: "📄 Focused"      }
};

export function getSavedVersions() {
  try {
    return JSON.parse(localStorage.getItem("saganmin_versions") || "[]");
  } catch { return []; }
}

export function saveStoryVersion(styleKey, lang) {
  if (!S.storyText) return;
  const versions = getSavedVersions();
  const label = STYLE_LABELS[styleKey]
    ? STYLE_LABELS[styleKey][lang] || styleKey
    : styleKey;
  const newVersion = {
    id: Date.now(),
    styleKey,
    label,
    lang,
    text: S.storyText,
    date: new Date().toISOString()
  };
  versions.unshift(newVersion);
  if (versions.length > MAX_VERSIONS) versions.pop();
  localStorage.setItem("saganmin_versions", JSON.stringify(versions));
  S.currentVersionIndex = 0;
  renderVersionsSidebar();
}

export function renderVersionsSidebar() {
  const versions = getSavedVersions();
  const list = document.getElementById("versions-list");
  if (!list) return;

  if (versions.length === 0) {
    list.innerHTML = `<div class="versions-empty">
      Engar vistaðar útgáfur enn.<br><br>
      Þegar þú smellir á „Forskoða bókina þína" vistar kerfið útgáfuna sjálfkrafa hér.
    </div>`;
    return;
  }

  list.innerHTML = versions.map((v, i) => {
    const d = new Date(v.date);
    const dateStr = d.toLocaleDateString("is-IS", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });
    const isActive = i === S.currentVersionIndex;
    return `
      <div class="version-item ${isActive ? 'active' : ''}">
        <div class="version-item-style">${v.label} <button class="version-rename-btn" onclick="renameVersion(${v.id})" title="Breyta nafni">✏️</button></div>
        <div class="version-item-date">${dateStr}</div>
        <div class="version-item-actions">
          <button class="version-load-btn" onclick="loadVersion(${i})">
            ${isActive ? '✓ Sýnd núna' : 'Hlaða inn'}
          </button>
          <button class="version-delete-btn" onclick="deleteVersion(${v.id})">Eyða</button>
        </div>
      </div>`;
  }).join("");
}

export function loadVersion(index) {
  const versions = getSavedVersions();
  if (!versions[index]) return;
  S.storyText = versions[index].text;
  S.currentVersionIndex = index;
  document.getElementById("story-body").innerHTML = renderMarkdown(S.storyText);
  injectStoryPhotos();
  document.getElementById("story-loading").style.display = "none";
  document.getElementById("story-card").style.display = "block";
  document.getElementById("btn-edit-story").style.display = "inline-block";
  document.getElementById("btn-text-warning").style.display = "inline-flex";
  document.getElementById("floating-warning-btn").style.display = "flex";
  renderVersionsSidebar();
  toggleVersionsSidebar(false); // Lokar sidebar
  showScreen("story");
}

export function renameVersion(id) {
  const versions = getSavedVersions();
  const v = versions.find(x => x.id === id);
  if (!v) return;
  const newName = prompt("Nýtt nafn á útgáfuna:", v.label);
  if (newName && newName.trim()) {
    v.label = newName.trim();
    localStorage.setItem("saganmin_versions", JSON.stringify(versions));
    renderVersionsSidebar();
  }
}

export function deleteVersion(id) {
  const msg = S.lang === "en"
    ? "Delete this version? This cannot be undone."
    : "Eyða þessari útgáfu? Þetta er óafturkræft.";
  if (!confirm(msg)) return;
  let versions = getSavedVersions();
  versions = versions.filter(v => v.id !== id);
  localStorage.setItem("saganmin_versions", JSON.stringify(versions));
  S.currentVersionIndex = 0;
  renderVersionsSidebar();
}

export function toggleVersionsSidebar(forceOpen) {
  const sidebar = document.getElementById("versions-sidebar");
  if (!sidebar) return;
  if (forceOpen === false) {
    sidebar.classList.remove("open");
  } else {
    sidebar.classList.toggle("open");
    if (sidebar.classList.contains("open")) renderVersionsSidebar();
  }
}

export function updateCurrentVersion() {
  const versions = getSavedVersions();
  if (versions.length === 0) return;

  // Ef engin útgáfa er valin, notum við þá nýjustu
  const idx = S.currentVersionIndex >= 0 ? S.currentVersionIndex : 0;
  if (!versions[idx]) return;

  versions[idx].text = S.storyText;
  S.currentVersionIndex = idx;
  localStorage.setItem("saganmin_versions", JSON.stringify(versions));
  renderVersionsSidebar();
}

export async function toggleEditStory() {
  const body = document.getElementById("story-body");
  const btn = document.getElementById("btn-edit-story");
  const { t } = await import('./i18n.js');
  const isEditing = body.contentEditable === "true";
  if (isEditing) {
    body.contentEditable = "false";
    body.style.outline = "none";
    body.style.background = "";
    btn.textContent = t("editStory");
    btn.style.borderColor = "var(--border)";
    S.storyText = body.innerText;
    updateCurrentVersion();
  } else {
    body.contentEditable = "true";
    body.style.outline = "2px solid var(--gold)";
    body.style.borderRadius = "4px";
    body.style.background = "rgba(196,154,108,0.05)";
    btn.textContent = t("saveStory");
    btn.style.borderColor = "var(--gold)";
    body.focus();
  }
}

window.loadVersion = loadVersion;
window.renameVersion = renameVersion;
window.deleteVersion = deleteVersion;
window.toggleVersionsSidebar = toggleVersionsSidebar;
window.toggleEditStory = toggleEditStory;
