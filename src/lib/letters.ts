// Versierde beginletters A–Z (pakket "Byzantijns_Alfabet_A-Z", public/images/letters/<letter>.webp, 400 × 400 px). Elke
// letter is bijgesneden en zonder vervorming in het vlak 27–84 % (breedte) × 22–86 % (hoogte) gezet, rechts en onder
// uitgelijnd, zodat de rest van het woord er direct op aansluit (de opmaak in Vandaag.css rekent met dat vlak).
// Dit is de enige set letterbeelden van de site, op web en mobiel. Decoratief: zet de volledige naam ernaast in tekst.

/** Het letterbeeld voor de eerste letter van `tekst`, of undefined als die geen letter A–Z is. */
export function letterBeeld(tekst: string): string | undefined {
  const letter = tekst.trim().charAt(0).toUpperCase();
  return /^[A-Z]$/.test(letter) ? `/images/letters/${letter}.webp` : undefined;
}
