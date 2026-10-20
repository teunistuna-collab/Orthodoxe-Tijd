// Feestdagen op Vandaag (pakket "Orthodoxe_Tijd_Feestdagen_Gecorrigeerd", feestdagen.js), alleen presentatie:
// welk icoon, welke begroeting en welke link. Wanneer het feest of de feesttijd is, komt uit de centrale kalender
// (dagInfo, vastenPeriodes, de Paschaberekening) en wordt in feestVoorDag naar deze context vertaald.

import { dagInfo, daysBetween, orthodoxPascha, type Mode } from './kalender';
import { vastenPeriodes } from './overzicht';

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
