import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../lib/context';
import { dagInfo, formatMd, hoofdletter, MAANDEN } from '../lib/kalender';
import HeiligePopup from './HeiligePopup';
import { eersteHeilige, heiligenVanDag, normaliseer, tekstVoorIndeling, type Resultaat } from '../lib/heiligenPopup';
import { CATEGORIEEN, categorieenVan } from '../lib/heiligenSoort';
import PageHero from './PageHero';
import NaarBoven from './NaarBoven';

// Lange samenstellingen mogen alleen op de woordgrens afbreken (met streepje), niet midden in het woord: Klooster-heiligen.
const afbreekbaar = (label: string) => label.replace(/^(Klooster|Recht|Vrouw)(?=\S)/, '$1\u00AD');

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

function sorteerMd(a: string, b: string) { const [am, ad] = a.split('-').map(Number); const [bm, bd] = b.split('-').map(Number); return am - bm || ad - bd; }

export default function Heiligen() {
  const { mode, vandaag, vandaagYmd, heiligen, openDagHeiligen } = useApp();
  const dagVandaag = useMemo(() => dagInfo(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);
  const [zoek, setZoek] = useState('');
  const [maand, setMaand] = useState<number | null>(null);
  const [categorie, setCategorie] = useState('alle');
  const [alleenNl, setAlleenNl] = useState(false);
  const [dag, setDag] = useState<number | null>(null);
  // Na een tik op een maandknop tonen we nog geen heiligen: eerst een dag (of "Alle dagen") kiezen.
  const [wachtOpDag, setWachtOpDag] = useState(false);
  const [geselecteerde, setGeselecteerde] = useState<Resultaat | null>(null);

  const heiligenVandaag = useMemo<Resultaat[]>(() => heiligenVanDag(dagVandaag.kerkKey, heiligen?.HEILIGEN, dagVandaag.ymd), [dagVandaag.kerkKey, dagVandaag.ymd, heiligen]);

  // Uitgelicht als "heilige van vandaag": de eerste echte heilige, geen voorfeest of icoon (die staan wel in de daglijst).
  const uitgelicht = (eersteHeilige(heiligenVandaag) as Resultaat | undefined) ?? heiligenVandaag[0];

  const resultaten = useMemo<Resultaat[]>(() => {
    const query = normaliseer(zoek.trim());
    const past = (md: string, tekst: string) => (maand === null || Number(md.split('-')[0]) === maand) && (dag === null || Number(md.split('-')[1]) === dag) && (!query || normaliseer(`${tekst} ${md} ${formatMd(md)}`).includes(query));
    // Alleen heiligen (Heiligenjaar en Lage Landen); feesten en andere gedachtenissen horen bij de dag, niet in deze lijst.
    const basis: Resultaat[] = (heiligen?.ALLE_HEILIGEN ?? []).filter(h => h.type === 'saint' && past(h.md, `${h.naam} ${h.titel} ${(h.namen ?? []).join(' ')}`) && (!alleenNl || h.nl)).map(h => ({ ...h, bron: h.nl ? 'nl' : 'hj' }));
    return basis.filter(h => categorie === 'alle' || categorieenVan(tekstVoorIndeling(h)).includes(categorie)).sort((a,b) => sorteerMd(a.md,b.md) || a.naam.localeCompare(b.naam));
  }, [alleenNl, heiligen, maand, dag, zoek, categorie]);

  const aantalHeiligen = useMemo(() => (heiligen?.ALLE_HEILIGEN ?? []).filter(h => h.type === 'saint').length, [heiligen]);

  const groepen = useMemo(() => {
    const map = new Map<string, Resultaat[]>();
    resultaten.forEach(h => map.set(h.md, [...(map.get(h.md) ?? []), h]));
    return [...map.entries()].sort(([a],[b]) => sorteerMd(a,b));
  }, [resultaten]);

  const categories = [...CATEGORIEEN.map((c) => [c.id, c.label, c.omschrijving]), ['overige', 'Overige heiligen', 'Zonder nadere aanduiding in de bron']];
  const dagenInMaand = maand ? new Date(Date.UTC(2024, maand, 0)).getUTCDate() : 0;

  // Resultaten verschijnen pas na een gekozen dag (of andere zoekopdracht). Bij alleen "Heiligen van de Lage Landen" staan ze onder dat blok.
  const filterActief = Boolean(zoek || maand || dag || categorie !== 'alle' || alleenNl);
  const toonResultaten = filterActief && !wachtOpDag;
  const alleenLageLanden = alleenNl && !zoek && !maand && !dag && categorie === 'alle';
  const resultatenBlok = (
    <section className="saints-results bibliotheek">
              <div className="saints-rule-title"><h2>{dag&&maand?`${dag} ${MAANDEN[maand-1]}`:alleenNl?'Heiligen van de Lage Landen':'Geselecteerde heiligen'}</h2><span>{resultaten.length} gedachtenissen</span></div>
              <div className="saints-results-list">{groepen.slice(0,alleenNl?groepen.length:12).map(([md,items])=><div key={md}><time>{formatMd(md)}</time><div>{items.map((h,i)=><button key={`${h.naam}-${i}`} onClick={()=>setGeselecteerde(h)}><span><strong>{h.naam}</strong>{h.titel&&<small>{h.titel}</small>}</span><b>›</b></button>)}</div></div>)}</div>
              {!groepen.length&&<p className="saints-empty">Geen heiligen gevonden voor deze selectie.</p>}
    </section>
  );

  return <>
    <PageHero id="heiligen" titel="Heiligen" />
    <section className="saints-refined">
      <div className={CONTENT}>
        <section className="saints-today-panel">
          <div className="saints-today-intro">
            <p className="saints-kicker">Heiligen van vandaag</p>
            <h1>Vandaag gedenken wij</h1>
            <p className="saints-date-line">{formatMd(dagVandaag.kerkKey)} <span>(kerkelijke kalender)</span></p>
            <p>Op deze dag bewaart de Kerk de gedachtenis van hen die Christus gevolgd hebben. Hun leven herinnert ons aan het licht van Christus.</p>
          </div>
          <div className="saints-today-feature">
            <p className="saints-kicker">Belangrijkste heilige van de dag</p>
            {uitgelicht ? <>
              <button onClick={()=>setGeselecteerde(uitgelicht)} className="saints-feature-name">{uitgelicht.naam}</button>
              {uitgelicht.titel && <p className="saints-feature-title">{uitgelicht.titel}</p>}
              <p className="saints-feature-date">{formatMd(dagVandaag.kerkKey)}</p>
              <p>{uitgelicht.kort || 'Lees meer over het leven en de gedachtenis van deze heilige.'}</p>
              <div className="saints-feature-actions"><button onClick={()=>setGeselecteerde(uitgelicht)} className="saints-gold-button">Lees het leven ›</button>{heiligenVandaag.length>1&&<button onClick={()=>openDagHeiligen(dagVandaag.ymd)} className="saints-text-link">Bekijk alle {heiligenVandaag.length} heiligen ›</button>}</div>
            </> : <p>Voor deze dag is nog geen heilige beschikbaar.</p>}
          </div>
          <blockquote className="saints-side-quote">“Ik zag alle strikken die de vijand over de wereld had uitgespreid en vroeg: Wie kan daaraan ontkomen? Toen hoorde ik een stem antwoorden: Nederigheid.”<cite>— Abba Antonius de Grote</cite><span>✣</span></blockquote>
        </section>

        <section className="saints-discover bibliotheek">
          <div className="saints-section-head bieb-kop"><h2>Ontdek alle heiligen</h2><p>Zoek op naam, maand of categorie en laat u inspireren door hun leven.</p></div>
          <div className="saints-search-row">
            <label><Search/><input value={zoek} onChange={e=>{setZoek(e.target.value);setWachtOpDag(false)}} placeholder="Zoek een heilige…" aria-label="Zoek een heilige" /></label>
            <button type="button" onClick={()=>document.querySelector('.pagina:not(.pagina-verborgen) .saints-results')?.scrollIntoView({behavior:'smooth',block:'start'})} className="saints-search-button">Zoeken ›</button>
          </div>
        </section>

        <section className="saints-browser bibliotheek">
          <div className="saints-rule-title"><h2>Heiligen per maand</h2><span>{aantalHeiligen} heiligen</span></div>
          <div className="saints-month-grid">{MAANDEN.map((m,i)=><button key={m} onClick={()=>{setMaand(i+1);setDag(null);setZoek('');setAlleenNl(false);setWachtOpDag(true)}} className={maand===i+1?'active':''}>{hoofdletter(m)}</button>)}</div>
          {maand && <div className="saints-days-panel"><div><p className="saints-kicker">Kies een dag in {MAANDEN[maand-1]}</p><button onClick={()=>{setDag(null);setWachtOpDag(false)}} className={!dag&&!wachtOpDag?'active':''}>Alle dagen</button></div><div className="saints-days-grid">{Array.from({length:dagenInMaand},(_,i)=>i+1).map(n=><button key={n} onClick={()=>{setDag(n);setAlleenNl(false);setWachtOpDag(false)}} className={dag===n?'active':''}>{n}</button>)}</div></div>}
        </section>

        {toonResultaten && !alleenLageLanden && resultatenBlok}

        <section className="saints-categories bibliotheek">
          <div className="saints-rule-title"><h2>Heiligen naar categorie</h2></div>
          <div className="saints-category-grid">{categories.map(c=><button key={c[0]} onClick={()=>{setCategorie(c[0]);setWachtOpDag(false)}} className={categorie===c[0]?'active':''}><strong>{afbreekbaar(c[1])}</strong><span>{c[2]}</span></button>)}</div>
        </section>

        <section className="saints-lowlands">
          <div className="saints-lowlands-map"><img loading="lazy" decoding="async" src="/images/decor/lage-landen.webp" alt="Kaart van de Lage Landen" /></div>
          <div><h2>Heiligen van de Lage Landen</h2><p className="ot-tekst">Ontdek de heiligen die verbonden zijn met de Nederlanden, België en omliggende gebieden.</p><p className="ot-tekst">Van Willibrord en Servatius tot Lambertus en Bavo — onze streken hebben een rijke geschiedenis van heilige mannen en vrouwen.</p><button onClick={()=>{const nieuw=!alleenNl;setAlleenNl(nieuw);setMaand(null);setDag(null);setCategorie('alle');setZoek('');setWachtOpDag(false)}} className={`saints-outline-button ${alleenNl?'active':''}`}>{alleenNl?'Deselecteer Heiligen van de Lage Landen ×':'Bekijk alle heiligen van de Lage Landen ›'}</button></div>
          <blockquote>“Ons leven en onze dood liggen bij onze naaste. Als wij onze broeder winnen, winnen wij God.”<cite>— Abba Antonius de Grote</cite><span>✣</span></blockquote>
        </section>

        {toonResultaten && alleenLageLanden && resultatenBlok}

      </div>
    </section>
    <section className="saints-ending"><div className={CONTENT}><h2>Een wolk van getuigen</h2><p>“Daarom ook, nu wij zo’n grote wolk van getuigen om ons heen hebben…”</p><span>Hebreeën 12:1</span></div></section>
    <HeiligePopup heilige={geselecteerde} onClose={()=>setGeselecteerde(null)} />
    <NaarBoven />
  </>;
}
