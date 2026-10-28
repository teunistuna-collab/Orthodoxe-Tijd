import { naamVan, serviceConfig, slugVan } from './etmaal';
import { DERTIEN } from './feesten';
import { addDays, dagInfo, formatLang, utc, ymd, type Mode } from './kalender';

// De planning van de herinneringen, zonder browser of React: gedeeld door de app (lib/herinneringen.ts) en de pushserver
// (server/pushserver.ts), zodat beide precies hetzelfde berekenen. Alle tijden en datums komen uit de bestaande
// berekeningen: de uren uit lib/etmaal.ts (serviceConfig), vasten en feesten uit dagInfo() in lib/kalender.ts
// (vastenregels, uitzonderingen, vaste en beweeglijke feesten, gekozen kalender).

export type Vooraf = 0 | 15 | 30;
export interface Herinneringen {
  /** Titels uit serviceConfig waarvoor een herinnering aan staat. */
  uren: string[];
  vooraf: Vooraf;
  vasten: boolean;
  vastenMoment: 'avond' | 'ochtend' | 'beide';
  alleenGroteVasten: boolean;
  feesten: boolean;
  feestKeuze: 'alle' | 'eigen';
  feestIds: string[];
  feestMoment: 'ervoor' | 'dag';
}

export const STANDAARD: Herinneringen = { uren: [], vooraf: 0, vasten: false, vastenMoment: 'avond', alleenGroteVasten: false, feesten: false, feestKeuze: 'alle', feestIds: [], feestMoment: 'ervoor' };

/** Vaste meldtijden voor vasten en feesten: de avond ervoor om 20.00 uur, de dag zelf om 7.00 uur (lokale tijd). */
export const AVOND = 20;
export const OCHTEND = 7;
/** Een herinnering die meer dan tien minuten te laat is, wordt niet meer getoond of verstuurd. */
export const MARGE = 10 * 60_000;
/** De grote vastenperioden zoals lib/vasten.ts ze noemt (de Heilige Week hoort bij de Grote Vasten). */
const GROTE_VASTEN = ['Grote Vasten', 'Heilige Week', 'Apostelvasten', 'Dormitionvasten', 'Kerstvasten'];
const GROTE_FEESTEN = new Set(DERTIEN.map((f) => f.id));
const UREN = new Set(serviceConfig.map((s) => s.title));

export const ietsAan = (h: Herinneringen) => h.uren.length > 0 || h.vasten || (h.feesten && (h.feestKeuze === 'alle' || h.feestIds.length > 0));

/** Voorkeuren uit een onbetrouwbare bron (opslag, netwerk): alleen bekende velden en waarden. */
export function schoonVoorkeuren(v: unknown): Herinneringen {
  const o = v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
  const kies = <T>(x: unknown, opties: readonly T[], standaard: T): T => (opties.includes(x as T) ? (x as T) : standaard);
  const lijst = (x: unknown, mag: (s: string) => boolean) => (Array.isArray(x) ? [...new Set(x.filter((s): s is string => typeof s === 'string' && mag(s)))] : []);
  return {
    uren: lijst(o.uren, (s) => UREN.has(s)),
    vooraf: kies(o.vooraf, [0, 15, 30] as const, 0),
    vasten: o.vasten === true,
    vastenMoment: kies(o.vastenMoment, ['avond', 'ochtend', 'beide'] as const, 'avond'),
    alleenGroteVasten: o.alleenGroteVasten === true,
    feesten: o.feesten === true,
    feestKeuze: kies(o.feestKeuze, ['alle', 'eigen'] as const, 'alle'),
    feestIds: lijst(o.feestIds, (s) => GROTE_FEESTEN.has(s)),
    feestMoment: kies(o.feestMoment, ['ervoor', 'dag'] as const, 'ervoor'),
  };
}

/* ---------- Tijdzone ---------- */

/** Geldige IANA-tijdzone (bijv. "Europe/Amsterdam")? */
export function geldigeZone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const delen = (t: number, tz: string) => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
      .formatToParts(t)
      .map((x) => [x.type, Number(x.value)]),
  );
  return p as Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', number>;
};
const verschil = (t: number, tz: string) => {
  const p = delen(t, tz);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - t;
};

/** Een kloktijd op een kalenderdag (UTC-middernacht): in `tz`, of zonder tz in de tijdzone van dit apparaat. Zomer- en
 *  wintertijd gaan vanzelf goed; minuten onder nul (vooraf) schuiven naar de dag ervoor. */
