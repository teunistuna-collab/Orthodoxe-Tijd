import type { Heilige } from './heiligen';
import { getSaintEnrichment } from './saintEnrichment';
import { rangLabel, vertaalLeven, type HtcData } from './htc';
import { formatMd } from './kalender';
import { heiligeIcoon, lageLandenTekst } from './heiligenIconen';
import { isVastNotitie, soortVan } from './heiligenSoort';

// Gedeeld door de Heiligen-pagina en de pop-up "Heiligen van de dag" (Vandaag, mobiel).

export type Resultaat = { md: string; naam: string; ruwNaam?: string; titel?: string; kort?: string; nl?: boolean; bron: 'nl' | 'htc'; rang?: number; bronTekst?: string };

/** Alle tekst van een heilige (Nederlands en, bij holytrinityorthodox.com, de Engelse bron) voor lib/heiligenSoort.ts. */
export const tekstVoorIndeling = (h: Resultaat) => `${h.bronTekst ?? ''} ${h.ruwNaam ?? ''} ${h.naam} ${h.titel ?? ''}`;

export function normaliseer(tekst: string) {
  return tekst.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Inhoud van de leespop-up met de levensbeschrijving van één heilige. */
export function popupContent(h: Resultaat | null) {
  if (!h) return null;
  const extra = getSaintEnrichment(h.ruwNaam ?? h.naam);
  const meta = extra ? [extra.rang, extra.regio, extra.eeuw].filter(Boolean).join(' · ') : '';
  const paragraphs = lageLandenTekst(h) ?? (extra?.leven ? [extra.leven] : (h.kort ? [h.kort] : ['Voor deze heilige is nog geen betrouwbare uitgebreide Nederlandse levensbeschrijving beschikbaar.']));
  const icoon = heiligeIcoon(h);
  return { title: h.naam, image: icoon ? { src: icoon.src, alt: icoon.alt } : undefined, subtitle: `${formatMd(h.md)}${h.titel ? ` · ${h.titel}` : ''}${meta ? ` · ${meta}` : ''}`, paragraphs };
}

/** Hoort deze regel bij de getoonde dag (ymd)? Aan een jaar gebonden regels ("Zaterdag vóór …", beweeglijke
 *  gedachtenissen) alleen als de dag in het jaar van de bron valt; bronDatum is de datum uit dagen.json (veld c). */
export function hoortBijDag(tekst: string, bronDatum: string | undefined, ymd: string): boolean {
  return bronDatum === ymd || soortVan(tekst) !== 'wisselend';
}

const tekstVan = (h: Heilige) => `${h.ruwNaam ?? ''} ${h.naam} ${h.titel}`;

/** De eerste echte heilige van een dag (geen feest, notitie of icoon), voor de titel van de dag. */
export function eersteHeilige(lijst: Heilige[] | undefined): Heilige | undefined {
  return lijst?.find((h) => soortVan(tekstVan(h)) === 'heilige');
}

/** "H." ervoor, behalve als de naam al met een aanduiding begint ("Profeet …", "Eerbiedwaardige …", "HH. …"). */
export function heiligeTitel(naam: string): string {
  return /^(h\.|hh\.|heilige|profe|apostel|martela|grootmartela|priestermartela|nieuwe|eerbiedwaardige|rechtvaardige|maagd|zalige|synaxis|gedachtenis|overbrenging|vinding|ontslaping|alle |belijder|dwaas)/i.test(naam) ? naam : `H. ${naam}`;
}

/** Alle heiligen en gedachtenissen van één kerkelijke dag (sleutel zoals '9-7'); ymd is de getoonde burgerlijke dag. */
// dubbel = de uit de eigen lijst weggelaten dubbelen (DUBBEL in lib/heiligen.ts), zodat die ook uit de bronregels wegblijven.
export function heiligenVanDag(kerkKey: string, htc: HtcData | null, eigen: Record<string, Heilige[]> | undefined, ymd: string, dubbel?: Record<string, string[]>): Resultaat[] {
  const bronDatum = htc?.[kerkKey]?.c;
  const curated: Resultaat[] = (eigen?.[kerkKey] ?? []).filter((h) => hoortBijDag(tekstVan(h), bronDatum, ymd) && !isVastNotitie(tekstVan(h))).map((h) => ({ ...h, md: kerkKey, bron: 'nl' }));
  const gezien = new Set([...curated.map((h) => h.ruwNaam ?? h.naam), ...(dubbel?.[kerkKey] ?? [])].map(normaliseer));
  const extra: Resultaat[] = (htc?.[kerkKey]?.l ?? [])
    .filter(([, tekst]) => hoortBijDag(tekst, bronDatum, ymd) && !isVastNotitie(tekst))
    .map(([icon, tekst]) => ({ md: kerkKey, naam: vertaalLeven(tekst).replace(/\.$/, ''), kort: vertaalLeven(tekst).replace(/\.$/, ''), bron: 'htc' as const, rang: rangLabel(icon)?.rang, bronTekst: tekst }))
    .filter((h) => ![...gezien].some((g) => normaliseer(h.naam).includes(g) || g.includes(normaliseer(h.naam))));
  return [...curated, ...extra];
}
