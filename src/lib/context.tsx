import { createContext, useContext } from 'react';
import type { Mode } from './kalender';
import type { HtcData } from './htc';

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
  htcFout: boolean;
  openDag: (ymd: string) => void;
  openLezing: (l: LezingKeuze) => void;
  openKalenderUitleg: () => void;
}

export const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('AppContext ontbreekt');
  return ctx;
}
