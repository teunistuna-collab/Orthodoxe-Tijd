// Import van het Heiligenjaar (source/heiligenjaar/heiligen/heiligenMMDD.htm) naar gestructureerde data voor de site.
// Draaien met: node scripts/heiligenjaar.mjs        (schrijft de data en source/heiligenjaar/IMPORTRAPPORT.md)
//
// Uitgangspunten:
// - De bronbestanden worden alleen gelezen, nooit aangepast. De bestandsnaam bepaalt de kerkelijke datum (MMDD).
// - Alleen de daginhoud telt: vanaf de titel ("Heiligenjaar - 4 oktober") tot het slotgebed ("Door de gebeden van
//   deze en al Uw heiligen …") of de markering "EINDE HOOFDTEKST". Menu's, vorige/volgende-links, scripts, het
//   slotgebed en de bronvermelding horen niet bij de inhoud.
// - Een vermelding = een tekstblok tussen twee witregels (<br><br>); <br> binnen een blok = nieuwe alinea. Een blok
//   wordt nooit opgesplitst, ook niet als er meerdere vetgedrukte namen in staan. Een blok zonder vetgedrukte naam en
//   zonder eigen opening ("De heilige …", "Eveneens op deze dag …", een feest of icoon) is het vervolg van het vorige
//   verhaal en blijft bij die vermelding (tekst en titel bij elkaar); elk geval staat in het rapport.
// - De Nederlandse tekst blijft letterlijk, ook met tikfouten uit de bron. Alleen technisch: tags weg, HTML-entiteiten
//   en tekencodering herstellen (de bron mengt Windows-1252 en UTF-8), witruimte samenvoegen, en het lage
//   aanhalingsteken ‚ dat in de bron als komma staat (U+201A gevolgd door een spatie) wordt een komma.
// - Indeling: 'feast' als het blok een kerkelijk feest of heilsfeit noemt; 'other' voor relieken, iconen en andere
//   gedachtenissen; 'saint' als het blok een heilige of groep heiligen beschrijft. Bij twijfel 'other' met needsReview.
// - 28 februari bevat in de bron ook het deel "29 februari" (voor jaren zonder 29 februari). Dat deel is gelijk aan
//   heiligen0229.htm en wordt niet dubbel opgenomen; de site toont 29 februari op 28 februari als die dag ontbreekt.
// - Afbeeldingen: alleen als verwijzing bewaard (de bestanden blijven in de bronmap). Een afbeelding binnen een blok
//   hoort bij dat blok; een afbeelding vóór het eerste blok bij de dag.
// Deterministisch: dezelfde bron geeft dezelfde uitvoer. Geen netwerk, geen AI.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const BRON = 'source/heiligenjaar/heiligen';
const IMPORT_VERSIE = 1;
const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const DAGEN_IN_MAAND = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const BEELD = '\u0001'; // merkteken voor de plaats van een afbeelding in de tekst

