import type { ReactNode } from 'react';
import { BookOpen, ChevronRight, Settings } from 'lucide-react';
import { usePaginaOpen } from '../lib/paginaOpen';
import NisKop from './NisKop';
import { BLAD, KERK, KRUIS } from './symbolen';
import './Vandaag.css';

// Pagina Verdieping (#meer): het overzicht achter Meer in de onderbalk, alleen op mobiel (App.tsx), volgens het Verdieping-pakket (referentie.png, scherm 2).

const BOEK = <BookOpen strokeWidth={1.3} aria-hidden="true" />;

type Regel = { id: string; titel: string; ondertitel: string; symbool: ReactNode };

const BOVEN: Regel[] = [
  { id: 'vasten', titel: 'Vasten', ondertitel: 'Tijd van bekering', symbool: BLAD },
  { id: 'heiligen', titel: 'Heiligen', ondertitel: 'Vrienden van God', symbool: KRUIS },
  { id: 'feesten', titel: 'Feesten', ondertitel: 'Het liturgisch jaar', symbool: KERK },
];
const ONDER: Regel[] = [
  { id: 'instellingen', titel: 'Instellingen', ondertitel: 'Jouw voorkeuren', symbool: <Settings strokeWidth={1.3} aria-hidden="true" /> },
  { id: 'bronnen', titel: 'Bronnen', ondertitel: 'Traditie en verdieping', symbool: BOEK },
];

const rij = ({ id, titel, ondertitel, symbool }: Regel) => (
  <li key={id}>
    <a className="vg-verd-rij" href={`#${id}`}>
      <span className="vg-verd-symbool">{symbool}</span>
      <span className="vg-verd-tekst">
        <b>{titel}</b>
        <span>{ondertitel}</span>
      </span>
      <ChevronRight className="vg-verd-pijl" aria-hidden="true" />
    </a>
  </li>
);

export default function Meer() {
  const open = usePaginaOpen('meer');
  return (
    <section id="meer" className="vg vg-verdieping">
      <NisKop titel="Verdieping" open={open} balk />
      <nav className="vg-papier vg-verd-lijst" aria-label="Verdieping">
        <ul>{BOVEN.map(rij)}</ul>
        <p className="vg-verd-scheiding" aria-hidden="true"><span>✣</span></p>
        <ul>{ONDER.map(rij)}</ul>
      </nav>
    </section>
  );
}
