# Redesign-plan: Orthodoxe Tijd mobiel (375 px)

**Bron:** Dieter Rams-audit 12/30 (`01`–`04` in deze map), REDESIGN.
**Status:** plan, nog niet uitgevoerd. Elke fase is los uit te voeren in een nieuwe sessie: lees eerst "Fase 0 — vaste feiten" en de bronnen van die fase.
**Grens:** alleen mobiel (< 768 px). Desktop blijft ongewijzigd; elke wijziging moet op desktop een no-op zijn (`useMobiel()` of `@media (max-width:767.98px)`).
**Al gedaan** (niet opnieuw doen):
- alleen bezochte pagina's opbouwen (`App.tsx`: `bezocht`-set, `blad()`, herverzonden open-venster-berichten);
- vensterbalken en de Bronnen-strook blauwgrijs zoals de onderbalk;
- één kopbalk (`Kop`) op alle pagina's behalve Vandaag;
- Heiligen van de dag volgens mock-up 15;
- één kerkelijke datum (`formatKerkLang`, `lib/kalender.ts:113`).

---

## Fase 0 — vaste feiten en besluiten (consolidatie van de verkenning)

### Behouden, niet onderhandelbaar
- Beeldwereld uit `ot17/DESIGN.md`: Cinzel (`--font-titel`), Cormorant Garamond (`--font-display`), EB Garamond (`--font-lees`), schors-bruin, perkament, goud.
- Alle paginabanners en de Etmaal-banner (gebruikersafspraak); de afgeronde overgang van beeld naar perkament.
- Alleen authentieke, aangeleverde religieuze beelden; Byzantijnse beginletters (`public/images/letters`).
- Goedgekeurde mock-ups `mobile/docs/mockups/goedgekeurd/01–16` met `LEESMIJ.md`. `mobile/docs/APP-MAPPING.md` is leidend voor navigatie: vijf tabs en een blauwgrijze onderbalk.
- Adem-gebedsmodus (`AdemMobiel.tsx:141-205`) en psalmlezer (`PsalterMobiel.tsx:195-351`).
- DESIGN.md §7: geen gegenereerde of geparafraseerde liturgische teksten, geen verzonnen heiligengegevens, geen Engelse restanten, geen AI-copy, geen knoppen zonder functie.

### Bestaande bouwstenen (toegestaan, met handtekening)

| Bouwsteen | Plek | Handtekening / gebruik |
|---|---|---|
| `Kop` | `MobielLaag.tsx:65` | `{ terug, licht?, merk?, rechts?, slim? }` |
| `Laag` | `MobielLaag.tsx:25` | `{ className, label, children }`: volledig scherm, focus, inert, Esc = Terug |
| `LeesWeergave` | `MobielLaag.tsx:89` | `{ titel, ondertitel?, onder?, boven?, terug, deelPad, className?, slim?, children }` |
| `PopupTekst` | `MobielLaag.tsx:121` | `{ inhoud: PopupInhoud }`; type in `lib/cyclusTeksten.ts:19-29` |
| `Sierlijn` | `MobielLaag.tsx:13` | `{ licht? }` |
| `AftelKaart`, `InfoRegels`, `Rij` | `CyclusMobiel.tsx:17`, `:53`, `:80` | — |
| `Modal` | `Modal.tsx:9-37` | props, waaronder `kopDatum`, `kopNav`, `lezen` |
| `KleurVanDeDag` | `KleurVanDeDag.tsx:8-35` | patroon voor een info-knop die uitleg toont (`aria-expanded`, `useId`) |
| Hash-subroute | `EtmaalMobiel.tsx:44-48`, `AdemMobiel.tsx:76-81`, `usePijlgebedOpen` (`VandaagMobiel.tsx:55`) | `useSyncExternalStore` op de hash |
| Navigatie | `lib/navigatie.ts` | `gaNaar`, `groepVan`, `onthoudGroep`, `terugNaarGroep` |
| Detectie | `lib/desktop.ts:19` | `useMobiel()` |
| Open-venster-berichten | `lib/events.ts` | `OPEN_POPUP_EVENT`, `OPEN_DIENST_EVENT`; App bouwt de doelpagina eerst op |
| Datumhulp | `lib/kalender.ts` | `formatKerkLang(civil, mode)`, `kerkDatum`, `formatMd` |
| Enkelvoud/meervoud | `CyclusMobiel.tsx:41`, `Cycli.tsx` (`aantal`) | `dagen === 1 ? 'dag' : 'dagen'` |

