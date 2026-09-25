import { useSyncExternalStore } from 'react';

// Leesvoorkeuren voor de hele site: tekstgrootte (vaste stappen) en avondweergave.
// Werkt via <html>: de CSS-variabele --lees-schaal en de klasse lees-nacht (Bouw 74 in index.css).
// Alleen leesvensters (.lees-vlak) reageren erop; navigatie en de rest van de pagina niet.

export const LEES_STAPPEN = [0.9, 1, 1.1, 1.2, 1.35, 1.5];
const STANDAARD = 1;

type Voorkeur = { stap: number; nacht: boolean };

function lees(): Voorkeur {
  try {
    const opgeslagen = localStorage.getItem('lees-stap');
    // Oude knop "Grote letters" (lees-groot) komt overeen met stap 1,2.
    const stap = opgeslagen !== null ? Number(opgeslagen) : localStorage.getItem('lees-groot') ? 3 : STANDAARD;
    return { stap: Math.min(LEES_STAPPEN.length - 1, Math.max(0, Number.isFinite(stap) ? stap : STANDAARD)), nacht: !!localStorage.getItem('lees-nacht') };
  } catch {
    return { stap: STANDAARD, nacht: false };
  }
}

let voorkeur = lees();
const luisteraars = new Set<() => void>();

function pasToe() {
  const html = document.documentElement;
  html.style.setProperty('--lees-schaal', String(LEES_STAPPEN[voorkeur.stap]));
  html.classList.toggle('lees-nacht', voorkeur.nacht);
  html.classList.remove('lees-groot');
}
pasToe();

function zet(nieuw: Voorkeur) {
  voorkeur = nieuw;
  pasToe();
  try {
    localStorage.setItem('lees-stap', String(nieuw.stap));
    if (nieuw.nacht) localStorage.setItem('lees-nacht', '1');
    else localStorage.removeItem('lees-nacht');
    localStorage.removeItem('lees-groot');
  } catch {
    /* geen opslag: de keuze geldt dan alleen voor dit bezoek */
  }
  luisteraars.forEach((f) => f());
}

export const vergroot = () => zet({ ...voorkeur, stap: Math.min(LEES_STAPPEN.length - 1, voorkeur.stap + 1) });
export const verklein = () => zet({ ...voorkeur, stap: Math.max(0, voorkeur.stap - 1) });
export const wisselNacht = () => zet({ ...voorkeur, nacht: !voorkeur.nacht });

export function useLeesvoorkeur(): Voorkeur & { min: boolean; max: boolean } {
  const v = useSyncExternalStore(
    (f) => {
      luisteraars.add(f);
      return () => luisteraars.delete(f);
    },
    () => voorkeur,
  );
  return { ...v, min: v.stap === 0, max: v.stap === LEES_STAPPEN.length - 1 };
}
