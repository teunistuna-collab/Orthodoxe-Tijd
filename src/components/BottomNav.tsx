import { CalendarDays, Compass, HandHeart, House, Menu } from 'lucide-react';
import { groepVan } from '../lib/navigatie';
import './bottom-nav.css';

// Onderbalk voor mobiel (max-width: 767px), met de vijf tabs van de app-mapping (mobile/docs/APP-MAPPING.md):
// Vandaag · Kalender · Bidden · Ontdek · Meer. Op desktop is hij verborgen via CSS en blijft de koptekst in gebruik.
// Bidden, Ontdek (#cycli) en Meer openen een overzicht (Bidden.tsx, Cycli.tsx, Meer.tsx); op dat overzicht en op de
// pagina's die je daar opent blijft die knop gemarkeerd. Adem en Etmaal horen bij beide: de knop volgt waar je vandaan kwam.

const ITEMS = [
  { id: 'vandaag', label: 'Vandaag', Icon: House },
  { id: 'kalender', label: 'Kalender', Icon: CalendarDays },
  { id: 'bidden', label: 'Bidden', Icon: HandHeart },
  { id: 'cycli', label: 'Ontdek', Icon: Compass },
  { id: 'meer', label: 'Meer', Icon: Menu },
];
const MEER = ['meer', 'vasten', 'heiligen', 'feesten', 'instellingen', 'bronnen', 'boeken'];

// Op mobiel staat er één pagina tegelijk in beeld; de actieve knop volgt die pagina.
export default function BottomNav({ pagina: actief }: { pagina: string }) {
  const groep = groepVan(actief);
  const isAan = (id: string) =>
    id === actief || (id === 'bidden' && groep === 'bidden') || (id === 'cycli' && groep === 'ontdek') || (id === 'meer' && MEER.includes(actief));
  return (
    <nav className="bottom-nav" aria-label="Onderbalk">
      <ul>
        {ITEMS.map(({ id, label, Icon }) => (
          <li key={id}>
            <a href={`#${id}`} className={isAan(id) ? 'is-actief' : undefined} aria-current={actief === id ? 'page' : undefined}>
              <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