// --- tekencodering -----------------------------------------------------------------------------------------------
const CP1252 = { 0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…', 0x86: '†', 0x87: '‡', 0x88: 'ˆ', 0x89: '‰', 0x8a: 'Š', 0x8b: '‹', 0x8c: 'Œ', 0x8e: 'Ž', 0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—', 0x98: '˜', 0x99: '™', 0x9a: 'š', 0x9b: '›', 0x9c: 'œ', 0x9e: 'ž', 0x9f: 'Ÿ' };
let utf8Reeksen = 0;
// Per byte: een geldige UTF-8-reeks wordt als UTF-8 gelezen, anders als Windows-1252 (bytes 0x80–0x9F) / Latin-1.
function decodeer(buf) {
  let uit = '';
  for (let i = 0; i < buf.length; ) {
    const b = buf[i];
    if (b < 0x80) { uit += String.fromCharCode(b); i++; continue; }
    const lengte = b >= 0xf0 && b < 0xf5 ? 4 : b >= 0xe0 && b < 0xf0 ? 3 : b >= 0xc2 && b < 0xe0 ? 2 : 0;
    if (lengte && i + lengte <= buf.length && [...buf.subarray(i + 1, i + lengte)].every((c) => c >= 0x80 && c < 0xc0)) {
      uit += buf.subarray(i, i + lengte).toString('utf8'); i += lengte; utf8Reeksen++; continue;
    }
    uit += CP1252[b] ?? String.fromCharCode(b); i++;
  }
  return uit;
}
const ENTITEITEN = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", euml: 'ë', iuml: 'ï', ouml: 'ö', uuml: 'ü', auml: 'ä', Euml: 'Ë', Iuml: 'Ï', Ouml: 'Ö', Uuml: 'Ü', eacute: 'é', egrave: 'è', ecirc: 'ê', Eacute: 'É', aacute: 'á', agrave: 'à', acirc: 'â', oacute: 'ó', ograve: 'ò', ocirc: 'ô', uacute: 'ú', ugrave: 'ù', ucirc: 'û', iacute: 'í', icirc: 'î', ccedil: 'ç', ntilde: 'ñ', szlig: 'ß', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', bdquo: '„', sbquo: '‚', hellip: '…', ndash: '–', mdash: '—', dagger: '†', middot: '·', laquo: '«', raquo: '»', deg: '°' };
const onbekendeEntiteiten = new Set();
function entiteiten(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => (n in ENTITEITEN ? ENTITEITEN[n] : (onbekendeEntiteiten.add(m), m)));
}
let kommasHersteld = 0;
const schoon = (s) => entiteiten(s).replace(/‚(?=,)/g, () => (kommasHersteld++, '')).replace(/‚(?=[\s;.])/g, () => (kommasHersteld++, ',')).replace(/\s+/g, ' ').trim();
// HTML van één alinea naar tekst: inline-tags verdwijnen zonder spatie, andere tags worden een spatie.
const naarTekst = (html) => schoon(html.split(BEELD).filter((_, i) => i % 2 === 0).join(' ').replace(/<\/?(b|i|u|em|strong|font|span|a|sup|sub|small|big)\b[^>]*>/gi, '').replace(/<[^>]+>/g, ' ')).replace(/\s+([,.;:)])/g, '$1').replace(/\(\s+/g, '(').replace(/\s*>$/, ''); // losse ">" = rest van een tag in de bron

// --- indeling -----------------------------------------------------------------------------------------------------
const VERVOLG_OPENING = /^(ook|eveneens|tevens|en ook|verder|daarnaast|samen met (hem|haar|hen)|we gedenken|wij gedenken|verder gedenken we|op deze dag|op dezelfde dag|gedachtenis|de gedachtenis)/i;
const HEILIG_WOORD = /\b(heilige|heillge|heilge|heiligen|gelukzalige|zalige|eerbiedwaardige|rechtvaardige|gerechte|apostel|apostelen|profeet|profetes|grootmartelaar|grootmartelares|martelaar|martelares|martelaren|martelaressen|belijder|belijders|kluizenaar|kluizenares|voorvaders|vaders)\b/i;
const RELIEK_ICOON = /\b(relieken|reliek|gebeente|icoon|ikoon|iconen|ikonen)\b|\b(gordel|kleed|mantel|ketenen|hoofd) van de (heilige|allerheiligste|moeder|apostel|voorloper|profeet)|^sint peters banden/i;
const FEEST = /^(de\s+|het\s+)?(besnijdenis des heren|geboorte (van|des|in het vlees)|teruggave|voorfeest|nafeest|theofanie|godsverschijning|doop des heren|ontmoeting|blijde boodschap|verkondiging|transfiguratie|gedaanteverandering|verheerlijking|ontslaping van de (allerheiligste|moeder gods|hoogheilige|heilige moeder gods)|opdracht|intrede|kruisverheffing|verheffing van het|bescherming|synax|feest|begin van het kerkelijk|onthoofding van|vinding van het (kostbaar|heilig)|het kostbaar|het heilig kruis|zeventig apostelen|twaalf apostelen|ontvangenis|tempelgang|pokrov|uitdraging van het|verschijning van het heilig kruis|kerkwijding)/i;
const OPENING_ZIN = (t) => t.slice(0, 220);

function bloknamen(html) {
  // Vetgedrukte namen; de bron sluit soms met </b> waar <b> bedoeld is, zulke stukken worden niet als naam gelezen.
  return [...html.matchAll(/<b\b[^>]*>([\s\S]*?)<\/b>/gi)].map((m) => naarTekst(m[1]).replace(/[\s,;:.‚]+$/, '')).filter((n) => n && n.length < 160);
}

function deel(blokken, bestand, md) {
  const vermeldingen = [], dagBeelden = [], samengevoegd = [];
  for (const blokHtml of blokken) {
    const beelden = [...blokHtml.matchAll(/\u0001(\d+)\u0001/g)].map((m) => +m[1]);
    const alineas = blokHtml.split(/<br\s*\/?>/i).map(naarTekst).filter(Boolean);
    if (!alineas.length) { (vermeldingen.length ? vermeldingen[vermeldingen.length - 1].beelden : dagBeelden).push(...beelden); continue; }
    const namen = [...new Set(bloknamen(blokHtml))];
    const eerste = alineas[0], opening = OPENING_ZIN(eerste);
    const zonderLeeg = blokHtml.replace(/\u0001\d+\u0001/g, '').replace(/^(\s|&nbsp;|<\/?(font|center|p|span|div)[^>]*>)*/i, '');
    const begintVet = /^<b\b/i.test(zonderLeeg);
    // vervolg van het vorige verhaal; ook na een feest dat alleen uit zijn titel bestaat (Kerstmis: titel, daarna het verhaal)
    const vorigeV = vermeldingen[vermeldingen.length - 1];
    const naAlleenTitel = vorigeV?.type === 'feast' && vorigeV.text.length === 1 && vorigeV.text[0].length < 200 && !VERVOLG_OPENING.test(eerste) && !/^(de|het)\s+heilig/i.test(eerste);
    if (naAlleenTitel || !namen.length && vermeldingen.length && !VERVOLG_OPENING.test(eerste) && !FEEST.test(eerste) && !RELIEK_ICOON.test(opening) && !/^(de|het)\s/i.test(eerste) && !HEILIG_WOORD.test(eerste.slice(0, 60))) {
      const vorige = vermeldingen[vermeldingen.length - 1];
      vorige.text.push(...alineas); vorige.beelden.push(...beelden);
      samengevoegd.push(`${bestand} · bij "${vorige.title}": ${eerste.slice(0, 90)}…`); continue;
    }
    let type = 'other', needsReview = false;
    const titelBron = begintVet && namen[0] ? namen[0] : eerste;
    if (FEEST.test(titelBron) && !RELIEK_ICOON.test(titelBron)) type = 'feast';
    else if (RELIEK_ICOON.test(begintVet ? titelBron : opening.split(/[.;:]/)[0].slice(0, 70)) && !/^(ook|eveneens)/i.test(eerste)) type = 'other';
    else if (namen.length && HEILIG_WOORD.test(opening)) type = 'saint';
    // "De priester-martelaar Petros …", "De monnik Nikeforos …": een persoon met een aanduiding vooraf (ook met tikfouten uit de bron)
    else if (/^(eveneens op,? deze dag |ook op deze dag )?(de|het)\s+(heilig\w*|\w*-?mart\w*|monnik\w*|wonderwerker|hegoumen|abt|abdis|bisschop|priester|diaken|kluizenaar\w*|aartsengel|profeet|apostel)/i.test(eerste)) type = 'saint';
    else if (namen.length && begintVet) { type = 'saint'; needsReview = true; }
    else needsReview = true;
    // Een synaxis van een groep heiligen ("Synax van de heilige vaders van het Holenklooster") is een heiligengedachtenis.
    if (type === 'feast' && /^synax/i.test(eerste) && /\b(heilige vaders|heiligen|martelaren)\b/i.test(eerste.slice(0, 90))) type = 'saint';
    // Een te algemene vetgedrukte titel ("Synax") wordt de eerste zin.
    const feestTitel = begintVet && namen[0] && namen[0].length > 8 ? namen[0] : eerste.split(/[.:(]/)[0].trim();
    const title = type === 'feast'
      ? feestTitel.replace(/[\s.]+$/, '')
      : type === 'saint' && /^synax/i.test(eerste) ? eerste.split(/[.:(]/)[0].trim()
      : namen.length ? namen.join(', ') : eerste.split(/[.:]/)[0].slice(0, 90).trim();
    vermeldingen.push({ title, namen, alineas, type, needsReview, beelden, text: alineas });
  }
  return { vermeldingen, dagBeelden, samengevoegd };
}

function verwerkDag(bestand) {
  const mmdd = bestand.slice(8, 12);
  const maand = +mmdd.slice(0, 2), dag = +mmdd.slice(2, 4);
  const ruw = decodeer(readFileSync(`${BRON}/${bestand}`));
  const problemen = [];
  const begin = ruw.indexOf('BEGIN TEKSTBLOK'), eind = ruw.indexOf('EINDE HOOFDTEKST');
  if (begin < 0 || eind < 0 || eind < begin) return { md: `${maand}-${dag}`, sourceFile: bestand, problemen: ['markeringen BEGIN TEKSTBLOK / EINDE HOOFDTEKST niet gevonden'] };
  let inhoud = ruw.slice(begin, ruw.lastIndexOf('<!--', eind));
  const slot = inhoud.search(/<i>\s*Door de gebeden van deze en al Uw heiligen/i);
  if (slot >= 0) inhoud = inhoud.slice(0, slot);
  const titel = inhoud.match(/Heiligenjaar\s*(?:&nbsp;|\s)*-\s*(?:&nbsp;|\s)*(\d{1,2})\s+([a-z]+)/i);
  if (!titel) problemen.push('titelregel "Heiligenjaar - …" niet gevonden');
  else if (+titel[1] !== dag || titel[2].toLowerCase() !== MAANDEN[maand - 1]) problemen.push(`titel zegt ${titel[1]} ${titel[2]}, bestandsnaam ${dag} ${MAANDEN[maand - 1]}`);
  const naTitel = inhoud.search(/<\/span>/i);
  inhoud = inhoud.slice(naTitel >= 0 ? naTitel + 7 : 0).replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/gi, '');
  let schrikkelDeel = null;
  const schrikkel = inhoud.search(/<br>\s*<center>\s*<span[^>]*>\s*(&nbsp;|\s)*-(&nbsp;|\s)*29 februari/i);
  if (mmdd === '0228' && schrikkel >= 0) { schrikkelDeel = inhoud.slice(schrikkel); inhoud = inhoud.slice(0, schrikkel); }
  const afbeeldingen = [];
  inhoud = inhoud.replace(/<img\b[^>]*src\s*=\s*"?([^"\s>]+)"?[^>]*>/gi, (_, src) => { afbeeldingen.push(src); return ` ${BEELD}${afbeeldingen.length - 1}${BEELD} `; });
  const blokken = inhoud.split(/(?:<br\s*\/?>(?:\s|&nbsp;|<\/?p>)*){2,}/i);
  const { vermeldingen, dagBeelden, samengevoegd } = deel(blokken, bestand, mmdd);
  if (!vermeldingen.length) problemen.push('geen vermeldingen gevonden');
  const md = `${maand}-${dag}`;
  return {
    month: maand, day: dag, md, sourceFile: bestand, schrikkelDeel, samengevoegd, problemen,
    ...(dagBeelden.length ? { sourceImages: dagBeelden.map((i) => afbeeldingen[i]) } : {}),
    commemorations: vermeldingen.map((v, i) => ({
      id: `hj-${String(maand).padStart(2, '0')}${String(dag).padStart(2, '0')}-${i + 1}`,
      title: v.title,
      ...(v.namen.length ? { names: v.namen } : {}),
      text: v.text,
      type: v.type,
      ...(v.needsReview ? { needsReview: true } : {}),
      sourceFile: bestand,
      ...(v.beelden.length ? { sourceImages: v.beelden.map((b) => afbeeldingen[b]) } : {}),
    })),
  };
}

// --- validatie van de bron ----------------------------------------------------------------------------------------
const bestanden = readdirSync(BRON).filter((f) => /^heiligen\d{4}\.htm$/i.test(f)).sort();
const verwacht = DAGEN_IN_MAAND.flatMap((n, m) => Array.from({ length: n }, (_, d) => `heiligen${String(m + 1).padStart(2, '0')}${String(d + 1).padStart(2, '0')}.htm`));
const ontbrekend = verwacht.filter((f) => !bestanden.includes(f));
const onverwacht = bestanden.filter((f) => !verwacht.includes(f));
const leeg = bestanden.filter((f) => readFileSync(`${BRON}/${f}`).length < 200);
const dagen = bestanden.filter((f) => verwacht.includes(f)).map(verwerkDag);
const ontbrekendeBeelden = new Set();
for (const d of dagen) for (const src of [...(d.sourceImages ?? []), ...(d.commemorations ?? []).flatMap((c) => c.sourceImages ?? [])]) {
  if (/^https?:/.test(src) || src.startsWith('../')) continue;
  if (!existsSync(`${BRON}/${src}`)) ontbrekendeBeelden.add(src);
}
// het deel "29 februari" op 28 februari moet gelijk zijn aan heiligen0229.htm
const d228 = dagen.find((d) => d.sourceFile === 'heiligen0228.htm'), d229 = dagen.find((d) => d.sourceFile === 'heiligen0229.htm');
let schrikkelGelijk = 'niet gevonden';
if (d228?.schrikkelDeel && d229) {
  const tekst = naarTekst(d228.schrikkelDeel.replace(/<br\s*\/?>/gi, ' ').replace(/<img[^>]*>/gi, ' '));
  schrikkelGelijk = d229.commemorations.every((c) => c.text.every((a) => tekst.includes(a)))
    ? 'gelijk aan heiligen0229.htm; niet dubbel opgenomen (de site toont 29 februari op 28 februari als die dag in het jaar ontbreekt)'
    : 'WIJKT AF van heiligen0229.htm — controleren';
}

// --- uitvoer ------------------------------------------------------------------------------------------------------
// 1. src/lib/heiligenjaar.index.json: per kerkelijke dag de vermeldingen zonder tekst (lijsten, Vandaag, zoeken).
// 2. public/data/heiligenjaar/MM.json: volledige teksten en bronverwijzingen per maand (leesvensters, pas bij gebruik geladen).
const index = {};
const perMaand = Array.from({ length: 12 }, () => ({}));
for (const d of dagen) {
  if (!d.commemorations) continue;
  // opening = begin van de eerste alinea (letterlijk), voor de categorieën (martelaar, bisschop …) op de Heiligen-pagina
  index[d.md] = d.commemorations.map(({ id, title, names, type, needsReview, text }) => ({ id, title, ...(names ? { names } : {}), opening: text[0].slice(0, 100), type, ...(needsReview ? { needsReview } : {}) }));
  perMaand[d.month - 1][d.md] = { sourceFile: d.sourceFile, ...(d.sourceImages ? { sourceImages: d.sourceImages } : {}), commemorations: d.commemorations };
}
writeFileSync('src/lib/heiligenjaar.index.json', JSON.stringify({ importVersion: IMPORT_VERSIE, days: index }));
mkdirSync('public/data/heiligenjaar', { recursive: true });
perMaand.forEach((m, i) => writeFileSync(`public/data/heiligenjaar/${String(i + 1).padStart(2, '0')}.json`, JSON.stringify({ importVersion: IMPORT_VERSIE, days: m })));

// --- rapport ------------------------------------------------------------------------------------------------------
const alle = dagen.flatMap((d) => d.commemorations ?? []);
const tel = (t) => alle.filter((c) => c.type === t).length;
const twijfel = alle.filter((c) => c.needsReview);
const samengevoegd = dagen.flatMap((d) => d.samengevoegd ?? []);
const regels = [
  `# Importrapport Heiligenjaar (importVersion ${IMPORT_VERSIE})`, '',
  `- HTML-dagbestanden gevonden: ${bestanden.length} (verwacht 366)`,
  `- Ontbrekende dagen: ${ontbrekend.length ? ontbrekend.join(', ') : 'geen'}`,
  `- Onverwachte dagbestanden: ${onverwacht.length ? onverwacht.join(', ') : 'geen'}`,
  `- Lege bestanden: ${leeg.length ? leeg.join(', ') : 'geen'}`,
  `- Verwerkte dagen: ${dagen.filter((d) => d.commemorations?.length).length}`,
  `- Vermeldingen: ${alle.length} (heiligen ${tel('saint')}, feesten ${tel('feast')}, overig ${tel('other')})`,
  `- Twijfelgevallen (needsReview): ${twijfel.length}`,
  `- Vervolgalinea's bij de vorige vermelding gehouden: ${samengevoegd.length}`,
  `- Dagen met afbeeldingen: ${dagen.filter((d) => d.sourceImages || d.commemorations?.some((c) => c.sourceImages)).length}`,
  `- Afbeeldingen gekoppeld aan een vermelding: ${alle.reduce((n, c) => n + (c.sourceImages?.length ?? 0), 0)}, alleen aan een dag: ${dagen.reduce((n, d) => n + (d.sourceImages?.length ?? 0), 0)}`,
  `- Verwijzingen naar ontbrekende afbeeldingen: ${ontbrekendeBeelden.size ? [...ontbrekendeBeelden].join(', ') : 'geen'}`,
  `- Tekencodering: ${utf8Reeksen} UTF-8-reeksen in Windows-1252-bestanden correct gelezen; ${kommasHersteld} als komma gebruikte ‚ hersteld`,
  `- Onbekende HTML-entiteiten: ${onbekendeEntiteiten.size ? [...onbekendeEntiteiten].join(' ') : 'geen'}`,
  `- 28 februari, deel "29 februari": ${schrikkelGelijk}`,
  `- Parseproblemen: ${dagen.reduce((n, d) => n + d.problemen.length, 0)}`,
  ...dagen.flatMap((d) => d.problemen.map((p) => `  - ${d.sourceFile}: ${p}`)),
  '', '## Feesten', '',
  ...dagen.flatMap((d) => (d.commemorations ?? []).filter((c) => c.type === 'feast').map((c) => `- ${d.md} · ${c.title}${c.needsReview ? ' (twijfel)' : ''}`)),
  '', '## Twijfelgevallen (needsReview)', '',
  ...twijfel.map((c) => `- ${c.sourceFile} · ${c.type} · ${c.text[0].slice(0, 120)}…`),
  '', "## Vervolgalinea's bij de vorige vermelding gehouden", '',
  ...samengevoegd.map((x) => `- ${x}`),
];
writeFileSync('source/heiligenjaar/IMPORTRAPPORT.md', regels.join('\n') + '\n');
console.log(regels.slice(0, 18).join('\n'));
