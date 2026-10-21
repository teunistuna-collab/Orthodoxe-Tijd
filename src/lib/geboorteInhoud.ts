import type { GeboorteKey } from './geboortecyclus';

// Inhoud van de Geboortecyclus (Russische traditie), per periode van lib/geboortecyclus.ts. Gebruikt door "De betekenis
// van vandaag" (Vandaag) en de Geboortecyclus-pagina.
// CONCEPT: alle teksten in dit bestand zijn concepten van Orthodoxe Tijd en moeten nog inhoudelijk worden gecontroleerd
// (St. Irenaeus Instituut). De site toont ze met het label "Concept". Bestaande, al gecontroleerde teksten (toelichting,
// traditie en troparion van de feesten) staan in lib/feesten.ts en worden in lib/betekenisVanVandaag.ts eerst gebruikt.
// Kerkvaderteksten: eigen conceptvertaling van een authentieke passage, met werk en paragraaf; nog te vergelijken met een
// gepubliceerde Nederlandse vertaling.

export const BRON_CONCEPT = 'Concepttekst Orthodoxe Tijd, nog te controleren';

/** Uitleg per periode: wat de Kerk viert en welke diensten erbij horen (geen tijden: die verschillen per parochie). */
export const GEBOORTE_UITLEG: Record<GeboorteKey, string> = {
  vasten:
    'Op 15 november (kerkelijke datum) begint de Geboortevasten, ook Filippusvasten genoemd naar de apostel Filippus, die de dag ervoor wordt herdacht. Veertig dagen bereidt de Kerk zich voor op de komst van Christus in het vlees, met gebed, vasten en barmhartigheid. Vanaf de Intrede van de Moeder Gods in de Tempel (21 november) klinken in de Metten al de eerste kerstgezangen: ‘Christus wordt geboren, verheerlijkt Hem!’',
  voorouders:
    'Op de tweede zondag vóór de Geboorte gedenkt de Kerk de heilige voorouders: Adam, de aartsvaders Abraham, Isaak en Jakob, de profeten en alle rechtvaardigen van het Oude Verbond die naar de komst van de Verlosser uitzagen.',
  vaders:
    'Op de zondag vóór de Geboorte gedenkt de Kerk de heilige vaders: allen die naar het vlees tot het geslacht van Christus behoren, van Adam tot Jozef de Verloofde, en de profeten. In de Liturgie wordt het geslachtsregister van Christus gelezen (Matteüs 1).',
  voorfeest:
    'Vanaf 20 december viert de Kerk het voorfeest van de Geboorte. De gezangen van de diensten richten zich op Bethlehem, waar het Woord van God mens zal worden.',
  vooravond:
    'Op de vooravond worden de Koninklijke Uren gelezen, met profetieën, psalmen en lezingen over de Geboorte, gevolgd door de Vespers met de Liturgie van de heilige Basilius de Grote. Valt de vooravond op zaterdag of zondag, dan worden de Koninklijke Uren al op de vrijdag ervoor gelezen en wordt de Liturgie van Basilius op het feest zelf gevierd. De dag wordt traditioneel gevast tot na de Vespers.',
  geboorte:
    'De Geboorte van Christus wordt gevierd met de nachtwake, met Grote Completen (‘God is met ons’) en Metten, en met de Goddelijke Liturgie. God wordt mens, opdat de mens met God verenigd wordt.',
  nafeest:
    'Na het feest volgt het nafeest, tot en met 31 december. De dag na de Geboorte is de Synaxis van de Moeder Gods: de Kerk eert haar door wie de Zoon van God mens werd. Op de zondag na de Geboorte worden Jozef de Verloofde, koning David en Jakobus, de broeder des Heren, herdacht.',
  besnijdenis:
    'Op de achtste dag na de Geboorte gedenkt de Kerk de Besnijdenis des Heren, waarbij het Kind de naam Jezus ontving (Lucas 2:21). Op dezelfde dag is de gedachtenis van de heilige Basilius de Grote, en wordt zijn Liturgie gevierd.',
  'voorfeest-theofanie':
    'Vanaf 2 januari bereidt de Kerk zich voor op Theofanie. De gezangen spreken over Johannes de Voorloper en de Jordaan, waar Christus Zich laat dopen.',
  'vooravond-theofanie':
    'Op de vooravond van Theofanie worden de Koninklijke Uren gelezen en volgt de Vespers met de Liturgie van de heilige Basilius, met daarna de Grote Waterwijding. Valt de vooravond op zaterdag of zondag, dan worden de Koninklijke Uren al op de vrijdag ervoor gelezen. De dag wordt gevast.',
  theofanie:
    'Theofanie, de Doop van Christus in de Jordaan: de Heilige Drie-eenheid openbaart zich. Na de Liturgie wordt opnieuw de Grote Waterwijding gevierd.',
  'nafeest-theofanie':
    'De dag na Theofanie is de Synaxis van de heilige Johannes de Voorloper en Doper. Het nafeest van Theofanie duurt tot en met 14 januari.',
};

