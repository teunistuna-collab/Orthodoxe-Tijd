# Onze heiligen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De naam- en beschermheiligen van het gezin kiezen op de Heiligen-pagina, hun naamdag zien op Vandaag en er een herinnering voor krijgen.

**Architecture:** Een pure module `lib/onzeHeiligen.ts` (gegevens, schonen, naamdag op een dag, volgorde) die zowel de app als de herinneringsplanning en de pushserver gebruiken. Een browsermodule `lib/onzeHeiligenOpslag.ts` bewaart de lijst in `localStorage` en zet een kopie in de herinneringen (`naamdagLijst`). Het scherm staat in `components/OnzeHeiligen.tsx` (blok, toevoegen, bewerken, "Voor wie?") en haakt in op Heiligen, het leesvenster, Vandaag en Instellingen.

**Tech Stack:** React 19 + TypeScript + Vite, hash-routing, controles als esbuild-gebundelde `node:assert`-scripts (`npm run check:*`).

**Spec:** `docs/superpowers/specs/2026-11-06-onze-heiligen-design.md`

## Global Constraints

- Geen verzonnen teksten: een zelf ingevulde heilige heeft alleen de ingevoerde naam (APP-MAPPING).
- Geen nieuwe kaartstijl, iconen of beelden; Vandaag krijgt alleen een regel in de bestaande kaart Feesten & heiligen.
- Opslag alleen op het toestel: `localStorage`-sleutel `onzeHeiligen`.
- Grenzen: hooguit 30 heiligen (`MAX_HEILIGEN`), `heilige` en `voor` hooguit 80 tekens (`MAX_TEKST`), `md` een bestaande kerkelijke dag `"M-D"` zonder voorloopnul (zoals `mdKey`), 2-29 toegestaan.
- 29 februari valt in een jaar zonder 29 februari (in de gekozen kalender) op 28 februari.
- Meldingen: moment volgt `feestMoment` (avond ervoor 20.00 / dag zelf 7.00); titel "Morgen: naamdag van Sofia" / "Vandaag: naamdag van Sofia" (zonder voor wie: "Morgen: naamdag"); tekst "De heilige Sofia van Rome"; url `#heiligen`.
- Mobiel (onder 768 px); web/desktop krijgt niets nieuws.
- Teksten in de app in het Nederlands; codecommentaar in het Nederlands, kort.

## Review Focus

1. Juliaanse kalender: een heilige van 17-9 hoort op burgerlijk 30-9 (oude kalender), niet op 17-9 — getest in Task 1 en 2.
2. 29 februari in een gewoon jaar, in beide kalenders (juliaans 2-28 2027 = burgerlijk 13-3-2027) — getest in Task 1.
3. Kapotte of gemanipuleerde gegevens uit opslag of netwerk (geen lijst, lege naam, 2-30, 50 items, 200 tekens) — getest in Task 1 en 2.
4. Grootte van de pushaanmelding met 30 heiligen met lange namen met accenten (meer dan 8 KB) — getest in Task 2.
5. Navigatie: na opslaan of verwijderen terug op de Heiligen-pagina zonder dat Terug het formulier weer opent; leesvenster blijft werken — in de preview in Task 3.

---

### Task 1: De module Onze heiligen (gegevens en naamdagen)

**Files:**
- Create: `src/lib/onzeHeiligen.ts`
- Create: `scripts/onzeheiligen.check.ts`
- Modify: `package.json` (script `check:onzeheiligen`)

**Interfaces:**
- Consumes: `addDays`, `kerkDatum`, `mdKey`, `utc`, `type Mode` uit `src/lib/kalender.ts`.
- Produces:
  - `interface OnzeHeilige { id: string; heilige: string; md: string; voor: string; bron?: string }`
  - `type Naamdag = Pick<OnzeHeilige, 'heilige' | 'md' | 'voor'>`
  - `MAX_HEILIGEN = 30`, `MAX_TEKST = 80`
  - `geldigeMd(md: unknown): md is string`
  - `schoonNaamdag(v: unknown): Naamdag | null`
  - `schoonOnzeHeiligen(v: unknown): OnzeHeilige[]`
  - `naamdagenOp<T extends Naamdag>(lijst: T[], dag: Date, mode: Mode): T[]`
  - `dagenTot(h: Naamdag, vandaag: Date, mode: Mode): number`
  - `opVolgorde<T extends Naamdag>(lijst: T[], vandaag: Date, mode: Mode): T[]`
  - `zonderTitel(naam: string): string`

- [ ] **Step 1: Write the failing test**

`scripts/onzeheiligen.check.ts`:

