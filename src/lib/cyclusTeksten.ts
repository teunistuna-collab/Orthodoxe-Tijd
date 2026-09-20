// Teksten voor de info-pop-ups van de cyclus-pagina's.
// Ze komen letterlijk uit de Word-bestanden in "Website Map" (ademcyclus, etmaalcyclus, weekcyclus,
// jaarcyclus en Paschale cyclus); per knop is het hoofdstuk gekozen dat bij de titel past.
// Interne notities uit de documenten (bijv. "Kern voor de website") zijn bewust niet opgenomen.

export type PopupSectie = {
  /** Kopje boven de sectie. */
  heading?: string;
  paragraphs?: string[];
  /** Opsomming (bullets). */
  items?: string[];
  /** Alinea's die ná de opsomming komen. */
  after?: string[];
  /** Kleine regel onder de alinea's (bijv. trefwoorden). */
  note?: string;
  table?: { head: string[]; rows: string[][] };
};

export type PopupInhoud = {
  title: string;
  /** Optioneel portret (bijv. icoon van een heilige) boven de tekst. */
  image?: { src: string; alt: string };
  subtitle?: string;
  highlight?: string;
  paragraphs: string[];
  sections?: PopupSectie[];
};

export const ADEM_POPUPS: Record<'wat' | 'jezusgebed' | 'gebedskoord' | 'hart', PopupInhoud> = {
  "wat": {
    "title": "Wat is de ademcyclus?",
    "subtitle": "Een klein ritme binnen het leven van gebed",
    "highlight": "“Bidt zonder ophouden.” — 1 Thessalonicenzen 5:17",
    "paragraphs": [],
    "sections": [
      {
        "paragraphs": [
          "Met de naam ‘ademcyclus’ wordt hier geen officiële liturgische cyclus van de Orthodoxe Kerk bedoeld. De term wordt gebruikt als een ordenende naam voor het kleinste ritme van het gebedsleven: de voortdurende gedachtenis aan Christus, die zelfs de ademhaling kan begeleiden. Anders dan de etmaal-, week-, Paschale en jaarcyclus is dit dus geen onderdeel van het kerkelijk Typikon, maar een manier om het orthodoxe ideaal van het onophoudelijke gebed zichtbaar te maken."
        ]
      },
      {
        "heading": "Iedere ademhaling als herinnering aan Christus",
        "paragraphs": [
          "Het doel is niet dat de christen zijn adem beheerst, maar dat zijn leven steeds meer door gebed wordt gedragen. De adem kan daarbij een stille herinnering worden: zolang er adem is, kan de Naam van de Heer worden aangeroepen. Zo wordt het kleinste ritme van het lichamelijke leven verbonden met de roeping van de apostel: ‘Bidt zonder ophouden.’"
        ]
      }
    ]
  },
  "jezusgebed": {
    "title": "Het Jezusgebed",
    "subtitle": "Het hart van de ademcyclus",
    "highlight": "Heer Jezus Christus, Zoon van God, ontferm U over mij, zondaar.",
    "paragraphs": [],
    "sections": [
      {
        "paragraphs": [
          "In de orthodoxe geestelijke traditie is het Jezusgebed de meest kenmerkende vorm van het onophoudelijke gebed. Door de Naam van de Heer telkens opnieuw aan te roepen, keert het verstand terug tot Christus en wordt het hart geoefend in nederigheid, berouw en de voortdurende gedachtenis aan God.",
          "De woorden belijden tegelijk wie Christus is en wie de mens voor Hem is: Jezus is Heer, Christus en Zoon van God; de bidder vraagt niet om een techniek of een bijzondere ervaring, maar om ontferming. Het doel is de gemeenschap met God en een leven dat steeds opnieuw naar Hem wordt gekeerd."
        ]
      },
      {
        "heading": "Gebed en adem",
        "paragraphs": [
          "Binnen de hesychastische traditie is het Jezusgebed soms met de lichamelijke ademhaling verbonden. Een eenvoudige vorm kan de twee delen van het gebed rustig laten meelopen met in- en uitademing:"
        ],
        "items": [
          "Inademen — Heer Jezus Christus, Zoon van God",
          "Uitademen — ontferm U over mij, zondaar"
        ],
        "after": [
          "De ademhaling dient het gebed; het gebed dient niet de ademhaling.",
          "De Kerkelijke traditie maakt hierbij een belangrijk onderscheid. Het Jezusgebed kan door iedere gelovige eenvoudig en aandachtig worden gebeden, ook tijdens de gewone bezigheden van de dag, zonder bijzondere lichaamshouding of ademtechniek. De specifieke hesychastische methoden waarin ademhaling, houding en het ‘neerdalen van het verstand in het hart’ bewust worden geoefend, behoren traditioneel onder geestelijke begeleiding te worden beoefend. De techniek is nooit het doel; Christus is het middelpunt."
        ]
      }
    ]
  },
  "gebedskoord": {
    "title": "Het gebedskoord",
    "subtitle": "Chotki en komboskini",
    "paragraphs": [],
    "sections": [
      {
        "paragraphs": [
          "Een chotki of komboskini kan helpen om het Jezusgebed aandachtig en regelmatig te herhalen. De knopen zijn geen doel op zichzelf en de ademhaling is geen teller. Het gebedskoord ondersteunt de gebedsregel en helpt de aandacht terug te brengen wanneer de gedachten afdwalen. De uiterlijke herhaling is gericht op een innerlijke werkelijkheid: de Naam van Jezus in gedachtenis bewaren."
        ]
      },
      {
        "heading": "Onophoudelijk gebed en de vaste gebedsregel",
        "paragraphs": [
          "Onophoudelijk gebed vervangt de vaste gebeden van de Kerk niet. De orthodoxe traditie houdt beide samen: de gelovige heeft vaste tijden van gebed en neemt de gedachtenis aan God mee in de uren daartussen. Persoonlijk gebed en de gemeenschappelijke liturgische eredienst zijn evenmin hetzelfde; het persoonlijke gebed vindt zijn bedding in het grotere gebedsleven van de Kerk."
        ]
      }
    ]
  },
  "hart": {
    "title": "Gebed van het hart",
    "subtitle": "Van de lippen naar het hart",
    "paragraphs": [],
    "sections": [
      {
        "paragraphs": [
          "Het onophoudelijke gebed begint eenvoudig. Het gebed wordt uitgesproken met de lippen, vervolgens stiller en aandachtiger in het verstand, en de orthodoxe geestelijke schrijvers spreken uiteindelijk over het ‘gebed van het hart’: een toestand waarin de gedachtenis aan God het innerlijke leven steeds dieper doordringt. Dit is geen prestatie die door een ademritme kan worden afgedwongen, maar een gave die wordt gezocht in nederigheid, bekering en het sacramentele en liturgische leven van de Kerk."
        ]
      },
      {
        "heading": "Korte aanroepingen door de dag",
        "paragraphs": [
          "Naast het volledige Jezusgebed kent het orthodoxe leven korte aanroepingen en schietgebeden. Zij kunnen opkomen tijdens arbeid, reizen, wachten, vreugde, angst of verzoeking. Hun betekenis ligt niet in een vast ademschema, maar in het telkens terugkeren van hart en verstand tot God. Het Jezusgebed blijft daarbij de centrale en meest karakteristieke korte aanroeping."
        ]
      }
    ]
  }
};

