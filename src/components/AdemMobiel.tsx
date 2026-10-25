import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Heart, Settings } from 'lucide-react';
import { ADEM_INLEIDING, ADEM_POPUPS } from '../lib/cyclusTeksten';
import { GEBEDEN } from '../lib/gebeden';
import { useEigenPijlgebed } from '../lib/pijlgebed';
import { vergrendelScroll } from '../lib/scrollLock';
import { BLAD, HANDEN, KRUIS } from './symbolen';
import Leesbediening from './Leesbediening';
import DeelKnop from './DeelKnop';
import './adem-mobiel.css';

// Adem op mobiel (< 768 px), volgens de goedgekeurde mock-up (mobile/docs/mockups/goedgekeurd/08-adem.png), vier weergaven:
//   #adem                  1. de gebedshoek met het Jezusgebed, "Begin met bidden" en de vier verdiepingen
//   #adem/bidden[/vorm]    2. de verstilde gebedsweergave (schermvullend)
//   #adem/lees/<onderwerp> 3. de leesweergave van een verdieping (lib/cyclusTeksten.ts, ADEM_POPUPS)
//   #adem/vormen[/vorm]    4. de keuze van de gebedsvorm
// Beeld: de aangeleverde gebedshoek (public/images/adem/gebedshoek-*.webp), ongewijzigd, alleen verkleind.
// Gebedsteksten alleen uit de site: het Jezusgebed en de kortere vormen uit lib/gebeden.ts, het eigen pijlgebed uit
// Instellingen. Desktop houdt de bestaande pagina (Ademcyclus.tsx).

type Onderwerp = keyof typeof ADEM_POPUPS;
const ONDERWERPEN: { key: Onderwerp; titel: string; onder: string; symbool: ReactNode; nr: string }[] = [
  { key: 'wat', titel: 'Wat is de ademcyclus?', onder: 'Het kleinste ritme van het gebedsleven.', symbool: BLAD, nr: 'I' },
  { key: 'jezusgebed', titel: 'Het Jezusgebed', onder: 'De woorden en betekenis van het gebed.', symbool: KRUIS, nr: 'II' },
  { key: 'gebedskoord', titel: 'Het gebedskoord', onder: 'De chotki als hulpmiddel bij het bidden.', symbool: <SnoerSymbool />, nr: 'III' },
  { key: 'hart', titel: 'Gebed van het hart', onder: 'Van de lippen, naar het verstand, tot een gebed dat het hart zelf doordringt.', symbool: <Heart strokeWidth={1.3} aria-hidden="true" />, nr: 'IV' },
];

/** Lijnsymbool van een gebedssnoer (kring van knopen met een kruis), in de stijl van symbolen.tsx. */
function SnoerSymbool() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => {
        const h = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={12 + 7 * Math.sin(h)} cy={9 - 6.5 * Math.cos(h)} r="1.1" />;
      })}
      <path d="M12 15.5v6.5M10 18h4" />
    </svg>
  );
}

// De vormen van het Jezusgebed zoals ze in lib/gebeden.ts staan ("(korter:) …", "(kortst:) …").
const JEZUSGEBED = GEBEDEN.find((g) => g.id === 'jezusgebed')?.tekst ?? '';
const regelNa = (label: string) => JEZUSGEBED.match(new RegExp(`\\(${label}:\\)\\s*(.+)`))?.[1]?.trim() ?? '';
const STANDAARD = JEZUSGEBED.split('\n')[0].trim();
type Vorm = { id: string; titel: string; tekst: string; onder?: string };
const VASTE_VORMEN: Vorm[] = [
  { id: 'standaard', titel: 'Standaard', tekst: STANDAARD },
  { id: 'korter', titel: 'Korter', tekst: regelNa('korter') },
  { id: 'kortst', titel: 'Kortst', tekst: regelNa('kortst') },
  { id: 'adem', titel: 'Met ademcyclus', tekst: STANDAARD, onder: 'Met rustig inademen en uitademen (optionele ondersteuning).' },
].filter((v) => v.tekst);

