// Zet PNG/JPG in public/images om naar verkleinde WebP-bestanden.
// Gebruik: node scripts/optimize-images.mjs [--remove]   (--remove verwijdert de bronbestanden na conversie)
import sharp from 'sharp';
import { readdirSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';

const ROOT = 'public/images';
const VERWIJDER = process.argv.includes('--remove');

/** Maximale breedte per soort afbeelding (de afbeelding wordt nooit vergroot). */
function maxBreedte(pad, breedte, hoogte) {
  const p = pad.replace(/\\/g, '/');
  if (p.includes('/heroes/')) return 1800;
  if (p.endsWith('Christus-afbeelding.png')) return 800;
  // Vierkante iconen worden op hooguit ~140 px getoond; 512 px dekt 3× schermen.
  if (breedte === hoogte) return 512;
  return Math.min(breedte, 1400);
}

function loop(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? loop(p) : [p];
  });
}

let voor = 0;
let na = 0;
for (const bron of loop(ROOT).filter((f) => /\.(png|jpe?g)$/i.test(f))) {
  const doel = join(dirname(bron), basename(bron, extname(bron)) + '.webp');
  const meta = await sharp(bron).metadata();
  const breedte = maxBreedte(bron, meta.width, meta.height);
  const info = await sharp(bron)
    .resize({ width: breedte, withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 92, effort: 5 })
    .toFile(doel);
  voor += statSync(bron).size;
  na += info.size;
  console.log(`${bron} ${meta.width}×${meta.height} → ${info.width}×${info.height} · ${(statSync(bron).size / 1024).toFixed(0)} KB → ${(info.size / 1024).toFixed(0)} KB`);
  if (VERWIJDER && existsSync(doel)) unlinkSync(bron);
}
console.log(`\nTotaal: ${(voor / 1e6).toFixed(1)} MB → ${(na / 1e6).toFixed(1)} MB`);
