import type { DagInfo } from './kalender';
import type { Schriftwoord } from './schrift';

// "Leef vandaag met de Kerk": vaste, redactionele teksten per liturgische dag of periode (geen gegenereerde tekst,
// dezelfde datum geeft altijd dezelfde inhoud). Bewerken: alleen de teksten hieronder. Geen citaten in de teksten;
// het schriftwoord is een verwijzing (lib/schrift.ts toont een citaat alleen als het gecontroleerd is).
// Voorrang (eerste die past):
//   1. Pascha en de Lichte Week   2. de Grote en Heilige Week   3. een van de twaalf grote feesten (+ Pascha)
//   4. een feest of heilige met vigilie (rang 5)   5. vastenperiode   6. Paastijd, voor Pinksteren, Pinksterweek, Kersttijd
//   7. een heilige of feest met polyeleos (rang 4)   8. zondag   9. woensdag/vrijdag   10. het thema van de weekdag.

export interface LeefTekst {
  overweeg: string;
  bid: string;
  praktijk: string;
  link?: { label: string; href: string };
  schrift?: Schriftwoord;
}

const JEZUSGEBED = { label: 'Bid het Jezusgebed', href: '#adem' };
const GEBEDSUUR = { label: 'Open het gebedsuur van nu', href: '#etmaal' };
const PAASCYCLUS = { label: 'Naar de Paascyclus', href: '#pascha' };
const GEBOORTECYCLUS = { label: 'Naar de Geboortecyclus', href: '#geboorte' };
const nbv = (ref: string): Schriftwoord => ({ soort: 'nbv21', ref });
const psalm = (lxx: number, vers: number, mt?: number): Schriftwoord => ({ soort: 'psalm', lxx, vers, mt });

const PASCHA: LeefTekst = {
  overweeg: 'Christus is opgestaan uit de doden. Het graf is leeg en de dood heeft niet het laatste woord; vandaag viert de Kerk het feest der feesten.',
  bid: 'Groet vandaag wie u ontmoet met de paasgroet en laat de vreugde van de Verrijzenis uw gebed vullen.',
  praktijk: 'Deel de paasvreugde: zoek iemand op die alleen is, of maak het goed met iemand van wie u vervreemd bent.',
  link: PAASCYCLUS,
  schrift: nbv('Matteüs 28:5–6'),
};
const LICHTE_WEEK: LeefTekst = {
  overweeg: 'De hele Lichte Week is één doorgaande paasdag. De koninklijke deuren blijven open, als teken dat de weg naar God door de Verrijzenis openligt.',
  bid: 'Laat het paastroparion vandaag terugkomen in uw gebed, bij het opstaan en bij het slapengaan.',
  praktijk: 'Laat de vreugde van Pascha merkbaar zijn in een vriendelijk woord of een gastvrij gebaar.',
  link: PAASCYCLUS,
  schrift: nbv('Johannes 20:19–20'),
};
const GROTE_VRIJDAG: LeefTekst = {
  overweeg: 'Op Grote Vrijdag staat de Kerk stil bij het lijden, de kruisdood en de graflegging van Christus. In stilte en vasten waakt zij bij het graf van Hem die uit liefde Zijn leven gaf.',
  bid: 'Neem vandaag tijd voor stilte en bid het Jezusgebed, langzaam en met aandacht.',
  praktijk: 'Laat vandaag lawaai en afleiding zoveel mogelijk rusten, en maak ruimte voor stilte.',
  link: JEZUSGEBED,
  schrift: nbv('Johannes 19:30'),
};
const HEILIGE_WEEK: LeefTekst = {
  overweeg: 'In de Grote en Heilige Week volgt de Kerk Christus dag na dag op Zijn weg naar het lijden. Zij nodigt ons uit om met Hem mee te gaan, waakzaam en in stilte.',
  bid: 'Bid vandaag het Jezusgebed en vraag de Heer om een waakzaam hart.',
  praktijk: 'Kies vandaag bewust voor eenvoud: minder woorden, meer aandacht voor God en voor de mensen om u heen.',
  link: PAASCYCLUS,
  schrift: nbv('Johannes 12:24'),
};

