import type { ReactNode } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Modal from './Modal';

type CycleCard = {
  title: string;
  intro: string;
  body: string;
  meta?: string;
};

type CyclePageProps = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  quote: string;
  citation: string;
  body?: string;
};

export function GoldDivider() {
  return <div className="gold-rule my-8" />;
}

// Gedeeld donker overgangsblok (citaat links, tekst + knop rechts) voor alle cycluspagina's.
export function CycleTransition({
  quote,
  citation,
  eyebrow,
  text,
  buttonLabel,
  buttonHref,
}: {
  quote: string;
  citation: string;
  eyebrow: string;
  text: string;
  buttonLabel: string;
  buttonHref: string;
}) {
  return (
    <section className="orthodox-pattern box-border w-full overflow-hidden bg-bark text-cream">
      <div className="mx-auto box-border w-full max-w-[1500px] px-5 py-8 min-[900px]:px-16 min-[900px]:py-12">
        <div className="grid min-w-0 gap-8 min-[900px]:grid-cols-[35%_65%] min-[900px]:items-center min-[900px]:gap-14">
          <div className="min-w-0 border-l border-gold/50 pl-6 min-[900px]:pl-8">
            <blockquote className="font-display text-xl leading-relaxed break-words text-gold-light italic sm:text-2xl min-[900px]:text-[26px]">
              “{quote}”
            </blockquote>
            <cite className="mt-4 block text-[11px] font-bold tracking-[0.2em] text-[#e8dcc0] uppercase not-italic sm:text-xs">{citation}</cite>
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs font-bold tracking-[0.28em] text-gold-light uppercase sm:text-sm">{eyebrow}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed break-words text-[#d9c6a3] min-[900px]:text-lg">{text}</p>
            <a
              href={buttonHref}
              className="btn-pill mt-6"
            >
              {buttonLabel} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8 text-center">
      <p className="text-[10px] font-bold tracking-[0.32em] text-gold-deep uppercase">{eyebrow}</p>
      <h2 className="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-ink-soft">{subtitle}</p>}
    </div>
  );
}

export function ParchmentSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`parchment-pattern bg-parchment py-16 text-ink sm:py-20 ${className}`}>{children}</section>;
}

export function DarkSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`bg-bark text-cream ${className}`}>{children}</section>;
}

export function QuoteSection({ quote, citation }: { quote: string; citation: string }) {
  return (
    <div className="rounded-2xl border border-[#d4aa3d]/50 bg-[#f7f0df] p-6 text-center shadow-[0_18px_40px_rgba(40,22,14,0.08)] sm:p-8">
      <blockquote className="font-display text-2xl italic leading-relaxed text-ink sm:text-3xl">“{quote}”</blockquote>
      <cite className="mt-3 block text-[10px] font-bold tracking-[0.24em] text-gold-deep uppercase not-italic">{citation}</cite>
    </div>
  );
}

export function ReadMoreButton({ onClick, label = 'Lees meer' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm font-bold text-gold-deep underline-offset-4 transition hover:text-gold hover:underline"
    >
      {label} <ArrowRight className="h-4 w-4" />
    </button>
  );
}

