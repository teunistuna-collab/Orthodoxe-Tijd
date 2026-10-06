// Vastensymbolen (week op de Vasten-pagina) uit scripts/vastensymbolen-bron.png — draaien met: node scripts/vastensymbolen.mjs
// Links in de bron het symbool voor een vastendag (brood en olijven), rechts voor een dag zonder vasten (vis, druiven,
// beker). Het ingebakken grijs-witte schaakbord wordt weggevuld vanaf de rand; ingesloten grijze stukjes ook.
import sharp from 'sharp';

const { data, info } = await sharp('scripts/vastensymbolen-bron.png').removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;
const grijs = (p, verzadiging, licht) => { const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2]; return Math.max(r, g, b) - Math.min(r, g, b) < verzadiging && r + g + b > 3 * licht; };
const weg = new Uint8Array(N); const stapel = [];
for (let p = 0; p < N; p++) { const x = p % W, y = (p / W) | 0; if ((x === 0 || y === 0 || x === W - 1 || y === H - 1) && grijs(p, 24, 170)) { weg[p] = 1; stapel.push(p); } }
while (stapel.length) {
  const p = stapel.pop(); const x = p % W, y = (p / W) | 0;
  for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) if (q >= 0 && !weg[q] && grijs(q, 24, 170)) { weg[q] = 1; stapel.push(q); }
}
const alfa = Buffer.alloc(N); for (let p = 0; p < N; p++) alfa[p] = weg[p] ? 0 : 255;
const zacht = await sharp(alfa, { raw: { width: W, height: H, channels: 1 } }).median(5).blur(0.8).extractChannel(0).raw().toBuffer();
const vol = await sharp(data, { raw: { width: W, height: H, channels: 3 } }).joinChannel(zacht, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
for (const [naam, left] of [['vasten', 0], ['vastenvrij', Math.floor(W / 2)]]) {
  const helft = await sharp(vol).extract({ left, top: 0, width: Math.floor(W / 2), height: H }).png().toBuffer();
  const strak = await sharp(helft).trim({ threshold: 1 }).png().toBuffer();
  const m = await sharp(strak).resize({ width: 256, height: 256, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 88, alphaQuality: 100 }).toFile(`public/images/ui/${naam}.webp`);
  console.log(`public/images/ui/${naam}.webp`, m.width + 'x' + m.height);
}
