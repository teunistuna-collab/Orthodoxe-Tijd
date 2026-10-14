import { BookOpen, CalendarDays, History, House, Menu } from 'lucide-react';

// Onderbalk voor mobiel (max-width: 767px). Op desktop is hij verborgen via CSS en blijft de bestaande koptekst in gebruik.
// Gebruikt dezelfde ankers als de koptekst. Cycli en Meer openen een overzicht (Cycli.tsx, Meer.tsx); op dat overzicht
// en op de pagina's die je daar opent blijft die knop gemarkeerd.

const ITEMS = [
  { id: 'vandaag', label: 'Vandaag', Icon: House, ook: [] },
  { id: 'kalender', label: 'Kalender', Icon: CalendarDays, ook: [] },
  { id: 'cycli', label: 'Cycli', Icon: History, ook: ['adem', 'etmaal', 'week', 'jaar', 'pascha'] },
  { id: 'psalmen', label: 'Psalmen', Icon: BookOpen, ook: [] },
  { id: 'meer', label: 'Meer', Icon: Menu, ook: ['gebeden', 'vasten', 'heiligen', 'feesten', 'instellingen', 'bronnen'] },
];

// Op mobiel staat er één pagina tegelijk in beeld; de actieve knop volgt die pagina.
export default function BottomNav({ pagina: actief }: { pagina: string }) {
  return (
    <nav className="bottom-nav" aria-label="Onderbalk">
      <ul>
        {ITEMS.map(({ id, label, Icon, ook }) => {
          const on = actief === id || ook.includes(actief);
          return (
            <li key={id}>
              <a href={`#${id}`} className={on ? 'is-actief' : undefined} aria-current={actief === id ? 'page' : undefined}>
                <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                <span>{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
