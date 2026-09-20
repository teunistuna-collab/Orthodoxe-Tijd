import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, ChevronRight, Church, Cross as CrossIcon, Flame, ScrollText, Sparkles, Wheat } from 'lucide-react';
import { useApp } from '../lib/context';
import { OPEN_DIENST_EVENT, OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';
import { dagInfo, formatDag, formatDatum, hoofdletter } from '../lib/kalender';
import { HEILIGEN } from '../lib/heiligen';
import { LEZINGEN_JAAR, lezingSoort, vertaalLeven, vertaalRef, vertaalTag } from '../lib/htc';


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

const UUR_ICONEN: Record<string, string> = {
  Middernachtdienst: '/images/ui/menu/03-Etmaal-04-Middernachtdienst.webp',
  Metten: '/images/ui/menu/03-Etmaal-03-Metten.webp',
  'Eerste Uur': '/images/ui/menu/03-Etmaal-01-Ochtendgebeden.webp',
  'Derde Uur': '/images/ui/menu/03-Etmaal-06-Derde-Uur.webp',
  'Zesde Uur': '/images/ui/menu/03-Etmaal-07-Zesde-Uur.webp',
  'Negende Uur': '/images/ui/menu/03-Etmaal-08-Negende-Uur.webp',
  Vespers: '/images/ui/menu/03-Etmaal-02-Avondgebeden.webp',
  Completen: '/images/ui/menu/03-Etmaal-05-Completen.webp',
};

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
  const { mode, vandaag, vandaagYmd, htc, openDag, openLezing } = useApp();
  const [uurMoment, setUurMoment] = useState<UurMoment>(() => huidigUurMoment());

  useEffect(() => {
    const update = () => setUurMoment(huidigUurMoment());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const dag = useMemo(() => dagInfo(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);
  const weekthema = WEEKTHEMAS[dag.weekdag];
  const htcDag = htc?.[dag.julianKey];
  const lezingen = dag.jaar === LEZINGEN_JAAR ? htcDag?.r ?? [] : [];
  const hoofdFeest = dag.feesten[0];
  const heilige = HEILIGEN[dag.kerkKey]?.[0];
  const gedachtenissen = dag.feesten;
  const datumTitel = hoofdFeest?.naam ?? heilige?.naam ?? 'Dag door het jaar';

  return (
    <section id="vandaag" className="vandaag-design-page">
      <div className="vandaag-frame">
        <div className="vandaag-titlebar"><span className="vandaag-title-ornament">☦</span><div><p>ORTHODOXE TIJD</p><h1>Vandaag</h1></div><span className="vandaag-title-ornament">☦</span></div>
        <div className="vandaag-cover"><img fetchPriority="high" src="/images/heroes/hero-vandaag.webp" alt="Orthodoxe gebedssfeer bij kaarslicht" /><div className="vandaag-cover-shade"/><div className="vandaag-cover-copy"><span>In Gods tegenwoordigheid</span><strong>{hoofdletter(dag.weekdagNaam)} · {formatDatum(dag.civil)}</strong></div></div>
        <div className="vandaag-paper">
          <header className="vandaag-dayhead"><p>{hoofdletter(dag.weekdagNaam)}</p><h2>{formatDatum(dag.civil)}</h2>{mode === 'oud' && <span>({formatDag(dag.kerk)} · Juliaanse kalender)</span>}<i aria-hidden="true">☦</i><h3>{datumTitel}</h3>{!hoofdFeest && heilige?.titel && <small>{heilige.titel}</small>}{hoofdFeest?.kort && <small>{hoofdFeest.kort}</small>}</header>
          <div className="vandaag-list">
            <a className="vandaag-item" href="#adem"><img decoding="async" className="provided-menu-icon" src="/images/ui/menu/01-Hoofdmenu-01-Pijlgebed.webp" alt=""/><div><b>Pijlgebed</b><em>“Heer Jezus Christus, ontferm U over ons.”</em><span className="btn-pill vandaag-cta">Naar pijlgebed →</span></div><ChevronRight/></a>
            <a className="vandaag-item" href="#etmaal" onClick={(e)=>{ e.preventDefault(); window.dispatchEvent(new CustomEvent(OPEN_DIENST_EVENT, { detail: uurMoment.naam })); }}><img decoding="async" className="provided-menu-icon" src={UUR_ICONEN[uurMoment.naam] ?? '/images/ui/menu/03-Etmaal-05-Completen.webp'} alt=""/><div><b>{uurMoment.naam}</b><em>“{uurMoment.tekst}”</em><small>{uurMoment.psalm} · Septuaginta</small><span className="btn-pill vandaag-cta">Naar {uurMoment.naam.toLowerCase()} →</span></div><ChevronRight/></a>
            <a className="vandaag-item" href="#week" onClick={(e)=>{ e.preventDefault(); window.dispatchEvent(new CustomEvent<OpenPopupDetail>(OPEN_POPUP_EVENT, { detail: { pagina: 'week', sleutel: WEEKDAG_SLEUTELS[dag.weekdag] } })); }}><img decoding="async" className="provided-menu-icon" src="/images/ui/menu/01-Hoofdmenu-04-Weekcyclus.webp" alt=""/><div><b>Weekcyclus · {hoofdletter(dag.weekdagNaam)}</b><span>{weekthema.titel}</span><span className="btn-pill vandaag-cta">Bekijk de week →</span></div><ChevronRight/></a>
            <a className="vandaag-item" href="#vasten" onClick={(e)=>{ e.preventDefault(); window.dispatchEvent(new CustomEvent<OpenPopupDetail>(OPEN_POPUP_EVENT, { detail: { pagina: 'vasten', sleutel: dag.ymd } })); }}><img decoding="async" className="provided-menu-icon" src="/images/ui/menu/01-Hoofdmenu-02-Vasten-vandaag.webp" alt=""/><div><b>Vasten vandaag</b><span>{dag.vasten.label}</span>{dag.vasten.periode && <small>{dag.vasten.periode}</small>}<span className="btn-pill vandaag-cta">Bekijk vasten →</span></div><ChevronRight/></a>
            <a className="vandaag-item" href="#pascha" onClick={(e)=>{ e.preventDefault(); window.dispatchEvent(new CustomEvent<OpenPopupDetail>(OPEN_POPUP_EVENT, { detail: { pagina: 'pascha', sleutel: 'cyclus' } })); }}><img decoding="async" className="provided-menu-icon" src="/images/ui/menu/01-Hoofdmenu-03-Paschale-cyclus.webp" alt=""/><div><b>Paschale cyclus</b><span>{dag.seizoen}{dag.toon ? ` · Toon ${dag.toon}` : ''}</span><span className="btn-pill vandaag-cta">Bekijk cyclus →</span></div><ChevronRight/></a>
            <article className="vandaag-item vandaag-readings-item" role="link" tabIndex={0} onClick={(e)=>{ if ((e.target as HTMLElement).closest('button')) return; window.location.hash='kalender'; }} onKeyDown={(e)=>{ if(e.key==='Enter') window.location.hash='kalender'; }}><img decoding="async" className="provided-menu-icon" src="/images/ui/menu/01-Hoofdmenu-11-Schriftlezingen.webp" alt=""/><div><b>Schriftlezingen</b>{lezingen.length ? lezingen.slice(0,2).map((l,i)=>{const refNl=vertaalRef(l.ref); const soort=lezingSoort(refNl); return <button key={`${l.ref}-${i}`} type="button" onClick={()=>openLezing({ref:l.ref,tag:l.tag,julianKey:dag.julianKey,civil:vandaag})}><span>{soort === 'evangelie' ? 'Evangelie' : soort === 'oud' ? 'Oude Testament' : 'Apostel'} · {refNl}</span></button>}) : <span>Leesrooster {LEZINGEN_JAAR}</span>}<span className="btn-pill vandaag-cta">Lees lezingen →</span></div><a href="#kalender"><ChevronRight/></a></article>
            <a className="vandaag-item" href="#gebeden"><img decoding="async" className="provided-menu-icon" src="/images/ui/menu/01-Hoofdmenu-05-Woestijnvaders-en-moeders.webp" alt=""/><div><b>Vaders &amp; moeders</b><span>Spreuk uit de woestijn</span><small>De verzameling wordt later toegevoegd.</small><span className="btn-pill vandaag-cta">Ga naar gebeden →</span></div><ChevronRight className="vandaag-muted-chevron"/></a>
          </div>
          <button type="button" onClick={()=>openDag(dag.ymd)} className="vandaag-main-button"><Sparkles/> Bekijk de volledige dag <ChevronRight/></button>
        </div>
      </div>
    </section>
  );
}
