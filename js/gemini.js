// ══════════════════════════════════════════════
//  GEMINI AI
// ══════════════════════════════════════════════
import { S } from './state.js';
import { SUPABASE_URL, SUPABASE_KEY, MODEL_FLASH, MODEL_PRO } from './config.js';
import { getChapters } from './chapters.js';
import { getChapterState } from './supabase-client.js';
import { getFamilyContext } from './family.js';

const GEMINI_PROXY = `${SUPABASE_URL}/functions/v1/gemini-proxy`;

// maxTokens: 256 default (questions/titles); story passes request much more.
// The proxy clamps this server-side, so it is safe to expose.
async function getAuthToken() {
  try {
    const { getSupabase } = await import('./supabase-client.js');
    const sb = getSupabase();
    const { data } = await sb.auth.getSession();
    return data?.session?.access_token || SUPABASE_KEY;
  } catch { return SUPABASE_KEY; }
}

export async function callGemini(systemPrompt, userMsg, usePro = false, maxTokens = 256, temperature = undefined) {
  const models = usePro ? [MODEL_PRO, MODEL_FLASH] : [MODEL_FLASH];
  let lastError = "";
  const token = await getAuthToken();

  for (const model of models) {
    try {
      const res = await fetch(GEMINI_PROXY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "apikey": SUPABASE_KEY,
        },
        body: JSON.stringify({ systemPrompt, userMsg, model, maxTokens, temperature }),
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

export async function transcribeAudio(base64Data, mimeType) {
  const token = await getAuthToken();
  const systemPrompt = S.lang === "en"
    ? "You are a precise transcription engine. Transcribe the spoken English in this audio recording word for word, with correct spelling and punctuation. Output ONLY the transcribed text, no comments, no labels, no quotation marks around it. If no speech can be heard, output nothing at all."
    : "Þú ert nákvæm íslensk talgreining. Umritaðu talið í þessari hljóðupptöku orðrétt, með réttri íslenskri stafsetningu og eðlilegum greinarmerkjum. Skilaðu EINGÖNGU umritaða textanum, engum athugasemdum, engum merkingum, engum gæsalöppum utan um textann. Ef ekkert tal heyrist, skilaðu engu.";
  const res = await fetch(GEMINI_PROXY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": SUPABASE_KEY,
    },
    body: JSON.stringify({ systemPrompt, model: MODEL_FLASH, audio: { mimeType, data: base64Data } }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Villa í talgreiningu");
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find(p => p.text && !p.thought);
  return (textPart?.text || "").trim();
}

export function warmUpProxy() {
  // Vekur Edge Function an CORS-haavada; svarid skiptir engu mali
  fetch(GEMINI_PROXY, { method: "GET", mode: "no-cors" }).catch(() => {});
}

// Client-side sanity check on AI-generated questions.
// Returns the cleaned question, or null if it fails basic quality rules
// (we rely on the prompt, but models don't always obey it).
export function validateQuestion(text) {
  if (!text || typeof text !== "string") return null;
  let q = text.trim()
    .replace(/^["'„“”]+|["'„“”]+$/g, "")            // strip surrounding quotes
    .replace(/^(Spurning|Question)\s*[:\d\.\)]*\s*/i, "") // strip "Spurning:" prefixes
    .trim();
  if (!q) return null;
  if (q.includes("\n")) q = q.split("\n")[0].trim();  // single line only
  const words = q.split(/\s+/).length;
  if (words < 3 || words > 30) return null;           // prompt says max ~25 words
  if (!q.includes("?")) return null;                  // must actually be a question
  return q;
}

// `avoid`: extra questions the AI must not repeat (e.g. ones the user rejected)
export async function generateNextQuestion(cs, avoid = []) {
  const chapters = getChapters();
  const ch = chapters.find(c => c.id === S.chapterId);

  const isEn = (S.lang === "en");

  // Compact child profile so every question stays personal
  const childName = S.chapters?.bookAuthor
    || S.children?.find(c => c.id === S.activeChildId)?.child_name || "";
  const familyCtx = getFamilyContext(S.lang);
  let profile = "";
  if (childName) {
    profile += isEn ? `The child's name is ${childName}. ` : `Barnið heitir ${childName}. `;
  }
  if (familyCtx) profile += familyCtx.trim() + " ";

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

  const allPrevious = [...answeredQuestions, ...avoid];
  const previousTopics = allPrevious.map((q, i) => `${i + 1}. ${q}`).join("\n");

  const systemInstruction = isEn
  ? `You are a warm and curious interviewer helping parents tell their child's story.
     Ask ONE precise follow-up question to deepen the narrative.
     - Ask ONE question about an important moment, a formative influence, or the emotional experience behind what was shared — for the parent or the child. Uncover meaning or impact.
     - Use open questions: "Describe...", "What did it mean when...", "What happened after...". Avoid yes/no questions.
     - CRITICAL: Do NOT revisit any topic already covered. Every question must open a completely new angle.
     - If the answer describes something heavy or difficult, add a brief empathy phrase (max 5 words) before the question.
     - Do NOT assume the child has siblings or a specific family structure unless they have been mentioned in the answers. Two mums, two dads or a single parent are all equally natural.
- Do NOT assume everything has gone well; stay neutral until the answers show otherwise.
     - MAXIMUM 25 words total (empathy phrase + question). No preamble, no acknowledgement.
     - HARD rule: NEVER begin with "Can you describe...", "Would you like to tell me...", or "How did you feel...". Go straight to a focused question.`
  : `Þú ert hlý og forvitin viðmælandi sem hjálpar foreldri að segja sögu barnsins síns.
     Spyrðu EINNAR hnitmiðaðrar fylgispurningar til að dýpka frásögnina.
     - MÁLFAR: Vandað, fágað og myndrænt íslenskt mál sem fellur að málkennd. BANN VIÐ BANDSTRIKI (AI-dash): Notaðu aldrei löng bandstrik (—) til að afmarka innskot eða aukasetningar. Notaðu kommur eða punkta í staðinn til að tryggja náttúrulegt íslenskt málflæði.
     - Spyrðu EINNAR spurningar um hvata, mikilvægar stundir eða tilfinningalega upplifun foreldrisins eða barnsins. Markmiðið er að draga fram merkingu eða afleiðingar atburðanna.
     - Notaðu opnar spurningar: „Lýstu...", „Hvaða þýðingu hafði...", „Hvað gerðist þegar...". Forðastu „Já/Nei" spurningar.
     - MIKILVÆGT: Spyrðu ALDREI um eitthvað sem þegar hefur verið spurt um. Hver spurning verður að opna alveg nýtt svið.
     - Ef svarið lýsir einhverju þungu eða sáru, sýndu stuttu hluttekningu (hámark 5 orð) áður en spurningin kemur.
     - Gerðu EKKI ráð fyrir systkinum, barnabörnum eða ákveðinni fjölskyldustöðu nema þess hafi verið getið í svörunum. Tvær mömmur, tveir pabbar eða eitt foreldri er allt jafn sjálfsagt. Notaðu hlutlægt orðalag (t.d. „nánasta umhverfi barnsins", „þeir sem þú ert hlynnt/ur").
     - Gefðu þér EKKI að allt hafi gengið vel; vertu hlutlaus þar til svörin sýna annað.
     - BEYGINGAR: Beygðu ÖLL nafnorð rétt, ekki bara sérnöfn. Gættu sérstaklega að greini í þolfalli karlkyns eintölu, þar sem tvöfalt n fellur oft ranglega niður: „bangsann", „bílinn", „vagninn", ALDREI „bangsan", „bílin", „vagnin". Ef þú ert ekki viss um beygingu orðs skaltu umorða spurninguna svo orðið standi í nefnifalli, eða nota nákvæmlega þá mynd sem foreldrið skrifaði sjálft.
     - HÁMARK 25 ORÐ samanlagt (hluttekning + spurning). Engin staðfesting, enginn inngangur.
     - HARÐ regla: ALDREI byrja á „Geturðu lýst...", „Viltu segja mér..." eða „Hvernig leið þér...". Spyrðu beint og markvisst.
     - CONSTRAINT — NO REPETITION: Greindu svarið vel. Ef notandinn hefur þegar svarað báðum hlutum í tvíþættri kjarnaspurningu, skaltu ekki spyrja um það aftur. Finndu þess í stað nýjan vinkil eða slepptu fylgispurningunni ef allt er komið fram.`;

  const lastAnswer = cs.answers[cs.answers.length - 1];
  const userPrompt = isEn
    ? `${profile ? `About the child: ${profile}\n\n` : ""}Context from other chapters:\n${overallContext}\n\nCurrent Chapter: ${ch.title}\nConversation history so far:\n${history}\n\nALREADY ASKED — do not repeat these topics:\n${previousTopics}\n\nMOST RECENT ANSWER: "${lastAnswer}"\n\nWrite ONE follow-up question in 15 words or fewer. No name, no preamble:`
    : `${profile ? `Um barnið: ${profile}\n\n` : ""}Heildarsamhengi úr öðrum köflum:\n${overallContext}\n\nNúverandi kafli: ${ch.title}\nSaga samtalsins í þessum kafla:\n${history}\n\nÞESSAR SPURNINGAR HAFA ÞEGAR VERIÐ LAGÐAR FRAM — ekki endurtaka þessi efni:\n${previousTopics}\n\nSÍÐASTA SVAR: "${lastAnswer}"\n\nSkrifaðu EIna uppfyllingarspurningu í 15 orðum eða færri. Ekkert nafn, enginn inngangur:`;

  return await callGemini(systemInstruction, userPrompt);
}


// ── Þráðamódelið: spyrillinn tekur EINA ákvörðun eftir hvert svar ──

function cleanQuestion(q) {
  if (!q) return null;
  q = String(q).trim();
  if (q.length > 160) {
    const sentences = q.match(/[^.!?]+[.!?…]+/g);
    if (sentences) {
      const onlyQs = sentences.filter(x => x.trim().endsWith("?"));
      if (onlyQs.length) q = onlyQs[onlyQs.length - 1].trim();
    }
  }
  if (!q || q.length > 220) return null;
  return q;
}

function parseDecision(raw) {
  const text = String(raw || "").trim();
  const m = text.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const d = JSON.parse(m[0]);
      if (["dig", "new_angle", "next_anchor"].includes(d.action)) {
        d.question = cleanQuestion(d.question);
        return d;
      }
    } catch { /* fall through */ }
  }
  if (text && !text.startsWith("{")) {
    const q = cleanQuestion(text);
    if (q) return { richness: "ok", action: "new_angle", question: q };
  }
  return null;
}

export async function decideNextQuestion(cs, threadDepth = 0, wantNewAngle = false) {
  const chapters = getChapters();
  const ch = chapters.find(c => c.id === S.chapterId);
  const isEn = (S.lang === "en");

  // Barnid og fjolskyldusamhengid: spurningarnar mega nefna barnid a nafn
  const childName = S.chapters?.bookAuthor
    || S.children?.find(c => c.id === S.activeChildId)?.child_name || "";
  const familyCtx = getFamilyContext(S.lang);
  let profile = "";
  if (childName) profile += isEn ? `The child's name is ${childName}. ` : `Barnið heitir ${childName}. `;
  if (familyCtx) profile += familyCtx.trim() + " ";

  let overallContext = "";
  S.chapters.chapters.forEach(c => {
    if (c.answers.length > 0 && c.id !== S.chapterId) {
      const chTitle = chapters.find(item => item.id === c.id).title;
      const summary = c.answers.slice(0, 4).map(a => a.substring(0, 240)).join(" / ");
      overallContext += isEn ? `From [${chTitle}]: ${summary}\n` : `Úr kafla um [${chTitle}]: ${summary}\n`;
    }
  });

  const answeredQuestions = cs.questions.slice(0, cs.answers.length);
  const history = answeredQuestions
    .map((q, i) => `Spurning ${i + 1}: ${q}\nSvar ${i + 1}: ${cs.answers[i]}`).join("\n\n");
  const previousTopics = answeredQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n");
  const lastAnswer = cs.answers[cs.answers.length - 1];

  const systemInstruction = isEn
  ? `You are an experienced, warm human interviewer helping a parent tell their child's story. After each answer you make ONE decision, like a good interviewer would.

REPLY WITH JSON ONLY, exactly this shape, nothing else:
{"richness":"rich|ok|thin","action":"dig|new_angle|next_anchor","question":"the question, or null when action is next_anchor"}

How to choose the action:
- "dig": the last answer opened a moment, a habit, a person or an event with more in it. Ask about EXACTLY that: "What happened then?", "How did the child react?", "What does that look like today?". Staying on the same story is what a good interviewer does. Never repeat a question already asked.
- "new_angle": the current thread is finished but the chapter has more to give. Open a genuinely new area not yet discussed.
- "next_anchor": the answer was short or closed, or the thread depth limit is reached, or everything meaningful in this chapter is covered. Then question must be null.
- When the answer is rich in detail and opens a story, "dig" is almost always the right choice.

Rules for the question (when not null):
- ONE concrete question about moments, habits, reactions, people or what happened next. You MAY use the child's name naturally in the question. Feelings may be asked about gently, parents share them readily, but concrete moments come first.
- HEAVY ANSWERS: if the answer describes something painful (illness, loss, worry), a short empathy phrase (max 5 words) is allowed, then NEVER press for more detail about the painful event itself, NEVER look for silver linings. Offer a gentle new direction instead, usually action "new_angle" or "next_anchor".
- Do NOT assume siblings or a specific family structure unless mentioned in the answers. Two mums, two dads or a single parent are all equally natural.
- Do NOT assume everything has gone well. Some children and families face real difficulties; stay neutral until the answers show otherwise, and meet hard answers with warmth without prettifying them.
- The question is a BARE question: no greeting, NO PRAISE, no recap of the answer. Anything beyond the question itself will be discarded.
- MAXIMUM 25 words. No preamble. Never begin with "Can you describe", "Would you like to tell me" or "How did you feel".`
  : `Þú ert reyndur og hlýr mannlegur spyrill sem hjálpar foreldri að segja sögu barnsins síns. Eftir hvert svar tekur þú EINA ákvörðun, eins og góður spyrill gerir.

SVARAÐU EINGÖNGU MEÐ JSON, nákvæmlega svona, engu öðru:
{"richness":"rich|ok|thin","action":"dig|new_angle|next_anchor","question":"spurningin, eða null þegar action er next_anchor"}

Hvernig þú velur action:
- "dig": Síðasta svar opnaði augnablik, vana, manneskju eða atburð sem á meira inni. Spyrðu nánar út í NÁKVÆMLEGA það: „Hvað gerðist svo?", „Hvernig brást barnið við?", „Hvernig birtist þetta í dag?". Að halda áfram með sömu söguna er einmitt það sem góður spyrill gerir. Endurtaktu samt aldrei spurningu sem þegar hefur verið spurð.
- "new_angle": Þráðurinn er tæmdur en kaflinn á meira inni. Opnaðu nýtt svið sem ekki hefur verið rætt.
- "next_anchor": Svarið var stutt eða lokað, eða hámarksdýpt þráðar er náð, eða allt sem skiptir máli í kaflanum er komið fram. Þá er question null.
- Þegar svarið er ríkt af smáatriðum og opnar sögu er "dig" nánast alltaf rétta valið.

Reglur um spurninguna (þegar hún er ekki null):
- EIN áþreifanleg spurning um augnablik, vana, viðbrögð, fólk eða hvað gerðist næst. Þú MÁTT nefna barnið á nafn í spurningunni, það gerir samtalið hlýrra. Tilfinningar má spyrja um af nærgætni, foreldrar segja fúslega frá þeim, en áþreifanleg augnablik ganga fyrir.
- ÞUNG SVÖR: Ef svarið lýsir einhverju sáru (veikindum, missi, áhyggjum) má sýna stutta hluttekningu (hámark 5 orð), en spyrðu ALDREI nánar út í sársaukafulla atburðinn sjálfan og leitaðu ALDREI að ljósum punktum. Bjóddu mildan nýjan vinkil í staðinn, það þýðir oftast action "new_angle" eða "next_anchor".
- Gerðu EKKI ráð fyrir systkinum eða ákveðinni fjölskyldustöðu nema þess hafi verið getið í svörunum. Tvær mömmur, tveir pabbar eða eitt foreldri er allt jafn sjálfsagt.
- Gefðu þér EKKI að allt hafi gengið vel. Sum börn og fjölskyldur takast á við raunverulega erfiðleika; vertu hlutlaus þar til svörin sýna annað, og taktu erfiðum svörum af hlýju án þess að fegra þau.
- Spurningin er BER spurning: ekkert ávarp, EKKERT HRÓS, engin endursögn á svarinu. Allt umfram spurninguna sjálfa verður fjarlægt.
- SÉRNÖFN: Beygðu sérnöfn (nafn barnsins, staði) alltaf rétt. Ef þú ert ekki fullviss um beygingu skaltu nota NÁKVÆMLEGA sömu mynd og foreldrið skrifaði sjálft.
- BEYGINGAR: Beygðu ÖLL nafnorð rétt, ekki bara sérnöfn. Gættu sérstaklega að greini í þolfalli karlkyns eintölu, þar sem tvöfalt n fellur oft ranglega niður: „bangsann", „bílinn", „vagninn", ALDREI „bangsan", „bílin", „vagnin". Ef þú ert ekki viss um beygingu orðs skaltu umorða spurninguna svo orðið standi í nefnifalli, eða nota nákvæmlega þá mynd sem foreldrið skrifaði sjálft.
- HÁMARK 25 orð. Enginn inngangur. Aldrei byrja á „Geturðu lýst", „Gætirðu lýst", „Viltu segja mér" eða „Hvernig leið þér". Engin löng bandstrik (—), vandað og eðlilegt íslenskt mál.`;

  const depthNote = wantNewAngle
    ? (isEn
        ? "The last answer was short and the fixed questions are done. Choose new_angle and open a genuinely NEW area of this chapter, unless everything meaningful is already covered, then next_anchor."
        : "Síðasta svar var stutt og föstu spurningarnar eru búnar. Veldu new_angle og opnaðu ALVEG NÝTT svið í kaflanum, nema allt sem skiptir máli sé þegar komið fram, þá next_anchor.")
    : isEn
    ? (threadDepth >= 3
        ? "Thread depth limit reached: do NOT choose dig."
        : "You may dig deeper into the story (dig).")
    : (threadDepth >= 3
        ? "Hámarksdýpt þráðar er náð: EKKI velja dig."
        : "Þú mátt kafa dýpra í söguna (dig).");

  const userPrompt = isEn
    ? `${profile ? `About the child: ${profile}\n\n` : ""}Context from other chapters:\n${overallContext}\nCurrent chapter: ${ch.title}\nConversation in this chapter:\n${history}\n\nALREADY ASKED (never repeat):\n${previousTopics}\n\n${depthNote}\nMOST RECENT ANSWER: "${lastAnswer}"\n\nReply with the JSON object only:`
    : `${profile ? `Um barnið: ${profile}\n\n` : ""}Heildarsamhengi úr öðrum köflum:\n${overallContext}\nNúverandi kafli: ${ch.title}\nSamtalið í þessum kafla:\n${history}\n\nÞEGAR SPURT (aldrei endurtaka):\n${previousTopics}\n\n${depthNote}\nSÍÐASTA SVAR: "${lastAnswer}"\n\nSvaraðu eingöngu með JSON hlutnum:`;

  // Lagt hitastig: JSON-akvordun, ekki skapandi prosi
  const raw = await callGemini(systemInstruction, userPrompt, false, 512, 0.2);
  const decision = parseDecision(raw);
  console.log("Spyrill ákvörðun:", decision, "| hrátt:", String(raw).slice(0, 200));
  return decision;
}
