import { dienstVanHetUur, serviceConfig } from './etmaal';

// Centrale psalmendata voor Psalmen, en later Vandaag, Etmaal, het zoeken, favorieten en de app.
// Nummering: Septuagint (primair). Er wordt niets omgerekend of aangevuld zonder gecontroleerde bron.

export interface PsalmGebruik {
  /** Dienst uit het etmaal (lib/etmaal.ts), bijvoorbeeld "Vespers". */
  dienst: string;
  tijd: string;
  /** Deel van de dienst, bijvoorbeeld "Hexapsalm" in de Metten. */
  onderdeel?: string;
}

export interface Psalm {
  id: string;
  septuagintNumber: number;
  /** Alleen waar de bron het vermeldt (kopregel "Psalm 24 (25)" van de aangeleverde tekst). */
  masoreticNumber?: number;
  title: string;
  /** Nog geen gecontroleerde ondertitels: leeg laten tot ze zijn aangeleverd. */
  subtitle?: string;
  /** Er is een aangeleverde Nederlandse Septuagint-tekst (public/data/psalmen.json). */
  hasText: boolean;
  /** Thema's uit THEMAS (aangeleverd door de redactie), eventueel met versbereik: "Lofzangen (vers 1–7)". */
  themes: string[];
  liturgicalUses: PsalmGebruik[];
  /** Aangeleverde opname (bijvoorbeeld /audio/psalmen/psalm-050.mp3). Zonder bestand: geen audioknop. */
  audioSrc?: string;
  /** Podcastaflevering op Spotify (extern; opent in een nieuw venster). */
  spotify?: string;
}

/**
 * Gecontroleerde gegevens per psalm, alleen invullen met aangeleverd materiaal:
 * - tekst: er is een Septuagint-tekst in public/data/psalmen.json (gemaakt met scripts/psalmen-uit-pdf.mjs);
 * - mt: Hebreeuws nummer uit de kopregel van de bron-PDF (Psalm 118 vermeldt er geen);
 * - audio: pad naar een aangeleverde opname in public/, bijvoorbeeld '/audio/psalmen/psalm-050.mp3';
 * - spotify: aflevering van de podcast "Psalmen van de Vroege Kerk" (NBG) over deze psalm, aangeleverd door de redactie.
 * scripts/psalmen.check.ts controleert dit tegen psalmen.json en of de audiobestanden echt bestaan.
 */
const SPOTIFY = 'https://open.spotify.com/episode/';
export const PSALM_BRONNEN: Record<number, { tekst?: true; mt?: number; audio?: string; spotify?: string }> = {
  24: { tekst: true, mt: 25, spotify: SPOTIFY + '0NKuEgEoj22Zh19LJezfgo' },
  50: { tekst: true, mt: 51, spotify: SPOTIFY + '4KurhPj7vA2GyMIz2fz077' },
  62: { tekst: true, mt: 63, spotify: SPOTIFY + '5tq6vbtT4hJEyVW4z3Nu4D' },
  84: { tekst: true, mt: 85, spotify: SPOTIFY + '4DShQW0DArd2zNMJ18gypx' },
  89: { tekst: true, mt: 90, spotify: SPOTIFY + '4FgFvTxwWpFrED5Mh6Liud' },
  90: { tekst: true, mt: 91, spotify: SPOTIFY + '5YMsHG3SUGN8Y7FrCDvdxo' },
  102: { tekst: true, mt: 103 },
  103: { tekst: true, mt: 104, spotify: SPOTIFY + '14xz55Rz248tCs0V2kK6zY' },
  118: { tekst: true, spotify: SPOTIFY + '3XVIwDOok000qHWsBRik2W' },
  140: { tekst: true, mt: 141 },
};

/**
 * Psalmen per dienst van het etmaal, zoals aangeleverd door de redactie. Sleutels = diensten in lib/etmaal.ts;
 * die lijst zelf blijft ongewijzigd (de Etmaal-pagina toont daar alleen de psalmen met een PDF).
 */
