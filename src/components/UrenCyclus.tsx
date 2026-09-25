import { useEffect, useState } from 'react';
import { Bird, ChevronDown, ChevronLeft, ChevronRight, Church, Clock3, Moon, Star, Sun, Sunrise, Sunset } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import Modal from './Modal';
import Cross from './Cross';
import { vergrendelScroll } from '../lib/scrollLock';
import { OPEN_DIENST_EVENT } from '../lib/events';
import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { ETMAAL_INFO } from '../lib/cyclusTeksten';
import { ringVak } from '../lib/ringVak';
import PageHero from './PageHero';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type PsalmMapping = {
  title: string;
  pdf: string;
};

type ServiceMapping = {
  title: string;
  time: string;
  ring: number;
  dot: string;
  pdf: string;
  psalms: PsalmMapping[];
  kernvers: {
    reference: string;
    verses: string[];
  };
  // Hoofdgedachtenis per dienst, bron: "De orthodoxe etmaalcyclus.docx".
  hoofdgedachtenis: string;
};

const serviceConfig: ServiceMapping[] = [
  {
    title: 'Vespers',
    time: '18:00',
    ring: 18,
    dot: '#d9a645',
    pdf: '/data/pdfs/Vespers.pdf',
    kernvers: { reference: 'Psalm Kernvers: 103(104):24', verses: ['Hoe groots zijn uw werken,', 'Heer, met wijsheid hebt U alles gemaakt.'] },
    psalms: [
      { title: 'Psalm 103', pdf: '/data/pdfs/Psalm 103.pdf' },
      { title: 'Psalm 140', pdf: '/data/pdfs/Psalm 140.pdf' },
    ],
    hoofdgedachtenis: 'Begin kerkelijke dag; avond en licht',
  },
  {
    title: 'Completen',
    time: '21:00',
    ring: 21,
    dot: '#b76b39',
    pdf: '/data/pdfs/Completen.pdf',
    kernvers: { reference: 'Psalm Kernvers: 50:12', verses: ['Schep een rein hart in mij, God,', 'en vernieuw in mijn binnenste een oprechte geest.'] },
    psalms: [{ title: 'Psalm 50', pdf: '/data/pdfs/Psalm 50.pdf' }],
    hoofdgedachtenis: 'Gebed vóór de nachtrust',
  },
  {
    title: 'Middernachtdienst',
    time: '00:00',
    ring: 0,
    dot: '#8c4a35',
    pdf: '/data/pdfs/Middernachtdienst.pdf',
    kernvers: { reference: 'Psalm Kernvers: 118:12', verses: ['Gezegend bent U, Heer,', 'leer mij uw voorschriften.'] },
    psalms: [{ title: 'Psalm 118', pdf: '/data/pdfs/Psalm 118.pdf' }],
    hoofdgedachtenis: 'Waakzaamheid en verwachting',
  },
  {
    title: 'Metten',
    time: '03:00',
    ring: 3,
    dot: '#d9c07a',
    pdf: '/data/pdfs/Metten.pdf',
    kernvers: { reference: 'Psalm Kernvers: 62(63):9', verses: ['Ik ben aan U gehecht, met heel mijn ziel,', 'uw rechterhand houdt mij vast.'] },
    psalms: [
      { title: 'Psalm 62', pdf: '/data/pdfs/Psalm 62.pdf' },
      { title: 'Psalm 102', pdf: '/data/pdfs/Psalm 102.pdf' },
    ],
    hoofdgedachtenis: 'Morgenlof en het komende licht',
  },
  {
    title: 'Eerste Uur',
    time: '06:00',
    ring: 6,
    dot: '#f0d589',
    pdf: '/data/pdfs/Eerste uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 89(90):17', verses: ['Laat de glans van de Heer, onze God, op ons rusten.', 'Bevestig het werk van onze handen,', 'ja, het werk van onze handen, bevestig dat.'] },
    psalms: [{ title: 'Psalm 89', pdf: '/data/pdfs/Psalm 89.pdf' }],
    hoofdgedachtenis: 'Begin van de dag',
  },
  {
    title: 'Derde Uur',
    time: '09:00',
    ring: 9,
    dot: '#5d8f62',
    pdf: '/data/pdfs/Derde uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 24(25):4', verses: ['Heer, maak mij uw wegen bekend', 'en leer mij uw paden'] },
    psalms: [{ title: 'Psalm 24', pdf: '/data/pdfs/Psalm 24.pdf' }],
    hoofdgedachtenis: 'Neerdaling van de Heilige Geest',
  },
  {
    title: 'Zesde Uur',
    time: '12:00',
    ring: 12,
    dot: '#d3bb52',
    pdf: '/data/pdfs/Zesde uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 90(91):9-10', verses: ['Als je de Allerhoogste tot je schuilplaats maakt,', 'zal het kwaad je niet bereiken,', 'geen plaag je tent ooit naderen.'] },
    psalms: [{ title: 'Psalm 90', pdf: '/data/pdfs/Psalm 90.pdf' }],
    hoofdgedachtenis: 'Christus aan het Kruis',
  },
  {
    title: 'Negende Uur',
    time: '15:00',
    ring: 15,
    dot: '#efe0c2',
    pdf: '/data/pdfs/Negende uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 84(85):11', verses: ['Barmhartigheid en waarheid omhelzen elkaar,', 'rechtvaardigheid en vrede begroeten elkaar met een kus.'] },
    psalms: [{ title: 'Psalm 84', pdf: '/data/pdfs/Psalm 84.pdf' }],
    hoofdgedachtenis: 'De dood van Christus aan het Kruis',
  },
];

