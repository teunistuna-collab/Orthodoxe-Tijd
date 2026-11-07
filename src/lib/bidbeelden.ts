// Beelden van de feesten, gedeeld door Feesten (lijst, detail, Bid het tropaar) en Vandaag (dagthema):
// - FEEST_ICONEN: het authentieke icoon per feest (public/images/feesten), waar dat er is;
// - bidBeeld: het icoon op een analogion met kaarsen (public/images/feesten/bidden/<id>.webp, aangeleverd 06-11-2026).
//   Nieuwe analogion-beelden: het bestand in die map zetten en het id aan BIDBEELDEN toevoegen.

/** Het authentieke icoon per feest, waar dat er is; anders een rustig vlak met een kruis (geen vervangende voorstelling). */
export const FEEST_ICONEN: Record<string, string> = {
  pascha: 'pascha.webp',
  kerstmis: 'kerst.jpg',
  theofanie: 'theofanie.webp',
  palmzondag: 'palmzondag.webp',
  hemelvaart: 'hemelvaart.webp',
  'opdracht-moeder-gods': 'opdracht-moeder-gods.webp',
  kruisverheffing: 'kruisverering.webp',
  besnijdenis: 'besnijdenis.webp',
  'synaxis-johannes': 'synaxis-johannes.webp',
  nicolaas: 'nicolaas.webp',
  stefanus: 'stefanus.webp',
  'kinderen-bethlehem': 'kinderen-bethlehem.webp',
  'synaxis-moeder-gods': 'synaxis-moeder-gods.webp',
  filippus: 'filippus.webp',
  // Aangeleverd op 27-10-2026
  ontslaping: 'ontslaping.webp',
  'geboorte-moeder-gods': 'geboorte-moeder-gods.webp',
  ontmoeting: 'ontmoeting.webp',
  annunciatie: 'annunciatie.webp',
  transfiguratie: 'transfiguratie.webp',
  pinksteren: 'pinksteren.webp',
};
export const icoonVan = (id: string) => (FEEST_ICONEN[id] ? `/images/feesten/${FEEST_ICONEN[id]}` : null);

const BIDBEELDEN = new Set(['pascha', 'geboorte-moeder-gods', 'kruisverheffing', 'opdracht-moeder-gods', 'kerstmis', 'theofanie', 'ontmoeting', 'annunciatie', 'palmzondag', 'hemelvaart', 'pinksteren', 'transfiguratie', 'ontslaping']);
/** Feesten die het analogion-beeld van een ander feest delen (hetzelfde icoon). */
const ZELFDE_BEELD: Record<string, string> = { kruisverering: 'kruisverheffing' };
/** Het analogion-beeld van een feest, of null. */
export function bidBeeld(id: string): string | null {
  const b = ZELFDE_BEELD[id] ?? id;
  return BIDBEELDEN.has(b) ? `/images/feesten/bidden/${b}.webp` : null;
}
