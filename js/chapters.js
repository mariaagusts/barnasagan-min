// ══════════════════════════════════════════════
//  CHAPTERS — Barnasagan
// ══════════════════════════════════════════════
import { S } from './state.js';

export const CHAPTERS = [
  {
    id: 0, emoji: "🍼", title: "Nýja lífið",
    desc: "Fæðingin, nafnið og fyrstu klukkustundirnar",
    seeds: [
      "Hvað heitir barnið þitt og hvenær og hvar fæddist það?",
      "Hvernig var dagurinn sem barnið kom í heiminn, hvernig leið ykkur, foreldrunum?",
      "Hvernig fékk það nafnið sem það fékk? Er saga á bak við það?"
    ]
  },
  {
    id: 1, emoji: "👶", title: "Fyrstu skrefin",
    desc: "Fyrstu orð, fyrstu skref og þroskinn",
    seeds: [
      "Hvenær fór barnið að ganga og manst þú eftir því augnabliki?",
      "Hver voru fyrstu orðin sem barnið sagði og hvernig brást fjölskyldan við?",
      "Hvernig var barnið sem ungabarn, rólegt eða kröftugt, fyndið eða þrjóskt?"
    ]
  },
  {
    id: 2, emoji: "🌟", title: "Karakterinn og einkennin",
    desc: "Hvað gerir þetta barn að einstakling",
    seeds: [
      "Hvernig myndir þú lýsa persónu barnsins með þremur orðum?",
      "Hvað er það sem gerir barnið þitt að einstakling, eitthvað sem lýsir þessu barni vel?"
    ]
  },
  {
    id: 3, emoji: "🎮", title: "Leikur og hugmyndaflug",
    desc: "Hvernig barnið leikur sér og hvað hrífur það mest",
    seeds: [
      "Hver er uppáhalds leikurinn eða leikfangið hjá barninu?",
      "Á barnið einhvern ímyndaðan heim eða persónur sem það leikur sér alltaf í?",
      "Hvernig leikur barnið sér, eitt, með systkinum eða vinum?"
    ]
  },
  {
    id: 4, emoji: "📚", title: "Skólinn og nám",
    desc: "Fyrsti skóladagurinn og lærdómurinn",
    seeds: [
      "Hvernig var fyrsti skóladagurinn, hvernig leið barninu og hvernig leið þér?",
      "Í hvaða námsgreinum blómstrar barnið og hverjar reynast barninu erfiðari?",
      "Er einhver kennari sem hefur haft sérstök áhrif á barnið?"
    ]
  },
  {
    id: 5, emoji: "👫", title: "Vinir og félagslíf",
    desc: "Bestu vinir og leikfélagar",
    seeds: [
      "Á barnið besta vin? Segðu frá honum/henni.",
      "Hvernig er félagslíf barnsins, finnst því betra að vera í hópi eða einsamalt?",
      "Er einhver uppáhaldsminnig frá leikjum eða tómstundum með vinum?"
    ]
  },
  {
    id: 6, emoji: "🎨", title: "Áhugamál og tómstundir",
    desc: "Það sem barnið elskar að gera",
    seeds: [
      "Hvað er barnið að gera þegar það er ánægt, þ.e. uppáhalds tómstundin?",
      "Er eitthvað sem barnið er sérstaklega hrifið af, íþrótt, tónlist, list eða eitthvað annað?",
      "Hvað getur barnið gert í langan tíma án þess að leiðast?"
    ]
  },
  {
    id: 7, emoji: "🏠", title: "Fjölskyldan og heimilið",
    desc: "Heimilið, foreldrar og systkini",
    seeds: [
      "Hvernig er barnið í samskiptum við systkini eða nána fjölskyldu?",
      "Er einhver hluti af daglegu lífi heimilisins sem barnið elskar sérstaklega?",
      "Hvernig myndi barnið lýsa heimilinu sínu ef þú spyrðir það?"
    ]
  },
  {
    id: 8, emoji: "😂", title: "Fyndnar minningar",
    desc: "Þau augnablik sem við hlæjum enn að",
    seeds: [
      "Er einhver fyndin saga frá bernsku barnsins sem þú munt aldrei gleyma?",
      "Hefur barnið sagt eitthvað óvænt eða skemmtilegt sem þú myndir gjarnan vilja skrá niður?",
      "Manst þú eftir einhverjum augnablikum þar sem þið hlóguð saman af öllu hjarta?"
    ]
  },
  {
    id: 9, emoji: "💪", title: "Áskoranir og vöxtur",
    desc: "Erfiðleikar sem barnið hefur sigrað",
    seeds: [
      "Er eitthvað sem hefur verið erfitt fyrir barnið, og hvernig tókst því að komast í gegnum það?",
      "Hvernig bregst barnið við þegar eitthvað gengur ekki upp?",
      "Í hvaða aðstæðum hefur barnið vaxið mest, eitthvað sem gerðist þar sem þú sást það þroskast?"
    ]
  },
  {
    id: 10, emoji: "✨", title: "Sérstakar minningar",
    desc: "Augnablik sem sitja eftir",
    seeds: [
      "Hver er uppáhalds minning þín með barninu þínu hingað til?",
      "Er einhver dagur sem þú myndir vilja upplifa aftur með barninu?",
      "Áttu eitthvað augnablik með barninu þínu þar sem þú hugsar, \"þessu mun ég aldrei gleyma\"?"
    ]
  },
  {
    id: 11, emoji: "🌈", title: "Vonir og framtíðin",
    desc: "Von og óskir fyrir barnið",
    seeds: [
      "Hvað dreymir barnið um, hvað vill það verða þegar það verður stórt?",
      "Hvaða ósk eða von hefur þú sem foreldri fyrir barnið þitt?",
      "Ef barnið gæti lesið þessa bók eftir 20 ár, hvað viltu að það vissi?"
    ]
  }
];

