import { useEffect, useSyncExternalStore } from 'react';
import { naamVan, serviceConfig, slugVan } from './etmaal';
import { DERTIEN } from './feesten';
import { addDays, dagInfo, formatLang, vandaag, ymd, type Mode } from './kalender';

// Herinneringen (Instellingen → Herinneringen): gebedsuren, vastendagen en heilige feesten.
// Alle tijden en datums komen uit de bestaande berekeningen: de uren uit lib/etmaal.ts (serviceConfig), vasten en feesten
// uit dagInfo() in lib/kalender.ts (vastenregels, uitzonderingen, vaste en beweeglijke feesten, gekozen kalender).
//
// Bezorging: er is (nog) geen server, dus geen Web Push. Zolang Orthodoxe Tijd open is, kijkt de app elke halve minuut of
// er een herinnering aan de beurt is en toont die als systeemmelding (via de serviceworker, public/sw.js, die bij een tik
// het juiste scherm opent). Is de app gesloten of door de telefoon stilgelegd, dan komt er geen melding.
// ponytail: alleen bezorging terwijl de app open is; voor een gesloten app is Web Push nodig (VAPID-sleutels, opslag van
// abonnementen en een server die op tijd verstuurt).

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
/** De grote vastenperioden zoals lib/vasten.ts ze noemt (de Heilige Week hoort bij de Grote Vasten). */
const GROTE_VASTEN = ['Grote Vasten', 'Heilige Week', 'Apostelvasten', 'Dormitionvasten', 'Kerstvasten'];
const GROTE_FEESTEN = new Set(DERTIEN.map((f) => f.id));

const SLEUTEL = 'herinneringen';
const VERSTUURD = 'herinneringen-verstuurd';
/** Een herinnering die meer dan tien minuten te laat is (app was dicht), wordt niet meer getoond. */
const MARGE = 10 * 60_000;

function lees(): Herinneringen {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(SLEUTEL) ?? '{}');
    return { ...STANDAARD, ...(v && typeof v === 'object' ? v : {}) };
  } catch {
    return STANDAARD;
  }
}
let huidig = lees();
const luisteraars = new Set<() => void>();
const meld = () => luisteraars.forEach((f) => f());
window.addEventListener('storage', (e) => {
  if (e.key !== SLEUTEL) return;
  huidig = lees();
  meld();
});

export function zetHerinneringen(w: Partial<Herinneringen>) {
  huidig = { ...huidig, ...w };
  try {
    localStorage.setItem(SLEUTEL, JSON.stringify(huidig));
  } catch {
    /* geen opslag: de keuze geldt dan alleen voor dit bezoek */
  }
  meld();
}

export function useHerinneringen(): Herinneringen {
  return useSyncExternalStore(
    (f) => {
      luisteraars.add(f);
      return () => luisteraars.delete(f);
    },
    () => huidig,
  );
}

export const ietsAan = (h: Herinneringen) => h.uren.length > 0 || h.vasten || (h.feesten && (h.feestKeuze === 'alle' || h.feestIds.length > 0));

/* ---------- Toestemming ---------- */

export type Toestemming = 'niet-ondersteund' | NotificationPermission;
export const toestemming = (): Toestemming => (typeof Notification === 'undefined' ? 'niet-ondersteund' : Notification.permission);

/** Alleen aanroepen vanuit een tik van de gebruiker (iPhone eist dat). */
export async function vraagToestemming(): Promise<Toestemming> {
  if (typeof Notification === 'undefined') return 'niet-ondersteund';
  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch {
      /* oudere browsers: toestemming blijft 'default' */
    }
  }
  return Notification.permission;
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

/** Een kloktijd op een kalenderdag (UTC-middernacht) in de tijdzone van het apparaat, met zomer- en wintertijd. */
const lokaal = (dag: Date, uur: number, minuut = 0) => new Date(dag.getUTCFullYear(), dag.getUTCMonth(), dag.getUTCDate(), uur, minuut);

