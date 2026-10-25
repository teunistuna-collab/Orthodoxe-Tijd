import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { BookOpen, ChevronRight, Clock } from 'lucide-react';
import { usePaginaOpen } from '../lib/paginaOpen';
import { dienstVanHetUur } from '../lib/etmaal';
import { OPEN_DIENST_EVENT } from '../lib/events';
import NisKop from './NisKop';
import { HANDEN, KRUIS } from './symbolen';
import './Vandaag.css';

// Bidden (#bidden): het overzicht achter Bidden in de onderbalk, alleen op mobiel (App.tsx), volgens de app-mapping
// (mobile/docs/APP-MAPPING.md): het actuele gebedsuur, dan Gebeden, Psalter, Adem en Etmaal. Opmaak gedeeld met
// Verdieping (Meer.tsx, Vandaag.css). Adem en Etmaal zijn dezelfde pagina's als onder Ontdek.

type Regel = { id: string; titel: string; ondertitel: string; symbool: ReactNode };

const REGELS: Regel[] = [
  { id: 'gebeden', titel: 'Gebeden', ondertitel: 'Het gebed van de Kerk', symbool: HANDEN },
  { id: 'psalmen', titel: 'Psalter', ondertitel: 'De Psalmen, per psalm of per kathisma', symbool: <BookOpen strokeWidth={1.3} aria-hidden="true" /> },
  { id: 'adem', titel: 'Adem', ondertitel: 'Het Jezusgebed', symbool: KRUIS },
  { id: 'etmaal', titel: 'Etmaal', ondertitel: 'De gebeden van dag en nacht', symbool: <Clock strokeWidth={1.3} aria-hidden="true" /> },
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

export default function Bidden() {
  const open = usePaginaOpen('bidden');
  // Het gebedsuur van nu (lib/etmaal.ts), elke minuut bijgewerkt zolang de pagina open is.
  const [uur, setUur] = useState(() => dienstVanHetUur(new Date()));
  useEffect(() => {
    if (!open) return;
    const bij = () => setUur(dienstVanHetUur(new Date()));
    bij();
    const t = setInterval(bij, 60_000);
    return () => clearInterval(t);
  }, [open]);
  // Zoals op Vandaag: Etmaal opent meteen deze dienst.
  const openDienst = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(OPEN_DIENST_EVENT, { detail: uur.title }));
  };

  return (
    <section id="bidden" className="vg vg-verdieping">
      <NisKop titel="Bidden" open={open} balk />
      <nav className="vg-papier vg-verd-lijst" aria-label="Bidden">
        <ul>
          <li>
            <a className="vg-verd-rij" href="#etmaal" onClick={openDienst}>
              <span className="vg-verd-symbool"><img src="/images/vandaag/iconen/01_gebedsuur_lamp.webp" alt="" width={40} height={37} decoding="async" /></span>
              <span className="vg-verd-tekst">
                <b>Het actuele gebedsuur</b>
                <span>{uur.title} · {uur.time}</span>
              </span>
              <ChevronRight className="vg-verd-pijl" aria-hidden="true" />
            </a>
          </li>
        </ul>
        <p className="vg-verd-scheiding" aria-hidden="true"><span>✣</span></p>
        <ul>{REGELS.map(rij)}</ul>
      </nav>
    </section>
  );
}
