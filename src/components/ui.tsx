import type { CSSProperties, ReactNode } from 'react';
import { LADDER, NIVEAUS, vastenGroep, type VastenGroep, type VastenNiveau, type VastenRegel } from '../lib/vasten';
import type { Feest } from '../lib/feesten';

interface SectionTitleProps {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  dark?: boolean;
  align?: 'center' | 'left';
}

export function SectionTitle({ eyebrow, title, intro, dark, align = 'center' }: SectionTitleProps) {
  const center = align === 'center';
  return (
    <div className={`${center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} mb-10`}>
      <p className={`text-[11px] font-bold tracking-[0.28em] uppercase ${dark ? 'text-gold-light' : 'text-gold-deep'}`}>{eyebrow}</p>
      <h2 className={`font-display mt-2 text-3xl font-semibold sm:text-4xl ${dark ? 'text-cream' : 'text-ink'}`}>{title}</h2>
      <div className={`gold-rule mt-4 w-40 ${center ? 'mx-auto' : ''}`} />
      {intro && <p className={`mt-4 text-[15px] leading-relaxed ${dark ? 'text-[#e6d9bd]' : 'text-ink-soft'}`}>{intro}</p>}
    </div>
  );
}

// Vastensymbool in de kalender en het dagvenster; de groepen staan in lib/vasten.ts (vastenGroep).
const SYMBOOL: Record<VastenGroep, ReactNode> = {
  strikt: <><path d="M3 13C3 6.5 6.8 3 13 3c0 6.2-3.5 10-10 10Z" /><path d="M3 13l6-6" /></>,
  olie: <path d="M8 2.5S3.8 7.3 3.8 10.1a4.2 4.2 0 0 0 8.4 0C12.2 7.3 8 2.5 8 2.5Z" />,
  vis: <><path d="M1.8 8c2.6-3.6 7-3.6 9.6 0-2.6 3.6-7 3.6-9.6 0Z" /><path d="M11.4 8l3-2.6v5.2Z" /><circle cx="5" cy="7.4" r=".5" fill="currentColor" /></>,
  zuivel: <><path d="M2.5 12V7.8L13.5 4v8Z" /><circle cx="9" cy="9.4" r="1" /></>,
};
export function VastenSymbool({ groep, className = 'h-3 w-3' }: { groep: VastenGroep; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SYMBOOL[groep]}
    </svg>
  );
}

export function VastenBadge({ regel, size = 'md', showLabel = true }: { regel: VastenRegel; size?: 'sm' | 'md' | 'lg'; showLabel?: boolean }) {
  const n = NIVEAUS[regel.niveau];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold tracking-wide ${pad}`}
      style={{ background: n.zacht, color: n.tekst, border: `1px solid color-mix(in srgb, ${n.kleur} 20%, transparent)` }}
    >
      {vastenGroep(regel.niveau) ? <VastenSymbool groep={vastenGroep(regel.niveau)!} className={size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'} /> : <span className="inline-block h-2 w-2 rounded-full" style={{ background: n.kleur }} />}
      {showLabel ? regel.label : n.kort}
    </span>
  );
}

// Kleurlegenda van het vasten: één kleurstip per trede van de ladder. Gedeeld door de kalender en de vastenpagina.
export function VastenKleuren({ actief }: { actief?: VastenNiveau }) {
  return (
    <>
      {LADDER.filter((l) => l.id !== 'geen').map((l) => (
        <span key={l.id} className={`inline-flex items-center gap-1.5${actief === l.id ? ' font-bold text-ink' : ''}`}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.kleur }} /> {l.kort}
        </span>
      ))}
    </>
  );
}

export function NiveauDot({ niveau, className = 'h-2 w-2' }: { niveau: VastenRegel['niveau']; className?: string }) {
  return <span className={`inline-block rounded-full ${className}`} style={{ background: NIVEAUS[niveau].kleur }} />;
}

export function FeestTag({ feest }: { feest: Feest }) {
  const map: Record<string, string> = {
    pascha: 'bg-wine text-gold-light',
    groot: 'bg-gold text-bark',
    beweeglijk: 'bg-[#e9dcc0] text-ink',
    feest: 'bg-[#f2e6cf] text-gold-deep',
    gedachtenis: 'bg-[#efe9dc] text-ink-soft',
  };
  const label: Record<string, string> = {
    pascha: 'Feest der feesten',
    groot: 'Groot feest',
    beweeglijk: 'Beweeglijk',
    feest: 'Feest',
    gedachtenis: 'Gedachtenis',
  };
  const key = feest.soort === 'beweeglijk' && feest.groot ? 'groot' : feest.soort;
  return <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${map[key]}`}>{label[key]}</span>;
}

// De gouden hoekversiering (public/images/ui/hoeksier.webp, scripts/hoeksier.mjs; linksboven); spiegelen met -scale-x-100 / -scale-y-100.
/** Het kruis als teken in de tekst (in plaats van ☦): silhouet in de huidige tekstkleur. Opmaak: .kruis-teken in index.css. */
export function KruisTeken() {
  return <span className="kruis-teken" aria-hidden="true" />;
}

export function Hoeksier({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`hoeksier ${className}`} />;
}

export function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold" />
      <span className="text-sm">✠</span>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold" />
    </div>
  );
}

// Compacte lijstregel voor mobiel (feesten, weekdagen, ...): datumblok links, titel met onderregel, pijl rechts.
export function MobileListRow({ links, icoon, titel, onder, rechts, onClick, className = '', style }: {
  links: ReactNode;
  icoon?: ReactNode;
  titel: ReactNode;
  onder?: ReactNode;
  rechts?: ReactNode;
  onClick: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button type="button" onClick={onClick} className={`mlr ${className}`} style={style}>
      <span className="mlr-links">{links}</span>
      {icoon && <span className="mlr-icoon" aria-hidden="true">{icoon}</span>}
      <span className="mlr-tekst">
        <span className="mlr-titel">{titel}</span>
        {onder && <span className="mlr-onder">{onder}</span>}
      </span>
      {rechts}
      <span className="mlr-pijl" aria-hidden="true">›</span>
    </button>
  );
}
