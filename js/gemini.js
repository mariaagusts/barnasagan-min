// ══════════════════════════════════════════════
//  GEMINI AI
// ══════════════════════════════════════════════
import { S } from './state.js';
import { GEMINI_KEYS, MODEL_FLASH, MODEL_PRO } from './config.js';
import { getChapters } from './chapters.js';
import { getChapterState } from './supabase-client.js';

export function getNextGeminiKey() {
  const key = GEMINI_KEYS[S.geminiKeyIdx % GEMINI_KEYS.length];
  S.geminiKeyIdx++;
  return key;
}

export function getGeminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${getNextGeminiKey()}`;
}

export async function callGemini(systemPrompt, userMsg, usePro = false) {
  const body = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + userMsg }] }],
    generationConfig: { temperature: 0.8, maxOutputTokens: 16384 }
  });

  const models = usePro ? [MODEL_PRO, MODEL_FLASH] : [MODEL_FLASH];
  const urls = models.map(m => getGeminiUrl(m));

  let lastError = "";

  for (const url of urls) {
    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body
        });
        const data = await res.json();

        if (data.error?.code === 503 || data.error?.status === "UNAVAILABLE") {
          lastError = data.error.message;
          console.log(`Of upptekið (${url}), bíð 5s... tilraun ${attempt}/3`);
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }

        if (data.error) {
          lastError = data.error.message;
          break; // Önnur villa — reynum Flash
        }

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          lastError = "Tómt svar";
          break;
        }

        return data.candidates[0].content.parts[0].text.trim();

      } catch (err) {
        lastError = err.message;
        console.log(`Villa (${url}): ${err.message}, bíð 3s...`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }

  throw new Error(`Villa: ${lastError || "Óþekkt"}`);
}

export async function generateNextQuestion(cs) {
  const chapters = getChapters();
  const ch = chapters.find(c => c.id === S.chapterId);

  const isEn = (S.lang === "en");

  // Söfnum stuttu yfirliti úr öllum köflum til að Gemini hafi heildarmyndina
  let overallContext = "";
  S.chapters.chapters.forEach(c => {
    if (c.answers.length > 0 && c.id !== S.chapterId) {
      const chTitle = chapters.find(item => item.id === c.id).title;
      const summary = c.answers.slice(0, 4).map(a => a.substring(0, 240)).join(" / ");
      overallContext += isEn
        ? `From [${chTitle}]: ${summary}\n`
        : `Úr kafla um [${chTitle}]: ${summary}\n`;
    }
  });

  const history = cs.questions.slice(0, cs.answers.length)
    .map((q, i) => `Spurning ${i + 1}: ${q}\nSvar ${i + 1}: ${cs.answers[i]}`).join("\n\n");

  const systemInstruction = isEn
  ? `You are a warm and curious interviewer for parents sharing their child's story. Your goal is to keep the child's story moving with ONE focused question.
     - Ask ONE specific question about a sensory detail (smell, sound, a funny moment, or a feeling), or a concrete memory about the child.
     - If the answer is brief, pivot to a new specific detail instead of asking to "expand."
     - MAXIMUM 15 WORDS total — hard rule. No acknowledgement, no preamble. Just one direct question.`
  : `Þú ert hlý og forvitin viðmælandi. Foreldri er að svara spurningum um barnið sitt. Markmið þitt er að halda sögunni um barnið gangandi með EINNI hlýlegri spurningu um barnið.
     - MÁLFAR: Notaðu vandað en eðlilegt íslenskt mál sem fellur að málkennd.
     - Spyrðu EINNAR spurningar um skynrænar upplýsingar (lykt, hljóð, birtu), tilfinningar eða ákveðna minningu um barnið.
     - HÁMARK 15 ORÐ — HARÐ regla. Engin staðfesting, engin inngangur. Bara ein bein spurning.`;

  const lastAnswer = cs.answers[cs.answers.length - 1];
  const userPrompt = isEn
    ? `Context from other chapters about the child:\n${overallContext}\n\nCurrent Chapter: ${ch.title}\nConversation history so far:\n${history}\n\nMOST RECENT ANSWER ABOUT THE CHILD: "${lastAnswer}"\n\nWrite ONE follow-up question about the child in 15 words or fewer. No name, no preamble:`
    : `Heildarsamhengi úr öðrum köflum um barnið:\n${overallContext}\n\nNúverandi kafli: ${ch.title}\nSaga samtalsins í þessum kafla:\n${history}\n\nSÍÐASTA SVAR UM BARNIÐ: "${lastAnswer}"\n\nSkrifaðu EIna uppfyllingarspurningu um barnið í 15 orðum eða færri. Ekkert nafn, enginn inngangur:`;

  return await callGemini(systemInstruction, userPrompt);
}
