import { useSyncExternalStore } from 'react';

// Favorieten (psalmen en gebeden), alleen op dit toestel. Een favoriet is de deeplink van de tekst,
// bijvoorbeeld "psalmen/50" of "gebeden/morgengebeden-pdf", dezelfde als bij delen.
const SLEUTEL = 'favorieten';

function lees(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(SLEUTEL) ?? '[]');
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

let lijst = lees();
const luisteraars = new Set<() => void>();
const meld = () => luisteraars.forEach((f) => f());

export function wisselFavoriet(pad: string) {
  lijst = lijst.includes(pad) ? lijst.filter((x) => x !== pad) : [...lijst, pad];
  try {
    localStorage.setItem(SLEUTEL, JSON.stringify(lijst));
  } catch {
    /* geen opslag: de keuze geldt dan alleen voor dit bezoek */
  }
  meld();
}

// Bewaard in een ander tabblad: meteen overnemen.
window.addEventListener('storage', (e) => {
  if (e.key !== SLEUTEL) return;
  lijst = lees();
  meld();
});

export function useFavorieten(): string[] {
  return useSyncExternalStore(
    (f) => {
      luisteraars.add(f);
      return () => luisteraars.delete(f);
    },
    () => lijst,
  );
}
