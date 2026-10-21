import { addDays, type DagInfo, type Mode } from './kalender';
import { GROTE_FEESTEN, PASCHA, type Feest } from './feesten';
import { PASCHA_INFO } from './cyclusTeksten';
import { paascyclusActief, paascyclusVoor, STAPPEN, type StapKey } from './paascyclus';
import { PERIODE_POPUPS, STAP_INHOUD } from './paascyclusTeksten';
import { kleurVanDeDag, type KleurVanDeDag } from './liturgischeKleur';
import { geboortecyclusVoor } from './geboortecyclus';
import { BRON_CONCEPT, GEBOORTE_GEBRUIKEN, GEBOORTE_UITLEG, GEBOORTE_WEETJES, KERKVADER_PER_PERIODE, KERKVADERS } from './geboorteInhoud';
import { actieveCyclus, type Cyclus } from './seizoen';

/*
 * "De betekenis van vandaag": daginformatie die alleen tijdens de Paascyclus verschijnt (Zondag van de Tollenaar en de
 * Farizeeër t/m Pinksteren; paascyclusActief in lib/paascyclus.ts). Gebruikt door Vandaag en Pascha.
 *
 * Alleen bestaande, aangeleverde inhoud, steeds met de bron:
 * - liturgische kleur: lib/liturgischeKleur.ts (gebruikelijke gewaadkleur, Russische traditie / ROCOR);
 * - liturgie en weetje: de toelichting van het feest (lib/feesten.ts) of de tekst van de periode uit
 *   "De orthodoxe Paschale cyclus.docx" (lib/paascyclusTeksten.ts);
 * - hymne: het troparion van het feest (lib/feesten.ts), in de Paastijd het paastroparion; eigen Nederlandse weergave;
 * - traditie: dezelfde docx en "Tradities en viering" (PASCHA_INFO);
 * - icoon: alleen waar de site een aangeleverd icoon heeft (Pascha en de Lichte Week).
 * Woord van de kerkvaders: nog geen gecontroleerde Nederlandse teksten aangeleverd, dus niet getoond.
 * Ontbreekt een onderdeel voor een dag, dan wordt het weggelaten (geen lege kaart).
 */

export interface Tekstdeel {
  titel: string;
  tekst: string;
  /** Kort label boven de tekst, bijvoorbeeld "Troparion" of "Kerkelijke traditie". */
  soort?: string;
  bron: string;
  /** Nog niet gecontroleerde concepttekst (zichtbaar gemarkeerd). */
  concept?: boolean;
}
export interface IcoonVanDeDag {
  beeld: string;
  breedte: number;
  hoogte: number;
  naam: string;
  betekenis: string;
  bron: string;
  /** Periode-icoon: past bij de periode, maar is niet de icoon van deze dag. */
  periodeIcoon?: boolean;
  schrift?: string;
}
export interface BetekenisVanVandaag {
  cyclus: Cyclus;
  /** Pagina van de cyclus (Pascha of Geboortecyclus). */
  link: string;
  kleur: KleurVanDeDag;
  periode: { key: string; label: string; van: Date; tot: Date };
  icoon?: IcoonVanDeDag;
  liturgie?: Tekstdeel;
  hymne?: Tekstdeel;
  traditie?: Tekstdeel;
  kerkvader?: Tekstdeel;
  weetje?: Tekstdeel;
}

const BRON_DOCX = '“De orthodoxe Paschale cyclus” (tekst van de site)';
const BRON_FEESTEN = 'Toelichting bij het feest (feestenkalender van de site)';
const BRON_TROPARION = 'Eigen Nederlandse weergave (zie Bronnen)';
const BRON_TRADITIES = '“Tradities en viering” (Pascha-pagina)';

// Losse onderdelen uit de bestaande teksten; ontbreekt er een, dan geeft de functie undefined (scripts/paascyclus.check.ts
// controleert dat ze allemaal bestaan).
const sectie = (k: keyof typeof PERIODE_POPUPS, s: number) => PERIODE_POPUPS[k].sections?.[s];
const item = (k: keyof typeof PERIODE_POPUPS, s: number, i: number) => sectie(k, s)?.items?.[i];
const alinea = (k: keyof typeof PERIODE_POPUPS, s: number, i: number) => sectie(k, s)?.paragraphs?.[i];
const na = (k: keyof typeof PERIODE_POPUPS, s: number, i: number) => sectie(k, s)?.after?.[i];
/** Het deel na de eerste " — " ("Lichte Vrijdag — Levenschenkende Bron." → "Levenschenkende Bron."). */
const naStreep = (t?: string) => (t?.includes(' — ') ? t.slice(t.indexOf(' — ') + 3) : t);
const deel = (titel: string, tekst: string | undefined, bron: string, soort?: string): Tekstdeel | undefined => (tekst ? { titel, tekst, bron, ...(soort ? { soort } : {}) } : undefined);

