// Controle van de gebedsweg (lib/gebedsweg.ts): volgorde, beschikbaarheid, aangeleverde bestanden, adressen.
// Draaien: npm run check:gebedsweg
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { serviceConfig, slugVan } from '../src/lib/etmaal';
import { bidPad, gebedTitel, heelUurLabel, isAvonduur, isZonOfFeestdag, kortVan, leesUurBestand, onderdelenVan, stapIndex } from '../src/lib/gebedsweg';

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

// Kort: een pagina per psalm van het uur waarvan een kernvers bekend is (uit alle uren), in de volgorde van het uur,
// daarna het Jezusgebed
const refs = (stappen: ReturnType<typeof kortVan>) => stappen.map((s) => (s.soort === 'kernvers' ? s.kernvers.reference.replace('Psalm Kernvers: ', '') : s.soort));
const uurMet = (titel: string, file: string) => onderdelenVan(uur(titel), leesUurBestand(JSON.parse(readFileSync(`public/data/uren/${file}.json`, 'utf8'))), alles, true);
assert.deepEqual(refs(kortVan(uur('Derde Uur'), uurMet('Derde Uur', 'derde-uur'))), ['aanbidding', '24:4', '50:12', 'jezusgebed']);
assert.deepEqual(refs(kortVan(uur('Middernachtdienst'), uurMet('Middernachtdienst', 'middernacht'))), ['aanbidding', '50:12', '118:12', 'jezusgebed']);
assert.deepEqual(refs(kortVan(uur('Vespers'), uurMet('Vespers', 'vespers'))), ['aanbidding', '103:24', 'jezusgebed']);
// Zonder aangeleverd bestand: de psalmen van het uur zelf
assert.deepEqual(refs(kortVan(uur('Vespers'), onderdelenVan(uur('Vespers'), null, alles, true))), ['aanbidding', '103:24', 'jezusgebed']);
// Geen psalm met een bekend kernvers: het eigen kernvers van het uur
assert.deepEqual(refs(kortVan(uur('Vespers'), [])), ['aanbidding', '103:24', 'jezusgebed']);

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

// Polyeleos: een onderdeel met "alleen": "zon-en-feestdag" staat er alleen op zon- en feestdagen
const metPoly = leesUurBestand({ onderdelen: [{ psalm: 102 }, { psalm: 134, alleen: 'zon-en-feestdag' }, { psalm: 148 }] });
assert.ok(metPoly);
assert.deepEqual(onderdelenVan(uur('Metten'), metPoly, alles, true).map((o) => o.titel), ['Psalm 102', 'Psalm 148']);
assert.deepEqual(onderdelenVan(uur('Metten'), metPoly, alles, true, true).map((o) => o.titel), ['Psalm 102', 'Psalm 134', 'Psalm 148']);
assert.equal(leesUurBestand({ onderdelen: [{ psalm: 134, alleen: 'zaterdag' }] }), null);

// Zon- of feestdag: zondag, of een feest van rang polyeleos (4) of hoger, of een groot feest
assert.equal(isZonOfFeestdag({ weekdag: 0, feesten: [] }), true);
assert.equal(isZonOfFeestdag({ weekdag: 3, feesten: [] }), false);
assert.equal(isZonOfFeestdag({ weekdag: 3, feesten: [{ rang: 4 }] }), true);
assert.equal(isZonOfFeestdag({ weekdag: 3, feesten: [{ rang: 3 }] }), false);
assert.equal(isZonOfFeestdag({ weekdag: 3, feesten: [{ groot: true }] }), true);

// Het aangeleverde metten.json: 134 en 135 na de hexapsalm, alleen op zon- en feestdagen
const mettenBestand = leesUurBestand(JSON.parse(readFileSync('public/data/uren/metten.json', 'utf8')));
assert.ok(mettenBestand);
const metten = (zonOfFeest: boolean) => onderdelenVan(uur('Metten'), mettenBestand, alles, true, zonOfFeest).map((o) => o.titel);
assert.ok(!metten(false).includes('Psalm 134') && !metten(false).includes('Psalm 135'));
assert.deepEqual(metten(true).slice(8, 11), ['Hexapsalm: Psalm 142', 'Psalm 134', 'Psalm 135']);
// De Hexapsalm: de zes psalmen met de eigen tekst, altijd beschikbaar, en de hoofdknop telt ze als psalmen
assert.deepEqual(metten(false).filter((t) => t.startsWith('Hexapsalm')), [3, 37, 62, 87, 102, 142].map((n) => `Hexapsalm: Psalm ${n}`));
assert.equal(leesUurBestand({ onderdelen: [{ hexapsalm: 50 }] }), null);
{
  const hexa = JSON.parse(readFileSync('public/data/hexapsalm.json', 'utf8')) as { psalmen: { nr: number; voor?: { regels: { tekst?: string; rubriek?: string; na?: string }[] }[]; strofen: { regels: { tekst?: string; rubriek?: string; na?: string }[] }[] }[] };
  assert.deepEqual(hexa.psalmen.map((p) => p.nr), [3, 37, 62, 87, 102, 142]);
  // Begint niet met "Kom laat ons aanbidden", maar met "Eer aan God in den hoge" (driemaal)
  const opening = hexa.psalmen[0].voor?.[0].regels;
  assert.ok(opening?.[0].tekst?.startsWith('Eer aan God in den hoge') && opening[1].na === '(3x)');
  const alles = JSON.stringify(hexa);
  assert.ok(!alles.includes('Kom laat ons aanbidden'));
  // Aanwijzingen staan apart, niet in de te lezen tekst
  const teksten = hexa.psalmen.flatMap((p) => [...(p.voor ?? []), ...p.strofen].flatMap((s) => s.regels.map((r) => r.tekst ?? '')));
  assert.ok(teksten.every((t) => !/\(\dx\)|en nogmaals|Nu en/.test(t)), 'aanwijzing in de tekst');
  assert.ok(hexa.psalmen.every((p) => p.strofen.some((s) => s.regels[0].rubriek === 'en nogmaals:')), 'elke psalm met "en nogmaals"');
}

// De hoofdknop beschrijft wat er werkelijk te bidden is
{
  const ps = (nr: number, beschikbaar: boolean) => ({ soort: 'psalm' as const, titel: `Psalm ${nr}`, nr, beschikbaar });
  const gb = (beschikbaar: boolean) => ({ soort: 'gebed' as const, titel: 'Inleidende gebeden', id: 'x', beschikbaar });
  assert.equal(heelUurLabel([ps(1, true), ps(2, true)]), 'Bid het hele uur');
  assert.equal(heelUurLabel([gb(false), ps(83, false), ps(84, true), ps(85, false)]), 'Bid de beschikbare psalm');
  assert.equal(heelUurLabel([gb(false), ps(83, true), ps(84, true)]), 'Bid de beschikbare psalmen');
  assert.equal(heelUurLabel([gb(true), ps(83, true), ps(84, false)]), 'Bid de beschikbare delen');
}

console.log('gebedsweg: alle controles geslaagd');