export function CycleHero({ id, eyebrow, title, intro, quote, citation, body }: CyclePageProps) {
  return (
    <section id={id} className="relative overflow-hidden bg-bark text-cream">
      <div className="absolute inset-0 opacity-25 orthodox-pattern" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[10px] font-bold tracking-[0.32em] text-gold-light uppercase">{eyebrow}</p>
            <h1 className="font-display mt-4 text-5xl font-semibold leading-none text-gold-light sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#e7d9bc]">{intro}</p>
            {body && <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#d9c6a3]">{body}</p>}
          </div>
          <div className="rounded-[26px] border border-[#c9a227]/50 bg-[#1b120d]/80 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="font-display text-4xl italic leading-tight text-gold-light">“{quote}”</div>
            <div className="mt-4 text-[10px] font-bold tracking-[0.28em] text-[#f0d78b] uppercase">{citation}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LiturgicalCard({ title, intro, body, meta, onReadMore }: CycleCard & { onReadMore?: () => void }) {
  return (
    <article className="group rounded-2xl border border-[#d4aa3d]/35 bg-[#f8f1e3] p-5 shadow-[0_14px_26px_rgba(39,24,15,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_18px_34px_rgba(39,24,15,0.12)] sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d4aa3d]/50 bg-[#f6ebc6] text-gold-deep">
          <Sparkles className="h-4 w-4" />
        </div>
        {meta && <span className="text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">{meta}</span>}
      </div>
      <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{intro}</p>
      {body && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{body}</p>}
      {onReadMore && (
        <div className="mt-5">
          <ReadMoreButton onClick={onReadMore} />
        </div>
      )}
    </article>
  );
}

type PopupContent = {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  highlight?: string;
};

export function LiturgicalPopup({ open, onClose, content }: { open: boolean; onClose: () => void; content: PopupContent | null }) {
  if (!open || !content) return null;

  return (
    <Modal open={open} onClose={onClose} eyebrow="Lees meer" title={content.title} centerTitle maxWidth="max-w-3xl">
      <div className="exact-popup-reading">
        {content.subtitle && <p className="exact-popup-subtitle">{content.subtitle}</p>}
        {content.highlight && <blockquote className="exact-popup-highlight">{content.highlight}</blockquote>}
        <div className="exact-popup-prose">
          {content.paragraphs.map((paragraph, index) => (
            <p key={`${content.title}-${index}`}>{paragraph}</p>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export function CycleNavigation({ current, items }: { current: string; items: Array<{ id: string; label: string; title: string; href: string }> }) {
  return (
    <div className="mt-10 flex flex-wrap justify-center gap-3">
      {items.map((item) => {
        const active = item.id === current;
        return (
          <a
            key={item.id}
            href={item.href}
            className={`rounded-full border px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase transition ${
              active ? 'border-gold bg-gold text-bark' : 'border-[#d4aa3d]/50 bg-[#f8f1e3] text-gold-deep hover:border-gold hover:text-gold-deep'
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </div>
  );
}

const DEFAULT_TIMELINE_ITEMS = [
  { id: 'adem', label: 'ADEM', title: 'Christus in iedere ademhaling', href: '#adem' },
  { id: 'etmaal', label: 'ETMAAL', title: 'Gebed door dag en nacht', href: '#etmaal' },
  { id: 'week', label: 'WEEK', title: 'Iedere dag zijn gedachtenis', href: '#week' },
  { id: 'pascha', label: 'PASCHA', title: 'De weg van Kruis naar Verrijzenis', href: '#pascha' },
  { id: 'jaar', label: 'JAAR', title: 'Het gehele kerkelijke jaar geheiligd', href: '#jaar' },
];


export function TimeSanctificationTimeline({ current }: { current: string }) {
  const items = [
    { id: 'adem', label: 'ADEM', title: 'Christus in iedere ademhaling', href: '#adem', image: '/images/ui/medaillons/Adem.png' },
    { id: 'etmaal', label: 'ETMAAL', title: 'Gebed door dag en nacht', href: '#etmaal', image: '/images/ui/medaillons/Etmaal.png' },
    { id: 'week', label: 'WEEK', title: 'Iedere dag zijn gedachtenis', href: '#week', image: '/images/ui/medaillons/Week.png' },
    { id: 'pascha', label: 'PASCHA', title: 'De weg van Kruis naar Verrijzenis', href: '#pascha', image: '/images/ui/medaillons/Pascha.png' },
    { id: 'jaar', label: 'JAAR', title: 'Het gehele kerkelijke jaar geheiligd', href: '#jaar', image: '/images/ui/medaillons/Jaar.png' },
  ];
  return <section className="v15-cycle-timeline"><p className="mb-6 text-center text-[10px] font-bold tracking-[.3em] text-gold-light uppercase">De heiliging van de tijd</p><div className="timeline-track">{items.map((item,index)=><div className="timeline-node" key={item.id}><a href={item.href} className={`timeline-core ${item.id===current?'active':''}`}><span className="timeline-medallion"><img src={item.image} alt="" className="h-full w-full object-contain" /></span><span className="timeline-label">{item.label}</span><span className="timeline-title">{item.title}</span></a>{index<items.length-1&&<span className="timeline-line"/>}</div>)}</div></section>;
}
export function BottomCycleTimeline({
  current,
  items = DEFAULT_TIMELINE_ITEMS,
}: {
  current: string;
  items?: Array<{ id: string; label: string; title: string; href: string }>;
}) {
  return (
    <section className="bg-bark px-4 py-10 text-cream sm:px-6 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] text-gold-light uppercase">De heiliging van de tijd</p>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 sm:justify-center">
          {items.map((item) => {
            const active = item.id === current;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`flex min-w-[150px] flex-1 flex-col items-center justify-center rounded-2xl border px-4 py-4 text-center transition ${
                  active
                    ? 'border-gold bg-[#2a1c15] shadow-[0_0_0_1px_rgba(201,162,39,0.55)]'
                    : 'border-[#d4aa3d]/35 bg-[#1f150f] hover:border-[#d4aa3d]/60'
                }`}
              >
                <img src={`/images/ui/medaillons/${item.label.charAt(0) + item.label.slice(1).toLowerCase()}.png`} alt="" className="h-16 w-16 object-contain" />
                <div className="mt-3 text-[10px] font-bold tracking-[0.24em] text-gold-light uppercase">{item.label}</div>
                <div className="mt-2 text-xs leading-relaxed text-[#e8dcc0]">{item.title}</div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CyclePageLayout({ id, eyebrow, title, intro, quote, citation, body, children }: CyclePageProps & { children: ReactNode }) {
  const navItems = [
    { id: 'adem', label: 'ADEM', title: 'Het Jezusgebed', href: '#adem' },
    { id: 'etmaal', label: 'ETMAAL', title: 'De gebeden van dag en nacht', href: '#etmaal' },
    { id: 'week', label: 'WEEK', title: 'Van zondag tot zaterdag', href: '#week' },
    { id: 'jaar', label: 'JAAR', title: 'Het ritme van het kerkelijk jaar', href: '#jaar' },
  ];

  return (
    <>
      <CycleHero id={id} eyebrow={eyebrow} title={title} intro={intro} quote={quote} citation={citation} body={body} />
      <div className="bg-[#f8f0df]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <CycleNavigation current={id} items={navItems} />
        </div>
      </div>
      {children}
      <BottomCycleTimeline current={id} />
    </>
  );
}
