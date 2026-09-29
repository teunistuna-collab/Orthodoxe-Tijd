import type { DagInfo } from './kalender';

// Liturgische kleur van een dag (vereenvoudigd, naar Russisch gebruik). Alleen gebruikt voor de rand om vandaag in de kalender.
export type LiturgischeKleur = 'goud' | 'rood' | 'wit' | 'groen' | 'blauw' | 'paars' | 'donkerpaars';

// css: de variabele uit index.css (Bouw 86) die de kalender én de legenda gebruiken; gewone dagen hebben geen kleuraccent.
export const LITURGISCHE_KLEUREN: Record<LiturgischeKleur, { hex: string; css: string; naam: string; uitleg: string }> = {
  goud: { hex: '#b0914f', css: '', naam: 'goud', uitleg: 'gewone dagen' },
  rood: { hex: '#a32d2d', css: 'var(--lit-rood)', naam: 'rood', uitleg: 'Pascha, martelaren' },
  wit: { hex: '#a8adb3', css: 'var(--lit-wit)', naam: 'wit', uitleg: 'Geboorte, Theofanie, Hemelvaart' }, // hex zilver: wit valt weg op de crème achtergrond
  groen: { hex: '#1b7a43', css: 'var(--lit-groen)', naam: 'groen', uitleg: 'Palmzondag, Pinksteren' },
  blauw: { hex: '#1a5276', css: 'var(--lit-blauw)', naam: 'blauw', uitleg: 'feesten van de Moeder Gods' },
  paars: { hex: '#5c2d91', css: 'var(--lit-paars)', naam: 'paars', uitleg: 'kruisfeesten, zondagen in de Vasten' },
  donkerpaars: { hex: '#321454', css: 'var(--lit-donker)', naam: 'donker', uitleg: 'Vasten, Goede Week' },
};

// Vaste feesten op kerkelijke datum (sleutel zoals mdKey: "M-D").
const VASTE: Record<string, LiturgischeKleur> = {
  '1-1': 'wit',
  '1-6': 'wit',
  '2-2': 'blauw',
  '3-25': 'blauw',
  '6-29': 'rood',
  '8-6': 'wit',
  '8-15': 'blauw',
  '8-29': 'rood',
  '9-8': 'blauw',
  '9-14': 'paars',
  '11-21': 'blauw',
  '12-25': 'wit',
};

// Beweeglijke dagen, in dagen vanaf Pascha.
const BEWEEGLIJK: Record<number, LiturgischeKleur> = {
  [-28]: 'paars', // Kruisverering
  [-8]: 'wit', // Lazaruszaterdag
  [-7]: 'groen', // Palmzondag
  [-1]: 'wit', // Grote en Heilige Zaterdag
  0: 'rood',
  39: 'wit', // Hemelvaart
  56: 'goud', // Alle Heiligen
};

export function liturgischeKleur(d: DagInfo): LiturgischeKleur {
  const o = d.offset;
  const vast = VASTE[d.kerkKey];
  if (BEWEEGLIJK[o]) return BEWEEGLIJK[o];
  if (o > 0 && o < 39) return 'rood';
  if (o > 39 && o < 49) return vast ?? 'wit';
  if (o >= 49 && o < 56) return vast ?? 'groen';
  if (o >= -6 && o <= -2) return 'donkerpaars';
  if (o >= -48 && o < -8) return vast ?? (d.isZondag ? 'paars' : 'donkerpaars');
  return vast ?? 'goud';
}
