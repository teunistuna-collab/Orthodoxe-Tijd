// Zelftest voor src/lib/psalmen.ts — draaien met: npm run check:psalmen
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { PSALM_BRONNEN, PSALMEN, psalmVanHetUur, zoekPsalmen, type PsalmTeksten } from '../src/lib/psalmen';
import { serviceConfig } from '../src/lib/etmaal';

const teksten = JSON.parse(readFileSync('public/data/psalmen.json', 'utf8')) as PsalmTeksten;

// De lijst met teksten in de code klopt met het gegenereerde bestand (nummers én Hebreeuwse nummering).
const metTekst = Object.entries(PSALM_BRONNEN).filter(([, b]) => b.tekst);
assert.deepEqual(metTekst.map(([n]) => Number(n)).sort((a, b) => a - b), Object.keys(teksten).map(Number).sort((a, b) => a - b));
for (const [n, { mt }] of metTekst) assert.equal(mt, teksten[n].mt, `Hebreeuws nummer van psalm ${n}`);
// Audio: alleen echte bestanden in public/, en alleen via de centrale psalmendata.
for (const [n, { audio }] of Object.entries(PSALM_BRONNEN)) if (audio) assert.ok(existsSync(`public${audio}`), `audiobestand van psalm ${n} ontbreekt: ${audio}`);
assert.equal(PSALMEN.filter((p) => p.audioSrc).length, Object.values(PSALM_BRONNEN).filter((b) => b.audio).length);

assert.equal(PSALMEN.length, 150);
assert.equal(PSALMEN[0].septuagintNumber, 1);
assert.equal(PSALMEN.filter((p) => p.hasText).length, Object.keys(teksten).length);

// Iedere psalm uit het etmaal heeft zijn dienst als gebruik, en een tekst.
for (const dienst of serviceConfig) {
  for (const { title } of dienst.psalms) {
    const p = PSALMEN[Number(title.replace('Psalm ', '')) - 1];
    assert.ok(p.liturgicalUses.some((g) => g.dienst === dienst.title), `${title} in ${dienst.title}`);
    assert.ok(p.hasText, `${title} heeft tekst`);
  }
}

// Psalm van het uur volgt de begintijden van de diensten.
const om = (uur: number) => psalmVanHetUur(new Date(2026, 8, 25, uur, 30));
assert.equal(om(19), 103); // Vespers 18:00
assert.equal(om(22), 50); // Completen 21:00
assert.equal(om(1), 118); // Middernachtdienst 00:00
assert.equal(om(10), 24); // Derde Uur 09:00

// Zoeken: Septuagint- en Hebreeuws nummer, dienst, woord uit de tekst.
assert.deepEqual(zoekPsalmen(PSALMEN, '24', null).map((p) => p.septuagintNumber), [24]);
assert.deepEqual(zoekPsalmen(PSALMEN, 'Psalm 51', null).map((p) => p.septuagintNumber), [51, 50]);
assert.deepEqual(zoekPsalmen(PSALMEN, 'vespers', null).map((p) => p.septuagintNumber), [103, 140]);
assert.ok(zoekPsalmen(PSALMEN, 'allerhoogste', teksten).some((p) => p.septuagintNumber === 90));
assert.equal(zoekPsalmen(PSALMEN, '', null).length, 150);

console.log('psalmen: alle controles geslaagd');
