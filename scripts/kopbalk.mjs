// Kopbalk (web) uit de aangeleverde balk scripts/kopbalk-bron.webp — draaien met: node scripts/kopbalk.mjs
// - kopbalk-leer.webp: het donkere, verweerde leer met de gouden lijnen boven en onder (border-image, 9-slice: de lijnen
//   blijven scherp, het leer rekt mee);
// - kopbalk-band.webp: de blauwe bloemenband eronder (schaalt mee met de breedte, nooit vervormd).
import sharp from 'sharp';

await sharp('scripts/kopbalk-bron.webp').extract({ left: 0, top: 207, width: 2000, height: 158 }).webp({ quality: 82 }).toFile('public/images/ui/kopbalk-leer.webp');
await sharp('scripts/kopbalk-bron.webp').extract({ left: 0, top: 364, width: 2000, height: 38 }).webp({ quality: 86 }).toFile('public/images/ui/kopbalk-band.webp');
console.log('public/images/ui/kopbalk-leer.webp 2000x158, kopbalk-band.webp 2000x38');
