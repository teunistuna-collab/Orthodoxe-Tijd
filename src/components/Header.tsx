import { useEffect, useRef, useState } from 'react';
import { BookOpen, CalendarDays, ChevronDown, Clock3, Flame, HandHeart, Menu, Sparkles, Sun, Wheat, X } from 'lucide-react';
import Cross from './Cross';
import { useApp } from '../lib/context';
import { formatDag, kerkDatum, formatLang } from '../lib/kalender';

export const SECTIES = [
  { id: 'vandaag', label: 'Vandaag', icon: Sun },
  { id: 'kalender', label: 'Kalender', icon: CalendarDays },
  { id: 'gebeden', label: 'Gebeden', icon: HandHeart },
  { id: 'vasten', label: 'Vasten', icon: Wheat },
  { id: 'heiligen', label: 'Heiligen', icon: BookOpen },
  { id: 'pascha', label: 'Pascha', icon: Flame },
  { id: 'feesten', label: 'Feesten', icon: Sparkles },
];

// Vandaag/Kalender komen vóór de Cycli-dropdown, de rest (incl. Pascha) erna.
const NAV_LEADING = SECTIES.slice(0, 2);
const PASCHA_NAV = SECTIES.find((s) => s.id === 'pascha')!;
const NAV_TRAILING = SECTIES.slice(2).filter((s) => s.id !== 'pascha');


const NAV_MARKS: Record<string, string> = {
  vandaag: '☼', kalender: '✥', gebeden: '☦', vasten: '❧', heiligen: '✠', pascha: '☦', feesten: '✣', cycli: '◉',
};
const NavMark = ({ id }: { id: string }) => <span aria-hidden="true" className="orthodox-nav-mark">{NAV_MARKS[id] ?? '✣'}</span>;

const KALENDER_KEUZES = [
  { id: 'oud', naam: 'Oud', toelichting: 'juliaans' },
  { id: 'nieuw', naam: 'Nieuw', toelichting: 'burgerlijk' },
] as const;

const CYCLUS_ITEMS = [
  { id: 'adem', label: '☦ ADEM', description: 'Het Jezusgebed en korte gebeden', href: '#adem' },
  { id: 'etmaal', label: '◷ ETMAAL', description: 'De gebeden van dag en nacht', href: '#etmaal' },
  { id: 'week', label: '☼ WEEK', description: 'Van zondag tot zaterdag', href: '#week' },
  { id: 'jaar', label: '✣ JAAR', description: 'Het ritme van het kerkelijk jaar', href: '#jaar' },
];