type ModalState = {
  serviceIndex: number;
  selectedPsalm?: PsalmMapping;
};

type PdfLine = {
  x: number;
  text: string;
};

const ring = ringVak(13);

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

const pdfTextCache = new Map<string, Array<Array<PdfLine>>>();

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

type InfoKey = 'wat' | 'diensten' | 'betekenis' | 'praktisch';

type InfoContent = {
  title: string;
  subtitle: string;
  paragraphs: string[];
};

// Inhoud rechtstreeks gebaseerd op "De orthodoxe etmaalcyclus.docx".

const INFO_CARDS: Array<{ key: InfoKey; title: string; intro: string; iconSrc: string }> = [
  { key: 'wat', title: 'Wat is het etmaal?', intro: 'Het kerkelijk etmaal bestaat uit een vaste reeks gebedsdiensten die de dag heiligen en ons in Gods tegenwoordigheid plaatsen.', iconSrc: '/images/ui/medaillons/Etmaal.webp' },
  { key: 'diensten', title: 'De liturgische diensten', intro: 'Van de Metten tot de Completen: elke dienst heeft een eigen karakter, psalmen en gebeden.', iconSrc: '/images/ui/menu/03-Etmaal-03-Metten.webp' },
  { key: 'betekenis', title: 'De betekenis in ons leven', intro: 'Het etmaal helpt ons om ons hart te richten op God en de dag in Zijn licht te leven.', iconSrc: '/images/ui/menu/02-Gebed-05-De-betekenis-in-ons-leven.webp' },
  { key: 'praktisch', title: 'Praktisch', intro: 'Hoe je als leek meeleeft met het kerkelijk etmaal, thuis of onderweg.', iconSrc: '/images/ui/menu/02-Gebed-06-Praktisch.webp' },
];

const TIMELINE_ITEMS = [
  { id: 'adem', label: 'ADEM', title: 'Christus in iedere\nademhaling', href: '#adem' },
  { id: 'etmaal', label: 'ETMAAL', title: 'Gebed door\ndag en nacht', href: '#etmaal' },
  { id: 'week', label: 'WEEK', title: 'Iedere dag\nzijn gedachtenis', href: '#week' },
  { id: 'pascha', label: 'PASCHA', title: 'De weg van Kruis\nnaar Verrijzenis', href: '#pascha' },
  { id: 'jaar', label: 'JAAR', title: 'Het gehele\nkerkelijke jaar geheiligd', href: '#jaar' },
];

