import type { PopupInhoud } from './cyclusTeksten';
import type { StapKey } from './paascyclus';

// De teksten van de perioden van de Paascyclus, letterlijk uit "De orthodoxe Paschale cyclus.docx" (voor Pascha zelf uit
// "Wat is Pascha?"). Gebruikt door de Pascha-pagina (uitleg per periode) en "De betekenis van vandaag".
export type PeriodeKey = 'voorbereiding' | 'grote-vasten' | 'goede-week' | 'pascha' | 'vijftig-dagen' | 'hemelvaart' | 'pinksteren';

export const PERIODE_POPUPS: Record<PeriodeKey, PopupInhoud> = {
  "voorbereiding": {
    "title": "Voorbereiding",
    "subtitle": "Zondagen voor de Vasten",
    "paragraphs": [],
    "sections": [
      {
        "heading": "De voorbereiding op de Grote Vasten",
        "paragraphs": [
          "De Kerk gaat niet plotseling de Grote Vasten binnen. De Triodion-periode opent een geleidelijke geestelijke voorbereiding waarin de gelovige wordt geroepen tot verlangen naar Christus, nederigheid, bekering, barmhartigheid en vergeving."
        ],
        "items": [
          "Zondag van Zacheüs — het verlangen om Christus te zien.",
          "Zondag van de Tollenaar en de Farizeeër — nederigheid in het gebed en het afwijzen van geestelijke hoogmoed.",
          "Zondag van de Verloren Zoon — terugkeer naar de Vader en vertrouwen op Zijn barmhartigheid.",
          "Zaterdag der Overledenen (Vleesdervingszaterdag).",
          "Zondag van het Laatste Oordeel / Vleesverlatingszondag — liefde tot de naaste en verantwoordelijkheid voor ons leven.",
          "Vergevingszondag / Kaasverlatingszondag — wederzijdse vergeving en de daadwerkelijke ingang in de Grote Vasten."
        ],
        "after": [
          "Aan de vooravond van de Grote Vasten vraagt de Kerk de gelovigen elkaar om vergeving. Zo begint de vasten niet alleen met een verandering van voedsel, maar met verzoening, bekering en een vernieuwde gerichtheid op God."
        ]
      }
    ]
  },
  "grote-vasten": {
    "title": "Grote Vasten",
    "subtitle": "Een weg van bekering",
    "paragraphs": [],
    "sections": [
      {
        "heading": "De Grote Vasten",
        "paragraphs": [
          "De Grote Vasten is de veertigdaagse voorbereiding op de viering van de Verrijzenis. Gebed, vasten en aalmoezen vormen samen een weg van bekering. De vasten is niet bedoeld als somberheid omwille van zichzelf, maar als reiniging en terugkeer: het hart wordt opnieuw gericht op de liefde tot God en de naaste."
        ]
      },
      {
        "heading": "De dagen van de Grote Vasten",
        "items": [
          "Schone Maandag — eerste dag van de Grote Vasten; ’s avonds de eerste Grote Completen met de Grote Canon van Andreas van Kreta.",
          "Zaterdag van H. Theodorus de Rekruut (koliva).",
          "Eerste zondag — Zondag van de Orthodoxie: de overwinning van het Orthodoxe geloof en de herstelling van de heilige iconen.",
          "Zaterdag der Overledenen (2e week).",
          "Tweede zondag — Heilige Gregorius Palamas: het leven in Gods genade en het gebed van het hart.",
          "Zaterdag der Overledenen (3e week).",
          "Derde zondag — Verering van het kostbare en levenschenkende Kruis: midden in de vasten wordt het Kruis tot versterking en hoop opgericht.",
          "Zaterdag der Overledenen (4e week).",
          "Vierde zondag — Heilige Johannes Climacus: de geestelijke opgang en de strijd tegen de hartstochten.",
          "Donderdag van de Grote Canon — op woensdagavond wordt de Grote Canon van Andreas van Kreta in zijn geheel gezongen, met het leven van Maria van Egypte.",
          "Akathistzaterdag — Lofprijzing van de Moeder Gods.",
          "Vijfde zondag — Heilige Maria van Egypte: radicale bekering en de vernieuwende kracht van Gods genade."
        ],
        "after": [
          "In de vastentijd krijgen de diensten een uitgesproken boete- en gebedskarakter. De Kerk kent onder meer de Liturgie van de Voorafgewijde Gaven en het gebed van de heilige Efrem de Syriër."
        ]
      }
    ]
  },
  "goede-week": {
    "title": "Goede Week",
    "subtitle": "Lijden en liefde",
    "paragraphs": [],
    "sections": [
      {
        "heading": "Lazaruszaterdag en Palmzondag",
        "paragraphs": [
          "Na de veertig dagen van de Grote Vasten voert de Kerk ons naar Lazaruszaterdag. De opwekking van Lazarus verkondigt reeds Christus’ overwinning op de dood. De volgende dag vieren wij Palmzondag, de intocht van de Heer in Jeruzalem.",
          "Deze twee dagen vormen de overgang van de vastentijd naar de Grote en Heilige Week. De aandacht verschuift nu volledig naar de laatste dagen van Christus’ aardse leven, Zijn vrijwillig lijden, dood en graflegging."
        ],
        "items": [
          "Lazaruszaterdag — Christus wekt Lazarus op uit het graf: voorafbeelding van de algemene opstanding. Viskuit, wijn en olie toegestaan.",
          "Palmzondag — Christus rijdt op een ezelsveulen Jeruzalem binnen; kinderen zwaaien met palmtakken. Vis is toegestaan."
        ],
        "note": "Lazaruszaterdag en Palmzondag staan strikt genomen tussen de Vasten en de Goede Week in, maar ze horen inhoudelijk bij de intocht in het lijden, dus hier zijn ze het best op hun plek."
      },
      {
        "heading": "De Grote en Heilige Week",
        "paragraphs": [
          "In de Grote en Heilige Week volgt de Kerk Christus stap voor stap op Zijn weg naar het Kruis en het graf. De diensten laten de gebeurtenissen niet slechts als verleden herinneren; liturgisch worden de gelovigen uitgenodigd om erbij aanwezig te zijn en met Christus mee te gaan."
        ],
        "items": [
          "Grote en Heilige Maandag — waakzaamheid en voorbereiding; de Bruidegom komt.",
          "Grote en Heilige Dinsdag — de oproep om waakzaam en gereed te zijn.",
          "Grote en Heilige Woensdag — bekering, liefde en de nadering van het verraad.",
          "Grote en Heilige Donderdag — het Mystieke Avondmaal en de instelling van de Eucharistie; de Kerk treedt tevens binnen in het lijden van de Heer.",
          "Grote en Heilige Vrijdag — de Kruisiging, dood en graflegging van Christus.",
          "Grote en Heilige Zaterdag — Christus rust in het graf en daalt af in het rijk van de dood; de stilte draagt reeds de verwachting van de Verrijzenis."
        ]
      }
    ]
  },
  "pascha": {
    "title": "Pascha",
    "subtitle": "De Verrijzenis van Christus",
    "highlight": "Christus, opgestaan van de doden, overwon de dood door Zijn dood, aan allen in de graven schonk Hij het leven.",
    "paragraphs": [],
    "sections": [
      {
        "heading": "Het heilige Pascha",
        "paragraphs": [
          "Pascha is het Feest der Feesten: de viering van de Verrijzenis van onze Heer Jezus Christus. Het graf is leeg en de dood heeft niet het laatste woord. De paasvreugde is daarom niet alleen de herinnering aan een gebeurtenis, maar de verkondiging van het nieuwe leven dat in Christus is aangebroken.",
          "De Paschanacht vormt het stralende middelpunt van deze cyclus. De Kerk gaat vanuit de duisternis naar het licht en verkondigt de Verrijzenis. De begroeting ‘Christus is opgestaan!’ en het antwoord ‘Hij is waarlijk opgestaan!’ geven stem aan de vreugde van deze periode.",
          "De week die op Pascha volgt heet de Lichte Week. Zij wordt als één grote feestdag beleefd en heeft een bijzonder vreugdevol liturgisch karakter."
        ]
      },
      {
        "heading": "Pascha en de Lichte Week",
        "items": [
          "Pascha — het Feest der feesten en het hart van het kerkelijk jaar. In de Paasnacht trekt de gemeente met brandende kaarsen om de kerk, wordt het gesloten kerkportaal geopend en klinkt voor het eerst: „Christus is opgestaan!” — „Waarlijk opgestaan!”",
          "Lichte Maandag.",
          "Lichte Dinsdag — Iberische icoon van de Moeder Gods.",
          "Lichte Woensdag.",
          "Lichte Donderdag.",
          "Lichte Vrijdag — Levenschenkende Bron.",
          "Lichte Zaterdag — uitdeling van het artos."
        ]
      }
    ]
  },
  "vijftig-dagen": {
    "title": "De Vijftig Dagen",
    "subtitle": "Leven in het licht",
    "paragraphs": [],
    "sections": [
      {
        "heading": "De periode na Pascha",
        "paragraphs": [
          "De paasvreugde wordt gedurende veertig dagen gevierd. De zondagen na Pascha belichten telkens een eigen aspect van de ontmoeting met de verrezen Christus en van het nieuwe leven dat uit Zijn Verrijzenis voortkomt."
        ],
        "items": [
          "Thomaszondag — de apostel Thomas ontmoet de verrezen Heer en belijdt Hem als Heer en God.",
          "Radonitsa — de paasvreugde wordt gedeeld met de overledenen: bezoek aan de graven met de paasgroet.",
          "Zondag van de Myrrhedraagsters — de vrouwen die in trouw naar het graf gingen worden getuigen van de Verrijzenis.",
          "Zondag van de Verlamde — Christus schenkt genezing en nieuw leven.",
          "Midden-Pinksteren — midden tussen Pascha en Pinksteren wordt Christus verkondigd als de bron van levend water.",
          "Zondag van de Samaritaanse vrouw — de ontmoeting met Christus als het levende water.",
          "Zondag van de Blindgeborene — Christus als het Licht van de wereld.",
          "Afscheid van Pascha — de voltooiing van de veertigdaagse paasviering."
        ]
      }
    ]
  },
  "hemelvaart": {
    "title": "Hemelvaart",
    "subtitle": "Christus verheerlijkt",
    "paragraphs": [],
    "sections": [
      {
        "heading": "Hemelvaart",
        "paragraphs": [
          "Veertig dagen na Pascha viert de Kerk de Hemelvaart van Christus. De verrezen Heer stijgt op in heerlijkheid. De Hemelvaart is geen afwezigheid van Christus, maar de verheerlijking van de menselijke natuur in Hem en de voorbereiding op de gave van de Heilige Geest."
        ],
        "items": [
          "Hemelvaart — veertig dagen na Pascha wordt de Verrezene voor de ogen van de leerlingen opgenomen en zit Hij aan de rechterhand van de Vader. De dag ervoor (woensdag) is de afsluiting (apodosis) van Pascha: de laatste keer dat „Christus is opgestaan” gezongen wordt.",
          "Zondag van de Vaders van het 1e Oecumenisch Concilie.",
          "Drievuldigheidszaterdag — Zaterdag der Overledenen."
        ]
      }
    ]
  },
  "pinksteren": {
    "title": "Pinksteren en de heiligen",
    "subtitle": "De nederdaling van de Heilige Geest",
    "paragraphs": [],
    "sections": [
      {
        "heading": "Pinksteren",
        "paragraphs": [
          "Vijftig dagen na Pascha viert de Kerk het heilige Pinksteren: de nederdaling van de Heilige Geest over de apostelen. Pinksteren is de vervulling van de Paschale beweging. De Verrijzenis opent het nieuwe leven; de Geest schenkt dit leven aan de Kerk en zendt haar uit in de wereld.",
          "De maandag na Pinksteren is in de Orthodoxe traditie bijzonder gewijd aan de Heilige Geest."
        ],
        "items": [
          "Pinksteren — vijftig dagen na Pascha daalt de Heilige Geest neer op de apostelen; de Kerk wordt geboren. Na de Liturgie volgen de Kniebuigingsvespers, waarbij voor het eerst sinds Pascha weer geknield wordt.",
          "Maandag van de Heilige Geest."
        ]
      },
      {
        "heading": "Allerheiligen en de overgang",
        "paragraphs": [
          "De eerste zondag na Pinksteren is de Zondag van Allerheiligen. Zij laat zien wat de gave van de Heilige Geest in mensen voortbrengt: heiligheid. De heiligen zijn de vruchten van Pascha en Pinksteren in het leven van de Kerk.",
          "Na Allerheiligen begint de Apostelvasten. De begindatum daarvan beweegt mee met Pascha, terwijl het einde aan een vaste kalenderdatum verbonden is. Dit laat mooi zien hoe de Paschale en de vaste jaarcyclus elkaar in het Orthodoxe kerkelijk jaar ontmoeten."
        ],
        "items": [
          "Zondag van Alle Heiligen — slot van het Pentecostarion: de vrucht van de Geest zijn alle heiligen. Daarna begint de Apostelvasten.",
          "Zondag van alle heiligen van het eigen land — tweede zondag na Pinksteren: alle heiligen van Rusland, van de Athos, van de Lage Landen — elk land eert zijn eigen heiligen."
        ]
      }
    ]
  }
};

