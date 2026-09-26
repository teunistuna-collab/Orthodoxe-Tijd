import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useSwipe } from '../lib/swipe';
import { useTerugSluit } from '../lib/terug';
import Leesbediening, { type Deel } from './Leesbediening';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  actions?: ReactNode;
  leadingActions?: ReactNode;
  maxWidth?: string;
  labelledBy?: string;
  centerTitle?: boolean;
  onVorige?: () => void;
  onVolgende?: () => void;
  // Echte leesinhoud (gebed, dienst, psalm, lezing): leesbediening onderaan, leesvoorkeuren toepassen en het scherm aan houden.
  lezen?: boolean;
  // Alleen psalmen: opname bij de leesbediening (verschijnt pas als er een echt bestand is).
  leesAudio?: string;
  // Deelknop bij de leesbediening, met een deeplink naar deze inhoud.
  deel?: Deel;
};

// Houdt het scherm aan zolang er een leesvenster (gebed, dienst, lezing, psalm) open staat.
function useSchermAan(open: boolean) {
  useEffect(() => {
    if (!open || !('wakeLock' in navigator)) return;
    let actief = true;
    let slot: WakeLockSentinel | null = null;
    const vraag = () => {
      navigator.wakeLock
        .request('screen')
        .then((s) => {
          if (actief) slot = s;
          else void s.release();
        })
        .catch(() => {});
    };
    const opZicht = () => {
      if (document.visibilityState === 'visible') vraag();
    };
    vraag();
    document.addEventListener('visibilitychange', opZicht);
    return () => {
      actief = false;
      document.removeEventListener('visibilitychange', opZicht);
      void slot?.release().catch(() => {});
    };
  }, [open]);
}

export default function Modal({ open, onClose, title, eyebrow, children, actions, leadingActions, maxWidth = 'max-w-3xl', labelledBy, centerTitle = false, onVorige, onVolgende, lezen = false, leesAudio, deel }: ModalProps) {
  const veeg = useSwipe(onVorige, onVolgende);
  const eigenId = useId();
  const titelId = labelledBy ?? eigenId;
  useSchermAan(open && lezen);
  useTerugSluit(open, onClose);

  if (!open) return null;

  return (
    <div className="exact-modal-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titelId}
        className={`exact-modal-frame ${maxWidth}`}
        onClick={(event) => event.stopPropagation()}
        {...veeg}
      >
        <header className="exact-modal-titlebar">
          <div className="exact-modal-nav exact-modal-nav-left">{leadingActions}</div>
          <div className="exact-modal-heading">
            <div className="exact-modal-heading-line"><span /> <b>✣</b> <span /></div>
            {eyebrow && <p>{eyebrow}</p>}
            <h2 id={titelId}>{title}</h2>
          </div>
          <div className="exact-modal-nav exact-modal-nav-right">
            {actions}
            <button type="button" onClick={onClose} className="exact-modal-close" aria-label="Sluiten"><X /></button>
          </div>
        </header>
        <div className={`exact-modal-paper${centerTitle ? ' exact-modal-centered' : ''}${lezen ? ' lees-vlak' : ''}`}>{children}</div>
        {lezen && (
          <div className="exact-modal-voet">
            <Leesbediening audioSrc={leesAudio} deel={deel} />
          </div>
        )}
      </div>
    </div>
  );
}
