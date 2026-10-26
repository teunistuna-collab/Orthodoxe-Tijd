import { useEffect, useState } from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';

import { LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { useApp } from '../lib/context';
import { addDays, bepaalToon, dagInfo, formatDag, ymd } from '../lib/kalender';
import { WEEK_INFO } from '../lib/cyclusTeksten';
import Verdieping from './Verdieping';
import ExactPageFrame from './ExactPageFrame';
import NisKop from './NisKop';
import { letterBeeld } from '../lib/letters';
import { HANDEN } from './symbolen';
import { usePaginaOpen } from '../lib/paginaOpen';
import { useMobiel } from '../lib/desktop';
import { gaNaar } from '../lib/navigatie';
import WeekMobiel from './WeekMobiel';
import './Vandaag.css';

type DayKey = 'zondag' | 'maandag' | 'dinsdag' | 'woensdag' | 'donderdag' | 'vrijdag' | 'zaterdag';
type InfoKey = 'wat' | 'dagen' | 'betekenis' | 'praktisch';

type PopupContent = {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  highlight?: string;
};

// Gedeelde slotnotitie over de Octoechos, toegevoegd aan iedere dag-popup (bron: "De orthodoxe weekcyclus.docx").
const OCTOECHOS_NOOT =
  'Door deze zevendaagse cyclus heen klinkt tevens de cyclus van de acht tonen (echoi) van de Octoechos: achtereenvolgens toon 1 tot en met toon 8, waarna de reeks opnieuw begint. Daardoor keert het thema van een dag terug, maar telkens binnen de eigen hymnografische kleur van de toon van die week.';

// Inhoud rechtstreeks gebaseerd op "De orthodoxe weekcyclus.docx".
const DAY_POPUPS: Record<DayKey, PopupContent> = {
  zondag: {
    title: 'Zondag',
    subtitle: 'De Verrijzenis van Christus',
    highlight: 'Verrijzenis · Pascha · Eucharistie · vreugde · overwinning op de dood',
    paragraphs: [
      'De eerste dag van de week is de Dag des Heren: de dag van de Verrijzenis. Iedere zondag draagt daarom het karakter van een klein Pascha. De Kerk verzamelt zich rond de verrezen Christus en verkondigt Zijn overwinning op zonde, dood en verderf. Liturgisch vangt de zondag reeds aan op zaterdagavond met de Vespers.',
      OCTOECHOS_NOOT,
    ],
  },
  maandag: {
    title: 'Maandag',
    subtitle: 'De heilige engelen en hemelse machten',
    highlight: 'Engelen · hemelse eredienst · gehoorzaamheid · waakzaamheid · lofprijzing',
    paragraphs: [
      'Na de Dag des Heren eert de Kerk op maandag de onlichamelijke machten: de engelen en aartsengelen die God zonder ophouden dienen en verheerlijken. Hun gehoorzaamheid, waakzaamheid en lofprijzing richten de gelovige op het hemelse leven en de onophoudelijke aanbidding van God.',
      OCTOECHOS_NOOT,
    ],
  },
  dinsdag: {
    title: 'Dinsdag',
    subtitle: 'De heilige Johannes de Voorloper',
    highlight: 'Johannes de Doper · profeten · bekering · voorbereiding · waakzaamheid',
    paragraphs: [
      'Dinsdag is in het bijzonder gewijd aan de heilige profeet, Voorloper en Doper Johannes. In hem klinkt de roep tot bekering en voorbereiding op de komst van Christus. Door de Voorloper worden tevens de profeten in herinnering gebracht, die van oudsher naar de komst van de Messias hebben gewezen.',
      OCTOECHOS_NOOT,
    ],
  },
  woensdag: {
    title: 'Woensdag',
    subtitle: 'Het verraad en het heilige Kruis',
    highlight: 'Verraad · Kruis · berouw · vasten · Moeder Gods',
    paragraphs: [
      'Op woensdag gedenkt de Kerk het verraad van de Heer door Judas en richt zij de blik op het heilige en levenschenkende Kruis. Daarom draagt deze dag een boetvaardig karakter en is woensdag, buiten de vastenvrije perioden en bijzondere liturgische uitzonderingen, een wekelijkse vastendag. In de hymnografie klinkt ook de voorbede van de allerheiligste Moeder Gods.',
      OCTOECHOS_NOOT,
    ],
  },
  donderdag: {
    title: 'Donderdag',
    subtitle: 'De heilige apostelen en de heilige Nicolaas',
    highlight: 'Apostelen · Evangelie · Kerk · herderschap · heilige Nicolaas',
    paragraphs: [
      'Donderdag is gewijd aan de heilige apostelen, die door Christus werden uitgezonden om het Evangelie aan de wereld te verkondigen. Ook de heilige Nicolaas, aartsbisschop van Myra, wordt op deze dag bijzonder herdacht. Zo krijgt de dag een apostolisch en herderlijk karakter: verkondiging, dienstbaarheid en zorg voor de Kerk.',
      OCTOECHOS_NOOT,
    ],
  },
  vrijdag: {
    title: 'Vrijdag',
    subtitle: 'De Kruisiging van onze Heer',
    highlight: 'Kruisiging · Golgotha · offer · berouw · vasten',
    paragraphs: [
      'Vrijdag staat geheel in het teken van het heilige en levenschenkende Kruis en het lijden en sterven van onze Heer Jezus Christus. De Kerk staat bij Golgotha en gedenkt het vrijwillige offer van Christus voor het leven en de verlossing van de wereld. Daarom is vrijdag, behoudens liturgische uitzonderingen, eveneens een wekelijkse vastendag.',
      OCTOECHOS_NOOT,
    ],
  },
  zaterdag: {
    title: 'Zaterdag',
    subtitle: 'De heiligen en de ontslapenen',
    highlight: 'Heiligen · martelaren · ontslapenen · rust · verwachting · verrijzenis',
    paragraphs: [
      'De zaterdag draagt het karakter van rust en verwachting. De Kerk gedenkt de heiligen, in het bijzonder de martelaren, en allen die in de hoop op de verrijzenis in de Heer zijn ontslapen. Zoals Christus op de sabbat lichamelijk in het graf rustte, zo ziet de Kerk de dood in het licht van de komende Verrijzenis. Met de Vespers van zaterdagavond opent zich opnieuw de zondag.',
      OCTOECHOS_NOOT,
    ],
  },
};

const DAYS: Array<{ key: DayKey; label: string; short: string }> = [
  { key: 'zondag', label: 'Zondag', short: 'De Verrijzenis van Christus' },
  { key: 'maandag', label: 'Maandag', short: 'De engelen en hemelse machten' },
  { key: 'dinsdag', label: 'Dinsdag', short: 'Johannes de Voorloper' },
  { key: 'woensdag', label: 'Woensdag', short: 'Het verraad en het heilig Kruis' },
  { key: 'donderdag', label: 'Donderdag', short: 'De apostelen en H. Nicolaas' },
  { key: 'vrijdag', label: 'Vrijdag', short: 'De Kruisiging van de Heer' },
  { key: 'zaterdag', label: 'Zaterdag', short: 'De heiligen en ontslapenen' },
];


const INFO_CARDS: Array<{ key: InfoKey; title: string }> = [
  { key: 'wat', title: 'Wat is de weekcyclus?' },
  { key: 'dagen', title: 'De dagen van de week' },
  { key: 'betekenis', title: 'De geestelijke betekenis' },
  { key: 'praktisch', title: 'Praktisch' },
];

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

// Dagkeuze van zondag (de Dag des Heren, eerste dag van de week) tot zaterdag; de versierde initiaal van de dag (zelfde
// letters als de diensten, lib/etmaal.ts).
const ZO_ZA: DayKey[] = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

export default function Weekcyclus() {
  const { vandaag, mode, openDag } = useApp();
  const [dayOpen, setDayOpen] = useState<DayKey | null>(null);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const vandaagKey = DAYS[vandaag.getUTCDay()].key;
  const [gekozen, setGekozen] = useState<DayKey>(vandaagKey);
  const open = usePaginaOpen('week');

  // Vandaag kan een pop-up van deze pagina openen.
  useEffect(() => {
    const opPopup = (event: Event) => {
      const { pagina, sleutel } = (event as CustomEvent<OpenPopupDetail>).detail;
      // Mobiel: de dag als eigen weergave (WeekMobiel.tsx); web: het venster.
      if (pagina === 'week') {
        if (window.matchMedia('(max-width: 767.98px)').matches) gaNaar(`week/${sleutel}`);
        else setDayOpen(sleutel as DayKey);
      }
    };
    window.addEventListener(OPEN_POPUP_EVENT, opPopup);
    return () => window.removeEventListener(OPEN_POPUP_EVENT, opPopup);
  }, []);

  // Deze week: zondag tot en met zaterdag rond vandaag; de toon uit de Oktoïch (lib/kalender.ts).
  const toon = bepaalToon(vandaag);
  const zondag = addDays(vandaag, -vandaag.getUTCDay());
  const index = DAYS.findIndex((d) => d.key === gekozen);
  const dag = DAYS[index];
  const datum = addDays(zondag, index);
  const info = dagInfo(datum, mode);
  const tekst = DAY_POPUPS[gekozen];

  const naarKalender = () => openDag(ymd(datum));
  const mobiel = useMobiel();
  if (mobiel) return <WeekMobiel dagen={DAY_POPUPS} vandaagKey={vandaagKey} />;

  return (
    <>
      {/* Bovenkant volgens het pakket Etmaal, Week en Jaar (paneel 3): de dagkeuze, de dag met zijn initiaal en drie
          ingangen. Gekozen dag blijft staan tot "Terug naar vandaag". */}
      <section id="week" className="vg vg-week">
        <NisKop open={open} balk terug="#cycli">
          <img className="vg-ritmewiel vg-kop-teken" src="/images/Chi-Rho.webp" alt="" aria-hidden="true" width={496} height={640} />
        </NisKop>
        <div className="vg-papier vg-cy">
          <h1 className="vg-cy-titel">De zeven dagen</h1>
          <img className="vg-sierlijn vg-cy-sierlijn" src="/images/vandaag/sierlijn.svg" alt="" aria-hidden="true" width={480} height={40} />
          {/* Zoals Etmaal: mobiel eerst de gekozen dag, dan de tijdlijn; op web de tijdlijn links en de dag ernaast */}
          <div className="vg-et-twee vg-wk-twee">
            <div className="vg-wk-rechts">
              <section className="vg-uur vg-wk-dag" aria-labelledby="wk-dag-titel" aria-live="polite">
                {letterBeeld(dag.label) && <img className="vg-initiaal" src={letterBeeld(dag.label)} alt="" width={280} height={280} decoding="async" />}
                <h2 id="wk-dag-titel" className="vg-dienst">
                  {letterBeeld(dag.label) ? (
                    <>
                      <span className="sr-only">{dag.label}</span>
                      <span aria-hidden="true">{dag.label.slice(1)}</span>
                    </>
                  ) : (
                    dag.label
                  )}
                </h2>
                <p className="vg-label vg-wk-thema">{tekst.subtitle}</p>
              </section>
              <img className="vg-sierlijn" src="/images/vandaag/sierlijn.svg" alt="" aria-hidden="true" width={480} height={40} />

              <ul className="vg-cy-lijst">
                <li>
                  <button type="button" className="vg-cy-kaart" onClick={() => setDayOpen(gekozen)}>
                    <span className="vg-verd-symbool">{HANDEN}</span>
                    <span className="vg-verd-tekst"><b>Thema van de dag</b><span>{tekst.highlight}</span></span>
                    <ChevronRight className="vg-verd-pijl" aria-hidden="true" />
                  </button>
                </li>
                <li>
                  <button type="button" className="vg-cy-kaart" onClick={naarKalender}>
                    <span className="vg-verd-symbool"><CalendarDays strokeWidth={1.3} aria-hidden="true" /></span>
                    <span className="vg-verd-tekst"><b>{dag.label} {formatDag(datum)}</b><span>{info.vasten.label}{toon ? ` · Toon ${toon}` : ''}</span></span>
                    <ChevronRight className="vg-verd-pijl" aria-hidden="true" />
                  </button>
                </li>
              </ul>
            </div>
            <div className="vg-et-links">
              <p className="vg-label">De dagen met de Heer</p>
            {/* De zeven dagen als tijdlijn, zoals de diensten op Etmaal: dag en thema, de gekozen dag als bordeaux pil */}
            <ol className="vg-et-lijn vg-wk-lijn" aria-label="Kies een dag">
              {ZO_ZA.map((key) => (
                <li key={key}>
                  <button type="button" className={key === gekozen ? 'is-actief' : undefined} aria-pressed={key === gekozen} aria-current={key === vandaagKey ? 'date' : undefined} onClick={() => setGekozen(key)}>
                    <span className="vg-wk-naam">{key.charAt(0).toUpperCase() + key.slice(1)}{key === vandaagKey && <span className="sr-only"> (vandaag)</span>}</span>
                    <span>{DAY_POPUPS[key].subtitle}</span>
                    <ChevronRight aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
            {gekozen !== vandaagKey && (
              <button type="button" className="vg-link vg-et-volg" onClick={() => setGekozen(vandaagKey)}>Terug naar vandaag ›</button>
            )}
            </div>
          </div>
        </div>
      </section>

      <ExactPageFrame title="Week">
        <div className="pc-pagina bg-parchment text-ink">
          <div className={CONTENT}>
            <Verdieping items={INFO_CARDS.map((c) => ({ ...c, intro: WEEK_INFO[c.key]?.subtitle }))} onOpen={setInfoOpen} />
          </div>
        </div>
      <TimeSanctificationTimeline current="week" />
      </ExactPageFrame>

      <LiturgicalPopup open={dayOpen !== null} onClose={() => setDayOpen(null)} content={dayOpen ? DAY_POPUPS[dayOpen] : null} />
      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? WEEK_INFO[infoOpen] : null} />
    </>
  );
}
