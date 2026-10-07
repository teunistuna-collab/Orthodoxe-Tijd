import { useState } from 'react';

import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { JAAR_INFO } from '../lib/cyclusTeksten';
import { useApp } from '../lib/context';
import { DERTIEN } from '../lib/feesten';
import { formatDag, formatDatum, kerkDatum } from '../lib/kalender';
import { feestDatum, vastenPeriodes, volgendeFeestDatum } from '../lib/overzicht';
import PaginaOpening from './PaginaOpening';

type PeriodKey = 'kersttijd' | 'openbaringstijd' | 'vastentijd' | 'passietijd' | 'paschatijd' | 'pinkstertijd';
type InfoKey = 'wat' | 'jaarcyclus' | 'betekenis' | 'praktisch';

type PopupContent = {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  highlight?: string;
};

// Gedeelde tekst over voorfeest/feest/nafeest, van toepassing op de vaste grote feesten (bron: docx).
const VOORFEEST_NOOT =
  'De Kerk beleeft een groot feest vaak niet als één geïsoleerde dag. Belangrijke feesten kunnen liturgisch worden voorbereid door een voorfeest en vervolgens nog enige tijd worden voortgezet in een nafeest. Daardoor krijgt de gelovige tijd om het gevierde mysterie te ontvangen, te bezingen en opnieuw te overwegen.';

// Gedeelde notitie: deze periode behoort tot de beweeglijke Paschale cyclus, niet tot de vaste jaarcyclus (bron: docx).
const PASCHALE_NOOT =
  'Deze periode behoort tot de beweeglijke Paschale cyclus, waarvan de data verschuiven met de datum van het heilige Pascha — en dus niet tot de vaste jaarcyclus. Niet al deze perioden behoren uitsluitend tot de vaste jaarcyclus: de Grote Vasten en het begin van de Apostelvasten zijn afhankelijk van de Paschale cyclus.';

// Inhoud rechtstreeks gebaseerd op "De orthodoxe jaarcyclus.docx".
const PERIOD_POPUPS: Record<PeriodKey, PopupContent> = {
  kersttijd: {
    title: 'Kersttijd',
    subtitle: 'Vaste jaarcyclus',
    highlight: '8 september · 14 september · 21 november · 25 december',
    paragraphs: [
      '8 september — Geboorte van de Moeder Gods.',
      '14 september — Verheffing van het kostbare en levenschenkende Kruis.',
      '21 november — Intocht van de Moeder Gods in de Tempel.',
      '25 december — Geboorte van onze Heer Jezus Christus.',
      'De Orthodoxe Kerk kent vier grote vastenperioden: de Grote Vasten, de Apostelvasten, de vasten vóór de Geboorte van Christus en de vasten vóór de Ontslapenis van de Moeder Gods.',
      VOORFEEST_NOOT,
    ],
  },
  openbaringstijd: {
    title: 'Openbaringstijd',
    subtitle: 'Vaste jaarcyclus',
    highlight: '6 januari · 2 februari · 25 maart',
    paragraphs: [
      '6 januari — Theofanie: de Doop van de Heer.',
      '2 februari — Ontmoeting van de Heer in de Tempel.',
      '25 maart — Verkondiging aan de Moeder Gods.',
      VOORFEEST_NOOT,
    ],
  },
  vastentijd: {
    title: 'Vastentijd',
    subtitle: 'Paschale cyclus — beweeglijk',
    paragraphs: [
      'De Orthodoxe Kerk kent vier grote vastenperioden: de Grote Vasten, de Apostelvasten, de vasten vóór de Geboorte van Christus en de vasten vóór de Ontslapenis van de Moeder Gods. Daarnaast kent de Kerk vaste vastendagen en gewoonlijk de wekelijkse vasten op woensdag en vrijdag, met liturgische uitzonderingen en plaatselijke verschillen.',
      PASCHALE_NOOT,
    ],
  },
  passietijd: {
    title: 'Passietijd',
    subtitle: 'Paschale cyclus — beweeglijk',
    highlight: 'Palmzondag — Intocht van de Heer in Jeruzalem (beweeglijk)',
    paragraphs: [
      'Sommige van de Twaalf Grote Feesten behoren tot de vaste kalender, terwijl Palmzondag, Hemelvaart en Pinksteren door Pascha worden bepaald. Het heilige Pascha zelf staat boven deze twaalf als het Feest der feesten.',
      PASCHALE_NOOT,
    ],
  },
  paschatijd: {
    title: 'Paschatijd',
    subtitle: 'Paschale cyclus — beweeglijk',
    highlight: 'Hemelvaart van de Heer — beweeglijk',
    paragraphs: [
      'Het heilige Pascha zelf staat boven de Twaalf Grote Feesten als het Feest der feesten. De volledige, beweeglijke Paschacyclus — met onder meer de Grote Vasten, de Heilige Week en Hemelvaart — vind je op de Paschapagina.',
      PASCHALE_NOOT,
    ],
  },
  pinkstertijd: {
    title: 'Pinkstertijd',
    subtitle: 'Paschale cyclus — beweeglijk',
    highlight: 'Pinksteren — neerdaling van de Heilige Geest (beweeglijk)',
    paragraphs: [
      'Pinksteren, de neerdaling van de Heilige Geest, wordt door Pascha bepaald en behoort daarmee tot de beweeglijke Paschale cyclus.',
      PASCHALE_NOOT,
    ],
  },
};

