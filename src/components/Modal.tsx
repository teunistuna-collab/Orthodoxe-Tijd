import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useSwipe } from '../lib/swipe';
import { useTerugSluit } from '../lib/terug';
import { houdFocusBinnen } from '../lib/focus';
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
  /** Datum (of korte kop) midden in de bovenbalk, in bordeaux. */
  kopDatum?: string;
  /** Toon "← vorige" en "volgende →" in de bovenbalk (met onVorige/onVolgende). */
  kopNav?: boolean;
  vorigeLabel?: string;
  volgendeLabel?: string;
  /** Kleine regel onder de titel (bijv. de titel of functie van een heilige). */
  ondertitel?: string;
  /** Verandert deze waarde, dan springt het leesvlak terug naar boven (andere heilige in hetzelfde venster). */
  inhoudSleutel?: string;
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

export default function Modal({ open, onClose, title, eyebrow, children, actions, leadingActions, maxWidth = 'max-w-3xl', labelledBy, centerTitle = false, onVorige, onVolgende, lezen = false, leesAudio, deel, kopDatum, kopNav = false, vorigeLabel = 'Vorige', volgendeLabel = 'Volgende', ondertitel, inhoudSleutel }: ModalProps) {
  const veeg = useSwipe(onVorige, onVolgende);
  const eigenId = useId();
  const titelId = labelledBy ?? eigenId;
  useSchermAan(open && lezen);
  useTerugSluit(open, onClose);

  // Focus naar de pop-up (schermlezer en toetsenbord beginnen in het venster) en bij sluiten terug naar waar hij vandaan kwam.
  const frameRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const terug = document.activeElement as HTMLElement | null;
    frameRef.current?.focus({ preventScroll: true });
    return () => terug?.focus?.({ preventScroll: true });
  }, [open]);

  // Leesvensters: dunne gouden voortgangslijn bovenaan, en bij een lange tekst "Verder lezen" waar je gebleven was.
  // De plek wordt per tekst op dit toestel bewaard (sleutel: deeplink of titel) en vergeten zodra de tekst uit is.
  const papierRef = useRef<HTMLDivElement | null>(null);
  const balkRef = useRef<HTMLSpanElement | null>(null);
  const [hervat, setHervat] = useState<number | null>(null);
  const leesSleutel = `leesplek:${deel?.pad ?? title}`;
  useEffect(() => {
    const papier = papierRef.current;
    if (!open || !lezen || !papier) return;
    let bewaard = 0;
    try {
      bewaard = Number(localStorage.getItem(leesSleutel)) || 0;
    } catch {
      /* geen opslag */
    }
    setHervat(bewaard > 400 ? bewaard : null);
    let frame = 0;
    const opScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = papier.scrollHeight - papier.clientHeight;
        const deelGelezen = max > 0 ? papier.scrollTop / max : 0;
        balkRef.current?.style.setProperty('--gelezen', String(deelGelezen));
        if (papier.scrollTop > 200) setHervat(null);
        try {
          if (deelGelezen > 0.97) localStorage.removeItem(leesSleutel);
          else if (papier.scrollTop > 400) localStorage.setItem(leesSleutel, String(Math.round(papier.scrollTop)));
        } catch {
          /* geen opslag */
        }
      });
    };
    opScroll();
    papier.addEventListener('scroll', opScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      papier.removeEventListener('scroll', opScroll);
    };
  }, [open, lezen, leesSleutel]);

  useEffect(() => {
    papierRef.current?.scrollTo({ top: 0 });
  }, [inhoudSleutel]);

  if (!open) return null;

  return (
    <div className="exact-modal-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titelId}
        ref={frameRef}
        tabIndex={-1}
        className={`exact-modal-frame pk ${maxWidth}`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={houdFocusBinnen}
        {...veeg}
      >
        {/* Bovenbalk (blijft staan bij scrollen): vorige · datum · volgende · sluiten */}
        <header className="pk-kop">
          <div className="pk-links">
            {kopNav && onVorige ? <button type="button" className="pk-nav" onClick={onVorige} aria-label={vorigeLabel}><span aria-hidden="true">←</span> vorige</button> : leadingActions}
          </div>
          <p className="pk-datum">{kopDatum}</p>
          <div className="pk-rechts">
            {kopNav && onVolgende && <button type="button" className="pk-nav" onClick={onVolgende} aria-label={volgendeLabel}>volgende <span aria-hidden="true">→</span></button>}
            {actions}
            <button type="button" onClick={onClose} className="exact-modal-close pk-sluit" aria-label="Sluiten"><X /></button>
          </div>
        </header>
        <div className="exact-modal-vlak">
          {lezen && <span ref={balkRef} className="lees-voortgang" aria-hidden="true" />}
          <div ref={papierRef} className={`exact-modal-paper${centerTitle ? ' exact-modal-centered' : ''}${lezen ? ' lees-vlak' : ''}`}>
            {/* Kop van het blad: label, titel, ondertitel en sierlijn (zie index.css, Bouw 163) */}
            <div className="pk-titelblok">
              {eyebrow && <p className="pk-label">{eyebrow}</p>}
              <h2 id={titelId} className="pk-titel">{title}</h2>
              {ondertitel && <p className="pk-onder">{ondertitel}</p>}
              <span className="pk-sierlijn" aria-hidden="true" />
            </div>
            {lezen && (
              <div className="pk-lees">
                <Leesbediening audioSrc={leesAudio} deel={deel} />
              </div>
            )}
            {children}
          </div>
          {lezen && hervat !== null && (
            <button
              type="button"
              className="lees-hervat"
              onClick={() => {
                papierRef.current?.scrollTo({ top: hervat, behavior: 'smooth' });
                setHervat(null);
              }}
            >
              Verder lezen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
