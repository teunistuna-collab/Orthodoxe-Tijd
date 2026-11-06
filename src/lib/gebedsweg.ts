import { GEBEDEN } from './gebeden';
import { naamVan, type ServiceMapping } from './etmaal';
import type { Feest } from './feesten';

// De gebedsweg (spec: docs/superpowers/specs/2026-11-05-gebedsweg-design.md): de volgorde van een gebedsuur en welke
// onderdelen nu te bidden zijn. Zonder React of browser (behalve laadUurBestand), zodat scripts/gebedsweg.check.ts het
// los kan controleren.
//
// Standaard: de Inleidende gebeden, dan de psalmen van het uur (lib/etmaal.ts). Staat er een
// public/data/uren/<slug>.json, dan bepaalt dat bestand de hele volgorde; "tekst": null betekent "volgt nog" en
// "alleen": "zon-en-feestdag" bij een psalm betekent: alleen op zon- en feestdagen (de polyeleos in de Metten).

export type Onderdeel =
  | { soort: 'psalm'; titel: string; nr: number; beschikbaar: boolean; pdf?: string }
  | { soort: 'gebed'; titel: string; id: string; beschikbaar: boolean }
  | { soort: 'tekst'; titel: string; tekst: string | null; beschikbaar: boolean };

export type KortStap = { soort: 'kernvers' } | { soort: 'jezusgebed' };
export type BronOnderdeel = { psalm: number; alleen?: 'zon-en-feestdag' } | { gebed: string } | { titel: string; tekst: string | null };
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
  if ('psalm' in x) return typeof x.psalm === 'number' && Number.isInteger(x.psalm) && x.psalm >= 1 && x.psalm <= 150 && (x.alleen === undefined || x.alleen === 'zon-en-feestdag');
  if ('gebed' in x) return typeof x.gebed === 'string';
  return typeof x.titel === 'string' && (typeof x.tekst === 'string' || x.tekst === null);
}

/** Een aangeleverd uurbestand, of null als het niet de verwachte vorm heeft. */
export function leesUurBestand(json: unknown): UurBestand | null {
  const delen = json && typeof json === 'object' ? (json as { onderdelen?: unknown }).onderdelen : undefined;
  return Array.isArray(delen) && delen.every(geldigOnderdeel) ? { onderdelen: delen } : null;
}

/** Zondag, of een feest van rang polyeleos (4) of hoger, of een van de grote feesten. */
export const isZonOfFeestdag = (dag: { weekdag: number; feesten: Pick<Feest, 'groot' | 'rang'>[] }) =>
  dag.weekdag === 0 || dag.feesten.some((f) => f.groot || (f.rang ?? 0) >= 4);

/** De onderdelen van een uur in volgorde, elk met "beschikbaar" (nu te bidden). */
export function onderdelenVan(d: ServiceMapping, aangeleverd: UurBestand | null, psalmMetTekst: (nr: number) => boolean, gebedenZichtbaar: boolean, zonOfFeest = false): Onderdeel[] {
  const bron: BronOnderdeel[] = aangeleverd?.onderdelen ?? [{ gebed: OPENING }, ...d.psalms.map((p) => ({ psalm: psalmNr(p.title) }))];
  return bron.filter((o) => zonOfFeest || !('alleen' in o && o.alleen)).map((o): Onderdeel => {
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
