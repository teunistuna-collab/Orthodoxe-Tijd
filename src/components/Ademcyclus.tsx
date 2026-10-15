import { useState, type CSSProperties } from 'react';
import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { ADEM_POPUPS } from '../lib/cyclusTeksten';
import ExactPageFrame from './ExactPageFrame';
import NisKop from './NisKop';
import { BannerBeeld } from './onderdelen';
import { usePaginaOpen } from '../lib/paginaOpen';
import './Vandaag.css';
import './ontwerp.css';
import Verdieping from './Verdieping';
import Gebedssnoer from './Gebedssnoer';

type PopupKey = 'wat' | 'jezusgebed' | 'gebedskoord' | 'hart';

// Adem volgens het overdrachtspakket (referentie gebeden-psalmen-adem.png, paneel 4): donkere kop met titel; twee tabs
// (mee-ademen met het Jezusgebed, het gebedssnoer); daaronder de vier verdiepingen als rustig register (op mobiel
// uitklapbaar), het citaat van Macarius en de cyclusweg.
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

export default function Ademcyclus() {
  const [popup, setPopup] = useState<PopupKey | null>(null);
  const [meeAdemen, setMeeAdemen] = useState(false);
  const [tempo, setTempo] = useState<Tempo>('rustig');
  const sec = TEMPI.find((t) => t.id === tempo)!.sec;
  const open = usePaginaOpen('adem');
  // Beide instrumenten blijven gemonteerd (hidden), zodat mee-ademen en de snoerstand niet verspringen bij het wisselen.
  const [tab, setTab] = useState<'jezusgebed' | 'snoer'>('jezusgebed');
  const TABS = [['jezusgebed', 'Jezusgebed'], ['snoer', 'Gebedssnoer']] as const;

  return (
    <>
      <section id="adem" className="vg ot-redesign ot-adem">
        <NisKop open={open} balk terug="#cycli" titel="Adem" achter={<BannerBeeld naam="psalmen-adem-banner" open={open} />}>
          <p className="ot-ad-onder">Het onophoudelijke gebed</p>
        </NisKop>
        <div className="vg-papier ot-inhoud">
          <div className="ot-ad-tabs" role="tablist" aria-label="Gebed">
            {TABS.map(([id, label]) => (
              <button key={id} type="button" role="tab" id={`ad-tab-${id}`} aria-controls={`ad-paneel-${id}`} aria-selected={tab === id} onClick={() => setTab(id)}>
                {label}
              </button>
            ))}
          </div>
            {/* Mee-ademen met het Jezusgebed: de ringen zetten uit bij het inademen en krimpen bij het uitademen */}
            <div className="ad-paneel" role="tabpanel" id="ad-paneel-jezusgebed" aria-labelledby="ad-tab-jezusgebed" hidden={tab !== 'jezusgebed'}>
              <h2 className="sr-only">Het Jezusgebed</h2>
              <div className={`adem-ritme ad-ritme${meeAdemen ? ' is-actief' : ''}`} style={{ '--adem-duur': `${sec}s` } as CSSProperties}>
                <div className="ad-icoon">
                  <div className="adem-gloed" aria-hidden="true" />
                  <div className="adem-ring ad-ring-1" aria-hidden="true" />
                  <div className="adem-ring adem-ring-2 ad-ring-2" aria-hidden="true" />
                  <div className="ad-ring-3" aria-hidden="true" />
                  <img loading="lazy" decoding="async" src="/images/Christus-afbeelding.webp" alt="Christus" />
                </div>
                <div className="adem-in ad-regel">
                  <p className="ad-gebed">Heer Jezus Christus,</p>
                  <span className="opening-sierlijn" aria-hidden="true" />
                  <p className="ad-adem">Inademen</p>
                </div>
                <div className="adem-uit ad-regel">
                  <p className="ad-gebed">ontferm U over ons.</p>
                  <span className="opening-sierlijn" aria-hidden="true" />
                  <p className="ad-adem">Uitademen</p>
                </div>
              </div>

              <button type="button" onClick={() => setMeeAdemen((a) => !a)} aria-pressed={meeAdemen} className="ad-start">
                {meeAdemen ? 'Stoppen' : 'Adem mee'}
              </button>
              <p className="sr-only" aria-live="polite">
                {meeAdemen ? `Adem in bij de eerste regel, adem uit bij de tweede; ongeveer ${sec / 2} seconden elk.` : ''}
              </p>
              <p className="ad-tempo-label">Tempo</p>
              <div className="ad-tempo" role="group" aria-label="Tempo">
                {TEMPI.map((t) => (
                  <button key={t.id} type="button" aria-pressed={tempo === t.id} onClick={() => setTempo(t.id)}>
                    {t.label}
                  </button>
                ))}
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
