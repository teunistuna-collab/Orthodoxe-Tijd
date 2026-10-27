import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import type { DagInfo } from '../lib/kalender';
import type { HtcLezingRef } from '../lib/htc';
import { lezingSoort, roosterMelding, vertaalRef } from '../lib/htc';
import type { VastenGroep } from '../lib/vasten';
import { VastenSymbool } from './ui';
import { SIERKRUIS } from './symbolen';
import { AftelKaart } from './CyclusMobiel';
import type { Aftelling } from '../lib/aftellen';
import './etmaal-mobiel.css';
import './vandaag-mobiel.css';

// Vandaag op mobiel (mock-up vandaag): onder de bestaande kop een reeks perkamentkaarten op diep bruin. Het pijlgebed
// staat zoals het actuele gebedsuur op Etmaal (kruis links, label, de tekst groot, pijl rechts). Alle gegevens en
// vensters komen uit Vandaag.tsx; dit onderdeel tekent alleen.

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

export interface VandaagMobielProps {
  dag: DagInfo;
  pijlgebed: string;
  uur: { titel: string; onder: string; open: () => void };
  vasten: { groep: VastenGroep | null; open: () => void };
  feest: { label: string; naam: string; open: () => void };
  lezingen: { lijst: HtcLezingRef[] | undefined; geladen: boolean; open: () => void };
  ritme: Klik;
  /** De aftelling naar het eerstvolgende grote feest (lib/aftellen.ts), met dezelfde kaart als Pascha en Geboorte */
  aftelling: Aftelling;
}

export default function VandaagMobiel({ dag, pijlgebed, uur, vasten, feest, lezingen, ritme, aftelling }: VandaagMobielProps) {
  const refs = (lezingen.lijst ?? []).slice(0, 2).map((l) => vertaalRef(l.ref));
  return (
    <div className="vm2">
      {/* Het pijlgebed, zoals het actuele gebedsuur op Etmaal; de kaart opent Instellingen om het aan te passen */}
      <a className="em-nu vm2-pijlgebed" href="#instellingen">
        <span className="em-nu-kruis">{SIERKRUIS}</span>
        <span className="em-nu-tekst">
          <span className="am-label">Het pijlgebed</span>
          <b>{pijlgebed}</b>
          <span>Tik om het pijlgebed aan te passen</span>
        </span>
        <ChevronRight className="am-pijl" aria-hidden="true" />
      </a>

      <Kaart className="vm2-kaart vm2-midden" href="#etmaal" onClick={uur.open}>
        <span className="vm2-tekst">
          <span className="vm2-label">Het actuele gebedsuur</span>
          <b className="vm2-groot">{uur.titel}</b>
          <span>{uur.onder}</span>
        </span>
        <ChevronRight className="vm2-pijl" aria-hidden="true" />
      </Kaart>

      <div className="vm2-duo">
        <Kaart className="vm2-kaart" href="#vasten" onClick={vasten.open}>
          <span className="vm2-icoon" aria-hidden="true">
            {vasten.groep && vasten.groep !== 'vis' ? <VastenSymbool groep={vasten.groep} className="vm2-vasten" /> : <img src={`${ICONEN}/04_vasten_vis.webp`} alt="" width={70} height={32} decoding="async" />}
          </span>
          <span className="vm2-tekst">
            <span className="vm2-label">Vasten vandaag</span>
            <b>{dag.vasten.label}</b>
          </span>
          <ChevronRight className="vm2-pijl" aria-hidden="true" />
        </Kaart>
        <Kaart className="vm2-kaart" href="#heiligen" onClick={feest.open}>
          <span className="vm2-icoon" aria-hidden="true">
            <img src={`${ICONEN}/03_heiligen_kruis.webp`} alt="" width={69} height={77} decoding="async" />
          </span>
          <span className="vm2-tekst">
            <span className="vm2-label">{feest.label}</span>
            <b>{feest.naam}</b>
          </span>
          <ChevronRight className="vm2-pijl" aria-hidden="true" />
        </Kaart>
      </div>

      <Kaart className="vm2-kaart" href="#kalender" onClick={lezingen.open}>
        <span className="vm2-icoon" aria-hidden="true">
          <img src={`${ICONEN}/05_lezingen_boek.webp`} alt="" width={68} height={63} decoding="async" />
        </span>
        <span className="vm2-tekst">
          <span className="vm2-label">Schriftlezingen van vandaag</span>
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

      <Kaart className="vm2-kaart" {...ritme}>
        <span className="vm2-icoon" aria-hidden="true">
          <img className="vm2-chirho" src="/images/Chi-Rho.webp" alt="" width={496} height={640} decoding="async" />
        </span>
        <span className="vm2-tekst">
          <span className="vm2-label">Het kerkelijk ritme</span>
          <b>{dag.seizoen}</b>
          <span>{dag.toon ? `Toon ${dag.toon} · ` : ''}Ontdek de betekenis van deze periode</span>
        </span>
        <ChevronRight className="vm2-pijl" aria-hidden="true" />
      </Kaart>

      <AftelKaart label={aftelling.label} dagen={aftelling.dagen} onder={aftelling.onder} voet={aftelling.voet} groet={aftelling.groet} href={aftelling.href} />
    </div>
  );
}
