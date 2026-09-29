import { useSyncExternalStore } from 'react';
import Cross from './Cross';

// Eén paginabanner voor alle pagina's, met de titel als echte tekst (schaalt mee, voorleesbaar, nooit afgesneden).
// Achtergrond: public/images/heroes/zonder-tekst/hero-<id>.webp; pagina's zonder eigen banner gebruiken banner_08.webp.
// Opmaak: Bouw 83 in index.css. `kop`: de titel is de h1 van de pagina (alleen waar de pagina zelf geen h1 heeft).

const EIGEN_BANNER = new Set(['adem', 'etmaal', 'week', 'jaar', 'pascha', 'feesten', 'heiligen']);

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
      <img
        className="page-hero-beeld"
        loading={open ? 'eager' : 'lazy'}
        fetchPriority={open ? 'high' : 'auto'}
        decoding="async"
        src={`/images/heroes/zonder-tekst/${EIGEN_BANNER.has(id) ? `hero-${id}` : 'banner_08'}.webp`}
        alt=""
      />
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