/** Alle herinneringen van de dag ervoor tot twee dagen verder (rond `dag`), op tijd gesorteerd. */
export function meldingenRond(dag: Date, h: Herinneringen, mode: Mode): Melding[] {
  const uit: Melding[] = [];
  for (let i = -1; i <= 2; i++) {
    const d = addDays(dag, i);
    const sleutel = ymd(d);
    for (const s of serviceConfig) {
      if (!h.uren.includes(s.title)) continue;
      const [uur, minuut] = s.time.split(':').map(Number);
      uit.push({
        id: `uur:${s.title}:${sleutel}`, // zonder het moment: een andere keuze vooraf geeft geen tweede melding
        tijd: lokaal(d, uur, minuut - h.vooraf),
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
      if (h.vastenMoment !== 'ochtend') uit.push({ id: `vasten:avond:${sleutel}`, tijd: lokaal(addDays(d, -1), AVOND), titel: 'Morgen is een vastendag', tekst, url: `#vasten/${sleutel}` });
      if (h.vastenMoment !== 'avond') uit.push({ id: `vasten:ochtend:${sleutel}`, tijd: lokaal(d, OCHTEND), titel: 'Vandaag is een vastendag', tekst, url: `#vasten/${sleutel}` });
    }
    if (h.feesten) {
      for (const f of info.feesten) {
        if (h.feestKeuze === 'alle' ? !GROTE_FEESTEN.has(f.id) : !h.feestIds.includes(f.id)) continue;
        const ervoor = h.feestMoment === 'ervoor';
        uit.push({
          id: `feest:${f.id}:${sleutel}`,
          tijd: ervoor ? lokaal(addDays(d, -1), AVOND) : lokaal(d, OCHTEND),
          titel: `${ervoor ? 'Morgen' : 'Vandaag'}: ${f.naam.split(' — ')[0]}`,
          tekst: formatLang(d),
          url: `#feesten/${f.id}`,
        });
      }
    }
  }
  return uit.sort((a, b) => a.tijd.getTime() - b.tijd.getTime());
}

/** De eerstvolgende herinnering vanaf nu (binnen twee dagen), voor de uitleg in Instellingen. */
export const volgendeMelding = (h: Herinneringen, mode: Mode, nu = new Date()) => meldingenRond(vandaag(), h, mode).find((m) => m.tijd.getTime() > nu.getTime());

/* ---------- Tonen ---------- */

export async function toon(m: Pick<Melding, 'id' | 'titel' | 'tekst' | 'url'>) {
  const opties: NotificationOptions = { body: m.tekst, tag: m.id, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', data: { url: m.url } };
  const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
  if (reg) return reg.showNotification(m.titel, opties);
  // Zonder serviceworker (ontwikkelversie): een gewone melding; een tik opent het scherm in dit venster.
  const n = new Notification(m.titel, opties);
  n.onclick = () => {
    window.focus();
    window.location.hash = m.url;
    n.close();
  };
}

function leesVerstuurd(): Record<string, number> {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(VERSTUURD) ?? '{}');
    return v && typeof v === 'object' ? (v as Record<string, number>) : {};
  } catch {
    return {};
  }
}

/** Toont wat nu aan de beurt is. Elke melding één keer (ook over tabbladen heen): verstuurd wordt eerst vastgelegd. */
export function controleer(mode: Mode, nu = Date.now()) {
  if (toestemming() !== 'granted' || !ietsAan(huidig)) return;
  const verstuurd = leesVerstuurd();
  const aanDeBeurt = meldingenRond(vandaag(), huidig, mode).filter((m) => m.tijd.getTime() <= nu && nu - m.tijd.getTime() < MARGE && !verstuurd[m.id]);
  if (!aanDeBeurt.length) return;
  for (const m of aanDeBeurt) verstuurd[m.id] = nu;
  for (const [id, t] of Object.entries(verstuurd)) if (nu - t > 4 * 864e5) delete verstuurd[id];
  try {
    localStorage.setItem(VERSTUURD, JSON.stringify(verstuurd));
  } catch {
    return; // zonder opslag geen garantie tegen dubbele meldingen: dan liever niets
  }
  for (const m of aanDeBeurt) void toon(m).catch(() => {});
}

/** In App: controleert elke 30 s (en bij terugkeer naar de app) en volgt een tik op een melding (bericht van sw.js). */
export function useHerinneringPlanner(mode: Mode) {
  useEffect(() => {
    const tik = () => controleer(mode);
    tik();
    const klok = window.setInterval(tik, 30_000);
    document.addEventListener('visibilitychange', tik);
    const opBericht = (e: MessageEvent) => {
      const url: unknown = e.data?.type === 'herinnering-open' ? e.data.url : null;
      if (typeof url === 'string' && url.startsWith('#')) window.location.hash = url;
    };
    navigator.serviceWorker?.addEventListener('message', opBericht);
    return () => {
      window.clearInterval(klok);
      document.removeEventListener('visibilitychange', tik);
      navigator.serviceWorker?.removeEventListener('message', opBericht);
    };
  }, [mode]);
}
