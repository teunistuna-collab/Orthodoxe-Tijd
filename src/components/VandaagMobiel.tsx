import { useSyncExternalStore, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import type { DagInfo } from '../lib/kalender';
import type { HtcLezingRef } from '../lib/htc';
import { roosterMelding, vertaalRef } from '../lib/htc';
import type { VastenGroep } from '../lib/vasten';
import type { Aftelling } from '../lib/aftellen';
import type { CyclusKaart } from '../lib/feestdagen';
import { Kop, Laag, Sierlijn } from './MobielLaag';
import './etmaal-mobiel.css';
import './vandaag-mobiel.css';

// Vandaag op mobiel (mock-up vandaag): onder de bestaande kop een reeks perkamentkaarten. Het pijlgebed staat bovenaan
// als het stille middelpunt van de pagina; een tik opent een rustig scherm om het te bidden (#vandaag/pijlgebed), met
// het gebedssnoer en een kleine link om het aan te passen. Alle gegevens en vensters komen uit Vandaag.tsx; dit
// onderdeel tekent alleen.

const ICONEN = '/images/vandaag/iconen';

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
  uur: { titel: string; href: string; onder: string; kernvers: string; open: () => void };
  vasten: { groep: VastenGroep | null; open: () => void };
  feest: { label: string; naam: string; meer: number; open: () => void; naamdagen?: string[] };
  lezingen: { lijst: HtcLezingRef[] | undefined; geladen: boolean; open: () => void };
  ritme: Klik;
  /** De aftelling naar het eerstvolgende grote feest (lib/aftellen.ts) */
  aftelling: Aftelling;
  /** "Vandaag in de cyclus" (lib/feestdagen.ts dagThema); buiten de cycli null */
  cyclus?: CyclusKaart | null;
  /** Tijdens de Pascha- en Geboortecyclus: de betekenis van vandaag (BetekenisVanVandaag), zoals op het web */
  betekenis?: ReactNode;
}