const ETMAAL_PSALMEN: Record<string, { onderdeel?: string; psalmen: number[] }[]> = {
  Vespers: [{ psalmen: [103, 140, 141, 129, 116] }],
  Completen: [{ psalmen: [50, 69, 142] }],
  Middernachtdienst: [{ psalmen: [50, 118] }],
  Metten: [
    { onderdeel: 'Koninklijk officie', psalmen: [19, 20] },
    { onderdeel: 'Hexapsalm', psalmen: [3, 37, 62, 87, 102, 142] },
    { onderdeel: 'Polyeleos · alleen op zon- en feestdagen', psalmen: [134, 135] },
    { onderdeel: 'Lofpsalmen', psalmen: [148, 149, 150] },
  ],
  'Eerste Uur': [{ psalmen: [5, 89, 100] }],
  'Derde Uur': [{ psalmen: [16, 24, 50] }],
  'Zesde Uur': [{ psalmen: [53, 54, 90] }],
  'Negende Uur': [{ psalmen: [83, 84, 85] }],
};

/** Psalmen per dienst, in de volgorde van het etmaal (Vespers eerst): voor de Etmaal-weergave. */
export const ETMAAL_GROEPEN = serviceConfig.map((d) => ({ dienst: d.title, tijd: d.time, delen: ETMAAL_PSALMEN[d.title] ?? [] }));

const GEBRUIK = new Map<number, PsalmGebruik[]>();
for (const { dienst, tijd, delen } of ETMAAL_GROEPEN) {
  for (const { onderdeel, psalmen } of delen) {
    for (const n of psalmen) GEBRUIK.set(n, [...(GEBRUIK.get(n) ?? []), { dienst, tijd, ...(onderdeel ? { onderdeel } : {}) }]);
  }
}

/* ---------- Kathismata ---------- */

/** Eén stuk van een kathismadeel: een hele psalm, of een versbereik daarvan (alleen Psalm 118 in kathisma 17). */
export interface KathismaStuk {
  /** Septuagint-nummer, gelijk aan PSALMEN[psalm - 1].septuagintNumber. */
  psalm: number;
  vanVers?: number;
  totVers?: number;
}
export interface Kathisma {
  nr: number;
  /** Altijd drie delen (stases), in leesvolgorde. */
  delen: KathismaStuk[][];
  /** Eerste en laatste psalm van het kathisma. */
  van: number;
  tot: number;
  noot?: string;
}
/** Een stuk met zijn deelnummer (1–3): de leesvolgorde binnen één kathisma. */
export interface KathismaStap extends KathismaStuk {
  deel: number;
}

/**
 * De indeling van het psalter in twintig kathismata van elk drie delen, Septuagint-nummering. Bron: OCA, "The Division of
 * the Psalter into Kathismas" (https://www.oca.org/liturgics/outlines/the-division-of-the-psalter-into-kathismas).
 * Per deel [eerste psalm, laatste psalm]; kathisma 17 is Psalm 118, verdeeld over drie versbereiken.
 * scripts/psalmen.check.ts controleert dat alle 150 psalmen precies één keer voorkomen.
 */
const KATHISMA_DELEN: [number, number][][] = [
  [[1, 3], [4, 6], [7, 8]],
  [[9, 10], [11, 13], [14, 16]],
  [[17, 17], [18, 20], [21, 23]],
  [[24, 26], [27, 29], [30, 31]],
  [[32, 33], [34, 35], [36, 36]],
  [[37, 39], [40, 42], [43, 45]],
  [[46, 48], [49, 50], [51, 54]],
  [[55, 57], [58, 60], [61, 63]],
  [[64, 66], [67, 67], [68, 69]],
  [[70, 71], [72, 73], [74, 76]],
  [[77, 77], [78, 80], [81, 84]],
  [[85, 87], [88, 88], [89, 90]],
  [[91, 93], [94, 96], [97, 100]],
  [[101, 102], [103, 103], [104, 104]],
  [[105, 105], [106, 106], [107, 108]],
  [[109, 111], [112, 114], [115, 117]],
  [[118, 118], [118, 118], [118, 118]], // verzen: PSALM_118_DELEN
  [[119, 123], [124, 128], [129, 133]],
  [[134, 136], [137, 139], [140, 142]],
  [[143, 144], [145, 147], [148, 150]],
];
const PSALM_118_DELEN: [number, number][] = [[1, 72], [73, 131], [132, 176]];
// Toelichtingen zoals aangeleverd door de redactie.
const KATHISMA_NOTEN: Record<number, string> = { 17: 'De langste psalm, de Wet/Grafpsalm', 18: 'De bedevaartsliederen' };

export const KATHISMATA: Kathisma[] = KATHISMA_DELEN.map((delen, i) => {
  const nr = i + 1;
  const stukken =
    nr === 17
      ? PSALM_118_DELEN.map(([vanVers, totVers]) => [{ psalm: 118, vanVers, totVers }])
      : delen.map(([a, b]) => Array.from({ length: b - a + 1 }, (_, j) => ({ psalm: a + j })));
  return { nr, delen: stukken, van: delen[0][0], tot: delen[2][1], ...(KATHISMA_NOTEN[nr] ? { noot: KATHISMA_NOTEN[nr] } : {}) };
});

