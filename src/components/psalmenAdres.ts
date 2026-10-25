import { PSALMEN, type Kathisma, type KathismaStap, type KathismaStuk } from '../lib/psalmen';

// Adressen en de leesplek van het Psalter (alleen op dit toestel), gedeeld door Psalmen.tsx (web) en PsalterMobiel.tsx.
const AANTAL = PSALMEN.length;

// Laatst geopende psalm, voor "Verder lezen" (alleen op dit toestel).
export const LAATST = 'psalmen-laatst';
export const leesLaatst = () => {
  try {
    const n = Number(localStorage.getItem(LAATST));
    return n >= 1 && n <= AANTAL ? n : null;
  } catch {
    return null;
  }
};

// Leesplek binnen de laatst geopende psalm: het eerste zichtbare vers ("50:12"), zodat hervatten ook bij een andere
// schermbreedte of tekstgrootte klopt. Alleen op dit toestel; ongeldig of ontbrekend = gewoon bovenaan beginnen.
export const LEESPLEK = 'psalmen-leesplek';
export const leesPlek = () => {
  try {
    const [nr, vers] = (localStorage.getItem(LEESPLEK) ?? '').split(':').map(Number);
    return nr >= 1 && nr <= AANTAL && vers >= 1 ? { nr, vers } : null;
  } catch {
    return null;
  }
};

export const kathismaPad = (k: Kathisma | null, s?: KathismaStap, datum?: string | null) =>
  `#psalmen/kathisma${k ? `/${k.nr}` : ''}${k && s ? `/${s.deel}/${s.psalm}` : ''}${datum ? `?datum=${datum}` : ''}`;

/** "Psalm 18" of "Psalm 118, verzen 73–131" */
export const stukNaam = (s: KathismaStuk) => `Psalm ${s.psalm}${s.vanVers ? `, verzen ${s.vanVers}–${s.totVers}` : ''}`;
export const NIET_BESCHIKBAAR = 'Tekst nog niet beschikbaar';
