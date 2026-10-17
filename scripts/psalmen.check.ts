// Zelftest voor src/lib/psalmen.ts — draaien met: npm run check:psalmen
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { ETMAAL_GROEPEN, KATHISMATA, THEMAS, PSALM_BRONNEN, PSALMEN, kathismaStappen, psalmBereik, psalmVanHetUur, verzenVanStuk, zoekPsalmen, type PsalmTeksten } from '../src/lib/psalmen';
import { serviceConfig } from '../src/lib/etmaal';

const teksten = JSON.parse(readFileSync('public/data/psalmen.json', 'utf8')) as PsalmTeksten;

// De lijst met teksten in de code klopt met het gegenereerde bestand (nummers én Hebreeuwse nummering).
const metTekst = Object.entries(PSALM_BRONNEN).filter(([, b]) => b.tekst);
assert.deepEqual(metTekst.map(([n]) => Number(n)).sort((a, b) => a - b), Object.keys(teksten).map(Number).sort((a, b) => a - b));
for (const [n, { mt }] of metTekst) assert.equal(mt, teksten[n].mt, `Hebreeuws nummer van psalm ${n}`);
// Audio: alleen echte bestanden in public/, en alleen via de centrale psalmendata.
for (const [n, { audio }] of Object.entries(PSALM_BRONNEN)) if (audio) assert.ok(existsSync(`public${audio}`), `audiobestand van psalm ${n} ontbreekt: ${audio}`);
assert.equal(PSALMEN.filter((p) => p.audioSrc).length, Object.values(PSALM_BRONNEN).filter((b) => b.audio).length);

assert.equal(PSALMEN.length, 150);
assert.equal(PSALMEN[0].septuagintNumber, 1);
assert.equal(PSALMEN.filter((p) => p.hasText).length, Object.keys(teksten).length);

// Elke dienst heeft psalmen (een verkeerd gespelde dienstnaam in ETMAAL_PSALMEN valt zo op).
for (const g of ETMAAL_GROEPEN) assert.ok(g.delen.length > 0, `psalmen voor ${g.dienst}`);
assert.deepEqual(PSALMEN[2].liturgicalUses, [{ dienst: 'Metten', tijd: '03:00', onderdeel: 'Hexapsalm' }]);

// Iedere psalm uit het etmaal heeft zijn dienst als gebruik, en een tekst.
for (const dienst of serviceConfig) {
  for (const { title } of dienst.psalms) {
    const p = PSALMEN[Number(title.replace('Psalm ', '')) - 1];
    assert.ok(p.liturgicalUses.some((g) => g.dienst === dienst.title), `${title} in ${dienst.title}`);
    assert.ok(p.hasText, `${title} heeft tekst`);
  }
}

// Kathismata: 1 t/m 20, oplopend en zonder overlap, binnen 1–150.
assert.deepEqual(KATHISMATA.map((k) => k.nr), Array.from({ length: 20 }, (_, i) => i + 1));
KATHISMATA.forEach((k, i) => assert.ok(k.van <= k.tot && k.tot <= 150 && (i === 0 || k.van > KATHISMATA[i - 1].tot), `kathisma ${k.nr}`));
// Elk kathisma drie delen; samen precies de psalmen 1–150 in volgorde (Psalm 118 driemaal, als versbereik).
assert.ok(KATHISMATA.every((k) => k.delen.length === 3 && k.delen.every((d) => d.length > 0)));
const volgorde = KATHISMATA.flatMap((k) => kathismaStappen(k).map((s) => s.psalm)).filter((n, i, a) => n !== a[i - 1]);
assert.deepEqual(volgorde, Array.from({ length: 150 }, (_, i) => i + 1));
// De indeling volgens de bron (OCA), per deel "eerste–laatste"; kathisma 17 als versbereiken van Psalm 118.
const deelTekst = (d: { psalm: number; vanVers?: number; totVers?: number }[]) =>
  d[0].vanVers ? `${d[0].psalm}:${d[0].vanVers}–${d[0].totVers}` : d[0].psalm === d.at(-1)!.psalm ? `${d[0].psalm}` : `${d[0].psalm}–${d.at(-1)!.psalm}`;