/** Gebruiken per periode (en enkele dagen), met het onderscheid tussen kerkelijke traditie en volksgebruik. */
function traditie(key: StapKey, offset: number): Tekstdeel | undefined {
  const titel = 'Orthodoxe traditie thuis';
  if (offset === -49) return deel(titel, na('voorbereiding', 0, 0), BRON_DOCX, 'Kerkelijke traditie · Vergevingszondag');
  if (key === 'grote-vasten') return deel(titel, na('grote-vasten', 1, 0), BRON_DOCX, 'Kerkelijke traditie');
  if (key === 'pascha' || key === 'lichte-week') return deel(titel, alinea('pascha', 0, 1), BRON_DOCX, 'Kerkelijke traditie · de paasgroet');
  if (offset === 9) return deel(titel, naStreep(item('vijftig-dagen', 0, 1)), BRON_DOCX, 'Radonitsa');
  if (key === 'paastijd') return deel(titel, PASCHA_INFO.tradities.sections?.[0]?.items?.[4], BRON_TRADITIES, 'Kerkelijke traditie');
  if (key === 'pinksteren') return deel(titel, naStreep(item('pinksteren', 0, 0)), BRON_DOCX, 'Kerkelijke traditie');
  if (key === 'voorbereiding') return deel(titel, PASCHA_INFO.tradities.sections?.[0]?.items?.[0], BRON_TRADITIES, 'Kerkelijke traditie');
  return undefined;
}

/** Eén weetje per periode of dag. */
function weetje(key: StapKey, offset: number): Tekstdeel | undefined {
  const titel = 'Bijzonder weetje';
  if (offset === 5) return deel(titel, item('pascha', 1, 5), BRON_DOCX);
  if (offset === 6) return deel(titel, item('pascha', 1, 6), BRON_DOCX);
  const per: Partial<Record<StapKey, string | undefined>> = {
    voorbereiding: alinea('voorbereiding', 0, 0),
    'grote-vasten': item('grote-vasten', 1, 9),
    lazarus: item('goede-week', 0, 0),
    palmzondag: item('goede-week', 0, 1),
    'goede-week': alinea('goede-week', 1, 0),
    pascha: item('pascha', 1, 0),
    'lichte-week': alinea('pascha', 0, 2),
    paastijd: item('hemelvaart', 0, 0),
    hemelvaart: item('hemelvaart', 0, 0),
    pinksteren: alinea('pinksteren', 0, 0),
  };
  return deel(titel, per[key], BRON_DOCX);
}

/** De beweeglijke gedachtenis van de dag (Paascyclus), anders het eerste feest van de kalender. */
const feestVan = (dag: DagInfo): Feest | undefined => dag.feesten.find((f) => f.offset !== undefined) ?? dag.feesten[0];

/** Alle onderdelen voor een dag in de actieve seizoensuitbreiding (Paascyclus of Geboortecyclus); null daarbuiten. */
export function betekenisVoor(dag: DagInfo, mode: Mode): BetekenisVanVandaag | null {
  const cyclus = actieveCyclus(dag.civil, mode);
  return cyclus === 'pascha' ? betekenisPascha(dag) : cyclus === 'geboorte' ? betekenisGeboorte(dag, mode) : null;
}

function betekenisPascha(dag: DagInfo): BetekenisVanVandaag | null {
  if (!paascyclusActief(dag.civil)) return null;
  const cyclus = paascyclusVoor(dag.civil);
  const stap = STAPPEN.find((s) => s.key === cyclus.huidige)!;
  const off = cyclus.offset;
  const feest = feestVan(dag);

  // Liturgie: wat de Kerk vandaag viert (het feest), anders de periode; de diensttijden staan er bewust niet bij.
  const periodeTekst = STAP_INHOUD[stap.key].sections?.[0]?.paragraphs?.[0];
  const liturgie =
    feest?.toelichting
      ? deel('Liturgie van vandaag', feest.toelichting, BRON_FEESTEN, feest.naam)
      : deel('Liturgie van vandaag', periodeTekst, BRON_DOCX, stap.label);

  // Hymne: het troparion van het feest; in de Paastijd (tot de Afsluiting van Pascha) het paastroparion.
  const troparion = feest?.troparion ?? (off >= 0 && off <= 38 ? PASCHA.troparion : undefined);
  const hymne = deel('Hymne van de dag', troparion, BRON_TROPARION, feest?.troparion ? `Troparion · ${feest.kort ?? feest.naam}` : 'Troparion van Pascha (tot de Afsluiting van Pascha)');

  // Icoon: alleen het aangeleverde icoon van de Verrijzenis, op Pascha en in de Lichte Week.
  const icoon: IcoonVanDeDag | undefined =
    off >= 0 && off <= 6
      ? { beeld: '/images/feesten/pascha.webp', breedte: 569, hoogte: 800, naam: 'Icoon van de Verrijzenis van Christus', betekenis: alinea('pascha', 0, 0) ?? '', bron: 'Icoon van de site (Pascha-pagina); tekst: ' + BRON_DOCX }
      : undefined;

  return {
    cyclus: 'pascha',
    link: '#pascha',
    kleur: kleurVanDeDag(dag),
    periode: { key: stap.key, label: stap.label, van: addDays(cyclus.pascha, stap.offsetRange[0]), tot: addDays(cyclus.pascha, stap.offsetRange[1]) },
    ...(icoon && icoon.betekenis ? { icoon } : {}),
    ...(liturgie ? { liturgie } : {}),
    ...(hymne ? { hymne } : {}),
    ...(traditie(stap.key, off) ? { traditie: traditie(stap.key, off) } : {}),
    ...(weetje(stap.key, off) ? { weetje: weetje(stap.key, off) } : {}),
  };
}

