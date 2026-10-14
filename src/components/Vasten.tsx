import { useEffect, useMemo, useState } from 'react';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { useApp } from '../lib/context';
import { dagInfo, formatDag, formatDatum, formatKort, hoofdletter, ymd } from '../lib/kalender';
import { vastenPeriodes } from '../lib/overzicht';
import { LADDER, NIVEAUS } from '../lib/vasten';
import { VASTEN_POPUPS } from '../lib/cyclusTeksten';
import { VastenBadge } from './ui';
import Modal from './Modal';
import { CycleTransition, GoldDivider, LiturgicalPopup } from './CycleSections';
import Verdieping from './Verdieping';
import ExactPageFrame from './ExactPageFrame';
import NisKop from './NisKop';
import { ActieKnop, BannerBeeld, Sierlijn } from './onderdelen';
import { usePaginaOpen } from '../lib/paginaOpen';
import './Vandaag.css';
import './ontwerp.css';

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

const FAQ = [
  {
    v: 'Wat als een feest in een vastenperiode valt?',
    a: 'Dan wordt het vasten verzacht. Bij een groot feest (zoals de Annunciatie of de Transfiguratie) mag er vis gegeten worden; bij een polyeleosfeest wijn en olie. Op woensdag en vrijdag buiten de vastenperiodes heft een groot feest het vasten op tot een visdag. Alleen de Kruisverheffing blijft een vastendag.',
  },
  {
    v: 'Waarom woensdag én vrijdag?',
    a: 'De woensdag herinnert aan het verraad van Judas, de vrijdag aan de kruisiging. Beide dagen worden al sinds de eerste eeuwen gevast — het staat al in de Didachè. Vastenvrij zijn alleen de Lichte Week, de week na Pinksteren, de Kersttijd en de week na Tollenaar en Farizeeër.',
  },
  {
    v: 'Hoe streng moet ik het nemen?',
    a: 'De regels hier volgen het kloostertypikon in de gangbare parochiële toepassing. Zieken, zwangeren, kinderen, ouderen en reizigers vasten altijd in overleg met hun priester — barmhartigheid gaat boven de letter. Vasten zonder gebed en aalmoes is, naar het woord van de Vaders, slechts een dieet.',
  },
  {
    v: 'Wat is xerofagie?',
    a: 'Letterlijk „droog eten”: brood, rauwe of gedroogde groenten en fruit, noten, olijven en water — zonder olie of wijn, en oorspronkelijk één maaltijd na de Vespers. Het is de strikte norm van de Grote Vasten op maandag, woensdag en vrijdag.',
  },
];

type InfoKey = 'wat' | 'hoe' | 'periodes' | 'betekenis';

// De negen treden van de vastenladder, als tekst (geen iconen) — rechtstreeks uit lib/vasten.ts,
// zodat deze lijst niet los kan raken van de ladder die elders op de site gebruikt wordt.
const NEGEN_TREDEN_ITEMS = LADDER.map((l) => `${l.trap}. ${l.label} — ${l.toegestaan}.`);

const INFO_POPUPS: Record<InfoKey, typeof VASTEN_POPUPS[InfoKey]> = {
  ...VASTEN_POPUPS,
  hoe: {
    ...VASTEN_POPUPS.hoe,
    sections: [
      ...(VASTEN_POPUPS.hoe.sections ?? []),
      {
        heading: 'De ladder van het vasten — negen treden',
        paragraphs: [
          'Niet elke vastendag is even streng. Hoe dichter bij Pascha, hoe scherper het vasten; hoe groter het feest, hoe meer ruimte. Van vastenvrij tot volledige onthouding kent het vasten negen treden:',
        ],
        items: NEGEN_TREDEN_ITEMS,
      },
    ],
  },
};

const PERIODE_INFO: Record<string, { label: string; href: string; linkLabel: string; beweeglijk: boolean }> = {
  'grote-vasten': { label: 'Grote Vasten', href: '#pascha', linkLabel: 'Bekijk de Paascyclus', beweeglijk: true },
  apostelvasten: { label: 'Apostelvasten', href: '#pascha', linkLabel: 'Bekijk de Paascyclus', beweeglijk: true },
  dormitionvasten: { label: 'Ontslapenisvasten', href: '#jaar', linkLabel: 'Bekijk de jaarcyclus', beweeglijk: false },
  kerstvasten: { label: 'Kerstvasten', href: '#jaar', linkLabel: 'Bekijk de jaarcyclus', beweeglijk: false },
};

