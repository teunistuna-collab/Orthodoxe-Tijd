import { useState } from 'react';
import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { ADEM_POPUPS } from '../lib/cyclusTeksten';
import PageHero from './PageHero';
import Gebedssnoer from './Gebedssnoer';

type PopupKey = 'wat' | 'jezusgebed' | 'gebedskoord' | 'hart';

// Inhoud rechtstreeks gebaseerd op "De orthodoxe ademcyclus.docx".

const CARDS: Array<{ key: PopupKey; title: string; intro: string; iconSrc: string }> = [
  {
    key: 'wat',
    title: 'Wat is de ademcyclus?',
    intro: 'Het kleinste ritme van het gebedsleven: de voortdurende gedachtenis aan Christus.',
    iconSrc: '/images/ui/menu/02-Gebed-01-Wat-is-de-ademcyclus.webp',
  },
  {
    key: 'jezusgebed',
    title: 'Het Jezusgebed',
    intro: 'Heer Jezus Christus, Zoon van God, ontferm U over mij, zondaar — telkens opnieuw aangeroepen.',
    iconSrc: '/images/ui/menu/02-Gebed-02-Het-Jezusgebed.webp',
  },
  {
    key: 'gebedskoord',
    title: 'Het gebedskoord',
    intro: 'De chotki helpt het gebed aandachtig te herhalen zonder de ademhaling tot een teller te maken.',
    iconSrc: '/images/ui/menu/02-Gebed-03-Het-gebedskoord.webp',
  },
  {
    key: 'hart',
    title: 'Gebed van het hart',
    intro: 'Van de lippen, naar het verstand, tot een gebed dat het hart zelf doordringt.',
    iconSrc: '/images/ui/menu/02-Gebed-04-Gebed-van-het-hart.webp',
  },
];


const CONTENT = 'mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12';

