// Eén paginabanner voor alle pagina's: public/images/heroes/hero-<id>.webp (1800×288).
// Hoogte, verhouding en uitsnede staan centraal in index.css (.page-hero-crop).
// De paginanaam staat als beeld in de banner; met `kop` krijgt de pagina daarnaast een onzichtbare h1 voor
// schermlezers (alleen op pagina's die verder geen h1 hebben). De tekst is het deel van alt vóór " — ".
export default function PageHero({ id, alt, kop = false }: { id: string; alt: string; kop?: boolean }) {
  return (
    <section id={id} className="bg-bark page-hero-crop">
      {kop && <h1 className="sr-only">{alt.split(' — ')[0]}</h1>}
      <img loading="lazy" decoding="async" src={`/images/heroes/hero-${id}.webp`} width={1800} height={288} alt={alt} />
    </section>
  );
}
