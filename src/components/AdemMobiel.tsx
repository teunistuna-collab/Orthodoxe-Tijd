import { useEffect, useState, useSyncExternalStore, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { BookOpen, ChevronRight, Heart } from 'lucide-react';
import { ADEM_INLEIDING, ADEM_POPUPS } from '../lib/cyclusTeksten';
import { GEBEDEN } from '../lib/gebeden';
import { useEigenPijlgebed } from '../lib/pijlgebed';
import { BLAD, HANDEN, KRUIS } from './symbolen';
import { Kop, Laag, LeesWeergave, PopupTekst, Sierlijn } from './MobielLaag';
import { vorigeAdres } from '../lib/vorigAdres';

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
].filter((v) => v.tekst);

function useVormen(): Vorm[] {
  const eigen = useEigenPijlgebed().trim();
  return eigen ? [...VASTE_VORMEN, { id: 'eigen', titel: 'Jouw pijlgebed', tekst: eigen }] : VASTE_VORMEN;
}

// De laatst gekozen gebedsvorm, op dit apparaat ("Begin met bidden" gaat daarheen)
const VORM_SLEUTEL = 'adem-vorm';
const leesVorm = () => {
  try {
    return localStorage.getItem(VORM_SLEUTEL) ?? '';
  } catch {
    return '';
  }
};
const bewaarVorm = (id: string) => {
  try {
    localStorage.setItem(VORM_SLEUTEL, id);
  } catch {
    /* geen opslag */
  }
};

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

// 1. Beginweergave
function Begin({ gebed, laatste }: { gebed: string; laatste: string }) {
  return (
    <section id="adem" className="am">
      <div className="am-held">
        <img className="am-held-beeld" src={`${BEELD}-800.webp`} srcSet={SRCSET} sizes="100vw" alt="" width={941} height={1672} decoding="async" />
        {/* Titel bovenin en het gebed onderaan: niets over het gelaat op het icoon */}
        <div className="am-held-tekst">
          <p className="am-merk">Orthodoxe Tijd</p>
          <h1 className="am-titel">Adem</h1>
          <p className="am-onder">Het Jezusgebed</p>
        </div>
        <div className="am-held-onder">
          <Sierlijn />
          <p className="am-gebed"><Gebedsregels tekst={gebed} /></p>
          <a className="am-begin" href={`#adem/bidden/${laatste}`}>
            <span className="am-begin-symbool">{HANDEN}</span>
            <span>Begin met bidden</span>
            <span className="am-begin-pijl" aria-hidden="true">›</span>
          </a>
        </div>
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
  { id: 'normaal', label: 'Normaal', sec: 8 },
  { id: 'rustig', label: 'Rustig', sec: 10 },
  { id: 'langzaam', label: 'Langzaam', sec: 12 },
] as const;

function Bidden({ vorm, metAdem }: { vorm: Vorm; metAdem: boolean }) {
  const [actief, setActief] = useState(false);
  const [hulp, setHulp] = useState(metAdem);
  useEffect(() => bewaarVorm(vorm.id), [vorm.id]);
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
        slim
        rechts={
          <a className="am-knopje am-vormknop" href={`#adem/vormen/${vorm.id}`} aria-label={`Gebedsvorm: ${vorm.titel}. Kies een andere vorm`}>
            Vorm
          </a>
        }
      />
      <div className={`am-bid-tekst adem-ritme${actief ? ' is-actief' : ''}`} style={{ '--adem-duur': `${tempo.sec}s` } as CSSProperties}>
        <h1 className="sr-only" tabIndex={-1}>Het Jezusgebed, {vorm.titel.toLowerCase()}</h1>
        <p className="am-bid-vorm" aria-hidden="true">{vorm.titel}</p>
        <Sierlijn licht />
        <p className="am-bid-gebed"><Gebedsregels tekst={vorm.tekst} /></p>
        {/* Altijd dezelfde ruimte, zodat het gebed niet verspringt als de ademhulp begint */}
        <p className="am-fasen" aria-hidden="true" style={{ visibility: actief ? 'visible' : 'hidden' }}>
          <span className="adem-in">Inademen</span> · <span className="adem-uit">Uitademen</span>
        </p>
        <Sierlijn licht />
        {/* De ademhulp: bij elke vorm aan te zetten */}
        <div className="am-steun">
          {!hulp ? (
            <button type="button" className="am-start" onClick={() => setHulp(true)}>Ademhulp</button>
          ) : (
            <>
              <div className="am-tempo" role="group" aria-label="Tempo van de ademhulp">
                {TEMPI.map((t) => (
                  <button key={t.id} type="button" aria-pressed={tempo.id === t.id} onClick={() => kies(t)}>
                    {t.label} <span className="am-sec">{t.sec} s</span>
                  </button>
                ))}
              </div>
              <button type="button" className="am-start" onClick={() => setActief((a) => !a)}>
                {actief ? 'Stop de ademhulp' : 'Start de ademhulp'}
              </button>
            </>
          )}
          <p className="sr-only" aria-live="polite">{actief ? `Ademhulp gestart: adem rustig in en uit, ongeveer ${tempo.sec / 2} seconden per fase.` : ''}</p>
        </div>
      </div>
    </Laag>
  );
}

