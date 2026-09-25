// Eén paginabanner voor alle pagina's: public/images/heroes/hero-<id>.webp (1800×288).
// Hoogte, verhouding en uitsnede staan centraal in index.css (.page-hero-crop).
export default function PageHero({ id, alt }: { id: string; alt: string }) {
  return (
    <section id={id} className="bg-bark page-hero-crop">
      <img loading="lazy" decoding="async" src={`/images/heroes/hero-${id}.webp`} width={1800} height={288} alt={alt} />
    </section>
  );
}
