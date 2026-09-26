// Zelftest voor src/lib/zoeken.ts — draaien met: npm run check:zoeken
import assert from 'node:assert/strict';
import { bouwIndex, leesDatum, zoek } from '../src/lib/zoeken';
import { utc, ymd } from '../src/lib/kalender';
import { ALLE_HEILIGEN } from '../src/lib/heiligen';

const vandaag = utc(2026, 9, 25);
const d = (s: string) => { const r = leesDatum(s, vandaag); return r && ymd(r.datum); };

assert.equal(d('6 augustus'), '2026-08-06');
assert.equal(d('6 Aug 2027'), '2027-08-06');
assert.equal(d('25 dec'), '2026-12-25');
assert.equal(d('1 mrt'), '2026-03-01');
assert.equal(d('6-8'), '2026-08-06');
assert.equal(d('6/8/2027'), '2027-08-06');
assert.equal(d('morgen'), '2026-09-26');
assert.equal(d('pascha 2027'), '2027-05-02');
assert.equal(d('Pasen'), '2026-04-12');
assert.equal(d('31 februari'), null);
assert.equal(d('6 ma'), null); // te kort voor een maand
assert.equal(d('kruis'), null);

const index = bouwIndex(null, ALLE_HEILIGEN);
const titels = (q: string, groep: string) => zoek(q, index, vandaag, 'oud').find((g) => g.titel === groep)?.items.map((i) => i.titel) ?? [];
assert.ok(titels('kruisverheffing', 'Feesten').length > 0, 'feest op naam');
assert.ok(titels('jezusgebed', "Pagina's").includes('Adem'), 'pagina via trefwoord');
assert.ok(titels('ochtend', 'Gebeden').length > 0, 'gebed op moment');
assert.ok(titels('willibrord', 'Heiligen').length > 0, 'heilige uit de eigen lijst');
assert.equal(zoek('a', index, vandaag, 'oud').length, 0, 'minimaal twee tekens');
assert.deepEqual(titels('Psalm 50', 'Psalmen'), ['Psalm 50'], 'psalm op nummer');
assert.ok(titels('hexapsalm', 'Psalmen').includes('Psalm 3'), 'psalm op onderdeel van de dienst');
assert.equal(titels('psalm', 'Psalmen').length, 0, 'alleen "psalm" geeft geen 150 psalmen');
assert.equal(zoek('6 augustus', index, vandaag, 'oud')[0].titel, 'Datum', 'datum bovenaan');
// bij gelijke score gaan de grote feesten voor
const pascha = zoek('pascha', index, vandaag, 'oud').find((g) => g.titel === 'Feesten')!.items[0];
assert.ok(pascha.soort === 'feest' && pascha.feest.id === 'pascha', `Pascha zelf bovenaan: ${pascha.titel}`);
// een veld dat met de zoekterm begint (hier de korte naam "Kruisverheffing") gaat vóór een woord middenin
const kruis = zoek('kruis', index, vandaag, 'oud').find((g) => g.titel === 'Feesten')!.items[0];
assert.ok(kruis.soort === 'feest' && kruis.feest.id === 'kruisverheffing', `Kruisverheffing bovenaan: ${kruis.titel}`);
// een gebed dat "kruis" alleen in de tekst heeft, komt na de feesten die zo heten
const volgorde = zoek('kruis', index, vandaag, 'oud').map((g) => g.titel);
assert.ok(volgorde.indexOf('Feesten') < volgorde.indexOf('Gebeden'), `groepvolgorde: ${volgorde.join(', ')}`);

console.log('zoeken: alle controles geslaagd');