export const ETMAAL_INFO: Record<'wat' | 'diensten' | 'betekenis' | 'praktisch', PopupInhoud> = {
  "wat": {
    "title": "Wat is het etmaal?",
    "subtitle": "De dag geheiligd door gebed",
    "highlight": "“Zevenmaal daags heb ik U geloofd om Uw rechtvaardige oordelen.” — Psalm 118 (119):164",
    "paragraphs": [],
    "sections": [
      {
        "paragraphs": [
          "De Orthodoxe Kerk omringt het gehele etmaal met gebed. Van de avond tot de volgende avond worden de uren van duisternis en licht, rust en arbeid, waken en slapen opgenomen in de lofprijzing van God. Deze dagelijkse orde wordt gevormd door de Vespers, Completen, Middernachtdienst, Metten en de Eerste, Derde, Zesde en Negende Uren. Samen vormen zij de dagelijkse of etmaalcyclus van de goddelijke diensten."
        ]
      },
      {
        "heading": "De kerkelijke dag begint in de avond",
        "paragraphs": [
          "Liturgisch opent de nieuwe dag in de avond. Daarom staat de Vespers aan het begin van de etmaalcyclus. Dit weerspiegelt het bijbelse patroon: ‘En het was avond geweest en het was morgen geweest: de eerste dag.’ Vanuit de avond beweegt de Kerk door de nacht naar het morgenlicht en vervolgens door de uren van de dag, totdat bij de volgende Vespers opnieuw een nieuwe kerkelijke dag aanvangt."
        ]
      }
    ]
  },
  "diensten": {
    "title": "De liturgische diensten",
    "subtitle": "De acht getijden van dag en nacht",
    "paragraphs": [],
    "sections": [
      {
        "heading": "De traditionele uren",
        "paragraphs": [
          "De namen van de Uren verwijzen naar de oude wijze waarop de dag vanaf zonsopgang werd geteld. In een schematische moderne weergave worden zij vaak verbonden met ongeveer 06.00, 09.00, 12.00 en 15.00 uur. Ook Vespers, Completen, Middernachtdienst en Metten kunnen voor uitleg aan bepaalde momenten van het etmaal worden gekoppeld. Dit zijn echter oriëntatiepunten: de feitelijke tijden waarop een klooster of parochie de diensten viert, kunnen verschillen."
        ],
        "table": {
          "head": [
            "Dienst",
            "Schematisch moment",
            "Hoofdgedachtenis"
          ],
          "rows": [
            [
              "Vespers",
              "± 18.00",
              "Begin kerkelijke dag; avond en licht"
            ],
            [
              "Completen",
              "± 21.00",
              "Gebed vóór de nachtrust"
            ],
            [
              "Middernachtdienst",
              "± 00.00",
              "Waakzaamheid en verwachting"
            ],
            [
              "Metten",
              "nacht / vroege morgen",
              "Morgenlof en het komende licht"
            ],
            [
              "Eerste Uur",
              "± 06.00",
              "Begin van de dag"
            ],
            [
              "Derde Uur",
              "± 09.00",
              "Neerdaling van de Heilige Geest"
            ],
            [
              "Zesde Uur",
              "± 12.00",
              "Christus aan het Kruis"
            ],
            [
              "Negende Uur",
              "± 15.00",
              "De dood van Christus aan het Kruis"
            ]
          ]
        }
      }
    ]
  },
  "betekenis": {
    "title": "De betekenis in ons leven",
    "subtitle": "Niet acht afzonderlijke momenten, maar één gebed",
    "paragraphs": [],
    "sections": [
      {
        "paragraphs": [
          "Hoewel de diensten verschillende namen en tijden hebben, vormen zij samen één doorgaande beweging van gebed. De avond opent de dag, de nacht roept tot waakzaamheid, de morgen tot lofprijzing en de uren van het daglicht brengen de gelovige telkens terug tot het heilswerk van Christus. Zo wordt het gehele etmaal opgenomen in de gedachtenis aan God."
        ]
      },
      {
        "heading": "Van avond tot avond",
        "paragraphs": [
          "De etmaalcyclus leert de gelovige dat geen uur buiten het gebed hoeft te vallen. De Kerk bidt bij het dalen van de avond, in de stilte van de nacht, bij het eerste morgenlicht en midden in de arbeid van de dag. Zo wordt de tijd niet slechts doorgebracht, maar geheiligd: van Vespers tot Vespers, van avond tot avond, in de gedachtenis aan God."
        ]
      }
    ]
  },
  "praktisch": {
    "title": "Praktisch",
    "subtitle": "In parochie, klooster en persoonlijk gebed",
    "paragraphs": [],
    "sections": [
      {
        "heading": "De etmaalcyclus in parochie en klooster",
        "paragraphs": [
          "In de kloosterlijke traditie kan de dagelijkse cyclus veel vollediger worden gevierd dan in een gewone parochie. Diensten worden bovendien vaak samengevoegd: zo kunnen Vespers en Metten deel uitmaken van een nachtwake, en worden de Uren dikwijls in samenhang met andere diensten gelezen. De liturgische structuur blijft echter dezelfde, ook wanneer niet iedere dienst afzonderlijk op het schematische uur wordt gevierd."
        ]
      },
      {
        "heading": "De etmaalcyclus en de Goddelijke Liturgie",
        "paragraphs": [
          "De Goddelijke Liturgie is het eucharistische middelpunt van het kerkelijke leven, maar zij is niet eenvoudig één van de acht getijdediensten. Zij wordt binnen het grotere liturgische ritme van de dag gevierd en wordt in de praktijk vaak voorafgegaan door bepaalde Uren. Daarom is het goed de Eucharistie te onderscheiden van de eigenlijke dagelijkse cyclus, terwijl zij er liturgisch nauw mee verbonden blijft."
        ]
      }
    ]
  }
};

