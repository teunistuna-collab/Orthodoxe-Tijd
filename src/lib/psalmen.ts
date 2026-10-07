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

/** De kathismata van het psalter (Septuagint-nummering), zoals aangeleverd door de redactie. */
export const KATHISMATA: { nr: number; van: number; tot: number; noot?: string }[] = [
  { nr: 1, van: 1, tot: 8 },
  { nr: 2, van: 9, tot: 16 },
  { nr: 3, van: 17, tot: 23 },
  { nr: 4, van: 24, tot: 31 },
  { nr: 5, van: 32, tot: 36 },
  { nr: 6, van: 37, tot: 45 },
  { nr: 7, van: 46, tot: 54 },
  { nr: 8, van: 55, tot: 63 },
  { nr: 9, van: 64, tot: 69 },
  { nr: 10, van: 70, tot: 76 },
  { nr: 11, van: 77, tot: 84 },
  { nr: 12, van: 85, tot: 90 },
  { nr: 13, van: 91, tot: 100 },
  { nr: 14, van: 101, tot: 104 },
  { nr: 15, van: 105, tot: 108 },
  { nr: 16, van: 109, tot: 111 },
  { nr: 17, van: 118, tot: 118, noot: 'De langste psalm, de Wet/Grafpsalm' },
  { nr: 18, van: 119, tot: 133, noot: 'De bedevaartsliederen' },
  { nr: 19, van: 134, tot: 142 },
  { nr: 20, van: 143, tot: 150 },
];

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
}
export interface PsalmTekst {
  lxx: number;
  mt?: number;
  bron: string;
  verzen: PsalmBlok[];
}
export type PsalmTeksten = Record<string, PsalmTekst>;

let tekstenLaden: Promise<PsalmTeksten> | null = null;
export function laadPsalmTeksten(): Promise<PsalmTeksten> {
  tekstenLaden ??= fetch('/data/psalmen.json')
    .then((r) => {
      if (!r.ok) throw new Error('psalmen.json ontbreekt');
      return r.json() as Promise<PsalmTeksten>;
    })
    .catch((fout) => {
      tekstenLaden = null;
      throw fout;
    });
  return tekstenLaden;
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
