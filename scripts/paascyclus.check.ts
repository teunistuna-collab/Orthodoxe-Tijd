// Zelftest voor src/lib/paascyclus.ts — draaien met: npm run check:paascyclus
import assert from 'node:assert/strict';
import { addDays, dagInfo, orthodoxPascha, utc, ymd } from '../src/lib/kalender';
import { paascyclusVoor, STAPPEN, volgendeZondag, zondagVanDeWeek } from '../src/lib/paascyclus';

// Controle van de bron: Pascha 2026 = 12 april, 2027 = 2 mei (beide zondag)
assert.equal(ymd(orthodoxPascha(2026)), '2026-04-12');
assert.equal(ymd(orthodoxPascha(2027)), '2027-05-02');
assert.equal(orthodoxPascha(2027).getUTCDay(), 0);

// Iedere grens: de dag ervoor, de eerste en de laatste dag, de dag erna — voor twee jaren
for (const jaar of [2026, 2027, 2030]) {
  const p = orthodoxPascha(jaar);
  for (const [i, s] of STAPPEN.entries()) {
    const [van, tot] = s.offsetRange;
    assert.equal(paascyclusVoor(addDays(p, van)).huidige, s.key, `${jaar} eerste dag ${s.key}`);
    assert.equal(paascyclusVoor(addDays(p, tot)).huidige, s.key, `${jaar} laatste dag ${s.key}`);
    assert.equal(paascyclusVoor(addDays(p, van - 1)).huidige, i === 0 ? null : STAPPEN[i - 1].key, `${jaar} dag vóór ${s.key}`);
    const na = paascyclusVoor(addDays(p, tot + 1));
    if (i < STAPPEN.length - 1) assert.equal(na.huidige, STAPPEN[i + 1].key, `${jaar} dag na ${s.key}`);
    else assert.equal(ymd(na.pascha), ymd(orthodoxPascha(jaar + 1)), `${jaar} na de cyclus: volgend Pascha`);
  }
  // De stappen sluiten op elkaar aan, zonder gaten
  for (let i = 1; i < STAPPEN.length; i++) assert.equal(STAPPEN[i].offsetRange[0], STAPPEN[i - 1].offsetRange[1] + 1);
}

const c = (s: string) => paascyclusVoor(utc(...(s.split('-').map(Number) as [number, number, number])));
// Lazaruszaterdag en Palmzondag in de Heilige Week; de vrijdag ervoor nog Grote Vasten
assert.equal(c('2026-04-03').huidige, 'grote-vasten');
assert.equal(c('2026-04-04').huidige, 'goede-week'); // Lazaruszaterdag
assert.equal(c('2026-04-05').huidige, 'goede-week'); // Palmzondag
// Pascha zelf en de Lichte Week
assert.equal(c('2026-04-12').offset, 0);
assert.equal(c('2026-04-12').dagenTotPascha, 0);
assert.equal(c('2026-04-18').huidige, 'pascha'); // Lichte Zaterdag
assert.equal(c('2026-04-19').huidige, 'vijftig-dagen'); // Thomaszondag
// Paastijd: blijft bij Pascha van dit jaar (niet volgend jaar)
assert.equal(ymd(c('2026-05-10').pascha), '2026-04-12');
// Hemelvaart (offset 39) en Pinksteren (49) in de laatste stap
assert.equal(c('2026-05-21').huidige, 'hemelvaart-pinksteren');
assert.equal(c('2026-05-21').offset, 39);
assert.equal(c('2026-05-31').offset, 49);
assert.equal(c('2026-05-20').huidige, 'vijftig-dagen'); // Afsluiting van Pascha
// Buiten de cyclus: geen stap, aftelling naar het volgende Pascha, nooit negatief
assert.equal(c('2026-10-16').huidige, null);
assert.equal(ymd(c('2026-10-16').pascha), '2027-05-02');
assert.equal(c('2026-10-16').dagenTotPascha, 198);
assert.equal(c('2027-01-15').huidige, null);
// Jaarwisseling: 31 december en 1 januari kiezen hetzelfde Pascha
assert.equal(ymd(c('2026-12-31').pascha), '2027-05-02');
assert.equal(ymd(c('2027-01-01').pascha), '2027-05-02');
assert.equal(c('2027-01-01').dagenTotPascha - c('2026-12-31').dagenTotPascha, -1);
// Voorbereiding 2027 begint 21 februari (Tollenaar en Farizeeër); de dag ervoor valt buiten de cyclus
assert.equal(ymd(c('2027-01-01').stappen[0].van), '2027-02-21');
assert.equal(c('2027-02-20').huidige, null);
assert.equal(c('2027-02-21').huidige, 'voorbereiding');
for (const s of ['2026-06-14', '2026-06-15', '2026-12-31', '2027-02-21', '2027-05-02', '2027-07-04']) assert.ok(c(s).dagenTotPascha >= 0);

// Beide kalenderinstellingen: dezelfde Paasdatum en dus dezelfde dag in de cyclus
for (const s of ['2026-03-01', '2026-04-12', '2026-05-31']) {
  const d = utc(...(s.split('-').map(Number) as [number, number, number]));
  assert.equal(dagInfo(d, 'oud').offset, c(s).offset);
  assert.equal(dagInfo(d, 'nieuw').offset, c(s).offset);
}

// Zondagen: de zondag van de lopende week, en de eerstvolgende in de voorbereiding
assert.equal(zondagVanDeWeek(-48)?.id, 'vergevingszondag'); // Schone Maandag: week na Vergevingszondag
assert.equal(zondagVanDeWeek(-40)?.id, 'orthodoxie');
assert.equal(zondagVanDeWeek(-42)?.id, 'orthodoxie');
assert.equal(zondagVanDeWeek(10)?.id, 'thomas');
assert.equal(zondagVanDeWeek(-100), undefined);
assert.equal(volgendeZondag(-66, -49)?.id, 'verloren-zoon');
assert.equal(volgendeZondag(-70, -49)?.id, 'tollenaar');
assert.equal(volgendeZondag(-48, -49), undefined);

console.log('paascyclus: alle controles geslaagd');
