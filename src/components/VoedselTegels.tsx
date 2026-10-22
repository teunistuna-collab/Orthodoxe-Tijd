import { Check, X } from 'lucide-react';
import { VOEDSELGROEPEN, type Voedselgroep } from '../lib/voedselgroepen';

// Voedseltegels: per voedselgroep het gerecht van de vastentafel, de naam en een vinkje (toegestaan) of kruis (niet
// toegestaan). Gedeeld door de vastentafel en het dagvenster van de Vasten-pagina; de status komt altijd uit
// lib/voedselgroepen.ts. Met `onKies` zijn de tegels knoppen (hover, focus en aantikken lichten de groep op).
// Opmaak: ontwerp.css (.vt-tegels).

const MAP = '/images/vasten/tafel';

export default function VoedselTegels({ status, licht = null, gekozen = null, onLicht, onKies }: {
  status: Record<Voedselgroep, boolean>;
  licht?: Voedselgroep | null;
  gekozen?: Voedselgroep | null;
  onLicht?: (groep: Voedselgroep | null) => void;
  onKies?: (groep: Voedselgroep) => void;
}) {
  return (
    <ul className="vt-tegels">
      {VOEDSELGROEPEN.map(({ groep, naam }) => {
        const ok = status[groep];
        const inhoud = (
          <>
            <img src={`${MAP}/${groep}.webp`} alt="" loading="lazy" decoding="async" />
            <span className="vt-naam">{naam}</span>
            <span className="vt-teken" aria-hidden="true">
              <Check className="vt-ja" />
              <X className="vt-nee" />
            </span>
          </>
        );
        const label = `${naam}: ${ok ? 'toegestaan' : 'niet toegestaan'}`;
        return (
          <li key={groep} className={`vt-tegel ${ok ? 'is-toegestaan' : 'is-niet'}${licht === groep ? ' is-licht' : ''}`}>
            {onKies ? (
              <button
                type="button"
                className="vt-tegel-binnen"
                aria-label={label}
                aria-pressed={gekozen === groep}
                onClick={() => onKies(groep)}
                onMouseEnter={() => onLicht?.(groep)}
                onMouseLeave={() => onLicht?.(null)}
                onFocus={() => onLicht?.(groep)}
                onBlur={() => onLicht?.(null)}
              >
                {inhoud}
              </button>
            ) : (
              <div className="vt-tegel-binnen" role="img" aria-label={label}>
                {inhoud}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