const PERIODS: Array<{ key: PeriodKey; label: string; short: string; movable: boolean }> = [
  { key: 'kersttijd', label: 'Kersttijd', short: 'De komst van het Licht in de wereld', movable: false },
  { key: 'openbaringstijd', label: 'Openbaringstijd', short: 'Christus wordt geopenbaard aan alle volken', movable: false },
  { key: 'vastentijd', label: 'Vastentijd', short: 'Voorbereiding op het heilige Pascha', movable: true },
  { key: 'passietijd', label: 'Passietijd', short: 'Het lijden van de Heer', movable: true },
  { key: 'paschatijd', label: 'Paschatijd', short: 'De Verrijzenis van Christus', movable: true },
  { key: 'pinkstertijd', label: 'Pinkstertijd', short: 'De gave van de Heilige Geest', movable: true },
];


const INFO_CARDS: Array<{ key: InfoKey; title: string; intro: string }> = [
  { key: 'wat', title: 'Wat is het kerkelijk jaar?', intro: 'Het kerkelijk jaar is de heilige tijd waarin de Kerk het leven van Christus herleeft, van Zijn Geboorte tot Zijn Verrijzenis.' },
  { key: 'jaarcyclus', title: 'De jaarcyclus', intro: 'Het kerkelijk jaar bestaat uit perioden, feesten en vasten die ons stap voor stap meenemen in het heilshandelen van God.' },
  { key: 'betekenis', title: 'De betekenis in ons leven', intro: 'Het kerkelijk jaar vormt ons hart, richt onze blik op Christus en heiligt onze tijd, dagen en seizoenen.' },
  { key: 'praktisch', title: 'Praktisch', intro: 'Hoe kun je het kerkelijk jaar meeleven in je gebed, thuis, in de parochie en in het dagelijkse leven?' },
];


const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';