// De opbouw van de Paascyclus in tien perioden: STAPPEN in lib/paascyclus.ts. De uitleg per periode gebruikt de bestaande
// teksten (lib/paascyclusTeksten.ts): Lazaruszaterdag en Palmzondag het eerste deel van de Goede Week, de Goede Week het
// tweede, de Lichte Week de tekst van Pascha.
const goedeWeek = PERIODE_POPUPS['goede-week'];
export const STAP_INHOUD: Record<StapKey, PopupInhoud> = {
  voorbereiding: PERIODE_POPUPS.voorbereiding,
  'grote-vasten': PERIODE_POPUPS['grote-vasten'],
  lazarus: { ...goedeWeek, sections: goedeWeek.sections?.slice(0, 1) },
  palmzondag: { ...goedeWeek, sections: goedeWeek.sections?.slice(0, 1) },
  'goede-week': { ...goedeWeek, sections: goedeWeek.sections?.slice(1) },
  pascha: PERIODE_POPUPS.pascha,
  'lichte-week': PERIODE_POPUPS.pascha,
  paastijd: PERIODE_POPUPS['vijftig-dagen'],
  hemelvaart: PERIODE_POPUPS.hemelvaart,
  pinksteren: PERIODE_POPUPS.pinksteren,
};

/** Aangeleverde iconen in de Paascyclus (public/images/feesten/, uit "Pascha icons"), per dag t.o.v. Pascha. Teksten:
 *  concept. `periode`: icoon van de periode (het nafeest van Hemelvaart), niet van de dag zelf. Pascha en de Lichte Week
 *  houden het icoon van de Verrijzenis, behalve Lichte Vrijdag (Levenschenkende Bron). Alle Heiligen (+56) valt buiten
 *  de cyclus en wordt hier niet getoond (bestand allerheiligen.webp staat klaar). */
