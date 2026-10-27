import { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { formatDag, formatKort, formatLang, hoofdletter } from '../lib/kalender';
import { paascyclusVoor, type Paascyclus, type StapKey } from '../lib/paascyclus';
import { PAASCYCLUS } from '../lib/feesten';
import { PASCHA_DAGICONEN, PERIODE_POPUPS, STAP_INHOUD } from '../lib/paascyclusTeksten';
import { PASCHA_INFO } from '../lib/cyclusTeksten';
import { Kop, Laag, LeesWeergave, PopupTekst, Sierlijn } from './MobielLaag';
import { AftelKaart, InfoRegels, Rij } from './CyclusMobiel';
import { SIERKRUIS } from './symbolen';
import './etmaal-mobiel.css';
import './geboorte-mobiel.css';
import './pascha-mobiel.css';

// De Paschacyclus op mobiel (mock-up 12_pascha), dezelfde opbouw als de Geboortecyclus (GeboorteMobiel.tsx):
// 1. #pascha: banner met het icoon van de Verrijzenis, de aftelling (gedeeld met Geboorte en Vandaag) en "Vandaag in de
//    Paschacyclus"; 2. #pascha/cyclus: de tien perioden met hun datum; 3. #pascha/<periode>: banner, plaats, betekenis,
//    liturgische informatie en "Over deze periode"; Pascha zelf als hoogfeest; 4. #pascha/lees/<onderwerp>: verdieping.
// Alles uit bestaande gegevens: lib/paascyclus.ts (perioden en datums), lib/paascyclusTeksten.ts (uitleg en iconen),
// lib/cyclusTeksten.ts (PASCHA_INFO) en lib/feesten.ts (toelichting en troparion van Pascha). De sfeer van de pagina volgt
// de periode (pascha-mobiel.css): sober in de Grote Vasten, verstild in de Goede Week, licht rond Pascha.

type Stap = Paascyclus['stappen'][number];
type InfoKey = keyof typeof PASCHA_INFO;

const PASCHA_FEEST = PAASCYCLUS.find((f) => f.id === 'pascha');
const GROET = ['Christus is opgestaan!', 'Hij is waarlijk opgestaan!'];
const VERDIEPING: Array<{ key: InfoKey; titel: string }> = [
  { key: 'wat', titel: 'Wat is Pascha?' },
  { key: 'cyclus', titel: 'De Paschacyclus' },
  { key: 'betekenis', titel: 'De betekenis in ons leven' },
  { key: 'tradities', titel: 'Tradities en viering' },
];
const INLEIDING = 'Van de voorbereidende vasten tot Pinksteren: één beweging van dood naar nieuw leven.';

// Banners: het aangeleverde icoon van de Verrijzenis rond Pascha, het eigen icoon van de dag waar dat er is
// (public/images/feesten, lib/paascyclusTeksten.ts) en anders een kapel zonder figuren.
const VERRIJZENIS = { src: '/images/vandaag/pascha-verrijzenis-800.webp', srcSet: '/images/vandaag/pascha-verrijzenis-800.webp 800w, /images/vandaag/pascha-verrijzenis-1600.webp 1600w', icoon: false };
const KAPEL = { src: '/images/etmaal/mobiel/kapel-lamp.webp', srcSet: undefined, icoon: false };
const ZON = { src: '/images/etmaal/mobiel/kapel-zon.webp', srcSet: undefined, icoon: false };
function bannerVoor(k: StapKey, van: number) {
  if (k === 'pascha' || k === 'lichte-week' || k === 'paastijd') return VERRIJZENIS;
  const icoon = PASCHA_DAGICONEN[van];
  if (icoon && !icoon.periode) return { src: `/images/feesten/${icoon.bestand}`, srcSet: undefined, icoon: true };
  return k === 'hemelvaart' || k === 'pinksteren' ? ZON : KAPEL;
}

/** De sfeer van een periode: sober, verstild of feestelijk (alleen kleur en licht, zie pascha-mobiel.css). */
const SFEER: Record<StapKey, string> = {
  voorbereiding: 'is-voorbereiding', 'grote-vasten': 'is-vasten', lazarus: 'is-vasten', palmzondag: 'is-vasten', 'goede-week': 'is-goede-week',
  pascha: 'is-pascha', 'lichte-week': 'is-pascha', paastijd: 'is-paastijd', hemelvaart: 'is-paastijd', pinksteren: 'is-pinksteren',
};

const bereik = (s: Stap) => (s.van.getTime() === s.tot.getTime() ? formatKort(s.van) : `${formatKort(s.van)} – ${formatKort(s.tot)}`);
const eersteAlinea = (k: StapKey) => STAP_INHOUD[k].sections?.[0]?.paragraphs?.[0] ?? STAP_INHOUD[k].paragraphs[0] ?? '';

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
const useOnderdeel = () => useSyncExternalStore(volgHash, () => decodeURIComponent(window.location.hash).match(/^#pascha\/(.+)$/)?.[1] ?? '');

function Banner({ beeld, children, className = '' }: { beeld: ReturnType<typeof bannerVoor>; children?: ReactNode; className?: string }) {
  return (
    <div className={`gm-banner pm2-banner${beeld.icoon ? ' is-icoon' : ''} ${className}`}>
      <img src={beeld.src} srcSet={beeld.srcSet} sizes="100vw" alt="" decoding="async" />
      <div className="gm-banner-tekst">{children}</div>
    </div>
  );
}

// 1. Hoofdscherm
function Hoofd({ cyclus }: { cyclus: Paascyclus }) {
  const { vandaag, mode } = useApp();
  const stap = cyclus.huidige ? cyclus.stappen.find((s) => s.key === cyclus.huidige)! : null;
  const eerste = cyclus.stappen[0];
  const sfeer = stap ? SFEER[stap.key] : '';
  // Na Pascha (t/m Pinksteren) is er niets meer af te tellen: de feestgroet, met de naam van de periode als label.
  const label = cyclus.dagenTotPascha > 0 ? 'Op weg naar Pascha' : cyclus.offset === 0 ? 'Vandaag is het heilige Pascha' : (stap?.label ?? 'Pascha');
  return (
    <section id="pascha" className={`am gm pm2 ${sfeer}`}>
      <Banner beeld={VERRIJZENIS} className="is-hoofd">
        <Kop terug="#cycli" merk />
        <div className="gm-titels">
          <h1 className="em-titel">Pascha</h1>
          <p className="am-onder">Van het Kruis naar de Verrijzenis</p>
          <Sierlijn />
        </div>
      </Banner>
      <div className="gm-papier">
        <AftelKaart
          label={label}
          dagen={cyclus.dagenTotPascha}
          onder="Tot de heilige Verrijzenis van Christus"
          voet="Een weg van vasten, gebed en verwachting."
          groet={GROET}
          href={cyclus.offset === 0 ? '#pascha/pascha' : '#pascha/cyclus'}
        />

        <div className="gm-kaart gm-vandaag">
          <p className="am-label pm2-label">Vandaag in de Paschacyclus</p>
          <p className="gm-datumregel">{hoofdletter(formatLang(vandaag))}</p>
          {stap ? (
            <>
              <p className="gm-periode">{stap.label}</p>
              <p className="gm-bereik">{bereik(stap)}</p>
              <p className="gm-tekst">{stap.short}</p>
              <InfoRegels datum={vandaag} mode={mode} />
              <a className="gm-knop" href={`#pascha/${stap.key}`}>Lees meer over deze periode <ChevronRight aria-hidden="true" /></a>
            </>
          ) : (
            <>
              <p className="gm-periode">{eerste.label}</p>
              <p className="gm-bereik">Begint op {formatDag(eerste.van)} {eerste.van.getUTCFullYear()}</p>
              <p className="gm-tekst">{eerste.short}</p>
              <InfoRegels datum={vandaag} mode={mode} />
              <a className="gm-knop" href={`#pascha/${eerste.key}`}>Lees meer over deze periode <ChevronRight aria-hidden="true" /></a>
            </>
          )}
        </div>

        <a className="gm-kaart gm-cycluslink" href="#pascha/cyclus">
          <span className="gm-rij-tekst">
            <b>De Paschacyclus</b>
            <span>Van het Kruis naar de Verrijzenis</span>
          </span>
          <ChevronRight className="am-pijl" aria-hidden="true" />
        </a>

        <h2 className="am-label gm-kop">De Paschacyclus</h2>
        <ul className="gm-lijst">
          {cyclus.stappen.map((s) => <Rij key={s.key} href={`#pascha/${s.key}`} titel={s.label} onder={bereik(s)} nu={s.key === cyclus.huidige} />)}
        </ul>

        <h2 className="am-label gm-kop">Meer over Pascha</h2>
        <ul className="gm-lijst">
          {VERDIEPING.map((v) => <Rij key={v.key} href={`#pascha/lees/${v.key}`} titel={v.titel} onder={PASCHA_INFO[v.key].subtitle ?? ''} />)}
        </ul>
      </div>
    </section>
  );
}

// 2. De Paschacyclus
function Overzicht({ cyclus }: { cyclus: Paascyclus }) {
  return (
    <Laag className="em-laag gm-laag gm-overzicht pm2-laag" label="De Paschacyclus">
      <Kop terug="#pascha" licht />
      <div className="gm-laag-papier">
        <h1 className="gm-laag-titel" tabIndex={-1}>De Paschacyclus</h1>
        <p className="gm-laag-onder">Van het Kruis naar de Verrijzenis</p>
        <Sierlijn />
        <p className="gm-tekst gm-midden">{INLEIDING}</p>
        <ul className="gm-lijst gm-dagen">
          {cyclus.stappen.map((s) => <Rij key={s.key} href={`#pascha/${s.key}`} datum={bereik(s)} titel={s.label} onder={s.short} nu={s.key === cyclus.huidige} />)}
        </ul>
        <h2 className="am-label gm-kop">Meer over Pascha</h2>
        <ul className="pm2-meer">
          {VERDIEPING.map((v) => (
            <li key={v.key}>
              <a href={`#pascha/lees/${v.key}`}>
                <span className="em-kaart-kruis">{SIERKRUIS}</span>
                <span>{v.titel}</span>
                <ChevronRight className="am-pijl" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Laag>
  );
}

// 3. Een periode; Pascha zelf als hoogfeest
function Periode({ stap, cyclus }: { stap: Stap; cyclus: Paascyclus }) {
  const { mode, vandaag } = useApp();
  const i = cyclus.stappen.findIndex((s) => s.key === stap.key);
  const verwant = [cyclus.stappen[i - 1], cyclus.stappen[i + 1]].filter((s): s is Stap => !!s);
  const feest = stap.key === 'pascha';
  const icoon = PASCHA_DAGICONEN[stap.offsetRange[0]];
  const inhoud = STAP_INHOUD[stap.key];
  const verder = (inhoud.sections ?? []).flatMap((s) => s.paragraphs ?? []).slice(1, 3);
  const isVandaag = feest && vandaag.getTime() === stap.van.getTime();
  return (
    <Laag className={`em-laag gm-laag gm-periodelaag pm2-laag ${SFEER[stap.key]}${feest ? ' is-feest' : ''}`} label={stap.label}>
      <Kop terug="#pascha/cyclus" merk />
      <Banner beeld={bannerVoor(stap.key, stap.offsetRange[0])} className={feest ? 'is-hoogfeest' : ''}>
        {feest ? (
          <p className="pm2-groet">„{GROET[0]}”<br />„{GROET[1]}”</p>
        ) : (
          <div className="gm-titels">
            <p className="em-titel">{stap.label}</p>
            <p className="am-onder">{bereik(stap)}</p>
          </div>
        )}
      </Banner>
      <div className="gm-laag-papier">
        {feest ? (
          <>
            <span className="gm-ornament" aria-hidden="true">{SIERKRUIS}</span>
            <h1 className="gm-laag-titel" tabIndex={-1}>{isVandaag ? 'Vandaag is het heilige Pascha' : 'Het heilige Pascha'}</h1>
            <p className="gm-laag-onder">{formatDag(stap.van)} {stap.van.getUTCFullYear()}</p>
            <Sierlijn />
            {PASCHA_FEEST?.toelichting && <p className="gm-tekst">{PASCHA_FEEST.toelichting}</p>}
            <InfoRegels datum={stap.van} mode={mode} />
            {PERIODE_POPUPS.pascha.highlight && (
              <>
                <h2 className="am-label pm2-sectie">Uit de liturgie</h2>
                <blockquote className="pm2-hymne">„{PERIODE_POPUPS.pascha.highlight}”</blockquote>
                <p className="gm-concept">Troparion van Pascha; eigen Nederlandse weergave (zie Bronnen).</p>
              </>
            )}
            <a className="gm-knop gm-knop-breed" href="#pascha/lees/wat">Lees meer over Pascha <ChevronRight aria-hidden="true" /></a>
          </>
        ) : (
          <>
            <h1 className="sr-only" tabIndex={-1}>{stap.label}</h1>
            <h2 className="am-label pm2-sectie">Plaats in de Paschacyclus</h2>
            <p className="gm-tekst">
              {stap.label} ({bereik(stap)} {stap.tot.getUTCFullYear()}) is de {i + 1}e van de tien perioden van de Paschacyclus: {stap.short.charAt(0).toLowerCase() + stap.short.slice(1)}.
            </p>
            <h2 className="am-label pm2-sectie">Betekenis</h2>
            <p className="gm-tekst">{eersteAlinea(stap.key)}</p>
            <h2 className="am-label pm2-sectie">Liturgische informatie</h2>
            <InfoRegels datum={stap.van} mode={mode} plaats={`Periode ${i + 1} van 10`} />
            {(verder.length > 0 || (icoon && !icoon.periode)) && (
              <>
                <h2 className="am-label pm2-sectie">Over deze periode</h2>
                {verder.map((p, j) => <p key={j} className="gm-tekst">{p}</p>)}
                {icoon && !icoon.periode && (
                  <p className="gm-tekst">
                    <b>{icoon.naam}.</b> {icoon.betekenis}{icoon.schrift ? ` (${icoon.schrift})` : ''}
                  </p>
                )}
              </>
            )}
            <a className="gm-knop gm-knop-breed" href={`#pascha/${stap.key}/lees`}>Lees meer over deze periode <ChevronRight aria-hidden="true" /></a>
          </>
        )}
        <h2 className="gm-sectie">Gerelateerde perioden</h2>
        <ul className="gm-lijst gm-dagen">
          {verwant.map((s) => <Rij key={s.key} href={`#pascha/${s.key}`} titel={s.label} onder={bereik(s)} />)}
        </ul>
      </div>
    </Laag>
  );
}

export default function PaschaMobiel() {
  const { vandaag } = useApp();
  const onderdeel = useOnderdeel();
  const cyclus = useMemo(() => paascyclusVoor(vandaag), [vandaag]);
  const [eerste, tweede] = onderdeel.split('/');
  const stap = cyclus.stappen.find((s) => s.key === eerste);
  const info = eerste === 'lees' && tweede && tweede in PASCHA_INFO ? (tweede as InfoKey) : null;
  return (
    <>
      <Hoofd cyclus={cyclus} />
      {eerste === 'cyclus' && <Overzicht cyclus={cyclus} />}
      {stap && !tweede && <Periode stap={stap} cyclus={cyclus} />}
      {stap && tweede === 'lees' && (
        <LeesWeergave className="em-laag em-lees" titel={stap.label} ondertitel={bereik(stap)} terug={`#pascha/${stap.key}`} deelPad={`pascha/${stap.key}`} boven={<span className="em-ornament">{SIERKRUIS}</span>}>
          <PopupTekst inhoud={STAP_INHOUD[stap.key]} />
        </LeesWeergave>
      )}
      {info && (
        <LeesWeergave className="em-laag em-lees" titel={PASCHA_INFO[info].title} ondertitel={PASCHA_INFO[info].subtitle} terug="#pascha" deelPad={`pascha/lees/${info}`} boven={<span className="em-ornament">{SIERKRUIS}</span>}>
          <PopupTekst inhoud={PASCHA_INFO[info]} />
        </LeesWeergave>
      )}
    </>
  );
}
