import { useSyncExternalStore } from 'react';

// Desktop (vanaf 1024 px): Pascha en de Geboortecyclus tonen dan de tijdlijn naast de periode.
const DESKTOP = '(min-width: 1024px)';
const volg = (cb: () => void) => {
  const m = window.matchMedia(DESKTOP);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};
export const useDesktop = () => useSyncExternalStore(volg, () => window.matchMedia(DESKTOP).matches);

// Mobiel (tot 768 px): de onderbalk en de mobiele weergaven (bijv. Adem, AdemMobiel.tsx).
const MOBIEL = '(max-width: 767.98px)';
const volgMobiel = (cb: () => void) => {
  const m = window.matchMedia(MOBIEL);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};
export const useMobiel = () => useSyncExternalStore(volgMobiel, () => window.matchMedia(MOBIEL).matches);
