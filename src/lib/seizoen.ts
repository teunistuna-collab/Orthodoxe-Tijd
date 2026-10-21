import type { Mode } from './kalender';
import { paascyclusActief } from './paascyclus';
import { geboortecyclusActief } from './geboortecyclus';

/** Welke seizoensuitbreiding vandaag actief is: de Paascyclus (Tollenaar en Farizeeër t/m Pinksteren), de Geboortecyclus
 *  (Geboortevasten t/m het nafeest van Theofanie) of geen. De twee overlappen nooit. */
export type Cyclus = 'pascha' | 'geboorte';
export const actieveCyclus = (dag: Date, mode: Mode): Cyclus | null => (paascyclusActief(dag) ? 'pascha' : geboortecyclusActief(dag, mode) ? 'geboorte' : null);
