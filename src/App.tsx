import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import { KopBalk } from './components/NisKop';
import './components/Vandaag.css';
import './components/ontwerp.css';
import { FooterInhoud } from './components/Footer';
import Vandaag from './components/Vandaag';
import Kalender from './components/Kalender';
import UrenCyclus from './components/UrenCyclus';
import Feesten from './components/Feesten';
import Psalmen from './components/Psalmen';
import Vasten from './components/Vasten';
import Pascha from './components/Pascha';
import Geboorte from './components/Geboorte';
import Heiligen from './components/Heiligen';
import Gebeden from './components/Gebeden';
import Meer from './components/Meer';
import BoekenMobiel from './components/BoekenMobiel';
import Cycli from './components/Cycli';
import Bidden from './components/Bidden';
import DagModal from './components/DagModal';
import DagLezingen from './components/DagLezingen';
import DagHeiligen from './components/DagHeiligen';
import DagPascha from './components/DagPascha';
import LezingModal from './components/LezingModal';
import KalenderUitleg from './components/KalenderUitleg';
import Instellingen from './components/Instellingen';
import Zoeken from './components/Zoeken';
import { gaNaar, onthoudGroep } from './lib/navigatie';
import Ademcyclus from './components/Ademcyclus';
import Weekcyclus from './components/Weekcyclus';
import Jaarcyclus from './components/Jaarcyclus';
import PaginaOpening from './components/PaginaOpening';
import { AppContext, type HeiligenData, type LezingKeuze } from './lib/context';
import { vandaag as bepaalVandaag, hoofdletter, ymd, type Mode } from './lib/kalender';
import { kerkjaarVan, laadRoosterJaar, type Rooster } from './lib/htc';
import { useHerinneringPlanner } from './lib/herinneringen';

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

const PAGINAS = ['vandaag', 'kalender', 'adem', 'etmaal', 'week', 'jaar', 'pascha', 'geboorte', 'gebeden', 'vasten', 'heiligen', 'feesten', 'psalmen', 'bronnen', 'instellingen', 'meer', 'cycli', 'bidden', 'boeken'];

