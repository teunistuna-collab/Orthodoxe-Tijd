# De gebedsweg — implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Op mobiel een gebedsuur kunnen bidden: begin met de Kerk van vandaag, kies Kort of Het hele uur, bid één onderdeel tegelijk zonder menu's, sluit stil af.

**Architecture:** Een pure module `src/lib/gebedsweg.ts` bepaalt de volgorde van een uur (standaard of uit `public/data/uren/<slug>.json`) en welke onderdelen te bidden zijn. Eén schermbestand `src/components/Gebedsweg.tsx` toont begin, stap en afsluiting in de bestaande `Laag`, onder het nieuwe adres `#etmaal/<slug>/bid…`. Het oude gebedenboek per uur (`UurOverzicht`, `UurOnderdeel`) verdwijnt; oude `/psalmen`-adressen sturen door.

**Tech Stack:** React 19, TypeScript, Vite, hash-routing, controles met `node:assert` gebundeld door esbuild (`npm run check:*`).

**Spec:** `docs/superpowers/specs/2026-11-05-gebedsweg-design.md`

## Global Constraints

- Werkmap: `ot17/`. Alle paden en commando's hieronder zijn relatief aan `ot17/`.
- **Voorwaarde vóór Task 1:** `git status` in `ot17/` moet schoon zijn voor de bestanden die dit plan raakt (`src/components/EtmaalMobiel.tsx`, `Vandaag.tsx`, `Bidden.tsx`, `PsalterMobiel.tsx`, `etmaal-mobiel.css`). Ze bevatten nu eerder werk dat nog niet gecommit is. Vraag de opdrachtgever dat eerst te committen; commit het niet zelf mee in een taak van dit plan.
- Niets verzinnen: alle teksten uit `lib/etmaal.ts`, `lib/gebeden.ts`, `public/data/psalmen.json`. De enige aanwijzingszin is de bestaande "Bid het in stilte".
- Titel tot een uur compleet is: "Het gebed van de Vespers" / "Het gebed van het Derde uur" (lidwoord "het" bij de vier kleine uren, anders "de").
- `GEBEDEN_ZICHTBAAR` (`lib/gebeden.ts`) bepaalt of de Inleidende gebeden te bidden zijn; het Jezusgebed valt er niet onder.
- Geen gebedssnoer, geen teller, geen klank, geen stiltepauzes.
- Licht = perkament (`/images/vandaag/papyrus-licht.webp`); donker = tekst `#e9dcc0`, goud `#d9b56e`, vlak `#17110b`.
- Leesweergave *systeem*: donker bij Vespers, Completen, Middernachtdienst, Metten, of als het toestel donker staat; eigen keuze licht/donker blijft gelden. De gebedsweg verandert de globale leesvoorkeur niet.
- Alleen mobiel; desktop (`UrenCyclus`, dienstvenster) blijft ongewijzigd.
- Commitberichten in het Nederlands, eindigend met `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Voeg alleen de bestanden van de taak toe (`git add <pad>`), nooit `git add -A`.

## Review Focus

1. **Oude adressen** (`#etmaal/vespers/psalmen`, `#etmaal/vespers/psalmen/103`, bladwijzers, oude meldingen) moeten op het begin van het uur uitkomen, niet op een leeg scherm. → Task 4, stap "doorsturen", preview-controle.
2. **Rare stapnummers** in het adres (`/bid/heel/0`, `/bid/heel/9`, `/bid/heel/abc`) moeten naar het begin, niet crashen. → Task 1 (`stapIndex`), Task 4 preview.
3. **Aangeleverd bestand met een onbekend gebed-id of lege tekst** moet als "Volgt nog" verschijnen, niet als lege stap. → Task 1 check.
4. **Een uur zonder enig te bidden onderdeel** moet "Het hele uur" uitschakelen met "De teksten van dit uur volgen nog"; Kort blijft werken. → Task 1 check, Task 4 preview.
5. **Middernachtdienst** (slug `middernacht`) en Metten (03.00) moeten een bestaand bannerbeeld en de nachtweergave krijgen. → Task 1 check (onderbeelden, avonduren).

---

### Task 1: De volgorde van een uur (`lib/gebedsweg.ts`)

**Files:**
- Create: `src/lib/gebedsweg.ts`
- Create: `scripts/gebedsweg.check.ts`
- Modify: `package.json` (script `check:gebedsweg`)

**Interfaces:**
- Consumes: `ServiceMapping`, `naamVan` uit `src/lib/etmaal.ts`; `GEBEDEN` uit `src/lib/gebeden.ts`.
- Produces:
  - `type Onderdeel = { soort: 'psalm'; titel: string; nr: number; beschikbaar: boolean; pdf?: string } | { soort: 'gebed'; titel: string; id: string; beschikbaar: boolean } | { soort: 'tekst'; titel: string; tekst: string | null; beschikbaar: boolean }`
  - `type KortStap = { soort: 'kernvers' } | { soort: 'jezusgebed' }`
  - `type BronOnderdeel = { psalm: number } | { gebed: string } | { titel: string; tekst: string | null }`
  - `interface UurBestand { onderdelen: BronOnderdeel[] }`
  - `const KORT: KortStap[]`
  - `function leesUurBestand(json: unknown): UurBestand | null`
  - `function onderdelenVan(d: ServiceMapping, aangeleverd: UurBestand | null, psalmMetTekst: (nr: number) => boolean, gebedenZichtbaar: boolean): Onderdeel[]`
  - `function laadUurBestand(slug: string): Promise<UurBestand | null>`
  - `function stapIndex(raw: string | undefined, lengte: number): number | null` (0-gebaseerd, of null)
  - `function bidPad(slug: string, weg?: 'kort' | 'heel' | 'einde', n?: number): string`
  - `function gebedTitel(d: ServiceMapping): string`
  - `function isAvonduur(d: ServiceMapping): boolean`

(Afwijkingen van de spec: Kort is een constante `KORT` in plaats van `kortVan(d)`, omdat de stappen niet van het uur
afhangen. Van de feest/heilige-afleiding (spec 4.4) wordt alleen `zelfdeGedachtenis` gedeeld (Task 2); de vier regels
die feest, heilige en aantal kiezen staan in `UurBegin` (Task 4), omdat Vandaag ze met andere teksten combineert.)

- [ ] **Step 1: Schrijf de controle**

`scripts/gebedsweg.check.ts`:

