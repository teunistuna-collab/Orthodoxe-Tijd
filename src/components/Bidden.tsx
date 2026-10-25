import { useEffect, useState, type MouseEvent } from 'react';
import { ChevronRight } from 'lucide-react';
import { usePaginaOpen } from '../lib/paginaOpen';
import { dienstVanHetUur } from '../lib/etmaal';
import { OPEN_DIENST_EVENT } from '../lib/events';
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

const KAARTEN: Kaart[] = [
  { id: 'gebeden', titel: 'Gebeden', onder: 'Een verzameling gebeden voor verschillende momenten', beeld: '/images/bidden/gebeden-kaart.webp' },
  { id: 'psalmen', titel: 'Psalter', onder: 'De Psalmen lezen en bidden', beeld: '/images/psalmen/manuscript-800.webp', positie: '62% 50%' },
  { id: 'adem', titel: 'Het Jezusgebed', onder: 'Adem · Gebed van het hart', beeld: '/images/ontdek/adem-kaart.webp' },
];

const Beeld = ({ src, positie }: { src: string; positie?: string }) => (
  <span className="bd-beeld" aria-hidden="true">
    <img src={src} alt="" loading="lazy" decoding="async" style={positie ? { objectPosition: positie } : undefined} />
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
  // Zoals op Vandaag: de kaart opent meteen de dienst van nu op Etmaal.
  const openDienst = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(OPEN_DIENST_EVENT, { detail: uur.title }));
  };

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

      <nav className="bd-kaarten" aria-label="Bidden">
        <div className="bd-kaart bd-uur">
          <Beeld src="/images/ontdek/etmaal-kaart.webp" />
          <div className="bd-tekst">
            <a className="bd-hoofd" href="#etmaal" onClick={openDienst}>
              <small className="bd-label">De uren van de dag</small>
              <b>Het actuele gebedsuur</b>
              <span>
                Nu: <strong>{uur.title}</strong> · Bid met de Kerk
              </span>
            </a>
            <a className="bd-alle" href="#etmaal">
              Bekijk alle gebedsuren <span aria-hidden="true">→</span>
            </a>
          </div>
          <ChevronRight className="bd-pijl" aria-hidden="true" />
        </div>
        {KAARTEN.map(({ id, titel, onder, beeld, positie }) => (
          <a key={id} className="bd-kaart" href={`#${id}`}>
            <Beeld src={beeld} positie={positie} />
            <span className="bd-tekst">
              <b>{titel}</b>
              <span>{onder}</span>
            </span>
            <ChevronRight className="bd-pijl" aria-hidden="true" />
          </a>
        ))}
      </nav>
    </section>
  );
}