/** De twaalf grote feesten, op id uit lib/feesten.ts */
const GROTE_FEESTEN: Record<string, LeefTekst> = {
  'geboorte-moeder-gods': {
    overweeg: 'Vandaag viert de Kerk de geboorte van de Moeder Gods, de eerste stap in de voorbereiding op de komst van de Verlosser. In haar leven zien wij wat het betekent om geheel voor God open te staan.',
    bid: 'Vraag vandaag in uw gebed de voorspraak van de Moeder Gods.',
    praktijk: 'Dank vandaag God voor de mensen die u op de weg van het geloof hebben gebracht.',
    schrift: nbv('Lucas 1:48'),
  },
  kruisverheffing: {
    overweeg: 'Op het feest van de Kruisverheffing vereert de Kerk het Kostbare en Levenschenkende Kruis. Wat een werktuig van de dood was, is door Christus het teken van de overwinning geworden.',
    bid: 'Maak vandaag met aandacht het kruisteken en bid het Jezusgebed.',
    praktijk: 'Draag vandaag een last van een ander mee, al is het maar door te luisteren.',
    link: JEZUSGEBED,
    schrift: nbv('1 Korintiërs 1:18'),
  },
  'opdracht-moeder-gods': {
    overweeg: 'De Kerk gedenkt vandaag hoe de jonge Maria in de tempel werd gebracht. Zij die zelf de woonplaats van God zou worden, wordt aan God toegewijd.',
    bid: 'Bid vandaag om een hart dat, zoals dat van de Moeder Gods, geheel aan God toebehoort.',
    praktijk: 'Maak vandaag in uw huis een plek of moment vrij voor gebed.',
    schrift: nbv('2 Korintiërs 6:16'),
  },
  kerstmis: {
    overweeg: 'Christus is geboren: het eeuwige Woord van God is mens geworden. God komt ons nabij in de kwetsbaarheid van een kind.',
    bid: 'Begroet vandaag uw naasten met „Christus is geboren!” en dank God voor de Menswording.',
    praktijk: 'Geef vandaag iemand aandacht die weinig aandacht krijgt.',
    link: GEBOORTECYCLUS,
    schrift: nbv('Johannes 1:14'),
  },
  theofanie: {
    overweeg: 'Bij de doop van Christus in de Jordaan wordt de Heilige Drie-eenheid geopenbaard: de stem van de Vader, de Zoon in het water en de Geest als een duif. De Kerk wijdt vandaag het water, als teken dat heel de schepping geheiligd wordt.',
    bid: 'Denk vandaag in uw gebed aan uw eigen doop en dank God voor het nieuwe leven.',
    praktijk: 'Gebruik vandaag met eerbied het gewijde water, of zegen uw huis met een kort gebed.',
    link: GEBOORTECYCLUS,
    schrift: nbv('Matteüs 3:16–17'),
  },
  ontmoeting: {
    overweeg: 'Veertig dagen na Zijn geboorte wordt Christus in de tempel gebracht en ontvangen door de oude Simeon en de profetes Anna. Wie een leven lang heeft gewacht, mag het Licht zien.',
    bid: 'Bid vandaag om geduld en om ogen die Christus herkennen.',
    praktijk: 'Neem vandaag de tijd voor een oudere in uw omgeving.',
    schrift: nbv('Lucas 2:29–32'),
  },
  annunciatie: {
    overweeg: 'De engel Gabriël brengt de Maagd Maria de blijde boodschap, en zij antwoordt met haar ja. In haar instemming begint onze verlossing.',
    bid: 'Vraag vandaag in uw gebed om de bereidheid om Gods wil te aanvaarden.',
    praktijk: 'Zeg vandaag van harte ja tegen een vraag om hulp.',
    schrift: nbv('Lucas 1:38'),
  },
  palmzondag: {
    overweeg: 'Christus trekt Jeruzalem binnen als de Koning van de vrede, op weg naar Zijn lijden. Het volk juicht Hem toe met palmtakken; de Kerk doet dat vandaag met hen.',
    bid: 'Bid vandaag om trouw, ook wanneer de weg met Christus moeilijk wordt.',
    praktijk: 'Neem de gewijde takken mee naar huis en zet ze bij uw iconen.',
    link: PAASCYCLUS,
    schrift: nbv('Johannes 12:13'),
  },
  hemelvaart: {
    overweeg: 'Veertig dagen na Pascha stijgt Christus ten hemel. Hij verlaat ons niet, maar neemt onze menselijke natuur mee tot bij de Vader.',
    bid: 'Bid vandaag om een hart dat gericht blijft op wat boven is.',
    praktijk: 'Kijk vandaag eens bewust omhoog en dank God voor Zijn belofte dat Hij met ons is.',
    link: PAASCYCLUS,
    schrift: nbv('Handelingen 1:9–11'),
  },
  pinksteren: {
    overweeg: 'Vijftig dagen na Pascha komt de Heilige Geest neer op de apostelen. De Kerk viert vandaag de Heilige Drie-eenheid en de geboorte van de Kerk als één lichaam in Christus.',
    bid: 'Vraag vandaag in uw gebed om de gave van de Heilige Geest.',
    praktijk: 'Zoek vandaag eenheid: met een woord van verzoening of door samen te bidden.',
    link: PAASCYCLUS,
    schrift: nbv('Handelingen 2:1–4'),
  },
  transfiguratie: {
    overweeg: 'Op de berg Tabor laat Christus Zijn leerlingen Zijn goddelijke heerlijkheid zien. Dat licht is ook voor ons bestemd: God wil de mens met Zijn licht vervullen.',
    bid: 'Bid vandaag het Jezusgebed en vraag om het licht van Christus in uw hart.',
    praktijk: 'Breng vandaag vruchten naar de kerk om te laten zegenen, of dank God bewust voor wat de aarde geeft.',
    link: JEZUSGEBED,
    schrift: nbv('Matteüs 17:1–2'),
  },
  ontslaping: {
    overweeg: 'De Kerk viert vandaag het ontslapen van de Moeder Gods. In haar zien wij dat de dood voor wie Christus toebehoort een overgang is naar het leven.',
    bid: 'Vraag vandaag de voorspraak van de Moeder Gods voor uzelf en voor wie u dierbaar zijn.',
    praktijk: 'Bid vandaag voor een overledene of bezoek iemand die rouwt.',
    schrift: nbv('Lucas 1:48'),
  },
};