export const WEEK_INFO: Record<'wat' | 'dagen' | 'betekenis' | 'praktisch', PopupInhoud> = {
  "wat": {
    "title": "Wat is de weekcyclus?",
    "subtitle": "De heiliging van de week",
    "paragraphs": [
      "Zoals het etmaal door de getijden wordt geheiligd, zo draagt ook iedere dag van de week een eigen kerkelijke gedachtenis. De week begint met de Dag des Heren, de zondag, en ontvouwt zich vanuit de Verrijzenis van Christus. De vaste thema’s van de week worden bezongen in de Octoechos (Oktoëchos) en worden telkens verweven met de heiligen en feesten van de kalender, de toon van de week en de beweeglijke Paschale cyclus."
    ],
    "sections": []
  },
  "dagen": {
    "title": "De dagen van de week",
    "subtitle": "Zeven dagen, één ritme",
    "paragraphs": [],
    "sections": [
      {
        "heading": "Zondag — de Verrijzenis van Christus",
        "paragraphs": [
          "De eerste dag van de week is de Dag des Heren: de dag van de Verrijzenis. Iedere zondag draagt daarom het karakter van een klein Pascha. De Kerk verzamelt zich rond de verrezen Christus en verkondigt Zijn overwinning op zonde, dood en verderf. Liturgisch vangt de zondag reeds aan op zaterdagavond met de Vespers."
        ],
        "note": "Verrijzenis · Pascha · Eucharistie · vreugde · overwinning op de dood"
      },
      {
        "heading": "Maandag — de heilige engelen en hemelse machten",
        "paragraphs": [
          "Na de Dag des Heren eert de Kerk op maandag de onlichamelijke machten: de engelen en aartsengelen die God zonder ophouden dienen en verheerlijken. Hun gehoorzaamheid, waakzaamheid en lofprijzing richten de gelovige op het hemelse leven en de onophoudelijke aanbidding van God."
        ],
        "note": "Engelen · hemelse eredienst · gehoorzaamheid · waakzaamheid · lofprijzing"
      },
      {
        "heading": "Dinsdag — de heilige Johannes de Voorloper",
        "paragraphs": [
          "Dinsdag is in het bijzonder gewijd aan de heilige profeet, Voorloper en Doper Johannes. In hem klinkt de roep tot bekering en voorbereiding op de komst van Christus. Door de Voorloper worden tevens de profeten in herinnering gebracht, die van oudsher naar de komst van de Messias hebben gewezen."
        ],
        "note": "Johannes de Doper · profeten · bekering · voorbereiding · waakzaamheid"
      },
      {
        "heading": "Woensdag — het verraad en het heilige Kruis",
        "paragraphs": [
          "Op woensdag gedenkt de Kerk het verraad van de Heer door Judas en richt zij de blik op het heilige en levenschenkende Kruis. Daarom draagt deze dag een boetvaardig karakter en is woensdag, buiten de vastenvrije perioden en bijzondere liturgische uitzonderingen, een wekelijkse vastendag. In de hymnografie klinkt ook de voorbede van de allerheiligste Moeder Gods."
        ],
        "note": "Verraad · Kruis · berouw · vasten · Moeder Gods"
      },
      {
        "heading": "Donderdag — de heilige apostelen en de heilige Nicolaas",
        "paragraphs": [
          "Donderdag is gewijd aan de heilige apostelen, die door Christus werden uitgezonden om het Evangelie aan de wereld te verkondigen. Ook de heilige Nicolaas, aartsbisschop van Myra, wordt op deze dag bijzonder herdacht. Zo krijgt de dag een apostolisch en herderlijk karakter: verkondiging, dienstbaarheid en zorg voor de Kerk."
        ],
        "note": "Apostelen · Evangelie · Kerk · herderschap · heilige Nicolaas"
      },
      {
        "heading": "Vrijdag — de Kruisiging van onze Heer",
        "paragraphs": [
          "Vrijdag staat geheel in het teken van het heilige en levenschenkende Kruis en het lijden en sterven van onze Heer Jezus Christus. De Kerk staat bij Golgotha en gedenkt het vrijwillige offer van Christus voor het leven en de verlossing van de wereld. Daarom is vrijdag, behoudens liturgische uitzonderingen, eveneens een wekelijkse vastendag."
        ],
        "note": "Kruisiging · Golgotha · offer · berouw · vasten"
      },
      {
        "heading": "Zaterdag — de heiligen en de ontslapenen",
        "paragraphs": [
          "De zaterdag draagt het karakter van rust en verwachting. De Kerk gedenkt de heiligen, in het bijzonder de martelaren, en allen die in de hoop op de verrijzenis in de Heer zijn ontslapen. Zoals Christus op de sabbat lichamelijk in het graf rustte, zo ziet de Kerk de dood in het licht van de komende Verrijzenis. Met de Vespers van zaterdagavond opent zich opnieuw de zondag."
        ],
        "note": "Heiligen · martelaren · ontslapenen · rust · verwachting · verrijzenis"
      }
    ]
  },
  "betekenis": {
    "title": "De geestelijke betekenis",
    "subtitle": "De acht tonen van de Octoechos",
    "highlight": "Toon 1  →  2  →  3  →  4  →  5  →  6  →  7  →  8  →  Toon 1",
    "paragraphs": [],
    "sections": [
      {
        "paragraphs": [
          "Door deze zevendaagse cyclus heen klinkt tevens de cyclus van de acht tonen (echoi). Achtereenvolgens worden toon 1 tot en met toon 8 gebruikt, waarna de reeks opnieuw begint. De Octoechos bevat hymnografie voor de Verrijzenis op zondag en voor de vaste gedachtenissen van de overige weekdagen. Daardoor keert het thema van een dag terug, maar telkens binnen de eigen hymnografische kleur van de toon van die week."
        ]
      },
      {
        "heading": "De week als weg naar de Verrijzenis",
        "paragraphs": [
          "De orthodoxe week is geen loutere opeenvolging van dagen. Zij begint in de vreugde van de Verrijzenis, voert de gelovige langs de hemelse machten, de Voorloper, het Kruis, de apostolische verkondiging en de gedachtenis van hen die in Christus ontslapen zijn, en opent zich vervolgens opnieuw naar de Dag des Heren. Zo wordt de tijd zelf opgenomen in het gebed van de Kerk."
        ]
      }
    ]
  },
  "praktisch": {
    "title": "Praktisch",
    "subtitle": "Vasten en het ritme van de week",
    "paragraphs": [],
    "sections": [
      {
        "heading": "Wekelijkse vastendagen",
        "paragraphs": [
          "Woensdag — Daarom draagt deze dag een boetvaardig karakter en is woensdag, buiten de vastenvrije perioden en bijzondere liturgische uitzonderingen, een wekelijkse vastendag.",
          "Vrijdag — Daarom is vrijdag, behoudens liturgische uitzonderingen, eveneens een wekelijkse vastendag."
        ]
      },
      {
        "heading": "De week begint op zaterdagavond",
        "paragraphs": [
          "Iedere zondag draagt daarom het karakter van een klein Pascha.",
          "Liturgisch vangt de zondag reeds aan op zaterdagavond met de Vespers.",
          "Met de Vespers van zaterdagavond opent zich opnieuw de zondag."
        ]
      }
    ]
  }
};

