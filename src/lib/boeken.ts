// De boekenbibliotheek (#boeken, alleen mobiel): de catalogus uit public/data/boeken.json (aangeleverd als
// orthodox_logos_boeken.json, aangevuld uit Orthodox_Logos_Nederlandstalige_boeken 2.xlsx: vier boeken van het
// Nederlands-Vlaams Bijbelgenootschap; een bijgewerkte catalogus vervangt gewoon dat bestand). Alle velden blijven bewaard,
// maar prijzen en voorraad worden nergens getoond. Geen webshop: een boek opent de officiële productpagina.

export interface Boek {
  slug: string;
  titel: string;
  auteur: string;
  taal: string;
  categorieen: string[];
  link: string;
  samenvatting: string;
  /** Bewaard maar niet gebruikt zolang OMSLAGEN_AAN false is */
  omslag?: string;
  prijs?: number | null;
  vanPrijs?: number | null;
  opVoorraad?: boolean;
}

/** Omslagen pas aanzetten na toestemming (de definitieve omslagen worden later aangeleverd). */
export const OMSLAGEN_AAN = false;

/** Tijdelijke afbeelding per categorie (aangeleverd 27-10-2026, public/images/boeken; geen echte omslag): hetzelfde neutrale
 *  boek in een eigen kaftkleur. Een boek krijgt die van zijn eerste categorie met een afbeelding. */
const CATEGORIE_BEELD: Record<string, string> = {
  'Gebed en het Jezusgebed': 'gebed_en_het_jezusgebed',
  'Geestelijk leven': 'geestelijk_leven',
  Heiligenlevens: 'heiligenlevens',
  'Liturgie en sacramenten': 'liturgie_en_sacramenten',
  'Theologie en geloofsleer': 'theologie_en_geloofsleer',
  Kinderboeken: 'kinderboeken',
  'Iconen en kerkelijke kunst': 'iconen_en_kerkelijke_kunst',
  'Verhalen en getuigenissen': 'verhalen_en_getuigenissen',
  'Bijbel en kerkvaders': 'bijbel_en_kerkvaders',
  'Kerk en samenleving': 'kerk_en_samenleving',
  'Iveron boeken': 'iveron_boeken',
  Partneruitgeverijen: 'partneruitgeverijen',
  'Abdij Bethlehem': 'abdij_bethlehem',
};
export function tijdelijkeOmslag(b: Boek): string | null {
  const c = b.categorieen.find((x) => CATEGORIE_BEELD[x]);
  return c ? `/images/boeken/${CATEGORIE_BEELD[c]}.webp` : null;
}

let laden: Promise<Boek[]> | null = null;
export function laadBoeken(): Promise<Boek[]> {
  laden ??= fetch('/data/boeken.json')
    .then((r) => {
      if (!r.ok) throw new Error('boeken.json ontbreekt');
      return r.json() as Promise<Boek[]>;
    })
    .catch((fout) => {
      laden = null;
      throw fout;
    });
  return laden;
}

/** Korte filternamen, gekoppeld aan de categorieën uit de catalogus. */
export const FILTERS: Array<{ id: string; label: string; categorie?: string }> = [
  { id: 'alle', label: 'Alle boeken' },
  { id: 'gebed', label: 'Gebed', categorie: 'Gebed en het Jezusgebed' },
  { id: 'geestelijk', label: 'Geestelijk leven', categorie: 'Geestelijk leven' },
  { id: 'heiligen', label: 'Heiligen', categorie: 'Heiligenlevens' },
  { id: 'liturgie', label: 'Liturgie', categorie: 'Liturgie en sacramenten' },
  { id: 'theologie', label: 'Theologie', categorie: 'Theologie en geloofsleer' },
  { id: 'kerkvaders', label: 'Bijbel en kerkvaders', categorie: 'Bijbel en kerkvaders' },
  { id: 'kinderen', label: 'Kinderboeken', categorie: 'Kinderboeken' },
  { id: 'iconen', label: 'Iconen', categorie: 'Iconen en kerkelijke kunst' },
  { id: 'verhalen', label: 'Verhalen', categorie: 'Verhalen en getuigenissen' },
  { id: 'samenleving', label: 'Kerk en samenleving', categorie: 'Kerk en samenleving' },
];

/** Categorieën die een uitgever of reeks aanduiden, geen onderwerp: niet als label tonen. */
const GEEN_ONDERWERP = new Set(['Iveron boeken', 'Partneruitgeverijen', 'Abdij Bethlehem']);
export const onderwerpen = (b: Boek) => b.categorieen.filter((c) => !GEEN_ONDERWERP.has(c));

/** Aanbevolen boeken (aanpasbaar): slugs uit de catalogus. */
export const AANBEVOLEN = ['orthodox-psalter', 'een-inleiding-tot-de-oosters-orthodoxe-theologie', 'zoals-in-de-schriften-staat'];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
/** Zoeken op titel, auteur, categorie en samenvatting, binnen een filter. */
export function zoekBoeken(boeken: Boek[], zoek: string, filter: string): Boek[] {
  const cat = FILTERS.find((f) => f.id === filter)?.categorie;
  const q = norm(zoek.trim());
  return boeken.filter((b) => (!cat || b.categorieen.includes(cat)) && (!q || norm(`${b.titel} ${b.auteur} ${b.categorieen.join(' ')} ${b.samenvatting}`).includes(q)));
}

/** Alleen de officiële productpagina's van de bekende winkels openen, met de naam van die winkel. */
const WINKELS = [
  { patroon: /^https:\/\/(www\.)?orthodoxlogos\.(com|nl)\//, naam: 'Orthodox Logos', knop: 'Bekijk bij Orthodox Logos' },
  { patroon: /^https:\/\/shop\.bijbelgenootschap\.nl\//, naam: 'het Nederlands-Vlaams Bijbelgenootschap', knop: 'Bekijk bij het Bijbelgenootschap' },
];
export function veiligeLink(b: Boek) {
  const w = WINKELS.find((x) => x.patroon.test(b.link));
  return w ? { url: b.link, naam: w.naam, knop: w.knop } : null;
}
