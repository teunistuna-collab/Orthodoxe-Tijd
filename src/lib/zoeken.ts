import { GEBEDEN, type Gebed } from './gebeden';
import { BEWEEGLIJKE_FEESTEN, DERTIEN, OVERIGE_VASTE, type Feest } from './feesten';
import type { HeiligeMetDatum } from './heiligen';
import { rangLabel, vertaalLeven, type HtcData } from './htc';
import { addDays, formatLang, formatMd, MAANDEN, MAANDEN_KORT, orthodoxPascha, utc, ymd, type Mode } from './kalender';
import { volgendeFeestDatum } from './overzicht';
import { normaliseer, type Resultaat } from './heiligenPopup';
import { PSALMEN, zoekPsalmen } from './psalmen';

// Centraal zoeken over bestaande inhoud: pagina's, psalmen, gebeden, feesten, heiligen en datums.
// Losse, React-vrije logica, zodat een latere app dezelfde index kan gebruiken.

export type ZoekTreffer =
  | { soort: 'pagina'; titel: string; onder: string; id: string }
  | { soort: 'gebed'; titel: string; onder: string; gebed: Gebed }
  | { soort: 'feest'; titel: string; onder: string; feest: Feest; datum: Date }
  | { soort: 'heilige'; titel: string; onder: string; heilige: Resultaat }
  | { soort: 'datum'; titel: string; onder: string; ymd: string }
  | { soort: 'psalm'; titel: string; onder: string; nr: number };

export interface ZoekGroep {
  titel: string;
  items: ZoekTreffer[];
}

const PAGINAS: { id: string; titel: string; onder: string; extra?: string }[] = [
  { id: 'vandaag', titel: 'Vandaag', onder: 'De dag van vandaag' },
  { id: 'kalender', titel: 'Kalender', onder: 'De kerkelijke kalender per maand', extra: 'maand datum' },
  { id: 'adem', titel: 'Adem', onder: 'Het Jezusgebed en korte gebeden', extra: 'ademcyclus jezusgebed gebedssnoer' },
  { id: 'etmaal', titel: 'Etmaal', onder: 'De gebeden van dag en nacht', extra: 'uren metten vespers completen middernachtdienst psalmen psalm' },
  { id: 'week', titel: 'Week', onder: 'Van zondag tot zaterdag', extra: 'weekcyclus weekdagen' },
  { id: 'jaar', titel: 'Jaar', onder: 'Het ritme van het kerkelijk jaar', extra: 'jaarcyclus kerkelijk jaar' },
  { id: 'pascha', titel: 'Pascha', onder: 'De paschale cyclus', extra: 'pasen paascyclus' },
  { id: 'gebeden', titel: 'Gebeden', onder: 'Het gebedenboek', extra: 'gebedenboek' },
  { id: 'vasten', titel: 'Vasten', onder: 'Vasten vandaag en de vastenperioden', extra: 'vastendag vastenperiode' },
  { id: 'heiligen', titel: 'Heiligen', onder: 'Alle heiligen per dag en maand' },
  { id: 'feesten', titel: 'Feesten', onder: 'Pascha en de grote feesten' },
  { id: 'psalmen', titel: 'Psalmen', onder: 'Het psalter in de Septuagint-vertaling', extra: 'psalter psalm' },
  { id: 'bronnen', titel: 'Bronnen', onder: 'Bronnen & verwijzingen' },
];

type Ingang<T> = { waarde: T; sleutel: string; tekst?: string };

export interface ZoekIndex {
  gebeden: Ingang<Gebed>[];
  feesten: Ingang<Feest>[];
  heiligen: Ingang<Resultaat>[];
}

