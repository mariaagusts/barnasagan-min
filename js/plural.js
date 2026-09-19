// ══════════════════════════════════════════════
//  PLURAL — eintala eða fleirtala eftir tölu
// ══════════════════════════════════════════════
// Íslenska: tala sem endar á 1, nema 11 (og 111, 211 ...), tekur eintölu.
//   1 svar, 21 svar, 101 svar / 2 svör, 11 svör, 111 svör.
// Enska: aðeins 1 tekur eintölu.

export function isSingular(n, lang = "is") {
  const v = Math.abs(Number(n) || 0);
  if (lang === "en") return v === 1;
  return v % 10 === 1 && v % 100 !== 11;
}

// plural(21, "minning komin á blað", "minningar komnar á blað") -> "minning komin á blað"
export function plural(n, singular, pluralForm, lang = "is") {
  return isSingular(n, lang) ? singular : pluralForm;
}
