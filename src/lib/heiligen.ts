import JAAR from './heiligenjaar.index.json';
import { LAGE_LANDEN } from './lageLanden';

// Centrale heiligen- en gedachtenislijst per kerkelijke dag (sleutel M-D, de kerkelijke datum uit lib/kalender.ts):
// - het Heiligenjaar (bron: source/heiligenjaar, ingelezen met scripts/heiligenjaar.mjs) voor alle algemene heiligen,
//   feesten en andere gedachtenissen; de volledige teksten staan per maand in public/data/heiligenjaar/MM.json;
// - de Heiligen van de Lage Landen (lib/lageLanden.ts) als eigen, aanvullende dataset.
// Deze module wordt apart geladen (App.tsx), zodat hij de eerste weergave niet ophoudt.

export type Soort = 'saint' | 'feast' | 'other';

export interface Heilige {
  /** Id in het Heiligenjaar (hj-MMDD-n); Lage Landen: ll-<datum>-<naam>. */
  id: string;
  /** Naam zoals getoond: de vetgedrukte namen uit de bron, of de naam uit de Lage Landen-lijst. */
  naam: string;
  /** Alleen bij de Lage Landen (het Heiligenjaar heeft geen aparte titel). */
  titel: string;
  /** Korte omschrijving; alleen bij de Lage Landen. */
  kort: string;
  type: Soort;
  /** Heilige van de Lage Landen */
  nl?: boolean;
  /** Afzonderlijke vetgedrukte namen uit de bron (zoeken). */
  namen?: string[];
  /** Begin van de brontekst (voor de categorieën op de Heiligen-pagina). */
  opening?: string;
  /** Bij de Lage Landen: dezelfde persoon in het Heiligenjaar (zie lib/lageLanden.ts). */
  heiligenjaar?: string;
  /** Twijfelgeval uit de import (zie source/heiligenjaar/IMPORTRAPPORT.md). */
  needsReview?: boolean;
  /** Oude naam van het veld voor de Lage Landen-koppeling met iconen en teksten (lib/heiligenIconen.ts). */
  ruwNaam?: string;
}

type JaarVermelding = { id: string; title: string; names?: string[]; opening?: string; type: Soort; needsReview?: boolean };
const DAGEN = (JAAR as { importVersion: number; days: Record<string, JaarVermelding[]> }).days;
export const IMPORT_VERSIE = (JAAR as { importVersion: number }).importVersion;

// Heiligenjaar-vermeldingen die al als Heilige van de Lage Landen in de lijst staan (zelfde persoon): niet dubbel tonen.
const ALS_LAGE_LANDEN = new Set(LAGE_LANDEN.flatMap((h) => (h.heiligenjaar ? [h.heiligenjaar] : [])));

const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Alle vermeldingen per kerkelijke dag: Heiligenjaar (in bronvolgorde) en daarna de Heiligen van de Lage Landen. */
export const HEILIGEN: Record<string, Heilige[]> = {};
for (const [md, lijst] of Object.entries(DAGEN)) {
  HEILIGEN[md] = lijst
    .filter((v) => !ALS_LAGE_LANDEN.has(v.id))
    .map((v) => ({ id: v.id, naam: v.title, titel: '', kort: '', type: v.type, ...(v.names ? { namen: v.names } : {}), ...(v.opening ? { opening: v.opening } : {}), ...(v.needsReview ? { needsReview: true } : {}) }));
}
for (const h of LAGE_LANDEN) {
  const gekoppeld = h.heiligenjaar ? DAGEN[h.md]?.find((v) => v.id === h.heiligenjaar) : undefined;
  (HEILIGEN[h.md] ??= []).push({
    id: `ll-${h.md}-${slug(h.naam)}`, naam: h.naam, ruwNaam: h.naam, titel: h.titel, kort: h.kort, type: 'saint', nl: true,
    ...(h.heiligenjaar ? { heiligenjaar: h.heiligenjaar } : {}),
    ...(gekoppeld?.names ? { namen: gekoppeld.names } : {}),
    ...(gekoppeld?.opening ? { opening: gekoppeld.opening } : {}),
  });
}

export interface HeiligeMetDatum extends Heilige {
  md: string;
}

export const ALLE_HEILIGEN: HeiligeMetDatum[] = Object.entries(HEILIGEN).flatMap(([md, lijst]) => lijst.map((h) => ({ ...h, md })));
