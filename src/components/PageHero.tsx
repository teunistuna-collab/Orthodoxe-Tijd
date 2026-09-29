import { useSyncExternalStore } from 'react';

// Eén paginabanner voor alle pagina's: public/images/heroes/hero-<id>.webp (1800×288).
// Hoogte, verhouding en uitsnede staan centraal in index.css (.page-hero-crop).
// De paginanaam staat als beeld in de banner; met `kop` krijgt de pagina daarnaast een onzichtbare h1 voor
// schermlezers (alleen op pagina's die verder geen h1 hebben). De tekst is het deel van alt vóór " — ".

const volgHash = (melding: () => void) => {
  window.addEventListener('hashchange', melding);
  return () => window.removeEventListener('hashchange', melding);
};

export default function PageHero({ id, alt, kop = false }: { id: string; alt: string; kop?: boolean }) {
  // De banner van de pagina die open staat laadt meteen en met voorrang (geen leeg blok bij direct openen, bv. vanaf
  // het beginscherm of een gedeelde link); die van de andere, verborgen pagina's pas als ze in beeld komen.
  const open = useSyncExternalStore(volgHash, () => window.location.hash.slice(1).split('/')[0] === id);
  return (
    <section id={id} className="bg-bark page-hero-crop">
      {kop && <h1 className="sr-only">{alt.split(' — ')[0]}</h1>}
      <img loading={open ? 'eager' : 'lazy'} fetchPriority={open ? 'high' : 'auto'} decoding="async" src={`/images/heroes/hero-${id}.webp`} width={1800} height={288} alt={alt} />
    </section>
  );
}
