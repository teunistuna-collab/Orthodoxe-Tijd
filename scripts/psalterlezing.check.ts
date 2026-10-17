// Zelftest voor src/lib/psalterlezing.ts — draaien met: npm run check:psalterlezing
// Vaste datums als invoer (geen systeemklok). 2026: orthodox Pascha 12 april (Gregoriaans).
import assert from 'node:assert/strict';
import { addDays, orthodoxPascha, parseYmd, ymd, type Mode } from '../src/lib/kalender';
import { KATHISMATA, PSALMEN } from '../src/lib/psalmen';
import { POLYELEOS_PSALMEN, periodeVan, psalterlezing, psalterlezingen, tekstBeschikbaar, type Dienst, type Lezing } from '../src/lib/psalterlezing';

const kort = (ls: Lezing[]): string =>
  ls.map((l) => (l.soort === 'kathisma' ? String(l.nr) : l.soort === 'deel' ? `${l.nr}.${l.deel}` : l.soort === 'polyeleos' ? 'P' : `(${kort(l.opties).replace(', ', '|')})`)).join(', ');
const pl = (d: string, dienst: Dienst, mode: Mode = 'nieuw') => psalterlezing(d, dienst, mode);
const is = (d: string, dienst: Dienst, status: string, lezingen: string, mode: Mode = 'nieuw') => {
  const r = pl(d, dienst, mode);
  assert.equal(`${r.status} [${kort(r.lezingen)}]`, `${status} [${lezingen}]`, `${d} ${dienst} (${mode})`);
  return r;
};
const periode = (d: string, mode: Mode = 'nieuw') => periodeVan(parseYmd(d), mode).sleutel;

assert.equal(ymd(orthodoxPascha(2026)), '2026-04-12');

// Gewone week in beide seizoensschema's
is('2026-07-06', 'metten', 'gewoon', '4, 5'); // maandag, Thomaszondag–21 sep
is('2026-07-06', 'vespers', 'gewoon', '6');
is('2026-07-12', 'metten', 'gewoon', '2, 3, (17|P)'); // zondag: keuze
is('2026-10-19', 'metten', 'gewoon', '4, 5, 6'); // maandag, 22 sep–19 dec
is('2026-10-19', 'vespers', 'gewoon', '18');
is('2026-10-23', 'metten', 'gewoon', '19, 20'); // vrijdag
is('2026-10-24', 'metten', 'gewoon', '16, 17'); // zaterdag

// Grenzen (nieuwe kalender: kerkelijke = burgerlijke datum)
assert.equal(periode('2026-09-21'), 'thomas-sep21');
assert.equal(periode('2026-09-22'), 'sep22-dec19');
is('2026-09-21', 'metten', 'gewoon', '4, 5'); // maandag
is('2026-09-22', 'metten', 'gewoon', '7, 8, 9'); // dinsdag
assert.equal(periode('2027-12-19'), 'sep22-dec19');
assert.equal(periode('2027-12-20'), 'dec20-jan14');
is('2027-12-21', 'metten', 'gewoon', '7, 8'); // dinsdag (20 dec heeft een feest met rang Polyeleos)
is('2027-12-14', 'metten', 'gewoon', '7, 8, 9'); // dinsdag ervoor
is('2027-12-20', 'metten', 'onbekend', ''); // H. Ignatius (rang Polyeleos in lib/feesten.ts)
assert.equal(periode('2027-01-14'), 'dec20-jan14');
assert.equal(periode('2027-01-15'), 'jan15-verloren-zoon');
is('2027-01-14', 'metten', 'gewoon', '13, 14'); // donderdag
is('2027-01-21', 'metten', 'gewoon', '13, 14, 15'); // donderdag erna

