# Oordeel: REDESIGN

Met 12/30 valt de mobiele site onder de grens van 20: niet de liturgische beeldwereld faalt, maar de onderliggende opbouw. Er is geen enkelvoudig ontwerpsysteem, de routes naar bidden en lezen lopen om, labels beloven iets anders dan ze doen, en alle pagina's tegelijk geladen maakt de site zwaar. Begin opnieuw vanuit het doel (de kerkelijke dag zien en vandaaruit bidden), met behoud van de beeldwereld.

## De vijf zetten met het meeste effect
1. **#2 Bruikbaar:** van elke Vandaag-kaart rechtstreeks naar de tekst om te bidden of te lezen. De diensttekst komt eerst, niet onder "Over dit moment" (`EtmaalMobiel.tsx:135-188`). De lezing eindigt in de app zodra er een tekstbron is (`LezingModal.tsx:67`).
2. **#6 Eerlijk:** elk label en elke link doet wat er staat. Geen href die iets anders opent (`VandaagMobiel.tsx:31-37`, `Vandaag.tsx:110-122`), geen tikbare "Binnenkort" (`Bidden.tsx:88`), een juiste opslagclaim (`InstellingenMobiel.tsx:449` vs `:302`), toestemming vóór Google Tag Manager (`index.html:4-9`) en één juiste kalendernaam (`InstellingenMobiel.tsx:59`).
3. **#4 Begrijpelijk:** één woordenlijst met uitleg ter plekke voor Toon, Kathisma, Etmaal, Pijlgebed, Troparion en Metten/Completen. Gewone woorden in titels ("Psalter in 20 delen", `PsalterMobiel.tsx:61`).
4. **#3 Esthetisch:** één tokenstelsel met hooguit 8 lettergroottes, een vaste afstandsschaal en kleuren alleen uit DESIGN.md, in plaats van 38 maten, 314 hex-waarden en de `#top#top`-ketens. Eén chrome-kleur voor onderbalk en vensterbalken.
5. **#9 Milieuvriendelijk:** alleen de actieve pagina renderen, zodat 83 % van de beeldbytes vervalt. De heiligen-chunk pas laden als hij nodig is (`App.tsx:200`). Een bewuste keuze voor donkere modus in de hoofdinterface.
