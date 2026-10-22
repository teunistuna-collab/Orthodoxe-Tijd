import type { DagInfo } from './kalender';

// De geestelijke betekenis van een (vasten)dag voor de vastentafel op de Vasten-pagina. Alleen uitleg: welke spijzen
// zijn toegestaan staat in de vastenregel (lib/vasten.ts) en wordt hier niet herhaald of gewijzigd. De regel van de dag
// (niveau, periode) komt uit dagInfo; de keuze volgt deze voorrang:
//   bijzondere vastendag (kerkelijke datum) > Heilige Week > vastenvrije periode > vastenperiode > Kaasweek >
//   woensdag/vrijdag (ook in de Paastijd) > gewone dag.
// Teksten: Russisch/Slavische traditie, zonder citaten (schriftverwijzingen als „vgl.”).

export interface VastenBetekenis { titel: string; tekst: string }

const DAG = 'De betekenis van deze dag';
const VASTENDAG = 'De betekenis van deze vastendag';

const BIJZONDER: Record<string, string> = {
  '1-5': 'Op de vooravond van Theofanie vast de Kerk streng ter voorbereiding op het feest van de Doop van Christus in de Jordaan. Na de Liturgie wordt de Grote Waterwijding gevierd; het gewijde water wordt meegenomen naar huis.',
  '12-24': 'Op de vooravond van de Geboorte wordt streng gevast tot na de Vespers, wanneer naar oud gebruik de eerste ster wordt verwacht, die herinnert aan de ster van Bethlehem. Met de Koninklijke Uren en de Vespers gaat de Kerk het feest van de Geboorte binnen.',
  '8-29': 'Vandaag gedenkt de Kerk de onthoofding van de heilige Johannes de Voorloper, die zijn leven gaf voor de waarheid. Het vasten is een teken van rouw en eerbied, ook wanneer de dag op een zaterdag of zondag valt.',
  '9-14': 'Op het feest van de Kruisverheffing vereert de Kerk het Kostbare en Levenschenkende Kruis. Omdat het Kruis het lijden van Christus in herinnering roept, is dit feest ook een vastendag, ook op zaterdag of zondag.',
};

const PERIODE: Record<string, string> = {
  'Heilige Week': 'In de Grote en Heilige Week volgt de Kerk Christus dag na dag op Zijn weg naar het lijden, de kruisdood en de graflegging. Het vasten is in deze week het strengst: de gelovigen waken met de Heer en verwachten in stilte Zijn Verrijzenis.',
  'Grote Vasten': 'De Grote Vasten is de tijd van bekering en vernieuwing, waarin de Kerk zich voorbereidt op Pascha. Het vasten gaat samen met gebed, het vragen en schenken van vergeving en barmhartigheid jegens de naaste. Zo wordt het hart gereinigd om de Verrijzenis te ontvangen.',
  Kaasweek: 'In de Kaasweek bereidt de Kerk zich voor op de Grote Vasten: het vlees is al losgelaten, zuivel en eieren nog niet. Zo leidt de Kerk de gelovigen stap voor stap naar de vasten, die begint na de Vergevingsvespers van zondagavond.',
  Kerstvasten: 'De Geboortevasten bereidt de gelovigen veertig dagen voor op de Menswording en de Geboorte van Christus. In gebed, inkeer en barmhartigheid maakt de Kerk ruimte voor de komst van het Woord, dat mens werd om de mens met God te verenigen.',
  Apostelvasten: 'De Apostelvasten volgt op Pinksteren en bereidt voor op het feest van de heilige apostelen Petrus en Paulus. Zoals de apostelen vastten en baden voordat zij uitgingen om het Evangelie te verkondigen (vgl. Handelingen 13:2–3), zo vast de Kerk in hun voetspoor.',
  Dormitionvasten: 'De Ontslapingsvasten is een tijd van gebed en inkeer ter voorbereiding op het feest van de Ontslaping van de Moeder Gods. De gelovigen zoeken haar voorbede en leren van haar leven van volledige overgave aan God.',
};

const VRIJ = 'In deze feestperiode laat de Kerk het vasten los, ook op woensdag en vrijdag. De vreugde van het feest staat voorop: zolang de Bruidegom bij hen is, vasten de bruiloftsgasten niet (vgl. Matteüs 9:15).';
const TRIODION = 'In de week na de Zondag van de Tollenaar en de Farizeeër laat de Kerk het vasten los, als les tegen de hoogmoed van de Farizeeër, die zich op zijn vasten beroemde. Zo begint de weg naar de Grote Vasten met nederigheid.';
const WOENSDAG = 'Op woensdag gedenkt de Kerk het verraad van Christus: op die dag spraken de hogepriesters met Judas af Hem uit te leveren (vgl. Matteüs 26:14–16). Het vasten is een stille daad van trouw aan de Heer en van waakzaamheid over het eigen hart.';
const VRIJDAG = 'Op vrijdag gedenkt de Kerk het lijden en de kruisdood van Christus. Door te vasten verbindt de gelovige zich met de liefde van Hem die Zijn leven gaf voor het leven van de wereld.';
const PAASTIJD = ' In de Paastijd wordt het vasten in het licht van de Verrijzenis verlicht.';
const GEWOON = 'Vandaag schrijft de Kerk geen vasten voor. Ook dan blijven matigheid, het gebed vóór en na de maaltijd en de dankbaarheid voor Gods gaven bij het orthodoxe leven horen.';

export const PASTORALE_NOOT = 'De vastenregels geven de kerkelijke traditie weer. De persoonlijke toepassing kan verschillen, bijvoorbeeld in overleg met een geestelijk vader.';

export function vastenBetekenis(dag: DagInfo): VastenBetekenis {
  const { niveau, periode } = dag.vasten;
  const bijzonder = BIJZONDER[dag.kerkKey];
  if (bijzonder) return { titel: VASTENDAG, tekst: bijzonder };
  if (periode === 'Heilige Week') return { titel: VASTENDAG, tekst: PERIODE['Heilige Week'] };
  if (niveau === 'vrij') return { titel: DAG, tekst: periode === 'Triodion' ? TRIODION : VRIJ };
  if (periode && PERIODE[periode]) return { titel: VASTENDAG, tekst: PERIODE[periode] };
  if (dag.weekdag === 3 || dag.weekdag === 5) return { titel: VASTENDAG, tekst: (dag.weekdag === 3 ? WOENSDAG : VRIJDAG) + (periode === 'Paastijd' ? PAASTIJD : '') };
  return { titel: DAG, tekst: GEWOON };
}