export interface PaasIcoon { bestand: string; breedte: number; hoogte: number; naam: string; betekenis: string; schrift?: string; periode?: boolean }
const HEMELVAART: PaasIcoon = {
  bestand: 'hemelvaart.webp', breedte: 659, hoogte: 800, naam: 'Icoon van de Hemelvaart van Christus',
  betekenis: 'Op de veertigste dag na Pascha stijgt Christus ten hemel, gedragen door engelen. Beneden staan de Moeder Gods en de apostelen; twee engelen zeggen hun dat Hij op dezelfde wijze zal terugkomen.',
  schrift: 'Handelingen 1:9–11',
};
export const PASCHA_DAGICONEN: Record<number, PaasIcoon> = {
  [-42]: {
    bestand: 'orthodoxie.webp', breedte: 639, hoogte: 800, naam: 'Icoon van de Triomf van de Orthodoxie',
    betekenis: 'Op de eerste zondag van de Grote Vasten viert de Kerk het herstel van de iconenverering in 843. De icoon toont keizerin Theodora, haar zoon Michaël en patriarch Methodius met heiligen rond de icoon van de Moeder Gods.',
  },
  [-35]: {
    bestand: 'palamas.webp', breedte: 598, hoogte: 800, naam: 'Icoon van de heilige Gregorius Palamas',
    betekenis: 'De heilige Gregorius Palamas, aartsbisschop van Thessaloniki (†1359), verdedigde het gebed van het hart en de leer van het ongeschapen licht van God. Hij staat afgebeeld als bisschop met het Evangelieboek.',
  },
  [-28]: {
    bestand: 'kruisverering.webp', breedte: 579, hoogte: 800, naam: 'Icoon van de verheffing van het Kruis',
    betekenis: 'Halverwege de Grote Vasten wordt het Kruis in het midden van de kerk gelegd en vereerd, om de gelovigen op hun weg naar Pascha te sterken: „Uw Kruis aanbidden wij, Heer, en Uw heilige Verrijzenis verheerlijken wij.”',
  },
  [-15]: {
    bestand: 'akathist.webp', breedte: 645, hoogte: 800, naam: 'Icoon van de Lof van de Moeder Gods',
    betekenis: 'Op de Akathistzaterdag zingt de Kerk staande de Akathistos-hymne, de grote lofzang op de Moeder Gods. De icoon toont haar met het Kind, omringd door de profeten met de voorafbeeldingen die naar haar verwijzen.',
  },
  [-7]: {
    bestand: 'palmzondag.webp', breedte: 599, hoogte: 800, naam: 'Icoon van de Intocht in Jeruzalem',
    betekenis: 'Christus rijdt op een ezel Jeruzalem binnen; kinderen spreiden hun kleren en takken op de weg en het volk roept „Hosanna”. Hij komt als de Koning van de vrede, op weg naar Zijn lijden.',
    schrift: 'Matteüs 21:1–11; Johannes 12:12–18',
  },
  [-3]: {
    bestand: 'grote-donderdag.webp', breedte: 320, hoogte: 440, naam: 'Icoon van het Laatste Avondmaal',
    betekenis: 'Christus viert met Zijn leerlingen het Laatste Avondmaal en geeft hun Zijn Lichaam en Bloed: de instelling van de Eucharistie.',
    schrift: 'Matteüs 26:17–30',
  },
  [-2]: {
    bestand: 'grote-vrijdag.webp', breedte: 800, hoogte: 501, naam: 'Epitaphios: Christus in het graf',
    betekenis: 'Het epitaphios is het geborduurde doek met het lichaam van Christus, gereed voor het graf. Op Grote Vrijdag wordt het in processie rondgedragen en in het midden van de kerk gelegd, waar de gelovigen het vereren.',
    schrift: 'Johannes 19:38–42',
  },
  [-1]: {
    bestand: 'grote-zaterdag.webp', breedte: 612, hoogte: 800, naam: 'Icoon van de Graflegging',
    betekenis: 'Jozef van Arimatea en Nikodemus leggen het lichaam van Christus in het graf, bij de Moeder Gods, Johannes en de vrouwen. Op deze gezegende sabbat rust Christus in het graf en daalt Hij af in het dodenrijk.',
    schrift: 'Matteüs 27:57–61',
  },
  5: {
    bestand: 'lichte-vrijdag.webp', breedte: 656, hoogte: 800, naam: 'Icoon van de Moeder Gods, de Levenschenkende Bron',
    betekenis: 'Op de vrijdag van de Lichte Week eert de Kerk de Moeder Gods als de Levenschenkende Bron. Zij staat met het Kind boven een bron waarvan het water de zieken geneest; na de Liturgie volgt een kleine waterwijding.',
  },
  7: {
    bestand: 'thomas.webp', breedte: 538, hoogte: 800, naam: 'Icoon van de belijdenis van Thomas',
    betekenis: 'Acht dagen na Pascha toont Christus Zijn wonden aan de apostel Thomas, die belijdt: „Mijn Heer en mijn God!”',
    schrift: 'Johannes 20:24–29',
  },
  14: {
    bestand: 'myrondraagsters.webp', breedte: 526, hoogte: 724, naam: 'Icoon van de myrondraagsters bij het graf',
    betekenis: 'Vroeg op de eerste dag van de week komen de vrouwen met welriekende olie naar het graf. Een engel op de weggerolde steen verkondigt hun dat de Heer is opgestaan.',
    schrift: 'Marcus 16:1–8',
  },
  21: {
    bestand: 'lamme.webp', breedte: 414, hoogte: 550, naam: 'Icoon van de genezing van de lamme',
    betekenis: 'Bij het bad van Betesda geneest Christus een man die achtendertig jaar verlamd was: „Sta op, neem uw bed op en loop.”',
    schrift: 'Johannes 5:1–15',
  },
  24: {
    bestand: 'mid-pinksteren.webp', breedte: 494, hoogte: 750, naam: 'Icoon van Mid-Pinksteren',
    betekenis: 'Halverwege tussen Pascha en Pinksteren gedenkt de Kerk hoe Christus in de tempel onderwijst, zodat de leraars zich verwonderen over Zijn wijsheid.',
    schrift: 'Johannes 7:14–30',
  },
  28: {
    bestand: 'samaritaanse.webp', breedte: 800, hoogte: 734, naam: 'Icoon van Christus en de Samaritaanse vrouw',
    betekenis: 'Bij de put van Jakob spreekt Christus met de Samaritaanse vrouw over het levende water. Zij gelooft en verkondigt Hem in haar stad; de Kerk eert haar als de heilige Photini.',
    schrift: 'Johannes 4:5–42',
  },
  35: {
    bestand: 'blindgeborene.webp', breedte: 533, hoogte: 800, naam: 'Icoon van de genezing van de blindgeborene',
    betekenis: 'Christus strijkt slijk op de ogen van een man die blind geboren is en zendt hem naar het bad van Siloam. Hij komt ziende terug en belijdt zijn geloof in de Zoon van God.',
    schrift: 'Johannes 9:1–38',
  },
  39: HEMELVAART,
  42: {
    bestand: 'vaders-nicea.webp', breedte: 617, hoogte: 800, naam: 'Icoon van het Eerste Oecumenisch Concilie',
    betekenis: 'De vaders van het Concilie van Nicea (325) beleden dat de Zoon één in wezen is met de Vader. Hun belijdenis vormt de kern van het Credo dat in elke Liturgie wordt gezongen.',
  },
  ...Object.fromEntries([40, 41, 43, 44, 45, 46, 47].map((o) => [o, { ...HEMELVAART, periode: true }])),
};
