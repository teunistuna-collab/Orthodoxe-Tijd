import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Vandaag from './components/Vandaag';
import Kalender from './components/Kalender';
import UrenCyclus from './components/UrenCyclus';
import Feesten from './components/Feesten';
import Vasten from './components/Vasten';
import Pascha from './components/Pascha';
import Heiligen from './components/Heiligen';
import Gebeden from './components/Gebeden';
import DagModal from './components/DagModal';
import LezingModal from './components/LezingModal';
import Ademcyclus from './components/Ademcyclus';
import Weekcyclus from './components/Weekcyclus';
import Jaarcyclus from './components/Jaarcyclus';
import ExactPageFrame from './components/ExactPageFrame';
import { CyclePageLayout, GoldDivider, LiturgicalCard, ParchmentSection, QuoteSection, SectionHeader } from './components/CycleSections';
import { AppContext, type LezingKeuze } from './lib/context';
import { vandaag as bepaalVandaag, ymd, type Mode } from './lib/kalender';
import { laadDagen, type HtcData } from './lib/htc';

const MODE_KEY = 'orthodoxe-kalender-mode';

function leesMode(): Mode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    return v === 'oud' || v === 'nieuw' ? v : 'oud';
  } catch {
    return 'oud';
  }
}

export default function App() {
  const [mode, setModeState] = useState<Mode>(leesMode);
  const [vandaag, setVandaag] = useState(bepaalVandaag);
  const [htc, setHtc] = useState<HtcData | null>(null);
  const [htcFout, setHtcFout] = useState(false);
  const [dagOpen, setDagOpen] = useState<string | null>(null);
  const [lezing, setLezing] = useState<LezingKeuze | null>(null);

  useEffect(() => {
    laadDagen()
      .then(setHtc)
      .catch(() => setHtcFout(true));
  }, []);

  // Datum verversen als de pagina lang open staat.
  useEffect(() => {
    const t = setInterval(() => {
      const n = bepaalVandaag();
      if (ymd(n) !== ymd(vandaag)) setVandaag(n);
    }, 60_000);
    return () => clearInterval(t);
  }, [vandaag]);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* geen opslag */
    }
  }, []);

  const openDag = useCallback((y: string) => setDagOpen(y), []);
  const openLezing = useCallback((l: LezingKeuze) => setLezing(l), []);
  const sluitDag = useCallback(() => setDagOpen(null), []);
  const sluitLezing = useCallback(() => setLezing(null), []);

  const ctx = useMemo(
    () => ({ mode, setMode, vandaag, vandaagYmd: ymd(vandaag), htc, htcFout, openDag, openLezing }),
    [mode, setMode, vandaag, htc, htcFout, openDag, openLezing],
  );

  return (
    <AppContext.Provider value={ctx}>
      <div id="top" className="min-h-screen bg-parchment text-ink">
        <Header />
        <main>
          <Vandaag />
          <ExactPageFrame title="Kalender"><Kalender /></ExactPageFrame>

          <ExactPageFrame title="Adem"><Ademcyclus /></ExactPageFrame>

          <ExactPageFrame title="Etmaal"><UrenCyclus /></ExactPageFrame>

          <ExactPageFrame title="Week"><Weekcyclus /></ExactPageFrame>

          <ExactPageFrame title="Jaar"><Jaarcyclus /></ExactPageFrame>

          <ExactPageFrame title="Pascha"><Pascha /></ExactPageFrame>

          <ExactPageFrame title="Gebeden"><Gebeden /></ExactPageFrame>
          <ExactPageFrame title="Vasten"><Vasten /></ExactPageFrame>
          <ExactPageFrame title="Heiligen"><Heiligen /></ExactPageFrame>
          <ExactPageFrame title="Feesten"><Feesten /></ExactPageFrame>
        </main>
        <Footer />
        <DagModal ymd={dagOpen} onClose={sluitDag} onNavigate={openDag} />
        <LezingModal keuze={lezing} onClose={sluitLezing} />
      </div>
    </AppContext.Provider>
  );
}
