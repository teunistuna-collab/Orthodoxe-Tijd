// Controle van de opgehaalde leesroosters (public/data/<jaar>/) — draaien met: npm run check:leesrooster
// Per kerkjaar J (14 januari J t/m 13 januari J+1): alle dagen aanwezig en aaneengesloten, overal lezingen met tekst,
// en Pascha op de berekende datum met het paasevangelie (Johannes 1:1-17).
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const lees = (p) => JSON.parse(readFileSync(p, 'utf8'));
const dag = (d) => d.toISOString().slice(0, 10);
function orthodoxPascha(jaar) {
  const a = jaar % 4, b = jaar % 7, c = jaar % 19, d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7;
  const maand = Math.floor((d + e + 114) / 31), dg = ((d + e + 114) % 31) + 1;
  return new Date(Date.UTC(jaar, maand - 1, dg + 13));
}

const jaren = [];
for (let j = 2026; existsSync(`public/data/${j}/rooster.json`); j++) jaren.push(j);
assert.ok(jaren.length, 'geen jaarroosters gevonden');

for (const j of jaren) {
  const rooster = lees(`public/data/${j}/rooster.json`);
  const dagen = Object.values(rooster);
  assert.equal(dagen.length, j % 4 === 0 ? 366 : 365, `${j}: aantal dagen`);
  let verwacht = new Date(Date.UTC(j, 0, 14));
  for (const d of dagen) {
    assert.equal(d.c, dag(verwacht), `${j}: datums lopen niet door`);
    assert.ok(d.r.length > 0, `${j}: geen lezingen op ${d.c}`);
    verwacht = new Date(verwacht.getTime() + 864e5);
  }
  assert.equal(dagen.at(-1).c, `${j + 1}-01-13`, `${j}: laatste dag`);

  let lezingen = 0;
  for (let m = 1; m <= 12; m++) {
    const maand = lees(`public/data/${j}/lezingen-${String(m).padStart(2, '0')}.json`);
    for (const [k, lijst] of Object.entries(maand)) {
      assert.equal(lijst.length, rooster[k].r.length, `${j} ${k}: aantal teksten`);
      for (const l of lijst) assert.ok(l.verses.length > 0, `${j} ${k}: ${l.ref} zonder verzen`);
      lezingen += lijst.length;
    }
  }

  const pascha = dagen.find((d) => d.c === dag(orthodoxPascha(j)));
  assert.ok(pascha?.r.some((l) => l.ref === 'John 1:1-17'), `${j}: Pascha (${dag(orthodoxPascha(j))}) zonder paasevangelie`);
  console.log(`${j}: ${dagen.length} dagen, ${lezingen} lezingen, Pascha ${pascha.c}`);
}
console.log(`leesrooster: alle controles geslaagd (${jaren[0]}–${jaren.at(-1)})`);
