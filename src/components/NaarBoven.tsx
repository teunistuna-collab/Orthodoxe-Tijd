import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

// Zwevende "naar boven"-knop voor lange pagina's (Psalmen, Heiligen): verschijnt na 700px scrollen. Opmaak: index.css, Bouw 102.
export default function NaarBoven() {
  const [zichtbaar, setZichtbaar] = useState(false);
  useEffect(() => {
    const opScroll = () => setZichtbaar(window.scrollY > 700);
    opScroll();
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
