import Cross from './Cross';
import { usePaginaOpen } from '../lib/paginaOpen';

// Eén sierkop voor alle pagina's behalve Vandaag: een gouden boog op perkament met kruis en titel als echte tekst.
// Mobiel: public/images/heroes/sier/boog.webp (3:1); vanaf 768px een eigen, vlakkere boog als lage band (boog-web.webp).
// De kop blijft bij het scrollen staan; de inhoud verdwijnt eronder (index.css, Bouw 126–132).
// `kop`: de titel is de h1 van de pagina (alleen waar de pagina zelf geen h1 heeft).

type Props = { id: string; titel: string; kop?: boolean };

export default function PageHero({ id, titel, kop = false }: Props) {
  // De kop van de pagina die open staat laadt meteen en met voorrang; die van verborgen pagina's pas als ze in beeld komen.
  const open = usePaginaOpen(id);
  const Titel = kop ? 'h1' : 'p';
  return (
    <section id={id} className="sier-kop">
      <div className="sier-kop-binnen">
        <picture>
          <source media="(min-width: 768px)" srcSet="/images/heroes/sier/boog-web.webp" width={2000} height={667} />
          <img src="/images/heroes/sier/boog.webp" alt="" width={1200} height={400} loading={open ? 'eager' : 'lazy'} fetchPriority={open ? 'high' : 'auto'} decoding="async" />
        </picture>
        <span className="sier-kop-kruis" aria-hidden="true">
          <Cross className="h-full w-full" title="" />
        </span>
        <Titel className="sier-kop-titel">{titel}</Titel>
      </div>
    </section>
  );
}
