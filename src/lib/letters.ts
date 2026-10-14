// Versierde beginletters A–Z (pakket "Orthodoxe-Tijd-Alfabet-A-Z", public/images/letters/<letter>.webp, 400 px).
// Dit is de enige set letterbeelden van de site, op web en mobiel. Decoratief: zet de volledige naam ernaast in tekst.

/** Het letterbeeld voor de eerste letter van `tekst`, of undefined als die geen letter A–Z is. */
export function letterBeeld(tekst: string): string | undefined {
  const letter = tekst.trim().charAt(0).toUpperCase();
  return /^[A-Z]$/.test(letter) ? `/images/letters/${letter}.webp` : undefined;
}
