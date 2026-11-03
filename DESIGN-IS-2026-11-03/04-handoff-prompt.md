# Handoff naar /make-plan

````
/make-plan Redesign de mobiele weergave (375 px) van de website Orthodoxe Tijd (`ot17/`, Vite + React). Het huidige ontwerp scoorde 12/30 in een Dieter Rams-audit (3 november 2026), met kritieke tekorten op #2 bruikbaar (1), #4 begrijpelijk (1), #6 eerlijk (1), #3 esthetisch (1) en #9 milieuvriendelijk (0).

Verdict-paragraaf (uit 03-verdict.md):
> Met 12/30 valt de mobiele site onder de grens van 20: niet de liturgische beeldwereld faalt, maar de onderliggende opbouw. Er is geen enkelvoudig ontwerpsysteem, de routes naar bidden en lezen lopen om, labels beloven iets anders dan ze doen, en alle pagina's tegelijk geladen maakt de site zwaar. Begin opnieuw vanuit het doel (de kerkelijke dag zien en vandaaruit bidden), met behoud van de beeldwereld.

Waarom redesign en niet refine: het totaal (12) ligt onder de grens van 20 en drie dragende principes (#2, #4, #6) scoren 1; de oorzaken zitten in de structuur (alle pagina's tegelijk gemount, een CSS-cascade met 314 hex-waarden en `#top#top`-ketens, kaarten waarvan href en actie verschillen), niet in losse schermen.

Behouden (verplicht):
- Beeldwereld en tokens uit `ot17/DESIGN.md`: Cinzel / Cormorant Garamond / EB Garamond, schorsbruin, perkament, goud.
- Alle paginabanners en de Etmaal-banner ongewijzigd (afspraak met de gebruiker), met de afgeronde overgang van beeld naar perkament.
- Alleen authentieke, aangeleverde religieuze beelden (Sinaï-Pantocrator, feesticonen); Byzantijnse beginletters (`public/images/letters`).
- Vijf tabs Vandaag · Kalender · Bidden · Ontdek · Meer volgens `mobile/docs/APP-MAPPING.md`, met de blauwgrijze onderbalk; de volgorde van de Vandaag-kaarten volgens mock-up 01 (`mobile/docs/mockups/goedgekeurd/`).
- De sterkste schermen: Adem-gebedsmodus (`AdemMobiel.tsx`) en de psalmlezer met vorige/volgende onderaan (`PsalterMobiel.tsx`).
- Inhoudelijke keuzes: op mobiel alleen de kerkelijke datum; "De betekenis van vandaag" als uitklapper onder de feestlink op Kerst en Pascha; eerlijke lege staat bij Gebeden.

Weggooien (verplicht):
- Alle 19 pagina's tegelijk mounten en verbergen met `.pagina-verborgen`. Bewijs: `App.tsx:278-300`, 83 % van de beeldbytes voor verborgen pagina's. Oorzaak van falen op #9.
- De CSS-cascade met overschrijvingen (`#top#top…`, 549× `!important`, 314 hex-literals, 38 lettergroottes). Bewijs: `src/index.css`, `src/components/*.css`. Oorzaak van falen op #3.
- Kaarten waarvan de href iets anders belooft dan de klik doet. Bewijs: `VandaagMobiel.tsx:31-37`, `Vandaag.tsx:110-122`. Oorzaak van falen op #6 en #2.
- Vaktermen zonder uitleg als labels en titels. Bewijs: `PsalterMobiel.tsx:61`, `VandaagMobiel.tsx:322`, `EtmaalMobiel.tsx:68`. Oorzaak van falen op #4.

Top 5 zetten uit de audit (letterlijk):
1. #2 Bruikbaar: van elke Vandaag-kaart rechtstreeks naar de tekst om te bidden of te lezen. De diensttekst komt eerst, niet onder "Over dit moment" (`EtmaalMobiel.tsx:135-188`). De lezing eindigt in de app zodra er een tekstbron is (`LezingModal.tsx:67`).
2. #6 Eerlijk: elk label en elke link doet wat er staat. Geen href die iets anders opent (`VandaagMobiel.tsx:31-37`, `Vandaag.tsx:110-122`), geen tikbare "Binnenkort" (`Bidden.tsx:88`), een juiste opslagclaim (`InstellingenMobiel.tsx:449` vs `:302`), toestemming vóór Google Tag Manager (`index.html:4-9`) en één juiste kalendernaam (`InstellingenMobiel.tsx:59`).
3. #4 Begrijpelijk: één woordenlijst met uitleg ter plekke voor Toon, Kathisma, Etmaal, Pijlgebed, Troparion en Metten/Completen. Gewone woorden in titels ("Psalter in 20 delen", `PsalterMobiel.tsx:61`).
4. #3 Esthetisch: één tokenstelsel met hooguit 8 lettergroottes, een vaste afstandsschaal en kleuren alleen uit DESIGN.md, in plaats van 38 maten, 314 hex-waarden en de `#top#top`-ketens. Eén chrome-kleur voor onderbalk en vensterbalken.
5. #9 Milieuvriendelijk: alleen de actieve pagina renderen, zodat 83 % van de beeldbytes vervalt. De heiligen-chunk pas laden als hij nodig is (`App.tsx:200`). Een bewuste keuze voor donkere modus in de hoofdinterface.

Redesignprincipes in volgorde:
1. #2 Bruikbaar — vanaf Vandaag in hooguit twee tikken bij de tekst om te bidden of te lezen, zonder de app te verlaten waar een tekst bestaat.
2. #6 Eerlijk — elk label, elke link en elke privacyclaim klopt 1-op-1 met het gedrag; tracking alleen na toestemming.
3. #4 Begrijpelijk — een nieuwe gebruiker benoemt elk primair element zonder hulp; vaktermen altijd met uitleg ter plekke.

Opleveringen voor het plan:
- Nieuwe informatiearchitectuur (niet afgeleid van de oude): per tab de schermen en de route naar bidden of lezen.
- Nieuwe primaire flow (low-fi, gelabeld, naast de huidige gezet): Vandaag → gebedsuur → tekst; Vandaag → lezing → tekst.
- Toestandenlijst: leeg, laden, fout, gelukt, focus (niet achter de onderbalk, terug na sluiten), uitgeschakeld.
- Migratiepad: bestaande localStorage-sleutels (kalenderkeuze, pijlgebed, leesplek, favorieten) blijven werken.
- Overgangscriteria: wanneer de oude mobiele weergave vervalt (alle schermen in de nieuwe opbouw, Rams-herscore ≥ 20).

Valkuilen voor deze redesign:
- De oude structuur overzetten onder nieuwe styling.
- Beide ontwerpen voor onbepaalde tijd achter een schakelaar houden.
- Een trend volgen in plaats van de principes hierboven.
- De behoudlijst als optioneel behandelen: banners, authentieke beelden en goedgekeurde mock-ups zijn vast.
````