/** Eén weetje per periode. */
export const GEBOORTE_WEETJES: Record<GeboorteKey, string> = {
  vasten: 'De Geboortevasten duurt veertig dagen, net als de Grote Vasten en zoals Mozes veertig dagen op de berg bleef voordat hij de Wet ontving.',
  voorouders: 'De ster op de icoon van de Geboorte wijst met één straal recht naar het Kind: de hemel zelf toont waar de Verlosser te vinden is.',
  vaders: 'De wijzen brengen goud, wierook en mirre: goud voor de Koning, wierook voor God, en mirre die al vooruitwijst naar Zijn begrafenis.',
  voorfeest: 'De icoon van de Geboorte toont Christus in een grot, niet in een stal: de donkere grot verwijst naar de wereld in duisternis, waarin het Licht wordt geboren, en naar het graf.',
  vooravond: 'Op de icoon ligt de Moeder Gods uitgestrekt naast de kribbe: zij rust en overweegt het mysterie. Volgens de traditie baarde zij zonder pijn.',
  geboorte: 'De os en de ezel bij de kribbe verwijzen naar Jesaja: ‘Een os kent zijn eigenaar en een ezel de kribbe van zijn heer’ (Jesaja 1:3).',
  nafeest: 'De doeken waarin het Kind gewikkeld ligt, lijken op grafdoeken: al bij de Geboorte wijst de icoon vooruit naar Pascha.',
  besnijdenis: 'De naam Jezus betekent ‘de Heer redt’. Hij werd gegeven zoals de engel had gezegd (Lucas 1:31).',
  'voorfeest-theofanie': 'Christus had de doop van bekering niet nodig. Hij laat Zich dopen om het water te heiligen en de weg te openen voor onze doop.',
  'vooravond-theofanie': 'Bij de Grote Waterwijding wordt het kruis driemaal in het water gedompeld. Het gewijde water wordt het hele jaar bewaard.',
  theofanie: 'Theofanie betekent ‘verschijning van God’: bij de Doop van Christus worden de Vader, de Zoon en de Heilige Geest tegelijk geopenbaard.',
  'nafeest-theofanie': 'Johannes de Voorloper wordt op iconen vaak met vleugels afgebeeld: hij is de ‘bode’ (letterlijk engel) die voor de Heer uit gaat (Maleachi 3:1).',
};

/** Woord van de kerkvaders (conceptvertaling van een authentieke passage). */
export const KERKVADERS = {
  menswording: { tekst: 'Hij werd mens, opdat wij vergoddelijkt zouden worden.', bron: 'Athanasius van Alexandrië, Over de menswording van het Woord, 54,3 (conceptvertaling)' },
  geboorte: { tekst: 'Christus wordt geboren: verheerlijkt Hem! Christus komt uit de hemel: gaat Hem tegemoet! Christus is op aarde: verheft u!', bron: 'Gregorius de Theoloog, Rede 38 (Op de Theofanie, de Geboorte van Christus), 1 (conceptvertaling)' },
  doop: { tekst: 'Christus wordt verlicht: laten wij met Hem stralen. Christus wordt gedoopt: laten wij met Hem afdalen, om ook met Hem op te stijgen.', bron: 'Gregorius de Theoloog, Rede 39 (Op de heilige Lichten), 14 (conceptvertaling)' },
} as const;
export const KERKVADER_PER_PERIODE: Record<GeboorteKey, keyof typeof KERKVADERS> = {
  vasten: 'menswording', voorouders: 'menswording', vaders: 'menswording', voorfeest: 'menswording', vooravond: 'geboorte', geboorte: 'geboorte',
  nafeest: 'geboorte', besnijdenis: 'menswording', 'voorfeest-theofanie': 'doop', 'vooravond-theofanie': 'doop', theofanie: 'doop', 'nafeest-theofanie': 'doop',
};

/** Gebruiken thuis, met het onderscheid tussen kerkelijke traditie en volksgebruik. */
export const GEBOORTE_GEBRUIKEN: Partial<Record<GeboorteKey, { soort: string; tekst: string }>> = {
  vasten: { soort: 'Kerkelijke traditie', tekst: 'De Geboortevasten wordt beleefd met vasten naar de regels van de Kerk (zie Vasten), met meer gebed, het lezen van de Schrift en aandacht voor wie hulp nodig heeft. Een vast moment van gebed thuis helpt om de weken naar het feest bewust te leven.' },
  voorfeest: { soort: 'Kerkelijke traditie', tekst: 'In de laatste dagen vóór het feest wordt strenger gevast. Veel gezinnen bereiden zich voor door te biechten en samen te bidden, zodat het feest geen drukte wordt maar ontmoeting.' },
  geboorte: { soort: 'Kerkelijke traditie', tekst: 'De kerstgroet luidt ‘Christus is geboren!’ en het antwoord ‘Verheerlijkt Hem!’. Zo groet men elkaar tot het einde van het nafeest.' },
  'voorfeest-theofanie': { soort: 'Kerkelijke traditie', tekst: 'Neem een schone fles mee naar de kerk voor het gewijde water. Thuis wordt het met eerbied bewaard, bij de iconen.' },
};

/* ---------- Geboortecyclus-pagina: algemene inhoud (het hele jaar) ---------- */

export const GEBOORTE_INTRO =
  'In de Geboorte van Christus wordt het eeuwige Woord van God mens, uit de Maagd Maria. God komt niet in macht, maar in nederigheid: als een kind in een grot. De Kerk bereidt zich daarop voor met veertig dagen vasten en viert het feest tot en met Theofanie, de Doop van Christus in de Jordaan, waarbij de Heilige Drie-eenheid wordt geopenbaard.';

export type GeboorteInfoKey = 'menswording' | 'iconen' | 'liturgie' | 'gebruiken';
export const GEBOORTE_VERDIEPING: Array<{ key: GeboorteInfoKey; title: string; intro: string }> = [
  { key: 'menswording', title: 'De menswording', intro: 'Waarom God mens werd: het hart van het kerstfeest.' },
  { key: 'iconen', title: 'De iconen', intro: 'De Geboorte en Theofanie in de iconografie, en hun betekenis.' },
  { key: 'liturgie', title: 'Voorbereiding en viering', intro: 'Van de Geboortevasten tot de Grote Waterwijding.' },
  { key: 'gebruiken', title: 'Gebruiken en symboliek', intro: 'Hoe orthodoxe gezinnen de Geboortecyclus beleven.' },
];
