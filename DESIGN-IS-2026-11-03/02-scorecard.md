# Scorekaart: tien principes van Dieter Rams (0–3)

1. Goed ontwerp is innovatief — Score: 2/3
   Bewijs: Vandaag bundelt gebedsuur, vasten, heiligen, lezingen en kerkelijk jaar live (S1, W6); Adem-gebedsmodus.
   Onderbouwing: duidelijke verbetering van bestaande kalender-apps, maar geen nieuw patroon dat elders ontbreekt.

2. Goed ontwerp maakt een product bruikbaar — Score: 1/3
   Bewijs: S4, C6, C4 (`LezingModal.tsx:67`).
   Onderbouwing: de dag zien lukt in één blik, maar bidden en lezen vergen omwegen (diensttekst onder "Over dit moment", lezing eindigt buiten de app); het slechtste geval telt.

3. Goed ontwerp is esthetisch — Score: 1/3
   Bewijs: V1 (49 afstanden), V2 (38 lettergroottes), V3 (314 hex-literals), V6 (twee chrome-kleuren).
   Onderbouwing: de wereld is mooi, maar er is geen zichtbaar enkelvoudig systeem; meer dan vijf inconsistenties.

4. Goed ontwerp maakt een product begrijpelijk — Score: 1/3
   Bewijs: C5, C4 (kalendernamen).
   Onderbouwing: primaire acties zijn herkenbaar, maar ruim twee bedieningselementen en kopjes zijn onduidelijk door onverklaard jargon.

5. Goed ontwerp is onopvallend — Score: 2/3
   Bewijs: W4, W6, A2.
   Onderbouwing: de inhoud (iconen, kaarten) is de figuur; de chrome is zichtbaar maar rustig, niet onzichtbaar (intro, welkom, vaste onderbalk over gefocuste items).

6. Goed ontwerp is eerlijk — Score: 1/3
   Bewijs: C2, C3, C4, S4.
   Onderbouwing: geen manipulatieve flow, maar wel een onjuiste opslagclaim, tracking zonder toestemming en meerdere labels die iets anders doen dan ze zeggen.

7. Goed ontwerp is duurzaam — Score: 1/3
   Bewijs: perkamenttextuur als achtergrond en "versleten" gedrukte knoprand (`index.css`, `--knop-vlak`, `knop-rand.png`).
   Onderbouwing: de liturgische taal zelf is tijdloos, maar twee skeuomorfe markeringen dateren het beeld; bij twijfel tussen 1 en 2 de lagere.

8. Goed ontwerp is grondig tot in het detail — Score: 2/3
   Bewijs: V5 (alle zes toestanden aanwezig), A2/A3/A5.
   Onderbouwing: alle toestanden bestaan, maar focus is ruw (achter de onderbalk, verloren bij Adem, skiplink onbereikbaar).

9. Goed ontwerp is milieuvriendelijk — Score: 0/3
   Bewijs: W1 (1,65 MB ruwe JS), W2 (83 % van de beeldbytes voor verborgen pagina's), W4, W5.
   Onderbouwing: de JS valt in de 500 KB–2 MB-band (= 1), maar de hoofdinterface negeert donkere modus; bij twijfel tussen 0 en 1 de lagere.

10. Goed ontwerp is zo min mogelijk ontwerp — Score: 1/3
    Bewijs: S3 (vijf dubbele ingangen), S1 (Heiligen 37 bedieningselementen).
    Onderbouwing: 3–5 elementen zijn weg te laten zonder dat een taak breekt.

**Totaal: 12/30**
