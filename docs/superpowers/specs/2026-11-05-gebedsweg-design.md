# De gebedsweg — ontwerp

Datum: 5 november 2026
Status: ter beoordeling
Prototype: `public/prototype-gebedsweg.html` (wegwerp, wordt bij de bouw verwijderd)

## 1. Doel

In de mobiele weergave van `ot17` een gebedsuur kunnen **bidden**, zodat je het gevoel hebt in het gebed van de Kerk te staan
en niet "een app te gebruiken". Twee momenten:

1. **Thuis het hele uur bidden** (bijvoorbeeld de Vespers of de Completen).
2. **Overdag kort instappen**: het kernvers van het uur en het Jezusgebed, ongeveer twee minuten.

Wat aanwezigheid geeft (gekozen door de opdrachtgever):

- ononderbroken bidden: geen menu's of onderbalk, het scherm blijft aan;
- 's avonds en 's nachts een warme nachtweergave; overdag perkament;
- bij het begin de Kerk van vandaag (feest of heilige, toon, vasten);
- een uitnodiging op het juiste uur (herinnering die direct in het gebed opent).

Buiten de opdracht (bewust niet nu): klank of gezang tijdens het bidden, stiltepauzes, het gebedssnoer. Het interactieve
gebedssnoer verdwijnt helemaal uit de app en komt nergens in de gebedsweg terug.

## 2. Grenzen

- **Niets verzinnen.** Alle teksten komen uit `ot17`: `lib/etmaal.ts` (uren, psalmen, kernvers, hoofdgedachtenis),
  `lib/gebeden.ts` (Inleidende gebeden, Jezusgebed), `public/data/psalmen.json` (psalmteksten). Zo vraagt APP-MAPPING het.
- **Geen zelf samengestelde dienst.** Zolang een uur niet compleet is aangeleverd heet het "Het gebed van de Vespers",
  niet "De Vespers". De opdrachtgever keurt goed dat de Inleidende gebeden elk uur openen.
- **Teksten zijn nog niet compleet.** Een onderdeel zonder tekst is tijdens het bidden verborgen en staat in de inhoud van
  het uur als "Volgt nog". Als er later teksten bijkomen, groeit de gebedsweg mee zonder nieuwe schermen.
- **`GEBEDEN_ZICHTBAAR`** (`lib/gebeden.ts`, nu `false`, "de gebeden worden opnieuw aangeleverd"): zolang deze uit staat,
  telt de opening (Inleidende gebeden) als "Volgt nog". Het Jezusgebed valt hier niet onder; Adem gebruikt het nu al.
- **Alleen mobiel.** Het dienstvenster op desktop blijft ongewijzigd.

## 3. De weg van de gebruiker

### 3.1 Ingangen

Het begin van het uur vervangt het huidige scherm "Kies een psalm of gebed" (`#etmaal/<uur>/psalmen`). Je komt er vanaf:

1. **Vandaag**: de kaart "Het actuele gebedsuur" (het uur van nu);
2. **Bidden**: de kaart van het gebedsuur (het uur van nu);
3. **Etmaal**: een dienst openen, dan "Begin met bidden" (zelf gekozen uur);
4. **Een herinnering** voor een gebedsuur (het uur van de melding).

"‹ Terug" gaat naar waar je vandaan kwam, zoals de huidige `Inhoud` in `EtmaalMobiel.tsx` dat al doet (`vorigeAdres`).

### 3.2 Begin van het uur

Van boven naar beneden:

- **Banner**: het onderbeeld van dat uur, `public/images/etmaal/onder/<slug>.webp` (hetzelfde beeld als onderaan de
  dienstpagina), met "Orthodoxe Tijd", "‹ Terug", de titel "Het gebed van de Vespers" en de hoofdgedachtenis.
  Lidwoord per uur: "de" voor Vespers, Completen, Metten en Middernacht; "het" voor Eerste, Derde, Zesde en Negende uur.
- **De Kerk vandaag** (kaart op perkament, gecentreerd): weekdag en kerkelijke datum, het belangrijkste feest of de heilige
  van de dag met "en nog N heiligen", de toon, de week of periode en de vastenregel. Dezelfde gegevens en dezelfde
  afleiding als de kaart "Feesten & heiligen" en "Het kerkelijk jaar" op Vandaag; laadt de heiligenlijst nog, dan verschijnt
  het begin meteen en komt de heilige erbij zodra die er is (geen laadscherm).
- **Twee keuzes**:
  - **Kort · 2 min**: "Het kernvers en het Jezusgebed";
  - **Het hele uur**: de namen van de onderdelen die nu te bidden zijn (bijvoorbeeld "Psalm 103 · Psalm 140").
    Is er geen enkel onderdeel met tekst, dan is deze knop niet te kiezen en staat er "De teksten van dit uur volgen nog".