```ts
// Controle van Onze heiligen (lib/onzeHeiligen.ts): schonen van opslag, naamdag op de juiste dag in beide kalenders,
// 29 februari in een gewoon jaar en de volgorde op de eerstvolgende naamdag. Draaien: npm run check:onzeheiligen
import assert from 'node:assert/strict';
import { utc } from '../src/lib/kalender';
import { MAX_HEILIGEN, dagenTot, geldigeMd, naamdagenOp, opVolgorde, schoonNaamdag, schoonOnzeHeiligen, zonderTitel } from '../src/lib/onzeHeiligen';

// Geldige kerkelijke dagen ("M-D", zonder voorloopnul; 29 februari mag)
for (const md of ['1-1', '2-29', '12-31', '9-17']) assert.ok(geldigeMd(md), md);
for (const md of ['0-1', '2-30', '13-1', '01-05', '9-31', 'x', 5, null]) assert.equal(geldigeMd(md), false, String(md));

// Opslag schonen: kapot geeft een lege lijst; ongeldige items en dubbele id's vallen weg; grenzen
assert.deepEqual(schoonOnzeHeiligen('kapot'), []);
assert.deepEqual(schoonOnzeHeiligen(null), []);
const sofia = { id: 'a', heilige: 'Sofia van Rome', md: '9-17', voor: 'Sofia', bron: 'hj-0917-1' };
assert.deepEqual(
  schoonOnzeHeiligen([sofia, null, { id: 'b', heilige: '', md: '1-1', voor: '' }, { id: 'c', heilige: 'X', md: '2-30', voor: '' }, { ...sofia }]),
  [sofia],
);
assert.equal(schoonOnzeHeiligen([{ ...sofia, voor: 'x'.repeat(200) }])[0].voor.length, 80);
assert.equal(schoonOnzeHeiligen(Array.from({ length: 40 }, (_, i) => ({ ...sofia, id: `i${i}` }))).length, MAX_HEILIGEN);
assert.equal(schoonNaamdag({ heilige: ' Nikolaas ', md: '12-6' })?.heilige, 'Nikolaas');
assert.equal(schoonNaamdag({ heilige: 'Nikolaas', md: '12-6' })?.voor, '');
assert.equal(schoonNaamdag({ heilige: 'Nikolaas', md: '12-32' }), null);

// Naamdag op de juiste dag: kerkelijk 17-9 is burgerlijk 30-9 bij de oude (juliaanse) kalender, 17-9 bij de nieuwe
assert.deepEqual(naamdagenOp([sofia], utc(2026, 9, 30), 'oud'), [sofia]);
assert.deepEqual(naamdagenOp([sofia], utc(2026, 9, 17), 'oud'), []);
assert.deepEqual(naamdagenOp([sofia], utc(2026, 9, 17), 'nieuw'), [sofia]);

// 29 februari: in een gewoon jaar op 28 februari, in een schrikkeljaar op 29 februari (beide kalenders)
const cassianus = { heilige: 'Johannes Cassianus', md: '2-29', voor: '' };
assert.equal(naamdagenOp([cassianus], utc(2027, 2, 28), 'nieuw').length, 1);
assert.equal(naamdagenOp([cassianus], utc(2028, 2, 28), 'nieuw').length, 0);
assert.equal(naamdagenOp([cassianus], utc(2028, 2, 29), 'nieuw').length, 1);
assert.equal(naamdagenOp([cassianus], utc(2027, 3, 13), 'oud').length, 1); // juliaans 28-2-2027
assert.equal(naamdagenOp([cassianus], utc(2028, 3, 12), 'oud').length, 0); // juliaans 28-2-2028 (schrikkeljaar)
assert.equal(naamdagenOp([cassianus], utc(2028, 3, 13), 'oud').length, 1); // juliaans 29-2-2028

// Volgorde op de eerstvolgende naamdag (vandaag eerst)
const nikolaas = { heilige: 'Nikolaas', md: '12-6', voor: 'Nick' };
const vandaag = utc(2026, 11, 6);
assert.equal(dagenTot(nikolaas, vandaag, 'nieuw'), 30);
assert.equal(dagenTot({ ...nikolaas, md: '11-6' }, vandaag, 'nieuw'), 0);
assert.ok(dagenTot(cassianus, vandaag, 'oud') < 400);
assert.deepEqual(opVolgorde([sofia, nikolaas, { ...nikolaas, md: '11-6', voor: 'Vandaag' }], vandaag, 'nieuw').map((h) => h.voor), ['Vandaag', 'Nick', 'Sofia']);

// Naam zonder titel, voor "De heilige …" in een melding
assert.equal(zonderTitel('H. Sofia van Rome'), 'Sofia van Rome');
assert.equal(zonderTitel('De heilige Ignatios'), 'Ignatios');
assert.equal(zonderTitel('Heilige Nikolaas'), 'Nikolaas');
assert.equal(zonderTitel('Ignatios'), 'Ignatios');

console.log('onzeheiligen: alle controles geslaagd');
```

`package.json`, na de regel van `check:zoeken`:

```json
    "check:onzeheiligen": "esbuild scripts/onzeheiligen.check.ts --bundle --platform=node --format=esm --outfile=node_modules/.cache/onzeheiligen.check.mjs --log-level=warning && node node_modules/.cache/onzeheiligen.check.mjs",
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run check:onzeheiligen`
Expected: FAIL — esbuild: `Could not resolve "../src/lib/onzeHeiligen"`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/onzeHeiligen.ts`:

```ts
import { addDays, kerkDatum, mdKey, type Mode } from './kalender';

// Onze heiligen (spec: docs/superpowers/specs/2026-11-06-onze-heiligen-design.md): de naam- en beschermheiligen van het
// gezin. Zonder browser of React: gedeeld door de app (lib/onzeHeiligenOpslag.ts), de planning van de herinneringen en
// de pushserver.

export interface OnzeHeilige {
  /** Eigen id, uniek in de lijst. */
  id: string;
  /** Naam van de heilige zoals getoond ("Sofia van Rome"). */
  heilige: string;
  /** Kerkelijke gedenkdag "M-D" (zoals mdKey en de sleutels van HEILIGEN). */
  md: string;
  /** Voor wie: "Sofia", "ikzelf", "parochie"; mag leeg zijn. */
  voor: string;
  /** Id uit het Heiligenjaar of de Lage Landen; ontbreekt bij een zelf ingevulde heilige. */
  bron?: string;
}
/** Wat de herinneringen (en de pushserver) van een heilige nodig hebben. */
export type Naamdag = Pick<OnzeHeilige, 'heilige' | 'md' | 'voor'>;

export const MAX_HEILIGEN = 30;
export const MAX_TEKST = 80;
const DAGEN_PER_MAAND = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Bestaande kerkelijke dag "M-D" (zonder voorloopnul), inclusief 29 februari. */
export function geldigeMd(md: unknown): md is string {
  if (typeof md !== 'string' || !/^\d{1,2}-\d{1,2}$/.test(md)) return false;
  const [m, d] = md.split('-').map(Number);
  return m >= 1 && m <= 12 && d >= 1 && d <= DAGEN_PER_MAAND[m - 1] && md === `${m}-${d}`;
}

const tekst = (x: unknown) => (typeof x === 'string' ? x.trim().slice(0, MAX_TEKST) : '');

/** Een naamdag uit een onbetrouwbare bron (opslag, netwerk), of null. */
export function schoonNaamdag(v: unknown): Naamdag | null {
  const o = v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
  const heilige = tekst(o.heilige);
  return heilige && geldigeMd(o.md) ? { heilige, md: o.md, voor: tekst(o.voor) } : null;
}

/** De opgeslagen lijst: ongeldige items en dubbele id's vallen weg, hooguit MAX_HEILIGEN. */
export function schoonOnzeHeiligen(v: unknown): OnzeHeilige[] {
  if (!Array.isArray(v)) return [];
  const uit: OnzeHeilige[] = [];
  const ids = new Set<string>();
  for (const x of v) {
    const n = schoonNaamdag(x);
    if (!n) continue;
    const o = x as Record<string, unknown>;
    const id = typeof o.id === 'string' && o.id.length > 0 && o.id.length <= 40 ? o.id : '';
    if (!id || ids.has(id)) continue;
    ids.add(id);
    uit.push({ id, ...n, ...(typeof o.bron === 'string' && o.bron.length <= 80 ? { bron: o.bron } : {}) });
    if (uit.length === MAX_HEILIGEN) break;
  }
  return uit;
}

