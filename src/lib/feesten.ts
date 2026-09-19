export type FeestSoort = 'pascha' | 'groot' | 'feest' | 'gedachtenis' | 'beweeglijk';

export interface Feest {
  id: string;
  naam: string;
  kort?: string;
  soort: FeestSoort;
  /** Vaste kerkelijke datum "M-D" (kerkelijke kalender) */
  md?: string;
  /** Beweeglijk: dagen ten opzichte van Pascha */
  offset?: number;
  /** Twaalf grote feesten */
  groot?: boolean;
  /** Liturgische rang: 6 = groot feest, 5 = vigilie, 4 = polyeleos, 3 = grote doxologie, 2 = zes stichieren */
  rang?: number;
  toelichting?: string;
  traditie?: string;
  troparion?: string;
}

/* ------------------------------------------------------------------ */
/* De Twaalf Grote Feesten + Pascha                                     */
/* ------------------------------------------------------------------ */

export const PASCHA: Feest = {
  id: 'pascha',
  naam: 'Heilig Pascha — Opstanding des Heren',
  kort: 'Pascha',
  soort: 'pascha',
  offset: 0,
  rang: 7,
  toelichting:
    'Het Feest der feesten en het hart van het kerkelijk jaar. In de Paasnacht trekt de gemeente met brandende kaarsen om de kerk, wordt het gesloten kerkportaal geopend en klinkt voor het eerst: „Christus is opgestaan!” — „Waarlijk opgestaan!”',
  traditie:
    'Rode eieren als teken van het nieuwe leven, de zegening van het paasbrood (koulitsj, tsoureki), en veertig dagen lang de paasgroet in plaats van de gewone begroeting.',
  troparion:
    'Christus is opgestaan uit de doden, door Zijn dood heeft Hij de dood vertreden, en aan hen in de graven heeft Hij het leven geschonken.',
};

