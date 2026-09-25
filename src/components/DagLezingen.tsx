import { useEffect, useMemo } from 'react';
import { useApp } from '../lib/context';
import { dagInfo, formatLang, parseYmd } from '../lib/kalender';
import { LEZINGEN_JAAR, lezingSoort, vertaalRef, vertaalTag } from '../lib/htc';
import Modal from './Modal';
import { vergrendelScroll } from '../lib/scrollLock';

interface Props {
  ymd: string | null;
  onClose: () => void;
}

// Pop-up met uitsluitend de Schriftlezingen van één dag (geen heiligen, vasten of feesten).
// Een tik op een lezing opent de lezing zelf in de bestaande lezingen-pop-up.
export default function DagLezingen({ ymd: gekozen, onClose }: Props) {
  const { mode, vandaagYmd, htc, openLezing } = useApp();
  const dag = useMemo(() => (gekozen ? dagInfo(parseYmd(gekozen), mode, vandaagYmd) : null), [gekozen, mode, vandaagYmd]);

  useEffect(() => {
    if (!gekozen) return;
    const onKey = (e: KeyboardEvent) => {
      // met een lezing erbovenop sluit Escape alleen die lezing
      if (e.key === 'Escape' && document.querySelectorAll('[role="dialog"]').length <= 1) onClose();
    };
    window.addEventListener('keydown', onKey);
    const ontgrendel = vergrendelScroll();
    return () => {
      window.removeEventListener('keydown', onKey);
      ontgrendel();
    };
  }, [gekozen, onClose]);

  if (!dag) return null;
  const lezingen = dag.jaar === LEZINGEN_JAAR ? htc?.[dag.julianKey]?.r ?? [] : [];

  return (
    <Modal lezen open onClose={onClose} eyebrow={formatLang(dag.civil)} title="Schriftlezingen" centerTitle maxWidth="max-w-xl">
      {lezingen.length > 0 ? (
        <ul className="grid gap-2">
          {lezingen.map((l, i) => {
            const refNl = vertaalRef(l.ref);
            const soort = lezingSoort(refNl);
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => openLezing({ ref: l.ref, tag: l.tag, julianKey: dag.julianKey, civil: dag.civil })}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-parchment-3 bg-white/70 px-4 py-3 text-left transition hover:border-gold hover:bg-gold-pale"
                >
                  <span>
                    <span className="block text-[11px] font-bold tracking-wider text-gold-deep uppercase">{vertaalTag(l.tag, refNl)}</span>
                    <span className="font-display text-xl font-semibold">{refNl}</span>
                  </span>
                  <span className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[11px] font-bold uppercase ${soort === 'evangelie' ? 'bg-wine text-gold-light' : soort === 'oud' ? 'bg-parchment-3 text-ink' : 'bg-gold-pale text-gold-deep'}`}>
                    {soort === 'evangelie' ? 'Evangelie' : soort === 'oud' ? 'OT' : 'Apostel'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-ink-mute">
          {dag.jaar === LEZINGEN_JAAR ? (htc ? 'Geen lezingen gevonden voor deze dag.' : 'Lezingen worden geladen…') : `Het leesrooster is beschikbaar voor het kerkjaar ${LEZINGEN_JAAR}.`}
        </p>
      )}
    </Modal>
  );
}
