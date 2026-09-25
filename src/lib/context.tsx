import { createContext, useContext } from 'react';
import type { Mode } from './kalender';
import type { HtcData, Rooster } from './htc';

/** De heiligenlijst (src/lib/heiligen.ts, ±500 KB) wordt apart geladen zodat hij de eerste weergave niet ophoudt. */
export type HeiligenData = typeof import('./heiligen');

export interface LezingKeuze {
  ref: string;
  tag: string;
  julianKey: string;
  civil: Date;
}

export interface AppState {
  mode: Mode;
  setMode: (m: Mode) => void;
  vandaag: Date;
  vandaagYmd: string;
  htc: HtcData | null;
  /** Lezingsverwijzingen per burgerlijke datum (yyyy-mm-dd), over alle kerkjaren met een rooster. */
  rooster: Rooster | null;
  /** null zolang de heiligenlijst nog laadt. */
  heiligen: HeiligenData | null;
  htcFout: boolean;
  openDag: (ymd: string) => void;
  openLezing: (l: LezingKeuze) => void;
  openKalenderUitleg: () => void;
  /** Opent een pop-up met alleen de Schriftlezingen van de opgegeven dag (ymd). */
  openDagLezingen: (ymd: string) => void;
  /** Opent een pop-up met alleen de heiligen van de opgegeven dag (ymd). */
  openDagHeiligen: (ymd: string) => void;
  /** Opent de pop-up "Paschale cyclus" voor de opgegeven dag (ymd). */
  openDagPascha: (ymd: string) => void;
  /** Opent het centrale zoekvenster. */
  openZoeken: () => void;
}

export const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('AppContext ontbreekt');
  return ctx;
}