// Symbolische lijnicoon per dienst, gebaseerd op het schematische moment (bron: docx).
// 'Zesde Uur' gebruikt het orthodoxe kruis-component in plaats van een lucide-icoon.
const SERVICE_ICONS: Record<string, typeof Sun | null> = {
  Vespers: Sunset,
  Completen: Moon,
  Middernachtdienst: Star,
  Metten: Sunrise,
  'Eerste Uur': Sun,
  'Derde Uur': Bird,
  'Zesde Uur': null,
  'Negende Uur': Church,
};
const SERVICE_IMAGE_ICONS: Record<string, string | undefined> = {
  Vespers: '/images/ui/menu/03-Etmaal-02-Avondgebeden.webp',
  Completen: '/images/ui/menu/03-Etmaal-05-Completen.webp',
  Middernachtdienst: '/images/ui/menu/03-Etmaal-04-Middernachtdienst.webp',
  Metten: '/images/ui/menu/03-Etmaal-03-Metten.webp',
  'Eerste Uur': '/images/ui/menu/03-Etmaal-01-Ochtendgebeden.webp',
  'Derde Uur': '/images/ui/menu/03-Etmaal-06-Derde-Uur.webp',
  'Zesde Uur': '/images/ui/menu/03-Etmaal-07-Zesde-Uur.webp',
  'Negende Uur': '/images/ui/menu/03-Etmaal-08-Negende-Uur.webp',
};

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