export const CHAPTERS_EN = [
  {
    id: 0, emoji: "🍼", title: "The Arrival",
    desc: "Birth, the name and the first hours",
    seeds: [
      "What is your child's name, and when and where were they born?",
      "What was the day your child arrived like — how did you feel as a parent?",
      "How did your child get their name? Is there a story behind it?"
    ]
  },
  {
    id: 1, emoji: "👶", title: "First Steps",
    desc: "First words, first steps and early development",
    seeds: [
      "When did your child start walking, and do you remember that moment?",
      "What were the first words your child said, and how did the family react?",
      "What was your child like as a baby — calm or lively, funny or stubborn?"
    ]
  },
  {
    id: 2, emoji: "🌟", title: "Personality & Character",
    desc: "What makes this child unique",
    seeds: [
      "How would you describe your child's personality in three words?",
      "What is it that makes your child distinctly themselves — something that is completely them?"
    ]
  },
  {
    id: 3, emoji: "🎮", title: "Play & Imagination",
    desc: "How your child plays and what captivates them",
    seeds: [
      "What is your child's favourite game or toy?",
      "Does your child have a favourite imaginary world or fantasy world they return to?",
      "How does your child prefer to play — alone, with siblings, or with friends?"
    ]
  },
  {
    id: 4, emoji: "📚", title: "School & Learning",
    desc: "The first school day and the joy of learning",
    seeds: [
      "What was the first day of school like — for your child and for you?",
      "Which subjects does your child enjoy most, and which less?",
      "Has a teacher had a special influence on your child?"
    ]
  },
  {
    id: 5, emoji: "👫", title: "Friends & Social Life",
    desc: "Best friends and playmates",
    seeds: [
      "Does your child have a best friend? Tell me about them.",
      "What is your child's social life like — do they enjoy being in a group or prefer their own company?",
      "Is there a favourite memory from playing or spending time with friends?"
    ]
  },
  {
    id: 6, emoji: "🎨", title: "Hobbies & Interests",
    desc: "What your child loves to do",
    seeds: [
      "What is your child doing when they are happiest — their favourite pastime?",
      "Is there a sport, art form or special interest your child is particularly into?",
      "Is there something your child can do for hours without noticing the time?"
    ]
  },
  {
    id: 7, emoji: "🏠", title: "Family & Home",
    desc: "Home life, parents and siblings",
    seeds: [
      "How is your child with siblings or close family members?",
      "Is there a part of your daily home life that your child especially loves?",
      "How would your child describe their home if you asked them?"
    ]
  },
  {
    id: 8, emoji: "😂", title: "Funny Memories",
    desc: "Those moments we still laugh about",
    seeds: [
      "Is there a funny story from your child's early years that you will never forget?",
      "Has your child said something unexpected or funny that you would love to write down?",
      "When did you laugh the most together — you and your child?"
    ]
  },
  {
    id: 9, emoji: "💪", title: "Challenges & Growth",
    desc: "Difficulties your child has overcome",
    seeds: [
      "Has your child faced something difficult — and how did they handle it?",
      "How does your child react when something does not go their way?",
      "In what way has your child grown most — a moment where you watched them truly develop?"
    ]
  },
  {
    id: 10, emoji: "✨", title: "Special Memories",
    desc: "Moments that stay with you",
    seeds: [
      "What is your favourite memory with your child so far?",
      "Is there a day you would love to relive with your child?",
      "What moment with your child has made you think: I will never forget this?"
    ]
  },
  {
    id: 11, emoji: "🌈", title: "Hopes & The Future",
    desc: "Hopes and wishes for your child",
    seeds: [
      "What does your child dream about — what do they want to be when they grow up?",
      "What wish or hope do you hold as a parent for your child?",
      "If your child could read this book in 20 years — what do you want them to know?"
    ]
  }
];

