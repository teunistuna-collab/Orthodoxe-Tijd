import { useEffect, useRef, useState } from 'react';

// Onderbalk voor mobiel (max-width: 767px). Op desktop is hij verborgen via CSS en blijft de bestaande koptekst in gebruik.
// Gebruikt dezelfde ankers als de koptekst; de ronde medaillon-iconen staan in public/images/ui/nav.

const CYCLI_IDS = ['adem', 'etmaal', 'week', 'jaar', 'pascha'];

const CYCLI_ITEMS = [
  { id: 'adem', label: 'Adem', href: '#adem' },
  { id: 'etmaal', label: 'Etmaal', href: '#etmaal' },
  { id: 'week', label: 'Week', href: '#week' },
  { id: 'jaar', label: 'Jaar', href: '#jaar' },
  { id: 'pascha', label: 'Pascha', href: '#pascha' },
];

const ITEMS: Array<{ id: string; label: string; href: string }> = [
  { id: 'vandaag', label: 'Vandaag', href: '#vandaag' },
  { id: 'kalender', label: 'Kalender', href: '#kalender' },
  { id: 'cycli', label: 'Cycli', href: '#adem' },
  { id: 'gebeden', label: 'Gebeden', href: '#gebeden' },
  { id: 'vasten', label: 'Vasten', href: '#vasten' },
  { id: 'heiligen', label: 'Heiligen', href: '#heiligen' },
  { id: 'feesten', label: 'Feesten', href: '#feesten' },
];

const OBSERVEER = ['vandaag', 'kalender', 'gebeden', 'vasten', 'heiligen', 'feesten', ...CYCLI_IDS];

export default function BottomNav() {
  const [actief, setActief] = useState('vandaag');
  const [cycliOpen, setCycliOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  // Actieve sectie bijhouden tijdens het scrollen (zelfde methode als de koptekst).
  useEffect(() => {
    const els = OBSERVEER.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
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

  // Het Cycli-blad sluit bij een tik ernaast of met Escape.
  useEffect(() => {
    if (!cycliOpen) return;
    const buiten = (event: PointerEvent) => {
      const doel = event.target as Node;
      if (!navRef.current?.contains(doel) && !sheetRef.current?.contains(doel)) setCycliOpen(false);
    };
    const toets = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCycliOpen(false);
    };
    document.addEventListener('pointerdown', buiten);
    document.addEventListener('keydown', toets);
    return () => {
      document.removeEventListener('pointerdown', buiten);
      document.removeEventListener('keydown', toets);
    };
  }, [cycliOpen]);

  const cycliActief = CYCLI_IDS.includes(actief);

  return (
    <>
      {cycliOpen && (
        <div ref={sheetRef} className="bottom-nav-blad" role="menu" aria-label="Cycli">
          {CYCLI_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              role="menuitem"
              className={actief === item.id ? 'is-actief' : undefined}
              onClick={() => {
                setActief(item.id);
                setCycliOpen(false);
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
      <nav ref={navRef} className="bottom-nav" aria-label="Hoofdnavigatie">
        <ul>
          {ITEMS.map(({ id, label, href }) => {
            const isCycli = id === 'cycli';
            const on = isCycli ? cycliActief : actief === id;
            const inhoud = (
              <>
                <img src={`/images/ui/nav/${id}.webp`} alt="" width={32} height={32} decoding="async" />
                <span>{label}</span>
              </>
            );
            return (
              <li key={id}>
                {isCycli ? (
                  <button type="button" className={on ? 'is-actief' : undefined} aria-expanded={cycliOpen} aria-haspopup="menu" onClick={() => setCycliOpen((open) => !open)}>
                    {inhoud}
                  </button>
                ) : (
                  <a
                    href={href}
                    className={on ? 'is-actief' : undefined}
                    aria-current={on ? 'page' : undefined}
                    onClick={() => {
                      setActief(id);
                      setCycliOpen(false);
                    }}
                  >
                    {inhoud}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
