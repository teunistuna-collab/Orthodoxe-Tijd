import { useSyncExternalStore, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import type { DagInfo } from '../lib/kalender';
import type { HtcLezingRef } from '../lib/htc';
import { lezingSoort, roosterMelding, vertaalRef } from '../lib/htc';
import type { VastenGroep } from '../lib/vasten';
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
  uur: { titel: string; href: string; onder: string; kernvers: string; open: () => void };
  vasten: { groep: VastenGroep | null; open: () => void };
  feest: { label: string; naam: string; meer: number; open: () => void; naamdagen?: string[] };
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

      {/* Overgang van het gebedsgedeelte (pijlgebed, gebedsuur) naar de liturgische informatie over de dag */}
      <div className="vm2-scheiding" role="separator" aria-label="De liturgische dag">
        <Sierlijn />
        <p aria-hidden="true">De liturgische dag</p>
      </div>

      <div className="vm2-duo">
        <Kaart className="vm2-kaart" href="#vasten" onClick={vasten.open}>
          <span className="vm2-icoon" aria-hidden="true">
            {/* Aangeleverde iconen (07-11-2026): wel of geen vasten */}
            <img src={`${ICONEN}/${vasten.groep ? 'wel-vasten' : 'geen-vasten'}.webp`} alt="" width={160} height={160} decoding="async" />
          </span>
          <span className="vm2-tekst">
            <h2 className="vm2-label">Vasten vandaag</h2>
            <b>{dag.vasten.label}</b>
          </span>
          <ChevronRight className="vm2-pijl" aria-hidden="true" />
        </Kaart>
        <Kaart className="vm2-kaart" href="#heiligen" onClick={feest.open}>
          <span className="vm2-icoon" aria-hidden="true">
            <img src={`${ICONEN}/feesten-en-heiligen.webp`} alt="" width={160} height={160} decoding="async" />
          </span>
          <span className="vm2-tekst">
            {/* Eén blok (één rasterelement in de halve kaart), een regel per naamdag */}
            {!!feest.naamdagen?.length && <span className="vm2-naamdag">{feest.naamdagen.map((t) => <span key={t}>{t}</span>)}</span>}
            <h2 className="vm2-label">{feest.label}</h2>
            {/* In de smalle kaart zonder "H." (het label zegt al "heiligen"); anders staat "H." los op een eigen regel */}
            <b>{feest.naam.replace(/^HH?\. /, '')}</b>
            {feest.meer > 0 && <span>en nog {feest.meer} {feest.meer === 1 ? 'heilige' : 'heiligen'}</span>}
          </span>
          <ChevronRight className="vm2-pijl" aria-hidden="true" />
        </Kaart>
      </div>

      <Kaart className="vm2-kaart" href="#kalender" onClick={lezingen.open}>
        <span className="vm2-icoon" aria-hidden="true">
          <img src={`${ICONEN}/schriftlezingen-van-vandaag.webp`} alt="" width={160} height={160} decoding="async" />
        </span>
        <span className="vm2-tekst">
          <h2 className="vm2-label">Schriftlezingen van vandaag</h2>
          {/* Elke lezing op een eigen regel: de verwijzing groot, de soort (Apostel, Evangelie) klein ernaast */}
          {refs.length ? (
            <span className="vm2-lezingen">
              {refs.map((r) => (
                <span key={r} className="vm2-lezing">
                  <b>{r}</b>
                  <small>{SOORT[lezingSoort(r)]}</small>
                </span>
              ))}
            </span>
          ) : (
            <span>{lezingen.geladen ? roosterMelding(dag.ymd) : 'Lezingen worden geladen…'}</span>
          )}
        </span>
        <ChevronRight className="vm2-pijl" aria-hidden="true" />
      </Kaart>

      {/* Het kerkelijk jaar: de periode, de toon en de aftelling naar het eerstvolgende grote feest in één kaart */}
      <Kaart className="vm2-kaart" {...ritme}>
        <span className="vm2-icoon" aria-hidden="true">
          <img src={`${ICONEN}/het-kerkelijk-jaar.webp`} alt="" width={160} height={160} decoding="async" />
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