```ts
// Controle van de gebedsweg (lib/gebedsweg.ts): volgorde, beschikbaarheid, aangeleverde bestanden, adressen.
// Draaien: npm run check:gebedsweg
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { serviceConfig, slugVan } from '../src/lib/etmaal';
import { KORT, bidPad, gebedTitel, isAvonduur, leesUurBestand, onderdelenVan, stapIndex } from '../src/lib/gebedsweg';

const uur = (titel: string) => serviceConfig.find((d) => d.title === titel)!;
const alles = () => true;

// Standaardvolgorde: de opening, dan de psalmen van het uur
const vespers = onderdelenVan(uur('Vespers'), null, alles, true);
assert.deepEqual(vespers.map((o) => o.titel), ['Inleidende gebeden', 'Psalm 103', 'Psalm 140']);
assert.ok(vespers.every((o) => o.beschikbaar));
assert.equal(vespers[1].soort === 'psalm' && vespers[1].pdf, '/data/pdfs/Psalm 103.pdf');

// GEBEDEN_ZICHTBAAR uit: de opening volgt nog, de psalmen niet
assert.deepEqual(onderdelenVan(uur('Vespers'), null, alles, false).map((o) => o.beschikbaar), [false, true, true]);

// Psalm zonder losse tekst
assert.deepEqual(onderdelenVan(uur('Vespers'), null, (nr) => nr !== 140, true).map((o) => o.beschikbaar), [true, true, false]);

// Aangeleverd bestand vervangt de volgorde; tekst null en een onbekend gebed volgen nog
const bestand = leesUurBestand({
  onderdelen: [
    { gebed: 'inleidende-gebeden-pdf' },
    { titel: 'Lichtgebeden', tekst: null },
    { psalm: 140 },
    { titel: 'Avondlied', tekst: 'Vreugdevol licht' },
    { gebed: 'bestaat-niet' },
  ],
});
assert.ok(bestand);
assert.deepEqual(
  onderdelenVan(uur('Vespers'), bestand, alles, true).map((o) => [o.titel, o.beschikbaar]),
  [['Inleidende gebeden', true], ['Lichtgebeden', false], ['Psalm 140', true], ['Avondlied', true], ['bestaat-niet', false]],
);
// Een tekst van alleen spaties telt als ontbrekend
assert.equal(onderdelenVan(uur('Vespers'), leesUurBestand({ onderdelen: [{ titel: 'Leeg', tekst: '  ' }] }), alles, true)[0].beschikbaar, false);

// Kapot of onbekend van vorm: geen bestand, dus de standaard
for (const kapot of [null, 'tekst', {}, { onderdelen: 'x' }, { onderdelen: [{ psalm: 0 }] }, { onderdelen: [{ psalm: 151 }] }, { onderdelen: [{ titel: 3, tekst: null }] }, { onderdelen: [{}] }])
  assert.equal(leesUurBestand(kapot), null, JSON.stringify(kapot));

// Geen enkel onderdeel met tekst
assert.equal(onderdelenVan(uur('Completen'), null, () => false, false).some((o) => o.beschikbaar), false);

// Kort
assert.deepEqual(KORT.map((s) => s.soort), ['kernvers', 'jezusgebed']);

// Stapnummers (1-gebaseerd in het adres, 0-gebaseerd terug)
assert.equal(stapIndex('1', 2), 0);
assert.equal(stapIndex('2', 2), 1);
for (const fout of ['0', '3', 'abc', '', '1.5', undefined]) assert.equal(stapIndex(fout, 2), null, String(fout));

// Adressen
assert.equal(bidPad('vespers'), '#etmaal/vespers/bid');
assert.equal(bidPad('derde-uur', 'heel', 2), '#etmaal/derde-uur/bid/heel/2');
assert.equal(bidPad('completen', 'einde'), '#etmaal/completen/bid/einde');

// Titel met lidwoord
assert.equal(gebedTitel(uur('Vespers')), 'Het gebed van de Vespers');
assert.equal(gebedTitel(uur('Middernachtdienst')), 'Het gebed van de Middernacht');
assert.equal(gebedTitel(uur('Derde Uur')), 'Het gebed van het Derde uur');

// Avond- en nachturen
assert.deepEqual(serviceConfig.filter(isAvonduur).map((d) => d.title), ['Vespers', 'Completen', 'Middernachtdienst', 'Metten']);

// Elk uur heeft een onderbeeld voor de banner
for (const d of serviceConfig) assert.ok(existsSync(`public/images/etmaal/onder/${slugVan(d)}.webp`), slugVan(d));

console.log('gebedsweg: alle controles geslaagd');
```

In `package.json`, na `"check:herinneringen"`, toevoegen:

```json
    "check:gebedsweg": "esbuild scripts/gebedsweg.check.ts --bundle --platform=node --format=esm --outfile=node_modules/.cache/gebedsweg.check.mjs --log-level=warning && node node_modules/.cache/gebedsweg.check.mjs",
```

- [ ] **Step 2: Draai de controle en zie hem falen**

Run: `npm run check:gebedsweg`
Expected: FAIL, esbuild meldt `Could not resolve "../src/lib/gebedsweg"`.

- [ ] **Step 3: Schrijf `src/lib/gebedsweg.ts`**

```ts
import { GEBEDEN } from './gebeden';
import { naamVan, type ServiceMapping } from './etmaal';

// De gebedsweg (spec: docs/superpowers/specs/2026-11-05-gebedsweg-design.md): de volgorde van een gebedsuur en welke
// onderdelen nu te bidden zijn. Zonder React of browser (behalve laadUurBestand), zodat scripts/gebedsweg.check.ts het
// los kan controleren.
//
// Standaard: de Inleidende gebeden, dan de psalmen van het uur (lib/etmaal.ts). Staat er een
// public/data/uren/<slug>.json, dan bepaalt dat bestand de hele volgorde; "tekst": null betekent "volgt nog".

export type Onderdeel =
  | { soort: 'psalm'; titel: string; nr: number; beschikbaar: boolean; pdf?: string }
  | { soort: 'gebed'; titel: string; id: string; beschikbaar: boolean }
  | { soort: 'tekst'; titel: string; tekst: string | null; beschikbaar: boolean };

export type KortStap = { soort: 'kernvers' } | { soort: 'jezusgebed' };
export type BronOnderdeel = { psalm: number } | { gebed: string } | { titel: string; tekst: string | null };
export interface UurBestand {
  onderdelen: BronOnderdeel[];
}

/** Kort (ongeveer twee minuten): het kernvers van het uur en het Jezusgebed. */
export const KORT: KortStap[] = [{ soort: 'kernvers' }, { soort: 'jezusgebed' }];

const OPENING = 'inleidende-gebeden-pdf';
const psalmNr = (title: string) => Number(title.replace('Psalm ', ''));

function geldigOnderdeel(o: unknown): o is BronOnderdeel {
  if (!o || typeof o !== 'object') return false;
  const x = o as Record<string, unknown>;
  if ('psalm' in x) return typeof x.psalm === 'number' && Number.isInteger(x.psalm) && x.psalm >= 1 && x.psalm <= 150;
  if ('gebed' in x) return typeof x.gebed === 'string';
  return typeof x.titel === 'string' && (typeof x.tekst === 'string' || x.tekst === null);
}

/** Een aangeleverd uurbestand, of null als het niet de verwachte vorm heeft. */
export function leesUurBestand(json: unknown): UurBestand | null {
  const delen = json && typeof json === 'object' ? (json as { onderdelen?: unknown }).onderdelen : undefined;
  return Array.isArray(delen) && delen.every(geldigOnderdeel) ? { onderdelen: delen } : null;
}

/** De onderdelen van een uur in volgorde, elk met "beschikbaar" (nu te bidden). */
export function onderdelenVan(d: ServiceMapping, aangeleverd: UurBestand | null, psalmMetTekst: (nr: number) => boolean, gebedenZichtbaar: boolean): Onderdeel[] {
  const bron: BronOnderdeel[] = aangeleverd?.onderdelen ?? [{ gebed: OPENING }, ...d.psalms.map((p) => ({ psalm: psalmNr(p.title) }))];
  return bron.map((o): Onderdeel => {
    if ('psalm' in o) {
      const pdf = d.psalms.find((p) => psalmNr(p.title) === o.psalm)?.pdf;
      return { soort: 'psalm', titel: `Psalm ${o.psalm}`, nr: o.psalm, beschikbaar: psalmMetTekst(o.psalm), pdf };
    }
    if ('gebed' in o) {
      const g = GEBEDEN.find((x) => x.id === o.gebed);
      return { soort: 'gebed', titel: g?.titel ?? o.gebed, id: o.gebed, beschikbaar: gebedenZichtbaar && !!g };
    }
    return { soort: 'tekst', titel: o.titel, tekst: o.tekst, beschikbaar: !!o.tekst?.trim() };
  });
}

const uurBestanden = new Map<string, Promise<UurBestand | null>>();
/** Laadt public/data/uren/<slug>.json één keer. Ontbreekt het: null. Kapot: null met een waarschuwing. */
export function laadUurBestand(slug: string): Promise<UurBestand | null> {
  let p = uurBestanden.get(slug);
  if (!p) {
    p = fetch(`/data/uren/${slug}.json`)
      .then(async (r) => {
        // Een ontbrekend bestand geeft bij Vite en de hosting index.html terug (geen JSON): dan is er geen bestand.
        if (!r.ok || !r.headers.get('content-type')?.includes('json')) return null;
        const b = leesUurBestand(await r.json().catch(() => undefined));
        if (!b) console.warn(`public/data/uren/${slug}.json heeft een onbekende vorm; de standaardvolgorde geldt.`);
        return b;
      })
      .catch(() => null);
    uurBestanden.set(slug, p);
  }
  return p;
}

/** Stapnummer uit het adres (1-gebaseerd) naar een index (0-gebaseerd), of null als het niet bestaat. */
export function stapIndex(raw: string | undefined, lengte: number): number | null {
  const n = Number(raw);
  return raw && Number.isInteger(n) && n >= 1 && n <= lengte ? n - 1 : null;
}

export function bidPad(slug: string, weg?: 'kort' | 'heel' | 'einde', n?: number): string {
  return `#etmaal/${slug}/bid${weg ? `/${weg}` : ''}${n ? `/${n}` : ''}`;
}

