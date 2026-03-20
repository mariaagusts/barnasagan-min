// ══════════════════════════════════════════════
//  CHAPTERS — Barnasagan
// ══════════════════════════════════════════════
import { S } from './state.js';

export const CHAPTERS = [
  {
    id: 0, emoji: "🍼", title: "Koman til heimsins",
    desc: "Fæðingin, nafnið og fyrstu klukkustundirnar",
    seeds: [
      "Hvað heitir barnið þitt og hvenær og hvar fæddist það?",
      "Hvernig var dagurinn sem barnið kom til heimsins — hvernig leið ykkur, foreldrunum?",
      "Hvernig fékkst þú nafnið sem þú fékkst? Er saga á bak við það?"
    ]
  },
  {
    id: 1, emoji: "👶", title: "Fyrstu skrefin",
    desc: "Fyrstu orð, fyrstu skref og þroskinn",
    seeds: [
      "Hvenær fór barnið að ganga og muna þú eftir þeim augnablikum?",
      "Hvað voru fyrstu orðin sem barnið sagði og hvernig brást fjölskyldan við?",
      "Hvernig var barnið sem ungabarn — rólegt eða kröftugt, fyndið eða þverstæðukennt?"
    ]
  },
  {
    id: 2, emoji: "🌟", title: "Persónan og eðlið",
    desc: "Hvað gerir þetta barn að einstakling",
    seeds: [
      "Hvernig myndir þú lýsa persónu barnsins með þremur orðum?",
      "Hvað er það sem gerir barnið þitt að einstakling — eitthvað sem er alveg þetta barn?"
    ]
  },
  {
    id: 3, emoji: "🎮", title: "Leikur og fantasía",
    desc: "Hvernig barnið leikur sér og hvað hrifsar það",
    seeds: [
      "Hvað er uppáhalds leikurinn eða leikfangið hjá barninu?",
      "Hefur barnið uppáhaldsheim í hugsunum sínum — einhvern sérheim eða fantasíuheim?",
      "Hvernig leikur barnið sér — eitt, með systkinum eða vinum?"
    ]
  },
  {
    id: 4, emoji: "📚", title: "Skólinn og nám",
    desc: "Fyrsti skóladagurinn og lærðomurinn",
    seeds: [
      "Hvernig var fyrsti skóladagurinn — hvernig leið barninu og hvernig leið þér?",
      "Hvaða námsgreinar líka barninu best og hvaða líka því minna?",
      "Er einhver kennari sem hefur haft sérstök áhrif á barnið?"
    ]
  },
  {
    id: 5, emoji: "👫", title: "Vinir og félagslíf",
    desc: "Bestu vinir og leikfélagar",
    seeds: [
      "Hefur barnið besta vin? Segðu frá honum/henni.",
      "Hvernig er félagslíf barnsins — líkar því við að vera í hópi eða frekar eitt?",
      "Er einhver uppáhaldsminnig frá leikjum eða tómstundum með vinum?"
    ]
  },
  {
    id: 6, emoji: "🎨", title: "Áhugamál og tómstundir",
    desc: "Það sem barnið elskar að gera",
    seeds: [
      "Hvað er barnið að gera þegar það er ánægt — uppáhaldstómstundin?",
      "Er einhver íþrótt, listgrein eða sérhugsunarsvið sem barnið er sér um?",
      "Er eitthvað sem barnið getur eytt tíma í án þess að bera á sér?"
    ]
  },
  {
    id: 7, emoji: "🏠", title: "Fjölskyldan og heimilið",
    desc: "Heimilið, foreldrar og systkini",
    seeds: [
      "Hvernig er barnið í samskiptum við systkini eða nána fjölskyldu?",
      "Er einhver hluti af daglífi heimilisins sem barnið elskar sérstaklega?",
      "Hvernig myndi barnið lýsa heimilinu sínu ef þú spyrðir það?"
    ]
  },
  {
    id: 8, emoji: "😂", title: "Fyndnar minningar",
    desc: "Þau augnablik sem við hlæjum enn að",
    seeds: [
      "Er einhver fyndin saga frá bernsku barnsins sem þú munt aldrei gleyma?",
      "Hefur barnið sagt eitthvað óvænt eða skemmtilegt sem þú mundir gjarnan skrá niður?",
      "Hvenær hlógu þið mest saman — barnið og þú?"
    ]
  },
  {
    id: 9, emoji: "💪", title: "Áskoranir og vöxtur",
    desc: "Erfiðleikar sem barnið hefur sigrað",
    seeds: [
      "Hefur barnið þurft að fást við eitthvað erfitt — og hvernig tókst það?",
      "Hvernig bregst barnið við þegar eitthvað gengur ekki upp?",
      "Í hverju hefur barnið vaxið mest — eitthvað sem gerðist þar sem þú sást það þroskast?"
    ]
  },
  {
    id: 10, emoji: "✨", title: "Sérstækar minningar",
    desc: "Augnablik sem sitja eftir",
    seeds: [
      "Hvert er uppáhaldsminnið þitt með barninu hingað til?",
      "Er einhver dagur sem þú myndir vilja lifa aftur með barninu?",
      "Hvaða augnablik með barninu hefur látið þig hugsa: þetta gleymi ég aldrei?"
    ]
  },
  {
    id: 11, emoji: "🌈", title: "Draumar og framtíðin",
    desc: "Von og óskir fyrir barnið",
    seeds: [
      "Hvað dreymir barnið um — hvað vill það verða þegar það verður stórt?",
      "Hvaða ósk eða von hefur þú sem foreldri fyrir barnið þitt?",
      "Ef barnið gæti lesið þessa bók eftir 20 ár — hvað viltu að það vissi?"
    ]
  }
];

