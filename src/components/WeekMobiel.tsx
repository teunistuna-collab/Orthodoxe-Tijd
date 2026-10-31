import { useState, useSyncExternalStore } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { addDays, bepaalToon, dagInfo, formatDag, ymd } from '../lib/kalender';
import { WEEK_INFO } from '../lib/cyclusTeksten';
import { Kop, Laag, LeesWeergave, PopupTekst, Sierlijn } from './MobielLaag';
import DeelKnop from './DeelKnop';
import Leesbediening from './Leesbediening';
import { SIERKRUIS } from './symbolen';
import './etmaal-mobiel.css';
import './week-mobiel.css';

// Week op mobiel (mock-up week), zelfde opbouw als Etmaal (EtmaalMobiel.tsx): 1. overzicht met de dag van vandaag, de
// zeven dagen en de verdieping; 2. een dag (#week/<dag>) met banner en de bestaande tekst van die dag; 3. de verdieping
// (#week/lees/<onderwerp>). Inhoud uit Weekcyclus.tsx (DAY_POPUPS, "De orthodoxe weekcyclus.docx") en
// lib/cyclusTeksten.ts (WEEK_INFO). Banners: aangeleverd op 26-10-2026 (overzicht en per dag).

export type WeekDag = 'zondag' | 'maandag' | 'dinsdag' | 'woensdag' | 'donderdag' | 'vrijdag' | 'zaterdag';
export type WeekTekst = { title: string; subtitle?: string; paragraphs: string[]; highlight?: string };

