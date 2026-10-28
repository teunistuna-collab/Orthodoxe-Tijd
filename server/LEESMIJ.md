# Meldingenserver (Web Push)

Verstuurt de herinneringen uit Instellingen → Herinneringen (gebedsuren, vastendagen, feesten), ook als de app gesloten
is. De server rekent met dezelfde planning als de app (`src/lib/herinneringPlanning.ts`), in de tijdzone en met de
kalender (juliaans of gregoriaans) van elke gebruiker.

## Wat er nodig is

- Een plek waar een Node-programma (Node 20 of nieuwer) **altijd** draait, met https ervoor (bijv. een kleine VPS met
  Caddy of nginx, Fly.io, Railway, Render). Een statische host of alleen serverless functies volstaat niet: de server
  moet elke 30 seconden kijken wat er verstuurd moet worden.
- Een map die bewaard blijft (`DATA_DIR`) voor `abonnementen.json`.

## Instellen

1. Sleutels maken (één keer; de geheime sleutel nooit in git of in de site zetten):

   ```bash
   npm run push:sleutels
   ```

2. Server bouwen en starten:

   ```bash
   npm run push:bouw
   ```

   ```bash
   VAPID_PUBLIC_KEY=… VAPID_PRIVATE_KEY=… VAPID_SUBJECT=mailto:beheer@voorbeeld.nl ALLOWED_ORIGINS=https://www.voorbeeld.nl npm run push:start
   ```

   | Variabele | Betekenis |
   |---|---|
   | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | uit stap 1 |
   | `VAPID_SUBJECT` | `mailto:` of `https://` van de beheerder (eist de pushdienst) |
   | `ALLOWED_ORIGINS` | adres(sen) van de site, kommagescheiden; alleen daarvandaan mag je je aanmelden |
   | `PORT` | standaard 8787 |
   | `DATA_DIR` | standaard `server/data` |
   | `MAX_ABONNEMENTEN` | standaard 10000 |
   | `TRUST_PROXY=1` | alleen achter een eigen proxy: IP uit `X-Forwarded-For` voor de limiet per IP |

3. De site bouwen met het adres van de server (bijv. in `.env.production`, niet in git):

   ```bash
   VITE_PUSHSERVER_URL=https://meldingen.voorbeeld.nl npm run build
   ```

   Zonder `VITE_PUSHSERVER_URL` werkt alles zoals voorheen: herinneringen alleen terwijl de app open is.

## Hoe het werkt

- `GET /api/push/sleutel`: de publieke VAPID-sleutel.
- `POST /api/push/abonnement`: aanmelden of bijwerken (push-abonnement, voorkeuren, kalender, tijdzone). Alles uit:
  verwijderd.
- `POST /api/push/opzeggen`: verwijderen.
- `GET /api/push/gezond`: draait de server?
- Elke melding wordt eerst als verstuurd vastgelegd en dan verstuurd: na een herstart gaat niets twee keer. Meer dan 10
  minuten te laat gaat niet meer (ook de TTL bij de pushdienst is 10 minuten). Verlopen abonnementen (404/410) worden
  verwijderd. Werkt push, dan doet de app zelf geen controle meer (geen dubbele meldingen).

## Veiligheid en privacy

- Alleen https-adressen van de bekende pushdiensten (Google, Mozilla, Apple, Microsoft): de server doet geen verzoeken
  naar willekeurige adressen.
- Alleen aanmeldingen vanaf `ALLOWED_ORIGINS`, berichten tot 8 KB, maximaal 60 verzoeken per 10 minuten per IP, een
  maximum aantal abonnementen.
- Bewaard per abonnement: het meldingsadres van de browser, de voorkeuren, kalender, tijdzone en welke meldingen al
  verstuurd zijn. Geen naam, e-mail of IP-adres. `server/data/` staat in `.gitignore`.

## Testen

```bash
npm run check:pushserver
```

Met een nep-pushdienst: aanmelden en weigeren, versturen zonder dubbele meldingen, herstart, opruimen en opzeggen.
De echte bezorging (Android, iPhone, gesloten app) is alleen te testen met de server online op https en de site op https.

## Apparaten

- **Android** (Chrome, Edge, Firefox, Samsung Internet): werkt, ook als de app gesloten is.
- **iPhone/iPad**: alleen vanaf iOS 16.4 en alleen als Orthodoxe Tijd via Deel → Zet op beginscherm is geïnstalleerd en
  daarvandaan geopend.
- Desktopbrowsers: werkt zolang de browser zelf draait.
