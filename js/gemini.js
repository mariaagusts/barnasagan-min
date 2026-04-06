// ══════════════════════════════════════════════
//  GEMINI AI
// ══════════════════════════════════════════════
import { S } from './state.js';
import { SUPABASE_URL, SUPABASE_KEY, MODEL_FLASH, MODEL_PRO } from './config.js';
import { getChapters } from './chapters.js';
import { getChapterState } from './supabase-client.js';

const GEMINI_PROXY = `${SUPABASE_URL}/functions/v1/gemini-proxy`;

export async function callGemini(systemPrompt, userMsg, usePro = false) {
  const models = usePro ? [MODEL_PRO, MODEL_FLASH] : [MODEL_FLASH];
  let lastError = "";

  for (const model of models) {
    try {
      const res = await fetch(GEMINI_PROXY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "apikey": SUPABASE_KEY,
        },
        body: JSON.stringify({ systemPrompt, userMsg, model }),
      });
      const data = await res.json();

      if (data.error) {
        lastError = data.error.message;
        continue;
      }

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        lastError = "Tómt svar";
        continue;
      }

      return data.candidates[0].content.parts[0].text.trim();

    } catch (err) {
      lastError = err.message;
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

  const answeredQuestions = cs.questions.slice(0, cs.answers.length);
  const history = answeredQuestions
    .map((q, i) => `Spurning ${i + 1}: ${q}\nSvar ${i + 1}: ${cs.answers[i]}`).join("\n\n");

  const previousTopics = answeredQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n");

  const systemInstruction = isEn
  ? `You are a warm and curious interviewer helping parents tell their child's story.
     Your goal: ask ONE short, personal follow-up question that draws out more detail.
     - The question should feel natural — about a sensory detail (smell, sound, light), an everyday moment, the child's expression or reaction, the parent's own reaction, or one specific memory that connects to the latest answer.
     - CRITICAL: Do NOT revisit or rephrase any topic already covered. Every question must open a completely new angle.
     - If the answer is very short or negative ("Yes", "No", "Don't know"), switch to a completely different angle within the chapter.
     - Keep the question tight and personal. No acknowledgement, no preamble. Just one direct question.`
  : `Þú ert hlý og forvitin viðmælandi. Foreldri er að segja sögu barnsins síns.
     Markmið þitt: spyrðu EINNAR stuttrar og persónulegrar framhaldsspurningar sem fær foreldrið til að lýsa nánar andrúmsloftinu, tilfinningunni eða hversdagslegum smáatriðum.
     - MÁLFAR: Vandað en eðlilegt íslenskt mál sem fellur að málkennd.
     - Spurningin má snúast um skynjun (lykt, hljóð, birtu), hversdagsleg smáatriði, svipbrigði eða viðbrögð barnsins, viðbrögð foreldrisins, eða eina ákveðna smásögu/minningu sem tengist svarinu.
     - MIKILVÆGT: Spyrðu ALDREI um eitthvað sem þegar hefur verið spurt um eða þegar hefur komið fram í svörunum. Hver spurning verður að opna alveg nýtt svið.
     - Ef svarið er mjög stutt eða neitandi („Já", „Nei", „Veit ekki"), skiptu þá alveg um efni innan kaflans.
     - Engin staðfesting, enginn inngangur. Bara ein bein spurning.
     - HARÐ regla: ALDREI byrja spurningu á 'Geturðu lýst...' eða 'Viltu segja mér...'. Farðu beint í hnitmiðaða spurningu um skynjun eða tilfinningu.`;

  const lastAnswer = cs.answers[cs.answers.length - 1];
  const userPrompt = isEn
    ? `Context from other chapters (use only to avoid repetition):\n${overallContext}\n\nCurrent Chapter: ${ch.title}\nConversation history so far:\n${history}\n\nALREADY ASKED — do not repeat these topics:\n${previousTopics}\n\nMOST RECENT ANSWER: "${lastAnswer}"\n\nWrite ONE tight, personal follow-up question. No name, no preamble:`
    : `Samhengi úr öðrum köflum (notaðu aðeins til að forðast endurtekningar):\n${overallContext}\n\nNúverandi kafli: ${ch.title}\nSaga samtalsins í þessum kafla:\n${history}\n\nÞESSAR SPURNINGAR HAFA ÞEGAR VERIÐ LAGÐAR FRAM — ekki endurtaka þessi efni:\n${previousTopics}\n\nSÍÐASTA SVAR: "${lastAnswer}"\n\nSkrifaðu EIna þétta og persónulega framhaldsspurningu. Ekkert nafn, enginn inngangur:`;

  return await callGemini(systemInstruction, userPrompt);
}
