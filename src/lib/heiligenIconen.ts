import { LAGE_LANDEN_TEKSTEN } from './lageLandenTeksten';

/** Iconen van de Heiligen van de Lage Landen (detail uit het icoon "Heiligen van de Lage Landen"). */
export type HeiligeIcoon = { src: string; alt: string; slug: string; naam: string };

const LAGE_LANDEN: Array<{ slug: string; naam: string }> = [
  { slug: 'willibrord', naam: 'Willibrord' },
  { slug: 'bonifatius', naam: 'Bonifatius' },
  { slug: 'servatius', naam: 'Servatius' },
  { slug: 'lambertus', naam: 'Lambertus' },
  { slug: 'amandus', naam: 'Amandus' },
  { slug: 'werenfried', naam: 'Werenfried' },
  { slug: 'jeroen', naam: 'Jeroen' },
  { slug: 'adelbert', naam: 'Adelbert' },
  { slug: 'radboud', naam: 'Radboud' },
  { slug: 'bavo', naam: 'Bavo' },
  { slug: 'gertrudis', naam: 'Gertrudis' },
  { slug: 'walburgis', naam: 'Walburgis' },
  { slug: 'oda', naam: 'Oda' },
  { slug: 'cunera', naam: 'Cunera' },
  { slug: 'dymphna', naam: 'Dymphna' },
];

const PER_SLUG = new Map(LAGE_LANDEN.map((h) => [h.slug, h]));

function maakIcoon(h: { slug: string; naam: string }): HeiligeIcoon {
  return {
    ...h,
    src: `/images/heiligen/${h.slug}.webp`,
    alt: `Icoon van de heilige ${h.naam}, detail uit ‘Heiligen van de Lage Landen’`,
  };
}

const TITELWOORDEN = new Set(['eerbiedwaardige', 'h.', 'heilige', 'de']);

function eersteWoord(naam: string) {
  const woorden = naam
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[\s(,]+/)
    .filter(Boolean);
  return woorden.find((w) => !TITELWOORDEN.has(w)) ?? '';
}

function slugVan(h: { naam: string; ruwNaam?: string; nl?: boolean }) {
  if (!h.nl) return null;
  const slug = eersteWoord(h.ruwNaam ?? h.naam);
  return PER_SLUG.has(slug) ? slug : null;
}

/**
 * Icoon bij een heilige uit de database. Alleen heiligen die als "Lage Landen" gemarkeerd zijn
 * krijgen een icoon, zodat bijvoorbeeld de martelaar Bonifatius van Tarsus geen verkeerd portret krijgt.
 */
export function heiligeIcoon(h: { naam: string; ruwNaam?: string; nl?: boolean }): HeiligeIcoon | null {
  const slug = slugVan(h);
  return slug ? maakIcoon(PER_SLUG.get(slug)!) : null;
}

/** Levensbeschrijving (uit het Word-document) van een heilige van de Lage Landen, of null. */
export function lageLandenTekst(h: { naam: string; ruwNaam?: string; nl?: boolean }): string[] | null {
  const slug = slugVan(h);
  return slug ? (LAGE_LANDEN_TEKSTEN[slug] ?? null) : null;
}
