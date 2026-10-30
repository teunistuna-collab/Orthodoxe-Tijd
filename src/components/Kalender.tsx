import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { MAANDEN, WEEKDAGEN_KORT, formatDag, hoofdletter, maandRooster, formatLang } from '../lib/kalender';
import { LITURGISCHE_KLEUREN, liturgischeKleur } from '../lib/liturgischeKleur';
import { useSwipe } from '../lib/swipe';
import { NIVEAUS, VASTEN_GROEPEN, vastenGroep, type VastenGroep } from '../lib/vasten';
import { isPaascyclus, lezingSoort, roosterMelding, vertaalRef, vertaalTag, type HtcLezingRef } from '../lib/htc';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';
import { usePaginaOpen } from '../lib/paginaOpen';
import { useMobiel } from '../lib/desktop';
import { actieveCyclus } from '../lib/seizoen';
import { heiligeIcoon } from '../lib/heiligenIconen';
import type { DagInfo } from '../lib/kalender';
import { VastenSymbool, KruisTeken } from './ui';
import { eersteHeilige, heiligeTitel, heiligenVanDag as dagHeiligen } from '../lib/heiligenPopup';
import NisKop from './NisKop';
import { BannerBeeld, MaandNav, Sierlijn } from './onderdelen';
import { BLAD, KERK, KRUIS, SIERKRUIS } from './symbolen';
import './Vandaag.css';
import './ontwerp.css';
import './kalender-mobiel.css';

// Kalender volgens het overdrachtspakket (referentie kalender-pascha-feesten-vasten.png, paneel 1): de kop met het
// verluchte boek, de maand (maandag eerst, de gekozen dag in bordeaux, vandaag met een stip; tekens voor feest, groot
// feest en vasten en een streepje in de liturgische kleur) met de legenda, en de gekozen dag als register: heiligen,
// lezingen, vasten, feesten en Paschacyclus. Alle gegevens uit de bestaande kalender, het leesrooster en het Heiligenjaar;
// elke regel opent het bestaande venster. Op brede schermen staan maand en dag naast elkaar.

const TEKEN = { pascha: <KruisTeken />, groot: '✠', ander: '✦' };
const kleineLetter = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const SOORT_LABEL = { apostel: 'Apostel', evangelie: 'Evangelie', oud: 'Oude Testament' } as const;

function Regel({ titel, symbool, onClick, children }: { titel: string; symbool: ReactNode; onClick: () => void; children: ReactNode }) {
  return (
    <li>
      <button type="button" className="ot-rij" onClick={onClick}>
        <span className="ot-rij-symbool" aria-hidden="true">{symbool}</span>
        <span className="ot-rij-tekst">
          <b>{titel}</b>
          <span>{children}</span>
        </span>
        <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
      </button>
    </li>
  );
}

// Mobiel (mock-up 02_kalender, rechtertelefoon): een lage banner, de maand op perkament (ook de dagen van de buurmaanden,
// lichter) en de gekozen dag direct eronder als één kaart met vier regels: heiligen en feesten, vasten, schriftlezingen
// en het kerkelijk ritme. Dezelfde gegevens, state en vensters als de webweergave.
function MRegel({ titel, beeld, onClick, href, children }: { titel: string; beeld: ReactNode; onClick?: () => void; href?: string; children: ReactNode }) {
  const inhoud = (
    <>
      <span className="km-regel-beeld" aria-hidden="true">{beeld}</span>
      <span className="km-regel-tekst">
        <b>{titel}</b>
        {children}
      </span>
      <ChevronRight className="km-pijl" aria-hidden="true" />
    </>
  );
  return (
    <li>
      {href ? (
        <a className="km-regel" href={href}>{inhoud}</a>
      ) : (
        <button type="button" className="km-regel" onClick={onClick}>{inhoud}</button>
      )}
    </li>
  );
}

const ICONEN = '/images/vandaag/iconen';

