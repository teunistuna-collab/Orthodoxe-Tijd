// De boekenbibliotheek (#boeken, alleen mobiel): de catalogus van Orthodox Logos uit public/data/boeken.json (aangeleverd
// als orthodox_logos_boeken.json; een bijgewerkte catalogus vervangt gewoon dat bestand). Alle velden blijven bewaard,
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
export const AANBEVOLEN = ['de-geestelijke-ladder', 'de-orthodoxe-weg', 'de-kracht-van-de-naam'];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
/** Zoeken op titel, auteur, categorie en samenvatting, binnen een filter. */
export function zoekBoeken(boeken: Boek[], zoek: string, filter: string): Boek[] {
  const cat = FILTERS.find((f) => f.id === filter)?.categorie;
  const q = norm(zoek.trim());
  return boeken.filter((b) => (!cat || b.categorieen.includes(cat)) && (!q || norm(`${b.titel} ${b.auteur} ${b.categorieen.join(' ')} ${b.samenvatting}`).includes(q)));
}

/** Alleen de officiële productpagina's van Orthodox Logos openen. */
export const veiligeLink = (b: Boek) => (/^https:\/\/(www\.)?orthodoxlogos\.(com|nl)\//.test(b.link) ? b.link : null);