### Bestaat níet (niet aannemen)
- Geen Nederlandse bijbeltekst in de app: alleen Engelse NKJV-verzen in `public/data/<jaar>/lezingen-MM.json`.
- Geen liturgische diensttekst: `lib/etmaal.ts` `ServiceMapping` heeft geen tekstveld. De PDF's in `public/data/pdfs/` zijn uitleg, geen dienstorde.
- Psalmtekst alleen voor 10 van de 150 psalmen (`lib/psalmen.ts:42-53`).
- Geen UI-testframework (geen vitest, jest of playwright). Controles: `npm run lint`, `npx tsc -b --noEmit`, `npm run check:*` (node assert-scripts in `scripts/*.check.ts`).
- Geen toestemmingsmechanisme voor Google Tag Manager (`index.html:4-10`, `:26-29`).
- Geen woordenlijst, `<abbr>` of `<dfn>`.

### Gemeten uitgangssituatie (doelen ernaast)

| Wat | Nu | Doel |
|---|---|---|
| Lettergroottes mobiel | 53 waarden in de CSS, 38 gerenderd | ≤ 8 |
| `#top#top`-ketens / `!important` | `index.css` 762 / 1522; `ontwerp.css` 105 / 193; mobiele bestanden 10–51 per stuk | 0 in nieuwe mobiele CSS |
| Inkt | `--inkt` = #0b1b2a navy (`Vandaag.css:8`), terwijl DESIGN.md #2B1D12 voorschrijft; alleen gecorrigeerd in `.vm2`, `.pm`, `.ism` | één inkt |
| Goud / gedempt / rood | `--goud` #ac792f, `--goud-pijl` #7a5a2a, `--gedempt` #5d5040, vijf rode tinten — wijken af van DESIGN.md §2 | DESIGN.md-waarden |
| JS eerste weergave Vandaag | ± 452 KB gzip (index + heiligen-chunk, `App.tsx:200-203`) | ≤ 250 KB |

### Besluiten die de gebruiker vóór de fase moet nemen
- **B1 (fase 2):** Google Tag Manager — toestemming vragen (banner) of verwijderen?
- **B2 (fase 1):** de onderbalk is blauwgrijs (APP-MAPPING), DESIGN.md zegt "warm palette only". Voorstel: DESIGN.md aanpassen naar de goedgekeurde blauwgrijze onderbalk en vensterbalken.
- **B3 (fase 4):** de naam van de kalenders in de interface, bijvoorbeeld "Oude kalender (Kerst 7 januari)" en "Nieuwe kalender (Kerst 25 december)", in plaats van "Gregoriaanse kalender", wat onjuist is.
- **B4 (fase 6):** donkere modus voor de hele mobiele interface, of bewust alleen voor de leesweergaven (vastleggen in DESIGN.md).
- **B5 (fase 3):** bronnen voor uitlegteksten in de woordenlijst: alleen bestaande sitetekst, of aanvulling door de gebruiker.

---

## Fase 1 — Fundament: mobiele tokens en een schone componentlaag (#3)