/** "Het gebed van de Vespers", "Het gebed van het Derde uur". */
export const gebedTitel = (d: ServiceMapping) => `Het gebed van ${d.title.endsWith(' Uur') ? 'het' : 'de'} ${naamVan(d)}`;

const AVONDUREN = ['Vespers', 'Completen', 'Middernachtdienst', 'Metten'];
/** Avond- en nachturen: bij de leesweergave "systeem" bidt de gebedsweg dan in de nachtkleuren. */
export const isAvonduur = (d: ServiceMapping) => AVONDUREN.includes(d.title);
```

- [ ] **Step 4: Draai de controle en zie hem slagen**

Run: `npm run check:gebedsweg`
Expected: `gebedsweg: alle controles geslaagd`

Run: `npm run lint`
Expected: geen fouten in `src/lib/gebedsweg.ts` of `scripts/gebedsweg.check.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/gebedsweg.ts scripts/gebedsweg.check.ts package.json
git commit -m "Gebedsweg: volgorde van een gebedsuur (lib/gebedsweg.ts) met controle

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Gedeelde hulpstukken vrijmaken (alleen verplaatsen)

**Files:**
- Create: `src/lib/schermAan.ts`
- Create: `src/lib/jezusgebed.ts`
- Modify: `src/components/Modal.tsx:40-66` (functie `useSchermAan` eruit, importeren)
- Modify: `src/components/AdemMobiel.tsx:40-80` (vormlogica eruit, importeren; `Gebedsregels` exporteren)
- Modify: `src/components/Vandaag.tsx:38-43` (`zelfdeGedachtenis` eruit, importeren)
- Modify: `src/lib/heiligenPopup.ts` (`zelfdeGedachtenis` erbij)
- Modify: `src/components/PsalterMobiel.tsx:196` (`Verzen` exporteren)

**Interfaces:**
- Produces:
  - `useSchermAan(open: boolean): void` uit `src/lib/schermAan.ts`
  - `type Vorm = { id: string; titel: string; tekst: string; onder?: string }`, `VASTE_VORMEN: Vorm[]`, `useVormen(): Vorm[]`, `leesVorm(): string`, `bewaarVorm(id: string): void`, `useGekozenVorm(): Vorm` uit `src/lib/jezusgebed.ts`
  - `zelfdeGedachtenis(a: string, b: string): boolean` uit `src/lib/heiligenPopup.ts`
  - `export function Gebedsregels({ tekst }: { tekst: string })` uit `src/components/AdemMobiel.tsx`
  - `export function Verzen({ verzen, idVoorvoegsel }: { verzen: PsalmBlok[]; idVoorvoegsel: string })` uit `src/components/PsalterMobiel.tsx`

Gedrag verandert niet; de controle is dat bouwen, lint en de bestaande checks slagen en dat Adem en Vandaag er hetzelfde uitzien.

- [ ] **Step 1: `src/lib/schermAan.ts` aanmaken**

Verplaats de functie letterlijk uit `Modal.tsx` (regels 40–66), met export:

```ts
import { useEffect } from 'react';

/** Houdt het scherm aan zolang `open` waar is (leesvenster, gebedsweg). Zonder Wake Lock: niets, zonder fout. */
export function useSchermAan(open: boolean) {
  useEffect(() => {
    if (!open || !('wakeLock' in navigator)) return;
    let actief = true;
    let slot: WakeLockSentinel | null = null;
    const vraag = () => {
      navigator.wakeLock
        .request('screen')
        .then((s) => {
          if (actief) slot = s;
          else void s.release();
        })
        .catch(() => {});
    };
    const opZicht = () => {
      if (document.visibilityState === 'visible') vraag();
    };
    vraag();
    document.addEventListener('visibilitychange', opZicht);
    return () => {
      actief = false;
      document.removeEventListener('visibilitychange', opZicht);
      void slot?.release().catch(() => {});
    };
  }, [open]);
}
```

In `Modal.tsx`: verwijder de functie en het commentaar erboven, voeg toe `import { useSchermAan } from '../lib/schermAan';`. Laat `useEffect` in de React-import staan als Modal het elders nog gebruikt (lint meldt het anders).

- [ ] **Step 2: `src/lib/jezusgebed.ts` aanmaken**

Verplaats uit `AdemMobiel.tsx` de regels van `// De vormen van het Jezusgebed …` tot en met `bewaarVorm`, en voeg `useGekozenVorm` toe:

```ts
import { GEBEDEN } from './gebeden';
import { useEigenPijlgebed } from './pijlgebed';

// De vormen van het Jezusgebed zoals ze in lib/gebeden.ts staan ("(korter:) …", "(kortst:) …"), plus het eigen
// pijlgebed. Gedeeld door Adem en de gebedsweg.
const JEZUSGEBED = GEBEDEN.find((g) => g.id === 'jezusgebed')?.tekst ?? '';
const regelNa = (label: string) => JEZUSGEBED.match(new RegExp(`\\(${label}:\\)\\s*(.+)`))?.[1]?.trim() ?? '';
const STANDAARD = JEZUSGEBED.split('\n')[0].trim();
export type Vorm = { id: string; titel: string; tekst: string; onder?: string };
export const VASTE_VORMEN: Vorm[] = [
  { id: 'standaard', titel: 'Standaard', tekst: STANDAARD },
  { id: 'korter', titel: 'Korter', tekst: regelNa('korter') },
  { id: 'kortst', titel: 'Kortst', tekst: regelNa('kortst') },
].filter((v) => v.tekst);

export function useVormen(): Vorm[] {
  const eigen = useEigenPijlgebed().trim();
  return eigen ? [...VASTE_VORMEN, { id: 'eigen', titel: 'Jouw pijlgebed', tekst: eigen }] : VASTE_VORMEN;
}

// De laatst gekozen gebedsvorm, op dit apparaat
const VORM_SLEUTEL = 'adem-vorm';
export const leesVorm = () => {
  try {
    return localStorage.getItem(VORM_SLEUTEL) ?? '';
  } catch {
    return '';
  }
};
export const bewaarVorm = (id: string) => {
  try {
    localStorage.setItem(VORM_SLEUTEL, id);
  } catch {
    /* geen opslag */
  }
};

/** De laatst in Adem gekozen vorm, anders de standaardvorm. */
export function useGekozenVorm(): Vorm {
  const vormen = useVormen();
  return vormen.find((v) => v.id === leesVorm()) ?? vormen[0];
}
```

