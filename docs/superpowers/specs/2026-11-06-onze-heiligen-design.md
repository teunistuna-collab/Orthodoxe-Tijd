# Onze heiligen — ontwerp

Datum: 2026-11-06 · Status: goedgekeurd in gesprek, ter review

## Doel

De gebruiker en zijn gezin krijgen een persoonlijke band met de heiligen: je kiest de naam- of beschermheiligen van je
gezin (en bijvoorbeeld de patroon van je parochie). De app markeert hun dagen, toont op Vandaag wiens naamdag het is en
geeft desgewenst een melding. Zo leef je het kerkelijk jaar mee via je eigen heiligen.

## Uitgangspunten

- Geen verzonnen teksten (APP-MAPPING): een zelf ingevulde heilige heeft alleen de naam die de gebruiker invoert; geen
  levensbeschrijving, troparion of afbeelding.
- Geen nieuwe kaartstijl op Vandaag: de naamdag komt als regel in de bestaande kaart Feesten & heiligen.
- Geen account: de lijst staat alleen op het toestel (`localStorage`), net als het pijlgebed en de herinneringen.
- Mobiel (`ot17`, onder 768 px). Web/desktop krijgt in deze versie niets nieuws.

## Gegevens

Nieuw bestand `src/lib/onzeHeiligen.ts` (zonder React, zodat de pushserver en de controles het kunnen gebruiken; de
React-hook staat er los bij):

```ts
export interface OnzeHeilige {
  id: string;          // eigen id (bijv. tijdstempel + volgnummer), uniek in de lijst
  heilige: string;     // naam van de heilige, zoals getoond ("Sofia van Rome")
  md: string;          // kerkelijke gedenkdag "M-D" (zelfde vorm als mdKey / HEILIGEN-sleutels)
  voor: string;        // voor wie: "Sofia", "ikzelf", "parochie"; mag leeg zijn
  bron?: string;       // id uit het Heiligenjaar / Lage Landen als de heilige uit de lijst komt; ontbreekt bij zelf ingevuld
}
```

- Sleutel `localStorage`: `onzeHeiligen`. Lezen via `leesOnzeHeiligen()`, dat kapotte of onbekende gegevens negeert
  (ongeldige items vallen weg, een kapotte waarde geeft een lege lijst).
- Grenzen: hooguit 30 heiligen; `heilige` en `voor` hooguit 80 tekens (ingekort); `md` moet een bestaande dag zijn
  (1-1 t/m 12-31, inclusief 2-29).
- Dezelfde heilige mag meerdere keren voorkomen (bijvoorbeeld voor twee kinderen).
- `naamdagenOp(kerkKey, volgendeKerkKey, lijst)`: de heiligen van een kerkelijke dag. Een heilige van 2-29 valt in een
  jaar zonder 29 februari (in de gekozen kalender) op 2-28: wanneer `kerkKey` 2-28 is en `volgendeKerkKey` 3-1.
- Volgorde in het blok: op de eerstvolgende naamdag (vandaag eerst).

## Heiligen-pagina (mobiel)

**Blok "Onze heiligen"**, bovenaan, boven Heiligen van de dag:

- Per rij: de heilige, voor wie en de gedenkdag ("H. Sofia van Rome · Sofia · 17 september"); is het vandaag de
  naamdag, dan "Vandaag". Een tik opent het leesvenster (HeiligePopup) van die heilige; bij een zelf ingevulde heilige
  is er geen leesvenster en opent de rij het bewerken.
- Knop "Bewerken" per rij: voor wie aanpassen; bij een zelf ingevulde heilige ook naam, dag en maand; verwijderen.
- Onderaan "Heilige toevoegen". Leeg: een korte uitleg en dezelfde knop.
- Datum in de gekozen kalender (Instellingen), zoals overal in de app.

**Toevoegen**, met een eigen adres zodat de terugknop werkt:

1. Vanuit het leesvenster van een heilige: knop "Toevoegen aan onze heiligen" → één veld *Voor wie?* → opslaan. Dag
   en naam komen uit het Heiligenjaar / de Lage Landen.
2. "Heilige toevoegen" (`#heiligen/onze/toevoegen`): zoekveld over alle heiligen (bestaande zoekfunctie); kies er een →
   *Voor wie?* → opslaan.
3. "Staat je heilige er niet bij? Zelf invullen" (`#heiligen/onze/zelf`): naam van de heilige, dag, maand, voor wie.

Opmaak: bestaande kaarten, rijen, labels en knoppen van de Heiligen-pagina; geen nieuwe beelden of versiering.

## Vandaag

Op een naamdag toont de bestaande kaart Feesten & heiligen bovenaan een regel per naamdag: "Naamdag van Sofia ·
H. Sofia van Rome" (zonder *voor*: "Naamdag: H. Sofia van Rome"). De kaart werkt verder zoals nu.

## Herinneringen

- `Herinneringen` krijgt `naamdagen: boolean` en `naamdagLijst: { heilige: string; md: string; voor: string }[]`
  (een kopie van de lijst, zodat de planning zonder `localStorage` en zonder de heiligenlijst werkt).
- Instellingen → Herinneringen: schakelaar "Naamdagen" onder Feesten. Het moment volgt `feestMoment`: de avond ervoor
  om 20.00 uur ("Morgen: naamdag van Sofia") of de dag zelf om 7.00 uur ("Vandaag: naamdag van Sofia"); tekst: "De
  heilige Sofia van Rome"; url `#heiligen`; id `naamdag:<md>:<voor>:<ymd>`.
- Wijzigt de lijst, dan wordt de kopie in de voorkeuren bijgewerkt (en bij push opnieuw aangemeld).
- `schoonVoorkeuren` controleert de nieuwe velden met dezelfde grenzen (30 items, 80 tekens, geldige `md`).
- `ietsAan` telt "naamdagen aan en minstens één heilige" mee.
- Pushserver: geen eigen code nodig buiten de gedeelde planning; na de wijziging opnieuw uitrollen. De server krijgt de
  namen alleen als Naamdagen aanstaat en push werkt.

## Fouten en randgevallen

- Kapotte opslag: lege lijst, geen foutmelding.
- Heilige uit de lijst die later uit de bron verdwijnt: de rij blijft (naam en dag staan in de opslag), zonder
  leesvenster.
- Gekozen kalender gewijzigd: de gedenkdag blijft kerkelijk; de burgerlijke datum verschuift mee, zoals bij feesten.
- Meer dan 30: "Heilige toevoegen" staat uit met de melding dat de lijst vol is.

## Controle

- Nieuw `scripts/onzeheiligen.check.ts` (`npm run check:onzeheiligen`): lezen van kapotte opslag, grenzen, naamdag op de
  juiste dag in beide kalenders, 2-29 in een jaar zonder 29 februari, volgorde op eerstvolgende naamdag.
- `check:herinneringen`: melding avond ervoor / dag zelf met de juiste tekst, id en tijd; uit als Naamdagen uit staat;
  `schoonVoorkeuren` met ongeldige naamdaggegevens.
- `check:pushserver`: aanmelding met naamdagen wordt geaccepteerd en geschoond.
- In de preview: toevoegen vanuit het leesvenster, via zoeken en zelf invullen; bewerken en verwijderen; de regel op
  Vandaag (met een heilige van vandaag); terugknop en Escape.

## Buiten deze versie

Naamdagen in de Kalender-maandweergave; delen of overzetten van de lijst naar een ander toestel; web/desktop.