export default function Jaarcyclus() {
  const [periodOpen, setPeriodOpen] = useState<PeriodKey | null>(null);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const { mode, vandaag } = useApp();

  // Waar zijn we nu: de lopende vasten- of vastenvrije periode, anders het laatste grote feest; en het komende grote feest.
  const jaar = vandaag.getUTCFullYear();
  const periodes = [jaar - 1, jaar, jaar + 1].flatMap((j) => vastenPeriodes(j, mode)).sort((a, b) => a.start.getTime() - b.start.getTime());
  const lopend = periodes.find((p) => p.soort !== 'dag' && p.start <= vandaag && vandaag <= p.eind);
  const vorigFeest = DERTIEN.flatMap((f) => [jaar - 1, jaar].map((j) => ({ f, d: feestDatum(f, j, mode) })))
    .filter((x): x is { f: (typeof DERTIEN)[number]; d: Date } => !!x.d && x.d < vandaag)
    .sort((a, b) => b.d.getTime() - a.d.getTime())[0];
  const komend = DERTIEN.map((f) => ({ f, d: volgendeFeestDatum(f, vandaag, mode) })).sort((a, b) => a.d.getTime() - b.d.getTime())[0];
  const periode = lopend ? lopend.naam : vorigFeest ? `Na het feest: ${vorigFeest.f.kort ?? vorigFeest.f.naam}` : null;

  // De vier informatietegels: vanaf tablet bovenaan, op mobiel onder de hoofdinhoud (zoals bij Vasten).
  const infoTegels = (zicht: string) => (
    <section className={`${zicht} orthodox-pattern parchment-pattern bg-parchment py-16 text-ink sm:py-20`}>
      {/* Onzichtbare tussenkop: de tegels (h3) hangen zo onder een h2 voor schermlezers */}
      <h2 className="sr-only">Achtergrond</h2>
      <div className={CONTENT}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INFO_CARDS.map(({ key, title, intro }) => (
            <button
              key={key}
              type="button"
              onClick={() => setInfoOpen(key)}
              className="ornate-card group flex min-h-[240px] flex-col px-7 py-8 text-left"
            >
              <h3 className="font-display mt-6 text-[20px] font-semibold text-gold-light uppercase">{title}</h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#d9c6a3] sm:text-base">{intro}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <>
      <PaginaOpening id="jaar" soort="cyclisch" label="Het kerkelijk jaar" titel="Jaar" ondertitel="Het ritme van het kerkelijk jaar" beeld={{ src: '/images/jaar/rozet.webp', alt: 'Rozet van de seizoenen van het jaar' }}>
        <p className="jr-intro">Het kerkelijk jaar is de weg van Christus in de tijd. In de feesten, de vasten en de gedachtenis van de heiligen wordt heel ons leven met Hem verenigd.</p>
      </PaginaOpening>

      {/* Waar zijn we nu, de grote bewegingen (vasten) en de twee cycli (Bouw 173) */}
      <section className="jr-pagina bg-parchment text-ink">
        <div className={CONTENT}>
          <section className="jr-nu jr-vak" aria-labelledby="jr-nu-titel">
            <div className="jr-nu-kop">
              <h2 id="jr-nu-titel">Waar zijn we nu?</h2>
            </div>
            <div className="jr-nu-datum">
              <p className="jr-datum">{formatDatum(vandaag)}</p>
              {mode === 'oud' && <p className="jr-kerk">{formatDag(kerkDatum(vandaag, mode))} (kerkelijke datum)</p>}
            </div>
            <dl className="jr-nu-info">
              {periode && (
                <div>
                  <dt>Periode</dt>
                  <dd>{periode}</dd>
                </div>
              )}
              <div>
                <dt>{komend.d.getTime() === vandaag.getTime() ? 'Feest van vandaag' : 'Komend feest'}</dt>
                <dd>
                  {komend.f.naam} · {formatDag(komend.d)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="jr-bewegingen jr-vak" aria-labelledby="jr-bew-titel">
            <div className="jr-bew-kop">
              <h2 id="jr-bew-titel">De grote bewegingen</h2>
            </div>
            <ul className="jr-vasten jr-tijden">
              {PERIODS.map((period) => (
                <li key={period.key}>
                  <button type="button" className="jr-vast" onClick={() => setPeriodOpen(period.key)}>
                    <span className="jr-vast-naam">{period.label}</span>
                    {period.movable && <span className="jr-vast-data">beweeglijk</span>}
                    <span className="jr-vast-doel">{period.short}</span>
                    <span className="jr-pijl" aria-hidden="true">›</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <div className="jr-cycli">
            <a href="#kalender" className="jr-cyclus jr-vak">
              <img src="/images/jaar/vaste-cyclus.webp" alt="" width={232} height={200} loading="lazy" decoding="async" />
              <span className="jr-cyclus-tekst">
                <span className="jr-cyclus-label">Vaste cyclus</span>
                <span className="jr-cyclus-uitleg">De vaste cyclus keert elk jaar terug. Hierin vieren we de Moeder Gods, de heiligen en de grote feesten.</span>
                <span className="jr-link">Bekijk de kalender ›</span>
              </span>
            </a>
            <a href="#pascha" className="jr-cyclus jr-vak">
              <img src="/images/jaar/beweeglijke-cyclus.webp" alt="" width={248} height={200} loading="lazy" decoding="async" />
              <span className="jr-cyclus-tekst">
                <span className="jr-cyclus-label">Beweeglijke cyclus</span>
                <span className="jr-cyclus-uitleg">De beweeglijke cyclus is verbonden met Pascha. De data van de Grote Vasten, de Apostelvasten en andere perioden volgen Pascha.</span>
                <span className="jr-link">Ga naar Pascha ›</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {infoTegels('')}

      {/* Meer dan een kalender */}
      <CycleTransition
        quote="Hij maakt alle dingen nieuw."
        citation="Openbaring 21:5"
        eyebrow="Meer dan een kalender"
        text="Het kerkelijk jaar is niet slechts een opeenvolging van feesten, maar een levende weg waarin heel de geschiedenis wordt samengevat: van de schepping, door de menswording en het Kruis, naar de Verrijzenis en de toekomstige eeuwigheid."
        buttonLabel="Ontdek de paschacyclus"
        buttonHref="#pascha"
      />

      <TimeSanctificationTimeline current="jaar" />

      <LiturgicalPopup open={periodOpen !== null} onClose={() => setPeriodOpen(null)} content={periodOpen ? PERIOD_POPUPS[periodOpen] : null} />
      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? JAAR_INFO[infoOpen] : null} />
    </>
  );
}
