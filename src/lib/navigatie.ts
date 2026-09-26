// Naar een andere pagina (#vasten, #psalmen, …) zonder dat de browser eerst naar het element met die id springt;
// App.tsx wisselt dan de pagina en zet de onthouden scrollpositie terug.
export function gaNaar(pagina: string) {
  history.pushState(null, '', `#${pagina}`);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
