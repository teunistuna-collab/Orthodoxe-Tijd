import { useState, type CSSProperties } from 'react';
import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { ADEM_POPUPS } from '../lib/cyclusTeksten';
import PaginaOpening from './PaginaOpening';
import Gebedssnoer from './Gebedssnoer';

type PopupKey = 'wat' | 'jezusgebed' | 'gebedskoord' | 'hart';

// Adem volgens het aangeleverde ontwerp (index.css, Bouw 181): opening; twee gebedsinstrumenten naast elkaar (mee-ademen
// met het Jezusgebed en het gebedssnoer); daaronder de vier verdiepingen als rustig register (op mobiel uitklapbaar).
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
  const [openRegel, setOpenRegel] = useState<PopupKey | null>(null);
  const sec = TEMPI.find((t) => t.id === tempo)!.sec;

  return (
    <>
      <PaginaOpening id="adem" soort="cyclisch" label="De ademcyclus" titel="Adem" ondertitel="Het onophoudelijke gebed" />

      <section className="ad-pagina bg-parchment text-ink">
        <div className={CONTENT}>
          <div className="ad-panelen">
            {/* Mee-ademen met het Jezusgebed: de ringen zetten uit bij het inademen en krimpen bij het uitademen */}
            <div className="ad-paneel jr-vak">
              {['lb', 'rb', 'lo', 'ro'].map((h) => <span key={h} className={`ad-hoek ad-hoek-${h}`} aria-hidden="true" />)}
              <h2 className="ad-kop">Het Jezusgebed</h2>
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
            <Gebedssnoer />
          </div>

          {/* Verdieping: op het web vier rustige kolommen, op mobiel uitklapbare registerregels */}
          <section className="ad-verdieping" aria-label="Verdieping">
            {CARDS.map(({ key, title, intro }) => (
              <div key={key} className="ad-onderdeel">
                <button type="button" className="ad-onderdeel-kop" aria-expanded={openRegel === key} onClick={() => setOpenRegel(openRegel === key ? null : key)}>
                  <h3>{title}</h3>
                  <span className="ad-pijl" aria-hidden="true">›</span>
                </button>
                <div className={`ad-onderdeel-inhoud${openRegel === key ? ' is-open' : ''}`}>
                  <p>{intro}</p>
                  <button type="button" className="fs-link" onClick={() => setPopup(key)}>
                    Lees meer ›
                  </button>
                </div>
              </div>
            ))}
          </section>

          <blockquote className="ad-citaat">
            <p>“Ga, zit in je cel, en je cel zal je alles leren.”</p>
            <footer>— Abba Mozes de Ethiopiër</footer>
          </blockquote>
        </div>
      </section>

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

      <LiturgicalPopup open={popup !== null} onClose={() => setPopup(null)} content={popup ? ADEM_POPUPS[popup] : null} />
    </>
  );
}
