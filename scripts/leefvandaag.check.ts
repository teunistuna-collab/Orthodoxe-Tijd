// Zelftest voor src/lib/leefVandaag.ts en src/lib/schrift.ts ("Leef vandaag met de Kerk") — npm run check:leefvandaag
import assert from 'node:assert/strict';
import { addDays, dagInfo, utc, vandaag, ymd, type Mode } from '../src/lib/kalender';
import { leefVoor } from '../src/lib/leefVandaag';
import { schriftCitaat, schriftRef } from '../src/lib/schrift';

const leef = (j: number, m: number, d: number, mode: Mode = 'oud') => leefVoor(dagInfo(utc(j, m, d), mode));
const zinnen = (t: string) => (t.match(/[^.!?]+[.!?]+/g) ?? [t]).length;

// De gevraagde testdagen (oude kalender, uit de kalender zelf)
assert.match(leef(2026, 10, 26).overweeg, /^Op maandag gedenkt de Kerk de engelen/); // gewone maandag
assert.match(leef(2026, 10, 21).overweeg, /^Op woensdag/); // woensdag
assert.match(leef(2026, 10, 23).overweeg, /^De Kerk gedenkt op vrijdag/); // vrijdag
assert.match(leef(2026, 10, 25).overweeg, /^Iedere zondag/); // zondag
assert.match(leef(2027, 1, 7).overweeg, /^Christus is geboren/); // groot feest: Kerstmis
assert.match(leef(2027, 1, 19).overweeg, /Jordaan/); // Theofanie
assert.match(leef(2027, 3, 17).overweeg, /Voorafgewijde Gaven/); // Grote Vasten, woensdag: de variant van de periode
assert.match(leef(2027, 4, 30).overweeg, /^Op Grote Vrijdag/);
assert.match(leef(2027, 4, 28).overweeg, /Heilige Week/);
assert.match(leef(2027, 5, 2).overweeg, /^Christus is opgestaan/); // Pascha
assert.match(leef(2027, 5, 5).overweeg, /Lichte Week/);
assert.match(leef(2027, 5, 19).overweeg, /Paastijd/);
assert.match(leef(2027, 6, 20).overweeg, /Heilige Geest neer/); // Pinksteren
assert.match(leef(2026, 12, 2).overweeg, /Hij die als kind komt/); // Geboortevasten, woensdag
assert.match(leef(2026, 12, 4).overweeg, /tempel werd gebracht/); // Intrede (groot feest gaat voor de vasten)
assert.match(leef(2027, 7, 1).overweeg, /lieten alles achter/); // Apostelvasten, donderdag
assert.match(leef(2026, 8, 18).overweeg, /eenvoud/); // Ontslapingsvasten, dinsdag
assert.match(leef(2027, 1, 13).overweeg, /Kersttijd/);
// Heilige met vigilie: de naam uit de kalender (H. Nicolaas, kerkelijk 6 december; gaat voor de Geboortevasten), tekst voor een heilige
assert.match(leef(2026, 12, 19).overweeg, /^Vandaag gedenkt de Kerk: H\. Nicolaas van Myra/);
// Schriftwoord: verwijzing in NBV21-vorm of LXX-nummering, nooit een citaat zolang niets gecontroleerd is
assert.equal(schriftRef(leef(2026, 10, 23).schrift!), 'Johannes 15:13');
assert.equal(schriftRef(leef(2026, 10, 25).schrift!), 'Psalm 117:24 (LXX; 118 in de Hebreeuwse telling)');

