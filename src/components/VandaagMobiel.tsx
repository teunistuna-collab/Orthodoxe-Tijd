import { useSyncExternalStore, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import type { DagInfo } from '../lib/kalender';
import type { HtcLezingRef } from '../lib/htc';
import { lezingSoort, roosterMelding, vertaalRef } from '../lib/htc';
import type { VastenGroep } from '../lib/vasten';
import { VastenSymbool } from './ui';
import { SIERKRUIS } from './symbolen';
import type { Aftelling } from '../lib/aftellen';
import { Kop, Laag, Sierlijn } from './MobielLaag';
import './etmaal-mobiel.css';
import './vandaag-mobiel.css';

// Vandaag op mobiel (mock-up vandaag): onder de bestaande kop een reeks perkamentkaarten. Het pijlgebed staat bovenaan
// als het stille middelpunt van de pagina; een tik opent een rustig scherm om het te bidden (#vandaag/pijlgebed), met
// het gebedssnoer en een kleine link om het aan te passen. Alle gegevens en vensters komen uit Vandaag.tsx; dit
// onderdeel tekent alleen.

const ICONEN = '/images/vandaag/iconen';
const SOORT = { apostel: 'Apostel', evangelie: 'Evangelie', oud: 'Oude Testament' } as const;

type Klik = { href?: string; onClick?: () => void };

/** Een kaart die als link of knop werkt; met modifier-toetsen opent een link gewoon in een nieuw tabblad. */
function Kaart({ href, onClick, className, children }: Klik & { className: string; children: ReactNode }) {
  if (href)
    return (
      <a
        className={className}
        href={href}
        onClick={
          onClick
            ? (e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault();
                onClick();
              }
            : undefined
        }
      >
        {children}
      </a>
    );
  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
const usePijlgebedOpen = () => useSyncExternalStore(volgHash, () => window.location.hash === '#vandaag/pijlgebed');

/** Het pijlgebed bidden: een stil, schermvullend venster met alleen het gebed. */
function PijlgebedBidden({ pijlgebed }: { pijlgebed: string }) {
  return (
    <Laag className="em-laag vm2-bidden" label="Het pijlgebed">
      <Kop terug="#vandaag" merk slim />
      <div className="vm2-bidden-vlak">
        <h1 className="vm2-bidden-gebed" tabIndex={-1}>{pijlgebed}</h1>
        <Sierlijn />
        <a className="vm2-bidden-aanpassen" href="#instellingen/pijlgebed">Pas je pijlgebed aan</a>
      </div>
    </Laag>
  );
}

export interface VandaagMobielProps {
  dag: DagInfo;
  pijlgebed: string;
  uur: { titel: string; onder: string; kernvers: string; open: () => void };
  vasten: { groep: VastenGroep | null; open: () => void };
  feest: { label: string; naam: string; meer: number; open: () => void };
  lezingen: { lijst: HtcLezingRef[] | undefined; geladen: boolean; open: () => void };
  ritme: Klik;
  /** De aftelling naar het eerstvolgende grote feest (lib/aftellen.ts) */
  aftelling: Aftelling;
  /** Tijdens de Pascha- en Geboortecyclus: de betekenis van vandaag (BetekenisVanVandaag), zoals op het web */
  betekenis?: ReactNode;
}

export default function VandaagMobiel({ dag, pijlgebed, uur, vasten, feest, lezingen, ritme, aftelling, betekenis }: VandaagMobielProps) {
  const refs = (lezingen.lijst ?? []).slice(0, 2).map((l) => vertaalRef(l.ref));
  const bidden = usePijlgebedOpen();
  const aftelRegel = aftelling.dagen > 0 ? `${aftelling.label}: nog ${aftelling.dagen} ${aftelling.dagen === 1 ? 'dag' : 'dagen'}` : (aftelling.groet?.[0] ?? aftelling.label);
  return (
    <div className="vm2">
      {/* Het pijlgebed: het stille middelpunt; een tik opent het om te bidden */}
      <a className="vm2-pijlgebed" href="#vandaag/pijlgebed">
        <h2 className="vm2-label">Het pijlgebed</h2>
        <b>{pijlgebed}</b>
        <span className="vm2-pijlgebed-onder">Bid het in stilte <ChevronRight aria-hidden="true" /></span>
      </a>

      <Kaart className="vm2-kaart vm2-midden" href="#etmaal" onClick={uur.open}>
        <span className="vm2-tekst">
          <h2 className="vm2-label">Het actuele gebedsuur</h2>
          <b className="vm2-groot">{uur.titel}</b>
          <span>{uur.onder}</span>
          {uur.kernvers && <i className="vm2-kernvers">“{uur.kernvers}”</i>}
        </span>
        <ChevronRight className="vm2-pijl" aria-hidden="true" />
      </Kaart>

      <div className="vm2-duo">
        <Kaart className="vm2-kaart" href="#vasten" onClick={vasten.open}>
          <span className="vm2-icoon" aria-hidden="true">
            {/* Vis alleen als vis is toegestaan; op een dag zonder vasten een rustig sierkruis (alleen de weergave) */}
            {vasten.groep === 'vis' ? (
              <img src={`${ICONEN}/04_vasten_vis.webp`} alt="" width={70} height={32} decoding="async" />
            ) : vasten.groep ? (
              <VastenSymbool groep={vasten.groep} className="vm2-vasten" />
            ) : (
              <span className="vm2-vasten vm2-geenvasten">{SIERKRUIS}</span>
            )}
          </span>
          <span className="vm2-tekst">
            <h2 className="vm2-label">Vasten vandaag</h2>
            <b>{dag.vasten.label}</b>
          </span>
          <ChevronRight className="vm2-pijl" aria-hidden="true" />
        </Kaart>
        <Kaart className="vm2-kaart" href="#heiligen" onClick={feest.open}>
          <span className="vm2-icoon" aria-hidden="true">
            <img src={`${ICONEN}/03_heiligen_kruis.webp`} alt="" width={69} height={77} decoding="async" />
          </span>
          <span className="vm2-tekst">
            <h2 className="vm2-label">{feest.label}</h2>
            <b>{feest.naam}</b>
            {feest.meer > 0 && <span>en nog {feest.meer} {feest.meer === 1 ? 'heilige' : 'heiligen'}</span>}
          </span>
          <ChevronRight className="vm2-pijl" aria-hidden="true" />
        </Kaart>
      </div>

      <Kaart className="vm2-kaart" href="#kalender" onClick={lezingen.open}>
        <span className="vm2-icoon" aria-hidden="true">
          <img src={`${ICONEN}/05_lezingen_boek.webp`} alt="" width={68} height={63} decoding="async" />
        </span>
        <span className="vm2-tekst">
          <h2 className="vm2-label">Schriftlezingen van vandaag</h2>
          {refs.length ? (
            <>
              <b>{refs.join(' · ')}</b>
              <span>{refs.map((r) => SOORT[lezingSoort(r)]).join(' · ')}</span>
            </>
          ) : (
            <span>{lezingen.geladen ? roosterMelding(dag.ymd) : 'Lezingen worden geladen…'}</span>
          )}
        </span>
        <ChevronRight className="vm2-pijl" aria-hidden="true" />
      </Kaart>

      {/* Het kerkelijk jaar: de periode, de toon en de aftelling naar het eerstvolgende grote feest in één kaart */}
      <Kaart className="vm2-kaart" {...ritme}>
        <span className="vm2-icoon" aria-hidden="true">
          <img className="vm2-chirho" src="/images/Chi-Rho-112.webp" alt="" width={87} height={112} decoding="async" />
        </span>
        <span className="vm2-tekst">
          <h2 className="vm2-label">Het kerkelijk jaar</h2>
          <b>{dag.seizoen}</b>
          {dag.toon ? <span>Toon {dag.toon}</span> : null}
          <span className="vm2-aftel">{aftelRegel}</span>
        </span>
        <ChevronRight className="vm2-pijl" aria-hidden="true" />
      </Kaart>

      {betekenis && <div className="vm2-betekenis">{betekenis}</div>}

      {bidden && <PijlgebedBidden pijlgebed={pijlgebed} />}
    </div>
  );
}
