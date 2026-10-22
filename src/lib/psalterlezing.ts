import { KATHISMATA, PSALMEN } from './psalmen';
import { addDays, dagInfo, daysBetween, kerkDatum, orthodoxPascha, parseYmd, ymd, type Mode } from './kalender';
import type { Feest } from './feesten';

/*
 * Psalterlezing: welke kathisma's bij de Metten en de Vespers van een burgerlijke datum horen.
 *
 * BRON EN TOEPASSINGSGEBIED
 * - Liturgisch leesschema volgens het OCA-overzicht (Orthodox Church in America, Byzantijnse traditie):
 *   https://www.oca.org/liturgics/outlines/kathisma-readings-at-matins
 *   https://www.oca.org/liturgics/outlines/kathisma-readings-at-vespers
 *   https://www.oca.org/liturgics/outlines/the-division-of-the-psalter-into-kathismas (de indeling: lib/psalmen.ts)
 *   Gelezen op 17-10-2026. De tabellen hieronder (METTEN, VESPERS) nemen de cellen letterlijk over; de zondagkolom
 *   is in beide bronnen één samengevoegde cel (rowspan) voor de eerste vier rijen.
 * - Alleen Metten en Vespers. De kathisma's bij de Uren in de Grote Vasten staan niet in deze bronnen en zijn niet
 *   opgenomen; de vaste psalmen van de diensten (lib/etmaal.ts) blijven zoals ze zijn.
 * - Geen universeel rooster: de uitvoering verschilt per parochie en klooster (de bron noemt zelf het inkorten).
 *   Niet bedoeld voor andere tradities (bijvoorbeeld Koptisch of Syrisch); de site kent alleen de oude (Juliaanse) en
 *   nieuwe (herziene Juliaanse) kalender, beide met de bestaande omrekening in lib/kalender.ts.
 *
 * DATUM
 * - Invoer: de burgerlijke datum waarop de dienst plaatsvindt (yyyy-mm-dd of een UTC-middernachtdatum zoals overal in
 *   de site). De site rekent met de datum van het toestel; er is geen aparte tijdzone-instelling. Zonder klokinvoer
 *   dus te testen (scripts/psalterlezing.check.ts).
 * - Vaste grenzen (21/22 september, 19/20 december, 14/15 januari) gelden op de kerkelijke datum (kerkDatum: de
 *   gekozen kalender). Pascha: orthodoxPascha (Juliaans Pascha, voor beide kalenders).
 * - Vespers: de dienst op de avond van `datum` hoort bij de liturgische dag erna (zaterdagavond = vesper van zondag).
 *   De periode volgt de avond zelf (de tabel spreekt van "Monday evening" enzovoort); feesten worden bepaald op de
 *   liturgische dag. Dat is een keuze die nog inhoudelijk moet worden bevestigd (zie docs/psalterlezing.md).
 *
 * BETROUWBAARHEID (status)
 * - vastgesteld: rechtstreeks uit een specifieke regel van de bron (bijvoorbeeld de Goede Week of de Lichte Week).
 * - gewoon: het gewone weekschema; feestdagen (die de site niet volledig kent) kunnen afwijken.
 * - geen: een uitdrukkelijke regel "geen psalterlezing". Dat betekent niet dat de dienst geen psalmen heeft.
 * - onbekend: de bron is niet eenduidig of de rang/rubrieken van het feest zijn niet gecontroleerd. Dan wordt het
 *   gewone schema niet stilzwijgend ingevuld; het staat hooguit apart als `zonderFeest`.
 */

export type Dienst = 'metten' | 'vespers';
export type Status = 'vastgesteld' | 'gewoon' | 'geen' | 'onbekend';
export type Lezing =
  | { soort: 'kathisma'; nr: number }
  /** Eén deel (stasis) van een kathisma, bijvoorbeeld kathisma 1, deel 1 ("Zalig de man"). */
  | { soort: 'deel'; nr: number; deel: number }
  /** Psalm 134 en 135 (LXX); geen kathisma. */
  | { soort: 'polyeleos' }
  /** De bron geeft een keuze die de site niet kan maken. */
  | { soort: 'keuze'; opties: Lezing[] };

export type PeriodeSleutel = 'thomas-sep21' | 'sep22-dec19' | 'dec20-jan14' | 'jan15-verloren-zoon' | 'verloren-zoon-vergeving' | 'grote-vasten' | 'grote-vasten-5' | 'goede-week' | 'lichte-week';