function useVormen(): Vorm[] {
  const eigen = useEigenPijlgebed().trim();
  return eigen ? [...VASTE_VORMEN.slice(0, 3), { id: 'eigen', titel: 'Uw pijlgebed', tekst: eigen }, ...VASTE_VORMEN.slice(3)] : VASTE_VORMEN;
}

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
/** Het deel na "#adem/" ("bidden/kortst", "lees/wat", "vormen"), of '' op de beginweergave. */
const useOnderdeel = () => useSyncExternalStore(volgHash, () => decodeURIComponent(window.location.hash).match(/^#adem\/(.+)$/)?.[1] ?? '');

/** Het gebed regel voor regel, afgebroken na elke komma (zoals in de mock-up). */
function Gebedsregels({ tekst }: { tekst: string }) {
  const regels = tekst.split(/(?<=,)\s+/);
  return <>{regels.map((r, i) => <span key={i} className="am-regel">{r}{i < regels.length - 1 ? ' ' : ''}</span>)}</>;
}

const BEELD = '/images/adem/gebedshoek';
const SRCSET = `${BEELD}-800.webp 800w, ${BEELD}-941.webp 941w`;

function Sierlijn({ licht }: { licht?: boolean }) {
  return (
    <span className={`am-sierlijn${licht ? ' is-licht' : ''}`} aria-hidden="true">
      <span />
      <svg viewBox="0 0 24 24"><path d="M12 4v16M6 12h12" /><path d="m12 4-1.5 2.5h3ZM12 20l-1.5-2.5h3ZM6 12l2.5-1.5v3ZM18 12l-2.5-1.5v3Z" /></svg>
      <span />
    </span>
  );
}

/** Schermvullende weergave (2, 3, 4): over de onderbalk heen, de pagina eronder scrolt niet mee. */
function Laag({ className, label, children }: { className: string; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const los = vergrendelScroll();
    ref.current?.focus({ preventScroll: true });
    return los;
  }, []);
  return (
    <div ref={ref} className={`am-laag ${className}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
      {children}
    </div>
  );
}

function Kop({ terug, licht, rechts }: { terug: string; licht?: boolean; rechts?: ReactNode }) {
  return (
    <div className={`am-kop${licht ? ' is-licht' : ''}`}>
      <a className="am-terug" href={terug}>
        <ChevronLeft aria-hidden="true" /> Terug
      </a>
      {licht ? <span className="am-merk">Orthodoxe Tijd</span> : <span />}
      <span className="am-kop-rechts">{rechts}</span>
    </div>
  );
}

// 1. Beginweergave
function Begin({ gebed }: { gebed: string }) {
  return (
    <section id="adem" className="am">
      <div className="am-held">
        <img className="am-held-beeld" src={`${BEELD}-800.webp`} srcSet={SRCSET} sizes="100vw" alt="" width={941} height={1672} decoding="async" />
        <div className="am-held-tekst">
          <p className="am-merk">Orthodoxe Tijd</p>
          <h1 className="am-titel">Adem</h1>
          <p className="am-onder">Het Jezusgebed</p>
          <Sierlijn />
          <p className="am-gebed"><Gebedsregels tekst={gebed} /></p>
        </div>
        <a className="am-begin" href="#adem/bidden">
          <span className="am-begin-symbool">{HANDEN}</span>
          <span>Begin met bidden</span>
          <span className="am-begin-pijl" aria-hidden="true">→</span>
        </a>
      </div>
      <section className="am-verdieping" aria-labelledby="am-verd-kop">
        <p className="am-label">Verdieping</p>
        <h2 id="am-verd-kop" className="am-verd-kop">De weg van het Jezusgebed</h2>
        <ul className="am-lijst">
          {ONDERWERPEN.map(({ key, titel, onder, symbool }) => (
            <li key={key}>
              <a className="am-rij" href={`#adem/lees/${key}`}>
                <span className="am-tegel">{symbool}</span>
                <span className="am-rij-tekst">
                  <b>{titel}</b>
                  <span>{onder}</span>
                </span>
                <ChevronRight className="am-pijl" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

// 2. Gebedsweergave
const TEMPI = [
  { id: 'rustig', label: 'Rustig', sec: 10 },
  { id: 'normaal', label: 'Normaal', sec: 8 },
  { id: 'langzaam', label: 'Langzaam', sec: 12 },
] as const;

function Bidden({ vorm }: { vorm: Vorm }) {
  const [actief, setActief] = useState(false);
  const [tempo, setTempo] = useState<(typeof TEMPI)[number]>(() => {
    try {
      return TEMPI.find((t) => t.id === localStorage.getItem('adem-tempo')) ?? TEMPI[0];
    } catch {
      return TEMPI[0];
    }
  });
  const kies = (t: (typeof TEMPI)[number]) => {
    setTempo(t);
    try {
      localStorage.setItem('adem-tempo', t.id);
    } catch {
      /* geen opslag */
    }
  };
  return (
    <Laag className="am-bid" label="Het Jezusgebed">
      <img className="am-bid-beeld" src={`${BEELD}-800.webp`} srcSet={SRCSET} sizes="100vw" alt="" width={941} height={1672} decoding="async" />
      <Kop
        terug="#adem"
        rechts={
          <a className="am-knopje" href={`#adem/vormen/${vorm.id}`} aria-label="Kies een gebedsvorm" title="Kies een gebedsvorm">
            <Settings aria-hidden="true" />
          </a>
        }
      />
      <div className={`am-bid-tekst adem-ritme${actief ? ' is-actief' : ''}`} style={{ '--adem-duur': `${tempo.sec}s` } as CSSProperties}>
        <Sierlijn licht />
        <p className="am-bid-gebed"><Gebedsregels tekst={vorm.tekst} /></p>
        {actief && (
          <p className="am-fasen" aria-hidden="true">
            <span className="adem-in">Inademen</span> · <span className="adem-uit">Uitademen</span>
          </p>
        )}
        <Sierlijn licht />
        {vorm.id === 'adem' && (
          <div className="am-steun">
            <div className="am-tempo" role="group" aria-label="Tempo">
              {TEMPI.map((t) => (
                <button key={t.id} type="button" aria-pressed={tempo.id === t.id} onClick={() => kies(t)}>
                  {t.label}
                </button>
              ))}
            </div>
            <button type="button" className="am-start" onClick={() => setActief((a) => !a)}>
              {actief ? 'Stop ondersteuning' : 'Start ondersteuning'}
            </button>
            <p className="sr-only" aria-live="polite">{actief ? `Ondersteuning gestart: adem rustig in en uit, ongeveer ${tempo.sec / 2} seconden per fase.` : ''}</p>
          </div>
        )}
      </div>
    </Laag>
  );
}

// 3. Leesweergave
function Lezen({ onderwerp }: { onderwerp: Onderwerp }) {
  const inhoud = ADEM_POPUPS[onderwerp];
  const info = ONDERWERPEN.find((o) => o.key === onderwerp)!;
  const [bediening, setBediening] = useState(false);
  return (
    <Laag className="am-lees" label={inhoud.title}>
      <Kop
        terug="#adem"
        licht
        rechts={
          <>
            <button type="button" className="am-knopje am-aa" aria-expanded={bediening} aria-label="Tekstgrootte en avondweergave" onClick={() => setBediening((b) => !b)}>
              Aa
            </button>
            <DeelKnop titel={inhoud.title} pad={`adem/lees/${onderwerp}`} className="am-knopje" />
          </>
        }
      />
      {bediening && <Leesbediening className="am-lb" />}
      <article className="am-lees-vlak lees-vlak">
        <span className="am-tegel am-tegel-groot">{info.symbool}</span>
        <p className="am-nr">{info.nr}</p>
        <h1 className="am-lees-titel" tabIndex={-1}>{inhoud.title}</h1>
        <Sierlijn />
        <p className="am-lees-onder">{ADEM_INLEIDING[onderwerp]}</p>
        {/* lees-tekst: volgt de tekstgrootte van de leesbediening (index.css, --lees-schaal) */}
        <div className="lees-tekst">
        {inhoud.highlight && <blockquote className="am-lees-citaat">{inhoud.highlight}</blockquote>}
        {inhoud.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {inhoud.sections?.map((s, i) => (
          <section key={i}>
            {s.heading && <h2>{s.heading}</h2>}
            {s.paragraphs?.map((p, j) => <p key={j}>{p}</p>)}
            {s.items && (
              <ul>
                {s.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
            )}
            {s.after?.map((p, j) => <p key={j}>{p}</p>)}
            {s.note && <p className="am-noot">{s.note}</p>}
          </section>
        ))}
        </div>
        <Sierlijn />
      </article>
    </Laag>
  );
}

// 4. Keuze van de gebedsvorm
function Vormen({ huidig, vormen }: { huidig: string; vormen: Vorm[] }) {
  return (
    <Laag className="am-lees am-vormen" label="Kies een gebedsvorm">
      <Kop terug={`#adem/bidden/${huidig}`} licht />
      <div className="am-vormen-vlak">
        <h1 className="am-lees-titel am-vormen-titel" tabIndex={-1}>Het Jezusgebed</h1>
        <p className="am-vormen-onder">Kies een gebedsvorm</p>
        <ul className="am-vormen-lijst">
          {vormen.map((v) => (
            <li key={v.id}>
              <a className={`am-vorm${v.id === huidig ? ' is-gekozen' : ''}`} href={`#adem/bidden/${v.id}`} aria-current={v.id === huidig ? 'true' : undefined}>
                <span>
                  <b>{v.titel}</b>
                  <span>{v.onder ?? v.tekst}</span>
                </span>
                <ChevronRight className="am-pijl" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <Sierlijn />
        <a className="am-rij am-meer" href="#adem/lees/jezusgebed">
          <span className="am-tegel"><BookOpen strokeWidth={1.3} aria-hidden="true" /></span>
          <span className="am-rij-tekst">
            <b>Lees meer over het Jezusgebed</b>
            <span>Geschiedenis, betekenis en de woorden van het gebed.</span>
          </span>
        </a>
      </div>
    </Laag>
  );
}

export default function AdemMobiel() {
  const onderdeel = useOnderdeel();
  const vormen = useVormen();
  const [soort, sleutel] = onderdeel.split('/');
  const vorm = vormen.find((v) => v.id === sleutel) ?? vormen[0];
  return (
    <>
      <Begin gebed={STANDAARD} />
      {soort === 'bidden' && <Bidden key={vorm.id} vorm={vorm} />}
      {soort === 'vormen' && <Vormen huidig={vorm.id} vormen={vormen} />}
      {soort === 'lees' && sleutel in ADEM_POPUPS && <Lezen key={sleutel} onderwerp={sleutel as Onderwerp} />}
    </>
  );
}
