import type { ReactNode } from 'react';
import { NIVEAUS, vastenGroep, type VastenGroep, type VastenRegel } from '../lib/vasten';
import type { Feest } from '../lib/feesten';

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
      className={`inline-flex items-center gap-1.5 font-bold tracking-wide ${pad}`}
      style={{ background: n.zacht, color: n.tekst, border: `1px solid color-mix(in srgb, ${n.kleur} 20%, transparent)` }}
    >
      {vastenGroep(regel.niveau) ? <VastenSymbool groep={vastenGroep(regel.niveau)!} className={size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'} /> : <span className="inline-block h-2 w-2 rounded-full" style={{ background: n.kleur }} />}
      {showLabel ? regel.label : n.kort}
    </span>
  );
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

/** Het kruis als teken in de tekst (in plaats van ☦): silhouet in de huidige tekstkleur. Opmaak: .kruis-teken in index.css. */
export function KruisTeken() {
  return <span className="kruis-teken" aria-hidden="true" />;
}

