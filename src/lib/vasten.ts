import type { Feest } from './feesten';

export type VastenNiveau =
  | 'vrij'
  | 'geen'
  | 'zuivel'
  | 'vis'
  | 'wijn-olie'
  | 'zonder-olie'
  | 'vastendag'
  | 'streng'
  | 'onthouding';

export interface NiveauInfo {
  id: VastenNiveau;
  label: string;
  kort: string;
  uitleg: string;
  toegestaan: string;
  kleur: string;
  zacht: string;
  tekst: string;
  trap: number;
}

export const NIVEAUS: Record<VastenNiveau, NiveauInfo> = {
  vrij: {
    id: 'vrij',
    label: 'Vastenvrij',
    kort: 'Vrij',
    uitleg: 'Feestperiode waarin ook het woensdag- en vrijdagvasten wordt losgelaten.',
    toegestaan: 'Alles toegestaan',
    kleur: '#4a7c59',
    zacht: '#e3efe4',
    tekst: '#2c5138',
    trap: 1,
  },
  geen: {
    id: 'geen',
    label: 'Geen vasten',
    kort: 'Geen',
    uitleg: 'Gewone dag buiten de vastenperiodes, geen voorschrift.',
    toegestaan: 'Alles toegestaan',
    kleur: '#9b8b70',
    zacht: '#f3ede0',
    tekst: '#5c4d38',
    trap: 2,
  },
  zuivel: {
    id: 'zuivel',
    label: 'Geen vlees — zuivel toegestaan',
    kort: 'Zuivel',
    uitleg: 'Kaasweek: vlees is uitgesloten; zuivel, eieren en vis mogen nog, ook op woensdag en vrijdag.',
    toegestaan: 'Zuivel, eieren, vis, wijn, olie',
    kleur: '#b07d1e',
    zacht: '#f8ecd2',
    tekst: '#6e4c0c',
    trap: 3,
  },
  vis: {
    id: 'vis',
    label: 'Vis toegestaan',
    kort: 'Vis',
    uitleg: 'Vastendag waarop vis, wijn en olie zijn toegestaan — meestal een feest of een weekend in een lichtere vasten.',
    toegestaan: 'Vis, schaaldieren, wijn, olie',
    kleur: '#2f6f8f',
    zacht: '#dfebf2',
    tekst: '#1c4a62',
    trap: 4,
  },
  'wijn-olie': {
    id: 'wijn-olie',
    label: 'Wijn & olie toegestaan',
    kort: 'Wijn & olie',
    uitleg: 'Plantaardig voedsel; wijn en olijfolie verlichten het vasten (weekenden in de Grote Vasten, feesten).',
    toegestaan: 'Plantaardig, wijn, olie',
    kleur: '#c48a1c',
    zacht: '#fbeccb',
    tekst: '#7a520a',
    trap: 5,
  },
  'zonder-olie': {
    id: 'zonder-olie',
    label: 'Gekookt voedsel zonder olie',
    kort: 'Zonder olie',
    uitleg: 'Warm plantaardig voedsel, maar zonder olie en wijn — dinsdag en donderdag in de Grote Vasten.',
    toegestaan: 'Gekookt plantaardig, zonder olie',
    kleur: '#9c4a2a',
    zacht: '#f6e2d8',
    tekst: '#66301a',
    trap: 6,
  },
  vastendag: {
    id: 'vastendag',
    label: 'Vastendag (woensdag/vrijdag)',
    kort: 'Vastendag',
    uitleg: 'Wekelijkse vastendag: geen vlees, zuivel, eieren of vis. Volgens het kloostertypikon ook zonder wijn en olie; in de parochiepraktijk vaak versoepeld.',
    toegestaan: 'Plantaardig (wijn & olie naar plaatselijk gebruik)',
    kleur: '#8c3b3b',
    zacht: '#f3dede',
    tekst: '#5a2424',
    trap: 7,
  },
  streng: {
    id: 'streng',
    label: 'Strikte vasten (xerofagie)',
    kort: 'Strikt',
    uitleg: 'Droog voedsel: brood, groenten, fruit, noten, water. Geen olie, geen wijn.',
    toegestaan: 'Brood, groenten, fruit, noten',
    kleur: '#7b1e1e',
    zacht: '#f1d6d6',
    tekst: '#4d1010',
    trap: 8,
  },
  onthouding: {
    id: 'onthouding',
    label: 'Volledige onthouding',
    kort: 'Onthouding',
    uitleg: 'Grote Vrijdag: wie kan, eet niets tot na de Vespers van de Kruisafname.',
    toegestaan: 'Niets (water)',
    kleur: '#1a0d0a',
    zacht: '#e6dcd8',
    tekst: '#1a0d0a',
    trap: 9,
  },
};

