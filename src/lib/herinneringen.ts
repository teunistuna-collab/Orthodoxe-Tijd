import { useEffect, useSyncExternalStore } from 'react';
import type { Mode } from './kalender';
import { STANDAARD, aanDeBeurt, ietsAan, meldingenRond, schoonVoorkeuren, vandaagIn, vergeetOud, type Herinneringen, type Melding } from './herinneringPlanning';

export { AVOND, OCHTEND, STANDAARD, ietsAan, meldingenRond, type Herinneringen, type Melding, type Vooraf } from './herinneringPlanning';

// Herinneringen (Instellingen → Herinneringen): gebedsuren, vastendagen en heilige feesten. De planning zelf staat in
// lib/herinneringPlanning.ts (gedeeld met de pushserver).
//
// Bezorging, twee wegen:
// 1. Web Push (app gesloten): is er een meldingenserver ingesteld (VITE_PUSHSERVER_URL bij het bouwen) en kan de browser
//    push ontvangen, dan meldt de app zich daar aan met de voorkeuren, de kalender en de tijdzone. De server
//    (server/pushserver.ts) verstuurt op tijd; public/sw.js toont de melding.
// 2. Terwijl de app open is: zonder werkende push kijkt de app elke halve minuut zelf wat aan de beurt is.
// Nooit allebei: werkt push, dan slaat de app de eigen controle over (geen dubbele meldingen).

const SLEUTEL = 'herinneringen';
const VERSTUURD = 'herinneringen-verstuurd';
const PUSH = 'herinneringen-push';
const SERVER = (import.meta.env.VITE_PUSHSERVER_URL as string | undefined)?.replace(/\/+$/, '') || '';

function lees(): Herinneringen {
  try {
    return schoonVoorkeuren(JSON.parse(localStorage.getItem(SLEUTEL) ?? '{}'));
  } catch {
    return STANDAARD;
  }
}
let huidig = lees();
const luisteraars = new Set<() => void>();
const meld = () => luisteraars.forEach((f) => f());
window.addEventListener('storage', (e) => {
  if (e.key !== SLEUTEL && e.key !== PUSH) return;
  huidig = lees();
  push = leesPush();
  meld();
});
const abonneer = (f: () => void) => {
  luisteraars.add(f);
  return () => luisteraars.delete(f);
};

export function zetHerinneringen(w: Partial<Herinneringen>) {
  huidig = { ...huidig, ...w };
  try {
    localStorage.setItem(SLEUTEL, JSON.stringify(huidig));
  } catch {
    /* geen opslag: de keuze geldt dan alleen voor dit bezoek */
  }
  meld();
}

export const useHerinneringen = (): Herinneringen => useSyncExternalStore(abonneer, () => huidig);

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

/* ---------- Web Push ---------- */

/** geen-server: niet ingesteld bij het bouwen · niet-ondersteund: deze browser kan geen push ontvangen · uit: niets aan ·
 *  aan: de server heeft je aanmelding · fout: de server was niet bereikbaar (dan alleen meldingen terwijl de app open is). */
export type PushStatus = 'geen-server' | 'niet-ondersteund' | 'uit' | 'aan' | 'fout';
const leesPush = (): PushStatus => {
  try {
    return localStorage.getItem(PUSH) === 'aan' ? 'aan' : 'uit';
  } catch {
    return 'uit';
  }
};
let push: PushStatus = SERVER ? leesPush() : 'geen-server';
function zetPush(s: PushStatus) {
  push = s;
  try {
    if (s === 'aan') localStorage.setItem(PUSH, 'aan');
    else localStorage.removeItem(PUSH);
  } catch {
    /* zonder opslag blijft de eigen controle aan */
  }
  meld();
}
export const usePushStatus = (): PushStatus => useSyncExternalStore(abonneer, () => push);

const sleutelBytes = (b64: string) => {
  const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};
const post = (pad: string, body: unknown) => fetch(`${SERVER}${pad}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/** Zet de aanmelding bij de meldingenserver gelijk aan de huidige keuzes (aan, bijwerken of opzeggen). */
async function synchroniseer(h: Herinneringen, mode: Mode) {
  if (!SERVER) return;
  const reg = 'serviceWorker' in navigator && 'PushManager' in window ? await navigator.serviceWorker.getRegistration() : undefined;
  if (!reg) return zetPush('niet-ondersteund'); // ook in de ontwikkelversie: daar is geen serviceworker
  try {
    let ab = await reg.pushManager.getSubscription();
    if (!ietsAan(h) || toestemming() !== 'granted') {
      if (ab) {
        await post('/api/push/opzeggen', { endpoint: ab.endpoint }).catch(() => {});
        await ab.unsubscribe().catch(() => {});
      }
      return zetPush('uit');
    }
    if (!ab) {
      const r = await fetch(`${SERVER}/api/push/sleutel`);
      const { publicKey } = (await r.json()) as { publicKey: string };
      ab = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: sleutelBytes(publicKey) });
    }
    const r = await post('/api/push/abonnement', { abonnement: ab.toJSON(), voorkeuren: h, mode, tz: Intl.DateTimeFormat().resolvedOptions().timeZone });
    zetPush(r.ok ? 'aan' : 'fout');
  } catch {
    zetPush('fout');
  }
}

/* ---------- Tonen terwijl de app open is ---------- */

/** De eerstvolgende herinnering vanaf nu (binnen twee dagen), voor de uitleg in Instellingen. */
export const volgendeMelding = (h: Herinneringen, mode: Mode, nu = new Date()) => meldingenRond(vandaagIn(), h, mode).find((m) => m.tijd.getTime() > nu.getTime());

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

/** Toont wat nu aan de beurt is, als push het niet al doet. Elke melding één keer (ook over tabbladen heen). */
export function controleer(mode: Mode, nu = Date.now()) {
  if (push === 'aan' || toestemming() !== 'granted' || !ietsAan(huidig)) return;
  const verstuurd = leesVerstuurd();
  const lijst = aanDeBeurt(huidig, mode, verstuurd, nu);
  if (!lijst.length) return;
  for (const m of lijst) verstuurd[m.id] = nu;
  vergeetOud(verstuurd, nu);
  try {
    localStorage.setItem(VERSTUURD, JSON.stringify(verstuurd));
  } catch {
    return; // zonder opslag geen garantie tegen dubbele meldingen: dan liever niets
  }
  for (const m of lijst) void toon(m).catch(() => {});
}

/** In App: houdt de pushaanmelding bij, controleert elke 30 s zelf (als push niet werkt) en volgt een tik op een melding. */
export function useHerinneringPlanner(mode: Mode) {
  const h = useHerinneringen();
  // Bij openen en na elke wijziging (keuze, kalender, tijdzone van het apparaat) de server bijwerken; even wachten zodat
  // snel achter elkaar tikken één aanmelding geeft.
  useEffect(() => {
    const t = window.setTimeout(() => void synchroniseer(h, mode), 800);
    return () => window.clearTimeout(t);
  }, [h, mode]);
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
