import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { usePaginaOpen } from '../lib/paginaOpen';
import { dienstVanHetUur, naamVan, slugVan } from '../lib/etmaal';
import { GEBEDEN_ZICHTBAAR } from '../lib/gebeden';
import { Sierlijn } from './MobielLaag';
import './bidden.css';

// Bidden (#bidden): het overzicht achter Bidden in de onderbalk: de sfeerbanner, het gebedsuur van nu (één klikbare regel
// naar het gebed van dit uur, met "Kies een ander gebedsuur" eronder) en de andere gebedsvormen als rustige regels met een
// ronde uitsnede (Jezusgebed, Psalter; Gebeden zodra die beschikbaar zijn).
// Beelden: aangeleverd op 25-10-2026 (public/images/bidden), alleen uitgesneden en verkleind. In de banner is het
// paneel met de Christusvoorstelling bedekt met het originele Sinaï-icoon (uitgesneden en geschaald, met een warme
// kaarslichtlaag erover). Psalter gebruikt het goedgekeurde manuscriptbeeld van de Psalter-pagina; Gebeden het
// evangelieboek; het gebedsuur en het Jezusgebed dezelfde kaartbeelden als Etmaal en Adem onder Ontdek.

// Regels onder het gebedsuur van nu (20-11-2026, referentie): ronde uitsnede van het bestaande kaartbeeld, naam, korte
// regel en een chevron; de hele regel opent het gebed.
type Regel = { href: string; titel: string; onder: string; beeld: string; positie?: string };
const REGELS: Regel[] = [
  { href: '#psalmen', titel: 'Psalter', onder: 'Lees en bid de psalmen', beeld: '/images/psalmen/manuscript-800.webp', positie: '62% 50%' },
  // Bidden opent het gebed zelf; de uitleg over het Jezusgebed staat onder Ontdek (Adem)
  { href: '#adem/bidden', titel: 'Jezusgebed', onder: 'Bid in je eigen tempo', beeld: '/images/ontdek/adem-kaart.webp', positie: '18% 50%' },
  // Gebeden pas zodra die beschikbaar zijn
  ...(GEBEDEN_ZICHTBAAR ? [{ href: '#gebeden', titel: 'Gebeden', onder: 'Gebeden voor verschillende momenten', beeld: '/images/bidden/gebeden-kaart.webp' }] : []),
];

const Rond = ({ src, positie }: { src: string; positie?: string }) => (
  <span className="ov-beeld is-rond" aria-hidden="true">
    <img src={src} alt="" decoding="async" style={positie ? { objectPosition: positie } : undefined} />
  </span>
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

  return (
    <section id="bidden" className="am bd">
      <div className="bd-banner">
        <img
          src="/images/bidden/banner-800.webp"
          srcSet="/images/bidden/banner-800.webp 800w, /images/bidden/banner-1086.webp 1086w"
          sizes="100vw"
          alt=""
          width={1086}
          height={1000}
          decoding="async"
          loading={open ? 'eager' : 'lazy'}
        />
        <p className="am-merk">Orthodoxe Tijd</p>
        <div className="bd-banner-tekst">
          <h1 className="bd-titel">Bidden</h1>
          <Sierlijn />
          <p className="bd-banner-onder">Een moment van stilte en gebed</p>
        </div>
      </div>

      <nav className="bd-kaarten is-lijst" aria-label="Ingangen om te bidden">
        {/* Het gebedsuur van nu: beeld, naam en korte uitleg zijn samen één link naar het gebed van dit uur */}
        <section className="bd-nu" aria-label="Het gebedsuur van nu">
          <a className="ov-rij is-rond bd-nu-rij" href={`#etmaal/${slugVan(uur)}/bid`}>
            <Rond src="/images/ontdek/etmaal-kaart.webp" positie="12% 50%" />
            <span className="ov-tekst">
              <span className="bd-label">Het gebedsuur van nu</span>
              <b>{naamVan(uur)}</b>
              <span>{uur.hoofdgedachtenis}</span>
            </span>
            <ChevronRight className="ov-pijl" aria-hidden="true" />
          </a>
          <a className="bd-ander" href="#etmaal">
            Kies een ander gebedsuur <ChevronRight aria-hidden="true" />
          </a>
        </section>
        <ul className="ov-lijst bd-vormen">
          {REGELS.map(({ href, titel, onder, beeld, positie }) => (
            <li key={href}>
              <a className="ov-rij is-rond" href={href}>
                <Rond src={beeld} positie={positie} />
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