/* ---------- Geboortecyclus ---------- */

const KERSTMIS = GROTE_FEESTEN.find((f) => f.id === 'kerstmis')!;
const THEOFANIE = GROTE_FEESTEN.find((f) => f.id === 'theofanie')!;
const concept = (titel: string, tekst: string, soort?: string): Tekstdeel => ({ titel, tekst, bron: BRON_CONCEPT, concept: true, ...(soort ? { soort } : {}) });

function betekenisGeboorte(dag: DagInfo, mode: Mode): BetekenisVanVandaag | null {
  const cyclus = geboortecyclusVoor(dag.civil, mode);
  const key = cyclus.huidige;
  if (!key) return null;
  const stap = cyclus.stappen.find((s) => s.key === key)!;
  const feest = dag.feesten.find((f) => f.toelichting);

  // Liturgie: de (gecontroleerde) toelichting van het feest van de dag, anders de uitleg van de periode (concept)
  const liturgie = feest?.toelichting ? deel('Liturgie van vandaag', feest.toelichting, BRON_FEESTEN, feest.naam)! : concept('Liturgie van vandaag', GEBOORTE_UITLEG[key], stap.label);

  // Hymne: het troparion van de Geboorte en van Theofanie (t/m hun nafeest), anders dat van het feest van de dag
  const trop: [Feest, string] | undefined = key === 'geboorte' || key === 'nafeest'
    ? [KERSTMIS, 'Toon 4']
    : key === 'theofanie' || key === 'nafeest-theofanie'
      ? [THEOFANIE, 'Toon 1']
      : feest?.troparion
        ? [feest, '']
        : undefined;
  const hymne = trop ? deel('Hymne van de dag', trop[0].troparion, BRON_TROPARION, `Troparion · ${trop[0].kort ?? trop[0].naam}${trop[1] ? ` · ${trop[1]}` : ''}`) : undefined;

  // Icoon: het aangeleverde icoon van de Geboorte; van de vasten t/m de vooravond als icoon van de periode
  const feestIcoon = key === 'geboorte' || key === 'nafeest';
  const metIcoon = ['vasten', 'voorouders', 'vaders', 'voorfeest', 'vooravond', 'geboorte', 'nafeest'].includes(key);
  const icoon: IcoonVanDeDag | undefined = metIcoon
    ? {
        beeld: '/images/feesten/kerst.jpg',
        breedte: 474,
        hoogte: 714,
        naam: feestIcoon ? 'Icoon van de Geboorte van Christus' : 'Icoon van de Geboorte van Christus (icoon van de periode)',
        periodeIcoon: !feestIcoon,
        betekenis: 'Op de traditionele icoon van de Geboorte ligt het Kind in een kribbe in een grot, gewikkeld in doeken; de os en de ezel buigen zich over Hem. De Moeder Gods rust naast de kribbe. Boven straalt de ster; engelen verkondigen het nieuws aan de herders en de wijzen naderen met hun geschenken. Onderaan zit Jozef in gedachten, terwijl het Kind wordt gewassen.',
        schrift: 'Lucas 2:1–20; Matteüs 2:1–12',
        bron: 'Icoon van de site (Feesten); herkomst en gebruiksrecht nog vast te stellen. Tekst: ' + BRON_CONCEPT,
      }
    : undefined;

  // Traditie: de (gecontroleerde) gebruiken van het feest, anders het concept van de periode
  const gebruik = GEBOORTE_GEBRUIKEN[key];
  const traditie =
    key === 'vooravond' || key === 'nafeest'
      ? deel('Orthodoxe traditie thuis', KERSTMIS.traditie, BRON_FEESTEN, 'Kerkelijke traditie en Slavische volksgebruiken')
      : key === 'vooravond-theofanie' || key === 'theofanie' || key === 'nafeest-theofanie'
        ? deel('Orthodoxe traditie thuis', THEOFANIE.traditie, BRON_FEESTEN, 'Kerkelijke traditie')
        : gebruik
          ? concept('Orthodoxe traditie thuis', gebruik.tekst, gebruik.soort)
          : undefined;

  const kv = KERKVADERS[KERKVADER_PER_PERIODE[key]];
  return {
    cyclus: 'geboorte',
    link: '#geboorte',
    kleur: kleurVanDeDag(dag),
    periode: { key, label: stap.label, van: stap.van, tot: stap.tot },
    ...(icoon ? { icoon } : {}),
    liturgie,
    ...(hymne ? { hymne } : {}),
    ...(traditie ? { traditie } : {}),
    kerkvader: { titel: 'Woord van de kerkvaders', tekst: kv.tekst, bron: kv.bron, soort: kv.bron.split(',')[0], concept: true },
    weetje: concept('Bijzonder weetje', GEBOORTE_WEETJES[key]),
  };
}
