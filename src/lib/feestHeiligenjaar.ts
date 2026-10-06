// Koppeling tussen de feesten van de site (lib/feesten.ts: datum, rang, vast/beweeglijk, Pascha-relatie) en de
// feestteksten uit het Heiligenjaar (lib/heiligen.ts). Met de hand nagekeken: zelfde kerkelijke datum en hetzelfde
// feest. De feestlogica blijft in lib/feesten.ts; het Heiligenjaar levert alleen de Nederlandse tekst.
// Controle (ids bestaan en zijn feesten op de juiste dag): npm run check:heiligen
export const FEEST_HEILIGENJAAR: Record<string, string> = {
  besnijdenis: 'hj-0101-1', // 1-1 Besnijdenis des Heren
  theofanie: 'hj-0106-1', // 1-6 Theofanie, de Gods-Verschijning
  'synaxis-johannes': 'hj-0107-1', // 1-7 Synax van de heilige Johannes
  ontmoeting: 'hj-0202-1', // 2-2 Ontmoeting des Heren
  annunciatie: 'hj-0325-1', // 3-25 Verkondiging
  'geboorte-johannes': 'hj-0624-1', // 6-24 Geboorte van de Voorloper
  'twaalf-apostelen': 'hj-0630-1', // 6-30 Synaxis van de twaalf apostelen
  makkabeeen: 'hj-0801-2', // 8-1 Uitdraging van het Hout van het Kruis
  transfiguratie: 'hj-0806-1', // 8-6 Verheerlijking des Heren
  ontslaping: 'hj-0815-1', // 8-15 Ontslaping van de Moeder Gods
  onthoofding: 'hj-0829-1', // 8-29 Onthoofding van Johannes de Doper
  indictie: 'hj-0901-1', // 9-1 Begin van het kerkelijk jaar
  'geboorte-moeder-gods': 'hj-0908-1', // 9-8 Geboorte van de Moeder Gods
  kruisverheffing: 'hj-0914-1', // 9-14 Kruisverheffing
  pokrov: 'hj-1001-1', // 10-1 Pokrov
  michael: 'hj-1108-1', // 11-8 Synaxis van de aartsengel Michaël
  'opdracht-moeder-gods': 'hj-1121-1', // 11-21 Tempelgang van de Moeder Gods
  'anna-ontvangenis': 'hj-1209-1', // 12-9 Ontvangenis van de Moeder Gods
  kerstmis: 'hj-1225-1', // 12-25 Geboorte in het Vlees
  'synaxis-moeder-gods': 'hj-1226-1', // 12-26 Synaxis van de Moeder Gods
};

/** Heiligenjaar-vermeldingen die bij een bestaand feest horen (niet als tweede feest tonen). */
export const GEKOPPELDE_FEESTTEKSTEN = new Set(Object.values(FEEST_HEILIGENJAAR));
