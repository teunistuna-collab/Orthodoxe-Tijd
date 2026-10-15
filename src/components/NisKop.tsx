import type { ReactNode } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { useApp } from '../lib/context';
import Kaarsgloed from './Kaarsgloed';

// De kerkelijke kop van Verdieping, De heiligen, Jouw voorkeuren en de cycluspagina's: de nis (kerk-header, of een
// eigen beeld via `achter`) met de sierboog naar het papyrus. Met `titel` staat de titel midden in de nis; met `balk`
// staat bovenin het merk en de zoekknop, en met `terug` ook een pijl terug (bijv. naar Cycli). Opmaak: Vandaag.css.

type Props = { titel?: string; open: boolean; balk?: boolean; terug?: string; achter?: ReactNode; children?: ReactNode };

export default function NisKop({ titel, open, balk, terug, achter, children }: Props) {
  return (
    <div className={`vg-kop${titel ? ' vg-niskop' : ''}`}>
      <div className="vg-kop-achter" aria-hidden="true">
        {achter ?? <img src="/images/vandaag/kerk-header-800.webp" srcSet="/images/vandaag/kerk-header-800.webp 800w, /images/vandaag/kerk-header-1536.webp 1536w" sizes="(min-width: 960px) 960px, 100vw" alt="" width={1536} height={1024} loading={open ? 'eager' : 'lazy'} decoding="async" />}
        <Kaarsgloed />
      </div>
      {balk && <KopBalk terug={terug} />}
      {titel && (
        <>
          <h1 className="vg-titel">{titel}</h1>
          <img className="vg-sierlijn vg-verd-sierlijn" src="/images/vandaag/sierlijn.svg" alt="" aria-hidden="true" width={480} height={40} />
        </>
      )}
      {children}
      <img className="vg-sierboog" src="/images/vandaag/sierboog.svg" alt="" aria-hidden="true" width={1000} height={140} />
    </div>
  );
}

/** Bovenste balk van de kop: (terugpijl), merk en zoekknop. Ook los te gebruiken boven een pagina zonder nis (Feesten). */
export function KopBalk({ terug }: { terug?: string }) {
  const { openZoeken } = useApp();
  return (
    <div className="vg-balk">
      <span className="vg-balk-links">
        {terug && <a className="vg-terug" href={terug} aria-label="Terug"><ChevronLeft aria-hidden="true" /></a>}
        <a href="#vandaag" className="vg-merk">
          <img src="/images/ui/kruis.webp" alt="" width={218} height={256} />
          Orthodoxe Tijd
        </a>
      </span>
      <button type="button" onClick={openZoeken} className="vg-zoek" aria-label="Zoeken"><Search aria-hidden="true" /></button>
    </div>
  );
}