export default function VandaagMobiel({ dag, pijlgebed, uur, vasten, feest, lezingen, ritme, aftelling, betekenis, cyclus }: VandaagMobielProps) {
  const refs = (lezingen.lijst ?? []).slice(0, 2).map((l) => vertaalRef(l.ref));
  const bidden = usePijlgebedOpen();
  const aftelRegel = aftelling.dagen > 0 ? `Nog ${aftelling.dagen} ${aftelling.dagen === 1 ? 'dag' : 'dagen'} tot ${aftelling.cyclus === 'pascha' ? 'Pascha' : 'de Geboorte'}` : (aftelling.groet?.[0] ?? aftelling.label);
  return (
    <div className="vm2">
      {/* Het pijlgebed: het stille middelpunt; een tik opent het om te bidden */}
      {/* Kaartvorm (.m-kader): "Pijlgebed" als klein label bovenaan, het gebed als titel en een sierlijn */}
      <a className="vm2-pijlgebed m-kader" href="#vandaag/pijlgebed">
        <h2 className="vm2-label vm2-kader-label">Pijlgebed</h2>
        <b className="m-kader-titel">{pijlgebed}</b>
        <Sierlijn />
      </a>

      <Kaart className="vm2-kaart vm2-uur" href={uur.href} onClick={uur.open}>
        <span className="vm2-tekst">
          <h2 className="vm2-label">Het actuele gebedsuur</h2>
          <b className="vm2-groot">{uur.titel}</b>
          <span>{uur.onder}</span>
          {uur.kernvers && <i className="vm2-kernvers">“{uur.kernvers}”</i>}
        </span>
        <ChevronRight className="vm2-pijl" aria-hidden="true" />
      </Kaart>

      {/* Vandaag in de cyclus: de periode en de dag, de korte betekenis en zo nodig de voortgang; vervangt de aftelling */}
      {cyclus && (
        <Kaart className="vm2-kaart vm2-cyclus" href={cyclus.href}>
          <span className="vm2-tekst">
            <h2 className="vm2-label">{cyclus.soort === 'pascha' ? 'Paschacyclus' : 'Geboortecyclus'}</h2>
            <b className="vm2-groot">{cyclus.periode}{cyclus.dag ? ` · ${cyclus.dag}` : ''}</b>
            <span>{cyclus.betekenis}</span>
            {cyclus.voortgang && <span className="vm2-cyclus-voortgang">{cyclus.voortgang}</span>}
          </span>
          <ChevronRight className="vm2-pijl" aria-hidden="true" />
        </Kaart>
      )}

      {/* Overgang van het gebedsgedeelte (pijlgebed, gebedsuur) naar de liturgische informatie over de dag */}
      <div className="vm2-scheiding" role="separator" aria-label="De liturgische dag">
        <Sierlijn />
        <p aria-hidden="true">De liturgische dag</p>
      </div>

      {/* De liturgische dag als rustige lijst (mock-up 13-11-2026): per regel het icoon, een klein label, de hoofdregel en zo
          nodig een onderregel, met een pijl; dunne lijnen ertussen in plaats van losse kaarten */}
      <ul className="vm2-rijen">
        <li>
          <Kaart className="vm2-rij" href="#vasten" onClick={vasten.open}>
            <span className="vm2-icoon" aria-hidden="true">
              {/* Aangeleverde iconen (07-11-2026): wel of geen vasten */}
              <img src={`${ICONEN}/${vasten.groep ? 'wel-vasten' : 'geen-vasten'}.webp`} alt="" width={160} height={160} decoding="async" />
            </span>
            <span className="vm2-tekst">
              <h2 className="vm2-label">Vasten vandaag</h2>
              <b>{dag.vasten.label.replace(' — ', ' · ')}</b>
            </span>
            <ChevronRight className="vm2-pijl" aria-hidden="true" />
          </Kaart>
        </li>
        <li>
          <Kaart className="vm2-rij" href="#heiligen" onClick={feest.open}>
            <span className="vm2-icoon" aria-hidden="true">
              <img src={`${ICONEN}/feesten-en-heiligen.webp`} alt="" width={160} height={160} decoding="async" />
            </span>
            <span className="vm2-tekst">
              <h2 className="vm2-label">{feest.label}</h2>
              {/* Zonder "H." (het label zegt al "heiligen") en hooguit drie namen; alle namen staan bij de heiligen van de dag */}
              <b>{feest.naam.replace(/^HH?\. /, '').split(', ').slice(0, 3).join(', ')}</b>
              {feest.meer > 0 && <span>en nog {feest.meer} {feest.meer === 1 ? 'heilige' : 'heiligen'}</span>}
              {feest.naamdagen?.map((t) => <span key={t} className="vm2-naamdag">{t}</span>)}
            </span>
            <ChevronRight className="vm2-pijl" aria-hidden="true" />
          </Kaart>
        </li>
        <li>
          <Kaart className="vm2-rij" href="#kalender" onClick={lezingen.open}>
            <span className="vm2-icoon" aria-hidden="true">
              <img src={`${ICONEN}/schriftlezingen-van-vandaag.webp`} alt="" width={160} height={160} decoding="async" />
            </span>
            <span className="vm2-tekst">
              <h2 className="vm2-label">Schriftlezingen van vandaag</h2>
              {refs.length ? refs.map((r) => <b key={r}>{r.replace(/(\d)-(\d)/g, '$1–$2')}</b>) : <span>{lezingen.geladen ? roosterMelding(dag.ymd) : 'Lezingen worden geladen…'}</span>}
            </span>
            <ChevronRight className="vm2-pijl" aria-hidden="true" />
          </Kaart>
        </li>
        <li>
          {/* Het kerkelijk jaar: de periode, met de toon en de aftelling op één regel */}
          <Kaart className="vm2-rij" {...ritme}>
            <span className="vm2-icoon" aria-hidden="true">
              <img src={`${ICONEN}/het-kerkelijk-jaar.webp`} alt="" width={160} height={160} decoding="async" />
            </span>
            <span className="vm2-tekst">
              <h2 className="vm2-label">Het kerkelijk jaar</h2>
              <b>{dag.seizoen}</b>
              {(dag.toon || !cyclus) && <span>{[dag.toon ? `Toon ${dag.toon}` : '', cyclus ? '' : aftelRegel].filter(Boolean).join(' · ')}</span>}
            </span>
            <ChevronRight className="vm2-pijl" aria-hidden="true" />
          </Kaart>
        </li>
      </ul>

      {betekenis && <div className="vm2-betekenis">{betekenis}</div>}

      {bidden && <PijlgebedBidden pijlgebed={pijlgebed} />}
    </div>
  );
}