// Oude kalender: de grenzen vallen 13 dagen later (via kerkDatum), ook over de jaarwisseling
assert.equal(periode('2026-10-04', 'oud'), 'thomas-sep21'); // kerkelijk 21 sep
assert.equal(periode('2026-10-05', 'oud'), 'sep22-dec19'); // kerkelijk 22 sep
assert.equal(periode('2026-10-05', 'nieuw'), 'sep22-dec19');
is('2026-09-28', 'metten', 'gewoon', '4, 5', 'oud'); // maandag, kerkelijk 15 sep
is('2026-09-28', 'metten', 'gewoon', '4, 5, 6', 'nieuw');
assert.equal(periode('2027-01-01', 'oud'), 'sep22-dec19'); // kerkelijk 19 dec 2026
assert.equal(periode('2027-01-02', 'oud'), 'dec20-jan14'); // kerkelijk 20 dec 2026
assert.equal(periode('2027-01-01', 'nieuw'), 'dec20-jan14');
assert.equal(periode('2027-01-27', 'oud'), 'dec20-jan14'); // kerkelijk 14 jan
assert.equal(periode('2027-01-28', 'oud'), 'jan15-verloren-zoon');
assert.equal(periode('2026-12-31'), 'dec20-jan14');

// Voorbereiding en Grote Vasten (2026: Verloren Zoon 8 feb, Vergevingszondag 22 feb, Schone Maandag 23 feb)
assert.equal(periode('2026-02-07'), 'jan15-verloren-zoon');
assert.equal(periode('2026-02-08'), 'verloren-zoon-vergeving');
is('2026-02-02', 'metten', 'onbekend', ''); // Ontmoeting van de Heer (maandag): grote feest
is('2026-02-09', 'metten', 'gewoon', '4, 5'); // maandag na de Verloren Zoon
is('2026-02-16', 'metten', 'gewoon', '4, 5'); // maandag van de Kaasweek
assert.equal(periode('2026-02-22'), 'verloren-zoon-vergeving');
is('2026-02-22', 'vespers', 'geen', ''); // vergevingsvesper: zondagavond
assert.equal(periode('2026-02-23'), 'grote-vasten');
is('2026-02-23', 'metten', 'gewoon', '4, 5, 6'); // Schone Maandag
is('2026-02-24', 'metten', 'gewoon', '10, 11, 12');
is('2026-02-25', 'metten', 'gewoon', '19, 20, 1');
is('2026-02-26', 'metten', 'gewoon', '6, 7, 8');
is('2026-02-23', 'vespers', 'gewoon', '18');
is('2026-03-01', 'metten', 'gewoon', '2, 3, (17|P)'); // zondag van de Orthodoxie
assert.match(pl('2026-03-01', 'metten').toelichting[0], /Grote Vasten volgt de Polyeleos/);
assert.equal(periodeVan(parseYmd('2026-03-01'), 'nieuw').week, 1);

// Vijfde vastenweek (ma 23 – za 28 mrt 2026); oude kalender, dan valt de Annunciatie niet in deze week
assert.equal(periode('2026-03-23', 'oud'), 'grote-vasten-5');
is('2026-03-23', 'metten', 'gewoon', '4, 5, 6', 'oud');
is('2026-03-24', 'metten', 'gewoon', '11, 12, 13', 'oud');
is('2026-03-25', 'metten', 'gewoon', '20, 1, 2', 'oud');
is('2026-03-26', 'metten', 'gewoon', '8', 'oud'); // donderdag van de Grote Canon
is('2026-03-23', 'vespers', 'gewoon', '10', 'oud');
is('2026-03-24', 'vespers', 'gewoon', '19', 'oud');
is('2026-03-25', 'vespers', 'gewoon', '7', 'oud');
is('2026-03-26', 'vespers', 'gewoon', '12', 'oud');
// Vrijdagavond: vesper van de Akathistzaterdag (rang Polyeleos in lib/feesten.ts, niet gecontroleerd)
const akathist = is('2026-03-27', 'vespers', 'onbekend', '', 'oud');
assert.equal(kort(akathist.zonderFeest ?? []), '18');