// Medaillon per weekdag: kruis op een vastendag, opkomende zon op een vrije dag.
// Voedselkaart (Vlees, Zuivel, Eieren, Vis, Olie, Wijn; scripts/voedselkaarten.mjs) met in de lege cirkel een vinkje
// (toegestaan) of kruis (niet toegestaan). De naam staat al op de kaart; voor schermlezers staat hij er als tekst bij.
function VoedselKaart({ label, toegestaan }: { label: string; toegestaan: boolean }) {
  return (
    <div className={`voedsel-kaart${toegestaan ? ' is-toegestaan' : ' is-niet'}`}>
      <img src={`/images/ui/voeding/${label.toLowerCase()}.webp`} alt="" width={300} height={620} loading="lazy" decoding="async" />
      <span className="voedsel-teken" aria-hidden="true">{toegestaan ? '✓' : '✕'}</span>
      <span className="sr-only">{label}: {toegestaan ? 'toegestaan' : 'niet toegestaan'}</span>
    </div>
  );
}

type FastingRij = { key: string; naam: string; wanneer: string; onClick?: () => void };

// Donker vastenpaneel met naam + datum per regel. Mobiel staat de datum onder de naam, vanaf sm ernaast.
function FastingTable({ titel, rijen, noot }: { titel: string; rijen: FastingRij[]; noot?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="v15-fasting-panel fasting-table p-5 sm:p-6">
      {/* Mobiel inklapbaar; vanaf 768px altijd open */}
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="fasting-table-kop">
        <h4 className="font-display text-xl font-semibold">{titel}</h4>
        <ChevronDown className={`h-5 w-5 transition md:hidden ${open ? 'rotate-180' : ''}`} />
      </button>
      <ul className={`mt-3 ${open ? '' : 'max-md:hidden'}`}>
        {rijen.map((r) => {
          const inhoud = (
            <>
              <span className="fasting-table-naam">{r.naam}</span>
              <span className="fasting-table-wanneer">{r.wanneer}</span>
            </>
          );
          return (
            <li key={r.key}>
              {r.onClick ? (
                <button type="button" onClick={r.onClick} className="fasting-table-rij">{inhoud}</button>
              ) : (
                <div className="fasting-table-rij">{inhoud}</div>
              )}
            </li>
          );
        })}
      </ul>
      {noot && <p className={`fasting-table-noot ${open ? '' : 'max-md:hidden'}`}>{noot}</p>}
    </div>
  );
}

