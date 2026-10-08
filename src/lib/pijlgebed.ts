import { useSyncExternalStore } from 'react';

// Het eigen pijlgebed, in te vullen bij Instellingen en getoond op Vandaag; alleen op dit toestel bewaard.
// Leeg = het standaardgebed.
export const STANDAARD_PIJLGEBED = 'Heer Jezus Christus, ontferm U over ons.';
const SLEUTEL = 'pijlgebed';
export const MAX_LENGTE = 160;

function lees(): string {
  try {
    return (localStorage.getItem(SLEUTEL) ?? '').slice(0, MAX_LENGTE);
  } catch {
    return '';
  }
}

let eigen = lees();
const luisteraars = new Set<() => void>();
const meld = () => luisteraars.forEach((f) => f());

export function bewaarPijlgebed(tekst: string) {
  eigen = tekst.slice(0, MAX_LENGTE);
  try {
    if (eigen.trim()) localStorage.setItem(SLEUTEL, eigen);
    else localStorage.removeItem(SLEUTEL);
  } catch {
    /* geen opslag: geldt dan alleen voor dit bezoek */
  }
  meld();
}

// Bewaard in een ander tabblad: meteen overnemen.
window.addEventListener('storage', (e) => {
  if (e.key !== SLEUTEL) return;
  eigen = lees();
  meld();
});

const abonneer = (f: () => void) => {
  luisteraars.add(f);
  return () => luisteraars.delete(f);
};

/** De ingevulde tekst zoals bewaard (leeg als er niets is ingevuld). */
export function useEigenPijlgebed(): string {
  return useSyncExternalStore(abonneer, () => eigen);
}

/** Het pijlgebed om te tonen: het eigen gebed, of anders het standaardgebed. */
export function usePijlgebed(): string {
  const tekst = useEigenPijlgebed().trim();
  return tekst || STANDAARD_PIJLGEBED;
}
