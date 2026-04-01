// ══════════════════════════════════════════════
//  I18N — translations and language helpers
// ══════════════════════════════════════════════
import { S } from './state.js';

export const UI = {
  is: {
    navLogin: "Innskrá", navCta: "Byrja að skrifa",
    heroTitle: "Barnasagan: \u201Eég skrifa þetta niður á morgun\u201C er loforðið sem við gefum okkur öll.",
    heroSub: "Við vitum að heilaþokan er raunveruleg. Barnasagan hjálpar þér að fanga dýrmætustu augnablikin þegar þau gerast, án samviskubits eða auka álags.",
    heroCta1: "Byrja að skrifa →", heroCta2: "Innskrá",
    heroStats: ["Kaflar","Spurningar","Barnasaga"],
    featTitle: "Við höfum verið í þínum sporum",
    featSub: "Sagan skrifar sig best á meðan hún er enn að gerast.",
    featSub2: "(Þessi saga týnist ekki inni í skáp eða í flutningum, og hún neitar ekki að skrifa ef það vantar að ydda blýantinn.)",
    feat1t: "🍼 Minningar beint úr ofninum", feat1d: "Ekki bíða þar til barnið er fermt og við reynum að muna hvenær fyrsta tönnin mætti á svæðið.",
    feat2t: "🧠 Heilaþokan er raunveruleg", feat2d: "Milli svefnleysis og endalausra spurninga um af hverju himinninn sé blár er kraftaverk að muna hvað maður borðaði í morgunmat. Við geymum söguna á meðan þú leitar að lyklunum.",
    feat3t: "⚽ Engin heimaverkefni", feat3d: "Þú stýrir ferðinni. Skráðu minningar þegar þú hefur tíma; uppi í rúmi, á WC, í umferðinni. Barnasagan grípur þær, því þú hefur sama möguleika á að skrá niður svörin í tölvu eða á síma.",
    feat4t: "✨ Sagan verður til", feat4d: "Svörin þín verða að fallegri barnasögu sem barnið þitt getur lesið eftir 20 ár.",
    feat5t: "📸 Myndir í sögunni", feat5d: "Bættu við myndum þegar eitthvað skemmtilegt gerist. Ein mynd geymir þúsund minningar.",
    feat6t: "📖 Bókin sem barnið fær", feat6d: "Þegar þú ert tilbúin/n er barnasagan þín tilbúin sem PDF til að prenta, gefa og geyma að eilífu.",
    ctaTitle: "Byrjaðu í dag", ctaSub: "Markmið okkar er að gera skrásetningu bernskunnar að ánægjulegri samfylgd frekar en krefjandi verkefni.",
    ctaBtn: "Hefja ferðalagið →",
    authTitle: "Barnasagan mín", authSub: "Skráðu þig inn eða stofnaðu nýjan aðgang",
    tabLogin: "Innskráning", tabSignup: "Nýskráning",
    emailPh: "Tölvupóstfang", passPh: "Lykilorð",
    loginBtn: "Innskrá →", signupBtn: "Nýskrá →",
    loginNote: "🔒 Gögn þín eru geymd á öruggan hátt.", signupNote: "📧 Við sendum þér staðfestingarpóst.",
    mapTitle: "Sagan um barnið", mapSub: "Hvaða hluta sögunnar viltu huga að í dag?",
    mapProgress: "Sagan um barnið", mapAnswers: "Minningar komnar á blað",
    previewBtn: "✨ Skoða bókina þína", deleteBtn: "🗑 Hreinsa þráðinn",
    backToMap: "← Kaflayfirlit", signOut: "Útskrá",
    chapterOf: "Kafli", answersOf: "svör",
    qOf: "Minning", of20: "af 20",
    placeholder: "Segðu frá barninu þínu...",
    micBtn: "🎙 Segja frá", stopBtn: "⏹ Hætta",
    nextBtn: "Næsta →", listening: "🔴 Ég hlusta... segðu mér frá",
    historyLabel: "Það sem þú hefur þegar skráð í þessum kafla",
    editBtn: "✏️ Breyta", saveBtn: "💾 Vista", cancelBtn: "Hætta við",
    chapterDone: "lokið!", chapterDoneMsg: "Dásamlegt. Þessi hluti sögunnar er kominn til skila.",
    nextChapter: "Næsti kafli:", backOverview: "Fara á yfirlit", addMoreQuestions: "Bæta við fleiri spurningum",
    loadingText: "Við erum að leggja lokahönd á söguna um barnið þitt...",
    loadingSub: "Þetta getur tekið smástund",
    editStory: "✏️ Breyta texta", saveStory: "💾 Vista breytingar",
    pdfBtn: "📄 Hlaða niður sem PDF bók", txtBtn: "📋 Texti",
    resetConfirm: "Ertu viss um að þú viljir eyða allri framvindu? Þetta er óafturkræft.",
    resetModalTitle: "🗑 Eyða allri framvindu?",
    resetModalBody: "Þessi aðgerð er <strong>óafturkræf</strong>. Allir kaflar og svör þín verða þurrkuð út að fullu.<br><br>Sláðu inn <strong>EYÐA</strong> hér að neðan til að staðfesta.",
    resetModalPlaceholder: "Sláðu inn EYÐA...",
    resetConfirmWord: "EYÐA",
    resetModalBtn: "Eyða öllu",
    downloadAnswersBtn: "📥 Sækja svör (.txt)",
    privacyTitle: "Persónuverndarstefna",
    privacyContent: `
      <p style="color:var(--mid);font-size:14px;margin-bottom:40px;">Gildir frá 30. mars 2026 · barnasagan.is</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">1. Hver við erum</h3>
      <p>Barnasagan mín (barnasagan.is) er þjónusta sem hjálpar foreldrum að skrá sögu barnsins síns. Þjónustan er rekin af Multa Bene Agere ehf. (kt. 471025-0380). Spurningar og athugasemdir varðandi persónuvernd má senda á <a href="mailto:saganmin@saganmin.is" style="color:var(--mid);">saganmin@saganmin.is</a>.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">2. Hvaða gögnum söfnum við</h3>
      <p>Við geymum einungis þau gögn sem nauðsynleg eru til að sinna þessari þjónustu:</p>
      <ul style="margin:12px 0 12px 20px;line-height:2;">
        <li><strong>Tölvupóstfang</strong>, notað til innskráningar og auðkenningar</li>
        <li><strong>Svör við spurningum</strong>, geymd á öruggan hátt og aðeins aðgengileg þér</li>
        <li><strong>Framvindugögn</strong>, hvaða kafla þú hefur lokið</li>
        <li><strong>Tímastimplar</strong>, hvenær gögn voru vistuð</li>
      </ul>
      <p>Við geymum <strong>ekki</strong> IP-föng, vafragögn, staðsetningargögn eða neinar aðrar persónugreinanlegar upplýsingar.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">3. Hvernig gögn þín eru vernduð</h3>
      <p>Gögn þín eru geymd í gagnagrunni hjá Supabase (Amazon Web Services, Evrópa). Við notum <strong>Row Level Security (RLS)</strong>, þetta þýðir að tæknilegar öryggisreglur tryggja að aðeins þú getur lesið og skrifað þín eigin gögn. Enginn annar notandi, og ekkert forrit utan þíns eigin reiknings, hefur aðgang að svörum þínum. Öll samskipti milli vafrans þíns og þjóna eru dulkóðuð með TLS/SSL (HTTPS).</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">4. Aðgangur rekstraraðila</h3>
      <p><strong>Rekstraraðili Barnasögu minnar les ekki svör þín.</strong> Sagan sem þú skrifar um barnið þitt er þín ein. Hún er persónuleg og við höfum engan áhuga á að skoða hana.</p>
      <p>Við segjum aldrei frá né seljum gögn þín til þriðja aðila. Öll gögn eru vernduð samkvæmt íslenskum lögum og GDPR-reglugerð Evrópusambandsins. Þú átt fullt yfirráð yfir eigin gögnum og getur krafist eyðingar þeirra hvenær sem er.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">5. Höfundarréttur</h3>
      <p>Þú átt fullan og óskoraðan höfundarrétt að þeirri barnasögu sem verður til. Barnasagan mín hefur engar kröfur eða réttindi yfir því efni sem þú skrifar eða myndum sem þú hleður upp.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">6. Sjálfvirk úrvinnsla og gerð frásagna</h3>
      <p>Til að aðstoða notendur við að móta samfellda og vandaða barnasögu nýtir þjónustan snjalla tæknilausn til sjálfvirkrar úrvinnslu á texta. Svör notenda eru greind með kerfisbundnum hætti til að búa til leiðandi spurningar og tengja minningar saman í eina heild. Við leggjum ríka áherslu á að engar persónugreinanlegar upplýsingar, svo sem nafn eða tölvupóstfang, eru sendar til utanaðkomandi tæknikerfa við þessa úrvinnslu.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">7. Geymsla í vafra</h3>
      <p>Þjónustan notar <strong>localStorage</strong> í vafranum þínum til að vista framvindu þína staðbundið á tækinu þínu. Þessi gögn eru aðeins aðgengileg af barnasagan.is og á þínu eigin tæki.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">8. Réttindi þín</h3>
      <p>Samkvæmt íslenskum lögum og GDPR átt þú rétt á að:</p>
      <ul style="margin:12px 0 12px 20px;line-height:2;">
        <li>Fá aðgang að öllum gögnum sem við geymum um þig</li>
        <li>Krefjast leiðréttingar á röngum gögnum</li>
        <li>Krefjast eyðingar á öllum gögnum þínum ("réttur til að gleymast")</li>
        <li>Flytja gögn þín út (PDF eða textaskrá)</li>
      </ul>
      <p>Til að nýta þessi réttindi skaltu hafa samband á <a href="mailto:saganmin@saganmin.is" style="color:var(--mid);">saganmin@saganmin.is</a>. Við munum bregðast við innan 30 daga.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">9. Eyðing reiknings</h3>
      <p>Þú getur eytt framvindu þinni hvenær sem er með "Eyða framvindu" takkanum í kaflayfirlit. Til að eyða reikningnum þínum að fullu og öllum gögnum skaltu hafa samband við okkur.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">10. Persónuvernd barna</h3>
      <p>Barnasagan mín er þjónusta fyrir foreldra og aðra umsjónaraðila sem vilja varðveita minningar um barn sitt. Við söfnum ekki persónuupplýsingum um börn beint, allar upplýsingar koma frá foreldri/umsjónaraðila sem er skráður notandi þjónustunnar.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">11. Breytingar á stefnunni</h3>
      <p>Ef við gerum verulegar breytingar á þessari persónuverndarstefnu munum við láta notendur vita með tölvupósti. Dagsetning efst á síðunni sýnir hvenær stefnan var síðast uppfærð.</p>

      <div style="margin-top:48px;padding:24px;background:var(--warm);border-radius:8px;border-left:3px solid var(--gold);">
        <p style="margin:0;font-size:14px;color:var(--mid);">Spurningar? Hafðu samband á <a href="mailto:saganmin@saganmin.is" style="color:var(--mid);">saganmin@saganmin.is</a></p>
      </div>
      <div style="height:60px;"></div>
    `,
    aboutSub: "Tækifæri til að íhuga, minnast og skrá það sem máli skiptir.",
    aboutFeat1t: "Við spyrjum þig", aboutFeat1d: "Persónulegar spurningar um lífið sem barnið er að lifa, kafla fyrir kafla.",
    aboutFeat2t: "Þegar þér hentar", aboutFeat2d: "Á morgnana, á meðan barnið sefur, eða seint um kvöld.",
    aboutFeat3t: "Sagan um barnið", aboutFeat3d: "Úr svörunum þínum verður falleg barnasaga sem þú getur gefið barninu.",
    aboutFeat4t: "Engin pressa", aboutFeat4d: "Framvindan þín vistast sjálfkrafa.",
    faqItems: [
      { heading: "Um þjónustuna" },
      { q: "Hvað er Barnasagan mín?", a: "Barnasagan mín er vettvangur sem aðstoðar foreldra eða aðra nákomna við að skrá sögu barnsins síns með persónulegum og hvetjandi spurningum. Persónulegar spurningar leiða þig í gegnum mismunandi þætti bernskunnar og svörin þín mynda að lokum samfellda og vandaða barnasögu." },
      { q: "Hverjum er þjónustan ætluð?", a: "Barnasagan mín hentar öllum foreldrum eða aðstandendum sem vilja varðveita söguna um bernsku barnsins síns. Þú getur byrjað hvenær sem er, hvort sem barnið er nýfætt eða þegar farið í skóla." },
      { q: "Kostar þjónustan eitthvað?", a: "Fyrstu tveir kaflarnir eru ókeypis. Fullur aðgangur er keypt með eingreiðslu, eitt verð, engin áskrift. Sjá <a href='/pricing.html' style='color:var(--gold);'>verðskrá</a>." },
      { q: "Er þetta virkilega ein greiðsla?", a: "Já. Þú greiðir einu sinni og hefur fullan aðgang að öllum 12 köflum á meðan þjónustan er í rekstri. Engar áskriftir, engar endurnýjanir. Þú getur hlaðið niður barnasögunni þinni sem PDF hvenær sem er og geymt hana hjá þér að eilífu." },
      { q: "Get ég prófað áður en ég greiði?", a: "Já, tveir kaflar eru opnir án greiðslu. Þegar þú ákveður að kaupa aðgang opnast allir 12 kaflar strax." },
      { q: "Hvernig er greitt?", a: "Við notum Paddle sem greiðslumiðlara. Þeir taka við kredit- og debetkortum og sjá um VSK í samræmi við lög þíns lands." },
      { q: "Get ég fengið endurgreiðslu?", a: "Já, við bjóðum upp á 14 daga endurgreiðslurétt ef PDF-niðurhal hefur ekki verið notað. Hafðu samband á <a href='mailto:saganmin@saganmin.is' style='color:var(--gold);'>saganmin@saganmin.is</a>." },
      { q: "Af hverju er verðið í evrum en ekki íslenskum krónum?", a: "Barnasagan mín er íslenskt verkefni með íslenska kennitölu, en þær íslensku greiðslulausnir sem við þekkjum krefjast mánaðarlegrar áskriftar sem er of dýr fyrir lítið verkefni eins og þetta. Við notum því Paddle sem greiðslumiðlara — þeir styðja því miður ekki íslenskar krónur, svo við gjaldfærum tímabundið í evrum (€32). Þetta gæti breyst síðar. Bankinn þinn reiknar sjálfkrafa út krónuverðið á greiðsludegi." },
      { q: "Get ég gefið þetta að gjöf?", a: "Já! Smelltu á \'Kaupa gjafakóða\' á verðlagssíðunni. Þú færð kóðann sendan á netfangið þitt og gefur hann áfram. Viðtakandinn innleysir hann á verðlagssíðunni undir \'Innleysa gjafakóða\'." },
      { q: "Eru gögnin mín örugg?", a: "Já, fyllsta öryggis er gætt. Svör þín eru geymd á dulkóðuðum gagnagrunni og enginn annar notandi hefur aðgang að þeim. Barnasagan mín er rekin af íslensku félagi (kt. 471025-0380) og við seljum aldrei persónuupplýsingar." },
      { q: "Hvernig eyði ég reikningnum mínum?", a: "Þú getur eytt framvindu þinni hvenær sem er með 'Eyða framvindu' takkanum í kaflayfirlitinu. Til að eyða reikningnum þínum að fullu og öllum gögnum sem við geymum skaltu hafa samband við okkur á saganmin@saganmin.is. Við munum bregðast við innan 30 daga." },

      { heading: "Að skrifa söguna" },
      { q: "Þarf ég að svara öllum spurningum í einu?", a: "Alls ekki. Þú getur tekið þér hlé hvenær sem hentar. Framvinda þín vistast sjálfkrafa og þú getur haldið áfram þar sem frá var horfið, hvort sem það er að nokkrum dögum eða vikum liðnum." },
      { q: "Hversu langan tíma tekur þetta?", a: "Það er algjörlega í þínum höndum. Margir svara einni eða tveimur spurningum á dag og klára bókina á nokkrum vikum. Sumir (þeir sem eru mögulega búnir að týna minningarbókinni sem var keypt 🤭) geta keyrt í gegnum svörin á mun styttri tíma en aðrir taka sér lengri tíma. Engin pressa, framvindan vistast sjálfkrafa og bíður þín." },
      { q: "Get ég skrifað á ensku?", a: "Já. Þú getur skipt um tungumál hvenær sem er. Athugaðu þó að bókin þín verður mótuð á því tungumáli sem er valið þegar þú smellir á 'Forskoða bókina þína'. Kerfið sér þá um að samræma frásögnina á því máli." },
      { q: "Get ég talað í stað þess að skrifa?", a: "Já, þú getur smellt á hljóðnemahnappinn '🎙 Segja frá' og svarað með rödd í stað þess að skrifa. Á tölvu þarftu að veita vafranum leyfi til að nota hljóðnemann. Á iPhone eða iPad: smelltu á textareitinn og notaðu 🎤 hljóðnematáknið á lyklaborðinu. Vafrinn sjálfur styður ekki talgreiningu á iOS. Til að talgreiningin virki á íslensku þarf íslenska að vera stillt sem tungumál símans (Stillingar → Almennt → Tungumál og svæði). Talgreiningin getur stundum gert smávægilegar villur, en ekki hafa áhyggjur af því. Þegar bókin er búin les kerfið yfir öll svörin í heild sinni, lagar hnökra og setur fram heildstæða frásögn." },
      { q: "Hvað ef ég man ekki dagsetningar eða nöfn nákvæmlega?", a: "Það gerir ekkert til. Barnasagan snýst um upplifun þína og tilfinningar. Þú getur alltaf skrifað 'um það bil' eða sleppt smáatriðum sem þú ert ekki viss um. Kerfið hjálpar þér að móta frásögnina þannig að hún flæði vel þrátt fyrir það." },
      { q: "Hversu mikið má ég skrifa við hverja spurningu?", a: "Það eru engin efri mörk. Þú getur skrifað eina setningu eða heila síðu. Kerfið dregur saman það mikilvægasta og tryggir að frásögnin sé jafnvæg og falleg." },
      { q: "Get ég bætt við mínum eigin spurningum?", a: "Já! Við hliðina á hverri spurningu er '+' takki. Þar getur þú slegið inn þína eigin spurningu sem birtist strax sem næsta spurning í kaflanum." },
      { q: "Get ég breytt svörunum mínum?", a: "Já, þú hefur fulla stjórn á þínu efni. Undir hverju svari er 'Breyta' takki sem gerir þér kleift að leiðrétta textann eða bæta við minningum hvenær sem er í ferlinu. En athugaðu að ef þú hefur nú þegar forskoðað eða sótt bókina þína þá munu uppfærð svör ekki breytast sjálfkrafa. Þú þarft þá að forskoða og vista bókina ef ný minning á að skila sér inn í bókina þína. Einnig er rétt að huga að því að hver 'bók' er einstök, svo hver forskoðun og/eða niðurhald á sína sjálfstæða sögu. En til hægri á innskráningarsíðunni getur þú séð eldri útgáfur af bókinni þinni." },
      { q: "Get ég notað þjónustuna á fleiri en einu tæki?", a: "Já. Framvindan þín er vistuð á öruggan hátt á netþjóni og samstillist sjálfkrafa. Þú getur byrjað á tölvunni heima og haldið áfram á síma eða spjaldtölvu, svo lengi sem þú notar sama aðgang. En við mælum alltaf með að sækja svörin við spurningum sem textaskrá (.txt) reglulega." },
      { q: "Hvað gerist ef tengingin brotnar meðan ég er að skrifa?", a: "Ekkert glatast. Svörin þín eru vistuð staðbundið á tækinu þínu um leið og þú skrifar, og send á netþjóninn þegar tenging er til staðar. Ef tenging brotnar getur þú haldið áfram að skrifa og gögnin samstillast þegar þú ert aftur á netinu." },
      { q: "Get ég bætt við fleiri spurningum eftir að kafla er lokið?", a: "Já! Fyrir þá allra duglegustu er hægt að bæta við spurningum innan hvers kafla jafnvel þótt kaflinn hafi náð sínum 10 spurningum. Þessar 10 spurningar eru einungis viðmið, en við vitum vel að sumar minningar taka meira pláss í hjartanu en aðrar." },

      { heading: "Bókin þín" },
      { q: "Hvernig fer úrvinnslan fram?", a: "Þegar þú hefur svarað nokkrum spurningum getur þú valið 'Skoða bókina þína'. Kerfið greinir svörin þín og setur þau upp í rökrétta og flæðandi barnasögu sem þú getur síðan yfirfarið og breytt.\n\nÍ hvert sinn sem þú forskoðar bókina verður til ný og sjálfstæð útgáfa af sögunni. Þegar þú forskoðar útgáfu sem þér líst vel á, geturðu alltaf nálgast hana aftur í flipanum hægra megin á síðunni. Þar er haldið utan um eldri útgáfur svo þú getir borið þær saman eða hlaðið niður þeirri sem þér þykir best." },
      { q: "Hvernig fæ ég fullbúna bók?", a: "Þú getur hlaðið barnasögunni niður sem PDF skjali sem er faglega umbrotið með forsíðu og kaflaskiptingu. Einnig er hægt að flytja textann yfir í textaskrá. Án þess að það sé á nokkurn hátt tengt okkur, þá getum við mælt með lulu.com til að fá útprentaða bók, prentaða beint út frá PDF-skjalinu þínu." },
      { q: "Hvað ef ég vil að sagan sé einföld og bein, án tilbúinna lýsinga?", a: "Þú getur valið 'Hrein frásögn' þegar þú býrð til bókina. Þá tekur kerfið svörin þín nákvæmlega eins og þú skrifaðir þau og raðar þeim upp í kafla án þess að bæta við lýsingum eða breyta flæði textans. Hentar vel ef þú vilt halda söguna við staðreyndir og nákvæmar upplýsingar." },
      { q: "Get ég breytt textanum eftir að hann er búinn til?", a: "Já, þegar þú velur 'Forskoða bókina þína' býr kerfið til drög. Þú getur síðan farið í 'Breyta texta' og lagfært allt sem þér finnst mega fara betur, bætt við upplýsingum eða breytt orðalagi áður en þú hleður niður lokagerðinni." },
      { q: "Getur textinn innihaldið villur?", a: "Já, kerfið setur saman frásögnina sjálfkrafa og geta þess vegna birst málfræði- eða stafsetningarvillur í textanum. Við mælum eindregið með að fara yfir textann með 'Breyta texta' takkanum áður en þú hleður niður bókinni." },
      { q: "Get ég bætt við myndum í bókina?", a: "Já! Í hverju kaflaviðtali er hægt að hlaða upp myndum sem tengjast þeim kafla, þær birtast þá í bókinni í lok viðkomandi kafla. Þú getur einnig bætt við almennum myndum í sögugluggunum, sem birtast aftast í bókinni." },

      { heading: "Tækni og ráð" },
      { q: "Get ég bætt Barnasögu minni á heimaskjá símans eins og app?", a: `Já! Þú getur vistað vefsíðuna á heimaskjáinn þinn og notað hana eins og app, án þess að þurfa að hlaða niður neinu.<br><br>
    <strong>Á iPhone/iPad (Safari):</strong><br>
    1. Ýttu á kassann með örinni sem bendir upp — Deila hnappurinn — í miðjunni neðst.<br>
    2. Skrunaðu niður í listanum og veldu „Bæta við heimaskjá" (Add to Home Screen).<br><br>
    <strong>Á Android (Chrome):</strong><br>
    Opnaðu síðuna í Chrome, smelltu á þrípunkta valmyndina (⋮) efst og veldu „Bæta við heimaskjá" eða „Setja upp app".<br><br>
    Vefsíðan opnast þá beint án vafrastikunnar og lítur út eins og alvöru app.` }
    ],
    aboutTitle: "Um",
    faqTitle: "Spurningar",
    backBtn: "← Til baka",
    completed: "✓ Lokið",
  },
  en: {
    navLogin: "Sign in", navCta: "Start your journey",
    heroTitle: "Barnasagan: \"I'll write it down tomorrow.\" The promise we all make ourselves.",
    heroSub: "We know brain fog is real. Barnasagan helps you capture the most precious moments as they happen, without guilt or extra pressure.",
    heroCta1: "Start writing →", heroCta2: "Sign in",
    heroStats: ["Chapters","Questions","Story"],
    featTitle: "We know how it feels",
    featSub: "The story writes itself best while it's still happening.",
    featSub2: "(This story won't get lost in a cupboard or a house move, and it won't refuse to write if you can't find a sharpened pencil.)",
    feat1t: "🍼 Memories fresh from the oven", feat1d: "Don't wait until your child's confirmation and try to remember when the first tooth arrived.",
    feat2t: "🧠 Brain fog is real", feat2d: "Between the sleep deprivation and endless questions about why the sky is blue, it's a miracle to remember what you had for breakfast. We keep the story while you look for your keys.",
    feat3t: "⚽ No homework", feat3d: "You're in charge. Capture memories whenever you have a moment; in bed, on the loo, in traffic. Barnasagan catches them, because you have the same option to record on a computer or a phone.",
    feat4t: "✨ The story takes shape", feat4d: "Your answers become a more beautiful children's memoir your child can read in 20 years.",
    feat5t: "📸 Photos in the story", feat5d: "Add a photo when something funny happens. One picture holds a thousand memories.",
    feat6t: "📖 The book your child receives", feat6d: "When you're ready, your child's story is waiting as a PDF to print, gift and keep forever.",
    ctaTitle: "Start today", ctaSub: "Our goal is to make recording childhood a joyful companion rather than a demanding task.",
    ctaBtn: "Start writing →",
    authTitle: "My Child's Story", authSub: "Sign in or create a new account",
    tabLogin: "Sign in", tabSignup: "Sign up",
    emailPh: "Email address", passPh: "Password",
    loginBtn: "Sign in →", signupBtn: "Sign up →",
    loginNote: "🔒 Your data is stored securely.", signupNote: "📧 We'll send you a confirmation email.",
    mapTitle: "Your child's story", mapSub: "Choose a chapter to start or continue",
    mapProgress: "Your child's story", mapAnswers: "Memories captured",
    previewBtn: "✨ Preview your book", deleteBtn: "🗑 Delete progress",
    backToMap: "← Chapter overview", signOut: "Sign out",
    chapterOf: "Chapter", answersOf: "answers",
    qOf: "Question", of20: "of 20",
    placeholder: "Tell us about your child...",
    micBtn: "Speak", stopBtn: "⏹ Stop",
    nextBtn: "Next →", listening: "🔴 Listening... speak now",
    historyLabel: "Previous answers in this chapter",
    editBtn: "✏️ Edit", saveBtn: "💾 Save", cancelBtn: "Cancel",
    chapterDone: "complete!", chapterDoneMsg: "Great work! Your child's story is taking shape.",
    nextChapter: "Next chapter:", backOverview: "Go to overview", addMoreQuestions: "Add more questions",
    loadingText: "We're weaving together your child's story...",
    loadingSub: "This may take a moment",
    editStory: "✏️ Edit text", saveStory: "💾 Save changes",
    pdfBtn: "📄 Download as PDF book", txtBtn: "📋 Text",
    styleTitle: "Choose a writing style",
    resetConfirm: "Are you sure you want to delete all your progress? This cannot be undone.",
    resetModalTitle: "🗑 Delete all progress?",
    resetModalBody: "This action is <strong>irreversible</strong>. All chapters and answers will be permanently deleted.<br><br>Type <strong>DELETE</strong> below to confirm.",
    resetModalPlaceholder: "Type DELETE...",
    resetConfirmWord: "DELETE",
    resetModalBtn: "Delete everything",
    downloadAnswersBtn: "📥 Download answers (.txt)",
    privacyTitle: "Privacy Policy",
    privacyContent: `
      <p style="color:var(--mid);font-size:14px;margin-bottom:40px;">Effective 30 March 2026 · barnasagan.is</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">1. Who we are</h3>
      <p>My Child's Story (barnasagan.is) is a service that helps parents record their child's story. The service is operated by Multa Bene Agere (ID no. 471025-0380). Questions and comments about privacy may be sent to <a href="mailto:saganmin@saganmin.is" style="color:var(--mid);">saganmin@saganmin.is</a>.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">2. What data we store</h3>
      <p>We store only the data necessary to provide this service:</p>
      <ul style="margin:12px 0 12px 20px;line-height:2;">
        <li><strong>Email address</strong>, used for sign-in and authentication</li>
        <li><strong>Answers to questions</strong>, stored securely and accessible only to you</li>
        <li><strong>Progress data</strong>, which chapters you have completed</li>
        <li><strong>Timestamps</strong>, when data was saved</li>
      </ul>
      <p>We do <strong>not</strong> store IP addresses, browser data, location data or any other personally identifiable information beyond what you enter yourself.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">3. How your data is protected</h3>
      <p>Your data is stored in a database hosted by Supabase (Amazon Web Services, Europe). We use <strong>Row Level Security (RLS)</strong>, which means that technical security rules ensure that only you can read and write your own data. No other user, and no application outside your own account, has access to your answers. All communication between your browser and the server is encrypted using TLS/SSL (HTTPS).</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">4. Operator access</h3>
      <p><strong>The operator of My Child's Story does not read your answers.</strong> The story you write about your child is yours alone. It is personal and we have no interest in viewing it.</p>
      <p>We will never share or sell your data to third parties. All data is protected in accordance with Icelandic law and the EU General Data Protection Regulation (GDPR). You retain full control over your own data and may request its deletion at any time.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">5. Copyright</h3>
      <p>You retain full and exclusive copyright over the child's story that is created. My Child's Story makes no claims or holds no rights over the content you write or the images you upload.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">6. Automated processing and narrative creation</h3>
      <p>To assist users in shaping a cohesive and meaningful children's story, the service utilizes an advanced technological solution for automated text processing. User responses are analyzed systematically to generate intuitive follow-up questions and weave memories together into a single narrative. We place a strong emphasis on privacy; no personally identifiable information, such as names or email addresses, is shared with external technical systems during this process.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">7. Browser storage</h3>
      <p>The service uses <strong>localStorage</strong> in your browser to save your progress locally on your device. This data is only accessible by barnasagan.is and remains on your own device.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">8. Your rights</h3>
      <p>Under Icelandic law and GDPR you have the right to:</p>
      <ul style="margin:12px 0 12px 20px;line-height:2;">
        <li>Access all data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of all your data ("right to be forgotten")</li>
        <li>Export your data (PDF or plain text)</li>
      </ul>
      <p>To exercise these rights please contact us at <a href="mailto:saganmin@saganmin.is" style="color:var(--mid);">saganmin@saganmin.is</a>. We will respond within 30 days.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">9. Account deletion</h3>
      <p>You can delete your progress at any time using the "Delete progress" button in the chapter overview. To fully delete your account and all associated data, please contact us.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">10. Children's privacy</h3>
      <p>My Child's Story is a service for parents and guardians who wish to preserve memories about their child. We do not collect personal information directly from children, all information comes from the parent or guardian who is the registered user of the service.</p>

      <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin:32px 0 12px;">11. Changes to this policy</h3>
      <p>If we make material changes to this privacy policy we will notify users by email. The date at the top of this page shows when the policy was last updated.</p>

      <div style="margin-top:48px;padding:24px;background:var(--warm);border-radius:8px;border-left:3px solid var(--gold);">
        <p style="margin:0;font-size:14px;color:var(--mid);">Questions? Contact us at <a href="mailto:saganmin@saganmin.is" style="color:var(--mid);">saganmin@saganmin.is</a></p>
      </div>
      <div style="height:60px;"></div>
    `,
    aboutSub: "More than a questionnaire, a chance to reflect, remember and share.",
    aboutFeat1t: "We ask you", aboutFeat1d: "Warm questions about your child's life, chapter by chapter.",
    aboutFeat2t: "Speak or type", aboutFeat2d: "Answer at your own pace, with your voice or keyboard.",
    aboutFeat3t: "Your child's story", aboutFeat3d: "We weave your answers into a beautiful story you can give to your child.",
    aboutFeat4t: "Always saved", aboutFeat4d: "Continue anytime, anywhere, your progress follows you.",
    faqItems: [
      { heading: "About the service" },
      { q: "What is My Child's Story?", a: "My Child's Story is a platform that helps parents and other close family members record their child's story through personal and encouraging questions. Personal questions guide you through different chapters of childhood, shaping a polished, cohesive narrative from your answers." },
      { q: "Who is this service for?", a: "My Child's Story is for any parent or family member who wants to preserve the story of their child's early years. You can start at any time, whether your child is a newborn or already in school." },
      { q: "Is there a fee for the service?", a: "The first two chapters are free. Full access is purchased as a one-time payment, one price, no subscription. See <a href='/pricing.html' style='color:var(--gold);'>pricing</a>." },
      { q: "Is this really a one-time payment?", a: "Yes. You pay once and have full access to all 12 chapters for as long as the service operates. No subscriptions, no renewals. You can download your child's story as a PDF at any time and keep it forever." },
      { q: "Can I try before I pay?", a: "Yes, two chapters are unlocked for free. When you decide to unlock full access, all 12 chapters open immediately." },
      { q: "How do I pay?", a: "We use Paddle as our payment processor. They accept credit and debit cards and handle VAT in accordance with your local laws." },
      { q: "Can I get a refund?", a: "Yes, we offer a 14-day refund policy provided the PDF download has not been used. Contact us at <a href='mailto:saganmin@saganmin.is' style='color:var(--gold);'>saganmin@saganmin.is</a>." },
      { q: "Why is the price in euros and not Icelandic króna?", a: "My Child's Story is an Icelandic project, but the Icelandic payment processors we are familiar with require a monthly subscription fee that is not worth it for a small service like this. We therefore use Paddle as our payment processor — they unfortunately do not support Icelandic króna, so we are temporarily charging in euros (€32). This may change in the future. Your bank will automatically convert to króna at the exchange rate on the day of payment." },
      { q: "Can I give this as a gift?", a: "Yes! Click \"Buy gift code\" on the pricing page. You receive the code by email and pass it on. The recipient redeems it on the pricing page under \"Redeem gift code\"." },
      { q: "Is my data secure?", a: "Yes, we prioritize your privacy. Your answers are stored in an encrypted database and no other user can access them. My Child's Story is operated by an Icelandic entity (ID no. 471025-0380), and we never sell personal data." },
      { q: "How do I delete my account?", a: "You can delete your progress at any time using the 'Delete progress' button in the chapter overview. To fully delete your account and all data we hold, please contact us at saganmin@saganmin.is. We will respond within 30 days." },

      { heading: "Writing your story" },
      { q: "Do I need to answer all questions at once?", a: "Not at all. You can take a break whenever you like. Your progress is saved automatically, allowing you to pick up exactly where you left off, whether it's days or weeks later." },
      { q: "How long does it take?", a: "That is entirely up to you. Many people answer one or two questions a day and finish their book within a few weeks. Some (those who may have misplaced the baby book they once bought 🤭) can race through the answers in a much shorter time, while others take longer. There is no pressure, your progress is saved automatically and waits for you." },
      { q: "Can I write in Icelandic?", a: "Yes. You can switch languages at any time. Please note that your book will be generated in the language currently selected when you click 'Preview your book'. The system will then harmonize the narrative into that language." },
      { q: "Can I speak instead of typing?", a: "Yes, you can click the '🎙 Speak' button and answer with your voice instead of typing. On a computer, your browser will ask for microphone permission. On iPhone or iPad: tap the text field and use the 🎤 microphone button on the keyboard. The browser itself does not support speech recognition on iOS. For the speech recognition to work in Icelandic, Icelandic must be set as the device language (Settings → General → Language & Region). Voice recognition may occasionally make minor mistakes, but don't worry — when your book is generated the system reviews all your answers, smooths out any rough edges, and produces a cohesive narrative." },
      { q: "What if I can't remember exact dates or names?", a: "That's perfectly fine. My Child's Story is about your experiences and feelings. You can always write 'around that time' or leave out details you're unsure of. The system will help shape your narrative so it flows naturally regardless." },
      { q: "How much can I write for each question?", a: "There are no upper limits. You can write a single sentence or a full page. The system draws together the most important elements and ensures the narrative is balanced and beautiful." },
      { q: "Can I add my own questions?", a: "Yes! Next to each question you'll find a '+' button. You can type your own question and it will appear immediately as the next question in the chapter." },
      { q: "Can I edit my answers?", a: "Yes, you have full control over your content. Under each answer, there is an 'Edit' button that allows you to correct or expand upon your memories at any point in the process. Note that if you have already previewed or downloaded your book, updated answers will not change it automatically. You need to preview again if a new memory should make it into your book. Also keep in mind that each book is unique, so each preview and download has its own independent story. But you can always find previous versions in the panel on the right of the story screen." },
      { q: "Can I use the service on more than one device?", a: "Yes. Your progress is securely saved to our server and syncs automatically. You can start on your computer at home and continue on your phone or tablet, as long as you are signed in to the same account. We also recommend downloading your answers as a text file (.txt) regularly as a backup." },
      { q: "What happens if my connection drops while I'm writing?", a: "Nothing is lost. Your answers are saved locally on your device as you write, and sent to the server when a connection is available. If your connection drops you can keep writing and your data will sync when you are back online." },
      { q: "Can I add more questions after a chapter is complete?", a: "Yes! For the most dedicated, you can add questions within a chapter even after it has reached its 10 questions. These 10 questions are only a guideline. We know that some chapters hold more space in our hearts than others." },

      { heading: "Your book" },
      { q: "How is the story generated?", a: "Once you have provided several answers, you can select 'Preview your book'. The system organizes your responses into a logical, flowing narrative which you can then review and edit. Note that every time you preview your book, a new independent story is created. But you can always access previous versions in the panel on the right." },
      { q: "How do I receive my book?", a: "You can download your child's story as a professionally formatted PDF, complete with a cover page and chapters. You can also export the text as a plain text file. With no affiliation whatsoever, we can recommend lulu.com for a printed copy made directly from your PDF." },
      { q: "What if I want the story to be simple and direct, without added descriptions?", a: "You can choose 'Plain Narrative' when creating your book. The system then takes your answers exactly as you wrote them and arranges them into chapters without adding descriptions or altering the flow of your text. Works well if you want to keep the story factual and precise." },
      { q: "Can I edit the text after it's been generated?", a: "Yes, when you select 'Preview your book' the system creates a draft. You can then go to 'Edit text' and improve anything you'd like, add information or change the wording before downloading the final version." },
      { q: "Can the text contain errors?", a: "Yes, the system compiles the narrative automatically and grammatical or spelling errors may occasionally appear. We strongly recommend reviewing the text using the 'Edit text' button before downloading your book." },
      { q: "Can I add photos to my book?", a: "Yes! In each chapter interview you can upload photos related to that chapter, they will appear in the book at the end of the relevant chapter. You can also add general photos on the story screen, which appear at the end of the book." },

      { heading: "Tips & Tricks" },
      { q: "Can I add My Child's Story to my phone's home screen like an app?", a: `Yes! You can save the website to your home screen and use it like an app, no download required.<br><br>
    <strong>On iPhone/iPad (Safari):</strong><br>
    1. Tap the box with an arrow pointing up — the Share button — in the centre at the bottom.<br>
    2. Scroll down in the list and choose "Add to Home Screen".<br><br>
    <strong>On Android (Chrome):</strong><br>
    Open the site in Chrome, tap the three-dot menu (⋮) at the top and select "Add to Home Screen" or "Install app".<br><br>
    The site will then open directly without the browser bar and look and feel just like a real app.` }
    ],
    aboutTitle: "About",
    faqTitle: "FAQ",
    backBtn: "← Back",
    completed: "✓ Done",
  }
};

