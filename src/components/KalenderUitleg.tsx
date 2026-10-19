import { useEffect, useRef } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useApp } from '../lib/context';
import type { Mode } from '../lib/kalender';
import { vergrendelScroll } from '../lib/scrollLock';
import { useTerugSluit } from '../lib/terug';
import { houdFocusBinnen } from '../lib/focus';
import './welkom.css';

const KALENDERS: { id: Mode; label: string }[] = [
  { id: 'oud', label: 'Oud · juliaans' },
  { id: 'nieuw', label: 'Nieuw · gregoriaans' },
];

// Welkomstvenster bij het eerste bezoek: de kalender (Oud/Nieuw, direct toegepast zoals in Instellingen), met "Verder naar
// vandaag". De keuze voor een traditie komt terug zodra er andere tradities zijn (Instellingen: "Binnenkort"). Eigen venster op perkament met gouden hoeksieraden (welkom.css); Escape, de terugknop en
// een klik buiten het venster sluiten het, net als de andere vensters (lib/terug.ts).
export default function KalenderUitleg({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mode, setMode } = useApp();
  const vensterRef = useRef<HTMLDivElement | null>(null);
  useTerugSluit(open, onClose);

  // Scroll vastzetten en de focus in het venster; bij sluiten terug naar waar hij vandaan kwam.
  useEffect(() => {
    if (!open) return;
    const ontgrendel = vergrendelScroll();
    const terug = document.activeElement as HTMLElement | null;
    vensterRef.current?.focus({ preventScroll: true });
    return () => {
      ontgrendel();
      terug?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  const verder = () => {
    onClose();
    window.location.hash = 'vandaag';
  };

  return (
    <div className="ku-achter" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="ku-titel" ref={vensterRef} tabIndex={-1} className="ku-venster" onClick={(e) => e.stopPropagation()} onKeyDown={houdFocusBinnen}>
        {(['lb', 'rb', 'lo', 'ro'] as const).map((hoek) => (
          <img key={hoek} className={`ku-hoek ku-hoek-${hoek}`} src="/images/ui/hoeksier.webp" alt="" aria-hidden="true" width={256} height={256} />
        ))}
        <button type="button" className="ku-sluit" onClick={onClose} aria-label="Sluiten">
          <X aria-hidden="true" />
        </button>

        <img className="ku-kruis" src="/images/ui/kruis.webp" alt="" aria-hidden="true" width={218} height={256} />
        <p className="ku-merk">Orthodoxe Tijd</p>
        <h2 id="ku-titel" className="ku-titel">Welkom</h2>
        <p className="ku-onder">Een weg door de tijd, een leven met Christus.</p>
        <img className="ku-sierlijn" src="/images/vandaag/sierlijn.svg" alt="" aria-hidden="true" width={480} height={40} />

        <div className="ku-kolommen">
          <fieldset className="ku-groep">
            <legend>Kalender</legend>
            {KALENDERS.map(({ id, label }) => (
              <label key={id} className="ku-keuze">
                <input type="radio" name="ku-kalender" value={id} checked={mode === id} onChange={() => setMode(id)} />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
        </div>

        <button type="button" className="ku-verder" onClick={verder}>
          Verder naar vandaag <ArrowRight aria-hidden="true" />
        </button>
        <p className="ku-noot">U kunt uw keuze later wijzigen bij Instellingen.</p>
      </div>
    </div>
  );
}
