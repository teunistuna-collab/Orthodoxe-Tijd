// Manuscriptkader voor de kaarten en de zoekbalk op Gebeden (border-image, 9-slice) — draaien met: node scripts/kaart-rand.mjs
// Dubbele lijn (buiten donkerbruin, binnen goud-oker), licht verweerd, met in alle vier de hoeken het rood/blauw/gouden
// hoekornament uit de aangeleverde referentie (scripts/kaart-referentie.webp, linksboven van "Ochtendgebeden"),
// losgemaakt van het perkament en gespiegeld voor de andere hoeken. Het midden blijft leeg (de kaart zelf is perkament).
import sharp from 'sharp';

// 1. hoekornament uitsnijden en het perkament eromheen doorzichtig maken
const { data, info } = await sharp('scripts/kaart-referentie.webp').extract({ left: 52, top: 54, width: 56, height: 60 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const N = info.width * info.height; const rgba = Buffer.alloc(N * 4);
for (let p = 0; p < N; p++) {
  const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2];
  // afstand tot het perkament (ongeveer 240,205,145); perkament, craquelé en lichte verwering vallen weg
  const d = Math.max(Math.abs(r - 240), Math.abs(g - 205), Math.abs(b - 145) * 0.6);
  const a = Math.max(0, Math.min(1, (d - 45) / 30));
  rgba[p * 4] = r; rgba[p * 4 + 1] = g; rgba[p * 4 + 2] = b; rgba[p * 4 + 3] = Math.round(a * 255);
}
const orn = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).resize(104, 111).png().toBuffer();

// 2. het kader: 400×400, slice 130 px (in CSS 32 px op desktop, 24 px op mobiel)
const M = 400, S = 130;
const lijnen = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${M}" height="${M}">
  <defs><filter id="ruw" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="11" result="ruis"/>
    <feDisplacementMap in="SourceGraphic" in2="ruis" scale="3" xChannelSelector="R" yChannelSelector="G" result="v"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="2" seed="5" result="vlek"/>
    <feColorMatrix in="vlek" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 2.6" result="gaten"/>
    <feComposite in="v" in2="gaten" operator="in"/></filter></defs>
  <g filter="url(#ruw)" fill="none">
    <rect x="6" y="6" width="${M - 12}" height="${M - 12}" stroke="#3f2412" stroke-width="7" opacity=".9"/>
    <rect x="13" y="13" width="${M - 26}" height="${M - 26}" stroke="#b07a2a" stroke-width="5" opacity=".95"/>
    <rect x="19" y="19" width="${M - 38}" height="${M - 38}" stroke="#3f2412" stroke-width="2" opacity=".75"/>
  </g></svg>`);
const flip = (b, h, v) => { let x = sharp(b); if (h) x = x.flop(); if (v) x = x.flip(); return x.png().toBuffer(); };
const P = 24; // binnen de lijnen
await sharp(lijnen).composite([
  { input: orn, left: P, top: P },
  { input: await flip(orn, true, false), left: M - P - 104, top: P },
  { input: await flip(orn, false, true), left: P, top: M - P - 111 },
  { input: await flip(orn, true, true), left: M - P - 104, top: M - P - 111 },
]).png().toFile('public/images/ui/kaart-rand.png');
console.log('public/images/ui/kaart-rand.png', M + 'x' + M, 'slice', S);
