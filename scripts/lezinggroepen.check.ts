// Controle van de groepering van de Schriftlezingen (lib/htc.ts groepeerLezingen). Draaien: npm run check:lezinggroepen
import assert from 'node:assert/strict';
import { groepeerLezingen } from '../src/lib/htc';

const kort = (l: Parameters<typeof groepeerLezingen>[0]) => groepeerLezingen(l).map((g) => [g.titel, g.lezingen.map((x) => `${x.type}: ${x.refNl}`)]);

// 25 december 2026 (juliaans 12 december): daglezingen en H. Spyridon, met twee schrijfwijzen van dezelfde tag
assert.deepEqual(
  kort([
    { ref: 'Hebrews 11:8,11:16', tag: '' },
    { ref: 'Luke 21:37-22:8', tag: '' },
    { ref: 'Hebrews 13:17-21', tag: 'St. Spyridon' },
    { ref: 'Luke 6:17-23', tag: 'St.Spyridon' },
  ]),
  [
    ['Lezingen van de dag', ['Apostellezing: Hebreeën 11:8,11:16', 'Evangelie: Lucas 21:37-22:8']],
    ['Lezingen voor H. Spyridon', ['Apostellezing: Hebreeën 13:17-21', 'Evangelie: Lucas 6:17-23']],
  ],
);

// Alleen daglezingen: één groep
assert.deepEqual(kort([{ ref: 'James 1:19-27', tag: '' }, { ref: 'Mark 9:10-16', tag: '' }]).map(([t]) => t), ['Lezingen van de dag']);

// Twee heiligen (7 februari 2026) en de Moeder Gods met "Epistle, …"-tags; de daglezingen blijven voorop
const twee = kort([
  { ref: 'Hebrews 7:26-8:2', tag: 'St. Gregory' },
  { ref: 'Galatians 3:23-29', tag: 'St. Vladimir' },
  { ref: 'Luke 6:17-23', tag: '' },
]);
assert.deepEqual(twee.map(([t]) => t), ['Lezingen van de dag', 'Lezingen voor H. Gregorius', 'Lezingen voor H. Vladimir']);
assert.deepEqual(kort([{ ref: 'Philippians 2:5-11', tag: 'Epistle, Theotokos' }, { ref: 'Luke 10:38-42', tag: 'Gospel, Theotokos' }]).map(([t]) => t), ['Lezingen voor de Moeder Gods']);

// Dienstlezingen horen bij de dag, met hun eigen type
const dienst = groepeerLezingen([{ ref: 'John 10:9-16', tag: 'Matins Gospel' }, { ref: 'Isaiah 1:1-20', tag: '(6th Hour)' }, { ref: 'Hebrews 1:1-12', tag: 'Royal Hours � 1st Hour' }]);
assert.equal(dienst.length, 1);
assert.deepEqual(dienst[0].lezingen.map((l) => l.type), ['Evangelie van de Metten', '6e Uur · Lezing uit het Oude Testament', 'Koninklijke Uren, 1e Uur · Apostellezing']);

console.log('lezinggroepen: alles klopt');
