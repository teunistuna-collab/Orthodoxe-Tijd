import { GEBEDEN } from './gebeden';
import { useEigenPijlgebed } from './pijlgebed';

// De vormen van het Jezusgebed zoals ze in lib/gebeden.ts staan ("(korter:) …", "(kortst:) …"), plus het eigen
// pijlgebed. Gedeeld door Adem en de gebedsweg.
const JEZUSGEBED = GEBEDEN.find((g) => g.id === 'jezusgebed')?.tekst ?? '';
const regelNa = (label: string) => JEZUSGEBED.match(new RegExp(`\\(${label}:\\)\\s*(.+)`))?.[1]?.trim() ?? '';
const STANDAARD = JEZUSGEBED.split('\n')[0].trim();
export type Vorm = { id: string; titel: string; tekst: string; onder?: string };
export const VASTE_VORMEN: Vorm[] = [
  { id: 'standaard', titel: 'Standaard', tekst: STANDAARD },
  { id: 'korter', titel: 'Korter', tekst: regelNa('korter') },
  { id: 'kortst', titel: 'Kortst', tekst: regelNa('kortst') },
].filter((v) => v.tekst);

export function useVormen(): Vorm[] {
  const eigen = useEigenPijlgebed().trim();
  return eigen ? [...VASTE_VORMEN, { id: 'eigen', titel: 'Jouw pijlgebed', tekst: eigen }] : VASTE_VORMEN;
}

// De laatst gekozen gebedsvorm, op dit apparaat
const VORM_SLEUTEL = 'adem-vorm';
export const leesVorm = () => {
  try {
    return localStorage.getItem(VORM_SLEUTEL) ?? '';
  } catch {
    return '';
  }
};
export const bewaarVorm = (id: string) => {
  try {
    localStorage.setItem(VORM_SLEUTEL, id);
  } catch {
    /* geen opslag */
  }
};

/** De laatst in Adem gekozen vorm, anders de standaardvorm. */
export function useGekozenVorm(): Vorm {
  const vormen = useVormen();
  return vormen.find((v) => v.id === leesVorm()) ?? vormen[0];
}