export function kloktijd(dag: Date, uur: number, minuut = 0, tz?: string): Date {
  if (!tz) return new Date(dag.getUTCFullYear(), dag.getUTCMonth(), dag.getUTCDate(), uur, minuut);
  const gok = Date.UTC(dag.getUTCFullYear(), dag.getUTCMonth(), dag.getUTCDate(), uur, minuut);
  const t = gok - verschil(gok, tz);
  return new Date(gok - verschil(t, tz));
}

/** De datum van vandaag in `tz` (of op dit apparaat), als UTC-middernacht zoals lib/kalender.ts rekent. */
export function vandaagIn(tz?: string, nu = Date.now()): Date {
  if (!tz) {
    const n = new Date(nu);
    return utc(n.getFullYear(), n.getMonth() + 1, n.getDate());
  }
  const p = delen(nu, tz);
  return utc(p.year, p.month, p.day);
}

/* ---------- Planning ---------- */

export interface Melding {
  id: string;
  tijd: Date;
  titel: string;
  tekst: string;
  /** Het scherm dat een tik op de melding opent. */
  url: string;
}

/** Alle herinneringen van de dag ervoor tot twee dagen verder (rond `dag`), op tijd gesorteerd. */
export function meldingenRond(dag: Date, h: Herinneringen, mode: Mode, tz?: string): Melding[] {
  const uit: Melding[] = [];
  for (let i = -1; i <= 2; i++) {
    const d = addDays(dag, i);
    const sleutel = ymd(d);
    for (const s of serviceConfig) {
      if (!h.uren.includes(s.title)) continue;
      const [uur, minuut] = s.time.split(':').map(Number);
      uit.push({
        id: `uur:${s.title}:${sleutel}`, // zonder het moment: een andere keuze vooraf geeft geen tweede melding
        tijd: kloktijd(d, uur, minuut - h.vooraf, tz),
        titel: h.vooraf ? `Over ${h.vooraf} minuten: ${naamVan(s)}` : `Nu: ${naamVan(s)}`,
        tekst: s.hoofdgedachtenis,
        url: `#etmaal/${slugVan(s)}`,
      });
    }
    if (!h.vasten && !h.feesten) continue;
    const info = dagInfo(d, mode);
    const { vasten } = info;
    if (h.vasten && vasten.niveau !== 'vrij' && vasten.niveau !== 'geen' && (!h.alleenGroteVasten || GROTE_VASTEN.includes(vasten.periode ?? ''))) {
      const tekst = `${vasten.label}${vasten.periode ? ` · ${vasten.periode}` : ''}`;
      if (h.vastenMoment !== 'ochtend') uit.push({ id: `vasten:avond:${sleutel}`, tijd: kloktijd(addDays(d, -1), AVOND, 0, tz), titel: 'Morgen is een vastendag', tekst, url: `#vasten/${sleutel}` });
      if (h.vastenMoment !== 'avond') uit.push({ id: `vasten:ochtend:${sleutel}`, tijd: kloktijd(d, OCHTEND, 0, tz), titel: 'Vandaag is een vastendag', tekst, url: `#vasten/${sleutel}` });
    }
    if (h.feesten) {
      for (const f of info.feesten) {
        if (h.feestKeuze === 'alle' ? !GROTE_FEESTEN.has(f.id) : !h.feestIds.includes(f.id)) continue;
        const ervoor = h.feestMoment === 'ervoor';
        uit.push({
          id: `feest:${f.id}:${sleutel}`,
          tijd: ervoor ? kloktijd(addDays(d, -1), AVOND, 0, tz) : kloktijd(d, OCHTEND, 0, tz),
          titel: `${ervoor ? 'Morgen' : 'Vandaag'}: ${f.naam.split(' — ')[0]}`,
          tekst: formatLang(d),
          url: `#feesten/${f.id}`,
        });
      }
    }
  }
  return uit.sort((a, b) => a.tijd.getTime() - b.tijd.getTime());
}

/** Wat nu aan de beurt is: niet later dan MARGE en nog niet verstuurd (`verstuurd`: id → tijdstip). */
export const aanDeBeurt = (h: Herinneringen, mode: Mode, verstuurd: Record<string, number>, nu = Date.now(), tz?: string) =>
  meldingenRond(vandaagIn(tz, nu), h, mode, tz).filter((m) => m.tijd.getTime() <= nu && nu - m.tijd.getTime() < MARGE && !verstuurd[m.id]);

/** Verstuurd-administratie opschonen: ouder dan vier dagen kan niet meer terugkomen. */
export function vergeetOud(verstuurd: Record<string, number>, nu = Date.now()) {
  for (const [id, t] of Object.entries(verstuurd)) if (nu - t > 4 * 864e5) delete verstuurd[id];
}
