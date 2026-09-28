// Zelftest voor src/lib/heiligenSoort.ts — draaien met: npm run check:heiligen
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { categorieenVan, soortVan } from '../src/lib/heiligenSoort';

// Feesten en kalendernotities horen bij de dag, niet in de heiligenlijst.
for (const t of [
  'The Circumcision of Our Lord Jesus Christ.',
  'Forefeast of the Theophany.',
  'Sunday before the Baptism of Our Lord and God and Saviour Jesus Christ',
  'Entire week, fast-free.',
  'Fast Day.',
  'The Universal Exaltation of the Precious and Life-giving Cross.',
  'The Conception by St. Anna of the Most Holy Theotokos.',
  'Voorfeest van de Ontslaping van de Moeder Gods.',
])
  assert.equal(soortVan(t), 'feest', t);

// Iconen van de Moeder Gods.
for (const t of ['"Chernigov-Eletskaya" Icon of the Most Holy Theotokos (1060).', 'Iconen van de Allerheiligste Moeder Gods „Akathist”'])
  assert.equal(soortVan(t), 'icoon', t);

// Heiligen, ook als de naam op een feest of icoon lijkt.
for (const t of [
  'The Dormition of the Righteous Anna, mother of the Most Holy Theotokos',
  'Nativity of St. John the Baptist.',
  'Week of Holy Forefathers',
  'Venerable Ananias the Iconographer of Novgorod (1581).',
  'Venerables Symeon, Theodore (monks), and Euphrosyne, who found the Icon of the Mother of God in the Great Cave',
  'Translation of the relics of St. Martin the Merciful, bishop of Tours (397).',
])
  assert.equal(soortVan(t), 'heilige', t);

// Categorieën (meer dan één mogelijk).
assert.deepEqual(categorieenVan('Hieromartyr Theogenes, bishop of Parium (320).'), ['martelaren', 'hierarchen']);
assert.deepEqual(categorieenVan('Virgin-martyr Eugenia (1933).'), ['martelaren', 'vrouwheiligen']);
assert.ok(categorieenVan('St. Basil, fool-for-Christ of Moscow (1557).').includes('dwazen'));
assert.ok(!categorieenVan('"Kazan" Icon of the Mother of God').includes('vrouwheiligen'), '"Mother of God" is geen vrouwheilige-categorie');
assert.deepEqual(categorieenVan('St. Hubert of Maastricht (727).'), ['overige']);

// Over de hele bron: het overgrote deel blijft heilige.
const dagen = JSON.parse(readFileSync('public/data/dagen.json', 'utf8')) as Record<string, { l?: [string, string][] }>;
const regels = Object.values(dagen).flatMap((d) => (d.l ?? []).map(([, t]) => t));
const heilig = regels.filter((t) => soortVan(t) === 'heilige').length;
assert.ok(heilig / regels.length > 0.9, `${heilig} van ${regels.length} heiligen`);

console.log(`heiligen: alle controles geslaagd (${heilig} van ${regels.length} regels zijn heiligen)`);
