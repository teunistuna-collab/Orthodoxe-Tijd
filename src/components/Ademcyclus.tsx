import { useState } from 'react';
import Modal from './Modal';
import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { ADEM_POPUPS } from '../lib/cyclusTeksten';

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

const TIMELINE_ITEMS = [
  { id: 'adem', label: 'ADEM', title: 'Christus in iedere\nademhaling', href: '#adem' },
  { id: 'etmaal', label: 'ETMAAL', title: 'Gebed door\ndag en nacht', href: '#etmaal' },
  { id: 'week', label: 'WEEK', title: 'Iedere dag\nzijn gedachtenis', href: '#week' },
  { id: 'pascha', label: 'PASCHA', title: 'De weg van Kruis\nnaar Verrijzenis', href: '#pascha' },
  { id: 'jaar', label: 'JAAR', title: 'Het gehele\nkerkelijke jaar geheiligd', href: '#jaar' },
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

  return (
    <>
      <section id="adem" className="bg-bark">
        <img loading="lazy" decoding="async" src="/images/heroes/hero-adem.webp" width={2103} height={748} alt="Ademcyclus — het onophoudelijke gebed" className="block h-auto w-full" />
      </section>

      {/* Het Jezusgebed */}
      <section className="orthodox-pattern parchment-pattern bg-parchment py-16 text-ink sm:py-24">
        <div className={CONTENT}>
          <div className="mx-auto w-full max-w-none rounded-2xl border border-gold/45 bg-[#f8f1e3] px-6 py-12 shadow-[0_30px_70px_rgba(40,22,14,0.16)] sm:px-12 sm:py-16 lg:px-16">
            <p className="text-center text-[13px] font-bold tracking-[0.34em] text-gold-deep uppercase sm:text-sm">Het Jezusgebed</p>
            <OrnamentRule className="mt-4 w-48" />

            {/* Christus-icoon met ringen en de twee korte gebeden ernaast */}
            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <div className="col-span-2 flex justify-center lg:order-2 lg:col-span-1">
                <div className="relative m-9 h-[200px] w-[200px] sm:m-[60px] sm:h-[230px] sm:w-[230px]">
                  <div className="absolute -inset-3.5 rounded-full border border-gold/45 sm:-inset-5" />
                  <div className="absolute -inset-7 rounded-full border border-gold/30 sm:-inset-10" />
                  <div className="absolute -inset-9 rounded-full border border-dotted border-gold/40 sm:-inset-[60px]">
                    {['top-0 left-1/2 -translate-x-1/2 -translate-y-1/2', 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2', 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2', 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2'].map((plek) => (
                      <span key={plek} aria-hidden="true" className={`absolute ${plek} flex h-6 w-6 items-center justify-center rounded-full bg-[#f8f1e3] text-[17px] leading-none text-gold-deep`}>✣</span>
                    ))}
                  </div>
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-gold/60 shadow-[0_14px_36px_rgba(120,80,30,0.22)]">
                    <img loading="lazy" decoding="async" src="/images/Christus-afbeelding.webp" alt="Christus" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="text-center lg:order-1">
                <div className="flex min-h-[6.5rem] items-end justify-center sm:min-h-[7.5rem]"><p className="font-display text-2xl italic leading-snug text-ink-soft sm:text-[26px] lg:text-[22px] xl:text-[28px]">Heer Jezus Christus,<br />Zoon van God.</p></div>
                <OrnamentRule className="mt-4 w-32" />
                <p className="mt-4 text-[12px] font-bold tracking-[0.3em] text-gold-deep uppercase sm:text-[13px]">Inademen</p>
              </div>
              <div className="text-center lg:order-3">
                <div className="flex min-h-[6.5rem] items-end justify-center sm:min-h-[7.5rem]"><p className="font-display text-2xl italic leading-snug text-ink-soft sm:text-[26px] lg:text-[22px] xl:text-[28px]">ontferm U over mij,<br />zondaar.</p></div>
                <OrnamentRule className="mt-4 w-32" />
                <p className="mt-4 text-[12px] font-bold tracking-[0.3em] text-gold-deep uppercase sm:text-[13px]">Uitademen</p>
              </div>
            </div>

            <blockquote className="mx-auto mt-12 max-w-3xl text-center">
              <p className="font-display text-xl leading-relaxed text-ink-soft italic sm:text-2xl">“Het Jezusgebed is een bron van barmhartigheid, een licht in het hart en een weg naar de stilte van God.”</p>
              <footer className="mt-3 font-display text-lg text-ink-soft">— Heilige Silouan de Athoniet</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Vier informatiekaarten */}
      <section className="bg-parchment pb-16 sm:pb-24">
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
                <h3 className="font-display mt-6 text-[20px] font-semibold text-gold-light">{title}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#d9c6a3] sm:text-base">{intro}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Een levend ritme */}
      <section className="border-y border-gold/25 bg-[#f3eada] py-8 sm:py-10">
        <div className={CONTENT}>
          <div className="parchment-pattern relative overflow-hidden rounded-lg border border-gold/50 bg-[#f8f1e3] px-6 py-8 shadow-[0_24px_55px_rgba(40,22,14,0.12)] sm:px-10 sm:py-9 lg:px-16">
            {/* Dun kader met een kruisje in elke hoek */}
            <div className="pointer-events-none absolute inset-2.5 border border-gold/45 sm:inset-3.5" aria-hidden="true">
              <span className="absolute -top-2.5 -left-2.5 flex h-5 w-5 items-center justify-center bg-[#f8f1e3] text-[15px] leading-none text-gold-deep">✣</span>
              <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center bg-[#f8f1e3] text-[15px] leading-none text-gold-deep">✣</span>
              <span className="absolute -bottom-2.5 -left-2.5 flex h-5 w-5 items-center justify-center bg-[#f8f1e3] text-[15px] leading-none text-gold-deep">✣</span>
              <span className="absolute -right-2.5 -bottom-2.5 flex h-5 w-5 items-center justify-center bg-[#f8f1e3] text-[15px] leading-none text-gold-deep">✣</span>
            </div>

            <div className="relative text-center">
              <p className="text-[13px] font-bold tracking-[0.4em] text-ink-soft uppercase sm:text-sm">Een levend ritme</p>
              <OrnamentRule className="mt-3 w-[22rem] max-w-full" />
              <p className="mx-auto mt-5 max-w-4xl font-display text-xl leading-[1.5] text-ink italic sm:text-[26px]">
                De ademcyclus is geen afzonderlijke liturgische cyclus van de Kerk, maar het kleinste ritme van het gebedsleven: de voortdurende gedachtenis aan Christus, die zich met iedere ademhaling kan verbinden.
              </p>
              <OrnamentRule className="mt-5 w-60 max-w-full" />
              <p className="mt-4 text-[12px] font-semibold tracking-[0.4em] text-ink-soft uppercase sm:text-[13px]">Bid · Adem · Leef</p>
            </div>
          </div>
        </div>
      </section>

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

