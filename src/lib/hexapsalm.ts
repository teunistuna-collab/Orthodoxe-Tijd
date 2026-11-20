import { useEffect, useState } from 'react';

// De Hexapsalm van de Metten (Psalm 3, 37, 62, 87, 102 en 142), zoals aangeleverd door de parochie (20-11-2026,
// public/data/hexapsalm.json, omgezet uit Hexapsalm.docx). Begint bij uitzondering niet met "Kom laat ons aanbidden",
// maar met "Eer aan God in den hoge …" en "Heer, open mijn lippen …". Opschriften zijn weggelaten; liturgische
// aanwijzingen ("(3x)", "en nogmaals:", "Eer … Nu en …") staan apart, zodat ze in een andere kleur en kleiner
// verschijnen en niet hardop worden gelezen.

export interface HexaRegel {
  tekst?: string;
  /** Aanwijzing vóór de tekst (bijv. "en nogmaals:"), of een regel die alleen aanwijzing is */
  rubriek?: string;
  /** Aanwijzing achter de tekst (bijv. "(3x)") */
  na?: string;
  inspring?: boolean;
}
export interface HexaStrofe {
  regels: HexaRegel[];
}
export interface HexaPsalm {
  nr: number;
  /** Wat vóór deze psalm gezegd wordt (bij Psalm 3: de opening van de Hexapsalm) */
  voor?: HexaStrofe[];
  strofen: HexaStrofe[];
}
export interface Hexapsalm {
  titel: string;
  bron: string;
  psalmen: HexaPsalm[];
}

export { HEXAPSALM_NRS } from './gebedsweg';

let cache: Promise<Hexapsalm> | null = null;
export function laadHexapsalm(): Promise<Hexapsalm> {
  cache ??= fetch('/data/hexapsalm.json').then((r) => {
    if (!r.ok) throw new Error('hexapsalm.json ontbreekt');
    return r.json() as Promise<Hexapsalm>;
  });
  cache.catch(() => (cache = null));
  return cache;
}

/** Eén psalm uit de Hexapsalm; null zolang hij laadt, 'fout' als het bestand niet geladen kon worden. */
export function useHexaPsalm(nr: number): HexaPsalm | null | 'fout' {
  const [psalm, setPsalm] = useState<{ nr: number; p: HexaPsalm | 'fout' } | null>(null);
  useEffect(() => {
    let actief = true;
    laadHexapsalm()
      .then((h) => actief && setPsalm({ nr, p: h.psalmen.find((p) => p.nr === nr) ?? 'fout' }))
      .catch(() => actief && setPsalm({ nr, p: 'fout' }));
    return () => {
      actief = false;
    };
  }, [nr]);
  return psalm?.nr === nr ? psalm.p : null;
}