export default function Kalender() {
  const { mode, vandaag, vandaagYmd, heiligen, rooster, vraagRooster, openDag, openDagLezingen, openDagHeiligen, openDagPascha } = useApp();
  const open = usePaginaOpen('kalender');
  const [cur, setCur] = useState({ y: vandaag.getUTCFullYear(), m: vandaag.getUTCMonth() + 1 });
  const [geselecteerdeYmd, setGeselecteerdeYmd] = useState(vandaagYmd);
  const [legendaOpen, setLegendaOpen] = useState(false);
  // Bladert iemand in het dagvenster naar een andere dag, dan loopt de kalender mee (App.tsx: openDag).
  useEffect(() => {
    const opDag = (e: Event) => {
      const y = (e as CustomEvent<string>).detail;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(y)) return;
      const [jj, mm] = y.split('-').map(Number);
      setCur({ y: jj, m: mm });
      setGeselecteerdeYmd(y);
    };
    window.addEventListener('kalender-dag', opDag);
    return () => window.removeEventListener('kalender-dag', opDag);
  }, []);

  const alleCellen = useMemo(() => maandRooster(cur.y, cur.m, mode, vandaagYmd), [cur, mode, vandaagYmd]);
  // Alleen zoveel weken als de maand nodig heeft (5 of 6).
  const laatste = alleCellen.map((c) => c.maand).lastIndexOf(cur.m);
  const cellen = alleCellen.slice(0, Math.ceil((laatste + 1) / 7) * 7);
  const geselecteerd = cellen.find((c) => c.ymd === geselecteerdeYmd) ?? cellen.find((c) => c.isVandaag) ?? cellen.find((c) => c.maand === cur.m) ?? cellen[0];

  useEffect(() => vraagRooster(geselecteerd.ymd), [geselecteerd.ymd, vraagRooster]);

  const heiligenVanDag = dagHeiligen(geselecteerd.kerkKey, heiligen?.HEILIGEN, geselecteerd.ymd);
  // Net als op Vandaag eerst de lezingen van de paschacyclus (zonder die van de heilige); zijn die er niet, dan de andere.
  const alleLezingen = rooster?.[geselecteerd.ymd] ?? [];
  const paasLezingen = alleLezingen.filter(isPaascyclus);
  const lezingen = paasLezingen.length ? paasLezingen : alleLezingen;
  // Samenvatting: eerst de lezingen van de Liturgie (apostel en evangelie), daarna Metten, Uren en Vespers.
  const neven = (l: HtcLezingRef) => /Matins|Hour|Vespers/i.test(l.tag);
  const lezingenEerst = [...lezingen.filter((l) => !neven(l)), ...lezingen.filter(neven)];

  const vorige = () => setCur((c) => (c.m === 1 ? { y: c.y - 1, m: 12 } : { y: c.y, m: c.m - 1 }));
  const volgende = () => setCur((c) => (c.m === 12 ? { y: c.y + 1, m: 1 } : { y: c.y, m: c.m + 1 }));
  const veegMaand = useSwipe(vorige, volgende);
  const isHuidigeMaand = cur.y === vandaag.getUTCFullYear() && cur.m === vandaag.getUTCMonth() + 1;
  const naarVandaag = () => {
    setCur({ y: vandaag.getUTCFullYear(), m: vandaag.getUTCMonth() + 1 });
    setGeselecteerdeYmd(vandaagYmd);
  };
  const openVasten = () => window.dispatchEvent(new CustomEvent<OpenPopupDetail>(OPEN_POPUP_EVENT, { detail: { pagina: 'vasten', sleutel: geselecteerd.ymd } }));
  const kerkRegel = mode === 'oud' ? `Juliaanse datum: ${formatDag(geselecteerd.kerk)}` : `Kerkelijk: ${formatDag(geselecteerd.kerk)} (nieuwe kalender)`;
  const groepGekozen = vastenGroep(geselecteerd.vasten.niveau);
  const mobiel = useMobiel();

  const celLabel = (c: DagInfo) => {
    const feest = c.feesten[0];
    const heilige = eersteHeilige(heiligen?.HEILIGEN[c.kerkKey]);
    const lit = LITURGISCHE_KLEUREN[liturgischeKleur(c)];
    return [
      `${hoofdletter(formatLang(c.civil))}${c.isVandaag ? ' (vandaag)' : ''}`,
      feest ? feest.naam : heilige ? heiligeTitel(heilige.naam) : '',
      feest?.soort === 'pascha' ? 'Pascha' : feest?.groot ? 'groot feest' : '',
      lit.css ? `liturgische kleur ${lit.naam}` : '',
      c.vasten.label === NIVEAUS[c.vasten.niveau].label ? kleineLetter(c.vasten.label) : c.vasten.label,
    ].filter(Boolean).join(', ');
  };

  if (mobiel) {
    // Een dag uit een buurmaand opent die maand met die dag gekozen.
    const kies = (c: DagInfo) => {
      if (c.maand !== cur.m) setCur({ y: c.civil.getUTCFullYear(), m: c.maand });
      setGeselecteerdeYmd(c.ymd);
      // Staat de dagweergave (grotendeels) onder de vouw, dan er zacht naartoe schuiven.
      requestAnimationFrame(() => {
        const dag = document.getElementById('km-dag-datum');
        if (!dag) return;
        const top = dag.getBoundingClientRect().top;
        if (top > window.innerHeight - 260) window.scrollTo({ top: window.scrollY + top - 96, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      });
    };
    const feesten = geselecteerd.feesten;
    const eerste = heiligenVanDag[0];
    const icoon = eerste ? heiligeIcoon(eerste) : null;
    const cyclus = actieveCyclus(geselecteerd.civil, mode);
    const periode = `${geselecteerd.seizoen}${geselecteerd.toon ? ` · Toon ${geselecteerd.toon}` : ''}`;
    return (
      <section id="kalender" className="am km">
        <div className="km-banner">
          <img
            src="/images/kalender/banner-900.webp"
            srcSet="/images/kalender/banner-900.webp 900w, /images/kalender/banner-1600.webp 1600w"
            sizes="100vw"
            alt=""
            width={1600}
            height={533}
            decoding="async"
            loading={open ? 'eager' : 'lazy'}
          />
          <p className="am-merk">Orthodoxe Tijd</p>
          <h1 className="km-titel">Kalender</h1>
        </div>

        <div className="km-maand">
          <div className="km-maandnav">
            <button type="button" onClick={vorige} aria-label="Vorige maand"><ChevronLeft aria-hidden="true" /></button>
            <h2 aria-live="polite">{hoofdletter(MAANDEN[cur.m - 1])} {cur.y}</h2>
            <button type="button" onClick={volgende} aria-label="Volgende maand"><ChevronRight aria-hidden="true" /></button>
          </div>
          {!isHuidigeMaand && (
            <button type="button" className="km-tekstknop km-naar-vandaag" onClick={naarVandaag}>
              Naar vandaag ›
            </button>
          )}
          <div className="km-raster" {...veegMaand}>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <span key={d} className="km-weekdag" aria-hidden="true">{WEEKDAGEN_KORT[d]}</span>
            ))}
            {cellen.map((c) => {
              const feest = c.feesten[0];
              const isPascha = feest?.soort === 'pascha';
              const groot = !!feest?.groot;
              const teken = isPascha ? TEKEN.pascha : groot ? TEKEN.groot : feest ? TEKEN.ander : null;
              const groep = vastenGroep(c.vasten.niveau);
              const buiten = c.maand !== cur.m;
              const lit = LITURGISCHE_KLEUREN[liturgischeKleur(c)];
              return (
                <button
                  key={c.ymd}
                  type="button"
                  onClick={() => kies(c)}
                  className={`km-cel${buiten ? ' is-buiten' : ''}${c.isVandaag ? ' is-vandaag' : ''}${c.ymd === geselecteerd.ymd ? ' is-gekozen' : ''}${c.isZondag ? ' is-zondag' : ''}${!buiten && (isPascha || groot) ? ' is-feest' : ''}`}
                  style={!buiten && lit.css ? ({ '--lit': lit.css } as CSSProperties) : undefined}
                  aria-label={celLabel(c)}
                  aria-pressed={c.ymd === geselecteerd.ymd}
                  aria-current={c.isVandaag ? 'date' : undefined}
                  tabIndex={buiten ? -1 : undefined}
                >
                  <span className="km-nr">{c.dag}</span>
                  {!buiten && lit.css && <span className="km-lit" aria-hidden="true" />}
                  <span className="km-tekens" aria-hidden="true">
                    {!buiten && teken && <span className={`km-teken${isPascha || groot ? ' is-groot' : ''}`}>{teken}</span>}
                    {!buiten && groep && <VastenSymbool groep={groep} className="km-vastenteken" />}
                  </span>
                </button>
              );
            })}
          </div>
          <button type="button" className="km-tekstknop km-legenda-knop" aria-expanded={legendaOpen} onClick={() => setLegendaOpen((o) => !o)}>
            Legenda <ChevronDown className={legendaOpen ? 'is-open' : undefined} aria-hidden="true" />
          </button>
          {legendaOpen && (
            <ul className="km-legenda">
              <li><span className="km-teken" aria-hidden="true">{TEKEN.ander}</span> Feestdag</li>
              <li><span className="km-teken is-groot" aria-hidden="true">{TEKEN.groot}</span> Groot feest</li>
              <li><span className="km-teken is-groot" aria-hidden="true">{TEKEN.pascha}</span> Pascha</li>
              {(Object.keys(VASTEN_GROEPEN) as VastenGroep[]).map((g) => (
                <li key={g}><VastenSymbool groep={g} className="km-vastenteken" /> {hoofdletter(VASTEN_GROEPEN[g])}</li>
              ))}
              <li><span className="km-staal is-vandaag" aria-hidden="true" /> Vandaag</li>
              <li><span className="km-staal is-gekozen" aria-hidden="true" /> Geselecteerd</li>
              <li><span className="km-staal is-feestcel" aria-hidden="true" /> Pascha en grote feesten</li>
              <li><span className="km-nr-staal" aria-hidden="true">7</span> Zondag</li>
              {Object.values(LITURGISCHE_KLEUREN).filter((k) => k.css).map((k) => (
                <li key={k.naam} className="km-legenda-kleur"><span className="km-lijn-staal" style={{ background: k.css }} aria-hidden="true" /> {hoofdletter(k.naam)}: {k.uitleg}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="km-dag">
          <h2 id="km-dag-datum" className="km-dagtitel" aria-live="polite">{hoofdletter(formatLang(geselecteerd.civil))}</h2>
          <p className="km-seizoen">{periode}</p>
          <p className="km-kerkdatum">{kerkRegel}</p>
          <ul className="km-regels" aria-labelledby="km-dag-datum">
            <MRegel
              titel="Heiligen en feesten"
              beeld={icoon ? <img className="km-heilige" src={icoon.src} alt="" decoding="async" /> : <img src={`${ICONEN}/03_heiligen_kruis.webp`} alt="" width={69} height={77} decoding="async" />}
              onClick={() => (feesten.length ? openDag(geselecteerd.ymd) : openDagHeiligen(geselecteerd.ymd))}
            >
              <span>{feesten[0]?.naam ?? eerste?.naam ?? 'Geen heiligen opgenomen'}</span>
              {feesten.length > 0 && eerste ? (
                <small>{eerste.naam}{heiligenVanDag.length > 1 ? ' en anderen' : ''}</small>
              ) : heiligenVanDag.length > 1 ? (
                <small>Overige herdenkingen van deze dag</small>
              ) : null}
            </MRegel>
            <MRegel
              titel="Vasten"
              beeld={groepGekozen === 'vis' ? <img src={`${ICONEN}/04_vasten_vis.webp`} alt="" width={70} height={32} decoding="async" /> : groepGekozen ? <VastenSymbool groep={groepGekozen} className="km-regel-vasten" /> : <span className="km-regel-vasten km-geenvasten">{SIERKRUIS}</span>}
              onClick={openVasten}
            >
              <span>{geselecteerd.vasten.label}{geselecteerd.vasten.periode && !geselecteerd.vasten.label.includes(geselecteerd.vasten.periode) ? ` · ${geselecteerd.vasten.periode}` : ''}</span>
            </MRegel>
            <MRegel titel="Schriftlezingen" beeld={<img src={`${ICONEN}/05_lezingen_boek.webp`} alt="" width={68} height={63} decoding="async" />} onClick={() => openDagLezingen(geselecteerd.ymd)}>
              {lezingen.length ? (
                <>
                  {lezingenEerst.slice(0, 2).map((l, i) => {
                    const ref = vertaalRef(l.ref);
                    return <span key={i}>{vertaalTag(l.tag, ref)}: {ref}</span>;
                  })}
                  {lezingen.length > 2 && <small>en nog {lezingen.length - 2} {lezingen.length - 2 === 1 ? 'lezing' : 'lezingen'}</small>}
                </>
              ) : (
                <span>{roosterMelding(geselecteerd.ymd)}</span>
              )}
            </MRegel>
            {cyclus === 'pascha' ? (
              <MRegel titel="Het kerkelijk ritme" beeld={<img className="km-chirho" src="/images/Chi-Rho-112.webp" alt="" width={87} height={112} decoding="async" />} onClick={() => openDagPascha(geselecteerd.ymd)}>
                <span>De Paschacyclus</span>
                <small>Deze dag in de Paschacyclus</small>
              </MRegel>
            ) : (
              <MRegel titel="Het kerkelijk ritme" beeld={<img className="km-chirho" src="/images/Chi-Rho-112.webp" alt="" width={87} height={112} decoding="async" />} href={cyclus === 'geboorte' ? '#geboorte' : '#jaar'}>
                <span>{cyclus === 'geboorte' ? 'De Geboortecyclus' : 'Het kerkelijk jaar'}</span>
                <small>{cyclus === 'geboorte' ? 'Naar de Geboortecyclus' : 'Naar het kerkelijk jaar'}</small>
              </MRegel>
            )}
          </ul>
        </div>
      </section>
    );
  }


  return (
    <section id="kalender" className="vg ot-redesign ot-kalender">
      <NisKop open={open} balk achter={<BannerBeeld naam="kalender-banner" open={open} />} />
      <h1 className="sr-only">Kalender</h1>

      <div className="vg-papier ot-inhoud ot-twee">
        {/* De maand */}
        <div className="ot-maand">
          <MaandNav titel={`${hoofdletter(MAANDEN[cur.m - 1])} ${cur.y}`} onVorige={vorige} onVolgende={volgende} />
          {!isHuidigeMaand && (
            <button type="button" className="ot-tekstknop ot-naar-vandaag" onClick={naarVandaag}>
              Naar vandaag ›
            </button>
          )}

          <div className="ot-raster" {...veegMaand}>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <span key={d} className="ot-weekdag" aria-hidden="true">{WEEKDAGEN_KORT[d]}</span>
            ))}
            {cellen.map((c) => {
              if (c.maand !== cur.m) return <span key={c.ymd} className="ot-cel is-leeg" aria-hidden="true" />;
              const feest = c.feesten[0];
              const isPascha = feest?.soort === 'pascha';
              const groot = !!feest?.groot;
              const teken = isPascha ? TEKEN.pascha : groot ? TEKEN.groot : feest ? TEKEN.ander : null;
              const lit = LITURGISCHE_KLEUREN[liturgischeKleur(c)];
              const groep = vastenGroep(c.vasten.niveau);
              const label = celLabel(c);
              return (
                <button
                  key={c.ymd}
                  type="button"
                  onClick={() => setGeselecteerdeYmd(c.ymd)}
                  className={`ot-cel${c.isZondag ? ' is-zondag' : ''}${c.isVandaag ? ' is-vandaag' : ''}${c.ymd === geselecteerd.ymd ? ' is-gekozen' : ''}`}
                  style={lit.css ? ({ '--lit': lit.css } as CSSProperties) : undefined}
                  aria-label={label}
                  aria-pressed={c.ymd === geselecteerd.ymd}
                  aria-current={c.isVandaag ? 'date' : undefined}
                >
                  <span className="ot-cel-nr">{c.dag}</span>
                  <span className="ot-cel-tekens" aria-hidden="true">
                    {teken && <span className={`ot-teken${isPascha || groot ? ' is-groot' : ''}`}>{teken}</span>}
                    {groep && <VastenSymbool groep={groep} className="ot-vastenteken" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legenda: liturgische kleuren en tekens */}
          <button type="button" className="ot-tekstknop" aria-expanded={legendaOpen} onClick={() => setLegendaOpen((o) => !o)}>
            Legenda {legendaOpen ? '‹' : '›'}
          </button>
          {legendaOpen && (
            <div className="ot-legenda">
              <ul>
                {Object.entries(LITURGISCHE_KLEUREN).map(([k, l]) => (
                  <li key={k}>
                    <span className="ot-staal" style={l.css ? ({ '--lit': l.css } as CSSProperties) : undefined} aria-hidden="true" />
                    <span>{hoofdletter(l.naam)} <small>· {l.uitleg}</small></span>
                  </li>
                ))}
              </ul>
              <ul>
                <li><span className="ot-teken" aria-hidden="true">{TEKEN.ander}</span> Feestdag</li>
                <li><span className="ot-teken is-groot" aria-hidden="true">{TEKEN.groot}</span> Groot feest</li>
                <li><span className="ot-teken is-groot" aria-hidden="true">{TEKEN.pascha}</span> Pascha</li>
                {(Object.keys(VASTEN_GROEPEN) as VastenGroep[]).map((g) => (
                  <li key={g}><VastenSymbool groep={g} className="ot-vastenteken" /> {hoofdletter(VASTEN_GROEPEN[g])}</li>
                ))}
                <li><span className="ot-stip" aria-hidden="true" /> Vandaag</li>
                <li><span className="ot-gekozen-staal" aria-hidden="true" /> Geselecteerd</li>
              </ul>
            </div>
          )}
        </div>

        {/* De gekozen dag */}
        <div className="ot-dag">
          <h2 id="kl-dag-datum" className="ot-dagtitel">
            {hoofdletter(formatLang(geselecteerd.civil).split(' ')[0])} {formatDag(geselecteerd.civil)}
          </h2>
          <Sierlijn />
          <p className="ot-kerkdatum">{kerkRegel}</p>
          <ul className="ot-register" aria-labelledby="kl-dag-datum">
            <Regel titel="Heiligen" symbool={KRUIS} onClick={() => openDagHeiligen(geselecteerd.ymd)}>
              {heiligenVanDag.length
                ? `${heiligenVanDag.slice(0, 2).map((h) => h.naam).join(', ')}${heiligenVanDag.length > 2 ? ` en ${heiligenVanDag.length - 2} anderen` : ''}`
                : 'Geen heiligen opgenomen'}
            </Regel>
            <Regel titel="Lezingen" symbool={<BookOpen strokeWidth={1.3} />} onClick={() => openDagLezingen(geselecteerd.ymd)}>
              {lezingen.length
                ? lezingen.slice(0, 2).map((l, i) => {
                    const ref = vertaalRef(l.ref);
                    return <span key={i} className="ot-lezing">{SOORT_LABEL[lezingSoort(ref)]}: {ref}</span>;
                  })
                : roosterMelding(geselecteerd.ymd)}
            </Regel>
            <Regel titel="Vasten" symbool={groepGekozen ? <VastenSymbool groep={groepGekozen} className="ot-rij-vasten" /> : BLAD} onClick={openVasten}>
              {geselecteerd.vasten.label}
            </Regel>
            <Regel titel="Feesten" symbool={KERK} onClick={() => openDag(geselecteerd.ymd)}>
              {geselecteerd.feesten.map((f) => f.naam).join(' · ') || 'Geen groot feest'}
            </Regel>
            <Regel titel="Paschacyclus" symbool={<span className="ot-rij-teken"><KruisTeken /></span>} onClick={() => openDagPascha(geselecteerd.ymd)}>
              {geselecteerd.seizoen}
              {geselecteerd.toon ? ` · Toon ${geselecteerd.toon}` : ''}
            </Regel>
          </ul>
        </div>
      </div>
    </section>
  );
}