**Wat:**
1. Maak `src/mobiel/tokens.css`, geïmporteerd in `main.tsx`. Daarin, binnen `@media (max-width:767.98px)` op `:root`:
   - een typeschaal van 8 stappen, afgeleid van wat nu het meest voorkomt: 12 / 13 / 15 / 17 / 19 / 24 / 30 / 42 px, als `--m-t-*`;
   - een afstandsschaal van 4 / 8 / 12 / 16 / 20 / 24 / 32 px (`--m-r-*`);
   - kleuren uit DESIGN.md §2 (`--ot-bark`, `--ot-bark2`, `--ot-gold`, `--ot-gold2`, `--color-gold-deep`, `--ot-ivory`, `--color-ink`, `--color-ink-soft`, `--ot-wijnrood`, `--lit-*`), plus de blauwgrijze chrome uit `bottom-nav.css:5-8` als `--m-chrome-*` (besluit B2).
2. Maak `src/mobiel/` met nieuwe componenten onder een eigen klasse-voorvoegsel `m-`: `MKaart` (link óf knop, nooit beide), `MRij`, `MLabel`, `MSectie`. Baseer ze op de bestaande `Kop`, `Laag` en `LeesWeergave` (die blijven, met nieuwe `m-`-stijlen).
   - De stijlen in `src/mobiel/mobiel.css` gebruiken alleen `:where()` en tokens: geen `#top`, geen `!important`.
   - Omdat de klassen nieuw zijn, raken de oude `#top`-regels ze niet.
3. Werk DESIGN.md bij: tokens, typeschaal en blauwgrijze chrome.

**Bronnen:** DESIGN.md §2–3; `index.css:4-25`, `:257`, `:1815`; `Vandaag.css:6-34`; `bottom-nav.css:5-8`; `MobielLaag.tsx` (volledig).

**Verificatie:**
- `npm run lint` en `npx tsc -b --noEmit` zonder fouten.
- `grep -E "#top|!important" src/mobiel/` → 0 treffers.
- De componenten staan in een tijdelijke voorbeeldpagina en zien er uit zoals de mock-upkaarten (01-vandaag) op 375 px. Haal de voorbeeldpagina daarna weer weg.
- Desktop ongewijzigd: schermafdruk van Vandaag en Kalender op 1280 px vóór en na is identiek.

**Valkuilen:**
- Geen oude klassen (`vm2-`, `hm-`, `am-`…) hergebruiken in de nieuwe laag.
- Geen nieuwe kleuren buiten DESIGN.md.
- Geen Tailwind-utilities voor mobiele opmaak; de mobiele laag is eigen CSS.

---

## Fase 2 — Eerlijke links en labels (#6, #2)

**Wat:**
1. **Vandaag-kaarten:** href en actie moeten gelijk zijn. Geef de vensters een eigen hash-route, zoals al bestaat voor `#vandaag/pijlgebed` (`VandaagMobiel.tsx:55`): `#vandaag/lezingen`, `#vandaag/heiligen`, `#vandaag/dag`. De kaart linkt dan naar die route en App opent het venster op basis van de hash.
   - Verwijder de `preventDefault`-route in `Kaart` (`VandaagMobiel.tsx:31-39`).
   - Gebedsuur: href `#etmaal/<slug>` in plaats van `#etmaal` (`Vandaag.tsx:109-112`).