export const GROTE_FEESTEN: Feest[] = [
  {
    id: 'geboorte-moeder-gods',
    naam: 'Geboorte van de Moeder Gods',
    kort: 'Geboorte Moeder Gods',
    soort: 'groot',
    md: '9-8',
    groot: true,
    rang: 6,
    toelichting:
      'Joachim en Anna, lang kinderloos, ontvangen op hun oude dag Maria. Het eerste grote feest van het kerkelijk jaar (dat op 1 september begint) opent de heilsgeschiedenis met vreugde over de komst van de Theotokos.',
    traditie: 'In veel parochies het begin van het catechese-seizoen; de kerk wordt met bloemen versierd.',
    troparion:
      'Uw geboorte, o Moeder Gods en Maagd, heeft vreugde verkondigd aan heel de wereld; want uit u is de Zon der gerechtigheid opgegaan, Christus onze God. Hij heeft de vloek opgeheven en zegen geschonken; Hij heeft de dood vernietigd en ons het eeuwige leven gegeven.',
  },
  {
    id: 'kruisverheffing',
    naam: 'Verheffing van het Kostbare en Levengevende Kruis',
    kort: 'Kruisverheffing',
    soort: 'groot',
    md: '9-14',
    groot: true,
    rang: 6,
    toelichting:
      'Herinnering aan de vinding van het Kruis door keizerin Helena in Jeruzalem (326) en de terugvoering uit Perzië (628). Het met bloemen omkranste kruis wordt in het midden van de kerk plechtig verheven naar de vier windstreken, terwijl de gelovigen ter aarde buigen en honderdmaal „Heer, ontferm U” zingen.',
    traditie: 'Strenge vastendag — het enige grote feest van de Heer waarop gevast wordt.',
    troparion:
      'Red, o Heer, Uw volk en zegen Uw erfdeel; schenk overwinning aan de orthodoxe christenen over hun tegenstanders, en bewaar door Uw Kruis Uw gemeenschap.',
  },
  {
    id: 'opdracht-moeder-gods',
    naam: 'Intrede van de Moeder Gods in de Tempel',
    kort: 'Intrede in de Tempel',
    soort: 'groot',
    md: '11-21',
    groot: true,
    rang: 6,
    toelichting:
      'De driejarige Maria wordt door haar ouders naar de tempel gebracht, waar de hogepriester Zacharias haar in het Heilige der Heiligen leidt — een voorafbeelding van haar roeping als levende tempel van God.',
    traditie: 'Vanaf dit feest klinkt in de Metten voor het eerst het kerstkanon: „Christus wordt geboren, verheerlijkt Hem!”',
    troparion:
      'Heden is de voorafbeelding van Gods welbehagen en de aankondiging van de redding der mensen: in de tempel van God verschijnt de Maagd openlijk en kondigt allen Christus aan. Laten ook wij haar met luide stem toeroepen: Verheug u, vervulling van het heilsplan van de Schepper.',
  },
  {
    id: 'kerstmis',
    naam: 'Geboorte van onze Heer Jezus Christus',
    kort: 'Kerstmis',
    soort: 'groot',
    md: '12-25',
    groot: true,
    rang: 6,
    toelichting:
      'God wordt mens in de grot van Bethlehem. Voorafgegaan door veertig dagen Kerstvasten (Filippusvasten) en de strenge vooravond. Op de nieuwe kalender op 25 december; op de oude kalender valt de kerkelijke 25 december op 7 januari.',
    traditie:
      'Kerstliederen (kolyadki, kalanda), kutia of sochivo (tarwe met honing) op kerstavond, de ster-optocht van kinderen; twaalf vastenvrije dagen tot Theofanie.',
    troparion:
      'Uw geboorte, Christus onze God, heeft over de wereld het licht der kennis doen opgaan; want daardoor hebben zij die de sterren vereerden, van een ster geleerd U te aanbidden, de Zon der gerechtigheid, en U te kennen als de Opgang uit den hoge. Heer, eer aan U.',
  },
  {
    id: 'theofanie',
    naam: 'Theofanie — Doop van de Heer in de Jordaan',
    kort: 'Theofanie',
    soort: 'groot',
    md: '1-6',
    groot: true,
    rang: 6,
    toelichting:
      'Christus laat zich dopen door Johannes; de Vader spreekt uit de hemel en de Geest daalt neer als een duif. De Heilige Drie-eenheid openbaart zich. Het feest sluit de twaalf heilige dagen van Kerstmis af.',
    traditie:
      'Grote waterwijding op de vooravond en op het feest zelf; het gewijde water wordt mee naar huis genomen en huizen worden besprenkeld. In sommige gemeenten wordt het kruis in open water geworpen.',
    troparion:
      'Toen Gij, Heer, in de Jordaan gedoopt werd, is de aanbidding van de Drie-eenheid geopenbaard. Want de stem van de Vader getuigde van U en noemde U Zijn geliefde Zoon, en de Geest, in de gedaante van een duif, bevestigde de waarheid van dit woord. Christus God, Die verschenen zijt en de wereld verlicht hebt, eer aan U.',
  },
  {
    id: 'ontmoeting',
    naam: 'Ontmoeting van de Heer in de Tempel',
    kort: 'Ontmoeting des Heren',
    soort: 'groot',
    md: '2-2',
    groot: true,
    rang: 6,
    toelichting:
      'Veertig dagen na de geboorte wordt het Kind in de tempel gebracht. De oude Simeon neemt het Licht der wereld in zijn armen en zingt: „Nu laat Gij, Heer, Uw dienaar gaan in vrede.” De profetes Anna getuigt.',
    traditie: 'Kaarsenwijding; het feest markeert in de volksvroomheid de ontmoeting van winter en lente.',
    troparion:
      'Verheug u, begenadigde Moeder Gods en Maagd, want uit u is de Zon der gerechtigheid opgegaan, Christus onze God, Die verlicht wie in duisternis zijn. Verheug u ook, rechtvaardige grijsaard, die in uw armen de Verlosser van onze zielen hebt ontvangen, Die ons de opstanding schenkt.',
  },
  {
    id: 'annunciatie',
    naam: 'Boodschap aan de Moeder Gods (Annunciatie)',
    kort: 'Annunciatie',
    soort: 'groot',
    md: '3-25',
    groot: true,
    rang: 6,
    toelichting:
      'De aartsengel Gabriël verkondigt Maria dat zij de Moeder Gods zal worden, en zij antwoordt: „Zie de dienstmaagd des Heren.” Het feest valt vrijwel altijd in de Grote Vasten — daarom zijn vis, wijn en olie toegestaan.',
    traditie: 'Negen maanden vóór Kerstmis; op de oude kalender de burgerlijke 7 april. In Griekenland ook nationale feestdag.',
    troparion:
      'Heden is het begin van onze redding en de openbaring van het mysterie van eeuwigheid: de Zoon van God wordt Zoon van de Maagd, en Gabriël verkondigt de genade. Laten wij daarom met hem tot de Moeder Gods roepen: Verheug u, begenadigde, de Heer is met u.',
  },
  {
    id: 'palmzondag',
    naam: 'Intocht van de Heer in Jeruzalem (Palmzondag)',
    kort: 'Palmzondag',
    soort: 'beweeglijk',
    offset: -7,
    groot: true,
    rang: 6,
    toelichting:
      'Christus rijdt op een ezelsveulen Jeruzalem binnen; kinderen zwaaien met palmtakken. De zondag vóór Pascha, dag na Lazaruszaterdag. Vis is toegestaan.',
    traditie:
      'In Nederland en de Slavische landen worden wilgentakjes met katjes gewijd (daarom ook „Wilgenzondag”), in Griekenland gevlochten palmkruisjes. De takjes worden thuis bij de iconen bewaard.',
    troparion:
      'Door vóór Uw lijden de algemene opstanding te bevestigen, hebt Gij Lazarus uit de doden opgewekt, Christus God. Daarom dragen ook wij, zoals de kinderen, de tekenen van de overwinning en roepen U toe, Overwinnaar van de dood: Hosanna in den hoge, gezegend Hij die komt in de naam des Heren.',
  },
  {
    id: 'hemelvaart',
    naam: 'Hemelvaart van de Heer',
    kort: 'Hemelvaart',
    soort: 'beweeglijk',
    offset: 39,
    groot: true,
    rang: 6,
    toelichting:
      'Veertig dagen na Pascha wordt de Verrezene voor de ogen van de leerlingen opgenomen en zit Hij aan de rechterhand van de Vader. De dag ervoor (woensdag) is de afsluiting (apodosis) van Pascha: de laatste keer dat „Christus is opgestaan” gezongen wordt.',
    traditie: 'Altijd op een donderdag; in Nederland een vrije dag, wat het bezoeken van de Liturgie vergemakkelijkt.',
    troparion:
      'Gij zijt in heerlijkheid opgevaren, Christus onze God, en hebt Uw leerlingen verblijd door de belofte van de Heilige Geest; door Uw zegen werden zij verzekerd dat Gij de Zoon van God zijt, de Verlosser van de wereld.',
  },
  {
    id: 'pinksteren',
    naam: 'Pinksteren — Heilige Drie-eenheid',
    kort: 'Pinksteren',
    soort: 'beweeglijk',
    offset: 49,
    groot: true,
    rang: 6,
    toelichting:
      'Vijftig dagen na Pascha daalt de Heilige Geest neer op de apostelen; de Kerk wordt geboren. Na de Liturgie volgen de Kniebuigingsvespers, waarbij voor het eerst sinds Pascha weer geknield wordt.',
    traditie:
      'De kerk wordt met groene takken, gras en bloemen versierd (Slavisch: Troitsa). De week erna is vastenvrij; de maandag is de dag van de Heilige Geest.',
    troparion:
      'Gezegend zijt Gij, Christus onze God, Die de vissers tot wijzen hebt gemaakt door hun de Heilige Geest te zenden, en door hen de wereld hebt gevangen. Menslievende, eer aan U.',
  },
  {
    id: 'transfiguratie',
    naam: 'Gedaanteverandering van de Heer op de Tabor',
    kort: 'Transfiguratie',
    soort: 'groot',
    md: '8-6',
    groot: true,
    rang: 6,
    toelichting:
      'Op de berg Tabor toont Christus aan Petrus, Jakobus en Johannes Zijn goddelijke heerlijkheid; Mozes en Elia verschijnen, de Vader spreekt uit de wolk. Het feest valt midden in de Dormitionvasten — vis is toegestaan.',
    traditie: 'Zegening van de eerste vruchten: druiven, appels en ander zomerfruit worden na de Liturgie gewijd.',
    troparion:
      'Gij zijt van gedaante veranderd op de berg, Christus God, en hebt Uw leerlingen Uw heerlijkheid getoond, zoveel als zij konden dragen. Laat ook over ons, zondaars, Uw eeuwig licht schijnen, op de voorspraak van de Moeder Gods. Gever van het licht, eer aan U.',
  },
  {
    id: 'ontslaping',
    naam: 'Ontslaping van de Moeder Gods (Dormitie)',
    kort: 'Ontslaping',
    soort: 'groot',
    md: '8-15',
    groot: true,
    rang: 6,
    toelichting:
      'Het „Pasen van de zomer”: Maria ontslaapt in Jeruzalem, omringd door de apostelen, en wordt met lichaam en ziel door haar Zoon opgenomen. Voorafgegaan door de tweeweekse Dormitionvasten.',
    traditie:
      'Op de vooravond de begrafenisdienst van de Moeder Gods met de met bloemen versierde epitaaf en processie, vooral in Griekse en Roemeense parochies. Zegening van kruiden en bloemen.',
    troparion:
      'In uw baren hebt gij de maagdelijkheid bewaard, in uw ontslapen hebt gij de wereld niet verlaten, o Moeder Gods. Gij zijt overgegaan tot het leven, gij die de Moeder van het Leven zijt, en door uw gebeden verlost gij onze zielen van de dood.',
  },
];

