// Voedselkaarten voor "Vasten vandaag" (Vlees, Zuivel, Eieren, Vis, Olie, Wijn) uit scripts/voedselkaarten-bron.png
// — draaien met: node scripts/voedselkaarten.mjs. De kaarten zijn rechthoekig en ondoorzichtig: alleen uitsnijden
// (de kolommen zijn gemeten op het schaakbord ertussen). In de lege cirkel zet de site een vinkje of kruis.
import sharp from 'sharp';

const KAARTEN = [['vlees', 39, 369], ['zuivel', 402, 722], ['eieren', 752, 1071], ['vis', 1101, 1422], ['olie', 1452, 1777], ['wijn', 1808, 2132]];
const BOVEN = 25, ONDER = 685, RAND = 3; // RAND: een paar pixels schaakbord langs de kaartrand weg
for (const [naam, x0, x1] of KAARTEN) {
  const m = await sharp('scripts/voedselkaarten-bron.png').extract({ left: x0 + RAND, top: BOVEN + RAND, width: x1 - x0 - 2 * RAND, height: ONDER - BOVEN - 2 * RAND })
    .resize({ width: 300, height: 620, fit: 'fill' }) // zelfde maat voor alle kaarten (verschil < 3 %)
    .webp({ quality: 86 }).toFile(`public/images/ui/voeding/${naam}.webp`);
  console.log(`public/images/ui/voeding/${naam}.webp`, m.width + 'x' + m.height);
}
