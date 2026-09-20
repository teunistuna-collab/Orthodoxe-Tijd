import { useEffect, useState } from 'react';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';

import Cross from './Cross';
import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { WEEK_INFO } from '../lib/cyclusTeksten';

type DayKey = 'zondag' | 'maandag' | 'dinsdag' | 'woensdag' | 'donderdag' | 'vrijdag' | 'zaterdag';
type InfoKey = 'wat' | 'dagen' | 'betekenis' | 'praktisch';

type PopupContent = {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  highlight?: string;
};

// Gedeelde slotnotitie over de Octoechos, toegevoegd aan iedere dag-popup (bron: "De orthodoxe weekcyclus.docx").
const OCTOECHOS_NOOT =
  'Door deze zevendaagse cyclus heen klinkt tevens de cyclus van de acht tonen (echoi) van de Octoechos: achtereenvolgens toon 1 tot en met toon 8, waarna de reeks opnieuw begint. Daardoor keert het thema van een dag terug, maar telkens binnen de eigen hymnografische kleur van de toon van die week.';

// Inhoud rechtstreeks gebaseerd op "De orthodoxe weekcyclus.docx".
const DAY_POPUPS: Record<DayKey, PopupContent> = {
  zondag: {
    title: 'Zondag',
    subtitle: 'De Verrijzenis van Christus',
    highlight: 'Verrijzenis · Pascha · Eucharistie · vreugde · overwinning op de dood',
    paragraphs: [
      'De eerste dag van de week is de Dag des Heren: de dag van de Verrijzenis. Iedere zondag draagt daarom het karakter van een klein Pascha. De Kerk verzamelt zich rond de verrezen Christus en verkondigt Zijn overwinning op zonde, dood en verderf. Liturgisch vangt de zondag reeds aan op zaterdagavond met de Vespers.',
      OCTOECHOS_NOOT,
    ],
  },
  maandag: {
    title: 'Maandag',
    subtitle: 'De heilige engelen en hemelse machten',
    highlight: 'Engelen · hemelse eredienst · gehoorzaamheid · waakzaamheid · lofprijzing',
    paragraphs: [
      'Na de Dag des Heren eert de Kerk op maandag de onlichamelijke machten: de engelen en aartsengelen die God zonder ophouden dienen en verheerlijken. Hun gehoorzaamheid, waakzaamheid en lofprijzing richten de gelovige op het hemelse leven en de onophoudelijke aanbidding van God.',
      OCTOECHOS_NOOT,
    ],
  },
  dinsdag: {
    title: 'Dinsdag',
    subtitle: 'De heilige Johannes de Voorloper',
    highlight: 'Johannes de Doper · profeten · bekering · voorbereiding · waakzaamheid',
    paragraphs: [
      'Dinsdag is in het bijzonder gewijd aan de heilige profeet, Voorloper en Doper Johannes. In hem klinkt de roep tot bekering en voorbereiding op de komst van Christus. Door de Voorloper worden tevens de profeten in herinnering gebracht, die van oudsher naar de komst van de Messias hebben gewezen.',
      OCTOECHOS_NOOT,
    ],
  },
  woensdag: {
    title: 'Woensdag',
    subtitle: 'Het verraad en het heilige Kruis',
    highlight: 'Verraad · Kruis · berouw · vasten · Moeder Gods',
    paragraphs: [
      'Op woensdag gedenkt de Kerk het verraad van de Heer door Judas en richt zij de blik op het heilige en levenschenkende Kruis. Daarom draagt deze dag een boetvaardig karakter en is woensdag, buiten de vastenvrije perioden en bijzondere liturgische uitzonderingen, een wekelijkse vastendag. In de hymnografie klinkt ook de voorbede van de allerheiligste Moeder Gods.',
      OCTOECHOS_NOOT,
    ],
  },
  donderdag: {
    title: 'Donderdag',
    subtitle: 'De heilige apostelen en de heilige Nicolaas',
    highlight: 'Apostelen · Evangelie · Kerk · herderschap · heilige Nicolaas',
    paragraphs: [
      'Donderdag is gewijd aan de heilige apostelen, die door Christus werden uitgezonden om het Evangelie aan de wereld te verkondigen. Ook de heilige Nicolaas, aartsbisschop van Myra, wordt op deze dag bijzonder herdacht. Zo krijgt de dag een apostolisch en herderlijk karakter: verkondiging, dienstbaarheid en zorg voor de Kerk.',
      OCTOECHOS_NOOT,
    ],
  },
  vrijdag: {
    title: 'Vrijdag',
    subtitle: 'De Kruisiging van onze Heer',
    highlight: 'Kruisiging · Golgotha · offer · berouw · vasten',
    paragraphs: [
      'Vrijdag staat geheel in het teken van het heilige en levenschenkende Kruis en het lijden en sterven van onze Heer Jezus Christus. De Kerk staat bij Golgotha en gedenkt het vrijwillige offer van Christus voor het leven en de verlossing van de wereld. Daarom is vrijdag, behoudens liturgische uitzonderingen, eveneens een wekelijkse vastendag.',
      OCTOECHOS_NOOT,
    ],
  },
  zaterdag: {
    title: 'Zaterdag',
    subtitle: 'De heiligen en de ontslapenen',
    highlight: 'Heiligen · martelaren · ontslapenen · rust · verwachting · verrijzenis',
    paragraphs: [
      'De zaterdag draagt het karakter van rust en verwachting. De Kerk gedenkt de heiligen, in het bijzonder de martelaren, en allen die in de hoop op de verrijzenis in de Heer zijn ontslapen. Zoals Christus op de sabbat lichamelijk in het graf rustte, zo ziet de Kerk de dood in het licht van de komende Verrijzenis. Met de Vespers van zaterdagavond opent zich opnieuw de zondag.',
      OCTOECHOS_NOOT,
    ],
  },
};

