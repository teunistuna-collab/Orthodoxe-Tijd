import type { Heilige } from './heiligen';
import { formatMd, parseYmd } from './kalender';
import { heiligeIcoon, lageLandenTekst } from './heiligenIconen';

// Gedeeld door Vandaag, Kalender, de Heiligen-pagina en de pop-up "Heiligen van de dag". Eén bron: lib/heiligen.ts
// (Heiligenjaar + Heiligen van de Lage Landen); de volledige teksten laadt lib/heiligenjaarTekst.ts per maand.

export type Resultaat = Heilige & { md: string; bron: 'hj' | 'nl' };

/** Tekst voor de categorieën op de Heiligen-pagina: namen en het begin van de brontekst. */
export const tekstVoorIndeling = (h: Resultaat) => `${h.opening ?? ''} ${h.naam} ${h.titel ?? ''}`;

export function normaliseer(tekst: string) {
  return tekst.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const metBron = (md: string) => (h: Heilige): Resultaat => ({ ...h, md, bron: h.nl ? 'nl' : 'hj' });

/** Alle vermeldingen van één kerkelijke dag (sleutel zoals '9-7'); ymd is de getoonde burgerlijke dag.
 *  Een jaar zonder 29 februari: de bron zegt dat die gedachtenis dan op 28 februari valt. */
export function vermeldingenVanDag(kerkKey: string, eigen: Record<string, Heilige[]> | undefined, ymd: string): Resultaat[] {
  const lijst = (eigen?.[kerkKey] ?? []).map(metBron(kerkKey));
  if (kerkKey === '2-28') {
    const jaar = parseYmd(ymd).getUTCFullYear();
    const schrikkel = (jaar % 4 === 0 && jaar % 100 !== 0) || jaar % 400 === 0;
    if (!schrikkel) lijst.push(...(eigen?.['2-29'] ?? []).map(metBron('2-29')));
  }
  return lijst;
}

/** Heiligen en andere gedachtenissen van de dag; de feesten van de dag staan apart (feestenUitHeiligenjaar, lib/kalender.ts). */
export function heiligenVanDag(kerkKey: string, eigen: Record<string, Heilige[]> | undefined, ymd: string): Resultaat[] {
  return vermeldingenVanDag(kerkKey, eigen, ymd).filter((h) => h.type !== 'feast');
}

/** De feesten die het Heiligenjaar op deze dag noemt. */
export function feestenUitHeiligenjaar(kerkKey: string, eigen: Record<string, Heilige[]> | undefined, ymd: string): Resultaat[] {
  return vermeldingenVanDag(kerkKey, eigen, ymd).filter((h) => h.type === 'feast');
}

/** De eerste heilige van een dag (geen feest of andere gedachtenis), voor de titel van de dag. */
export function eersteHeilige(lijst: Heilige[] | undefined): Heilige | undefined {
  return lijst?.find((h) => h.type === 'saint');
}

/** "H." ervoor, behalve als de naam al met een aanduiding begint ("Profeet …", "Eerbiedwaardige …", "HH. …"). */
export function heiligeTitel(naam: string): string {
  return /^(h\.|hh\.|heilige|profe|apostel|martela|grootmartela|priestermartela|nieuwe|eerbiedwaardige|rechtvaardige|maagd|zalige|synaxis|gedachtenis|overbrenging|vinding|ontslaping|alle |belijder|dwaas|\d)/i.test(naam) ? naam : `H. ${naam}`;
}

/** Inhoud van de leespop-up van één heilige. tekst = de volledige brontekst uit het Heiligenjaar (of null zolang die laadt).
 *  Bij een Heilige van de Lage Landen eerst de eigen levensbeschrijving, daarna (als dezelfde persoon in het
 *  Heiligenjaar staat) de tekst uit het Heiligenjaar. */
export function popupContent(h: Resultaat | null, tekst: string[] | null) {
  if (!h) return null;
  const laden = ['De tekst wordt geladen…'];
  const eigen = h.nl ? lageLandenTekst(h) ?? (h.kort ? [h.kort] : null) : null;
  const icoon = heiligeIcoon(h);
  return {
    title: h.naam,
    eyebrow: h.nl ? 'Heilige van de Lage Landen' : undefined,
    image: icoon ? { src: icoon.src, alt: icoon.alt } : undefined,
    subtitle: `${formatMd(h.md)}${h.titel && h.titel !== h.naam ? ` · ${h.titel}` : ''}`,
    paragraphs: eigen ?? (h.nl && !h.heiligenjaar ? [] : tekst ?? laden),
    ...(eigen && h.heiligenjaar ? { sections: [{ heading: 'Uit het Heiligenjaar', paragraphs: tekst ?? laden }] } : {}),
  };
}
