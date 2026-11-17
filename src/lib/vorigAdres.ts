// Het vorige adres (hash) binnen de app, voor een "Terug" die echt een stap teruggaat (MobielLaag.tsx, Kop `slim`) en
// voor schermen die willen weten waar je vandaan kwam (de psalmlezer vanuit Etmaal).
let vorig = '';
let huidig = window.location.hash;
window.addEventListener('hashchange', () => {
  vorig = huidig;
  huidig = window.location.hash;
});
export const vorigeAdres = () => vorig;
export const huidigAdres = () => huidig;

// Herkomst van schermen die je ook van buiten hun pagina opent (het Jezusgebed vanuit Bidden, "Over de gebedsuren" vanuit
// Ontdek, een dienst vanuit Vandaag): per scherm onthouden, zodat Terug ook na een dieper scherm (de gebedsvorm kiezen,
// bidden) nog naar de ingang gaat.
const herkomsten = new Map<string, string>();
/** Waar Terug heen gaat op scherm `sleutel` ("#adem/bidden"): kwam je van een andere pagina, dan daarheen; kwam je terug
 *  uit een dieper scherm (`blijf`), dan de onthouden ingang; anders (binnen de pagina of rechtstreeks geopend) `binnen`. */
export function herkomstVan(sleutel: string, binnen: string, blijf = (v: string) => v.startsWith(`${sleutel}/`)): string {
  const pagina = (h: string) => h.split('/')[0];
  if (vorig && pagina(vorig) !== pagina(sleutel)) herkomsten.set(sleutel, vorig);
  else if (!blijf(vorig)) herkomsten.delete(sleutel);
  return herkomsten.get(sleutel) ?? binnen;
}
