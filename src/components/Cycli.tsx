import { ChevronRight } from 'lucide-react';
import NisKop from './NisKop';
import { BannerBeeld } from './onderdelen';
import { usePaginaOpen } from '../lib/paginaOpen';
import './Vandaag.css';

// Cycli (#cycli): het overzicht achter Cycli in de onderbalk, alleen op mobiel (App.tsx), volgens het Cycli-pakket
// (referentie.png, scherm 1, met Pascha als vijfde ingang). Kop en stijl gedeeld met Vandaag (Vandaag.css).

// Medaillon per cyclus: hetzelfde beeld als op die pagina zelf (Adem: het Christusmedaillon; de andere: de opening).
const CYCLI = [
  { id: 'adem', titel: 'Adem', ondertitel: 'Het gebed van het hart', beeld: '/images/Christus-afbeelding.webp' },
  { id: 'etmaal', titel: 'Etmaal', ondertitel: 'Van avond tot avond', beeld: '/images/Etmaal-wiel.webp' },
  { id: 'week', titel: 'Week', ondertitel: 'De dagen met de Heer', beeld: '/images/Week-icoon.webp' },
  { id: 'jaar', titel: 'Jaar', ondertitel: 'De heilige seizoenen', beeld: '/images/jaar/rozet.webp' },
  { id: 'pascha', titel: 'Pascha', ondertitel: 'Het hart van ons geloof', beeld: '/images/Pascha-icoon.webp' },
  { id: 'geboorte', titel: 'Geboorte', ondertitel: 'Van de Geboortevasten tot Theofanie', beeld: '/images/feesten/kerst.jpg' },
];

export default function Cycli() {
  const open = usePaginaOpen('cycli');
  return (
    <section id="cycli" className="vg vg-cycli">
      {/* Banner: de zonnewijzer in het gewelf (public/images/ontwerp/cycli-banner-*.webp) */}
      <NisKop open={open} balk achter={<BannerBeeld naam="cycli-banner" open={open} />} />
      <div className="vg-papier vg-cy">
        <h1 className="vg-cy-titel">Heilige Ritmes</h1>
        <img className="vg-sierlijn vg-cy-sierlijn" src="/images/vandaag/sierlijn.svg" alt="" aria-hidden="true" width={480} height={40} />
        <p className="vg-label">Het ritme van gebed</p>
        <p className="vg-cy-intro">Van de stilte van het hart tot de grote feesten van de Kerk. In ieder uur, iedere dag en ieder seizoen nodigt God ons uit tot gebed.</p>
        <nav aria-label="De zes cycli">
          <ul className="vg-cy-lijst">
            {CYCLI.map(({ id, titel, ondertitel, beeld }) => (
              <li key={id}>
                <a className="vg-cy-kaart" href={`#${id}`}>
                  {/* Eigen omhulsel: index.css haalt kader en schaduw weg bij elk element met het Christusbeeld als directe inhoud. */}
                  <span className="vg-cy-beeld"><img src={beeld} alt="" width={64} height={64} loading="lazy" decoding="async" /></span>
                  <span className="vg-verd-tekst">
                    <b>{titel}</b>
                    <span>{ondertitel}</span>
                  </span>
                  <ChevronRight className="vg-verd-pijl" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