export default function Vasten() {
  const { mode, vandaag, vandaagYmd } = useApp();
  const open = usePaginaOpen('vasten');
  const [jaar, setJaar] = useState(vandaag.getUTCFullYear());
  // Op mobiel starten alle vragen dicht (compacter); op desktop staat de eerste open.
  const [openFaq, setOpenFaq] = useState<number | null>(() => (window.matchMedia('(min-width: 768px)').matches ? 0 : null));
  const [geselecteerdeDag, setGeselecteerdeDag] = useState<string | null>(null);

  // Vandaag kan een pop-up van deze pagina openen.
  useEffect(() => {
    const opPopup = (event: Event) => {
      const { pagina, sleutel } = (event as CustomEvent<OpenPopupDetail>).detail;
      if (pagina === 'vasten') setGeselecteerdeDag(sleutel);
    };
    window.addEventListener(OPEN_POPUP_EVENT, opPopup);
    return () => window.removeEventListener(OPEN_POPUP_EVENT, opPopup);
  }, []);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const [periodeOpen, setPeriodeOpen] = useState<string | null>(null);

  const dagVandaag = useMemo(() => dagInfo(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);
  const niveauVandaag = NIVEAUS[dagVandaag.vasten.niveau];

  const periodes = useMemo(() => vastenPeriodes(jaar, mode), [jaar, mode]);

  const vastenP = periodes.filter((p) => p.soort === 'vasten');
  const grotevier = ['grote-vasten', 'apostelvasten', 'dormitionvasten', 'kerstvasten'].map((id) => vastenP.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const vrijP = periodes.filter((p) => p.soort === 'vrij');
  const dagP = periodes.filter((p) => p.soort === 'dag');
  const geselecteerdeDagInfo = geselecteerdeDag ? dagInfo(new Date(`${geselecteerdeDag}T00:00:00Z`), mode) : null;
  const periodeGeopend = periodeOpen ? vastenP.find((p) => p.id === periodeOpen) : null;

  const onthoudingenVoor = (niveau: (typeof dagVandaag)['vasten']['niveau']) => [
    { label: 'Vlees', toegestaan: ['vrij', 'geen'].includes(niveau) },
    { label: 'Zuivel', toegestaan: ['vrij', 'geen', 'zuivel'].includes(niveau) },
    { label: 'Eieren', toegestaan: ['vrij', 'geen', 'zuivel'].includes(niveau) },
    { label: 'Vis', toegestaan: ['vrij', 'geen', 'zuivel', 'vis'].includes(niveau) },
    { label: 'Olie', toegestaan: ['vrij', 'geen', 'zuivel', 'vis', 'wijn-olie', 'vastendag'].includes(niveau) },
    { label: 'Wijn', toegestaan: ['vrij', 'geen', 'zuivel', 'vis', 'wijn-olie', 'vastendag'].includes(niveau) },
  ];
  const onthoudingen = geselecteerdeDagInfo ? onthoudingenVoor(geselecteerdeDagInfo.vasten.niveau) : [];
  const onthoudingenVandaag = onthoudingenVoor(dagVandaag.vasten.niveau);
  // Symbool van vandaag: brood en olijven bij een vastendag, vis, druiven en beker als er niet gevast wordt.
  const vastenVandaagIcon = ['vrij', 'geen'].includes(dagVandaag.vasten.niveau) ? '/images/ui/vastenvrij.webp' : '/images/ui/vasten.webp';

  const infoKaarten = (
    <Verdieping
      items={
        [
          { key: 'wat', title: 'Wat is vasten?', intro: 'Het typikon en de orde van de Kerk door het jaar heen.' },
          { key: 'hoe', title: 'Hoe vasten we?', intro: 'De ladder van het vasten, van vrij tot volledige onthouding.' },
          { key: 'periodes', title: 'Vastenperioden', intro: 'Vier grote vasten, verweven met feesten en uitzonderingen.' },
          { key: 'betekenis', title: 'De geestelijke betekenis', intro: 'Vasten als gebed, bekering en liefde tot de naaste.' },
        ] as const
      }
      onOpen={setInfoOpen}
    />
  );

  return (
    <>
      {/* Bovenkant volgens het overdrachtspakket (referentie kalender-pascha-feesten-vasten.png, paneel 4): de vasten van
          vandaag met de bestaande voedselkaarten, de week met de vastenkleuren en de vier grote vasten met hun bestaande
          iconen. Alle gegevens uit lib/vasten.ts en lib/overzicht.ts; elke dag en periode opent het bestaande venster. */}
      <section id="vasten" className="vg ot-redesign ot-vasten">
        <NisKop open={open} balk achter={<BannerBeeld naam="vasten-banner" open={open} />} />
        <div className="vg-papier ot-inhoud">
          <img className="ot-vs-status" src={vastenVandaagIcon} alt="" width={256} height={256} decoding="async" />
          <p className="vg-label ot-vs-label">Vandaag</p>
          <h1 className="ot-titel">{dagVandaag.vasten.label}</h1>
          <Sierlijn />
          <p className="ot-vs-toegestaan">{niveauVandaag.toegestaan}</p>
          <p className="ot-vs-detail">{dagVandaag.vasten.detail}</p>
          {dagVandaag.vasten.periode && <p className="ot-vs-periode">{dagVandaag.vasten.periode}</p>}

          <div className="ot-twee">
            <div>
              <h2 className="ot-kop">Toegestane spijzen vandaag</h2>
              <div className="fasting-food-grid ot-vs-spijzen">
                {onthoudingenVandaag.map(({ label, toegestaan }) => (
                  <VoedselKaart key={label} label={label} toegestaan={toegestaan} />
                ))}
              </div>

            </div>

            <div>
              <h2 className="ot-kop">De vier grote vasten</h2>
              <ul className="ot-register">
                {grotevier.map((p) => (
                  <li key={p.id}>
                    <button type="button" className="ot-rij" onClick={() => setPeriodeOpen(p.id)}>
                      <span className="ot-rij-symbool" aria-hidden="true"><img src={`/images/ui/vasten-perioden/${p.id}.webp`} alt="" width={96} height={96} loading="lazy" decoding="async" /></span>
                      <span className="ot-rij-tekst">
                        <b>{PERIODE_INFO[p.id]?.label ?? p.naam}</b>
                        <span>{formatDag(p.start)} – {formatDatum(p.eind)}{PERIODE_INFO[p.id]?.beweeglijk ? ' · beweeglijk' : ''}</span>
                      </span>
                      <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="ot-knoprij"><ActieKnop omlijnd onClick={() => setInfoOpen('wat')}>Meer over vasten</ActieKnop></div>
            </div>
          </div>
        </div>
      </section>

      <ExactPageFrame title="Vasten">
      {/* Volgorde: uitleg → het wekelijkse vasten → de vier grote vasten → praktisch → de vier informatiekaarten */}
      <div className="orthodox-pattern parchment-pattern relative bg-parchment py-14 text-ink sm:py-20">
        <div className={CONTENT}>
          {/* Doorlopende verticale lijn verbindt het dagpaneel met de algemene uitleg — geen nieuwe pagina */}
          <div className="md:hidden mx-auto mt-10 max-w-3xl border-l-2 border-gold/40 pl-6 text-center sm:mt-14 sm:pl-0 sm:text-left sm:border-l-0 sm:border-t-2 sm:pt-8">
            <p className="ot-label">Wat betekent vasten?</p>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft sm:text-lg">
              De Orthodoxe Kerk vast ongeveer de helft van het jaar: vier grote vastenperiodes, enkele strenge dagen en elke
              woensdag en vrijdag. Vasten zonder gebed en aalmoes is, naar het woord van de Vaders, slechts een dieet — het
              hoort samen met bekering, zelfbeheersing, liefde tot de naaste en de voorbereiding op de feesten van de Kerk.
            </p>
          </div>

          <GoldDivider />

          {/* Het wekelijkse vasten + vastenvrije periodes — compact, geïntegreerd naast elkaar */}
          <div className="vlak rounded-2xl border border-gold/30 bg-[#f8f1e3] p-6 sm:p-8">
            <p className="ot-label">Het wekelijkse vasten</p>
            <h3 className="font-display mt-2 text-2xl font-semibold text-ink sm:text-3xl">Woensdag en vrijdag</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft sm:text-base">
              De woensdag herinnert aan het verraad van Judas, de vrijdag aan de kruisiging. Beide dagen worden al sinds de
              eerste eeuwen gevast — het staat al in de Didachè. Vastenvrij zijn alleen de Lichte Week, de week na
              Pinksteren, de Kersttijd en de week na Tollenaar en Farizeeër.
            </p>
            <a href="#week" className="btn-pill cyclus-verder mt-3">
              Ontdek de weekcyclus ›
            </a>

            {/* Vastenvrije periodes en strenge losse vastendagen — direct aansluitend, geen los dashboard */}
            <div className="mt-8 grid gap-4 border-t border-gold/25 pt-6 lg:grid-cols-2">
              <FastingTable
                titel="Vastenvrije weken"
                rijen={vrijP.map((p) => ({ key: p.id, naam: p.naam, wanneer: `${formatKort(p.start)} – ${formatKort(p.eind)}`, onClick: () => setGeselecteerdeDag(ymd(p.start)) }))}
              />
              <FastingTable
                titel="Strenge losse vastendagen"
                rijen={[
                  ...dagP.map((p) => ({ key: p.id, naam: p.naam, wanneer: formatDatum(p.start), onClick: () => setGeselecteerdeDag(ymd(p.start)) })),
                  { key: 'woensdag-vrijdag', naam: 'Elke woensdag en vrijdag', wanneer: 'buiten de vastenvrije weken' },
                ]}
                noot="Woensdag en vrijdag zijn in de regel vastendagen, behalve in vastenvrije perioden."
              />
            </div>
          </div>

          <GoldDivider />

          {/* Web: de uitleg na het wekelijkse vasten (op mobiel staat hij direct onder vasten vandaag) */}
          <div className="max-md:hidden mx-auto mt-10 mb-12 max-w-3xl border-l-2 border-gold/40 pl-6 text-center sm:mt-14 sm:pl-0 sm:text-left sm:border-l-0 sm:border-t-2 sm:pt-8">
            <p className="ot-label">Wat betekent vasten?</p>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft sm:text-lg">
              De Orthodoxe Kerk vast ongeveer de helft van het jaar: vier grote vastenperiodes, enkele strenge dagen en elke
              woensdag en vrijdag. Vasten zonder gebed en aalmoes is, naar het woord van de Vaders, slechts een dieet — het
              hoort samen met bekering, zelfbeheersing, liefde tot de naaste en de voorbereiding op de feesten van de Kerk.
            </p>
          </div>


          {/* De vasten door het jaar */}
          {/* Zelfde kader als "De grote bewegingen" op Jaar (index.css, Bouw 174): dubbele lijn, kolommen met een beeld per vasten */}
          <div className="vlak jr-vak vs-kader">
            <div className="flex flex-wrap items-end justify-between gap-4 text-center sm:text-left">
              <div className="mx-auto sm:mx-0">
                <p className="ot-label">De vasten door het jaar</p>
                <h2 className="ot-titel font-display mt-2 text-2xl font-semibold sm:text-3xl">De vier grote vasten van {jaar}</h2>
              </div>
              <div className="v17-year-selector mx-auto flex items-center sm:mx-0" role="group" aria-label="Jaar kiezen">
                <button type="button" className="v17-year-arrow" onClick={() => setJaar(jaar - 1)} aria-label="Vorig jaar">‹</button>
                <span className="v17-year-current">{jaar}</span>
                <span className="v17-year-divider">✣</span>
                <span className="v17-year-next">{jaar + 1}</span>
                <button type="button" className="v17-year-arrow" onClick={() => setJaar(jaar + 1)} aria-label="Volgend jaar">›</button>
              </div>
            </div>

            <div className="vs-vasten">
              {grotevier.map((p) => {
                const info = PERIODE_INFO[p.id];
                return (
                  <article key={p.id} className="vs-vast" role="button" tabIndex={0} onClick={() => setPeriodeOpen(p.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPeriodeOpen(p.id); } }}>
                    <img src={`/images/jaar/${p.id}.webp`} alt="" width={464} height={272} loading="lazy" decoding="async" />
                    <h4 className="vs-vast-naam">{(info?.label ?? p.naam).replace(/(apostel|ontslapenis)(vasten)/i, '$1­$2')}</h4>
                    <p className="vs-vast-data">
                      {formatDag(p.start)} – {formatDatum(p.eind)} · {p.dagen} dagen{info?.beweeglijk ? ' · beweeglijk' : ''}
                    </p>
                    <p className="vs-vast-tekst">{p.omschrijving}</p>
                    {info && (
                      <a href={info.href} className="jr-link" onClick={(e) => e.stopPropagation()}>
                        {info.linkLabel} ›
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          <GoldDivider />

          {/* FAQ / praktisch */}
          <div className="vlak parchment-pattern rounded-lg border border-gold/35 bg-[#f7edda]/75 px-5 py-7 shadow-[0_14px_34px_rgba(55,31,15,0.1)] sm:px-8 sm:py-9">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]">
            <div>
              <p className="ot-label">Hoe ziet vasten er praktisch uit?</p>
              <h3 className="font-display mt-1 text-2xl font-semibold text-ink">Het vasten is een school, geen examen</h3>
              <p className="ot-tekst mt-3 text-sm leading-relaxed text-ink-soft">
                Het typikon is het kerkelijke boek van de orde: het zegt welke dienst wanneer wordt gehouden, welke heilige
                gevierd wordt en hoe streng er die dag gevast wordt. Wie de kalender leest, leest de tijd — niet in
                maanden, maar in het leven van Christus.
              </p>
              <div className="mt-4 flex items-start gap-2 border-y border-gold/45 bg-[#ead9b7]/65 p-4 text-xs text-ink">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                De kalender is een leidsman, geen wetboek: volg voor het vasten het woord van uw geestelijke. Dit is
                liturgische informatie, geen medisch of pastoraal advies.
              </div>
            </div>
            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <div
                  key={item.v}
                  className={`vasten-faq rounded-xl border border-gold/40 shadow-[0_10px_24px_rgba(55,31,15,0.08)] transition-colors duration-300 ${openFaq === i ? 'bg-[#ead9b7]/60' : 'bg-[#f8f1e3]'}`}
                >
                  <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-gold-pale/40">
                    <span className="font-display text-lg font-semibold text-ink">{item.v}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-gold-deep transition ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && <p className="px-5 pb-4 text-sm leading-relaxed text-ink-soft">{item.a}</p>}
                </div>
              ))}
            </div>
          </div>
          </div>

          <GoldDivider />

          {/* De vier informatiekaarten */}
          {infoKaarten}
        </div>
      </div>

      {/* Vasten en gebed */}
      <CycleTransition
        quote="Waakt en bidt, opdat gij niet in verzoeking komt."
        citation="Matteüs 26:41"
        eyebrow="Vasten en gebed"
        text="Vasten zonder gebed en aalmoes is, naar het woord van de Vaders, slechts een dieet. Vasten en gebed horen bij elkaar."
        buttonLabel="Naar gebeden"
        buttonHref="#gebeden"
      />
      </ExactPageFrame>

      {geselecteerdeDagInfo && (
        <Modal open={Boolean(geselecteerdeDagInfo)} onClose={() => setGeselecteerdeDag(null)} eyebrow="Vasteninformatie" title={formatDatum(geselecteerdeDagInfo.civil)} centerTitle maxWidth="max-w-2xl">
            <div className="space-y-3">
              <VastenBadge regel={geselecteerdeDagInfo.vasten} size="lg" />
              <div>
                {/* De weekdag alleen als het vastenlabel hem nog niet noemt ("Vrijdag — vastendag"). */}
                {!geselecteerdeDagInfo.vasten.label.toLowerCase().startsWith(geselecteerdeDagInfo.weekdagNaam.toLowerCase()) && (
                  <h3 className="font-display text-2xl font-semibold text-ink">{hoofdletter(geselecteerdeDagInfo.weekdagNaam)}</h3>
                )}
                <p className="mt-1 font-display text-lg italic leading-relaxed text-ink-soft">{geselecteerdeDagInfo.vasten.detail}</p>
              </div>
              <div className="gold-rule my-5" />
              <div>
                <p className="ot-label mb-2">Toegestaan op deze dag</p>
                <div className="fasting-food-grid">
                  {onthoudingen.map(({ label, toegestaan }) => (
                    <VoedselKaart key={label} label={label} toegestaan={toegestaan} />
                  ))}
                </div>
              </div>
              {geselecteerdeDagInfo.vasten.periode && <p className="text-sm font-semibold text-gold-deep">{geselecteerdeDagInfo.vasten.periode}</p>}
              <div className="gold-rule mt-5" />
              <blockquote className="font-display pt-1 text-center text-lg italic leading-relaxed text-ink-soft">
                “Waakt en bidt, opdat gij niet in verzoeking komt.”
                <cite className="ot-label mt-1 block not-italic">Matteüs 26:41</cite>
              </blockquote>
            </div>
        </Modal>
      )}

      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? INFO_POPUPS[infoOpen] : null} />
      <LiturgicalPopup
        open={periodeGeopend !== null && periodeGeopend !== undefined}
        onClose={() => setPeriodeOpen(null)}
        content={
          periodeGeopend
            ? {
                title: PERIODE_INFO[periodeGeopend.id]?.label ?? periodeGeopend.naam,
                subtitle: `${formatDag(periodeGeopend.start)} – ${formatDatum(periodeGeopend.eind)} · ${periodeGeopend.dagen} dagen`,
                paragraphs: [periodeGeopend.omschrijving, ...periodeGeopend.regels],
              }
            : null
        }
      />
    </>
  );
}

