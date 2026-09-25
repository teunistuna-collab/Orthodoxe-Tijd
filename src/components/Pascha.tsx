import { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';

import { useApp } from '../lib/context';
import { PAASCYCLUS } from '../lib/feesten';
import { addDays, formatDatum, formatKort, volgendePascha, ymd } from '../lib/kalender';
import { FeestTag } from './ui';
import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { PASCHA_INFO, type PopupInhoud } from '../lib/cyclusTeksten';
import { ringVak } from '../lib/ringVak';
import PageHero from './PageHero';

type InfoKey = 'wat' | 'cyclus' | 'betekenis' | 'tradities';
type PeriodeKey = 'voorbereiding' | 'grote-vasten' | 'goede-week' | 'pascha' | 'vijftig-dagen' | 'hemelvaart' | 'pinksteren';

// Inhoud rechtstreeks gebaseerd op "De orthodoxe Paschale cyclus.docx".

const INFO_CARDS: Array<{ key: InfoKey; title: string; intro: string; iconSrc: string }> = [
  { key: 'wat', title: 'Wat is Pascha?', intro: 'De Verrijzenis van Christus als het hart van het kerkelijk jaar en van ons leven.', iconSrc: '/images/ui/menu/06-Pascha-01-Wat-is-Pascha.webp' },
  { key: 'cyclus', title: 'De Paschale cyclus', intro: 'Van de voorbereidende vasten tot Pinksteren: één beweging van dood naar nieuw leven.', iconSrc: '/images/ui/menu/06-Pascha-02-De-paschale-cyclus.webp' },
  { key: 'betekenis', title: 'De betekenis in ons leven', intro: 'Pascha vernieuwt de tijd, onze blik en ons bestaan.', iconSrc: '/images/ui/menu/06-Pascha-04-Gebeden.webp' },
  { key: 'tradities', title: 'Tradities en viering', intro: 'De rijke schoonheid van de Paasdiensten en de Orthodoxe tradities.', iconSrc: '/images/ui/menu/06-Pascha-03-Tradities-en-vieringen.webp' },
];

// De acht stappen van de Paschale cyclus voor het cirkeldiagram. De tekst van iedere stap komt letterlijk uit
// dezelfde "De Paschale cyclus.docx" als de knop "De Paschale cyclus" hierboven (en voor Pascha zelf uit "Wat is Pascha?").
const PERIODE_POPUPS: Record<PeriodeKey, PopupInhoud> = {
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
          "Eerste zondag — Zondag van de Orthodoxie: de overwinning van het orthodoxe geloof en de herstelling van de heilige iconen.",
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
          "De maandag na Pinksteren is in de orthodoxe traditie bijzonder gewijd aan de Heilige Geest."
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
          "Na Allerheiligen begint de Apostelvasten. De begindatum daarvan beweegt mee met Pascha, terwijl het einde aan een vaste kalenderdatum verbonden is. Dit laat mooi zien hoe de Paschale en de vaste jaarcyclus elkaar in het orthodoxe kerkelijk jaar ontmoeten."
        ],
        "items": [
          "Zondag van Alle Heiligen — slot van het Pentecostarion: de vrucht van de Geest zijn alle heiligen. Daarna begint de Apostelvasten.",
          "Zondag van alle heiligen van het eigen land — tweede zondag na Pinksteren: alle heiligen van Rusland, van de Athos, van de Lage Landen — elk land eert zijn eigen heiligen."
        ]
      }
    ]
  }
};