export const JAAR_INFO: Record<'wat' | 'jaarcyclus' | 'betekenis' | 'praktisch', PopupInhoud> = {
  "wat": {
    "title": "Wat is het kerkelijk jaar?",
    "subtitle": "De heiliging van de tijd",
    "paragraphs": [],
    "sections": [
      {
        "paragraphs": [
          "De Orthodoxe Kerk ontvangt de tijd niet als een lege opeenvolging van dagen, maar als tijd die aan God kan worden toegewijd. Het kerkelijk jaar begint op 1 september, de dag van de Indictie. Door het jaar heen gedenkt de Kerk het heilswerk van Christus, eert zij de allerheiligste Moeder Gods en viert zij de gedachtenis van de heiligen. Iedere kalenderdag krijgt zo een plaats binnen het gebed van de Kerk."
        ]
      },
      {
        "heading": "Twee jaarlijkse bewegingen",
        "paragraphs": [
          "Het liturgische jaar bestaat uit twee nauw verweven bewegingen. De vaste jaarcyclus volgt kalenderdata die ieder jaar terugkeren. Daarnaast staat de beweeglijke Paschale cyclus, waarvan de data verschuiven met de datum van het heilige Pascha. Op iedere concrete dag kunnen beide cycli elkaar ontmoeten."
        ],
        "table": {
          "head": [
            "Cyclus",
            "Inhoud"
          ],
          "rows": [
            [
              "Vaste jaarcyclus",
              "Vaste feesten, heiligen en gedachtenissen op kalenderdata; liturgisch vooral gedragen door het Menaion."
            ],
            [
              "Paschale cyclus",
              "Beweeglijke feesten en perioden rond Pascha; onder meer Triodion en Pentecostarion."
            ]
          ]
        }
      }
    ]
  },
  "jaarcyclus": {
    "title": "De jaarcyclus",
    "subtitle": "Het Menaion en de Twaalf Grote Feesten",
    "paragraphs": [],
    "sections": [
      {
        "heading": "Het Menaion — de vaste kalender van de Kerk",
        "paragraphs": [
          "Voor iedere maand bestaat een Menaion met de eigen teksten voor de vaste feesten en heiligen van die maand. Zo wordt geen dag slechts een nummer op de kalender: zij kan de gedachtenis dragen van martelaren, hiërarchen, monniken, rechtvaardigen en andere heiligen, of van een heilsgebeurtenis die de Kerk jaarlijks viert. Lokale Orthodoxe Kerken kunnen daarbij bepaalde heiligen met bijzondere plechtigheid gedenken."
        ]
      },
      {
        "heading": "De grote feesten",
        "paragraphs": [
          "Een bijzondere plaats binnen het kerkelijk jaar wordt ingenomen door de Twaalf Grote Feesten. Sommige behoren tot de vaste kalender, terwijl Palmzondag, Hemelvaart en Pinksteren door Pascha worden bepaald. Het heilige Pascha zelf staat boven deze twaalf als het Feest der feesten."
        ],
        "items": [
          "8 september — Geboorte van de Moeder Gods",
          "14 september — Verheffing van het kostbare en levenschenkende Kruis",
          "21 november — Intocht van de Moeder Gods in de Tempel",
          "25 december — Geboorte van onze Heer Jezus Christus",
          "6 januari — Theofanie: de Doop van de Heer",
          "2 februari — Ontmoeting van de Heer in de Tempel",
          "25 maart — Verkondiging aan de Moeder Gods",
          "Palmzondag — Intocht van de Heer in Jeruzalem (beweeglijk)",
          "Hemelvaart van de Heer — beweeglijk",
          "Pinksteren — neerdaling van de Heilige Geest (beweeglijk)",
          "6 augustus — Gedaanteverandering van de Heer",
          "15 augustus — Ontslapenis van de Moeder Gods"
        ]
      },
      {
        "heading": "Voorfeest, feest en nafeest",
        "paragraphs": [
          "De Kerk beleeft een groot feest vaak niet als één geïsoleerde dag. Belangrijke feesten kunnen liturgisch worden voorbereid door een voorfeest en vervolgens nog enige tijd worden voortgezet in een nafeest. Daardoor krijgt de gelovige tijd om het gevierde mysterie te ontvangen, te bezingen en opnieuw te overwegen."
        ]
      }
    ]
  },
  "betekenis": {
    "title": "De betekenis in ons leven",
    "subtitle": "De tijd als gave aan God",
    "paragraphs": [],
    "sections": [
      {
        "paragraphs": [
          "Zo leert het kerkelijk jaar de gelovige niet slechts welke datum het is, maar in welk heilig mysterie de Kerk op die dag leeft. De tijd wordt een weg van gedachtenis: van feest naar vasten, van heilige naar heilige, en steeds opnieuw naar Christus, Wiens Verrijzenis het middelpunt en de vervulling van het gehele liturgische jaar is."
        ]
      }
    ]
  },
  "praktisch": {
    "title": "Praktisch",
    "subtitle": "Vasten, heiligen en de kalender",
    "paragraphs": [],
    "sections": [
      {
        "heading": "De vasten binnen het kerkelijk jaar",
        "paragraphs": [
          "Ook het vasten ordent het jaar. De Orthodoxe Kerk kent vier grote vastenperioden: de Grote Vasten, de Apostelvasten, de vasten vóór de Geboorte van Christus en de vasten vóór de Ontslapenis van de Moeder Gods. Niet al deze perioden behoren uitsluitend tot de vaste jaarcyclus: de Grote Vasten en het begin van de Apostelvasten zijn afhankelijk van de Paschale cyclus. Daarnaast kent de Kerk vaste vastendagen en gewoonlijk de wekelijkse vasten op woensdag en vrijdag, met liturgische uitzonderingen en plaatselijke verschillen."
        ]
      },
      {
        "heading": "De heiligenkalender",
        "paragraphs": [
          "Door het gehele jaar heen gedenkt de Kerk haar heiligen. Hun feesten staan niet los van Christus: in de heiligen aanschouwt de Kerk de vrucht van Zijn genade in concrete menselijke levens. De universele kalender wordt bovendien aangevuld door de levende gedachtenis van plaatselijke Kerken. Zo kunnen ook heiligen die voor de Lage Landen van bijzondere betekenis zijn een eigen plaats in de kalender en het gebed van de lokale Kerk innemen."
        ]
      },
      {
        "heading": "Het kerkelijk jaar volgens de Oude Kalender",
        "paragraphs": [
          "Wanneer een parochie of kalender de Juliaanse of Oude Kalender volgt, blijven de kerkelijke feestdata in de liturgische boeken dezelfde traditionele data, maar vallen zij op een andere burgerlijke datum dan in kerken die de herziene of burgerlijke kalender gebruiken. Voor een digitale kalender is het daarom belangrijk steeds onderscheid te maken tussen de kerkelijke datum en de burgerlijke datum waarop die viering tegenwoordig valt."
        ]
      }
    ]
  }
};