const PERIODEN: Record<string, LeefTekst> = {
  'Grote Vasten': {
    overweeg: 'De Grote Vasten is de tijd van bekering en vernieuwing op weg naar Pascha. Het vasten van het lichaam gaat samen met gebed, vergeving en barmhartigheid.',
    bid: 'Bid vandaag het Jezusgebed en vraag de Heer om een berouwvol en nederig hart.',
    praktijk: 'Vraag vandaag iemand om vergeving, of schenk die aan wie u iets heeft aangedaan.',
    link: JEZUSGEBED,
    schrift: nbv('Joël 2:12–13'),
  },
  Kerstvasten: {
    overweeg: 'In de Geboortevasten bereidt de Kerk zich voor op de Menswording en de Geboorte van Christus. Zij nodigt ons uit om ruimte te maken voor de komst van het Woord.',
    bid: 'Neem vandaag een moment van stilte en bid het Jezusgebed in verwachting van de Heer.',
    praktijk: 'Geef vandaag iets weg aan wie het minder heeft, in stilte en zonder er iets voor terug te verwachten.',
    link: GEBOORTECYCLUS,
    schrift: nbv('Jesaja 9:1'),
  },
  Apostelvasten: {
    overweeg: 'De Apostelvasten bereidt voor op het feest van de heilige apostelen Petrus en Paulus. De apostelen vastten en baden voordat zij uitgingen om het Evangelie te verkondigen.',
    bid: 'Bid vandaag voor wie het Evangelie verkondigen, en voor uw eigen getuigenis.',
    praktijk: 'Laat vandaag in een gesprek merken dat het geloof u lief is, zonder iemand iets op te dringen.',
    schrift: nbv('Handelingen 13:2–3'),
  },
  Dormitionvasten: {
    overweeg: 'De Ontslapingsvasten is een tijd van gebed en inkeer op weg naar het feest van de Ontslaping van de Moeder Gods. In haar leven zien wij volledige overgave aan God.',
    bid: 'Vraag vandaag in uw gebed de voorspraak van de Moeder Gods.',
    praktijk: 'Kies vandaag één moment om in stilte te luisteren in plaats van te spreken.',
    schrift: nbv('Lucas 1:46–48'),
  },
  Paastijd: {
    overweeg: 'In de Paastijd leeft de Kerk in het licht van de Verrijzenis. Wat met Pascha is begonnen, wil groeien in ons dagelijks leven.',
    bid: 'Begin vandaag uw gebed met de paasgroet: „Christus is opgestaan!”',
    praktijk: 'Breng vandaag hoop bij iemand die het moeilijk heeft.',
    link: PAASCYCLUS,
    schrift: nbv('Johannes 11:25'),
  },
  'Voor Pinksteren': {
    overweeg: 'Tussen Hemelvaart en Pinksteren bidt de Kerk, zoals de apostelen met de Moeder Gods, om de komst van de Heilige Geest.',
    bid: 'Bid vandaag om de gave van de Heilige Geest, voor uzelf en voor de Kerk.',
    praktijk: 'Neem vandaag een vast moment voor gebed en houd dat vol.',
    link: PAASCYCLUS,
    schrift: nbv('Handelingen 1:14'),
  },
  Pinksterweek: {
    overweeg: 'In de week na Pinksteren viert de Kerk de Heilige Geest, die Trooster en Gever van het leven is. Wat Hij geeft, is bestemd om te delen.',
    bid: 'Vraag vandaag in uw gebed om de vruchten van de Geest.',
    praktijk: 'Oefen vandaag één vrucht van de Geest: geduld, vriendelijkheid of zachtmoedigheid.',
    schrift: nbv('Galaten 5:22–23'),
  },
  Kersttijd: {
    overweeg: 'In de Kersttijd verheugt de Kerk zich over de Geboorte van Christus. God is met ons, ook in het gewone leven van iedere dag.',
    bid: 'Dank God vandaag in uw gebed voor Zijn komst in de wereld.',
    praktijk: 'Zoek vandaag iemand op voor wie deze dagen eenzaam zijn.',
    link: GEBOORTECYCLUS,
    schrift: nbv('Lucas 2:10–11'),
  },
};