// offsetRange = [eerste, laatste] dag t.o.v. Pascha die tot deze periode hoort (zie PAASCYCLUS in lib/feesten.ts).
const PERIODEN: Array<{ key: PeriodeKey; label: string; short: string; iconSrc: string; offsetRange: [number, number] }> = [
  { key: 'voorbereiding', label: 'Voorbereiding', short: 'Zondagen voor de Vasten', iconSrc: '/images/ui/menu/07-Vasten-01-Wat-is-vasten.webp', offsetRange: [-70, -49] },
  { key: 'grote-vasten', label: 'Grote Vasten', short: 'Een weg van bekering', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-05-Vastentijd.webp', offsetRange: [-48, -14] },
  { key: 'goede-week', label: 'Goede Week', short: 'Lijden en liefde', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-06-Passietijd.webp', offsetRange: [-8, -1] },
  { key: 'pascha', label: 'Pascha', short: 'De Verrijzenis van Christus', iconSrc: '/images/ui/menu/06-Pascha-01-Wat-is-Pascha.webp', offsetRange: [0, 6] },
  { key: 'vijftig-dagen', label: 'De Vijftig Dagen', short: 'Leven in het licht', iconSrc: '/images/ui/menu/01-Hoofdmenu-03-Paschale-cyclus.webp', offsetRange: [7, 38] },
  { key: 'hemelvaart', label: 'Hemelvaart', short: 'Christus verheerlijkt', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-07-Paschatijd.webp', offsetRange: [39, 48] },
  { key: 'pinksteren', label: 'Pinksteren en de heiligen', short: 'Pinksteren en Allerheiligen', iconSrc: '/images/ui/menu/05-Kerkelijk-jaar-08-Pinkstertijd.webp', offsetRange: [49, 63] },
];

// Concrete data van dit jaar, per periode — dezelfde gedachtenissen als in de knop "De Paschale cyclus" en de
// uitklapbare Paascyclus-lijst hieronder. Alleen de losse jaartallen (bijv. bij "Zielenzaterdag") worden elk jaar herberekend.

/** "15 mrt – 18 apr", of "2 – 8 mei" wanneer begin en eind in dezelfde maand vallen. */
function formatBereik(a: Date, b: Date): string {
  const begin = a.getUTCMonth() === b.getUTCMonth() ? String(a.getUTCDate()) : formatKort(a);
  return `${begin} – ${formatKort(b)}`;
}

const TIMELINE_ITEMS = [
  { id: 'adem', label: 'ADEM', title: 'Christus in iedere\nademhaling', href: '#adem' },
  { id: 'etmaal', label: 'ETMAAL', title: 'Gebed door\ndag en nacht', href: '#etmaal' },
  { id: 'week', label: 'WEEK', title: 'Iedere dag\nzijn gedachtenis', href: '#week' },
  { id: 'pascha', label: 'PASCHA', title: 'De weg van Kruis\nnaar Verrijzenis', href: '#pascha' },
  { id: 'jaar', label: 'JAAR', title: 'Het gehele\nkerkelijke jaar geheiligd', href: '#jaar' },
];

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

// Zeer subtiel botanisch hoekornament ter decoratie van het perkamentpaneel.
function CornerOrnament({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 4 C 20 6, 30 16, 32 32" strokeLinecap="round" />
      <path d="M4 4 C 6 20, 16 30, 32 32" strokeLinecap="round" />
      <circle cx="32" cy="32" r="2.4" />
      <circle cx="14" cy="6" r="1.8" />
      <circle cx="6" cy="14" r="1.8" />
    </svg>
  );
}

const ring = ringVak(12);

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function Pascha() {
  const { vandaag, openDag } = useApp();
  const [periodeOpen, setPeriodeOpen] = useState<PeriodeKey | null>(null);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [cyclusOpen, setCyclusOpen] = useState(false);

  // Vandaag kan een pop-up van deze pagina openen.
  useEffect(() => {
    const opPopup = (event: Event) => {
      const { pagina, sleutel } = (event as CustomEvent<OpenPopupDetail>).detail;
      if (pagina === 'pascha') setInfoOpen(sleutel as InfoKey);
    };
    window.addEventListener(OPEN_POPUP_EVENT, opPopup);
    return () => window.removeEventListener(OPEN_POPUP_EVENT, opPopup);
  }, []);

  const pascha = volgendePascha(vandaag);
  const paaschaJaar = pascha.getUTCFullYear();

  // Geeft iedere periode-pop-up de datums van dit jaar mee als eyebrow naast de titel
  // (dezelfde informatie als in de knop "De Paschale cyclus" hierboven, maar dan bij de titelbalk).
  const periodeInhoud = useMemo(() => {
    const out = {} as Record<PeriodeKey, PopupInhoud>;
    for (const periode of PERIODEN) {
      const [start, eind] = periode.offsetRange;
      const datumTekst = formatBereik(addDays(pascha, start), addDays(pascha, eind));
      out[periode.key] = { ...PERIODE_POPUPS[periode.key], eyebrow: datumTekst };
    }
    return out;
  }, [pascha]);

  return (
    <>
      <PageHero id="pascha" alt="Pascha — de Verrijzenis van Christus" />

      {/* Informatiekaarten */}
      <section className="orthodox-pattern parchment-pattern bg-parchment py-16 text-ink sm:py-20">
        <div className={CONTENT}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INFO_CARDS.map(({ key, title, intro, iconSrc }) => (
              <button
                key={key}
                type="button"
                onClick={() => setInfoOpen(key)}
                className="ornate-card group flex min-h-[240px] flex-col px-7 py-8 text-left"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold-light">
                  <img loading="lazy" decoding="async" src={iconSrc} alt="" className="provided-card-icon" />
                </div>
                <h3 className="font-display mt-6 text-[20px] font-semibold text-gold-light uppercase">{title}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#d9c6a3] sm:text-base">{intro}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* De Paschale cyclus */}
      <section className="bg-parchment pb-16 sm:pb-20">
        <div className={CONTENT}>
          <div className="parchment-pattern relative overflow-hidden rounded-2xl border border-gold/40 bg-[#f8f1e3] px-6 py-14 shadow-[0_30px_70px_rgba(40,22,14,0.16)] sm:px-10 lg:px-16">
            <CornerOrnament className="absolute top-6 left-6 h-14 w-14 text-gold-deep/30" />
            <CornerOrnament className="absolute top-6 right-6 h-14 w-14 -scale-x-100 text-gold-deep/30" />
            <CornerOrnament className="absolute bottom-6 left-6 h-14 w-14 -scale-y-100 text-gold-deep/30" />
            <CornerOrnament className="absolute right-6 bottom-6 h-14 w-14 -scale-x-100 -scale-y-100 text-gold-deep/30" />

            <div className="text-center">
              <h2 className="ot-sectietitel">De Paschale cyclus</h2>
              <p className="ot-label mt-2">Een liturgische reis van dood naar leven</p>
            </div>

            {/* Desktop: cirkeldiagram */}
            <div className="relative mx-auto mt-12 hidden aspect-square w-full max-w-[820px] lg:block" style={ring.stijl}>
              <svg viewBox={ring.viewBox} className="absolute inset-0 h-full w-full">
                <circle cx="50" cy="50" r="30" fill="none" stroke="#c9a227" strokeWidth="0.35" opacity="0.75" />
                {PERIODEN.map((periode, index) => {
                  const angle = (360 / PERIODEN.length) * index;
                  const c = polar(50, 50, 15, angle);
                  const p = polar(50, 50, 30, angle);
                  return (
                    <line
                      key={`spoke-${periode.key}`}
                      x1={c.x}
                      y1={c.y}
                      x2={p.x}
                      y2={p.y}
                      stroke="#c9a227"
                      strokeWidth="0.25"
                      opacity={hovered === index ? 0.65 : 0.3}
                    />
                  );
                })}
              </svg>

              <div className="absolute top-1/2 left-1/2 flex h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-2 border-gold/60 shadow-[0_14px_36px_rgba(120,80,30,0.22)]">
                <img loading="lazy" decoding="async" src="/images/Christus-afbeelding.webp" alt="Christus" className="h-full w-full object-cover" />
              </div>

              {PERIODEN.map((periode, index) => {
                const angle = (360 / PERIODEN.length) * index;
                const pos = polar(50, 50, 30, angle);
                const isActive = hovered === index;
                const leftSide = pos.x < 50;

                return (
                  <button
                    key={periode.key}
                    type="button"
                    onClick={() => setPeriodeOpen(periode.key)}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ left: `${pos.x}%`, top: ring.top(pos.y) }}
                    className={`etmaal-ring-node absolute ${leftSide ? 'is-left' : 'is-right'}`}
                  >
                    <span className="etmaal-ring-badge">
                      <span
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 bg-[#1c130d] text-gold-light transition-all ${
                          isActive ? 'scale-110 border-gold shadow-[0_0_0_5px_rgba(201,162,39,0.22),0_0_20px_rgba(201,162,39,0.35)]' : 'border-gold/50'
                        }`}
                      >
                        <img loading="lazy" decoding="async" src={periode.iconSrc} alt="" className="provided-cycle-icon" />
                      </span>
                    </span>
                    <span className="etmaal-ring-text">
                      <span className="dienst-kaart">
                        <span className="dienst-kaart-titel font-display">{periode.label}</span>
                        <span className="dienst-kaart-tekst">{periode.short}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tablet/mobiel: verticale tijdlijn */}
            <div className="mt-10 space-y-3 lg:hidden">
              {PERIODEN.map((periode) => (
                <button
                  key={`${periode.key}-mobile`}
                  type="button"
                  onClick={() => setPeriodeOpen(periode.key)}
                  className="dienst-kaart dienst-kaart-rij group flex w-full items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  <span className="dienst-kaart-medaillon flex shrink-0 items-center justify-center">
                    <img loading="lazy" decoding="async" src={periode.iconSrc} alt="" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="dienst-kaart-titel font-display block">{periode.label}</span>
                    <span className="dienst-kaart-tekst block">{periode.short}</span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gold-deep" />
                </button>
              ))}
            </div>

            {/* De huidige Paascyclus, dag voor dag — ingeklapt onder een uitklapper */}
            <div className="mx-auto mt-10 max-w-2xl border-t border-gold/25 pt-8">
              <button
                type="button"
                onClick={() => setCyclusOpen((open) => !open)}
                aria-expanded={cyclusOpen}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-gold/40 bg-[#f8f1e3] px-5 py-4 text-left shadow-[0_10px_24px_rgba(55,31,15,0.08)] transition hover:bg-gold-pale/40"
              >
                <span>
                  <span className="font-display block text-xl font-semibold text-ink sm:text-2xl">Paascyclus {paaschaJaar}</span>
                  <span className="text-xs text-ink-mute">Pascha {formatDatum(pascha)} · alles wat van de Paasdatum afhangt, in volgorde</span>
                </span>
                <ChevronRight className={`h-5 w-5 shrink-0 text-gold-deep transition-transform ${cyclusOpen ? 'rotate-90' : ''}`} />
              </button>
              {cyclusOpen && (
                <ol className="thin-scroll mt-4 max-h-[420px] space-y-1 overflow-y-auto rounded-xl border border-gold/30 bg-[#faf3e2] p-3 pr-2">
                  {PAASCYCLUS.map((f) => {
                    const d = addDays(pascha, f.offset ?? 0);
                    const isPascha = f.soort === 'pascha';
                    const voorbij = d.getTime() < vandaag.getTime();
                    return (
                      <li key={f.id}>
                        <button
                          type="button"
                          onClick={() => openDag(ymd(d))}
                          className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-gold-pale ${isPascha ? 'bg-wine text-gold-light hover:bg-wine' : ''} ${voorbij && !isPascha ? 'text-ink-mute' : ''}`}
                        >
                          <span className={`w-14 shrink-0 text-xs font-bold ${isPascha ? 'text-gold-light' : 'text-gold-deep'}`}>{formatKort(d)}</span>
                          <span className={`flex-1 text-sm ${isPascha || f.groot ? 'font-bold' : ''}`}>{f.kort ?? f.naam}</span>
                          {(f.groot || isPascha) && <FeestTag feest={f} />}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Meer dan een datum */}
      <CycleTransition
        quote="Christus is opgestaan uit de doden, door Zijn dood heeft Hij de dood vertreden, en aan hen in de graven heeft Hij het leven geschonken."
        citation="Uit de Paasvespers"
        eyebrow="Meer dan een datum"
        text="Pascha is niet eenvoudig één feest tussen andere feesten. In de orthodoxe eredienst is de Verrijzenis van Christus het centrum waarnaar de voorbereiding wijst en vanwaar de vreugde van de daaropvolgende periode uitgaat — het middelpunt van de gehele beweeglijke liturgische cyclus."
        buttonLabel="Ontdek de feesten"
        buttonHref="#feesten"
      />

      <TimeSanctificationTimeline current="pascha" />

      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? PASCHA_INFO[infoOpen] : null} />
      <LiturgicalPopup open={periodeOpen !== null} onClose={() => setPeriodeOpen(null)} content={periodeOpen ? periodeInhoud[periodeOpen] : null} />
    </>
  );
}
