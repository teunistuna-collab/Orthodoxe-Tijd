import { useState } from 'react';

// Het verdiepingsblok van de cycli (de vier onderwerpen met "Lees meer"), overal in dezelfde vorm: op het web vier
// rustige kolommen, op mobiel uitklapbare registerregels. Opmaak: index.css (.ad-verdieping, Bouw 181).

type Onderwerp<K extends string> = { key: K; title: string; intro?: string };

export default function Verdieping<K extends string>({ items, onOpen }: { items: ReadonlyArray<Onderwerp<K>>; onOpen: (key: K) => void }) {
  const [openRegel, setOpenRegel] = useState<K | null>(null);
  return (
    <section className="ad-verdieping" aria-label="Verdieping">
      {items.map(({ key, title, intro }) => (
        <div key={key} className="ad-onderdeel">
          <button type="button" className="ad-onderdeel-kop" aria-expanded={openRegel === key} onClick={() => setOpenRegel(openRegel === key ? null : key)}>
            <h3>{title}</h3>
            <span className="ad-pijl" aria-hidden="true">›</span>
          </button>
          <div className={`ad-onderdeel-inhoud${openRegel === key ? ' is-open' : ''}`}>
            {intro && <p>{intro}</p>}
            <button type="button" className="fs-link" onClick={() => onOpen(key)}>
              Lees meer ›
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
