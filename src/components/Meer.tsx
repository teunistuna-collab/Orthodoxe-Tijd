import { ChevronRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { Sierlijn } from './MobielLaag';
import './etmaal-mobiel.css';
import './meer-mobiel.css';

// Meer (#meer): het overzicht achter Meer in de onderbalk (herziene app-mapping): een compacte paginakop met Boeken, de
// instellingen en de informatie over de app. Feesten, Heiligen en Vasten staan onder Ontdek; hun adressen (#feesten,
// #heiligen, #vasten) blijven gewoon werken.

export default function Meer() {
  const { mode } = useApp();
  const regels = [
    { id: 'boeken', titel: 'Boeken', onder: 'Een kleine orthodoxe bibliotheek' },
    { id: 'instellingen', titel: 'Instellingen', onder: `Kalender (nu: ${mode === 'oud' ? 'juliaans' : 'gregoriaans'}), pijlgebed, herinneringen en tekstweergave` },
    { id: 'bronnen', titel: 'Over de app en bronnen', onder: 'Waar de teksten, de kalender en de lezingen vandaan komen' },
  ];
  return (
    <section id="meer" className="am mm">
      <header className="mm-kop">
        <p className="am-merk mm-merk">Orthodoxe Tijd</p>
        <h1 className="em-titel">Meer</h1>
        <Sierlijn />
        <p className="am-onder">Boeken, instellingen en informatie</p>
      </header>
      <nav className="mm-papier" aria-label="Boeken, instellingen en informatie">
        <ul className="ov-lijst">
          {regels.map(({ id, titel, onder }) => (
            <li key={id}>
              <a className="ov-rij is-zonder-beeld" href={`#${id}`}>
                <span className="ov-tekst">
                  <b>{titel}</b>
                  <span>{onder}</span>
                </span>
                <ChevronRight className="ov-pijl" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
