// Zelftest voor de heiligendata (Heiligenjaar + Heiligen van de Lage Landen) — draaien met: npm run check:heiligen
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ALLE_HEILIGEN, HEILIGEN } from '../src/lib/heiligen';
import { LAGE_LANDEN } from '../src/lib/lageLanden';
import { FEEST_HEILIGENJAAR } from '../src/lib/feestHeiligenjaar';
import { DERTIEN, OVERIGE_VASTE } from '../src/lib/feesten';
import { categorieenVan } from '../src/lib/heiligenSoort';
import { feestenUitHeiligenjaar, heiligeTitel, heiligenVanDag } from '../src/lib/heiligenPopup';

// Alle 366 kerkelijke dagen, ook 29 februari.
const DAGEN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31].flatMap((n, m) => Array.from({ length: n }, (_, d) => `${m + 1}-${d + 1}`));
assert.equal(DAGEN.length, 366);
for (const md of DAGEN) assert.ok(HEILIGEN[md]?.length, `geen vermeldingen op ${md}`);

// Heiligen van de Lage Landen: allemaal aanwezig en gemarkeerd; een gekoppelde Heiligenjaar-vermelding staat er niet dubbel.
assert.equal(LAGE_LANDEN.length, 18);
for (const h of LAGE_LANDEN) {
  assert.ok(HEILIGEN[h.md].some((x) => x.nl && x.naam === h.naam), `${h.naam} ontbreekt`);
  if (h.heiligenjaar) assert.ok(!HEILIGEN[h.md].some((x) => x.id === h.heiligenjaar), `${h.heiligenjaar} dubbel`);
}
assert.ok(ALLE_HEILIGEN.filter((h) => h.nl).length === 18 && !ALLE_HEILIGEN.some((h) => h.nl && h.id.startsWith('hj-')), 'alleen de Lage Landen dragen de markering');

// Feestteksten: elk gekoppeld id is een feest uit het Heiligenjaar op de datum van het feest van de site.
const maand = (id: string) => JSON.parse(readFileSync(`public/data/heiligenjaar/${id.slice(3, 5)}.json`, 'utf8')) as { days: Record<string, { commemorations: { id: string; type: string; text: string[] }[] }> };
const feesten = [...DERTIEN, ...OVERIGE_VASTE];
for (const [feestId, hjId] of Object.entries(FEEST_HEILIGENJAAR)) {
  const f = feesten.find((x) => x.id === feestId);
  assert.ok(f?.md, `feest ${feestId} onbekend of zonder vaste datum`);
  const v = maand(hjId).days[f.md]?.commemorations.find((c) => c.id === hjId);
  assert.ok(v && v.type === 'feast', `${hjId} is geen feest op ${f.md}`);
}

// Handmatig nagekeken dagen (zie source/heiligenjaar/IMPORTRAPPORT.md).
assert.equal(HEILIGEN['10-4'][0].naam, 'Hiërotheos');
assert.equal(HEILIGEN['1-1'][0].naam, 'Besnijdenis des Heren');
assert.equal(HEILIGEN['1-1'][0].type, 'feast');
assert.equal(HEILIGEN['2-29'][0].naam, 'Johannes Cassianus');
assert.equal(HEILIGEN['12-31'][0].naam, 'Teruggave van Kerst');
assert.ok(maand('hj-1004-1').days['10-4'].commemorations[0].text[0].startsWith('De bisschop-martelaar Hiërotheos, van Athene,'));
// Feesten staan niet tussen de heiligen van de dag.
assert.ok(!heiligenVanDag('1-1', HEILIGEN, '2027-01-14').some((h) => h.type === 'feast'));
assert.equal(feestenUitHeiligenjaar('1-1', HEILIGEN, '2027-01-14')[0].naam, 'Besnijdenis des Heren');

// 29 februari: in een jaar zonder 29 februari op 28 februari (zo staat het in de bron).
assert.ok(heiligenVanDag('2-28', HEILIGEN, '2027-03-13').some((h) => h.naam === 'Johannes Cassianus'), 'geen schrikkeljaar');
assert.ok(!heiligenVanDag('2-28', HEILIGEN, '2028-03-12').some((h) => h.naam === 'Johannes Cassianus'), 'schrikkeljaar');

// Categorieën uit het begin van de brontekst.
const cat = (id: string) => categorieenVan(`${ALLE_HEILIGEN.find((h) => h.id === id)?.opening ?? ''}`);
assert.ok(cat('hj-1004-1').includes('martelaren') && cat('hj-1004-1').includes('hierarchen'), 'bisschop-martelaar');
assert.deepEqual(categorieenVan('De heilige martelares Columba'), ['martelaren', 'vrouwheiligen']);
assert.equal(heiligeTitel('Serafim van Sarov'), 'H. Serafim van Sarov');
assert.equal(heiligeTitel('Profeet Malachias'), 'Profeet Malachias');

const tel = (t: string) => ALLE_HEILIGEN.filter((h) => h.type === t).length;
console.log(`heiligen: alle controles geslaagd (${ALLE_HEILIGEN.length} vermeldingen: ${tel('saint')} heiligen, ${tel('feast')} feesten, ${tel('other')} overig; ${LAGE_LANDEN.length} Lage Landen)`);
