import { useSyncExternalStore } from 'react';

const volgHash = (melding: () => void) => {
  window.addEventListener('hashchange', melding);
  return () => window.removeEventListener('hashchange', melding);
};

/** Staat deze pagina open? (Vandaag ook zonder anker.) Afbeeldingen van verborgen pagina's laden zo pas als ze nodig zijn. */
export function usePaginaOpen(id: string) {
  return useSyncExternalStore(volgHash, () => {
    const huidig = window.location.hash.slice(1).split('/')[0];
    return huidig === id || (id === 'vandaag' && !huidig);
  });
}
