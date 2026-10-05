// Achtergrond van de site (web en mobiel): het aangeleverde vel oud perkament scripts/perkament-bron.png
// — draaien met: node scripts/perkament.mjs
// Er komt een lichte crèmewaas overheen (WAAS), zodat kleine goudkleurige labels (#8a5a1e) op het perkament
// boven de contrastnorm van 4,5:1 blijven. De korrel en de donkere randen blijven zichtbaar.
import sharp from 'sharp';

const WAAS = 0; // geen waas: het vel zoals aangeleverd (het donkergoud is daarvoor iets donkerder gemaakt, #7d5218)
const CREME = { r: 253, g: 248, b: 236 }; // #fdf8ec

const { width, height } = await sharp('scripts/perkament-bron.png').metadata();
const waas = await sharp({ create: { width, height, channels: 4, background: { ...CREME, alpha: WAAS } } }).png().toBuffer();
await sharp('scripts/perkament-bron.png')
  .removeAlpha()
  .composite([{ input: waas }])
  .webp({ quality: 80 })
  .toFile('public/images/ui/perkament.webp');
console.log('public/images/ui/perkament.webp', `${width}×${height}`);
