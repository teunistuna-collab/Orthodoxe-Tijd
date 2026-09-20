import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { JAAR_INFO } from '../lib/cyclusTeksten';
import { ringVak } from '../lib/ringVak';

type PeriodKey = 'kersttijd' | 'openbaringstijd' | 'vastentijd' | 'passietijd' | 'paschatijd' | 'pinkstertijd';
type InfoKey = 'wat' | 'jaarcyclus' | 'betekenis' | 'praktisch';

type PopupContent = {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  highlight?: string;
};

// Gedeelde tekst over voorfeest/feest/nafeest, van toepassing op de vaste grote feesten (bron: docx).
const VOORFEEST_NOOT =
  'De Kerk beleeft een groot feest vaak niet als één geïsoleerde dag. Belangrijke feesten kunnen liturgisch worden voorbereid door een voorfeest en vervolgens nog enige tijd worden voortgezet in een nafeest. Daardoor krijgt de gelovige tijd om het gevierde mysterie te ontvangen, te bezingen en opnieuw te overwegen.';

// Gedeelde notitie: deze periode behoort tot de beweeglijke Paschale cyclus, niet tot de vaste jaarcyclus (bron: docx).
const PASCHALE_NOOT =
  'Deze periode behoort tot de beweeglijke Paschale cyclus, waarvan de data verschuiven met de datum van het heilige Pascha — en dus niet tot de vaste jaarcyclus. Niet al deze perioden behoren uitsluitend tot de vaste jaarcyclus: de Grote Vasten en het begin van de Apostelvasten zijn afhankelijk van de Paschale cyclus.';

// Inhoud rechtstreeks gebaseerd op "De orthodoxe jaarcyclus.docx".
const PERIOD_POPUPS: Record<PeriodKey, PopupContent> = {
  kersttijd: {
    title: 'Kersttijd',
    subtitle: 'Vaste jaarcyclus',
    highlight: '8 september · 14 september · 21 november · 25 december',
    paragraphs: [
      '8 september — Geboorte van de Moeder Gods.',
      '14 september — Verheffing van het kostbare en levenschenkende Kruis.',
      '21 november — Intocht van de Moeder Gods in de Tempel.',
      '25 december — Geboorte van onze Heer Jezus Christus.',
      'De Orthodoxe Kerk kent vier grote vastenperioden: de Grote Vasten, de Apostelvasten, de vasten vóór de Geboorte van Christus en de vasten vóór de Ontslapenis van de Moeder Gods.',
      VOORFEEST_NOOT,
    ],
  },
  openbaringstijd: {
    title: 'Openbaringstijd',
    subtitle: 'Vaste jaarcyclus',
    highlight: '6 januari · 2 februari · 25 maart',
    paragraphs: [
      '6 januari — Theofanie: de Doop van de Heer.',
      '2 februari — Ontmoeting van de Heer in de Tempel.',
      '25 maart — Verkondiging aan de Moeder Gods.',
      VOORFEEST_NOOT,
    ],
  },
  vastentijd: {
    title: 'Vastentijd',
    subtitle: 'Paschale cyclus — beweeglijk',
    paragraphs: [
      'De Orthodoxe Kerk kent vier grote vastenperioden: de Grote Vasten, de Apostelvasten, de vasten vóór de Geboorte van Christus en de vasten vóór de Ontslapenis van de Moeder Gods. Daarnaast kent de Kerk vaste vastendagen en gewoonlijk de wekelijkse vasten op woensdag en vrijdag, met liturgische uitzonderingen en plaatselijke verschillen.',
      PASCHALE_NOOT,
    ],
  },
  passietijd: {
    title: 'Passietijd',
    subtitle: 'Paschale cyclus — beweeglijk',
    highlight: 'Palmzondag — Intocht van de Heer in Jeruzalem (beweeglijk)',
    paragraphs: [
      'Sommige van de Twaalf Grote Feesten behoren tot de vaste kalender, terwijl Palmzondag, Hemelvaart en Pinksteren door Pascha worden bepaald. Het heilige Pascha zelf staat boven deze twaalf als het Feest der feesten.',
      PASCHALE_NOOT,
    ],
  },
  paschatijd: {
    title: 'Paschatijd',
    subtitle: 'Paschale cyclus — beweeglijk',
    highlight: 'Hemelvaart van de Heer — beweeglijk',
    paragraphs: [
      'Het heilige Pascha zelf staat boven de Twaalf Grote Feesten als het Feest der feesten. De volledige, beweeglijke Paschacyclus — met onder meer de Grote Vasten, de Heilige Week en Hemelvaart — vind je op de Paschapagina.',
      PASCHALE_NOOT,
    ],
  },
  pinkstertijd: {
    title: 'Pinkstertijd',
    subtitle: 'Paschale cyclus — beweeglijk',
    highlight: 'Pinksteren — neerdaling van de Heilige Geest (beweeglijk)',
    paragraphs: [
      'Pinksteren, de neerdaling van de Heilige Geest, wordt door Pascha bepaald en behoort daarmee tot de beweeglijke Paschale cyclus.',
      PASCHALE_NOOT,
    ],
  },
};

