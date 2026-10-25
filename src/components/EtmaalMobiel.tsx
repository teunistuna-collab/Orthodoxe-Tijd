import { useEffect, useState, useSyncExternalStore } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { ETMAAL_INFO, ETMAAL_INLEIDING } from '../lib/cyclusTeksten';
import { dienstVanHetUur, serviceConfig, type ServiceMapping } from '../lib/etmaal';
import { OPEN_DIENST_EVENT } from '../lib/events';
import { gaNaar } from '../lib/navigatie';
import { Kop, Laag, LeesWeergave, PopupTekst, Sierlijn } from './MobielLaag';
import Psalterlezing from './Psalterlezing';
import { SIERKRUIS } from './symbolen';
import './etmaal-mobiel.css';

// Etmaal op mobiel (< 768 px), volgens de goedgekeurde mock-up (09-etmaal), vier weergaven via het adres:
//   #etmaal                    1. overzicht: banner, het actuele gebedsuur, de acht diensten en de verdieping
//   #etmaal/<dienst>           2. de dienst: sfeerbeeld, "Over deze dienst" en "Psalmen uit het Psalter"
//   #etmaal/<dienst>/over      3. over deze dienst (leesweergave)
//   #etmaal/<dienst>/psalmen   4. de psalmen van de dienst, met een link naar het Psalter
//   #etmaal/lees/<onderwerp>   een verdieping (ETMAAL_INFO)
// Inhoud alleen uit de site: lib/etmaal.ts (diensten, tijden, hoofdgedachtenis, kernvers, psalmen) en
// lib/cyclusTeksten.ts (ETMAAL_INFO). Geen gebedsteksten van de diensten. Beelden: de aangeleverde kapellen, het
// klooster en het gebedenboek (public/images/etmaal/mobiel), alleen bijgesneden zodat er geen figuren in beeld staan.

const BEELD = '/images/etmaal/mobiel';
// Weergavenamen zoals in de mock-up; de dienst zelf blijft die uit lib/etmaal.ts.
const NAMEN: Record<string, string> = { Middernachtdienst: 'Middernacht', 'Eerste Uur': 'Eerste uur', 'Derde Uur': 'Derde uur', 'Zesde Uur': 'Zesde uur', 'Negende Uur': 'Negende uur' };
const naamVan = (d: ServiceMapping) => NAMEN[d.title] ?? d.title;
const slugVan = (d: ServiceMapping) => naamVan(d).toLowerCase().replace(/\s+/g, '-');

const DIENSTEN_TABEL = ETMAAL_INFO.diensten.sections?.[0];
const ORIENTATIE = DIENSTEN_TABEL?.paragraphs?.[0]?.split(/(?<=\.)\s+/).pop() ?? '';
const momentVan = (d: ServiceMapping) => DIENSTEN_TABEL?.table?.rows.find((r) => r[0] === d.title)?.[1];

