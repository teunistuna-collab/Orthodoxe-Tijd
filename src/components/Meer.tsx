import { ChevronRight } from 'lucide-react';
import { usePaginaOpen } from '../lib/paginaOpen';
import { Sierlijn } from './MobielLaag';
import './etmaal-mobiel.css';
import './meer-mobiel.css';

// Meer (#meer): het overzicht achter Meer in de onderbalk, alleen op mobiel (App.tsx), volgens de mock-up meer: banner met
// de kloostergang (aangeleverd 26-10-2026, alleen verkleind) en twee groepen kaarten, Verdieping en Overige.

type Regel = { id: string; titel: string; ondertitel: string };

const VERDIEPING: Regel[] = [
  { id: 'vasten', titel: 'Vasten', ondertitel: 'Vastenregels en vastenperioden' },
  { id: 'heiligen', titel: 'Heiligen', ondertitel: 'De heiligen en hun levens' },
  { id: 'feesten', titel: 'Feesten', ondertitel: 'De feesten van het kerkelijk jaar' },
];
const OVERIGE: Regel[] = [
  { id: 'instellingen', titel: 'Instellingen', ondertitel: 'Jouw voorkeuren en pijlgebed' },
  { id: 'bronnen', titel: 'Bronnen', ondertitel: 'Teksten, vertalingen en verantwoording' },
];

const Groep = ({ kop, regels }: { kop: string; regels: Regel[] }) => (
  <>
    <h2 className="mm-label">{kop}</h2>
    <ul className="mm-lijst">
      {regels.map(({ id, titel, ondertitel }) => (
        <li key={id}>
          <a className="mm-kaart" href={`#${id}`}>
            <span className="mm-tekst">
              <b>{titel}</b>
              <span>{ondertitel}</span>
            </span>
            <ChevronRight className="mm-pijl" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  </>
);

export default function Meer() {
  const open = usePaginaOpen('meer');
  return (
    <section id="meer" className="am mm">
      <div className="em-banner mm-banner">
        <img
          src="/images/ontwerp/meer-gang-800.webp"
          srcSet="/images/ontwerp/meer-gang-800.webp 800w, /images/ontwerp/meer-gang-1536.webp 1536w"
          sizes="100vw"
          alt=""
          width={1536}
          height={1024}
          loading={open ? 'eager' : 'lazy'}
          decoding="async"
        />
        <p className="am-merk mm-merk">Orthodoxe Tijd</p>
        <div className="em-banner-tekst">
          <h1 className="em-titel">Meer</h1>
          <Sierlijn />
          <p className="am-onder">Verdieping en informatie</p>
        </div>
      </div>
      <nav className="mm-papier" aria-label="Meer">
        <Groep kop="Verdieping" regels={VERDIEPING} />
        <Groep kop="Overige" regels={OVERIGE} />
      </nav>
    </section>
  );
}
