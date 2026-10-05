// Het kruis van de site en de iconen, uit de aangeleverde afbeelding scripts/kruis-bron.png (antiek gouden kruis op een
// ingebakken grijs-wit schaakbord) — draaien met: node scripts/app-iconen.mjs
// - public/images/ui/kruis.webp       het kruis in de site (Cross.tsx, kopbalk, Heiligen) en als masker voor gekleurde kruistekens
// - public/favicon.png                tabblad-icoon: kruis op een donkere, afgeronde tegel
// - public/icons/icon-192/512.png, public/apple-touch-icon.png   beginscherm: kruis op een donkere tegel (iOS en Android ronden zelf af)
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const BARK = '#1b0d09';
const BARK2 = '#2c180f';
// Het schaakbord is niet echt doorzichtig: vanaf de rand van het beeld alles wegvullen wat grijs/wit is; de donkere
// omtreklijn van het kruis houdt de vulling tegen. Daarna strak bijsnijden (trim in een eigen stap).
const { data, info } = await sharp('scripts/kruis-bron.png').removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;
const isAchter = (p) => { const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2]; return Math.max(r, g, b) - Math.min(r, g, b) < 22 && r + g + b > 3 * 175; };
const weg = new Uint8Array(N); const stapel = [];
for (let p = 0; p < N; p++) { const x = p % W, y = (p / W) | 0; if ((x === 0 || y === 0 || x === W - 1 || y === H - 1) && isAchter(p)) { weg[p] = 1; stapel.push(p); } }
while (stapel.length) {
  const p = stapel.pop(); const x = p % W, y = (p / W) | 0;
  for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) if (q >= 0 && !weg[q] && isAchter(q)) { weg[q] = 1; stapel.push(q); }
}
const alfa = Buffer.alloc(N); for (let p = 0; p < N; p++) alfa[p] = weg[p] ? 0 : 255;
const zacht = await sharp(alfa, { raw: { width: W, height: H, channels: 1 } }).median(5).blur(0.8).extractChannel(0).raw().toBuffer();
const vol = await sharp(data, { raw: { width: W, height: H, channels: 3 } }).joinChannel(zacht, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
const kruis = await sharp(vol).trim({ threshold: 1 }).png().toBuffer();
const { width: kw, height: kh } = await sharp(kruis).metadata();

mkdirSync('public/images/ui', { recursive: true });
await sharp(kruis).resize({ height: 256 }).webp({ quality: 90, alphaQuality: 100 }).toFile('public/images/ui/kruis.webp');
console.log('public/images/ui/kruis.webp', `${Math.round((256 * kw) / kh)}×256`);

// Kruis gecentreerd op een tegel; hoogte als deel van de tegel (binnen de maskable-veilige cirkel van 80%).
const tegel = async (px, deel, afgerond) => {
  const h = Math.round(px * deel);
  const k = await sharp(kruis).resize({ height: h }).png().toBuffer();
  const w = (await sharp(k).metadata()).width;
  const r = afgerond ? Math.round(px * 0.19) : 0;
  const achtergrond = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}">
    <defs><radialGradient id="g" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="${BARK2}"/><stop offset="1" stop-color="${BARK}"/></radialGradient></defs>
    <rect width="${px}" height="${px}" rx="${r}" fill="url(#g)"/></svg>`);
  return sharp(achtergrond).composite([{ input: k, left: Math.round((px - w) / 2), top: Math.round((px - h) / 2) }]).png();
};

for (const [bestand, px] of [['public/icons/icon-512.png', 512], ['public/icons/icon-192.png', 192], ['public/apple-touch-icon.png', 180]]) {
  await (await tegel(px, 0.62, false)).toFile(bestand);
  console.log(bestand, `${px}×${px}`);
}
await (await tegel(64, 0.82, true)).toFile('public/favicon.png');
console.log('public/favicon.png 64×64');
