import { useEffect, useRef, useState } from 'react';
import { BookOpen, CalendarDays, ChevronDown, Flame, HandHeart, Menu, Sparkles, Sun, Wheat, X } from 'lucide-react';
import { useApp } from '../lib/context';

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

// Aangeleverde afbeeldingen voor de navigatiebalk: de sierlijst als achtergrond, het kruis in het midden.
const HEADER_ACHTERGROND = '/images/ui/nav/header-achtergrond.webp';
const KRUIS_MEDAILLON = '/images/ui/nav/header-kruis.webp';

// Dunne verticale gouden scheidingslijn, zoals in de referentie tussen logo/navigatie en navigatie/kalenderkeuze.
function VerticalRule() {
  return <span className="hidden h-8 w-px shrink-0 bg-gold/30 lg:block" aria-hidden="true" />;
}

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

// Er staat één pagina tegelijk in beeld (App.tsx); de actieve link volgt die pagina.
export default function Header({ pagina: actief }: { pagina: string }) {
  const { mode, setMode } = useApp();
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

  const cyclusActief = ['adem', 'etmaal', 'week', 'jaar'].includes(actief);

  return (
    <header className="site-header sticky top-0 z-50 overflow-visible">
      {/* Eén donkere balk: logo, navigatie met centraal kruis-medaillon, en kalenderkeuze — allemaal in dezelfde rij.
          De sierlijst-achtergrond wordt volledig uitgerekt (breedte én hoogte) zodat de hoekornamenten altijd zichtbaar blijven. */}
      <div
        className="relative bg-bark bg-no-repeat text-cream"
        style={{ backgroundImage: `url(${HEADER_ACHTERGROND})`, backgroundSize: '100% 100%' }}
      >

        <div className="relative mx-auto flex max-w-[1600px] min-h-[76px] items-center gap-2 px-3 py-2 sm:gap-2 sm:px-4 sm:py-2 xl:min-h-[92px] xl:gap-3 xl:px-6">
          <a href="#vandaag" onClick={() => { setMenuOpen(false); }} className="flex min-w-0 shrink-0 items-center">
            <span className="min-w-0 leading-tight">
              <span className="font-display block truncate text-lg font-semibold tracking-wide text-gold-light lg:text-xl xl:text-2xl">Orthodoxe Tijd</span>
              <span className="hidden text-[8px] font-semibold tracking-[0.18em] text-[#bfa982] uppercase xl:block">Een weg door de tijd · een leven met Christus</span>
            </span>
          </a>

          <VerticalRule />

          {/* Desktop-navigatie: alleen tekstlabels, met het kruis-medaillon als middelpunt */}
          <div className="relative hidden flex-1 items-center justify-evenly gap-0.5 sm:flex xl:gap-1">
            {NAV_LEADING.map(({ id, label }) => {
              const on = actief === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => { setMenuOpen(false); }}
                  className={`relative flex shrink-0 items-center px-0.5 py-2 text-center xl:px-2 transition ${
                    on ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'
                  }`}
                >
                  <span className="text-[11px] font-bold tracking-wider uppercase leading-none">{label}</span>
                  <span className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-gold transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`} />
                </a>
              );
            })}

            <div
              ref={cyclusRef}
              className="relative shrink-0"
              onMouseEnter={openCyclus}
              onMouseLeave={planCyclusSluiten}
            >
              <button
                type="button"
                onClick={openCyclus}
                className={`relative flex items-center gap-0.5 px-0.5 py-2 text-center xl:px-2 transition ${
                  cyclusActief ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'
                }`}
              >
                <span className="text-[11px] font-bold tracking-wider uppercase leading-none">CYCLI</span>
                <ChevronDown className={`h-3 w-3 transition ${cyclusOpen ? 'rotate-180' : ''}`} />
                <span className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-gold transition-opacity ${cyclusActief ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              {cyclusOpen && (
                <div className="absolute left-1/2 top-full z-[200] -translate-x-1/2 pt-3">
                  <div className="w-[320px] rounded-lg border border-[#c9a227]/55 bg-[#1b110d] p-2 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
                    {CYCLUS_ITEMS.map((item) => {
                      const itemActive = actief === item.id;
                      return (
                        <a
                          key={`${item.id}-${item.label}`}
                          href={item.href}
                          onClick={() => {
                            annuleerSluiten();
                            setCyclusOpen(false);
                            setMenuOpen(false);
                          }}
                          className={`block rounded-md border px-3 py-2.5 transition ${itemActive ? 'border-[#c9a227]/60 bg-[#2a1d16]' : 'border-transparent hover:border-[#c9a227]/35 hover:bg-[#241813]'}`}
                        >
                          <div className="ot-label ot-label-licht">{item.label}</div>
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
              onClick={() => { setMenuOpen(false); }}
              className={`relative flex shrink-0 items-center px-0.5 py-2 text-center xl:px-2 transition ${actief === 'pascha' ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'}`}
            >
              <span className="text-[11px] font-bold tracking-wider uppercase leading-none">Pascha</span>
              <span className={`absolute inset-x-2 bottom-0 h-0.5 bg-gold ${actief === 'pascha' ? 'opacity-100' : 'opacity-0'}`} />
            </a>

            {/* Ruimte voor het kruis-medaillon, dat er los overheen zweeft */}
            <span className="w-16 shrink-0 md:w-20 xl:w-24" aria-hidden="true" />

            {NAV_TRAILING.map(({ id, label }) => {
              const on = actief === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => { setMenuOpen(false); }}
                  className={`relative flex shrink-0 items-center px-0.5 py-2 text-center xl:px-2 transition ${
                    on ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'
                  }`}
                >
                  <span className="text-[11px] font-bold tracking-wider uppercase leading-none">{label}</span>
                  <span className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-gold transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`} />
                </a>
              );
            })}

            {/* Het kruis-medaillon: los boven de balk, precies in het midden van de navigatie */}
            <a
              href="#pascha"
              onClick={() => { setMenuOpen(false); }}
              aria-label="Naar Pascha"
              className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
            >
              <img
                src={KRUIS_MEDAILLON}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-16 w-16 rounded-full shadow-[0_10px_22px_rgba(0,0,0,0.5)] transition hover:scale-105 xl:h-[72px] xl:w-[72px]"
              />
            </a>
          </div>

          <VerticalRule />

          <div className="hidden shrink-0 items-center gap-0.5 rounded-full border border-gold/40 bg-bark-2 p-0.5 sm:flex" role="group" aria-label="Kalenderkeuze">
            {KALENDER_KEUZES.map(({ id, naam, toelichting }) => {
              const on = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  title={`${naam} · ${toelichting}`}
                  onClick={() => setMode(id)}
                  className={`rounded-full px-2 py-1 text-[11px] font-bold tracking-wider uppercase transition xl:px-3 ${on ? 'bg-gold text-bark' : 'text-gold-light hover:text-white'}`}
                >
                  {naam}
                </button>
              );
            })}
          </div>

          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="rounded-full p-2 text-gold-light hover:bg-white/10 sm:hidden" aria-label={menuOpen ? 'Menu sluiten' : 'Menu openen'} aria-expanded={menuOpen}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobiele uitklapnavigatie (alleen zichtbaar tussen 640-767px vóór de header sitebreed verdwijnt; hamburgermenu). */}
      <nav className={`${menuOpen ? 'block' : 'hidden'} relative z-[60] overflow-visible border-t border-gold/20 bg-bark-2 text-cream sm:hidden`}>
        <div className="mx-auto flex max-w-[1500px] flex-col gap-1 px-2 py-2">
          {NAV_LEADING.map(({ id, label }) => {
            const on = actief === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => { setMenuOpen(false); }}
                className={`relative flex min-h-11 shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold tracking-wider uppercase transition ${
                  on ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'
                }`}
              >
                <NavMark id={id} />
                {label}
                <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`} />
              </a>
            );
          })}

          <div ref={cyclusMobielRef}>
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
                      setCyclusOpen(false);
                      setMenuOpen(false);
                    }}
                    className="block rounded-md border border-transparent px-3 py-2 hover:border-[#c9a227]/40 hover:bg-[#241813]"
                  >
                    <div className="ot-label ot-label-licht">{item.label}</div>
                    <div className="mt-0.5 text-[10px] leading-relaxed text-[#e9dcc0] opacity-90">{item.description}</div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <a
            href="#pascha"
            onClick={() => { setMenuOpen(false); }}
            className={`relative flex min-h-11 shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold tracking-wider uppercase transition ${actief === 'pascha' ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'}`}
          >
            <NavMark id="pascha" />Pascha
            <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold transition-opacity ${actief === 'pascha' ? 'opacity-100' : 'opacity-0'}`} />
          </a>

          {NAV_TRAILING.map(({ id, label }) => {
            const on = actief === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => { setMenuOpen(false); }}
                className={`relative flex min-h-11 shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold tracking-wider uppercase transition ${
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
