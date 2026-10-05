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
  img{display:block;margin:0 auto}
  h1{margin:14px 0 8px;font-size:28px;font-weight:600}
  p{margin:0 0 22px;font-size:19px;line-height:1.45;color:#5e4938}
  button{min-height:46px;padding:0 24px;border:1px solid #c9a227;border-radius:999px;background:#160b08;color:#e8cf7a;font:inherit;font-size:18px;cursor:pointer}
</style>
</head>
<body>
<main>
  <img src="data:image/webp;base64,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" alt="" width="39" height="45">
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
