import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ChevronRight, Search, Sparkles } from 'lucide-react';
import { useApp } from '../lib/context';
import { usePaginaOpen } from '../lib/paginaOpen';
import { usePijlgebed } from '../lib/pijlgebed';
import { KruisTeken } from './ui';
import { OPEN_DIENST_EVENT, OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';
import { dagInfo, formatDag, formatDatum, hoofdletter } from '../lib/kalender';
import { serviceConfig } from '../lib/etmaal';
import { lezingSoort, roosterMelding, vertaalRef } from '../lib/htc';
import { eersteHeilige, heiligeTitel } from '../lib/heiligenPopup';
import { LITURGISCHE_KLEUREN, liturgischeKleur } from '../lib/liturgischeKleur';

// Leeg plaatje (1×1) voor een <source> die op dat scherm niets hoeft te laden: de desktopbanner (±400 KB) niet op
// mobiel, het mobiele Christusmedaillon (±185 KB) niet op desktop. <picture class="contents"> verandert de opmaak niet.
const LEEG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';


type UurMoment = {
  naam: string;
  psalm: string;
  vers: string;
  tekst: string;
};

// De kernverzen hieronder komen uit de reeds aangeleverde Septuaginta-psalmteksten
// in public/data/pdfs. Geen NBV/NBV21-psalmtekst gebruiken voor dit onderdeel.
const UURMOMENTEN: Array<{ vanaf: number; tot: number; moment: UurMoment }> = [
  { vanaf: 0, tot: 5, moment: { naam: 'Middernachtdienst', psalm: 'Psalm 118:12', vers: 'kernvers van de nacht', tekst: 'Gezegend bent U, Heer, leer mij uw voorschriften.' } },
  { vanaf: 5, tot: 8, moment: { naam: 'Metten', psalm: 'Psalm 62:2', vers: 'kernvers van de vroege morgen', tekst: 'God, mijn God, vroeg in de ochtend zoek ik U, mijn ziel dorst naar U.' } },
  { vanaf: 8, tot: 10, moment: { naam: 'Eerste Uur', psalm: 'Psalm 89:1', vers: 'kernvers van het eerste uur', tekst: 'Heer, U bent voor ons een toevlucht geweest, van generatie op generatie.' } },
  { vanaf: 10, tot: 12, moment: { naam: 'Derde Uur', psalm: 'Psalm 24:4–5', vers: 'kernvers van het derde uur', tekst: 'Heer, maak mij uw wegen bekend en leer mij uw paden.' } },
  { vanaf: 12, tot: 15, moment: { naam: 'Zesde Uur', psalm: 'Psalm 90:2', vers: 'kernvers van het zesde uur', tekst: 'U bent mijn beschermer en mijn toevlucht, mijn God, op U stel ik mijn hoop.' } },
  { vanaf: 15, tot: 18, moment: { naam: 'Negende Uur', psalm: 'Psalm 84:8', vers: 'kernvers van het negende uur', tekst: 'Toon ons, Heer, uw barmhartigheid en schenk ons uw verlossing.' } },
  { vanaf: 18, tot: 21, moment: { naam: 'Vespers', psalm: 'Psalm 103:1', vers: 'kernvers van de avond', tekst: 'Zegen de Heer, mijn ziel. Heer, mijn God, hoe groot bent U.' } },
  { vanaf: 21, tot: 24, moment: { naam: 'Completen', psalm: 'Psalm 50:3', vers: 'kernvers voor de nacht', tekst: 'Ontferm U over mij, o God, volgens uw grote ontferming.' } },
];

const WEEKDAG_SLEUTELS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

const WEEKTHEMAS: Record<number, { titel: string; uitleg: string }> = {
  0: { titel: 'De Verrijzenis van Christus', uitleg: 'De zondag is de Dag des Heren, een wekelijkse gedachtenis van de Verrijzenis.' },
  1: { titel: 'De heilige Engelen', uitleg: 'Maandag gedenkt de Kerk de hemelse, onlichamelijke machten.' },
  2: { titel: 'De heilige Johannes de Voorloper', uitleg: 'Dinsdag staat in het teken van de Voorloper en de profetische voorbereiding.' },
  3: { titel: 'Het heilig Kruis', uitleg: 'Woensdag gedenkt het verraad van Christus en richt ons op het Kruis.' },
  4: { titel: 'De heilige apostelen en de heilige Nicolaas', uitleg: 'Donderdag gedenkt de Kerk de heilige apostelen en de heilige Nicolaas van Myra: verkondiging, herderschap en trouw aan Christus.' },
  5: { titel: 'Het lijden en Kruis van Christus', uitleg: 'Vrijdag gedenkt de Kruisiging en het vrijwillige lijden van de Heer.' },
  6: { titel: 'Alle heiligen en de ontslapenen', uitleg: 'Zaterdag is verbonden met rust, de ontslapenen en de verwachting van de Verrijzenis.' },
};

function huidigUurMoment(): UurMoment {
  const uur = new Date().getHours();
  return UURMOMENTEN.find((item) => uur >= item.vanaf && uur < item.tot)?.moment ?? UURMOMENTEN[0].moment;
}

export default function Vandaag() {
  const open = usePaginaOpen('vandaag');
  const { mode, vandaag, vandaagYmd, rooster, heiligen, openDag, openLezing, openDagLezingen, openDagHeiligen, openDagPascha, openZoeken } = useApp();
  const pijlgebed = usePijlgebed();
  const [uurMoment, setUurMoment] = useState<UurMoment>(() => huidigUurMoment());

  useEffect(() => {
    const update = () => setUurMoment(huidigUurMoment());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const dag = useMemo(() => dagInfo(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);
  const weekthema = WEEKTHEMAS[dag.weekdag];
  const lezingen = rooster?.[dag.ymd] ?? [];
  const hoofdFeest = dag.feesten[0];
  // De eerste echte heilige van de dag (geen voorfeest, "Zaterdag vóór …" of icoon).
  const heilige = eersteHeilige(heiligen?.HEILIGEN[dag.kerkKey]);
  const datumTitel = hoofdFeest?.naam ?? heilige?.naam ?? 'Dag door het jaar';
  // Liturgische kleur van de dag: de ring rond het medaillon (mobiel) en het kruis in de dagkop (desktop).
  const kleur = liturgischeKleur(dag);
  const kleurHex = LITURGISCHE_KLEUREN[kleur].hex;
  const kleurTekst = `Liturgische kleur van vandaag: ${kleur === 'wit' ? 'wit' : kleur} (${LITURGISCHE_KLEUREN[kleur].uitleg})`;

  // Mobiele opbouw (max-width: 767px): één kolom van zeven balken met dezelfde iconen, links en gebeurtenissen als de
  // lijst hierboven. Onder elke titel staat meteen het antwoord van vandaag; de dienst van dit moment krijgt "Nu".
  const openPopup = (detail: OpenPopupDetail) => window.dispatchEvent(new CustomEvent<OpenPopupDetail>(OPEN_POPUP_EVENT, { detail }));
  const lezingRegel = lezingen.length ? lezingen.slice(0, 2).map((l) => vertaalRef(l.ref)).join(' · ') : roosterMelding(dag.ymd);
  const uurPsalmen = serviceConfig.find((s) => s.title === uurMoment.naam)?.psalms.map((p) => p.title.replace(/^Psalm /, '')) ?? [];
  const psalmRegel = uurPsalmen.length === 0 ? undefined : uurPsalmen.length === 1 ? `Psalm ${uurPsalmen[0]}` : `Psalmen ${uurPsalmen.slice(0, -1).join(', ')} en ${uurPsalmen[uurPsalmen.length - 1]}`;
  const mobieleKnoppen: Array<{ key: string; titel: string; href: string; onClick?: () => void; onder?: string; nu?: boolean }> = [
    { key: 'pijlgebed', titel: 'Pijlgebed', href: '#adem', onder: `“${pijlgebed}”` },
    { key: 'uur', titel: uurMoment.naam, href: '#etmaal', onClick: () => window.dispatchEvent(new CustomEvent(OPEN_DIENST_EVENT, { detail: uurMoment.naam })), onder: psalmRegel, nu: true },
    { key: 'week', titel: 'Weekcyclus', href: '#week', onClick: () => openPopup({ pagina: 'week', sleutel: WEEKDAG_SLEUTELS[dag.weekdag] }), onder: `${hoofdletter(dag.weekdagNaam)} · ${weekthema.titel}` },
    { key: 'vasten', titel: 'Vasten vandaag', href: '#vasten', onClick: () => openPopup({ pagina: 'vasten', sleutel: dag.ymd }), onder: dag.vasten.label },
    { key: 'pascha', titel: 'Paascyclus', href: '#pascha', onClick: () => openDagPascha(dag.ymd), onder: `${dag.seizoen}${dag.toon ? ` · Toon ${dag.toon}` : ''}` },
    { key: 'lezingen', titel: 'Schriftlezingen', href: '#kalender', onClick: () => openDagLezingen(dag.ymd), onder: lezingRegel },
    { key: 'heiligen', titel: 'Heiligen van de dag', href: '#heiligen', onClick: () => openDagHeiligen(dag.ymd), onder: heilige ? heiligeTitel(heilige.naam) : undefined },
    // "Vaders & moeders" (woestijnvaders en -moeders) komt terug zodra de verzameling er is
  ];
  const kerkelijkeRegel = mode === 'oud' ? `Kerkelijke datum: ${formatDag(dag.kerk)} (Juliaans)` : 'Nieuwe kalender (gereviseerd juliaans)';

  return (
    <section id="vandaag" className="vandaag-design-page">
      <div className="vandaag-frame">
        <h1 className="sr-only">Vandaag</h1>
        <div className="vandaag-paper">
          {/* Web: de voordeur van de dag (Bouw 166). Links het Christus-icoon, rechts de datum, de kerkelijke datum, het
              feest of de heilige van de dag en het vasten, allemaal uit de bestaande dagdata. */}
          <div className="vd-opening">
            <div className="vd-icoon"><img fetchPriority={open ? 'high' : 'auto'} loading={open ? 'eager' : 'lazy'} decoding="async" src="/images/Christus-afbeelding.webp" alt="Christus" width={640} height={633} /></div>
            <header className="vandaag-dayhead vd-dag">
              <p className="opening-label">Vandaag · {hoofdletter(dag.weekdagNaam)}</p>
              <h2 className="vd-datum">{formatDatum(dag.civil)}</h2>
              <p className="vd-kerk">{kerkelijkeRegel}</p>
              <span className="opening-sierlijn" aria-hidden="true" />
              <p className="vd-titel"><i aria-hidden="true" style={{ color: kleurHex }} title={kleurTekst}><KruisTeken /></i>{datumTitel}</p>
              {!hoofdFeest && heilige?.titel && <small>{heilige.titel}</small>}
              {hoofdFeest?.kort && <small>{hoofdFeest.kort}</small>}
              <p className="vd-vasten"><b>Vasten</b> {dag.vasten.label}{dag.vasten.periode ? ` · ${dag.vasten.periode}` : ''}</p>
            </header>
          </div>
          <div className="vandaag-list vd-lijst">
            <div className="vd-primair">
              {/* De kaart opent de dienst; de psalmverwijzing erin opent die psalm in het psalter (daarom geen <a> om het geheel). */}
              <article className="vandaag-item vandaag-uur-item" role="link" tabIndex={0} onClick={(e)=>{ if ((e.target as HTMLElement).closest('a')) return; window.dispatchEvent(new CustomEvent(OPEN_DIENST_EVENT, { detail: uurMoment.naam })); }} onKeyDown={(e)=>{ if (e.key==='Enter' && e.target===e.currentTarget) window.dispatchEvent(new CustomEvent(OPEN_DIENST_EVENT, { detail: uurMoment.naam })); }}><div><b>{uurMoment.naam}</b><em>“{uurMoment.tekst}”</em><small><a href={`#psalmen/${uurMoment.psalm.match(/\d+/)?.[0]}`}>{uurMoment.psalm}</a> · Septuaginta</small><span className="btn-pill vandaag-cta">Naar {uurMoment.naam.toLowerCase()} ›</span></div><ChevronRight/></article>
              <article className="vandaag-item vandaag-readings-item" role="link" tabIndex={0} onClick={(e)=>{ if ((e.target as HTMLElement).closest('button')) return; openDagLezingen(dag.ymd); }} onKeyDown={(e)=>{ if(e.key==='Enter') openDagLezingen(dag.ymd); }}><div><b>Schriftlezingen</b>{lezingen.length ? lezingen.slice(0,2).map((l,i)=>{const refNl=vertaalRef(l.ref); const soort=lezingSoort(refNl); return <button key={`${l.ref}-${i}`} type="button" onClick={()=>openLezing({ref:l.ref,tag:l.tag,julianKey:dag.julianKey,civil:vandaag})}><span>{soort === 'evangelie' ? 'Evangelie' : soort === 'oud' ? 'Oude Testament' : 'Apostel'} · {refNl}</span></button>}) : <span>{roosterMelding(dag.ymd)}</span>}<span className="btn-pill vandaag-cta">Lees lezingen ›</span></div><ChevronRight aria-hidden="true"/></article>
            </div>
            <div className="vd-register">
              <a className="vandaag-item vd-rij" href="#adem"><div><b>Pijlgebed</b><em>“{pijlgebed}”</em><span className="btn-pill vandaag-cta">Naar pijlgebed ›</span></div><ChevronRight/></a>
              <a className="vandaag-item vd-rij" href="#week" onClick={(e)=>{ e.preventDefault(); window.dispatchEvent(new CustomEvent<OpenPopupDetail>(OPEN_POPUP_EVENT, { detail: { pagina: 'week', sleutel: WEEKDAG_SLEUTELS[dag.weekdag] } })); }}><div><b>Weekcyclus · {hoofdletter(dag.weekdagNaam)}</b><span>{weekthema.titel}</span><span className="btn-pill vandaag-cta">Bekijk de week ›</span></div><ChevronRight/></a>
              <a className="vandaag-item vd-rij" href="#vasten" onClick={(e)=>{ e.preventDefault(); window.dispatchEvent(new CustomEvent<OpenPopupDetail>(OPEN_POPUP_EVENT, { detail: { pagina: 'vasten', sleutel: dag.ymd } })); }}><div><b>Vasten vandaag</b><span>{dag.vasten.label}</span>{dag.vasten.periode && <small>{dag.vasten.periode}</small>}<span className="btn-pill vandaag-cta">Bekijk vasten ›</span></div><ChevronRight/></a>
              <a className="vandaag-item vd-rij" href="#pascha" onClick={(e)=>{ e.preventDefault(); openDagPascha(dag.ymd); }}><div><b>Paascyclus</b><span>{dag.seizoen}{dag.toon ? ` · Toon ${dag.toon}` : ''}</span><span className="btn-pill vandaag-cta">Bekijk cyclus ›</span></div><ChevronRight/></a>
            </div>
            {/* "Vaders & moeders" komt terug zodra de verzameling spreuken er is (zie ook de mobiele knoppen hieronder). */}
          </div>
          <button type="button" onClick={()=>openDag(dag.ymd)} className="vandaag-main-button"><Sparkles/> Bekijk de volledige dag <ChevronRight/></button>
        </div>
      </div>

      <div className="vandaag-mobiel">
        {['lb', 'rb', 'lo', 'ro'].map((hoek) => <span key={hoek} className={`vm-hoek vm-hoek-${hoek}`} aria-hidden="true" />)}
        <button type="button" onClick={openZoeken} className="vm-zoek" aria-label="Zoeken"><Search aria-hidden="true" /></button>
        {/* Koppen voor schermlezers: h1 is de site met "Vandaag", de datum is h2 (het desktopdeel met zijn eigen koppen is op mobiel verborgen) */}
        <h1 className="vm-titel">Orthodoxe Tijd<span className="sr-only"> — Vandaag</span></h1>

        <div className="vm-medaillon" style={{ '--dag-kleur': kleurHex } as CSSProperties}>
          <span className="sr-only">{kleurTekst}</span>
          <picture className="contents">
            <source media="(min-width: 768px)" srcSet={LEEG} />
            <img decoding="async" loading={open ? 'eager' : 'lazy'} src="/images/Christus-afbeelding.webp" alt="Christus" />
          </picture>
        </div>

        <p className="vm-weekdag">{dag.weekdagNaam}</p>
        <h2 className="vm-datum">{formatDatum(dag.civil)}</h2>
        <p className="vm-sier vm-sier-datum" aria-hidden="true"><span>✣</span></p>
        <p className="vm-kerk">{kerkelijkeRegel}</p>

        <div className="vm-lijst">
          {mobieleKnoppen.map(({ key, titel, href, onClick, onder, nu }) => (
            <a
              key={key}
              className={`vm-rij${nu ? ' is-nu' : ''}`}
              href={href}
              onClick={onClick ? (e) => { e.preventDefault(); onClick(); } : undefined}
            >
              <span className="vm-rij-tekst">
                <b>
                  {titel}
                  {nu && <span className="vm-nu">Nu</span>}
                </b>
                {onder && <small>{onder}</small>}
              </span>
              <span className="pijl" aria-hidden="true">›</span>
            </a>
          ))}
        </div>

        <div className="vm-kaars" aria-hidden="true">
          <span className="vm-kaars-lijn"><i>✣</i></span>
          <span className="vm-vlam"><img decoding="async" src="/images/decor/kaars.webp" alt="" width="220" height="200" /></span>
          <span className="vm-kaars-lijn vm-kaars-rechts"><i>✣</i></span>
        </div>
      </div>
    </section>
  );
}
