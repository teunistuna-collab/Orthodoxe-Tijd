import type { DagInfo } from './kalender';

// Liturgische kleur van een dag: de gebruikelijke gewaadkleur in de Russische (Slavische) traditie, zoals in de ROCOR.
// Geen verplichting: kleuren verschillen per parochie en klooster. Gebruikt door de kalender (rand om de dag, legenda),
// Vandaag en Pascha. De dag komt uit dagInfo (lib/kalender.ts): kerkelijke datum volgens de gekozen kalender en de
// afstand tot het orthodoxe Pascha (orthodoxPascha); er is hier geen eigen paasberekening.
export type LiturgischeKleur = 'goud' | 'rood' | 'wit' | 'groen' | 'blauw' | 'paars' | 'donkerpaars';

// css: de variabele uit index.css (Bouw 86) die de kalender én de legenda gebruiken; gewone dagen hebben geen kleuraccent.
// betekenis: de gebruikelijke symbolische uitleg, kort.
export const LITURGISCHE_KLEUREN: Record<LiturgischeKleur, { hex: string; css: string; naam: string; uitleg: string; betekenis: string }> = {
  goud: { hex: '#b0914f', css: '', naam: 'goud', uitleg: 'gewone dagen', betekenis: 'Christus de Koning; de zondagen en de gewone dagen' },
  rood: { hex: '#a32d2d', css: 'var(--lit-rood)', naam: 'rood', uitleg: 'Pascha, martelaren', betekenis: 'De vreugde van de Verrijzenis en het bloed van de martelaren' },
  wit: { hex: '#a8adb3', css: 'var(--lit-wit)', naam: 'wit', uitleg: 'Geboorte, Theofanie, Hemelvaart', betekenis: 'Het ongeschapen licht van God' }, // hex zilver: wit valt weg op de crème achtergrond
  groen: { hex: '#1b7a43', css: 'var(--lit-groen)', naam: 'groen', uitleg: 'Palmzondag, Pinksteren', betekenis: 'Het leven en de Heilige Geest' },
  blauw: { hex: '#1a5276', css: 'var(--lit-blauw)', naam: 'blauw', uitleg: 'feesten van de Moeder Gods', betekenis: 'De zuiverheid van de Moeder Gods' },
  paars: { hex: '#5c2d91', css: 'var(--lit-paars)', naam: 'paars', uitleg: 'kruisfeesten, zondagen in de Vasten', betekenis: 'Het Kruis en het lijden van Christus' },
  donkerpaars: { hex: '#321454', css: 'var(--lit-donker)', naam: 'donker', uitleg: 'Vasten, Goede Week', betekenis: 'Inkeer en boete' },
};

// Vaste feesten op kerkelijke datum (sleutel zoals mdKey: "M-D"), met hun naam voor de uitleg.
const VASTE: Record<string, [LiturgischeKleur, string]> = {
  '1-1': ['wit', 'Besnijdenis van de Heer'],
  '1-6': ['wit', 'Theofanie'],
  '2-2': ['blauw', 'Ontmoeting van de Heer'],
  '3-25': ['blauw', 'Annunciatie'],
  '6-29': ['rood', 'HH. Petrus en Paulus'],
  '8-1': ['paars', 'Uitdraging van het Kruis'],
  '8-6': ['wit', 'Gedaanteverandering'],
  '8-15': ['blauw', 'Ontslaping van de Moeder Gods'],
  '8-29': ['rood', 'Onthoofding van Johannes de Voorloper'],
  '9-8': ['blauw', 'Geboorte van de Moeder Gods'],
  '9-14': ['paars', 'Kruisverheffing'],
  '10-1': ['blauw', 'Bescherming van de Moeder Gods'],
  '11-21': ['blauw', 'Intrede van de Moeder Gods'],
  '12-25': ['wit', 'Geboorte van Christus'],
};

// Beweeglijke dagen, in dagen vanaf Pascha; gaan voor op de periode en op een vast feest.
const BEWEEGLIJK: Record<number, [LiturgischeKleur, string]> = {
  [-28]: ['paars', 'Kruisvereringszondag'],
  [-15]: ['blauw', 'Akathistzaterdag'],
  [-8]: ['wit', 'Lazaruszaterdag'],
  [-7]: ['groen', 'Palmzondag'],
  [-1]: ['donkerpaars', 'Grote Zaterdag'], // wisselt tijdens de Liturgie naar wit (zie `naar`)
  0: ['rood', 'Pascha'],
  39: ['wit', 'Hemelvaart'],
  49: ['groen', 'Pinksteren'],
  56: ['goud', 'Zondag van Alle Heiligen'],
};

export interface KleurVanDeDag {
  kleur: LiturgischeKleur;
  /** Kleurwissel tijdens de dag: op Grote Zaterdag van donker naar wit (bij de Liturgie van Basilius). */
  naar?: LiturgischeKleur;
  /** Waarom deze kleur: het feest of de periode. */
  reden: string;
}

/** De gebruikelijke gewaadkleur van een dag, met de reden. Volgorde: beweeglijk feest, dan (behalve in de Lichte Week)
 *  een vast feest, dan de periode van het jaar. */
export function kleurVanDeDag(d: DagInfo): KleurVanDeDag {
  const o = d.offset;
  const vast = VASTE[d.kerkKey];
  const beweeglijk = BEWEEGLIJK[o];
  if (beweeglijk) return { kleur: beweeglijk[0], reden: beweeglijk[1], ...(o === -1 ? { naar: 'wit' as const } : {}) };
  if (o >= 1 && o <= 6) return { kleur: 'rood', reden: 'Lichte Week' };
  if (vast) return { kleur: vast[0], reden: vast[1] };
  if (o >= 7 && o <= 38) return { kleur: 'rood', reden: 'Paastijd' };
  if (o >= 40 && o <= 48) return { kleur: 'wit', reden: 'Nafeest van Hemelvaart' };
  if (o >= 50 && o <= 55) return { kleur: 'groen', reden: 'Week van de Heilige Geest' };
  if (o >= -6 && o <= -2) return { kleur: 'donkerpaars', reden: 'Goede Week' };
  if (o >= -48 && o <= -9) return d.isZondag ? { kleur: 'paars', reden: 'Zondag in de Grote Vasten' } : { kleur: 'donkerpaars', reden: 'Grote Vasten' };
  return { kleur: 'goud', reden: d.isZondag ? 'Zondag' : 'Gewone dag' };
}

/** Alleen de kleur (kalender). */
export const liturgischeKleur = (d: DagInfo): LiturgischeKleur => kleurVanDeDag(d).kleur;