// Lazaruszaterdag, Palmzondag, Goede Week (2026: 4–11 april)
is('2026-04-04', 'metten', 'vastgesteld', '16, 17'); // Lazaruszaterdag: week 6 in de tabel
is('2026-04-04', 'vespers', 'onbekend', ''); // vesper van Palmzondag (groot feest van de Heer)
is('2026-04-05', 'metten', 'vastgesteld', '2, 3, P'); // Palmzondag
is('2026-04-05', 'vespers', 'geen', ''); // zondagavond
is('2026-04-06', 'metten', 'vastgesteld', '4, 5, 6');
is('2026-04-07', 'metten', 'vastgesteld', '9, 10, 11');
is('2026-04-08', 'metten', 'vastgesteld', '14, 15, 16');
is('2026-04-09', 'metten', 'geen', '');
is('2026-04-10', 'metten', 'geen', '');
is('2026-04-11', 'metten', 'vastgesteld', '17'); // Grote Zaterdag
is('2026-04-08', 'vespers', 'vastgesteld', '18');
is('2026-04-09', 'vespers', 'onbekend', ''); // lege cel in de bron
is('2026-04-11', 'vespers', 'onbekend', '');
is('2026-04-07', 'metten', 'onbekend', '', 'oud'); // Annunciatie (oude kalender) in de Goede Week

// Pascha, Lichte Week, Thomaszondag
is('2026-04-12', 'metten', 'geen', '');
is('2026-04-12', 'vespers', 'geen', '');
is('2026-04-15', 'metten', 'geen', '');
is('2026-04-18', 'vespers', 'geen', ''); // Lichte Zaterdag (vesper van Thomaszondag): nog de Lichte Week
assert.equal(periode('2026-04-19'), 'thomas-sep21');
is('2026-04-19', 'metten', 'gewoon', '2, 3, (17|P)');
is('2026-04-20', 'metten', 'gewoon', '4, 5');
// H. Georgius (23 april, oude kalender = 6 mei) valt in 2027 in de Lichte Week (Pascha 2 mei): Polyeleos, rang niet gecontroleerd
is('2027-05-06', 'metten', 'onbekend', '', 'oud');

// Zaterdagavond = vesper van zondag; de datum blijft de zaterdag
const zat = is('2026-10-17', 'vespers', 'gewoon', '1');
assert.equal(zat.datum, '2026-10-17');
assert.equal(zat.liturgischeDag, '2026-10-18');
assert.match(zat.toelichting[0], /dag des Heren/);

// Vastgestelde feestelijke uitzondering: grote feesten van de Moeder Gods
is('2026-09-08', 'metten', 'vastgesteld', '7, 8, P'); // dinsdag, twee kathisma's: Polyeleos als derde
is('2026-09-07', 'vespers', 'vastgesteld', '1.1'); // maandagavond: alleen „Zalig de man”
is('2026-11-20', 'vespers', 'vastgesteld', '1.1'); // vrijdagavond vóór de Intrede
is('2026-11-21', 'metten', 'vastgesteld', '16, 17, P'); // Intrede op zaterdag
is('2026-08-15', 'metten', 'vastgesteld', '16, 17, P'); // Ontslaping op zaterdag
is('2026-08-15', 'vespers', 'onbekend', ''); // zaterdagavond na het feest
is('2026-09-08', 'vespers', 'geen', ''); // avond van het feest: na de vigilie
is('2027-11-21', 'metten', 'vastgesteld', '2, 3, P'); // Intrede op zondag: de Polyeleos vervangt kathisma 17
is('2028-11-21', 'metten', 'vastgesteld', '7, 8, P'); // dinsdag, drie kathisma's: de Polyeleos vervangt het derde

