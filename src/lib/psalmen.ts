import { serviceConfig } from './etmaal';

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
  /** Alleen gecontroleerde metadata; nog niets aangeleverd. */
  themes: string[];
  liturgicalUses: PsalmGebruik[];
  /** Aangeleverde opname (bijvoorbeeld /audio/psalmen/psalm-050.mp3). Zonder bestand: geen audioknop. */
  audioSrc?: string;
}

/**
 * Gecontroleerde gegevens per psalm, alleen invullen met aangeleverd materiaal:
 * - tekst: er is een Septuagint-tekst in public/data/psalmen.json (gemaakt met scripts/psalmen-uit-pdf.mjs);
 * - mt: Hebreeuws nummer uit de kopregel van de bron-PDF (Psalm 118 vermeldt er geen);
 * - audio: pad naar een aangeleverde opname in public/, bijvoorbeeld '/audio/psalmen/psalm-050.mp3'.
 * scripts/psalmen.check.ts controleert dit tegen psalmen.json en of de audiobestanden echt bestaan.
 */
export const PSALM_BRONNEN: Record<number, { tekst?: true; mt?: number; audio?: string }> = {
  24: { tekst: true, mt: 25 },
  50: { tekst: true, mt: 51 },
  62: { tekst: true, mt: 63 },
  84: { tekst: true, mt: 85 },
  89: { tekst: true, mt: 90 },
  90: { tekst: true, mt: 91 },
  102: { tekst: true, mt: 103 },
  103: { tekst: true, mt: 104 },
  118: { tekst: true },
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

export const PSALMEN: Psalm[] = Array.from({ length: 150 }, (_, i) => {
  const n = i + 1;
  const bron = PSALM_BRONNEN[n] ?? {};
  return {
    id: `psalm-${n}`,
    septuagintNumber: n,
    ...(bron.mt ? { masoreticNumber: bron.mt } : {}),
    title: `Psalm ${n}`,
    hasText: !!bron.tekst,
    themes: [],
    liturgicalUses: GEBRUIK.get(n) ?? [],
    ...(bron.audio ? { audioSrc: bron.audio } : {}),
  };
});

/** Psalm van de dienst die nu aan de beurt is (dienst met het laatste begintijdstip vóór of op dit uur). */
export function psalmVanHetUur(nu: Date): number {
  const uur = nu.getHours();
  const dienst = [...serviceConfig]
    .map((d) => ({ d, start: Number(d.time.slice(0, 2)) }))
    .filter((x) => x.start <= uur)
    .sort((a, b) => b.start - a.start)[0]?.d ?? serviceConfig[0];
  return Number(dienst.psalms[0].title.replace(/^Psalm /, ''));
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

/** Zoekt op psalmnummer (Septuagint of Hebreeuws), dienst in het etmaal, en (zodra geladen) woorden uit de tekst. */
export function zoekPsalmen(lijst: Psalm[], invoer: string, teksten: PsalmTeksten | null): Psalm[] {
  const q = normaal(invoer.trim()).replace(/^psalm\s*/, '');
  if (!q) return lijst;
  if (/^\d+$/.test(q)) {
    const n = Number(q);
    // Eerst het Septuagint-nummer, daarna de psalm met dat Hebreeuwse nummer.
    return lijst.filter((p) => p.septuagintNumber === n || p.masoreticNumber === n).sort((a) => (a.septuagintNumber === n ? -1 : 1));
  }
  return lijst.filter((p) => {
    if (p.liturgicalUses.some((g) => normaal(g.dienst).includes(q))) return true;
    const tekst = teksten?.[p.septuagintNumber];
    return !!tekst && tekst.verzen.some((v) => v.regels.some((r) => normaal(r).includes(q)));
  });
}
