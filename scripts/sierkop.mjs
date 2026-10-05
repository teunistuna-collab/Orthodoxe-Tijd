// Sierkop (alleen de boog) uit een aangeleverde sierboog op perkament — draaien met:
//   node scripts/sierkop.mjs                       (mobiel: scripts/sierboog-bron.png → boog.webp)
//   node scripts/sierkop.mjs web                   (web: scripts/sierboog-web-bron.png → boog-web.webp)
//   node scripts/sierkop.mjs nacht                 (avondweergave: strak langs de rode binnenlijn → boog-nacht.webp)
// De perkamenten binnenkant van de boog wordt doorzichtig, zodat het perkament van de site erdoor zichtbaar is; kruis en
// titel staan er in de site als echte elementen in.
// Werkwijze (het perkament is verweerd, dus op kleur alleen wordt de rand rafelig):
//  1. vanuit het midden alles vullen wat niet tot de blauwe band hoort;
//  2. de rode binnenlijn langs de band zoeken; alles binnen MARGE px daarvan blijft staan (gouden lijn, bloempjes),
//     in de punt van de boog meer (PUNT px) voor het gouden kantwerk met bladeren;
//  3. een zachte overgang (ZACHT px): het bronperkament lijkt op dat van de site, dus de naad valt weg.
import sharp from 'sharp';

const web = process.argv[2] === 'web', nacht = process.argv[2] === 'nacht';
// nacht: op een donkere achtergrond valt de perkamentrand wél op, dus daar strak langs de rode binnenlijn snijden
// (het kantwerk in de punt valt dan weg; op kleur is het niet schoon van het verweerde perkament te scheiden)
const MARGE = nacht ? 6 : 20, PUNT = nacht ? 6 : 80, ZACHT = nacht ? 4 : 14, VEL = 70; // VEL: buitenrand van het vel die nooit wordt weggehaald

const BRON = web ? 'scripts/sierboog-web-bron.png' : 'scripts/sierboog-bron.png';
const UIT = web ? 'public/images/heroes/sier/boog-web.webp' : nacht ? 'public/images/heroes/sier/boog-nacht.webp' : 'public/images/heroes/sier/boog.webp';
const BREED = web ? 2000 : 1200;

const { data, info } = await sharp(BRON).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H, MX = W >> 1;
const kleur = (p) => [data[p * 3], data[p * 3 + 1], data[p * 3 + 2]];
const blauw = new Uint8Array(N); for (let p = 0; p < N; p++) { const [r, g, b] = kleur(p); blauw[p] = b > r + 8 && b > g - 10 ? 1 : 0; }

// afstand tot een masker (twee-pass chamfer)
function afstand(masker) {
  const d = new Float32Array(N).fill(1e9);
  for (let p = 0; p < N; p++) if (masker[p]) d[p] = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const p = y * W + x; let v = d[p]; if (x > 0) v = Math.min(v, d[p - 1] + 1); if (y > 0) { v = Math.min(v, d[p - W] + 1); if (x > 0) v = Math.min(v, d[p - W - 1] + 1.414); if (x < W - 1) v = Math.min(v, d[p - W + 1] + 1.414); } d[p] = v; }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const p = y * W + x; let v = d[p]; if (x < W - 1) v = Math.min(v, d[p + 1] + 1); if (y < H - 1) { v = Math.min(v, d[p + W] + 1); if (x < W - 1) v = Math.min(v, d[p + W + 1] + 1.414); if (x > 0) v = Math.min(v, d[p + W - 1] + 1.414); } d[p] = v; }
  return d;
}

// 1. vullen vanuit het midden, niet door blauw en niet in de buitenrand van het vel
const binnen = new Uint8Array(N);
const start = (H - 120) * W + MX; const stapel = [start]; binnen[start] = 1;
while (stapel.length) {
  const p = stapel.pop(); const x = p % W, y = (p / W) | 0;
  for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) {
    if (q < 0 || binnen[q] || blauw[q]) continue;
    const qx = q % W, qy = (q / W) | 0;
    if (qx < VEL || qx >= W - VEL || qy < VEL) continue;
    binnen[q] = 1; stapel.push(q);
  }
}
// alleen de boogopening: per kolom het stuk dat vanaf de onderkant open is (de rozetten in de hoeken niet)
for (let x = 0; x < W; x++) { let open = true; for (let y = H - 1; y >= 0; y--) { const p = y * W + x; if (!binnen[p]) open = false; else if (!open) binnen[p] = 0; } }

// 2. rode binnenlijn: rode pixels vlak naast de blauwe band (verkleuring verderop in het perkament telt niet)
const dBlauw = afstand(blauw);
const rand = new Uint8Array(N);
for (let p = 0; p < N; p++) { const [r, g, b] = kleur(p); rand[p] = blauw[p] || (dBlauw[p] < 45 && r > 120 && r - g > 70 && r - b > 70) ? 1 : 0; }
const d = afstand(rand);

// 3. alfa: binnen de marge dicht, daarna een zachte overgang
const alfa = Buffer.alloc(N);
for (let p = 0; p < N; p++) {
  if (!binnen[p]) { alfa[p] = 255; continue; }
  const x = p % W, y = (p / W) | 0;
  const punt = Math.max(0, Math.min(1, (330 - Math.abs(x - MX)) / 80)) * Math.max(0, Math.min(1, (320 - y) / 60));
  const m = MARGE + (PUNT - MARGE) * punt;
  alfa[p] = Math.round(255 * Math.max(0, Math.min(1, (m + ZACHT - d[p]) / ZACHT)));
}
// samenvoegen en verkleinen in twee stappen (sharp verkleint anders vóór het samenvoegen)
// alfa vervagen: de rode lijn is niet overal even rood, zo golft de snijrand niet mee
const glad = await sharp(alfa, { raw: { width: W, height: H, channels: 1 } }).blur(nacht ? 3 : 7).extractChannel(0).raw().toBuffer();
for (let p = 0; p < N; p++) if (!binnen[p]) glad[p] = 255;
const vol = await sharp(data, { raw: { width: W, height: H, channels: 3 } }).joinChannel(glad, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
await sharp(vol).resize({ width: BREED }).webp({ quality: 86, alphaQuality: 100 }).toFile(UIT);
let leeg = 0; for (let p = 0; p < N; p++) if (alfa[p] < 128) leeg++;
console.log(UIT, BREED + ' breed', 'doorzichtig', Math.round((100 * leeg) / N) + '%');