// Elke dag 2026–2028, beide kalenders: alles ingevuld, overweeg ≤ 3 zinnen, bid ≤ 2 zinnen, geen citaat
for (const mode of ['oud', 'nieuw'] as Mode[])
  for (let t = utc(2026, 1, 1); t < utc(2029, 1, 1); t = addDays(t, 1)) {
    const l = leefVoor(dagInfo(t, mode));
    assert.ok(l && l.overweeg && l.bid && l.praktijk && l.schrift, `${ymd(t)} ${mode}`);
    assert.ok(zinnen(l.overweeg) <= 3, `${ymd(t)} overweeg: ${l.overweeg}`);
    assert.ok(zinnen(l.bid) <= 2, `${ymd(t)} bid`);
    assert.ok(!/[„"“]/.test(l.overweeg + l.praktijk) || /Christus is (geboren|opgestaan)/.test(l.bid), `${ymd(t)} geen citaten in de tekst`);
  }
const citaten = await Promise.all([leef(2026, 10, 23), leef(2026, 10, 25), leef(2027, 5, 2)].map((l) => schriftCitaat(l.schrift!)));
assert.deepEqual(citaten, [null, null, null]);

// Fase D: aanvullende testgevallen (oude kalender; data uit de kalender zelf)
// Vastenvrije week na de Tollenaar (2027: Pascha 2 mei → Tollenaar 21 februari): woensdag houdt zijn gedachtenis, vasten is vrij
const vrijeWo = dagInfo(utc(2027, 2, 24), 'oud');
assert.equal(vrijeWo.vasten.niveau, 'vrij');
assert.match(leefVoor(vrijeWo).overweeg, /^Op woensdag/);
assert.match(leef(2027, 3, 15).overweeg, /^De Grote Vasten is de tijd van bekering/); // Schone Maandag, begin van de Grote Vasten
// Groot feest op woensdag en op vrijdag gaat voor de weekdag (kerkelijk 6 en 15 augustus 2026 = 19 en 28 augustus)
assert.equal(dagInfo(utc(2026, 8, 19), 'oud').weekdag, 3);
assert.match(leef(2026, 8, 19).overweeg, /Tabor/); // Transfiguratie op woensdag
assert.equal(dagInfo(utc(2026, 8, 28), 'oud').weekdag, 5);
assert.match(leef(2026, 8, 28).overweeg, /ontslapen van de Moeder Gods/); // Ontslaping op vrijdag, niet de kruisiging
// Dag zonder eigen redactionele tekst: de vaste tekst met de naam uit de kalender
assert.match(leef(2026, 9, 11).overweeg, /^Vandaag gedenkt de Kerk: Onthoofding van Johannes de Doper/);
// Jaarwisseling: beide dagen in de Geboortevasten (oud); op de nieuwe kalender Kersttijd en de Besnijdenis
assert.match(leef(2026, 12, 31).overweeg, /heilige Nicolaas, wiens feest/); // donderdag in de Geboortevasten
assert.match(leef(2027, 1, 1).overweeg, /kribbe/); // vrijdag in de Geboortevasten
assert.match(leef(2026, 12, 31, 'nieuw').overweeg, /Kersttijd/);
assert.match(leef(2027, 1, 1, 'nieuw').overweeg, /^Vandaag gedenkt de Kerk: Besnijdenis.*feest van de Heer/); // feest van de Heer
// Middernacht: vandaag() volgt de lokale kalenderdag (23:59:59 en 00:00:00), en de tekst wisselt mee
{
  const Echt = Date;
  const op = (iso: string) => { const t = new Echt(iso).getTime(); globalThis.Date = class extends Echt { constructor(...a: []) { super(...(a.length ? a : [t]) as []); } static now() { return t; } } as DateConstructor; };
  op('2026-10-22T23:59:59'); const voor = vandaag();
  op('2026-10-23T00:00:00'); const na = vandaag();
  globalThis.Date = Echt;
  assert.equal(ymd(voor), '2026-10-22');
  assert.equal(ymd(na), '2026-10-23');
  assert.match(leefVoor(dagInfo(voor, 'oud')).overweeg, /^Op donderdag/);
  assert.match(leefVoor(dagInfo(na, 'oud')).overweeg, /^De Kerk gedenkt op vrijdag/);
}
// Ontbrekend NBV21-citaat en ontbrekend LXX-psalmcitaat: alleen de verwijzing
assert.equal(await schriftCitaat({ soort: 'nbv21', ref: 'Johannes 1:14' }), null);
assert.equal(await schriftCitaat({ soort: 'psalm', lxx: 90, vers: 11, mt: 91 }), null);

// Fase D (a): eigen teksten (oude kalender 2026/27; Pascha 2 mei 2027)
assert.match(leef(2027, 4, 24).overweeg, /^Op Lazaruszaterdag/);
assert.match(leef(2027, 3, 14).overweeg, /^Op Vergevingszondag/); // Pascha − 49
assert.match(leef(2027, 5, 1).overweeg, /^Op Grote Zaterdag/);
assert.match(leef(2027, 1, 6).overweeg, /vooravond van de Geboorte/); // kerkelijk 24 december
assert.match(leef(2027, 1, 18).overweeg, /vooravond van Theofanie/); // kerkelijk 5 januari (maandag)
assert.match(leef(2026, 12, 24, 'nieuw').overweeg, /vooravond van de Geboorte/);
// (c) feest van de Moeder Gods en een heilige zonder eigen tekst
assert.match(leef(2027, 1, 8).overweeg, /^In de Kersttijd/); // Synaxis van de Moeder Gods valt in de Kersttijd: de periode gaat voor
assert.match(leef(2026, 10, 14).overweeg, /Moeder Gods wijst ons/); // Bescherming van de Moeder Gods (kerkelijk 1 oktober)
assert.match(leef(2026, 9, 11).overweeg, /leven van de heiligen/); // Onthoofding van Johannes de Doper
// (b) in de vastenperioden nooit twee dagen achter elkaar dezelfde overweging
for (const mode of ['oud', 'nieuw'] as Mode[]) {
  let vorige = '';
  for (let t = utc(2026, 1, 1); t < utc(2029, 1, 1); t = addDays(t, 1)) {
    const d = dagInfo(t, mode);
    const o = leefVoor(d).overweeg;
    if (['Grote Vasten', 'Kerstvasten', 'Apostelvasten', 'Dormitionvasten'].includes(d.vasten.periode ?? '')) assert.notEqual(o, vorige, `${ymd(t)} ${mode}: zelfde tekst als gisteren`);
    vorige = o;
  }
}

console.log('leefvandaag: alle controles geslaagd');