/** De naamdagen op burgerlijke dag `dag` (UTC-middernacht) in de gekozen kalender. Een heilige van 29 februari valt in
 *  een jaar zonder 29 februari op 28 februari. */
export function naamdagenOp<T extends Naamdag>(lijst: T[], dag: Date, mode: Mode): T[] {
  const k = mdKey(kerkDatum(dag, mode));
  const geenSchrikkeldag = k === '2-28' && mdKey(kerkDatum(addDays(dag, 1), mode)) === '3-1';
  return lijst.filter((h) => h.md === k || (geenSchrikkeldag && h.md === '2-29'));
}

/** Dagen tot de eerstvolgende naamdag (0 = vandaag). Elke dag komt binnen een jaar terug (2-29 via 28 februari). */
export function dagenTot(h: Naamdag, vandaag: Date, mode: Mode): number {
  for (let i = 0; i < 400; i++) if (naamdagenOp([h], addDays(vandaag, i), mode).length) return i;
  return Infinity;
}

/** Op volgorde van de eerstvolgende naamdag (vandaag eerst); dezelfde dag in de volgorde van de lijst. */
export const opVolgorde = <T extends Naamdag>(lijst: T[], vandaag: Date, mode: Mode): T[] =>
  lijst.map((h, i) => ({ h, i, d: dagenTot(h, vandaag, mode) })).sort((a, b) => a.d - b.d || a.i - b.i).map((x) => x.h);

/** "Sofia van Rome" uit "H. Sofia van Rome", "Heilige Sofia" of "De heilige Sofia" (voor "De heilige …"). */
export const zonderTitel = (naam: string) => naam.replace(/^(de\s+)?(h\.|heilige)\s+/i, '');
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run check:onzeheiligen`
Expected: PASS — `onzeheiligen: alle controles geslaagd`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/onzeHeiligen.ts scripts/onzeheiligen.check.ts package.json
git commit -m "Onze heiligen: gegevens, naamdag op een dag en volgorde (lib/onzeHeiligen.ts) met controle"
```

---

### Task 2: Naamdagen in de herinneringen en de pushserver

**Files:**
- Modify: `src/lib/herinneringPlanning.ts` (type, STANDAARD, `ietsAan`, `schoonVoorkeuren`, `meldingenRond`)
- Modify: `server/pushserver.ts:149` (grens 8192 → 16384)
- Modify: `scripts/herinneringen.check.ts`
- Modify: `scripts/pushserver.check.ts`

**Interfaces:**
- Consumes (Task 1): `MAX_HEILIGEN`, `naamdagenOp`, `schoonNaamdag`, `zonderTitel`, `type Naamdag`.
- Produces: `Herinneringen` met `naamdagen: boolean` en `naamdagLijst: Naamdag[]`; `STANDAARD.naamdagen = false`, `STANDAARD.naamdagLijst = []`; meldingen met id `naamdag:<md>:<heilige>:<voor>:<ymd>`.

- [ ] **Step 1: Write the failing tests**

`scripts/herinneringen.check.ts`: import uitbreiden met `ietsAan`:

```ts
import { STANDAARD, aanDeBeurt, ietsAan, kloktijd, meldingenRond, schoonVoorkeuren, vandaagIn } from '../src/lib/herinneringPlanning';
```

Vóór `console.log('herinneringen: alle controles geslaagd');`:

```ts
// Naamdagen: Sofia (kerkelijk 17-9) op 30-9-2026 bij de oude kalender; het moment volgt de feesten.
const naam = { ...STANDAARD, naamdagen: true, naamdagLijst: [{ heilige: 'H. Sofia van Rome', md: '9-17', voor: 'Sofia' }] };
const nd = (dag: Date, extra = {}) => meldingenRond(dag, { ...naam, ...extra }, 'oud').filter((m) => m.id.startsWith('naamdag:') && m.id.endsWith(ymd(dag)));
const ndAvond = nd(utc(2026, 9, 30));
assert.equal(ndAvond.length, 1);
assert.equal(ndAvond[0].titel, 'Morgen: naamdag van Sofia');
assert.equal(ndAvond[0].tekst, 'De heilige Sofia van Rome');
assert.equal(ndAvond[0].url, '#heiligen');
assert.equal(uur(ndAvond[0].tijd), '20:00');
assert.equal(ndAvond[0].tijd.getDate(), 29);
const ndDag = nd(utc(2026, 9, 30), { feestMoment: 'dag' });
assert.equal(ndDag[0].titel, 'Vandaag: naamdag van Sofia');
assert.equal(uur(ndDag[0].tijd), '07:00');
assert.equal(nd(utc(2026, 9, 30), { naamdagen: false }).length, 0);
assert.equal(nd(utc(2026, 9, 17)).length, 0);
assert.equal(nd(utc(2026, 9, 30), { naamdagLijst: [{ heilige: 'Sofia', md: '9-17', voor: '' }] })[0].titel, 'Morgen: naamdag');
// Twee keer precies dezelfde heilige voor dezelfde persoon: één melding
assert.equal(nd(utc(2026, 9, 30), { naamdagLijst: [naam.naamdagLijst[0], naam.naamdagLijst[0]] }).length, 1);
// Naamdagen tellen alleen mee als er heiligen zijn
assert.equal(ietsAan({ ...STANDAARD, naamdagen: true }), false);
assert.equal(ietsAan(naam), true);
// Schonen: ongeldige naamdagen vallen weg, hooguit 30
assert.deepEqual(
  schoonVoorkeuren({ naamdagen: true, naamdagLijst: [{ heilige: 'Sofia', md: '9-17', voor: 'S' }, { heilige: '', md: '1-1' }, { heilige: 'X', md: '2-30' }, 'kapot'] }).naamdagLijst,
  [{ heilige: 'Sofia', md: '9-17', voor: 'S' }],
);
assert.equal(schoonVoorkeuren({ naamdagLijst: Array.from({ length: 50 }, () => ({ heilige: 'S', md: '1-1', voor: '' })) }).naamdagLijst.length, 30);
assert.equal(schoonVoorkeuren({ naamdagLijst: 'kapot' }).naamdagLijst.length, 0);
```

`scripts/pushserver.check.ts`, direct na `assert.equal(app.abonnementen.size, 0);` (na de weigeringen):

```ts
  // Naamdagen: 30 heiligen met lange namen met accenten (meer dan 8 KB) worden aangenomen en geschoond.
  const lang = 'é'.repeat(90);
  const naamdagLijst = Array.from({ length: 31 }, () => ({ heilige: lang, md: '12-31', voor: lang }));
  assert.equal((await post('/api/push/abonnement', { ...aanmelding, voorkeuren: { ...STANDAARD, naamdagen: true, naamdagLijst } })).status, 204);
  const metNaamdagen = [...app.abonnementen.values()][0].voorkeuren;
  assert.equal(metNaamdagen.naamdagLijst.length, 30);
  assert.equal(metNaamdagen.naamdagLijst[0].heilige.length, 80);
  app.abonnementen.clear();
```

