/**
 * Menologion & lezingen naar holytrinityorthodox.com (HTC), gesleuteld op Juliaanse maand-dag.
 * Data: /data/dagen.json (heiligen + lezingsverwijzingen) en /data/lezingen-MM.json (volledige teksten).
 */

export interface HtcLezingRef {
  ref: string;
  tag: string;
}
export interface HtcDag {
  c: string;
  h: string;
  l: [string, string][];
  r: HtcLezingRef[];
}
export type HtcData = Record<string, HtcDag>;

export interface Vers {
  num: string;
  text: string;
}
export interface HtcLezing {
  ref: string;
  tag: string;
  url: string;
  verses: Vers[];
}
export type LezingenMaand = Record<string, HtcLezing[]>;

let dagenCache: Promise<HtcData> | null = null;
export function laadDagen(): Promise<HtcData> {
  if (!dagenCache) {
    dagenCache = fetch('/data/dagen.json').then((r) => {
      if (!r.ok) throw new Error('dagen.json ontbreekt');
      return r.json() as Promise<HtcData>;
    });
    dagenCache.catch(() => {
      dagenCache = null;
    });
  }
  return dagenCache;
}

/**
 * Kerkjaren (juliaans) met een leesrooster in /data/<jaar>/ (ophalen met scripts/htc-rooster.mjs, controleren met
 * npm run check:leesrooster). Het juliaanse jaar J loopt van 14 januari J t/m 13 januari J+1.
 * Daarnaast dekt het oorspronkelijke bestand (dagen.json, lezingen-MM.json) nog 1–13 januari 2026 (kerkjaar 2025).
 */
export const ROOSTER_JAREN = Array.from({ length: 2035 - 2026 + 1 }, (_, i) => 2026 + i);
const LAATSTE_JAAR = ROOSTER_JAREN[ROOSTER_JAREN.length - 1];
const OUD_JAAR = 2025; // alleen 1–13 januari 2026, uit dagen.json
const EERSTE_DATUM = '2026-01-01';

/** Lezingsverwijzingen per burgerlijke datum (yyyy-mm-dd), over de kerkjaren die al geladen zijn. */
export type Rooster = Record<string, HtcLezingRef[]>;

/** Het kerkjaar (juliaans jaar) van een burgerlijke datum: 1–13 januari hoort nog bij het vorige jaar (1900–2099). */
export function kerkjaarVan(ymd: string): number {
  const [j, m, d] = ymd.split('-').map(Number);
  return m === 1 && d < 14 ? j - 1 : j;
}
// Eén kerkjaar per keer ophalen (±100 KB), pas als er een datum uit dat jaar wordt bekeken.
type JaarRooster = Record<string, { c: string; r: HtcLezingRef[] }>;
const jaarCache = new Map<number, Promise<Rooster>>();
const geladenJaren = new Set<number>();
export function laadRoosterJaar(jaar: number, dagen: HtcData): Promise<Rooster> {
  const c = jaarCache.get(jaar);
  if (c) return c;
  const bron: Promise<JaarRooster> =
    jaar === OUD_JAAR
      ? Promise.resolve(Object.fromEntries(Object.entries(dagen).filter(([, d]) => d.c >= EERSTE_DATUM && kerkjaarVan(d.c) === OUD_JAAR)))
      : ROOSTER_JAREN.includes(jaar)
        ? fetch(`/data/${jaar}/rooster.json`).then((r) => {
            if (!r.ok) throw new Error(`leesrooster ${jaar} ontbreekt`);
            return r.json() as Promise<JaarRooster>;
          })
        : Promise.resolve({});
  const p = bron.then((o) => {
    geladenJaren.add(jaar);
    return Object.fromEntries(Object.values(o).map((d) => [d.c, d.r]));
  });
  p.catch(() => jaarCache.delete(jaar));
  jaarCache.set(jaar, p);
  return p;
}

/** Voegt een geladen kerkjaar samen met wat er al was. */
export function voegRoosterToe(oud: Rooster | null, nieuw: Rooster): Rooster {
  return { ...oud, ...nieuw };
}

/** Tekst als er voor een datum geen lezingen zijn: nog aan het laden, echt geen lezingen, of buiten het rooster. */
export function roosterMelding(ymd: string): string {
  if (ymd < EERSTE_DATUM) return 'Het leesrooster begint op 1 januari 2026.';
  const jaar = kerkjaarVan(ymd);
  if (jaar > LAATSTE_JAAR) return `Het leesrooster loopt tot en met 13 januari ${LAATSTE_JAAR + 1}.`;
  if (!geladenJaren.has(jaar)) return 'Lezingen worden geladen…';
  return 'Geen lezingen gevonden voor deze dag.';
}

