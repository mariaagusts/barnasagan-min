// ══════════════════════════════════════════════
//  CHAPTERS — Barnasagan
// ══════════════════════════════════════════════
import { S } from './state.js';

export const CHAPTERS = [
  {
    id: 0, emoji: "🍼", title: "Nýja lífið",
    desc: "Fæðingin, nafnið og fyrstu klukkustundirnar",
    seeds: [
      { text: "Hvað heitir barnið þitt og hvenær og hvar fæddist það?", isCore: true },
      { text: "Hversu þungt og langt var barnið við fæðingu?", isCore: false },
      { text: "Gekk barninu vel að halda þyngd eftir fæðinguna? Var það duglegt að drekka mjólk?", isCore: false },
      { text: "Hvernig var dagurinn sem barnið kom í heiminn, hvernig leið ykkur sem tókuð á móti því?", isCore: true },
      { text: "Hvernig fékk það nafnið sem það fékk? Er saga á bak við það?", isCore: true }
    ]
  },
  {
    id: 1, emoji: "👶", title: "Fyrstu skrefin",
    desc: "Fyrstu orð, fyrstu skref og þroskinn",
    seeds: [
      { text: "Hvenær fór barnið að ganga og manst þú eftir því augnabliki?", isCore: true },
      { text: "Hver voru fyrstu orðin sem barnið sagði og hvernig brást fjölskyldan við?", isCore: false },
      { text: "Hvernig var barnið sem ungabarn, rólegt eða kröftugt, fyndið eða þrjóskt?", isCore: true },
      { text: "Manstu eftir fyrsta brosinu og hvenær það kom?", isCore: false }
    ]
  },
  {
    id: 2, emoji: "🌟", title: "Karakterinn og einkennin",
    desc: "Hvað gerir þetta barn að einstakling",
    seeds: [
      { text: "Hvernig myndir þú lýsa persónu barnsins með þremur orðum?", isCore: true },
      { text: "Hvað er það sem gerir barnið þitt að einstaklingi, eitthvað sem lýsir því vel?", isCore: true }
    ]
  },
  {
    id: 3, emoji: "🎮", title: "Leikur og hugmyndaflug",
    desc: "Hvernig barnið leikur sér og hvað hrífur það mest",
    seeds: [
      { text: "Hver er uppáhalds leikurinn eða leikfangið hjá barninu?", isCore: true },
      { text: "Á barnið einhvern ímyndaðan heim eða persónur sem það leikur sér alltaf í?", isCore: true },
      { text: "Hvernig leikur barnið sér, eitt, með öðrum eða í hópi?", isCore: false }
    ]
  },
  {
    id: 4, emoji: "📚", title: "Skólinn og nám",
    desc: "Fyrsti skóladagurinn og lærdómurinn",
    seeds: [
      { text: "Hvernig var fyrsti skóladagurinn, hvernig leið barninu og hvernig leið þér?", isCore: true },
      { text: "Í hvaða námsgreinum blómstrar barnið og hverjar reynast barninu erfiðari?", isCore: true },
      { text: "Er einhver kennari sem hefur haft sérstök áhrif á barnið?", isCore: false }
    ]
  },
  {
    id: 5, emoji: "👫", title: "Vinir og félagslíf",
    desc: "Bestu vinir og leikfélagar",
    seeds: [
      { text: "Á barnið besta vin eða vinkonu? Segðu mér frá þeim.", isCore: true },
      { text: "Hvernig er félagslíf barnsins, finnst því betra að vera í hópi eða einsamalt?", isCore: false },
      { text: "Er einhver uppáhaldsminnig frá leikjum eða tómstundum með vinum?", isCore: true }
    ]
  },
  {
    id: 6, emoji: "🎨", title: "Áhugamál og tómstundir",
    desc: "Það sem barnið elskar að gera",
    seeds: [
      { text: "Hvað er barnið að gera þegar það er ánægt, þ.e. uppáhalds tómstundin?", isCore: true },
      { text: "Er eitthvað sem barnið er sérstaklega hrifið af, íþrótt, tónlist, list eða eitthvað annað?", isCore: true },
      { text: "Hvað getur barnið gert í langan tíma án þess að leiðast?", isCore: false }
    ]
  },
  {
    id: 7, emoji: "🏠", title: "Fjölskyldan og heimilið",
    desc: "Heimilið og náinn hringur barnsins",
    seeds: [
      { text: "Hvernig er barnið í samskiptum við sína nánustu og þá sem standa ykkur næst?", isCore: false },
      { text: "Er einhver hluti af daglegu lífi heimilisins sem barnið elskar sérstaklega?", isCore: true },
      { text: "Hvernig myndi barnið lýsa heimilinu sínu ef þú spyrðir það?", isCore: true }
    ]
  },
  {
    id: 8, emoji: "😂", title: "Fyndnar minningar",
    desc: "Þau augnablik sem við hlæjum enn að",
    seeds: [
      { text: "Er einhver fyndin saga frá bernsku barnsins sem þú munt aldrei gleyma?", isCore: true },
      { text: "Hefur barnið sagt eitthvað óvænt eða skemmtilegt sem þú myndir gjarnan vilja skrá niður?", isCore: true },
      { text: "Manst þú eftir einhverjum augnablikum þar sem þið hlóguð saman af öllu hjarta?", isCore: false }
    ]
  },
  {
    id: 9, emoji: "💪", title: "Áskoranir og vöxtur",
    desc: "Erfiðleikar sem barnið hefur sigrað",
    seeds: [
      { text: "Er eitthvað sem hefur verið erfitt fyrir barnið, og hvernig tókst því að komast í gegnum það?", isCore: true },
      { text: "Hvernig bregst barnið við þegar eitthvað gengur ekki upp?", isCore: false },
      { text: "Manst þú eftir augnabliki þar sem barnið sýndi mikinn þroska eða kom þér á óvart með nýrri hlið á sjálfu sér?", isCore: true }
    ]
  },
  {
    id: 10, emoji: "✨", title: "Sérstakar minningar",
    desc: "Augnablik sem sitja eftir",
    seeds: [
      { text: "Hver er uppáhalds minning þín með barninu þínu hingað til?", isCore: true },
      { text: "Er einhver dagur sem þú myndir vilja upplifa aftur með barninu?", isCore: false },
      { text: "Áttu eitthvað augnablik með barninu þínu þar sem þú hugsar: þessu mun ég aldrei gleyma?", isCore: true }
    ]
  },
  {
    id: 11, emoji: "🌈", title: "Vonir og framtíðin",
    desc: "Von og óskir fyrir barnið",
    seeds: [
      { text: "Veistu hvað barnið þitt dreymir um að verða þegar það er orðið stórt (að svo stöddu)?", isCore: false },
      { text: "Hvaða ósk eða von hefur þú sem foreldri fyrir barnið þitt?", isCore: true },
      { text: "Ef barnið þitt gæti lesið þessa bók eftir 20 ár, hvað myndirðu vilja að það vissi?", isCore: true }
    ]
  }
];

