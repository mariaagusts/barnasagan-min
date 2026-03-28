// ══════════════════════════════════════════════
//  DEMO SETUP — Embla Bergsdóttir
//  Paste this entire script into the browser
//  console on barnasagan.is while logged in.
// ══════════════════════════════════════════════

(function () {

  const ch0Questions = [
    "Hvað heitir barnið þitt og hvenær og hvar fæddist það?",
    "Hvernig var dagurinn sem barnið kom til heimsins — hvernig leið ykkur, foreldrunum?",
    "Hvernig fékkst þú nafnið sem þú fékkst? Er saga á bak við það?",
    "Hvernig leið þér þegar þú sást barnið í fyrsta sinn?",
    "Hvað var fyrst sem þú tókst eftir á barninu þegar það fæddist?",
    "Hvernig var fyrsta nótt heima?",
    "Hvernig brugðust vinir og fjölskylda við fæðingunni?",
    "Hvernig var heimurinn þegar Embla fæddist — var eitthvað sérstakt í gangi?",
    "Hvað þótti þér undarlegt eða óvænt í fyrstu vikurnar?",
    "Hvað var þyngd og hæð Emblu við fæðinguna?",
    "Hvernig var svefninn á fyrstu vikurnar?",
    "Hvað fannst þér erfiðast á fyrstu vikurnar?",
    "Hvernig líður þér þegar þú hugsar um fæðingardaginn í dag?",
    "Hvenær fór Embla heim og hvernig var bílferðin?",
    "Hvernig var Embla sem nýburi — grétagísli eða rólegt?",
    "Hvað varstu að gera daginn áður en hún fæddist?",
    "Hvernig var þyngd Emblu á fyrstu vikum og hvernig þróaðist hún?",
    "Hvernig tilfinning var það að kalla þig foreldri í fyrsta sinn?",
    "Er eitthvað frá þeim dögum sem þú myndir aldrei gleyma?",
    "Hvað viltu að Embla viti um fæðingardag sinn þegar hún verður stór?"
  ];

  const ch0Answers = [
    "Barnið mitt heitir Embla Bergsdóttir. Hún fæddist 15. mars 2020 á Landspítalanum í Reykjavík.",
    "Dagurinn var sérstakur á fleiri en einn hátt. Þetta var einmitt þegar COVID-faraldrinum var lýst yfir á Íslandi og heimurinn var farinn að lokast. Við fórum á spítalann í þögn og óvissu. En þegar Embla kom til sögunnar gleymdum við öllu öðru.",
    "Nafnið Embla kemur úr norrænum goðsögum — hún er fyrsta konan í heiminum samkvæmt Eddunum. Við vildum gefa henni nafn sem er bæði íslenskt og þýðingarmikið. Og þegar við sáum hana í fyrsta sinn vissum við að hún var Embla.",
    "Ég man þegar hún hreyffist og ég hugsaði: þetta er hún. Þetta er manneskjan sem við höfum verið að bíða eftir. Augnatillit hennar var svo djúpt og kyrrt — eins og hún vissi eitthvað sem við vissum ekki.",
    "Fyrst tók ég eftir litlustu fingurnunum hennar. Þeir voru fullkomnar smámyndir af fingrum. Ég sat og horfði á þá í margar mínútur.",
    "Fyrsta nótt heima var langt frá svefni! Við þurftum að vinda hana um leið og við komum heim, og svo fór hún að gráta um þrjú á morgnana. Við tókum hana í handleggina á okkur báðum og þá sofnaði hún loksins.",
    "Þar sem COVID var alveg nýtt, gátu foreldrar og fjölskylda ekki heimsótt okkur. Við sendum myndir og myndbandssímtöl. Amma og afi sáu Emblu í gegnum skjáinn fyrst. Þetta var bæði einkennilegt og hlýtt á sama tíma.",
    "Embla fæddist í miðjum COVID-faraldri. Íslandi var lokað, heimurinn var að breytast. En á þeim degi þegar hún kom til sögunnar gleymdum við öllu. Minningin er: heimurinn var í ólgu, en við vorum með lítið barn með fullkomnar hendur.",
    "Ég vissi ekki hversu lítil hún yrði. Föturnir sem við höfðum keypt voru alltof stórir. Við þurftum að kaupa nýja föt sem passaði.",
    "Embla var 3,4 kg og 50 cm. Fullkomin.",
    "Svefninn var... vel, svefn varð fjarlægt hugtak. Hún vaknaði á tveggja tíma fresti. Við skiptu um vaktar. Þetta var þreytuástand sem enginn lýsir rétt.",
    "Erfiðast var óvissan. Er við að gera allt rétt? Er hún að fá nóg mat? Af hverju grátur hún? Við höfðum aldrei gert þetta áður og það eru engar leiðbeiningar sem kenna þér að þekkja þitt eigið barn.",
    "Þegar ég hugsa um fæðingardaginn í dag líður mér hlýtt. Ég sé litlu hendurnar og það djúpa augnatillit og sé einnig hversu ótrúlega þreytt og ánægt við vorum. Þetta var fullkominn dagur í miðri ólgu.",
    "Bílferðin heim var hægasta ferð sem við höfum farið. Við keyrðum eins og glasageymir. Embla svaf alla leiðina.",
    "Embla var ekki grétagísli! Hún var rólegt barn sem vildi vera haldin. Þegar maður hélt henni var hún ánægð. Þegar maður lagði hana niður — þá var annað mál.",
    "Daginn áður var við að elda og þrifa og undirbúa húsið. Við sótum gömul föt og prófuðum bílstólinn. Ekkert gefur til kynna að á morgun myndi heimurinn breytast.",
    "Hún var meðalþung og þróaðist mjög vel á fyrstu vikum. Barnalæknirinn var alltaf ánægður. Hún jók þyngd hratt sem gefur til kynna að hún væri að fá nóg mat.",
    "Í fyrsta skipti þegar ég kallaði mig foreldri — það var þegar systir mín spurði mig í síma og ég svaraði: 'Við erum foreldrar.' Þá sló það í brjóst á mér.",
    "Ég gleymi aldrei þeirri kyrrð þegar við vorum komin heim og Embla lá á mér og anda blástri hennar. Heimurinn utan var í ólgu, en í þessari stund var allt kyrrt.",
    "Ég vil að Embla viti að hún kom til heimsins á sögulegum degi — þegar heimurinn var að breytast. Og hún var ljósið í þeim dögum."
  ];

  const ch1Questions = [
    "Hvenær fór barnið að ganga og manstu eftir þeim augnablikum?",
    "Hvað voru fyrstu orðin sem barnið sagði og hvernig brást fjölskyldan við?",
    "Hvernig var barnið sem ungabarn — rólegt eða kröftugt, fyndið eða þverstæðukennt?",
    "Hvenær byrjaði Embla að fara um á fjórum?",
    "Hvenær fór Embla að þekkja þig og bregðast við í fyrsta sinn?",
    "Hvernig var Embla á matinn sem ungabarn?",
    "Var eitthvað sem Embla elskaði sérstaklega sem ungabarn?",
    "Hvernig þróaðist svefnmynstrid Emblu?",
    "Hvenær sagði Embla fyrstu setningu sína?",
    "Hvernig leikur þróaðist hjá Emblu á fyrsta og öðru árinu?",
    "Hvenær fór Embla að þekkja eigið nafn?",
    "Hvernig var Embla í samskiptum við aðrar manneskjur sem ungabarn?",
    "Var eitthvað sem þú tókst eftir snemma sem er enn einkennandi?",
    "Hvenær fór Embla að hlæja í fyrsta sinn?",
    "Hvað gerðist þegar Embla fór í fyrsta sinn í sand eða gras?",
    "Hvernig var fyrsti afmælisdagurinn?",
    "Hvernig varst þú þegar Embla tók fyrstu skrefin?",
    "Hvað fannst þér skemmtilegast á þessum þroskaskeiði?",
    "Er eitthvað sem þú saknar af ungabarnaaldri?",
    "Hvað lærðir þú mest af fyrstu árunum?"
  ];

  const ch1Answers = [
    "Embla fór að ganga þegar hún var 11 mánaða. Við vorum í stofunni og hún stóð upp við borðið, sleppti og tók þrjú skref. Ég grét. Hún leit á mig eins og hún skildi ekki af hverju ég væri svona.",
    "Fyrsta orðið var 'ba' sem þýddi bæði bíll og ball og bátur — í raun allt sem hana hlakkaði til. En fyrsta alvöru orðið var 'mjaú' þegar við sáum kött í göngutúr. Hún sagði þetta svo skýrt og broslegið.",
    "Embla var kröftug! Hún vildi alltaf vera á ferðinni. Hvíla var ekki á dagskrá. Hún var einnig mjög fyndin — hún gerði snör sem gerðu okkur alltaf hlæja, eins og hún skildi strax hvað væri skemmtilegt.",
    "Hún fór á fjórum þegar hún var um sjö mánuða. Og þá varð allt að læsa! Hún fór í allt. Hillurnar í eldhúsinu urðu hennar fljótlega.",
    "Um þriggja vikna aldur byrjaði hún að brosa þegar við talaðum við hana. Þetta smygl — þetta lítið bros — var allt. Ég held myndina í huga mínum enn.",
    "Embla var varkár á matinn! Hún prófaði hvað sem er með tortryggni. Gulræturnar voru bannfærðar. Bananar voru leyfðar. Allt þurfti að vera brotið niður í örsmáar bitar.",
    "Embla elskaði tónlist. Þegar við leikum tónlist — hvaða tónlist sem var — byrjaði hún að dansa. Við þurftum náttúrlega að kalla þetta dans; það var meira titrings- og brotthvarf-dans en neitt annað.",
    "Svefninn varð betri eftir sex mánuði. Við prófuðum ýmsar aðferðir. Loksins komst hún í 8–9 tíma svefn á nóttunni. Þetta var byltingin.",
    "Fyrsta setningin var 'nei þetta' þegar hún var um 18 mánaða. Við höfðum þegar séð merkin.",
    "Á fyrsta árinu þróaðist leikurinn frá því að horfa á hluti yfir í að taka í hluti og að henda hlutum. Síðasta þrep var uppáhaldsþrepið okkar.",
    "Við um sex mánuði sneri hún sér þegar við sögðum nafnið. En þegar hún leit upp þegar við sögðum 'Embla' — þá var eitthvað magnað við.",
    "Embla var alltaf forvitinn yfir öðrum. Hún horfði lengi á ný andlit. Aldrei óttasleg — bara rannsóknargjörn. Þetta er enn hluti af persónu hennar.",
    "Snemma tók við eftir að hún var mjög sjálfstæð. Hún vildi aldrei vera háð öðrum — hún vildi gera hlutina sjálf. Þetta er mjög Embla.",
    "Um þriggja vikna aldur gaf hún þetta litla hlægi þegar við lékum með hana. Við héldum að við hefðum séð allt. Við höfðum ekki.",
    "Fyrsta ferð í sandinn — hún var um níu mánaða. Hún snert sandinn, leit á okkur, snert aftur. Þá fór hún að eta sandinn. Við tókum hana burt. Hún var reiðari. Þetta endurtók sig nokkrum sinnum.",
    "Fyrsti afmælisdagurinn var í miðjum COVID — lítið samkomulag, bara við og nánasta fjölskylda. Við gerðum kaka með einum kerti. Embla fór beint í kertið. Við stöðvuðum hana. Hún grét. Við gáfum henni kökuna. Hún gleymdi kertinu.",
    "Þegar hún tók fyrstu skrefin grét ég og hló á sama tíma. Það var eitt af þessum augnablikum þar sem þú skilur hversu fljótt börn vaxa. Ég vildi hægja á tímanum.",
    "Skemmtilegast var þegar hún byrjaði að skilja hlutina. Þegar hún hló að brandaranum. Þegar hún sýndi þér eitthvað af stolt. Þessar fyrstu tengingar við heiminn eru ógleymanlegar.",
    "Ég sakna stundum þess að halda henni sem ungabarni. Þær litlu hendur. Þegar hún sofnaði á mér. Þegar allur heimurinn fólst í einum herbergi. Nú er hún svo óháð og þetta er svo gott, en smástundirnar sakna ég.",
    "Ég lærði hversu mikið er mögulegt að elska. Ég lærði hversu lítið þarf til að vera ánægður. Ég lærði einnig að biðja um hjálp og samþykkja hana. Þetta ár breyttist mig."
  ];

  const remainingSeeds = [
    ["Embla er alltaf á ferðinni og rannsóknargjörn.", "Þrjár lýsingarorð: forvitinn, þrjósk og hlægileg.", "Hún hefur alltaf þurft að skilja hlutina sjálf, ekki bara hlusta."],
    ["Uppáhald er dinosaurar — allar tegundir, öll nöfn.", "Hún byggir heima úr blokkum og þarf alltaf hlið og hurð.", "Hún leikur hvort sem er ein eða með öðrum, en elskar mest þegar við leikum saman."],
    ["Embla fór í leikskóla þegar hún var tvö ára.", "Hún hlakkaðist alltaf til skólans — vinir hennar eru þar.", "Kennarinn Helga er uppáhald."],
    ["Besti vinur er Hrafnhildur — þær hittust á leikskóla.", "Embla er félagsleg en þarf líka tíma ein.", "Uppáhaldsminnin er þegar þær hlupu saman í rigningu."],
    ["Uppáhald er að teikna dinosaura.", "Hún getur horft á dinosauraskjáinn í klukkustund.", "Hún getur einnig eytt langan tíma í að byggja LEGO."],
    ["Embla er einstaklingur en elskar fjölskylduna djúpt.", "Hún elskar þegar við borðum saman sem fjölskylda.", "Ef þú spyrðir hana myndi hún segja: 'heimilið mitt er þar sem dinosaurarnir eru.'"],
    ["Hún kallar alla stóra bíla 'vörubíla' sama hvað þeir eru.", "Einu sinni sagði hún að sólin ætti að sofa meðan hún var að leika.", "Þegar ég var að gráta lagði hún hendur sínar í kringum mig og sagði: 'allt í lagi.'"],
    ["Hún átti erfitt með að deila. Við þurftum að æfa þetta mikið.", "Þegar eitthvað gengur ekki upp getur hún orðið mjög reiðir.", "En hún lærir fljótt og gleymir síðan."],
    ["Uppáhaldsminnin er ferðalag okkar til Ísafjarðar þegar hún var þrjú ára.", "Þegar hún sá hvalinn í fyrsta sinn.", "Þegar hún sagði mér 'þú ert besti vinur minn' úr hvergi."],
    ["Embla vill verða 'dinosaura vísindakona'.", "Ég vil að hún verði ánægð. Annað er aukaatriði.", "Embla — þegar þú lest þetta eftir 20 ár: við elskum þig svo mikið. Þú varst alltaf þú."]
  ];

  const state = {
    childName: "Embla",
    chapters: [
      { id: 0, questions: ch0Questions, answers: ch0Answers, complete: true, photos: [] },
      { id: 1, questions: ch1Questions, answers: ch1Answers, complete: true, photos: [] },
      ...remainingSeeds.map((seeds, i) => ({ id: i + 2, questions: seeds, answers: [], complete: false, photos: [] }))
    ]
  };

  localStorage.setItem("lifsaga_state", JSON.stringify(state));

  // If logged in, also save to Supabase
  try {
    const sbClient = window.__sagan_state?.sbClient;
    const user = window.__sagan_state?.user;
    if (sbClient && user) {
      sbClient.from("user_progress").upsert({
        user_id: user.id,
        state_json: JSON.stringify(state),
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" }).then(() => console.log("✓ Vistað í Supabase"));
    }
  } catch (e) {
    console.log("Supabase not reached — localStorage only. Reload to sync.");
  }

  alert("✓ Demo gögn hlaðin fyrir Emblu Bergsdóttur!\nEndurræstu síðuna til að sjá gögnin.");

})();
