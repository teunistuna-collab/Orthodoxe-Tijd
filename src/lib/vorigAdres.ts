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
