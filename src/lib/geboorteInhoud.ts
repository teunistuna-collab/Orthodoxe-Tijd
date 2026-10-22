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

/** Aangeleverde iconen in de Geboortecyclus (public/images/feesten/), per kerkelijke datum "M-D". `periode`: past bij de
 *  dag of periode maar is niet de feesticoon van die dag. Theofanie geldt van het voorfeest t/m het nafeest. */
export interface DagIcoon { bestand: string; breedte: number; hoogte: number; naam: string; betekenis: string; schrift?: string; periode?: boolean }
const THEOFANIE_ICOON: Omit<DagIcoon, 'periode'> = {
  bestand: 'theofanie.webp', breedte: 557, hoogte: 800, naam: 'Icoon van Theofanie, de Doop van Christus',
  betekenis: 'Christus staat in de Jordaan; Johannes de Voorloper legt zijn hand op Zijn hoofd. Van boven daalt een lichtstraal uit de hemel, het teken van de Vader en de Heilige Geest; aan de oever wachten engelen met doeken. Hier wordt de Heilige Drie-eenheid geopenbaard.',
  schrift: 'Matteüs 3:13–17',
};
export const GEBOORTE_DAGICONEN: Record<string, DagIcoon> = {
  '11-15': {
    bestand: 'filippus.webp', breedte: 434, hoogte: 648, naam: 'Icoon van de heilige apostel Filippus', periode: true,
    betekenis: 'De apostel Filippus uit Betsaïda bracht Natanaël bij Christus met de woorden „Kom en zie”. Zijn gedachtenis op 14 november gaat direct aan de Geboortevasten vooraf; daarom heet deze vasten ook de Filippusvasten.',
    schrift: 'Johannes 1:43–51',
  },
  '11-21': {
    bestand: 'opdracht-moeder-gods.webp', breedte: 586, hoogte: 800, naam: 'Icoon van de Intrede van de Moeder Gods in de tempel',
    betekenis: 'Joachim en Anna brengen de driejarige Maria naar de tempel, vergezeld door meisjes met brandende kaarsen. De hogepriester Zacharias ontvangt haar; linksboven zit zij in het Heilige der Heiligen en ontvangt zij voedsel van een engel. Zij die zelf de tempel van God zal worden, wordt in de tempel gebracht.',
  },
  '12-6': {
    bestand: 'nicolaas.webp', breedte: 342, hoogte: 500, naam: 'Icoon van de heilige Nicolaas van Myra',
    betekenis: 'De heilige Nicolaas, aartsbisschop van Myra in Lycië (4e eeuw), in bisschoppelijk gewaad met kruisen, zegenend en met het Evangelieboek. Hij wordt vereerd als beschermer van armen, kinderen, zeelieden en reizigers.',
  },
  '12-26': {
    bestand: 'synaxis-moeder-gods.webp', breedte: 618, hoogte: 800, naam: 'Icoon van de Synaxis van de Moeder Gods',
    betekenis: 'De dag na de Geboorte eert de Kerk de Moeder Gods die Christus ter wereld bracht. Zij troont met het Kind, omringd door wat de schepping Hem aanbiedt: de engelen hun lofzang, de hemel de ster, de wijzen hun geschenken, de herders hun verwondering, de aarde de grot en de woestijn de kribbe, en wij de Maagd als Moeder.',
  },
  '12-27': {
    bestand: 'stefanus.webp', breedte: 616, hoogte: 800, naam: 'Icoon van de heilige Stefanus',
    betekenis: 'De heilige Stefanus, aartsdiaken en eerste martelaar, in het gewaad van een diaken met het wierookvat. Hij werd in Jeruzalem gestenigd en bad voor wie hem doodden: „Heer, reken hun deze zonde niet aan.”',
    schrift: 'Handelingen 6–7',
  },
  '12-29': {
    bestand: 'kinderen-bethlehem.webp', breedte: 800, hoogte: 519, naam: 'Icoon van de kinderen van Bethlehem',
    betekenis: 'Herodes laat in Bethlehem en omgeving alle jongens van twee jaar en jonger doden, in de hoop het Kind te treffen. De Kerk eert deze kinderen als de eerste martelaren voor Christus; rechtsboven dragen engelen hun zielen naar de hemel.',
    schrift: 'Matteüs 2:16–18',
  },
  '1-1': {
    bestand: 'besnijdenis.webp', breedte: 600, hoogte: 677, naam: 'Icoon van de Besnijdenis des Heren',
    betekenis: 'Op de achtste dag wordt het Kind besneden en ontvangt Het de naam Jezus, zoals de engel had gezegd. Links staat de heilige Basilius de Grote, wiens gedachtenis op dezelfde dag valt.',
    schrift: 'Lucas 2:21',
  },
  '1-2': { ...THEOFANIE_ICOON, periode: true },
  '1-3': { ...THEOFANIE_ICOON, periode: true },
  '1-4': { ...THEOFANIE_ICOON, periode: true },
  '1-5': { ...THEOFANIE_ICOON, periode: true },
  '1-6': THEOFANIE_ICOON,
  '1-7': {
    bestand: 'synaxis-johannes.webp', breedte: 670, hoogte: 800, naam: 'Icoon van de heilige Johannes de Voorloper',
    betekenis: 'De dag na Theofanie komt de Kerk samen om Johannes de Voorloper en Doper te eren, die de Heer in de Jordaan mocht dopen en Hem aanwees als „het Lam Gods, dat de zonde der wereld wegneemt”.',
    schrift: 'Johannes 1:29–34',
  },
  ...Object.fromEntries(['1-8', '1-9', '1-10', '1-11', '1-12', '1-13', '1-14'].map((k) => [k, { ...THEOFANIE_ICOON, periode: true }])),
};

/** Zondag van de Voorouders en Zondag van de Heilige Vaders (beweeglijk): het icoon van Christus de Ware Wijnstok,
 *  als icoon van de periode (een eigen icoon van deze zondagen ontbreekt nog). */
export const GEBOORTE_ZONDAGICOON: DagIcoon = {
  bestand: 'wijnstok.webp', breedte: 450, hoogte: 599, naam: 'Icoon van Christus de Ware Wijnstok', periode: true,
  betekenis: 'Christus zit in de stam van de wijnstok met het geopende Evangelie; op de ranken zitten de apostelen. Op de zondagen vóór de Geboorte gedenkt de Kerk de voorouders van Christus en de rechtvaardigen van het Oude Verbond: zoals ranken aan de wijnstok groeit heel het volk van God naar Hem toe.',
  schrift: 'Johannes 15:1–8',
};
