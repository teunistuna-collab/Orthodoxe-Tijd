import { HEILIGEN } from './heiligen';
import { getSaintEnrichment } from './saintEnrichment';
import { rangLabel, vertaalLeven, type HtcData } from './htc';
import { formatMd } from './kalender';
import { heiligeIcoon, lageLandenTekst } from './heiligenIconen';

// Gedeeld door de Heiligen-pagina en de pop-up "Heiligen van de dag" (Vandaag, mobiel).

export type Resultaat = { md: string; naam: string; ruwNaam?: string; titel?: string; kort?: string; nl?: boolean; bron: 'nl' | 'htc'; rang?: number };

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

/** Alle heiligen en gedachtenissen van één kerkelijke dag (sleutel zoals '9-7'). */
export function heiligenVanDag(kerkKey: string, htc: HtcData | null): Resultaat[] {
  const curated: Resultaat[] = (HEILIGEN[kerkKey] ?? []).map((h) => ({ ...h, md: kerkKey, bron: 'nl' }));
  const gezien = new Set(curated.map((h) => normaliseer(h.ruwNaam ?? h.naam)));
  const extra: Resultaat[] = (htc?.[kerkKey]?.l ?? [])
    .map(([icon, tekst]) => ({ md: kerkKey, naam: vertaalLeven(tekst).replace(/\.$/, ''), kort: vertaalLeven(tekst).replace(/\.$/, ''), bron: 'htc' as const, rang: rangLabel(icon)?.rang }))
    .filter((h) => ![...gezien].some((g) => normaliseer(h.naam).includes(g) || g.includes(normaliseer(h.naam))));
  return [...curated, ...extra];
}
