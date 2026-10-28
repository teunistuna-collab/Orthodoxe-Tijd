// Meldingenserver van Orthodoxe Tijd: verstuurt herinneringen (gebedsuren, vastendagen, feesten) via Web Push, ook als de
// app gesloten is. Een los Node-programma zonder framework; zie server/LEESMIJ.md voor sleutels, instellingen en starten.
//
// - De app meldt zich aan met zijn push-abonnement, de voorkeuren, de kalender (juliaans of gregoriaans) en de tijdzone.
// - Elke 30 s rekent de server met dezelfde planning als de app (src/lib/herinneringPlanning.ts) wat aan de beurt is.
// - Elke melding gaat één keer: eerst vastgelegd, dan verstuurd. Meer dan 10 minuten te laat: niet meer (ook de TTL).
// - Een abonnement dat de pushdienst niet meer kent (404/410), wordt verwijderd.
// Veiligheid: alleen https-adressen van de bekende pushdiensten (geen verzoeken naar willekeurige adressen), alleen
// aanmeldingen vanaf de eigen site (Origin), kleine berichten, een limiet per IP en een maximum aantal abonnementen.
// ponytail: opslag in één JSON-bestand en een planning in het geheugen; prima voor duizenden abonnementen, daarboven een
// database en meerdere werkers.

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import webpush from 'web-push';
import { aanDeBeurt, geldigeZone, ietsAan, schoonVoorkeuren, vergeetOud, type Herinneringen, type Melding } from '../src/lib/herinneringPlanning';
import type { Mode } from '../src/lib/kalender';

export interface PushAdres {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}
interface Abonnement extends PushAdres {
  voorkeuren: Herinneringen;
  mode: Mode;
  tz: string;
  verstuurd: Record<string, number>;
  bijgewerkt: number;
}
/** Verstuurt één melding; gooit bij een fout een object met `statusCode` (zoals web-push). */
export type Verstuur = (adres: PushAdres, inhoud: string) => Promise<unknown>;

/** De pushdiensten van Chrome/Android, Firefox, Safari/iPhone en Edge/Windows. */
const PUSHDIENSTEN = [/^fcm\.googleapis\.com$/, /^android\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /^([a-z0-9-]+\.)*push\.apple\.com$/, /^([a-z0-9-]+\.)*notify\.windows\.com$/];
const B64URL = /^[A-Za-z0-9_-]{16,200}={0,2}$/;

export function geldigAdres(x: unknown): PushAdres | null {
  if (!x || typeof x !== 'object') return null;
  const { endpoint, keys } = x as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  if (typeof endpoint !== 'string' || endpoint.length > 1024) return null;
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.port !== '' || url.username || url.password || !PUSHDIENSTEN.some((r) => r.test(url.hostname))) return null;
  if (!keys || typeof keys.p256dh !== 'string' || typeof keys.auth !== 'string' || !B64URL.test(keys.p256dh) || !B64URL.test(keys.auth)) return null;
  return { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
}

export interface Opties {
  dataMap: string;
  publiekeSleutel: string;
  verstuur: Verstuur;
  /** Toegestane herkomst van de site, bijv. ["https://orthodoxetijd.nl"]. */
  origins: string[];
  max?: number;
  vertrouwProxy?: boolean;
  log?: (...x: unknown[]) => void;
}

class TeGroot extends Error {
  message = 'te groot';
}