En de bestaande regel met `opvulling` aanpassen aan de nieuwe grens:

```ts
  assert.equal((await post('/api/push/abonnement', { ...aanmelding, opvulling: 'x'.repeat(17000) })).status, 413);
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run check:herinneringen`
Expected: FAIL — `ndAvond.length` is 0, verwacht 1 (AssertionError).

Run: `npm run check:pushserver`
Expected: FAIL — de aanmelding met naamdagen geeft 413 in plaats van 204.

- [ ] **Step 3: Write minimal implementation**

`src/lib/herinneringPlanning.ts`:

Import na de import van `./kalender`:

```ts
import { MAX_HEILIGEN, naamdagenOp, schoonNaamdag, zonderTitel, type Naamdag } from './onzeHeiligen';
```

In `interface Herinneringen`, na `feestMoment: 'ervoor' | 'dag';`:

```ts
  /** Naamdagen van Onze heiligen; het moment volgt feestMoment. */
  naamdagen: boolean;
  /** Kopie van Onze heiligen (lib/onzeHeiligenOpslag.ts), zodat de planning en de pushserver de naamdagen kennen. */
  naamdagLijst: Naamdag[];
```

`STANDAARD` wordt:

```ts
export const STANDAARD: Herinneringen = { uren: [], vooraf: 0, vasten: false, vastenMoment: 'avond', alleenGroteVasten: false, feesten: false, feestKeuze: 'alle', feestIds: [], feestMoment: 'ervoor', naamdagen: false, naamdagLijst: [] };
```

`ietsAan` wordt:

```ts
export const ietsAan = (h: Herinneringen) =>
  h.uren.length > 0 || h.vasten || (h.feesten && (h.feestKeuze === 'alle' || h.feestIds.length > 0)) || (h.naamdagen && h.naamdagLijst.length > 0);
```

In `schoonVoorkeuren`, na `feestMoment: …,`:

```ts
    naamdagen: o.naamdagen === true,
    naamdagLijst: (Array.isArray(o.naamdagLijst) ? o.naamdagLijst : []).map(schoonNaamdag).filter((n): n is Naamdag => !!n).slice(0, MAX_HEILIGEN),
```

In `meldingenRond`: de regel `if (!h.vasten && !h.feesten) continue;` wordt:

```ts
    if (h.naamdagen) {
      const ervoor = h.feestMoment === 'ervoor';
      for (const n of naamdagenOp(h.naamdagLijst, d, mode)) {
        const id = `naamdag:${n.md}:${n.heilige}:${n.voor}:${sleutel}`;
        if (uit.some((m) => m.id === id)) continue;
        uit.push({
          id,
          tijd: ervoor ? kloktijd(addDays(d, -1), AVOND, 0, tz) : kloktijd(d, OCHTEND, 0, tz),
          titel: `${ervoor ? 'Morgen' : 'Vandaag'}: naamdag${n.voor ? ` van ${n.voor}` : ''}`,
          tekst: `De heilige ${zonderTitel(n.heilige)}`,
          url: '#heiligen',
        });
      }
    }
    if (!h.vasten && !h.feesten) continue;
```

`server/pushserver.ts:149`: `if (grootte > 8192)` wordt:

```ts
        if (grootte > 16384) mis(new TeGroot()); // 30 naamdagen met lange namen passen; de rest niet bewaren
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run check:herinneringen`
Expected: PASS — `herinneringen: alle controles geslaagd`.

Run: `npm run check:pushserver`
Expected: PASS — `pushserver: alle controles geslaagd`.

Run: `npm run check:onzeheiligen`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/herinneringPlanning.ts server/pushserver.ts scripts/herinneringen.check.ts scripts/pushserver.check.ts
git commit -m "Herinneringen: naamdagen van Onze heiligen (moment volgt de feesten); pushserver neemt tot 16 KB aan"
```

---

### Task 3: Opslag en de Heiligen-pagina (blok, toevoegen, bewerken, leesvenster)

**Files:**
- Create: `src/lib/onzeHeiligenOpslag.ts`
- Create: `src/components/OnzeHeiligen.tsx`
- Modify: `src/components/Heiligen.tsx` (blok, lagen, `toevoegen` op het leesvenster)
- Modify: `src/components/HeiligePopup.tsx` (prop `toevoegen`)
- Modify: `src/components/heiligen-mobiel.css`

**Interfaces:**
- Consumes (Task 1): `MAX_HEILIGEN`, `MAX_TEKST`, `geldigeMd`, `dagenTot`, `opVolgorde`, `schoonOnzeHeiligen`, `type OnzeHeilige`. (Task 2): `zetHerinneringen({ naamdagLijst })` uit `lib/herinneringen.ts`.
- Produces:
  - `useOnzeHeiligen(): OnzeHeilige[]`, `voegToe(h: Omit<OnzeHeilige, 'id'>): void`, `wijzig(id, w): void`, `verwijder(id): void` (lib/onzeHeiligenOpslag.ts)
  - `OnzeHeiligenBlok({ onLees })`, `OnzeHeiligenLagen({ onderdeel, alle })`, `ToevoegenInLeesvenster({ heilige })` (components/OnzeHeiligen.tsx)
  - Adressen: `#heiligen/onze/toevoegen`, `#heiligen/onze/bewerk/<id>`

- [ ] **Step 1: Opslag**

`src/lib/onzeHeiligenOpslag.ts`:

