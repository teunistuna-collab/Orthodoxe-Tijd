import { useEffect, useMemo, useState } from 'react';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { useApp } from '../lib/context';
import { addDays, dagInfo, formatDag, formatDatum, formatKort, hoofdletter, ymd } from '../lib/kalender';
import { vastenPeriodes, type Periode } from '../lib/overzicht';
import { LADDER, NIVEAUS } from '../lib/vasten';
import { VASTEN_POPUPS } from '../lib/cyclusTeksten';
import { VastenBadge } from './ui';
import Modal from './Modal';
import { CycleTransition, GoldDivider, LiturgicalPopup } from './CycleSections';
import Verdieping from './Verdieping';
import ExactPageFrame from './ExactPageFrame';
import NisKop from './NisKop';
import VastenTafel from './VastenTafel';
import VoedselTegels from './VoedselTegels';
import { voedselStatus } from '../lib/voedselgroepen';
import { PASTORALE_NOOT, vastenBetekenis } from '../lib/vastenBetekenis';
import { BannerBeeld, Sierlijn } from './onderdelen';
import { usePaginaOpen } from '../lib/paginaOpen';
import { useMobiel } from '../lib/desktop';
import './Vandaag.css';
import './ontwerp.css';
import './vasten-mobiel.css';

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

