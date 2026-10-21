import { ChevronRight } from 'lucide-react';
import { bereikLang, kortBereik } from '../lib/kalender';

// De tijdlijn van een seizoenscyclus (Pascha, Geboortecyclus): elke periode met haar datums, "Nu" bij de periode waarin
// vandaag valt, de bekeken periode gemarkeerd. Opmaak: .vg-pc-lijn (Vandaag.css, ontwerp.css).

export interface TijdlijnStap<K extends string> { key: K; label: string; van: Date; tot: Date }

export default function CyclusTijdlijn<K extends string>({ stappen, huidige, bekeken, label, onKies }: {
  stappen: TijdlijnStap<K>[];
  huidige: K | null;
  bekeken: K | null;
  label: string;
  onKies: (key: K, knop: HTMLElement) => void;
}) {
  return (
    <ol className="vg-et-lijn vg-wk-lijn vg-pc-lijn" aria-label={label}>
      {stappen.map((s) => {
        const nu = s.key === huidige;
        return (
          <li key={s.key}>
            <button
              type="button"
              className={[s.key === bekeken && 'is-actief', nu && 'is-nu'].filter(Boolean).join(' ') || undefined}
              aria-pressed={s.key === bekeken}
              aria-current={nu ? 'true' : undefined}
              aria-label={`${s.label}, ${bereikLang(s.van, s.tot)} ${s.tot.getUTCFullYear()}${nu ? ' (nu)' : ''}`}
              onClick={(e) => onKies(s.key, e.currentTarget)}
            >
              <span className="vg-wk-naam">{kortBereik(s.van, s.tot)}</span>
              <span>
                {s.label}
                {nu && <span className="ot-nu">Nu</span>}
              </span>
              <ChevronRight aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ol>
  );
}
