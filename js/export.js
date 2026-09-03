// ══════════════════════════════════════════════
//  EXPORT / PHOTOS
// ══════════════════════════════════════════════
import { S } from './state.js';
import { getChapterState } from './supabase-client.js';
import { generateStory, renderMarkdownWithPhotos } from './story.js';
import { STORY_STYLES, getChapters } from './chapters.js';

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

export function handlePhotoUpload(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      S.uploadedPhotos.push({ dataUrl: e.target.result, caption: '' });
      renderPhotoGrid();
    };
    reader.readAsDataURL(file);
  });
  event.target.value = '';
}

export function renderPhotoGrid() {
  const grid = document.getElementById('photo-grid');
  if (!grid) return;
  const addMore = S.lang === 'en' ? 'Add more' : 'Bæta við';
  const captionPh = S.lang === 'en' ? 'Add a caption...' : 'Lýsing á mynd...';
  const removeLabel = S.lang === 'en' ? 'Remove' : 'Fjarlægja';
  grid.innerHTML = S.uploadedPhotos.map((p, i) => `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(44,26,14,0.06);">
      <img src="${p.dataUrl}" style="width:100%;height:160px;object-fit:cover;display:block;">
      <div style="padding:10px;">
        <input type="text" value="${esc(p.caption)}" placeholder="${captionPh}"
          oninput="window._S.uploadedPhotos[${i}].caption=this.value"
          style="width:100%;border:none;border-bottom:1px solid var(--border);background:transparent;font-size:12px;font-family:'Lato',sans-serif;color:var(--dark);padding:4px 0;outline:none;">
        <button onclick="removePhoto(${i})" style="margin-top:8px;background:none;border:none;color:var(--mid);font-size:11px;cursor:pointer;font-family:'Lato',sans-serif;letter-spacing:0.06em;text-transform:uppercase;">${removeLabel}</button>
      </div>
    </div>`).join('');
  const btnText = document.getElementById('photo-btn-text');
  if (btnText) btnText.textContent = S.uploadedPhotos.length > 0
    ? (S.lang === 'en' ? `Add more (${S.uploadedPhotos.length} selected)` : `Bæta við (${S.uploadedPhotos.length} myndir valdar)`)
    : (S.lang === 'en' ? 'Choose photos' : 'Velja myndir');
}

export function removePhoto(i) {
  S.uploadedPhotos.splice(i, 1);
  renderPhotoGrid();
}

async function getPhotoDataUrl(photo) {
  if (photo.data) return photo.data;
  if (!photo.url) return null;
  try {
    const res = await fetch(photo.url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) { console.warn("getPhotoDataUrl villa:", e); return null; }
}

function loadImageDims(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

export function resizeImageForPrint(dataUrl, printWidthMM, printHeightMM, dpi = 300) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const pxW = Math.round((printWidthMM / 25.4) * dpi);
      const pxH = Math.round((printHeightMM / 25.4) * dpi);
      const canvas = document.createElement("canvas");
      canvas.width = pxW;
      canvas.height = pxH;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pxW, pxH);
      const scale = Math.max(pxW / img.width, pxH / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      ctx.drawImage(img, (pxW - sw) / 2, (pxH - sh) / 2, sw, sh);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.src = dataUrl;
  });
}

