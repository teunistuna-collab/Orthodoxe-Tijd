// Hoekornament (linksboven; de andere hoeken spiegelen via CSS) uit scripts/hoeksier-bron.png — draaien met: node scripts/hoeksier.mjs
// De bron heeft een ingebakken grijs-wit schaakbord: vanaf de rand alles wegvullen wat grijs/wit is (de donkere
// omtreklijn van het ornament houdt de vulling tegen), daarna strak bijsnijden.
import sharp from 'sharp';

const { data, info } = await sharp('scripts/hoeksier-bron.png').removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;
const isAchter = (p) => { const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2]; return Math.max(r, g, b) - Math.min(r, g, b) < 24 && r + g + b > 3 * 170; };
const weg = new Uint8Array(N); const stapel = [];
for (let p = 0; p < N; p++) { const x = p % W, y = (p / W) | 0; if ((x === 0 || y === 0 || x === W - 1 || y === H - 1) && isAchter(p)) { weg[p] = 1; stapel.push(p); } }
while (stapel.length) {
  const p = stapel.pop(); const x = p % W, y = (p / W) | 0;
  for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) if (q >= 0 && !weg[q] && isAchter(q)) { weg[q] = 1; stapel.push(q); }
}
// ingesloten stukjes schaakbord (binnen de ronde krullen) bereikt de vulling niet: grijs/wit zonder kleur ook weg
const ingesloten = (p) => { const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2]; return Math.max(r, g, b) - Math.min(r, g, b) < 16 && r + g + b > 3 * 185; };
const alfa = Buffer.alloc(N); for (let p = 0; p < N; p++) alfa[p] = weg[p] || ingesloten(p) ? 0 : 255;
const zacht = await sharp(alfa, { raw: { width: W, height: H, channels: 1 } }).median(5).blur(0.8).extractChannel(0).raw().toBuffer();
const vol = await sharp(data, { raw: { width: W, height: H, channels: 3 } }).joinChannel(zacht, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
const strak = await sharp(vol).trim({ threshold: 1 }).png().toBuffer();
const m = await sharp(strak).resize({ width: 256, height: 256, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, position: 'left top' }).webp({ quality: 88, alphaQuality: 100 }).toFile('public/images/ui/hoeksier.webp');
console.log('public/images/ui/hoeksier.webp', m.width + 'x' + m.height);