// 3. Leesweergave
function Lezen({ onderwerp }: { onderwerp: Onderwerp }) {
  const inhoud = ADEM_POPUPS[onderwerp];
  const info = ONDERWERPEN.find((o) => o.key === onderwerp)!;
  return (
    <LeesWeergave
      titel={inhoud.title}
      onder={ADEM_INLEIDING[onderwerp]}
      terug="#adem"
      slim
      deelPad={`adem/lees/${onderwerp}`}
      boven={<span className="am-tegel am-tegel-groot">{info.symbool}</span>}
    >
      <PopupTekst inhoud={inhoud} />
    </LeesWeergave>
  );
}

// 4. Keuze van de gebedsvorm
function Vormen({ huidig, vormen }: { huidig: string; vormen: Vorm[] }) {
  const kies = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const doel = `#adem/bidden/${id}`;
    // Kwam je uit het gebed, dan eerst terug naar dat gebed en het daar vervangen: zo staat er één gebed in de
    // geschiedenis en brengt Terug je daarna naar de gebedshoek
    if (vorigeAdres().startsWith('#adem/bidden')) {
      window.addEventListener('hashchange', () => window.location.replace(doel), { once: true });
      window.history.back();
    } else window.location.replace(doel);
  };
  return (
    <Laag className="am-lees am-vormen" label="Kies een gebedsvorm">
      <Kop terug={`#adem/bidden/${huidig}`} licht slim />
      <div className="am-vormen-vlak">
        <h1 className="am-lees-titel am-vormen-titel" tabIndex={-1}>Het Jezusgebed</h1>
        <p className="am-vormen-onder">Kies een gebedsvorm. De ademhulp kun je bij elke vorm aanzetten.</p>
        <ul className="am-vormen-lijst">
          {vormen.map((v) => (
            <li key={v.id}>
              <a className={`am-vorm${v.id === huidig ? ' is-gekozen' : ''}`} href={`#adem/bidden/${v.id}`} aria-current={v.id === huidig ? 'true' : undefined} onClick={(e) => kies(e, v.id)}>
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
  // "adem" (de vroegere vorm met ademcyclus) opent het standaardgebed met de ademhulp
  const vorm = vormen.find((v) => v.id === sleutel) ?? vormen.find((v) => v.id === leesVorm()) ?? vormen[0];
  const laatste = vormen.find((v) => v.id === leesVorm())?.id ?? vormen[0].id;
  return (
    <>
      <Begin gebed={STANDAARD} laatste={laatste} />
      {soort === 'bidden' && <Bidden key={vorm.id} vorm={sleutel === 'adem' ? vormen[0] : vorm} metAdem={sleutel === 'adem'} />}
      {soort === 'vormen' && <Vormen huidig={vorm.id} vormen={vormen} />}
      {soort === 'lees' && sleutel in ADEM_POPUPS && <Lezen key={sleutel} onderwerp={sleutel as Onderwerp} />}
    </>
  );
}
