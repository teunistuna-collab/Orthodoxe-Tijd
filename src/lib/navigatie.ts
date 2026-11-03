// Naar een andere pagina (#vasten, #psalmen, …) zonder dat de browser eerst naar het element met die id springt;
// App.tsx wisselt dan de pagina en zet de onthouden scrollpositie terug.
export function gaNaar(pagina: string) {
  history.pushState(null, '', `#${pagina}`);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

// De vijf tabs van de app-mapping (mobile/docs/APP-MAPPING.md): Vandaag · Kalender · Bidden · Ontdek · Meer.
// Adem en Etmaal horen bij Bidden én Ontdek; ze blijven bij de groep waarvandaan je kwam (standaard Ontdek).
export type Groep = 'bidden' | 'ontdek';
export const BIDDEN_PAGINAS = ['bidden', 'gebeden', 'psalmen'];
export const ONTDEK_PAGINAS = ['cycli', 'week', 'jaar', 'pascha', 'geboorte'];
export const GEDEELD = ['adem', 'etmaal'];
let laatste: Groep = 'ontdek';
/** Door App.tsx aangeroepen bij elke paginawissel. Alleen de overzichten waarvandaan je Adem of Etmaal opent (Bidden,
 *  Ontdek en zijn cycli) bepalen de groep; Psalter en Gebeden niet, anders verspringt de groep als je vanuit Etmaal een
 *  psalm opent en terugkomt. */
export function onthoudGroep(pagina: string) {
  if (pagina === 'bidden') laatste = 'bidden';
  else if (ONTDEK_PAGINAS.includes(pagina)) laatste = 'ontdek';
}
/** De groep van een pagina; Adem en Etmaal volgen de laatst bezochte groep. */
export function groepVan(pagina: string): Groep | null {
  if (BIDDEN_PAGINAS.includes(pagina)) return 'bidden';
  if (ONTDEK_PAGINAS.includes(pagina)) return 'ontdek';
  return GEDEELD.includes(pagina) ? laatste : null;
}
/** Terugpijl van Adem en Etmaal: naar het overzicht waarvandaan je kwam. */
export const terugNaarGroep = () => (laatste === 'bidden' ? '#bidden' : '#cycli');
