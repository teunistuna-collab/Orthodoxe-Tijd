// Zelftest voor src/lib/geboortecyclus.ts, de kleur en "De betekenis van vandaag" in de Geboortecyclus — npm run check:geboortecyclus
// Vaste datums als invoer (geen systeemklok).
import assert from 'node:assert/strict';
import { civilNaarJuliaans, dagInfo, orthodoxPascha, utc, ymd, type Mode } from '../src/lib/kalender';
import { geboorteBannerTitel, geboortecyclusActief, geboortecyclusVoor, GEBOORTE_STAPPEN } from '../src/lib/geboortecyclus';
import { actieveCyclus } from '../src/lib/seizoen';
import { kleurVanDeDag } from '../src/lib/liturgischeKleur';
import { betekenisVoor } from '../src/lib/betekenisVanVandaag';

const d = (s: string) => utc(...(s.split('-').map(Number) as [number, number, number]));
const g = (s: string, mode: Mode = 'oud') => geboortecyclusVoor(d(s), mode);
const nu = (s: string, mode: Mode = 'oud') => g(s, mode).huidige;
const kleur = (s: string, mode: Mode = 'oud') => kleurVanDeDag(dagInfo(d(s), mode)).kleur;
const bv = (s: string, mode: Mode = 'oud') => betekenisVoor(dagInfo(d(s), mode), mode);

// Juliaanse omrekening voor elke eeuw
assert.equal(ymd(civilNaarJuliaans(d('2027-01-07'))), '2026-12-25');
assert.equal(ymd(civilNaarJuliaans(d('2100-03-15'))), '2100-03-01'); // vanaf 2100: 14 dagen verschil
assert.equal(ymd(civilNaarJuliaans(d('2100-03-13'))), '2100-02-28');
assert.equal(ymd(orthodoxPascha(2026)), '2026-04-12');

// Oude kalender, cyclus 2026–2027 (de voorbeelddatums uit de opdracht)
assert.equal(nu('2026-11-27'), null); // dag vóór de Geboortevasten
assert.equal(nu('2026-11-28'), 'vasten'); // eerste dag
assert.equal(nu('2026-12-04'), 'vasten'); // Intrede van de Moeder Gods (kerkelijk 21 nov)
assert.equal(nu('2026-12-27'), 'voorouders'); // zondag, kerkelijk 14 dec
assert.equal(nu('2027-01-03'), 'vaders'); // zondag, kerkelijk 21 dec (ook in het voorfeest: de zondag gaat voor)
assert.equal(nu('2027-01-02'), 'voorfeest');
assert.equal(nu('2027-01-06'), 'vooravond');
assert.equal(nu('2027-01-07'), 'geboorte');
assert.equal(nu('2027-01-08'), 'nafeest'); // Synaxis van de Moeder Gods
assert.equal(nu('2027-01-13'), 'nafeest');
assert.equal(nu('2027-01-14'), 'besnijdenis');
assert.equal(nu('2027-01-15'), 'voorfeest-theofanie');
assert.equal(nu('2027-01-18'), 'vooravond-theofanie');
assert.equal(nu('2027-01-19'), 'theofanie');
assert.equal(nu('2027-01-20'), 'nafeest-theofanie'); // Synaxis van Johannes
assert.equal(nu('2027-01-27'), 'nafeest-theofanie'); // laatste dag
assert.equal(nu('2027-01-28'), null); // dag erna
// Jaarwisseling: 31 december en 1 januari horen bij dezelfde cyclus
assert.equal(ymd(g('2026-12-31').geboorte), '2027-01-07');
assert.equal(ymd(g('2027-01-01').geboorte), '2027-01-07');
// Buiten de cyclus: de eerstvolgende, met de aftelling
assert.equal(ymd(g('2027-02-01').geboorte), '2028-01-07');
assert.equal(ymd(g('2026-10-21').geboorte), '2027-01-07');
assert.equal(g('2026-10-21').dagenTotGeboorte, 78);
assert.equal(g('2027-01-10').dagenTotGeboorte, 0);
// Twaalf perioden, met datums in de juiste volgorde
assert.equal(GEBOORTE_STAPPEN.length, 12);
assert.deepEqual(g('2026-12-01').stappen.map((s) => `${s.key}:${ymd(s.van)}`).slice(0, 3), ['vasten:2026-11-28', 'voorouders:2026-12-27', 'vaders:2027-01-03']);

// Nieuwe kalender: dezelfde kerkelijke datums, burgerlijk 15 november t/m 14 januari
assert.equal(nu('2026-11-14', 'nieuw'), null);
assert.equal(nu('2026-11-15', 'nieuw'), 'vasten');
assert.equal(nu('2026-12-25', 'nieuw'), 'geboorte');
assert.equal(nu('2027-01-06', 'nieuw'), 'theofanie');
assert.equal(nu('2027-01-14', 'nieuw'), 'nafeest-theofanie');
assert.equal(nu('2027-01-15', 'nieuw'), null);

// Volgende eeuw: vanaf 2100 valt alles een dag later (oude kalender)
assert.equal(ymd(g('2100-12-01').geboorte), '2101-01-08');
assert.equal(nu('2100-11-28'), null);
assert.equal(nu('2100-11-29'), 'vasten');
assert.equal(nu('2101-01-28'), 'nafeest-theofanie');
assert.equal(nu('2101-01-29'), null);

// Liturgische kleur
assert.equal(kleur('2027-01-07'), 'wit'); // Geboorte
assert.equal(kleur('2027-01-08'), 'wit'); // nafeest
assert.equal(kleur('2027-01-14'), 'wit'); // Besnijdenis
assert.equal(kleur('2027-01-19'), 'wit'); // Theofanie
assert.equal(kleur('2027-01-27'), 'wit'); // nafeest van Theofanie
assert.equal(kleur('2026-12-04'), 'blauw'); // Intrede van de Moeder Gods
assert.equal(kleur('2026-12-02'), 'goud'); // gewone dag in de Geboortevasten