export const LADDER: NiveauInfo[] = Object.values(NIVEAUS).sort((a, b) => a.trap - b.trap);

export interface VastenRegel {
  niveau: VastenNiveau;
  label: string;
  detail: string;
  periode: string | null;
}

interface Ctx {
  kerk: Date;
  offset: number;
  weekdag: number;
  feesten: Feest[];
}

const regel = (niveau: VastenNiveau, label: string, detail: string, periode: string | null = null): VastenRegel => ({
  niveau,
  label,
  detail,
  periode,
});

/** Vastenregel voor één dag. Volgt het (Slavische) Typikon in zijn gangbare parochiële toepassing. */
export function berekenVasten({ kerk, offset, weekdag, feesten }: Ctx): VastenRegel {
  const m = kerk.getUTCMonth() + 1;
  const d = kerk.getUTCDate();
  const md = m * 100 + d;
  const weekend = weekdag === 0 || weekdag === 6;
  const diDo = weekdag === 2 || weekdag === 4;
  const woVr = weekdag === 3 || weekdag === 5;
  const groot = feesten.some((f) => f.groot || f.soort === 'pascha');
  const vigilie = feesten.some((f) => (f.rang ?? 0) >= 5);
  const polyeleos = feesten.some((f) => (f.rang ?? 0) >= 4);

  /* --- Paascyclus --- */
  if (offset === 0) return regel('vrij', 'Pascha — geen vasten', 'Het Feest der feesten: alles is toegestaan. Christus is opgestaan!', 'Pascha');
  if (offset >= 1 && offset <= 6)
    return regel('vrij', 'Lichte Week — vastenvrij', 'De hele week na Pascha is vastenvrij, ook op woensdag en vrijdag.', 'Lichte Week');
  if (offset === -2)
    return regel('onthouding', 'Grote Vrijdag — volledige onthouding', 'De strengste dag van het jaar. Wie kan, eet niets tot na de Vespers van de Kruisafname; daarna brood en water.', 'Heilige Week');
  if (offset === -1)
    return regel('streng', 'Grote Zaterdag — strikte vasten', 'Brood, groenten en fruit; volgens het Typikon een beetje wijn na de Liturgie van Basilius. Geen olie.', 'Heilige Week');
  if (offset === -3)
    return regel('wijn-olie', 'Grote Donderdag — wijn & olie', 'Ter herinnering aan het Laatste Avondmaal is wijn en olie toegestaan.', 'Heilige Week');
  if (offset >= -6 && offset <= -4) {
    if (md === 325) return regel('wijn-olie', 'Annunciatie in de Heilige Week — wijn & olie', 'Het grote feest verlicht het vasten tot wijn en olie; vis blijft in de Heilige Week uitgesloten.', 'Heilige Week');
    return regel('streng', 'Heilige Week — strikte vasten', 'Xerofagie: droog of rauw voedsel, geen olie en geen wijn.', 'Heilige Week');
  }
  if (offset === -7)
    return regel('vis', 'Palmzondag — vis toegestaan', 'Groot feest in de Vasten: vis, wijn en olie zijn toegestaan.', 'Grote Vasten');
  if (offset === -8)
    return regel('wijn-olie', 'Lazaruszaterdag — wijn, olie & viskuit', 'Naar oud gebruik is op Lazaruszaterdag viskuit (kaviaar) toegestaan, met wijn en olie.', 'Grote Vasten');

  if (offset >= -48 && offset <= -9) {
    if (md === 325) return regel('vis', 'Annunciatie — vis toegestaan', 'Groot feest in de Vasten: vis, wijn en olie zijn toegestaan.', 'Grote Vasten');
    if (weekend) return regel('wijn-olie', 'Grote Vasten — wijn & olie (weekend)', 'Op zaterdag en zondag van de Grote Vasten wordt het vasten verlicht met wijn en olie.', 'Grote Vasten');
    if (polyeleos) return regel('wijn-olie', 'Grote Vasten — wijn & olie (feest)', 'Bij een polyeleosfeest in de Vasten is wijn en olie toegestaan.', 'Grote Vasten');
    if (offset === -48) return regel('streng', 'Schone Maandag — strikte vasten', 'Begin van de Grote Vasten. In kloosters wordt op deze dag geheel gevast; in de parochie: droog voedsel.', 'Grote Vasten');
    if (diDo) return regel('zonder-olie', 'Grote Vasten — gekookt zonder olie', 'Dinsdag en donderdag: warm plantaardig voedsel, zonder olie en wijn.', 'Grote Vasten');
    return regel('streng', 'Grote Vasten — strikte vasten', 'Xerofagie: geen vlees, zuivel, eieren, vis, wijn of olie. Brood, groenten, fruit, noten.', 'Grote Vasten');
  }
  if (offset >= -55 && offset <= -49)
    return regel('zuivel', 'Kaasweek — geen vlees, zuivel toegestaan', 'Laatste week vóór de Grote Vasten: vlees is al uitgesloten; zuivel, eieren en vis mogen nog, ook op woensdag en vrijdag.', 'Kaasweek');
  if (offset >= -69 && offset <= -63)
    return regel('vrij', 'Vastenvrije week — Tollenaar en Farizeeër', 'In deze week laat de Kerk het woensdag- en vrijdagvasten los als les tegen de hoogmoed van de Farizeeër.', 'Triodion');
  if (offset === 49) return regel('vrij', 'Pinksteren — geen vasten', 'Feest van de Heilige Drie-eenheid: geen vasten.', 'Pinksteren');
  if (offset >= 50 && offset <= 55)
    return regel('vrij', 'Week van de Heilige Geest — vastenvrij', 'De week na Pinksteren is vastenvrij, ook op woensdag en vrijdag.', 'Pinksterweek');

  /* --- Apostelvasten: maandag na Allerheiligen t/m 28 juni (kerkelijke datum) --- */
  if (offset >= 57 && md <= 628 && md >= 500) {
    if (md === 624) return regel('vis', 'Apostelvasten — Geboorte van Johannes de Doper: vis', 'Groot feest binnen de Apostelvasten: vis, wijn en olie toegestaan.', 'Apostelvasten');
    if (weekend) return regel('vis', 'Apostelvasten — vis toegestaan (weekend)', 'Zaterdag en zondag: vis, wijn en olie.', 'Apostelvasten');
    if (polyeleos) return regel('vis', 'Apostelvasten — vis toegestaan (feest)', 'Bij een polyeleosfeest in de Apostelvasten is vis toegestaan.', 'Apostelvasten');
    if (diDo) return regel('wijn-olie', 'Apostelvasten — wijn & olie', 'Dinsdag en donderdag: plantaardig voedsel met wijn en olie.', 'Apostelvasten');
    return regel('streng', 'Apostelvasten — onthouding (ma/wo/vr)', 'Volgens het Typikon droog voedsel; in de parochiepraktijk vaak versoepeld tot wijn en olie. Raadpleeg uw priester.', 'Apostelvasten');
  }

  /* --- Vaste periodes --- */
  if (md >= 1225 || md <= 104)
    return regel('vrij', 'Kersttijd — vastenvrij', 'Van Kerstmis tot de vooravond van Theofanie (de Twaalf Heilige Dagen) wordt niet gevast, ook niet op woensdag en vrijdag.', 'Kersttijd');
  if (md === 105)
    return regel('streng', 'Vooravond van Theofanie — strenge vasten', 'Strenge vastendag ter voorbereiding op de grote waterwijding; traditioneel wordt pas na de Vespers gegeten — ook als de dag op een weekend valt.', null);
  if (md === 829)
    return regel('wijn-olie', 'Onthoofding van Johannes de Doper — vastendag', 'Vastendag ter ere van de Voorloper, ook als hij op zaterdag of zondag valt: geen vlees, zuivel of vis; wijn en olie zijn toegestaan.', null);
  if (md === 914)
    return regel('wijn-olie', 'Kruisverheffing — vastendag', 'Vastendag ter ere van het Kostbare Kruis, ook op zaterdag of zondag: geen vlees, zuivel of vis; volgens het Typikon zijn wijn en olie toegestaan.', null);

  if (md >= 801 && md <= 814) {
    if (md === 806) return regel('vis', 'Transfiguratie — vis toegestaan', 'Groot feest binnen de Dormitionvasten: vis, wijn en olie.', 'Dormitionvasten');
    if (weekend) return regel('wijn-olie', 'Dormitionvasten — wijn & olie (weekend)', 'Zaterdag en zondag: plantaardig voedsel met wijn en olie. Geen vis (behalve op de Transfiguratie).', 'Dormitionvasten');
    if (diDo) return regel('zonder-olie', 'Dormitionvasten — gekookt zonder olie', 'Dinsdag en donderdag: warm plantaardig voedsel zonder olie.', 'Dormitionvasten');
    return regel('streng', 'Dormitionvasten — strikte vasten (ma/wo/vr)', 'De Dormitionvasten is even streng als de Grote Vasten: droog voedsel op maandag, woensdag en vrijdag.', 'Dormitionvasten');
  }

  if (md >= 1115 && md <= 1224) {
    if (md === 1224)
      return regel(weekend ? 'wijn-olie' : 'streng', 'Kerstavond — strenge vasten tot de eerste ster', 'Vooravond van Kerstmis: traditioneel wordt pas na de Vespers (de eerste ster) sochivo of kutia gegeten.', 'Kerstvasten');
    if (md >= 1220) {
      if (weekend) return regel('wijn-olie', 'Kerstvasten (voorfeest) — wijn & olie', 'In de laatste dagen vóór Kerstmis is geen vis meer toegestaan; in het weekend wel wijn en olie.', 'Kerstvasten');
      return regel('streng', 'Kerstvasten (voorfeest) — strikt', 'Van 20 t/m 24 december wordt het vasten aangescherpt: geen vis, op weekdagen droog voedsel.', 'Kerstvasten');
    }
    if (md === 1121 || md === 1206 || md === 1209 || md === 1130)
      return regel('vis', 'Kerstvasten — vis toegestaan (feest)', 'Feestdag binnen de Kerstvasten: vis, wijn en olie toegestaan.', 'Kerstvasten');
    if (weekend) return regel('vis', 'Kerstvasten — vis toegestaan (weekend)', 'Zaterdag en zondag van de Kerstvasten: vis, wijn en olie.', 'Kerstvasten');
    if (polyeleos) return regel('vis', 'Kerstvasten — vis toegestaan (feest)', 'Bij een polyeleosfeest in de Kerstvasten is vis toegestaan.', 'Kerstvasten');
    if (diDo) return regel('wijn-olie', 'Kerstvasten — wijn & olie', 'Dinsdag en donderdag: plantaardig voedsel met wijn en olie.', 'Kerstvasten');
    return regel('wijn-olie', 'Kerstvasten — plantaardig met olie (ma/wo/vr)', 'De mildste van de vier grote vasten: op maandag, woensdag en vrijdag plantaardig voedsel; volgens het strikte Typikon zonder olie.', 'Kerstvasten');
  }

  /* --- Woensdag & vrijdag --- */
  if (woVr) {
    if (groot || vigilie) return regel('vis', 'Feest op wo/vr — vis toegestaan', 'Een groot feest of vigiliefeest heft het woensdag- en vrijdagvasten op tot een visdag.', null);
    if (offset >= 7 && offset <= 48)
      return regel('vis', 'Paastijd — vis toegestaan (wo/vr)', 'Van Thomaszondag tot Pinksteren wordt het woensdag- en vrijdagvasten verlicht met vis.', 'Paastijd');
    if (polyeleos) return regel('wijn-olie', 'Feest op wo/vr — wijn & olie', 'Feestdag op een vastendag: het vasten wordt verlicht met wijn en olie.', null);
    return regel('vastendag', weekdag === 3 ? 'Woensdag — vastendag' : 'Vrijdag — vastendag', weekdag === 3 ? 'Ter gedachtenis van het verraad van Judas: geen vlees, zuivel, eieren of vis.' : 'Ter gedachtenis van de kruisiging: geen vlees, zuivel, eieren of vis.', null);
  }

  return regel('geen', 'Geen vasten', 'Geen vasten voorgeschreven voor deze dag.', null);
}
