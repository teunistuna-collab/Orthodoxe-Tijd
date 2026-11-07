# Dagthema: Vandaag en de cycluspagina's in de periode — ontwerp

Datum: 2026-11-07 · Status: goedgekeurd in gesprek, ter review

## Doel

De gebruiker beleeft de Paschacyclus en de Geboortecyclus van binnenuit. Op de belangrijke dagen voelt Vandaag anders
(het beeld en de naam van de dag), in de hele periode kleurt Vandaag mee, en een kaart zegt waar je in de cyclus staat.
De Geboorte-pagina krijgt dezelfde sfeer per periode als de Pascha-pagina, en beide pagina's openen in de periode op "nu".

## Uitgangspunten

- Geen verzonnen teksten of beelden: alleen bestaande teksten (lib/paascyclusTeksten.ts, lib/feesten.ts,
  lib/geboorteInhoud.ts, lib/paascyclus.ts, lib/geboortecyclus.ts) en aangeleverde beelden.
- Eén bron: een nieuwe functie `dagThema(dag, mode)` in `lib/feestdagen.ts` (naast `feestVoorDag`), zonder React, die
  Vandaag en de cycluspagina's gebruiken.
- Banners: de vaste kop van Vandaag blijft, behalve op een dag met een analogion-beeld (uitzondering op verzoek van de
  gebruiker, 7-11-2026). De andere paginabanners blijven zoals ze zijn.
- Mobiel (onder 768 px). Web/desktop krijgt in deze versie niets nieuws.
- Beide kalenders (oud/nieuw); de Paschadatum is voor beide gelijk.

## dagThema(dag, mode)

Geeft voor een burgerlijke dag een object (of `null` op een gewone dag buiten de cycli):

```ts
interface DagThema {
  /** Kop van Vandaag. */
  kop:
    | { soort: 'analogion'; beeld: string; naam: string; regel?: string; groet?: { groet: string; antwoord: string } }
    | { soort: 'icoon'; beeld: string; breedte: number; hoogte: number; alt: string; naam: string; regel?: string; groet?: { groet: string; antwoord: string } }
    | null;
  /** Sfeer van Vandaag. */
  toon: 'ingetogen' | 'verstild' | 'licht' | null;
  /** Kaart "Vandaag in de cyclus" (vervangt de aftelling), of null buiten de cycli. */
  cyclus: { soort: 'pascha' | 'geboorte'; periode: string; dag?: string; betekenis: string; href: string; voortgang?: string } | null;
}
```

**Kop, in deze volgorde:**

1. **Analogion-dag:** een feest van de dag (dagInfo().feesten) of een dag uit `PASCHA_DAGICONEN` waarvoor een
   analogion-beeld bestaat in `public/images/feesten/bidden/<id>.webp`. Nu de 13 (Pascha en de twaalf grote feesten);
   later ook de aangeleverde beelden voor de dagen in "Orthodoxe_Tijd_Iconen_voor_Analogion". De lijst met beschikbare
   beelden staat op één plek (verplaatst uit FeestenMobiel.tsx naar `lib/bidbeelden.ts`, gedeeld met Bid het tropaar).
2. **Icoon-dag:** een dag uit `PASCHA_DAGICONEN` (offset t.o.v. Pascha) of een feest van de dag met een eigen icoon in
   `public/images/feesten` (zoals in FeestenMobiel: Nicolaas, Stefanus, Besnijdenis, …): het icoon in de nis, zoals nu
   op Pascha.
3. **Feesttijd van Pascha of de Geboorte** (het nafeest uit `feestVoorDag`): zoals nu (icoon in de nis met de groet).
4. Anders `null`: de kop blijft zoals nu.

- **Naam:** de naam van de dag uit de feesten van die dag (korte naam waar die er is), bijvoorbeeld "Grote Vrijdag",
  "Theofanie"; bij een zondag uit `PASCHA_DAGICONEN` zonder feest de naam van die zondag uit lib/paascyclus.ts
  (`zondagVanDeWeek`).
- **Regel:** de eerste zin van de bestaande betekenis (`PASCHA_DAGICONEN[..].betekenis` of `Feest.toelichting`);
  ontbreekt die, dan geen regel.
- **Groet:** alleen op Pascha (t/m de Paastijd) en de Geboorte (t/m de Kersttijd), zoals nu.

