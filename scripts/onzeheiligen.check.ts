// Controle van Onze heiligen (lib/onzeHeiligen.ts): schonen van opslag, naamdag op de juiste dag in beide kalenders,
// 29 februari in een gewoon jaar en de volgorde op de eerstvolgende naamdag. Draaien: npm run check:onzeheiligen
import assert from 'node:assert/strict';
import { utc } from '../src/lib/kalender';
import { MAX_HEILIGEN, dagenTot, geldigeMd, naamdagenOp, opVolgorde, schoonNaamdag, schoonOnzeHeiligen, zonderTitel } from '../src/lib/onzeHeiligen';

// Geldige kerkelijke dagen ("M-D", zonder voorloopnul; 29 februari mag)
for (const md of ['1-1', '2-29', '12-31', '9-17']) assert.ok(geldigeMd(md), md);
for (const md of ['0-1', '2-30', '13-1', '01-05', '9-31', 'x', 5, null]) assert.equal(geldigeMd(md), false, String(md));

// Opslag schonen: kapot geeft een lege lijst; ongeldige items en dubbele id's vallen weg; grenzen
assert.deepEqual(schoonOnzeHeiligen('kapot'), []);
assert.deepEqual(schoonOnzeHeiligen(null), []);
const sofia = { id: 'a', heilige: 'Sofia van Rome', md: '9-17', voor: 'Sofia', bron: 'hj-0917-1' };
assert.deepEqual(
  schoonOnzeHeiligen([sofia, null, { id: 'b', heilige: '', md: '1-1', voor: '' }, { id: 'c', heilige: 'X', md: '2-30', voor: '' }, { ...sofia }]),
  [sofia],
);
assert.equal(schoonOnzeHeiligen([{ ...sofia, voor: 'x'.repeat(200) }])[0].voor.length, 80);
assert.equal(schoonOnzeHeiligen(Array.from({ length: 40 }, (_, i) => ({ ...sofia, id: `i${i}` }))).length, MAX_HEILIGEN);
assert.equal(schoonNaamdag({ heilige: ' Nikolaas ', md: '12-6' })?.heilige, 'Nikolaas');
assert.equal(schoonNaamdag({ heilige: 'Nikolaas', md: '12-6' })?.voor, '');
assert.equal(schoonNaamdag({ heilige: 'Nikolaas', md: '12-32' }), null);

// Naamdag op de juiste dag: kerkelijk 17-9 is burgerlijk 30-9 bij de oude (juliaanse) kalender, 17-9 bij de nieuwe
assert.deepEqual(naamdagenOp([sofia], utc(2026, 9, 30), 'oud'), [sofia]);
assert.deepEqual(naamdagenOp([sofia], utc(2026, 9, 17), 'oud'), []);
assert.deepEqual(naamdagenOp([sofia], utc(2026, 9, 17), 'nieuw'), [sofia]);

// 29 februari: in een gewoon jaar op 28 februari, in een schrikkeljaar op 29 februari (beide kalenders)
const cassianus = { heilige: 'Johannes Cassianus', md: '2-29', voor: '' };
assert.equal(naamdagenOp([cassianus], utc(2027, 2, 28), 'nieuw').length, 1);
assert.equal(naamdagenOp([cassianus], utc(2028, 2, 28), 'nieuw').length, 0);
assert.equal(naamdagenOp([cassianus], utc(2028, 2, 29), 'nieuw').length, 1);
assert.equal(naamdagenOp([cassianus], utc(2027, 3, 13), 'oud').length, 1); // juliaans 28-2-2027
assert.equal(naamdagenOp([cassianus], utc(2028, 3, 12), 'oud').length, 0); // juliaans 28-2-2028 (schrikkeljaar)
assert.equal(naamdagenOp([cassianus], utc(2028, 3, 13), 'oud').length, 1); // juliaans 29-2-2028

// Volgorde op de eerstvolgende naamdag (vandaag eerst)
const nikolaas = { heilige: 'Nikolaas', md: '12-6', voor: 'Nick' };
const vandaag = utc(2026, 11, 6);
assert.equal(dagenTot(nikolaas, vandaag, 'nieuw'), 30);
assert.equal(dagenTot({ ...nikolaas, md: '11-6' }, vandaag, 'nieuw'), 0);
assert.ok(dagenTot(cassianus, vandaag, 'oud') < 400);
assert.deepEqual(opVolgorde([sofia, nikolaas, { ...nikolaas, md: '11-6', voor: 'Vandaag' }], vandaag, 'nieuw').map((h) => h.voor), ['Vandaag', 'Nick', 'Sofia']);

// Naam zonder titel, voor "De heilige …" in een melding
assert.equal(zonderTitel('H. Sofia van Rome'), 'Sofia van Rome');
assert.equal(zonderTitel('De heilige Ignatios'), 'Ignatios');
assert.equal(zonderTitel('Heilige Nikolaas'), 'Nikolaas');
assert.equal(zonderTitel('Ignatios'), 'Ignatios');

console.log('onzeheiligen: alle controles geslaagd');
