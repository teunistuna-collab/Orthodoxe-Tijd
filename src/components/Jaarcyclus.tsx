import { useState } from 'react';
import { CalendarDays, ChevronRight, Moon } from 'lucide-react';

import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { JAAR_INFO } from '../lib/cyclusTeksten';
import { useApp } from '../lib/context';
import { DERTIEN } from '../lib/feesten';
import { daysBetween, formatDag, formatDatum, hoofdletter, kerkDatum, orthodoxPascha, type Mode } from '../lib/kalender';
import { feestDatum, vastenPeriodes, volgendeFeestDatum } from '../lib/overzicht';
import Verdieping from './Verdieping';
import ExactPageFrame from './ExactPageFrame';
import NisKop from './NisKop';
import { letterBeeld } from '../lib/letters';
import { usePaginaOpen } from '../lib/paginaOpen';
import './Vandaag.css';

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

// Gedeelde notitie: deze periode behoort tot de beweeglijke Paascyclus, niet tot de vaste jaarcyclus (bron: docx).
const PASCHALE_NOOT =
  'Deze periode behoort tot de beweeglijke Paascyclus, waarvan de data verschuiven met de datum van het heilige Pascha — en dus niet tot de vaste jaarcyclus. Niet al deze perioden behoren uitsluitend tot de vaste jaarcyclus: de Grote Vasten en het begin van de Apostelvasten zijn afhankelijk van de Paascyclus.';

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
    subtitle: 'Paascyclus — beweeglijk',
    paragraphs: [
      'De Orthodoxe Kerk kent vier grote vastenperioden: de Grote Vasten, de Apostelvasten, de vasten vóór de Geboorte van Christus en de vasten vóór de Ontslapenis van de Moeder Gods. Daarnaast kent de Kerk vaste vastendagen en gewoonlijk de wekelijkse vasten op woensdag en vrijdag, met liturgische uitzonderingen en plaatselijke verschillen.',
      PASCHALE_NOOT,
    ],
  },
  passietijd: {
    title: 'Passietijd',
    subtitle: 'Paascyclus — beweeglijk',
    highlight: 'Palmzondag — Intocht van de Heer in Jeruzalem (beweeglijk)',
    paragraphs: [
      'Sommige van de Twaalf Grote Feesten behoren tot de vaste kalender, terwijl Palmzondag, Hemelvaart en Pinksteren door Pascha worden bepaald. Het heilige Pascha zelf staat boven deze twaalf als het Feest der feesten.',
      PASCHALE_NOOT,
    ],
  },
  paschatijd: {
    title: 'Paschatijd',
    subtitle: 'Paascyclus — beweeglijk',
    highlight: 'Hemelvaart van de Heer — beweeglijk',
    paragraphs: [
      'Het heilige Pascha zelf staat boven de Twaalf Grote Feesten als het Feest der feesten. De volledige, beweeglijke Paascyclus — met onder meer de Grote Vasten, de Heilige Week en Hemelvaart — vind je op de Paschapagina.',
      PASCHALE_NOOT,
    ],
  },
  pinkstertijd: {
    title: 'Pinkstertijd',
    subtitle: 'Paascyclus — beweeglijk',
    highlight: 'Pinksteren — neerdaling van de Heilige Geest (beweeglijk)',
    paragraphs: [
      'Pinksteren, de neerdaling van de Heilige Geest, wordt door Pascha bepaald en behoort daarmee tot de beweeglijke Paascyclus.',
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

// In welke tijd van het jaar we nu zitten. ponytail: eigen grenzen op basis van de feesten in de popups hierboven —
// Kersttijd vanaf het kerkelijk nieuwjaar (1 september) tot Theofanie, Openbaringstijd tot het begin van de Triodion
// (Pascha − 70), Vastentijd tot Lazaruszaterdag, Passietijd tot Pascha, Paschatijd tot Pinksteren, daarna Pinkstertijd
// tot 31 augustus. Vaste grenzen in kerkelijke datums, beweeglijke via de Pascha-berekening.
function huidigeTijd(vandaag: Date, mode: Mode): PeriodKey {
  const kerk = kerkDatum(vandaag, mode);
  const maand = kerk.getUTCMonth() + 1;
  if (maand >= 9 || (maand === 1 && kerk.getUTCDate() < 6)) return 'kersttijd';
  const offset = daysBetween(orthodoxPascha(vandaag.getUTCFullYear()), vandaag);
  if (offset < -70) return 'openbaringstijd';
  if (offset < -8) return 'vastentijd';
  if (offset < 0) return 'passietijd';
  if (offset < 49) return 'paschatijd';
  return 'pinkstertijd';
}


export default function Jaarcyclus() {
  const [periodOpen, setPeriodOpen] = useState<PeriodKey | null>(null);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const { mode, vandaag } = useApp();
  const open = usePaginaOpen('jaar');
  const nu = huidigeTijd(vandaag, mode);
  const nuPeriode = PERIODS.find((p) => p.key === nu) ?? PERIODS[0];

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
    <section className={`${zicht} orthodox-pattern parchment-pattern bg-parchment pt-6 pb-16 text-ink sm:pt-8 sm:pb-20`}>
      {/* Onzichtbare tussenkop: de tegels (h3) hangen zo onder een h2 voor schermlezers */}
      <h2 className="sr-only">Achtergrond</h2>
      <div className={CONTENT}>
        <Verdieping items={INFO_CARDS} onOpen={setInfoOpen} />
      </div>
    </section>
  );

  return (
    <>
      {/* Bovenkant volgens het pakket Etmaal, Week en Jaar (paneel 4): het jaarwiel, de tijd van nu met zijn
          beginletter, de zes tijden van het jaar als tijdlijn en de vaste en beweeglijke feesten. */}
      <section id="jaar" className="vg vg-jaar">
        <NisKop open={open} balk terug="#cycli">
          <img className="vg-ritmewiel vg-jaarwiel" src="/images/jaar/rozet.webp" alt="" aria-hidden="true" width={800} height={770} />
        </NisKop>
        <div className="vg-papier vg-cy">
          <h1 className="vg-cy-titel">Het kerkelijk jaar</h1>
          <img className="vg-sierlijn vg-cy-sierlijn" src="/images/vandaag/sierlijn.svg" alt="" aria-hidden="true" width={480} height={40} />
          {/* Zoals Etmaal en Week: mobiel eerst de tijd van nu met de feesten, dan de tijdlijn; op web de tijdlijn links */}
          <div className="vg-et-twee vg-wk-twee vg-jr-twee">
            <div className="vg-wk-rechts">
              <section className="vg-uur vg-wk-dag vg-jr-nu" aria-labelledby="jr-nu-kop">
                <p className="vg-label">Waar zijn we nu?</p>
                {/* Versierde beginletter (zoals Week en Etmaal), de rest van de naam sluit er direct op aan */}
                <div className="vg-et-naam">
                  <img className="vg-initiaal" src={letterBeeld(nuPeriode.label)} alt="" width={400} height={400} decoding="async" />
                  <h2 id="jr-nu-kop" className="vg-dienst"><span className="sr-only">{nuPeriode.label}</span><span aria-hidden="true">{nuPeriode.label.slice(1)}</span></h2>
                </div>
                <p className="vg-label vg-wk-thema">{nuPeriode.short}</p>
              </section>
              <img className="vg-sierlijn" src="/images/vandaag/sierlijn.svg" alt="" aria-hidden="true" width={480} height={40} />
              <ul className="vg-cy-lijst">
                <li>
                  <button type="button" className="vg-cy-kaart" onClick={() => setPeriodOpen(nuPeriode.key)}>
                    <span className="vg-verd-symbool"><CalendarDays strokeWidth={1.3} aria-hidden="true" /></span>
                    <span className="vg-verd-tekst">
                      <b>{hoofdletter(formatDatum(vandaag))}</b>
                      <span>{[periode, mode === 'oud' ? `${formatDag(kerkDatum(vandaag, mode))} (kerkelijke datum)` : null].filter(Boolean).join(' · ')}</span>
                    </span>
                    <ChevronRight className="vg-verd-pijl" aria-hidden="true" />
                  </button>
                </li>
                <li>
                  <a className="vg-cy-kaart" href="#feesten">
                    <span className="vg-verd-symbool"><Moon strokeWidth={1.3} aria-hidden="true" /></span>
                    <span className="vg-verd-tekst">
                      <b>{komend.d.getTime() === vandaag.getTime() ? 'Feest van vandaag' : 'Komend feest'}</b>
                      <span>{komend.f.naam} · {formatDag(komend.d)}</span>
                    </span>
                    <ChevronRight className="vg-verd-pijl" aria-hidden="true" />
                  </a>
                </li>
              </ul>
              <nav className="vg-jr-feesten" aria-label="Feesten">
                <a href="#feesten"><CalendarDays strokeWidth={1.3} aria-hidden="true" /><span>Vaste feesten</span><ChevronRight aria-hidden="true" /></a>
                <a href="#pascha"><Moon strokeWidth={1.3} aria-hidden="true" /><span>Beweeglijke feesten</span><ChevronRight aria-hidden="true" /></a>
              </nav>
            </div>
            <div className="vg-et-links">
              <p className="vg-label">De seizoenen van het heil</p>
              {/* De zes tijden van het jaar als tijdlijn; de tijd van nu als bordeaux pil; elke tijd opent zijn venster */}
              <ol className="vg-et-lijn vg-wk-lijn vg-jr-lijn" aria-label="De tijden van het kerkelijk jaar">
                {PERIODS.map((period) => (
                  <li key={period.key}>
                    <button type="button" className={period.key === nu ? 'is-actief' : undefined} aria-current={period.key === nu ? 'true' : undefined} onClick={() => setPeriodOpen(period.key)}>
                      <span className="vg-wk-naam">{period.label}{period.key === nu && <span className="sr-only"> (nu)</span>}</span>
                      <span>{period.short}{period.movable ? ' · beweeglijk' : ''}</span>
                      <ChevronRight aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <ExactPageFrame title="Jaar">
      {infoTegels('')}

      {/* Meer dan een kalender */}
      <CycleTransition
        quote="Hij maakt alle dingen nieuw."
        citation="Openbaring 21:5"
        eyebrow="Meer dan een kalender"
        text="Het kerkelijk jaar is niet slechts een opeenvolging van feesten, maar een levende weg waarin heel de geschiedenis wordt samengevat: van de schepping, door de menswording en het Kruis, naar de Verrijzenis en de toekomstige eeuwigheid."
        buttonLabel="Ontdek de paascyclus"
        buttonHref="#pascha"
      />

      <TimeSanctificationTimeline current="jaar" />
      </ExactPageFrame>

      <LiturgicalPopup open={periodOpen !== null} onClose={() => setPeriodOpen(null)} content={periodOpen ? PERIOD_POPUPS[periodOpen] : null} />
      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? JAAR_INFO[infoOpen] : null} />
    </>
  );
}
