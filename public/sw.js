// Minimale service worker van Orthodoxe Tijd. Bewaart niets en maakt de site NIET offline beschikbaar:
// alleen als een pagina niet geladen kan worden (geen verbinding) toont hij een korte melding in plaats van een foutpagina.
// Geregistreerd in src/main.tsx (alleen in de productiebuild).

const MELDING = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#160b08">
<title>Geen verbinding — Orthodoxe Tijd</title>
<style>
  html,body{height:100%;margin:0}
  body{display:flex;align-items:center;justify-content:center;padding:max(24px,env(safe-area-inset-top)) 24px max(24px,env(safe-area-inset-bottom));box-sizing:border-box;background:#faf6ec;color:#2b1d12;font-family:"Cormorant Garamond",Georgia,serif;text-align:center}
  main{max-width:340px}
  svg{width:30px;height:45px;color:#8a5a1e}
  h1{margin:14px 0 8px;font-size:28px;font-weight:600}
  p{margin:0 0 22px;font-size:19px;line-height:1.45;color:#5e4938}
  button{min-height:46px;padding:0 24px;border:1px solid #c9a227;border-radius:999px;background:#160b08;color:#e8cf7a;font:inherit;font-size:18px;cursor:pointer}
</style>
</head>
<body>
<main>
  <svg viewBox="0 0 64 96" fill="currentColor" aria-hidden="true"><rect x="29" y="2" width="6" height="92" rx="1"/><rect x="20" y="12" width="24" height="5" rx="1"/><rect x="8" y="28" width="48" height="6" rx="1"/><g transform="rotate(-22 32 72)"><rect x="16" y="69.5" width="32" height="5" rx="1"/></g></svg>
  <h1>Geen verbinding</h1>
  <p>Orthodoxe Tijd heeft internet nodig. Controleer je verbinding en probeer het opnieuw.</p>
  <button type="button" onclick="location.reload()">Opnieuw proberen</button>
</main>
</body>
</html>`;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return; // al het andere gaat gewoon via het netwerk
  event.respondWith(fetch(event.request).catch(() => new Response(MELDING, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
