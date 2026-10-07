import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from './Modal';
import { vergrendelScroll } from '../lib/scrollLock';
import { OPEN_DIENST_EVENT } from '../lib/events';
import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { ETMAAL_INFO } from '../lib/cyclusTeksten';
import { dienstVanHetUur, serviceConfig, type PsalmMapping, type ServiceMapping } from '../lib/etmaal';
import PaginaOpening from './PaginaOpening';

// De PDF-lezer (±420 KB) wordt pas geladen als iemand een dienst of psalm opent, niet bij het openen van de site.
let pdfjsLaden: Promise<typeof import('pdfjs-dist')> | null = null;
function laadPdfjs() {
  pdfjsLaden ??= import('pdfjs-dist')
    .then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      return pdfjsLib;
    })
    .catch((fout) => {
      pdfjsLaden = null; // bij een netwerkfout de volgende keer opnieuw proberen
      throw fout;
    });
  return pdfjsLaden;
}

type ModalState = {
  serviceIndex: number;
  selectedPsalm?: PsalmMapping;
};

type PdfLine = {
  x: number;
  text: string;
};

const pdfTextCache = new Map<string, Array<Array<PdfLine>>>();

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

type InfoKey = 'wat' | 'diensten' | 'betekenis' | 'praktisch';


// Inhoud rechtstreeks gebaseerd op "De orthodoxe etmaalcyclus.docx".

const INFO_CARDS: Array<{ key: InfoKey; title: string; intro: string }> = [
  { key: 'wat', title: 'Wat is het etmaal?', intro: 'Het kerkelijk etmaal bestaat uit een vaste reeks gebedsdiensten die de dag heiligen en ons in Gods tegenwoordigheid plaatsen.' },
  { key: 'diensten', title: 'De liturgische diensten', intro: 'Van de Metten tot de Completen: elke dienst heeft een eigen karakter, psalmen en gebeden.' },
  { key: 'betekenis', title: 'De betekenis in ons leven', intro: 'Het etmaal helpt ons om ons hart te richten op God en de dag in Zijn licht te leven.' },
  { key: 'praktisch', title: 'Praktisch', intro: 'Hoe je als leek meeleeft met het kerkelijk etmaal, thuis of onderweg.' },
];


// Beelden per dienst in public/images/etmaal (uitgesneden uit het aangeleverde ontwerp), van avond via nacht naar dag.
const slug = (titel: string) => titel.toLowerCase().replace(/ /g, '-');
// Korte namen en dagdelen uit het aangeleverde ontwerp.
const KORT: Record<string, string> = { Middernachtdienst: 'Middernacht' };
const UURNUMMER: Record<string, string> = { 'Eerste Uur': '1', 'Derde Uur': '3', 'Zesde Uur': '6', 'Negende Uur': '9' };
const DAGDEEL: Record<string, string> = {
  Vespers: 'Avond',
  Completen: 'Einde van de dag',
  Middernachtdienst: 'Nacht',
  Metten: 'Naar de dageraad',
  'Eerste Uur': 'Begin van de dag',
  'Derde Uur': 'Ochtend',
  'Zesde Uur': 'Middag',
  'Negende Uur': 'Namiddag',
};

