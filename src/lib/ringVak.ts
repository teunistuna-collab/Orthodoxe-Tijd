// Het cirkeldiagram (Etmaal, Week, Jaar) tekent alles in een vierkant van 100 × 100, maar de kaarten staan
// alleen tussen ± 20% en 80% van de hoogte. `crop` is het deel (in % van de breedte) dat boven én onder wordt
// weggelaten, zodat het vak niet hoger is dan wat erin staat. Het middelpunt blijft op 50%.
export function ringVak(crop: number) {
  const hoogte = 100 - 2 * crop;
  return {
    /** Stijl voor het vak: breedte : hoogte */
    stijl: { aspectRatio: `100 / ${hoogte}` },
    /** viewBox voor de svg met ring en spaken */
    viewBox: `0 ${crop} 100 ${hoogte}`,
    /** Zet een y-coördinaat uit het 100 × 100-vlak om naar een `top`-percentage in het bijgesneden vak */
    top: (y: number) => `${((y - crop) / hoogte) * 100}%`,
  };
}