2. **Gebeden-kaart op Bidden** (`Bidden.tsx:22`, `:88-95`): zolang `GEBEDEN_ZICHTBAAR = false` is het geen link. Toon een niet-tikbare regel "Binnenkort", zonder pijl.
3. **Opslagclaim** (`InstellingenMobiel.tsx:449`): alleen tonen als er geen meldingenserver actief is. Anders verwijzen naar de tekst bij `BEZORGING.aan` (`:302`).
4. **Google Tag Manager:** uitvoeren volgens besluit B1. Bij toestemming: GTM pas laden na "ja", en de keuze bewaren in `localStorage`.
5. **Labels die niet kloppen:**
   - "1 dagen": gebruik het enkelvoud uit `CyclusMobiel.tsx:41` (`PaschaMobiel.tsx:125`, `GeboorteMobiel.tsx:110`).
   - Jul/Greg-legenda niet tonen op mobiel (`Heiligen.tsx:233`).
   - Bewaar-knop: het `aria-label` volgt de toestand, en bij "Bewaard" staat "tik om te verwijderen" (`BoekenMobiel.tsx:248-249`).
   - "Over Orthodoxe Tijd" wordt "Bronnen en verantwoording" (`InstellingenMobiel.tsx:491`).
   - "Verder lezen" gaat naar de echte leesplek via de logica van `VerderLezen` (`PsalterMobiel.tsx:28-44`, gebruikt bij `InstellingenMobiel.tsx:212`).
   - "Ademhulp" wordt "Ademhulp kiezen", of start meteen in het bewaarde tempo (`AdemMobiel.tsx:185-197`).

**Bronnen:** `VandaagMobiel.tsx:25-69`; `Vandaag.tsx:100-125`; `App.tsx` (vensterstatus, `bezocht`); `lib/herinneringen.ts:20`, `:102-128`; `server/LEESMIJ.md:61-68`.

**Verificatie:**
- Script in de browser op 375 px: voor elke `a[href]` op Vandaag, Bidden en Meer opent een klik precies de href. Er komen geen `preventDefault`-paden meer voor in `VandaagMobiel.tsx` (grep).
- Terugknop van de telefoon sluit elk venster dat via een route is geopend.
- Zonder toestemming: 0 verzoeken naar `googletagmanager.com` (netwerkoverzicht).

**Valkuilen:**
- Geen nieuwe tekstclaims bedenken; copy alleen inkorten of verduidelijken.
- Geen vensters in een andere pagina laten openen zonder route.

---

## Fase 3 — Bid- en leesroutes (#2)

**Wat:**
1. **Dienstpagina** (`EtmaalMobiel.tsx:115-153`): wat je kunt bidden komt eerst.
   - Bovenaan het kernvers als gebed: patroon van `PijlgebedBidden` (`VandaagMobiel.tsx:57-69`) en de `am-bid`-opbouw (`AdemMobiel.tsx:141-205`).
   - Daaronder de psalmen van dit uur met tekst, als directe links naar de psalmlezer (`#psalmen/<n>`).
   - "Over dit moment" wordt een secundaire rij onderaan.
   - Geen diensttekst verzinnen: die bestaat niet in de data.
2. **Gebedsuur-kaart op Vandaag:** rechtstreeks naar die dienstpagina (zie fase 2.1).
3. **Lezingen:** volgens het besluit van de gebruiker voorlopig geen Nederlandse tekst.
   - `DagLezingen` en `LezingModal` worden één leesweergave via `LeesWeergave` op route `#vandaag/lezingen/<n>`.
   - De verwijzing staat groot, de link naar debijbel.nl blijft eerlijk gelabeld ("Opent buiten de app").
   - Bouw een plek in waar later een Nederlandse tekstbron in past (`laadLezingen`, `lib/htc.ts:105`), zonder tekst te verzinnen.
4. **Pijlgebed:** blijft zoals het is (gebruikersbesluit: pijlgebed en Adem zijn verschillend).

**Bronnen:** `EtmaalMobiel.tsx:15-256`; `lib/etmaal.ts:11-128`; `lib/psalmen.ts:42-72`; `PsalterMobiel.tsx:195-351`; `AdemMobiel.tsx:141-205`; `LezingModal.tsx`; `DagLezingen.tsx:35-67`; `lib/htc.ts:66-271`.

**Verificatie:**
- Van Vandaag naar de tekst van het gebedsuur in ≤ 2 tikken; van Vandaag naar een lezing in ≤ 2 tikken (handmatig op 375 px).
- `grep` toont geen nieuwe liturgische tekst in `src/`: alleen bestaande data wordt hergebruikt.
- Escape en de terugknop geven de focus terug aan de kaart. Dat ontbreekt nu bij Adem (`AdemMobiel.tsx`): repareren met het patroon van `Laag`.

