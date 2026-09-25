import { useEffect, useMemo, useState } from 'react';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';
import { ChevronDown, Info } from 'lucide-react';
import { useApp } from '../lib/context';
import { WEEKDAGEN_KORT, dagInfo, formatDag, formatDatum, formatKort, weekRond, ymd } from '../lib/kalender';
import { vastenPeriodes } from '../lib/overzicht';
import { LADDER, NIVEAUS } from '../lib/vasten';
import { VASTEN_POPUPS } from '../lib/cyclusTeksten';
import { MobileListRow, VastenBadge, VastenKleuren } from './ui';
import Modal from './Modal';
import Cross from './Cross';
import { CycleTransition, GoldDivider, LiturgicalPopup } from './CycleSections';
import PageHero from './PageHero';

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

// Ronde iconen van de vier grote vasten (alleen zichtbaar op desktop, zie .major-icoon in index.css).
const PERIODE_ICOON: Record<string, string> = {
  'grote-vasten': '/images/ui/vasten-perioden/grote-vasten.webp',
  apostelvasten: '/images/ui/vasten-perioden/apostelvasten.webp',
  dormitionvasten: '/images/ui/vasten-perioden/dormitionvasten.webp',
  kerstvasten: '/images/ui/vasten-perioden/kerstvasten.webp',
};

const PERIODE_INFO: Record<string, { label: string; href: string; linkLabel: string; beweeglijk: boolean }> = {
  'grote-vasten': { label: 'Grote Vasten', href: '#pascha', linkLabel: 'Bekijk de Paschale cyclus', beweeglijk: true },
  apostelvasten: { label: 'Apostelvasten', href: '#pascha', linkLabel: 'Bekijk de Paschale cyclus', beweeglijk: true },
  dormitionvasten: { label: 'Ontslapenisvasten', href: '#jaar', linkLabel: 'Bekijk de jaarcyclus', beweeglijk: false },
  kerstvasten: { label: 'Kerstvasten', href: '#jaar', linkLabel: 'Bekijk de jaarcyclus', beweeglijk: false },
};

