# Barnasagan mín — reglur fyrir Claude

## Málfar (reglur Maju)
- **Sem allra fæst þankastrik (—)** í öllum texta, líka í AI-prompt-um og svörum.
- **Engin þágufallssýki**: „mig langar", aldrei „mér langar". Á líka við um texta sem AI skrifar (reglan er í translate- og proof-prompt-unum í js/story.js).
- Lokakort kafla: „Kafla X lokið!" (þágufall), borðinn efst „Kafli X" (nefnifall).

## Gullna reglan (Supabase)
Eftir HVERT deploy á edge function í Supabase dashboard: fara í Settings fallsins og slökkva á **"Verify JWT with legacy secret"** + Save. Kveikist sjálfkrafa aftur við hvert deploy.

## Útlit: „Fágað appelsínugult" (C)
- Tókenar eru AÐEINS í styles.css (index.html hefur enga :root-blokk).
- Ljóst: --cream #FFF8F0, --warm #FFF1E0, --gold #FB8C00, --orange #E06C00, --text #3E2723, --mid #7A5F4D, --border #F2DCB8.
- Letur: Fredoka One (fyrirsagnir), Nunito (meginmál).

## Arkitektúr í hnotskurn
- Vanilla ES-modules, ekkert build. GitHub Pages (commit + Sync í VS Code, ~5 mín skyndiminni, Ctrl+Shift+R).
- Supabase-verkefni: gyehrvryxdgvfhfhwyyy. Gemini um gemini-proxy (session-token auth). Módel í js/config.js OG ALLOWED_MODELS í gemini-proxy þurfa að passa saman.
- Fjölbörn: S.activeChildId, user_progress á (user_id, child_id), útgáfur í story_versions, localStorage-lyklar með childId.
- Spyrillinn: decideNextQuestion í js/gemini.js (þráðamódel, JSON-ákvörðun, temp 0,2), flæðið í js/interview.js.
- Röddin: upptökum foreldra HENT eftir umritun; rödd barnsins geymd í js/barnsrodd.js (þak 10×2 mín), QR-deiling í js/voiceshare.js + rodd.html; upplestur í js/tts.js (tts-proxy/Azure).
- Fjölskyldan: js/fjolskyldan.js (spurningar/deiling) + fjolskylda.html + family-notify (boðshlekkur á hvert barn). ATH: js/family.js er annað — fjölskyldugerðin (getFamilyContext/setFamilyType).
- Aldrei commita skrár sem byrja á "agent-".

## Hlutleysisregla spyrilsins og spurninga
- Aldrei gefa sér að allt hafi gengið vel hjá barni eða fjölskyldu; hlutleysi þar til svörin sýna annað, hlýja án fegrunar við erfið svör.
- Aldrei gefa sér fjölskyldugerð: tvær mömmur, tveir pabbar eða eitt foreldri er allt jafn sjálfsagt (family_type sér um foreldraheiti í sögunni). Kjarnaspurningar mega ekki segja „ykkur“ um foreldra eða gefa sér að barn gangi, tali eða hafi fæðst hjá foreldrinu.
