import { BEWEEGLIJKE_FEESTEN, VASTE_FEESTEN, type Feest } from './feesten';
import { berekenVasten, type VastenRegel } from './vasten';

export type Mode = 'nieuw' | 'oud';

/* ---------- Juliaanse kalender ----------
   Omrekening via het Juliaanse dagnummer, zodat het verschil met de Gregoriaanse kalender voor elke eeuw klopt
   (13 dagen in 1900–2099, 14 vanaf maart 2100, enzovoort). Een Juliaanse datum wordt, zoals overal in de site, als
   UTC-datum met de Juliaanse jaar-, maand- en dagwaarden doorgegeven. */
const DAG_1970 = 2440588; // Juliaans dagnummer van 1 januari 1970
const gregoriaansNaarJd = (y: number, m: number, d: number) => {
  const a = Math.floor((14 - m) / 12), j = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * j + Math.floor(j / 4) - Math.floor(j / 100) + Math.floor(j / 400) - 32045;
};
const juliaansNaarJd = (y: number, m: number, d: number) => {
  const a = Math.floor((14 - m) / 12), j = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * j + Math.floor(j / 4) - 32083;
};
const jdNaarDatum = (jd: number) => new Date(Date.UTC(1970, 0, 1) + (jd - DAG_1970) * 864e5);
const jdNaarJuliaans = (jd: number): [number, number, number] => {
  const c = jd + 32082, d = Math.floor((4 * c + 3) / 1461), e = c - Math.floor((1461 * d) / 4), m = Math.floor((5 * e + 2) / 153);
  return [d - 4800 + Math.floor(m / 10), m + 3 - 12 * Math.floor(m / 10), e - Math.floor((153 * m + 2) / 5) + 1];
};
/** De burgerlijke (Gregoriaanse) datum van een Juliaanse datum. */
export function juliaansNaarCivil(jaar: number, maand: number, dag: number): Date {
  return jdNaarDatum(juliaansNaarJd(jaar, maand, dag));
}
/** De Juliaanse datum van een burgerlijke datum (jaar, maand en dag als UTC-datum).
 *  ponytail: 29 februari van een eeuwjaar als 2100 bestaat Juliaans wel, Gregoriaans niet; die ene dag schuift naar 1 maart. */
export function civilNaarJuliaans(civil: Date): Date {
  const [y, m, d] = jdNaarJuliaans(gregoriaansNaarJd(civil.getUTCFullYear(), civil.getUTCMonth() + 1, civil.getUTCDate()));
  return new Date(Date.UTC(y, m - 1, d));
}

export const MAANDEN = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
];
export const MAANDEN_KORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
export const WEEKDAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
export const WEEKDAGEN_KORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

const pad = (n: number) => String(n).padStart(2, '0');

export function utc(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d.getTime());
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

export function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return utc(y, m, d);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 864e5);
}

/** Vandaag (lokale datum) als UTC-middernacht. */
export function vandaag(): Date {
  const n = new Date();
  return utc(n.getFullYear(), n.getMonth() + 1, n.getDate());
}

