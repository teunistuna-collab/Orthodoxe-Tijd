import { addDays, civilVanKerkdatum, daysBetween, kerkDatum, type Mode } from './kalender';

// De Geboortecyclus: van het begin van de Geboortevasten (kerkelijk 15 november) t/m het nafeest van Theofanie (kerkelijk
// 14 januari), Russische traditie. Alles op kerkelijke datums, omgerekend met de gekozen kalender (lib/kalender.ts):
// oude kalender 28 november t/m 27 januari (1900–2099), nieuwe kalender 15 november t/m 14 januari.
// Perioden mogen overlappen (een zondag in de vasten, de vooravond in het voorfeest): "huidige" is de meest specifieke.

export type GeboorteKey =
  | 'vasten' | 'voorouders' | 'vaders' | 'voorfeest' | 'vooravond' | 'geboorte' | 'nafeest'
  | 'besnijdenis' | 'voorfeest-theofanie' | 'vooravond-theofanie' | 'theofanie' | 'nafeest-theofanie';

/** In tijdlijnvolgorde; van/tot als kerkelijke datum "M-D" (van het vastenjaar J, of januari = J + 1). Zondagen: zie onder. */
export const GEBOORTE_STAPPEN: Array<{ key: GeboorteKey; label: string; short: string; van?: string; tot?: string; zondagTussen?: [string, string] }> = [
  { key: 'vasten', label: 'De Geboortevasten', short: 'Veertig dagen voorbereiding', van: '11-15', tot: '12-24' },
  { key: 'voorouders', label: 'Zondag van de Voorouders', short: 'De heilige voorouders van Christus', zondagTussen: ['12-11', '12-17'] },
  { key: 'vaders', label: 'Zondag van de Heilige Vaders', short: 'De vaders vóór de Geboorte', zondagTussen: ['12-18', '12-24'] },
  { key: 'voorfeest', label: 'Voorfeest van de Geboorte', short: 'De Kerk gaat naar Bethlehem', van: '12-20', tot: '12-24' },
  { key: 'vooravond', label: 'Vooravond van de Geboorte', short: 'De Koninklijke Uren en de Vespers', van: '12-24', tot: '12-24' },
  { key: 'geboorte', label: 'Geboorte van Christus', short: 'God wordt mens', van: '12-25', tot: '12-25' },
  { key: 'nafeest', label: 'Nafeest van de Geboorte', short: 'De vreugde van het feest duurt voort', van: '12-26', tot: '12-31' },
  { key: 'besnijdenis', label: 'Besnijdenis des Heren', short: 'De achtste dag; H. Basilius de Grote', van: '1-1', tot: '1-1' },
  { key: 'voorfeest-theofanie', label: 'Voorfeest van Theofanie', short: 'De Kerk gaat naar de Jordaan', van: '1-2', tot: '1-5' },
  { key: 'vooravond-theofanie', label: 'Vooravond van Theofanie', short: 'De Grote Waterwijding', van: '1-5', tot: '1-5' },
  { key: 'theofanie', label: 'Theofanie', short: 'De Doop van Christus in de Jordaan', van: '1-6', tot: '1-6' },
  { key: 'nafeest-theofanie', label: 'Nafeest van Theofanie', short: 'Tot de afsluiting van het feest', van: '1-7', tot: '1-14' },
];

// Bij overlap gaat de meest specifieke voor
const VOORRANG: GeboorteKey[] = ['vooravond', 'vooravond-theofanie', 'geboorte', 'theofanie', 'besnijdenis', 'vaders', 'voorouders', 'voorfeest', 'voorfeest-theofanie', 'nafeest', 'nafeest-theofanie', 'vasten'];

export interface GeboorteStap { key: GeboorteKey; label: string; short: string; van: Date; tot: Date }
export interface Geboortecyclus {
  /** Burgerlijke datum van de Geboorte van deze cyclus */
  geboorte: Date;
  stappen: GeboorteStap[];
  /** De meest specifieke periode waarin de dag valt, of null buiten de cyclus */
  huidige: GeboorteKey | null;
  /** Dagen tot de Geboorte, nooit negatief */
  dagenTotGeboorte: number;
}

