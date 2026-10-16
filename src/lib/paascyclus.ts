import { addDays, daysBetween, orthodoxPascha } from './kalender';
import { PAASCYCLUS, type Feest } from './feesten';

// De zes stappen van de Paascyclus (Pascha-pagina). offsetRange = eerste en laatste dag t.o.v. Pascha, uit de bestaande
// indeling: Lazaruszaterdag en Palmzondag horen bij de Heilige Week, Pascha omvat de Lichte Week, de Paastijd loopt tot en
// met de Afsluiting van Pascha, en de laatste stap van Hemelvaart tot en met de Zondag van de heiligen van het eigen land.
// De Paasdatum is voor beide kalenderinstellingen dezelfde (orthodoxPascha); alleen de vaste feesten verschillen.
export type StapKey = 'voorbereiding' | 'grote-vasten' | 'goede-week' | 'pascha' | 'vijftig-dagen' | 'hemelvaart-pinksteren';
export const STAPPEN: Array<{ key: StapKey; label: string; short: string; offsetRange: [number, number] }> = [
  { key: 'voorbereiding', label: 'Voorbereiding', short: 'Zondag van de Tollenaar en de Farizeeër tot de Vergevingszondag', offsetRange: [-70, -49] },
  { key: 'grote-vasten', label: 'Grote Vasten', short: 'Innerlijke zuivering en omkeer', offsetRange: [-48, -9] },
  { key: 'goede-week', label: 'Heilige Week', short: 'Met Christus mee naar het Kruis', offsetRange: [-8, -1] },
  { key: 'pascha', label: 'Pascha', short: 'De Verrijzenis van Christus', offsetRange: [0, 6] },
  { key: 'vijftig-dagen', label: 'Paastijd', short: 'Vijftig dagen van vreugde', offsetRange: [7, 38] },
  { key: 'hemelvaart-pinksteren', label: 'Hemelvaart en Pinksteren', short: 'Volheid van de Geest en het nieuwe leven', offsetRange: [39, 63] },
];
const EIND = STAPPEN[STAPPEN.length - 1].offsetRange[1];

export interface Paascyclus {
  /** Pascha van deze cyclus */
  pascha: Date;
  /** Dag t.o.v. dat Pascha (negatief ervoor) */
  offset: number;
  stappen: Array<(typeof STAPPEN)[number] & { van: Date; tot: Date }>;
  /** De stap waarin de dag valt, of null buiten de cyclus */
  huidige: StapKey | null;
  /** Dagen tot Pascha, nooit negatief */
  dagenTotPascha: number;
}

/** De Paascyclus van een dag: de lopende (tot en met de laatste dag van de laatste stap), anders de eerstvolgende. Zo blijft
 *  de pagina tijdens de Paastijd bij Pascha van dit jaar en kiest hij na de cyclus (ook rond de jaarwisseling) het volgende. */
export function paascyclusVoor(dag: Date): Paascyclus {
  const jaar = dag.getUTCFullYear();
  let pascha = orthodoxPascha(jaar);
  if (daysBetween(pascha, dag) > EIND) pascha = orthodoxPascha(jaar + 1);
  const offset = daysBetween(pascha, dag);
  const stappen = STAPPEN.map((s) => ({ ...s, van: addDays(pascha, s.offsetRange[0]), tot: addDays(pascha, s.offsetRange[1]) }));
  const huidige = STAPPEN.find((s) => offset >= s.offsetRange[0] && offset <= s.offsetRange[1])?.key ?? null;
  return { pascha, offset, stappen, huidige, dagenTotPascha: Math.max(0, -offset) };
}

const ZONDAGEN = PAASCYCLUS.filter((f) => (f.offset ?? 0) % 7 === 0);

/** De zondag van de lopende week in de cyclus (de laatste zondag t/m vandaag), met zijn offset; alleen binnen de cyclus. */
export function zondagVanDeWeek(offset: number): Feest | undefined {
  if (offset < STAPPEN[0].offsetRange[0] || offset > EIND) return undefined;
  return [...ZONDAGEN].reverse().find((f) => (f.offset ?? 0) <= offset && offset - (f.offset ?? 0) < 7);
}

/** De eerstvolgende zondag van de cyclus vanaf vandaag (vandaag inbegrepen) tot en met een laatste offset. */
export function volgendeZondag(offset: number, totEnMet: number): Feest | undefined {
  return ZONDAGEN.find((f) => (f.offset ?? 0) >= offset && (f.offset ?? 0) <= totEnMet);
}
