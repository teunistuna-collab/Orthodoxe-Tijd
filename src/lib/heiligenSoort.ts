// Wat voor gedachtenis is een regel uit de heiligenlijst, en bij welke categorieën hoort een heilige?
// Werkt op de Engelse brontekst (holytrinityorthodox.com) én de Nederlandse naam, zodat beide lijsten
// (dagen.json en lib/heiligen.ts) dezelfde regels volgen. Controle: npm run check:heiligen.

const normaal = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Feesten van de Heer, de Moeder Gods en het Kruis (de heilige zelf staat dan elders op die dag).
const FEESTWOORD = /^(the |de |het )?(holy |heilige |universal |algemene )?(circumcision|besnijdenis|theophany|theofanie|nativity|geboorte|conception|ontvangenis|entry|entrance|intrede|presentation|opdracht|meeting|ontmoeting|annunciation|annunciatie|boodschap|transfiguration|transfiguratie|gedaanteverandering|dormition|ontslaping|protection|bescherming|exaltation|elevation|verheffing|kruisverheffing|procession|origin|placing|deposition|synaxis of the (most )?holy theotokos|synaxis van de (allerheiligste )?moeder gods|translation of the (image|icon))\b/;
const VAN_DE_HEER = /\b(our lord|onze heer|of christ|van christus|the lord|de heer|theotokos|mother of god|moeder gods|holy cross|precious cross|life-giving cross|heilig kruis|kostbaar kruis)\b/;
// Kalendernotities: voor- en nafeest, zondag/zaterdag voor of na een feest, vastendagen, hele week vastenvrij.
const NOTITIE = /^(the )?(forefeast|afterfeast|leavetaking|apodosis|voorfeest|nafeest|eve of|vooravond|sunday|saturday|zondag|zaterdag|entire week|fast[- ]?day|fast-free|vastendag)\b|^(de )?(voorfeest|nafeest)\b/;
// Een feestwoord gevolgd door een heilige ("Dormition of the Righteous Anna") is de gedachtenis van die heilige.
const VAN_HEILIGE = /^(the |de |het )?\S+ (of|van) (the |de )?(righteous|rechtvaardige|st\.|saint|sts\.|h\.|venerable|eerbiedwaardige|prophet|profeet|apostle|apostel|holy (prophet|apostle))/;
// Aan een jaar gebonden: "Zaterdag vóór …", "Hele week vastenvrij" en beweeglijke gedachtenissen ("movable holiday on …").
// De bron (dagen.json) is van kerkjaar 2026; in andere jaren vallen ze op een andere dag.
const WISSELEND = /^(the )?(sunday|saturday|week|entire week|zondag|zaterdag|hele week)\b|\bmovable\b|\bbeweeglijk/;
const ICOON = /\b(icons?|icoon|iconen)\b/;
// Heiligen die een icoon vonden of schilderden blijven heiligen.
const PERSOON_VOORAAN = /^(venerables? (?!icons?\b)|st\.|sts\.|saint|martyrs?|hieromartyrs?|righteous|blessed)/;

export type Soort = 'heilige' | 'feest' | 'icoon' | 'wisselend';

/** Een heilige (of groep heiligen, relieken van een heilige), een feest of kalendernotitie, een icoon van de Moeder Gods,
 *  of een regel die aan het jaar van de bron gebonden is. */
export function soortVan(tekst: string): Soort {
  const t = normaal(tekst).trim();
  if (WISSELEND.test(t)) return 'wisselend';
  if (NOTITIE.test(t) || (FEESTWOORD.test(t) && VAN_DE_HEER.test(t) && !VAN_HEILIGE.test(t))) return 'feest';
  if (ICOON.test(t) && !PERSOON_VOORAAN.test(t)) return 'icoon';
  return 'heilige';
}

/** Een vastennotitie ("Vastendag.", "Fast-free", "… is het vastenvrij"): hoort bij het vastenblok, niet tussen de heiligen. */
export function isVastNotitie(tekst: string): boolean {
  return /\b(vastendag|fast[- ]?day|fast-free|vastenvrij)\b/i.test(tekst);
}

/** Categorieën voor de Heiligen-pagina; een heilige kan in meer dan één categorie vallen. */
export const CATEGORIEEN: { id: string; label: string; omschrijving: string; test: RegExp }[] = [
  { id: 'martelaren', label: 'Martelaren', omschrijving: 'Getuigen in lijden', test: /martyr|martela|passion-?bearer|lijdensdrager|passiedrager/ },
  { id: 'hierarchen', label: 'Hiërarchen', omschrijving: 'Bisschoppen en patriarchen', test: /bishop|bisschop|patriarch|metropolit|\bpope\b|\bpaus\b|\bhierarch/ },
  { id: 'kloosterheiligen', label: 'Kloosterheiligen', omschrijving: 'Monniken, monialen en kluizenaars', test: /venerable|eerbiedwaardig|\bmonks?\b|monnik|\bnuns?\b|\bnon\b|nonnen|abbot|\babt\b|abbess|abdis|hermit|kluizenaar|stylite|styliet|zuilheilige|recluse|hesychast|ascetic|asceet/ },
  { id: 'apostelen', label: 'Apostelen', omschrijving: 'En gelijk-aan-de-apostelen', test: /apostle|apostel|evangelist|equal[- ]to[- ]the[- ]apostles|gelijk aan de apostelen/ },
  { id: 'profeten', label: 'Profeten', omschrijving: 'Stemmen van het Oude Verbond', test: /prophet|profeet|profetes|forefather|voorvader/ },
  { id: 'belijders', label: 'Belijders', omschrijving: 'Standvastig in vervolging', test: /confessor|belijder/ },
  { id: 'rechtvaardigen', label: 'Rechtvaardigen', omschrijving: 'Een heilig leven in de wereld', test: /righteous|rechtvaardig/ },
  { id: 'dwazen', label: 'Dwazen om Christus', omschrijving: 'Heilige dwaasheid', test: /fool|dwaas|dwaze/ },
  { id: 'vrouwheiligen', label: 'Vrouwheiligen', omschrijving: 'Moeders, maagden en monialen', test: /\b(virgin|maagd|nuns?|non|nonnen|abbess|abdis|empress|keizerin|princess|prinses|queen|koningin|widow|weduwe|wife|vrouw|martyress|martelares|martelaressen|deaconess|diacones|myrrh-?bearers?|mirredraagsters?|sisters?|zusters?|daughters?|dochters?|mother|moeder)\b(?! (of god|gods))/ },
];

export function categorieenVan(tekst: string): string[] {
  const t = normaal(tekst);
  const ids = CATEGORIEEN.filter((c) => c.test.test(t)).map((c) => c.id);
  return ids.length ? ids : ['overige'];
}
