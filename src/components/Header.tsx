import { useEffect, useRef, useState } from 'react';
import { BookOpen, CalendarDays, ChevronDown, Flame, HandHeart, Menu, Search, Sparkles, Sun, Wheat, X } from 'lucide-react';
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

// Vandaag/Kalender komen vóór de Cycli-dropdown, daarna Pascha en de rest.
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

// Er staat één pagina tegelijk in beeld (App.tsx); de actieve link volgt die pagina.
export default function Header({ pagina: actief }: { pagina: string }) {
  const { mode, setMode, openZoeken } = useApp();
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
      {/* Eén donkere balk (vanaf 768px; daaronder de onderbalk): merk links, navigatie in het midden, kalenderkeuze rechts.
          De sierlijst staat als border-image (Bouw 69), zodat de hoekornamenten op elke breedte even groot blijven. */}
      <div className="relative bg-bark text-cream">
        <div className="relative mx-auto flex items-center">
          <a href="#vandaag" onClick={() => { setMenuOpen(false); }} className="kop-merk">
            {/* Het kruis uit het sitelogo (favicon.svg), zonder de donkere tegel */}
            <svg viewBox="6 0 52 96" aria-hidden="true" fill="currentColor">
              <rect x="29" y="2" width="6" height="92" rx="1" />
              <rect x="20" y="12" width="24" height="5" rx="1" />
              <rect x="8" y="28" width="48" height="6" rx="1" />
              <rect x="16" y="69.5" width="32" height="5" rx="1" transform="rotate(-22 32 72)" />
            </svg>
            <span className="min-w-0">
              <span className="kop-naam">Orthodoxe Tijd</span>
              <span className="kop-tagline">Een weg door de tijd · een leven met Christus</span>
            </span>
          </a>

          <nav className="kop-nav" aria-label="Hoofdnavigatie">
            {NAV_LEADING.map(({ id, label }) => (
              <a key={id} href={`#${id}`} onClick={() => { setMenuOpen(false); }} className={`kop-link${actief === id ? ' is-actief' : ''}`} aria-current={actief === id ? 'page' : undefined}>
                {label}
              </a>
            ))}

            <div
              ref={cyclusRef}
              className="relative shrink-0"
              onMouseEnter={openCyclus}
              onMouseLeave={planCyclusSluiten}
            >
              <button
                type="button"
                onClick={openCyclus}
                aria-expanded={cyclusOpen}
                className={`kop-link${cyclusActief ? ' is-actief' : ''}`}
              >
                Cycli
                <ChevronDown className={`transition ${cyclusOpen ? 'rotate-180' : ''}`} />
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

            {[PASCHA_NAV, ...NAV_TRAILING].map(({ id, label }) => (
              <a key={id} href={`#${id}`} onClick={() => { setMenuOpen(false); }} className={`kop-link${actief === id ? ' is-actief' : ''}`} aria-current={actief === id ? 'page' : undefined}>
                {label}
              </a>
            ))}
          </nav>

          <div className="kop-acties">
            <button type="button" onClick={openZoeken} className="kop-zoek" aria-label="Zoeken" title="Zoeken  ( /  of  Ctrl+K )">
              <Search aria-hidden="true" />
            </button>

            <div className="kop-kalender" role="group" aria-label="Kalenderkeuze">
              {KALENDER_KEUZES.map(({ id, naam, toelichting }) => (
                <button key={id} type="button" aria-pressed={mode === id} title={`${naam} · ${toelichting}`} onClick={() => setMode(id)}>
                  {naam}
                </button>
              ))}
            </div>
            {/* Smalle tablet: één knop met de huidige keuze; een tik wisselt naar de andere kalender. */}
            <button type="button" className="kop-kalender-kort" onClick={() => setMode(mode === 'oud' ? 'nieuw' : 'oud')} aria-label={`Kalender: ${mode === 'oud' ? 'Oud (juliaans)' : 'Nieuw (burgerlijk)'}. Tik om te wisselen.`}>
              {mode === 'oud' ? 'Oud' : 'Nieuw'}
            </button>
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
