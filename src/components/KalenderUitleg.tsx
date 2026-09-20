import { useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../lib/context';
import type { Mode } from '../lib/kalender';
import { vergrendelScroll } from '../lib/scrollLock';

const KEUZES: { id: Mode; titel: string; tekst: string }[] = [
  {
    id: 'oud',
    titel: 'Oude kalender · juliaans',
    tekst: 'De vaste feesten vallen dertien dagen later dan op de burgerlijke kalender: Kerstmis op 7 januari, Theofanie op 19 januari. Gevolgd door de Russische, Servische, Georgische parochies en de Athos.',
  },
  {
    id: 'nieuw',
    titel: 'Nieuwe kalender · gereviseerd juliaans',
    tekst: 'De vaste feesten vallen op de burgerlijke datum: Kerstmis op 25 december. Gevolgd door de Griekse, Roemeense, Bulgaarse en Antiocheense parochies.',
  },
];

// Legt uit wat de Oud/Nieuw-schakelaar in de koptekst doet. Verschijnt één keer bij het eerste bezoek
// en is daarna op te roepen via de voettekst.
export default function KalenderUitleg({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mode, setMode } = useApp();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const ontgrendel = vergrendelScroll();
    return () => {
      document.removeEventListener('keydown', onKey);
      ontgrendel();
    };
  }, [open, onClose]);

  return (
    <Modal open={open} onClose={onClose} eyebrow="Kalenderkeuze" title="Welke kalender volgt u?" labelledBy="kalender-uitleg-titel" centerTitle maxWidth="max-w-2xl">
      <p className="text-sm leading-relaxed text-ink-soft sm:text-base">
        Dit bepaalt op welke dag feesten, heiligen en lezingen vallen. Kies de kalender van uw parochie; u kunt later altijd wisselen met de knop <strong>Oud / Nieuw</strong> bovenaan de pagina.
      </p>
      <div className="mt-4 grid gap-3">
        {KEUZES.map(({ id, titel, tekst }) => {
          const actief = mode === id;
          return (
            <button
              key={id}
              type="button"
              autoFocus={actief}
              aria-pressed={actief}
              onClick={() => {
                setMode(id);
                onClose();
              }}
              className={`w-full rounded-xl border p-4 text-left transition ${actief ? 'border-gold bg-gold-pale/70' : 'border-gold/25 bg-[#f8f1e3] hover:border-gold/60'}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold tracking-[0.18em] text-gold-deep uppercase">{titel}</span>
                {actief && <span className="rounded-sm bg-gold px-1.5 py-0.5 text-[11px] font-bold text-bark uppercase">actief</span>}
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-ink-soft">{tekst}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">Pascha wordt in beide gevallen volgens de Juliaanse paasregel berekend en valt dus op dezelfde dag.</p>
    </Modal>
  );
}
