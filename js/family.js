// ══════════════════════════════════════════════
//  FAMILY TYPE — setup and context for Gemini
// ══════════════════════════════════════════════
import { S } from './state.js';
import { saveState } from './supabase-client.js';

const FAMILY_CONTEXT = {
  "mamma-pabbi": {
    is: `Foreldrar barnsins eru mamma og pabbi. Notaðu 'mamma' og 'pabbi' sem foreldraheitin i frásögninni.`,
    en: `The child has a mum and a dad. Use 'mum' and 'dad' as parent terms throughout.`
  },
  "tvaer-maedur": {
    is: `Barnid á tvær maedur. Notadu 'mamma' um bádar, eda greindu þaer á milli med nöfnum ef þau koma fram i svörunum. Ekki gera rád fyrir fødur.`,
    en: `The child has two mothers. Use 'mum' or 'mama' for both, differentiating by name if mentioned. Do not assume a father figure.`
  },
  "tveir-fedur": {
    is: `Barnid á tvo fedur. Notadu 'pabbi' um báda, eda greindu þá á milli med nöfnum ef þau koma fram i svörunum. Ekki gera rád fyrir módur.`,
    en: `The child has two fathers. Use 'dad' or 'papa' for both, differentiating by name if mentioned. Do not assume a mother figure.`
  },
  "einstaed-mamma": {
    is: `Barnid er hjá einstáedri mömmu. Notadu 'mamma' og fordastu ad gera rád fyrir fødur.`,
    en: `The child has a single mother. Use 'mum' and do not reference or assume a father figure.`
  },
  "einstaedur-pabbi": {
    is: `Barnid er hjá einstaedum pabba. Notadu 'pabbi' og fordastu ad gera rád fyrir módur.`,
    en: `The child has a single father. Use 'dad' and do not reference or assume a mother figure.`
  }
};

export function getFamilyContext(lang) {
  const ft = S.chapters.familyType;
  if (!ft || !FAMILY_CONTEXT[ft]) return "";
  const ctx = FAMILY_CONTEXT[ft][lang === "en" ? "en" : "is"];
  return lang === "en"
    ? `\n\nFAMILY STRUCTURE: ${ctx}`
    : `\n\nFJOLSKYLDUGERD: ${ctx}`;
}

export function showFamilySetup() {
  document.getElementById("family-setup-overlay").style.display = "flex";
}

export function closeFamilySetup() {
  document.getElementById("family-setup-overlay").style.display = "none";
}

export async function setFamilyType(type) {
  S.chapters.familyType = type;
  closeFamilySetup();
  await saveState();
  const { showMap } = await import('./modals.js');
  showMap();
}

window.setFamilyType = setFamilyType;
window.showFamilySetup = showFamilySetup;
