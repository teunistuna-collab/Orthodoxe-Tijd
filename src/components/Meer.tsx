import type { ReactNode } from 'react';
import { BookOpen, ChevronRight, Settings } from 'lucide-react';
import { usePaginaOpen } from '../lib/paginaOpen';
import './Vandaag.css';

// Pagina Verdieping (#meer): het overzicht achter Meer in de onderbalk, alleen op mobiel (App.tsx), volgens het Verdieping-pakket (referentie.png, scherm 2).
// De kop hergebruikt de kerkelijke kop van Vandaag (Vandaag.css: .vg-kop, sierboog, sierlijn).

// Lijnsymbolen uit het pakket (verdieping.js) waar de app zelf geen passend symbool heeft.
const pad = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const HANDEN = pad(<path d="M11 3v10l-5 8-4-3 5-7 2-7q1-3 2-1Zm2 0v10l5 8 4-3-5-7-2-7q-1-3-2-1Z" />);
const BLAD = pad(<path d="M5 22Q7 11 18 3M9 15q-7 0-6-6 6 0 6 6ZM12 11q-2-7 4-9 3 5-4 9ZM13 14q7-5 9 0-4 5-9 0ZM8 19q6-4 10 0-5 5-10 0Z" />);
const KRUIS = pad(<path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6Z" />);
const KERK = pad(<path d="M4 22V10h5m6 0h5v12M8 22V10q0-5 4-7 4 2 4 7v12M3 22h18M10 22v-6a2 2 0 0 1 4 0v6M10 2h4M12 0v4M5 14h1M18 14h1" />);
const BOEK = <BookOpen strokeWidth={1.3} aria-hidden="true" />;

type Regel = { id: string; titel: string; ondertitel: string; symbool: ReactNode };

const BOVEN: Regel[] = [
  { id: 'gebeden', titel: 'Gebeden', ondertitel: 'Het gebed van de Kerk', symbool: HANDEN },
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
      <div className="vg-kop">
        <div className="vg-kop-achter" aria-hidden="true">
          <img src="/images/vandaag/kerk-header-800.webp" srcSet="/images/vandaag/kerk-header-800.webp 800w, /images/vandaag/kerk-header-1536.webp 1536w" sizes="(min-width: 960px) 960px, 100vw" alt="" width={1536} height={1024} loading={open ? 'eager' : 'lazy'} decoding="async" />
        </div>
        <h1 className="vg-titel">Verdieping</h1>
        <img className="vg-sierlijn vg-verd-sierlijn" src="/images/vandaag/sierlijn.svg" alt="" aria-hidden="true" width={480} height={40} />
        <img className="vg-sierboog" src="/images/vandaag/sierboog.svg" alt="" aria-hidden="true" width={1000} height={140} />
      </div>
      <nav className="vg-papier vg-verd-lijst" aria-label="Verdieping">
        <ul>{BOVEN.map(rij)}</ul>
        <p className="vg-verd-scheiding" aria-hidden="true"><span>✣</span></p>
        <ul>{ONDER.map(rij)}</ul>
      </nav>
    </section>
  );
}