export const STORY_STYLES = {
  hlylegt: {
    label: "💛 Hlýlegt",
    desc: "Hlýtt og náið málfar. Eins og foreldri sé að segja barninu frá.",
    labelEn: "💛 Warm",
    descEn: "Warm and tender. Like a parent sharing memories with their child.",
    prompt: `Þú ert vandaður íslenskur ritstjóri sem skrifar af mikilli hlýju um hversdagsleg og dýrmæt augnablik í lífi barns.
    Skrifaðu í þriðju persónu um barnið (nafn barnsins, eða „hann/hún/það").
    Tónn: Mildur, náinn og einlægur. Eins og foreldri sé að rifja upp fallega stund í dagbók.
    Málfar: Notaðu blæbrigðaríka íslensku (t.d. „að dunda sér", „að fylgjast með af kátínu", „hjartað fylltist stolti").
    MIKILVÆGT: Engar niðurstöðusetningar eða klisjur eins og „þessi minning mun lifa". Engin lofgjörð í lokin.
    Leyfðu frásögninni að enda á náttúrulegan hátt.

    DÆMI UM RÉTTAN TÓN:
    „Hún fór alltaf beina leið í dótakassann um leið og hún kom inn úr dyrunum. Engar tafir, ekkert stúss – bara beint í leikinn. Við gátum ekki annað en brosað að þessari einbeitni."`,
    promptEn: `You are a skilled editor crafting a warm and tender children's story in English.
    Write in the third person about the child (the child's name, or "he/she/they").
    Tone: Warm, affectionate, and close — like a parent describing their child.
    IMPORTANT: No AI praise or commentary at the end of chapters.
    Do not use concluding moral sentences. Let the story end naturally.

    EXAMPLE OF THE CORRECT TONE:
    "She always went straight to the toy box when she came home. No hello, no stopping — just straight to it. We always laughed at that speed."`
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
    Gættu þess að málfræði sé rétt og falli að íslenskri málkennd.

    DÆMI UM RÉTTAN TÓN:
    „Hann neitaði alfarið að viðurkenna tilvist grænmetis. Það mátti ekki vera á diskinum og helst ekki í sama póstnúmeri. Tilraunir okkar til að kalla spergilkál 'lítil tré' voru dæmdar til að mistakast – hann lét ekki blekkja sig."`,
    promptEn: `You are a storyteller writing a playful and funny children's story in English.
    Write in the third person about the child.
    Tone: Cheerful, mischievous and warm — like funny memories being shared at a family gathering.
    IMPORTANT: Do not add moral summaries or wrap-up sentences at the end.

    EXAMPLE OF THE CORRECT TONE:
    "She had a strict no-vegetables policy. Not on the plate, not near the food, preferably not in the same room. We tried to rebrand broccoli as 'trees.' It did not go well."`
  },
  barnid_segir: {
    label: "🧒 Barnið segir",
    desc: "Frásagnin er í fyrstu persónu — eins og barnið sé að segja sína eigin sögu.",
    labelEn: "🧒 Child Speaks",
    descEn: "The story is told in first person — as if the child is telling their own story.",
    prompt: `Þú skrifar út frá sjónarhóli barnsins á máli sem er einfalt en þó vandað og eðlilegt.
    Skrifaðu í fyrstu persónu (ég-form) frá sjónarhorni barnsins.
    Tónn: Milliliðalaus, einlægur og forvitinn. Textinn á að endurspegla hvernig barn upplifir heiminn.
    Málfar: Stuttar setningar og eðlilegt barnamál (t.d. „mér fannst", „það var svo gaman", „ég hlakkaði svo mikið til"). Gættu þess að beygja sagnir rétt (ekki „mér líkaði" heldur „mér fannst gaman").
    MIKILVÆGT: Engin „fullorðinsleg" djúphugsun eða tilgerð.

    DÆMI UM RÉTTAN TÓN:
    „Mér fannst langskemmtilegast í skólanum þegar við fórum í leikfimi. Stærðfræðin var dálítið erfið, en hún var fljót að líða þegar Guðrún kennari fór að lesa söguna fyrir okkur."`,
    promptEn: `You are a skilled editor writing a children's story in the first person — as if the child themselves is narrating.
    Write in the first person (I) from the child's perspective.
    Tone: Direct, sincere and childlike — as if a child is describing their life honestly.
    IMPORTANT: No adult conclusions or moral summaries. Keep the childlike viewpoint without sounding forced or saccharine.

    EXAMPLE OF THE CORRECT TONE:
    "I liked school except when we had maths. Maths was boring. I liked break time much better, and PE, and when our teacher Guðrún read aloud to us."`
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

    DÆMI UM RÉTTAN TÓN:
    „Hún fæddist 14. mars árið 2019 á Landspítalanum í Reykjavík. Nafnið Sigríður fékk hún í höfuðið á föðurömmu sinni. Við ákváðum að láta kynið koma á óvart og fögnuðum því mjög þegar við eignuðumst litla stúlku."`,
    promptEn: `You are a precise editor transforming a parent's answers into a clean and straightforward children's story in English.
    Write in the third person about the child.
    Tone: Objective, clear and simple — no emotional flourishes, no embellishments.
    Stay close to what the parent said. Do not add interpretations or your own material.
    IMPORTANT: No conclusions, moral summaries, or AI filler sentences.
    Let the narrative end naturally when the content is done.

    EXAMPLE OF THE CORRECT TONE:
    "She was born on 14 March 2019 at the National Hospital in Reykjavík. The name Sigríður came from her paternal grandmother. We did not know the gender in advance, and when we heard it was a girl we both laughed."`
  }
};

export function getChapters() {
  return S.lang === "en" ? CHAPTERS_EN : CHAPTERS;
}
