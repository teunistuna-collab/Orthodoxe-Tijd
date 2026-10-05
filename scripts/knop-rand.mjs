// Verweerde, gedrukte rand voor knoppen en zoekvensters (border-image, 9-slice) — draaien met: node scripts/knop-rand.mjs
// Een dubbele inktlijn (dik buiten, dun binnen) in goudbruin, met ruis vervormd en hier en daar afgebladderd,
// zodat hij er gedrukt/geschilderd en wat versleten uitziet. Hoeken blijven scherp, de zijden rekken mee.
import sharp from 'sharp';

const M = 240; // vierkant, op dubbele resolutie; slice 60 px aan elke kant (in CSS 30 px breed)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${M}" height="${M}">
  <defs>
    <filter id="ruw" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="ruis"/>
      <feDisplacementMap in="SourceGraphic" in2="ruis" scale="5" xChannelSelector="R" yChannelSelector="G" result="vervormd"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="3" result="vlek"/>
      <feColorMatrix in="vlek" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -4 2.85" result="gaten"/>
      <feComposite in="vervormd" in2="gaten" operator="in"/>
    </filter>
  </defs>
  <g filter="url(#ruw)" fill="none" stroke="#7d5218">
    <rect x="10" y="10" width="${M - 20}" height="${M - 20}" stroke-width="5" opacity=".9"/>
    <rect x="22" y="22" width="${M - 44}" height="${M - 44}" stroke-width="2" opacity=".7"/>
  </g>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/images/ui/knop-rand.png');
console.log('public/images/ui/knop-rand.png', M + 'x' + M);