/** Alle stukken van een kathisma in leesvolgorde, met hun deelnummer. */
export const kathismaStappen = (k: Kathisma): KathismaStap[] => k.delen.flatMap((d, i) => d.map((s) => ({ ...s, deel: i + 1 })));

/** "Psalmen 1–8" of "Psalm 118" */
export const psalmBereik = (van: number, tot: number) => (van === tot ? `Psalm ${van}` : `Psalmen ${van}–${tot}`);

/** Thema's van het psalter, zoals aangeleverd door de redactie; verzen alleen waar een psalm maar voor een deel meetelt. */
export const THEMAS: { naam: string; psalmen: number[]; verzen?: Record<number, string> }[] = [
  { naam: 'Smeekgebeden', psalmen: [3, 4, 5, 7, 12, 16, 24, 25, 27, 30, 34, 42, 53, 54, 55, 56, 58, 60, 63, 69, 70, 85, 140, 141, 142] },
  { naam: 'Lofzangen', psalmen: [8, 18, 28, 32, 46, 92, 94, 95, 96, 97, 98, 102, 103, 104, 112, 116, 134, 135, 144, 145, 146, 147, 148, 149, 150], verzen: { 18: '1–7' } },
  { naam: 'Klaagliederen', psalmen: [6, 37, 43, 50, 59, 73, 78, 79, 82, 87, 88, 101, 129, 136] },
  { naam: 'Histories', psalmen: [77, 105, 113] },
  { naam: 'Profetisch', psalmen: [2, 21, 44, 49, 71, 81, 109] },
  { naam: 'Wijsheid', psalmen: [1, 13, 33, 36, 48, 52, 72, 111] },
  { naam: 'Dankliederen', psalmen: [9, 29, 31, 39, 64, 65, 114, 115, 117, 123, 137] },
  { naam: 'Pelgrimsliederen', psalmen: [119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133] },
  { naam: 'Wet', psalmen: [18, 118], verzen: { 18: '8–15' } },
];

export const PSALMEN: Psalm[] = Array.from({ length: 150 }, (_, i) => {
  const n = i + 1;
  const bron = PSALM_BRONNEN[n] ?? {};
  return {
    id: `psalm-${n}`,
    septuagintNumber: n,
    ...(bron.mt ? { masoreticNumber: bron.mt } : {}),
    title: `Psalm ${n}`,
    hasText: !!bron.tekst,
    themes: THEMAS.filter((t) => t.psalmen.includes(n)).map((t) => (t.verzen?.[n] ? `${t.naam} (vers ${t.verzen[n]})` : t.naam)),
    liturgicalUses: GEBRUIK.get(n) ?? [],
    ...(bron.audio ? { audioSrc: bron.audio } : {}),
    ...(bron.spotify ? { spotify: bron.spotify } : {}),
  };
});

/** Psalm van de dienst die nu aan de beurt is (dienst met het laatste begintijdstip vóór of op dit uur). */
export function psalmVanHetUur(nu: Date): number {
  return Number(dienstVanHetUur(nu).psalms[0].title.replace(/^Psalm /, ''));
}

/* ---------- Teksten (apart geladen, ±40 KB) ---------- */

export interface PsalmBlok {
  /** Versnummer zoals in de bron; het opschrift en soms vers 1 hebben in de bron geen nummer. */
  n?: number;
  /** Tussenkop, zoals "tweede stasis" in Psalm 118. */
  kop?: string;
  regels: string[];
  /** Het begin van de psalm (na het weggelaten opschrift): hier staat de grote initiaal. */
  begin?: boolean;
}
export interface PsalmTekst {
  lxx: number;
  mt?: number;
  bron: string;
  verzen: PsalmBlok[];
}
export type PsalmTeksten = Record<string, PsalmTekst>;

/** Opschriften worden niet hardop gelezen en blijven weg (zoals de uitgave ze in het rood zet): per psalm het aantal
 *  regels aan het begin van het eerste blok (en eventueel verzen die geheel tot het opschrift horen). Met de hand
 *  nagekeken voor de aangeleverde psalmen; een nieuwe psalm hier toevoegen. Psalm 50:2 en "Alleluja." (Psalm 118)
 *  blijven staan. Tekst en nummering blijven verder gelijk. */