// Dunne gouden lijn met een sierteken in het midden.
function OrnamentRule({ className = '' }: { className?: string }) {
  return (
    <div className={`mx-auto flex items-center gap-3 text-gold-deep ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-gold/50" />
      <span className="text-base leading-none">✣</span>
      <span className="h-px flex-1 bg-gold/50" />
    </div>
  );
}

export default function Ademcyclus() {
  const [popup, setPopup] = useState<PopupKey | null>(null);
  // "Adem mee": de ringen rond het icoon zetten uit bij het inademen en krimpen bij het uitademen (8 s per ademhaling, index.css Bouw 97).
  const [meeAdemen, setMeeAdemen] = useState(false);

  // De vier informatietegels: vanaf tablet bovenaan, op mobiel onder de hoofdinhoud (zoals bij Vasten).
  const infoTegels = (zicht: string) => (
    <section className={`${zicht} orthodox-pattern parchment-pattern bg-parchment py-16 text-ink sm:py-20`}>
      {/* Onzichtbare tussenkop: de tegels (h3) hangen zo onder een h2 voor schermlezers */}
      <h2 className="sr-only">Achtergrond</h2>
      <div className={CONTENT}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({ key, title, intro, iconSrc }) => (
            <button
              key={key}
              type="button"
              onClick={() => setPopup(key)}
              className="ornate-card group flex min-h-[240px] flex-col px-7 py-8 text-left"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold-light">
                <img loading="lazy" decoding="async" src={iconSrc} alt="" className="provided-card-icon" />
              </div>
              <h3 className="font-display mt-6 text-[20px] font-semibold text-gold-light uppercase">{title}</h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#d9c6a3] sm:text-base">{intro}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <>
      <PageHero id="adem" titel="Ademcyclus" ondertitel="Het onophoudelijke gebed" citaat="„Bidt zonder ophouden”" kop />

      {/* Informatiekaarten (op mobiel verderop, zie infoTegels) */}
      {infoTegels('max-md:hidden')}

      {/* Het Jezusgebed */}
      <section className="orthodox-pattern parchment-pattern bg-parchment py-16 text-ink max-md:pt-4 max-md:pb-10 sm:py-24">
        <div className={CONTENT}>
          <div className="mx-auto w-full max-w-none rounded-2xl border border-gold/45 bg-[#f8f1e3] px-6 py-12 shadow-[0_30px_70px_rgba(40,22,14,0.16)] max-md:pt-6 sm:px-12 sm:py-16 lg:px-16">
            <p className="ot-label text-center">Het Jezusgebed</p>
            <OrnamentRule className="mt-4 w-48" />

            {/* Christus-icoon met ringen en de twee korte gebeden ernaast */}
            <div className={`adem-ritme mx-auto mt-10 max-md:mt-0 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center${meeAdemen ? ' is-actief' : ''}`}>
              <div className="col-span-2 flex flex-col items-center lg:order-2 lg:col-span-1">
                <div className="relative m-9 h-[200px] w-[200px] shrink-0 max-[359px]:h-[160px] max-[359px]:w-[160px] sm:m-[60px] sm:h-[230px] sm:w-[230px]">
                  <div className="adem-gloed" aria-hidden="true" />
                  <div className="adem-ring absolute -inset-3.5 rounded-full border border-gold/45 sm:-inset-5" />
                  <div className="adem-ring adem-ring-2 absolute -inset-7 rounded-full border border-gold/30 sm:-inset-10" />
                  <div className="absolute -inset-9 rounded-full border border-dotted border-gold/40 sm:-inset-[60px]">
                    {['top-0 left-1/2 -translate-x-1/2 -translate-y-1/2', 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2', 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2', 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2'].map((plek) => (
                      <span key={plek} aria-hidden="true" className={`absolute ${plek} flex h-6 w-6 items-center justify-center rounded-full bg-[#f8f1e3] text-[17px] leading-none text-gold-deep`}>✣</span>
                    ))}
                  </div>
                  <div className="relative z-[1] flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-gold/60 shadow-[0_14px_36px_rgba(120,80,30,0.22)]">
                    <img loading="lazy" decoding="async" src="/images/Christus-afbeelding.webp" alt="Christus" className="h-full w-full object-cover" />
                  </div>
                </div>              </div>

              <div className="adem-in text-center lg:order-1">
                <div className="flex min-h-[6.5rem] items-end justify-center sm:min-h-[7.5rem]"><p className="font-display text-2xl italic leading-snug text-ink-soft sm:text-[26px] lg:text-[22px] xl:text-[28px]">Heer Jezus Christus,<br />Zoon van God.</p></div>
                <OrnamentRule className="mt-4 w-32" />
                <p className="ot-label mt-4">Inademen</p>
              </div>
              <div className="adem-uit text-center lg:order-3">
                <div className="flex min-h-[6.5rem] items-end justify-center sm:min-h-[7.5rem]"><p className="font-display text-2xl italic leading-snug text-ink-soft sm:text-[26px] lg:text-[22px] xl:text-[28px]">ontferm U over mij,<br />zondaar.</p></div>
                <OrnamentRule className="mt-4 w-32" />
                <p className="ot-label mt-4">Uitademen</p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button type="button" onClick={() => setMeeAdemen((a) => !a)} aria-pressed={meeAdemen} className="btn-pill">
                {meeAdemen ? 'Stoppen' : 'Adem mee'}
              </button>
            </div>
            <p className="sr-only" aria-live="polite">{meeAdemen ? 'Adem in bij de eerste regel, adem uit bij de tweede; ongeveer vier seconden elk.' : ''}</p>

            <blockquote className="mx-auto mt-12 max-w-3xl text-center">
              <p className="font-display text-xl leading-relaxed text-ink-soft italic sm:text-2xl">“Het Jezusgebed is een bron van barmhartigheid, een licht in het hart en een weg naar de stilte van God.”</p>
              <footer className="mt-3 font-display text-lg text-ink-soft">— Heilige Silouan de Athoniet</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Het gebedssnoer: het Jezusgebed tellen per knoop */}
      <section className="orthodox-pattern parchment-pattern bg-parchment pb-16 text-ink sm:pb-24">
        <div className={CONTENT}>
          <Gebedssnoer />
        </div>
      </section>

      {infoTegels('md:hidden')}

      {/* Quote + Van adem naar etmaal */}
      <CycleTransition
        quote="De Heere Jezus is het midden van het gebed, het vasteland van de geest en het licht van de ziel."
        citation="Monastieke traditie"
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