/** Bouwt de index één keer (en opnieuw zodra de heiligendata van holytrinityorthodox binnen is). */
export function bouwIndex(htc: HtcData | null, ALLE_HEILIGEN: HeiligeMetDatum[]): ZoekIndex {
  const feesten = new Map<string, Feest>();
  for (const f of [...DERTIEN, ...BEWEEGLIJKE_FEESTEN, ...OVERIGE_VASTE]) if (!feesten.has(f.id)) feesten.set(f.id, f);

  // Zelfde samenvoeging als de Heiligen-pagina: eerst de eigen lijst, daarna de rest zonder dubbelen.
  // Feesten die ook in de heiligenlijst van holytrinityorthodox staan ("De Verheffing van het Kruis") tonen we alleen bij Feesten.
  const zonderLidwoord = (t: string) => normaliseer(t).replace(/^(de|het) /, '');
  const feestNamen = new Set([...feesten.values()].map((f) => zonderLidwoord(f.naam)));
  // Slotpunt weg, behalve bij een afkorting als "n.Chr."
  const zonderPunt = (t: string) => t.trim().replace(/(?<!\.\S*)\.$/, '');
  const heiligen: Ingang<Resultaat>[] = ALLE_HEILIGEN.filter((h) => !feestNamen.has(zonderLidwoord(zonderPunt(h.naam)))).map((h) => {
    const naam = zonderPunt(h.naam);
    // Een titel die (bijna) de naam herhaalt, voegt niets toe als ondertitel.
    const [n, t] = [normaliseer(naam), normaliseer(zonderPunt(h.titel ?? ''))];
    const titel = t && !n.includes(t) && !t.includes(n) ? h.titel : undefined;
    return { waarde: { ...h, naam, titel, bron: 'nl' as const }, sleutel: normaliseer(`${naam}|${titel ?? ''}`) };
  });
  if (htc) {
    const gezien = new Set(ALLE_HEILIGEN.map((h) => `${h.md}|${normaliseer(h.ruwNaam ?? h.naam)}`));
    for (const [md, d] of Object.entries(htc)) {
      for (const [icon, tekst] of d.l ?? []) {
        const naam = zonderPunt(vertaalLeven(tekst));
        const sleutel = normaliseer(naam);
        if (gezien.has(`${md}|${sleutel}`) || feestNamen.has(zonderLidwoord(naam))) continue;
        gezien.add(`${md}|${sleutel}`);
        heiligen.push({ waarde: { md, naam, kort: naam, bron: 'htc', rang: rangLabel(icon)?.rang }, sleutel });
      }
    }
  }

  return {
    gebeden: GEBEDEN.map((g) => ({ waarde: g, sleutel: normaliseer(`${g.titel}|${g.wanneer}|${g.categorie}`), tekst: normaliseer(g.tekst) })),
    feesten: [...feesten.values()].map((f) => ({ waarde: f, sleutel: normaliseer(`${f.naam}|${f.kort ?? ''}`) })),
    heiligen,
  };
}