assert.deepEqual(KATHISMATA.map((k) => k.delen.map(deelTekst).join(' | ')), [
  '1–3 | 4–6 | 7–8', '9–10 | 11–13 | 14–16', '17 | 18–20 | 21–23', '24–26 | 27–29 | 30–31', '32–33 | 34–35 | 36',
  '37–39 | 40–42 | 43–45', '46–48 | 49–50 | 51–54', '55–57 | 58–60 | 61–63', '64–66 | 67 | 68–69', '70–71 | 72–73 | 74–76',
  '77 | 78–80 | 81–84', '85–87 | 88 | 89–90', '91–93 | 94–96 | 97–100', '101–102 | 103 | 104', '105 | 106 | 107–108',
  '109–111 | 112–114 | 115–117', '118:1–72 | 118:73–131 | 118:132–176', '119–123 | 124–128 | 129–133', '134–136 | 137–139 | 140–142',
  '143–144 | 145–147 | 148–150',
]);
assert.deepEqual(KATHISMATA.map((k) => psalmBereik(k.van, k.tot)).slice(15, 18), ['Psalmen 109–117', 'Psalm 118', 'Psalmen 119–133']);
// Psalm 118 in drie delen op de versnummers van de bron: samen alle blokken, de stasis-koppen precies bij vers 73 en 132.
const ps118 = teksten['118'];
const delen118 = KATHISMATA[16].delen.map((d) => verzenVanStuk(ps118, d[0]));
assert.ok(delen118.every((d) => d && d.length > 0));
assert.deepEqual(delen118.flatMap((d) => d!), ps118.verzen);
assert.deepEqual(delen118.map((d) => [d![0].kop ?? null, d!.find((v) => v.n)?.n, d!.findLast((v) => v.n)?.n]), [[null, 2, 72], ['tweede stasis', 73, 131], ['derde stasis', 132, 176]]);
// Zonder versnummers in het bereik wordt er niet geknipt.
assert.equal(verzenVanStuk({ ...ps118, verzen: ps118.verzen.filter((v) => v.n !== 100) }, KATHISMATA[16].delen[1][0]), null);

// Thema's: geldige nummers, verzen alleen bij psalmen van dat thema; Psalm 18 deels lofzang, deels wet.
for (const t of THEMAS) {
  assert.ok(t.psalmen.every((n) => n >= 1 && n <= 150), t.naam);
  assert.ok(Object.keys(t.verzen ?? {}).every((n) => t.psalmen.includes(Number(n))), `verzen ${t.naam}`);
}
assert.deepEqual(PSALMEN[17].themes, ['Lofzangen (vers 1–7)', 'Wet (vers 8–15)']);
assert.deepEqual(zoekPsalmen(PSALMEN, 'histories', null).map((p) => p.septuagintNumber), [77, 105, 113]);

// Psalm van het uur volgt de begintijden van de diensten.
const om = (uur: number) => psalmVanHetUur(new Date(2026, 8, 25, uur, 30));
assert.equal(om(19), 103); // Vespers 18:00
assert.equal(om(22), 50); // Completen 21:00
assert.equal(om(1), 118); // Middernachtdienst 00:00
assert.equal(om(10), 24); // Derde Uur 09:00

// Zoeken: Septuagint- en Hebreeuws nummer, dienst, woord uit de tekst.
assert.deepEqual(zoekPsalmen(PSALMEN, '24', null).map((p) => p.septuagintNumber), [24]);
assert.deepEqual(zoekPsalmen(PSALMEN, 'Psalm 51', null).map((p) => p.septuagintNumber), [51, 50]);
assert.deepEqual(zoekPsalmen(PSALMEN, 'vespers', null).map((p) => p.septuagintNumber), [103, 116, 129, 140, 141]);
assert.ok(zoekPsalmen(PSALMEN, 'allerhoogste', teksten).some((p) => p.septuagintNumber === 90));
assert.equal(zoekPsalmen(PSALMEN, '', null).length, 150);

console.log('psalmen: alle controles geslaagd');
