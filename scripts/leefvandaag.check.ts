// Zelftest voor src/lib/leefVandaag.ts en src/lib/schrift.ts ("Leef vandaag met de Kerk") — npm run check:leefvandaag
import assert from 'node:assert/strict';
import { addDays, dagInfo, utc, ymd, type Mode } from '../src/lib/kalender';
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
assert.match(leef(2027, 3, 17).overweeg, /^De Grote Vasten/); // Grote Vasten (woensdag: de periode gaat voor)
assert.match(leef(2027, 4, 30).overweeg, /^Op Grote Vrijdag/);
assert.match(leef(2027, 4, 28).overweeg, /Heilige Week/);
assert.match(leef(2027, 5, 2).overweeg, /^Christus is opgestaan/); // Pascha
assert.match(leef(2027, 5, 5).overweeg, /Lichte Week/);
assert.match(leef(2027, 5, 19).overweeg, /Paastijd/);
assert.match(leef(2027, 6, 20).overweeg, /Heilige Geest neer/); // Pinksteren
assert.match(leef(2026, 12, 2).overweeg, /^In de Geboortevasten/); // Geboortevasten
assert.match(leef(2026, 12, 4).overweeg, /tempel werd gebracht/); // Intrede (groot feest gaat voor de vasten)
assert.match(leef(2027, 7, 1).overweeg, /^De Apostelvasten/);
assert.match(leef(2026, 8, 18).overweeg, /^De Ontslapingsvasten/);
assert.match(leef(2027, 1, 13).overweeg, /Kersttijd/);
// Heilige met vigilie: de naam uit de kalender (H. Nicolaas, kerkelijk 6 december; gaat voor de Geboortevasten)
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

console.log('leefvandaag: alle controles geslaagd');