const lezingenCache = new Map<string, Promise<LezingenMaand>>();
/** Volledige teksten van één juliaanse maand in een kerkjaar (juliaans jaar). */
export function laadLezingen(julMaand: number, julJaar: number): Promise<LezingenMaand> {
  const sleutel = `${julJaar}-${julMaand}`;
  const c = lezingenCache.get(sleutel);
  if (c) return c;
  const maand = String(julMaand).padStart(2, '0');
  const p = fetch(julJaar === OUD_JAAR ? `/data/lezingen-${maand}.json` : `/data/${julJaar}/lezingen-${maand}.json`).then((r) => {
    if (!r.ok) throw new Error('lezingen ontbreken');
    return r.json() as Promise<LezingenMaand>;
  });
  p.catch(() => lezingenCache.delete(sleutel));
  lezingenCache.set(sleutel, p);
  return p;
}

/* ------------------------------------------------------------------ */
/* Vertaling van bijbelboeken en lezingslabels                          */
/* ------------------------------------------------------------------ */

const BOEKEN: [RegExp, string][] = [
  [/^Matthew\b/, 'Matteüs'],
  [/^Mark\b/, 'Marcus'],
  [/^Luke\b/, 'Lucas'],
  [/^John\b/, 'Johannes'],
  [/^Acts\b/, 'Handelingen'],
  [/^Romans\b/, 'Romeinen'],
  [/^1 Corinthians\b/, '1 Korintiërs'],
  [/^2 Corinthians\b/, '2 Korintiërs'],
  [/^Galatians\b/, 'Galaten'],
  [/^Ephesians\b/, 'Efeziërs'],
  [/^Philippians\b/, 'Filippenzen'],
  [/^Colossians?\b/, 'Kolossenzen'],
  [/^1 Thessalonians\b/, '1 Tessalonicenzen'],
  [/^2 Thessalonians\b/, '2 Tessalonicenzen'],
  [/^1 Timothy\b/, '1 Timoteüs'],
  [/^2 Timothy\b/, '2 Timoteüs'],
  [/^Titus\b/, 'Titus'],
  [/^Philemon\b/, 'Filemon'],
  [/^Hebrews\b/, 'Hebreeën'],
  [/^James\b/, 'Jakobus'],
  [/^1 Peter\b/, '1 Petrus'],
  [/^2 Peter\b/, '2 Petrus'],
  [/^1 John\b/, '1 Johannes'],
  [/^2 John\b/, '2 Johannes'],
  [/^3 John\b/, '3 Johannes'],
  [/^Jude\b/, 'Judas'],
  [/^Revelation\b/, 'Openbaring'],
  [/^Genesis\b/, 'Genesis'],
  [/^Exodus\b/, 'Exodus'],
  [/^Proverbs\b/, 'Spreuken'],
  [/^Isaiah\b/, 'Jesaja'],
  [/^Wisdom\b/, 'Wijsheid'],
  [/^Joel\b/, 'Joël'],
  [/^Zechariah\b/, 'Zacharia'],
  [/^Malachi\b/, 'Maleachi'],
  [/^Ezekiel\b/, 'Ezechiël'],
  [/^Jonah\b/, 'Jona'],
  [/^Daniel\b/, 'Daniël'],
  [/^Micah\b/, 'Micha'],
  [/^Jeremiah\b/, 'Jeremia'],
  [/^Job\b/, 'Job'],
  [/^Psalm\b/, 'Psalm'],
  [/^Numbers\b/, 'Numeri'],
  [/^Deuteronomy\b/, 'Deuteronomium'],
  [/^Leviticus\b/, 'Leviticus'],
  [/^Joshua\b/, 'Jozua'],
  [/^Judges\b/, 'Rechters'],
  [/^1 Kings\b/, '1 Koningen'],
  [/^2 Kings\b/, '2 Koningen'],
  [/^3 Kings\b/, '3 Koningen (1 Kon.)'],
  [/^4 Kings\b/, '4 Koningen (2 Kon.)'],
  [/^Baruch\b/, 'Baruch'],
  [/^Zephaniah\b/, 'Sefanja'],
];

const EVANGELIEN = /^(Matteüs|Marcus|Lucas|Johannes)\b/;
const OUDE_TESTAMENT = /^(Genesis|Exodus|Spreuken|Jesaja|Wijsheid|Joël|Zacharia|Maleachi|Ezechiël|Jona|Daniël|Micha|Jeremia|Job|Psalm|Numeri|Deuteronomium|Leviticus|Jozua|Rechters|[1-4] Koningen|Baruch|Sefanja)\b/;

export function vertaalRef(ref: string): string {
  for (const [re, nl] of BOEKEN) {
    if (re.test(ref)) return ref.replace(re, nl);
  }
  return ref;
}

/* ------------------------------------------------------------------ */
/* Deeplink naar de NBV21 op debijbel.nl                                */
/* ------------------------------------------------------------------ */