export function t(key) { return (UI[S.lang] || UI.is)[key] || key; }

export function setLang(lang) {
  S.lang = lang;
  localStorage.setItem("barnasagan_lang", lang);
  ["nav","map","interview","story","faq","about","privacy"].forEach(prefix => {
    const isBtn = document.getElementById(`${prefix}-lang-is`);
    const enBtn = document.getElementById(`${prefix}-lang-en`);
    if (isBtn) isBtn.classList.toggle("active", lang === "is");
    if (enBtn) enBtn.classList.toggle("active", lang === "en");
  });
  const navIs = document.getElementById("nav-lang-is");
  const navEn = document.getElementById("nav-lang-en");
  if (navIs) navIs.classList.toggle("active", lang === "is");
  if (navEn) navEn.classList.toggle("active", lang === "en");
  applyLang();
  document.querySelectorAll('.lang-is').forEach(el => el.style.display = (lang === 'is' ? 'block' : 'none'));
  document.querySelectorAll('.lang-en').forEach(el => el.style.display = (lang === 'en' ? 'block' : 'none'));
}

export function applyLang() {
  const L = UI[S.lang] || UI.is;
  const navLogin = document.getElementById("nav-login-btn");
  const navCta = document.getElementById("nav-cta-btn");
  if (navLogin) navLogin.textContent = L.navLogin;
  if (navCta) navCta.textContent = L.navCta;
  safeText("hero-title-text", L.heroTitle);
  safeText("hero-sub-text", L.heroSub);
  safeText("hero-cta1", L.heroCta1);
  safeText("hero-cta2", L.heroCta2);
  safeText("hero-stat-0", L.heroStats[0]);
  safeText("hero-stat-1", L.heroStats[1]);
  safeText("hero-stat-2", L.heroStats[2]);
  safeText("feat-title", L.featTitle);
  safeText("feat-sub", L.featSub);
  safeText("feat-sub2", L.featSub2);
  safeText("feat1-title", L.feat1t); safeText("feat1-desc", L.feat1d);
  safeText("feat2-title", L.feat2t); safeText("feat2-desc", L.feat2d);
  safeText("feat3-title", L.feat3t); safeText("feat3-desc", L.feat3d);
  safeText("feat4-title", L.feat4t); safeText("feat4-desc", L.feat4d);
  safeText("feat5-title", L.feat5t); safeText("feat5-desc", L.feat5d);
  safeText("feat6-title", L.feat6t); safeText("feat6-desc", L.feat6d);
  safeText("cta-title", L.ctaTitle); safeText("cta-sub", L.ctaSub); safeText("cta-btn", L.ctaBtn);
  safeText("privacy-back-btn", L.backBtn);
  safeText("footer-privacy-link", L.privacyTitle);
  const privacyEl = document.getElementById("privacy-content");
  if (privacyEl) privacyEl.innerHTML = L.privacyContent || "";
  ["nav-about-link","map-about-link","interview-about-link","story-about-link"].forEach(id => safeText(id, L.aboutTitle));
  ["nav-privacy-link","map-privacy-link","interview-privacy-link","story-privacy-link"].forEach(id => safeText(id, S.lang === "en" ? "Privacy" : "Persónuvernd"));
  safeText("about-page-title", L.aboutTitle);
  const storyEl = document.getElementById("about-story-text");
  if (storyEl) storyEl.textContent = S.lang === "en"
    ? "My Child's Story was born from a genuine desire to preserve the memories of our children's early years. Parents answer warm questions about their child, and the result is a precious gift the child can look back on."
    : "Barnasagan mín varð til af einlægri löngun til að geyma minningarnar frá fyrstu árum barnanna okkar. Foreldrar svara persónulegum spurningum um barnið sitt, og til verður ómetanleg gjöf sem barnið getur litið til baka í.";
  safeText("about-page-sub", L.aboutSub);
  safeText("about-back-btn", L.backBtn);
  safeText("about-feat1-title", L.aboutFeat1t); safeText("about-feat1-desc", L.aboutFeat1d);
  safeText("about-feat2-title", L.aboutFeat2t); safeText("about-feat2-desc", L.aboutFeat2d);
  safeText("about-feat3-title", L.aboutFeat3t); safeText("about-feat3-desc", L.aboutFeat3d);
  safeText("about-feat4-title", L.aboutFeat4t); safeText("about-feat4-desc", L.aboutFeat4d);
  safeText("about-cta-btn", S.lang === "en" ? "Start writing →" : "Hefja ferðalagið →");
  ["nav-faq-link","map-faq-link","interview-faq-link","story-faq-link"].forEach(id => safeText(id, L.faqTitle));
  safeText("faq-back-btn", L.backBtn);
  safeText("faq-page-title", L.faqTitle);
  safeText("faq-lang-is", "IS"); safeText("faq-lang-en", "EN");
  safeText("faq-title", L.faqTitle);
  safeText("map-faq-title", L.faqTitle);
  const faqHtml = L.faqItems ? L.faqItems.map(item =>
    item.heading
      ? `<h3 class="faq-category">${item.heading}</h3>`
      : `<details class="faq-item">
      <summary>${item.q}</summary>
      <p class="faq-answer">${item.a}</p>
    </details>`).join("") : "";
  ["faq-list","faq-page-list"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = faqHtml;
  });
  safeText("auth-title", L.authTitle); safeText("auth-sub-text", L.authSub);
  safeText("auth-tab-login", L.tabLogin); safeText("auth-tab-signup", L.tabSignup);
  const authEmail = document.getElementById("auth-email");
  const authPass = document.getElementById("auth-password");
  if (authEmail) authEmail.placeholder = L.emailPh;
  if (authPass) authPass.placeholder = L.passPh;
  const authBtn = document.getElementById("auth-btn");
  if (authBtn) authBtn.textContent = S.authMode === "login" ? L.loginBtn : L.signupBtn;
  safeText("auth-note", S.authMode === "login" ? L.loginNote : L.signupNote);
  safeText("auth-back-btn", L.backBtn);
  safeText("map-title-el", L.mapTitle); safeText("map-sub-el", L.mapSub);
  safeText("map-progress-lbl", L.mapProgress); safeText("map-answers-lbl", L.mapAnswers);
  safeText("map-download-answers-btn", L.downloadAnswersBtn);
  safeText("map-delete-btn", L.deleteBtn);
  safeText("map-signout-btn", L.signOut);
  safeText("interview-back-btn", L.backToMap);
  const ta = document.getElementById("answer-input");
  if (ta) ta.placeholder = L.placeholder;
  const micBtn = document.getElementById("btn-mic");
  if (micBtn && !S.isListening) micBtn.textContent = L.micBtn;
  safeText("listen-indicator", L.listening);
  const skipBtn = document.getElementById("btn-skip");
  if (skipBtn) skipBtn.textContent = S.lang === 'en' ? 'Skip →' : 'Sleppa →';
  safeText("save-indicator", L.savedIndicator);
  safeText("story-loading-text", L.loadingText);
  safeText("story-loading-sub", L.loadingSub);
  safeText("story-back-btn", L.backBtn);
  safeText("photos-title", S.lang === "en" ? "Additional photos" : "Viðbótarmyndir");
  safeText("photos-sub", S.lang === "en" ? "Photos not linked to a specific chapter appear at the end of the book." : "Myndir sem eru ekki tengdar tilteknum kafla birtast aftast í bókinni.");
  safeText("photos-hint", S.lang === "en" ? "You can select multiple photos at once" : "Þú getur valið margar myndir í einu");
  // renderPhotoGrid is called from export.js — import it dynamically to avoid circular deps
  import('./export.js').then(m => m.renderPhotoGrid());
  safeText("btn-export-pdf", L.pdfBtn);
  safeText("btn-export-txt", L.txtBtn);
  safeText("btn-export-answers", L.downloadAnswersBtn);
  const editStoryBtn = document.getElementById("btn-edit-story");
  if (editStoryBtn && editStoryBtn.textContent.includes("Breyta") || editStoryBtn && editStoryBtn.textContent.includes("Edit")) {
    editStoryBtn.textContent = L.editStory;
  }
  if (document.getElementById("screen-map").classList.contains("active")) {
    import('./map.js').then(m => m.renderMap());
  }
}

export function safeText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

window.setLang = setLang;
