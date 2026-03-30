// ══════════════════════════════════════════════
//  STATE — single mutable state object, no imports
// ══════════════════════════════════════════════
export const S = {
  lang: localStorage.getItem("barnasagan_lang") || "is",
  chapters: { chapters: [], bookAuthor: "" },
  user: null,
  chapterId: 0,
  storyText: "",
  uploadedPhotos: [],
  isListening: false,
  recognition: null,
  styleKey: "natural",
  isPaid: false,
  sbClient: null,
  authMode: "login",
  adminMode: false,
  currentVersionIndex: -1,
  geminiKeyIdx: 0,
  _faqReturnScreen: "landing",
  _privacyReturnScreen: "landing",
  _aboutReturnScreen: "landing",
};

// Expose S on window so inline HTML oninput handlers can access uploadedPhotos etc.
window._S = S;