export interface Psalterlezing {
  /** Burgerlijke datum waarop de dienst plaatsvindt (yyyy-mm-dd). */
  datum: string;
  dienst: Dienst;
  /** Liturgische dag waar de dienst bij hoort (bij de Vespers de dag erna). */
  liturgischeDag: string;
  kalender: Mode;
  periode: { sleutel: PeriodeSleutel; naam: string };
  status: Status;
  lezingen: Lezing[];
  /** Bij `onbekend` door een feest: het gewone schema van die dag, alleen ter vergelijking. */
  zonderFeest?: Lezing[];
  toelichting: string[];
  bron: { naam: string; url: string }[];
}

export const BRON_METTEN = { naam: 'OCA — Kathisma Readings at Matins', url: 'https://www.oca.org/liturgics/outlines/kathisma-readings-at-matins' };
export const BRON_VESPERS = { naam: 'OCA — Kathisma Readings at Vespers', url: 'https://www.oca.org/liturgics/outlines/kathisma-readings-at-vespers' };

const PERIODEN: Record<PeriodeSleutel, string> = {
  'thomas-sep21': 'Thomaszondag tot en met 21 september',
  'sep22-dec19': '22 september tot en met 19 december',
  'dec20-jan14': '20 december tot en met 14 januari',
  'jan15-verloren-zoon': '15 januari tot de zaterdag vóór de zondag van de Verloren Zoon',
  'verloren-zoon-vergeving': 'Zondag van de Verloren Zoon tot en met Vergevingszondag',
  'grote-vasten': 'Grote Vasten',
  'grote-vasten-5': 'Grote Vasten, vijfde week',
  'goede-week': 'Goede Week (Palmzondag tot en met Grote Zaterdag)',
  'lichte-week': 'Pascha en de Lichte Week',
};

/*
 * De tabellen van de bron, per rij zondag … zaterdag, de cellen zoals in de bron:
 * - getallen: kathisma's; "Polyeleos": Psalm 134–135; "17 of Polyeleos": keuze;
 * - "-": geen kathisma (Metten: uitdrukkelijk een streepje; Vespers zondagavond: de samengevoegde lege cel, met in de
 *   tekst van de bron "no Psalter reading on Sunday evening");
 * - "": lege cel zonder uitleg in de bron (Vespers van de Goede Week, donderdag t/m zaterdag): onbekend.
 */
type Rij = 'gewoon-a' | 'gewoon-b' | 'vasten' | 'vasten-5' | 'goede-week';
const ZONDAG_METTEN = '2, 3, 17 of Polyeleos';
const METTEN: Record<Rij, string[]> = {
  // Thomaszondag–21 sep · 20 dec–14 jan · Verloren Zoon–Vergevingszondag
  'gewoon-a': [ZONDAG_METTEN, '4, 5', '7, 8', '10, 11', '13, 14', '19, 20', '16, 17'],
  // 22 sep–19 dec · 15 jan–zaterdag vóór de Verloren Zoon
  'gewoon-b': [ZONDAG_METTEN, '4, 5, 6', '7, 8, 9', '10, 11, 12', '13, 14, 15', '19, 20', '16, 17'],
  // Grote Vasten, week 1–4 en 6
  vasten: [ZONDAG_METTEN, '4, 5, 6', '10, 11, 12', '19, 20, 1', '6, 7, 8', '13, 14, 15', '16, 17'],
  // Grote Vasten, week 5
  'vasten-5': [ZONDAG_METTEN, '4, 5, 6', '11, 12, 13', '20, 1, 2', '8', '13, 14, 15', '16, 17'],
  // Goede Week (zondag = Palmzondag)
  'goede-week': ['2, 3, Polyeleos', '4, 5, 6', '9, 10, 11', '14, 15, 16', '-', '-', '17'],
};
// Vespers: zondagavond … zaterdagavond.
const VESPERS: Record<Rij, string[]> = {
  'gewoon-a': ['-', '6', '9', '12', '15', '18', '1'],
  'gewoon-b': ['-', '18', '18', '18', '18', '18', '1'],
  // In de bron dezelfde rij als gewoon-b ("Great Lent Weeks 1–4 & 6")
  vasten: ['-', '18', '18', '18', '18', '18', '1'],
  'vasten-5': ['-', '10', '19', '7', '12', '18', '1'],
  'goede-week': ['-', '18', '18', '18', '', '', ''],
};
const RIJ: Record<Exclude<PeriodeSleutel, 'lichte-week'>, { metten: Rij; vespers: Rij }> = {
  'thomas-sep21': { metten: 'gewoon-a', vespers: 'gewoon-a' },
  'sep22-dec19': { metten: 'gewoon-b', vespers: 'gewoon-b' },
  'dec20-jan14': { metten: 'gewoon-a', vespers: 'gewoon-a' },
  'jan15-verloren-zoon': { metten: 'gewoon-b', vespers: 'gewoon-b' },
  'verloren-zoon-vergeving': { metten: 'gewoon-a', vespers: 'gewoon-a' },
  'grote-vasten': { metten: 'vasten', vespers: 'vasten' },
  'grote-vasten-5': { metten: 'vasten-5', vespers: 'vasten-5' },
  'goede-week': { metten: 'goede-week', vespers: 'goede-week' },
};