/* ------------------------------------------------------------------ */
/* Overige vaste feesten en gedachtenissen                               */
/* ------------------------------------------------------------------ */

export const OVERIGE_VASTE: Feest[] = [
  { id: 'besnijdenis', naam: 'Besnijdenis des Heren · H. Basilius de Grote', soort: 'feest', md: '1-1', rang: 5, toelichting: 'Achtste dag na Kerstmis; tevens de gedachtenis van de grote kerkvader Basilius (†379), naar wie de Liturgie van de vastenzondagen is genoemd.' },
  { id: 'synaxis-johannes', naam: 'Synaxis van Johannes de Voorloper', soort: 'feest', md: '1-7', rang: 4, toelichting: 'De dag na Theofanie wordt de Doper geëerd, die de Heer heeft mogen dopen.' },
  { id: 'antonius', naam: 'H. Antonius de Grote', soort: 'gedachtenis', md: '1-17', rang: 4 },
  { id: 'xenia', naam: 'H. Xenia van Petersburg', soort: 'gedachtenis', md: '1-24', rang: 3 },
  { id: 'drie-hierarchen', naam: 'De Drie Hiërarchen', soort: 'feest', md: '1-30', rang: 4, toelichting: 'Basilius de Grote, Gregorius de Theoloog en Johannes Chrysostomus: gezamenlijk feest; patroonsfeest van theologische scholen.' },
  { id: 'veertig-martelaren', naam: 'Veertig Martelaren van Sebaste', soort: 'gedachtenis', md: '3-9', rang: 4, toelichting: 'Romeinse soldaten die op een bevroren meer stierven (320). In de Vasten worden leeuwerikbroodjes gebakken.' },
  { id: 'gabriel', naam: 'Synaxis van de Aartsengel Gabriël', soort: 'gedachtenis', md: '3-26', rang: 3 },
  { id: 'georgius', naam: 'H. Georgius de Grootmartelaar', soort: 'feest', md: '4-23', rang: 4 },
  { id: 'johannes-theoloog', naam: 'H. Johannes de Theoloog, apostel en evangelist', soort: 'feest', md: '5-8', rang: 4 },
  { id: 'nicolaas-relieken', naam: 'Overbrenging van de relieken van H. Nicolaas', soort: 'gedachtenis', md: '5-9', rang: 4 },
  { id: 'cyrillus-methodius', naam: 'HH. Cyrillus en Methodius, leraren der Slaven', soort: 'gedachtenis', md: '5-11', rang: 4 },
  { id: 'constantijn-helena', naam: 'HH. Constantijn en Helena', soort: 'gedachtenis', md: '5-21', rang: 4 },
  { id: 'geboorte-johannes', naam: 'Geboorte van Johannes de Doper', soort: 'feest', md: '6-24', rang: 5, toelichting: 'Zes maanden vóór Kerstmis; binnen de Apostelvasten is vis toegestaan.' },
  { id: 'petrus-paulus', naam: 'HH. Apostelen Petrus en Paulus', soort: 'feest', md: '6-29', rang: 5, toelichting: 'Slot van de Apostelvasten; de twee pijlers van de Kerk gezamenlijk geëerd.' },
  { id: 'twaalf-apostelen', naam: 'Synaxis van de Twaalf Apostelen', soort: 'gedachtenis', md: '6-30', rang: 4 },
  { id: 'johannes-shanghai', naam: 'H. Johannes van Shanghai en San Francisco', soort: 'gedachtenis', md: '6-19', rang: 3, toelichting: 'Wonderdoener van onze tijd (†1966); als aartsbisschop van West-Europa nauw verbonden met de Nederlandse orthodoxie.' },
  { id: 'elia', naam: 'H. Profeet Elia', soort: 'feest', md: '7-20', rang: 4 },
  { id: 'vladimir', naam: 'H. Vladimir, gelijk aan de apostelen', soort: 'gedachtenis', md: '7-15', rang: 4 },
  { id: 'pantelejmon', naam: 'H. Pantelejmon, geneesheer en martelaar', soort: 'gedachtenis', md: '7-27', rang: 4 },
  { id: 'makkabeeen', naam: 'Processie van het Kruis · Zeven Makkabeeën', soort: 'gedachtenis', md: '8-1', rang: 3, toelichting: 'Begin van de Dormitionvasten; kleine waterwijding en honingzegening.' },
  { id: 'icoon-niet-door-handen', naam: 'Icoon van Christus „niet door mensenhanden gemaakt”', soort: 'gedachtenis', md: '8-16', rang: 3 },
  { id: 'onthoofding', naam: 'Onthoofding van Johannes de Doper', soort: 'feest', md: '8-29', rang: 5, toelichting: 'Strenge vastendag; geen dans en uitbundigheid, ter gedachtenis van de dans van Herodias’ dochter.' },
  { id: 'gordel', naam: 'Nederlegging van de Gordel van de Moeder Gods', soort: 'gedachtenis', md: '8-31', rang: 3 },
  { id: 'indictie', naam: 'Begin van het kerkelijk jaar (Indictie) · H. Simeon de Styliet', soort: 'feest', md: '9-1', rang: 3, toelichting: 'Opening van het kerkelijk jaar, dat op 1 september begint.' },
  { id: 'joachim-anna', naam: 'HH. Joachim en Anna', soort: 'gedachtenis', md: '9-9', rang: 3 },
  { id: 'sergius', naam: 'H. Sergius van Radonezj', soort: 'gedachtenis', md: '9-25', rang: 4 },
  { id: 'johannes-theoloog-ontslaping', naam: 'Ontslaping van H. Johannes de Theoloog', soort: 'feest', md: '9-26', rang: 4 },
  { id: 'pokrov', naam: 'Bescherming van de Moeder Gods (Pokrov)', soort: 'feest', md: '10-1', rang: 5, toelichting: 'Andreas de Dwaas om Christus zag de Moeder Gods haar sluier beschermend over de biddende gemeente in Blachernae uitspreiden.' },
  { id: 'demetrius', naam: 'H. Demetrius van Thessaloniki', soort: 'feest', md: '10-26', rang: 4 },
  { id: 'michael', naam: 'Synaxis van de Aartsengel Michaël en alle Lichaamloze Machten', soort: 'feest', md: '11-8', rang: 5 },
  { id: 'nektarios', naam: 'H. Nektarios van Aegina', soort: 'gedachtenis', md: '11-9', rang: 3 },
  { id: 'chrysostomus', naam: 'H. Johannes Chrysostomus', soort: 'feest', md: '11-13', rang: 4 },
  { id: 'filippus', naam: 'H. Apostel Filippus — vooravond Kerstvasten', soort: 'gedachtenis', md: '11-14', rang: 3, toelichting: 'De laatste dag vóór de Kerstvasten (daarom „Filippusvasten”).' },
  { id: 'catharina', naam: 'H. Catharina van Alexandrië', soort: 'gedachtenis', md: '11-24', rang: 4 },
  { id: 'andreas', naam: 'H. Apostel Andreas, de eerstgeroepene', soort: 'feest', md: '11-30', rang: 4 },
  { id: 'barbara', naam: 'H. Barbara · H. Johannes Damascenus', soort: 'gedachtenis', md: '12-4', rang: 4 },
  { id: 'nicolaas', naam: 'H. Nicolaas van Myra, wonderdoener', soort: 'feest', md: '12-6', rang: 5, toelichting: 'Sinterklaas: patroon van Amsterdam, zeelieden, kinderen en reizigers. Binnen de Kerstvasten is vis toegestaan.' },
  { id: 'anna-ontvangenis', naam: 'Ontvangenis van de Moeder Gods door H. Anna', soort: 'gedachtenis', md: '12-9', rang: 4 },
  { id: 'spyridon', naam: 'H. Spyridon van Trimythous', soort: 'gedachtenis', md: '12-12', rang: 4 },
  { id: 'herman-alaska', naam: 'H. Herman van Alaska', soort: 'gedachtenis', md: '12-13', rang: 3 },
  { id: 'ignatius', naam: 'H. Ignatius van Antiochië · H. Johannes van Kronstadt', soort: 'gedachtenis', md: '12-20', rang: 4 },
  { id: 'kerstavond', naam: 'Vooravond van Kerstmis (Paramonie)', soort: 'gedachtenis', md: '12-24', rang: 3, toelichting: 'Koninklijke Uren en Vespers met de Liturgie van Basilius; strenge vasten tot de eerste ster.' },
  { id: 'synaxis-moeder-gods', naam: 'Synaxis van de Moeder Gods', soort: 'feest', md: '12-26', rang: 4 },
  { id: 'stefanus', naam: 'H. Stefanus, protomartelaar en aartsdiaken', soort: 'gedachtenis', md: '12-27', rang: 4 },
  { id: 'kinderen-bethlehem', naam: 'De 14.000 kinderen van Bethlehem', soort: 'gedachtenis', md: '12-29', rang: 3 },
  { id: 'theofanie-vooravond', naam: 'Vooravond van Theofanie — Grote Waterwijding', soort: 'gedachtenis', md: '1-5', rang: 3 },
  /* Heiligen van de Lage Landen */
  { id: 'willibrord', naam: 'H. Willibrord, apostel der Friezen', soort: 'gedachtenis', md: '11-7', rang: 3, toelichting: 'Eerste bisschop van Utrecht (†739), verlichter van de Lage Landen.' },
  { id: 'bonifatius', naam: 'H. Bonifatius, martelaar te Dokkum', soort: 'gedachtenis', md: '6-5', rang: 3, toelichting: 'Apostel van de Friezen en Germanen, in 754 bij Dokkum gedood.' },
  { id: 'servatius', naam: 'H. Servatius van Maastricht', soort: 'gedachtenis', md: '5-13', rang: 2, toelichting: 'Bisschop van Tongeren en Maastricht (†384), tijdgenoot van Athanasius.' },
  { id: 'adalbert', naam: 'H. Adalbert van Egmond', soort: 'gedachtenis', md: '6-25', rang: 2, toelichting: 'Diaken en missionaris in Kennemerland (†740); bij zijn graf ontstond de abdij van Egmond.' },
  { id: 'lebuinus', naam: 'H. Lebuinus van Deventer', soort: 'gedachtenis', md: '11-12', rang: 2 },
  { id: 'radboud', naam: 'H. Radboud van Utrecht', soort: 'gedachtenis', md: '11-29', rang: 2 },
  { id: 'odulfus', naam: 'H. Odulfus van Utrecht', soort: 'gedachtenis', md: '6-12', rang: 2 },
  { id: 'jeroen', naam: 'H. Jeroen van Noordwijk, martelaar', soort: 'gedachtenis', md: '8-17', rang: 2 },
];