// "#psalmen/50" hoort bij de pagina "psalmen" (de Psalmenpagina opent zelf Psalm 50).
function paginaUitHash(): string | null {
  const id = decodeURIComponent(window.location.hash.slice(1)).split('/')[0];
  // Bidden (#bidden), Ontdek (#cycli) en Verdieping (#meer) horen bij de mobiele onderbalk; op het web staat alles al in de kopbalk.
  if ((id === 'meer' || id === 'cycli' || id === 'bidden' || id === 'boeken') && window.matchMedia('(min-width: 768px)').matches) return null;
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

// De pagina's als vaste elementen: bij een paginawissel rendert React zo alleen de pagina's opnieuw die zelf iets zien
// veranderen (context, eigen state of het adres), niet alle zeventien. Psalmen krijgt `actief` mee en staat daarom in App.
const INHOUD = {
  vandaag: <Vandaag />,
  kalender: <Kalender />,
  adem: <Ademcyclus />,
  etmaal: <UrenCyclus />,
  week: <Weekcyclus />,
  jaar: <Jaarcyclus />,
  pascha: <Pascha />,
  geboorte: <Geboorte />,
  gebeden: <Gebeden />,
  vasten: <Vasten />,
  heiligen: <Heiligen />,
  feesten: <Feesten />,
  meer: <Meer />,
  boeken: <BoekenMobiel />,
  cycli: <Cycli />,
  bidden: <Bidden />,
  instellingen: <Instellingen />,
  // Bronnen: mobiel dezelfde bovenbalk (merk en zoeken) als de andere pagina's
  bronnen: <><div className="vg ot-redesign vg-losse-balk"><div className="ot-strook"><KopBalk /></div></div><div className="exact-content"><PaginaOpening id="bronnen" label="Verantwoording" titel="Bronnen" ondertitel="Bronnen en verwijzingen" /><div><section className="bronnen-inhoud"><FooterInhoud /></section></div></div></>,
};

export default function App() {
  const [mode, setModeState] = useState<Mode>(leesMode);
  const [uitlegOpen, setUitlegOpen] = useState(moetUitlegTonen);
  const [vandaag, setVandaag] = useState(bepaalVandaag);
  const [rooster, setRooster] = useState<Rooster | null>(null);
  const [heiligen, setHeiligen] = useState<HeiligenData | null>(null);
  const [dagOpen, setDagOpen] = useState<string | null>(null);
  const [lezingenDag, setLezingenDag] = useState<string | null>(null);
  const [heiligenDag, setHeiligenDag] = useState<string | null>(null);
  const [paschaDag, setPaschaDag] = useState<string | null>(null);
  const [lezing, setLezing] = useState<LezingKeuze | null>(null);
  const [pagina, setPagina] = useState(() => {
    const begin = paginaUitHash() ?? 'vandaag';
    onthoudGroep(begin);
    return begin;
  });
  const [zoekOpen, setZoekOpen] = useState(false);
  // Herinneringen (Instellingen): tonen wat aan de beurt is zolang de app open is.
  useHerinneringPlanner(mode);

  // Er staat één pagina tegelijk in beeld (zie .pagina-verborgen in index.css); het anker in de url bepaalt welke.
  // Elke pagina onthoudt hoe ver je gescrold was: terug naar een pagina brengt je weer op die plek.
  // Een tik op de pagina waar je al bent (bijvoorbeeld in de onderbalk) brengt je naar boven.
  const huidige = useRef(pagina);
  const scrollPosities = useRef<Record<string, number>>({});
  useEffect(() => {
    history.scrollRestoration = 'manual';
    // Een onbekend anker (#bestaatniet) of een leeg anker: naar Vandaag; het adres wordt dan ook #vandaag.
    const herstelAnker = () => {
      if (window.location.hash && !paginaUitHash()) history.replaceState(history.state, '', '#vandaag');
    };
    herstelAnker();
    const opHash = () => {
      herstelAnker();
      const p = paginaUitHash() ?? 'vandaag';
      if (p === huidige.current) return;
      // Onderaan weggegaan (bijvoorbeeld via de tijdlijn of de knop onder aan een cycluspagina): de pagina is uit,
      // dus de volgende keer weer bovenaan beginnen. Halverwege weggaan onthoudt de plek wel.
      const totEinde = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      scrollPosities.current[huidige.current] = totEinde < window.innerHeight ? 0 : window.scrollY;
      onthoudGroep(p);
      huidige.current = p;
      setPagina(p);
    };
    // Interne paginalinks zelf afhandelen: zo springt de browser niet eerst naar het element met die id.
    const opKlik = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
      const doel = link?.getAttribute('href')?.slice(1);
      if (!doel || !PAGINAS.includes(doel.split('/')[0])) return;
      e.preventDefault();
      // Zelfde adres: naar boven. Binnen een pagina (#psalmen/50 → #psalmen) wel het adres wisselen.
      if (doel === window.location.hash.slice(1)) window.scrollTo({ top: 0, behavior: 'smooth' });
      else gaNaar(doel);
    };
    window.addEventListener('hashchange', opHash);
    document.addEventListener('click', opKlik);
    return () => {
      window.removeEventListener('hashchange', opHash);
      document.removeEventListener('click', opKlik);
    };
  }, []);
  // Deeplink (bijvoorbeeld gedeeld vanuit de dag-pop-up): #kalender/2026-09-26 opent die dag.
  useEffect(() => {
    const opDag = () => {
      const m = /^#kalender\/(\d{4}-\d{2}-\d{2})$/.exec(window.location.hash);
      if (m) setDagOpen(m[1]);
    };
    opDag();
    window.addEventListener('hashchange', opDag);
    return () => window.removeEventListener('hashchange', opDag);
  }, []);
  useLayoutEffect(() => {
    window.scrollTo({ top: scrollPosities.current[pagina] ?? 0, behavior: 'instant' });
  }, [pagina]);
  const p = (id: string) => (id === pagina ? 'pagina' : 'pagina pagina-verborgen');

  // De tabtitel volgt de pagina (handig bij delen, bladwijzers en voor schermlezers).
  useEffect(() => {
    document.title = pagina === 'vandaag' ? STANDAARD_TITEL : `${pagina === 'meer' ? 'Meer' : pagina === 'cycli' ? 'Ontdek' : hoofdletter(pagina)} — Orthodoxe Tijd`;
  }, [pagina]);

  // Leesrooster: het huidige en het volgende kerkjaar meteen, andere jaren pas als je er een datum uit opent.
  useEffect(() => {
    const nu = kerkjaarVan(ymd(bepaalVandaag()));
    for (const jaar of [nu, nu + 1])
      laadRoosterJaar(jaar)
        .then((r) => setRooster((oud) => ({ ...oud, ...r })))
        .catch(() => {});
  }, []);

  // De heiligenlijst (Heiligenjaar + Lage Landen, lib/heiligen.ts) pas laden als een weergave hem gebruikt.
  // Vandaag gebruikt hem voor de titel van de dag en de onderregel "H. …" op mobiel.
  const heiligenGevraagd = useRef(false);
  useEffect(() => {
    const popup = dagOpen !== null || heiligenDag !== null || zoekOpen;
    if (!heiligenGevraagd.current && (popup || pagina === 'vandaag' || pagina === 'heiligen' || pagina === 'kalender' || pagina === 'feesten')) {
      heiligenGevraagd.current = true;
      import('./lib/heiligen')
        .then(setHeiligen)
        .catch(() => (heiligenGevraagd.current = false));
    }
  }, [pagina, dagOpen, heiligenDag, zoekOpen]);

  // Datum verversen als de pagina lang open staat, en direct bij terugkeer naar het tabblad (na slaapstand of 's nachts).
  useEffect(() => {
    const ververs = () => {
      const n = bepaalVandaag();
      if (ymd(n) !== ymd(vandaag)) setVandaag(n);
    };
    const t = setInterval(ververs, 60_000);
    const zicht = () => document.visibilityState === 'visible' && ververs();
    document.addEventListener('visibilitychange', zicht);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', zicht);
    };
  }, [vandaag]);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* geen opslag */
    }
  }, []);

  const openDag = useCallback((y: string) => {
    setDagOpen(y);
    // De mobiele kalender loopt mee als je in het dagvenster naar een andere dag bladert
    window.dispatchEvent(new CustomEvent('kalender-dag', { detail: y }));
  }, []);
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
      if (gevraagd.current.has(jaar)) return;
      gevraagd.current.add(jaar);
      laadRoosterJaar(jaar)
        .then((r) => setRooster((oud) => ({ ...oud, ...r })))
        .catch(() => gevraagd.current.delete(jaar));
    },
    [],
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
    () => ({ mode, setMode, vandaag, vandaagYmd: ymd(vandaag), rooster, vraagRooster, heiligen, openDag, openLezing, openKalenderUitleg, openDagLezingen, openDagHeiligen, openDagPascha, openZoeken }),
    [mode, setMode, vandaag, rooster, vraagRooster, heiligen, openDag, openLezing, openKalenderUitleg, openDagLezingen, openDagHeiligen, openDagPascha, openZoeken],
  );

  return (
    <AppContext.Provider value={ctx}>
      <div id="top" className="min-h-screen bg-parchment text-ink">
        <Header pagina={pagina} />
        <main id="inhoud" tabIndex={-1}>
          <div className={p('vandaag')}>{INHOUD.vandaag}</div>
          <div className={p('kalender')}>{INHOUD.kalender}</div>
          <div className={p('adem')}>{INHOUD.adem}</div>
          <div className={p('etmaal')}>{INHOUD.etmaal}</div>
          <div className={p('week')}>{INHOUD.week}</div>
          <div className={p('jaar')}>{INHOUD.jaar}</div>
          <div className={p('pascha')}>{INHOUD.pascha}</div>
          <div className={p('geboorte')}>{INHOUD.geboorte}</div>
          <div className={p('gebeden')}>{INHOUD.gebeden}</div>
          <div className={p('vasten')}>{INHOUD.vasten}</div>
          <div className={p('heiligen')}>{INHOUD.heiligen}</div>
          <div className={p('feesten')}>{INHOUD.feesten}</div>
          <div className={p('meer')}>{INHOUD.meer}</div>
          <div className={p('boeken')}>{INHOUD.boeken}</div>
          <div className={p('cycli')}>{INHOUD.cycli}</div>
          <div className={p('bidden')}>{INHOUD.bidden}</div>
          <div className={p('instellingen')}>{INHOUD.instellingen}</div>
          <div className={p('psalmen')}><Psalmen actief={pagina === 'psalmen'} /></div>
          <div className={p('bronnen')}>{INHOUD.bronnen}</div>
        </main>
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