export const CHAPTERS_EN = [
  {
    id: 0, emoji: "🍼", title: "Arriving in the World",
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
    id: 11, emoji: "🌈", title: "Dreams & The Future",
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
    prompt: `Þú ert fágaður ritstjóri sem mótar barnsögu á hlýlegri og náinni íslensku.
    Skrifaðu í þriðju persónu um barnið (nafn barnsins, eða „hann/hún/það").
    Tónn: Hlýr, kærkominn og nálegur — eins og foreldri sé að lýsa barninu sínu.
    MIKILVÆGT: Engar lofgjörðir eða AI-klisju-setningar í lok kafla.
    Bannað er að nota niðurstöðu- eða lærdómssetningar (t.d. 'þetta kenndi okkur að...').
    Leyfðu frásögninni að enda á náttúrulegan hátt.

    DÆMI UM RÉTTAN TÓN:
    „Hún fór alltaf beint í leikfangakassann þegar hún kom heim. Ekkert heilsur, ekkert stöðvast — bara beint í það. Við hlógjumst alltaf að þessum hraða."`,
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
    prompt: `Þú ert sögumaður sem skrifar barnasögu á gamansömu og lífrænu íslensku máli.
    Skrifaðu í þriðju persónu um barnið.
    Tónn: Glaðlegur, glettinn og kárlegur — eins og hlægilegar minningar séu sagðar á fjölskyldufundi.
    MIKILVÆGT: Bannað er að nota niðurstöðu- eða lærdómssetningar í lok kafla.
    Gættu þess að málfræði sé rétt og falli að íslenskri málkennd.

    DÆMI UM RÉTTAN TÓN:
    „Hann neituðu því harðlega að vera í grænmeti. Ekki á disknum, ekki nálægt matnum, helst ekki í sama herbergi. Pabbinn reyndi að kynna þetta sem 'trjár' — það fór ekki vel."`,
    promptEn: `You are a storyteller writing a playful and funny children's story in English.
    Write in the third person about the child.
    Tone: Cheerful, mischievous and warm — like funny memories being shared at a family gathering.
    IMPORTANT: Do not add moral summaries or wrap-up sentences at the end.

    EXAMPLE OF THE CORRECT TONE:
    "He had a strict no-vegetables policy. Not on the plate, not near the food, preferably not in the same room. Dad tried to rebrand broccoli as 'trees.' It did not go well."`
  },
  barnid_segir: {
    label: "🧒 Barnið segir",
    desc: "Frásagnin er í fyrstu persónu — eins og barnið sé að segja sína eigin sögu.",
    labelEn: "🧒 Child Speaks",
    descEn: "The story is told in first person — as if the child is telling their own story.",
    prompt: `Þú ert fágaður ritstjóri sem skrifar barnasögu í fyrstu persónu — eins og barnið sjálft sé að segja frá.
    Skrifaðu í fyrstu persónu (ég-form) frá sjónarhorni barnsins.
    Tónn: Beinn, einlægur og barnslægur — eins og barn sé að lýsa lífi sínu á einlægan hátt.
    MIKILVÆGT: Engar fullorðins-niðurstöður eða lærdómssetningar.
    Haltu þér við hlutlægt barnslægt sjónarhorn án þess að hljóma of „yfirþykkt" eða falskt.

    DÆMI UM RÉTTAN TÓN:
    „Ég líkaði við skólann nema þegar við höfðum stærðfræði. Stærðfræðin var leiðinleg. Mér líkaði mun betur við leiktíma og íþróttir og þegar Guðrún kennari las upp."`,
    promptEn: `You are a skilled editor writing a children's story in the first person — as if the child themselves is narrating.
    Write in the first person (I) from the child's perspective.
    Tone: Direct, sincere and childlike — as if a child is describing their life honestly.
    IMPORTANT: No adult conclusions or moral summaries. Keep the childlike viewpoint without sounding forced or saccharine.

    EXAMPLE OF THE CORRECT TONE:
    "I liked school except when we had maths. Maths was boring. I liked break time much better, and PE, and when our teacher Guðrún read aloud to us."`
  },
  ljodraenum: {
    label: "✨ Ljóðrænn",
    desc: "Myndræn og stemningarrík frásögn með hlýlegum litbrigðum.",
    labelEn: "✨ Poetic",
    descEn: "Evocative and atmospheric narrative with warm imagery.",
    prompt: `Þú ert sögumaður sem skrifar barnasögu á myndrænu og ljóðrænu íslensku máli.
    Skrifaðu í þriðju persónu um barnið.
    Áherslan er á skynjun: lykt, hljóð, liti og andrúmsloft.
    MIKILVÆGT: Notaðu hnitmiðaðar setningar til að forðast beygingarvillur.
    Bannað er að nota niðurstöðu- eða lærdómssetningar í lok kafla.

    DÆMI UM RÉTTAN TÓN:
    „Hún sofnaði alltaf fljótt. Hlustað var á andardráttinn þar til herbergið varð hlýtt af kyrrð. Í glugganum sást tunglið — og hún þar undir, lítil og alveg heilleg."`,
    promptEn: `You are a storyteller writing a children's story in evocative and atmospheric English.
    Write in the third person about the child.
    Focus on senses: smell, sound, colour and atmosphere.
    IMPORTANT: Do not use concluding moral sentences. Let the scene breathe and end naturally.

    EXAMPLE OF THE CORRECT TONE:
    "She always fell asleep quickly. You would listen to her breathing until the room grew warm with stillness. The moon was visible through the window — and there she was beneath it, small and entirely whole."`
  }
};

export function getChapters() {
  return S.lang === "en" ? CHAPTERS_EN : CHAPTERS;
}
