import { useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useSwipe } from '../lib/swipe';
import { useTerugSluit } from '../lib/terug';

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
  // Echte leesinhoud (gebed, dienst, psalm, lezing): leesknoppen tonen en het scherm aan houden.
  lezen?: boolean;
};

// Leesvoorkeuren voor alle pop-ups: een klasse op <html>, bewaard tussen bezoeken (zie "Bouw 59" in index.css).
const LEESKEUZES = [
  { klasse: 'lees-groot', label: 'Grote letters' },
  { klasse: 'lees-nacht', label: 'Avondweergave' },
];
try {
  for (const { klasse } of LEESKEUZES) if (localStorage.getItem(klasse)) document.documentElement.classList.add(klasse);
} catch {
  /* geen opslag */
}

function wisselLeeskeuze(klasse: string) {
  const aan = document.documentElement.classList.toggle(klasse);
  try {
    if (aan) localStorage.setItem(klasse, '1');
    else localStorage.removeItem(klasse);
  } catch {
    /* geen opslag */
  }
}

// Houdt het scherm aan zolang er een pop-up (gebed, dienst, lezing) open staat.
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

/** Leesknoppen (Grote letters, Avondweergave). Werkt op elk element met .exact-modal-paper of .lees-vlak (Bouw 59). */
export function Leeskeuzes({ className = '' }: { className?: string }) {
  const [, ververs] = useState(0);
  return (
    <div className={`leeskeuzes ${className}`}>
      {LEESKEUZES.map(({ klasse, label }) => (
        <button
          key={klasse}
          type="button"
          aria-pressed={document.documentElement.classList.contains(klasse)}
          onClick={() => {
            wisselLeeskeuze(klasse);
            ververs((n) => n + 1);
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function Modal({ open, onClose, title, eyebrow, children, actions, leadingActions, maxWidth = 'max-w-3xl', labelledBy, centerTitle = false, onVorige, onVolgende, lezen = false }: ModalProps) {
  const veeg = useSwipe(onVorige, onVolgende);
  useSchermAan(open && lezen);
  useTerugSluit(open, onClose);

  if (!open) return null;

  return (
    <div className="exact-modal-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`exact-modal-frame ${maxWidth}`}
        onClick={(event) => event.stopPropagation()}
        {...veeg}
      >
        <header className="exact-modal-titlebar">
          <div className="exact-modal-nav exact-modal-nav-left">{leadingActions}</div>
          <div className="exact-modal-heading">
            <div className="exact-modal-heading-line"><span /> <b>✣</b> <span /></div>
            {eyebrow && <p>{eyebrow}</p>}
            <h2 id={labelledBy}>{title}</h2>
          </div>
          <div className="exact-modal-nav exact-modal-nav-right">
            {actions}
            <button type="button" onClick={onClose} className="exact-modal-close" aria-label="Sluiten"><X /></button>
          </div>
        </header>
        <div className={`exact-modal-paper ${centerTitle ? 'exact-modal-centered' : ''}`}>
          {lezen && <Leeskeuzes />}
          {children}
        </div>
      </div>
    </div>
  );
}