const FAQ = [
  {
    v: 'Wat als een feest in een vastenperiode valt?',
    a: 'Dan wordt het vasten verzacht. Bij een groot feest (zoals de Annunciatie of de Transfiguratie) mag er vis gegeten worden; bij een polyeleosfeest wijn en olie. Op woensdag en vrijdag buiten de vastenperiodes heft een groot feest het vasten op tot een visdag. Alleen de Kruisverheffing blijft een vastendag.',
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

const WEKELIJKS =
  'De woensdag herinnert aan het verraad van Judas, de vrijdag aan de kruisiging. Beide dagen worden al sinds de eerste eeuwen gevast — het staat al in de Didachè. Vastenvrij zijn alleen de Lichte Week, de week na Pinksteren, de Kersttijd en de week na Tollenaar en Farizeeër.';

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
  const jaar = vandaag.getUTCFullYear();
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
  const [periodeOpen, setPeriodeOpen] = useState<Periode | null>(null);

  const dagVandaag = useMemo(() => dagInfo(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);
  // Weergavedatum van de vastentafel: vandaag (standaard) of morgen, de volgende kalenderdag; de systeemdatum blijft
  // ongemoeid. Status, tafel, tegels en toelichting lezen allemaal deze ene dag.
  const [morgen, setMorgen] = useState(false);
  const dagMorgen = useMemo(() => dagInfo(addDays(vandaag, 1), mode), [vandaag, mode]);
  const dagWeergave = morgen ? dagMorgen : dagVandaag;
  const niveauWeergave = NIVEAUS[dagWeergave.vasten.niveau];
  const betekenis = vastenBetekenis(dagWeergave);

  const periodes = useMemo(() => vastenPeriodes(jaar, mode), [jaar, mode]);

  const vastenP = periodes.filter((p) => p.soort === 'vasten');
  const grotevier = ['grote-vasten', 'apostelvasten', 'dormitionvasten', 'kerstvasten'].map((id) => vastenP.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const vrijP = periodes.filter((p) => p.soort === 'vrij');
  const dagP = periodes.filter((p) => p.soort === 'dag');
  const geselecteerdeDagInfo = geselecteerdeDag ? dagInfo(new Date(`${geselecteerdeDag}T00:00:00Z`), mode) : null;
  const periodeGeopend = periodeOpen;

  // Mobiel (mock-up vasten): de vastenregel van de dag met "Wat mag ik vandaag eten?" als uitklapper (tegels en
  // vorige/volgende dag), de huidige (of volgende) vastenperiode en drie verdiepingsregels. Zelfde gegevens en vensters.
  const mobiel = useMobiel();
  const [etenOpen, setEtenOpen] = useState(false);
  const [verschuiving, setVerschuiving] = useState(0);
  const [wekelijksOpen, setWekelijksOpen] = useState(false);
  const dagM = useMemo(() => dagInfo(addDays(vandaag, verschuiving), mode, vandaagYmd), [vandaag, verschuiving, mode, vandaagYmd]);
  const periodeNu = useMemo(() => {
    const alle = [jaar - 1, jaar, jaar + 1].flatMap((j) => vastenPeriodes(j, mode)).filter((p) => p.soort === 'vasten');
    const nu = alle.find((p) => p.start <= vandaag && vandaag <= p.eind);
    if (nu) return { p: nu, huidig: true };
    const volgende = alle.filter((p) => p.start > vandaag).sort((x, y) => x.start.getTime() - y.start.getTime())[0];
    return volgende ? { p: volgende, huidig: false } : null;
  }, [jaar, mode, vandaag]);


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

  const vensters = (
    <>
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
                <VoedselTegels status={voedselStatus(geselecteerdeDagInfo.vasten.niveau)} />
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

  if (mobiel) {
    const isVandaag = verschuiving === 0;
    return (
      <>
        <section id="vasten" className="vg ot-redesign ot-vasten vsm">
          <NisKop open={open} balk achter={<BannerBeeld naam="vasten-banner" open={open} />} />
          <div className="vg-papier vsm-papier">
            <h1 className="sr-only">Vasten</h1>
            <h2 className="vsm-label"><span>Vasten vandaag</span></h2>
            <div className="vsm-kaart vsm-regel" aria-live="polite">
              <h3 className="vsm-titel">{isVandaag ? 'De vastenregel van vandaag' : `De vastenregel van ${formatDatum(dagM.civil)}`}</h3>
              <p className="vsm-hoofd">{dagM.vasten.label}</p>
              <p className="vsm-tekst">{dagM.vasten.detail}</p>
              {dagM.vasten.periode && <p className="vsm-periode">{dagM.vasten.periode}</p>}
              <button type="button" className="vsm-uitklap" aria-expanded={etenOpen} aria-controls="vsm-eten" onClick={() => setEtenOpen((o) => !o)}>
                <span>{isVandaag ? 'Wat mag ik vandaag eten?' : 'Wat mag ik deze dag eten?'}</span>
                <ChevronDown className={etenOpen ? 'is-open' : undefined} aria-hidden="true" />
              </button>
              {etenOpen && (
                <div id="vsm-eten" className="vsm-eten">
                  <VoedselTegels status={voedselStatus(dagM.vasten.niveau)} />
                  <div className="vsm-dagnav">
                    <button type="button" onClick={() => setVerschuiving((v) => v - 1)}><span aria-hidden="true">←</span> Vorige dag</button>
                    {!isVandaag && <button type="button" className="vsm-vandaag" onClick={() => setVerschuiving(0)}>Vandaag</button>}
                    <button type="button" onClick={() => setVerschuiving((v) => v + 1)}>Volgende dag <span aria-hidden="true">→</span></button>
                  </div>
                </div>
              )}
            </div>

            {periodeNu && (
              <>
                <h2 className="vsm-label"><span>{periodeNu.huidig ? 'Huidige vastenperiode' : 'Volgende vastenperiode'}</span></h2>
                <button type="button" className="vsm-kaart vsm-rij vsm-periodekaart" onClick={() => setPeriodeOpen(periodeNu.p)}>
                  <span className="vsm-rij-tekst">
                    <b className="vsm-titel">{PERIODE_INFO[periodeNu.p.id]?.label ?? periodeNu.p.naam}</b>
                    <span className="vsm-datum">{formatDag(periodeNu.p.start)} – {formatDag(periodeNu.p.eind)}</span>
                    <span className="vsm-tekst">{periodeNu.p.omschrijving}</span>
                  </span>
                  <ChevronRight className="vsm-pijl" aria-hidden="true" />
                </button>
              </>
            )}

            <h2 className="vsm-label"><span>Verdieping</span></h2>
            <ul className="vsm-kaart vsm-lijst">
              {[
                { titel: 'Het wekelijkse vasten', onder: 'Woensdag en vrijdag', open: () => setWekelijksOpen(true) },
                { titel: 'De vastenperioden', onder: 'Het ritme van het kerkelijk jaar', open: () => setInfoOpen('periodes') },
                { titel: 'De betekenis van vasten', onder: 'Gebed, onthouding en barmhartigheid', open: () => setInfoOpen('betekenis') },
              ].map((v) => (
                <li key={v.titel}>
                  <button type="button" className="vsm-rij" onClick={v.open}>
                    <span className="vsm-rij-tekst">
                      <b>{v.titel}</b>
                      <span>{v.onder}</span>
                    </span>
                    <ChevronRight className="vsm-pijl" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            {/* De vier grote vasten van dit jaar; elke regel opent het bestaande periodevenster */}
            <h2 className="vsm-label"><span>De vier grote vasten</span></h2>
            <ul className="vsm-kaart vsm-lijst">
              {grotevier.map((p) => (
                <li key={p.id}>
                  <button type="button" className="vsm-rij" onClick={() => setPeriodeOpen(p)}>
                    <span className="vsm-rij-tekst">
                      <b>{PERIODE_INFO[p.id]?.label ?? p.naam}</b>
                      <span>{formatDag(p.start)} – {formatDatum(p.eind)}{PERIODE_INFO[p.id]?.beweeglijk ? ' · beweeglijk' : ''}</span>
                    </span>
                    <ChevronRight className="vsm-pijl" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
        {vensters}
        <LiturgicalPopup open={wekelijksOpen} onClose={() => setWekelijksOpen(false)} content={{ title: 'Het wekelijkse vasten', subtitle: 'Woensdag en vrijdag', paragraphs: [WEKELIJKS] }} />
      </>
    );
  }

  return (
    <>
      {/* Bovenkant volgens het overdrachtspakket (referentie kalender-pascha-feesten-vasten.png, paneel 4): de vasten van
          vandaag met de vastentafel, de week met de vastenkleuren en de vier grote vasten met hun bestaande
          iconen. Alle gegevens uit lib/vasten.ts en lib/overzicht.ts; elke dag en periode opent het bestaande venster. */}
      <section id="vasten" className="vg ot-redesign ot-vasten">
        <NisKop open={open} balk achter={<BannerBeeld naam="vasten-banner" open={open} />} />
        <div className="vg-papier ot-inhoud">
          <div aria-live="polite">
            <p className="vg-label ot-vs-label">{morgen ? `Morgen — ${formatDatum(dagMorgen.civil)}` : 'Vandaag'}</p>
            <h1 className="ot-titel">{dagWeergave.vasten.label}</h1>
          </div>
          <Sierlijn />
          <p className="ot-vs-toegestaan">{niveauWeergave.toegestaan}</p>
          <p className="ot-vs-detail">{dagWeergave.vasten.detail}</p>
          {dagWeergave.vasten.periode && <p className="ot-vs-periode">{dagWeergave.vasten.periode}</p>}

          {/* De geestelijke betekenis van de dag (lib/vastenBetekenis.ts), los van de voedselregels */}
          <section className="ot-vs-betekenis" aria-labelledby="vs-betekenis">
            <h2 id="vs-betekenis">{betekenis.titel}</h2>
            <p>{betekenis.tekst}</p>
            <p className="ot-vs-noot">{PASTORALE_NOOT}</p>
          </section>

          {/* De vastentafel: het eten van de gekozen dag op tafel (components/VastenTafel.tsx) */}
          <VastenTafel niveau={dagWeergave.vasten.niveau} />
          <p className="ot-vs-morgen">
            {morgen ? (
              <button type="button" className="ot-tekstknop" onClick={() => setMorgen(false)}>‹ Terug naar vandaag</button>
            ) : (
              <button type="button" className="ot-tekstknop" onClick={() => setMorgen(true)}>Morgen bekijken ›</button>
            )}
          </p>

          <div className="ot-vs-grote">
            <div>
              <h2 className="ot-kop">De vier grote vasten</h2>
              <ul className="ot-register">
                {grotevier.map((p) => (
                  <li key={p.id}>
                    <button type="button" className="ot-rij" onClick={() => setPeriodeOpen(p)}>
                      <span className="ot-rij-tekst">
                        <b>{PERIODE_INFO[p.id]?.label ?? p.naam}</b>
                        <span>{formatDag(p.start)} – {formatDatum(p.eind)}{PERIODE_INFO[p.id]?.beweeglijk ? ' · beweeglijk' : ''}</span>
                      </span>
                      <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ExactPageFrame title="Vasten">
      {/* Volgorde: het wekelijkse vasten → de vier grote vasten → praktisch → de vier informatiekaarten */}
      <div className="orthodox-pattern parchment-pattern relative bg-parchment py-14 text-ink sm:py-20">
        <div className={CONTENT}>
          <GoldDivider />

          {/* Het wekelijkse vasten + vastenvrije periodes — compact, geïntegreerd naast elkaar */}
          <div className="vlak rounded-2xl border border-gold/30 bg-[#f8f1e3] p-6 sm:p-8">
            <p className="ot-label">Het wekelijkse vasten</p>
            <h3 className="font-display mt-2 text-2xl font-semibold text-ink sm:text-3xl">Woensdag en vrijdag</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft sm:text-base">
              {WEKELIJKS}
            </p>
            <a href="#week" className="btn-pill cyclus-verder mt-3">
              Naar de weekcyclus ›
            </a>

            {/* Vastenvrije periodes en strenge losse vastendagen — direct aansluitend, geen los dashboard */}
            <div className="mt-8 grid gap-4 border-t border-gold/25 pt-6 lg:grid-cols-2">
              <FastingTable
                titel="Vastenvrije weken"
                rijen={vrijP.map((p) => ({ key: p.id, naam: p.naam, wanneer: `${formatKort(p.start)} – ${formatKort(p.eind)}${p.eind.getUTCFullYear() !== jaar ? ` ${p.eind.getUTCFullYear()}` : ''}`, onClick: () => setGeselecteerdeDag(ymd(p.start)) }))}
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

          {/* FAQ / praktisch */}
          <div className="vlak mt-8 parchment-pattern rounded-lg border border-gold/35 bg-[#f7edda]/75 px-5 py-7 shadow-[0_14px_34px_rgba(55,31,15,0.1)] sm:px-8 sm:py-9">
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
                De kalender is een leidsman, geen wetboek: volg voor het vasten het woord van je geestelijke. Dit is
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
        text="Vasten zonder gebed en aalmoes is, naar het woord van de Vaders, slechts een dieet. Vasten en gebed horen bij elkaar."
        buttonLabel="Naar gebeden"
        buttonHref="#gebeden"
      />
      </ExactPageFrame>

      {vensters}
    </>
  );
}