In `AdemMobiel.tsx`: verwijder die regels, verwijder de imports van `GEBEDEN` en `useEigenPijlgebed` als ze daarna ongebruikt zijn, en voeg toe:

```ts
import { VASTE_VORMEN, bewaarVorm, leesVorm, useVormen, type Vorm } from '../lib/jezusgebed';
```

(Importeer alleen wat `AdemMobiel.tsx` daarna nog gebruikt; lint meldt ongebruikte namen.) Zet `export` voor `function Gebedsregels`.

- [ ] **Step 3: `zelfdeGedachtenis` naar `lib/heiligenPopup.ts`**

Knip uit `Vandaag.tsx` het commentaar en de drie declaraties (`ALGEMEEN`, `woorden`, `zelfdeGedachtenis`) en plak ze onderaan `src/lib/heiligenPopup.ts`, met `export` voor `zelfdeGedachtenis`:

```ts
// Een heilige en het feest van de dag zijn dezelfde gedachtenis als een kenmerkend woord van de naam in beide staat
// (bijvoorbeeld "Demetrius"); dan staat de heilige niet nog eens apart. Algemene woorden tellen niet mee.
const ALGEMEEN = new Set(['heilige', 'heiligen', 'martelaar', 'grootmartelaar', 'apostel', 'apostelen', 'profeet', 'moeder', 'grote', 'gelijk', 'evangelist', 'synaxis', 'gedachtenis', 'overbrenging', 'relieken', 'eerbiedwaardige']);
const woorden = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z]+/).filter((w) => w.length >= 5 && !ALGEMEEN.has(w));
export const zelfdeGedachtenis = (a: string, b: string) => woorden(a).some((w) => woorden(b).includes(w));
```

In `Vandaag.tsx`: `import { heiligeTitel, zelfdeGedachtenis } from '../lib/heiligenPopup';`.

- [ ] **Step 4: `Verzen` exporteren**

In `src/components/PsalterMobiel.tsx` regel 196: `function Verzen(` → `export function Verzen(`.

- [ ] **Step 5: Controleren**

Run: `npm run build`
Expected: geslaagd, geen TypeScript-fouten.

Run: `npm run lint`
Expected: geen fouten.

Run: `npm run check:heiligen && npm run check:gebedsweg`
Expected: beide "alle controles geslaagd".

Preview (`ot17-dev`, mobiel 375 × 812): `#adem`, dan "Begin met bidden" toont het Jezusgebed in de laatst gekozen vorm; `#vandaag` toont "Feesten & heiligen" als voorheen; een gebed in Gebeden (desktop) houdt het scherm aan zoals voorheen. Geen console-fouten.

- [ ] **Step 6: Commit**

```bash
git add src/lib/schermAan.ts src/lib/jezusgebed.ts src/lib/heiligenPopup.ts src/components/Modal.tsx src/components/AdemMobiel.tsx src/components/Vandaag.tsx src/components/PsalterMobiel.tsx
git commit -m "Gedeelde hulpstukken voor de gebedsweg: scherm aan, vormen van het Jezusgebed, zelfde gedachtenis, Verzen

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Herinneringen openen het gebed

**Files:**
- Modify: `src/lib/herinneringPlanning.ts:126`
- Test: `scripts/herinneringen.check.ts:14,19`, `scripts/pushserver.check.ts:54`

**Interfaces:**
- Produces: `Melding.url` voor een gebedsuur is `#etmaal/<slug>/bid`.

- [ ] **Step 1: Pas de controles aan**

`scripts/herinneringen.check.ts`:

```ts
assert.equal(vespers[0].url, '#etmaal/vespers/bid');
```

```ts
assert.equal(nacht.url, '#etmaal/middernacht/bid');
```

`scripts/pushserver.check.ts` regel 54:

```ts
  assert.equal(verstuurd[0].inhoud.url, '#etmaal/vespers/bid');
```

- [ ] **Step 2: Zie ze falen**

Run: `npm run check:herinneringen`
Expected: FAIL, `AssertionError … '#etmaal/vespers' … '#etmaal/vespers/bid'`.

- [ ] **Step 3: Pas de url aan**

`src/lib/herinneringPlanning.ts` regel 126 (geen import van `lib/gebedsweg.ts`: dit bestand wordt ook door de pushserver gebundeld en hoeft de gebeden niet mee te nemen):

```ts
        url: `#etmaal/${slugVan(s)}/bid`,
```

- [ ] **Step 4: Zie ze slagen**

Run: `npm run check:herinneringen && npm run check:pushserver`
Expected: beide geslaagd.

- [ ] **Step 5: Commit**

```bash
git add src/lib/herinneringPlanning.ts scripts/herinneringen.check.ts scripts/pushserver.check.ts
git commit -m "Herinnering voor een gebedsuur opent de gebedsweg

Na uitrol de pushserver opnieuw uitrollen; tot dan opent een melding de Etmaal-pagina.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: De schermen van de gebedsweg en het adres `#etmaal/<slug>/bid`

**Files:**
- Create: `src/components/Gebedsweg.tsx`
- Create: `src/components/gebedsweg.css`
- Modify: `src/components/EtmaalMobiel.tsx` (koptekst-commentaar regels 16–24, `Dienst` link regel 134, `Inhoud` regels 191–223, `EtmaalMobiel` regels 228–252)
- Modify: `src/components/Vandaag.tsx:107`
- Modify: `src/components/Bidden.tsx:74`

**Interfaces:**
- Consumes: alles uit Task 1 (`KORT`, `Onderdeel`, `KortStap`, `UurBestand`, `bidPad`, `gebedTitel`, `isAvonduur`, `laadUurBestand`, `onderdelenVan`, `stapIndex`); uit Task 2 `useSchermAan`, `useGekozenVorm`, `zelfdeGedachtenis`, `Gebedsregels`, `Verzen`; bestaand `Kop`, `Laag`, `Sierlijn` (`MobielLaag.tsx`), `useApp` (`lib/context`), `dagInfo`, `formatDag`, `hoofdletter` (`lib/kalender`), `heiligeTitel` (`lib/heiligenPopup`), `useLeesvoorkeur` (`lib/leesvoorkeur`), `PSALMEN`, `laadPsalmTeksten`, `PsalmTeksten` (`lib/psalmen`), `GEBEDEN`, `GEBEDEN_ZICHTBAAR` (`lib/gebeden`), `SIERKRUIS` (`./symbolen`).
- Produces:
  - `export default function Gebedsweg({ d, pad, terug, slim, extra }: { d: ServiceMapping; pad: string[]; terug: string; slim: boolean; extra?: ReactNode })`
  - `export function Doorsturen({ adres }: { adres: string })`

- [ ] **Step 1: `src/components/Gebedsweg.tsx` schrijven**

