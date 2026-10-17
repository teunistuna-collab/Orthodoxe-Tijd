# Psalterlezing: kathisma's bij Metten en Vespers

Liturgisch leesschema volgens het OCA-overzicht. De uitvoering kan per parochie of klooster verschillen.
Dit is geen persoonlijke gebedsregel en geen volledig dagelijks psalterrooster.

- Code: `src/lib/psalterlezing.ts` (regels en tabellen), `src/components/Psalterlezing.tsx` (weergave)
- Controles: `npm run check:psalterlezing` (`scripts/psalterlezing.check.ts`)
- Getoond op: Vandaag (blok "Psalterlezing"), het etmaal (venster van de Metten en de Vespers, "Kathisma's bij deze
  dienst") en Psalmen › Per kathisma (blok met de datum; `#psalmen/kathisma?datum=yyyy-mm-dd`).

## Bronnen (gelezen 17-10-2026)

- https://www.oca.org/liturgics/outlines/kathisma-readings-at-matins
- https://www.oca.org/liturgics/outlines/kathisma-readings-at-vespers
- https://www.oca.org/liturgics/outlines/the-division-of-the-psalter-into-kathismas (indeling, `src/lib/psalmen.ts`)

De tabellen zijn overgenomen uit de HTML van de bron. De zondagkolom is daar één samengevoegde cel (`rowspan="4"`) voor
de eerste vier rijen: bij de Metten "2, 3, 17 or Polyeleos", bij de Vespers leeg (in de tekst: geen psalterlezing op
zondagavond).

## Toepassingsgebied

- Byzantijnse traditie volgens de OCA; niet voor andere tradities.
- Kalender: de instelling van de site (oude of nieuwe kalender), met de bestaande omrekening (`kerkDatum`). Vaste
  grenzen gelden op de kerkelijke datum; Pascha is altijd het orthodoxe (Juliaanse) Pascha (`orthodoxPascha`).
- Alleen Metten en Vespers. De kathisma's bij de Uren in de Grote Vasten staan niet in deze bronnen en zijn niet
  opgenomen. De vaste psalmen van de diensten (`src/lib/etmaal.ts`) blijven ongewijzigd.
- Datum: de burgerlijke datum waarop de dienst plaatsvindt (datum van het toestel; de site kent geen aparte
  tijdzone-instelling). Vespers horen bij de liturgische dag erna; de getoonde datum blijft de avond zelf.

## Status van een uitkomst

| Status | Betekenis | Tekst op de site |
|---|---|---|
| vastgesteld | uit een specifieke regel van de bron | (geen extra tekst) |
| gewoon | het gewone weekschema; feesten zijn niet volledig bekend | Gewone indeling; feestdagen kunnen afwijken. |
| geen | uitdrukkelijk geen psalterlezing | Geen kathisma; de vaste psalmen van de dienst blijven. |
| onbekend | bron niet eenduidig, of rang/rubrieken niet gecontroleerd | Raadpleeg het liturgische rooster. |

Bij `onbekend` door een feest staat het gewone schema er apart bij ("Gewone indeling zonder feest: …").

## Perioden

| Periode | Metten (rij) | Vespers (rij) |
|---|---|---|
| Thomaszondag t/m 21 september | A | A |
| 22 september t/m 19 december | B | B |
| 20 december t/m 14 januari | A | A |
| 15 januari t/m zaterdag vóór de Verloren Zoon | B | B |
| Zondag van de Verloren Zoon t/m Vergevingszondag | A | A |
| Grote Vasten, week 1–4 en 6 (Schone Maandag = Pascha − 48; de zondag telt bij de week ervoor) | Vasten | B |
| Grote Vasten, week 5 | Vasten 5 | Vasten 5 |
| Goede Week (Palmzondag t/m Grote Zaterdag) | Goede Week | Goede Week |
| Pascha en de Lichte Week | geen (alleen Polyeleos op een feest met Polyeleos) | geen |

De celwaarden staan letterlijk in `METTEN` en `VESPERS` in `src/lib/psalterlezing.ts`.

## Regels voor feesten (volgorde: specifiek gaat voor algemeen)

1. Lichte Week: Metten geen kathisma; bij een groot feest alleen de Polyeleos (vastgesteld); bij een ander feest met
   rang Polyeleos onbekend. Vespers: geen.
2. Goede Week en Palmzondag: de tabelrij van de bron (vastgesteld); Metten op Grote Donderdag en Grote Vrijdag
   uitdrukkelijk geen ("-"). Vespers donderdag- t/m zaterdagavond: lege cel in de bron, dus onbekend. Valt de
   Annunciatie in de Goede Week: onbekend.
3. Lazaruszaterdag: de zaterdag van week 6 in de tabel (16, 17), vastgesteld.
4. Grote feesten van de Moeder Gods (8 sep, 21 nov, 15 aug):
   - Metten: de kathisma's van de dag met de Polyeleos-regel van de bron (bij drie vervangt hij het derde, in de Vasten
     volgt hij erop; bij twee wordt hij als derde gezongen; zondag: 2, 3, Polyeleos).
   - Vespers de avond ervoor, maandag- t/m vrijdagavond: kathisma 1, deel 1 („Zalig de man”). Op zaterdag- of
     zondagavond: onbekend.
5. Andere grote feesten (van de Heer, en de Ontmoeting en de Annunciatie): Metten en de vesper ervoor onbekend ("op
   sommige grote feesten van de Heer is er geen psalterlezing"; de bron zegt niet welke).
6. Avond van een groot feest (vigilie de vorige nacht): geen psalterlezing; op zaterdagavond onbekend.
7. Andere feesten met rang Polyeleos of vigilie volgens `src/lib/feesten.ts` (rang ≥ 4): onbekend; de rang komt uit
   de eigen feestenlijst en is niet gecontroleerd. De zondagen van de Paastijd, de Lichte Week, de Goede Week en
   Lazaruszaterdag tellen hier niet mee.
8. Anders: de tabel. Zondag (Metten): 2, 3 en daarna 17 of de Polyeleos (keuze, niet door de site gemaakt). Zaterdagavond:
   het hele eerste kathisma. Zondagavond: geen.

## Ter controle door het St. Irenaeus Instituut

- De periode van een Vespers volgt de avond zelf (de tabel spreekt van "Monday evening"); feesten volgen de liturgische
  dag. Te bevestigen voor de grensavonden 21 september, 19 december en 14 januari.
- Lichte Zaterdag 's avonds (vesper van Thomaszondag): nu "geen" (de Lichte Week), volgens de letter van de bron.
- Palmzondag als zondag van de rij "Passion (Great) Week" (de cel "2, 3, Polyeleos").
- Lege cellen bij de Vespers van Grote Donderdag t/m Grote Zaterdag: nu onbekend.
- De indeling van de Ontmoeting en de Annunciatie bij de feesten van de Heer (onbekend), en de regel na de vigilie (6).
- De rangen in `src/lib/feesten.ts`: daar staan niet alle feesten met Polyeleos, dus "gewoon" blijft voorlopig.
- De kathisma's bij de Uren in de Grote Vasten (een aanvullende bron is nodig).