/** Grote feesten van de Moeder Gods (lib/feesten.ts). Voor de andere grote feesten (van de Heer, en de Ontmoeting en
 *  de Annunciatie, die ook als feest van de Heer gelden) geeft de bron geen eenduidige regel: onbekend. */
const FEESTEN_MOEDER_GODS = new Set(['geboorte-moeder-gods', 'opdracht-moeder-gods', 'ontslaping']);

const lees = (cel: string): Lezing[] =>
  cel.split(',').map((d) => {
    const t = d.trim();
    if (t === 'Polyeleos') return { soort: 'polyeleos' };
    const keuze = /^(\d+) of Polyeleos$/.exec(t);
    if (keuze) return { soort: 'keuze', opties: [{ soort: 'kathisma', nr: Number(keuze[1]) }, { soort: 'polyeleos' }] };
    return { soort: 'kathisma', nr: Number(t) };
  });

/** De periode van het kerkelijk jaar op een burgerlijke datum, en (in de Vasten) het weeknummer. */
export function periodeVan(civil: Date, mode: Mode): { sleutel: PeriodeSleutel; naam: string; week?: number } {
  const off = daysBetween(orthodoxPascha(civil.getUTCFullYear()), civil);
  const metNaam = (sleutel: PeriodeSleutel, week?: number) => ({ sleutel, naam: week ? `${PERIODEN[sleutel].replace(', vijfde week', '')}, week ${week}` : PERIODEN[sleutel], ...(week ? { week } : {}) });
  if (off >= -63 && off <= -49) return metNaam('verloren-zoon-vergeving');
  if (off >= -48 && off <= -8) {
    // Week 1 = Schone Maandag (Pascha − 48) t/m zaterdag; de zondag daarna telt bij die week (de zondagcel is gelijk).
    const week = Math.floor((off + 48) / 7) + 1;
    return metNaam(week === 5 ? 'grote-vasten-5' : 'grote-vasten', week);
  }
  if (off >= -7 && off <= -1) return metNaam('goede-week');
  if (off >= 0 && off <= 6) return metNaam('lichte-week');
  const kerk = kerkDatum(civil, mode);
  const md = (kerk.getUTCMonth() + 1) * 100 + kerk.getUTCDate();
  if (md >= 922 && md <= 1219) return metNaam('sep22-dec19');
  if (md >= 1220 || md <= 114) return metNaam('dec20-jan14');
  // 15 januari – 21 september (kerkelijk): vóór de Verloren Zoon of na Thomaszondag
  return metNaam(off < -63 ? 'jan15-verloren-zoon' : 'thomas-sep21');
}

const grootFeest = (feesten: Feest[]) => feesten.find((f) => f.groot);
/** Een ander feest met de rang Polyeleos of hoger volgens lib/feesten.ts. Niet meegeteld: Lazaruszaterdag, de Goede
 *  Week en de Lichte Week (die staan zelf in de tabellen van de bron) en de zondagen van de Paastijd (die daar ook een
 *  rang hebben). Rang en rubrieken zijn niet gecontroleerd: onbekend. */
const polyeleosFeest = (feesten: Feest[]) =>
  feesten.find((f) => !f.groot && f.soort !== 'pascha' && (f.rang ?? 0) >= 4 && !(f.soort === 'beweeglijk' && f.offset !== undefined && ((f.offset >= -8 && f.offset <= 6) || f.offset % 7 === 0)));

/** Polyeleos-regel van de bron: bij drie kathisma's vervangt hij het derde (in de Grote Vasten volgt hij erop), bij twee
 *  wordt hij als derde gezongen. */
