// Feestdagen op Vandaag (pakket "Orthodoxe_Tijd_Feestdagen_Gecorrigeerd", feestdagen.js), alleen presentatie:
// welk icoon, welke begroeting en welke link. Wanneer het feest of de feesttijd is, komt uit de centrale kalender
// (dagInfo, vastenPeriodes, de Paschaberekening) en wordt in feestVoorDag naar deze context vertaald.

import { dagInfo, daysBetween, orthodoxPascha, type Mode } from './kalender';
import { bidBeeld, icoonVan } from './bidbeelden';
import type { Feest } from './feesten';
import { geboortecyclusVoor, type GeboorteKey } from './geboortecyclus';
import { periodeVoortgang, vastenPeriodes } from './overzicht';
import { paascyclusVoor, zondagVanDeWeek, type StapKey } from './paascyclus';
import { PASCHA_DAGICONEN } from './paascyclusTeksten';

export type FeestId = 'pascha' | 'nativity';

export type FeestContext = {
  route: string;
  feastId: FeestId | null;
  isFeastDay: boolean;
  afterfeastId: FeestId | null;
  isAfterfeast: boolean;
};

const THEMAS: Record<FeestId, { beeld: string; breedte: number; hoogte: number; alt: string; groet: string; antwoord: string; linkLabel: string }> = {
  pascha: { beeld: '/images/feesten/pascha.webp', breedte: 569, hoogte: 800, alt: 'Icoon van de Verrijzenis van Christus', groet: 'Christus is opgestaan!', antwoord: 'Hij is waarlijk opgestaan!', linkLabel: 'Vier Pascha' },
  nativity: { beeld: '/images/feesten/kerst.jpg', breedte: 474, hoogte: 714, alt: 'Icoon van de Geboorte van Christus', groet: 'Christus is geboren!', antwoord: 'Verheerlijkt Hem!', linkLabel: 'Vier de Geboorte' },
};

export type FeestThema = (typeof THEMAS)[FeestId] & { id: FeestId; fase: 'dag' | 'nafeest' };

/** Het feestthema voor Vandaag, of null op een gewone dag. */
export function feestThema(context: FeestContext): FeestThema | null {
  if (context.route !== 'vandaag') return null;
  if (context.isFeastDay && context.feastId) return { ...THEMAS[context.feastId], id: context.feastId, fase: 'dag' };
  if (context.isAfterfeast && context.afterfeastId) return { ...THEMAS[context.afterfeastId], id: context.afterfeastId, fase: 'nafeest' };
  return null;
}

/** Het feest van een dag volgens de centrale kalender en de gekozen kalender (oud/nieuw):
 *  - Pascha: de feestdag uit de Paschaberekening; de feesttijd tot het einde van de Paastijd (Pascha + 49, zoals op de
 *    Paschapagina);
 *  - Geboorte van Christus: de feestdag uit de vaste feesten (kerkelijke datum 25 december); de feesttijd is de Kersttijd
 *    uit lib/overzicht.ts (de Twaalf Heilige Dagen, tot de vooravond van Theofanie). */
export function feestVoorDag(dag: Date, mode: Mode): FeestThema | null {
  const naPascha = daysBetween(orthodoxPascha(dag.getUTCFullYear()), dag);
  const isKerstmis = dagInfo(dag, mode).feesten.some((f) => f.id === 'kerstmis');
  const kersttijd = [dag.getUTCFullYear() - 1, dag.getUTCFullYear()].flatMap((j) => vastenPeriodes(j, mode)).some((p) => p.id === 'kersttijd' && p.start <= dag && dag <= p.eind);
  const paastijd = naPascha > 0 && naPascha <= 49;
  return feestThema({
    route: 'vandaag',
    feastId: naPascha === 0 ? 'pascha' : isKerstmis ? 'nativity' : null,
    isFeastDay: naPascha === 0 || isKerstmis,
    afterfeastId: paastijd ? 'pascha' : kersttijd ? 'nativity' : null,
    isAfterfeast: paastijd || kersttijd,
  });
}

/* ---------- Dagthema (spec: docs/superpowers/specs/2026-11-07-dagthema-design.md) ---------- */

export type Toon = 'ingetogen' | 'verstild' | 'licht';
/** Kop van Vandaag op een belangrijke dag: het analogion-beeld, anders het icoon van de dag. */
export interface DagKop { soort: 'analogion' | 'icoon'; beeld: string; naam: string; regel?: string; groet?: { groet: string; antwoord: string } }
/** "Vandaag in de cyclus" op Vandaag. */
export interface CyclusKaart { soort: 'pascha' | 'geboorte'; periode: string; dag?: string; betekenis: string; href: string; voortgang?: string }
export interface DagThema { kop: DagKop | null; toon: Toon | null; cyclus: CyclusKaart | null }