// Seizoenen: nooit tegelijk; buiten beide niets
assert.equal(actieveCyclus(d('2026-10-21'), 'oud'), null);
assert.equal(actieveCyclus(d('2026-11-28'), 'oud'), 'geboorte');
assert.equal(actieveCyclus(d('2027-05-02'), 'oud'), 'pascha');
assert.equal(actieveCyclus(d('2027-01-28'), 'oud'), null);
for (let t = d('2026-01-01'); t < d('2029-01-01'); t = new Date(t.getTime() + 864e5)) {
  for (const mode of ['oud', 'nieuw'] as Mode[]) {
    const c = actieveCyclus(t, mode);
    if (geboortecyclusActief(t, mode)) assert.equal(c, 'geboorte', ymd(t));
    const b = betekenisVoor(dagInfo(t, mode), mode);
    assert.equal(b === null, c === null, `${ymd(t)} ${mode}`);
    if (b) for (const deel of [b.liturgie, b.hymne, b.traditie, b.kerkvader, b.weetje]) if (deel) assert.ok(deel.tekst.trim().length > 20 && deel.bron, `${ymd(t)} ${deel.titel}`);
  }
}

// De betekenis van vandaag
assert.equal(bv('2026-11-27'), null);
assert.equal(bv('2026-11-28')?.periode.key, 'vasten');
assert.equal(bv('2026-11-28')?.icoon?.periodeIcoon, true); // icoon van de periode, niet van de dag
assert.equal(bv('2027-01-07')?.icoon?.periodeIcoon, false);
assert.match(bv('2027-01-07')?.hymne?.tekst ?? '', /^Uw geboorte, Christus onze God/);
assert.match(bv('2027-01-10')?.hymne?.tekst ?? '', /^Uw geboorte/); // nafeest
assert.match(bv('2027-01-19')?.hymne?.tekst ?? '', /^Toen Gij, Heer, in de Jordaan/);
assert.equal(bv('2027-01-19')?.icoon?.beeld, '/images/feesten/theofanie.webp'); // Theofanie
assert.equal(bv('2027-01-19')?.icoon?.periodeIcoon, false);
assert.equal(bv('2027-01-20')?.icoon?.beeld, '/images/feesten/synaxis-johannes.webp'); // Synaxis van Johannes
assert.equal(bv('2027-01-08')?.icoon?.beeld, '/images/feesten/synaxis-moeder-gods.webp');
assert.equal(bv('2027-01-14')?.icoon?.beeld, '/images/feesten/besnijdenis.webp');
assert.equal(bv('2026-12-04')?.icoon?.beeld, '/images/feesten/opdracht-moeder-gods.webp'); // Intrede (kerkelijk 21 nov)
assert.equal(bv('2026-12-19')?.icoon?.beeld, '/images/feesten/nicolaas.webp');
assert.equal(bv('2026-12-20')?.icoon?.beeld, '/images/feesten/kerst.jpg'); // gewone vastendag: icoon van de periode
assert.equal(bv('2027-01-25')?.icoon?.periodeIcoon, true); // nafeest van Theofanie
assert.equal(bv('2025-12-25', 'nieuw')?.icoon?.beeld, '/images/feesten/kerst.jpg');
assert.equal(bv('2026-12-27')?.icoon?.beeld, '/images/feesten/wijnstok.webp'); // Zondag van de Voorouders
assert.equal(bv('2027-01-03')?.icoon?.beeld, '/images/feesten/wijnstok.webp'); // Zondag van de Heilige Vaders
assert.equal(bv('2027-01-03')?.icoon?.periodeIcoon, true);
assert.equal(bv('2026-01-06', 'nieuw')?.icoon?.beeld, '/images/feesten/theofanie.webp');
assert.equal(bv('2027-01-19')?.link, '#geboorte');
assert.equal(bv('2027-01-28'), null);
assert.ok(bv('2027-01-06')?.kerkvader?.concept);

// Titel van de seizoensbanner op Vandaag
const titel = (s: string, mode: Mode = 'oud') => geboorteBannerTitel(d(s), mode);
assert.equal(titel('2026-11-27'), null);
assert.equal(titel('2026-11-28'), 'In verwachting van het Licht');
assert.equal(titel('2026-12-27'), 'In verwachting van het Licht'); // Zondag van de Voorouders
assert.equal(titel('2027-01-02'), 'Het Licht nadert');
assert.equal(titel('2027-01-03'), 'Het Licht nadert'); // Zondag van de Vaders, binnen het voorfeest
assert.equal(titel('2027-01-06'), 'Het Licht nadert');
assert.equal(titel('2027-01-07'), 'Christus wordt geboren, verheerlijkt Hem!');
assert.equal(titel('2027-01-14'), 'Christus wordt geboren, verheerlijkt Hem!'); // Besnijdenis
assert.equal(titel('2027-01-15'), 'De Openbaring nadert');
assert.equal(titel('2027-01-19'), 'Het Licht wordt geopenbaard');
assert.equal(titel('2027-01-27'), 'Het Licht wordt geopenbaard');
assert.equal(titel('2027-01-28'), null);
assert.equal(nu('2023-01-01'), 'vaders'); // kerkelijk 19 dec 2022
assert.equal(titel('2023-01-01'), 'In verwachting van het Licht'); // Zondag van de Vaders vóór het voorfeest
assert.equal(titel('2026-12-25', 'nieuw'), 'Christus wordt geboren, verheerlijkt Hem!');

console.log('geboortecyclus: alle controles geslaagd');