/** De perioden van de cyclus met vastenjaar J (Geboortevasten in J, Theofanie in J + 1), als burgerlijke datums. */
function stappenVoor(J: number, mode: Mode): GeboorteStap[] {
  const datum = (md: string) => civilVanKerkdatum(md, md.startsWith('1-') ? J + 1 : J, mode);
  return GEBOORTE_STAPPEN.map(({ key, label, short, van, tot, zondagTussen }) => {
    if (zondagTussen) {
      const begin = datum(zondagTussen[0]);
      const zondag = addDays(begin, (7 - begin.getUTCDay()) % 7);
      return { key, label, short, van: zondag, tot: zondag };
    }
    return { key, label, short, van: datum(van!), tot: datum(tot!) };
  });
}

/** De Geboortecyclus van een dag: de lopende (t/m het nafeest van Theofanie), anders de eerstvolgende. */
export function geboortecyclusVoor(dag: Date, mode: Mode): Geboortecyclus {
  // Het vastenjaar: vanaf kerkelijk 15 november het lopende jaar, in januari t/m de 14e het jaar ervoor.
  const kerk = kerkDatum(dag, mode);
  let J = kerk.getUTCFullYear() - (kerk.getUTCMonth() === 0 ? 1 : 0);
  let stappen = stappenVoor(J, mode);
  if (dag > stappen[stappen.length - 1].tot) stappen = stappenVoor(++J, mode);
  const geboorte = stappen.find((s) => s.key === 'geboorte')!.van;
  const binnen = (s: GeboorteStap) => dag >= s.van && dag <= s.tot;
  const huidige = VOORRANG.find((k) => binnen(stappen.find((s) => s.key === k)!)) ?? null;
  return { geboorte, stappen, huidige, dagenTotGeboorte: Math.max(0, daysBetween(dag, geboorte)) };
}

/** De centrale controle voor alles wat alleen tijdens de Geboortecyclus verschijnt (Vandaag, Geboortecyclus-pagina). */
export const geboortecyclusActief = (dag: Date, mode: Mode): boolean => geboortecyclusVoor(dag, mode).huidige !== null;

/** Titel van de compacte seizoensbanner op Vandaag, per periode; buiten de cyclus null. De Geboorte-pagina zelf houdt
 *  altijd "Het Licht komt in de wereld". De Zondag van de Heilige Vaders volgt het voorfeest als hij daarin valt. */
const BANNER_TITEL: Record<GeboorteKey, string> = {
  vasten: 'In verwachting van het Licht',
  voorouders: 'In verwachting van het Licht',
  vaders: 'In verwachting van het Licht',
  voorfeest: 'Het Licht nadert',
  vooravond: 'Het Licht nadert',
  geboorte: 'Christus wordt geboren, verheerlijkt Hem!',
  nafeest: 'Christus wordt geboren, verheerlijkt Hem!',
  besnijdenis: 'Christus wordt geboren, verheerlijkt Hem!',
  'voorfeest-theofanie': 'De Openbaring nadert',
  'vooravond-theofanie': 'De Openbaring nadert',
  theofanie: 'Het Licht wordt geopenbaard',
  'nafeest-theofanie': 'Het Licht wordt geopenbaard',
};
export function geboorteBannerTitel(dag: Date, mode: Mode): string | null {
  const c = geboortecyclusVoor(dag, mode);
  if (!c.huidige) return null;
  const vf = c.stappen.find((s) => s.key === 'voorfeest')!;
  const inVoorfeest = dag.getTime() >= vf.van.getTime() && dag.getTime() <= vf.tot.getTime();
  return BANNER_TITEL[c.huidige === 'vaders' && inVoorfeest ? 'voorfeest' : c.huidige];
}