const USFM: [RegExp, string][] = [
  [/^Matthew\b/, 'MAT'], [/^Mark\b/, 'MRK'], [/^Luke\b/, 'LUK'], [/^John\b/, 'JHN'], [/^Acts\b/, 'ACT'],
  [/^Romans\b/, 'ROM'], [/^1 Corinthians\b/, '1CO'], [/^2 Corinthians\b/, '2CO'], [/^Galatians\b/, 'GAL'],
  [/^Ephesians\b/, 'EPH'], [/^Philippians\b/, 'PHP'], [/^Colossians?\b/, 'COL'], [/^1 Thessalonians\b/, '1TH'],
  [/^2 Thessalonians\b/, '2TH'], [/^1 Timothy\b/, '1TI'], [/^2 Timothy\b/, '2TI'], [/^Titus\b/, 'TIT'],
  [/^Philemon\b/, 'PHM'], [/^Hebrews\b/, 'HEB'], [/^James\b/, 'JAS'], [/^1 Peter\b/, '1PE'], [/^2 Peter\b/, '2PE'],
  [/^1 John\b/, '1JN'], [/^2 John\b/, '2JN'], [/^3 John\b/, '3JN'], [/^Jude\b/, 'JUD'], [/^Revelation\b/, 'REV'],
  [/^Genesis\b/, 'GEN'], [/^Exodus\b/, 'EXO'], [/^Leviticus\b/, 'LEV'], [/^Numbers\b/, 'NUM'], [/^Deuteronomy\b/, 'DEU'],
  [/^Joshua\b/, 'JOS'], [/^Judges\b/, 'JDG'], [/^1 Kings\b/, '1SA'], [/^2 Kings\b/, '2SA'], [/^3 Kings\b/, '1KI'], [/^4 Kings\b/, '2KI'],
  [/^Job\b/, 'JOB'], [/^Psalm\b/, 'PSA'], [/^Proverbs\b/, 'PRO'], [/^Isaiah\b/, 'ISA'], [/^Jeremiah\b/, 'JER'],
  [/^Baruch\b/, 'BAR'], [/^Ezekiel\b/, 'EZK'], [/^Daniel\b/, 'DAN'], [/^Joel\b/, 'JOL'], [/^Jonah\b/, 'JON'],
  [/^Micah\b/, 'MIC'], [/^Zephaniah\b/, 'ZEP'], [/^Zechariah\b/, 'ZEC'], [/^Malachi\b/, 'MAL'], [/^Wisdom\b/, 'WIS'],
];

/** Link naar de passage in de NBV21 (debijbel.nl). Bij een lezing over meerdere hoofdstukken wordt het beginhoofdstuk geopend. */
export function nbv21Url(ref: string): string | null {
  let code: string | null = null;
  let rest = ref;
  for (const [re, c] of USFM) {
    if (re.test(ref)) {
      code = c;
      rest = ref.replace(re, '').trim();
      break;
    }
  }
  if (!code) return null;
  const base = `https://www.debijbel.nl/bijbel/NBV21/${code}`;
  const m = rest.match(/^(\d+)(?::(\d+)(?:-(\d+))?)?/);
  if (!m) return `${base}.1`;
  const [, hoofdstuk, van, tot] = m;
  const kruistHoofdstuk = rest.slice(m[0].length).startsWith(':');
  if (van && tot && !kruistHoofdstuk) return `${base}.${hoofdstuk}.${van}-${tot}`;
  if (van) return `${base}.${hoofdstuk}.${van}`;
  return `${base}.${hoofdstuk}`;
}

export type LezingSoort = 'evangelie' | 'apostel' | 'oud';
export function lezingSoort(refNl: string): LezingSoort {
  if (EVANGELIEN.test(refNl)) return 'evangelie';
  if (OUDE_TESTAMENT.test(refNl)) return 'oud';
  return 'apostel';
}

const ORD = (n: string) => `${n}e`;

export function vertaalTag(tag: string, refNl: string): string {
  let t = tag.replace(/^\(|\)$/g, '').trim();
  if (!t) {
    const s = lezingSoort(refNl);
    return s === 'evangelie' ? 'Evangelie' : s === 'oud' ? 'Lezing uit het Oude Testament' : 'Apostellezing';
  }
  t = t
    .replace(/^(\d+)(st|nd|rd|th) Matins Gospel$/, (_, n) => `${ORD(n)} Mettenevangelie`)
    .replace(/^Matins Gospel$/, 'Evangelie van de Metten')
    .replace(/^(\d+)(st|nd|rd|th) Hour$/, (_, n) => `${ORD(n)} Uur`)
    .replace(/^Vespers, (\d+)(st|nd|rd|th) Reading$/, (_, n) => `Vespers, ${ORD(n)} lezing`)
    .replace(/^Gospel$/, 'Evangelie')
    .replace(/^Epistle$/, 'Apostellezing')
    .replace(/^Epistle, /, 'Apostellezing, ')
    .replace(/^Gospel, /, 'Evangelie, ')
    .replace(/Theotokos/, 'Moeder Gods')
    .replace(/^Departed$/, 'Overledenen')
    .replace(/^Saints$/, 'Heiligen')
    .replace(/^Saint$/, 'Heilige')
    .replace(/^Apostles$/, 'Apostelen')
    .replace(/^Apostle$/, 'Apostel')
    .replace(/^Martyrs$/, 'Martelaren')
    .replace(/^Martyr$/, 'Martelaar')
    .replace(/^Forerunner$/, 'Voorloper')
    .replace(/^Fathers$/, 'Vaders')
    .replace(/^Venerable$/, 'Eerbiedwaardige')
    .replace(/^Unmercenaries$/, 'Onbaatzuchtigen')
    .replace(/^Great-martyr$/, 'Grootmartelaar')
    .replace(/^Equal-to-the-Apostles$/, 'Gelijk aan de Apostelen')
    .replace(/^Sunday Before$/, 'Zondag vóór het feest')
    .replace(/^Sunday After$/, 'Zondag na het feest')
    .replace(/^Saturday Before$/, 'Zaterdag vóór het feest')
    .replace(/^Saturday After$/, 'Zaterdag na het feest')
    .replace(/^Hieromartyr /, 'Priestermartelaar ')
    .replace(/^St\. /, 'H. ')
    .replace(/^Sts\. /, 'HH. ');
  return vertaalLeven(t);
}