export const PASCHA_INFO: Record<'wat' | 'cyclus' | 'betekenis' | 'tradities', PopupInhoud> = {
  "wat": {
    "title": "Wat is Pascha?",
    "subtitle": "Het Feest der Feesten",
    "highlight": "Christus is opgestaan uit de doden, door Zijn dood heeft Hij de dood vertreden, en aan hen in de graven heeft Hij het leven geschonken.",
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
        "heading": "Pascha en de Paschale cyclus",
        "paragraphs": [
          "Daarom is Pascha niet eenvoudig één feest tussen andere feesten. In de orthodoxe eredienst is de Verrijzenis van Christus het centrum waarnaar de voorbereiding wijst en vanwaar de vreugde van de daaropvolgende periode uitgaat."
        ]
      },
      {
        "heading": "Waarom valt Pascha ieder jaar anders?",
        "paragraphs": [
          "Pascha behoort tot de beweeglijke feesten. De kerkelijke berekening van de Paschadatum — het Paschalion — verbindt de viering met de zondag en met de traditionele kerkelijke berekening rond de lente en de maan. Daardoor valt Orthodox Pascha niet ieder jaar op dezelfde burgerlijke datum."
        ]
      }
    ]
  },
  "cyclus": {
    "title": "De Paschale cyclus",
    "subtitle": "Van voorbereiding, door Kruis en graf, naar Verrijzenis en Pinksteren",
    "paragraphs": [],
    "sections": [
      {
        "heading": "Wat is de Paschale cyclus?",
        "paragraphs": [
          "De Paschale cyclus is het beweeglijke deel van het orthodoxe kerkelijk jaar dat zijn ordening ontvangt vanuit de datum van het heilige Pascha, de Verrijzenis van Christus. Omdat de datum van Pascha van jaar tot jaar verschuift, bewegen ook de perioden en gedachtenissen die ermee verbonden zijn mee.",
          "De cyclus omvat niet alleen de Paasnacht zelf. Zij begint reeds in de voorbereiding op de Grote Vasten, voert door de veertigdagentijd en de Grote en Heilige Week, bereikt haar hoogtepunt in Pascha en gaat daarna verder door de veertig dagen tot Hemelvaart en de vijftig dagen tot Pinksteren. De eerste zondag na Pinksteren, Allerheiligen, vormt een belangrijke overgang naar het verdere kerkelijke jaar."
        ]
      },
      {
        "heading": "De voorbereiding op de Grote Vasten",
        "paragraphs": [
          "De Kerk gaat niet plotseling de Grote Vasten binnen. De Triodion-periode opent een geleidelijke geestelijke voorbereiding waarin de gelovige wordt geroepen tot verlangen naar Christus, nederigheid, bekering, barmhartigheid en vergeving."
        ],
        "items": [
          "Zondag van Zacheüs — het verlangen om Christus te zien.",
          "Zondag van de Tollenaar en de Farizeeër — nederigheid in het gebed en het afwijzen van geestelijke hoogmoed.",
          "Zondag van de Verloren Zoon — terugkeer naar de Vader en vertrouwen op Zijn barmhartigheid.",
          "Zondag van het Laatste Oordeel / Vleesverlatingszondag — liefde tot de naaste en verantwoordelijkheid voor ons leven.",
          "Vergevingszondag / Kaasverlatingszondag — wederzijdse vergeving en de daadwerkelijke ingang in de Grote Vasten."
        ],
        "after": [
          "Aan de vooravond van de Grote Vasten vraagt de Kerk de gelovigen elkaar om vergeving. Zo begint de vasten niet alleen met een verandering van voedsel, maar met verzoening, bekering en een vernieuwde gerichtheid op God."
        ]
      },
      {
        "heading": "De Grote Vasten",
        "paragraphs": [
          "De Grote Vasten is de veertigdaagse voorbereiding op de viering van de Verrijzenis. Gebed, vasten en aalmoezen vormen samen een weg van bekering. De vasten is niet bedoeld als somberheid omwille van zichzelf, maar als reiniging en terugkeer: het hart wordt opnieuw gericht op de liefde tot God en de naaste."
        ]
      },
      {
        "heading": "De zondagen van de Grote Vasten",
        "items": [
          "Eerste zondag — Zondag van de Orthodoxie: de overwinning van het orthodoxe geloof en de herstelling van de heilige iconen.",
          "Tweede zondag — Heilige Gregorius Palamas: het leven in Gods genade en het gebed van het hart.",
          "Derde zondag — Verering van het kostbare en levenschenkende Kruis: midden in de vasten wordt het Kruis tot versterking en hoop opgericht.",
          "Vierde zondag — Heilige Johannes Climacus: de geestelijke opgang en de strijd tegen de hartstochten.",
          "Vijfde zondag — Heilige Maria van Egypte: radicale bekering en de vernieuwende kracht van Gods genade."
        ],
        "after": [
          "In de vastentijd krijgen de diensten een uitgesproken boete- en gebedskarakter. De Kerk kent onder meer de Liturgie van de Voorafgewijde Gaven, het gebed van de heilige Efrem de Syriër en de Grote Canon van de heilige Andreas van Kreta."
        ]
      },
      {
        "heading": "Lazaruszaterdag en Palmzondag",
        "paragraphs": [
          "Na de veertig dagen van de Grote Vasten voert de Kerk ons naar Lazaruszaterdag. De opwekking van Lazarus verkondigt reeds Christus’ overwinning op de dood. De volgende dag vieren wij Palmzondag, de intocht van de Heer in Jeruzalem.",
          "Deze twee dagen vormen de overgang van de vastentijd naar de Grote en Heilige Week. De aandacht verschuift nu volledig naar de laatste dagen van Christus’ aardse leven, Zijn vrijwillig lijden, dood en graflegging."
        ]
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
      },
      {
        "heading": "De periode na Pascha",
        "paragraphs": [
          "De paasvreugde wordt gedurende veertig dagen gevierd. De zondagen na Pascha belichten telkens een eigen aspect van de ontmoeting met de verrezen Christus en van het nieuwe leven dat uit Zijn Verrijzenis voortkomt."
        ],
        "items": [
          "Thomaszondag — de apostel Thomas ontmoet de verrezen Heer en belijdt Hem als Heer en God.",
          "Zondag van de Myrrhedraagsters — de vrouwen die in trouw naar het graf gingen worden getuigen van de Verrijzenis.",
          "Zondag van de Verlamde — Christus schenkt genezing en nieuw leven.",
          "Midden-Pinksteren — midden tussen Pascha en Pinksteren wordt Christus verkondigd als de bron van levend water.",
          "Zondag van de Samaritaanse vrouw — de ontmoeting met Christus als het levende water.",
          "Zondag van de Blindgeborene — Christus als het Licht van de wereld.",
          "Afscheid van Pascha — de voltooiing van de veertigdaagse paasviering."
        ]
      },
      {
        "heading": "Hemelvaart",
        "paragraphs": [
          "Veertig dagen na Pascha viert de Kerk de Hemelvaart van Christus. De verrezen Heer stijgt op in heerlijkheid. De Hemelvaart is geen afwezigheid van Christus, maar de verheerlijking van de menselijke natuur in Hem en de voorbereiding op de gave van de Heilige Geest."
        ]
      },
      {
        "heading": "Pinksteren",
        "paragraphs": [
          "Vijftig dagen na Pascha viert de Kerk het heilige Pinksteren: de nederdaling van de Heilige Geest over de apostelen. Pinksteren is de vervulling van de Paschale beweging. De Verrijzenis opent het nieuwe leven; de Geest schenkt dit leven aan de Kerk en zendt haar uit in de wereld.",
          "De maandag na Pinksteren is in de orthodoxe traditie bijzonder gewijd aan de Heilige Geest."
        ]
      },
      {
        "heading": "Allerheiligen en de overgang",
        "paragraphs": [
          "De eerste zondag na Pinksteren is de Zondag van Allerheiligen. Zij laat zien wat de gave van de Heilige Geest in mensen voortbrengt: heiligheid. De heiligen zijn de vruchten van Pascha en Pinksteren in het leven van de Kerk.",
          "Na Allerheiligen begint de Apostelvasten. De begindatum daarvan beweegt mee met Pascha, terwijl het einde aan een vaste kalenderdatum verbonden is. Dit laat mooi zien hoe de Paschale en de vaste jaarcyclus elkaar in het orthodoxe kerkelijk jaar ontmoeten."
        ]
      },
      {
        "heading": "Wat wordt door de Paschadatum bepaald?",
        "paragraphs": [
          "Vanuit Pascha worden veel beweeglijke onderdelen van het kerkelijk jaar geordend. De Paschadatum bepaalt onder meer de plaats van de voorbereidende zondagen, het begin van de Grote Vasten, Lazaruszaterdag, Palmzondag, de Grote en Heilige Week, de Lichte Week, Hemelvaart en Pinksteren.",
          "Ook de Apostelvasten wordt hierdoor beïnvloed: het begin hangt samen met Pinksteren en Allerheiligen, terwijl het einde aan de vaste gedachtenis van de heilige apostelen Petrus en Paulus verbonden is.",
          "Daarnaast is de Paschale cyclus nauw verbonden met het liturgische leesrooster en met de boeken Triodion en Pentecostarion. Zo werkt de datum van Pascha door in veel meer dan alleen de datum van het Paasfeest."
        ]
      },
      {
        "heading": "Het Triodion",
        "paragraphs": [
          "Het Triodion begeleidt de Kerk door de voorbereidende weken, de Grote Vasten en de Grote en Heilige Week. De teksten vormen het hart door bekering, vasten, gebed en de beschouwing van het lijden van Christus."
        ]
      },
      {
        "heading": "Het Pentecostarion",
        "paragraphs": [
          "Met Pascha begint het Pentecostarion. Dit liturgische boek begeleidt de periode van de Verrijzenis tot en met Pinksteren en de daaropvolgende overgang. Waar het Triodion ons naar het lege graf voert, ontvouwt het Pentecostarion de vreugde en de vruchten van de Verrijzenis."
        ]
      }
    ]
  },
  "betekenis": {
    "title": "De betekenis in ons leven",
    "subtitle": "De geestelijke beweging van de Paschale cyclus",
    "paragraphs": [],
    "sections": [
      {
        "paragraphs": [
          "De Paschale cyclus kan worden gezien als één geestelijke beweging:"
        ],
        "items": [
          "verlangen — Christus willen zien;",
          "nederigheid — de eigen afhankelijkheid van Gods barmhartigheid erkennen;",
          "bekering — terugkeren naar de Vader;",
          "vergeving — vrede zoeken met God en de naaste;",
          "vasten en gebed — het hart zuiveren en opnieuw richten;",
          "het Kruis — met Christus de weg van zelfgave en liefde gaan;",
          "het graf — stilte, verwachting en vertrouwen;",
          "Verrijzenis — het nieuwe leven ontvangen;",
          "Hemelvaart — de verheerlijking van Christus aanschouwen;",
          "Pinksteren — leven en getuigen in de kracht van de Heilige Geest;",
          "heiligheid — de vrucht van dit nieuwe leven zichtbaar laten worden."
        ],
        "after": [
          "Zo is Pascha niet slechts het eindpunt van de vasten. De hele cyclus vormt een weg waarop de Kerk telkens opnieuw leert sterven aan wat van God verwijdert en leven vanuit de Verrijzenis van Christus."
        ]
      }
    ]
  },
  "tradities": {
    "title": "Tradities en viering",
    "subtitle": "Pascha thuis en in het dagelijks gebedsleven",
    "paragraphs": [],
    "sections": [
      {
        "paragraphs": [
          "De Paschale cyclus wordt allereerst in de liturgie van de Kerk beleefd, maar kan ook het dagelijkse gebedsleven thuis vormen. Niet door de volledige liturgische diensten zelfstandig na te bootsen, maar door het ritme van de Kerk bewust mee te leven."
        ],
        "items": [
          "Volg de zondagen en belangrijke dagen van de Paschale cyclus.",
          "Lees de aangewezen Schriftlezingen en korte uitleg bij de dag.",
          "Laat het vasten samengaan met gebed, vergeving en concrete liefde tot de naaste.",
          "Neem waar mogelijk deel aan de diensten van de Grote Vasten, de Grote Week en Pascha.",
          "Gebruik de paasgroet en paasgezangen in de periode waarin de Kerk de Verrijzenis viert.",
          "Laat de vreugde van Pascha doorwerken naar Hemelvaart, Pinksteren en het gewone leven daarna."
        ],
        "after": [
          "Het doel is niet om zoveel mogelijk kalenderinformatie te kennen, maar om de tijd zelf als een weg met Christus te ontvangen."
        ]
      }
    ]
  }
};