function metPolyeleos(lezingen: Lezing[], vasten: boolean): Lezing[] {
  const kathismas = lezingen.map((l) => (l.soort === 'keuze' ? l.opties[0] : l)).filter((l) => l.soort === 'kathisma');
  if (kathismas.length === 3 && !vasten) return [...kathismas.slice(0, 2), { soort: 'polyeleos' }];
  return [...kathismas, { soort: 'polyeleos' }];
}

export function psalterlezing(datum: Date | string, dienst: Dienst, mode: Mode): Psalterlezing {
  const civil = typeof datum === 'string' ? parseYmd(datum) : datum;
  const liturgisch = dienst === 'vespers' ? addDays(civil, 1) : civil;
  const periode = periodeVan(civil, mode);
  const weekdag = civil.getUTCDay();
  const feesten = dagInfo(liturgisch, mode).feesten;
  const uitkomst = (status: Status, lezingen: Lezing[], toelichting: string[], extra: Partial<Psalterlezing> = {}): Psalterlezing => ({
    datum: ymd(civil),
    dienst,
    liturgischeDag: ymd(liturgisch),
    kalender: mode,
    periode: { sleutel: periode.sleutel, naam: periode.naam },
    status,
    lezingen,
    toelichting,
    bron: [dienst === 'metten' ? BRON_METTEN : BRON_VESPERS],
    ...extra,
  });

  // Pascha en de Lichte Week
  if (periode.sleutel === 'lichte-week') {
    if (dienst === 'vespers') return uitkomst('geen', [], ['In de Lichte Week is er geen psalterlezing bij de Vespers.']);
    const groot = grootFeest(feesten);
    if (groot) return uitkomst('vastgesteld', [{ soort: 'polyeleos' }], [`In de Lichte Week geen kathisma's; op een feest met Polyeleos (${groot.naam}) alleen de Polyeleos.`]);
    const feest = polyeleosFeest(feesten);
    if (feest) return uitkomst('onbekend', [], [`In de Lichte Week geen kathisma's; op een feest met Polyeleos alleen de Polyeleos. De rang van ${feest.naam} is hier niet gecontroleerd.`]);
    return uitkomst('geen', [], ['In de Lichte Week is er geen psalterlezing bij de Metten; op een feest met Polyeleos wordt alleen de Polyeleos gezongen.']);
  }

  const rij = RIJ[periode.sleutel][dienst];
  const cel = (dienst === 'metten' ? METTEN : VESPERS)[rij][weekdag];
  const gewoon = cel && cel !== '-' ? lees(cel) : [];
  const vasten = periode.sleutel === 'grote-vasten' || periode.sleutel === 'grote-vasten-5';
  const groot = grootFeest(feesten);
  const vanDeHeer = groot && !FEESTEN_MOEDER_GODS.has(groot.id) && groot.id !== 'palmzondag';
  const onbekendFeest = (reden: string) => uitkomst('onbekend', [], [reden], gewoon.length ? { zonderFeest: gewoon } : {});

  if (dienst === 'vespers') {
    // Feest op de liturgische dag (de avond ervoor)
    if (groot?.id === 'palmzondag' || vanDeHeer) return onbekendFeest(`Vesper van ${groot!.naam}: op sommige grote feesten van de Heer is er geen psalterlezing; de bron noemt niet welke.`);
    if (groot) {
      if (weekdag >= 1 && weekdag <= 5) return uitkomst('vastgesteld', [{ soort: 'deel', nr: 1, deel: 1 }], [`Vesper van ${groot.naam}: op een feest op een andere dag dan zondag alleen het eerste deel van kathisma 1 („Zalig de man”).`]);
      return onbekendFeest(`Vesper van ${groot.naam}: de bron geeft hiervoor op zaterdag- of zondagavond geen eenduidige regel.`);
    }
    // Feest op de avond zelf: na de vigilie van de vorige nacht geen psalterlezing (op zaterdagavond niet eenduidig)
    const vandaagGroot = grootFeest(dagInfo(civil, mode).feesten);
    if (vandaagGroot && vandaagGroot.id !== 'palmzondag') {
      if (weekdag === 6) return onbekendFeest(`Zaterdagavond na ${vandaagGroot.naam}: de regel na een vigilie en die van de vesper van zondag geven samen geen eenduidige uitkomst.`);
      return uitkomst('geen', [], [`Na de vigilie van ${vandaagGroot.naam} de vorige nacht is er geen psalterlezing.`]);
    }
    const feest = polyeleosFeest(feesten);
    if (feest) return onbekendFeest(`Vesper van ${feest.naam}: op een feest kan alleen het eerste deel van kathisma 1 worden gelezen; de rang en rubrieken zijn hier niet gecontroleerd.`);
    if (cel === '') return uitkomst('onbekend', [], ['Het OCA-overzicht laat dit vak leeg.']);
    if (cel === '-') return uitkomst('geen', [], ['Op zondagavond is er geen psalterlezing, tenzij een feest wordt gevierd waarvoor de rubrieken „Zalig de man” voorschrijven.']);
    const toelichting = weekdag === 6 ? ['Vesper van de dag des Heren: het hele eerste kathisma (in parochies vaak ingekort).'] : [];
    return uitkomst(periode.sleutel === 'goede-week' ? 'vastgesteld' : 'gewoon', gewoon, toelichting);
  }

  // Metten
  if (periode.sleutel === 'goede-week') {
    if (groot && groot.id !== 'palmzondag') return onbekendFeest(`${groot.naam} in de Goede Week: de bron geeft hiervoor geen eigen indeling.`);
    if (cel === '-') return uitkomst('geen', [], ['Geen kathisma volgens het OCA-overzicht.']);
    return uitkomst('vastgesteld', gewoon, weekdag === 0 ? ['Palmzondag: kathisma 2 en 3 en de Polyeleos.'] : []);
  }
  if (vanDeHeer) return onbekendFeest(`${groot!.naam}: het OCA-overzicht geeft voor dit grote feest geen eigen indeling.`);
  if (groot) {
    const rest = weekdag === 0 ? 'de Polyeleos vervangt kathisma 17' : gewoon.length === 3 ? (vasten ? 'de Polyeleos volgt op het derde kathisma' : 'de Polyeleos vervangt het derde kathisma') : 'de Polyeleos wordt als derde gezongen';
    return uitkomst('vastgesteld', metPolyeleos(gewoon, vasten), [`${groot.naam}, feest met Polyeleos: ${rest}.`]);
  }
  // Lazaruszaterdag (zaterdag van week 6) staat zelf in de tabel van de bron: "Great Lent: Weeks 1–4 & 6".
  if (feesten.some((f) => f.id === 'lazarus')) return uitkomst('vastgesteld', gewoon, ['Lazaruszaterdag: de zaterdag van de zesde vastenweek in de tabel van de bron.']);
  const feest = polyeleosFeest(feesten);
  if (feest) return onbekendFeest(`${feest.naam}: op een feest met Polyeleos verandert de indeling; de rang en rubrieken zijn hier niet gecontroleerd.`);
  const toelichting =
    weekdag === 0
      ? [`Na kathisma 2 en 3 volgt kathisma 17 of de Polyeleos (Psalm 134 en 135), afhankelijk van het rooster van de dag.${vasten ? ' In de Grote Vasten volgt de Polyeleos, als die wordt gezongen, op het derde kathisma.' : ''}`]
      : [];
  return uitkomst('gewoon', gewoon, toelichting);
}

