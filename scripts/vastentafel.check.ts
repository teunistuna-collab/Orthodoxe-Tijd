// Zelftest voor src/lib/voedselgroepen.ts (vastentafel en voedseltegels) — npm run check:vastentafel
import assert from 'node:assert/strict';
import { voedselStatus } from '../src/lib/voedselgroepen';
import { dagInfo, utc } from '../src/lib/kalender';

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
console.log('vastentafel: alle controles geslaagd');
