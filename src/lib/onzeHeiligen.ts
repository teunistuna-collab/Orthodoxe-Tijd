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