- **Inhoud van dit uur**: alle onderdelen in volgorde. Zonder tekst: "Volgt nog". Een psalm die alleen als PDF bestaat
  houdt zijn link "Als PDF" (zoals nu).

### 3.3 Bidden

- Volledig scherm in de bestaande `Laag`: geen onderbalk, geen kopbalk van de app, de rest van de pagina onbereikbaar.
- Bovenaan alleen "×" (terug naar het begin van het uur, zonder vraag) en de naam van het uur in kleine kapitalen.
- Eén onderdeel tegelijk; lange teksten scrollen binnen het vlak, de voet blijft staan.
- Onderaan één knop **Verder** en "n van m". Bij het laatste onderdeel heet de knop **Amen**.
- Het scherm blijft aan zolang je bidt (Screen Wake Lock).
- **Kort**: (1) het kernvers groot en gecentreerd met de verwijzing; (2) het Jezusgebed in de vorm die je in Adem het laatst
  koos (standaard, korter, kortst of je eigen pijlgebed), regel voor regel afgebroken na elke komma, met de bestaande
  aanwijzing "Bid het in stilte". Geen snoer, geen teller.
- **Het hele uur**: de onderdelen met tekst (zie 4.2). Psalmen in de bestaande psalmweergave (versnummers vóór de eerste
  regel van een vers); gebeden als gebedstekst met behouden regelafbreking.
- Geen nieuwe aanwijzingsteksten bedenken: alleen de titels en teksten uit de bronnen, plus de bestaande zin "Bid het in stilte".

### 3.4 Afsluiting

Een stil eindscherm: het sierkruis, het kernvers van het uur met verwijzing en één knop "Terug naar Vandaag".
Geen felicitatie, geen telling, geen "goed gedaan".

### 3.5 Licht en donker

- **Licht**: alle schermen van de gebedsweg op perkament (`/images/vandaag/papyrus-licht.webp`), zoals de rest van de app.
- **Donker**: de bestaande nachtkleuren (`html.lees-nacht`: tekst `#e9dcc0`, goud `#d9b56e`, vlak donkerbruin).
- **Keuze**: staat de leesweergave (`lib/leesvoorkeur.ts`) op *systeem*, dan is de gebedsweg donker bij de avond- en
  nachturen (Vespers 18.00, Completen 21.00, Middernacht 00.00, Metten 03.00; het Eerste uur om 06.00 is licht) en wanneer het toestel donker
  staat. Een eigen keuze *licht* of *donker* blijft gelden. Bij het verlaten van de gebedsweg komt de gewone weergave terug.

## 4. Opbouw

### 4.1 Adressen

| Adres | Scherm |
|---|---|
| `#etmaal/<slug>/bid` | begin van het uur |
| `#etmaal/<slug>/bid/kort/<n>` | stap n van Kort (1-gebaseerd) |
| `#etmaal/<slug>/bid/heel/<n>` | stap n van Het hele uur |
| `#etmaal/<slug>/bid/einde` | afsluiting |
| `#etmaal/<slug>/psalmen` en `#etmaal/<slug>/psalmen/<nr>` | doorverwijzing naar `#etmaal/<slug>/bid` (oude links, bladwijzers) |

`<slug>` is `slugVan(d)` uit `lib/etmaal.ts` (bijvoorbeeld `vespers`, `middernacht`, `derde-uur`). Een onbekend
stapnummer leidt naar het begin van het uur. De links naar `/psalmen` in Vandaag, Bidden en EtmaalMobiel gaan naar `/bid`.

### 4.2 De volgorde van een uur: `src/lib/gebedsweg.ts` (nieuw)

Pure functies, zonder React of browser, zodat ze los te controleren zijn.

```ts
type Onderdeel =
  | { soort: 'psalm'; titel: string; nr: number; beschikbaar: boolean; pdf?: string }
  | { soort: 'gebed'; titel: string; id: string; beschikbaar: boolean }
  | { soort: 'tekst'; titel: string; tekst: string | null; beschikbaar: boolean };

function onderdelenVan(d: ServiceMapping, aangeleverd: UurBestand | null, psalmMetTekst: (nr: number) => boolean, gebedenZichtbaar: boolean): Onderdeel[];
function kortVan(d: ServiceMapping): Array<{ soort: 'kernvers' } | { soort: 'jezusgebed' }>;
```

- **Standaard** (geen aangeleverd bestand): Inleidende gebeden (`gebed`, id `inleidende-gebeden-pdf`) → de psalmen van het
  uur uit `serviceConfig` in hun volgorde.
- **Aangeleverd**: bestaat `public/data/uren/<slug>.json`, dan bepaalt dat bestand de hele volgorde:

  ```json
  { "onderdelen": [
    { "gebed": "inleidende-gebeden-pdf" },
    { "psalm": 103 },
    { "titel": "Lichtgebeden", "tekst": null },
    { "titel": "Avondlied", "tekst": "…" }
  ] }
  ```

  `tekst: null` betekent "Volgt nog". Een uur aanvullen = dit bestand aanvullen; er is geen code nodig.
