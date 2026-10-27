import { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { bereikLang, daysBetween, formatLang, hoofdletter, kerkDatum, type Mode } from '../lib/kalender';
import { geboorteBannerTitel, geboortecyclusVoor, type GeboorteKey, type GeboorteStap } from '../lib/geboortecyclus';
import { BRON_CONCEPT, GEBOORTE_DAGICONEN, GEBOORTE_GEBRUIKEN, GEBOORTE_UITLEG, GEBOORTE_VERDIEPING, GEBOORTE_WEETJES, GEBOORTE_ZONDAGICOON, KERKVADER_PER_PERIODE, KERKVADERS, type GeboorteInfoKey } from '../lib/geboorteInhoud';
import type { PopupInhoud } from '../lib/cyclusTeksten';
import { Kop, Laag, LeesWeergave, PopupTekst, Sierlijn } from './MobielLaag';
import { AftelKaart, InfoRegels, Rij } from './CyclusMobiel';
import { SIERKRUIS } from './symbolen';
import './etmaal-mobiel.css';
import './geboorte-mobiel.css';

// De Geboortecyclus op mobiel (mock-up geboorte), opbouw zoals Etmaal en Week:
// 1. #geboorte: hero met het geboorte-icoon, de aftelling en "Vandaag in de Geboortecyclus";
// 2. #geboorte/cyclus: de twaalf perioden als lijst (geen ronde iconen; de huidige met een gouden streep);
// 3. #geboorte/<periode>: een periode met banner, informatieregels, betekenis en gerelateerde dagen; de Geboorte van
//    Christus zelf als hoogfeest; 4. #geboorte/<periode>/lees en #geboorte/lees/<onderwerp>: de leesweergave.
// Gegevens uit lib/geboortecyclus.ts en lib/geboorteInhoud.ts (concepten, als zodanig gemarkeerd). Beelden: aangeleverd op
// 26-10-2026 (public/images/geboorte), alleen verkleind.

const BEELD = '/images/geboorte';
const beeld = (naam: string) => ({ src: `${BEELD}/${naam}-800.webp`, srcSet: `${BEELD}/${naam}-800.webp 800w, ${BEELD}/${naam}-1200.webp 1200w` });
const CONCEPT = `Concept: ${BRON_CONCEPT}.`;

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
const useOnderdeel = () => useSyncExternalStore(volgHash, () => decodeURIComponent(window.location.hash).match(/^#geboorte\/(.+)$/)?.[1] ?? '');

/** De periode waarin een periode valt (de kortste andere periode die haar begindag omvat), anders de periode zelf. */
function plaatsIn(stap: GeboorteStap, stappen: GeboorteStap[]): string {
  const omvat = stappen
    .filter((s) => s.key !== stap.key && s.van <= stap.van && stap.van <= s.tot && daysBetween(s.van, s.tot) > daysBetween(stap.van, stap.tot))
    .sort((a, b) => daysBetween(a.van, a.tot) - daysBetween(b.van, b.tot))[0];
  return (omvat ?? stap).label;
}

// Tijdens het feest zelf en het nafeest: het geboorte-icoon in kaarslicht (aangeleverd 26-10-2026) in plaats van de banner.
const KERST = { src: '/images/vandaag/kerst-geboorte-800.webp', srcSet: '/images/vandaag/kerst-geboorte-800.webp 800w, /images/vandaag/kerst-geboorte-1086.webp 1086w' };
// Tijdens Theofanie en het nafeest, en op de schermen van de Theofanie-perioden: het icoon van de Doop van Christus.
const THEOFANIE = { src: '/images/vandaag/theofanie-800.webp', srcSet: '/images/vandaag/theofanie-800.webp 800w, /images/vandaag/theofanie-1536.webp 1536w' };
const isTheofanie = (k: GeboorteKey | null) => k === 'voorfeest-theofanie' || k === 'vooravond-theofanie' || k === 'theofanie' || k === 'nafeest-theofanie';

function Banner({ naam, children, feest, kerst, theofanie }: { naam: string; children: ReactNode; feest?: boolean; kerst?: boolean; theofanie?: boolean }) {
  const b = theofanie ? THEOFANIE : kerst ? KERST : beeld(naam);
  return (
    <div className={`gm-banner${feest && !kerst && !theofanie ? ' is-feest' : ''}${kerst ? ' is-kerst' : ''}${theofanie ? ' is-theofanie' : ''}`}>
      <img src={b.src} srcSet={b.srcSet} sizes="100vw" alt="" width={1672} height={941} decoding="async" />
      <div className="gm-banner-tekst">{children}</div>
    </div>
  );
}

// 1. Hoofdscherm
function Hoofd({ stappen, huidige, dagenTot, groet }: { stappen: GeboorteStap[]; huidige: GeboorteKey | null; dagenTot: number; groet: string | null }) {
  const { vandaag, mode } = useApp();
  const stap = huidige ? stappen.find((s) => s.key === huidige)! : null;
  const eerste = stappen[0];
  return (
    <section id="geboorte" className="am gm">
      <Banner naam="geboorte-icoon" feest kerst={huidige === 'geboorte' || huidige === 'nafeest'} theofanie={huidige === 'theofanie' || huidige === 'nafeest-theofanie'}>
        <Kop terug="#cycli" merk />
        <div className="gm-titels">
          <h1 className="em-titel">Geboorte</h1>
          <p className="am-onder">Het Licht komt in de wereld</p>
          <Sierlijn />
        </div>
      </Banner>
      <div className="gm-papier">
        <p className="gm-inleiding">De Geboorte van Christus opent de weg naar de Menswording en laat ons Gods liefde voor de wereld zien.</p>

        {/* De aftelling: het gedeelde onderdeel (CyclusMobiel.tsx), ook op Pascha en Vandaag */}
        <AftelKaart
          label={dagenTot > 0 ? 'Op weg naar de Geboorte' : 'De Geboorte van Christus'}
          dagen={dagenTot}
          onder="Tot de heilige Geboorte van Christus"
          voet="Een tijd van verwachting, vasten en gebed."
          groet={[groet ?? 'Christus wordt geboren, verheerlijkt Hem!']}
          href={dagenTot > 0 ? '#geboorte/cyclus' : '#geboorte/geboorte'}
        />

        <div className="gm-kaart gm-vandaag">
          <h2 className="gm-kaart-titel">Vandaag in de Geboortecyclus</h2>
          <p className="gm-datumregel">{hoofdletter(formatLang(vandaag))}</p>
          {stap ? (
            <>
              <p className="gm-periode">{stap.label}</p>
              <p className="gm-bereik">{bereikLang(stap.van, stap.tot)}</p>
              <p className="gm-tekst">{stap.short}</p>
              <InfoRegels datum={vandaag} mode={mode} plaats={plaatsIn(stap, stappen)} />
              <a className="gm-knop" href={`#geboorte/${stap.key}`}>Lees meer over deze dag <ChevronRight aria-hidden="true" /></a>
            </>
          ) : (
            <>
              <p className="gm-periode">{eerste.label}</p>
              <p className="gm-bereik">Begint op {bereikLang(eerste.van, eerste.van)} {eerste.van.getUTCFullYear()}</p>
              <p className="gm-tekst">{eerste.short}</p>
              <a className="gm-knop" href={`#geboorte/${eerste.key}`}>Lees meer over deze periode <ChevronRight aria-hidden="true" /></a>
            </>
          )}
        </div>

        <a className="gm-kaart gm-cycluslink" href="#geboorte/cyclus">
          <span className="gm-rij-tekst">
            <b>De Geboortecyclus</b>
            <span>Van verwachting tot openbaring</span>
          </span>
          <ChevronRight className="am-pijl" aria-hidden="true" />
        </a>

        <h2 className="am-label gm-kop">Verdieping</h2>
        <ul className="gm-lijst">
          {GEBOORTE_VERDIEPING.map((v) => <Rij key={v.key} href={`#geboorte/lees/${v.key}`} titel={v.title} onder={v.intro} />)}
        </ul>
      </div>
      <img className="gm-slot" src={beeld('kerstkaarsen').src} srcSet={beeld('kerstkaarsen').srcSet} sizes="100vw" alt="" width={1672} height={941} loading="lazy" decoding="async" />
    </section>
  );
}

// 2. Overzicht van de cyclus
function Overzicht({ stappen, huidige }: { stappen: GeboorteStap[]; huidige: GeboorteKey | null }) {
  return (
    <Laag className="em-laag gm-laag gm-overzicht" label="De Geboortecyclus">
      <Kop terug="#geboorte" licht />
      <div className="gm-laag-papier">
        <h1 className="gm-laag-titel" tabIndex={-1}>De Geboortecyclus</h1>
        <p className="gm-laag-onder">Van verwachting tot openbaring</p>
        <Sierlijn />
        <ul className="gm-lijst gm-dagen">
          {stappen.map((s) => <Rij key={s.key} href={`#geboorte/${s.key}`} titel={s.label} onder={bereikLang(s.van, s.tot)} nu={s.key === huidige} />)}
        </ul>
        <div className="gm-kaart gm-over">
          <h2 className="gm-kaart-titel">Over de Geboortecyclus</h2>
          <p className="gm-tekst">Ontdek de betekenis, tradities en de rijkdom van deze heilige tijd in de Orthodoxe Kerk.</p>
          <a className="gm-knop gm-knop-donker" href="#geboorte/lees/menswording">Lees meer <ChevronRight aria-hidden="true" /></a>
        </div>
      </div>
    </Laag>
  );
}

// 3. Een periode (de Geboorte van Christus als hoogfeest)
function Periode({ stap, stappen }: { stap: GeboorteStap; stappen: GeboorteStap[] }) {
  const { mode } = useApp();
  const feest = stap.key === 'geboorte';
  const i = stappen.findIndex((s) => s.key === stap.key);
  const verwant = [stappen[i - 1], stappen[i + 1]].filter((s): s is GeboorteStap => !!s);
  return (
    <Laag className={`em-laag gm-laag gm-periodelaag${feest ? ' is-feest' : ''}`} label={stap.label}>
      <Kop terug="#geboorte/cyclus" merk />
      <Banner naam={feest ? 'geboorte-icoon' : 'kaarsen'} feest={feest} theofanie={isTheofanie(stap.key)}>
        <span />
      </Banner>
      <div className="gm-laag-papier">
        <span className="gm-ornament" aria-hidden="true">{SIERKRUIS}</span>
        <h1 className="gm-laag-titel" tabIndex={-1}>{stap.label}</h1>
        <p className="gm-laag-onder">{bereikLang(stap.van, stap.tot)}</p>
        <Sierlijn />
        {feest && <p className="gm-feestgroet">Christus wordt geboren!<br />Verheerlijk Hem!</p>}
        <p className="gm-tekst gm-midden">{stap.short}</p>
        <InfoRegels datum={stap.van} mode={mode} plaats={plaatsIn(stap, stappen)} />
        <Sierlijn />
        <h2 className="gm-sectie">Betekenis</h2>
        <p className="gm-tekst">{GEBOORTE_UITLEG[stap.key]}</p>
        <p className="gm-concept">{CONCEPT}</p>
        {feest ? (
          <a className="gm-feestkaart" href={`#geboorte/${stap.key}/lees`}>
            <img src={beeld('kerstkaarsen').src} srcSet={beeld('kerstkaarsen').srcSet} sizes="100vw" alt="" width={1672} height={941} loading="lazy" decoding="async" />
            <span>Lees meer over de Geboorte <ChevronRight aria-hidden="true" /></span>
          </a>
        ) : (
          <>
            <img className="gm-sfeer" src={beeld('klooster-sneeuw').src} srcSet={beeld('klooster-sneeuw').srcSet} sizes="100vw" alt="" width={1672} height={941} loading="lazy" decoding="async" />
            <a className="gm-knop gm-knop-breed" href={`#geboorte/${stap.key}/lees`}>Lees meer over deze dag <ChevronRight aria-hidden="true" /></a>
          </>
        )}
        <h2 className="gm-sectie">Gerelateerde dagen</h2>
        <ul className="gm-lijst gm-dagen">
          {verwant.map((s) => <Rij key={s.key} href={`#geboorte/${s.key}`} titel={s.label} onder={bereikLang(s.van, s.tot)} />)}
        </ul>
      </div>
    </Laag>
  );
}

/** Leesweergave van een periode: uitleg, icoon (indien aangeleverd), weetje, woord van de kerkvaders en gebruiken. */
function periodeInhoud(stap: GeboorteStap, mode: Mode): PopupInhoud {
  const kerk = kerkDatum(stap.van, mode);
  const md = `${kerk.getUTCMonth() + 1}-${kerk.getUTCDate()}`;
  const icoon = stap.key === 'geboorte' ? { bestand: '', naam: 'Icoon van de Geboorte van Christus' } : stap.key === 'voorouders' || stap.key === 'vaders' ? GEBOORTE_ZONDAGICOON : GEBOORTE_DAGICONEN[md];
  const vader = KERKVADERS[KERKVADER_PER_PERIODE[stap.key]];
  const gebruik = GEBOORTE_GEBRUIKEN[stap.key];
  return {
    title: stap.label,
    image: icoon ? { src: icoon.bestand ? `/images/feesten/${icoon.bestand}` : '/images/feesten/kerst.jpg', alt: icoon.naam } : undefined,
    paragraphs: [GEBOORTE_UITLEG[stap.key]],
    sections: [
      { heading: 'Weetje', paragraphs: [GEBOORTE_WEETJES[stap.key]] },
      { heading: 'Woord van de kerkvaders', paragraphs: [`„${vader.tekst}”`, `Bron: ${vader.bron}.`] },
      ...(gebruik ? [{ heading: gebruik.soort, paragraphs: [gebruik.tekst] }] : []),
      { note: CONCEPT },
    ],
  };
}

export default function GeboorteMobiel({ info }: { info: Record<GeboorteInfoKey, PopupInhoud> }) {
  const { vandaag, mode } = useApp();
  const onderdeel = useOnderdeel();
  const cyclus = useMemo(() => geboortecyclusVoor(vandaag, mode), [vandaag, mode]);
  const [eerste, tweede] = onderdeel.split('/');
  const stap = cyclus.stappen.find((s) => s.key === eerste);
  const onderwerp = eerste === 'lees' && tweede && tweede in info ? (tweede as GeboorteInfoKey) : null;
  return (
    <>
      <Hoofd stappen={cyclus.stappen} huidige={cyclus.huidige} dagenTot={cyclus.dagenTotGeboorte} groet={cyclus.huidige ? geboorteBannerTitel(vandaag, mode) : null} />
      {eerste === 'cyclus' && <Overzicht stappen={cyclus.stappen} huidige={cyclus.huidige} />}
      {stap && !tweede && <Periode stap={stap} stappen={cyclus.stappen} />}
      {stap && tweede === 'lees' && (
        <LeesWeergave className="em-laag em-lees" titel={stap.label} ondertitel={bereikLang(stap.van, stap.tot)} terug={`#geboorte/${stap.key}`} deelPad={`geboorte/${stap.key}`} boven={<>{periodeInhoud(stap, mode).image && <img className="gm-lees-icoon" src={periodeInhoud(stap, mode).image!.src} alt={periodeInhoud(stap, mode).image!.alt} loading="lazy" decoding="async" />}<span className="em-ornament">{SIERKRUIS}</span></>}>
          <PopupTekst inhoud={periodeInhoud(stap, mode)} />
        </LeesWeergave>
      )}
      {onderwerp && (
        <LeesWeergave className="em-laag em-lees" titel={info[onderwerp].title} ondertitel={GEBOORTE_VERDIEPING.find((v) => v.key === onderwerp)?.intro} terug="#geboorte" deelPad={`geboorte/lees/${onderwerp}`} boven={<span className="em-ornament">{SIERKRUIS}</span>}>
          <PopupTekst inhoud={info[onderwerp]} />
        </LeesWeergave>
      )}
    </>
  );
}
