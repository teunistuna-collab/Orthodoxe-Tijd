import type { Mode } from './kalender';
import { geboortecyclusVoor } from './geboortecyclus';
import { paascyclusVoor } from './paascyclus';

// De aftelling op Vandaag: naar het eerstvolgende van de twee grote feesten (Pascha of de Geboorte van Christus), met
// dezelfde berekening als de Pascha- en Geboortepagina (lib/paascyclus.ts, lib/geboortecyclus.ts). In de feesttijd zelf
// (Pascha t/m Pinksteren, de Geboorte t/m het nafeest) is er niets af te tellen: dan de feestgroet.

export interface Aftelling {
  cyclus: 'pascha' | 'geboorte';
  dagen: number;
  /** Label boven de kaart */
  label: string;
  onder: string;
  voet: string;
  groet: string[];
  href: string;
}

const PASCHA = { onder: 'Tot de heilige Verrijzenis van Christus', voet: 'Een weg van vasten, gebed en verwachting.', groet: ['Christus is opgestaan!', 'Hij is waarlijk opgestaan!'] };
const GEBOORTE = { onder: 'Tot de heilige Geboorte van Christus', voet: 'Een tijd van verwachting, vasten en gebed.', groet: ['Christus wordt geboren, verheerlijkt Hem!'] };

export function aftellingVoor(dag: Date, mode: Mode): Aftelling {
  const p = paascyclusVoor(dag);
  const g = geboortecyclusVoor(dag, mode);
  // Paastijd: van Pascha t/m Pinksteren de paasgroet, met de naam van de periode
  if (p.offset >= 0 && p.huidige) {
    const stap = p.stappen.find((s) => s.key === p.huidige)!;
    return { cyclus: 'pascha', dagen: 0, label: p.offset === 0 ? 'Vandaag is het heilige Pascha' : stap.label, ...PASCHA, href: p.offset === 0 ? '#pascha/pascha' : `#pascha/${stap.key}` };
  }
  // Kersttijd: de Geboorte en het nafeest
  if (g.dagenTotGeboorte === 0 && (g.huidige === 'geboorte' || g.huidige === 'nafeest')) {
    return { cyclus: 'geboorte', dagen: 0, label: 'De Geboorte van Christus', ...GEBOORTE, href: '#geboorte/geboorte' };
  }
  const naarGeboorte = g.dagenTotGeboorte > 0 && (p.dagenTotPascha === 0 || g.dagenTotGeboorte <= p.dagenTotPascha);
  return naarGeboorte
    ? { cyclus: 'geboorte', dagen: g.dagenTotGeboorte, label: 'Op weg naar de Geboorte', ...GEBOORTE, href: '#geboorte' }
    : { cyclus: 'pascha', dagen: p.dagenTotPascha, label: 'Op weg naar Pascha', ...PASCHA, href: '#pascha' };
}