const PASCHA_TOON: Record<StapKey, Toon> = {
  voorbereiding: 'ingetogen', 'grote-vasten': 'ingetogen', lazarus: 'ingetogen', palmzondag: 'ingetogen', 'goede-week': 'verstild',
  pascha: 'licht', 'lichte-week': 'licht', paastijd: 'licht', hemelvaart: 'licht', pinksteren: 'licht',
};
const GEBOORTE_LICHT = new Set<GeboorteKey>(['geboorte', 'nafeest', 'besnijdenis', 'voorfeest-theofanie', 'vooravond-theofanie', 'theofanie', 'nafeest-theofanie']);
/** Sfeer van een periode van de Geboortecyclus (ook op de Geboorte-pagina). */
export const geboorteToon = (k: GeboorteKey): Toon => (GEBOORTE_LICHT.has(k) ? 'licht' : 'ingetogen');

const naamVan = (f: Feest) => f.kort ?? f.naam.split(' — ')[0];
/** De eerste zin van een bestaande tekst (voor de korte regel in de kop). */
const eersteZin = (s?: string) => (s ? (s.match(/^.*?[.!?][”"’)]?(?=\s|$)/)?.[0] ?? s) : undefined);

/** Kop, toon en cyclus-kaart van een dag; null op een gewone dag buiten de cycli. */
export function dagThema(dag: Date, mode: Mode): DagThema | null {
  const info = dagInfo(dag, mode);
  const pc = paascyclusVoor(dag);
  const gc = geboortecyclusVoor(dag, mode);
  const feest = feestVoorDag(dag, mode);
  const groet = feest ? { groet: feest.groet, antwoord: feest.antwoord } : undefined;
  // De feesten van de dag, hoogste rang eerst
  const feesten = [...info.feesten].sort((a, b) => (b.rang ?? 0) - (a.rang ?? 0));

  // Kop: eerst een feest met een analogion-beeld, dan het icoon van de dag (Paschacyclus), dan een feest met een icoon
  let kop: DagKop | null = null;
  const metBeeld = feesten.find((f) => bidBeeld(f.id));
  // Alleen het eigen icoon van de dag; een periode-icoon (bijv. het nafeest van Hemelvaart) hoort niet in de kop
  const dagIcoon = pc.huidige && !PASCHA_DAGICONEN[pc.offset]?.periode ? PASCHA_DAGICONEN[pc.offset] : undefined;
  const metIcoon = feesten.find((f) => icoonVan(f.id));
  if (metBeeld) kop = { soort: 'analogion', beeld: bidBeeld(metBeeld.id)!, naam: naamVan(metBeeld), regel: eersteZin(metBeeld.toelichting), groet };
  else if (dagIcoon) kop = { soort: 'icoon', beeld: `/images/feesten/${dagIcoon.bestand}`, naam: feesten[0] ? naamVan(feesten[0]) : ((pc.offset % 7 === 0 ? zondagVanDeWeek(pc.offset)?.kort : undefined) ?? dagIcoon.naam), regel: eersteZin(dagIcoon.betekenis), groet };
  else if (metIcoon) kop = { soort: 'icoon', beeld: icoonVan(metIcoon.id)!, naam: naamVan(metIcoon), regel: eersteZin(metIcoon.toelichting), groet };

  // Voortgang in een vastenperiode (Grote Vasten, Geboortevasten): "Dag 12 van 48 · nog 37 dagen tot Pascha"
  const vasten = [dag.getUTCFullYear() - 1, dag.getUTCFullYear()].flatMap((j) => vastenPeriodes(j, mode)).find((p) => p.soort === 'vasten' && p.start <= dag && dag <= p.eind);
  const v = vasten ? periodeVoortgang(vasten, dag) : null;
  const voortgang = v ? `Dag ${v.dag} van ${v.van}${v.feest ? ` · nog ${v.nog} ${v.nog === 1 ? 'dag' : 'dagen'} tot ${v.feest}` : ''}` : undefined;
  const dagNaam = feesten[0] ? naamVan(feesten[0]) : undefined;

  let toon: Toon | null = null;
  let cyclus: CyclusKaart | null = null;
  if (pc.huidige) {
    const s = pc.stappen.find((x) => x.key === pc.huidige)!;
    toon = PASCHA_TOON[s.key];
    cyclus = { soort: 'pascha', periode: s.label, dag: dagNaam && !dagNaam.startsWith(s.label) ? dagNaam : undefined, betekenis: s.short, href: `#pascha/${s.key}`, voortgang };
  } else if (gc.huidige) {
    const s = gc.stappen.find((x) => x.key === gc.huidige)!;
    toon = geboorteToon(s.key);
    cyclus = { soort: 'geboorte', periode: s.label, dag: dagNaam && !dagNaam.startsWith(s.label) ? dagNaam : undefined, betekenis: s.short, href: `#geboorte/${s.key}`, voortgang };
  }
  return kop || toon || cyclus ? { kop, toon, cyclus } : null;
}
