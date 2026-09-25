// Haalt het leesrooster van één kerkjaar (juliaans) op bij holytrinityorthodox.com, in hetzelfde formaat als
// public/data/dagen.json (r) en public/data/lezingen-MM.json.
//
//   node scripts/htc-rooster.mjs 2027            → public/data/2027/rooster.json + public/data/2027/lezingen-MM.json
//   node scripts/htc-rooster.mjs 2026 --vergelijk → haalt een steekproef uit 2026 en vergelijkt met de bestaande bestanden
//
// Het juliaanse jaar J loopt van 14 januari J t/m 13 januari J+1 (burgerlijk; geldig 1900–2099).
// Antwoorden worden bewaard in node_modules/.cache/htc, zodat een tweede run niets opnieuw hoeft op te halen.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const jaar = Number(process.argv[2]);
const vergelijk = process.argv.includes('--vergelijk');
if (!(jaar >= 1901 && jaar <= 2098)) throw new Error('Gebruik: node scripts/htc-rooster.mjs <juliaans jaar> [--vergelijk]');

const CACHE = 'node_modules/.cache/htc';
await mkdir(CACHE, { recursive: true });

const slaap = (ms) => new Promise((r) => setTimeout(r, ms));
async function haal(url) {
  const bestand = `${CACHE}/${createHash('sha1').update(url).digest('hex')}.html`;
  if (existsSync(bestand)) return readFile(bestand, 'utf8');
  for (let poging = 1; ; poging++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'OrthodoxeTijd leesrooster-update' } });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      const html = await res.text();
      await writeFile(bestand, html);
      await slaap(150); // rustig aan voor de bron
      return html;
    } catch (e) {
      if (poging >= 4) throw e;
      await slaap(1000 * poging);
    }
  }
}

const ENTITEITEN = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
const tekst = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, e) => (ENTITEITEN[e] ?? (e[0] === '#' ? String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : m)))
    .replace(/\s+/g, ' ')
    .trim();

const MAANDEN_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ymd = (d) => d.toISOString().slice(0, 10);

/** Eén dag: header en lezingsverwijzingen (met url van de tekst). */
async function dag(julM, julD) {
  const civiel = new Date(Date.UTC(jaar, julM - 1, julD + 13));
  const url = `https://www.holytrinityorthodox.com/calendar/calendar.php?month=${civiel.getUTCMonth() + 1}&today=${civiel.getUTCDate()}&year=${civiel.getUTCFullYear()}&dt=1&header=1&lives=0&trp=0&scripture=1`;
  const html = await haal(url);
  const kop = tekst(html.match(/<span class="dataheader">([\s\S]*?)<\/span>/)?.[1] ?? '');
  if (!kop.endsWith(`/ ${MAANDEN_EN[julM - 1]} ${julD}, ${jaar}`)) throw new Error(`Onverwachte datumkop voor ${julM}-${julD}: "${kop}"`);
  const h = tekst((html.match(/<p class="pheaderheader">([\s\S]*?)<\/p>/)?.[1] ?? '').replace(/<br\s*\/?>/gi, ' | ')).replace(/\s*\|$/, '');
  const blok = html.split('The Scripture Readings')[1] ?? '';
  // Soms staan twee lezingen op één regel ("… of …"): het label loopt tot de volgende link of regeleinde.
  // De kalender linkt naar de oude tekstpagina's (windows-1251); dezelfde tekst staat in UTF-8 onder /htc/ocalendar/.
  const modern = (u) => u.replace(/^https?:\/\/www\.holytrinityorthodox\.com\/calendar\//, 'https://www.holytrinityorthodox.com/htc/ocalendar/');
  const r = [...blok.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>([\s\S]*?)(?=<a |<br)/gi)].map((m) => ({ ref: tekst(m[2]), tag: tekst(m[3]), url: modern(m[1]) }));
  return { c: ymd(civiel), h, r };
}

