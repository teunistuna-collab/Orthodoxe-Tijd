import { useSyncExternalStore } from 'react';
import { zetHerinneringen } from './herinneringen';
import { MAX_HEILIGEN, schoonOnzeHeiligen, type OnzeHeilige } from './onzeHeiligen';

// De lijst Onze heiligen op dit toestel (localStorage), met een kopie in de herinneringen (naamdagLijst), zodat de
// planning en de pushserver de naamdagen kennen zonder de opslag of de heiligenlijst.
const SLEUTEL = 'onzeHeiligen';

function lees(): OnzeHeilige[] {
  try {
    return schoonOnzeHeiligen(JSON.parse(localStorage.getItem(SLEUTEL) ?? '[]'));
  } catch {
    return [];
  }
}
let huidig = lees();
const luisteraars = new Set<() => void>();
const meld = () => luisteraars.forEach((f) => f());
window.addEventListener('storage', (e) => {
  if (e.key !== SLEUTEL) return;
  huidig = lees();
  meld();
});
const abonneer = (f: () => void) => {
  luisteraars.add(f);
  return () => luisteraars.delete(f);
};
export const useOnzeHeiligen = (): OnzeHeilige[] => useSyncExternalStore(abonneer, () => huidig);

function bewaar(lijst: OnzeHeilige[]) {
  huidig = schoonOnzeHeiligen(lijst);
  try {
    localStorage.setItem(SLEUTEL, JSON.stringify(huidig));
  } catch {
    /* geen opslag: de lijst geldt dan alleen voor dit bezoek */
  }
  zetHerinneringen({ naamdagLijst: huidig.map(({ heilige, md, voor }) => ({ heilige, md, voor })) });
  meld();
}

let volgnummer = 0;
export function voegToe(h: Omit<OnzeHeilige, 'id'>) {
  if (huidig.length >= MAX_HEILIGEN) return;
  bewaar([...huidig, { ...h, id: `${Date.now().toString(36)}-${volgnummer++}` }]);
}
export const wijzig = (id: string, w: Partial<Omit<OnzeHeilige, 'id'>>) => bewaar(huidig.map((h) => (h.id === id ? { ...h, ...w } : h)));
export const verwijder = (id: string) => bewaar(huidig.filter((h) => h.id !== id));
