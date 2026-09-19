// Gedeelde scroll-vergrendeling voor pop-ups. Houdt bij hoeveel vergrendelingen actief zijn,
// zodat een pop-up die sluit een andere, nog open pop-up niet per ongeluk ontgrendelt.
let actief = 0;

/** Vergrendelt het scrollen van de pagina. Roep de teruggegeven functie aan om weer los te laten. */
export function vergrendelScroll(): () => void {
  actief += 1;
  document.body.style.overflow = 'hidden';
  let losgelaten = false;
  return () => {
    if (losgelaten) return;
    losgelaten = true;
    actief = Math.max(0, actief - 1);
    if (actief === 0) document.body.style.overflow = '';
  };
}