const DAGEN: WeekDag[] = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const BANNER = { src: '/images/week/banner-800.webp', srcSet: '/images/week/banner-800.webp 800w, /images/week/banner-1086.webp 1086w' };
// Per dag een eigen banner (aangeleverd 26-10-2026): zondag de Verrijzenis, maandag de engelen, dinsdag Johannes de
// Voorloper, woensdag het verraad, donderdag de heilige Nicolaas, vrijdag de Kruisiging, zaterdag alle heiligen.
const dagBanner = (dag: WeekDag) => ({ src: `/images/week/${dag}-800.webp`, srcSet: `/images/week/${dag}-800.webp 800w, /images/week/${dag}-1086.webp 1086w` });
// Zonder "De dagen van de week": dat herhaalt de zeven dagpagina's (de pagina blijft bereikbaar via #week/lees/dagen).
const VERDIEPING = (Object.keys(WEEK_INFO) as Array<keyof typeof WEEK_INFO>).filter((key) => key !== 'dagen').map((key) => ({ key, titel: WEEK_INFO[key].title }));
// De datum van een dag in de huidige week (zondag tot en met zaterdag)
const datumIn = (vandaag: Date, dag: WeekDag) => addDays(addDays(vandaag, -vandaag.getUTCDay()), DAGEN.indexOf(dag));
// Thema's met dezelfde hoofdletters: "Verraad · Kruis · berouw" wordt "Verraad · Kruis · Berouw"
const themas = (t: string) => t.split(' · ').map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(' · ');

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
const useOnderdeel = () => useSyncExternalStore(volgHash, () => decodeURIComponent(window.location.hash).match(/^#week\/(.+)$/)?.[1] ?? '');

function Overzicht({ dagen, vandaagKey }: { dagen: Record<WeekDag, WeekTekst>; vandaagKey: WeekDag }) {
  const vandaag = dagen[vandaagKey];
  const app = useApp();
  const toon = bepaalToon(app.vandaag);
  // Vastendagen van deze week, uit de bestaande vastenberekening
  const vast = (d: WeekDag) => {
    const n = dagInfo(datumIn(app.vandaag, d), app.mode).vasten.niveau;
    return n !== 'vrij' && n !== 'geen';
  };
  return (
    <section id="week" className="am em wm">
      <div className="em-banner wm-banner">
        <img src={BANNER.src} srcSet={BANNER.srcSet} sizes="100vw" alt="" width={1086} height={1448} decoding="async" />
        <div className="em-banner-tekst">
          <p className="am-merk">Orthodoxe Tijd</p>
          <h1 className="em-titel">Week</h1>
          <p className="am-onder">De zeven dagen</p>
          <Sierlijn />
        </div>
      </div>
      <div className="em-papier">
        <a className="em-nu" href={`#week/${vandaagKey}`}>
          <span className="em-nu-tekst">
            <span className="am-label">Vandaag in de kerkelijke week</span>
            <b>{vandaag.title}</b>
            <span>{vandaag.subtitle}{toon ? ` · Toon ${toon}` : ''}</span>
          </span>
          <ChevronRight className="am-pijl" aria-hidden="true" />
        </a>
        <Sierlijn />
        <h2 className="am-label em-kop">De zeven dagen</h2>
        <ul className="em-lijst wm-lijst">
          {DAGEN.map((d) => (
            <li key={d}>
              <a className={d === vandaagKey ? 'is-nu' : undefined} href={`#week/${d}`} aria-current={d === vandaagKey ? 'date' : undefined}>
                <span className="wm-dag">
                  <b>{dagen[d].title}</b>
                  <span>{dagen[d].subtitle}</span>
                </span>
                {vast(d) && <span className="wm-vastendag">vastendag</span>}
                <ChevronRight className="am-pijl" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <Sierlijn />
        <h2 className="am-label em-kop">Verdieping</h2>
        <ul className="em-lijst wm-verdieping">
          {VERDIEPING.map(({ key, titel }) => (
            <li key={key}>
              <a href={`#week/lees/${key}`}>
                <span className="em-kaart-kruis">{SIERKRUIS}</span>
                <span className="wm-verd-titel">{titel}</span>
                <ChevronRight className="am-pijl" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Een dag: banner met de naam en het thema, daaronder de bestaande tekst; geen beeld onderaan.
function Dag({ dag, tekst }: { dag: WeekDag; tekst: WeekTekst }) {
  const { vandaag, mode, openDag } = useApp();
  const [bediening, setBediening] = useState(false);
  // De datum van deze dag in de huidige week (zondag tot en met zaterdag), zoals op de webpagina.
  const datum = datumIn(vandaag, dag);
  const i = DAGEN.indexOf(dag);
  const vorige = DAGEN[(i + 6) % 7];
  const volgende = DAGEN[(i + 1) % 7];
  const info = dagInfo(datum, mode);
  const toon = bepaalToon(vandaag);
  // De vaste alinea's over de Octoechos (op alle dagen gelijk) staan in de verdieping; hier één regel met de toon.
  const [betekenis] = tekst.paragraphs;
  return (
    <Laag className="em-laag em-dienst wm-dagweergave" label={tekst.title}>
      <Kop
        terug="#week"
        merk
        slim
        rechts={
          <>
            <button type="button" className="am-knopje am-aa" aria-expanded={bediening} aria-label="Tekstgrootte en avondweergave" onClick={() => setBediening((b) => !b)}>
              Aa
            </button>
            <DeelKnop titel={tekst.title} pad={`week/${dag}`} className="am-knopje" />
          </>
        }
      />
      {/* Het paneel Aa ligt over de banner, direct onder de kopbalk (verschuift niets) */}
      {bediening && (
        <div className="wm-lb-houder">
          <Leesbediening className="am-lb wm-lb" />
        </div>
      )}
      <div className="em-dienst-beeld wm-dag-beeld">
        <img src={dagBanner(dag).src} srcSet={dagBanner(dag).srcSet} sizes="100vw" alt="" width={1086} height={1448} decoding="async" />
        <div className="em-dienst-tekst">
          <h1 className="em-titel" tabIndex={-1}>{tekst.title}</h1>
          <p className="em-dienst-onder">{tekst.subtitle}</p>
          <Sierlijn />
        </div>
      </div>
      <article className="wm-tekst lees-vlak">
        <div className="lees-tekst">
          <section>
            <h2 className="am-label">Betekenis</h2>
            <p>{betekenis}</p>
          </section>
          {tekst.highlight && (
            <section>
              <Sierlijn />
              <h2 className="am-label">De thema’s van de dag</h2>
              <p>{themas(tekst.highlight)}</p>
            </section>
          )}
          <section>
            <Sierlijn />
            <h2 className="am-label">Deze week</h2>
            {toon && (
              <p className="wm-toon">
                Deze week klinkt toon {toon}. <a href="#week/lees/betekenis">Over de tonen van de Octoechos</a>
              </p>
            )}
            <button type="button" className="em-kaart wm-kalender" onClick={() => openDag(ymd(datum))}>
              <span className="em-kaart-kruis">{SIERKRUIS}</span>
              <span className="em-kaart-tekst">
                <b>{formatDag(datum)}</b>
                <span>{info.vasten.label}</span>
              </span>
              <ChevronRight className="am-pijl" aria-hidden="true" />
            </button>
          </section>
          {/* Verder door de week: de vorige en de volgende dag */}
          <nav className="wm-blader" aria-label="Andere dagen van de week">
            <a href={`#week/${vorige}`}><ChevronLeft aria-hidden="true" /> {hoofd(vorige)}</a>
            <a href={`#week/${volgende}`}>{hoofd(volgende)} <ChevronRight aria-hidden="true" /></a>
          </nav>
        </div>
      </article>
    </Laag>
  );
}

const hoofd = (d: WeekDag) => d.charAt(0).toUpperCase() + d.slice(1);

export default function WeekMobiel({ dagen, vandaagKey }: { dagen: Record<WeekDag, WeekTekst>; vandaagKey: WeekDag }) {
  const onderdeel = useOnderdeel();
  const [eerste, tweede] = onderdeel.split('/');
  const dag = DAGEN.find((d) => d === eerste);
  const info = eerste === 'lees' && tweede && tweede in WEEK_INFO ? (tweede as keyof typeof WEEK_INFO) : null;
  return (
    <>
      <Overzicht dagen={dagen} vandaagKey={vandaagKey} />
      {dag && <Dag key={dag} dag={dag} tekst={dagen[dag]} />}
      {info && (
        <LeesWeergave slim className="em-laag em-lees" titel={WEEK_INFO[info].title} ondertitel={WEEK_INFO[info].subtitle} terug="#week" deelPad={`week/lees/${info}`} boven={<span className="em-ornament">{SIERKRUIS}</span>}>
          <PopupTekst inhoud={WEEK_INFO[info]} />
        </LeesWeergave>
      )}
    </>
  );
}