```tsx
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useApp } from '../lib/context';
import { naamVan, slugVan, type ServiceMapping } from '../lib/etmaal';
import { GEBEDEN, GEBEDEN_ZICHTBAAR } from '../lib/gebeden';
import { KORT, bidPad, gebedTitel, isAvonduur, laadUurBestand, onderdelenVan, stapIndex, type KortStap, type Onderdeel, type UurBestand } from '../lib/gebedsweg';
import { heiligeTitel, zelfdeGedachtenis } from '../lib/heiligenPopup';
import { useGekozenVorm } from '../lib/jezusgebed';
import { dagInfo, formatDag, hoofdletter } from '../lib/kalender';
import { useLeesvoorkeur } from '../lib/leesvoorkeur';
import { PSALMEN, laadPsalmTeksten, type PsalmTeksten } from '../lib/psalmen';
import { useSchermAan } from '../lib/schermAan';
import { Gebedsregels } from './AdemMobiel';
import { Kop, Laag, Sierlijn } from './MobielLaag';
import { Verzen } from './PsalterMobiel';
import { SIERKRUIS } from './symbolen';
import './gebedsweg.css';

// De gebedsweg op mobiel (spec: docs/superpowers/specs/2026-11-05-gebedsweg-design.md), onder #etmaal/<slug>/bid:
//   …/bid             het begin van het uur: de Kerk van vandaag, Kort of Het hele uur, de inhoud van het uur
//   …/bid/kort/<n>    stap n van Kort (kernvers, Jezusgebed)
//   …/bid/heel/<n>    stap n van Het hele uur (alleen de onderdelen met tekst)
//   …/bid/einde       de afsluiting
// Teksten alleen uit lib/etmaal.ts, lib/gebeden.ts en public/data/psalmen.json.

/** Vervangt het adres (geen extra stap in de geschiedenis), bijvoorbeeld van een oud of onbekend adres naar het begin. */
export function Doorsturen({ adres }: { adres: string }) {
  useEffect(() => window.location.replace(adres), [adres]);
  return null;
}

/** De onderdelen van het uur, of null zolang het aangeleverde bestand (public/data/uren/<slug>.json) nog laadt. */
function useOnderdelen(d: ServiceMapping): Onderdeel[] | null {
  const slug = slugVan(d);
  const [bestand, setBestand] = useState<{ slug: string; b: UurBestand | null } | null>(null);
  useEffect(() => {
    let actief = true;
    laadUurBestand(slug).then((b) => actief && setBestand({ slug, b }));
    return () => {
      actief = false;
    };
  }, [slug]);
  return useMemo(
    () => (bestand?.slug === slug ? onderdelenVan(d, bestand.b, (nr) => !!PSALMEN[nr - 1]?.hasText, GEBEDEN_ZICHTBAAR) : null),
    [bestand, slug, d],
  );
}

/** Systeem: donker bij de avond- en nachturen of als het toestel donker staat; een eigen keuze blijft gelden. */
function useNacht(d: ServiceMapping) {
  const v = useLeesvoorkeur();
  return v.kleur === 'systeem' ? v.nacht || isAvonduur(d) : v.nacht;
}

export default function Gebedsweg({ d, pad, terug, slim, extra }: { d: ServiceMapping; pad: string[]; terug: string; slim: boolean; extra?: ReactNode }) {
  const delen = useOnderdelen(d);
  const nacht = useNacht(d);
  const slug = slugVan(d);
  const [weg, n] = pad;
  if (weg === 'einde') return <Afsluiting d={d} nacht={nacht} />;
  if (weg === 'kort' || weg === 'heel') {
    if (weg === 'heel' && !delen) return null; // het uurbestand laadt nog (kort)
    const stappen: Array<Onderdeel | KortStap> = weg === 'kort' ? KORT : delen!.filter((o) => o.beschikbaar);
    const i = stapIndex(n, stappen.length);
    if (i === null) return <Doorsturen adres={bidPad(slug)} />;
    return <Stap key={`${weg}-${i}`} d={d} weg={weg} stap={stappen[i]} i={i} aantal={stappen.length} nacht={nacht} />;
  }
  if (weg) return <Doorsturen adres={bidPad(slug)} />;
  return <UurBegin d={d} delen={delen} terug={terug} slim={slim} extra={extra} />;
}

function Kernvers({ d }: { d: ServiceMapping }) {
  return (
    <blockquote className="gw-groot">
      {d.kernvers.verses.map((v) => <span key={v}>{v}</span>)}
      <cite>{d.kernvers.reference.replace('Psalm Kernvers:', 'Psalm')}</cite>
    </blockquote>
  );
}

// 1. Het begin van het uur
function UurBegin({ d, delen, terug, slim, extra }: { d: ServiceMapping; delen: Onderdeel[] | null; terug: string; slim: boolean; extra?: ReactNode }) {
  const { vandaag, vandaagYmd, mode, heiligen } = useApp();
  const dag = useMemo(() => dagInfo(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);
  const slug = slugVan(d);
  // Zelfde afleiding als de kaart "Feesten & heiligen" op Vandaag
  const hoofdFeest = dag.feesten[0];
  const lijst = heiligen?.HEILIGEN[dag.kerkKey]?.filter((h) => h.type === 'saint') ?? [];
  const heilige = lijst.find((h) => !(hoofdFeest && zelfdeGedachtenis(h.naam, hoofdFeest.naam)));
  const meer = lijst.length - 1;
  const gedachtenis = hoofdFeest
    ? hoofdFeest.naam
    : heilige
      ? `${heiligeTitel(heilige.naam)}${meer > 0 ? ` en nog ${meer} ${meer === 1 ? 'heilige' : 'heiligen'}` : ''}`
      : null;
  const ritme = [dag.toon ? `Toon ${dag.toon}` : null, dag.seizoen, dag.vasten.label.toLowerCase()].filter(Boolean).join(' · ');
  const tebidden = delen?.filter((o) => o.beschikbaar) ?? [];
  return (
    <Laag className="gw gw-begin" label={gebedTitel(d)}>
      <div className="gw-banner">
        <img src={`/images/etmaal/onder/${slug}.webp`} alt="" width={900} height={507} decoding="async" />
        <Kop terug={terug} merk slim={slim} />
        <div className="gw-banner-tekst">
          <h1 tabIndex={-1}>{gebedTitel(d)}</h1>
          <p>{d.hoofdgedachtenis}</p>
        </div>
      </div>
      <div className="gw-papier">
        <section className="gw-kerk" aria-label="De Kerk vandaag">
          <p className="gw-label">De Kerk vandaag</p>
          <b>{hoofdletter(dag.weekdagNaam)} {formatDag(mode === 'oud' ? dag.kerk : dag.civil)}</b>
          {gedachtenis && <span>{gedachtenis}</span>}
          <span>{ritme}</span>
        </section>
        <Sierlijn />
        <div className="gw-keuzes">
          <a className="gw-keuze" href={bidPad(slug, 'kort', 1)}>
            <b>Kort · 2 min</b>
            <span>Het kernvers en het Jezusgebed</span>
          </a>
          {tebidden.length ? (
            <a className="gw-keuze is-hoofd" href={bidPad(slug, 'heel', 1)}>
              <b>Het hele uur</b>
              <span>{tebidden.map((o) => o.titel).join(' · ')}</span>
            </a>
          ) : (
            <p className="gw-keuze is-uit" aria-disabled="true">
              <b>Het hele uur</b>
              <span>{delen ? 'De teksten van dit uur volgen nog' : 'Wordt geladen…'}</span>
            </p>
          )}
        </div>
        <h2 className="gw-label gw-inhoud-kop">Inhoud van dit uur</h2>
        <ul className="gw-inhoud">
          {delen?.map((o, i) => (
            <li key={i}>
              <span>{o.titel}</span>
              {!o.beschikbaar &&
                (o.soort === 'psalm' && o.pdf ? (
                  <a href={o.pdf} target="_blank" rel="noreferrer">Als PDF</a>
                ) : (
                  <em>Volgt nog</em>
                ))}
            </li>
          ))}
        </ul>
        {extra}
      </div>
    </Laag>
  );
}

// 2. Bidden: één onderdeel, niets anders
function Stap({ d, weg, stap, i, aantal, nacht }: { d: ServiceMapping; weg: 'kort' | 'heel'; stap: Onderdeel | KortStap; i: number; aantal: number; nacht: boolean }) {
  useSchermAan(true);
  const slug = slugVan(d);
  const laatste = i === aantal - 1;
  return (
    <Laag className={`gw gw-bid${nacht ? ' is-nacht' : ''}`} label={`${gebedTitel(d)}, ${i + 1} van ${aantal}`}>
      <div className="am-kop">
        <a className="am-terug" href={bidPad(slug)} aria-label="Stoppen en terug naar het begin van het uur">×</a>
        <span className="gw-context">{naamVan(d)}</span>
        <span />
      </div>
      <div className="gw-vlak">
        <StapInhoud d={d} stap={stap} />
      </div>
      <div className="gw-voet">
        <a className="gw-verder" href={laatste ? bidPad(slug, 'einde') : bidPad(slug, weg, i + 2)}>{laatste ? 'Amen' : 'Verder'}</a>
        <span className="gw-teller">{i + 1} van {aantal}</span>
      </div>
    </Laag>
  );
}

function StapInhoud({ d, stap }: { d: ServiceMapping; stap: Onderdeel | KortStap }) {
  if (stap.soort === 'kernvers')
    return (
      <>
        <h1 className="sr-only" tabIndex={-1}>Kernvers</h1>
        <Kernvers d={d} />
      </>
    );
  if (stap.soort === 'jezusgebed') return <Jezusgebed />;
  if (stap.soort === 'psalm') return <PsalmStap nr={stap.nr} titel={stap.titel} />;
  const tekst = stap.soort === 'gebed' ? GEBEDEN.find((g) => g.id === stap.id)?.tekst : stap.tekst;
  return (
    <>
      <h1 className="gw-titel" tabIndex={-1}>{stap.titel}</h1>
      <Sierlijn />
      <p className="gw-gebed">{tekst}</p>
    </>
  );
}

function Jezusgebed() {
  const vorm = useGekozenVorm();
  return (
    <>
      <h1 className="sr-only" tabIndex={-1}>Het Jezusgebed</h1>
      <p className="gw-groot"><Gebedsregels tekst={vorm.tekst} /></p>
      <p className="gw-noot">Bid het in stilte</p>
    </>
  );
}

function PsalmStap({ nr, titel }: { nr: number; titel: string }) {
  const [teksten, setTeksten] = useState<PsalmTeksten | null>(null);
  const [fout, setFout] = useState(false);
  useEffect(() => {
    laadPsalmTeksten().then(setTeksten, () => setFout(true));
  }, []);
  const tekst = teksten?.[nr];
  return (
    <>
      <h1 className="gw-titel" tabIndex={-1}>{titel}</h1>
      <Sierlijn />
      {tekst ? <Verzen verzen={tekst.verzen} idVoorvoegsel="gw-vers" /> : <p className="gw-noot">{fout ? 'De tekst kon niet worden geladen.' : 'De tekst wordt geladen…'}</p>}
    </>
  );
}

// 3. De afsluiting
function Afsluiting({ d, nacht }: { d: ServiceMapping; nacht: boolean }) {
  useSchermAan(true);
  return (
    <Laag className={`gw gw-einde${nacht ? ' is-nacht' : ''}`} label={`${gebedTitel(d)}: einde`}>
      <h1 className="sr-only" tabIndex={-1}>Einde van {gebedTitel(d).toLowerCase()}</h1>
      <span className="gw-kruis">{SIERKRUIS}</span>
      <Kernvers d={d} />
      <a className="gw-verder" href="#vandaag">Terug naar Vandaag</a>
    </Laag>
  );
}
```

