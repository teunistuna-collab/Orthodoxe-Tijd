import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
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

  // Na een sprong naar een anker (#week, #jaar, ...) verschuift de pagina nog doordat afbeeldingen boven het doel
  // laden. Daarom corrigeren we de positie een paar keer, tenzij de bezoeker zelf begint te scrollen.
  useEffect(() => {
    let timers: number[] = [];
    let gebruikerScrolde = false;
    const stop = () => {
      gebruikerScrolde = true;
    };
    const bijstellen = (eersteKeerSpringen: boolean) => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const doel = id ? document.getElementById(id) : null;
      if (!doel) return;
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
      gebruikerScrolde = false;
      if (eersteKeerSpringen) doel.scrollIntoView({ block: 'start', behavior: 'instant' });
      // Gewenste plek: de bovenkant van het doel op de scroll-margin (net onder de vaste koptekst).
      const gewenst = parseFloat(getComputedStyle(doel).scrollMarginTop) || 0;
      for (const ms of [120, 400, 900, 1600, 2800]) {
        timers.push(
          window.setTimeout(() => {
            if (gebruikerScrolde) return;
            const verschil = doel.getBoundingClientRect().top - gewenst;
            if (Math.abs(verschil) > 3) window.scrollBy({ top: verschil, behavior: 'instant' });
          }, ms),
        );
      }
    };
    const opHashwijziging = () => bijstellen(false);
    window.addEventListener('hashchange', opHashwijziging);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchmove', stop, { passive: true });
    window.addEventListener('keydown', stop);
    bijstellen(true); // ook bij het openen van een link met een anker
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('hashchange', opHashwijziging);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
      window.removeEventListener('keydown', stop);
    };
  }, []);

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
    () => ({ mode, setMode, vandaag, vandaagYmd: ymd(vandaag), htc, htcFout, openDag, openLezing, openKalenderUitleg }),
    [mode, setMode, vandaag, htc, htcFout, openDag, openLezing, openKalenderUitleg],
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
        <BottomNav />
        <DagModal ymd={dagOpen} onClose={sluitDag} onNavigate={openDag} />
        <LezingModal keuze={lezing} onClose={sluitLezing} />
        <KalenderUitleg open={uitlegOpen} onClose={sluitKalenderUitleg} />
      </div>
    </AppContext.Provider>
  );
}
