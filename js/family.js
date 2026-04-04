// ══════════════════════════════════════════════
//  FAMILY TYPE — setup and context for Gemini
// ══════════════════════════════════════════════
import { S } from './state.js';
import { saveStateToSupabase } from './supabase-client.js';

const FAMILY_CONTEXT = {
  "mamma-pabbi": {
    is: "Foreldrar barnsins eru mamma og pabbi. Notaðu „mamma" og „pabbi" sem foreldraheitin í frásögninni.",
    en: "The child has a mum and a dad. Use 'mum' and 'dad' as parent terms throughout."
  },
  "tvaer-maedur": {
    is: "Barnið á tvær mæður. Notaðu „mamma" um báðar, eða greindu þær á milli með nöfnum ef þau koma fram í svörunum. Ekki gera ráð fyrir föður.",
    en: "The child has two mothers. Use 'mum' or 'mama' for both, differentiating by name if mentioned. Do not assume a father figure."
  },
  "tveir-fedur": {
    is: "Barnið á tvo feður. Notaðu „pabbi" um báða, eða greindu þá á milli með nöfnum ef þau koma fram í svörunum. Ekki gera ráð fyrir móður.",
    en: "The child has two fathers. Use 'dad' or 'papa' for both, differentiating by name if mentioned. Do not assume a mother figure."
  },
  "einstaed-mamma": {
    is: "Barnið er hjá einstæðri mömmu. Notaðu „mamma" og forðastu að gera ráð fyrir föður.",
    en: "The child has a single mother. Use 'mum' and do not reference or assume a father figure."
  },
  "einstaedur-pabbi": {
    is: "Barnið er hjá einstæðum pabba. Notaðu „pabbi" og forðastu að gera ráð fyrir móður.",
    en: "The child has a single father. Use 'dad' and do not reference or assume a mother figure."
  }
};

export function getFamilyContext(lang) {
  const ft = S.chapters.familyType;
  if (!ft || !FAMILY_CONTEXT[ft]) return "";
  const ctx = FAMILY_CONTEXT[ft][lang === "en" ? "en" : "is"];
  return lang === "en"
    ? `\n\nFAMILY STRUCTURE: ${ctx}`
    : `\n\nFJÖLSKYLDUGERÐ: ${ctx}`;
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
  await saveStateToSupabase();
  const { showMap } = await import('./modals.js');
  showMap();
}

window.setFamilyType = setFamilyType;
window.showFamilySetup = showFamilySetup;
