// Zelftest voor src/lib/voedselgroepen.ts (vastentafel en voedseltegels) — npm run check:vastentafel
import assert from 'node:assert/strict';
import { voedselStatus } from '../src/lib/voedselgroepen';
import { addDays, dagInfo, utc, ymd } from '../src/lib/kalender';
import { vastenBetekenis } from '../src/lib/vastenBetekenis';
import { periodeVoortgang, vastenPeriodes } from '../src/lib/overzicht';

const aan = (n: Parameters<typeof voedselStatus>[0]) => Object.entries(voedselStatus(n)).filter(([, v]) => v).map(([k]) => k).sort().join(',');
assert.equal(aan('geen'), 'eieren,graan,groenten,olie,peulvruchten,vis,vlees,wijn,zuivel');
assert.equal(aan('vrij'), aan('geen'));
assert.equal(aan('zuivel'), 'eieren,graan,groenten,olie,peulvruchten,vis,wijn,zuivel');
assert.equal(aan('vis'), 'graan,groenten,olie,peulvruchten,vis,wijn');
assert.equal(aan('wijn-olie'), 'graan,groenten,olie,peulvruchten,wijn');
assert.equal(aan('vastendag'), 'graan,groenten,olie,peulvruchten,wijn');
assert.equal(aan('zonder-olie'), 'graan,groenten,peulvruchten');
assert.equal(aan('streng'), 'graan,groenten');
assert.equal(aan('onthouding'), '');
// Uit de kalender: Grote Vrijdag 2027 (30 april, oude kalender) is onthouding
assert.equal(aan(dagInfo(utc(2027, 4, 30), 'oud').vasten.niveau), '');
// De betekenis van de dag (oude kalender), uit de kalender zelf
const bet = (j: number, m: number, d: number) => vastenBetekenis(dagInfo(utc(j, m, d), 'oud')).tekst;
assert.match(bet(2026, 10, 21), /^Op woensdag gedenkt de Kerk het verraad/); // gewone woensdag
assert.match(bet(2026, 10, 23), /^Op vrijdag gedenkt de Kerk het lijden/); // gewone vrijdag
assert.match(bet(2027, 2, 24), /Tollenaar en de Farizeeër/); // vastenvrije week (woensdag)
assert.match(bet(2027, 3, 17), /^De Grote Vasten/); // Grote Vasten
assert.match(bet(2027, 4, 28), /Heilige Week/); // Grote Week
assert.match(bet(2026, 12, 2), /^De Geboortevasten/);
assert.match(bet(2027, 1, 6), /eerste ster/); // Kerstavond
assert.match(bet(2027, 1, 18), /Grote Waterwijding/); // vooravond van Theofanie
assert.match(bet(2027, 7, 1), /^De Apostelvasten/);
assert.match(bet(2026, 8, 18), /^De Ontslapenisvasten/);
assert.match(bet(2026, 9, 11), /onthoofding/); // kerkelijk 29 augustus
assert.match(bet(2026, 9, 27), /Kruisverheffing/); // kerkelijk 14 september, zondag
assert.match(bet(2027, 1, 13), /feestperiode/); // Kersttijd, vastenvrij
assert.match(bet(2026, 10, 22), /geen vasten voor/); // gewone donderdag
// Morgen: de volgende kalenderdag, ook over maand- en jaargrens
assert.equal(ymd(addDays(utc(2026, 12, 31), 1)), '2027-01-01');
assert.equal(ymd(addDays(utc(2026, 10, 31), 1)), '2026-11-01');
assert.equal(ymd(addDays(utc(2028, 2, 28), 1)), '2028-02-29');
assert.equal(dagInfo(addDays(utc(2026, 11, 27), 1), 'oud').vasten.periode, 'Kerstvasten'); // morgen = eerste dag van de Geboortevasten

// Meegaan door de periode: dag X van Y en nog Z dagen tot het feest (Grote Vasten 2027: 15-3 t/m 1-5, Pascha 2-5)
const gv = vastenPeriodes(2027, 'oud').find((p) => p.id === 'grote-vasten')!;
assert.deepEqual(periodeVoortgang(gv, utc(2027, 3, 15)), { dag: 1, van: 48, nog: 48, feest: 'Pascha' });
assert.deepEqual(periodeVoortgang(gv, utc(2027, 3, 26)), { dag: 12, van: 48, nog: 37, feest: 'Pascha' });
assert.deepEqual(periodeVoortgang(gv, utc(2027, 5, 1)), { dag: 48, van: 48, nog: 1, feest: 'Pascha' });
assert.equal(periodeVoortgang(gv, utc(2027, 3, 14)), null);
assert.equal(periodeVoortgang(gv, utc(2027, 5, 2)), null);
const feest = (id: string) => periodeVoortgang(vastenPeriodes(2027, 'oud').find((p) => p.id === id)!, vastenPeriodes(2027, 'oud').find((p) => p.id === id)!.start)?.feest;
assert.deepEqual(['kaasweek', 'apostelvasten', 'dormitionvasten', 'kerstvasten'].map(feest), ['de Grote Vasten', 'Petrus en Paulus', 'de Ontslapenis', 'de Geboorte van Christus']);
// Kerstvasten over de jaargrens: 28-11-2027 t/m 6-1-2028
const kv = vastenPeriodes(2027, 'oud').find((p) => p.id === 'kerstvasten')!;
assert.deepEqual(periodeVoortgang(kv, utc(2028, 1, 6)), { dag: 40, van: 40, nog: 1, feest: 'de Geboorte van Christus' });

console.log('vastentafel: alle controles geslaagd');