/** De tekst van één lezing, vers voor vers. */
async function lezing(url) {
  const html = await haal(url);
  return [...html.matchAll(/<sup>([^<]*)<\/sup>[\s\S]*?<p class="ofd_los_body">([\s\S]*?)<\/p>/g)].map((m) => ({ num: tekst(m[1]), text: tekst(m[2]) }));
}

// Alle dagen van het juliaanse jaar (in een juliaans schrikkeljaar heeft februari 29 dagen).
const dagen = [];
for (let m = 1; m <= 12; m++) {
  const aantal = [31, jaar % 4 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  for (let d = 1; d <= aantal; d++) dagen.push([m, d]);
}
const selectie = vergelijk ? dagen.filter((_, i) => i % 23 === 0) : dagen;

// Met 3 tegelijk ophalen.
async function parallel(items, n, fn) {
  const uit = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; uit[k] = await fn(items[k], k); } }));
  return uit;
}

let klaar = 0;
const rooster = {};
const lezingen = {};
await parallel(selectie, 3, async ([m, d]) => {
  const dg = await dag(m, d);
  const sleutel = `${m}-${d}`;
  rooster[sleutel] = { c: dg.c, h: dg.h, r: dg.r.map(({ ref, tag }) => ({ ref, tag })) };
  lezingen[sleutel] = await parallel(dg.r, 2, async (l) => ({ ref: l.ref, tag: l.tag, url: l.url, verses: await lezing(l.url) }));
  if (++klaar % 25 === 0) console.log(`${klaar}/${selectie.length} dagen`);
});

const leeg = Object.entries(lezingen).flatMap(([k, ls]) => ls.filter((l) => !l.verses.length).map((l) => `${k} ${l.ref}`));
if (leeg.length) console.warn(`Let op: ${leeg.length} lezingen zonder verzen:`, leeg.slice(0, 10));

if (vergelijk) {
  // Steekproef naast de bestaande bestanden leggen (dag, lezingen en teksten moeten exact gelijk zijn).
  const oud = JSON.parse(await readFile('public/data/dagen.json', 'utf8'));
  let verschil = 0;
  for (const [k, v] of Object.entries(rooster)) {
    const o = oud[k];
    if (o.c !== v.c || JSON.stringify(o.r) !== JSON.stringify(v.r) || o.h !== v.h) { verschil++; console.log('VERSCHIL dag', k, { oud: { c: o.c, h: o.h, r: o.r }, nieuw: v }); }
    const oudeTekst = JSON.parse(await readFile(`public/data/lezingen-${k.split('-')[0].padStart(2, '0')}.json`, 'utf8'))[k] ?? [];
    if (JSON.stringify(oudeTekst) !== JSON.stringify(lezingen[k])) {
      verschil++;
      const i = oudeTekst.findIndex((l, n) => JSON.stringify(l) !== JSON.stringify(lezingen[k][n]));
      console.log('VERSCHIL tekst', k, JSON.stringify(oudeTekst[i]).slice(0, 300), '\n  nieuw:', JSON.stringify(lezingen[k][i]).slice(0, 300));
    }
  }
  console.log(`Vergeleken: ${Object.keys(rooster).length} dagen, ${verschil} verschillen`);
  process.exit(verschil ? 1 : 0);
}

const map = `public/data/${jaar}`;
await mkdir(map, { recursive: true });
const gesorteerd = (o) => Object.fromEntries(dagen.map(([m, d]) => `${m}-${d}`).filter((k) => o[k]).map((k) => [k, o[k]]));
await writeFile(`${map}/rooster.json`, JSON.stringify(gesorteerd(rooster)));
for (let m = 1; m <= 12; m++) {
  const deel = Object.fromEntries(Object.entries(gesorteerd(lezingen)).filter(([k]) => k.startsWith(`${m}-`)));
  await writeFile(`${map}/lezingen-${String(m).padStart(2, '0')}.json`, JSON.stringify(deel));
}
console.log(`Klaar: ${Object.keys(rooster).length} dagen → ${map}/`);
