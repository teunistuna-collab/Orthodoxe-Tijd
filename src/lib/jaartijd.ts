import { daysBetween, kerkDatum, orthodoxPascha, type Mode } from './kalender';

// De zes tijden van het kerkelijk jaar en de tijd van nu (verplaatst uit Jaarcyclus.tsx, ongewijzigd), ook gebruikt
// door Ontdek (Cycli.tsx).
export type PeriodKey = 'kersttijd' | 'openbaringstijd' | 'vastentijd' | 'passietijd' | 'paschatijd' | 'pinkstertijd';

export const PERIODS: Array<{ key: PeriodKey; label: string; short: string; movable: boolean }> = [
  { key: 'kersttijd', label: 'Kersttijd', short: 'Van het kerkelijk nieuwjaar naar Kerstmis', movable: false },
  { key: 'openbaringstijd', label: 'Openbaringstijd', short: 'Christus wordt geopenbaard aan alle volken', movable: false },
  { key: 'vastentijd', label: 'Vastentijd', short: 'Voorbereiding op het heilige Pascha', movable: true },
  { key: 'passietijd', label: 'Passietijd', short: 'Het lijden van de Heer', movable: true },
  { key: 'paschatijd', label: 'Paschatijd', short: 'De Verrijzenis van Christus', movable: true },
  { key: 'pinkstertijd', label: 'Pinkstertijd', short: 'De gave van de Heilige Geest', movable: true },
];

// In welke tijd van het jaar we nu zitten. ponytail: eigen grenzen op basis van de feesten in de popups hierboven —
// Kersttijd vanaf het kerkelijk nieuwjaar (1 september) tot Theofanie, Openbaringstijd tot het begin van de Triodion
// (Pascha − 70), Vastentijd tot Lazaruszaterdag, Passietijd tot Pascha, Paschatijd tot Pinksteren, daarna Pinkstertijd
// tot 31 augustus. Vaste grenzen in kerkelijke datums, beweeglijke via de Pascha-berekening.
export function huidigeTijd(vandaag: Date, mode: Mode): PeriodKey {
  const kerk = kerkDatum(vandaag, mode);
  const maand = kerk.getUTCMonth() + 1;
  if (maand >= 9 || (maand === 1 && kerk.getUTCDate() < 6)) return 'kersttijd';
  const offset = daysBetween(orthodoxPascha(vandaag.getUTCFullYear()), vandaag);
  if (offset < -70) return 'openbaringstijd';
  if (offset < -8) return 'vastentijd';
  if (offset < 0) return 'passietijd';
  if (offset < 49) return 'paschatijd';
  return 'pinkstertijd';
}