// Onbekende feestelijke uitzondering: grote feesten van de Heer en andere feesten met een rang
const tabor = is('2026-08-06', 'metten', 'onbekend', '');
assert.equal(kort(tabor.zonderFeest ?? []), '13, 14');
is('2026-08-05', 'vespers', 'onbekend', '');
is('2026-11-08', 'metten', 'onbekend', ''); // Synaxis van de aartsengel Michaël (zondag)
is('2026-12-25', 'metten', 'onbekend', '');
is('2026-05-21', 'vespers', 'geen', ''); // Hemelvaart (do): avond na de vigilie
is('2026-05-20', 'vespers', 'onbekend', ''); // vesper van Hemelvaart

// Verschillende kalenders, zelfde burgerlijke datum
is('2026-08-28', 'metten', 'gewoon', '19, 20', 'nieuw');
is('2026-08-28', 'metten', 'vastgesteld', '19, 20, P', 'oud'); // kerkelijk 15 aug: Ontslaping
is('2027-01-07', 'metten', 'onbekend', '', 'oud'); // Kerstmis (oude kalender)
is('2027-01-07', 'metten', 'onbekend', '', 'nieuw'); // Synaxis van Johannes de Voorloper (rang Polyeleos)
is('2027-01-08', 'metten', 'gewoon', '19, 20', 'nieuw'); // vrijdag
is('2027-01-08', 'metten', 'onbekend', '', 'oud'); // kerkelijk 26 dec: Synaxis van de Moeder Gods

// Alle dagen van twee jaar, beide kalenders: lezingen alleen bij vastgesteld/gewoon, geldige kathisma's, en
// Metten en Vespers van dezelfde datum zijn dezelfde uitkomst als los berekend.
for (const mode of ['nieuw', 'oud'] as Mode[]) {
  for (let d = parseYmd('2026-01-01'); d < parseYmd('2028-01-01'); d = addDays(d, 1)) {
    const beide = psalterlezingen(d, mode);
    for (const r of [beide.metten, beide.vespers]) {
      const metLezing = r.status === 'vastgesteld' || r.status === 'gewoon';
      assert.equal(r.lezingen.length > 0, metLezing, `${r.datum} ${r.dienst} ${mode}: ${r.status}`);
      const alle = r.lezingen.flatMap((l) => (l.soort === 'keuze' ? l.opties : [l]));
      assert.ok(alle.every((l) => l.soort === 'polyeleos' || (l.nr >= 1 && l.nr <= 20 && (l.soort !== 'deel' || (l.deel >= 1 && l.deel <= 3)))));
      assert.ok(r.toelichting.length > 0 || r.status === 'gewoon' || r.status === 'vastgesteld');
      assert.ok(r.bron[0].url.startsWith('https://www.oca.org/liturgics/outlines/kathisma-readings-at-'));
    }
    assert.deepEqual(beide.metten, psalterlezing(ymd(d), 'metten', mode));
  }
}

// LXX-nummering: Polyeleos = Psalm 134 en 135 (LXX), kathisma 18 = 119–133, Psalm 50 is Hebreeuws 51
assert.deepEqual(POLYELEOS_PSALMEN, [134, 135]);
assert.deepEqual([KATHISMATA[17].van, KATHISMATA[17].tot], [119, 133]);
assert.equal(PSALMEN[49].masoreticNumber, 51);
// Beschikbaarheid is los van de toewijzing
assert.equal(tekstBeschikbaar({ soort: 'kathisma', nr: 17 }), 'ja');
assert.equal(tekstBeschikbaar({ soort: 'kathisma', nr: 4 }), 'deels');
assert.equal(tekstBeschikbaar({ soort: 'kathisma', nr: 1 }), 'nee');
assert.equal(tekstBeschikbaar({ soort: 'deel', nr: 1, deel: 1 }), 'nee');
assert.equal(tekstBeschikbaar({ soort: 'polyeleos' }), 'nee');

console.log('psalterlezing: alle controles geslaagd');
