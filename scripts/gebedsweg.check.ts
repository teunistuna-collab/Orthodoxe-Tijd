// Controle van de gebedsweg (lib/gebedsweg.ts): volgorde, beschikbaarheid, aangeleverde bestanden, adressen.
// Draaien: npm run check:gebedsweg
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { serviceConfig, slugVan } from '../src/lib/etmaal';
import { KORT, bidPad, gebedTitel, isAvonduur, leesUurBestand, onderdelenVan, stapIndex } from '../src/lib/gebedsweg';

const uur = (titel: string) => serviceConfig.find((d) => d.title === titel)!;
const alles = () => true;

// Standaardvolgorde: de opening, dan de psalmen van het uur
const vespers = onderdelenVan(uur('Vespers'), null, alles, true);
assert.deepEqual(vespers.map((o) => o.titel), ['Inleidende gebeden', 'Psalm 103', 'Psalm 140']);
assert.ok(vespers.every((o) => o.beschikbaar));
assert.equal(vespers[1].soort === 'psalm' && vespers[1].pdf, '/data/pdfs/Psalm 103.pdf');

// GEBEDEN_ZICHTBAAR uit: de opening volgt nog, de psalmen niet
assert.deepEqual(onderdelenVan(uur('Vespers'), null, alles, false).map((o) => o.beschikbaar), [false, true, true]);

// Psalm zonder losse tekst
assert.deepEqual(onderdelenVan(uur('Vespers'), null, (nr) => nr !== 140, true).map((o) => o.beschikbaar), [true, true, false]);

// Aangeleverd bestand vervangt de volgorde; tekst null en een onbekend gebed volgen nog
const bestand = leesUurBestand({
  onderdelen: [
    { gebed: 'inleidende-gebeden-pdf' },
    { titel: 'Lichtgebeden', tekst: null },
    { psalm: 140 },
    { titel: 'Avondlied', tekst: 'Vreugdevol licht' },
    { gebed: 'bestaat-niet' },
  ],
});
assert.ok(bestand);
assert.deepEqual(
  onderdelenVan(uur('Vespers'), bestand, alles, true).map((o) => [o.titel, o.beschikbaar]),
  [['Inleidende gebeden', true], ['Lichtgebeden', false], ['Psalm 140', true], ['Avondlied', true], ['bestaat-niet', false]],
);
// Een tekst van alleen spaties telt als ontbrekend
assert.equal(onderdelenVan(uur('Vespers'), leesUurBestand({ onderdelen: [{ titel: 'Leeg', tekst: '  ' }] }), alles, true)[0].beschikbaar, false);

// Kapot of onbekend van vorm: geen bestand, dus de standaard
for (const kapot of [null, 'tekst', {}, { onderdelen: 'x' }, { onderdelen: [{ psalm: 0 }] }, { onderdelen: [{ psalm: 151 }] }, { onderdelen: [{ titel: 3, tekst: null }] }, { onderdelen: [{}] }])
  assert.equal(leesUurBestand(kapot), null, JSON.stringify(kapot));

// Geen enkel onderdeel met tekst
assert.equal(onderdelenVan(uur('Completen'), null, () => false, false).some((o) => o.beschikbaar), false);

// Kort
assert.deepEqual(KORT.map((s) => s.soort), ['kernvers', 'jezusgebed']);

// Stapnummers (1-gebaseerd in het adres, 0-gebaseerd terug)
assert.equal(stapIndex('1', 2), 0);
assert.equal(stapIndex('2', 2), 1);
for (const fout of ['0', '3', 'abc', '', '1.5', undefined]) assert.equal(stapIndex(fout, 2), null, String(fout));

// Adressen
assert.equal(bidPad('vespers'), '#etmaal/vespers/bid');
assert.equal(bidPad('derde-uur', 'heel', 2), '#etmaal/derde-uur/bid/heel/2');
assert.equal(bidPad('completen', 'einde'), '#etmaal/completen/bid/einde');

// Titel met lidwoord
assert.equal(gebedTitel(uur('Vespers')), 'Het gebed van de Vespers');
assert.equal(gebedTitel(uur('Middernachtdienst')), 'Het gebed van de Middernacht');
assert.equal(gebedTitel(uur('Derde Uur')), 'Het gebed van het Derde uur');

// Avond- en nachturen
assert.deepEqual(serviceConfig.filter(isAvonduur).map((d) => d.title), ['Vespers', 'Completen', 'Middernachtdienst', 'Metten']);

// Elk uur heeft een onderbeeld voor de banner
for (const d of serviceConfig) assert.ok(existsSync(`public/images/etmaal/onder/${slugVan(d)}.webp`), slugVan(d));

console.log('gebedsweg: alle controles geslaagd');
