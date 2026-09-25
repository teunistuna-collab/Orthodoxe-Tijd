import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer, { FooterInhoud } from './components/Footer';
import Vandaag from './components/Vandaag';
import Kalender from './components/Kalender';
import UrenCyclus from './components/UrenCyclus';
import Feesten from './components/Feesten';
import Vasten from './components/Vasten';
import Pascha from './components/Pascha';
import Heiligen from './components/Heiligen';
import Gebeden from './components/Gebeden';
import DagModal from './components/DagModal';
import DagLezingen from './components/DagLezingen';
import DagHeiligen from './components/DagHeiligen';
import DagPascha from './components/DagPascha';
import LezingModal from './components/LezingModal';
import KalenderUitleg from './components/KalenderUitleg';
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

const UITLEG_KEY = 'orthodoxe-kalender-uitleg-gezien';

const PAGINAS = ['vandaag', 'kalender', 'adem', 'etmaal', 'week', 'jaar', 'pascha', 'gebeden', 'vasten', 'heiligen', 'feesten', 'bronnen'];

function paginaUitHash(): string | null {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return PAGINAS.includes(id) ? id : null;
}

// De uitleg over oud/nieuw verschijnt alleen bij een eerste bezoek: nog geen uitleg gezien en nog geen kalender gekozen.
function moetUitlegTonen(): boolean {
  try {
    return localStorage.getItem(UITLEG_KEY) === null && localStorage.getItem(MODE_KEY) === null;
  } catch {
    return false;
  }
}

export default function App() {
  const [mode, setModeState] = useState<Mode>(leesMode);
  const [uitlegOpen, setUitlegOpen] = useState(moetUitlegTonen);
  const [vandaag, setVandaag] = useState(bepaalVandaag);
  const [htc, setHtc] = useState<HtcData | null>(null);
  const [htcFout, setHtcFout] = useState(false);
  const [dagOpen, setDagOpen] = useState<string | null>(null);
  const [lezingenDag, setLezingenDag] = useState<string | null>(null);
  const [heiligenDag, setHeiligenDag] = useState<string | null>(null);
  const [paschaDag, setPaschaDag] = useState<string | null>(null);
  const [lezing, setLezing] = useState<LezingKeuze | null>(null);
  const [pagina, setPagina] = useState(() => paginaUitHash() ?? 'vandaag');

  // Er staat één pagina tegelijk in beeld (zie .pagina-verborgen in index.css); het anker in de url bepaalt welke.
  useEffect(() => {
    const opHash = () => {
      const p = paginaUitHash();
      if (!p) return;
      setPagina(p);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', opHash);
    return () => window.removeEventListener('hashchange', opHash);
  }, []);
  const p = (id: string) => (id === pagina ? 'pagina' : 'pagina pagina-verborgen');

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
  const openDagLezingen = useCallback((y: string) => setLezingenDag(y), []);
  const sluitDagLezingen = useCallback(() => setLezingenDag(null), []);
  const openDagHeiligen = useCallback((y: string) => setHeiligenDag(y), []);
  const sluitDagHeiligen = useCallback(() => setHeiligenDag(null), []);
  const openDagPascha = useCallback((y: string) => setPaschaDag(y), []);
  const sluitDagPascha = useCallback(() => setPaschaDag(null), []);
  const sluitLezing = useCallback(() => setLezing(null), []);
  const openKalenderUitleg = useCallback(() => setUitlegOpen(true), []);
  const sluitKalenderUitleg = useCallback(() => {
    setUitlegOpen(false);
    try {
      localStorage.setItem(UITLEG_KEY, '1');
    } catch {
      /* geen opslag */
    }
  }, []);

  const ctx = useMemo(
    () => ({ mode, setMode, vandaag, vandaagYmd: ymd(vandaag), htc, htcFout, openDag, openLezing, openKalenderUitleg, openDagLezingen, openDagHeiligen, openDagPascha }),
    [mode, setMode, vandaag, htc, htcFout, openDag, openLezing, openKalenderUitleg, openDagLezingen, openDagHeiligen, openDagPascha],
  );

  return (
    <AppContext.Provider value={ctx}>
      <div id="top" className="min-h-screen bg-parchment text-ink">
        <Header pagina={pagina} />
        <main>
          <div className={p('vandaag')}><Vandaag /></div>
          <div className={p('kalender')}><ExactPageFrame title="Kalender"><Kalender /></ExactPageFrame></div>
          <div className={p('adem')}><ExactPageFrame title="Adem"><Ademcyclus /></ExactPageFrame></div>
          <div className={p('etmaal')}><ExactPageFrame title="Etmaal"><UrenCyclus /></ExactPageFrame></div>
          <div className={p('week')}><ExactPageFrame title="Week"><Weekcyclus /></ExactPageFrame></div>
          <div className={p('jaar')}><ExactPageFrame title="Jaar"><Jaarcyclus /></ExactPageFrame></div>
          <div className={p('pascha')}><ExactPageFrame title="Pascha"><Pascha /></ExactPageFrame></div>
          <div className={p('gebeden')}><ExactPageFrame title="Gebeden"><Gebeden /></ExactPageFrame></div>
          <div className={p('vasten')}><ExactPageFrame title="Vasten"><Vasten /></ExactPageFrame></div>
          <div className={p('heiligen')}><ExactPageFrame title="Heiligen"><Heiligen /></ExactPageFrame></div>
          <div className={p('feesten')}><ExactPageFrame title="Feesten"><Feesten /></ExactPageFrame></div>
          <div className={p('bronnen')}><section id="bronnen" className="orthodox-pattern bg-bark text-[#d9cbb0]"><FooterInhoud /></section></div>
        </main>
        <Footer />
        <BottomNav pagina={pagina} />
        <DagModal ymd={dagOpen} onClose={sluitDag} onNavigate={openDag} />
        <DagLezingen ymd={lezingenDag} onClose={sluitDagLezingen} />
        <DagHeiligen ymd={heiligenDag} onClose={sluitDagHeiligen} />
        <DagPascha ymd={paschaDag} onClose={sluitDagPascha} />
        <LezingModal keuze={lezing} onClose={sluitLezing} />
        <KalenderUitleg open={uitlegOpen} onClose={sluitKalenderUitleg} />
      </div>
    </AppContext.Provider>
  );
}