```ts
import { useSyncExternalStore } from 'react';
import { zetHerinneringen } from './herinneringen';
import { MAX_HEILIGEN, schoonOnzeHeiligen, type OnzeHeilige } from './onzeHeiligen';

// De lijst Onze heiligen op dit toestel (localStorage), met een kopie in de herinneringen (naamdagLijst), zodat de
// planning en de pushserver de naamdagen kennen zonder de opslag of de heiligenlijst.
const SLEUTEL = 'onzeHeiligen';

function lees(): OnzeHeilige[] {
  try {
    return schoonOnzeHeiligen(JSON.parse(localStorage.getItem(SLEUTEL) ?? '[]'));
  } catch {
    return [];
  }
}
let huidig = lees();
const luisteraars = new Set<() => void>();
const meld = () => luisteraars.forEach((f) => f());
window.addEventListener('storage', (e) => {
  if (e.key !== SLEUTEL) return;
  huidig = lees();
  meld();
});
const abonneer = (f: () => void) => {
  luisteraars.add(f);
  return () => luisteraars.delete(f);
};
export const useOnzeHeiligen = (): OnzeHeilige[] => useSyncExternalStore(abonneer, () => huidig);

function bewaar(lijst: OnzeHeilige[]) {
  huidig = schoonOnzeHeiligen(lijst);
  try {
    localStorage.setItem(SLEUTEL, JSON.stringify(huidig));
  } catch {
    /* geen opslag: de lijst geldt dan alleen voor dit bezoek */
  }
  zetHerinneringen({ naamdagLijst: huidig.map(({ heilige, md, voor }) => ({ heilige, md, voor })) });
  meld();
}

let volgnummer = 0;
export function voegToe(h: Omit<OnzeHeilige, 'id'>) {
  if (huidig.length >= MAX_HEILIGEN) return;
  bewaar([...huidig, { ...h, id: `${Date.now().toString(36)}-${volgnummer++}` }]);
}
export const wijzig = (id: string, w: Partial<Omit<OnzeHeilige, 'id'>>) => bewaar(huidig.map((h) => (h.id === id ? { ...h, ...w } : h)));
export const verwijder = (id: string) => bewaar(huidig.filter((h) => h.id !== id));
```

- [ ] **Step 2: Het scherm**

`src/components/OnzeHeiligen.tsx`:

```tsx
import { useMemo, useState, type FormEvent } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { useApp } from '../lib/context';
import { formatMd, MAANDEN } from '../lib/kalender';
import { heiligeTitel, zoekVorm, type Resultaat } from '../lib/heiligenPopup';
import { dagenTot, geldigeMd, MAX_HEILIGEN, MAX_TEKST, opVolgorde, type OnzeHeilige } from '../lib/onzeHeiligen';
import { useOnzeHeiligen, verwijder, voegToe, wijzig } from '../lib/onzeHeiligenOpslag';
import { vorigeAdres } from '../lib/vorigAdres';
import { Kop, Laag } from './MobielLaag';

// Onze heiligen (spec: docs/superpowers/specs/2026-11-06-onze-heiligen-design.md) op de Heiligen-pagina (mobiel): het
// blok bovenaan, "Voor wie?" (ook in het leesvenster), toevoegen (#heiligen/onze/toevoegen: zoeken of zelf invullen) en
// bewerken (#heiligen/onze/bewerk/<id>). Opmaak: heiligen-mobiel.css (.oh-…).

const VOL = 'De lijst is vol: hooguit 30 heiligen.';
const VOOR_WIE = 'Bijvoorbeeld Sofia, ikzelf of parochie';

/** Terug naar de Heiligen-pagina: een stap terug als je daarvandaan kwam, anders erheen zonder extra stap. */
const sluit = () => (vorigeAdres().startsWith('#heiligen') ? window.history.back() : window.location.replace('#heiligen'));

export function OnzeHeiligenBlok({ onLees }: { onLees: (h: OnzeHeilige) => void }) {
  const { vandaag, mode } = useApp();
  const lijst = useOnzeHeiligen();
  const rijen = useMemo(() => opVolgorde(lijst, vandaag, mode), [lijst, vandaag, mode]);
  return (
    <section className="oh" aria-labelledby="oh-kop">
      <div className="hm-kop">
        <h2 id="oh-kop" className="hm-label">Onze heiligen</h2>
        <span>Naamdagen van het gezin</span>
      </div>
      {rijen.length ? (
        <ul className="oh-lijst">
          {rijen.map((h) => (
            <li key={h.id} className="oh-rij">
              <button type="button" className="oh-open" onClick={() => onLees(h)}>
                <b>{heiligeTitel(h.heilige)}</b>
                <span>{[h.voor, dagenTot(h, vandaag, mode) === 0 ? 'Vandaag' : formatMd(h.md)].filter(Boolean).join(' · ')}</span>
              </button>
              <a className="oh-bewerk" href={`#heiligen/onze/bewerk/${h.id}`} aria-label={`Bewerken: ${heiligeTitel(h.heilige)}`}>Bewerken</a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="oh-leeg">Kies de naam- en beschermheiligen van je gezin. Op hun dag zie je het op Vandaag, en als je wilt krijg je een herinnering.</p>
      )}
      {lijst.length >= MAX_HEILIGEN ? (
        <p className="oh-leeg">{VOL}</p>
      ) : (
        <a className="hm-meer oh-toevoegen" href="#heiligen/onze/toevoegen">Heilige toevoegen <ChevronRight aria-hidden="true" /></a>
      )}
    </section>
  );
}

/** "Voor wie?" en opslaan, voor een heilige uit de lijst (leesvenster en toevoegen). */
function VoorWie({ heilige, onKlaar }: { heilige: Resultaat; onKlaar: () => void }) {
  const [voor, setVoor] = useState('');
  const lijst = useOnzeHeiligen();
  if (lijst.length >= MAX_HEILIGEN) return <p className="oh-leeg">{VOL}</p>;
  return (
    <form
      className="oh-form"
      onSubmit={(e) => {
        e.preventDefault();
        voegToe({ heilige: heilige.naam, md: heilige.md, voor, bron: heilige.id });
        onKlaar();
      }}
    >
      <label className="oh-veld">
        <span>Voor wie?</span>
        <input value={voor} onChange={(e) => setVoor(e.target.value)} maxLength={MAX_TEKST} placeholder={VOOR_WIE} autoComplete="off" />
      </label>
      <button type="submit" className="oh-knop">Toevoegen aan onze heiligen</button>
    </form>
  );
}

/** In het leesvenster van een heilige (alleen op de Heiligen-pagina, mobiel). Met key={heilige.id} gebruiken. */
export function ToevoegenInLeesvenster({ heilige }: { heilige: Resultaat }) {
  const [stap, setStap] = useState<'knop' | 'voor' | 'klaar'>('knop');
  return (
    <section className="exact-popup-sectie oh-popup">
      {stap === 'klaar' ? (
        <p>Toegevoegd aan onze heiligen.</p>
      ) : stap === 'voor' ? (
        <VoorWie heilige={heilige} onKlaar={() => setStap('klaar')} />
      ) : (
        <button type="button" className="oh-knop" onClick={() => setStap('voor')}>Toevoegen aan onze heiligen</button>
      )}
    </section>
  );
}

