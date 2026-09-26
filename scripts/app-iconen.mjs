// Beginschermiconen (Android, iPhone) uit het bestaande logo public/favicon.svg — draaien met: node scripts/app-iconen.mjs
// Zelfde gouden kruis en donkere kleur, maar een volle vierkante tegel (iOS en Android ronden zelf af) en meer ruimte
// rondom, zodat het kruis ook in de maskable-veilige zone (cirkel van 80%) valt en nooit wordt afgesneden.
import { readFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const logo = readFileSync('public/favicon.svg', 'utf8');
const tegel = /<rect[^>]*fill="([^"]+)"/.exec(logo)[1];
const [, goud, kruis] = /<g fill="([^"]+)"[^>]*>([\s\S]*)<\/g>\s*<\/svg>/.exec(logo);

// Kruis: 92 eenheden hoog, midden op y=48. Schaal 4 per 512 px = 368 px hoog (72%); verste punt 46×4 = 184 px < 205 px (40%).
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${tegel}"/>
  <g fill="${goud}" transform="translate(256 256) scale(4) translate(-32 -48)">${kruis}</g>
</svg>`;

mkdirSync('public/icons', { recursive: true });
for (const [bestand, px] of [
  ['public/icons/icon-512.png', 512],
  ['public/icons/icon-192.png', 192],
  ['public/apple-touch-icon.png', 180],
]) {
  await sharp(Buffer.from(svg), { density: 72 * (px / 512) * 4 }).resize(px, px).flatten({ background: tegel }).png().toFile(bestand);
  console.log(bestand, `${px}×${px}`);
}