// Sleutels zijn velden gescheiden door "|" (naam|korte naam, titel|moment|categorie).
// 0 = een veld begint ermee, 1 = een woord begint ermee, 2 = komt erin voor, 3 = alleen in de gebedstekst
function score(q: string, sleutel: string, tekst?: string): number | null {
  if (sleutel.startsWith(q) || sleutel.includes(`|${q}`)) return 0;
  const i = sleutel.indexOf(q);
  if (i > 0) return /[\s(„'-]/.test(sleutel[i - 1]) ? 1 : 2;
  if (tekst?.includes(q)) return 3;
  return null;
}

// Gelijke score: eerst het zwaarste gewicht (liturgische rang, eigen lijst), daarna alfabetisch.
// Geeft ook de beste score terug, zodat de sterkste groep bovenaan komt.
function beste<T>(q: string, lijst: Ingang<T>[], max: number, naam: (t: T) => string, gewicht: (t: T) => number = () => 0): { items: T[]; top: number } {
  const hits: { t: T; s: number }[] = [];
  for (const x of lijst) {
    const s = score(q, x.sleutel, x.tekst);
    if (s !== null) hits.push({ t: x.waarde, s });
  }
  hits.sort((a, b) => a.s - b.s || gewicht(b.t) - gewicht(a.t) || naam(a.t).localeCompare(naam(b.t), 'nl'));
  return { items: hits.slice(0, max).map((h) => h.t), top: hits[0]?.s ?? 9 };
}

function maandUit(woord: string): number | null {
  if (woord.length < 3) return null;
  const i = MAANDEN.findIndex((m, n) => m.startsWith(woord) || MAANDEN_KORT[n] === woord);
  return i === -1 ? null : i + 1;
}

function geldig(j: number, m: number, d: number): boolean {
  return j >= 1900 && j <= 2099 && m >= 1 && m <= 12 && d >= 1 && d <= new Date(Date.UTC(j, m, 0)).getUTCDate();
}

/** Herkent "vandaag", "morgen", "6 augustus", "6 aug 2027", "6-8", "6/8/2027" en "pascha 2027". */
export function leesDatum(invoer: string, vandaag: Date): { label: string; datum: Date } | null {
  const q = normaliseer(invoer.trim()).replace(/\s+/g, ' ');
  const jaar = vandaag.getUTCFullYear();
  if (q === 'vandaag') return { label: 'Vandaag', datum: vandaag };
  if (q === 'morgen') return { label: 'Morgen', datum: addDays(vandaag, 1) };
  if (q === 'gisteren') return { label: 'Gisteren', datum: addDays(vandaag, -1) };

  const pascha = q.match(/^(pascha|pasen)(?: (\d{4}))?$/);
  if (pascha) {
    const j = pascha[2] ? Number(pascha[2]) : jaar;
    return j >= 1900 && j <= 2099 ? { label: `Pascha ${j}`, datum: orthodoxPascha(j) } : null;
  }

  let d: number | undefined, m: number | null | undefined, j = jaar;
  const metWoord = q.match(/^(\d{1,2}) ([a-z]+)\.?(?: (\d{4}))?$/);
  const metCijfers = q.match(/^(\d{1,2})[-/.](\d{1,2})(?:[-/.](\d{4}))?$/);
  if (metWoord) [d, m, j] = [Number(metWoord[1]), maandUit(metWoord[2]), metWoord[3] ? Number(metWoord[3]) : jaar];
  else if (metCijfers) [d, m, j] = [Number(metCijfers[1]), Number(metCijfers[2]), metCijfers[3] ? Number(metCijfers[3]) : jaar];
  if (d === undefined || !m || !geldig(j, m, d)) return null;
  const datum = utc(j, m, d);
  return { label: formatLang(datum), datum };
}

export function zoek(invoer: string, index: ZoekIndex, vandaag: Date, mode: Mode): ZoekGroep[] {
  const q = normaliseer(invoer.trim()).replace(/\s+/g, ' ');
  if (q.length < 2) return [];
  const groepen: (ZoekGroep & { top: number })[] = [];

  const datum = leesDatum(invoer, vandaag);
  if (datum) groepen.push({ titel: 'Datum', top: -1, items: [{ soort: 'datum', titel: datum.label, onder: 'Open deze dag: vasten, feesten, heiligen en lezingen', ymd: ymd(datum.datum) }] });

  const paginas = PAGINAS.map((p) => ({ p, s: score(q, normaliseer(p.titel), normaliseer(p.extra ?? '')) })).filter((x): x is { p: (typeof PAGINAS)[number]; s: number } => x.s !== null);
  if (paginas.length) groepen.push({ titel: "Pagina's", top: Math.min(...paginas.map((x) => x.s)), items: paginas.slice(0, 4).map(({ p }) => ({ soort: 'pagina', titel: p.titel, onder: p.onder, id: p.id })) });

  // Psalmen op nummer ("50", "Psalm 50") of op dienst en onderdeel in het etmaal ("vespers", "hexapsalm"); alleen "psalm" is te vaag.
  if (q.replace(/^psalm\s*/, '')) {
    const psalmen = zoekPsalmen(PSALMEN, q, null).slice(0, 6);
    if (psalmen.length)
      groepen.push({
        titel: 'Psalmen',
        top: /\d/.test(q) ? 0 : 1,
        items: psalmen.map((p) => ({ soort: 'psalm', titel: p.title, onder: p.liturgicalUses.length ? `Etmaal · ${p.liturgicalUses.map((g) => g.dienst).join(', ')}` : 'Psalter', nr: p.septuagintNumber })),
      });
  }

  const gebeden = beste(q, index.gebeden, 6, (g) => g.titel);
  if (gebeden.items.length) groepen.push({ titel: 'Gebeden', top: gebeden.top, items: gebeden.items.map((g) => ({ soort: 'gebed', titel: g.titel, onder: g.wanneer, gebed: g })) });

  const feesten = beste(q, index.feesten, 6, (f) => f.naam, (f) => (f.id === 'pascha' ? 9 : f.groot ? 7 : f.rang ?? 0));
  if (feesten.items.length)
    groepen.push({
      titel: 'Feesten',
      top: feesten.top,
      items: feesten.items.map((f) => {
        const d = volgendeFeestDatum(f, vandaag, mode);
        return { soort: 'feest', titel: f.naam, onder: `${f.offset !== undefined ? 'Beweeglijk' : 'Vast'} · ${formatLang(d)}`, feest: f, datum: d };
      }),
    });

  const heiligen = beste(q, index.heiligen, 8, (h) => h.naam, (h) => (h.bron === 'nl' ? 10 : 0) + (h.rang ?? 0));
  if (heiligen.items.length) groepen.push({ titel: 'Heiligen', top: heiligen.top, items: heiligen.items.map((h) => ({ soort: 'heilige', titel: h.naam, onder: `${formatMd(h.md)}${h.titel ? ` · ${h.titel}` : ''}`, heilige: h })) });

  // Sterkste groep eerst; bij gelijke sterkte de vaste volgorde (datum, pagina's, gebeden, feesten, heiligen).
  return groepen.sort((a, b) => a.top - b.top).map(({ titel, items }) => ({ titel, items }));
}
