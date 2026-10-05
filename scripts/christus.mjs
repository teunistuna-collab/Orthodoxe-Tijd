// Christus-icoon (overal waar het Christus-icoon staat) uit scripts/christus-bron.png — draaien met: node scripts/christus.mjs
// De bron staat op zwart: vanaf de rand van het beeld alles wegvullen wat (bijna) zwart is; daarna strak bijsnijden.
import sharp from 'sharp';

const { data, info } = await sharp('scripts/christus-bron.png').removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;
const isZwart = (p) => Math.max(data[p * 3], data[p * 3 + 1], data[p * 3 + 2]) < 34;
const weg = new Uint8Array(N); const stapel = [];
for (let p = 0; p < N; p++) { const x = p % W, y = (p / W) | 0; if ((x === 0 || y === 0 || x === W - 1 || y === H - 1) && isZwart(p)) { weg[p] = 1; stapel.push(p); } }
while (stapel.length) {
  const p = stapel.pop(); const x = p % W, y = (p / W) | 0;
  for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) if (q >= 0 && !weg[q] && isZwart(q)) { weg[q] = 1; stapel.push(q); }
}
const alfa = Buffer.alloc(N); for (let p = 0; p < N; p++) alfa[p] = weg[p] ? 0 : 255;
const zacht = await sharp(alfa, { raw: { width: W, height: H, channels: 1 } }).median(3).blur(0.7).extractChannel(0).raw().toBuffer();
const vol = await sharp(data, { raw: { width: W, height: H, channels: 3 } }).joinChannel(zacht, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
const strak = await sharp(vol).trim({ threshold: 1 }).png().toBuffer();
const m = await sharp(strak).resize({ width: 640 }).webp({ quality: 86, alphaQuality: 100 }).toFile('public/images/Christus-afbeelding.webp');
console.log('public/images/Christus-afbeelding.webp', m.width + 'x' + m.height);
