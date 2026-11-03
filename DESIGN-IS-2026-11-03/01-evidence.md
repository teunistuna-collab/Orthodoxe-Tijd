# Bewijs per principe (mobiel, 375 × 812, 3 november 2026, oude kalender)

Vijf onderzoekers, elk in een eigen browsertab; alleen feiten met bron. Paden relatief aan `ot17/src/components/` tenzij anders vermeld.

## S. Structuur
- S1 Interactieve elementen (zichtbaar): Vandaag 13 · Kalender 54 (42 dagcellen) · Bidden 10 · Ontdek 11 · Meer 11 · Heiligen 37 (38 tabstops) · Vasten 20 · Etmaal 19.
- S2 Nesting Vandaag: DOM 10 niveaus onder `main`; React App → Vandaag → VandaagMobiel → Kaart → VastenSymbool (`VandaagMobiel.tsx:25,109,115`).
- S3 Dubbele ingangen op één scherm: `a.vg-merk` → #vandaag op Vandaag (`Vandaag.tsx:155`); Etmaal twee links naar #etmaal/vespers; Vasten twee links naar dezelfde periode; Bidden één kaart met twee links naar Etmaal; Terug dupliceert de onderbalk (Heiligen, Vasten → #meer; Etmaal → #cycli).
- S4 href ≠ actie op Vandaag: Kaart doet `preventDefault` en voert iets anders uit (`VandaagMobiel.tsx:31-37`): gebedsuur (#etmaal → openDienst), Feesten & heiligen (#heiligen → venster), Schriftlezingen (#kalender → venster) (`Vandaag.tsx:110-122`).
- S5 Ongebruikte props/imports: 0 (eslint en tsc schoon).

## V. Beeld
- V1 Spacing: 49 verschillende waarden, waarvan 28 ≥ 3× gebruikt, inclusief 11.3 / 22.4 / 23.9 / 92.6.
- V2 Type: 38 verschillende lettergroottes, waarvan 10 fractioneel (clamp); meest gebruikt 15, 13, 17.
- V3 Kleur: 32 tekstkleuren, 32 achtergrondkleuren; 104 hex-literals in de mobiele CSS-bestanden, 314 in alle CSS.
- V4 Laagste contrast in primaire tekst: 3,60:1 (uitgeschakelde "Vandaag" bij Vasten, `vasten-mobiel.css:73`); 4,85:1 datumbereik Vasten; de rest ≥ 5:1.
- V5 Toestanden: leeg ✔ (live), laden ✔ / fout ✔ (met opnieuw proberen) / gelukt ✔ (afgeleid uit de bron), focus ✔ (103 `:focus-visible`-regels), uitgeschakeld ✔.
- V6 Onderbalk is blauwgrijs (#1c4b68 → #09283d), vensterbalken sinds commit c27e635 bruin (#24130d → #160b08): twee kleuren voor chrome.

## C. Tekst en eerlijkheid
- C1 Geen marketingsuperlatieven; toon bescheiden ("Een kleine orthodoxe bibliotheek", `Meer.tsx:204`).
- C2 Opslag-claim spreekt zichzelf tegen: "Je keuzes worden alleen op dit apparaat bewaard" (`InstellingenMobiel.tsx:449`) tegenover de meldingenserver die keuzes, kalender en tijdzone bewaart (`InstellingenMobiel.tsx:302`, `lib/herinneringen.ts:20,85`).
- C3 Google Tag Manager en Analytics laden zonder toestemming (`index.html:4-9`); geen keuze-UI in de app.
- C4 Label ≠ gedrag: "Binnenkort"-kaart Gebeden is tikbaar (`Bidden.tsx:22,88`); "Het kerkelijk jaar" gaat naar drie bestemmingen (`Vandaag.tsx:121`); "Bewaard in mijn boekenlijst" verwijdert bij tikken (`BoekenMobiel.tsx:248-249`); "Ademhulp" start niets (`AdemMobiel.tsx:185`); "Gregoriaanse kalender" is in werkelijkheid gereviseerd juliaans (`InstellingenMobiel.tsx:59`); "Lees verder op debijbel.nl" terwijl er niets te lezen stond (`LezingModal.tsx:67`); "1 dagen" (`PaschaMobiel.tsx:125`, `GeboorteMobiel.tsx:110`); legenda "Jul/Greg" zonder Jul/Greg (`Heiligen.tsx:233`).
- C5 Vaktermen zonder uitleg: Toon, Octoechos, Kathisma (zelfs paginatitel, `PsalterMobiel.tsx:61`), Stasis, Metten/Completen, Etmaal, Pijlgebed, Troparion, typikon, chotki, beweeglijk, OT, NBV21/NKJV.
- C6 De te bidden diensttekst staat onder "Over dit moment" (`EtmaalMobiel.tsx:135-188`).

## W. Gewicht
- W1 JS eerste weergave Vandaag: index + heiligen-chunk = 1.653.569 B ruw / ± 452 KB gzip; CSS 489 KB ruw / 78 KB gzip (`App.tsx:200-203`).
- W2 Productie, eerste weergave: ± 54 verzoeken, ± 3,0 MB; afbeeldingen ± 2,23 MB, waarvan 1,85 MB (83 %) voor verborgen pagina's.
- W3 Tijd tot `main h1` (dev): 1,7–3,3 s, intro bedekt die tijd.
- W4 Animaties in rust: 2 oneindig (`Vandaag.css:335`, `:648`), onder de vouw; `prefers-reduced-motion` gerespecteerd (`index.css:181`).
- W5 Donkere modus: alleen leesweergaven (`index.css:1017`); de hoofdinterface blijft licht (`index.css:167` `color-scheme: light`).
- W6 Eerste bezoek: één welkomstvenster (`KalenderUitleg.tsx:44`), geen badges of meldingsvragen.

## A. Toegankelijkheid
- A1 Contrast: alle teksttokens AA, behalve inactieve labels in de onderbalk (3,50:1 bovenaan de gradiënt) en de Vandaag-datum op een lichte plek in de foto (1,66:1 lokaal).
- A2 Focusvolgorde logisch; nooit in verborgen pagina's. Gefocuste items verdwijnen achter de vaste onderbalk (geen `scroll-padding-bottom`).
- A3 Toetsenbord: alle 8 primaire acties bereikbaar; Escape sluit en geeft de focus terug, behalve bij Adem (focus valt naar BODY).
- A4 Oriëntatiepunten: 1 `main`, 1 `nav` (onderbalk); kopstructuur H1 + 6 H2, H2's binnen links.
- A5 Skiplink bestaat, maar is op mobiel onbereikbaar (`Header.tsx:113`, verborgen door `index.css:694`).
