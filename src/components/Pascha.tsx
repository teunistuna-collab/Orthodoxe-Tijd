import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { ChevronRight } from 'lucide-react';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';

import { useApp } from '../lib/context';
import { PAASCYCLUS, type Feest } from '../lib/feesten';
import { addDays, dagInfo, formatDag, formatDatum, formatKort, ymd, type DagInfo } from '../lib/kalender';
import { isPaascyclus, lezingSoort, vertaalRef, type HtcLezingRef } from '../lib/htc';
import { paascyclusVoor, STAPPEN, volgendeZondag, zondagVanDeWeek, type Paascyclus, type StapKey } from '../lib/paascyclus';
import { FeestTag } from './ui';
import { LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { PASCHA_INFO, type PopupInhoud } from '../lib/cyclusTeksten';
import Verdieping from './Verdieping';
import ExactPageFrame from './ExactPageFrame';
import NisKop from './NisKop';
import { BannerBeeld, Sierlijn } from './onderdelen';
import { usePaginaOpen } from '../lib/paginaOpen';
import './Vandaag.css';
import './ontwerp.css';

type InfoKey = 'wat' | 'cyclus' | 'betekenis' | 'tradities';
type PeriodeKey = 'voorbereiding' | 'grote-vasten' | 'goede-week' | 'pascha' | 'vijftig-dagen' | 'hemelvaart' | 'pinksteren';

// Inhoud rechtstreeks gebaseerd op "De orthodoxe Paschale cyclus.docx".

const INFO_CARDS: Array<{ key: InfoKey; title: string; intro: string }> = [
  { key: 'wat', title: 'Wat is Pascha?', intro: 'De Verrijzenis van Christus als het hart van het kerkelijk jaar en van ons leven.' },
  { key: 'cyclus', title: 'De Paascyclus', intro: 'Van de voorbereidende vasten tot Pinksteren: één beweging van dood naar nieuw leven.' },
  { key: 'betekenis', title: 'De betekenis in ons leven', intro: 'Pascha vernieuwt de tijd, onze blik en ons bestaan.' },
  { key: 'tradities', title: 'Tradities en viering', intro: 'De rijke schoonheid van de Paasdiensten en de Orthodoxe tradities.' },
];

// De acht stappen van de Paascyclus voor het cirkeldiagram. De tekst van iedere stap komt letterlijk uit
// dezelfde "De Paschale cyclus.docx" als de knop "De Paascyclus" hierboven (en voor Pascha zelf uit "Wat is Pascha?").
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

// De opbouw van de Paascyclus in zes stappen: STAPPEN in lib/paascyclus.ts. De popups gebruiken de bestaande teksten
// hierboven; "Hemelvaart en Pinksteren" voegt de twee bestaande teksten samen.
const STAP_INHOUD: Record<StapKey, PopupInhoud> = {
  voorbereiding: PERIODE_POPUPS.voorbereiding,
  'grote-vasten': PERIODE_POPUPS['grote-vasten'],
  'goede-week': PERIODE_POPUPS['goede-week'],
  pascha: PERIODE_POPUPS.pascha,
  'vijftig-dagen': PERIODE_POPUPS['vijftig-dagen'],
  'hemelvaart-pinksteren': { ...PERIODE_POPUPS.hemelvaart, sections: [...(PERIODE_POPUPS.hemelvaart.sections ?? []), ...(PERIODE_POPUPS.pinksteren.sections ?? [])] },
};

/** "15 mrt – 18 apr", of "2 – 8 mei" wanneer begin en eind in dezelfde maand vallen. */
function formatBereik(a: Date, b: Date): string {
  const begin = a.getUTCMonth() === b.getUTCMonth() ? String(a.getUTCDate()) : formatKort(a);
  return `${begin} – ${formatKort(b)}`;
}
/** "23 februari – 11 april", of "6 – 11 april". */
function bereikLang(a: Date, b: Date): string {
  return `${a.getUTCMonth() === b.getUTCMonth() ? a.getUTCDate() : formatDag(a)} – ${formatDag(b)}`;
}

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

// Desktop (vanaf 1024 px) krijgt een eigen, contextafhankelijke bovenkant; mobiel en tablet blijven zoals ze waren.
const DESKTOP = '(min-width: 1024px)';
const volgDesktop = (cb: () => void) => {
  const m = window.matchMedia(DESKTOP);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};
const isDesktop = () => window.matchMedia(DESKTOP).matches;
const dagen = (n: number) => `${n} ${n === 1 ? 'dag' : 'dagen'}`;
const feestMetId = (id: string) => PAASCYCLUS.find((f) => f.id === id);
/** De korte toelichting van een stap: de eerste alinea van de bestaande uitleg (bij Hemelvaart en Pinksteren van beide). */
const betekenis = (k: StapKey) => {
  const secties = STAP_INHOUD[k].sections ?? [];
  return (k === 'hemelvaart-pinksteren' ? secties.slice(0, 2) : secties.slice(0, 1)).map((x) => x.paragraphs?.[0]).filter((x): x is string => !!x);
};
type Rij = { label: string; titel: string; tekst?: string; open?: () => void; href?: string };

// Lijnsymbool en kleur per stap op de tijdlijn (public/images/ontwerp/pascha-*.svg, uit het overdrachtspakket): paars
// voor de voorbereiding en de Grote Vasten, rood voor de Heilige Week en Pascha, goud voor de Paastijd en Pinksteren.

export default function Pascha() {
  const { vandaag, vandaagYmd, mode, rooster, openDag, openLezing, openDagLezingen } = useApp();
  const desktop = useSyncExternalStore(volgDesktop, isDesktop);
  const [stapOpen, setStapOpen] = useState<StapKey | null>(null);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const [cyclusOpen, setCyclusOpen] = useState(false);
  const open = usePaginaOpen('pascha');

  // Vandaag kan een pop-up van deze pagina openen.
  useEffect(() => {
    const opPopup = (event: Event) => {
      const { pagina, sleutel } = (event as CustomEvent<OpenPopupDetail>).detail;
      if (pagina === 'pascha') setInfoOpen(sleutel as InfoKey);
    };
    window.addEventListener(OPEN_POPUP_EVENT, opPopup);
    return () => window.removeEventListener(OPEN_POPUP_EVENT, opPopup);
  }, []);

  // Desktop, tablet en mobiel: de lopende cyclus (tijdens de Paastijd nog die van dit jaar), de actuele stap en de stap die
  // de bezoeker bekijkt. Een handmatige keuze blijft staan bij een dagwisseling en bij het wisselen tussen desktop en
  // mobiel; bij een nieuwe cyclus geldt weer de actuele periode.
  const cyclus = useMemo(() => paascyclusVoor(vandaag), [vandaag]);
  const dag = useMemo(() => dagInfo(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);
  const cyclusId = ymd(cyclus.pascha);
  const [keuze, setKeuze] = useState<{ cyclus: string; stap: StapKey } | null>(null);
  const gekozen = keuze?.cyclus === cyclusId ? keuze.stap : null;
  const bekeken = gekozen ?? cyclus.huidige;
  const pascha = cyclus.pascha;

  // Iedere stap-pop-up krijgt de datums van de getoonde cyclus als eyebrow.
  const basis = pascha;
  const stapInhoud = {} as Record<StapKey, PopupInhoud>;
  for (const stap of STAPPEN) {
    const [start, eind] = stap.offsetRange;
    stapInhoud[stap.key] = { ...STAP_INHOUD[stap.key], title: stap.label, eyebrow: formatBereik(addDays(basis, start), addDays(basis, eind)) };
  }

  return (
    <>
      {/* Bovenkant volgens het overdrachtspakket (referentie kalender-pascha-feesten-vasten.png, paneel 2): de boog met
          uitzicht, de datum van het komende Pascha en de zes stappen van de Paascyclus als tijdlijn, met hun begin- en
          einddatum uit de bestaande berekening. Elke stap opent de bestaande uitleg. */}
      <section id="pascha" className="vg ot-redesign ot-pascha">
        <NisKop
          open={open}
          balk
          terug="#cycli"
          achter={
            <picture>
              {/* Mobiel: het lege graf bij zonsopgang; web: de bestaande Pascha-banner */}
              <source media="(max-width: 767.98px)" srcSet="/images/ontwerp/pascha-mobiel-banner-800.webp 800w, /images/ontwerp/pascha-mobiel-banner-1255.webp 1255w" sizes="100vw" width={1255} height={638} />
              <BannerBeeld naam="pascha-banner" open={open} />
            </picture>
          }
        />
        <div className="vg-papier ot-inhoud">
          <PaschaInhoud
            mobiel={!desktop}
            cyclus={cyclus}
            bekeken={bekeken}
            gekozen={gekozen}
            dag={dag}
            lezingen={rooster?.[vandaagYmd]?.filter(isPaascyclus)}
            heeftRooster={!!rooster?.[vandaagYmd]}
            kies={(stap) => setKeuze(stap ? { cyclus: cyclusId, stap } : null)}
            openStap={setStapOpen}
            openDag={openDag}
            openDagLezingen={() => openDagLezingen(vandaagYmd)}
            openLezing={(l) => openLezing({ ref: l.ref, tag: l.tag, julianKey: dag.julianKey, civil: vandaag })}
          />
        </div>
      </section>

      <ExactPageFrame title="Pascha">
      <div className="pc-pagina bg-parchment text-ink">
        <div className={CONTENT}>
          {/* De hele Paascyclus van dit jaar, dag voor dag — ingeklapt */}
          <div className="pc-cyclus">
            <button type="button" onClick={() => setCyclusOpen((o) => !o)} aria-expanded={cyclusOpen} className="pc-cyclus-knop">
              <span>
                <span className="pc-cyclus-titel">Paascyclus {pascha.getUTCFullYear()}</span>
                <span className="pc-cyclus-onder">Alles wat van de Paasdatum afhangt, dag voor dag</span>
              </span>
              <ChevronRight className={`h-5 w-5 shrink-0 text-gold-deep transition-transform ${cyclusOpen ? 'rotate-90' : ''}`} />
            </button>
            {cyclusOpen && (
              <ol className="thin-scroll pc-cyclus-lijst">
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

          {/* Pascha: de Verrijzenis van onze Heer, met het troparion en de verdieping */}
          <section className="pc-feest" aria-labelledby="pc-feest-titel">
            <h2 id="pc-feest-titel" className="pc-feest-titel">Pascha</h2>
            <p className="pc-feest-onder">De Verrijzenis van onze Heer</p>
            <p className="pc-feest-tekst">In de Nacht van Pascha vieren wij de Verrijzenis van Christus, Die door Zijn dood de dood heeft overwonnen en ons het eeuwige leven heeft geschonken.</p>
            <p className="pascha-groet">„Christus is opgestaan!” <span>„Hij is waarlijk opgestaan!”</span></p>
            <div className="pc-feest-vakken">
              <div className="pc-vak jr-vak">
                <p className="pc-vak-label">Troparion</p>
                <p className="pc-tropaar">{PERIODE_POPUPS.pascha.highlight}</p>
              </div>
            </div>
            <Verdieping items={INFO_CARDS} onOpen={setInfoOpen} />
          </section>
        </div>
      </div>

      <TimeSanctificationTimeline current="pascha" />
      </ExactPageFrame>

      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? PASCHA_INFO[infoOpen] : null} />
      <LiturgicalPopup open={stapOpen !== null} onClose={() => setStapOpen(null)} content={stapOpen ? stapInhoud[stapOpen] : null} />
    </>
  );
}

/** De bovenkant beweegt mee met de actuele periode — waar zijn we, wat betekent het, wat kan ik vandaag lezen of bidden.
 *  Desktop: met de tijdlijn ernaast; mobiel en tablet: compact onder elkaar met de tijdlijn in beeld. Alleen bestaande
 *  gegevens: de cyclus (lib/paascyclus.ts), de dag (dagInfo met de gekozen kalender), de feesten, het leesrooster en de
 *  uitleg van de stappen. Ontbrekende onderdelen worden weggelaten. */
function PaschaInhoud({
  mobiel, cyclus, bekeken, gekozen, dag, lezingen, heeftRooster, kies, openStap, openDag, openDagLezingen, openLezing,
}: {
  mobiel: boolean;
  cyclus: Paascyclus;
  bekeken: StapKey | null;
  gekozen: StapKey | null;
  dag: DagInfo;
  lezingen: HtcLezingRef[] | undefined;
  heeftRooster: boolean;
  kies: (stap: StapKey | null) => void;
  openStap: (stap: StapKey) => void;
  openDag: (ymd: string) => void;
  openDagLezingen: () => void;
  openLezing: (l: HtcLezingRef) => void;
}) {
  const { pascha, offset: off, huidige, dagenTotPascha } = cyclus;
  const stap = bekeken ? cyclus.stappen.find((s) => s.key === bekeken) ?? null : null;
  const isNu = !!stap && stap.key === huidige;
  const datumVan = (f: Feest) => addDays(pascha, f.offset ?? 0);
  const rijOpDag = (label: string, f: Feest): Rij => ({ label: `${label} · ${formatDag(datumVan(f))}`, titel: f.naam, tekst: f.toelichting, open: () => openDag(ymd(datumVan(f))) });

  // Vandaag: de gedachtenis van de dag (eerst de beweeglijke), anders wat de kalender over deze dag in de periode zegt
  const dagFeest = dag.feesten.find((f) => f.offset !== undefined) ?? dag.feesten[0];
  const dagregel =
    huidige === 'pascha'
      ? off === 0
        ? 'Vandaag is het heilig Pascha'
        : `${dagFeest?.kort ?? dagFeest?.naam ?? dag.seizoen} · Lichte Week`
      : dagFeest?.offset !== undefined
        ? dagFeest.naam
        : dag.seizoen;

  const rijen: Rij[] = [];
  if (isNu) {
    if (dagFeest && huidige !== 'pascha') rijen.push({ label: 'Vandaag', titel: dagFeest.naam, tekst: dagFeest.toelichting, open: () => openDag(dag.ymd) });
    if (huidige === 'voorbereiding') {
      const z = volgendeZondag(off, cyclus.stappen[0].offsetRange[1]);
      if (z && z.offset !== off) rijen.push(rijOpDag('Eerstvolgende zondag', z));
    }
    if (huidige === 'grote-vasten' || huidige === 'vijftig-dagen') {
      const z = zondagVanDeWeek(off);
      if (z && z.offset !== off) rijen.push(rijOpDag('Zondag van deze week', z));
    }
    if (huidige === 'grote-vasten') rijen.push({ label: 'Vasten vandaag', titel: dag.vasten.label, tekst: dag.vasten.detail, href: '#vasten' });
    const hemelvaart = feestMetId('hemelvaart');
    const pinksteren = feestMetId('pinksteren');
    if (huidige === 'vijftig-dagen' && hemelvaart) rijen.push(rijOpDag(`Over ${dagen((hemelvaart.offset ?? 0) - off)}`, hemelvaart));
    if (huidige === 'hemelvaart-pinksteren') {
      if (!dagFeest || dagFeest.offset === undefined) {
        const vorige = [...PAASCYCLUS].reverse().find((f) => (f.offset ?? 0) < off && (f.offset ?? 0) >= (hemelvaart?.offset ?? 39) && (f.rang ?? 0) >= 4);
        if (vorige) rijen.push(rijOpDag('Laatst gevierd', vorige));
      }
      if (pinksteren && off < (pinksteren.offset ?? 0)) rijen.push(rijOpDag(`Over ${dagen((pinksteren.offset ?? 0) - off)}`, pinksteren));
    }
  }
  const troparion = isNu && huidige !== 'pascha' ? dagFeest?.troparion : undefined;
  // Terug naar de actuele periode: de knop verdwijnt, dus de focus gaat naar de actuele rij op de tijdlijn
  const terug = (e: { currentTarget: HTMLElement }) => {
    const vak = e.currentTarget.closest('.ot-pc-m, .ot-pc-desk');
    kies(null);
    requestAnimationFrame(() => vak?.querySelector<HTMLElement>('.vg-pc-lijn .is-nu')?.focus());
  };
  // Hoogstens drie lezingen (op Goede Vrijdag zijn het er meer dan twintig); de rest via "Alle lezingen van vandaag".
  const heeftVandaag = isNu && (rijen.length > 0 || !!troparion || !!lezingen?.length);

  // Mobiel en tablet (onder 1024 px): dezelfde gegevens, compact onder elkaar — de periode, vandaag (of algemene
  // informatie over een andere periode), de tijdlijn en de uitleg met "Lees meer".
  if (mobiel) {
    const [hoofd, ...overig] = rijen;
    const inPeriode = stap ? PAASCYCLUS.filter((f) => (f.offset ?? 0) >= stap.offsetRange[0] && (f.offset ?? 0) <= stap.offsetRange[1]) : [];
    const kiesMobiel = (k: StapKey, knop: HTMLElement) => {
      kies(k);
      // De rij die de bezoeker koos blijft in beeld, ook als de inhoud erboven van hoogte verandert
      requestAnimationFrame(() => knop.scrollIntoView({ block: 'nearest', behavior: 'auto' }));
    };
    return (
      <div className="ot-pc-m">
        <header className="ot-pc-ctx-kop">
          {stap ? (
            <>
              <p className="vg-label">{isNu ? 'De huidige periode' : 'Periode in de Paascyclus'}</p>
              <h1 className="ot-titel ot-pc-m-titel">
                {stap.label}
                {isNu && <span className="ot-nu">Nu</span>}
              </h1>
              <p className="ot-pc-bereik">
                {bereikLang(stap.van, stap.tot)} {stap.tot.getUTCFullYear()}
              </p>
              {isNu && <p className="ot-pc-dagregel">{dagregel}</p>}
              {isNu && (
                <button type="button" className="ot-tekstknop ot-pc-bekijk" onClick={() => openStap(stap.key)}>
                  Bekijk deze periode ›
                </button>
              )}
            </>
          ) : (
            <>
              <p className="vg-label">De Paascyclus</p>
              <h1 className="ot-titel ot-pc-m-titel">Naar Pascha</h1>
              <p className="ot-pc-bereik">{formatDatum(pascha)}</p>
            </>
          )}
          <Sierlijn />
          {(!stap || isNu) && dagenTotPascha > 0 && <p className="ot-pc-nog">Nog {dagen(dagenTotPascha)} tot Pascha</p>}
          {gekozen && gekozen !== huidige && (
            <button type="button" className="ot-tekstknop ot-pc-terug" onClick={terug}>
              ‹ {huidige ? 'Terug naar nu' : 'Terug naar het overzicht'}
            </button>
          )}
        </header>

        {!stap && (
          <p className="ot-pc-tekst ot-pc-midden">
            De voorbereiding begint op {formatDag(cyclus.stappen[0].van)} {cyclus.stappen[0].van.getUTCFullYear()}, met de Zondag van de Tollenaar en de Farizeeër.
          </p>
        )}

        {/* Pascha en de Lichte Week: de feestgroet met het bestaande icoon (volledig, eigen verhouding) en het paastroparion */}
        {isNu && huidige === 'pascha' && (
          <div className="ot-pc-feestgroet">
            <img className="ot-pc-icoon" src="/images/feesten/pascha.webp" alt="Icoon van de Verrijzenis van Christus" width={569} height={800} decoding="async" />
            <div>
              <p className="vg-label">{off === 0 ? 'Vandaag vieren wij' : 'In de Lichte Week vieren wij'}</p>
              <p className="ot-pc-groet">
                Christus is opgestaan!<span>Hij is waarlijk opgestaan!</span>
              </p>
            </div>
            <div className="ot-pc-m-trop">
              <p className="vg-label ot-pc-tlabel">Troparion</p>
              <blockquote className="ot-pc-troparion">{PERIODE_POPUPS.pascha.highlight}</blockquote>
            </div>
          </div>
        )}

        {/* Vandaag binnen de actuele periode: de gedachtenis of het dagthema, met hoogstens twee hoofdacties */}
        {isNu && (hoofd || troparion || heeftRooster) && (
          <section className="ot-pc-sectie" aria-labelledby="pc-m-vandaag">
            <h2 id="pc-m-vandaag" className="vg-label">Vandaag binnen deze periode</h2>
            {hoofd && (
              <div className="ot-pc-m-hoofd">
                <small className="ot-pc-rijlabel">{hoofd.label}</small>
                <p className="ot-pc-m-hoofdtitel">{hoofd.titel}</p>
                {hoofd.tekst && <p className="ot-pc-m-hoofdtekst">{hoofd.tekst}</p>}
              </div>
            )}
            {troparion && (
              <>
                <p className="vg-label ot-pc-tlabel">Troparion</p>
                <blockquote className="ot-pc-troparion">{troparion}</blockquote>
              </>
            )}
            {overig.length > 0 && (
              <ul className="ot-register ot-pc-m-overig">
                {overig.map((r) => {
                  const inhoud = (
                    <>
                      <span className="ot-rij-tekst">
                        <small className="ot-pc-rijlabel">{r.label}</small>
                        <b>{r.titel}</b>
                      </span>
                      <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
                    </>
                  );
                  return (
                    <li key={r.label + r.titel}>
                      {r.href ? <a className="ot-rij" href={r.href}>{inhoud}</a> : <button type="button" className="ot-rij" onClick={r.open}>{inhoud}</button>}
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="ot-pc-m-acties">
              {heeftRooster && (
                <button type="button" className="ot-actie" onClick={openDagLezingen}>
                  Lees de lezingen <span aria-hidden="true">→</span>
                </button>
              )}
              <button type="button" className="ot-actie is-omlijnd" onClick={() => openDag(dag.ymd)}>
                Bekijk de dag
              </button>
            </div>
          </section>
        )}

        {/* Een andere periode bekijken: geen "vandaag", maar de gedachtenissen van die periode met hun datums */}
        {stap && !isNu && inPeriode.length > 0 && (
          <section className="ot-pc-sectie" aria-labelledby="pc-m-periode">
            <h2 id="pc-m-periode" className="vg-label">In deze periode</h2>
            <ul className="ot-register ot-pc-m-overig">
              {inPeriode.map((f) => (
                <li key={f.id}>
                  <button type="button" className="ot-rij" onClick={() => openDag(ymd(datumVan(f)))}>
                    <span className="ot-rij-tekst">
                      <small className="ot-pc-rijlabel">{formatDag(datumVan(f))}</small>
                      <b>{f.kort ?? f.naam}</b>
                    </span>
                    <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* De zes periodes, altijd in beeld */}
        <ol className="vg-et-lijn vg-wk-lijn vg-pc-lijn" aria-label="De weg naar Pascha">
          {cyclus.stappen.map((s) => {
            const nu = s.key === huidige;
            return (
              <li key={s.key}>
                <button
                  type="button"
                  className={[s.key === bekeken && 'is-actief', nu && 'is-nu'].filter(Boolean).join(' ') || undefined}
                  aria-pressed={s.key === bekeken}
                  aria-current={nu ? 'true' : undefined}
                  aria-label={`${s.label}, ${bereikLang(s.van, s.tot)} ${s.tot.getUTCFullYear()}${nu ? ' (nu)' : ''}`}
                  onClick={(e) => kiesMobiel(s.key, e.currentTarget)}
                >
                  <span className="vg-wk-naam">
                    {formatKort(s.van)} – {formatKort(s.tot)}
                  </span>
                  <span>
                    {s.label}
                    {nu && <span className="ot-nu">Nu</span>}
                  </span>
                  <ChevronRight aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>

        {/* Uitleg over de bekeken periode, met de bestaande uitgebreide uitleg achter "Lees meer" */}
        {stap && (
          <section className="ot-pc-sectie" aria-labelledby="pc-m-betekenis">
            <h2 id="pc-m-betekenis" className="vg-label">Wat betekent deze periode?</h2>
            {betekenis(stap.key).map((t) => (
              <p key={t} className="ot-pc-tekst">{t}</p>
            ))}
            <button type="button" className="ot-tekstknop ot-pc-meer" onClick={() => openStap(stap.key)}>
              Lees meer over deze periode ›
            </button>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="ot-pc-desk">
      <div className="ot-pc-ctx">
        {stap ? (
          <>
            <header className="ot-pc-ctx-kop">
              <p className="vg-label">{isNu ? 'De huidige periode' : 'Periode in de Paascyclus'}</p>
              <h1 className="ot-titel">
                {stap.label}
                {isNu && <span className="ot-nu">Nu</span>}
              </h1>
              <p className="ot-pc-bereik">
                {bereikLang(stap.van, stap.tot)} {stap.tot.getUTCFullYear()}
              </p>
              {isNu && <p className="ot-pc-dagregel">{dagregel}</p>}
              {isNu && (
                <button type="button" className="ot-tekstknop ot-pc-bekijk" onClick={() => openStap(stap.key)}>
                  Bekijk deze periode ›
                </button>
              )}
              <Sierlijn />
              {isNu && dagenTotPascha > 0 && <p className="ot-pc-nog">Nog {dagen(dagenTotPascha)} tot Pascha</p>}
            </header>

            {/* Pascha en de Lichte Week: de feestgroet met het bestaande icoon en het paastroparion */}
            {isNu && huidige === 'pascha' && (
              <div className="ot-pc-feestgroet">
                <img className="ot-pc-icoon" src="/images/feesten/pascha.webp" alt="Icoon van de Verrijzenis van Christus" width={569} height={800} decoding="async" />
                <div>
                  <p className="vg-label">{off === 0 ? 'Vandaag vieren wij' : 'In de Lichte Week vieren wij'}</p>
                  <p className="ot-pc-groet">
                    Christus is opgestaan!<span>Hij is waarlijk opgestaan!</span>
                  </p>
                  <p className="vg-label ot-pc-tlabel">Troparion</p>
                  <blockquote className="ot-pc-troparion">{PERIODE_POPUPS.pascha.highlight}</blockquote>
                </div>
              </div>
            )}

            <section className="ot-pc-sectie" aria-labelledby="pc-betekenis">
              <h2 id="pc-betekenis" className="vg-label">Wat betekent deze periode?</h2>
              {betekenis(stap.key).map((t) => (
                <p key={t} className="ot-pc-tekst">{t}</p>
              ))}
              <button type="button" className="ot-tekstknop ot-pc-meer" onClick={() => openStap(stap.key)}>
                Lees meer over deze periode ›
              </button>
            </section>

            {heeftVandaag && (
              <section className="ot-pc-sectie" aria-labelledby="pc-vandaag">
                <h2 id="pc-vandaag" className="vg-label">Vandaag binnen deze periode</h2>
                {rijen.length > 0 && (
                  <ul className="ot-register">
                    {rijen.map((r) => {
                      const inhoud = (
                        <>
                          <span className="ot-rij-tekst">
                            <small className="ot-pc-rijlabel">{r.label}</small>
                            <b>{r.titel}</b>
                            {r.tekst && <span>{r.tekst}</span>}
                          </span>
                          <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
                        </>
                      );
                      return (
                        <li key={r.label + r.titel}>
                          {r.href ? (
                            <a className="ot-rij" href={r.href}>{inhoud}</a>
                          ) : (
                            <button type="button" className="ot-rij" onClick={r.open}>{inhoud}</button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {troparion && (
                  <>
                    <p className="vg-label ot-pc-tlabel">Troparion</p>
                    <blockquote className="ot-pc-troparion">{troparion}</blockquote>
                  </>
                )}
                {lezingen && lezingen.length > 0 && (
                  <ul className="ot-register ot-pc-lezingen" aria-label="Lezingen van vandaag">
                    {lezingen.slice(0, 3).map((l, i) => {
                      const ref = vertaalRef(l.ref);
                      const soort = lezingSoort(ref);
                      return (
                        <li key={`${l.ref}-${i}`}>
                          <button type="button" className="ot-rij" onClick={() => openLezing(l)}>
                            <span className="ot-rij-tekst">
                              <small className="ot-pc-rijlabel">{soort === 'evangelie' ? 'Evangelie' : soort === 'oud' ? 'Oude Testament' : 'Apostel'}</small>
                              <b>{ref}</b>
                            </span>
                            <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {heeftRooster && (
                  <button type="button" className="ot-tekstknop ot-pc-meer" onClick={openDagLezingen}>
                    Alle lezingen van vandaag ›
                  </button>
                )}
              </section>
            )}

            {gekozen && gekozen !== huidige && (
              <button type="button" className="ot-tekstknop ot-pc-terug" onClick={terug}>
                ‹ {huidige ? 'Terug naar de huidige periode' : 'Terug naar het overzicht'}
              </button>
            )}
          </>
        ) : (
          // Buiten de Paascyclus: geen periode is "nu"; het komende Pascha, de aftelling en het begin van de voorbereiding
          <header className="ot-pc-ctx-kop">
            <p className="vg-label">De Paascyclus</p>
            <h1 className="ot-titel">Naar Pascha</h1>
            <p className="ot-pc-datum">{formatDatum(pascha)}</p>
            <Sierlijn />
            <p className="ot-pc-nog">Nog {dagen(dagenTotPascha)} tot Pascha</p>
            <p className="ot-pc-tekst ot-pc-midden">
              De voorbereiding begint op {formatDag(cyclus.stappen[0].van)} {cyclus.stappen[0].van.getUTCFullYear()}, met de Zondag van de Tollenaar en de
              Farizeeër. Kies een periode op de tijdlijn om te lezen wat zij betekent.
            </p>
          </header>
        )}
      </div>

      <ol className="vg-et-lijn vg-wk-lijn vg-pc-lijn" aria-label="De weg naar Pascha">
        {cyclus.stappen.map((s) => {
          const nu = s.key === huidige;
          return (
            <li key={s.key}>
              <button
                type="button"
                className={[s.key === bekeken && 'is-actief', nu && 'is-nu'].filter(Boolean).join(' ') || undefined}
                aria-pressed={s.key === bekeken}
                aria-current={nu ? 'true' : undefined}
                aria-label={`${s.label}, ${bereikLang(s.van, s.tot)} ${s.tot.getUTCFullYear()}${nu ? ' (nu)' : ''}`}
                onClick={() => kies(s.key)}
              >
                <span className="vg-wk-naam">
                  {formatKort(s.van)} – {formatKort(s.tot)}
                </span>
                <span>
                  {s.label}
                  {nu && <span className="ot-nu">Nu</span>}
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
