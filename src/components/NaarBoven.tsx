import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

// Zwevende "naar boven"-knop voor lange pagina's (Psalmen, Heiligen): verschijnt na 700px, en alleen zolang je omhoog scrolt,
// zodat hij tijdens het lezen (omlaag scrollen) geen rijen of knoppen bedekt. Opmaak: index.css, Bouw 102.
export default function NaarBoven() {
  const [zichtbaar, setZichtbaar] = useState(false);
  useEffect(() => {
    let vorige = window.scrollY;
    const opScroll = () => {
      const y = window.scrollY;
      if (y <= 700) setZichtbaar(false);
      else if (y < vorige - 4) setZichtbaar(true);
      else if (y > vorige + 4) setZichtbaar(false);
      vorige = y;
    };
    window.addEventListener('scroll', opScroll, { passive: true });
    return () => window.removeEventListener('scroll', opScroll);
  }, []);
  return (
    <button
      type="button"
      className={`naar-boven${zichtbaar ? ' is-zichtbaar' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
      aria-label="Naar boven"
      tabIndex={zichtbaar ? 0 : -1}
      aria-hidden={!zichtbaar}
    >
      <ChevronUp aria-hidden="true" />
    </button>
  );
}
