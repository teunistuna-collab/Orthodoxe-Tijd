import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from './Modal';
import { leesPdfTekst, pdfTekstUitCache, type PdfLine } from './dienstPdf';
import { vergrendelScroll } from '../lib/scrollLock';
import { OPEN_DIENST_EVENT } from '../lib/events';
import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { ETMAAL_INFO, ETMAAL_INLEIDING } from '../lib/cyclusTeksten';
import { dienstVanHetUur, serviceConfig, type PsalmMapping } from '../lib/etmaal';
import EtmaalOverzicht from './EtmaalOverzicht';
import EtmaalMobiel from './EtmaalMobiel';
import { useMobiel } from '../lib/desktop';
import ExactPageFrame from './ExactPageFrame';
import { PsalmLezer } from './Psalmen';
import Psalterlezing from './Psalterlezing';
import { useApp } from '../lib/context';
import { WEEKDAGEN, addDays, formatDag } from '../lib/kalender';
import Verdieping from './Verdieping';
import { PSALMEN, laadPsalmTeksten, type PsalmTeksten } from '../lib/psalmen';

type ModalState = {
  serviceIndex: number;
  selectedPsalm?: PsalmMapping;
};



const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

type InfoKey = 'wat' | 'diensten' | 'betekenis' | 'praktisch';


// Inhoud rechtstreeks gebaseerd op "De orthodoxe etmaalcyclus.docx".

const INFO_CARDS: Array<{ key: InfoKey; title: string; intro: string }> = [
  { key: 'wat', title: 'Wat is het etmaal?', intro: ETMAAL_INLEIDING.wat },
  { key: 'diensten', title: 'De liturgische diensten', intro: ETMAAL_INLEIDING.diensten },
  { key: 'betekenis', title: 'De betekenis in ons leven', intro: ETMAAL_INLEIDING.betekenis },
  { key: 'praktisch', title: 'Praktisch', intro: ETMAAL_INLEIDING.praktisch },
];