export async function maakApp(o: Opties) {
  const log = o.log ?? console.log;
  const max = o.max ?? 10_000;
  const bestand = path.join(o.dataMap, 'abonnementen.json');
  await mkdir(o.dataMap, { recursive: true });
  const abonnementen = new Map<string, Abonnement>();
  try {
    for (const a of JSON.parse(await readFile(bestand, 'utf8')) as Abonnement[]) {
      const adres = geldigAdres(a);
      if (adres && geldigeZone(a.tz)) abonnementen.set(adres.endpoint, { ...a, ...adres, voorkeuren: schoonVoorkeuren(a.voorkeuren), mode: a.mode === 'nieuw' ? 'nieuw' : 'oud', verstuurd: a.verstuurd ?? {} });
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; // een kapot bestand niet stilzwijgend overschrijven
  }

  // Wegschrijven: na elkaar, via een tijdelijk bestand (nooit een half geschreven bestand).
  let rij = Promise.resolve();
  const bewaar = () =>
    (rij = rij.then(async () => {
      const tijdelijk = `${bestand}.${process.pid}.tmp`;
      await writeFile(tijdelijk, JSON.stringify([...abonnementen.values()]));
      await rename(tijdelijk, bestand);
    }).catch((e) => log('opslaan mislukt', e)));

  /* ---------- Versturen ---------- */

  let bezig = false;
  async function tik(nu = Date.now()) {
    if (bezig) return;
    bezig = true;
    try {
      const taken: Array<[Abonnement, Melding]> = [];
      for (const a of abonnementen.values()) {
        for (const m of aanDeBeurt(a.voorkeuren, a.mode, a.verstuurd, nu, a.tz)) {
          a.verstuurd[m.id] = nu;
          taken.push([a, m]);
        }
        vergeetOud(a.verstuurd, nu);
      }
      if (!taken.length) return;
      await bewaar(); // eerst vastleggen: na een herstart gaat niets twee keer
      const weg = new Set<string>();
      await Promise.allSettled(
        taken.map(async ([a, m]) => {
          try {
            await o.verstuur({ endpoint: a.endpoint, keys: a.keys }, JSON.stringify({ id: m.id, titel: m.titel, tekst: m.tekst, url: m.url }));
          } catch (e) {
            const code = (e as { statusCode?: number }).statusCode;
            if (code === 404 || code === 410) weg.add(a.endpoint);
            else log('versturen mislukt', code ?? e);
          }
        }),
      );
      if (weg.size) {
        for (const e of weg) abonnementen.delete(e);
        await bewaar();
      }
    } finally {
      bezig = false;
    }
  }

  /* ---------- HTTP ---------- */

  const tellers = new Map<string, { n: number; sinds: number }>();
  const teVaak = (ip: string, nu = Date.now()) => {
    const t = tellers.get(ip);
    if (!t || nu - t.sinds > 10 * 60_000) {
      tellers.set(ip, { n: 1, sinds: nu });
      if (tellers.size > 50_000) tellers.clear();
      return false;
    }
    return ++t.n > 60;
  };

  const leesJson = (req: IncomingMessage) =>
    new Promise<unknown>((klaar, mis) => {
      let grootte = 0;
      const stukken: Buffer[] = [];
      req.on('data', (s: Buffer) => {
        grootte += s.length;
        if (grootte > 8192) mis(new TeGroot()); // de rest niet bewaren; de verbinding gaat na het antwoord dicht
        else stukken.push(s);
      });
      req.on('end', () => {
        try {
          klaar(JSON.parse(Buffer.concat(stukken).toString('utf8')));
        } catch {
          mis(new Error('geen json'));
        }
      });
      req.on('error', mis);
    });

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const origin = req.headers.origin;
    const toegestaan = typeof origin === 'string' && o.origins.includes(origin);
    const stuur = (status: number, body?: unknown) => {
      const kop: Record<string, string> = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin' };
      if (toegestaan) Object.assign(kop, { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' });
      if (body !== undefined) kop['Content-Type'] = 'application/json; charset=utf-8';
      res.writeHead(status, kop).end(body === undefined ? undefined : JSON.stringify(body));
    };
    const pad = (req.url ?? '').split('?')[0];
    const ip = (o.vertrouwProxy && typeof req.headers['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress) ?? '?';

    try {
      if (req.method === 'OPTIONS') return stuur(toegestaan ? 204 : 403);
      if (req.method === 'GET' && pad === '/api/push/gezond') return stuur(200, { ok: true });
      if (req.method === 'GET' && pad === '/api/push/sleutel') return stuur(200, { publicKey: o.publiekeSleutel });
      if (req.method !== 'POST' || (pad !== '/api/push/abonnement' && pad !== '/api/push/opzeggen')) return stuur(404, { fout: 'onbekend' });
      if (!toegestaan) return stuur(403, { fout: 'herkomst' });
      if (teVaak(ip)) return stuur(429, { fout: 'te vaak' });
      if (!String(req.headers['content-type'] ?? '').startsWith('application/json')) return stuur(415, { fout: 'json' });
      const body = (await leesJson(req)) as Record<string, unknown> | null;

      if (pad === '/api/push/opzeggen') {
        if (typeof body?.endpoint === 'string' && abonnementen.delete(body.endpoint)) await bewaar();
        return stuur(204);
      }

      const adres = geldigAdres(body?.abonnement);
      if (!adres) return stuur(400, { fout: 'abonnement' });
      if (!geldigeZone(body?.tz)) return stuur(400, { fout: 'tijdzone' });
      if (body?.mode !== 'oud' && body?.mode !== 'nieuw') return stuur(400, { fout: 'kalender' });
      const voorkeuren = schoonVoorkeuren(body.voorkeuren);
      if (!ietsAan(voorkeuren)) {
        if (abonnementen.delete(adres.endpoint)) await bewaar();
        return stuur(204);
      }
      const bestaand = abonnementen.get(adres.endpoint);
      if (!bestaand && abonnementen.size >= max) return stuur(503, { fout: 'vol' });
      abonnementen.set(adres.endpoint, { ...adres, voorkeuren, mode: body.mode, tz: body.tz as string, verstuurd: bestaand?.verstuurd ?? {}, bijgewerkt: Date.now() });
      await bewaar();
      return stuur(204);
    } catch (e) {
      if (e instanceof TeGroot) res.setHeader('Connection', 'close');
      return stuur(e instanceof TeGroot ? 413 : 400, { fout: e instanceof Error ? e.message : 'fout' });
    }
  });

  return { server, tik, abonnementen, klaar: () => rij };
}

/* ---------- Starten (npm run push:start) ---------- */

async function hoofd() {
  const env = process.env;
  const publiek = env.VAPID_PUBLIC_KEY;
  const prive = env.VAPID_PRIVATE_KEY;
  const onderwerp = env.VAPID_SUBJECT; // mailto:… of https://… van de beheerder
  const origins = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!publiek || !prive || !onderwerp || !origins.length) {
    console.error('Ontbrekende instellingen: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT en ALLOWED_ORIGINS (zie server/LEESMIJ.md).');
    process.exit(1);
  }
  webpush.setVapidDetails(onderwerp, publiek, prive);
  const app = await maakApp({
    dataMap: env.DATA_DIR ?? path.resolve('server/data'),
    publiekeSleutel: publiek,
    origins,
    max: env.MAX_ABONNEMENTEN ? Number(env.MAX_ABONNEMENTEN) : undefined,
    vertrouwProxy: env.TRUST_PROXY === '1',
    verstuur: (adres, inhoud) => webpush.sendNotification(adres, inhoud, { TTL: 600, urgency: 'high' }),
  });
  const poort = Number(env.PORT ?? 8787);
  app.server.listen(poort, () => console.log(`Meldingenserver op poort ${poort}, ${app.abonnementen.size} abonnementen`));
  const klok = setInterval(() => void app.tik(), 30_000);
  void app.tik();
  const stop = () => {
    clearInterval(klok);
    app.server.close();
    void app.klaar().then(() => process.exit(0));
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

// Alleen starten als dit het gestarte programma is (niet als het in een controle wordt ingelezen).
if (path.basename(process.argv[1] ?? '') === 'pushserver.mjs') void hoofd();