/* ------------------------------------------------------------------ */
/* Vertaling van het menologion (best effort, Engels → Nederlands)      */
/* ------------------------------------------------------------------ */

const FRASEN: [RegExp, string][] = [
  [/The Circumcision of Our Lord Jesus Christ/g, 'Besnijdenis van onze Heer Jezus Christus'],
  [/The Annunciation/g, 'De Annunciatie (Boodschap aan de Moeder Gods)'],
  [/The Nativity of/g, 'De Geboorte van'],
  [/Nativity of/g, 'Geboorte van'],
  [/The Dormition of/g, 'De Ontslaping van'],
  [/Dormition of/g, 'Ontslaping van'],
  [/The Transfiguration of/g, 'De Gedaanteverandering van'],
  [/The Universal Exaltation of the Precious and Life-giving Cross/g, 'De Verheffing van het Kostbare en Levengevende Kruis'],
  [/The Entry of/g, 'De Intrede van'],
  [/The Meeting of/g, 'De Ontmoeting van'],
  [/The Holy Theophany of/g, 'De Heilige Theofanie van'],
  [/The Ascension of/g, 'De Hemelvaart van'],
  [/The Beheading of/g, 'De Onthoofding van'],
  [/Beheading of/g, 'Onthoofding van'],
  [/The Protection of/g, 'De Bescherming van'],
  [/Protection of/g, 'Bescherming van'],
  [/Placing of the|Deposition of the/g, 'Nederlegging van'],
  [/the Robe/g, 'het Gewaad'],
  [/the Cincture|the Belt/g, 'de Gordel'],
  [/the Sanctified/g, 'de Geheiligde'],
  [/the Righteous/g, 'de Rechtvaardige'],
  [/the God-bearer/g, 'de Goddrager'],
  [/the God-receiver/g, 'de Godontvanger'],
  [/the Unmercenary/g, 'de Onbaatzuchtige'],
  [/the Healer/g, 'de Genezer'],
  [/Holy Glorious and All-praised/g, 'Heilige, roemrijke en alomgeprezen'],
  [/Holy Glorious/g, 'Heilige roemrijke'],
  [/All-praised/g, 'alomgeprezen'],
  [/Holy Righteous/g, 'Heilige Rechtvaardige'],
  [/Holy Fathers/g, 'Heilige Vaders'],
  [/Holy Great/g, 'Heilige Grote'],
  [/Precious/g, 'Kostbare'],
  [/Life-giving/g, 'Levengevende'],
  [/Estonia/g, 'Estland'],
  [/Lithuania/g, 'Litouwen'],
  [/Latvia/g, 'Letland'],
  [/Poland/g, 'Polen'],
  [/Hungary/g, 'Hongarije'],
  [/Austria/g, 'Oostenrijk'],
  [/France/g, 'Frankrijk'],
  [/England/g, 'Engeland'],
  [/Turkey/g, 'Turkije'],
  [/Priests/g, 'priesters'],
  [/Deacons/g, 'diakens'],
  [/The Nativity of Our Lord God and Savior Jesus Christ/g, 'Geboorte van onze Heer, God en Verlosser Jezus Christus'],
  [/Our Most Holy Lady, the Theotokos and Ever-Virgin Mary/g, 'onze Allerheiligste Vrouwe, de Moeder Gods en Altijd-Maagd Maria'],
  [/the Most Holy Theotokos/g, 'de Allerheiligste Moeder Gods'],
  [/Most Holy Theotokos/g, 'Allerheiligste Moeder Gods'],
  [/Our Lord Jesus Christ/g, 'onze Heer Jezus Christus'],
  [/Icon of the Mother of God/g, 'Icoon van de Moeder Gods'],
  [/the Mother of God/g, 'de Moeder Gods'],
  [/Mother of God/g, 'Moeder Gods'],
  [/Theotokos/g, 'Moeder Gods'],
  [/Translation of the relics of/g, 'Overbrenging van de relieken van'],
  [/Uncovering of the relics of/g, 'Vinding van de relieken van'],
  [/Repose of/g, 'Ontslaping van'],
  [/Commemoration of/g, 'Gedachtenis van'],
  [/Synaxis of/g, 'Synaxis van'],
  [/Finding of the/g, 'Vinding van het'],
  [/Equal-to-the-Apostles|Equal of the Apostles/g, 'gelijk aan de apostelen'],
  [/Fool-for-Christ/g, 'dwaas om Christus'],
  [/New Hieromartyrs/g, 'Nieuwe priestermartelaren'],
  [/New Hieromartyr/g, 'Nieuwe priestermartelaar'],
  [/New Martyrs/g, 'Nieuwe martelaren'],
  [/New Martyr/g, 'Nieuwe martelaar'],
  [/Hieromartyrs/g, 'Priestermartelaren'],
  [/Hieromartyr/g, 'Priestermartelaar'],
  [/Great-martyrs/g, 'Grootmartelaren'],
  [/Great-martyr/g, 'Grootmartelaar'],
  [/Virgin-martyrs/g, 'Maagd-martelaressen'],
  [/Virgin-martyr/g, 'Maagd-martelares'],
  [/Martyrs/g, 'Martelaren'],
  [/Martyr/g, 'Martelaar'],
  [/Venerable/g, 'Eerbiedwaardige'],
  [/Righteous/g, 'Rechtvaardige'],
  [/Blessed/g, 'Zalige'],
  [/Apostles/g, 'Apostelen'],
  [/Apostle/g, 'Apostel'],
  [/Prophetess/g, 'Profetes'],
  [/Prophet/g, 'Profeet'],
  [/Archangel/g, 'Aartsengel'],
  [/Confessor/g, 'Belijder'],
  [/Wonderworker/g, 'Wonderdoener'],
  [/wonderworker/g, 'wonderdoener'],
  [/Unmercenaries/g, 'Onbaatzuchtigen'],
  [/Unmercenary/g, 'Onbaatzuchtige'],
  [/Passion-bearers/g, 'Passiedragers'],
  [/Passion-bearer/g, 'Passiedrager'],
  [/the Great\b/g, 'de Grote'],
  [/the Theologian/g, 'de Theoloog'],
  [/the Forerunner/g, 'de Voorloper'],
  [/the Baptist/g, 'de Doper'],
  [/the Younger/g, 'de Jongere'],
  [/the Elder/g, 'de Oudere'],
  [/the New\b/g, 'de Nieuwe'],
  [/the Recluse/g, 'de Kluizenaar'],
  [/the Stylite/g, 'de Styliet'],
  [/the Hymnographer/g, 'de Hymnograaf'],
  [/the Merciful/g, 'de Barmhartige'],
  [/the Faster/g, 'de Vaster'],
  [/the Confessor/g, 'de Belijder'],
  [/the Wise/g, 'de Wijze'],
  [/the Silent/g, 'de Zwijger'],
  [/the Sinaite/g, 'van de Sinaï'],
  [/the Studite/g, 'de Studiet'],
  [/the Dalmatian/g, 'de Dalmatiër'],
  [/the Syrian/g, 'de Syriër'],
  [/the Roman/g, 'de Romein'],
  [/the Egyptian/g, 'van Egypte'],
  [/the Persian/g, 'de Pers'],
  [/the Goth/g, 'de Goot'],
  [/the Hermit/g, 'de Kluizenaar'],
  [/the Black/g, 'de Zwarte'],
  [/the Ethiopian/g, 'de Ethiopiër'],
  [/the Hesychast/g, 'de Hesychast'],
  [/the Presbyter/g, 'de Priester'],
  [/the Deacon/g, 'de Diaken'],
  [/the Wonderworker/g, 'de Wonderdoener'],
  [/the Enlightener/g, 'de Verlichter'],
  [/the Apostle/g, 'de Apostel'],
  [/the Evangelist/g, 'de Evangelist'],
  [/the Virgin/g, 'de Maagd'],
  [/the Ascetic/g, 'de Asceet'],
  [/the Fool/g, 'de Dwaas'],
  [/the Wanderer/g, 'de Zwerver'],
  [/the Cave-dweller/g, 'de Grotbewoner'],
  [/of Scete/g, 'van Skete'],
  [/of Nitria/g, 'van Nitrië'],
  [/of Optina/g, 'van Optina'],
  [/of Valaam/g, 'van Valamo'],
  [/of Solovki/g, 'van Solovki'],
  [/of Pskov/g, 'van Pskov'],
  [/of Rostov/g, 'van Rostov'],
  [/of Vladimir/g, 'van Vladimir'],
  [/of Sarov/g, 'van Sarov'],
  [/of Kronstadt/g, 'van Kronstadt'],
  [/of Petersburg/g, 'van Petersburg'],
  [/of Amasea/g, 'van Amasea'],
  [/of Ancyra/g, 'van Ancyra'],
  [/of Tarsus/g, 'van Tarsus'],
  [/of Edessa/g, 'van Edessa'],
  [/of Damascus/g, 'van Damascus'],
  [/of Sebaste/g, 'van Sebaste'],
  [/of Nyssa/g, 'van Nyssa'],
  [/of Nazianzus/g, 'van Nazianze'],
  [/the Anchorite/g, 'de Anachoreet'],
  [/the Athonite/g, 'de Athoniet'],
  [/Mt\. Athos|Mount Athos/g, 'de berg Athos'],
  [/Kiev Caves/g, 'Kievse Grotten'],
  [/of the Caves/g, 'van de Grotten'],
  [/of Constantinople/g, 'van Constantinopel'],
  [/of Alexandria/g, 'van Alexandrië'],
  [/of Antioch/g, 'van Antiochië'],
  [/of Jerusalem/g, 'van Jeruzalem'],
  [/of Thessalonica/g, 'van Thessaloniki'],
  [/of Nicomedia/g, 'van Nicomedië'],
  [/of Cappadocia/g, 'van Cappadocië'],
  [/of Sinai/g, 'van de Sinaï'],
  [/of Palestine/g, 'van Palestina'],
  [/of Persia/g, 'van Perzië'],
  [/of Syria/g, 'van Syrië'],
  [/of Egypt/g, 'van Egypte'],
  [/of Radonezh/g, 'van Radonezj'],
  [/of Serbia/g, 'van Servië'],
  [/of Bulgaria/g, 'van Bulgarije'],
  [/of Georgia/g, 'van Georgië'],
  [/of Greece/g, 'van Griekenland'],
  [/of Crete/g, 'van Kreta'],
  [/of Milan/g, 'van Milaan'],
  [/of Lyons/g, 'van Lyon'],
  [/of Gaul/g, 'van Gallië'],
  [/of Britain/g, 'van Brittannië'],
  [/of Ireland/g, 'van Ierland'],
  [/of Scotland/g, 'van Schotland'],
  [/of Ethiopia/g, 'van Ethiopië'],
  [/of Armenia/g, 'van Armenië'],
  [/of Corinth/g, 'van Korinthe'],
  [/of Ephesus/g, 'van Efeze'],
  [/of Lycia/g, 'van Lycië'],
  [/of Thrace/g, 'van Thracië'],
  [/of Bithynia/g, 'van Bithynië'],
  [/of Galatia/g, 'van Galatië'],
  [/of Cilicia/g, 'van Cilicië'],
  [/of Phrygia/g, 'van Frygië'],
  [/of Asia Minor/g, 'van Klein-Azië'],
  [/of Africa/g, 'van Afrika'],
  [/of Spain/g, 'van Spanje'],
  [/of Italy/g, 'van Italië'],
  [/of Germany/g, 'van Duitsland'],
  [/of Moscow/g, 'van Moskou'],
  [/of Kiev/g, 'van Kiev'],
  [/of Novgorod/g, 'van Novgorod'],
  [/of Rome/g, 'van Rome'],
  [/in Cappadocia/g, 'in Cappadocië'],
  [/in Lycia/g, 'in Lycië'],
  [/in Asia Minor/g, 'in Klein-Azië'],
  [/in North Africa/g, 'in Noord-Afrika'],
  [/in Egypt/g, 'in Egypte'],
  [/in Syria/g, 'in Syrië'],
  [/in Palestine/g, 'in Palestina'],
  [/in Persia/g, 'in Perzië'],
  [/in Bithynia/g, 'in Bithynië'],
  [/in Thrace/g, 'in Thracië'],
  [/in Armenia/g, 'in Armenië'],
  [/\(Greek\)/g, '(Grieks)'],
  [/\(Celtic & British\)/g, '(Keltisch & Brits)'],
  [/\(Gaul\)/g, '(Gallië)'],
  [/\(Romania\)/g, '(Roemenië)'],
  [/\(Serbia\)/g, '(Servië)'],
  [/\(Georgia\)/g, '(Georgië)'],
  [/\(Bulgaria\)/g, '(Bulgarije)'],
  [/\(Russia\)/g, '(Rusland)'],
  [/\(North Africa\)/g, '(Noord-Afrika)'],
  [/\(Ukraine\)/g, '(Oekraïne)'],
  [/\(Italy\)/g, '(Italië)'],
  [/\(Spain\)/g, '(Spanje)'],
  [/\(Netherlands\)/g, '(Nederland)'],
  [/\(Germany\)/g, '(Duitsland)'],
  [/\(Egypt\)/g, '(Egypte)'],
  [/\(Syria\)/g, '(Syrië)'],
  [/\(Africa\)/g, '(Afrika)'],
  [/\(Britain\)/g, '(Brittannië)'],
  [/\(Ireland\)/g, '(Ierland)'],
  [/\(Scotland\)/g, '(Schotland)'],
  [/\(Wales\)/g, '(Wales)'],
  [/\(Palestine\)/g, '(Palestina)'],
  [/\(Persia\)/g, '(Perzië)'],
  [/\(Cyprus\)/g, '(Cyprus)'],
  [/\(Crete\)/g, '(Kreta)'],
  [/\(Finland\)/g, '(Finland)'],
  [/\(Estonia\)/g, '(Estland)'],
  [/\(Alaska\)/g, '(Alaska)'],
  [/\(America\)/g, '(Amerika)'],
];