- [ ] **Step 2: `src/components/gebedsweg.css` schrijven**

```css
/* De gebedsweg op mobiel (Gebedsweg.tsx): het begin van een gebedsuur, één onderdeel tegelijk bidden en de afsluiting.
   Licht: perkament, zoals de rest van de app. Donker (.is-nacht): de nachtkleuren van de leesweergave. */
.gw { --gw-tekst: var(--inkt, #0b1b2a); --gw-zacht: var(--gedempt, #5d5040); --gw-accent: var(--goud-pijl, #7a5a2a); --gw-lijn: rgba(172, 121, 47, .4); background: var(--papyrus, #f5e6c8) url('/images/vandaag/papyrus-licht.webp') center / cover; color: var(--gw-tekst); }
.gw.is-nacht { --gw-tekst: #e9dcc0; --gw-zacht: #b9a98a; --gw-accent: #d9b56e; --gw-lijn: rgba(217, 181, 110, .35); background: #17110b; }
.gw .am-sierlijn { color: var(--gw-accent); }

/* Begin van het uur */
.gw-banner { position: relative; flex: none; height: min(76vw, 320px); background: #000; }
.gw-banner > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.gw-banner::after { content: ''; position: absolute; inset: 0; background: linear-gradient(rgba(10, 6, 3, .55), rgba(10, 6, 3, .2) 40%, rgba(10, 6, 3, .75)); }
.gw-banner-tekst { position: absolute; z-index: 1; inset: auto 0 56px; padding: 0 16px; color: #f5e6c8; text-wrap: balance; }
.gw-banner-tekst h1 { font-family: var(--font-lees); font-weight: 400; font-size: 32px; line-height: 1.1; text-shadow: 0 2px 10px rgba(0, 0, 0, .8); }
.gw-banner-tekst h1:focus { outline: none; }
.gw-banner-tekst p { margin-top: 4px; font-family: var(--font-lees); font-size: 18px; font-style: italic; text-shadow: 0 1px 6px rgba(0, 0, 0, .9); }
.gw-papier { position: relative; z-index: 2; flex: 1; margin-top: -36px; padding: 0 14px 32px; border-radius: 16px 16px 0 0; background: var(--papyrus, #f5e6c8) url('/images/vandaag/papyrus-licht.webp') center top / 100% auto; }
.gw-label { font-family: var(--font-titel); font-size: 11.5px; font-weight: 500; letter-spacing: .16em; text-transform: uppercase; color: #6a4a24; }
.gw-kerk { position: relative; top: -22px; margin-bottom: -8px; padding: 14px 16px; border: 1px solid var(--kaartrand, #b99455); border-radius: 6px; background: #f3e5c6 url('/images/vandaag/papyrus-licht.webp') center / cover; box-shadow: 0 6px 16px rgba(40, 20, 8, .35); }
.gw-kerk b { display: block; margin-top: 4px; font-family: var(--font-lees); font-weight: 400; font-size: 22px; line-height: 1.2; }
.gw-kerk span { display: block; font-family: var(--font-lees); font-size: 15.5px; color: var(--gw-zacht); }
.gw-keuzes { display: grid; gap: 10px; margin-top: 4px; }
#top#top#top#top#top#top#top#top#top .gw-keuze { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; min-height: 76px; margin: 0; padding: 12px 16px; border: 1px solid var(--kaartrand, #b99455); border-radius: 6px; background: rgba(255, 250, 238, .55); color: var(--gw-tekst) !important; text-decoration: none; }
#top#top#top#top#top#top#top#top#top .gw-keuze.is-hoofd { background: #ead3a6; box-shadow: inset 0 0 0 3px rgba(255, 250, 238, .6); }
.gw-keuze.is-uit { opacity: .55; }
.gw-keuze b { font-family: var(--font-lees); font-weight: 400; font-size: 23px; }
.gw-keuze span { font-family: var(--font-lees); font-size: 15px; color: var(--gw-zacht); }
.gw-inhoud-kop { margin: 22px 0 6px; }
.gw-inhoud { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--gw-lijn); text-align: left; }
.gw-inhoud li { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px; padding: 0 12px; border-bottom: 1px solid var(--gw-lijn); font-family: var(--font-lees); font-size: 17px; }
#top#top#top#top#top#top#top#top#top .gw-inhoud :is(em, a) { font-size: 14px; font-style: italic; color: var(--gw-zacht) !important; }

/* Bidden: één onderdeel; lange teksten scrollen binnen het vlak, de voet blijft staan */
.gw-bid { overflow: hidden; }
#top#top#top#top#top#top#top#top#top .gw-bid .am-kop { grid-template-columns: 44px 1fr 44px; }
#top#top#top#top#top#top#top#top#top .gw-bid .am-terug { justify-content: center; width: 44px; padding: 0; font-size: 28px; line-height: 1; color: var(--gw-zacht) !important; }
.gw-context { font-family: var(--font-titel); font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--gw-accent); }
.gw-vlak { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: safe center; padding: 8px 26px 24px; overflow-y: auto; overscroll-behavior: contain; }
.gw-titel { font-family: var(--font-lees); font-weight: 400; font-size: 26px; color: var(--gw-accent); }
.gw-titel:focus { outline: none; }
.gw-groot { margin: 0; font-family: var(--font-lees); font-size: 24px; line-height: 1.45; text-wrap: balance; }
.gw-groot > span, .gw-groot .am-regel { display: block; }
.gw-groot cite { display: block; margin-top: 12px; font-family: var(--font-titel); font-size: 12px; font-style: normal; letter-spacing: .16em; color: var(--gw-accent); }
.gw-noot { margin-top: 22px; font-family: var(--font-lees); font-size: 16px; font-style: italic; color: var(--gw-zacht); }
.gw-gebed { white-space: pre-line; text-align: left; font-family: var(--font-lees); font-size: 20px; line-height: 1.55; }
#top#top#top#top#top#top#top#top#top .gw .pm-verzen { text-align: left; color: var(--gw-tekst); }
.gw-voet { flex: none; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 20px calc(18px + env(safe-area-inset-bottom)); }
#top#top#top#top#top#top#top#top#top .gw-verder { display: inline-flex; align-items: center; justify-content: center; min-width: 200px; min-height: 52px; padding: 0 28px; border: 1px solid var(--gw-accent); border-radius: 999px; font-family: var(--font-titel); font-size: 14px; letter-spacing: .16em; text-transform: uppercase; color: var(--gw-accent) !important; text-decoration: none; }
#top#top#top#top#top#top#top#top#top .gw-verder:focus-visible, #top#top#top#top#top#top#top#top#top .gw-keuze:focus-visible { outline: 3px solid var(--focus, #066b95); outline-offset: 2px; }
.gw-teller { font-family: var(--font-lees); font-size: 14px; color: var(--gw-zacht); }

/* Afsluiting */
.gw-einde { justify-content: center; align-items: center; gap: 18px; padding: 32px 26px; }
.gw-kruis { display: inline-flex; width: 44px; height: 44px; color: var(--gw-accent); }
.gw-kruis svg { width: 100%; height: 100%; }
```

