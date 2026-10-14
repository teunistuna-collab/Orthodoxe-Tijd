// Zet beelden uit het overdrachtspakket (Orthodoxe_Tijd_Complete_Overdracht/afbeeldingen) om naar WebP in
// public/images/ontwerp. De bronbestanden blijven ongewijzigd.
// Gebruik: node scripts/ontwerp-beelden.mjs <map afbeeldingen> <naam> [<naam> ...]   (naam zonder .png)
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [BRON, ...namen] = process.argv.slice(2);
if (!BRON || !namen.length) throw new Error('Gebruik: node scripts/ontwerp-beelden.mjs <map afbeeldingen> <naam> [...]');
const DOEL = 'public/images/ontwerp';
mkdirSync(DOEL, { recursive: true });

for (const naam of namen) {
  // Banners en randen in twee breedtes; initialen (vierkant) in één kleine maat.
  const meta = await sharp(join(BRON, `${naam}.png`)).metadata();
  const breedtes = meta.width === meta.height ? [280] : [800, 1536];
  for (const b of breedtes) {
    const doel = join(DOEL, breedtes.length > 1 ? `${naam}-${b}.webp` : `${naam}.webp`);
    const info = await sharp(join(BRON, `${naam}.png`)).resize({ width: b, withoutEnlargement: true }).webp({ quality: 76, alphaQuality: 90, effort: 5 }).toFile(doel);
    console.log(`${doel} ${info.width}×${info.height} · ${(info.size / 1024).toFixed(0)} KB`);
  }
}