- **beschikbaar**: een psalm alleen als `psalmen.json` een tekst heeft; een gebed alleen als `GEBEDEN_ZICHTBAAR` aan staat
  en het id bestaat; een tekst alleen als `tekst` niet leeg is.
- Het bestand wordt pas geladen bij het openen van het uur. Bestaat het niet (404), dan geldt de standaard. Is het kapot of
  onbekend van vorm, dan ook de standaard, met `console.warn`.

### 4.3 Schermen: `src/components/Gebedsweg.tsx` en `gebedsweg.css` (nieuw)

- `UurBegin`: het begin van het uur (3.2).
- `Stap`: één onderdeel (3.3). Hergebruikt:
  - `Verzen` uit `PsalterMobiel.tsx` (exporteren) voor psalmen;
  - `Gebedsregels` en de vormkeuze (`useVormen`, laatst gekozen vorm) uit `AdemMobiel.tsx` (exporteren) voor het Jezusgebed;
  - `Laag`, `Kop`, `Sierlijn` uit `MobielLaag.tsx`.
- `Afsluiting`: het eindscherm (3.4).
- `UurOverzicht` en `UurOnderdeel` in `PsalterMobiel.tsx` worden **verwijderd** (vervangen, geen tweede versie). De
  kathisma's van vandaag (`extra` bij Metten en Vespers) verhuizen mee naar de inhoud op `UurBegin`.
- Routering in `EtmaalMobiel.tsx`: `bid` en de doorverwijzing van `psalmen`.

### 4.4 Gedeelde hulpstukken

- `useSchermAan` verhuist van `Modal.tsx` naar `src/lib/schermAan.ts`; Modal en de gebedsweg importeren dezelfde functie.
- De afleiding van feest/heilige van de dag voor de kaart op Vandaag wordt, als die nu in `Vandaag.tsx` zelf staat, naar een
  gedeelde functie verplaatst zodat `UurBegin` precies hetzelfde toont.

### 4.5 Herinneringen

- `lib/herinneringPlanning.ts`: de url van een gebedsuur-melding wordt `#etmaal/<slug>/bid` (nu `#etmaal/<slug>`).
- Dit bestand is gedeeld met de pushserver (`server/pushserver.ts`). Na de wijziging moet de pushserver opnieuw worden
  uitgerold; oude meldingen komen tot dan op de Etmaal-pagina uit, wat blijft werken.

### 4.6 Opruimen

- `src/lib/snoerPad.ts` verwijderen (ongebruikt sinds het snoer is weggehaald).
- `public/prototype-gebedsweg.html` verwijderen.

## 5. Randgevallen

| Situatie | Gedrag |
|---|---|
| Psalm zonder losse tekst | overgeslagen tijdens het bidden; in de inhoud "Als PDF" |
| Geen enkel onderdeel met tekst | "Het hele uur" niet te kiezen, met "De teksten van dit uur volgen nog"; Kort werkt altijd |
| Tekst laadt niet | rustige melding "De tekst kon niet worden geladen."; Verder blijft werken |
| Onbekend stapnummer | naar het begin van het uur |
| `uren/<slug>.json` ontbreekt of is kapot | standaardvolgorde (kapot: met `console.warn`) |
| Heiligen nog niet geladen | begin toont zonder heilige; vult aan zodra geladen |
| Browser zonder Wake Lock | gewoon verder, zonder fout |
| Desktop | ongewijzigd |

## 6. Controle

- **`scripts/gebedsweg.check.ts`** met `npm run check:gebedsweg` (zelfde vorm als de andere `check:*`):
  - standaardvolgorde voor Vespers (Inleidende gebeden, Psalm 103, Psalm 140);
  - `GEBEDEN_ZICHTBAAR = false` → opening niet beschikbaar, psalmen wel;
  - psalm zonder tekst → niet beschikbaar;
  - aangeleverd bestand vervangt de volgorde, `tekst: null` → niet beschikbaar;
  - kapot bestand → standaardvolgorde;
  - `kortVan` → kernvers, Jezusgebed.
- **`check:herinneringen`** en **`check:pushserver`** aangepast aan de nieuwe url.
- `tsc -b`, `npm run build`, `npm run lint`.
- In de mobiele preview (375 × 812), licht en donker:
  - Kort en Het hele uur van begin tot Amen en de afsluiting, voor Vespers, Completen en Derde uur;
  - de vier ingangen (Vandaag, Bidden, Etmaal, een herinnerings-url) en "‹ Terug";
  - een oude `#etmaal/vespers/psalmen/103`-link;
  - geen console-fouten.

## 7. Open punten

Geen. Klank, stiltepauzes en de echte dienstorde per uur zijn bewust buiten deze opdracht gehouden; de dienstorde kan later
via `public/data/uren/<slug>.json` zonder nieuwe code.
