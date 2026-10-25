import type { CSSProperties } from 'react';
import { ChevronRight } from 'lucide-react';
import NisKop from './NisKop';
import { BannerBeeld } from './onderdelen';
import { usePaginaOpen } from '../lib/paginaOpen';
import './Vandaag.css';

// Ontdek (#cycli): het overzicht achter Ontdek in de onderbalk, alleen op mobiel (App.tsx), volgens de goedgekeurde
// mock-up (mobile/docs/mockups/goedgekeurd/04-ontdek.png): titel en ondertitel in de banner, daaronder zes brede kaarten
// met links een beeld en rechts titel, ondertitel en een korte zin. Beelden alleen uit aangeleverde originelen
// (public/images/ontdek, alleen verkleind; Adem: het door de eigenaar gekozen gebedssnoer). De bogengalerij is niet als
// origineel aangeleverd; de banner blijft de zonnewijzer van Cycli.

// zoom en fx/fy (brandpunt in %) bepalen alleen de uitsnede; het beeld zelf blijft ongewijzigd.
const CYCLI = [
  { id: 'adem', titel: 'Adem', onder: 'Het Jezusgebed', zin: 'Het gebed dat met je meegaat.', beeld: '/images/ontdek/adem.webp', zoom: 1, fx: 50, fy: 50 },
  { id: 'etmaal', titel: 'Etmaal', onder: 'De uren van de dag', zin: 'De dag geheiligd door gebed.', beeld: '/images/ontdek/etmaal.webp', zoom: 1.15, fx: 40, fy: 50 },
  { id: 'week', titel: 'Week', onder: 'De zeven dagen', zin: 'Iedere dag een eigen herinnering.', beeld: '/images/ontdek/week.webp', zoom: 1.45, fx: 50, fy: 42 },
  { id: 'jaar', titel: 'Jaar', onder: 'Het kerkelijk jaar', zin: 'Leven met de feesten en vastentijden.', beeld: '/images/ontdek/jaar.webp', zoom: 1.1, fx: 50, fy: 50 },
  { id: 'pascha', titel: 'Pascha', onder: 'Van het Kruis naar de Verrijzenis', zin: 'De weg naar het feest der feesten.', beeld: '/images/ontdek/pascha.webp', zoom: 1, fx: 50, fy: 22 },
  { id: 'geboorte', titel: 'Geboorte', onder: 'Het Licht komt in de wereld', zin: 'De weg naar de Geboorte van Christus.', beeld: '/images/ontdek/geboorte.webp', zoom: 1.05, fx: 50, fy: 58 },
];

export default function Cycli() {
  const open = usePaginaOpen('cycli');
  return (
    <section id="cycli" className="vg vg-cycli">
      <NisKop titel="Ontdek" ondertitel="De ritmes van het orthodoxe leven" open={open} balk achter={<BannerBeeld naam="cycli-banner" open={open} />} />
      <div className="vg-papier vg-ontdek">
        <nav aria-label="De zes cycli">
          <ul className="vg-ontdek-lijst">
            {CYCLI.map(({ id, titel, onder, zin, beeld, zoom, fx, fy }) => (
              <li key={id}>
                <a className="vg-ontdek-kaart" href={`#${id}`}>
                  <span className="vg-ontdek-beeld" style={{ '--zoom': zoom, '--fx': `${fx}%`, '--fy': `${fy}%` } as CSSProperties}>
                    <img src={beeld} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className="vg-ontdek-tekst">
                    <b>{titel}</b>
                    <span>{onder}</span>
                    <small>{zin}</small>
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