const DAYS: Array<{ key: DayKey; label: string; short: string; iconSrc: string }> = [
  { key: 'zondag', label: 'Zondag', short: 'De Verrijzenis van Christus', iconSrc: '/images/ui/menu/04-Week-04-Zondag.png' },
  { key: 'maandag', label: 'Maandag', short: 'De engelen en hemelse machten', iconSrc: '/images/ui/menu/04-Week-05-Maandag.png' },
  { key: 'dinsdag', label: 'Dinsdag', short: 'Johannes de Voorloper', iconSrc: '/images/ui/menu/04-Week-06-Dinsdag.png' },
  { key: 'woensdag', label: 'Woensdag', short: 'Het verraad en het heilig Kruis', iconSrc: '/images/ui/menu/04-Week-07-Woensdag.png' },
  { key: 'donderdag', label: 'Donderdag', short: 'De apostelen en H. Nicolaas', iconSrc: '/images/ui/menu/04-Week-08-Donderdag.png' },
  { key: 'vrijdag', label: 'Vrijdag', short: 'De Kruisiging van de Heer', iconSrc: '/images/ui/menu/04-Week-09-Vrijdag.png' },
  { key: 'zaterdag', label: 'Zaterdag', short: 'De heiligen en ontslapenen', iconSrc: '/images/ui/menu/04-Week-10-Zaterdag.png' },
];