export default function UrenCyclus() {
  // Mobiel: de vier weergaven van de mock-up (EtmaalMobiel.tsx); desktop: deze pagina met het dienstvenster.
  const mobiel = useMobiel();
  const [open, setOpen] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const { mode, vandaag, vandaagYmd } = useApp();
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const [pdf, setPdf] = useState<{ url: string; pages: Array<Array<PdfLine>>; status: 'error' | 'done' } | null>(null);

  const currentService = serviceConfig[modalState?.serviceIndex ?? open ?? 0];
  // De dienst van nu volgt de klok; elke minuut opnieuw bekijken.
  const [nu, setNu] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNu(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  // Een psalm komt uit het psalter (psalmen.json, ±40 KB, met de podcast) in plaats van uit de PDF: veel sneller dan pdf.js.
  const psalmNr = modalState?.selectedPsalm ? Number(modalState.selectedPsalm.title.replace('Psalm ', '')) : null;
  const [psalmTeksten, setPsalmTeksten] = useState<PsalmTeksten | null>(null);
  const [psalmFout, setPsalmFout] = useState(false);
  useEffect(() => {
    if (psalmNr === null || psalmTeksten) return;
    laadPsalmTeksten().then(setPsalmTeksten, () => setPsalmFout(true));
  }, [psalmNr, psalmTeksten]);
  const currentPdfUrl = modalState?.selectedPsalm ? '' : currentService?.pdf ?? '';
  const currentTitle = modalState?.selectedPsalm ? `${currentService.title} · ${modalState.selectedPsalm.title}` : currentService.title;

  // PDF-tekst: uit de cache, of het geladen resultaat zolang het bij de huidige url hoort; anders nog aan het laden.
  const pdfUrl = open !== null ? currentPdfUrl : '';
  const cachedPages = pdfUrl ? pdfTekstUitCache(pdfUrl) : undefined;
  const pdfHuidig = pdf && pdf.url === pdfUrl ? pdf : null;
  const pdfPages = cachedPages ?? pdfHuidig?.pages ?? [];
  const pdfStatus = !pdfUrl ? 'idle' : cachedPages ? 'done' : (pdfHuidig?.status ?? 'loading');

  useEffect(() => {
    if (!pdfUrl || pdfTekstUitCache(pdfUrl)) return;
    let active = true;

    leesPdfTekst(pdfUrl)
      .then((pages) => active && setPdf({ url: pdfUrl, pages, status: 'done' }))
      .catch((error) => {
        if (!active) return;
        console.error('PDF parsing failed', error);
        setPdf({ url: pdfUrl, pages: [], status: 'error' });
      });

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

  if (mobiel) return <EtmaalMobiel />;

  return (
    <>
      {/* Bovenkant volgens het pakket Etmaal, Week en Jaar: banner van de dienst, tijdlijn en het gebedsuur */}
      <EtmaalOverzicht nuIndex={nuIndex} onOpen={openService} />

      {/* Daaronder de bestaande verdieping, overgang en tijdlijn, in het gewone paginakader */}
      <ExactPageFrame title="Etmaal">
      <div className="et-cyclus bg-parchment text-ink">
        <div className={CONTENT}>
          <Verdieping items={INFO_CARDS} onOpen={setInfoOpen} />
        </div>
      </div>

      {/* Meer dan een dagindeling */}
      <CycleTransition
        quote="Zevenmaal daags prijs ik U, omwille van Uw rechtvaardige oordelen."
        citation="Psalm 119:164"
        text="Het etmaal is geen strak schema, maar een levensritme. Het herinnert er ons aan dat heel onze tijd in Gods handen ligt en dat elk moment een ontmoeting met Hem kan zijn."
        buttonLabel="Naar de weekcyclus"
        buttonHref="#week"
      />

      <TimeSanctificationTimeline current="etmaal" />
      </ExactPageFrame>

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

            <div className="etmaal-popup-keuze" role="group" aria-label="Vaste psalmen van de dienst">
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
            {!modalState?.selectedPsalm && (currentService.title === 'Metten' || currentService.title === 'Vespers') && (
              // Psalterlezing van vandaag (lib/psalterlezing.ts), zelfde uitkomst als op Vandaag en Psalmen
              <section className="etmaal-kathisma" aria-labelledby="etmaal-kathisma-kop">
                <h3 id="etmaal-kathisma-kop">Kathisma’s bij deze dienst</h3>
                <p className="psl-datum">
                  {WEEKDAGEN[vandaag.getUTCDay()]} {formatDag(vandaag)}
                  {currentService.title === 'Vespers' && ` (avond) · vesper van ${WEEKDAGEN[addDays(vandaag, 1).getUTCDay()]} ${formatDag(addDays(vandaag, 1))}`}
                </p>
                <Psalterlezing datum={vandaagYmd} mode={mode} dienst={currentService.title === 'Metten' ? 'metten' : 'vespers'} onKies={closeModal} />
              </section>
            )}
            {modalState?.selectedPsalm && (
              // De link zelf gaat via gaNaar (App.tsx); de dienst sluit, de psalm opent op de Psalmenpagina.
              <a className="etmaal-naar-psalter" href={`#psalmen/${modalState.selectedPsalm.title.replace('Psalm ', '')}`} onClick={closeModal}>
                Open in het psalter ›
              </a>
            )}

            {psalmNr !== null && (
              <div className="etmaal-psalm">
                <PsalmLezer psalm={PSALMEN[psalmNr - 1]} tekst={psalmTeksten?.[psalmNr]} laadFout={psalmFout} idVoorvoegsel={`etmaal-psalm-${psalmNr}`} />
              </div>
            )}
            {psalmNr === null && (pdfStatus === 'loading' || pdfStatus === 'idle') && <p className="etmaal-pdf-melding">De tekst wordt geladen…</p>}
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
