import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useApp } from '../lib/context';

const SECTIES = [
  { id: 'vandaag', label: 'Vandaag' },
  { id: 'kalender', label: 'Kalender' },
  { id: 'gebeden', label: 'Gebeden' },
  { id: 'psalmen', label: 'Psalmen' },
  { id: 'vasten', label: 'Vasten' },
  { id: 'heiligen', label: 'Heiligen' },
  { id: 'pascha', label: 'Pascha' },
  { id: 'feesten', label: 'Feesten' },
];

// Vandaag/Kalender komen vóór de Cycli-dropdown, daarna Pascha en de rest.
const NAV_LEADING = SECTIES.slice(0, 2);
const PASCHA_NAV = SECTIES.find((s) => s.id === 'pascha')!;
const NAV_TRAILING = SECTIES.slice(2).filter((s) => s.id !== 'pascha');


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
  const [cyclusOpen, setCyclusOpen] = useState(false);
  const cyclusRef = useRef<HTMLDivElement | null>(null);
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
      // een klik op het Cycli-menu zelf telt niet als "buiten"
      if (!cyclusRef.current?.contains(event.target as Node)) setCyclusOpen(false);
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
          <a href="#vandaag" className="kop-merk">
            {/* Embleem: gouden kruis in een ring (public/images/ui/embleem.webp, doorzichtige achtergrond) */}
            <img src="/images/ui/embleem.webp" alt="" width={44} height={43} />
            <span className="min-w-0">
              <span className="kop-naam">Orthodoxe Tijd</span>
              <span className="kop-tagline">Een weg door de tijd · een leven met Christus</span>
            </span>
          </a>

          <nav className="kop-nav" aria-label="Hoofdnavigatie">
            {NAV_LEADING.map(({ id, label }) => (
              <a key={id} href={`#${id}`} className={`kop-link${actief === id ? ' is-actief' : ''}`} aria-current={actief === id ? 'page' : undefined}>
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
              <a key={id} href={`#${id}`} className={`kop-link${actief === id ? ' is-actief' : ''}`} aria-current={actief === id ? 'page' : undefined}>
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
        </div>
      </div>
    </header>
  );
}
