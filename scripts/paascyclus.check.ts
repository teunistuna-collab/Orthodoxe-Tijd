// Zelftest voor src/lib/paascyclus.ts — draaien met: npm run check:paascyclus
import assert from 'node:assert/strict';
import { addDays, dagInfo, orthodoxPascha, utc, ymd } from '../src/lib/kalender';
import { betekenisVoor } from '../src/lib/betekenisVanVandaag';
import { paascyclusActief, paascyclusVoor, STAPPEN, volgendeZondag, zondagVanDeWeek } from '../src/lib/paascyclus';

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
// Lazaruszaterdag en Palmzondag elk een eigen periode; de vrijdag ervoor nog Grote Vasten
assert.equal(c('2026-04-03').huidige, 'grote-vasten');
assert.equal(c('2026-04-04').huidige, 'lazarus'); // Lazaruszaterdag
assert.equal(c('2026-04-05').huidige, 'palmzondag'); // Palmzondag
assert.equal(c('2026-04-06').huidige, 'goede-week'); // Grote Maandag
assert.equal(c('2026-04-09').huidige, 'goede-week'); // Grote Donderdag
assert.equal(c('2026-04-10').huidige, 'goede-week'); // Grote Vrijdag
assert.equal(c('2026-04-11').huidige, 'goede-week'); // Grote Zaterdag
// Pascha zelf en de Lichte Week
assert.equal(c('2026-04-12').offset, 0);
assert.equal(c('2026-04-12').dagenTotPascha, 0);
assert.equal(c('2026-04-12').huidige, 'pascha');
assert.equal(c('2026-04-13').huidige, 'lichte-week'); // Lichte Maandag
assert.equal(c('2026-04-18').huidige, 'lichte-week'); // Lichte Zaterdag
assert.equal(c('2026-04-19').huidige, 'paastijd'); // Thomaszondag
// Paastijd: blijft bij Pascha van dit jaar (niet volgend jaar)
assert.equal(ymd(c('2026-05-10').pascha), '2026-04-12');
// Hemelvaart (offset 39) met het nafeest, Pinksteren (49) als laatste dag van de cyclus
assert.equal(c('2026-05-21').huidige, 'hemelvaart');
assert.equal(c('2026-05-30').huidige, 'hemelvaart'); // Pinksterzaterdag
assert.equal(c('2026-05-31').huidige, 'pinksteren');
assert.equal(c('2026-05-21').offset, 39);
assert.equal(c('2026-05-31').offset, 49);
assert.equal(c('2026-05-20').huidige, 'paastijd'); // Afsluiting van Pascha
// De dag na Pinksteren: buiten de cyclus, het volgende Pascha
assert.equal(c('2026-06-01').huidige, null);
assert.equal(ymd(c('2026-06-01').pascha), '2027-05-02');
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

// paascyclusActief: de centrale controle (Zondag van de Tollenaar t/m Pinksteren, inbegrepen), drie jaren
const actief = (s: string) => paascyclusActief(utc(...(s.split('-').map(Number) as [number, number, number])));
for (const [voor, begin, pinksteren, na] of [
  ['2026-01-31', '2026-02-01', '2026-05-31', '2026-06-01'],
  ['2027-02-20', '2027-02-21', '2027-06-20', '2027-06-21'],
  ['2028-02-05', '2028-02-06', '2028-06-04', '2028-06-05'],
]) {
  assert.equal(actief(voor), false, voor);
  assert.equal(actief(begin), true, begin);
  assert.equal(actief(pinksteren), true, pinksteren);
  assert.equal(actief(na), false, na);
}
assert.equal(actief('2026-12-31'), false);
assert.equal(actief('2027-01-01'), false);
assert.equal(STAPPEN.length, 10);

