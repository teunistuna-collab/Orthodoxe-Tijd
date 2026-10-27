import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { dagInfo, hoofdletter, type Mode } from '../lib/kalender';
import { LITURGISCHE_KLEUREN, liturgischeKleur } from '../lib/liturgischeKleur';
import { vastenGroep } from '../lib/vasten';
import { VastenSymbool } from './ui';
import { SIERKRUIS } from './symbolen';
import './etmaal-mobiel.css';
import './geboorte-mobiel.css';

// Gedeelde onderdelen van de mobiele cycli (Geboorte, Pascha) en Vandaag: de aftelkaart (zoals het actuele gebedsuur op
// Etmaal), de informatieregels (liturgische kleur, vasten, plaats) en een lijstregel. Opmaak: geboorte-mobiel.css (.gm-…)
// en etmaal-mobiel.css (.em-nu).

/** Aftelling naar een feest, of op het feest en in de feesttijd de feestgroet. Eén component voor Vandaag, Geboorte en
 *  Pascha; de dagen komen uit de berekening van de cyclus zelf (lib/geboortecyclus.ts, lib/paascyclus.ts). */
export function AftelKaart({ label, dagen, onder, voet, groet, href, className = '' }: {
  label: string;
  dagen: number;
  onder: string;
  voet?: string;
  /** Feestgroet (regels) wanneer er niets meer af te tellen is */
  groet?: string[];
  href: string;
  className?: string;
}) {
  const feest = dagen <= 0 && !!groet?.length;
  return (
    <a className={`em-nu gm-aftel${feest ? ' is-feest' : ''} ${className}`} href={href}>
      <span className="em-nu-kruis">{SIERKRUIS}</span>
      <span className="em-nu-tekst">
        <span className="am-label">{label}</span>
        {feest ? (
          <b className="gm-groet">
            {groet!.map((r, i) => (
              <span key={i}>{r}</span>
            ))}
          </b>
        ) : (
          <>
            <b>{dagen} {dagen === 1 ? 'dag' : 'dagen'}</b>
            <span>{onder}</span>
            {voet && <small className="gm-voet">{voet}</small>}
          </>
        )}
      </span>
      <ChevronRight className="am-pijl" aria-hidden="true" />
    </a>
  );
}

/** Informatieregels: liturgische kleur, vasten en (optioneel) de plaats in de cyclus, voor één datum. */
export function InfoRegels({ datum, mode, plaats }: { datum: Date; mode: Mode; plaats?: string }) {
  const d = dagInfo(datum, mode);
  const kleur = LITURGISCHE_KLEUREN[liturgischeKleur(d)];
  const groep = vastenGroep(d.vasten.niveau);
  return (
    <ul className="gm-info">
      <li>
        <span className="gm-info-teken" aria-hidden="true"><span className="gm-kleur" style={{ background: kleur.hex }} /></span>
        <span><b>Liturgische kleur</b><span>{hoofdletter(kleur.naam)} ({kleur.uitleg})</span></span>
      </li>
      <li>
        <span className="gm-info-teken" aria-hidden="true">{groep ? <VastenSymbool groep={groep} className="gm-vasten" /> : SIERKRUIS}</span>
        <span><b>Vasten</b><span>{d.vasten.label}</span></span>
      </li>
      {plaats && (
        <li>
          <span className="gm-info-teken" aria-hidden="true">{SIERKRUIS}</span>
          <span><b>Plaats in de cyclus</b><span>{plaats}</span></span>
        </li>
      )}
    </ul>
  );
}

/** Lijstregel zonder icoon: titel met de datum of uitleg eronder; `datum` zet een korte datum links (Pascha). */
export function Rij({ href, titel, onder, datum, nu }: { href: string; titel: string; onder: ReactNode; datum?: string; nu?: boolean }) {
  return (
    <li>
      <a className={`gm-rij${nu ? ' is-nu' : ''}${datum ? ' met-datum' : ''}`} href={href} aria-current={nu ? 'true' : undefined}>
        {datum && <span className="gm-rij-datum">{datum}</span>}
        <span className="gm-rij-tekst">
          <b>{titel}</b>
          <span>{onder}</span>
        </span>
        <ChevronRight className="am-pijl" aria-hidden="true" />
      </a>
    </li>
  );
}
