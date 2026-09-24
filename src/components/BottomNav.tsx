import { useEffect, useRef, useState } from 'react';

// Onderbalk voor mobiel (max-width: 767px). Op desktop is hij verborgen via CSS en blijft de bestaande koptekst in gebruik.
// Gebruikt dezelfde ankers als de koptekst; de ronde medaillon-iconen staan in public/images/ui/nav.

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
  ],
};

const ITEMS = [
  { id: 'vandaag', label: 'Vandaag' },
  { id: 'kalender', label: 'Kalender' },
  { id: 'cycli', label: 'Cycli' },
  { id: 'gebeden', label: 'Gebeden' },
  { id: 'meer', label: 'Meer' },
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

  const meerActief = GROEPEN.meer.find((s) => s.id === actief);

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
          {ITEMS.map(({ id, label }) => {
            const groep = GROEPEN[id];
            const on = groep ? groep.some((s) => s.id === actief) : actief === id;
            // Voor "Meer" bestaat geen eigen icoon: toon dat van de actieve pagina, anders de drie iconen samen.
            const icoon =
              id !== 'meer' ? (
                <img src={`/images/ui/nav/${id}.webp`} alt="" width={32} height={32} decoding="async" />
              ) : meerActief ? (
                <img src={`/images/ui/nav/${meerActief.id}.webp`} alt="" width={32} height={32} decoding="async" />
              ) : (
                <span className="bottom-nav-trio" aria-hidden="true">
                  {GROEPEN.meer.map((s) => <img key={s.id} src={`/images/ui/nav/${s.id}.webp`} alt="" decoding="async" />)}
                </span>
              );
            const inhoud = (
              <>
                {icoon}
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
