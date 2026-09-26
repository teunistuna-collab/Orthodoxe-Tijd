import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer, { FooterInhoud } from './components/Footer';
import Vandaag from './components/Vandaag';
import Kalender from './components/Kalender';
import UrenCyclus from './components/UrenCyclus';
import Feesten from './components/Feesten';
import Psalmen from './components/Psalmen';
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
import Zoeken from './components/Zoeken';
import { gaNaar } from './lib/navigatie';
import Ademcyclus from './components/Ademcyclus';
import Weekcyclus from './components/Weekcyclus';
import Jaarcyclus from './components/Jaarcyclus';
import ExactPageFrame from './components/ExactPageFrame';
import { CyclePageLayout, GoldDivider, LiturgicalCard, ParchmentSection, QuoteSection, SectionHeader } from './components/CycleSections';
import { AppContext, type HeiligenData, type LezingKeuze } from './lib/context';
import { vandaag as bepaalVandaag, hoofdletter, ymd, type Mode } from './lib/kalender';
import { kerkjaarVan, laadDagen, laadRoosterJaar, voegRoosterToe, type HtcData, type Rooster } from './lib/htc';

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

const STANDAARD_TITEL = document.title;

const PAGINAS = ['vandaag', 'kalender', 'adem', 'etmaal', 'week', 'jaar', 'pascha', 'gebeden', 'vasten', 'heiligen', 'feesten', 'psalmen', 'bronnen'];

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
  const [rooster, setRooster] = useState<Rooster | null>(null);
  const [heiligen, setHeiligen] = useState<HeiligenData | null>(null);
  const [htcFout, setHtcFout] = useState(false);
  const [dagOpen, setDagOpen] = useState<string | null>(null);
  const [lezingenDag, setLezingenDag] = useState<string | null>(null);
  const [heiligenDag, setHeiligenDag] = useState<string | null>(null);
  const [paschaDag, setPaschaDag] = useState<string | null>(null);
  const [lezing, setLezing] = useState<LezingKeuze | null>(null);
  const [pagina, setPagina] = useState(() => paginaUitHash() ?? 'vandaag');
  const [zoekOpen, setZoekOpen] = useState(false);

  // Er staat één pagina tegelijk in beeld (zie .pagina-verborgen in index.css); het anker in de url bepaalt welke.
  // Elke pagina onthoudt hoe ver je gescrold was: terug naar een pagina brengt je weer op die plek.
  // Een tik op de pagina waar je al bent (bijvoorbeeld in de onderbalk) brengt je naar boven.
  const huidige = useRef(pagina);
  const scrollPosities = useRef<Record<string, number>>({});
  useEffect(() => {
    history.scrollRestoration = 'manual';
    const opHash = () => {
      const p = paginaUitHash();
      if (!p || p === huidige.current) return;
      scrollPosities.current[huidige.current] = window.scrollY;
      huidige.current = p;
      setPagina(p);
    };
    // Interne paginalinks zelf afhandelen: zo springt de browser niet eerst naar het element met die id.
    const opKlik = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
      const doel = link?.getAttribute('href')?.slice(1);
      if (!doel || !PAGINAS.includes(doel)) return;
      e.preventDefault();
      if (doel === huidige.current) window.scrollTo({ top: 0, behavior: 'smooth' });
      else gaNaar(doel);
    };
    window.addEventListener('hashchange', opHash);
    document.addEventListener('click', opKlik);
    return () => {
      window.removeEventListener('hashchange', opHash);
      document.removeEventListener('click', opKlik);
    };
  }, []);
  useLayoutEffect(() => {
    window.scrollTo({ top: scrollPosities.current[pagina] ?? 0, behavior: 'instant' });
  }, [pagina]);
  const p = (id: string) => (id === pagina ? 'pagina' : 'pagina pagina-verborgen');

  // De tabtitel volgt de pagina (handig bij delen, bladwijzers en voor schermlezers).
  useEffect(() => {
    document.title = pagina === 'vandaag' ? STANDAARD_TITEL : `${hoofdletter(pagina)} — Orthodoxe Tijd`;
  }, [pagina]);

  useEffect(() => {
    import('./lib/heiligen')
      .then(setHeiligen)
      .catch(() => {});
    laadDagen()
      .then((dagen) => {
        setHtc(dagen);
        // Leesrooster: het huidige en het volgende kerkjaar meteen, andere jaren pas als je er een datum uit opent.
        const nu = kerkjaarVan(ymd(bepaalVandaag()));
        for (const jaar of [nu, nu + 1]) void laadRoosterJaar(jaar, dagen).then((r) => setRooster((oud) => voegRoosterToe(oud, r)));
      })
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
  const openZoeken = useCallback(() => setZoekOpen(true), []);
  // Laadt het kerkjaar van een datum één keer; daarna niets meer (geen nieuwe state bij herhaald vragen).
  const gevraagd = useRef(new Set<number>());
  const vraagRooster = useCallback(
    (datum: string) => {
      const jaar = kerkjaarVan(datum);
      if (!htc || gevraagd.current.has(jaar)) return;
      gevraagd.current.add(jaar);
      laadRoosterJaar(jaar, htc)
        .then((r) => setRooster((oud) => voegRoosterToe(oud, r)))
        .catch(() => gevraagd.current.delete(jaar));
    },
    [htc],
  );
  const sluitZoeken = useCallback(() => setZoekOpen(false), []);
  const sluitKalenderUitleg = useCallback(() => {
    setUitlegOpen(false);
    try {
      localStorage.setItem(UITLEG_KEY, '1');
    } catch {
      /* geen opslag */
    }
  }, []);

  const ctx = useMemo(
    () => ({ mode, setMode, vandaag, vandaagYmd: ymd(vandaag), htc, rooster, vraagRooster, heiligen, htcFout, openDag, openLezing, openKalenderUitleg, openDagLezingen, openDagHeiligen, openDagPascha, openZoeken }),
    [mode, setMode, vandaag, htc, rooster, vraagRooster, heiligen, htcFout, openDag, openLezing, openKalenderUitleg, openDagLezingen, openDagHeiligen, openDagPascha, openZoeken],
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
          <div className={p('psalmen')}><ExactPageFrame title="Psalmen"><Psalmen actief={pagina === 'psalmen'} /></ExactPageFrame></div>
          <div className={p('bronnen')}><section id="bronnen" className="orthodox-pattern bg-bark text-[#d9cbb0]"><h1 className="sr-only">Bronnen &amp; verwijzingen</h1><FooterInhoud /></section></div>
        </main>
        <Footer />
        <BottomNav pagina={pagina} />
        <DagModal ymd={dagOpen} onClose={sluitDag} onNavigate={openDag} />
        <DagLezingen ymd={lezingenDag} onClose={sluitDagLezingen} />
        <DagHeiligen ymd={heiligenDag} onClose={sluitDagHeiligen} />
        <DagPascha ymd={paschaDag} onClose={sluitDagPascha} />
        <LezingModal keuze={lezing} onClose={sluitLezing} />
        <KalenderUitleg open={uitlegOpen} onClose={sluitKalenderUitleg} />
        <Zoeken open={zoekOpen} onOpen={openZoeken} onClose={sluitZoeken} />
      </div>
    </AppContext.Provider>
  );
}