export default function UrenCyclus() {
  const [open, setOpen] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const [pdf, setPdf] = useState<{ url: string; pages: Array<Array<PdfLine>>; status: 'error' | 'done' } | null>(null);

  const currentService = serviceConfig[modalState?.serviceIndex ?? open ?? 0];
  // De dienst van nu volgt de klok; elke minuut opnieuw bekijken.
  const [nu, setNu] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNu(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  const currentPdfUrl = modalState?.selectedPsalm ? modalState.selectedPsalm.pdf : currentService?.pdf ?? '';
  const currentTitle = modalState?.selectedPsalm ? `${currentService.title} · ${modalState.selectedPsalm.title}` : currentService.title;

  // PDF-tekst: uit de cache, of het geladen resultaat zolang het bij de huidige url hoort; anders nog aan het laden.
  const pdfUrl = open !== null ? currentPdfUrl : '';
  const cachedPages = pdfUrl ? pdfTextCache.get(pdfUrl) : undefined;
  const pdfHuidig = pdf && pdf.url === pdfUrl ? pdf : null;
  const pdfPages = cachedPages ?? pdfHuidig?.pages ?? [];
  const pdfStatus = !pdfUrl ? 'idle' : cachedPages ? 'done' : (pdfHuidig?.status ?? 'loading');

  useEffect(() => {
    if (!pdfUrl || pdfTextCache.has(pdfUrl)) return;
    let active = true;

    const parsePdf = async () => {
      try {
        const pdfjsKlaar = laadPdfjs(); // tegelijk met het PDF-bestand ophalen
        pdfjsKlaar.catch(() => {}); // een fout komt hieronder via Promise.all binnen
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error(`PDF is niet beschikbaar (${response.status})`);

        const [buffer, pdfjsLib] = await Promise.all([response.arrayBuffer(), pdfjsKlaar]);
        const pdf = await pdfjsLib.getDocument({ data: buffer, verbosity: 0 }).promise;
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
        pdfTextCache.set(pdfUrl, pages);
        setPdf({ url: pdfUrl, pages, status: 'done' });
      } catch (error) {
        if (!active) return;
        console.error('PDF parsing failed', error);
        setPdf({ url: pdfUrl, pages: [], status: 'error' });
      }
    };

    void parsePdf();

    return () => {
      active = false;
    };
  }, [pdfUrl]);

  // Scroll vastzetten; Escape en de terugknop sluiten via de gedeelde pop-upstapel (lib/terug.ts).
  useEffect(() => {
    if (open === null) return;
    return vergrendelScroll();
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

  const nuDienst = dienstVanHetUur(nu);
  const nuIndex = serviceConfig.indexOf(nuDienst);
  const psalmRegel = (service: ServiceMapping) => service.psalms.map((p) => p.title).join(', ').replace(/, Psalm /g, ', ');

  return (
    <>
      {/* Opening volgens de referentie (Bouw 177): het etmaalwiel, titel, intro en het bordeaux vlak met de dienst van nu */}
      <PaginaOpening id="etmaal" soort="cyclisch" label="De gebeden van dag en nacht" titel="Etmaal" ondertitel="De uren van het gebed" beeld={{ src: '/images/Etmaal-wiel.webp', alt: 'Het etmaalwiel met de acht gebedsdiensten van avond tot namiddag' }}>
        <p className="pc-intro">{INFO_CARDS[0].intro}</p>
        <article className="et-nu cyclus-nu" aria-labelledby="et-nu-titel">
          <img className="et-nu-beeld" src={`/images/etmaal/${slug(nuDienst.title)}.webp`} alt="" width={204} height={256} decoding="async" />
          <div className="et-nu-kop">
            <p className="cyclus-nu-label">Nu</p>
            <h2 id="et-nu-titel" className="et-nu-titel">{nuDienst.title}</h2>
            <p className="et-nu-tijd">{nuDienst.time}</p>
          </div>
          <div className="et-nu-info">
            <p>{nuDienst.hoofdgedachtenis}</p>
            <p>{psalmRegel(nuDienst)}</p>
            <button type="button" className="et-nu-link" onClick={() => openService(nuIndex)}>
              Open {nuDienst.title.toLowerCase()} ›
            </button>
          </div>
        </article>
      </PaginaOpening>

      {/* De acht diensten van avond tot namiddag: van licht naar duisternis en terug; de dienst van nu in bordeaux */}
      <section className="et-cyclus bg-parchment text-ink" aria-labelledby="et-cyclus-titel">
        <div className={CONTENT}>
          <h2 id="et-cyclus-titel" className="pc-kop et-kop">De diensten van het etmaal</h2>
          <ol className="et-diensten">
            {serviceConfig.map((service, index) => (
              <li key={service.title}>
                <button type="button" className={`et-dienst${index === nuIndex ? ' cyclus-nu' : ''}`} aria-current={index === nuIndex ? 'true' : undefined} onClick={() => openService(index)}>
                  <span className="et-dienst-tijd">{service.time}</span>
                  <span className="et-dienst-naam">{UURNUMMER[service.title] ? <>{UURNUMMER[service.title]}<sup>e</sup> Uur</> : (KORT[service.title] ?? service.title)}</span>
                  <span className="et-dienst-deel">{DAGDEEL[service.title]}</span>
                  <span className="et-dienst-psalm">{psalmRegel(service)}</span>
                  {index === nuIndex && <span className="cyclus-nu-label">Nu</span>}
                </button>
              </li>
            ))}
          </ol>
          <nav className="et-meer" aria-label="Meer over het etmaal">
            {INFO_CARDS.map(({ key, title }) => (
              <button key={key} type="button" className="fs-link" onClick={() => setInfoOpen(key)}>
                {title} ›
              </button>
            ))}
          </nav>
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
            {modalState?.selectedPsalm && (
              // De link zelf gaat via gaNaar (App.tsx); de dienst sluit, de psalm opent op de Psalmenpagina.
              <a className="etmaal-naar-psalter" href={`#psalmen/${modalState.selectedPsalm.title.replace('Psalm ', '')}`} onClick={closeModal}>
                Open in het psalter ›
              </a>
            )}

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