**Toon** (dezelfde indeling als de sfeer op de Pascha-pagina):

| Toon | Paschacyclus | Geboortecyclus |
|---|---|---|
| ingetogen | voorbereiding, grote-vasten, lazarus, palmzondag | vasten, voorouders, vaders, voorfeest, vooravond |
| verstild | goede-week | — |
| licht | pascha, lichte-week, paastijd, hemelvaart, pinksteren | geboorte, nafeest, besnijdenis, voorfeest-theofanie, vooravond-theofanie, theofanie, nafeest-theofanie |

Buiten beide cycli: `null` (gewoon).

**Cyclus-kaart:** in een periode van de Pascha- of Geboortecyclus (`paascyclusVoor`, `geboortecyclusVoor`):
- `periode`: het label van de huidige periode ("Goede Week"); `dag`: de naam van de dag als die er is ("Grote Woensdag");
- `betekenis`: de korte omschrijving van de periode (`short` uit de cyclusgegevens);
- `href`: `#pascha/<periode>` of `#geboorte/<periode>`;
- `voortgang`: in een vastenperiode "Dag 12 van 48 · nog 37 dagen tot Pascha" (lib/overzicht.ts `periodeVoortgang`).

## Vandaag (mobiel)

- **Analogion-kop:** het beeld vult de hele kop (zelfde hoogte als nu), met een donkere overloop onderaan; daarop de naam
  van het feest, de regel en (op Pascha/de Geboorte) de groet. De datumregel en de onderbalk blijven.
- **Icoon-kop:** het icoon in de nis zoals nu op Pascha, met de naam en de regel in plaats van (of onder) de groet.
- **Toon:** een klasse op Vandaag (`is-ingetogen`, `is-verstild`, `is-licht`) die alleen kleur en licht verandert
  (perkament, goud, kaartrand), met de waarden van de Pascha-pagina; tekstcontrast blijft minstens zoals nu.
- **Cyclus-kaart:** op de plek van de aftelling, in de bestaande kaartstijl: label (Paschacyclus / Geboortecyclus),
  periode en dag, betekenis, en zo nodig de voortgang. Een tik opent de periode. Buiten de cycli blijft de aftelling.

## Cycluspagina's (mobiel)

- **Geboorte-pagina:** sfeer per periode zoals de Pascha-pagina (klassen op de pagina en de lagen, dezelfde kleurwaarden;
  ingetogen in de Geboortevasten, licht vanaf de Geboorte).
- **Beide pagina's:** in een periode staat "Vandaag in de cyclus" (de huidige periode) direct onder de kop, boven de
  aftelling; buiten de periode blijft de volgorde zoals nu.

## Fouten en randgevallen

- Een beeld dat (nog) niet bestaat, wordt niet getoond: de lijst in `lib/bidbeelden.ts` bepaalt het, niet een gok.
- Twee feesten op één dag (bijv. een groot feest op een zondag van de cyclus): het feest met een analogion-beeld gaat voor,
  dan het feest met de hoogste rang.
- De Kruisverering (Pascha − 28) gebruikt het analogion-beeld van de Kruisverheffing.
- Beide kalenders: vaste feesten via dagInfo (kerkelijke datum), de Paschacyclus via de offset.

## Controle

- Nieuw `scripts/dagthema.check.ts` (`npm run check:dagthema`):
  - Grote Vrijdag 2027 (30 april): icoon-kop "Grote Vrijdag", toon verstild, cyclus Goede Week.
  - Pascha 2027 (2 mei): analogion-kop met groet, toon licht.
  - Theofanie (19 januari 2027 oude kalender, 6 januari nieuwe): analogion-kop, toon licht, cyclus Geboorte.
  - Een dag in de Geboortevasten: geen kop, toon ingetogen, cyclus met voortgang.
  - Een gewone dag in juli: `null`.
  - Pascha − 28 (Kruisverering): analogion-beeld van de Kruisverheffing.
- In de preview: Vandaag op Palmzondag, Grote Vrijdag, Pascha, Pinksteren, de Geboorte, Theofanie en een gewone dag;
  de Geboorte-pagina in de Vasten en de Kersttijd.

## Buiten deze versie

Desktop; de andere vastenperioden buiten de twee cycli (Apostel- en Ontslapenisvasten) krijgen geen toon; nieuwe teksten.
