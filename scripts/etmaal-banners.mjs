// Zet de acht aangeleverde Etmaal-banners om naar WebP in public/images/etmaal/banner (de bronnen blijven ongewijzigd).
// Bestandsnaam = slug van de dienst in lib/etmaal.ts. Daarnaast de brede webversies (2,5 : 1, "Banners Etmaal voor web") als <slug>-web-<breedte>.webp.
// Gebruik: node scripts/etmaal-banners.mjs [map met de banners 3:2] [map met de webbanners]
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BRON = process.argv[2] ?? 'C:/Users/Beunis/Downloads/Orthodoxe_Tijd_Etmaal_banners';
const BRON_WEB = process.argv[3];
const DOEL = 'public/images/etmaal/banner';
mkdirSync(DOEL, { recursive: true });

const BANNERS = {
  '18-00_Vespers.png': 'vespers',
  '21-00_Completen.png': 'completen',
  '00-00_Middernacht.png': 'middernachtdienst',
  '03-00_Metten.png': 'metten',
  '06-00_Eerste_uur.png': 'eerste-uur',
  '09-00_Derde_uur.png': 'derde-uur',
  '12-00_Zesde_uur.png': 'zesde-uur',
  '15-00_Negende_uur.png': 'negende-uur',
};

for (const [bron, naam] of Object.entries(BANNERS)) {
  for (const b of [800, 1536]) {
    const info = await sharp(join(BRON, bron)).resize({ width: b, withoutEnlargement: true }).webp({ quality: 76, effort: 5 }).toFile(join(DOEL, `${naam}-${b}.webp`));
    console.log(`${naam}-${b}.webp ${info.width}×${info.height} · ${(info.size / 1024).toFixed(0)} KB`);
  }
}
const WEB = {
  'Vespers.png': 'vespers',
  'Completen.png': 'completen',
  'Middernacht.png': 'middernachtdienst',
  'Metten.png': 'metten',
  'eerste uur.png': 'eerste-uur',
  'derde uur.png': 'derde-uur',
  'zesde uur.png': 'zesde-uur',
  'negende uur.png': 'negende-uur',
};
if (BRON_WEB) {
  for (const [bron, naam] of Object.entries(WEB)) {
    for (const b of [960, 1920]) {
      const info = await sharp(join(BRON_WEB, bron)).resize({ width: b, withoutEnlargement: true }).webp({ quality: 76, effort: 5 }).toFile(join(DOEL, `${naam}-web-${b}.webp`));
      console.log(`${naam}-web-${b}.webp ${info.width}×${info.height} · ${(info.size / 1024).toFixed(0)} KB`);
    }
  }
}
