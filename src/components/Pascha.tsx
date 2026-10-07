import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';

import { useApp } from '../lib/context';
import { PAASCYCLUS } from '../lib/feesten';
import { addDays, formatDag, formatDatum, formatKort, volgendePascha, ymd } from '../lib/kalender';
import { vastenPeriodes } from '../lib/overzicht';
import { FeestTag } from './ui';
import { LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { PASCHA_INFO, type PopupInhoud } from '../lib/cyclusTeksten';
import PaginaOpening from './PaginaOpening';

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

// De opbouw van de Paascyclus in zes stappen (aangeleverd ontwerp). De popups gebruiken de bestaande teksten hierboven;
// "Hemelvaart en Pinksteren" voegt de twee bestaande teksten samen. offsetRange = eerste en laatste dag t.o.v. Pascha.
type StapKey = 'voorbereiding' | 'grote-vasten' | 'goede-week' | 'pascha' | 'vijftig-dagen' | 'hemelvaart-pinksteren';
const STAPPEN: Array<{ key: StapKey; label: string; short: string; offsetRange: [number, number] }> = [
  { key: 'voorbereiding', label: 'Voorbereiding', short: 'Zondag van de Tollenaar en de Farizeeër tot de Vergevingszondag', offsetRange: [-70, -49] },
  { key: 'grote-vasten', label: 'Grote Vasten', short: 'Innerlijke zuivering en omkeer', offsetRange: [-48, -9] },
  { key: 'goede-week', label: 'Heilige Week', short: 'Met Christus mee naar het Kruis', offsetRange: [-8, -1] },
  { key: 'pascha', label: 'Pascha', short: 'De Verrijzenis van Christus', offsetRange: [0, 6] },
  { key: 'vijftig-dagen', label: 'Paastijd', short: 'Vijftig dagen van vreugde', offsetRange: [7, 38] },
  { key: 'hemelvaart-pinksteren', label: 'Hemelvaart en Pinksteren', short: 'Volheid van de Geest en het nieuwe leven', offsetRange: [39, 63] },
];
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

export default function Pascha() {
  const { vandaag, openDag, mode } = useApp();
  const [stapOpen, setStapOpen] = useState<StapKey | null>(null);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
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
  const groteVasten = vastenPeriodes(paaschaJaar, mode).find((p) => p.id === 'grote-vasten');

  // Iedere stap-pop-up krijgt de datums van dit jaar als eyebrow.
  const stapInhoud = {} as Record<StapKey, PopupInhoud>;
  for (const stap of STAPPEN) {
    const [start, eind] = stap.offsetRange;
    stapInhoud[stap.key] = { ...STAP_INHOUD[stap.key], title: stap.label, eyebrow: formatBereik(addDays(pascha, start), addDays(pascha, eind)) };
  }

  return (
    <>
      {/* Opening volgens het aangeleverde ontwerp (Bouw 175): icoon, titel, intro en het jaarvak met de data van dit Pascha */}
      <PaginaOpening
        id="pascha"
        soort="hoogfeest"
        label="De Paascyclus"
        titel="Pascha"
        ondertitel="Van Vasten naar Verrijzenis"
        beeld={{ src: '/images/Pascha-icoon.webp', alt: 'Icoon van de Verrijzenis: Christus haalt Adam en Eva uit het graf' }}
      >
        <p className="pc-intro">De Paascyclus is het hart van het kerkelijk jaar. In deze periode gaan we met Christus mee in Zijn lijden, dood en verrijzenis, en vieren we de overwinning van het Leven.</p>
        <aside className="pc-jaar jr-vak" aria-label={`Pascha ${paaschaJaar}`}>
          <p className="pc-jaar-label">Pascha {paaschaJaar}</p>
          <p className="pc-jaar-datum">{formatDatum(pascha)}</p>
          <dl className="pc-jaar-lijst">
            {groteVasten && (
              <div>
                <dt>Grote Vasten</dt>
                <dd>{bereikLang(groteVasten.start, groteVasten.eind)}</dd>
              </div>
            )}
            <div>
              <dt>Heilige Week</dt>
              <dd>{bereikLang(addDays(pascha, -6), addDays(pascha, -1))}</dd>
            </div>
            <div>
              <dt>Pascha</dt>
              <dd>{formatDatum(pascha)}</dd>
            </div>
            <div>
              <dt>Paastijd</dt>
              <dd>{bereikLang(pascha, addDays(pascha, 49))}</dd>
            </div>
          </dl>
        </aside>
      </PaginaOpening>

      <section className="pc-pagina bg-parchment text-ink">
        <div className={CONTENT}>
          {/* De opbouw van de Paascyclus */}
          <section className="pc-opbouw jr-vak" aria-labelledby="pc-opbouw-titel">
            <h2 id="pc-opbouw-titel" className="pc-kop">De opbouw van de Paascyclus</h2>
            <ul className="jr-vasten jr-tijden pc-stappen">
              {STAPPEN.map((stap) => (
                <li key={stap.key}>
                  <button type="button" className="jr-vast" onClick={() => setStapOpen(stap.key)}>
                    <span className="jr-vast-naam">{stap.label}</span>
                    <span className="jr-vast-doel">{stap.short}</span>
                    <span className="jr-pijl" aria-hidden="true">›</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* De hele Paascyclus van dit jaar, dag voor dag — ingeklapt */}
          <div className="pc-cyclus">
            <button type="button" onClick={() => setCyclusOpen((open) => !open)} aria-expanded={cyclusOpen} className="pc-cyclus-knop">
              <span>
                <span className="pc-cyclus-titel">Paascyclus {paaschaJaar}</span>
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
            <p className="pascha-groet">„Christus is opgestaan!” <span>„Waarlijk opgestaan!”</span></p>
            <div className="pc-feest-vakken">
              <div className="pc-vak jr-vak">
                <p className="pc-vak-label">Troparion</p>
                <p className="pc-tropaar">{PERIODE_POPUPS.pascha.highlight}</p>
              </div>
              <nav className="pc-vak jr-vak" aria-label="Lees meer over Pascha">
                <p className="pc-vak-label">Lees meer</p>
                <ul className="pc-meer">
                  {INFO_CARDS.map(({ key, title }) => (
                    <li key={key}>
                      <button type="button" onClick={() => setInfoOpen(key)}>
                        {title} ›
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </section>
        </div>
      </section>

      <TimeSanctificationTimeline current="pascha" />

      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? PASCHA_INFO[infoOpen] : null} />
      <LiturgicalPopup open={stapOpen !== null} onClose={() => setStapOpen(null)} content={stapOpen ? stapInhoud[stapOpen] : null} />
    </>
  );
}
