import type { CSSProperties, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Gedeelde onderdelen van de vernieuwde pagina's (Kalender, Pascha, Feesten, Vasten, Gebeden, Psalmen, Adem).
// Opmaak: ontwerp.css (alles onder .ot-redesign).

/** Illustratie voor de kop (NisKop `achter`): public/images/ontwerp/<naam>-800|1536.webp (scripts/ontwerp-beelden.mjs). */
export function BannerBeeld({ naam, open }: { naam: string; open: boolean }) {
  const pad = `/images/ontwerp/${naam}`;
  return <img className={`ot-banner ot-banner-${naam}`} src={`${pad}-800.webp`} srcSet={`${pad}-800.webp 800w, ${pad}-1536.webp 1536w`} sizes="(min-width: 768px) 960px, 100vw" alt="" width={1536} height={1024} fetchPriority={open ? 'high' : 'auto'} decoding="async" />;
}

/** Gouden sierlijn met middenornament. */
export function Sierlijn() {
  return <img className="vg-sierlijn vg-cy-sierlijn ot-sierlijn" src="/images/vandaag/sierlijn.svg" alt="" aria-hidden="true" width={480} height={40} />;
}

/** Maandtitel met vorige/volgende maand aan weerszijden. */
export function MaandNav({ titel, onVorige, onVolgende }: { titel: string; onVorige: () => void; onVolgende: () => void }) {
  return (
    <div className="ot-maandnav">
      <button type="button" onClick={onVorige} aria-label="Vorige maand"><ChevronLeft aria-hidden="true" /></button>
      <h2 aria-live="polite">{titel}</h2>
      <button type="button" onClick={onVolgende} aria-label="Volgende maand"><ChevronRight aria-hidden="true" /></button>
    </div>
  );
}

/** Rij in een verticale tijdlijn: links een medaillon (of alleen een knoop), een dunne lijn met knoop, titel en periode,
 *  rechts een pijl; de hele rij is klikbaar. `kleur` kleurt medaillon en knoop. */
export function TijdlijnRij({ beeld, kleur, titel, onder, nu, onClick }: { beeld?: ReactNode; kleur: string; titel: ReactNode; onder: ReactNode; nu?: boolean; onClick: () => void }) {
  return (
    <li className="ot-tl-rij" style={{ '--ot-fase': kleur } as CSSProperties}>
      <button type="button" onClick={onClick} aria-current={nu ? 'true' : undefined}>
        {beeld && <span className="ot-tl-medaillon" aria-hidden="true">{beeld}</span>}
        <span className="ot-tl-knoop" aria-hidden="true" />
        <span className="ot-tl-tekst">
          <b>{titel}{nu && <span className="ot-nu">Nu</span>}</b>
          <span>{onder}</span>
        </span>
        <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
      </button>
    </li>
  );
}

/** Knop in bordeaux (of omlijnd met `omlijnd`), als link of als knop. */
export function ActieKnop({ href, onClick, omlijnd, children }: { href?: string; onClick?: () => void; omlijnd?: boolean; children: ReactNode }) {
  const klasse = `ot-actie${omlijnd ? ' is-omlijnd' : ''}`;
  const inhoud = <><span>{children}</span><span aria-hidden="true">›</span></>;
  return href ? <a className={klasse} href={href}>{inhoud}</a> : <button type="button" className={klasse} onClick={onClick}>{inhoud}</button>;
}