const ZONDAG: LeefTekst = {
  overweeg: 'Iedere zondag is de dag van de Verrijzenis, een kleine Pascha. De Kerk komt samen rond de Eucharistie en begint de week in het licht van de opgestane Christus.',
  bid: 'Laat vandaag de Goddelijke Liturgie het hart van uw dag zijn, of verbind u in gebed met de Kerk.',
  praktijk: 'Maak van deze dag een dag van rust en ontmoeting: tijd voor God, voor uw gezin en voor wie alleen is.',
  schrift: psalm(117, 24, 118),
};
const WOENSDAG: LeefTekst = {
  overweeg: 'Op woensdag gedenkt de Kerk het verraad van Christus. Die gedachtenis maakt ons waakzaam voor de kleine ontrouw in ons eigen hart.',
  bid: 'Bid vandaag het Jezusgebed en vraag de Heer om trouw.',
  praktijk: 'Houd vandaag woord in iets kleins, ook als niemand het merkt.',
  link: JEZUSGEBED,
  schrift: nbv('Matteüs 26:41'),
};
const VRIJDAG: LeefTekst = {
  overweeg: 'De Kerk gedenkt op vrijdag het lijden en de kruisiging van Christus. Zijn vrijwillige zelfgave nodigt ons uit om stil te staan bij liefde, vergeving en nederigheid.',
  bid: 'Neem vandaag een moment om in stilte het Jezusgebed te bidden en Christus om ontferming te vragen.',
  praktijk: 'Probeer vandaag iemand met geduld tegemoet te treden, juist wanneer dat moeite kost.',
  link: JEZUSGEBED,
  schrift: nbv('Johannes 15:13'),
};
/** Het weekthema van de Kerk (Oktoëchos): maandag de engelen, dinsdag Johannes de Voorloper, donderdag de apostelen en
 *  de heilige Nicolaas, zaterdag de Moeder Gods, alle heiligen en de overledenen. */
