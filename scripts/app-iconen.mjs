// Beginschermiconen (Android, iPhone) uit de aangeleverde app-knop scripts/app-icoon.webp — draaien met: node scripts/app-iconen.mjs
// Alleen de donkerrode tegel wordt gebruikt, zonder de lichtbruine achtergrond en de gouden rand eromheen: een vierkant binnen
// de tegel, met de hoeken zacht ingevuld in de tegelkleur. iOS en Android ronden de hoeken zelf af.
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

// Vierkant binnen de gouden rand van de tegel (rand op x 42–1212, y 42–1188 in het bronbeeld van 1254 px).
const UITSNEDE = { left: 62, top: 50, width: 1130, height: 1130 };
const TEGEL = { r: 45, g: 10, b: 4 }; // gemiddelde tegelkleur langs de rand
const ZIJDE = UITSNEDE.width;

// Afgeronde maske binnen de afgeronde tegelhoek (straal 280), met een zachte overgang zodat geen naad of rand zichtbaar is.
const masker = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${ZIJDE}" height="${ZIJDE}">
  <filter id="z"><feGaussianBlur stdDeviation="14"/></filter>
  <rect x="14" y="14" width="${ZIJDE - 28}" height="${ZIJDE - 28}" rx="280" fill="#fff" filter="url(#z)"/>
</svg>`);

const tegel = await sharp('scripts/app-icoon.webp')
  .extract(UITSNEDE)
  .ensureAlpha()
  .composite([{ input: masker, blend: 'dest-in' }])
  .png()
  .toBuffer();
const vol = await sharp(tegel).flatten({ background: TEGEL }).png().toBuffer();

mkdirSync('public/icons', { recursive: true });
for (const [bestand, px] of [
  ['public/icons/icon-512.png', 512],
  ['public/icons/icon-192.png', 192],
  ['public/apple-touch-icon.png', 180],
]) {
  await sharp(vol).resize(px, px, { kernel: 'lanczos3' }).png().toFile(bestand);
  console.log(bestand, `${px}×${px}`);
}
