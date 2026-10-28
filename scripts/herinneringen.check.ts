// Controle van de planning in lib/herinneringen.ts: tijden uit serviceConfig, zomertijd, vasten en (beweeglijke) feesten.
// Draaien: npm run check:herinneringen (TZ=Europe/Amsterdam voor de zomertijdcontrole).
import assert from 'node:assert/strict';

import { STANDAARD, aanDeBeurt, kloktijd, meldingenRond, schoonVoorkeuren, vandaagIn } from '../src/lib/herinneringPlanning';
import { orthodoxPascha, utc, ymd } from '../src/lib/kalender';

const uur = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

// Gebedsuren: Vespers 18:00, 15 minuten vooraf; ook op de dag dat de zomertijd eindigt (25-10-2026).
const vespers = meldingenRond(utc(2026, 10, 25), { ...STANDAARD, uren: ['Vespers'], vooraf: 15 }, 'oud').filter((m) => m.id.endsWith('2026-10-25'));
assert.equal(vespers.length, 1);
assert.equal(uur(vespers[0].tijd), '17:45');
assert.equal(vespers[0].url, '#etmaal/vespers');
// Middernacht 00:00 met 30 minuten vooraf valt op de avond ervoor.
const nacht = meldingenRond(utc(2026, 3, 29), { ...STANDAARD, uren: ['Middernachtdienst'], vooraf: 30 }, 'oud').find((m) => m.id.endsWith('2026-03-29'))!;
assert.equal(uur(nacht.tijd), '23:30');
assert.equal(nacht.tijd.getDate(), 28);
assert.equal(nacht.url, '#etmaal/middernacht');

// Vasten: woensdag 4-11-2026 (gewone vastendag) wel, alleen grote vasten niet; 1-12-2026 (Kerstvasten) wel.
const wo = meldingenRond(utc(2026, 11, 4), { ...STANDAARD, vasten: true, vastenMoment: 'beide' }, 'oud').filter((m) => m.id.endsWith('2026-11-04'));
assert.deepEqual(wo.map((m) => uur(m.tijd)), ['20:00', '07:00']);
assert.equal(wo[0].tijd.getDate(), 3);
assert.equal(wo[0].url, '#vasten/2026-11-04');
assert.equal(meldingenRond(utc(2026, 11, 4), { ...STANDAARD, vasten: true, alleenGroteVasten: true }, 'oud').filter((m) => m.id.endsWith('2026-11-04')).length, 0);
assert.equal(meldingenRond(utc(2026, 12, 1), { ...STANDAARD, vasten: true, alleenGroteVasten: true, vastenMoment: 'ochtend' }, 'oud').filter((m) => m.id.endsWith('2026-12-01')).length, 1);
// Lichte Week (vastenvrij): geen melding.
const lichteWoensdag = new Date(orthodoxPascha(2027).getTime() + 3 * 864e5);
assert.equal(meldingenRond(lichteWoensdag, { ...STANDAARD, vasten: true, vastenMoment: 'ochtend' }, 'oud').filter((m) => m.id.endsWith(ymd(lichteWoensdag))).length, 0);

// Feesten: Theofanie op 19 januari (juliaans) of 6 januari (gregoriaans); Pascha 2027 beweeglijk; eigen keuze.
const feest = (dag: Date, mode: 'oud' | 'nieuw', extra = {}) => meldingenRond(dag, { ...STANDAARD, feesten: true, feestMoment: 'dag', ...extra }, mode).filter((m) => m.id.startsWith('feest:') && m.id.endsWith(ymd(dag)));
assert.deepEqual(feest(utc(2027, 1, 19), 'oud').map((m) => m.url), ['#feesten/theofanie']);
assert.deepEqual(feest(utc(2027, 1, 6), 'nieuw').map((m) => m.url), ['#feesten/theofanie']);
assert.equal(feest(utc(2027, 1, 6), 'oud').length, 0);
assert.deepEqual(feest(orthodoxPascha(2027), 'oud').map((m) => m.url), ['#feesten/pascha']);
assert.equal(feest(orthodoxPascha(2027), 'oud', { feestKeuze: 'eigen', feestIds: ['theofanie'] }).length, 0);
const avond = meldingenRond(utc(2027, 1, 19), { ...STANDAARD, feesten: true, feestMoment: 'ervoor' }, 'oud').find((m) => m.url === '#feesten/theofanie')!;
assert.equal(uur(avond.tijd), '20:00');
assert.equal(avond.tijd.getDate(), 18);

