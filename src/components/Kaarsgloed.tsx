import { useEffect, useRef, useState, type CSSProperties } from 'react';

// Een zachte, flakkerende gloed rond de kaarsvlammen die in de bannerafbeeldingen staan. De vlammen staan als
// percentage van de afbeelding (x, y) met een grootte (d, als deel van de afbeeldingsbreedte); omdat de banner per
// pagina en scherm anders wordt bijgesneden (object-fit: cover, object-position), wordt de plek op het scherm uit de
// echte afbeeldingsbox berekend. Decoratie: aria-hidden, geen klikvlak; zonder beweging bij prefers-reduced-motion (CSS).
const VLAMMEN: Record<string, [number, number, number][]> = {
  'kerk-header': [[7.1, 48, 7], [13.1, 67.5, 5], [89.8, 30, 4.5]],
  'kalender-banner': [[87.1, 18.5, 7]],
  'gebeden-banner': [[8.5, 43, 7], [87.1, 24.5, 5]],
  'vasten-banner': [[81.1, 32, 6.5]],
  'psalmen-adem-banner': [[8.5, 60.5, 6.5], [88.3, 42.5, 4.5]],
  'psalmen-banner': [[13, 43, 4.5], [83.6, 26, 3]],
  'cycli-banner': [[1.25, 44, 3], [5.5, 60, 3], [9.4, 79, 3], [96, 26, 2.6]],
};

type Plek = { x: number; y: number; d: number };

/** Leg in de kop (.vg-kop-achter) naast de bannerafbeelding. */
export default function Kaarsgloed() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [plekken, setPlekken] = useState<Plek[]>([]);

  useEffect(() => {
    const laag = ref.current;
    const vak = laag?.parentElement;
    if (!laag || !vak) return;
    let img: HTMLImageElement | null = null;
    const meet = () => {
      img = vak.querySelector<HTMLImageElement>('img.is-actief') ?? vak.querySelector<HTMLImageElement>('img');
      const naam = img?.currentSrc.split('/').pop()?.replace(/-(\d+|web-\d+)\.\w+$/, '') ?? '';
      const vlammen = VLAMMEN[naam];
      if (!img || !vlammen || !img.naturalWidth || !img.getBoundingClientRect().width) return setPlekken([]);
      // De echte beeldbox binnen het img-vak (object-fit: cover + object-position)
      const v = vak.getBoundingClientRect();
      const b = img.getBoundingClientRect();
      const schaal = Math.max(b.width / img.naturalWidth, b.height / img.naturalHeight);
      const w = img.naturalWidth * schaal;
      const h = img.naturalHeight * schaal;
      const [px, py] = getComputedStyle(img).objectPosition.split(' ').map((s) => parseFloat(s) / 100);
      const x0 = b.left - v.left + (b.width - w) * (Number.isFinite(px) ? px : 0.5);
      const y0 = b.top - v.top + (b.height - h) * (Number.isFinite(py) ? py : 0.5);
      setPlekken(vlammen.map(([x, y, d]) => ({ x: x0 + (x / 100) * w, y: y0 + (y / 100) * h, d: (d / 100) * w })));
    };
    meet();
    const ro = new ResizeObserver(meet);
    ro.observe(vak);
    // Pagina's staan verborgen klaar (App.tsx: .pagina-verborgen); meet opnieuw zodra deze pagina zichtbaar wordt.
    const pagina = vak.closest('.pagina');
    const zicht = new MutationObserver(() => window.setTimeout(meet, 30));
    if (pagina) zicht.observe(pagina, { attributes: true, attributeFilter: ['class'] });
    // Opnieuw meten als een (andere) afbeelding geladen is, bijvoorbeeld bij een srcset-wissel of een andere dienst.
    vak.addEventListener('load', meet, true);
    const mo = new MutationObserver(meet);
    mo.observe(vak, { subtree: true, attributes: true, attributeFilter: ['class', 'src'] });
    return () => {
      ro.disconnect();
      zicht.disconnect();
      mo.disconnect();
      vak.removeEventListener('load', meet, true);
    };
  }, []);

  return (
    <span ref={ref} className="kaarsgloed" aria-hidden="true">
      {plekken.map((p, i) => (
        <i key={i} style={{ left: p.x, top: p.y, '--d': `${Math.max(p.d, 18)}px`, '--duur': `${2.6 + (i % 3) * 0.7}s`, '--vertraging': `${-i * 0.9}s` } as CSSProperties} />
      ))}
    </span>
  );
}