- [ ] **Step 3: Het adres koppelen in `EtmaalMobiel.tsx`**

Imports: vervang `import { UurOnderdeel, UurOverzicht } from './PsalterMobiel';` door

```ts
import Gebedsweg, { Doorsturen } from './Gebedsweg';
import { bidPad } from '../lib/gebedsweg';
```

Koptekst-commentaar: vervang de regels voor `#etmaal/<dienst>/psalmen` en `#etmaal/<dienst>/psalmen/<nr>` door

```ts
//   #etmaal/<dienst>/bid…      4. de gebedsweg: begin van het uur, bidden, afsluiting (Gebedsweg.tsx); ook vanaf Vandaag,
//                                 Bidden en een herinnering. Het oude #etmaal/<dienst>/psalmen[/<nr>] stuurt hierheen door.
```

In `Dienst` (regel 134): `href={`#etmaal/${slug}/psalmen`}` → `href={bidPad(slug)}`.

Vervang de functie `Inhoud` (met het commentaar erboven) door:

```tsx
// 4. De gebedsweg (Gebedsweg.tsx). Terug vanaf het begin gaat naar waar je vandaan kwam (Vandaag, Bidden) of naar de
// pagina van het uur; per uur onthouden, zodat het ook klopt na het bidden.
const gebedHerkomst = new Map<string, string>();
function BidIngang({ d, pad }: { d: ServiceMapping; pad: string[] }) {
  const { vandaagYmd, mode } = useApp();
  const slug = slugVan(d);
  const kathisma = d.title === 'Metten' ? 'metten' : d.title === 'Vespers' ? 'vespers' : null;
  const [{ terug, slim }] = useState(() => {
    const v = vorigeAdres();
    if (!v.startsWith(`#etmaal/${slug}/bid/`)) {
      if (v && !v.startsWith('#etmaal')) gebedHerkomst.set(slug, v);
      else gebedHerkomst.delete(slug);
    }
    const t = gebedHerkomst.get(slug) ?? `#etmaal/${slug}`;
    // Rechtstreeks gekomen: Terug is een echte stap terug in de geschiedenis
    return { terug: t, slim: v === t };
  });
  return (
    <Gebedsweg
      d={d}
      pad={pad}
      terug={terug}
      slim={slim}
      extra={
        kathisma && (
          <section className="em-kathisma" aria-labelledby="em-kathisma-kop">
            <h2 id="em-kathisma-kop" className="am-label">Kathisma’s bij dit moment</h2>
            <Psalterlezing datum={vandaagYmd} mode={mode} dienst={kathisma} />
          </section>
        )
      }
    />
  );
}
```

In `EtmaalMobiel()`:

```tsx
  // Vandaag opent het gebedsuur van nu: op mobiel direct het begin van de gebedsweg.
  useEffect(() => {
    const opDienst = (e: Event) => {
      const d = serviceConfig.find((s) => s.title === (e as CustomEvent<string>).detail);
      if (d) gaNaar(`etmaal/${slugVan(d)}/bid`);
    };
    window.addEventListener(OPEN_DIENST_EVENT, opDienst);
    return () => window.removeEventListener(OPEN_DIENST_EVENT, opDienst);
  }, []);

  const delen = onderdeel.split('/');
  const [eerste, tweede] = delen;
```

en vervang de twee `psalmen`-regels in de JSX door:

```tsx
      {dienst && tweede === 'bid' && <BidIngang d={dienst} pad={delen.slice(2)} />}
      {dienst && tweede === 'psalmen' && <Doorsturen adres={bidPad(slugVan(dienst))} />}