export default function Header() {
  const { mode, setMode, vandaag } = useApp();
  const [actief, setActief] = useState('vandaag');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cyclusOpen, setCyclusOpen] = useState(false);
  const cyclusRef = useRef<HTMLDivElement | null>(null);
  const cyclusMobielRef = useRef<HTMLDivElement | null>(null);
  const cyclusSluitTimer = useRef<number | null>(null);

  // Het Cycli-menu sluit pas kort nadat de muis het verlaat en blijft open als je terugkeert.
  const annuleerSluiten = () => {
    if (cyclusSluitTimer.current !== null) {
      window.clearTimeout(cyclusSluitTimer.current);
      cyclusSluitTimer.current = null;
    }
  };
  const openCyclus = () => {
    annuleerSluiten();
    setCyclusOpen(true);
  };
  const planCyclusSluiten = () => {
    annuleerSluiten();
    cyclusSluitTimer.current = window.setTimeout(() => setCyclusOpen(false), 400);
  };

  useEffect(() => {
    const els = [...SECTIES, { id: 'adem', label: 'Adem', icon: Clock3 }, { id: 'etmaal', label: 'Etmaal', icon: Clock3 }, { id: 'week', label: 'Week', icon: Clock3 }, { id: 'jaar', label: 'Jaar', icon: Clock3 }]
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const zichtbaar = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (zichtbaar[0]) setActief(zichtbaar[0].target.id);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const doel = event.target as Node;
      // een tik op het (mobiele of desktop-)Cycli-menu zelf telt niet als "buiten"
      if (!cyclusRef.current?.contains(doel) && !cyclusMobielRef.current?.contains(doel)) {
        setCyclusOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCyclusOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const kerk = kerkDatum(vandaag, mode);
  const cyclusActief = ['adem', 'etmaal', 'week', 'jaar'].includes(actief);

  return (
    <header className="site-header sticky top-0 z-50 overflow-visible shadow-lg shadow-black/20">
      <div className="bg-bark text-cream">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-2.5">
          <a href="#vandaag" onClick={() => { setActief('vandaag'); setMenuOpen(false); }} className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex h-9 w-7 shrink-0 items-center justify-center text-gold sm:h-10 sm:w-8">
              <Cross className="h-8 w-5 sm:h-9 sm:w-6" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="font-display block truncate text-lg font-semibold tracking-wide text-gold-light sm:text-2xl">Orthodoxe Tijd</span>
              <span className="hidden text-[10px] font-semibold tracking-[0.22em] text-[#bfa982] uppercase sm:block">Een weg door de tijd · een leven met Christus</span>
            </span>
          </a>

          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <div className="text-sm font-semibold text-cream">{formatLang(vandaag)}</div>
              <div className="text-[11px] text-[#bfa982]">
                {mode === 'oud' ? `Kerkelijk: ${formatDag(kerk)} (juliaans)` : 'Nieuwe kalender (gereviseerd juliaans)'}
              </div>
            </div>
            <div className="flex shrink-0 rounded-full border border-gold/40 bg-bark-2 p-0.5" role="group" aria-label="Kalenderkeuze">
              {KALENDER_KEUZES.map(({ id, naam, toelichting }) => {
                const on = mode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setMode(id)}
                    className={`flex min-h-11 flex-col items-center justify-center rounded-full px-2.5 leading-none transition sm:px-4 ${on ? 'bg-gold text-bark' : 'text-gold-light hover:text-white'}`}
                  >
                    <span className="text-[13px] font-bold tracking-wider uppercase">{naam}</span>
                    <span className="mt-1 text-[11px] font-semibold opacity-80">{toelichting}</span>
                  </button>
                );
              })}
            </div>
          </div>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="rounded-full p-2 text-gold-light hover:bg-white/10 sm:hidden" aria-label={menuOpen ? 'Menu sluiten' : 'Menu openen'} aria-expanded={menuOpen}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
        </div>
      </div>

      <nav className={`${menuOpen ? 'block' : 'hidden'} relative z-[60] overflow-visible border-t border-gold/20 bg-bark-2 text-cream sm:block`}>
        <div className="mx-auto flex max-w-[1500px] flex-col gap-1 px-2 py-2 sm:flex-row sm:justify-evenly sm:overflow-visible sm:py-0">
          {NAV_LEADING.map(({ id, label, icon: Icon }) => {
            const on = actief === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => { setActief(id); setMenuOpen(false); }}
                className={`relative hidden shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold tracking-wider uppercase transition sm:flex sm:min-h-0 sm:px-4 ${
                  on ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'
                }`}
              >
                <NavMark id={id} />
                {label}
                <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`} />
              </a>
            );
          })}

          <div
            ref={cyclusRef}
            className="relative hidden sm:block"
            onMouseEnter={openCyclus}
            onMouseLeave={planCyclusSluiten}
          >
            <button
              type="button"
              onClick={openCyclus}
              className={`relative flex min-h-11 shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold tracking-wider uppercase transition sm:min-h-0 sm:px-4 ${
                cyclusActief ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'
              }`}
            >
              <NavMark id="cycli" />
              CYCLI
              <ChevronDown className={`h-3.5 w-3.5 transition ${cyclusOpen ? 'rotate-180' : ''}`} />
              <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold transition-opacity ${cyclusActief ? 'opacity-100' : 'opacity-0'}`} />
            </button>

            {cyclusOpen && (
              <div className="absolute left-0 top-full z-[200] pt-3">
                <div className="w-[320px] rounded-lg border border-[#c9a227]/55 bg-[#1b110d] p-2 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
                  {CYCLUS_ITEMS.map((item) => {
                    const itemActive = ['adem', 'etmaal', 'week', 'jaar'].includes(item.id) ? cyclusActief : false;
                    return (
                      <a
                        key={`${item.id}-${item.label}`}
                        href={item.href}
                        onClick={() => {
                          setActief(item.id);
                          annuleerSluiten();
                          setCyclusOpen(false);
                          setMenuOpen(false);
                        }}
                        className={`block rounded-md border px-3 py-2.5 transition ${itemActive ? 'border-[#c9a227]/60 bg-[#2a1d16]' : 'border-transparent hover:border-[#c9a227]/35 hover:bg-[#241813]'}`}
                      >
                        <div className="text-[11px] font-bold tracking-[0.18em] text-gold-light uppercase">{item.label}</div>
                        <p className="mt-1 text-[11px] leading-relaxed text-[#e9dcc0] opacity-90">{item.description}</p>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <a
            href="#pascha"
            onClick={() => { setActief('pascha'); setMenuOpen(false); }}
            className={`relative hidden shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold tracking-wider uppercase transition sm:flex ${actief === 'pascha' ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'}`}
          >
            <NavMark id="pascha" />Pascha
            <span className={`absolute inset-x-3 bottom-0 h-0.5 bg-gold ${actief === 'pascha' ? 'opacity-100' : 'opacity-0'}`} />
          </a>

          {NAV_TRAILING.map(({ id, label, icon: Icon }) => {
            const on = actief === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => { setActief(id); setMenuOpen(false); }}
                className={`relative hidden shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold tracking-wider uppercase transition sm:flex sm:min-h-0 sm:px-4 ${
                  on ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'
                }`}
              >
                <NavMark id={id} />
                {label}
                <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`} />
              </a>
            );
          })}

          {NAV_LEADING.map(({ id, label, icon: Icon }) => {
            const on = actief === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => { setActief(id); setMenuOpen(false); }}
                className={`relative flex min-h-11 shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold tracking-wider uppercase transition sm:hidden ${
                  on ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'
                }`}
              >
                <NavMark id={id} />
                {label}
                <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`} />
              </a>
            );
          })}

          <div className="sm:hidden" ref={cyclusMobielRef}>
            <button
              type="button"
              onClick={() => setCyclusOpen((open) => !open)}
              className={`relative flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[12px] font-bold tracking-wider uppercase transition ${cyclusActief ? 'text-gold-light' : 'text-[#bfa982]'}`}
            >
              <span className="flex items-center gap-1.5"><NavMark id="cycli" />CYCLI</span>
              <ChevronDown className={`h-3.5 w-3.5 transition ${cyclusOpen ? 'rotate-180' : ''}`} />
            </button>
            {cyclusOpen && (
              <div className="mt-1 space-y-1 rounded-lg border border-[#c9a227]/50 bg-[#1b110d] p-1.5">
                {CYCLUS_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      setActief(item.id);
                      setCyclusOpen(false);
                      setMenuOpen(false);
                    }}
                    className="block rounded-md border border-transparent px-3 py-2 hover:border-[#c9a227]/40 hover:bg-[#241813]"
                  >
                    <div className="text-[11px] font-bold tracking-[0.18em] text-gold-light uppercase">{item.label}</div>
                    <div className="mt-0.5 text-[10px] leading-relaxed text-[#e9dcc0] opacity-90">{item.description}</div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <a
            href="#pascha"
            onClick={() => { setActief('pascha'); setMenuOpen(false); }}
            className={`relative flex min-h-11 shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold tracking-wider uppercase transition sm:hidden ${actief === 'pascha' ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'}`}
          >
            <NavMark id="pascha" />Pascha
            <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold transition-opacity ${actief === 'pascha' ? 'opacity-100' : 'opacity-0'}`} />
          </a>

          {NAV_TRAILING.map(({ id, label, icon: Icon }) => {
            const on = actief === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => { setActief(id); setMenuOpen(false); }}
                className={`relative flex min-h-11 shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold tracking-wider uppercase transition sm:hidden ${
                  on ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'
                }`}
              >
                <NavMark id={id} />
                {label}
                <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`} />
              </a>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
