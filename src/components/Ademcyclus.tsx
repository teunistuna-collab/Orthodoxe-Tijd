import { useEffect, useState, type CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { ADEM_POPUPS } from '../lib/cyclusTeksten';
import ExactPageFrame from './ExactPageFrame';
import NisKop from './NisKop';
import { BannerBeeld, Sierlijn } from './onderdelen';
import { usePaginaOpen } from '../lib/paginaOpen';
import './Vandaag.css';
import './ontwerp.css';
import Verdieping from './Verdieping';
import Gebedssnoer from './Gebedssnoer';
import { usePijlgebed } from '../lib/pijlgebed';

type PopupKey = 'wat' | 'jezusgebed' | 'gebedskoord' | 'hart';

// Adem volgens het overdrachtspakket (referentie gebeden-psalmen-adem.png, paneel 4): donkere kop met titel; twee tabs
// (het Jezusgebed, het gebedssnoer); daaronder de vier verdiepingen als rustig register (op mobiel uitklapbaar), het
// citaat van Macarius en de cyclusweg. Het Jezusgebed staat centraal: het icoon en het gebed (het eigen pijlgebed uit
// Instellingen, anders het standaardgebed) als één tekst. De ademondersteuning is optioneel en uitklapbaar; ze start pas
// na "Start ondersteuning" en stopt bij inklappen, wisselen van tab, verlaten van de pagina of een tabblad op de achtergrond.
// Inhoud rechtstreeks gebaseerd op "De orthodoxe ademcyclus.docx".

const CARDS: Array<{ key: PopupKey; title: string; intro: string }> = [
  { key: 'wat', title: 'Wat is de ademcyclus?', intro: 'Het kleinste ritme van het gebedsleven: de voortdurende gedachtenis aan Christus.' },
  { key: 'jezusgebed', title: 'Het Jezusgebed', intro: 'Heer Jezus Christus, Zoon van God, ontferm U over mij, zondaar — telkens opnieuw aangeroepen.' },
  { key: 'gebedskoord', title: 'Het gebedskoord', intro: 'De chotki helpt het gebed aandachtig te herhalen zonder de ademhaling tot een teller te maken.' },
  { key: 'hart', title: 'Gebed van het hart', intro: 'Van de lippen, naar het verstand, tot een gebed dat het hart zelf doordringt.' },
];

// Duur van één ademhaling (inademen + uitademen).
const TEMPI = [
  { id: 'rustig', label: 'Rustig', sec: 10 },
  { id: 'normaal', label: 'Normaal', sec: 8 },
  { id: 'langzaam', label: 'Langzaam', sec: 12 },
] as const;
type Tempo = (typeof TEMPI)[number]['id'];

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';
const TEMPO_SLEUTEL = 'adem-tempo';
const leesTempo = (): Tempo => {
  try {
    const t = localStorage.getItem(TEMPO_SLEUTEL);
    return TEMPI.some((x) => x.id === t) ? (t as Tempo) : 'rustig';
  } catch {
    return 'rustig';
  }
};

export default function Ademcyclus() {
  const [popup, setPopup] = useState<PopupKey | null>(null);
  // Twee aparte toestanden: het onderdeel is uitgeklapt (steunOpen) en de begeleiding loopt (actief). Alleen de
  // tempovoorkeur wordt bewaard; de begeleiding nooit, zodat ze bij terugkeer niet vanzelf start.
  const [steunOpen, setSteunOpen] = useState(false);
  const [actief, setActief] = useState(false);
  const [tempo, setTempoState] = useState<Tempo>(leesTempo);
  const setTempo = (t: Tempo) => {
    setTempoState(t);
    try {
      localStorage.setItem(TEMPO_SLEUTEL, t);
    } catch {
      /* geen opslag */
    }
  };
  const sec = TEMPI.find((t) => t.id === tempo)!.sec;
  const open = usePaginaOpen('adem');
  const pijlgebed = usePijlgebed();
  // Het gebedssnoer blijft gemonteerd (hidden), zodat de snoerstand niet verspringt bij het wisselen van tab.
  const [tab, setTab] = useState<'jezusgebed' | 'snoer'>('jezusgebed');
  const TABS = [['jezusgebed', 'Jezusgebed'], ['snoer', 'Gebedssnoer']] as const;

  // Verlaat de bezoeker de pagina, dan stopt de begeleiding (en start bij terugkeer niet opnieuw).
  if (actief && !open) setActief(false);
  // Tabblad op de achtergrond: stoppen.
  useEffect(() => {
    if (!actief) return;
    const opZicht = () => {
      if (document.visibilityState === 'hidden') setActief(false);
    };
    document.addEventListener('visibilitychange', opZicht);
    return () => document.removeEventListener('visibilitychange', opZicht);
  }, [actief]);
  const kiesTab = (id: 'jezusgebed' | 'snoer') => {
    setTab(id);
    if (id !== 'jezusgebed') setActief(false);
  };
  const wisselSteun = () => {
    setSteunOpen((o) => !o);
    setActief(false);
  };

  return (
    <>
      <section id="adem" className="vg ot-redesign ot-adem">
        {/* Zoals Week: de banner zonder titel (de kaarsen blijven zichtbaar) met het gebedssnoer, de titel op het papier.
            Mobiel de eigen Adem-banner, web de kerkkop van Week. */}
        <NisKop
          open={open}
          balk
          terug="#cycli"
          achter={
            <picture>
              <source media="(min-width: 768px)" srcSet="/images/vandaag/kerk-header-800.webp 800w, /images/vandaag/kerk-header-1536.webp 1536w" sizes="(min-width: 960px) 960px, 100vw" width={1536} height={1024} />
              <BannerBeeld naam="psalmen-adem-banner" open={open} />
            </picture>
          }
        >
          <img className="vg-ritmewiel vg-kop-teken" src="/images/Gebedssnoer-kop.webp" alt="" aria-hidden="true" width={376} height={640} />
        </NisKop>
        <div className="vg-papier ot-inhoud">
          <h1 className="ot-titel">Het Jezusgebed</h1>
          <Sierlijn />
          <p className="ot-ad-onder">Het onophoudelijke gebed</p>
          <div className="ot-ad-tabs" role="tablist" aria-label="Gebed">
            {TABS.map(([id, label]) => (
              <button key={id} type="button" role="tab" id={`ad-tab-${id}`} aria-controls={`ad-paneel-${id}`} aria-selected={tab === id} onClick={() => kiesTab(id)}>
                {label}
              </button>
            ))}
          </div>
            {/* Het Jezusgebed: het icoon en het gebed als één tekst; de ademondersteuning eronder, optioneel en uitklapbaar */}
            <div className="ad-paneel" role="tabpanel" id="ad-paneel-jezusgebed" aria-labelledby="ad-tab-jezusgebed" hidden={tab !== 'jezusgebed'}>
              <h2 className="sr-only">Het Jezusgebed</h2>
              <div className={`adem-ritme ad-ritme${actief ? ' is-actief' : ''}`} style={{ '--adem-duur': `${sec}s` } as CSSProperties}>
                <div className="ad-icoon">
                  <div className="adem-gloed" aria-hidden="true" />
                  <div className="adem-ring ad-ring-1" aria-hidden="true" />
                  <div className="adem-ring adem-ring-2 ad-ring-2" aria-hidden="true" />
                  <div className="ad-ring-3" aria-hidden="true" />
                  <img loading="lazy" decoding="async" src="/images/Christus-afbeelding.webp" alt="Christus" />
                </div>
                <p className="ad-gebed-tekst">{pijlgebed}</p>
                {/* Alleen tijdens de begeleiding: de ademfasen, afwisselend oplichtend (CSS). Niet voorgelezen per fase. */}
                {actief && (
                  <p className="ad-fasen" aria-hidden="true">
                    <span className="adem-in">Inademen</span>
                    <span className="ad-fase-punt">·</span>
                    <span className="adem-uit">Uitademen</span>
                  </p>
                )}
              </div>

              <button type="button" className="ad-steun-knop" aria-expanded={steunOpen} aria-controls="ad-steun" onClick={wisselSteun}>
                Ademondersteuning · optioneel
                <ChevronDown className={`ad-steun-pijl${steunOpen ? ' is-open' : ''}`} aria-hidden="true" />
              </button>
              <div id="ad-steun" className="ad-steun" hidden={!steunOpen}>
                <p className="ad-steun-tekst">
                  Bid rustig en zonder haast. U hoeft uw ademhaling niet aan te passen om dit gebed te bidden. De ondersteuning hieronder is optioneel. Volg
                  voor persoonlijke begeleiding het advies van uw geestelijke.
                </p>
                <p className="ad-tempo-label" id="ad-tempo-label">Tempo</p>
                <div className="ad-tempo" role="group" aria-labelledby="ad-tempo-label">
                  {TEMPI.map((t) => (
                    <button key={t.id} type="button" aria-pressed={tempo === t.id} onClick={() => setTempo(t.id)}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setActief((a) => !a)} className="ad-start">
                  {actief ? 'Stop ondersteuning' : 'Start ondersteuning'}
                </button>
                <p className="sr-only" aria-live="polite">
                  {actief ? `Ondersteuning gestart: adem rustig in en uit, ongeveer ${sec / 2} seconden per fase.` : ''}
                </p>
              </div>
            </div>

            {/* Het gebedssnoer: het Jezusgebed tellen per knoop */}
          <div role="tabpanel" id="ad-paneel-snoer" aria-labelledby="ad-tab-snoer" hidden={tab !== 'snoer'}>
            <Gebedssnoer />
          </div>
        </div>
      </section>

      <ExactPageFrame title="Adem">
      <div className="ad-pagina text-ink">
        <div className={CONTENT}>
          {/* Verdieping: op het web vier rustige kolommen, op mobiel uitklapbare registerregels */}
          <Verdieping items={CARDS} onOpen={setPopup} />
        </div>
      </div>

      {/* Quote + Van adem naar etmaal */}
      <CycleTransition
        quote="Er is geen noodzaak om veel woorden te gebruiken. Zeg: Heer, zoals U wilt en zoals U weet, ontferm U."
        citation="Abba Macarius de Grote"
        eyebrow="Van adem naar etmaal"
        text="Wat in de adem begint als de voortdurende gedachtenis aan Christus, krijgt in de etmaalcyclus zijn vaste gestalte: de gebeden die de Kerk door dag en nacht heen bidt."
        buttonLabel="Ontdek de etmaalcyclus"
        buttonHref="#etmaal"
      />

      <TimeSanctificationTimeline current="adem" />
      </ExactPageFrame>

      <LiturgicalPopup open={popup !== null} onClose={() => setPopup(null)} content={popup ? ADEM_POPUPS[popup] : null} />
    </>
  );
}