export const VASTE_FEESTEN: Feest[] = [...GROTE_FEESTEN.filter((f) => f.md), ...OVERIGE_VASTE];

/* ------------------------------------------------------------------ */
/* Beweeglijke feesten & gedachtenissen (offset t.o.v. Pascha)          */
/* ------------------------------------------------------------------ */

export const BEWEEGLIJKE_FEESTEN: Feest[] = [
  PASCHA,
  ...GROTE_FEESTEN.filter((f) => f.offset !== undefined),
  { id: 'tollenaar', naam: 'Zondag van de Tollenaar en de Farizeeër — begin Triodion', kort: 'Tollenaar & Farizeeër', soort: 'beweeglijk', offset: -70, rang: 3, toelichting: 'Begin van het Triodion, het gezangboek van de voorvasten en de Vasten. Nederigheid vóór alles: de week erna is vastenvrij.' },
  { id: 'verloren-zoon', naam: 'Zondag van de Verloren Zoon', soort: 'beweeglijk', offset: -63, rang: 3, toelichting: 'Bekering en terugkeer naar de Vader; in de Metten klinkt psalm 136 „Aan de rivieren van Babylon”.' },
  { id: 'zielenzaterdag-1', naam: 'Zaterdag der Overledenen (Vleesdervingszaterdag)', kort: 'Zielenzaterdag', soort: 'beweeglijk', offset: -57, rang: 3 },
  { id: 'laatste-oordeel', naam: 'Zondag van het Laatste Oordeel (Vleesderving)', kort: 'Vleesderving', soort: 'beweeglijk', offset: -56, rang: 3, toelichting: 'De laatste dag waarop vlees wordt gegeten. Het evangelie van Matteüs 25: „Wat gij aan de minsten gedaan hebt…”' },
  { id: 'vergevingszondag', naam: 'Vergevingszondag (Kaasderving)', kort: 'Vergevingszondag', soort: 'beweeglijk', offset: -49, rang: 3, toelichting: 'Gedachtenis van de verdrijving van Adam uit het paradijs. Na de Vespers vraagt men elkaar vergeving; ’s avonds begint de Grote Vasten.' },
  { id: 'schone-maandag', naam: 'Schone Maandag — begin van de Grote Vasten', kort: 'Schone Maandag', soort: 'beweeglijk', offset: -48, rang: 3, toelichting: 'Eerste dag van de Grote Vasten; ’s avonds de eerste Grote Completen met de Grote Canon van Andreas van Kreta.' },
  { id: 'theodorus-zaterdag', naam: 'Zaterdag van H. Theodorus de Rekruut (koliva)', kort: 'Theodoruszaterdag', soort: 'beweeglijk', offset: -43, rang: 3 },
  { id: 'orthodoxie', naam: '1e Zondag van de Vasten: Triomf van de Orthodoxie', kort: 'Zondag van de Orthodoxie', soort: 'beweeglijk', offset: -42, rang: 4, toelichting: 'Herstel van de iconenverering (843). Processie met iconen en het Synodikon van de Orthodoxie.' },
  { id: 'zielenzaterdag-2', naam: 'Zaterdag der Overledenen (2e week)', kort: 'Zielenzaterdag', soort: 'beweeglijk', offset: -36, rang: 2 },
  { id: 'palamas', naam: '2e Zondag van de Vasten: H. Gregorius Palamas', kort: 'Gregorius Palamas', soort: 'beweeglijk', offset: -35, rang: 4, toelichting: 'De theoloog van het ongeschapen licht en het hesychastische gebed.' },
  { id: 'zielenzaterdag-3', naam: 'Zaterdag der Overledenen (3e week)', kort: 'Zielenzaterdag', soort: 'beweeglijk', offset: -29, rang: 2 },
  { id: 'kruisverering', naam: '3e Zondag van de Vasten: Kruisverering', kort: 'Kruisverering', soort: 'beweeglijk', offset: -28, rang: 4, toelichting: 'Midden van de Vasten: het Kruis wordt in het midden van de kerk geplaatst om de gelovigen te bemoedigen.' },
  { id: 'zielenzaterdag-4', naam: 'Zaterdag der Overledenen (4e week)', kort: 'Zielenzaterdag', soort: 'beweeglijk', offset: -22, rang: 2 },
  { id: 'climacus', naam: '4e Zondag van de Vasten: H. Johannes Climacus', kort: 'Johannes Climacus', soort: 'beweeglijk', offset: -21, rang: 4, toelichting: 'Auteur van De Ladder van het Paradijs, dertig treden naar God.' },
  { id: 'grote-canon', naam: 'Donderdag van de Grote Canon (Mariastaan)', kort: 'Grote Canon', soort: 'beweeglijk', offset: -17, rang: 3, toelichting: 'Op woensdagavond wordt de Grote Canon van Andreas van Kreta in zijn geheel gezongen, met het leven van Maria van Egypte.' },
  { id: 'akathist', naam: 'Akathistzaterdag — Lofprijzing van de Moeder Gods', kort: 'Akathistzaterdag', soort: 'beweeglijk', offset: -15, rang: 4 },
  { id: 'maria-egypte', naam: '5e Zondag van de Vasten: H. Maria van Egypte', kort: 'Maria van Egypte', soort: 'beweeglijk', offset: -14, rang: 4, toelichting: 'Het icoon van de boete: zeventien jaar zonde, zevenenveertig jaar woestijn.' },
  { id: 'lazarus', naam: 'Lazaruszaterdag', soort: 'beweeglijk', offset: -8, rang: 5, toelichting: 'Christus wekt Lazarus op uit het graf: voorafbeelding van de algemene opstanding. Vis­kuit, wijn en olie toegestaan.' },
  { id: 'grote-maandag', naam: 'Grote en Heilige Maandag', soort: 'beweeglijk', offset: -6, rang: 5, toelichting: 'Jozef de Rechtvaardige en de onvruchtbare vijgenboom. Liturgie der Voorafgewijde Gaven.' },
  { id: 'grote-dinsdag', naam: 'Grote en Heilige Dinsdag', soort: 'beweeglijk', offset: -5, rang: 5, toelichting: 'De gelijkenis van de tien maagden: „Zie, de Bruidegom komt te middernacht.”' },
  { id: 'grote-woensdag', naam: 'Grote en Heilige Woensdag', soort: 'beweeglijk', offset: -4, rang: 5, toelichting: 'De zondares zalft de voeten van de Heer; Judas verkoopt Hem. ’s Avonds het sacrament van de Ziekenzalving.' },
  { id: 'grote-donderdag', naam: 'Grote en Heilige Donderdag', soort: 'beweeglijk', offset: -3, rang: 5, toelichting: 'Het Laatste Avondmaal en de instelling van de Eucharistie. ’s Avonds de Twaalf Lijdensevangeliën.' },
  { id: 'grote-vrijdag', naam: 'Grote en Heilige Vrijdag', soort: 'beweeglijk', offset: -2, rang: 6, toelichting: 'Kruisiging en graflegging. Koninklijke Uren, Vespers met de Kruisafname en het uitdragen van de epitaaf. Volledige onthouding.' },
  { id: 'grote-zaterdag', naam: 'Grote en Heilige Zaterdag', soort: 'beweeglijk', offset: -1, rang: 6, toelichting: 'Afdaling ter helle; de Liturgie van Basilius met vijftien lezingen en het omkleden in wit. Om middernacht begint de Paasnacht.' },
  { id: 'lichte-maandag', naam: 'Lichte Maandag', soort: 'beweeglijk', offset: 1, rang: 5 },
  { id: 'lichte-dinsdag', naam: 'Lichte Dinsdag · Iberische icoon van de Moeder Gods', kort: 'Lichte Dinsdag', soort: 'beweeglijk', offset: 2, rang: 5 },
  { id: 'lichte-woensdag', naam: 'Lichte Woensdag', soort: 'beweeglijk', offset: 3, rang: 5 },
  { id: 'lichte-donderdag', naam: 'Lichte Donderdag', soort: 'beweeglijk', offset: 4, rang: 5 },
  { id: 'lichte-vrijdag', naam: 'Lichte Vrijdag · Levenschenkende Bron', kort: 'Lichte Vrijdag', soort: 'beweeglijk', offset: 5, rang: 5 },
  { id: 'lichte-zaterdag', naam: 'Lichte Zaterdag — uitdeling van het artos', kort: 'Lichte Zaterdag', soort: 'beweeglijk', offset: 6, rang: 5 },
  { id: 'thomas', naam: 'Thomaszondag (Antipascha)', kort: 'Thomaszondag', soort: 'beweeglijk', offset: 7, rang: 5, toelichting: '„Mijn Heer en mijn God!” — de Verrezene verschijnt aan Thomas. Vanaf deze zondag begint de cyclus van de acht tonen.' },
  { id: 'radonitsa', naam: 'Radonitsa — Paasgedachtenis van de overledenen', kort: 'Radonitsa', soort: 'beweeglijk', offset: 9, rang: 2, toelichting: 'De paasvreugde wordt gedeeld met de overledenen: bezoek aan de graven met de paasgroet.' },
  { id: 'myrondraagsters', naam: 'Zondag van de Myrondraagsters', kort: 'Myrondraagsters', soort: 'beweeglijk', offset: 14, rang: 4 },
  { id: 'lamme', naam: 'Zondag van de Lamme', soort: 'beweeglijk', offset: 21, rang: 4 },
  { id: 'mid-pinksteren', naam: 'Mid-Pinksteren (Prepolovenie)', kort: 'Mid-Pinksteren', soort: 'beweeglijk', offset: 24, rang: 4, toelichting: 'Halverwege tussen Pascha en Pinksteren: „Wie dorst heeft, kome tot Mij.” Kleine waterwijding.' },
  { id: 'samaritaanse', naam: 'Zondag van de Samaritaanse Vrouw', kort: 'Samaritaanse vrouw', soort: 'beweeglijk', offset: 28, rang: 4 },
  { id: 'blindgeborene', naam: 'Zondag van de Blindgeborene', kort: 'Blindgeborene', soort: 'beweeglijk', offset: 35, rang: 4 },
  { id: 'apodosis-pascha', naam: 'Afsluiting (Apodosis) van Pascha', kort: 'Afsluiting Pascha', soort: 'beweeglijk', offset: 38, rang: 4, toelichting: 'Voor het laatst klinkt de paasdienst in zijn geheel.' },
  { id: 'vaders-nicea', naam: 'Zondag van de Vaders van het 1e Oecumenisch Concilie', kort: 'Vaders van Nicea', soort: 'beweeglijk', offset: 42, rang: 4 },
  { id: 'drievuldigheidszaterdag', naam: 'Drievuldigheidszaterdag — Zaterdag der Overledenen', kort: 'Zielenzaterdag', soort: 'beweeglijk', offset: 48, rang: 3 },
  { id: 'heilige-geest', naam: 'Maandag van de Heilige Geest', soort: 'beweeglijk', offset: 50, rang: 5 },
  { id: 'allerheiligen', naam: 'Zondag van Alle Heiligen', kort: 'Allerheiligen', soort: 'beweeglijk', offset: 56, rang: 4, toelichting: 'Slot van het Pentecostarion: de vrucht van de Geest zijn alle heiligen. Daarna begint de Apostelvasten.' },
  { id: 'begin-apostelvasten', naam: 'Begin van de Apostelvasten', soort: 'beweeglijk', offset: 57, rang: 1 },
  { id: 'plaatselijke-heiligen', naam: 'Zondag van alle heiligen van het eigen land', kort: 'Plaatselijke heiligen', soort: 'beweeglijk', offset: 63, rang: 3, toelichting: 'Tweede zondag na Pinksteren: alle heiligen van Rusland, van de Athos, van de Lage Landen — elk land eert zijn eigen heiligen.' },
];

/** Pascha + de twaalf grote feesten, in volgorde van het kerkelijk jaar (vanaf 1 september). */
export const DERTIEN: Feest[] = [PASCHA, ...GROTE_FEESTEN];

/** De volledige Paascyclus voor de Pascha-pagina, gesorteerd. */
export const PAASCYCLUS: Feest[] = BEWEEGLIJKE_FEESTEN
  .filter((f) => f.offset !== undefined && f.id !== 'begin-apostelvasten')
  .sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0));
