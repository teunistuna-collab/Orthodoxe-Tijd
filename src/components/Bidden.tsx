import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { usePaginaOpen } from '../lib/paginaOpen';
import { dienstVanHetUur, naamVan, slugVan } from '../lib/etmaal';
import { GEBEDEN_ZICHTBAAR } from '../lib/gebeden';
import { Sierlijn } from './MobielLaag';
import './bidden.css';

// Bidden (#bidden): het overzicht achter Bidden in de onderbalk, alleen op mobiel (App.tsx), volgens mock-up 03_bidden:
// een sfeerbanner en vier kaarten (het actuele gebedsuur, Gebeden, Psalter, Het Jezusgebed). Alle kaarten openen de
// bestaande pagina's; Etmaal is bereikbaar via het actuele gebedsuur en "Bekijk alle gebedsuren".
// Beelden: aangeleverd op 25-10-2026 (public/images/bidden), alleen uitgesneden en verkleind. In de banner is het
// paneel met de Christusvoorstelling bedekt met het originele Sinaï-icoon (uitgesneden en geschaald, met een warme
// kaarslichtlaag erover). Psalter gebruikt het goedgekeurde manuscriptbeeld van de Psalter-pagina; Gebeden het
// evangelieboek; het gebedsuur en het Jezusgebed dezelfde kaartbeelden als Etmaal en Adem onder Ontdek.

type Kaart = { id: string; titel: string; onder: string; beeld: string; positie?: string };

const GEBEDEN: Kaart = {
  id: 'gebeden',
  titel: 'Gebeden',
  onder: GEBEDEN_ZICHTBAAR ? 'Een verzameling gebeden voor verschillende momenten' : 'Binnenkort: ochtend- en avondgebeden',
  beeld: '/images/bidden/gebeden-kaart.webp',
};
const ANDERE: Kaart[] = [
  { id: 'psalmen', titel: 'Psalter', onder: 'De Psalmen lezen en bidden', beeld: '/images/psalmen/manuscript-800.webp', positie: '62% 50%' },
  { id: 'adem', titel: 'Het Jezusgebed', onder: 'Adem · Gebed van het hart', beeld: '/images/ontdek/adem-kaart.webp' },
];
// Zolang de gebeden nog niet zichtbaar zijn, staat Gebeden onderaan (de werkende ingangen eerst)
const KAARTEN: Kaart[] = GEBEDEN_ZICHTBAAR ? [GEBEDEN, ...ANDERE] : [...ANDERE, GEBEDEN];

const Beeld = ({ src, positie }: { src: string; positie?: string }) => (
  <span className="bd-beeld" aria-hidden="true">
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

      <nav className="bd-kaarten" aria-label="Ingangen om te bidden">
        {/* Twee duidelijke zones: boven (beeld, het uur van nu, de pijl) opent die dienst; onder de lijn opent het overzicht */}
        <div className="bd-kaart bd-uur">
          <a className="bd-hoofd" href={`#etmaal/${slugVan(uur)}/psalmen`}>
            <Beeld src="/images/ontdek/etmaal-kaart.webp" />
            <span className="bd-tekst">
              <span className="bd-label">Het actuele gebedsuur</span>
              <b>{naamVan(uur)}</b>
              <span>Bid met de Kerk</span>
            </span>
            <ChevronRight className="bd-pijl" aria-hidden="true" />
          </a>
          <a className="bd-alle" href="#etmaal">
            Bekijk alle gebedsuren <span aria-hidden="true">›</span>
          </a>
        </div>
        {KAARTEN.map(({ id, titel, onder, beeld, positie }) =>
          // Zolang de gebeden nog niet beschikbaar zijn: geen link en geen pijl, "Binnenkort" onder de titel
          id === 'gebeden' && !GEBEDEN_ZICHTBAAR ? (
            <div key={id} className="bd-kaart is-binnenkort">
              <Beeld src={beeld} positie={positie} />
              <span className="bd-tekst">
                <b>{titel}</b>
                <span className="bd-binnenkort">Binnenkort</span>
                <span>Ochtend- en avondgebeden</span>
              </span>
            </div>
          ) : (
          <a key={id} className="bd-kaart" href={`#${id}`}>
            <Beeld src={beeld} positie={positie} />
            <span className="bd-tekst">
              <b>{titel}</b>
              <span>{onder}</span>
            </span>
            <ChevronRight className="bd-pijl" aria-hidden="true" />
          </a>
          ),
        )}
      </nav>
    </section>
  );
}
