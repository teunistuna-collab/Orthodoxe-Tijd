import { addDays, daysBetween, orthodoxPascha } from './kalender';
import { PAASCYCLUS, type Feest } from './feesten';

// De tien perioden van de Paascyclus (Pascha-pagina, en "De betekenis van vandaag"). offsetRange = eerste en laatste dag
// t.o.v. Pascha, aaneensluitend en zonder overlap: van de Zondag van de Tollenaar en de Farizeeër (Pascha − 70) tot en met
// Pinksteren (Pascha + 49). Grenzen: Grote Vasten = Schone Maandag (−48) t/m de vrijdag vóór Lazaruszaterdag (−9);
// Goede Week = Grote Maandag (−6) t/m Grote Zaterdag (−1); Lichte Week = Lichte Maandag t/m Lichte Zaterdag (1–6);
// Paastijd t/m de Afsluiting van Pascha (38); Hemelvaart (39) met het nafeest t/m Pinksterzaterdag (48).
// De Paasdatum is voor beide kalenderinstellingen dezelfde (orthodoxPascha); alleen de vaste feesten verschillen.
export type StapKey = 'voorbereiding' | 'grote-vasten' | 'lazarus' | 'palmzondag' | 'goede-week' | 'pascha' | 'lichte-week' | 'paastijd' | 'hemelvaart' | 'pinksteren';
export const STAPPEN: Array<{ key: StapKey; label: string; short: string; offsetRange: [number, number] }> = [
  { key: 'voorbereiding', label: 'Voorbereidende zondagen', short: 'Van de Tollenaar en de Farizeeër tot de Vergevingszondag', offsetRange: [-70, -49] },
  { key: 'grote-vasten', label: 'Grote Vasten', short: 'Innerlijke zuivering en omkeer', offsetRange: [-48, -9] },
  { key: 'lazarus', label: 'Lazaruszaterdag', short: 'Christus wekt Lazarus op', offsetRange: [-8, -8] },
  { key: 'palmzondag', label: 'Palmzondag', short: 'De intocht in Jeruzalem', offsetRange: [-7, -7] },
  { key: 'goede-week', label: 'Goede Week', short: 'Met Christus mee naar het Kruis', offsetRange: [-6, -1] },
  { key: 'pascha', label: 'Pascha', short: 'De Verrijzenis van Christus', offsetRange: [0, 0] },
  { key: 'lichte-week', label: 'Lichte Week', short: 'De week als één grote feestdag', offsetRange: [1, 6] },
  { key: 'paastijd', label: 'Paastijd', short: 'De vreugde van de Verrijzenis', offsetRange: [7, 38] },
  { key: 'hemelvaart', label: 'Hemelvaart', short: 'Christus verheerlijkt', offsetRange: [39, 48] },
  { key: 'pinksteren', label: 'Pinksteren', short: 'De nederdaling van de Heilige Geest', offsetRange: [49, 49] },
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

/** De Paascyclus van een dag: de lopende (tot en met Pinksteren), anders de eerstvolgende. Zo blijft de pagina tijdens de
 *  Paastijd bij Pascha van dit jaar en kiest hij na Pinksteren (ook rond de jaarwisseling) het volgende. */
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

/** De centrale controle voor alles wat alleen tijdens de Paascyclus verschijnt (Vandaag, Pascha): van de Zondag van de
 *  Tollenaar en de Farizeeër t/m Pinksteren, beide inbegrepen. `dag`: de burgerlijke datum (UTC-middernacht, zoals overal). */
export const paascyclusActief = (dag: Date): boolean => paascyclusVoor(dag).huidige !== null;