const INFO_CARDS: Array<{ key: InfoKey; title: string; intro: string; iconSrc: string }> = [
  { key: 'wat', title: 'Wat is de weekcyclus?', intro: 'De week is de ademhaling van het kerkelijk leven, geworteld in de Verrijzenis van Christus.', iconSrc: '/images/ui/menu/04-Week-01-Wat-is-de-weekcyclus.png' },
  { key: 'dagen', title: 'De dagen van de week', intro: 'Elke dag van de week heeft een eigen liturgisch karakter, lezingen en gedenkingen.', iconSrc: '/images/ui/menu/04-Week-02-De-dagen-van-de-week.png' },
  { key: 'betekenis', title: 'De geestelijke betekenis', intro: 'De week vormt ons in het leven met Christus: van Verrijzenis tot verwachting.', iconSrc: '/images/ui/menu/04-Week-03-De-geestelijke-betekenis.png' },
  { key: 'praktisch', title: 'Praktisch', intro: 'Hoe kun je de weekcyclus meeleven in je gebed, thuis en in de parochie?', iconSrc: '/images/ui/menu/04-Week-03-De-geestelijke-betekenis.png' },
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

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function Weekcyclus() {
  const [dayOpen, setDayOpen] = useState<DayKey | null>(null);

  // Vandaag kan een pop-up van deze pagina openen.
  useEffect(() => {
    const opPopup = (event: Event) => {
      const { pagina, sleutel } = (event as CustomEvent<OpenPopupDetail>).detail;
      if (pagina === 'week') setDayOpen(sleutel as DayKey);
    };
    window.addEventListener(OPEN_POPUP_EVENT, opPopup);
    return () => window.removeEventListener(OPEN_POPUP_EVENT, opPopup);
  }, []);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <>
      <section id="week" className="bg-bark">
        <img src="/images/heroes/hero-week.png" width={2103} height={748} alt="Weekcyclus — van de Verrijzenis tot de Sabbat" className="block h-auto w-full" />
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
                  <img src={iconSrc} alt="" className="provided-card-icon" />
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

      {/* De dagen van de week */}
      <section className="bg-parchment pb-16 sm:pb-20">
        <div className={CONTENT}>
          <div className="parchment-pattern relative overflow-hidden rounded-2xl border border-gold/40 bg-[#f8f1e3] px-6 py-14 shadow-[0_30px_70px_rgba(40,22,14,0.16)] sm:px-10 lg:px-16">
            <CornerOrnament className="absolute top-6 left-6 h-14 w-14 text-gold-deep/30" />
            <CornerOrnament className="absolute top-6 right-6 h-14 w-14 -scale-x-100 text-gold-deep/30" />
            <CornerOrnament className="absolute bottom-6 left-6 h-14 w-14 -scale-y-100 text-gold-deep/30" />
            <CornerOrnament className="absolute right-6 bottom-6 h-14 w-14 -scale-x-100 -scale-y-100 text-gold-deep/30" />

            <div className="text-center">
              <p className="font-display text-[26px] font-semibold tracking-[0.06em] text-ink uppercase sm:text-[30px]">De dagen van de week</p>
              <p className="mt-2 text-[12px] font-bold tracking-[0.32em] text-gold-deep uppercase sm:text-sm">Een weg met Christus</p>
            </div>

            {/* Desktop: cirkeldiagram */}
            <div className="relative mx-auto mt-12 hidden aspect-square w-full max-w-[820px] lg:block">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                <circle cx="50" cy="50" r="30" fill="none" stroke="#c9a227" strokeWidth="0.35" opacity="0.75" />
                {DAYS.map((day, index) => {
                  const angle = (360 / DAYS.length) * index;
                  const c = polar(50, 50, 15, angle);
                  const p = polar(50, 50, 30, angle);
                  return (
                    <line
                      key={`spoke-${day.key}`}
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

              <div className="absolute top-1/2 left-1/2 flex h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-2 border-gold/60 shadow-[0_14px_36px_rgba(120,80,30,0.22)]">
                <img src="/images/Christus-afbeelding.png" alt="Christus" className="h-full w-full object-cover" />
              </div>

              {DAYS.map((day, index) => {
                const angle = (360 / DAYS.length) * index;
                const pos = polar(50, 50, 30, angle);
                const isActive = hovered === index;
                const leftSide = pos.x < 50;
                const iconSrc = day.iconSrc;

                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => setDayOpen(day.key)}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(${leftSide ? 'calc(-100% + 28px)' : '-28px'}, -50%)` }}
                    className={`absolute flex w-[220px] items-center gap-3 ${leftSide ? 'flex-row-reverse' : ''}`}
                  >
                    <span
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 bg-[#1c130d] text-gold-light transition-all ${
                        isActive ? 'scale-110 border-gold shadow-[0_0_0_5px_rgba(201,162,39,0.22),0_0_20px_rgba(201,162,39,0.35)]' : 'border-gold/50'
                      }`}
                    >
                      <img src={iconSrc} alt="" className="provided-cycle-icon" />
                    </span>
                    <span className={`min-w-0 ${leftSide ? 'text-right' : 'text-left'}`}>
                      <span className="font-display block text-base font-semibold text-ink uppercase">{day.label}</span>
                      <span className="mt-1 block text-[12px] leading-snug text-ink-soft">{day.short}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mx-auto mt-10 hidden max-w-lg text-center lg:block">
              <p className="font-display text-lg leading-snug text-ink-soft italic">“Dit is de dag die de Heer gemaakt heeft; laat ons juichen en ons verheugen.”</p>
              <p className="mt-1 text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">Psalm 118:24</p>
            </div>

            {/* Tablet/mobiel: verticale tijdlijn */}
            <div className="mt-10 space-y-3 lg:hidden">
              {DAYS.map((day, index) => {
                const iconSrc = day.iconSrc;
                return (
                  <button
                    key={`${day.key}-mobile`}
                    type="button"
                    onClick={() => setDayOpen(day.key)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-parchment-3 bg-paper px-4 py-4 text-left transition-all hover:border-gold"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-[#1c130d] text-gold-light">
                      <img src={iconSrc} alt="" className="provided-cycle-icon" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-display block text-xl font-semibold text-ink uppercase">
                        {index + 1}. {day.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-soft">{day.short}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Meer dan een kalender */}
      <CycleTransition
        quote="Dit is de dag die de Heer gemaakt heeft; laat ons juichen en ons verheugen."
        citation="Psalm 118:24"
        eyebrow="Meer dan een kalender"
        text="De orthodoxe week is geen loutere opeenvolging van dagen. Zij begint in de vreugde van de Verrijzenis, voert de gelovige langs de hemelse machten, de Voorloper, het Kruis, de apostolische verkondiging en de gedachtenis van hen die in Christus ontslapen zijn, en opent zich vervolgens opnieuw naar de Dag des Heren. Zo wordt de tijd zelf opgenomen in het gebed van de Kerk."
        buttonLabel="Ontdek de jaarcyclus"
        buttonHref="#jaar"
      />

      <TimeSanctificationTimeline current="week" />

      <LiturgicalPopup open={dayOpen !== null} onClose={() => setDayOpen(null)} content={dayOpen ? DAY_POPUPS[dayOpen] : null} />
      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? WEEK_INFO[infoOpen] : null} />
    </>
  );
}