type InfoKey = keyof typeof ETMAAL_INFO;
const VERDIEPING: { key: InfoKey; titel: string }[] = [
  { key: 'wat', titel: 'Wat is het etmaal?' },
  { key: 'diensten', titel: 'De liturgische diensten' },
  { key: 'betekenis', titel: 'De betekenis in ons leven' },
  { key: 'praktisch', titel: 'Praktisch' },
];

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
const useOnderdeel = () => useSyncExternalStore(volgHash, () => decodeURIComponent(window.location.hash).match(/^#etmaal\/(.+)$/)?.[1] ?? '');

function useNuDienst() {
  const [nu, setNu] = useState(() => dienstVanHetUur(new Date()));
  useEffect(() => {
    const t = window.setInterval(() => setNu(dienstVanHetUur(new Date())), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return nu;
}

// 1. Overzicht
function Overzicht({ nu }: { nu: ServiceMapping }) {
  return (
    <section id="etmaal" className="am em">
      <div className="em-banner">
        <img src={`${BEELD}/kapel-lamp.webp`} alt="" width={900} height={572} decoding="async" />
        <div className="em-banner-tekst">
          <p className="am-merk">Orthodoxe Tijd</p>
          <h1 className="em-titel">Etmaal</h1>
          <p className="am-onder">De uren van de dag</p>
          <Sierlijn />
        </div>
      </div>
      <div className="em-papier">
        <a className="em-nu" href={`#etmaal/${slugVan(nu)}`}>
          <span className="em-nu-kruis">{SIERKRUIS}</span>
          <span className="em-nu-tekst">
            <span className="am-label">Het actuele gebedsuur</span>
            <b>{naamVan(nu)}</b>
            <span>{nu.hoofdgedachtenis}</span>
          </span>
          <ChevronRight className="am-pijl" aria-hidden="true" />
        </a>
        <Sierlijn />
        <h2 className="am-label em-kop">De liturgische diensten</h2>
        <ul className="em-lijst">
          {serviceConfig.map((d) => (
            <li key={d.title}>
              <a className={d === nu ? 'is-nu' : undefined} href={`#etmaal/${slugVan(d)}`} aria-current={d === nu ? 'time' : undefined}>
                <span>{naamVan(d)}</span>
                <ChevronRight className="am-pijl" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <Sierlijn />
        <h2 className="am-label em-kop">Verdieping</h2>
        <ul className="em-lijst">
          {VERDIEPING.map(({ key, titel }) => (
            <li key={key}>
              <a href={`#etmaal/lees/${key}`}>
                <span>{titel}</span>
                <ChevronRight className="am-pijl" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// 2. De dienst
function Dienst({ d }: { d: ServiceMapping }) {
  const slug = slugVan(d);
  return (
    <Laag className="em-laag em-dienst" label={naamVan(d)}>
      <Kop terug="#etmaal" merk />
      <div className="em-dienst-beeld">
        <img src={`${BEELD}/kapel-zon.webp`} alt="" width={786} height={1120} decoding="async" />
        <div className="em-dienst-tekst">
          <h1 className="em-titel" tabIndex={-1}>{naamVan(d)}</h1>
          <Sierlijn />
          <p className="em-dienst-onder">{d.hoofdgedachtenis}</p>
        </div>
      </div>
      <div className="em-kaarten">
        <a className="em-kaart" href={`#etmaal/${slug}/over`}>
          <span className="em-kaart-kruis">{SIERKRUIS}</span>
          <span className="em-kaart-tekst">
            <b>Over deze dienst</b>
            <span>Het moment in het etmaal, de hoofdgedachtenis en het kernvers.</span>
          </span>
          <ChevronRight className="am-pijl" aria-hidden="true" />
        </a>
        <a className="em-kaart" href={`#etmaal/${slug}/psalmen`}>
          <span className="em-kaart-kruis">{SIERKRUIS}</span>
          <span className="em-kaart-tekst">
            <b>Psalmen uit het Psalter</b>
            <span>Ga rechtstreeks naar de psalmen die in deze dienst worden gelezen.</span>
          </span>
          <ChevronRight className="am-pijl" aria-hidden="true" />
        </a>
      </div>
      <img className="em-klooster" src={`${BEELD}/klooster.webp`} alt="" width={900} height={507} loading="lazy" decoding="async" />
    </Laag>
  );
}

// 3. Over deze dienst
function Over({ d }: { d: ServiceMapping }) {
  const moment = momentVan(d);
  const kernvers = d.kernvers.reference.replace('Psalm Kernvers:', 'Psalm');
  return (
    <LeesWeergave className="em-laag em-lees" titel={naamVan(d)} ondertitel="Over deze dienst" terug={`#etmaal/${slugVan(d)}`} deelPad={`etmaal/${slugVan(d)}/over`} boven={<span className="em-ornament">{SIERKRUIS}</span>}>
      {moment && (
        <section>
          <h2>Plaats in het etmaal</h2>
          <p>Schematisch moment: {moment}. {ORIENTATIE}</p>
        </section>
      )}
      <section>
        <h2>Hoofdgedachtenis</h2>
        <p>{d.hoofdgedachtenis}</p>
      </section>
      <section>
        <h2>Kernvers</h2>
        <blockquote className="am-lees-citaat em-kernvers">
          {d.kernvers.verses.map((v) => <span key={v}>{v}</span>)}
          <cite>{kernvers}</cite>
        </blockquote>
      </section>
      <section>
        <h2>Psalmen van deze dienst</h2>
        <p>{d.psalms.map((p) => p.title).join(', ')}</p>
      </section>
    </LeesWeergave>
  );
}

// 4. Psalmen uit het Psalter
function Psalmen({ d }: { d: ServiceMapping }) {
  const { vandaagYmd, mode } = useApp();
  const kathisma = d.title === 'Metten' ? 'metten' : d.title === 'Vespers' ? 'vespers' : null;
  return (
    <Laag className="em-laag em-psalmen" label={`${naamVan(d)}: psalmen`}>
      <img className="em-boek" src={`${BEELD}/gebedenboek.webp`} alt="" width={760} height={1448} decoding="async" />
      <Kop terug={`#etmaal/${slugVan(d)}`} merk />
      <div className="em-psalmen-vlak">
        <h1 className="em-titel" tabIndex={-1}>{naamVan(d)}</h1>
        <p className="em-dienst-onder">Psalmen uit het Psalter</p>
        <Sierlijn />
        <ul className="em-psalm-lijst">
          {d.psalms.map((p) => (
            <li key={p.title}>
              <a className="em-psalm" href={`#psalmen/${p.title.replace('Psalm ', '')}`}>
                <span>
                  <b>{p.title}</b>
                  <span>Ga naar het Psalter</span>
                </span>
                <ChevronRight className="am-pijl" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        {kathisma && (
          // De psalterlezing (kathisma's) van vandaag, zoals in het dienstvenster op desktop (lib/psalterlezing.ts)
          <section className="em-kathisma" aria-labelledby="em-kathisma-kop">
            <h2 id="em-kathisma-kop" className="am-label">Kathisma’s bij deze dienst</h2>
            <Psalterlezing datum={vandaagYmd} mode={mode} dienst={kathisma} />
          </section>
        )}
      </div>
    </Laag>
  );
}

export default function EtmaalMobiel() {
  const onderdeel = useOnderdeel();
  const nu = useNuDienst();
  // Vandaag en Bidden openen het gebedsuur van nu: op mobiel de pagina van die dienst.
  useEffect(() => {
    const opDienst = (e: Event) => {
      const d = serviceConfig.find((s) => s.title === (e as CustomEvent<string>).detail);
      if (d) gaNaar(`etmaal/${slugVan(d)}`);
    };
    window.addEventListener(OPEN_DIENST_EVENT, opDienst);
    return () => window.removeEventListener(OPEN_DIENST_EVENT, opDienst);
  }, []);

  const [eerste, tweede] = onderdeel.split('/');
  const dienst = serviceConfig.find((d) => slugVan(d) === eerste);
  const info = eerste === 'lees' && tweede && tweede in ETMAAL_INFO ? (tweede as InfoKey) : null;
  return (
    <>
      <Overzicht nu={nu} />
      {dienst && !tweede && <Dienst d={dienst} />}
      {dienst && tweede === 'over' && <Over d={dienst} />}
      {dienst && tweede === 'psalmen' && <Psalmen d={dienst} />}
      {info && (
        <LeesWeergave className="em-laag em-lees" titel={ETMAAL_INFO[info].title} ondertitel={ETMAAL_INFO[info].subtitle} onder={ETMAAL_INLEIDING[info]} terug="#etmaal" deelPad={`etmaal/lees/${info}`} boven={<span className="em-ornament">{SIERKRUIS}</span>}>
          <PopupTekst inhoud={ETMAAL_INFO[info]} />
        </LeesWeergave>
      )}
    </>
  );
}