export const CHAPTERS_EN = [
  {
    id: 0, emoji: "🍼", title: "The Arrival",
    desc: "Birth, the name and the first hours",
    seeds: [
      { text: "What is your child's name, and when and where were they born?", isCore: true },
      { text: "What was your child's birth weight and length?", isCore: false },
      { text: "Did your child have any difficulty maintaining weight after birth? Were they good at feeding?", isCore: false },
      { text: "What was the day your child arrived like, and how did you feel as a parent?", isCore: true },
      { text: "How did your child get their name? Is there a story behind it?", isCore: true }
    ]
  },
  {
    id: 1, emoji: "👶", title: "First Steps",
    desc: "First words, first steps and early development",
    seeds: [
      { text: "When did your child start walking, and do you remember that moment?", isCore: true },
      { text: "What were the first words your child said, and how did the family react?", isCore: false },
      { text: "What was your child like as a baby, calm or lively, funny or stubborn?", isCore: true },
      { text: "Do you remember your child's first smile, and when it came?", isCore: false }
    ]
  },
  {
    id: 2, emoji: "🌟", title: "Personality & Character",
    desc: "What makes this child unique",
    seeds: [
      { text: "How would you describe your child's personality in three words?", isCore: true },
      { text: "What is it that makes your child distinctly themselves, something that is completely them?", isCore: true }
    ]
  },
  {
    id: 3, emoji: "🎮", title: "Play & Imagination",
    desc: "How your child plays and what captivates them",
    seeds: [
      { text: "What is your child's favourite game or toy?", isCore: true },
      { text: "Does your child have a favourite imaginary world or fantasy world they return to?", isCore: true },
      { text: "How does your child prefer to play, alone, with others, or in a group?", isCore: false }
    ]
  },
  {
    id: 4, emoji: "📚", title: "School & Learning",
    desc: "The first school day and the joy of learning",
    seeds: [
      { text: "What was the first day of school like, for your child and for you?", isCore: true },
      { text: "Which subjects does your child enjoy most, and which less?", isCore: true },
      { text: "Has a teacher had a special influence on your child?", isCore: false }
    ]
  },
  {
    id: 5, emoji: "👫", title: "Friends & Social Life",
    desc: "Best friends and playmates",
    seeds: [
      { text: "Does your child have a best friend? Tell me about them.", isCore: true },
      { text: "What is your child's social life like, do they enjoy being in a group or prefer their own company?", isCore: false },
      { text: "Is there a favourite memory from playing or spending time with friends?", isCore: true }
    ]
  },
  {
    id: 6, emoji: "🎨", title: "Hobbies & Interests",
    desc: "What your child loves to do",
    seeds: [
      { text: "What is your child doing when they are happiest, their favourite pastime?", isCore: true },
      { text: "Is there a sport, art form or special interest your child is particularly into?", isCore: true },
      { text: "Is there something your child can do for hours without noticing the time?", isCore: false }
    ]
  },
  {
    id: 7, emoji: "🏠", title: "Family & Home",
    desc: "Home life and the child's close circle",
    seeds: [
      { text: "How is your child with close family and the people nearest to them?", isCore: false },
      { text: "Is there a part of your daily home life that your child especially loves?", isCore: true },
      { text: "How would your child describe their home if you asked them?", isCore: true }
    ]
  },
  {
    id: 8, emoji: "😂", title: "Funny Memories",
    desc: "Those moments we still laugh about",
    seeds: [
      { text: "Is there a funny story from your child's early years that you will never forget?", isCore: true },
      { text: "Has your child said something unexpected or funny that you would love to write down?", isCore: true },
      { text: "When did you laugh the most together, you and your child?", isCore: false }
    ]
  },
  {
    id: 9, emoji: "💪", title: "Challenges & Growth",
    desc: "Difficulties your child has overcome",
    seeds: [
      { text: "Has your child faced something difficult, and how did they handle it?", isCore: true },
      { text: "How does your child react when something does not go their way?", isCore: false },
      { text: "In what way has your child grown most, a moment where you watched them truly develop?", isCore: true }
    ]
  },
  {
    id: 10, emoji: "✨", title: "Special Memories",
    desc: "Moments that stay with you",
    seeds: [
      { text: "What is your favourite memory with your child so far?", isCore: true },
      { text: "Is there a day you would love to relive with your child?", isCore: false },
      { text: "What moment with your child has made you think: I will never forget this?", isCore: true }
    ]
  },
  {
    id: 11, emoji: "🌈", title: "Hopes & The Future",
    desc: "Hopes and wishes for your child",
    seeds: [
      { text: "What does your child dream about, what do they want to be when they grow up?", isCore: false },
      { text: "What wish or hope do you hold as a parent for your child?", isCore: true },
      { text: "If your child could read this book in 20 years, what do you want them to know?", isCore: true }
    ]
  }
];