const NAMEN: [RegExp, string][] = [
  ['Basil', 'Basilius'], ['John', 'Johannes'], ['Peter', 'Petrus'], ['Paul', 'Paulus'], ['Gregory', 'Gregorius'],
  ['Nicholas', 'Nicolaas'], ['George', 'Georgius'], ['Theodore', 'Theodorus'], ['Michael', 'Michaël'], ['Andrew', 'Andreas'],
  ['James', 'Jakobus'], ['Matthew', 'Matteüs'], ['Mark', 'Marcus'], ['Luke', 'Lucas'], ['Stephen', 'Stefanus'],
  ['Anthony', 'Antonius'], ['Cyril', 'Cyrillus'], ['Seraphim', 'Serafim'], ['Catherine', 'Catharina'], ['Mary', 'Maria'],
  ['Elizabeth', 'Elisabeth'], ['Constantine', 'Constantijn'], ['Helen', 'Helena'], ['Alexis', 'Alexius'], ['Philip', 'Filippus'],
  ['Jude', 'Judas'], ['Elijah', 'Elia'], ['Moses', 'Mozes'], ['Daniel', 'Daniël'], ['Isaiah', 'Jesaja'], ['Jeremiah', 'Jeremia'],
  ['Ezekiel', 'Ezechiël'], ['Zechariah', 'Zacharias'], ['Joseph', 'Jozef'], ['Polycarp', 'Polycarpus'], ['Clement', 'Clemens'],
  ['Ambrose', 'Ambrosius'], ['Augustine', 'Augustinus'], ['Benedict', 'Benedictus'], ['Hilary', 'Hilarius'], ['Martin', 'Martinus'],
  ['Boniface', 'Bonifatius'], ['Irenaeus', 'Ireneüs'], ['Justin', 'Justinus'], ['Cyprian', 'Cyprianus'], ['Lawrence', 'Laurentius'],
  ['Vincent', 'Vincentius'], ['Damian', 'Damianus'], ['Panteleimon', 'Pantelejmon'], ['Innocent', 'Innocentius'], ['Eugene', 'Eugenius'],
  ['Timothy', 'Timoteüs'], ['Bartholomew', 'Bartolomeüs'], ['Thaddeus', 'Thaddeüs'], ['Matthias', 'Matthias'], ['Ignatius', 'Ignatius'],
  ['Athanasius', 'Athanasius'], ['Sergius', 'Sergius'], ['Demetrius', 'Demetrius'], ['Macarius', 'Macarius'], ['Maximus', 'Maximus'],
  ['Isaac', 'Isaak'], ['Jacob', 'Jakob'], ['Sarah', 'Sara'], ['Samuel', 'Samuël'], ['Joshua', 'Jozua'], ['Aaron', 'Aäron'],
  ['Simeon', 'Simeon'], ['Anna', 'Anna'], ['Joachim', 'Joachim'], ['Xenia', 'Xenia'], ['Barbara', 'Barbara'], ['Tatiana', 'Tatiana'],
  ['Eudocia', 'Eudokia'], ['Euphemia', 'Euphemia'], ['Irene', 'Irene'], ['Sophia', 'Sophia'], ['Faith', 'Geloof'], ['Hope', 'Hoop'],
  ['Love', 'Liefde'], ['Photius', 'Fotios'], ['Photina', 'Fotini'], ['Thecla', 'Thecla'], ['Nectarius', 'Nektarios'], ['Nicodemus', 'Nikodemus'],
  ['Eustathius', 'Eustathius'], ['Onuphrius', 'Onuphrius'], ['Ephraim', 'Efrem'], ['Ephrem', 'Efrem'], ['Jonah', 'Jona'], ['Habakkuk', 'Habakuk'],
  ['Micah', 'Micha'], ['Hosea', 'Hosea'], ['Malachi', 'Maleachi'], ['Zephaniah', 'Sefanja'], ['Obadiah', 'Obadja'], ['Haggai', 'Haggai'],
  ['Nahum', 'Nahum'], ['Amos', 'Amos'], ['Joel', 'Joël'], ['Job', 'Job'], ['David', 'David'], ['Solomon', 'Salomo'],
  ['Lazarus', 'Lazarus'], ['Martha', 'Martha'], ['Magdalene', 'Magdalena'], ['Nina', 'Nina'], ['Olga', 'Olga'], ['Vladimir', 'Vladimir'],
  ['Alexander', 'Alexander'], ['Nevsky', 'Nevski'], ['Tikhon', 'Tichon'], ['Herman', 'Herman'], ['Silouan', 'Silouan'], ['Paisius', 'Paisius'],
  ['Spyridon', 'Spyridon'], ['Charalampus', 'Charalampus'], ['Blaise', 'Blasius'], ['Tryphon', 'Tryphon'], ['Menas', 'Menas'], ['Victor', 'Victor'],
  ['Nikita', 'Nikita'], ['Procopius', 'Procopius'], ['Eustratius', 'Eustratius'], ['Marina', 'Marina'], ['Paraskeva', 'Paraskeva'], ['Parasceva', 'Paraskeva'],
  ['Anastasia', 'Anastasia'], ['Eugenia', 'Eugenia'], ['Juliana', 'Juliana'], ['Agatha', 'Agatha'], ['Agnes', 'Agnes'], ['Lucy', 'Lucia'],
  ['Willibrord', 'Willibrord'], ['Servatius', 'Servatius'], ['Adalbert', 'Adalbert'], ['Lebuin', 'Lebuinus'], ['Odulf', 'Odulfus'],
  ['Emperor', 'Keizer'], ['Empress', 'Keizerin'], ['Prince', 'Vorst'], ['Princess', 'Vorstin'], ['King', 'Koning'], ['Queen', 'Koningin'],
  ['Patriarch', 'Patriarch'], ['Metropolitan', 'Metropoliet'], ['Archbishop', 'Aartsbisschop'], ['Bishop', 'Bisschop'], ['Pope', 'Paus'],
  ['Abbot', 'Abt'], ['Abbess', 'Abdis'], ['Priest', 'Priester'], ['Deacon', 'Diaken'], ['Monk', 'Monnik'], ['Nun', 'Non'],
  ['Hermit', 'Kluizenaar'], ['Recluse', 'Kluizenaar'], ['Elder', 'Starets'], ['Soldier', 'Soldaat'], ['Physician', 'Arts'],
].map(([en, nl]) => [new RegExp(`\\b${en}\\b`, 'g'), nl] as [RegExp, string]);