export function mdKey(d: Date): string {
  return `${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

/** Kerkelijke datum: bij de oude kalender de Juliaanse datum (13 dagen achter in 1900–2099), anders de burgerlijke. */
export function kerkDatum(civil: Date, mode: Mode): Date {
  return mode === 'oud' ? civilNaarJuliaans(civil) : civil;
}

/** Juliaanse datum als sleutel ("M-D") voor het menologion van holytrinityorthodox.com. */
export function julianKey(civil: Date): string {
  return mdKey(civilNaarJuliaans(civil));
}

/** Burgerlijke datum van een vaste kerkelijke datum (maand-dag) in een gegeven burgerlijk jaar. */
export function civilVanKerkdatum(md: string, jaar: number, mode: Mode): Date {
  const [m, d] = md.split('-').map(Number);
  return mode === 'oud' ? juliaansNaarCivil(jaar, m, d) : utc(jaar, m, d);
}

/** Eerstvolgende burgerlijke datum (vandaag of later) van een vaste kerkelijke datum. */
export function volgendeCivil(md: string, vanaf: Date, mode: Mode): Date {
  const y = vanaf.getUTCFullYear();
  for (const yy of [y - 1, y, y + 1]) {
    const c = civilVanKerkdatum(md, yy, mode);
    if (c.getTime() >= vanaf.getTime()) return c;
  }
  return civilVanKerkdatum(md, y + 1, mode);
}

/** Orthodox Pascha (Meeus' Juliaanse algoritme), teruggegeven als burgerlijke (Gregoriaanse) datum, voor elke eeuw. */
export function orthodoxPascha(jaar: number): Date {
  const a = jaar % 4;
  const b = jaar % 7;
  const c = jaar % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const maand = Math.floor((d + e + 114) / 31);
  const dag = ((d + e + 114) % 31) + 1;
  return juliaansNaarCivil(jaar, maand, dag);
}

/** Westers Pasen (Gregoriaans, Meeus/Jones/Butcher). */
export function westersPasen(jaar: number): Date {
  const a = jaar % 19;
  const b = Math.floor(jaar / 100);
  const c = jaar % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const maand = Math.floor((h + l - 7 * m + 114) / 31);
  const dag = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(jaar, maand, dag);
}

/* ---------- Opmaak ---------- */

export function formatLang(d: Date): string {
  return `${WEEKDAGEN[d.getUTCDay()]} ${d.getUTCDate()} ${MAANDEN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
export function formatDatum(d: Date): string {
  return `${d.getUTCDate()} ${MAANDEN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
export function formatDag(d: Date): string {
  return `${d.getUTCDate()} ${MAANDEN[d.getUTCMonth()]}`;
}
export function formatKort(d: Date): string {
  return `${d.getUTCDate()} ${MAANDEN_KORT[d.getUTCMonth()]}`;
}
/** "15 mrt – 23 apr", of één datum voor een periode van één dag. */
export const kortBereik = (a: Date, b: Date) => (a.getTime() === b.getTime() ? formatKort(a) : `${formatKort(a)} – ${formatKort(b)}`);
/** "23 februari – 11 april", "6 – 11 april", of één datum. */
export function bereikLang(a: Date, b: Date): string {
  if (a.getTime() === b.getTime()) return formatDag(a);
  return `${a.getUTCMonth() === b.getUTCMonth() ? a.getUTCDate() : formatDag(a)} – ${formatDag(b)}`;
}
export function formatMd(md: string): string {
  const [m, d] = md.split('-').map(Number);
  return `${d} ${MAANDEN[m - 1]}`;
}
export function ordinaal(n: number): string {
  return `${n}e`;
}
export function hoofdletter(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---------- Seizoen & toon ---------- */

function weekNaPinksteren(offset: number, isZondag: boolean): string {
  if (isZondag) {
    const n = Math.round((offset - 49) / 7);
    return `${ordinaal(n)} zondag na Pinksteren`;
  }
  const n = Math.ceil((offset - 49) / 7);
  return `${ordinaal(n)} week na Pinksteren`;
}

export function bepaalSeizoen(offset: number, prevOffset: number, weekdag: number): string {
  const isZondag = weekdag === 0;
  if (offset < -70) return weekNaPinksteren(prevOffset, isZondag);
  if (offset <= -64) return offset === -70 ? 'Zondag van de Tollenaar en de Farizeeër · begin Triodion' : 'Triodion · week van de Tollenaar en de Farizeeër (vastenvrij)';
  if (offset <= -57) return offset === -63 ? 'Zondag van de Verloren Zoon' : 'Triodion · week van de Verloren Zoon';
  if (offset <= -50) return offset === -56 ? 'Zondag van het Laatste Oordeel (Vleesderving)' : 'Triodion · Kaasweek (Boterweek)';
  if (offset === -49) return 'Vergevingszondag (Kaasderving)';
  if (offset <= -8) {
    const week = Math.floor((offset + 48) / 7) + 1;
    return `Grote Vasten · ${ordinaal(week)} week`;
  }
  if (offset === -7) return 'Palmzondag · Intocht in Jeruzalem';
  if (offset < 0) return 'Grote en Heilige Week';
  if (offset === 0) return 'Heilig Pascha';
  if (offset <= 6) return 'Lichte Week';
  if (offset <= 48) {
    const week = Math.floor(offset / 7) + 1;
    return `Paastijd · ${ordinaal(week)} week na Pascha`;
  }
  if (offset === 49) return 'Pinksteren · Heilige Drie-eenheid';
  if (offset <= 55) return 'Week van de Heilige Geest (vastenvrij)';
  return weekNaPinksteren(offset, isZondag);
}

/** Toon (glas) van de week volgens de Oktoïch: begint met toon 1 op Thomaszondag. */
export function bepaalToon(civil: Date): number | null {
  const jaar = civil.getUTCFullYear();
  let p = orthodoxPascha(jaar);
  let off = daysBetween(p, civil);
  if (off >= -7 && off <= 6) return null; // Heilige Week & Lichte Week: geen vaste toon
  if (off < 7) {
    p = orthodoxPascha(jaar - 1);
    off = daysBetween(p, civil);
  }
  return (((Math.floor((off - 7) / 7) % 8) + 8) % 8) + 1;
}

/* ---------- Daginformatie ---------- */

export interface DagInfo {
  civil: Date;
  ymd: string;
  jaar: number;
  maand: number;
  dag: number;
  weekdag: number;
  weekdagNaam: string;
  isZondag: boolean;
  isVandaag: boolean;
  kerk: Date;
  kerkKey: string;
  julianKey: string;
  pascha: Date;
  offset: number;
  feesten: Feest[];
  vasten: VastenRegel;
  seizoen: string;
  toon: number | null;
}

const RANG_ORDER = (f: Feest) => (f.soort === 'pascha' ? 0 : f.groot ? 1 : f.soort === 'beweeglijk' ? 2 : 3);

export function dagInfo(civil: Date, mode: Mode, vandaagYmd?: string): DagInfo {
  const jaar = civil.getUTCFullYear();
  const pascha = orthodoxPascha(jaar);
  const offset = daysBetween(pascha, civil);
  const prevOffset = daysBetween(orthodoxPascha(jaar - 1), civil);
  const kerk = kerkDatum(civil, mode);
  const kerkKey = mdKey(kerk);
  const weekdag = civil.getUTCDay();

  const feesten: Feest[] = [
    ...VASTE_FEESTEN.filter((f) => f.md === kerkKey),
    ...BEWEEGLIJKE_FEESTEN.filter((f) => f.offset === offset),
  ].sort((a, b) => RANG_ORDER(a) - RANG_ORDER(b) || (b.rang ?? 0) - (a.rang ?? 0));

  const vasten = berekenVasten({ kerk, offset, weekdag, feesten });

  return {
    civil,
    ymd: ymd(civil),
    jaar,
    maand: civil.getUTCMonth() + 1,
    dag: civil.getUTCDate(),
    weekdag,
    weekdagNaam: WEEKDAGEN[weekdag],
    isZondag: weekdag === 0,
    isVandaag: vandaagYmd ? ymd(civil) === vandaagYmd : false,
    kerk,
    kerkKey,
    julianKey: julianKey(civil),
    pascha,
    offset,
    feesten,
    vasten,
    seizoen: bepaalSeizoen(offset, prevOffset, weekdag),
    toon: bepaalToon(civil),
  };
}

/** Alle dagen van een burgerlijke maand. */
export function maandDagen(jaar: number, maand: number, mode: Mode, vandaagYmd: string): DagInfo[] {
  const eerste = utc(jaar, maand, 1);
  const out: DagInfo[] = [];
  let d = eerste;
  while (d.getUTCMonth() + 1 === maand) {
    out.push(dagInfo(d, mode, vandaagYmd));
    d = addDays(d, 1);
  }
  return out;
}

/** Zes weken rooster (ma–zo) rond een maand. */
export function maandRooster(jaar: number, maand: number, mode: Mode, vandaagYmd: string): DagInfo[] {
  const eerste = utc(jaar, maand, 1);
  const startOffset = (eerste.getUTCDay() + 6) % 7; // maandag = 0
  const start = addDays(eerste, -startOffset);
  const out: DagInfo[] = [];
  for (let i = 0; i < 42; i++) out.push(dagInfo(addDays(start, i), mode, vandaagYmd));
  return out;
}

/** Week (ma–zo) waarin een datum valt. */
export function weekRond(d: Date, mode: Mode, vandaagYmd: string): DagInfo[] {
  const startOffset = (d.getUTCDay() + 6) % 7;
  const start = addDays(d, -startOffset);
  return Array.from({ length: 7 }, (_, i) => dagInfo(addDays(start, i), mode, vandaagYmd));
}

/** Eerstvolgende Pascha vanaf een datum. */
export function volgendePascha(vanaf: Date): Date {
  const y = vanaf.getUTCFullYear();
  const p = orthodoxPascha(y);
  return p.getTime() >= vanaf.getTime() ? p : orthodoxPascha(y + 1);
}
