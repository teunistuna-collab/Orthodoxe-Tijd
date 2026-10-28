// Controle van de meldingenserver (server/pushserver.ts) met een nep-pushdienst: aanmelden, weigeren, versturen zonder
// dubbele meldingen, opruimen van verlopen abonnementen, opzeggen en bewaren na een herstart. Draaien: npm run check:pushserver
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { geldigAdres, maakApp, type PushAdres } from '../server/pushserver';
import { STANDAARD } from '../src/lib/herinneringPlanning';

const SITE = 'https://orthodoxetijd.example';
const map = await mkdtemp(path.join(tmpdir(), 'ot-push-'));
const verstuurd: Array<{ adres: PushAdres; inhoud: { id: string; url: string } }> = [];
let antwoord = 201;
const verstuur = async (adres: PushAdres, inhoud: string) => {
  verstuurd.push({ adres, inhoud: JSON.parse(inhoud) });
  if (antwoord >= 400) throw Object.assign(new Error('weg'), { statusCode: antwoord });
};
const opties = { dataMap: map, publiekeSleutel: 'PUBLIEK', verstuur, origins: [SITE], log: () => {} };

try {
  const app = await maakApp(opties);
  await new Promise<void>((r) => app.server.listen(0, '127.0.0.1', r));
  const basis = `http://127.0.0.1:${(app.server.address() as AddressInfo).port}`;
  const post = (pad: string, body: unknown, origin = SITE) => fetch(basis + pad, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body) });
  const sleutels = { p256dh: 'B'.repeat(87), auth: 'a'.repeat(22) };
  const abonnement = { endpoint: 'https://fcm.googleapis.com/fcm/send/abc123', keys: sleutels };
  const aanmelding = { abonnement, voorkeuren: { ...STANDAARD, uren: ['Vespers'] }, mode: 'oud', tz: 'Europe/Amsterdam' };

  // Sleutel en CORS.
  assert.deepEqual(await (await fetch(`${basis}/api/push/sleutel`)).json(), { publicKey: 'PUBLIEK' });
  const pre = await fetch(`${basis}/api/push/abonnement`, { method: 'OPTIONS', headers: { Origin: SITE } });
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get('access-control-allow-origin'), SITE);

  // Weigeren: andere site, willekeurig adres (geen pushdienst), http, foute tijdzone of kalender, te groot.
  assert.equal((await post('/api/push/abonnement', aanmelding, 'https://kwaad.example')).status, 403);
  assert.equal((await post('/api/push/abonnement', { ...aanmelding, abonnement: { ...abonnement, endpoint: 'https://intern.example/x' } })).status, 400);
  assert.equal((await post('/api/push/abonnement', { ...aanmelding, abonnement: { ...abonnement, endpoint: 'http://fcm.googleapis.com/x' } })).status, 400);
  assert.equal((await post('/api/push/abonnement', { ...aanmelding, tz: 'Mars/Olympus' })).status, 400);
  assert.equal((await post('/api/push/abonnement', { ...aanmelding, mode: 'x' })).status, 400);
  assert.equal((await post('/api/push/abonnement', { ...aanmelding, opvulling: 'x'.repeat(9000) })).status, 413);
  assert.equal(app.abonnementen.size, 0);
  assert.ok(geldigAdres({ endpoint: 'https://web.push.apple.com/QGx', keys: sleutels }));
  assert.equal(geldigAdres({ endpoint: 'https://push.apple.com.kwaad.example/x', keys: sleutels }), null);

  // Aanmelden en versturen: Vespers 18:00 in Amsterdam = 17:00 UTC op 2-11-2026.
  assert.equal((await post('/api/push/abonnement', aanmelding)).status, 204);
  assert.equal(app.abonnementen.size, 1);
  const tijd = Date.UTC(2026, 10, 2, 17, 0, 20);
  await app.tik(tijd);
  await app.tik(tijd + 30_000);
  assert.deepEqual(verstuurd.map((v) => v.inhoud.id), ['uur:Vespers:2026-11-02']);
  assert.equal(verstuurd[0].inhoud.url, '#etmaal/vespers');
  assert.equal(verstuurd[0].adres.endpoint, abonnement.endpoint);

  // Bijwerken (opnieuw aanmelden) verstuurt hetzelfde niet nog eens.
  assert.equal((await post('/api/push/abonnement', aanmelding)).status, 204);
  await app.tik(tijd + 60_000);
  assert.equal(verstuurd.length, 1);

  // Herstart: abonnement en verstuurd-administratie blijven bewaard.
  await app.klaar();
  app.server.close();
  const opnieuw = await maakApp(opties);
  assert.equal(opnieuw.abonnementen.size, 1);
  await opnieuw.tik(tijd + 90_000);
  assert.equal(verstuurd.length, 1);

  // De pushdienst kent het abonnement niet meer (410): verwijderd.
  antwoord = 410;
  await opnieuw.tik(Date.UTC(2026, 10, 3, 17, 0, 10));
  assert.equal(verstuurd.length, 2);
  assert.equal(opnieuw.abonnementen.size, 0);

  // Opzeggen en "alles uit" verwijderen het abonnement.
  await new Promise<void>((r) => opnieuw.server.listen(0, '127.0.0.1', r));
  const basis2 = `http://127.0.0.1:${(opnieuw.server.address() as AddressInfo).port}`;
  const post2 = (pad: string, body: unknown) => fetch(basis2 + pad, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: SITE }, body: JSON.stringify(body) });
  await post2('/api/push/abonnement', aanmelding);
  assert.equal(opnieuw.abonnementen.size, 1);
  await post2('/api/push/abonnement', { ...aanmelding, voorkeuren: STANDAARD });
  assert.equal(opnieuw.abonnementen.size, 0);
  await post2('/api/push/abonnement', aanmelding);
  assert.equal((await post2('/api/push/opzeggen', { endpoint: abonnement.endpoint })).status, 204);
  assert.equal(opnieuw.abonnementen.size, 0);
  await opnieuw.klaar();
  opnieuw.server.close();
  console.log('pushserver: alle controles geslaagd');
} finally {
  await rm(map, { recursive: true, force: true });
}