```

- [ ] **Step 4: De ingangen op Vandaag en Bidden**

`src/components/Vandaag.tsx` regel 107:

```ts
        href: `#etmaal/${slugVan(uurMoment)}/bid`,
```

en het commentaar erboven: `// Direct naar de gebedsweg van dit uur (ook bij openen in een nieuw tabblad)`.

`src/components/Bidden.tsx` regel 74:

```tsx
          <a className="bd-hoofd" href={`#etmaal/${slugVan(uur)}/bid`}>
```

- [ ] **Step 5: Bouwen en lint**

Run: `npm run build && npm run lint && npm run check:gebedsweg`
Expected: alles geslaagd. (`UurOverzicht`/`UurOnderdeel` bestaan nog maar worden niet meer gebruikt; lint mag daarover niets melden omdat ze geëxporteerd zijn. Ze verdwijnen in Task 5.)

- [ ] **Step 6: In de preview nalopen**

Start `ot17-dev`, venster mobiel 375 × 812. Loop na, telkens zonder console-fouten:

1. `#etmaal/vespers/bid`: onderbeeld Vespers, "Het gebed van de Vespers", De Kerk vandaag met datum, gedachtenis en "Toon … · … · …", Kort en Het hele uur ("Psalm 103 · Psalm 140"), inhoud met "Inleidende gebeden — Volgt nog", kathisma's eronder.
2. Kort: kernvers → Verder → Jezusgebed met "Bid het in stilte" → Amen → afsluiting met kernvers → "Terug naar Vandaag" opent `#vandaag`.
3. Het hele uur: Psalm 103 (scrollt binnen het vlak, Verder blijft zichtbaar) → Psalm 140 → Amen → afsluiting.
4. "×" in een stap gaat naar het begin; Escape doet hetzelfde.
5. Leesweergave systeem: Vespers donker, `#etmaal/derde-uur/bid/kort/1` licht (als het toestel licht staat). Instellingen → licht: Vespers op perkament. Na het verlaten is de rest van de app onveranderd.
6. `#etmaal/derde-uur/bid`: "Het gebed van het Derde uur". `#etmaal/middernacht/bid`: onderbeeld aanwezig.
7. Review Focus: `#etmaal/vespers/psalmen` en `#etmaal/vespers/psalmen/103` → `#etmaal/vespers/bid`; `#etmaal/vespers/bid/heel/9`, `/bid/heel/0`, `/bid/heel/abc` en `/bid/iets` → `#etmaal/vespers/bid`.
8. Vandaag → kaart "Het actuele gebedsuur" → begin van dat uur; Terug → Vandaag. Bidden → kaart gebedsuur → begin; Terug → Bidden. Etmaal → Vespers → "Begin met bidden" → begin; Terug → de dienstpagina.
9. Een uur zonder tekst: maak tijdelijk `public/data/uren/completen.json` met `{ "onderdelen": [{ "titel": "Proef", "tekst": null }] }` → "Het hele uur" uitgeschakeld met "De teksten van dit uur volgen nog", inhoud "Proef — Volgt nog", Kort werkt. Daarna het bestand **weer verwijderen**.

Maak een schermafdruk van het begin (licht) en een stap (donker) voor de opdrachtgever.

- [ ] **Step 7: Commit**

```bash
git add src/components/Gebedsweg.tsx src/components/gebedsweg.css src/components/EtmaalMobiel.tsx src/components/Vandaag.tsx src/components/Bidden.tsx
git commit -m "Gebedsweg: begin van het uur, bidden en afsluiting onder #etmaal/<uur>/bid

Vandaag, Bidden en Etmaal openen het begin van het uur; oude /psalmen-adressen sturen door.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Opruimen en eindcontrole

**Files:**
- Modify: `src/components/PsalterMobiel.tsx:388-484` (het blok "Het gebedenboek van een gebedsuur" verwijderen)
- Modify: `src/components/etmaal-mobiel.css` (regels voor `.em-inhoud`, `.em-hele-dienst`, `.em-onderdelen`, `.em-onderdeel` verwijderen als niets ze meer gebruikt)
- Delete: `src/lib/snoerPad.ts`
- Delete: `public/prototype-gebedsweg.html`

- [ ] **Step 1: Het oude gebedenboek per uur verwijderen**

Verwijder in `PsalterMobiel.tsx` het hele blok vanaf `/* ---------- Het gebedenboek van een gebedsuur (Etmaal) … */` tot en met het einde van `UurOnderdeel` (`onderdelenVan`, `onderdeelPad`, `UurOverzicht`, `UurOnderdeel`). Verwijder daarna imports die ongebruikt raken (lint meldt ze; waarschijnlijk `type ServiceMapping` en eventueel `ChevronLeft`).

Controleer dat niets ze nog gebruikt:

Run: `grep -rn "UurOverzicht\|UurOnderdeel\|onderdeelPad" src`
Expected: geen uitvoer.

- [ ] **Step 2: Ongebruikte CSS verwijderen**

Run: `grep -rn "em-inhoud\|em-hele-dienst\|em-onderdelen\|em-onderdeel\b\|em-gebed\b" src --include=*.tsx`
Expected: geen uitvoer. Verwijder dan in `src/components/etmaal-mobiel.css` de regels met die klassen (het blok onder `/* De inhoud van een gebedsuur … */` en de `.em-gebed`-regels). Laat `.em-bid`, `.em-over` en `.em-kathisma` staan; die blijven in gebruik.

- [ ] **Step 3: Snoer en prototype verwijderen**

Run: `grep -rn "snoerPad\|SNOER_PAD" src`
Expected: alleen `src/lib/snoerPad.ts` zelf.

```bash
git rm src/lib/snoerPad.ts
rm public/prototype-gebedsweg.html
```

(Het prototype is nooit gecommit; daarom `rm` en geen `git rm`.)

- [ ] **Step 4: Eindcontrole**

Run: `npm run build && npm run lint`
Expected: geslaagd.

Run: `npm run check:gebedsweg && npm run check:herinneringen && npm run check:pushserver && npm run check:psalmen && npm run check:heiligen && npm run check:psalterlezing`
Expected: alle "geslaagd".

Preview: herhaal Task 4 stap 6 punten 1, 2, 3, 7 en 8 kort; open daarnaast `#psalmen/50` en `#psalmen/kathisma/3` (het Psalter zelf moet ongewijzigd werken) en `#adem/bidden` (Jezusgebed in Adem ongewijzigd). Geen console-fouten. Zet het venster terug op desktop en controleer dat `#etmaal` op desktop het bekende dienstvenster toont.

- [ ] **Step 5: Commit**

```bash
git add src/components/PsalterMobiel.tsx src/components/etmaal-mobiel.css
git commit -m "Opruimen: oude gebedenboek per uur en het ongebruikte snoerpad weg

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

(`git rm` heeft `src/lib/snoerPad.ts` al klaargezet voor deze commit.)

---

## Na afloop

- De pushserver opnieuw uitrollen (Task 3), anders openen meldingen tot dan de Etmaal-pagina.
- Teksten aanvullen kan zonder code: `public/data/uren/<slug>.json` volgens het formaat in de spec (4.2). Slugs: `vespers`, `completen`, `middernacht`, `metten`, `eerste-uur`, `derde-uur`, `zesde-uur`, `negende-uur`.
- Zodra de gebeden opnieuw zijn aangeleverd: `GEBEDEN_ZICHTBAAR = true` in `src/lib/gebeden.ts`; de Inleidende gebeden openen dan elk uur.