export const STORY_STYLES = {
  hlylegt: {
    label: "💛 Persónulegt",
    desc: "Hlýtt og náið málfar. Eins og foreldri sé að segja barninu frá.",
    labelEn: "💛 Warm",
    descEn: "Warm and tender. Like a parent sharing memories with their child.",
    prompt: `Þú ert vandaður íslenskur ritstjóri sem skrifar af mikilli hlýju um hversdagsleg og dýrmæt augnablik í lífi barns.
    Skrifaðu í þriðju persónu um barnið (nafn barnsins, eða „hann/hún/það").
    Tónn: Mildur, náinn og einlægur. Eins og foreldri sé að rifja upp fallega stund í dagbók.
    Málfar: Notaðu blæbrigðaríka íslensku (t.d. „að dunda sér", „að fylgjast með af kátínu", „hjartað fylltist stolti").
    MIKILVÆGT: Flettu yfir ÖLL smáatriði úr svörunum og flettu þeim inn í frásögnina: nöfn, dagsetningar, klukkan, staðir, þyngd, lengd, nöfn lækna eða ljósmæðra, veðrið, nöfn afa og ömmu, hvenær nefning fór fram, o.s.frv. Ekkert smáatriði er of lítið. Þetta eru dýrmætar minningar sem eigendurnir vilja finna í frásögninni.
    Engar niðurstöðusetningar eða klisjur eins og „þessi minning mun lifa". Engin lofgjörð í lokin.
    Bættu ALDREI við sérstökum nöfnum, dýrum, stöðum eða atburðum sem ekki eru nefnd beint í svörunum.
    Leyfðu frásögninni að enda á náttúrulegan hátt.

    MIKILVÆGT: Forðastu of tilfinningasaman eða dramatískan texta. Haltu tóninum einlægum, hófsömum og á jörðinni. Einbeittu þér að hljóðlægum sannleika augnabliksins fremur en mikilfenglegar tilfinningalegar fullyrðingar.

    DÆMI UM RÉTTAN TÓN:
    „Hún fór alltaf beina leið í dótakassann um leið og hún kom inn úr dyrunum. Ekkert stúss, engar tafir – bara beint í leikinn. Við gátum ekki annað en brosað að þessari einbeitni."`,
    promptEn: `You are a skilled editor crafting a warm and tender children's story in English.
    Write in the third person about the child (the child's name, or "he/she/they").
    Tone: Warm, affectionate, and close, like a parent describing their child.
    IMPORTANT: Weave ALL specific details from the answers into the narrative: names, dates, times, places, weights, lengths, names of doctors or midwives, weather, grandparent names, when the naming ceremony took place, etc. No detail is too small. These are precious memories that the family wants to find reflected in the story.
    Do not use concluding moral sentences or AI praise. Let the story end naturally.
    NEVER introduce specific names, animals, places, or events not directly mentioned in the answers.
    Show, don't tell. Focus on sensory details and the emotional bond and the child's unique personality traits.
    IMPORTANT: Avoid overly sentimental, dramatic, or 'Hallmark-style' language. Keep the tone grounded, authentic, and sincere. Focus on the quiet truth of the moment rather than grand emotional statements.

    EXAMPLE OF THE CORRECT TONE:
    "She always went straight to the toy box when she came home. No hello, no stopping, just straight to it. We always laughed at that speed."`
  },
  gamansamur: {
    label: "😄 Gamansamur",
    desc: "Líflegur og léttur tónn með glettni og hlátri.",
    labelEn: "😄 Playful",
    descEn: "Lively and light-hearted with a touch of mischief and laughter.",
    prompt: `Þú ert skemmtilegur sögumaður sem grípur kómískar hliðar barnæskunnar og sérvisku barnsins með glimt í auga.
    Skrifaðu í þriðju persónu um barnið.
    Tónn: Léttur, skemmtilegur og örlítið kaldhæðinn á kærleiksríkan hátt.
    Málfar: Notaðu líflegt myndmál (t.d. „lýsti yfir heilögu stríði", „sá strax í gegnum bragðið", „ekki á dagskrá").
    MIKILVÆGT: Forðastu að útskýra brandarann í lokin eða segja „við hlógum mikið". Láttu atvikið tala fyrir sig.
    Þú mátt lýsa andrúmslofti og samhengi sem má ráða af svörunum, en bættu ALDREI við sérstökum nöfnum, dýrum, stöðum eða atburðum sem ekki eru nefnd beint í svörunum.
    Gættu þess að málfræði sé rétt og falli að íslenskri málkennd.
    Show, don't tell. Einbeittu þér að skynfæraloýsingum og innri einræðu frekar en að draga saman atburði.

    MIKILVÆGT: Forðastu of tilfinningasaman eða dramatískan texta. Haltu tóninum einlægum, hófsömum og á jörðinni. Einbeittu þér að hljóðlægum sannleika augnabliksins fremur en mikilfenglegar tilfinningalegar fullyrðingar.

    DÆMI UM RÉTTAN TÓN:
    „Hann neitaði alfarið að viðurkenna tilvist grænmetis. Það mátti ekki vera á diskinum og helst ekki í sama póstnúmeri. Tilraunir okkar til að kalla spergilkál 'lítil tré' voru dæmdar til að mistakast – hann lét ekki blekkja sig."`,
    promptEn: `You are a storyteller writing a playful and funny children's story in English.
    Write in the third person about the child.
    Tone: Cheerful, mischievous and warm, like funny memories being shared at a family gathering.
    IMPORTANT: Do not add moral summaries or wrap-up sentences at the end.
    You may describe atmosphere and context implied by the answers, but NEVER introduce specific names, animals, places, or events not directly mentioned in the answers.
    Show, don't tell. Focus on sensory details and internal monologue instead of summarizing events.

    IMPORTANT: Avoid overly sentimental, dramatic, or 'Hallmark-style' language. Keep the tone grounded, authentic, and sincere. Focus on the quiet truth of the moment rather than grand emotional statements.

    EXAMPLE OF THE CORRECT TONE:
    "She had a strict no-vegetables policy. Not on the plate, not near the food, preferably not in the same room. We tried to rebrand broccoli as 'trees.' It did not go well."`
  },
  barnid_segir: {
    label: "🧒 Barnið segir",
    desc: "Frásagnin er í fyrstu persónu, eins og barnið sé að segja sína eigin sögu.",
    labelEn: "🧒 Child Speaks",
    descEn: "The story is told in first person, as if the child is telling their own story.",
    prompt: `Þú skrifar út frá sjónarhóli barnsins á máli sem er einfalt en þó vandað og eðlilegt.
    Skrifaðu í fyrstu persónu (ég-form) frá sjónarhorni barnsins.
    Tónn: Milliliðalaus, einlægur og forvitinn. Textinn á að endurspegla hvernig barn upplifir heiminn.
    Málfar: Stuttar setningar og eðlilegt barnamál (t.d. „mér fannst", „það var svo gaman", „ég hlakkaði svo mikið til"). Gættu þess að beygja sagnir rétt (ekki „mér líkaði" heldur „mér fannst gaman").
    MIKILVÆGT: Engin „fullorðinsleg" djúphugsun eða tilgerð.
    Þú mátt lýsa andrúmslofti og samhengi sem má ráða af svörunum, en bættu ALDREI við sérstökum nöfnum, dýrum, stöðum eða atburðum sem ekki eru nefnd beint í svörunum.
    Show, don't tell. Einbeittu þér að skynfæraloýsingum og innri einræðu frekar en að draga saman atburði.

    MIKILVÆGT: Forðastu of tilfinningasaman eða dramatískan texta. Haltu tóninum einlægum, hófsömum og á jörðinni. Einbeittu þér að einlægum sannleika barnsins fremur en mikilfenglegar tilfinningalegar fullyrðingar.

    DÆMI UM RÉTTAN TÓN:
    „Mér fannst langskemmtilegast í skólanum þegar við fórum í leikfimi. Stærðfræðin var dálítið erfið en tíminn var fljótur að líða þegar Guðrún kennari fór að lesa söguna fyrir okkur."`,
    promptEn: `You are a skilled editor writing a children's story in the first person, as if the child themselves is narrating.
    Write in the first person (I) from the child's perspective.
    Tone: Direct, sincere and childlike, as if a child is describing their life honestly.
    IMPORTANT: No adult conclusions or moral summaries. Keep the childlike viewpoint without sounding forced or saccharine. Avoid vocabulary that is too sophisticated for a child. Use shorter sentences to mimic a natural youthful voice. Avoid forced 'cuteness'.
    You may describe atmosphere and context implied by the answers, but NEVER introduce specific names, animals, places, or events not directly mentioned in the answers.
    Show, don't tell. Focus on sensory details and the emotional bond and the child's unique personality traits.
    IMPORTANT: Avoid overly sentimental, dramatic, or 'Hallmark-style' language. Keep the tone grounded, authentic, and sincere. Focus on the quiet truth of the moment rather than grand emotional statements.

    EXAMPLE OF THE CORRECT TONE:
    "I liked school except when we had maths. Maths was boring. I liked break time much better, and PE, and when our teacher Guðrún read aloud to us."`
  },
  aventurulegur: {
    label: "🦄 Ævintýralegur",
    desc: "Töfrandi og ljóðrænn. Eins og klassísk bresk barnabók.",
    labelEn: "🦄 Adventurous",
    descEn: "Magical and whimsical. Like a classic British bedtime story.",
    prompt: `Þú ert sögumaður sem vefur galdrakennd og ljóðræna barnabók í þriðju persónu.
    Tónn: Undrunarfullur og töfrandi, eins og klassísk kvöldsögulestur (A.A. Milne-stíll). Einbeittu þér að töfranum í smáhlutum: „risavaxið" tré í garðinum, „leynileg tunga" uppáhaldslíkansins, ævintýrið á rigninga degi.
    MIKILVÆGT: Settu töfrann í samhengi við þær staðreyndir sem foreldri gefur upp. Notaðu lifrænt og skynfæraríkt myndmál. Forðastu sykraðar eða dramatískar tilfinningalýsingar. Engin AI-hrós eða siðrænar upphrópanir. Endaðu á þögnullu og svífandi nótu.
    Þú mátt lýsa andrúmslofti sem má ráða af svörunum, en bættu ALDREI við sérstökum nöfnum, dýrum, stöðum eða atburðum sem ekki eru nefnd beint.
    Notaðu ## á undan fyrirsögn hvers kafla.

    DÆMI UM RÉTTAN TÓN:
    „Fyrir henni var bakgarðurinn ekki bara gras og girðing heldur töfraheimur þar sem gamla eikartréð geymdi öll leyndarmálin. Hún klæddist bláu stígvélunum sínum hvern einasta dag, tilbúin í ný ævintýri sem gætu leynst handan við næsta horn."`,
    promptEn: `You are a storyteller crafting a magical and whimsical children's book in the third person.
    Tone: Wonder-filled, lyrical, and enchanting — like a classic British bedtime story (e.g., A.A. Milne). Focus on the magic in small things: the 'giant' trees in the garden, the 'secret language' of a favourite toy, or the adventure of a rainy day.
    IMPORTANT: Ground the magic in the user's facts. Use vivid, sensory imagery. Avoid sugary or overly dramatic sentimentality. No AI-praise or moralizing. End on a quiet, lingering note.
    NEVER introduce specific names, animals, places, or events not directly mentioned in the answers.
    Use ## before each chapter heading.

    EXAMPLE OF THE CORRECT TONE:
    "To her, the backyard wasn't just grass and a fence; it was a kingdom where the old oak tree kept all the secrets. She wore her blue boots every single day, ready for whatever adventure might hop across the path."`
  },
  hrein_frasogn: {
    label: "📄 Hrein frásögn",
    desc: "Einföld og bein skráning. Það sem gerðist, eins og það gerðist.",
    labelEn: "📄 Plain Narrative",
    descEn: "Simple and straightforward. What happened, as it happened.",
    prompt: `Þú ert ritstjóri sem skrásetur sögu barnsins á skýran og fallegan hátt, svipað og í vandaðri ævisögu.
    Skrifaðu í þriðju persónu um barnið.
    Tónn: Hlutlægur en hlýr, fágaður og skipulagður. Hentar vel fyrir ættfræði og staðreyndir.
    Málfar: Notaðu rétt heiti á stöðum og stofnunum (t.d. „Landspítalinn", „skírður í höfuðið á"). Forðastu of mörg lýsingarorð.
    MIKILVÆGT: Engar tilfinningasemi eða upphrópanir. Halda skal skýrri strúktúr.
    Haltu þér við það sem foreldri sagði. Bættu ekki við túlkunum eða þínum eigin efni.
    Show, don't tell. Einbeittu þér að skynfæraloýsingum frekar en að draga saman atburði.

    DÆMI UM RÉTTAN TÓN:
    „Hún fæddist 14. mars árið 2019 á Landspítalanum í Reykjavík. Nafnið Sigríður fékk hún í höfuðið á föðurömmu sinni. Við vissum ekki kynið fyrirfram og fögnuðum því mikið þegar við eignuðumst litla stúlku."`,
    promptEn: `You are a precise editor transforming a parent's answers into a clean and straightforward children's story in English.
    Write in the third person about the child.
    Tone: Objective, clear and simple. No emotional flourishes, no embellishments.
    Stay close to what the parent said. Do not add interpretations or your own material.
    IMPORTANT: No conclusions, moral summaries, or AI filler sentences.
    Let the narrative end naturally when the content is done.
    Show, don't tell. Focus on sensory details and internal monologue instead of summarizing events.

    EXAMPLE OF THE CORRECT TONE:
    "She was born on 14 March 2019 at the National Hospital in Reykjavík. The name Sigríður came from her paternal grandmother. We did not know the gender in advance, and when we heard it was a girl we both laughed."`
  }
};

export function getChapters() {
  return S.lang === "en" ? CHAPTERS_EN : CHAPTERS;
}