const WOORDEN: [RegExp, string][] = [
  ['archbishop', 'aartsbisschop'], ['bishop', 'bisschop'], ['metropolitan', 'metropoliet'], ['patriarch', 'patriarch'], ['pope', 'paus'],
  ['abbot', 'abt'], ['abbess', 'abdis'], ['priests', 'priesters'], ['priest', 'priester'], ['deacon', 'diaken'], ['monks', 'monniken'],
  ['monk', 'monnik'], ['nun', 'non'], ['hermit', 'kluizenaar'], ['recluse', 'kluizenaar'], ['emperor', 'keizer'], ['empress', 'keizerin'],
  ['prince', 'vorst'], ['princess', 'vorstin'], ['king', 'koning'], ['queen', 'koningin'], ['soldiers', 'soldaten'], ['soldier', 'soldaat'],
  ['brother', 'broer'], ['sister', 'zuster'], ['mother', 'moeder'], ['father', 'vader'], ['wife', 'vrouw'], ['husband', 'man'],
  ['sons', 'zonen'], ['son', 'zoon'], ['daughters', 'dochters'], ['daughter', 'dochter'], ['children', 'kinderen'], ['child', 'kind'],
  ['companions', 'gezellen'], ['disciples', 'leerlingen'], ['disciple', 'leerling'], ['founder', 'stichter'], ['enlightener', 'verlichter'],
  ['teacher', 'leraar'], ['physician', 'arts'], ['virgin', 'maagd'], ['widow', 'weduwe'], ['infant', 'kind'], ['youth', 'jongeling'],
  ['wonderworker', 'wonderdoener'], ['relics', 'relieken'], ['and', 'en'], ['with', 'met'], ['of', 'van'], ['his', 'zijn'], ['her', 'haar'],
  ['their', 'hun'], ['at', 'te'], ['who', 'die'], ['others', 'anderen'], ['many', 'velen'], ['martyred', 'gemarteld'], ['suffered', 'geleden'],
  ['under', 'onder'], ['near', 'bij'], ['from', 'uit'], ['the', 'de'], ['first', 'eerste'], ['second', 'tweede'], ['third', 'derde'],
  ['new', 'nieuwe'], ['holy', 'heilige'], ['great', 'grote'], ['monastery', 'klooster'], ['church', 'kerk'], ['city', 'stad'],
  ['island', 'eiland'], ['mountain', 'berg'], ['desert', 'woestijn'], ['cave', 'grot'], ['river', 'rivier'], ['lake', 'meer'],
  ['ca\\.', 'ca.'],
].map(([en, nl]) => [new RegExp(`\\b${en}\\b`, 'g'), nl] as [RegExp, string]);

export function vertaalLeven(text: string): string {
  let t = text.replace(/\s+/g, ' ').trim();
  t = t.replace(/\bSts\. /g, 'HH. ').replace(/\bSt\. /g, 'H. ').replace(/\bVen\. /g, 'Eerb. ');
  for (const [re, nl] of FRASEN) t = t.replace(re, nl);
  for (const [re, nl] of NAMEN) t = t.replace(re, nl);
  for (const [re, nl] of WOORDEN) t = t.replace(re, nl);
  return t;
}

/** HTC-rangicoon → Nederlandse rang. */
export function rangLabel(icon: string): { label: string; rang: number } | null {
  switch (icon) {
    case '6':
      return { label: 'Groot feest', rang: 6 };
    case '5':
      return { label: 'Vigilie', rang: 5 };
    case '4':
      return { label: 'Polyeleos', rang: 4 };
    case '3':
      return { label: 'Grote doxologie', rang: 3 };
    case '2':
      return { label: 'Zes stichieren', rang: 2 };
    default:
      return null;
  }
}
