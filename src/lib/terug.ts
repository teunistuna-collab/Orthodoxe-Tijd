import { useEffect, useRef } from 'react';

// Pop-ups en het zoekvenster krijgen een eigen stap in de browsergeschiedenis. Zo sluit de terugknop (Android,
// het veeggebaar op iPhone, de browserknop) de bovenste pop-up in plaats van de pagina te verlaten. Escape doet hetzelfde.
// Een stapel houdt bij welke pop-up bovenop ligt, zodat bij een pop-up in een pop-up alleen de bovenste sluit.

type Item = { sluit: () => void };
const stapel: Item[] = [];
// Aantal popstate-events dat we zelf veroorzaken (terugstappen na sluiten met het kruisje) en moeten negeren.
let negeer = 0;
// Terugstappen worden heel even opgespaard: opent er in hetzelfde moment een nieuwe pop-up (zoeken → dag), dan
// hergebruikt die een opgespaarde stap. Anders loopt history.back() (asynchroon) achter op de nieuwe pushState
// en verdwijnt er een stap te veel.
let teTerug = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

window.addEventListener('popstate', () => {
  if (negeer > 0) {
    negeer--;
    return;
  }
  stapel.pop()?.sluit();
});

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !stapel.length) return;
  e.preventDefault();
  stapel[stapel.length - 1].sluit();
});

function neemStapTerug() {
  teTerug++;
  timer ??= setTimeout(() => {
    timer = null;
    if (!teTerug) return;
    negeer++; // history.go geeft één popstate, ook bij meerdere stappen
    history.go(-teTerug);
    teTerug = 0;
  }, 0);
}

export function useTerugSluit(open: boolean, onClose: () => void) {
  const sluitRef = useRef(onClose);
  useEffect(() => {
    sluitRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const item: Item = { sluit: () => sluitRef.current() };
    stapel.push(item);
    if (teTerug > 0) teTerug--; // de stap van een pop-up die net sloot hergebruiken
    else history.pushState({ otPopup: true }, '');
    return () => {
      const i = stapel.indexOf(item);
      if (i === -1) return; // al gesloten via de terugknop: die stap is al weg
      stapel.splice(i, 1);
      // Alleen onze eigen stap terugnemen; na een klik op een link binnen de pop-up staat er een nieuwe pagina bovenop.
      if ((history.state as { otPopup?: boolean } | null)?.otPopup) neemStapTerug();
    };
  }, [open]);
}
