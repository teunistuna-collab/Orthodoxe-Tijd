import { useEffect, useRef, useState } from 'react';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';

import { LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { useApp } from '../lib/context';
import { addDays, bepaalToon, dagInfo, formatDag, ymd } from '../lib/kalender';
import { WEEK_INFO } from '../lib/cyclusTeksten';
import PaginaOpening from './PaginaOpening';

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

export default function Weekcyclus() {
  const { vandaag, mode, openDag } = useApp();
  const [dayOpen, setDayOpen] = useState<DayKey | null>(null);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const vandaagKey = DAYS[vandaag.getUTCDay()].key;
  const [gekozen, setGekozen] = useState<DayKey>(vandaagKey);
  const detailRef = useRef<HTMLElement | null>(null);

  // Vandaag kan een pop-up van deze pagina openen.
  useEffect(() => {
    const opPopup = (event: Event) => {
      const { pagina, sleutel } = (event as CustomEvent<OpenPopupDetail>).detail;
      if (pagina === 'week') setDayOpen(sleutel as DayKey);
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

  const kies = (key: DayKey) => {
    setGekozen(key);
    // Op mobiel staat de uitleg onder de lijst: daarheen scrollen.
    if (window.matchMedia('(max-width: 899.98px)').matches) detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Opening volgens het aangeleverde ontwerp (Bouw 176): icoon, titel, intro en het vak met de toon van de week */}
      <PaginaOpening id="week" soort="cyclisch" label="De liturgische week" titel="Week" ondertitel="Van zondag tot zaterdag" beeld={{ src: '/images/Week-icoon.webp', alt: 'Rondel met kerken in een landschap onder de sterren' }}>
        <p className="pc-intro">De week is het ritme van de verrijzenis. Iedere dag heeft zijn eigen betekenis en plaatst ons in het heilsplan van Christus.</p>
        <aside className="pc-jaar wk-toon cyclus-nu" aria-label="Toon van de week">
          <p className="pc-jaar-label">Toon van de week</p>
          <p className="pc-jaar-datum">{toon ? `Toon ${toon}` : 'Geen toon'}</p>
          <p className="wk-toon-tekst">
            {toon
              ? 'De toon van de week volgt de Octoëchos en biedt het liturgisch klankveld waarin we de gebeden van deze week bidden.'
              : 'In de Heilige Week en de Lichte Week geldt geen toon van de week.'}
          </p>
        </aside>
      </PaginaOpening>

      <section className="pc-pagina bg-parchment text-ink">
        <div className={CONTENT}>
          {/* Deze week: zeven dagen; vandaag gemarkeerd, de gekozen dag staat hieronder uitgelegd */}
          <section className="pc-opbouw jr-vak" aria-labelledby="wk-week-titel">
            <h2 id="wk-week-titel" className="pc-kop">Deze week</h2>
            <ul className="jr-vasten jr-tijden wk-dagen">
              {DAYS.map((d) => (
                <li key={d.key}>
                  <button type="button" className={`jr-vast${d.key === vandaagKey ? ' cyclus-nu' : ''}`} aria-pressed={d.key === gekozen} onClick={() => kies(d.key)}>
                    <span className="wk-dag">{d.label}</span>
                    <span className="jr-vast-doel">{d.short}</span>
                    {d.key === vandaagKey && <span className="wk-vandaag">Vandaag</span>}
                    <span className="jr-pijl" aria-hidden="true">›</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* De gekozen dag */}
          <section ref={detailRef} className="pc-feest wk-detail" aria-labelledby="wk-dag-titel">
            <h2 id="wk-dag-titel" className="pc-feest-titel">{dag.label}</h2>
            <p className="pc-feest-onder">{tekst.subtitle}</p>
            <p className="pc-feest-tekst">{tekst.paragraphs[0]}</p>
            <div className="pc-feest-vakken">
              <div className="pc-vak jr-vak">
                <p className="pc-vak-label">Thema's van de dag</p>
                <p className="pc-tropaar">{tekst.highlight}</p>
                <p className="pc-vak-label wk-vasten-label">Vasten · {formatDag(datum)}</p>
                <p className="wk-vasten">
                  {info.vasten.label}
                  {info.vasten.periode ? ` · ${info.vasten.periode}` : ''}
                </p>
              </div>
              <nav className="pc-vak jr-vak" aria-label="Lees meer">
                <p className="pc-vak-label">Lees meer</p>
                <ul className="pc-meer">
                  <li>
                    <button type="button" onClick={() => setDayOpen(gekozen)}>
                      Meer over de {dag.label.toLowerCase()} ›
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => openDag(ymd(datum))}>
                      {dag.label} {formatDag(datum)} in de kalender ›
                    </button>
                  </li>
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

      <TimeSanctificationTimeline current="week" />

      <LiturgicalPopup open={dayOpen !== null} onClose={() => setDayOpen(null)} content={dayOpen ? DAY_POPUPS[dayOpen] : null} />
      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? WEEK_INFO[infoOpen] : null} />
    </>
  );
}
