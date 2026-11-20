import { ChevronRight } from 'lucide-react';
import { Sierlijn } from './MobielLaag';
import { usePaginaOpen } from '../lib/paginaOpen';
import './Vandaag.css';

// Ontdek (#cycli): onder de banner drie groepen (20-11-2026): Gebed en dagelijks leven, Het kerkelijk jaar, Feesten en
// heiligen. Per onderwerp de naam met een korte vaste informatieregel; aftellingen en wat er nu speelt staan op de
// pagina's zelf. Elke regel heeft een ronde uitsnede van het bestaande beeld. Adem en Gebedsuren openen de
// hoofdpagina's Adem en Etmaal.

const GROEPEN: { titel: string; regels: { href: string; titel: string; onder: string; beeld: string; positie?: string }[] }[] = [
  {
    titel: 'Gebed en dagelijks leven',
    regels: [
      { href: '#adem', titel: 'Adem', onder: 'Het Jezusgebed en de adem', beeld: '/images/ontdek/adem-kaart.webp', positie: '18% 50%' },
      { href: '#etmaal', titel: 'Gebedsuren', onder: 'De acht diensten van dag en nacht', beeld: '/images/ontdek/etmaal-kaart.webp', positie: '12% 50%' },
      { href: '#week', titel: 'De week', onder: 'Elke dag een eigen gedachtenis', beeld: '/images/ontdek/week.webp', positie: '50% 42%' },
    ],
  },
  {
    titel: 'Het kerkelijk jaar',
    regels: [
      { href: '#jaar', titel: 'Kerkelijk jaar', onder: 'De perioden, feesten en vastentijden', beeld: '/images/ontdek/jaar.webp' },
      { href: '#pascha', titel: 'Pascha', onder: 'Van de Grote Vasten tot Pinksteren', beeld: '/images/ontdek/pascha.webp', positie: '50% 22%' },
      { href: '#geboorte', titel: 'Geboorte', onder: 'Van de Geboortevasten tot Theofanie', beeld: '/images/ontdek/geboorte.webp', positie: '50% 58%' },
    ],
  },
  {
    titel: 'Feesten en heiligen',
    regels: [
      { href: '#feesten', titel: 'Feesten', onder: 'De feesten van het kerkelijk jaar', beeld: '/images/feesten/laatste-avondmaal-banner.webp', positie: '50% 30%' },
      { href: '#heiligen', titel: 'Heiligen', onder: 'De heiligen van elke dag en hun levens', beeld: '/images/meer/heiligen-wijnstok.webp', positie: '50% 28%' },
      { href: '#vasten', titel: 'Vasten', onder: 'Vastenregel en vastenperioden', beeld: '/images/ontwerp/vasten-banner-800.webp', positie: '50% 60%' },
    ],
  },
];

export default function Cycli() {
  const open = usePaginaOpen('cycli');
  return (
    <section id="cycli" className="vg vg-cycli">
      {/* Banner zoals Etmaal: het aangeleverde beeld van de kapel met het wierookvat, titel en sierlijn als tekst */}
      <div className="em-banner vg-ontdek-banner">
        <img src="/images/ontdek/banner.webp" alt="" width={1200} height={800} loading={open ? 'eager' : 'lazy'} decoding="async" />
        <p className="am-merk vg-ontdek-merk">Orthodoxe Tijd</p>
        <div className="em-banner-tekst">
          <h1 className="em-titel">Ontdek</h1>
          <Sierlijn />
          <p className="am-onder">De kalender en de ritmes van de Kerk</p>
        </div>
      </div>
      <nav className="vg-papier vg-ontdek" aria-label="Ontdek">
        {GROEPEN.map((g, i) => (
          <section key={g.titel} className="ov-groep" aria-labelledby={`ov-groep-${i}`}>
            <h2 className="ov-label" id={`ov-groep-${i}`}>{g.titel}</h2>
            <ul className="ov-lijst">
              {g.regels.map(({ href, titel, onder, beeld, positie }) => (
                <li key={href}>
                  <a className="ov-rij is-rond" href={href}>
                    <span className="ov-beeld is-rond" aria-hidden="true">
                      <img src={beeld} alt="" loading="lazy" decoding="async" style={positie ? { objectPosition: positie } : undefined} />
                    </span>
                    <span className="ov-tekst">
                      <b>{titel}</b>
                      <span>{onder}</span>
                    </span>
                    <ChevronRight className="ov-pijl" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </section>
  );
}
