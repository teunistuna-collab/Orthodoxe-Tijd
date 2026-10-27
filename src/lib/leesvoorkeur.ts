import { useSyncExternalStore } from 'react';

// Leesvoorkeuren voor de hele site: tekstgrootte (vaste stappen) en avondweergave.
// Werkt via <html>: de CSS-variabele --lees-schaal en de klasse lees-nacht (Bouw 74 in index.css).
// Alleen leesvensters (.lees-vlak) reageren erop; navigatie en de rest van de pagina niet.
// Kleurweergave (Instellingen): licht, donker of systeem (volgt de donkere modus van het apparaat); de avondweergave
// in een leesvenster zet hem op licht of donker. Zonder keuze: licht, zoals altijd.

export const LEES_STAPPEN = [0.9, 1, 1.1, 1.2, 1.35, 1.5];
const STANDAARD = 1;

export type Kleurweergave = 'systeem' | 'licht' | 'donker';
type Voorkeur = { stap: number; nacht: boolean; kleur: Kleurweergave };

const systeemDonker = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
const nachtVoor = (kleur: Kleurweergave) => (kleur === 'systeem' ? systeemDonker() : kleur === 'donker');

function lees(): Voorkeur {
  try {
    const opgeslagen = localStorage.getItem('lees-stap');
    const stap = opgeslagen !== null ? Number(opgeslagen) : STANDAARD;
    const k = localStorage.getItem('kleurweergave');
    const kleur: Kleurweergave = k === 'systeem' || k === 'donker' || k === 'licht' ? k : localStorage.getItem('lees-nacht') ? 'donker' : 'licht';
    return { stap: Math.min(LEES_STAPPEN.length - 1, Math.max(0, Number.isFinite(stap) ? stap : STANDAARD)), nacht: nachtVoor(kleur), kleur };
  } catch {
    return { stap: STANDAARD, nacht: false, kleur: 'licht' };
  }
}

let voorkeur = lees();
const luisteraars = new Set<() => void>();

function pasToe() {
  const html = document.documentElement;
  html.style.setProperty('--lees-schaal', String(LEES_STAPPEN[voorkeur.stap]));
  html.classList.toggle('lees-nacht', voorkeur.nacht);
}
pasToe();

function zet(nieuw: Voorkeur) {
  voorkeur = nieuw;
  pasToe();
  try {
    localStorage.setItem('lees-stap', String(nieuw.stap));
    if (nieuw.nacht) localStorage.setItem('lees-nacht', '1');
    else localStorage.removeItem('lees-nacht');
    localStorage.setItem('kleurweergave', nieuw.kleur);
  } catch {
    /* geen opslag: de keuze geldt dan alleen voor dit bezoek */
  }
  luisteraars.forEach((f) => f());
}

export const vergroot = () => zet({ ...voorkeur, stap: Math.min(LEES_STAPPEN.length - 1, voorkeur.stap + 1) });
export const verklein = () => zet({ ...voorkeur, stap: Math.max(0, voorkeur.stap - 1) });
export const wisselNacht = () => zet({ ...voorkeur, nacht: !voorkeur.nacht, kleur: voorkeur.nacht ? 'licht' : 'donker' });
export const zetStap = (stap: number) => zet({ ...voorkeur, stap: Math.min(LEES_STAPPEN.length - 1, Math.max(0, stap)) });
export const zetKleur = (kleur: Kleurweergave) => zet({ ...voorkeur, kleur, nacht: nachtVoor(kleur) });

// Systeem: meebewegen met de donkere modus van het apparaat.
if (typeof window !== 'undefined')
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (voorkeur.kleur === 'systeem') zet({ ...voorkeur, nacht: systeemDonker() });
  });

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
