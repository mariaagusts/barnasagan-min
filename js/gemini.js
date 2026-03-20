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
  ? `You are a warm and curious interviewer helping parents tell their child's story.
     Your goal: ask ONE short, personal follow-up question that draws out more detail.
     - The question should feel natural — about a sensory detail (smell, sound, light), an everyday moment, the child's expression or reaction, the parent's own reaction, or one specific memory that connects to the latest answer.
     - Use the context from other chapters ONLY to avoid repetition — do not ask about it unless it directly connects to the latest answer.
     - If the answer is very short or negative ("Yes", "No", "Don't know"), switch to a completely different angle within the chapter.
     - Keep the question tight and personal. No acknowledgement, no preamble. Just one direct question.`
  : `Þú ert hlý og forvitin viðmælandi. Foreldri er að segja sögu barnsins síns.
     Markmið þitt: spyrðu EINNAR stuttrar og persónulegrar framhaldsspurningar sem fær foreldrið til að lýsa nánar andrúmsloftinu, tilfinningunni eða hversdagslegum smáatriðum.
     - MÁLFAR: Vandað en eðlilegt íslenskt mál sem fellur að málkennd.
     - Spurningin má snúast um skynjun (lykt, hljóð, birtu), hversdagsleg smáatriði, svipbrigði eða viðbrögð barnsins, viðbrögð foreldrisins, eða eina ákveðna smásögu/minningu sem tengist svarinu.
     - Notaðu samhengi úr öðrum köflum AÐEINS til að forðast endurtekningar — spyrðu ekki út í það nema það tengist beint nýjasta svarinu.
     - Ef svarið er mjög stutt eða neitandi („Já", „Nei", „Veit ekki"), skiptu þá alveg um efni innan kaflans.
     - Engin staðfesting, enginn inngangur. Bara ein bein spurning.`;

  const lastAnswer = cs.answers[cs.answers.length - 1];
  const userPrompt = isEn
    ? `Context from other chapters (use only to avoid repetition):\n${overallContext}\n\nCurrent Chapter: ${ch.title}\nConversation history so far:\n${history}\n\nMOST RECENT ANSWER: "${lastAnswer}"\n\nWrite ONE tight, personal follow-up question. No name, no preamble:`
    : `Samhengi úr öðrum köflum (notaðu aðeins til að forðast endurtekningar):\n${overallContext}\n\nNúverandi kafli: ${ch.title}\nSaga samtalsins í þessum kafla:\n${history}\n\nSÍÐASTA SVAR: "${lastAnswer}"\n\nSkrifaðu EIna þétta og persónulega framhaldsspurningu. Ekkert nafn, enginn inngangur:`;

  return await callGemini(systemInstruction, userPrompt);
}