// Medaillon per weekdag: kruis op een vastendag, opkomende zon op een vrije dag.
function WeekMedaillon({ vast }: { vast: boolean }) {
  return vast ? (
    <Cross className="h-9 w-9" />
  ) : (
    <svg viewBox="0 0 48 48" className="h-11 w-11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M8 33h32" />
      <path d="M15 33a9 9 0 0 1 18 0" />
      <path d="M24 13v6M12.5 19l4 4M35.5 19l-4 4M7 27h5M36 27h5" />
      <path d="M14 38h20" opacity=".55" />
    </svg>
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
  const week = useMemo(() => weekRond(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);

  const vastenP = periodes.filter((p) => p.soort === 'vasten');
  const grotevier = ['grote-vasten', 'apostelvasten', 'dormitionvasten', 'kerstvasten'].map((id) => vastenP.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const vrijP = periodes.filter((p) => p.soort === 'vrij');
  const dagP = periodes.filter((p) => p.soort === 'dag');
  const geselecteerdeDagInfo = geselecteerdeDag ? dagInfo(new Date(`${geselecteerdeDag}T00:00:00Z`), mode) : null;
  const periodeGeopend = periodeOpen ? vastenP.find((p) => p.id === periodeOpen) : null;

  const onthoudingenVoor = (niveau: (typeof dagVandaag)['vasten']['niveau']) => [
    { label: 'Vlees', toegestaan: ['vrij', 'geen'].includes(niveau), iconSrc: '/images/ui/menu/08-Voeding-01-Vlees.webp' },
    { label: 'Zuivel', toegestaan: ['vrij', 'geen', 'zuivel'].includes(niveau), iconSrc: '/images/ui/menu/08-Voeding-02-Zuivel.webp' },
    { label: 'Eieren', toegestaan: ['vrij', 'geen', 'zuivel'].includes(niveau), iconSrc: '/images/ui/menu/08-Voeding-03-Eieren.webp' },
    { label: 'Vis', toegestaan: ['vrij', 'geen', 'zuivel', 'vis'].includes(niveau), iconSrc: '/images/ui/menu/08-Voeding-04-Vis.webp' },
    { label: 'Olie', toegestaan: ['vrij', 'geen', 'zuivel', 'vis', 'wijn-olie', 'vastendag'].includes(niveau), iconSrc: '/images/ui/menu/08-Voeding-05-Olie.webp' },
    { label: 'Wijn', toegestaan: ['vrij', 'geen', 'zuivel', 'vis', 'wijn-olie', 'vastendag'].includes(niveau), iconSrc: '/images/ui/menu/08-Voeding-06-Wijn.webp' },
  ];
  const onthoudingen = geselecteerdeDagInfo ? onthoudingenVoor(geselecteerdeDagInfo.vasten.niveau) : [];
  const onthoudingenVandaag = onthoudingenVoor(dagVandaag.vasten.niveau);
  const vastenVandaagAsset: Record<string, string> = {
    vrij: '01-Vastenvrij.webp', geen: '02-Geen-vasten.webp', zuivel: '03-Zuivel-toegestaan.webp', vis: '04-Vis-toegestaan.webp',
    'wijn-olie': '05-Wijn-en-olie.webp', gekookt: '06-Gekookt-zonder-olie.webp', vastendag: '07-Vastendag.webp',
    strikt: '08-Strikt-vasten.webp', onthouding: '09-Volledige-onthouding.webp'
  };
  const vastenVandaagIcon = vastenVandaagAsset[dagVandaag.vasten.niveau] ?? '02-Geen-vasten.webp';

  return (
    <>
      <PageHero id="vasten" alt="Vasten — een weg naar vrijheid" kop />

      {/* Informatiekaarten */}
      <section className="orthodox-pattern parchment-pattern bg-parchment py-16 text-ink sm:py-20">
        <div className={CONTENT}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { key: 'wat', title: 'Wat is vasten?', intro: 'Het typikon en de orde van de Kerk door het jaar heen.', iconSrc: '/images/ui/menu/07-Vasten-01-Wat-is-vasten.webp' },
                { key: 'hoe', title: 'Hoe vasten we?', intro: 'De ladder van het vasten, van vrij tot volledige onthouding.', iconSrc: '/images/ui/menu/07-Vasten-02-Hoe-vasten-we.webp' },
                { key: 'periodes', title: 'Vastenperioden', intro: 'Vier grote vasten, verweven met feesten en uitzonderingen.', iconSrc: '/images/ui/menu/07-Vasten-03-Vastenperiode.webp' },
                { key: 'betekenis', title: 'De geestelijke betekenis', intro: 'Vasten als gebed, bekering en liefde tot de naaste.', iconSrc: '/images/ui/menu/07-Vasten-04-De-geestelijke-betekenis.webp' },
              ] as const
            ).map(({ key, title, intro, iconSrc }) => (
              <button
                key={key}
                type="button"
                onClick={() => setInfoOpen(key)}
                className="ornate-card group flex min-h-[240px] flex-col px-7 py-8 text-left"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 text-gold-light">
                  <img loading="lazy" decoding="async" src={iconSrc} alt="" className="provided-card-icon" />
                </div>
                <h3 className="font-display mt-5 text-xl font-semibold text-gold-light uppercase">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#d9c6a3]">{intro}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Eén doorlopende compositie: vandaag → uitleg → jaarcyclus → week/uitzonderingen → gebed */}
      <section className="orthodox-pattern parchment-pattern relative bg-parchment py-14 text-ink sm:py-20">
        <div className={CONTENT}>
          {/* Vasten vandaag — donker inzetpaneel binnen dezelfde compositie */}
          <div className="v17-fasting-today provided-wide-frame orthodox-pattern rounded-2xl border border-gold/40 bg-[#1c130d] px-6 py-8 text-cream shadow-[0_20px_45px_rgba(0,0,0,0.35)] sm:px-10 sm:py-10">
            <p className="ot-label ot-label-licht text-center">Vasten vandaag</p>
            <div className="mt-5 flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left"><img loading="lazy" decoding="async" src={`/images/ui/vasten-vandaag/${vastenVandaagIcon}`} alt="" className="vasten-vandaag-status-icon" />
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#fbf3df] sm:text-3xl">
                  {/* Stip in de kleur van de kalender-legenda */}
                  <span aria-hidden="true" className="mr-2.5 inline-block h-3 w-3 -translate-y-0.5 rounded-full align-middle" style={{ background: niveauVandaag.kleur, boxShadow: `0 0 0 3px color-mix(in srgb, ${niveauVandaag.kleur} 28%, transparent)` }} />
                  {dagVandaag.vasten.label}
                </h2>
                <p className="mt-2 text-sm text-[#d9c6a3] sm:text-base">{niveauVandaag.toegestaan}</p>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#bfa982]">{dagVandaag.vasten.detail}</p>
                {dagVandaag.vasten.periode && (
                  <p className="ot-label ot-label-licht mt-2">{dagVandaag.vasten.periode}</p>
                )}
              </div>
            </div>
            <div className="fasting-food-grid mt-6 border-t border-gold/20 pt-5">
              {onthoudingenVandaag.map(({ label, toegestaan, iconSrc }) => (
                <div key={label} className="fasting-food-item">
                  <span className="fasting-food-icon">
                    <img loading="lazy" decoding="async" src={iconSrc} alt="" className="h-full w-full object-contain" />
                  </span>
                  <span className="fasting-food-status text-base leading-none font-semibold" style={{ color: toegestaan ? '#2f7a44' : '#a33a3a' }}>
                    {toegestaan ? '✓' : '×'}
                  </span>
                  <span className="text-[10px] leading-tight text-[#d9c6a3] sm:text-xs">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <a
                href="#kalender"
                className="btn-pill"
              >
                Bekijk vastendagen in de kalender →
              </a>
            </div>
          </div>

          {/* Doorlopende verticale lijn verbindt het dagpaneel met de algemene uitleg — geen nieuwe pagina */}
          <div className="mx-auto mt-10 max-w-3xl border-l-2 border-gold/40 pl-6 text-center sm:mt-14 sm:pl-0 sm:text-left sm:border-l-0 sm:border-t-2 sm:pt-8">
            <p className="ot-label">Wat betekent vasten?</p>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft sm:text-lg">
              De orthodoxe Kerk vast ongeveer de helft van het jaar: vier grote vastenperiodes, enkele strenge dagen en elke
              woensdag en vrijdag. Vasten zonder gebed en aalmoes is, naar het woord van de Vaders, slechts een dieet — het
              hoort samen met bekering, zelfbeheersing, liefde tot de naaste en de voorbereiding op de feesten van de Kerk.
            </p>
          </div>

          <GoldDivider />

          {/* De vasten door het jaar */}
          <div className="parchment-pattern relative overflow-hidden rounded-lg border border-gold/50 bg-[#f4ead6] px-6 py-10 shadow-[0_22px_52px_rgba(55,31,15,0.18)] sm:px-10 lg:px-14">
            <span aria-hidden="true" className="hoeksier absolute left-4 top-4" />
            <span aria-hidden="true" className="hoeksier absolute bottom-4 right-4 rotate-180" />
            <div className="flex flex-wrap items-end justify-between gap-4 text-center sm:text-left">
              <div className="mx-auto sm:mx-0">
                <p className="ot-label">De vasten door het jaar</p>
                <h2 className="font-display mt-2 text-2xl font-semibold text-ink sm:text-3xl">De vier grote vasten van {jaar}</h2>
              </div>
              <div className="v17-year-selector mx-auto flex items-center sm:mx-0" role="group" aria-label="Jaar kiezen">
                <button type="button" className="v17-year-arrow" onClick={() => setJaar(jaar - 1)} aria-label="Vorig jaar">‹</button>
                <span className="v17-year-current">{jaar}</span>
                <span className="v17-year-divider">✣</span>
                <span className="v17-year-next">{jaar + 1}</span>
                <button type="button" className="v17-year-arrow" onClick={() => setJaar(jaar + 1)} aria-label="Volgend jaar">›</button>
              </div>
            </div>

            <div className="v15-major-fasts relative mt-8">
              
              {grotevier.map((p) => {
                const info = PERIODE_INFO[p.id];
                return (
                  <article key={p.id} className="v15-major-fast cursor-pointer" role="button" tabIndex={0} onClick={() => setPeriodeOpen(p.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPeriodeOpen(p.id); } }}>
                    {PERIODE_ICOON[p.id] && <img className="major-icoon" src={PERIODE_ICOON[p.id]} alt="" loading="lazy" decoding="async" />}
                    
                    <div className="flex flex-wrap items-start justify-between gap-2 pl-3">
                      <div>
                        <h4 className="font-display text-xl font-semibold">{(info?.label ?? p.naam).replace(/(apostel|ontslapenis)(vasten)/i, '$1­$2')}</h4>
                        <p className="major-meta">
                          {formatDag(p.start)} – {formatDatum(p.eind)} · {p.dagen} dagen
                        </p>
                      </div>
                      {info?.beweeglijk && <span className="major-badge">Beweeglijk</span>}
                    </div>
                    <p className="mt-4 pl-3 text-sm leading-relaxed text-ink-soft">{p.omschrijving}</p>
                    <div className="major-actions">
                      {info && (
                        <a href={info.href} className="btn-pill">
                          {info.linkLabel} →
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <GoldDivider />

          {/* Het wekelijkse vasten + vastenvrije periodes — compact, geïntegreerd naast elkaar */}
          <div className="rounded-2xl border border-gold/30 bg-[#f8f1e3] p-6 sm:p-8">
            <p className="ot-label">Het wekelijkse vasten</p>
            <h3 className="font-display mt-2 text-2xl font-semibold text-ink sm:text-3xl">Woensdag en vrijdag</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft sm:text-base">
              De woensdag herinnert aan het verraad van Judas, de vrijdag aan de kruisiging. Beide dagen worden al sinds de
              eerste eeuwen gevast — het staat al in de Didachè. Vastenvrij zijn alleen de Lichte Week, de week na
              Pinksteren, de Kersttijd en de week na Tollenaar en Farizeeër.
            </p>
            <a href="#week" className="btn-pill mt-3">
              Ontdek de weekcyclus →
            </a>

            {/* Deze week (levend voorbeeld, geen hardgecodeerde status) */}
            <div className="mt-6 border-t border-gold/25 pt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="ot-label">Deze week</p>
                  <h4 className="font-display mt-1 text-xl font-semibold text-ink">
                    {formatKort(week[0].civil)} – {formatDatum(week[6].civil)}
                  </h4>
                </div>
                <p className="text-xs text-ink-mute">Tik een dag voor het volledige dagdetail.</p>
              </div>
              <div className="mlr-lijst week-rijen mt-4">
                {week.map((d) => {
                  const n = NIVEAUS[d.vasten.niveau];
                  const vast = d.vasten.niveau !== 'vrij' && d.vasten.niveau !== 'geen';
                  return (
                    <MobileListRow
                      key={d.ymd}
                      onClick={() => setGeselecteerdeDag(d.ymd)}
                      className={`${vast ? 'is-fast' : ''} ${d.isVandaag ? 'is-today' : ''}`}
                      style={{ ['--niveau' as string]: n.kleur }}
                      links={<><small>{WEEKDAGEN_KORT[d.weekdag]}</small><b>{d.dag}</b></>}
                      icoon={<span className="week-dag-medaillon"><WeekMedaillon vast={vast} /></span>}
                      titel={d.vasten.niveau === 'geen' ? n.label : n.kort}
                      rechts={<span className="week-dag-balk" aria-hidden="true" />}
                    />
                  );
                })}
              </div>
              <div className="week-dagen">
                {week.map((d) => {
                  const n = NIVEAUS[d.vasten.niveau];
                  const vast = d.vasten.niveau !== 'vrij' && d.vasten.niveau !== 'geen';
                  return (
                    <button
                      key={d.ymd}
                      type="button"
                      onClick={() => setGeselecteerdeDag(d.ymd)}
                      className={`week-dag ${vast ? 'is-fast' : ''} ${d.isVandaag ? 'is-today' : ''}`}
                      style={{ ['--niveau' as string]: n.kleur }}
                    >
                      <span className="week-dag-naam">{WEEKDAGEN_KORT[d.weekdag]}</span>
                      <span className="week-dag-nummer">{d.dag}</span>
                      <span className="week-dag-medaillon" aria-hidden="true">
                        <WeekMedaillon vast={vast} />
                      </span>
                      <span className="week-dag-balk" />
                      <span className="week-dag-label">{n.kort}</span>
                    </button>
                  );
                })}
              </div>

              {/* Kleurlegenda (alleen mobiel): dezelfde kleuren als in de kalender en bij "Vasten vandaag" */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-gold/30 bg-[#f3e9d2] px-4 py-3 text-[11px] font-semibold text-ink-soft min-[641px]:hidden">
                <span className="text-[10px] font-bold tracking-widest text-gold-deep uppercase">Legenda</span>
                <VastenKleuren actief={dagVandaag.vasten.niveau} />
              </div>
            </div>

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

          {/* FAQ / praktisch */}
          <div className="parchment-pattern rounded-lg border border-gold/35 bg-[#f7edda]/75 px-5 py-7 shadow-[0_14px_34px_rgba(55,31,15,0.1)] sm:px-8 sm:py-9">
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
                  className={`rounded-xl border border-gold/40 shadow-[0_10px_24px_rgba(55,31,15,0.08)] transition-colors duration-300 ${openFaq === i ? 'bg-[#ead9b7]/60' : 'bg-[#f8f1e3]'}`}
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
        </div>
      </section>

      {/* Vasten en gebed */}
      <CycleTransition
        quote="Waakt en bidt, opdat gij niet in verzoeking komt."
        citation="Matteüs 26:41"
        eyebrow="Vasten en gebed"
        text="Vasten zonder gebed en aalmoes is, naar het woord van de Vaders, slechts een dieet. Vasten en gebed horen bij elkaar."
        buttonLabel="Naar gebeden"
        buttonHref="#gebeden"
      />

      {geselecteerdeDagInfo && (
        <Modal open={Boolean(geselecteerdeDagInfo)} onClose={() => setGeselecteerdeDag(null)} eyebrow="Vasteninformatie" title={formatDatum(geselecteerdeDagInfo.civil)} centerTitle maxWidth="max-w-2xl">
            <div className="space-y-3">
              <div className="ot-label">{geselecteerdeDagInfo.weekdagNaam}</div>
              <VastenBadge regel={geselecteerdeDagInfo.vasten} size="lg" />
              <div>
                <h3 className="font-display text-2xl font-semibold text-ink">{geselecteerdeDagInfo.weekdagNaam}</h3>
                <p className="mt-1 font-display text-lg italic leading-relaxed text-ink-soft">{geselecteerdeDagInfo.vasten.detail}</p>
              </div>
              <div className="gold-rule my-5" />
              <div>
                <p className="ot-label mb-2">Vandaag onthouden van</p>
                <div className="fasting-food-grid">
                  {onthoudingen.map(({ label, toegestaan, iconSrc }) => (
                    <div key={label} className="fasting-food-item">
                      <span className="fasting-food-icon">
                        <img loading="lazy" decoding="async" src={iconSrc} alt="" className="h-full w-full object-contain" />
                      </span>
                      <span className="text-base font-semibold leading-none" style={{ color: toegestaan ? '#4a7c59' : '#7b1e1e' }}>{toegestaan ? '✓' : '×'}</span>
                      <span className="font-display text-[11px] leading-tight text-[#5c4d38] sm:text-sm">{label}</span>
                    </div>
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