export async function downloadPDF(whiteBg = false) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ── Hlaða inn EB Garamond leturgerð ──
  async function loadFont(url, name, style) {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    doc.addFileToVFS(`${name}-${style}.ttf`, b64);
    doc.addFont(`${name}-${style}.ttf`, name, style);
  }
  let fontName = "times";
  try {
    await loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/eb-garamond@latest/latin-400-normal.ttf",
      "EBGaramond", "normal"
    );
    await loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/eb-garamond@latest/latin-400-italic.ttf",
      "EBGaramond", "italic"
    );
    fontName = "EBGaramond";
  } catch(e) {
    console.warn("Font load failed, using Times:", e);
  }
  doc.setFont(fontName, "normal");

  const W = 210, H = 297, margin = 22;
  const contentW = W - margin * 2;

  // ── Hjálparföll ──────────────────────────────────────
  function addPage() {
    doc.addPage();
    doc.setFillColor(whiteBg ? 255 : 245, whiteBg ? 255 : 236, whiteBg ? 255 : 224);
    doc.rect(0, 0, W, H, "F");
    doc.setDrawColor(196, 154, 108);
    doc.setLineWidth(0.3);
    doc.line(margin, H - 14, W - margin, H - 14);
    doc.setFontSize(9);
    doc.setTextColor(180, 150, 120);
    doc.setFont("EBGaramond", "italic");
    doc.text(String(doc.internal.getNumberOfPages()), W - margin, H - 9, { align: "right" });
  }

  function wrapText(text, x, y, maxW, lineH, maxY) {
    const lines = doc.splitTextToSize(text, maxW);
    for (const line of lines) {
      if (y > maxY) {
        addPage();
        y = margin + 10;
        doc.setFont("EBGaramond", "normal");
        doc.setFontSize(11);
        doc.setTextColor(44, 26, 14);
      }
      doc.text(line, x, y);
      y += lineH;
    }
    return y;
  }

  // ── Forsíða ───────────────────────────────────────────
  doc.setFillColor(whiteBg ? 255 : 245, whiteBg ? 255 : 236, whiteBg ? 255 : 224);
  doc.rect(0, 0, W, H, "F");
  doc.setDrawColor(196, 154, 108);
  doc.setLineWidth(0.8);
  doc.rect(margin - 4, 40, contentW + 8, H - 90, "S");
  doc.setLineWidth(0.3);
  doc.rect(margin - 2, 42, contentW + 4, H - 94, "S");

  const storyFirstLine = (S.storyText || "").split("\n")[0] || "";
  const bookTitle = (S.chapters.bookTitle || "").trim()
    || (storyFirstLine.startsWith("# ") ? storyFirstLine.slice(2).trim() : "")
    || (S.chapters.bookAuthor ? `Sagan um ${S.chapters.bookAuthor}` : "Barnasagan mín");
  doc.setFont(fontName, "normal");
  const titleSize = bookTitle.length > 24 ? 34 : 44;
  doc.setFontSize(titleSize);
  doc.setTextColor(62, 39, 35);
  const titleLines = doc.splitTextToSize(bookTitle, contentW - 16);
  let ty = 105 - (titleLines.length - 1) * (titleSize * 0.28);
  for (const tl of titleLines) { doc.text(tl, W / 2, ty, { align: "center" }); ty += titleSize * 0.55; }
  doc.setDrawColor(232, 177, 116);
  doc.setLineWidth(0.5);
  doc.line(W/2 - 30, ty + 4, W/2 + 30, ty + 4);
  if (S.chapters.bookAuthor) {
    doc.setFont(fontName, "italic");
    doc.setFontSize(15);
    doc.setTextColor(160, 92, 30);
    doc.text(S.chapters.bookAuthor, W / 2, ty + 20, { align: "center" });
  }
  doc.setFont(fontName, "normal");
  doc.setFontSize(12);
  doc.setTextColor(160, 92, 30);
  doc.text(String(new Date().getFullYear()), W / 2, 220, { align: "center" });
  doc.setFont(fontName, "italic");
  doc.setFontSize(10);
  doc.setTextColor(190, 150, 110);
  doc.text("Barnasagan mín · barnasagan.is", W / 2, H - 62, { align: "center" });

  // ── Sagan ────────────────────────────────────────────
  let textToRender = S.storyText;
  if (!textToRender) {
    alert("Engin saga til. Smelltu á 'Forskoða bókina þína' fyrst.");
    return;
  }

  // Búum til uppflettitöflu: kaflanúmer → myndir
  const chaptersWithAnswers = S.chapters.chapters.filter(c => c.answers.length > 0);
  let chapterImageMap = {};
  chaptersWithAnswers.forEach((ch, i) => {
    if (ch.photos && ch.photos.length > 0) {
      chapterImageMap[i] = ch.photos;
    }
  });

  let y = margin + 10;
  let storyPageStarted = false;

  // ── Tileinkun ────────────────────────────────────────
  const dedication = document.getElementById("dedication-input")?.value?.trim();
  if (dedication) {
    addPage();
    doc.setFont(fontName, "italic");
    doc.setFontSize(16);
    doc.setTextColor(122, 95, 77);
    const dedLines = doc.splitTextToSize(dedication, contentW - 30);
    let dy = H / 2 - (dedLines.length - 1) * 4.5;
    for (const dl of dedLines) { doc.text(dl, W / 2, dy, { align: "center" }); dy += 9; }
  }

  // ── Efnisyfirlit: sidan fratekin her, fyllt i eftir a ──
  addPage();
  const tocPageNo = doc.internal.getNumberOfPages();
  const tocEntries = [];

  const textCleaned = textToRender.replace(/^##\s*Lokaorð.*$/mi, '').replace(/^##\s*Closing.*$/mi, '').trimEnd();
  const lines = textCleaned.split("\n");
  let chapterHeadingCount = -1;
  let pendingPhotos = null;

  async function flushChapterPhotos() {
    if (!pendingPhotos || pendingPhotos.length === 0) { pendingPhotos = null; return; }
    // Hver mynd faer ad anda: rett hlutfoll, midjad, myndatexti undir
    const maxW = Math.min(contentW * 0.62, 100);
    const maxH = 72;
    for (const photo of pendingPhotos) {
      const dataUrl = await getPhotoDataUrl(photo);
      if (!dataUrl) continue;
      try {
        const dims = await loadImageDims(dataUrl);
        if (!dims) continue;
        const ratio = dims.w / dims.h;
        let drawW = maxW, drawH = maxW / ratio;
        if (drawH > maxH) { drawH = maxH; drawW = maxH * ratio; }
        const capH = photo.caption ? 10 : 0;
        if (y + drawH + capH + 16 > H - margin) { addPage(); y = margin + 10; }
        y += 8;
        const px = (W - drawW) / 2;
        const scaled = await resizeImageForPrint(dataUrl, drawW, drawH, 300);
        doc.addImage(scaled, "JPEG", px, y, drawW, drawH);
        doc.setDrawColor(232, 177, 116); doc.setLineWidth(0.2);
        doc.rect(px, y, drawW, drawH);
        y += drawH;
        if (photo.caption) {
          doc.setFont(fontName, "italic");
          doc.setFontSize(9);
          doc.setTextColor(122, 106, 88);
          y += 5;
          doc.text(String(photo.caption), W / 2, y, { align: "center", maxWidth: drawW + 24 });
          y += 3;
        }
        y += 6;
      } catch(e) { console.warn("Kaflamynd villa:", e); }
    }
    pendingPhotos = null;
  }

  for (const line of lines) {
    if (!line.trim()) { y += 4; continue; }

    // ── Aðaltitill (# ) ──
    if (line.startsWith("# ")) continue;

    // ── Kaflaheiti (## ) ──
    if (line.startsWith("## ")) {
      const headTxt = line.slice(3).trim();
      const isTimeline = headTxt === "Sagan í ártölum" || headTxt === "The story in years";
      await flushChapterPhotos();
      addPage();
      tocEntries.push({ title: headTxt, page: doc.internal.getNumberOfPages() });
      storyPageStarted = true;
      const titleY = H * 0.15;
      doc.setFont(fontName, "normal");
      doc.setFontSize(22);
      doc.setTextColor(160, 92, 30);
      doc.text(headTxt, W / 2, titleY, { align: "center", maxWidth: contentW });
      doc.setDrawColor(232, 177, 116); doc.setLineWidth(0.4);
      const lineY = titleY + 8;
      doc.line(margin, lineY, W / 2 - 35, lineY);
      doc.line(W / 2 + 35, lineY, W - margin, lineY);
      y = lineY + 10;
      if (!isTimeline) {
        chapterHeadingCount++;
        pendingPhotos = chapterImageMap[chapterHeadingCount] || null;
      }
      continue;
    }

    // ── Vanlegar málsgreinar ──
    if (!storyPageStarted) {
      addPage();
      storyPageStarted = true;
      doc.setFont("EBGaramond", "italic");
      doc.setFontSize(22);
      doc.setTextColor(139, 94, 60);
      doc.text("Inngangur", W / 2, H * 0.15, { align: "center" });
      doc.setDrawColor(196, 154, 108); doc.setLineWidth(0.4);
      const introLineY = H * 0.15 + 8;
      doc.line(margin, introLineY, W / 2 - 35, introLineY);
      doc.line(W / 2 + 35, introLineY, W - margin, introLineY);
      y = introLineY + 10;
    }
    doc.setFont("EBGaramond", "normal");
    doc.setFontSize(11);
    doc.setTextColor(44, 26, 14);
    y = wrapText(line, margin, y, contentW, 6.5, H - 30);
    y += 3;
  }
  await flushChapterPhotos();

  // ── Hæð barnsins ──────────────────────────────────────
  if (S.heights && S.heights.length > 0) {
    addPage();
    y = margin + 10;
    doc.setFont("EBGaramond", "italic");
    doc.setFontSize(22);
    doc.setTextColor(139, 94, 60);
    doc.text("Hæð barnsins", W / 2, y, { align: "center" });
    y += 8;
    doc.setDrawColor(196, 154, 108);
    doc.setLineWidth(0.4);
    doc.line(margin, y, W / 2 - 35, y);
    doc.line(W / 2 + 35, y, W - margin, y);
    y += 16;

    // Sort oldest first for PDF (chronological)
    const sortedHeights = [...S.heights].sort((a, b) => a.measured_at.localeCompare(b.measured_at));
    for (const h of sortedHeights) {
      if (y + 20 > H - margin) { addPage(); y = margin + 10; }
      const d = new Date(h.measured_at + 'T00:00:00');
      const dateStr = d.toLocaleDateString('is-IS', { day: 'numeric', month: 'long', year: 'numeric' });

      doc.setFont("EBGaramond", "normal");
      doc.setFontSize(13);
      doc.setTextColor(44, 26, 14);
      const weightPart = h.weight_kg ? `  ·  ${h.weight_kg} kg` : '';
      doc.text(`${h.height_cm} cm${weightPart}`, margin, y);

      doc.setFontSize(10);
      doc.setTextColor(139, 94, 60);
      doc.text(dateStr, margin, y + 6);
      y += 6;

      if (h.note) {
        doc.setFont("EBGaramond", "italic");
        doc.setFontSize(10);
        doc.setTextColor(100, 80, 60);
        const noteLines = doc.splitTextToSize(h.note, contentW - 10);
        for (const nl of noteLines) {
          y += 5;
          if (y > H - margin) { addPage(); y = margin + 10; }
          doc.text(nl, margin + 4, y);
        }
      }

      doc.setDrawColor(220, 190, 160);
      doc.setLineWidth(0.2);
      doc.line(margin, y + 5, W - margin, y + 5);
      y += 14;
    }
  }

  // ── Gullmolabanki ─────────────────────────────────────
  if (S.gullmolar && S.gullmolar.length > 0) {
    addPage();
    y = margin + 10;
    doc.setFont("EBGaramond", "italic");
    doc.setFontSize(22);
    doc.setTextColor(139, 94, 60);
    doc.text("Gullmolabanki", W / 2, y, { align: "center" });
    y += 8;
    doc.setDrawColor(196, 154, 108);
    doc.setLineWidth(0.4);
    doc.line(margin, y, W / 2 - 35, y);
    doc.line(W / 2 + 35, y, W - margin, y);
    y += 14;

    for (const g of S.gullmolar) {
      if (y + 30 > H - margin) { addPage(); y = margin + 10; }

      // Opening quote mark
      doc.setFont("EBGaramond", "italic");
      doc.setFontSize(13);
      doc.setTextColor(44, 26, 14);
      const quoteLines = doc.splitTextToSize(`"${g.quote}"`, contentW - 10);
      for (const ql of quoteLines) {
        if (y > H - 30) { addPage(); y = margin + 10; }
        doc.text(ql, margin + 5, y);
        y += 7;
      }

      // Context
      if (g.context) {
        doc.setFont("EBGaramond", "normal");
        doc.setFontSize(10);
        doc.setTextColor(139, 94, 60);
        const ctxLines = doc.splitTextToSize(g.context, contentW - 10);
        for (const cl of ctxLines) {
          if (y > H - 30) { addPage(); y = margin + 10; }
          doc.text(cl, margin + 5, y);
          y += 5.5;
        }
      }

      // Date
      if (g.said_at) {
        const d = new Date(g.said_at + 'T00:00:00');
        const dateStr = d.toLocaleDateString('is-IS', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.setFont("EBGaramond", "normal");
        doc.setFontSize(9);
        doc.setTextColor(180, 150, 120);
        doc.text(dateStr, margin + 5, y);
        y += 5;
      }

      // Separator line
      doc.setDrawColor(220, 190, 160);
      doc.setLineWidth(0.2);
      doc.line(margin, y + 3, W - margin, y + 3);
      y += 12;
    }
  }

  // ── Myndasafn ────────────────────────────────────────
  if (S.uploadedPhotos.length > 0) {
    addPage();
    y = margin + 10;
    const photoTitle = S.lang === "en" ? "Photo Gallery" : "Myndasafn";
    tocEntries.push({ title: photoTitle, page: doc.internal.getNumberOfPages() });
    doc.setFont(fontName, "normal");
    doc.setFontSize(22);
    doc.setTextColor(62, 39, 35);
    doc.text(photoTitle, W / 2, y, { align: "center" });
    y += 8;
    doc.setDrawColor(196, 154, 108);
    doc.setLineWidth(0.4);
    doc.line(margin, y, W - margin, y);
    y += 14;

    const cols = 2;
    const imgW = (contentW - 10) / cols;
    const imgH = imgW * 0.7;
    let px = margin;

    for (let i = 0; i < S.uploadedPhotos.length; i++) {
      if (y + imgH + 20 > H - margin) {
        addPage();
        y = margin + 10;
        px = margin;
      }
      try {
        const scaled = await resizeImageForPrint(S.uploadedPhotos[i].dataUrl, imgW, imgH, 300);
        doc.addImage(scaled, "JPEG", px, y, imgW, imgH);
        doc.setDrawColor(196, 154, 108);
        doc.setLineWidth(0.2);
        doc.rect(px, y, imgW, imgH);
        if (S.uploadedPhotos[i].caption) {
          doc.setFont("EBGaramond", "italic");
          doc.setFontSize(9);
          doc.setTextColor(139, 94, 60);
          doc.text(S.uploadedPhotos[i].caption, px + imgW / 2, y + imgH + 5, { align: "center", maxWidth: imgW });
        }
      } catch(e) { console.warn("Mynd villa:", e); }
      if ((i + 1) % cols === 0) {
        px = margin;
        y += imgH + (S.uploadedPhotos[i].caption ? 16 : 10);
      } else {
        px += imgW + 10;
      }
    }
  }

  // ── Lokaorð ──────────────────────────────────────────
  const closingWords = document.getElementById("closing-words")?.value?.trim();
  if (closingWords) {
    addPage();
    tocEntries.push({ title: S.lang === "en" ? "Closing words" : "Lokaorð", page: doc.internal.getNumberOfPages() });
    let yClose = margin + 40;
    doc.setFont(fontName, "normal");
    doc.setFontSize(22);
    doc.setTextColor(160, 92, 30);
    doc.text(S.lang === "en" ? "Closing words" : "Lokaorð", W / 2, yClose, { align: "center" });
    yClose += 8;
    doc.setDrawColor(196, 154, 108);
    doc.setLineWidth(0.4);
    doc.line(margin, yClose, W / 2 - 25, yClose);
    doc.line(W / 2 + 25, yClose, W - margin, yClose);
    yClose += 14;
    doc.setFont("EBGaramond", "normal");
    doc.setFontSize(12);
    doc.setTextColor(44, 26, 14);
    wrapText(closingWords, margin, yClose, contentW, 7.5, H - margin);
  }

  // ── Efnisyfirlitið skrifað á frátekna síðu ───────────
  if (tocEntries.length > 0) {
    doc.setPage(tocPageNo);
    let yToc = margin + 26;
    doc.setFont(fontName, "normal");
    doc.setFontSize(22);
    doc.setTextColor(62, 39, 35);
    doc.text(S.lang === "en" ? "Contents" : "Efnisyfirlit", W / 2, yToc, { align: "center" });
    yToc += 6;
    doc.setDrawColor(232, 177, 116);
    doc.setLineWidth(0.4);
    doc.line(W / 2 - 25, yToc, W / 2 + 25, yToc);
    yToc += 14;
    doc.setFontSize(12);
    for (const e of tocEntries) {
      if (yToc > H - 26) break;
      doc.setTextColor(62, 39, 35);
      doc.text(doc.splitTextToSize(e.title, contentW - 24)[0], margin + 2, yToc);
      doc.setTextColor(160, 92, 30);
      doc.text(String(e.page), W - margin - 2, yToc, { align: "right" });
      yToc += 9;
    }
  }

  // ── Vista ─────────────────────────────────────────────
  const ch1 = getChapterState(0);
  const rawName = ch1.answers.length > 0
    ? ch1.answers[0].split(/[,\.]/)[0].replace(/^(ég heiti|my name is|I am|I'm)\s*/i, "").trim()
    : "lífssaga";
  const displayName = rawName.length > 2 && rawName.length < 60 ? rawName : "lífssaga";
  const styleKey = S.styleKey || "natural";
  const styleLabel = STORY_STYLES[styleKey]
    ? (S.lang === "en" ? STORY_STYLES[styleKey].labelEn : STORY_STYLES[styleKey].label)
        .replace(/^[\p{Emoji}\s]+/u, "").trim()
    : styleKey;
  doc.save(`sagan-min-${displayName}-${styleLabel}.pdf`);
}

export async function downloadText() {
  if (!S.storyText) { await generateStory(); }
  if (!S.storyText) { alert("Engin saga til. Forskoðaðu söguna fyrst."); return; }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([S.storyText], { type: "text/plain;charset=utf-8" }));
  a.download = "sagan-min.txt"; a.click();
}

export function downloadAnswers() {
  const chapters = getChapters();
  const lines = [];
  const isIs = S.lang !== "en";
  lines.push(isIs ? "SAGAN MÍN — SVÖR VIÐ SPURNINGUM" : "MY STORY — ANSWERS TO QUESTIONS");
  lines.push(isIs ? `Sótt: ${new Date().toLocaleDateString("is-IS")}` : `Downloaded: ${new Date().toLocaleDateString("en-GB")}`);
  lines.push("");
  chapters.forEach(ch => {
    const state = getChapterState(ch.id);
    if (!state || state.answers.length === 0) return;
    lines.push("═".repeat(50));
    lines.push(`${ch.emoji}  ${ch.title}`);
    lines.push("═".repeat(50));
    lines.push("");
    state.questions.forEach((q, i) => {
      const ans = state.answers[i];
      if (!ans) return;
      lines.push(`${i + 1}. ${q}`);
      lines.push(ans);
      lines.push("");
    });
  });
  if (lines.length <= 4) {
    alert(isIs ? "Engin svör til að sækja." : "No answers to download.");
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
  a.download = isIs ? "sagan-min-svor.txt" : "my-story-answers.txt";
  a.click();
}

window.handlePhotoUpload = handlePhotoUpload;
window.removePhoto = removePhoto;
window.downloadPDF = downloadPDF;
window.downloadText = downloadText;
window.downloadAnswers = downloadAnswers;
