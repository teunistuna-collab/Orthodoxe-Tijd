// Controle van het dagthema (lib/feestdagen.ts): kop, toon en cyclus-kaart op belangrijke en gewone dagen, in beide
// kalenders. Draaien: npm run check:dagthema
import assert from 'node:assert/strict';
import { utc } from '../src/lib/kalender';
import { dagThema } from '../src/lib/feestdagen';
import { bidBeeld, icoonVan } from '../src/lib/bidbeelden';

// Gedeelde beelden
assert.equal(bidBeeld('pascha'), '/images/feesten/bidden/pascha.webp');
assert.equal(bidBeeld('kruisverering'), '/images/feesten/bidden/kruisverheffing.webp'); // zelfde icoon
assert.equal(bidBeeld('nicolaas'), null);
assert.equal(icoonVan('nicolaas'), '/images/feesten/nicolaas.webp');
assert.equal(icoonVan('bestaat-niet'), null);

// Grote Vrijdag 2027 (Pascha 2 mei): icoon van de dag, verstild, Goede Week met voortgang van de Grote Vasten
const gv = dagThema(utc(2027, 4, 30), 'oud')!;
assert.equal(gv.kop?.soort, 'icoon');
assert.equal(gv.kop?.beeld, '/images/feesten/grote-vrijdag.webp');
assert.equal(gv.kop?.naam, 'Grote en Heilige Vrijdag');
assert.ok(gv.kop?.regel && /[.!?]$/.test(gv.kop.regel), String(gv.kop?.regel));
assert.equal(gv.kop?.groet, undefined);
assert.equal(gv.toon, 'verstild');
assert.equal(gv.cyclus?.soort, 'pascha');
assert.equal(gv.cyclus?.periode, 'Goede Week');
assert.equal(gv.cyclus?.dag, 'Grote en Heilige Vrijdag');
assert.equal(gv.cyclus?.href, '#pascha/goede-week');
assert.equal(gv.cyclus?.voortgang, 'Dag 47 van 48 · nog 2 dagen tot Pascha');

// Pascha 2027: analogion-beeld met de paasgroet, licht; geen dubbele dagnaam
const pa = dagThema(utc(2027, 5, 2), 'oud')!;
assert.equal(pa.kop?.soort, 'analogion');
assert.equal(pa.kop?.beeld, '/images/feesten/bidden/pascha.webp');
assert.equal(pa.kop?.groet?.groet, 'Christus is opgestaan!');
assert.equal(pa.toon, 'licht');
assert.equal(pa.cyclus?.periode, 'Pascha');
assert.equal(pa.cyclus?.dag, undefined);
assert.equal(pa.cyclus?.voortgang, undefined);

// Kruisverering (Pascha − 28): het analogion-beeld van de Kruisverheffing
assert.equal(dagThema(utc(2027, 4, 4), 'oud')?.kop?.beeld, '/images/feesten/bidden/kruisverheffing.webp');

// Theofanie: 19-1-2027 bij de oude kalender, 6-1-2027 bij de nieuwe; analogion-beeld, licht, Geboortecyclus
for (const [d, mode] of [[utc(2027, 1, 19), 'oud'], [utc(2027, 1, 6), 'nieuw']] as const) {
  const t = dagThema(d, mode)!;
  assert.equal(t.kop?.beeld, '/images/feesten/bidden/theofanie.webp', mode);
  assert.equal(t.toon, 'licht', mode);
  assert.equal(t.cyclus?.soort, 'geboorte', mode);
  assert.equal(t.cyclus?.periode, 'Theofanie', mode);
}

// De Geboorte (oude kalender 7-1-2027): analogion met de kerstgroet
assert.equal(dagThema(utc(2027, 1, 7), 'oud')?.kop?.groet?.groet, 'Christus is geboren!');

// Geboortevasten (10-12-2026, oude kalender): geen kop, ingetogen, voortgang naar de Geboorte
const gb = dagThema(utc(2026, 12, 10), 'oud')!;
assert.equal(gb.kop, null);
assert.equal(gb.toon, 'ingetogen');
assert.equal(gb.cyclus?.periode, 'De Geboortevasten');
assert.match(gb.cyclus?.voortgang ?? '', /^Dag \d+ van 40 · nog \d+ dagen tot de Geboorte van Christus$/);

// Een gewone dag in juli: geen thema
assert.equal(dagThema(utc(2027, 7, 20), 'oud'), null);

// Grenzen: de dag na Pinksteren (2027: 20 juni) en na het nafeest van Theofanie (oud: 28-1-2027) geen cyclus meer
assert.equal(dagThema(utc(2027, 6, 21), 'oud')?.cyclus ?? null, null);
assert.equal(dagThema(utc(2027, 1, 28), 'oud')?.cyclus ?? null, null);

console.log('dagthema: alle controles geslaagd');
