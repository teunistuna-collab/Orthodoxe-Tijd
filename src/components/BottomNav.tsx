import { useEffect, useRef, useState } from 'react';
import { BookOpen, CalendarDays, Ellipsis, History, House } from 'lucide-react';

// Onderbalk voor mobiel (max-width: 767px). Op desktop is hij verborgen via CSS en blijft de bestaande koptekst in gebruik.
// Gebruikt dezelfde ankers als de koptekst.

type Sub = { id: string; label: string };

const GROEPEN: Record<string, Sub[]> = {
  cycli: [
    { id: 'adem', label: 'Adem' },
    { id: 'etmaal', label: 'Etmaal' },
    { id: 'week', label: 'Week' },
    { id: 'jaar', label: 'Jaar' },
    { id: 'pascha', label: 'Pascha' },
  ],
  meer: [
    { id: 'vasten', label: 'Vasten' },
    { id: 'heiligen', label: 'Heiligen' },
    { id: 'feesten', label: 'Feesten' },
    { id: 'bronnen', label: 'Bronnen' },
  ],
};

const ITEMS = [
  { id: 'vandaag', label: 'Vandaag', Icon: House },
  { id: 'kalender', label: 'Kalender', Icon: CalendarDays },
  { id: 'cycli', label: 'Cycli', Icon: History },
  { id: 'gebeden', label: 'Gebeden', Icon: BookOpen },
  { id: 'meer', label: 'Meer', Icon: Ellipsis },
];

// Op mobiel staat er één pagina tegelijk in beeld; de actieve knop volgt die pagina.
export default function BottomNav({ pagina: actief }: { pagina: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  // Het blad sluit bij een tik ernaast of met Escape.
  useEffect(() => {
    if (!open) return;
    const buiten = (event: PointerEvent) => {
      const doel = event.target as Node;
      if (!navRef.current?.contains(doel) && !sheetRef.current?.contains(doel)) setOpen(null);
    };
    const toets = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    document.addEventListener('pointerdown', buiten);
    document.addEventListener('keydown', toets);
    return () => {
      document.removeEventListener('pointerdown', buiten);
      document.removeEventListener('keydown', toets);
    };
  }, [open]);

  return (
    <>
      {open && (
        <div ref={sheetRef} className="bottom-nav-blad" role="menu" aria-label={open === 'cycli' ? 'Cycli' : 'Meer'}>
          {GROEPEN[open].map((item) => (
            <a key={item.id} href={`#${item.id}`} role="menuitem" className={actief === item.id ? 'is-actief' : undefined} onClick={() => setOpen(null)}>
              {item.label}
            </a>
          ))}
        </div>
      )}
      <nav ref={navRef} className="bottom-nav" aria-label="Hoofdnavigatie">
        <ul>
          {ITEMS.map(({ id, label, Icon }) => {
            const groep = GROEPEN[id];
            const on = groep ? groep.some((s) => s.id === actief) : actief === id;
            const inhoud = (
              <>
                <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                <span>{label}</span>
              </>
            );
            return (
              <li key={id}>
                {groep ? (
                  <button type="button" className={on ? 'is-actief' : undefined} aria-expanded={open === id} aria-haspopup="menu" onClick={() => setOpen((o) => (o === id ? null : id))}>
                    {inhoud}
                  </button>
                ) : (
                  <a href={`#${id}`} className={on ? 'is-actief' : undefined} aria-current={on ? 'page' : undefined} onClick={() => setOpen(null)}>
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
