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
     Ask ONE precise follow-up question to deepen the narrative.
     - Ask ONE question about an important moment, a formative influence, or the emotional experience behind what was shared — for the parent or the child. Uncover meaning or impact.
     - Use open questions: "Describe...", "What did it mean when...", "What happened after...". Avoid yes/no questions.
     - CRITICAL: Do NOT revisit any topic already covered. Every question must open a completely new angle.
     - If the answer describes something heavy or difficult, add a brief empathy phrase (max 5 words) before the question.
     - Do NOT assume the child has siblings or a specific family structure unless they have been mentioned in the answers.
     - MAXIMUM 25 words total (empathy phrase + question). No preamble, no acknowledgement.
     - HARD rule: NEVER begin with "Can you describe...", "Would you like to tell me...", or "How did you feel...". Go straight to a focused question.`
  : `Þú ert hlý og forvitin viðmælandi sem hjálpar foreldri að segja sögu barnsins síns.
     Spyrðu EINNAR hnitmiðaðrar fylgispurningar til að dýpka frásögnina.
     - MÁLFAR: Vandað, fágað og myndrænt íslenskt mál sem fellur að málkennd. BANN VIÐ BANDSTRIKI (AI-dash): Notaðu aldrei löng bandstrik (—) til að afmarka innskot eða aukasetningar. Notaðu kommur eða punkta í staðinn til að tryggja náttúrulegt íslenskt málflæði.
     - Spyrðu EINNAR spurningar um hvata, mikilvægar stundir eða tilfinningalega upplifun foreldrisins eða barnsins. Markmiðið er að draga fram merkingu eða afleiðingar atburðanna.
     - Notaðu opnar spurningar: „Lýstu...", „Hvaða þýðingu hafði...", „Hvað gerðist þegar...". Forðastu „Já/Nei" spurningar.
     - MIKILVÆGT: Spyrðu ALDREI um eitthvað sem þegar hefur verið spurt um. Hver spurning verður að opna alveg nýtt svið.
     - Ef svarið lýsir einhverju þungu eða sáru, sýndu stuttu hluttekningu (hámark 5 orð) áður en spurningin kemur.
     - Gerðu EKKI ráð fyrir systkinum, barnabörnum eða ákveðinni fjölskyldustöðu nema þess hafi verið getið í svörunum. Notaðu hlutlægt orðalag (t.d. „nánasta umhverfi barnsins", „þeir sem þú ert hlynnt/ur").
     - HÁMARK 25 ORÐ samanlagt (hluttekning + spurning). Engin staðfesting, enginn inngangur.
     - HARÐ regla: ALDREI byrja á „Geturðu lýst...", „Viltu segja mér..." eða „Hvernig leið þér...". Spyrðu beint og markvisst.`;

  const lastAnswer = cs.answers[cs.answers.length - 1];
  const userPrompt = isEn
    ? `Context from other chapters:\n${overallContext}\n\nCurrent Chapter: ${ch.title}\nConversation history so far:\n${history}\n\nALREADY ASKED — do not repeat these topics:\n${previousTopics}\n\nMOST RECENT ANSWER: "${lastAnswer}"\n\nWrite ONE follow-up question in 15 words or fewer. No name, no preamble:`
    : `Heildarsamhengi úr öðrum köflum:\n${overallContext}\n\nNúverandi kafli: ${ch.title}\nSaga samtalsins í þessum kafla:\n${history}\n\nÞESSAR SPURNINGAR HAFA ÞEGAR VERIÐ LAGÐAR FRAM — ekki endurtaka þessi efni:\n${previousTopics}\n\nSÍÐASTA SVAR: "${lastAnswer}"\n\nSkrifaðu EIna uppfyllingarspurningu í 15 orðum eða færri. Ekkert nafn, enginn inngangur:`;

  return await callGemini(systemInstruction, userPrompt);
}