// Jaarovergang: Middernacht op 1 januari valt op 31 december om 23:45.
const jaar = meldingenRond(utc(2027, 1, 1), { ...STANDAARD, uren: ['Middernachtdienst'], vooraf: 15 }, 'oud').find((m) => m.id.endsWith('2027-01-01'))!;
assert.equal(jaar.tijd.getFullYear(), 2026);
assert.equal(uur(jaar.tijd), '23:45');

// Unieke id's: geen dubbele meldingen binnen een planning.
const alles = meldingenRond(utc(2026, 12, 24), { ...STANDAARD, uren: ['Vespers', 'Metten'], vasten: true, vastenMoment: 'beide', feesten: true }, 'oud');
assert.equal(new Set(alles.map((m) => m.id)).size, alles.length);

// Tijdzone van de gebruiker (voor de server): 18:00 in Amsterdam is 17:00 UTC in de winter, 16:00 UTC in de zomer;
// in New York 23:00 UTC in de winter. Middernacht min 30 minuten in Amsterdam: de avond ervoor.
assert.equal(kloktijd(utc(2026, 11, 2), 18, 0, 'Europe/Amsterdam').toISOString(), '2026-11-02T17:00:00.000Z');
assert.equal(kloktijd(utc(2026, 7, 2), 18, 0, 'Europe/Amsterdam').toISOString(), '2026-07-02T16:00:00.000Z');
assert.equal(kloktijd(utc(2026, 11, 2), 18, 0, 'America/New_York').toISOString(), '2026-11-02T23:00:00.000Z');
assert.equal(kloktijd(utc(2026, 3, 29), 0, -30, 'Europe/Amsterdam').toISOString(), '2026-03-28T22:30:00.000Z');
// Dag waarop de zomertijd eindigt (25-10-2026): 18:00 is dan al wintertijd.
assert.equal(kloktijd(utc(2026, 10, 25), 18, 0, 'Europe/Amsterdam').toISOString(), '2026-10-25T17:00:00.000Z');
// "Vandaag" in de tijdzone van de gebruiker: 23:30 UTC op 31-12 is in Amsterdam al 1 januari.
assert.equal(ymd(vandaagIn('Europe/Amsterdam', Date.UTC(2026, 11, 31, 23, 30))), '2027-01-01');
assert.equal(ymd(vandaagIn('America/New_York', Date.UTC(2026, 11, 31, 23, 30))), '2026-12-31');
// Aan de beurt (server): Vespers in Amsterdam, een minuut na 17:00 UTC; daarna niet nog eens; 11 minuten te laat niet.
const vk = { ...STANDAARD, uren: ['Vespers'] };
const nu = Date.UTC(2026, 10, 2, 17, 1);
const eerst = aanDeBeurt(vk, 'oud', {}, nu, 'Europe/Amsterdam');
assert.deepEqual(eerst.map((m) => m.id), ['uur:Vespers:2026-11-02']);
assert.equal(aanDeBeurt(vk, 'oud', { [eerst[0].id]: nu }, nu + 60_000, 'Europe/Amsterdam').length, 0);
assert.equal(aanDeBeurt(vk, 'oud', {}, Date.UTC(2026, 10, 2, 17, 11), 'Europe/Amsterdam').length, 0);
// Voorkeuren van buiten worden geschoond: onbekende uren, feesten en waarden verdwijnen.
assert.deepEqual(schoonVoorkeuren({ uren: ['Vespers', 'Onzin', 'Vespers'], vooraf: 99, feestIds: ['theofanie', '<script>'], vasten: 'ja' }), { ...STANDAARD, uren: ['Vespers'], feestIds: ['theofanie'] });

console.log('herinneringen: alle controles geslaagd');
