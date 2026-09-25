import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../lib/context';
import { dagInfo, formatLang, parseYmd } from '../lib/kalender';
import { heiligenVanDag, popupContent, type Resultaat } from '../lib/heiligenPopup';
import { LiturgicalPopup } from './CycleSections';
import Modal from './Modal';
import { vergrendelScroll } from '../lib/scrollLock';

interface Props {
  ymd: string | null;
  onClose: () => void;
}

// Pop-up met uitsluitend de heiligen en gedachtenissen van één dag. Een tik op een heilige opent zijn of haar
// levensbeschrijving in dezelfde leespop-up als op de Heiligen-pagina.
export default function DagHeiligen({ ymd: gekozenDag, onClose }: Props) {
  const { mode, vandaagYmd, htc, heiligen: eigen } = useApp();
  const [gekozen, setGekozen] = useState<Resultaat | null>(null);
  const dag = useMemo(() => (gekozenDag ? dagInfo(parseYmd(gekozenDag), mode, vandaagYmd) : null), [gekozenDag, mode, vandaagYmd]);
  const heiligen = useMemo(() => (dag ? heiligenVanDag(dag.kerkKey, htc, eigen?.HEILIGEN) : []), [dag, htc, eigen]);

  // Scroll vastzetten; Escape en de terugknop sluiten via de gedeelde pop-upstapel (lib/terug.ts).
  useEffect(() => {
    if (!gekozenDag) return;
    return vergrendelScroll();
  }, [gekozenDag]);

  return (
    <>
      {dag && (
        <Modal open onClose={onClose} eyebrow={formatLang(dag.civil)} title="Heiligen van de dag" centerTitle maxWidth="max-w-xl">
          {heiligen.length > 0 ? (
            <ul className="grid gap-2">
              {heiligen.map((h, i) => (
                <li key={`${h.naam}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setGekozen(h)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-parchment-3 bg-white/70 px-4 py-3 text-left transition hover:border-gold hover:bg-gold-pale"
                  >
                    <span>
                      <span className="font-display block text-lg font-semibold leading-snug">{h.naam}</span>
                      {h.titel && h.titel !== h.naam && <span className="mt-0.5 block text-[13px] text-ink-soft">{h.titel}</span>}
                    </span>
                    <span aria-hidden="true" className="shrink-0 text-gold-deep">→</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-mute">{htc ? 'Voor deze dag zijn geen heiligen beschikbaar.' : 'Heiligen worden geladen…'}</p>
          )}
        </Modal>
      )}
      <LiturgicalPopup open={!!gekozen} onClose={() => setGekozen(null)} content={popupContent(gekozen)} />
    </>
  );
}