/** Metten en Vespers van dezelfde burgerlijke datum, naast elkaar. */
export const psalterlezingen = (datum: Date | string, mode: Mode) => ({ metten: psalterlezing(datum, 'metten', mode), vespers: psalterlezing(datum, 'vespers', mode) });

/* ---------- Weergave (gedeeld door Vandaag, Etmaal en Psalmen) ---------- */

export const POLYELEOS_PSALMEN = [134, 135]; // LXX (Hebreeuws 135 en 136)

/** Hoeveel psalmen van een kathisma (of één deel) al tekst hebben op de site; los van de toewijzing. */
export function tekstBeschikbaar(l: Lezing): 'ja' | 'deels' | 'nee' {
  const psalmen =
    l.soort === 'polyeleos'
      ? POLYELEOS_PSALMEN
      : l.soort === 'kathisma' || l.soort === 'deel'
        ? (l.soort === 'deel' ? KATHISMATA[l.nr - 1].delen[l.deel - 1] : KATHISMATA[l.nr - 1].delen.flat()).map((s) => s.psalm)
        : [];
  const met = psalmen.filter((n) => PSALMEN[n - 1].hasText).length;
  return met === 0 ? 'nee' : met === psalmen.length ? 'ja' : 'deels';
}

export const STATUS_TEKST: Record<Status, string | null> = {
  vastgesteld: null,
  gewoon: 'Gewone indeling; feestdagen kunnen afwijken.',
  geen: 'Geen kathisma; de vaste psalmen van de dienst blijven.',
  onbekend: 'Raadpleeg het liturgische rooster.',
};