const WEEKDAG: Record<number, LeefTekst> = {
  1: {
    overweeg: 'Op maandag gedenkt de Kerk de engelen, de dienaren van God die Hem onophoudelijk loven. Hun lofzang herinnert ons eraan dat ons gebed deel heeft aan een groter koor.',
    bid: 'Vraag vandaag uw beschermengel om u te behoeden op uw weg.',
    praktijk: 'Begin uw werk vandaag met een kort gebed en een kruisteken.',
    link: GEBEDSUUR,
    schrift: psalm(90, 11, 91),
  },
  2: {
    overweeg: 'Op dinsdag gedenkt de Kerk de heilige Johannes de Voorloper, die opriep tot bekering en Christus aanwees. Zijn eenvoud en moed wijzen ons de weg.',
    bid: 'Bid vandaag het Jezusgebed en vraag om een oprecht berouw.',
    praktijk: 'Zeg vandaag eerlijk wat waar is, met zachtheid en zonder te kwetsen.',
    link: JEZUSGEBED,
    schrift: nbv('Matteüs 3:1–2'),
  },
  4: {
    overweeg: 'Op donderdag gedenkt de Kerk de heilige apostelen en de heilige Nicolaas. Zij lieten zien hoe het Evangelie in daden van liefde zichtbaar wordt.',
    bid: 'Bid vandaag voor wie u het geloof heeft doorgegeven.',
    praktijk: 'Help vandaag iemand in stilte, zoals de heilige Nicolaas dat deed.',
    link: GEBEDSUUR,
    schrift: nbv('Marcus 16:15'),
  },
  6: {
    overweeg: 'Op zaterdag gedenkt de Kerk de Moeder Gods, alle heiligen en de overledenen. De gemeenschap van de Kerk reikt verder dan dit leven.',
    bid: 'Noem vandaag in uw gebed de namen van overledenen die u dierbaar zijn.',
    praktijk: 'Bereid u in rust voor op de zondag en de Goddelijke Liturgie.',
    link: GEBEDSUUR,
    schrift: nbv('Hebreeën 12:1'),
  },
};

/** Feest of heilige van de dag: de naam uit de kalender (lib/feesten.ts) in een vaste tekst. De toelichtingen daar
 *  bevatten soms voedselregels en zijn daarom niet bruikbaar als overweging. */
function gedachtenis(naam: string): LeefTekst {
  return {
    overweeg: `Vandaag gedenkt de Kerk: ${naam}. In haar feesten en heiligen laat de Kerk zien hoe Gods genade in mensen werkt.`,
    bid: 'Vraag vandaag in uw gebed om de voorspraak van de heiligen die de Kerk gedenkt.',
    praktijk: 'Laat vandaag in één concreet gebaar zien wat het geloof voor u betekent.',
    link: GEBEDSUUR,
    schrift: nbv('Hebreeën 13:7'),
  };
}

export function leefVoor(dag: DagInfo): LeefTekst {
  const { offset, weekdag, feesten } = dag;
  const periode = dag.vasten.periode;
  if (offset === 0) return PASCHA;
  if (offset >= 1 && offset <= 6) return LICHTE_WEEK;
  if (offset === -2) return GROTE_VRIJDAG;
  if (offset >= -6 && offset <= -1) return HEILIGE_WEEK;
  const groot = feesten.find((f) => GROTE_FEESTEN[f.id]);
  if (groot) return GROTE_FEESTEN[groot.id];
  const vigilie = feesten.find((f) => (f.rang ?? 0) >= 5 && f.offset === undefined);
  if (vigilie) return gedachtenis(vigilie.naam);
  if (periode && PERIODEN[periode] && periode !== 'Paastijd' && periode !== 'Kersttijd') return PERIODEN[periode];
  if (offset >= 7 && offset <= 38) return PERIODEN.Paastijd;
  if (offset >= 40 && offset <= 48) return PERIODEN['Voor Pinksteren'];
  if (offset >= 50 && offset <= 55) return PERIODEN.Pinksterweek;
  if (periode === 'Kersttijd') return PERIODEN.Kersttijd;
  const polyeleos = feesten.find((f) => (f.rang ?? 0) >= 4 && f.offset === undefined);
  if (polyeleos) return gedachtenis(polyeleos.naam);
  if (weekdag === 0) return ZONDAG;
  if (weekdag === 3) return WOENSDAG;
  if (weekdag === 5) return VRIJDAG;
  return WEEKDAG[weekdag];
}