/** Naam, gedenkdag en voor wie: zelf invullen (zonder h) of bewerken. Bij een heilige uit de lijst alleen voor wie. */
function HeiligeFormulier({ h, onKlaar }: { h?: OnzeHeilige; onKlaar: () => void }) {
  const [m0, d0] = (h?.md ?? '0-0').split('-').map(Number);
  const [naam, setNaam] = useState(h?.heilige ?? '');
  const [dag, setDag] = useState(d0);
  const [maand, setMaand] = useState(m0);
  const [voor, setVoor] = useState(h?.voor ?? '');
  const [fout, setFout] = useState('');
  const uitLijst = !!h?.bron;
  const opslaan = (e: FormEvent) => {
    e.preventDefault();
    const md = `${maand}-${dag}`;
    if (!uitLijst && !naam.trim()) return setFout('Vul de naam van de heilige in.');
    if (!uitLijst && !geldigeMd(md)) return setFout('Kies een bestaande dag en maand.');
    if (h) wijzig(h.id, uitLijst ? { voor } : { heilige: naam, md, voor });
    else voegToe({ heilige: naam, md, voor });
    onKlaar();
  };
  return (
    <form className="oh-form" onSubmit={opslaan} noValidate>
      {!uitLijst && (
        <>
          <label className="oh-veld">
            <span>Naam van de heilige</span>
            <input value={naam} onChange={(e) => setNaam(e.target.value)} maxLength={MAX_TEKST} autoComplete="off" />
          </label>
          <fieldset className="oh-datum">
            <legend>Gedenkdag (kerkelijke kalender)</legend>
            <label>
              <span className="sr-only">Dag</span>
              <select value={dag} onChange={(e) => setDag(Number(e.target.value))}>
                <option value={0}>Dag</option>
                {Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Maand</span>
              <select value={maand} onChange={(e) => setMaand(Number(e.target.value))}>
                <option value={0}>Maand</option>
                {MAANDEN.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
              </select>
            </label>
          </fieldset>
        </>
      )}
      <label className="oh-veld">
        <span>Voor wie?</span>
        <input value={voor} onChange={(e) => setVoor(e.target.value)} maxLength={MAX_TEKST} placeholder={VOOR_WIE} autoComplete="off" />
      </label>
      {fout && <p className="oh-fout" role="alert">{fout}</p>}
      <button type="submit" className="oh-knop">{h ? 'Opslaan' : 'Toevoegen aan onze heiligen'}</button>
    </form>
  );
}

function Toevoegen({ alle }: { alle: Resultaat[] }) {
  const lijst = useOnzeHeiligen();
  const [zoek, setZoek] = useState('');
  const [gekozen, setGekozen] = useState<Resultaat | null>(null);
  const [zelf, setZelf] = useState(false);
  const q = zoekVorm(zoek);
  const gevonden = useMemo(
    () => (q ? alle.filter((h) => zoekVorm(`${h.naam} ${h.titel} ${(h.namen ?? []).join(' ')}`).includes(q)).slice(0, 50) : []),
    [alle, q],
  );
  const titel = gekozen ? heiligeTitel(gekozen.naam) : zelf ? 'Zelf invullen' : 'Heilige toevoegen';
  return (
    <Laag className="em-laag oh-laag" label={titel}>
      <Kop terug="#heiligen" merk slim />
      <div className="oh-papier">
        <h1 className="oh-titel" tabIndex={-1}>{titel}</h1>
        {lijst.length >= MAX_HEILIGEN ? (
          <p className="oh-leeg">{VOL}</p>
        ) : gekozen ? (
          <>
            <p className="oh-uitleg">Gedenkdag: {formatMd(gekozen.md)}</p>
            <VoorWie heilige={gekozen} onKlaar={sluit} />
          </>
        ) : zelf ? (
          <HeiligeFormulier onKlaar={sluit} />
        ) : (
          <>
            <label className="vg-hl-zoek">
              <Search aria-hidden="true" />
              <span className="sr-only">Zoek een heilige</span>
              <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek op naam van een heilige…" autoComplete="off" />
            </label>
            {!alle.length && <p className="oh-leeg">De heiligen worden geladen…</p>}
            {q && alle.length > 0 && !gevonden.length && <p className="oh-leeg">Geen heilige gevonden.</p>}
            <ul className="oh-lijst">
              {gevonden.map((h) => (
                <li key={h.id} className="oh-rij">
                  <button type="button" className="oh-open" onClick={() => setGekozen(h)}>
                    <b>{heiligeTitel(h.naam)}</b>
                    <span>{formatMd(h.md)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="hm-meer oh-zelf" onClick={() => setZelf(true)}>
              Staat je heilige er niet bij? Zelf invullen <ChevronRight aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </Laag>
  );
}

function Bewerken({ id }: { id: string }) {
  const h = useOnzeHeiligen().find((x) => x.id === id);
  if (!h) return null;
  const naam = heiligeTitel(h.heilige);
  return (
    <Laag className="em-laag oh-laag" label={`Bewerken: ${naam}`}>
      <Kop terug="#heiligen" merk slim />
      <div className="oh-papier">
        <h1 className="oh-titel" tabIndex={-1}>{naam}</h1>
        {h.bron && <p className="oh-uitleg">Gedenkdag: {formatMd(h.md)}</p>}
        <HeiligeFormulier h={h} onKlaar={sluit} />
        <button
          type="button"
          className="oh-verwijder"
          onClick={() => {
            if (!window.confirm(`${naam} verwijderen uit onze heiligen?`)) return;
            sluit();
            verwijder(h.id);
          }}
        >
          Verwijderen
        </button>
      </div>
    </Laag>
  );
}

/** De schermen boven de Heiligen-pagina: #heiligen/onze/toevoegen en #heiligen/onze/bewerk/<id>. */
export function OnzeHeiligenLagen({ onderdeel, alle }: { onderdeel: string; alle: Resultaat[] }) {
  if (onderdeel === 'onze/toevoegen') return <Toevoegen alle={alle} />;
  const id = onderdeel.match(/^onze\/bewerk\/(.+)$/)?.[1];
  return id ? <Bewerken id={id} /> : null;
}
```

- [ ] **Step 3: Inhaken op Heiligen en het leesvenster**

`src/components/HeiligePopup.tsx`:
- Import toevoegen: `import { ToevoegenInLeesvenster } from './OnzeHeiligen';`
- Signatuur: `export default function HeiligePopup({ heilige, onClose, toevoegen }: { heilige: Resultaat | null; onClose: () => void; toevoegen?: boolean }) {`
- Direct na het blok

```tsx
        <div className="exact-popup-prose">
          {alineas.map((p, i) => <p key={`${actief.id}-${i}`}>{p}</p>)}
        </div>
```

  invoegen:

```tsx
        {/* Onze heiligen (alleen vanaf de Heiligen-pagina, mobiel) */}
        {toevoegen && actief.type === 'saint' && <ToevoegenInLeesvenster key={actief.id} heilige={actief} />}
```

`src/components/Heiligen.tsx`:
- Imports toevoegen:

```tsx
import { OnzeHeiligenBlok, OnzeHeiligenLagen } from './OnzeHeiligen';
import type { OnzeHeilige } from '../lib/onzeHeiligen';
```

- Na `const vanDag = useMemo(...)` (de heiligen van de gekozen dag) invoegen:

```tsx
  // Onze heiligen: een heilige uit de lijst opent het leesvenster; zelf ingevuld (of niet meer in de bron): bewerken.
  const leesOnze = (h: OnzeHeilige) => {
    const r = h.bron ? alle.find((x) => x.id === h.bron) : undefined;
    if (r) setGeselecteerde(r);
    else window.location.hash = `#heiligen/onze/bewerk/${h.id}`;
  };
```

- In het mobiele overzicht, direct na `{mobiel && !query ? (` en `<>`, vóór `<div className="hm-kop">` met "Heiligen van de dag":

```tsx
                <OnzeHeiligenBlok onLees={leesOnze} />
```

- De regel `<HeiligePopup heilige={geselecteerde} onClose={() => setGeselecteerde(null)} />` wordt:

```tsx
      {mobiel && <OnzeHeiligenLagen onderdeel={onderdeel} alle={alle} />}
      <HeiligePopup heilige={geselecteerde} onClose={() => setGeselecteerde(null)} toevoegen={mobiel} />
```

- [ ] **Step 4: Opmaak**

Achteraan `src/components/heiligen-mobiel.css`:

```css
/* Onze heiligen (OnzeHeiligen.tsx): het blok bovenaan, toevoegen en bewerken; rijen, velden en knoppen in de stijl van
   de rest van Heiligen (perkament, goudbruine lijnen) */
.oh { margin-bottom: 18px; }
.oh-lijst { margin: 0 0 8px; padding: 0; list-style: none; border-top: 1px solid rgba(172, 121, 47, .4); }
.oh-rij { display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(172, 121, 47, .4); }
#top#top#top#top#top#top#top#top#top .oh-open { display: flex; flex: 1; flex-direction: column; align-items: flex-start; gap: 2px; min-height: 56px; margin: 0; padding: 8px 4px 8px 12px; border: 0; border-radius: 0; background: none; box-shadow: none; color: var(--inkt) !important; text-align: left; -webkit-tap-highlight-color: transparent; }
.oh-open:active { background: rgba(90, 60, 25, .07); }
.oh-open b { font-family: var(--font-lees); font-size: 18px; font-weight: 500; }
.oh-open span { font-family: var(--font-lees); font-size: 15px; color: #5d4630; }
#top#top#top#top#top#top#top#top#top .oh-bewerk { flex: none; display: inline-flex; align-items: center; min-height: 44px; padding: 0 12px; font-family: var(--font-lees); font-size: 15px; color: #7d5218 !important; text-decoration: underline; text-underline-offset: 3px; }
.oh-leeg { margin: 0 4px 10px; font-family: var(--font-lees); font-size: 16px; line-height: 1.45; color: #5d4630; }
.oh-laag { background: var(--papyrus, #f5e6c8) url('/images/vandaag/papyrus-licht.webp') center top / 100% auto; }
.oh-papier { padding: 8px 14px 36px; text-align: left; }
#top#top#top#top#top#top#top#top#top .oh-titel { margin: 6px 0 4px; font-family: var(--font-lees) !important; font-size: 28px; font-weight: 400 !important; letter-spacing: normal; text-align: center; text-transform: none; color: var(--inkt); }
.oh-titel:focus { outline: none; }
.oh-uitleg { margin: 0 0 12px; font-family: var(--font-lees); font-size: 16px; text-align: center; color: #5d4630; }
.oh-form { display: grid; gap: 14px; margin-top: 8px; }
.oh-veld { display: grid; gap: 4px; font-family: var(--font-lees); font-size: 15px; color: #5d4630; }
.oh-veld input, .oh-datum select { min-height: 48px; padding: 0 12px; border: 1px solid #b99455; border-radius: 6px; background: rgba(255, 250, 238, .8); font-family: var(--font-lees); font-size: 18px; color: #2b1d12; }
.oh-datum { display: grid; grid-template-columns: 1fr 2fr; gap: 8px; margin: 0; padding: 0; border: 0; }
.oh-datum legend { margin-bottom: 4px; font-family: var(--font-lees); font-size: 15px; color: #5d4630; }
.oh-datum select { width: 100%; }
.oh-fout { margin: 0; font-family: var(--font-lees); font-size: 15px; color: #8a2a1a; }
/* Ook in het leesvenster (buiten #top als dat in een eigen laag staat): daarom zonder en met voorvoegsel */
.oh-knop, #top#top#top#top#top#top#top#top#top .oh-knop { min-height: 52px; padding: 0 20px; border: 1px solid #b99455; border-radius: 6px; background: #ead3a6 url('/images/vandaag/papyrus-licht.webp') center / cover; font-family: var(--font-lees); font-size: 18px; color: #2b1d12; }
#top#top#top#top#top#top#top#top#top .oh-verwijder { display: block; min-height: 44px; margin: 22px auto 0; padding: 0 12px; border: 0; background: none; font-family: var(--font-lees); font-size: 16px; color: #8a2a1a; text-decoration: underline; text-underline-offset: 3px; }
#top#top#top#top#top#top#top#top#top :is(.oh, .oh-laag) :is(a, button, input, select):focus-visible { outline: 3px solid #7d5218; outline-offset: 2px; }
.oh-popup { margin-top: 18px; }
```

- [ ] **Step 5: Bouwen en controleren**

Run: `npm run build && npm run lint && npm run check:onzeheiligen && npm run check:herinneringen`
Expected: alles slaagt, geen typefouten.

- [ ] **Step 6: Verifiëren in de preview** (mobiel, `#heiligen`)

1. Leeg blok "Onze heiligen" met uitleg en "Heilige toevoegen".
2. "Heilige toevoegen" → zoek "Sofia" → kies → "Voor wie?" Sofia → Toevoegen: terug op `#heiligen`, rij "H. Sofia … · Sofia · 17 september"; Terug (Kop) gaat naar `#meer`, niet naar het formulier.
3. Leesvenster van een heilige van vandaag → "Toevoegen aan onze heiligen" → voor wie → "Toegevoegd"; sluiten; de rij staat bovenaan met "Vandaag".
4. "Zelf invullen" met 30 februari → foutmelding; met een geldige dag → rij; tik op de rij opent Bewerken (geen leesvenster).
5. Bewerken: voor wie aanpassen, opslaan; verwijderen (bevestigen) → rij weg, terug op `#heiligen`.
6. `localStorage.onzeHeiligen` en `JSON.parse(localStorage.herinneringen).naamdagLijst` bevatten dezelfde heiligen.
7. Escape in Toevoegen en Bewerken sluit de laag.

- [ ] **Step 7: Commit**

```bash
git add src/lib/onzeHeiligenOpslag.ts src/components/OnzeHeiligen.tsx src/components/Heiligen.tsx src/components/HeiligePopup.tsx src/components/heiligen-mobiel.css
git commit -m "Heiligen: Onze heiligen bovenaan, toevoegen (zoeken of zelf invullen), bewerken en toevoegen vanuit het leesvenster"
```

---

### Task 4: Naamdag op Vandaag en de schakelaar bij Herinneringen

**Files:**
- Modify: `src/components/Vandaag.tsx` (naamdagen berekenen, meegeven aan de kaart)
- Modify: `src/components/VandaagMobiel.tsx` (regel in de kaart Feesten & heiligen)
- Modify: `src/components/vandaag-mobiel.css`
- Modify: `src/components/InstellingenMobiel.tsx` (schakelaar Naamdagen, moment, samenvatting)

**Interfaces:**
- Consumes: `naamdagenOp` (Task 1), `useOnzeHeiligen` (Task 3), `naamdagen`/`naamdagLijst` in `Herinneringen` (Task 2).
- Produces: `feest.naamdagen?: string[]` in `VandaagMobielProps`.

- [ ] **Step 1: Vandaag**

`src/components/Vandaag.tsx`:
- Imports toevoegen:

```tsx
import { naamdagenOp } from '../lib/onzeHeiligen';
import { useOnzeHeiligen } from '../lib/onzeHeiligenOpslag';
```

- Direct na `const feest = useMemo(() => feestVoorDag(vandaag, mode), [vandaag, mode]);`:

```tsx
  // Onze heiligen: "Naamdag van Sofia" in de kaart Feesten & heiligen (zonder voor wie: de naam van de heilige)
  const onze = useOnzeHeiligen();
  const naamdagen = useMemo(
    () => naamdagenOp(onze, vandaag, mode).map((n) => (n.voor ? `Naamdag van ${n.voor}` : `Naamdag: ${heiligeTitel(n.heilige)}`)),
    [onze, vandaag, mode],
  );
```

- De prop `feest={ hoofdFeest ? {...} : {...} }` wordt:

```tsx
      feest={{
        ...(hoofdFeest
          ? { label: 'Feesten & heiligen', naam: hoofdFeest.naam, meer: 0, open: () => openDag(dag.ymd) }
          : { label: 'Feesten & heiligen', naam: heiligenRegel, meer: heilige ? aantalHeiligen - 1 : 0, open: () => openDagHeiligen(dag.ymd) }),
        naamdagen,
      }}
```

`src/components/VandaagMobiel.tsx`:
- In `VandaagMobielProps`: `feest: { label: string; naam: string; meer: number; open: () => void; naamdagen?: string[] };`
- In de kaart Feesten & heiligen, direct vóór `<h2 className="vm2-label">{feest.label}</h2>`:

```tsx
            {feest.naamdagen?.map((t) => <span key={t} className="vm2-naamdag">{t}</span>)}
```

Achteraan `src/components/vandaag-mobiel.css`:

```css
/* Onze heiligen: op een naamdag een regel bovenaan de kaart Feesten & heiligen */
#top#top#top#top#top#top#top#top#top .vm2 .vm2-naamdag { display: block; margin-bottom: 2px; font-family: var(--font-lees); font-size: 14px; font-style: italic; line-height: 1.25; color: #7d5218; }
```

- [ ] **Step 2: Herinneringen**

`src/components/InstellingenMobiel.tsx`:
- Direct na het afsluitende `)}` van het blok `{h.feesten && ( … )}` (na de Keuzes "Wanneer bij een feest"):

```tsx
      <h2 className="ism-label">Naamdagen</h2>
      <ul className="ism-lijst">
        <Schakel
          titel="Herinner mij aan naamdagen"
          onder={h.naamdagLijst.length ? `Van onze heiligen (${h.naamdagLijst.length})` : 'Voeg eerst heiligen toe bij Heiligen → Onze heiligen'}
          aan={h.naamdagen}
          uit={uit}
          onWissel={() => void zet({ naamdagen: !h.naamdagen }, !h.naamdagen)}
        />
      </ul>
      {h.naamdagen && !h.feesten && (
        <>
          <p className="ism-veldlabel ism-sublabel">Wanneer</p>
          <Keuzes label="Wanneer bij een naamdag" keuzes={FEEST_MOMENT} waarde={h.feestMoment} uit={uit} onKies={(id) => void zet({ feestMoment: id })} />
        </>
      )}
```

- De samenvatting wordt:

```tsx
  const actief = [h.uren.length > 0 && 'Gebedsuren', h.vasten && 'Vastendagen', h.feesten && 'Feesten', h.naamdagen && 'Naamdagen'].filter(Boolean).join(' · ');
```

- [ ] **Step 3: Bouwen en alle controles**

Run: `npm run build && npm run lint && npm run check:onzeheiligen && npm run check:herinneringen && npm run check:pushserver && npm run check:gebedsweg && npm run check:psalmen && npm run check:heiligen && npm run check:zoeken`
Expected: alles slaagt.

- [ ] **Step 4: Verifiëren in de preview** (mobiel)

1. Voeg een heilige van vandaag toe voor "Sofia" → `#vandaag`: de kaart Feesten & heiligen toont "Naamdag van Sofia"; zonder voor wie "Naamdag: H. …".
2. Een heilige van een andere dag: geen regel.
3. `#instellingen/herinneringen`: schakelaar Naamdagen met "Van onze heiligen (1)"; met feesten uit verschijnt "Wanneer"; de samenvatting op Instellingen noemt "Naamdagen".
4. "Stuur een proefmelding" werkt nog.

- [ ] **Step 5: Commit**

```bash
git add src/components/Vandaag.tsx src/components/VandaagMobiel.tsx src/components/vandaag-mobiel.css src/components/InstellingenMobiel.tsx
git commit -m "Onze heiligen: naamdag op Vandaag en de herinnering Naamdagen"
```

---

Na afronding: de pushserver opnieuw uitrollen (nieuwe velden en de grens van 16 KB).
