import type { VastenNiveau } from './vasten';

// Per voedselgroep: toegestaan of niet op een vastenniveau (lib/vasten.ts). Eén bron voor de vastentafel, de
// voedseltegels en de voedselkaarten in het dagvenster. Vlees t/m wijn: de bestaande regels van de Vasten-pagina.
// Groenten en graan: altijd, behalve bij onthouding ("Niets (water)"); peulvruchten ook niet bij droog voedsel
// (streng: "Brood, groenten, fruit, noten").

export type Voedselgroep = 'vlees' | 'eieren' | 'zuivel' | 'vis' | 'olie' | 'wijn' | 'groenten' | 'peulvruchten' | 'graan';

export const VOEDSELGROEPEN: Array<{ groep: Voedselgroep; naam: string }> = [
  { groep: 'vlees', naam: 'Vlees' },
  { groep: 'eieren', naam: 'Eieren' },
  { groep: 'zuivel', naam: 'Zuivel' },
  { groep: 'vis', naam: 'Vis' },
  { groep: 'olie', naam: 'Olie' },
  { groep: 'wijn', naam: 'Wijn' },
  { groep: 'groenten', naam: 'Groenten' },
  { groep: 'peulvruchten', naam: 'Peulvruchten' },
  { groep: 'graan', naam: 'Graan' },
];

const TOEGESTAAN_OP: Record<Voedselgroep, VastenNiveau[]> = {
  vlees: ['vrij', 'geen'],
  zuivel: ['vrij', 'geen', 'zuivel'],
  eieren: ['vrij', 'geen', 'zuivel'],
  vis: ['vrij', 'geen', 'zuivel', 'vis'],
  olie: ['vrij', 'geen', 'zuivel', 'vis', 'wijn-olie', 'vastendag'],
  wijn: ['vrij', 'geen', 'zuivel', 'vis', 'wijn-olie', 'vastendag'],
  groenten: ['vrij', 'geen', 'zuivel', 'vis', 'wijn-olie', 'zonder-olie', 'vastendag', 'streng'],
  peulvruchten: ['vrij', 'geen', 'zuivel', 'vis', 'wijn-olie', 'zonder-olie', 'vastendag'],
  graan: ['vrij', 'geen', 'zuivel', 'vis', 'wijn-olie', 'zonder-olie', 'vastendag', 'streng'],
};

export const voedselStatus = (niveau: VastenNiveau): Record<Voedselgroep, boolean> =>
  Object.fromEntries(VOEDSELGROEPEN.map(({ groep }) => [groep, TOEGESTAAN_OP[groep].includes(niveau)])) as Record<Voedselgroep, boolean>;
