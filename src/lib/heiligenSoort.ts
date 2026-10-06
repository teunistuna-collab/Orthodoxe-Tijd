// Categorieën voor de Heiligen-pagina; werkt op de naam en het begin van de brontekst uit het Heiligenjaar
// ("De heilige martelaar …, bisschop van …"). Controle: npm run check:heiligen.

const normaal = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

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