export default function UrenCyclus() {
  const [open, setOpen] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const [pdfPages, setPdfPages] = useState<Array<Array<PdfLine>>>([]);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');

  const activeIndex = hovered ?? open ?? 0;
  const currentService = modalState !== null ? serviceConfig[modalState.serviceIndex] : serviceConfig[activeIndex];
  const currentPdfUrl = modalState?.selectedPsalm ? modalState.selectedPsalm.pdf : currentService?.pdf ?? '';
  const currentTitle = modalState?.selectedPsalm ? `${currentService.title} · ${modalState.selectedPsalm.title}` : currentService.title;

  useEffect(() => {
    if (open === null || !currentPdfUrl) {
      setPdfPages([]);
      setPdfStatus('idle');
      return;
    }

    let active = true;
    const cachedPages = pdfTextCache.get(currentPdfUrl);
    if (cachedPages) {
      setPdfPages(cachedPages);
      setPdfStatus('done');
      return () => {
        active = false;
      };
    }

    setPdfStatus('loading');
    setPdfPages([]);

    const parsePdf = async () => {
      try {
        const response = await fetch(currentPdfUrl);
        if (!response.ok) throw new Error(`PDF is niet beschikbaar (${response.status})`);

        const buffer = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const pages: Array<Array<PdfLine>> = [];

        for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
          const page = await pdf.getPage(pageIndex);
          const textContent = await page.getTextContent();
          const rows = new Map<number, Array<PdfLine>>();

          for (const item of textContent.items) {
            if ('str' in item && typeof item.str === 'string') {
              const text = item.str.trim();
              if (!text) continue;
              const yKey = Math.round(Number(item.transform?.[5] ?? 0));
              const row = rows.get(yKey) ?? [];
              row.push({ x: Number(item.transform?.[4] ?? 0), text });
              rows.set(yKey, row);
            }
          }

          const pageLines = Array.from(rows.entries())
            .sort((a, b) => b[0] - a[0])
            .map(([, items]) => ({
              x: Math.min(...items.map((entry) => entry.x)),
              text: items
                .sort((a, b) => a.x - b.x)
                .map((entry) => entry.text)
                .join(' '),
            }))
            .filter((line) => line.text.length > 0);

          pages.push(pageLines);
        }

        if (!active) return;
        pdfTextCache.set(currentPdfUrl, pages);
        setPdfPages(pages);
        setPdfStatus('done');
      } catch (error) {
        if (!active) return;
        console.error('PDF parsing failed', error);
        setPdfStatus('error');
      }
    };

    void parsePdf();

    return () => {
      active = false;
    };
  }, [currentPdfUrl, open]);

  useEffect(() => {
    if (open === null) return;
    const sluitMetEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', sluitMetEscape);
    const ontgrendel = vergrendelScroll();
    return () => {
      window.removeEventListener('keydown', sluitMetEscape);
      ontgrendel();
    };
  }, [open]);

  const openService = (serviceIndex: number) => {
    setOpen(serviceIndex);
    setModalState({ serviceIndex });
  };

  // De Vandaag-pagina kan het venster van de huidige dienst openen (bijv. Completen).
  useEffect(() => {
    const opDienst = (event: Event) => {
      const titel = (event as CustomEvent<string>).detail;
      const index = serviceConfig.findIndex((service) => service.title === titel);
      if (index >= 0) {
        setOpen(index);
        setModalState({ serviceIndex: index });
      }
    };
    window.addEventListener(OPEN_DIENST_EVENT, opDienst);
    return () => window.removeEventListener(OPEN_DIENST_EVENT, opDienst);
  }, []);

  const openPsalm = (serviceIndex: number, psalm: PsalmMapping) => {
    setOpen(serviceIndex);
    setModalState({ serviceIndex, selectedPsalm: psalm });
  };

  const goToService = (serviceIndex: number) => {
    setOpen(serviceIndex);
    setModalState({ serviceIndex });
  };

  const previousService = () => {
    if (open === null) return;
    const nextIndex = (open - 1 + serviceConfig.length) % serviceConfig.length;
    goToService(nextIndex);
  };

  const nextService = () => {
    if (open === null) return;
    const nextIndex = (open + 1) % serviceConfig.length;
    goToService(nextIndex);
  };

  const closeModal = () => {
    setOpen(null);
    setModalState(null);
  };

  return (
    <>
      <PageHero id="etmaal" alt="Etmaal — een dag in Gods tegenwoordigheid" />

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
                <h3 className="font-display mt-6 text-[20px] font-semibold text-gold-light">{title}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#d9c6a3] sm:text-base">{intro}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* De diensten van het etmaal */}
      <section className="bg-parchment pb-16 sm:pb-20">
        <div className={CONTENT}>
          <div className="parchment-pattern relative overflow-hidden rounded-2xl border border-gold/40 bg-[#f8f1e3] px-6 py-14 shadow-[0_30px_70px_rgba(40,22,14,0.16)] sm:px-10 lg:px-16">
            <CornerOrnament className="absolute top-6 left-6 h-14 w-14 text-gold-deep/30" />
            <CornerOrnament className="absolute top-6 right-6 h-14 w-14 -scale-x-100 text-gold-deep/30" />
            <CornerOrnament className="absolute bottom-6 left-6 h-14 w-14 -scale-y-100 text-gold-deep/30" />
            <CornerOrnament className="absolute right-6 bottom-6 h-14 w-14 -scale-x-100 -scale-y-100 text-gold-deep/30" />

            <div className="text-center">
              <h2 className="ot-sectietitel">De diensten van het etmaal</h2>
              <p className="ot-label mt-2">Een dag van gebed</p>
            </div>

            {/* Desktop: cirkeldiagram */}
            <div className="relative mx-auto mt-12 hidden aspect-square w-full max-w-[820px] lg:block" style={ring.stijl}>
              <svg viewBox={ring.viewBox} className="absolute inset-0 h-full w-full">
                <circle cx="50" cy="50" r="30" fill="none" stroke="#c9a227" strokeWidth="0.35" opacity="0.75" />
                {/* Kompasaccenten op de vier kardinale punten van de ring */}
                {[0, 90, 180, 270].map((deg) => {
                  const p = polar(50, 50, 30, deg);
                  return <circle key={deg} cx={p.x} cy={p.y} r="0.9" fill="#c9a227" opacity="0.8" />;
                })}
                {serviceConfig.map((service, index) => {
                  const angle = 22.5 + (360 / serviceConfig.length) * index;
                  const p = polar(50, 50, 30, angle);
                  const c = polar(50, 50, 15, angle);
                  return (
                    <line
                      key={`spoke-${service.title}`}
                      x1={c.x}
                      y1={c.y}
                      x2={p.x}
                      y2={p.y}
                      stroke="#c9a227"
                      strokeWidth="0.25"
                      opacity={activeIndex === index ? 0.65 : 0.3}
                    />
                  );
                })}
              </svg>

              <div className="absolute top-1/2 left-1/2 flex h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-2 border-gold/60 shadow-[0_14px_36px_rgba(120,80,30,0.22)]">
                <img loading="lazy" decoding="async" src="/images/Christus-afbeelding.webp" alt="Christus" className="h-full w-full object-cover" />
              </div>

              {serviceConfig.map((service, index) => {
                const angle = 22.5 + (360 / serviceConfig.length) * index;
                const pos = polar(50, 50, 30, angle);
                const isActive = activeIndex === index;
                const leftSide = pos.x < 50;
                const Icon = SERVICE_ICONS[service.title];
                const imageIcon = SERVICE_IMAGE_ICONS[service.title];

                const badge = (
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 bg-[#1c130d] text-gold-light transition-all ${
                      isActive ? 'scale-110 border-gold shadow-[0_0_0_5px_rgba(201,162,39,0.22),0_0_20px_rgba(201,162,39,0.35)]' : 'border-gold/50'
                    }`}
                  >
                    {imageIcon ? <img loading="lazy" decoding="async" src={imageIcon} alt="" className="h-14 w-14 object-contain" /> : Icon ? <Icon className="h-6 w-6" strokeWidth={1.4} /> : <Cross className="h-6 w-6" />}
                  </span>
                );

                const text = (
                  <span className="dienst-kaart">
                    <span className="dienst-kaart-titel font-display">{service.title}</span>
                    <span className="dienst-kaart-tijd">{service.time}</span>
                    <span className="dienst-kaart-tekst">{service.hoofdgedachtenis}</span>
                    <span className="btn-pill dienst-kaart-cta">Open dienst →</span>
                  </span>
                );

                return (
                  <button
                    key={`${service.title}-node-${index}`}
                    type="button"
                    onClick={() => openService(index)}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ left: `${pos.x}%`, top: ring.top(pos.y) }}
                    className={`etmaal-ring-node absolute ${leftSide ? 'is-left' : 'is-right'}`}
                  >
                    <span className="etmaal-ring-badge">{badge}</span>
                    <span className="etmaal-ring-text">{text}</span>
                  </button>
                );
              })}
            </div>

            {/* Tablet/mobiel: dezelfde kaartstijl als de dagen van de weekcyclus */}
            <div className="mt-10 space-y-3 lg:hidden">
              {serviceConfig.map((service, index) => {
                const Icon = SERVICE_ICONS[service.title];
                const imageIcon = SERVICE_IMAGE_ICONS[service.title];
                return (
                  <button
                    key={`${service.title}-mobile-${index}`}
                    type="button"
                    onClick={() => openService(index)}
                    className="dienst-kaart dienst-kaart-rij group flex w-full items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                  >
                    <span className="dienst-kaart-medaillon flex shrink-0 items-center justify-center">
                      {imageIcon ? <img loading="lazy" decoding="async" src={imageIcon} alt="" /> : Icon ? <Icon className="h-6 w-6 text-gold-light" strokeWidth={1.4} /> : <Cross className="h-6 w-6 text-gold-light" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="dienst-kaart-titel font-display block">{service.title}</span>
                      <span className="dienst-kaart-tijd block">{service.time}</span>
                      <span className="dienst-kaart-tekst block">{service.hoofdgedachtenis}</span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gold-deep" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Meer dan een dagindeling */}
      <CycleTransition
        quote="Zevenmaal daags prijs ik U, omwille van Uw rechtvaardige oordelen."
        citation="Psalm 119:164"
        eyebrow="Meer dan een dagindeling"
        text="Het etmaal is geen strak schema, maar een levensritme. Het herinnert er ons aan dat heel onze tijd in Gods handen ligt en dat elk moment een ontmoeting met Hem kan zijn."
        buttonLabel="Ontdek de weekcyclus"
        buttonHref="#week"
      />

      <TimeSanctificationTimeline current="etmaal" />

      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? ETMAAL_INFO[infoOpen] : null} />

      {open !== null && currentService && (
        <Modal
          open
          onClose={closeModal}
          eyebrow={`${currentService.time} uur`}
          title={currentTitle}
          centerTitle
          maxWidth="max-w-3xl"
          labelledBy="etmaal-dienst-titel"
          lezen
          onVorige={previousService}
          onVolgende={nextService}
          leadingActions={
            <button type="button" onClick={previousService} className="exact-modal-close" aria-label="Vorige dienst">
              <ChevronLeft />
            </button>
          }
          actions={
            <button type="button" onClick={nextService} className="exact-modal-close" aria-label="Volgende dienst">
              <ChevronRight />
            </button>
          }
        >
          <div className="exact-popup-reading">
            <p className="exact-popup-subtitle">{currentService.hoofdgedachtenis}</p>
            {!modalState?.selectedPsalm && (
              <blockquote className="exact-popup-highlight">
                <span className="block text-[11px] font-bold tracking-[0.18em] uppercase">{currentService.kernvers.reference}</span>
                {currentService.kernvers.verses.map((vers) => (
                  <span key={vers} className="block">{vers}</span>
                ))}
              </blockquote>
            )}

            <div className="etmaal-popup-keuze">
              <button type="button" onClick={() => goToService(open)} className={`btn-pill${modalState?.selectedPsalm ? '' : ' is-actief'}`}>
                De dienst
              </button>
              {currentService.psalms.map((psalm) => (
                <button
                  key={psalm.pdf}
                  type="button"
                  onClick={() => openPsalm(open, psalm)}
                  className={`btn-pill${modalState?.selectedPsalm?.pdf === psalm.pdf ? ' is-actief' : ''}`}
                >
                  {psalm.title}
                </button>
              ))}
            </div>

            {(pdfStatus === 'loading' || pdfStatus === 'idle') && <p className="etmaal-pdf-melding">De tekst wordt geladen…</p>}
            {pdfStatus === 'error' && (
              <p className="etmaal-pdf-melding">
                De tekst kon niet worden geladen.{' '}
                <a href={currentPdfUrl} target="_blank" rel="noreferrer" className="underline">
                  Open de PDF
                </a>
              </p>
            )}
            {pdfStatus === 'done' && (
              <div className="etmaal-pdf">
                {pdfPages.map((paginaRegels, pageIndex) => {
                  // Het kernvers staat al in het kader hierboven: laat de herhaling bovenaan de dienst weg.
                  const kernversRegels = 1 + currentService.kernvers.verses.length;
                  const lines =
                    pageIndex === 0 && !modalState?.selectedPsalm && paginaRegels[0]?.text.startsWith('Psalm Kernvers')
                      ? paginaRegels.slice(kernversRegels)
                      : paginaRegels;
                  if (lines.length === 0) return null;
                  const minX = Math.min(...lines.map((line) => line.x));
                  const langste = Math.max(...lines.map((line) => line.text.length));
                  return (
                    <div key={`${currentPdfUrl}-${pageIndex}`} className="etmaal-pdf-pagina">
                      {lines.map((line, lineIndex) => {
                        // Een korte regel die met een leesteken eindigt sluit meestal een alinea af.
                        const vorige = lines[lineIndex - 1];
                        const nieuweAlinea = !!vorige && vorige.text.length < langste * 0.7 && /[.!?:”"’)]$/.test(vorige.text);
                        return (
                          <p
                            key={lineIndex}
                            className={nieuweAlinea ? 'etmaal-pdf-alinea' : undefined}
                            style={{ paddingLeft: `${Math.min(48, Math.max(0, (line.x - minX) / 2))}px` }}
                          >
                            {line.text}
                          </p>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