const OPSCHRIFT: Record<string, { regels: number; verzen?: number[] }> = {
  24: { regels: 1 }, 50: { regels: 1 }, 62: { regels: 1 }, 84: { regels: 1 }, 89: { regels: 1 },
  90: { regels: 1 }, 102: { regels: 1 }, 103: { regels: 1 }, 140: { regels: 1 },
};
function zonderOpschrift(nr: string, t: PsalmTekst): PsalmTekst {
  const o = OPSCHRIFT[nr];
  const verzen = t.verzen
    .map((v, i) => (o && i === 0 && !v.n ? { ...v, regels: v.regels.slice(o.regels) } : v))
    .filter((v) => v.kop || (v.regels.length > 0 && !(v.n && o?.verzen?.includes(v.n))));
  const eerste = verzen.findIndex((v) => !v.kop);
  if (eerste >= 0) verzen[eerste] = { ...verzen[eerste], begin: true };
  return { ...t, verzen };
}

let tekstenLaden: Promise<PsalmTeksten> | null = null;
export function laadPsalmTeksten(): Promise<PsalmTeksten> {
  tekstenLaden ??= fetch('/data/psalmen.json')
    .then((r) => {
      if (!r.ok) throw new Error('psalmen.json ontbreekt');
      return r.json() as Promise<PsalmTeksten>;
    })
    .then((teksten) => Object.fromEntries(Object.entries(teksten).map(([nr, t]) => [nr, zonderOpschrift(nr, t)])))
    .catch((fout) => {
      tekstenLaden = null;
      throw fout;
    });
  return tekstenLaden;
}

/**
 * De verzen van een versbereik (Psalm 118 in kathisma 17), op de versnummers uit de bron. Een blok zonder nummer hoort bij
 * het vers ervoor (aan het begin: het opschrift en vers 1); een tussenkop ("tweede stasis") bij het vers erna. Geeft null
 * als niet elk vers van het bereik een eigen nummer heeft (behalve vers 1 aan het begin): dan wordt er niets geknipt.
 */
export function verzenVanStuk(tekst: PsalmTekst, stuk: KathismaStuk): PsalmBlok[] | null {
  const { vanVers, totVers } = stuk;
  if (!vanVers || !totVers) return tekst.verzen;
  const nummers = new Set(tekst.verzen.map((v) => v.n).filter((n): n is number => !!n));
  for (let n = Math.max(vanVers, 2); n <= totVers; n++) if (!nummers.has(n)) return null;
  let huidig = 1;
  return tekst.verzen.filter((v, i) => {
    const n = v.kop ? (tekst.verzen.slice(i + 1).find((w) => w.n)?.n ?? huidig) : (v.n ?? huidig);
    if (!v.kop) huidig = n;
    return n >= vanVers && n <= totVers;
  });
}

/* ---------- Zoeken ---------- */

const normaal = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Zoekt op psalmnummer (Septuagint of Hebreeuws), dienst of onderdeel in het etmaal, thema, en (zodra geladen) woorden uit de tekst. */
export function zoekPsalmen(lijst: Psalm[], invoer: string, teksten: PsalmTeksten | null): Psalm[] {
  const q = normaal(invoer.trim()).replace(/^psalm\s*/, '');
  if (!q) return lijst;
  if (/^\d+$/.test(q)) {
    const n = Number(q);
    // Eerst het Septuagint-nummer, daarna de psalm met dat Hebreeuwse nummer.
    return lijst.filter((p) => p.septuagintNumber === n || p.masoreticNumber === n).sort((a) => (a.septuagintNumber === n ? -1 : 1));
  }
  return lijst.filter((p) => {
    if (p.liturgicalUses.some((g) => normaal(`${g.dienst} ${g.onderdeel ?? ''}`).includes(q))) return true;
    if (p.themes.some((t) => normaal(t).includes(q))) return true;
    const tekst = teksten?.[p.septuagintNumber];
    return !!tekst && tekst.verzen.some((v) => v.regels.some((r) => normaal(r).includes(q)));
  });
}

/** Begint een vers met een hoofdletter (na eventuele leestekens, zoals een aanhalingsteken)? Alleen dan krijgt het een
 *  initiaal, zoals in de uitgave; een vers dat midden in een zin begint ("mijn God, …") niet. */
export const beginMetHoofdletter = (regels: string[]) => /^[^\p{L}]*\p{Lu}/u.test(regels[0] ?? '');
