// ══════════════════════════════════════════════
//  DAGSETNING — íslensk dagsetningarsnið
// ══════════════════════════════════════════════
// Vafrar hafa ekki allir íslensk gögn fyrir toLocaleDateString("is-IS")
// (Chrome á Windows sýnir þá enska mánuði), svo við skrifum sniðin sjálf.

const MONTHS_LONG = ["janúar", "febrúar", "mars", "apríl", "maí", "júní", "júlí", "ágúst", "september", "október", "nóvember", "desember"];
const MONTHS_SHORT = ["jan.", "feb.", "mars", "apr.", "maí", "júní", "júlí", "ág.", "sept.", "okt.", "nóv.", "des."];

function toDate(value) {
  // "2026-09-02" (dagsetning án tíma) á að vera sami dagur óháð tímabelti
  const d = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(value + "T00:00:00")
    : new Date(value);
  return isNaN(d) ? null : d;
}

const pad = (n) => String(n).padStart(2, "0");

// "2. september 2026"
export function formatDateLongIs(value) {
  const d = toDate(value);
  return d ? `${d.getDate()}. ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}` : "";
}

// "2. sept. 2026, kl. 19:29"
export function formatDateTimeIs(value) {
  const d = toDate(value);
  return d ? `${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}, kl. ${pad(d.getHours())}:${pad(d.getMinutes())}` : "";
}

// "02.09.2026"
export function formatDateNumIs(value) {
  const d = toDate(value);
  return d ? `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}` : "";
}