// "De betekenis van vandaag": alleen tijdens de cyclus, alle onderdelen met tekst en bron, geen lege onderdelen
const bv = (s: string, mode: 'oud' | 'nieuw' = 'nieuw') => betekenisVoor(dagInfo(utc(...(s.split('-').map(Number) as [number, number, number])), mode), mode);
assert.equal(bv('2027-02-20'), null); // dag vóór de Tollenaar en de Farizeeër
assert.equal(bv('2027-02-21')?.periode.key, 'voorbereiding');
assert.equal(bv('2027-06-20')?.periode.key, 'pinksteren');
assert.equal(bv('2027-06-21'), null); // dag na Pinksteren
assert.equal(bv('2026-10-20'), null);
assert.equal(bv('2026-03-03')?.periode.key, 'grote-vasten'); // gewone weekdag in de Vasten
assert.equal(bv('2026-03-03')?.kleur.kleur, 'donkerpaars');
assert.equal(bv('2026-04-04')?.liturgie?.soort, 'Lazaruszaterdag');
assert.equal(bv('2026-04-05')?.kleur.kleur, 'groen'); // Palmzondag
assert.equal(bv('2026-04-09')?.liturgie?.soort, 'Grote en Heilige Donderdag');
assert.equal(bv('2026-04-10')?.liturgie?.soort, 'Grote en Heilige Vrijdag');
assert.equal(bv('2026-04-11')?.kleur.naar, 'wit'); // Grote Zaterdag: donker → wit
assert.ok(bv('2026-04-12')?.icoon); // Pascha: icoon van de Verrijzenis
assert.match(bv('2026-04-12')?.hymne?.tekst ?? '', /^Christus, opgestaan van de doden/);
assert.ok(bv('2026-04-15')?.icoon); // Lichte Week
assert.equal(bv('2026-04-19')?.icoon?.beeld, '/images/feesten/thomas.webp'); // Thomaszondag: eigen icoon
assert.equal(bv('2026-05-21')?.kleur.kleur, 'wit'); // Hemelvaart
assert.equal(bv('2026-05-21')?.periode.key, 'hemelvaart');
assert.equal(bv('2026-05-31')?.kleur.kleur, 'groen'); // Pinksteren
assert.equal(bv('2026-02-22')?.traditie?.soort, 'Kerkelijke traditie · Vergevingszondag');
for (const jaar of [2026, 2027, 2028]) {
  const p = orthodoxPascha(jaar);
  for (const mode of ['oud', 'nieuw'] as const) {
    for (let o = -70; o <= 49; o++) {
      const b = betekenisVoor(dagInfo(addDays(p, o), mode), mode);
      assert.ok(b, `${jaar} ${o} ${mode}`);
      assert.ok(b.liturgie && b.weetje, `liturgie en weetje ${jaar} ${o}`);
      for (const d of [b.liturgie, b.hymne, b.traditie, b.weetje]) if (d) assert.ok(d.tekst.trim().length > 20 && d.bron, `${jaar} ${o} ${d.titel}`);
    }
    assert.equal(betekenisVoor(dagInfo(addDays(p, -71), mode), mode), null);
    assert.equal(betekenisVoor(dagInfo(addDays(p, 50), mode), mode), null);
  }
}

// Icoon van de dag in de Paascyclus (2027: Pascha 2 mei)
{
  const ic = (s: string) => betekenisVoor(dagInfo(utc(...(s.split('-').map(Number) as [number, number, number])), 'oud'), 'oud')?.icoon;
  assert.equal(ic('2027-04-25')?.beeld, '/images/feesten/palmzondag.webp');
  assert.equal(ic('2027-04-30')?.beeld, '/images/feesten/grote-vrijdag.webp');
  assert.equal(ic('2027-05-02')?.beeld, '/images/feesten/pascha.webp');
  assert.equal(ic('2027-05-07')?.beeld, '/images/feesten/lichte-vrijdag.webp');
  assert.equal(ic('2027-05-09')?.beeld, '/images/feesten/thomas.webp');
  assert.equal(ic('2027-06-10')?.beeld, '/images/feesten/hemelvaart.webp');
  assert.equal(ic('2027-06-10')?.periodeIcoon, false);
  assert.equal(ic('2027-06-11')?.periodeIcoon, true); // nafeest van Hemelvaart
  assert.equal(ic('2027-06-13')?.beeld, '/images/feesten/vaders-nicea.webp');
  assert.equal(ic('2027-03-10'), undefined); // gewone vastendag: geen icoon
}

console.log('paascyclus: alle controles geslaagd');
