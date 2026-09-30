import { useSyncExternalStore } from 'react';
import Cross from './Cross';

// Eén paginabanner voor alle pagina's, met de titel als echte tekst (schaalt mee, voorleesbaar, nooit afgesneden).
// Achtergrond per pagina (alle 11): public/images/heroes/web/hero-<id>.webp (vanaf 768px, brede strook van ongeveer 8:1)
// en public/images/heroes/mobiel/hero-<id>.webp (mobiel). De desktopbanner is daarom laag (index.css, Bouw 105).
// Opmaak: Bouw 83 in index.css. `kop`: de titel is de h1 van de pagina (alleen waar de pagina zelf geen h1 heeft).


const volgHash = (melding: () => void) => {
  window.addEventListener('hashchange', melding);
  return () => window.removeEventListener('hashchange', melding);
};

type Props = { id: string; titel: string; ondertitel?: string; citaat?: string; kop?: boolean };

export default function PageHero({ id, titel, ondertitel, citaat, kop = false }: Props) {
  // De banner van de pagina die open staat laadt meteen en met voorrang; die van verborgen pagina's pas als ze in beeld komen.
  const open = useSyncExternalStore(volgHash, () => window.location.hash.slice(1).split('/')[0] === id);
  const Titel = kop ? 'h1' : 'p';
  return (
    <section id={id} className="bg-bark page-hero-crop page-hero">
      <picture>
        {/* Mobiel: een eigen, smallere banner per pagina (public/images/heroes/mobiel), zodat het beeld niet wegvalt in de uitsnede */}
        <source media="(max-width: 767.98px)" srcSet={`/images/heroes/mobiel/hero-${id}.webp`} />
        <img
          className="page-hero-beeld"
          loading={open ? 'eager' : 'lazy'}
          fetchPriority={open ? 'high' : 'auto'}
          decoding="async"
          src={`/images/heroes/web/hero-${id}.webp`}
          alt=""
        />
      </picture>
      <div className="page-hero-tekst">
        <span className="page-hero-kruis" aria-hidden="true">
          <Cross className="h-full w-full" />
        </span>
        <Titel className="page-hero-titel">{titel}</Titel>
        {ondertitel && <p className="page-hero-ondertitel">{ondertitel}</p>}
        <span className="page-hero-lijn" aria-hidden="true">
          <i />◆<i />
        </span>
        {citaat && <p className="page-hero-citaat">{citaat}</p>}
      </div>
    </section>
  );
}
