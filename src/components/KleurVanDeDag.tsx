import { useId, useState } from 'react';
import { Info } from 'lucide-react';
import type { DagInfo } from '../lib/kalender';
import { LITURGISCHE_KLEUREN, kleurVanDeDag } from '../lib/liturgischeKleur';

// Kleine indicatie van de liturgische kleur (Vandaag, Pascha): een rond kleurmedaillon, de kleur met de reden, de korte
// betekenis, en een info-knop met de kanttekening dat het om de gebruikelijke gewaadkleur gaat. Opmaak: Vandaag.css (.lk).
export default function KleurVanDeDag({ dag }: { dag: DagInfo }) {
  const [uitleg, setUitleg] = useState(false);
  const id = useId();
  const { kleur, naar, reden } = kleurVanDeDag(dag);
  const k = LITURGISCHE_KLEUREN[kleur];
  const n = naar ? LITURGISCHE_KLEUREN[naar] : null;
  const naam = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <div className="lk">
      <span className="lk-medaillon" style={{ background: n ? `linear-gradient(90deg, ${k.hex} 50%, ${n.hex} 50%)` : k.hex }} aria-hidden="true" />
      <p className="lk-tekst">
        <span className="lk-naam">
          Liturgische kleur: {naam(k.naam)}
          {n && ` → ${n.naam}`}
          <span className="lk-reden"> · {reden}</span>
        </span>
        <span className="lk-betekenis">{n ? `${k.betekenis}; bij de Liturgie: ${n.betekenis.charAt(0).toLowerCase()}${n.betekenis.slice(1)}` : k.betekenis}</span>
        {uitleg && (
          <span id={id} className="lk-uitleg">
            De gebruikelijke gewaadkleur in de Russische traditie (zoals in de ROCOR). Kleuren kunnen per orthodoxe parochie of klooster verschillen.
          </span>
        )}
      </p>
      <button type="button" className="lk-info" aria-expanded={uitleg} aria-controls={uitleg ? id : undefined} aria-label="Over de liturgische kleur" title="Over de liturgische kleur" onClick={() => setUitleg((u) => !u)}>
        <Info aria-hidden="true" />
      </button>
    </div>
  );
}