**Valkuilen:**
- Geen geparafraseerde gebeden of diensten (DESIGN.md §7).
- De psalmlezer en Adem niet herbouwen: alleen erheen linken.

---

## Fase 4 — Begrijpelijk (#4)

**Wat:**
1. Maak `src/lib/woordenlijst.ts` met `PopupInhoud`-items voor Toon, Octoechos, Kathisma, Stasis, Metten/Vespers/Completen, Etmaal, Pijlgebed, Troparion, typikon, chotki en beweeglijk.
   - Tekst alleen uit bestaande sitebronnen: `KATHISMA_UITLEG` (`psalmenAdres.ts:37`), `ETMAAL_INFO` (`lib/cyclusTeksten.ts:111`), de toonuitleg op `#week/lees/betekenis`, `ADEM_POPUPS` (`cyclusTeksten.ts:31`). Of tekst van de gebruiker (besluit B5).
2. Maak `MTerm`: een woord met een kleine info-knop die een korte uitleg openklapt, gebaseerd op `KleurVanDeDag.tsx:8-35`.
   - Gebruik het op: `VandaagMobiel.tsx:165` (Toon), `WeekMobiel.tsx:162`, `PsalterMobiel.tsx:61/81` (titel "Psalter in 20 delen" met Kathisma als uitleg), `EtmaalMobiel.tsx:68/222`, `FeestenMobiel.tsx:350`, `GeboorteMobiel.tsx:186`, `PaschaMobiel.tsx:220`, `Vasten.tsx:80`, `AdemMobiel.tsx:24`.
3. Eén kalendernaam overal volgens besluit B3: `KalenderUitleg.tsx:10-13`, `InstellingenMobiel.tsx:57-60/487`, `Kalender.tsx:121`, DESIGN.md:109-116.
4. "OT" voluit "Oude Testament"; "NBV21" en "NKJV" met een omschrijving (`DagLezingen.tsx:53`, `LezingModal.tsx:54/82`).

**Bronnen:** zie hierboven; DESIGN.md §7 (copyregels).

**Verificatie:**
- `grep` op de jargonlijst in mobiele labels: elk voorkomen heeft `MTerm` of een gewone omschrijving ernaast.
- Een nieuwe gebruiker (handmatige test) benoemt alle primaire knoppen op Vandaag, Bidden en Ontdek zonder hulp.

**Valkuilen:**
- Geen uitleg verzinnen.
- Geen tooltips die alleen bij hover werken: het moet tikbaar zijn.

---

## Fase 5 — Pagina's herbouwen op het fundament (#3, #10)

**Wat:** zet per pagina de mobiele weergave over op `src/mobiel/` (fase 1). Volgorde:
1. Vandaag
2. Bidden (Etmaal-overzicht; Psalter-overzicht)
3. Kalender
4. Ontdek (Week, Jaar, Pascha, Geboorte)
5. Meer (Vasten, Heiligen, Feesten, Boeken, Instellingen, Bronnen)

Per pagina:
- **Bouw:** nieuwe markup met `m-`-klassen; vergelijk met de bijbehorende mock-up (01–16).
- **Dubbelingen:** haal dubbele ingangen weg (Etmaal: `a.em-nu` naast de lijst; Vasten: twee links naar dezelfde periode; Bidden: twee links in één kaart; `a.vg-merk` op Vandaag naar zichzelf).
- **Oude CSS:** verwijder daarna de oude CSS-regels van die pagina: het `*-mobiel.css`-bestand en de mobiele blokken in `index.css`, `Vandaag.css` en `ontwerp.css` die alleen die pagina raken.
- **Ongemoeid:** banners, beelden en inhoud blijven gelijk.

