import { useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../lib/context';
import type { Mode } from '../lib/kalender';
import { vergrendelScroll } from '../lib/scrollLock';

const KALENDERS: { id: Mode; label: string }[] = [
  { id: 'oud', label: 'Oud · juliaans' },
  { id: 'nieuw', label: 'Nieuw · gregoriaans' },
];

const TRADITIES = ['Koptisch Orthodox', 'Syrisch Orthodox', 'Oosters Orthodox'];

// Keuzemenu bij het eerste bezoek (daarna op te roepen via de voettekst): de kalender (Oud/Nieuw, zoals de schakelaar
// in de koptekst) en de traditie. Elke traditieknop sluit het menu en gaat naar Vandaag.
export default function KalenderUitleg({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mode, setMode } = useApp();

  // Scroll vastzetten; Escape en de terugknop sluiten via de gedeelde pop-upstapel (lib/terug.ts).
  useEffect(() => {
    if (!open) return;
    return vergrendelScroll();
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} eyebrow="Welkom" title="Kies uw traditie" labelledBy="kalender-uitleg-titel" centerTitle maxWidth="max-w-2xl">
      <div className="keuze-menu">
        <p className="ot-label">Kalender</p>
        <div className="keuze-rij" role="group" aria-label="Kalender">
          {KALENDERS.map(({ id, label }) => (
            <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)} className="btn-pill keuze-kalender">
              {label}
            </button>
          ))}
        </div>
        <p className="ot-label">Traditie</p>
        <div className="keuze-tradities">
          {TRADITIES.map((traditie) => (
            <button
              key={traditie}
              type="button"
              onClick={() => {
                onClose();
                window.location.hash = 'vandaag';
              }}
              className="btn-pill keuze-traditie"
            >
              {traditie}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