const PERIODS: Array<{ key: PeriodKey; label: string; short: string; iconSrc: string; movable: boolean }> = [
  { key: 'kersttijd', label: 'Kersttijd', short: 'De komst van het Licht in de wereld', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-03-Kersttijd.webp', movable: false },
  { key: 'openbaringstijd', label: 'Openbaringstijd', short: 'Christus wordt geopenbaard aan alle volken', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-04-Openbaringstijd.webp', movable: false },
  { key: 'vastentijd', label: 'Vastentijd', short: 'Voorbereiding op het heilige Pascha', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-05-Vastentijd.webp', movable: true },
  { key: 'passietijd', label: 'Passietijd', short: 'Het lijden van de Heer', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-06-Passietijd.webp', movable: true },
  { key: 'paschatijd', label: 'Paschatijd', short: 'De Verrijzenis van Christus', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-07-Paschatijd.webp', movable: true },
  { key: 'pinkstertijd', label: 'Pinkstertijd', short: 'De gave van de Heilige Geest', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-08-Pinkstertijd.webp', movable: true },
];


const INFO_CARDS: Array<{ key: InfoKey; title: string; intro: string; iconSrc: string }> = [
  { key: 'wat', title: 'Wat is het kerkelijk jaar?', intro: 'Het kerkelijk jaar is de heilige tijd waarin de Kerk het leven van Christus herleeft, van Zijn Geboorte tot Zijn Verrijzenis.', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-01-Wat-is-het-kerkelijk-jaar.webp' },
  { key: 'jaarcyclus', title: 'De jaarcyclus', intro: 'Het kerkelijk jaar bestaat uit perioden, feesten en vasten die ons stap voor stap meenemen in het heilshandelen van God.', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-02-De-jaarcyclus.webp' },
  { key: 'betekenis', title: 'De betekenis in ons leven', intro: 'Het kerkelijk jaar vormt ons hart, richt onze blik op Christus en heiligt onze tijd, dagen en seizoenen.', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-07-Paschatijd.webp' },
  { key: 'praktisch', title: 'Praktisch', intro: 'Hoe kun je het kerkelijk jaar meeleven in je gebed, thuis, in de parochie en in het dagelijkse leven?', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-05-Vastentijd.webp' },
];

const TIMELINE_ITEMS = [
  { id: 'adem', label: 'ADEM', title: 'Christus in iedere\nademhaling', href: '#adem' },
  { id: 'etmaal', label: 'ETMAAL', title: 'Gebed door\ndag en nacht', href: '#etmaal' },
  { id: 'week', label: 'WEEK', title: 'Iedere dag\nzijn gedachtenis', href: '#week' },
  { id: 'pascha', label: 'PASCHA', title: 'De weg van Kruis\nnaar Verrijzenis', href: '#pascha' },
  { id: 'jaar', label: 'JAAR', title: 'Het gehele\nkerkelijke jaar geheiligd', href: '#jaar' },
];

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

// Zeer subtiel botanisch hoekornament ter decoratie van het perkamentpaneel.
function CornerOrnament({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 4 C 20 6, 30 16, 32 32" strokeLinecap="round" />
      <path d="M4 4 C 6 20, 16 30, 32 32" strokeLinecap="round" />
      <circle cx="32" cy="32" r="2.4" />
      <circle cx="14" cy="6" r="1.8" />
      <circle cx="6" cy="14" r="1.8" />
    </svg>
  );
}

const ring = ringVak(12);

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function Jaarcyclus() {
  const [periodOpen, setPeriodOpen] = useState<PeriodKey | null>(null);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <>
      <section id="jaar" className="bg-bark">
        <img loading="lazy" decoding="async" src="/images/heroes/hero-jaar.webp" width={2103} height={748} alt="Jaarcyclus — het kerkelijk jaar" className="block h-auto w-full" />
      </section>

      {/* Informatiekaarten */}
      <section className="orthodox-pattern parchment-pattern bg-parchment py-16 text-ink sm:py-20">
        <div className={CONTENT}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INFO_CARDS.map(({ key, title, intro, iconSrc }) => (
              <button
                key={key}
                type="button"
                onClick={() => setInfoOpen(key)}
                className="ornate-card group flex min-h-[240px] flex-col px-7 py-8 text-left"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold-light">
                  <img loading="lazy" decoding="async" src={iconSrc} alt="" className="provided-card-icon" />
                </div>
                <h3 className="font-display mt-6 text-[20px] font-semibold text-gold-light uppercase">{title}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#d9c6a3] sm:text-base">{intro}</p>
                <span className="btn-pill mt-6">
                  Lees meer →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* De cyclus van het kerkelijk jaar */}
      <section className="bg-parchment pb-16 sm:pb-20">
        <div className={CONTENT}>
          <div className="parchment-pattern relative overflow-hidden rounded-2xl border border-gold/40 bg-[#f8f1e3] px-6 py-14 shadow-[0_30px_70px_rgba(40,22,14,0.16)] sm:px-10 lg:px-16">
            <CornerOrnament className="absolute top-6 left-6 h-14 w-14 text-gold-deep/30" />
            <CornerOrnament className="absolute top-6 right-6 h-14 w-14 -scale-x-100 text-gold-deep/30" />
            <CornerOrnament className="absolute bottom-6 left-6 h-14 w-14 -scale-y-100 text-gold-deep/30" />
            <CornerOrnament className="absolute right-6 bottom-6 h-14 w-14 -scale-x-100 -scale-y-100 text-gold-deep/30" />

            <div className="text-center">
              <p className="font-display text-[26px] font-semibold tracking-[0.06em] text-ink uppercase sm:text-[30px]">De cyclus van het kerkelijk jaar</p>
              <p className="mt-2 text-[12px] font-bold tracking-[0.32em] text-gold-deep uppercase sm:text-sm">Eén verhaal, het gehele jaar</p>
            </div>

            {/* Desktop: cirkeldiagram */}
            <div className="relative mx-auto mt-12 hidden aspect-square w-full max-w-[650px] lg:block" style={ring.stijl}>
              <svg viewBox={ring.viewBox} className="absolute inset-0 h-full w-full">
                <circle cx="50" cy="50" r="30" fill="none" stroke="#c9a227" strokeWidth="0.35" opacity="0.75" />
                {PERIODS.map((period, index) => {
                  const angle = (360 / PERIODS.length) * index;
                  const c = polar(50, 50, 15, angle);
                  const p = polar(50, 50, 30, angle);
                  return (
                    <line
                      key={`spoke-${period.key}`}
                      x1={c.x}
                      y1={c.y}
                      x2={p.x}
                      y2={p.y}
                      stroke="#c9a227"
                      strokeWidth="0.25"
                      opacity={hovered === index ? 0.65 : 0.3}
                    />
                  );
                })}
              </svg>

              <div className="absolute top-1/2 left-1/2 flex h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-2 border-gold/60 shadow-[0_14px_36px_rgba(120,80,30,0.22)]">
                <img loading="lazy" decoding="async" src="/images/Christus-afbeelding.webp" alt="Christus" className="h-full w-full object-cover" />
              </div>

              {PERIODS.map((period, index) => {
                const angle = (360 / PERIODS.length) * index;
                const pos = polar(50, 50, 30, angle);
                const isActive = hovered === index;
                const leftSide = pos.x < 50;
                const iconSrc = period.iconSrc;

                return (
                  <button
                    key={period.key}
                    type="button"
                    onClick={() => setPeriodOpen(period.key)}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ left: `${pos.x}%`, top: ring.top(pos.y) }}
                    className={`etmaal-ring-node absolute ${leftSide ? 'is-left' : 'is-right'}`}
                  >
                    <span className="etmaal-ring-badge">
                      <span
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 bg-[#1c130d] text-gold-light transition-all ${
                          isActive ? 'scale-110 border-gold shadow-[0_0_0_5px_rgba(201,162,39,0.22),0_0_20px_rgba(201,162,39,0.35)]' : 'border-gold/50'
                        }`}
                      >
                        <img loading="lazy" decoding="async" src={iconSrc} alt="" className="provided-cycle-icon" />
                      </span>
                    </span>
                    <span className="etmaal-ring-text">
                      <span className="dienst-kaart">
                        <span className="dienst-kaart-titel font-display uppercase">{period.label}</span>
                        {period.movable && <span className="dienst-kaart-tijd">beweeglijk</span>}
                        <span className="dienst-kaart-tekst">{period.short}</span>
                        <span className="btn-pill dienst-kaart-cta">Lees meer →</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mx-auto mt-10 hidden max-w-lg text-center lg:block">
              <p className="font-display text-lg leading-snug text-ink-soft italic">“Hij maakt alle dingen nieuw.”</p>
              <p className="mt-1 text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">Openbaring 21:5</p>
            </div>

            {/* Tablet/mobiel: verticale tijdlijn */}
            <div className="mt-10 space-y-3 lg:hidden">
              {PERIODS.map((period) => {
                const iconSrc = period.iconSrc;
                return (
                  <button
                    key={`${period.key}-mobile`}
                    type="button"
                    onClick={() => setPeriodOpen(period.key)}
                    className="dienst-kaart dienst-kaart-rij group flex w-full items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                  >
                    <span className="dienst-kaart-medaillon flex shrink-0 items-center justify-center">
                      <img loading="lazy" decoding="async" src={iconSrc} alt="" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="dienst-kaart-titel font-display block uppercase">{period.label}</span>
                      {period.movable && <span className="dienst-kaart-tijd block">beweeglijk</span>}
                      <span className="dienst-kaart-tekst block">{period.short}</span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gold-deep" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Meer dan een kalender */}
      <CycleTransition
        quote="Hij maakt alle dingen nieuw."
        citation="Openbaring 21:5"
        eyebrow="Meer dan een kalender"
        text="Het kerkelijk jaar is niet slechts een opeenvolging van feesten, maar een levende weg waarin heel de geschiedenis wordt samengevat: van de schepping, door de menswording en het Kruis, naar de Verrijzenis en de toekomstige eeuwigheid."
        buttonLabel="Ontdek de paschacyclus"
        buttonHref="#pascha"
      />

      <TimeSanctificationTimeline current="jaar" />

      <LiturgicalPopup open={periodOpen !== null} onClose={() => setPeriodOpen(null)} content={periodOpen ? PERIOD_POPUPS[periodOpen] : null} />
      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? JAAR_INFO[infoOpen] : null} />
    </>
  );
}