**Bronnen:** de verkenningstabel in fase 0 (CSS-bestanden met regelaantallen); `App.tsx:84-104` (INHOUD); de mobiele vertakkingen (`Kalender.tsx:138`, `Vasten.tsx:284`, `Psalmen.tsx:215`, `Jaarcyclus.tsx:147`, `Heiligen.tsx:196`, en de `*Mobiel.tsx`-componenten).

**Verificatie per pagina:**
- Schermafdruk op 375 px naast de mock-up.
- Gerenderde lettergroottes ≤ 8 verschillende waarden (meetscript uit de audit: `getComputedStyle` op zichtbare tekst).
- Geen horizontaal scrollen; tikvlakken ≥ 44 px.
- Het oude CSS-bestand is weg en `grep` vindt de oude klassen niet meer in `src/`.
- Desktop-schermafdruk van dezelfde pagina ongewijzigd.

**Valkuilen:**
- De oude structuur niet onder nieuwe stijl zetten: herbouwen vanuit de mock-up, niet de oude JSX kopiëren.
- Oud en nieuw niet naast elkaar laten bestaan achter een schakelaar: per pagina in één keer overzetten.

---

## Fase 6 — Gewicht, toegankelijkheid en donker (#9, #8)

**Wat:**
1. **Gewicht:** de heiligen-chunk niet meer laden op Vandaag (`App.tsx:200-203`). Haal de heilige van de dag uit een kleine dagindex (aparte JSON per maand, zoals `public/data/heiligenjaar/MM.json`).
2. **Animaties:** de lampanimaties (`Vandaag.css:335`, `:648`) pauzeren buiten beeld met `IntersectionObserver` en `animation-play-state`.
3. **Focus:**
   - `scroll-padding-bottom` gelijk aan de hoogte van de onderbalk, zodat de focus niet achter de balk valt;
   - een skiplink die op mobiel werkt (`Header.tsx:113` staat nu in een verborgen header);
   - na sluiten gaat de focus terug naar de knop die het venster opende, overal.
4. **Contrast:** inactieve labels in de onderbalk ≥ 4,5:1 (nu 3,50:1 bovenaan het verloop; `bottom-nav.css`).
5. **Donker:** uitvoeren volgens besluit B4.

**Bronnen:** `App.tsx:195-215`; `lib/heiligen.ts:1`; `Vandaag.css:335`, `:648`; `index.css:694`, `:1017`, `:181`; `bottom-nav.css`.

**Verificatie:**
- Productiebuild (`npx vite build` naar een tijdelijke map): de JS bij de eerste weergave van Vandaag ≤ 250 KB gzip.
- `document.getAnimations()` op Vandaag in rust: 0 lopend buiten beeld.
- Toetsenbordtest: alle 8 primaire acties uit de audit, met Escape en focusterugkeer.

**Valkuilen:**
- Geen nieuwe afhankelijkheden toevoegen voor wat het platform al kan.
- Het tijdelijke buildresultaat niet in `dist/` zetten.

---

## Fase 7 — Eindcontrole

1. `npm run lint`, `npx tsc -b --noEmit` en alle `npm run check:*` slagen.
2. Grep op valkuilen:
   - `#top#top` en `!important` in `src/mobiel/` → 0;
   - `preventDefault` in de kaarten → 0;
   - `GEBEDEN_ZICHTBAAR`-kaart → geen link;
   - geen hex-kleuren buiten de tokens in `src/mobiel/`.
3. Desktop-regressie: schermafdrukken op 1280 px van alle 15 desktoppagina's vóór en na zijn gelijk.
4. Rams-herscore met `claude-mem:design-is` op hetzelfde oppervlak (doel ≥ 20/30, geen 0). Daarnaast `/impeccable critique` en `/impeccable audit` alleen op mobiel.
5. DESIGN.md bijgewerkt (tokens, chrome, woordenlijst, donker), en `.impeccable/critique` met de nieuwe score.
