// Zet het startpagina-pakket (achtergronden, initialen, ornamenten) om naar WebP in public/images/vandaag.
// De bronbestanden blijven ongewijzigd in het pakket; transparantie van de initialen blijft behouden.
// Gebruik: node scripts/vandaag-beelden.mjs [map van het pakket]
import sharp from 'sharp';
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BRON = process.argv[2] ?? 'C:/Users/Beunis/Downloads/Orthodoxe-Tijd-Startpagina/Orthodoxe-Tijd-Startpagina';
const DOEL = 'public/images/vandaag';
mkdirSync(DOEL, { recursive: true });

// [bron, doelnaam, breedtes]
const BEELDEN = [
  ['achtergronden/kerk-header.png', 'kerk-header', [800, 1536]],
  ['achtergronden/papyrus-licht.png', 'papyrus-licht', [1024]],
  ['achtergronden/stilte-olijftak.png', 'stilte-olijftak', [900, 1774]],
  ...['vespers-V', 'completen-C', 'middernacht-M', 'metten-M', 'eerste-uur-E', 'derde-uur-D', 'zesde-uur-Z', 'negende-uur-N'].map((n) => [`initialen/${n}.png`, n, [280]]),
];

for (const [bron, naam, breedtes] of BEELDEN) {
  for (const b of breedtes) {
    const doel = join(DOEL, breedtes.length > 1 ? `${naam}-${b}.webp` : `${naam}.webp`);
    const info = await sharp(join(BRON, bron)).resize({ width: b, withoutEnlargement: true }).webp({ quality: 78, alphaQuality: 90, effort: 5 }).toFile(doel);
    console.log(`${doel} ${info.width}×${info.height} · ${(info.size / 1024).toFixed(0)} KB`);
  }
}
for (const svg of ['sierboog.svg', 'sierlijn.svg']) copyFileSync(join(BRON, 'ornamenten', svg), join(DOEL, svg));
