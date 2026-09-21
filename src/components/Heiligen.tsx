import { useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useApp } from '../lib/context';
import { ALLE_HEILIGEN } from '../lib/heiligen';
import { rangLabel, vertaalLeven } from '../lib/htc';
import { dagInfo, formatMd, hoofdletter, MAANDEN, MAANDEN_KORT } from '../lib/kalender';
import { LiturgicalPopup } from './CycleSections';
import { heiligenVanDag, normaliseer, popupContent, type Resultaat } from '../lib/heiligenPopup';

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

function sorteerMd(a: string, b: string) { const [am, ad] = a.split('-').map(Number); const [bm, bd] = b.split('-').map(Number); return am - bm || ad - bd; }

export default function Heiligen() {
  const { mode, vandaag, vandaagYmd, htc } = useApp();
  const dagVandaag = useMemo(() => dagInfo(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);
  const [zoek, setZoek] = useState('');
  const [maand, setMaand] = useState<number | null>(null);
  const [categorie, setCategorie] = useState('alle');
  const [alleenNl, setAlleenNl] = useState(false);
  const [dag, setDag] = useState<number | null>(null);
  // Na een tik op een maandknop tonen we nog geen heiligen: eerst een dag (of "Alle dagen") kiezen.
  const [wachtOpDag, setWachtOpDag] = useState(false);
  const [vandaagOpen, setVandaagOpen] = useState(false);
  const [geselecteerde, setGeselecteerde] = useState<Resultaat | null>(null);

  const heiligenVandaag = useMemo<Resultaat[]>(() => heiligenVanDag(dagVandaag.kerkKey, htc), [dagVandaag.kerkKey, htc]);

  const categorieVan = (h: Resultaat) => {
    const t = normaliseer(`${h.titel ?? ''} ${h.naam}`);
    if (/martelaar|martelares|martyr/.test(t)) return 'martelaren';
    if (/bisschop|aartsbisschop|bishop/.test(t)) return 'bisschoppen';
    if (/monnik|monnikin|abt|abdis|monk/.test(t)) return 'monniken';
    if (/kluizenaar|heremiet|eremiet/.test(t)) return 'kluizenaars';
    if (/moeder|maagd|vrouw|abdis|martelares/.test(t)) return 'vrouwheiligen';
    if (/rechtvaardig|righteous/.test(t)) return 'rechtvaardigen';
    if (/priester|leraar|vader|apostel/.test(t)) return 'herders';
    return 'overige';
  };

  const resultaten = useMemo<Resultaat[]>(() => {
    const query = normaliseer(zoek.trim());
    const past = (md: string, tekst: string) => (maand === null || Number(md.split('-')[0]) === maand) && (dag === null || Number(md.split('-')[1]) === dag) && (!query || normaliseer(`${tekst} ${md} ${formatMd(md)}`).includes(query));
    const centraal: Resultaat[] = ALLE_HEILIGEN.filter(h => past(h.md, `${h.naam} ${h.titel} ${h.kort}`) && (!alleenNl || h.nl)).map(h => ({ ...h, bron: 'nl' }));
    const basis = [...centraal];
    if (htc && !alleenNl) {
      const gezien = new Set(centraal.map(h => `${h.md}|${normaliseer(h.ruwNaam ?? h.naam)}`));
      for (const [md, d] of Object.entries(htc)) {
        if (!past(md, '')) continue;
        for (const [icon, tekst] of d.l) {
          const naam = vertaalLeven(tekst).replace(/\.$/, '');
          if (query && !normaliseer(naam).includes(query)) continue;
          const sleutel = `${md}|${normaliseer(naam)}`;
          if (!gezien.has(sleutel)) { gezien.add(sleutel); basis.push({ md, naam, kort: naam, bron: 'htc', rang: rangLabel(icon)?.rang }); }
        }
      }
    }
    return basis.filter(h => categorie === 'alle' || categorieVan(h) === categorie).sort((a,b) => sorteerMd(a.md,b.md) || a.naam.localeCompare(b.naam));
  }, [alleenNl, htc, maand, dag, zoek, categorie]);

  const groepen = useMemo(() => {
    const map = new Map<string, Resultaat[]>();
    resultaten.forEach(h => map.set(h.md, [...(map.get(h.md) ?? []), h]));
    return [...map.entries()].sort(([a],[b]) => sorteerMd(a,b));
  }, [resultaten]);

  const categories = [
    ['martelaren','Martelaren','Getuigen in lijden'],['bisschoppen','Bisschoppen','Herder en leraar'],['monniken','Monniken','Voorbeelden van toewijding'],['kluizenaars','Kluizenaars','In de stilte met God'],['vrouwheiligen','Vrouwheiligen','Moeders, maagden en monialen'],['rechtvaardigen','Rechtvaardigen','Een heilig leven in de wereld'],['herders','Herders en leraren','Vaders van de Kerk'],['overige','Overige','Verschillende gedachtenissen']
  ];
  const dagenInMaand = maand ? new Date(Date.UTC(2024, maand, 0)).getUTCDate() : 0;

  // Resultaten verschijnen pas na een gekozen dag (of andere zoekopdracht). Bij alleen "Heiligen van de Lage Landen" staan ze onder dat blok.
  const filterActief = Boolean(zoek || maand || dag || categorie !== 'alle' || alleenNl);
  const toonResultaten = filterActief && !wachtOpDag;
  const alleenLageLanden = alleenNl && !zoek && !maand && !dag && categorie === 'alle';
  const resultatenBlok = (
    <section className="saints-results">
              <div className="saints-rule-title"><h2>{dag&&maand?`${dag} ${MAANDEN[maand-1]}`:alleenNl?'Heiligen van de Lage Landen':'Geselecteerde heiligen'}</h2><span>{resultaten.length} gedachtenissen</span></div>
              <div className="saints-results-list">{groepen.slice(0,alleenNl?groepen.length:12).map(([md,items])=><div key={md}><time>{formatMd(md)}</time><div>{items.map((h,i)=><button key={`${h.naam}-${i}`} onClick={()=>setGeselecteerde(h)}><span><strong>{h.naam}</strong>{h.titel&&<small>{h.titel}</small>}</span><b>→</b></button>)}</div></div>)}</div>
              {!groepen.length&&<p className="saints-empty">Geen heiligen gevonden voor deze selectie.</p>}
    </section>
  );

  return <>
    <section id="heiligen" className="saints-hero"><img loading="lazy" decoding="async" src="/images/heroes/hero-heiligen.webp" width={2103} height={748} alt="Heiligen — Orthodoxe Tijd" /></section>
    <main className="saints-refined">
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
            {heiligenVandaag[0] ? <>
              <button onClick={()=>setGeselecteerde(heiligenVandaag[0])} className="saints-feature-name">{heiligenVandaag[0].naam}</button>
              {heiligenVandaag[0].titel && <p className="saints-feature-title">{heiligenVandaag[0].titel}</p>}
              <p className="saints-feature-date">{formatMd(dagVandaag.kerkKey)}</p>
              <p>{heiligenVandaag[0].kort || 'Lees meer over het leven en de gedachtenis van deze heilige.'}</p>
              <div className="saints-feature-actions"><button onClick={()=>setGeselecteerde(heiligenVandaag[0])} className="saints-gold-button">Lees het leven →</button>{heiligenVandaag.length>1&&<button onClick={()=>setVandaagOpen(true)} className="saints-text-link">Bekijk alle {heiligenVandaag.length} heiligen →</button>}</div>
            </> : <p>Voor deze dag is nog geen heilige beschikbaar.</p>}
          </div>
          <blockquote className="saints-side-quote">“Het doel van ons leven is de vergoddelijking door genade.”<span>✣</span></blockquote>
        </section>

        <section className="saints-discover">
          <div className="saints-section-head"><h2>Ontdek alle heiligen</h2><p>Zoek op naam, maand of categorie en laat u inspireren door hun leven.</p></div>
          <div className="saints-search-row">
            <label><Search/><input value={zoek} onChange={e=>{setZoek(e.target.value);setWachtOpDag(false)}} placeholder="Zoek een heilige…" /></label>
            <div className="saints-select"><select value={maand ?? ''} onChange={e=>{setMaand(e.target.value?Number(e.target.value):null);setDag(null);setAlleenNl(false);setWachtOpDag(false)}}><option value="">Alle maanden</option>{MAANDEN.map((m,i)=><option key={m} value={i+1}>{hoofdletter(m)}</option>)}</select><ChevronDown/></div>
            <div className="saints-select"><select value={categorie} onChange={e=>{setCategorie(e.target.value);setWachtOpDag(false)}}><option value="alle">Alle categorieën</option>{categories.map(c=><option key={c[0]} value={c[0]}>{c[1]}</option>)}</select><ChevronDown/></div>
            <button className="saints-search-button">Zoeken →</button>
          </div>
        </section>

        <section className="saints-browser">
          <div className="saints-rule-title"><h2>Heiligen per maand</h2><span>5500+ heiligen</span></div>
          <div className="saints-month-grid">{MAANDEN.map((m,i)=><button key={m} onClick={()=>{setMaand(i+1);setDag(null);setZoek('');setAlleenNl(false);setWachtOpDag(true)}} className={maand===i+1?'active':''}>{hoofdletter(m)}</button>)}</div>
          {maand && <div className="saints-days-panel"><div><p className="saints-kicker">Kies een dag in {MAANDEN[maand-1]}</p><button onClick={()=>{setDag(null);setWachtOpDag(false)}} className={!dag&&!wachtOpDag?'active':''}>Alle dagen</button></div><div className="saints-days-grid">{Array.from({length:dagenInMaand},(_,i)=>i+1).map(n=><button key={n} onClick={()=>{setDag(n);setAlleenNl(false);setWachtOpDag(false)}} className={dag===n?'active':''}>{n}</button>)}</div></div>}
        </section>

        {toonResultaten && !alleenLageLanden && resultatenBlok}

        <section className="saints-categories">
          <div className="saints-rule-title"><h2>Heiligen naar categorie</h2></div>
          <div className="saints-category-grid">{categories.map(c=><button key={c[0]} onClick={()=>{setCategorie(c[0]);setWachtOpDag(false)}} className={categorie===c[0]?'active':''}><strong>{c[1]}</strong><span>{c[2]}</span><i>✣</i></button>)}</div>
        </section>

        <section className="saints-lowlands">
          <div className="saints-lowlands-map"><img loading="lazy" decoding="async" src="/images/decor/lage-landen.webp" alt="Kaart van de Lage Landen" /></div>
          <div><h2>Heiligen van de Lage Landen</h2><p>Ontdek de heiligen die verbonden zijn met de Nederlanden, België en omliggende gebieden.</p><p>Van Willibrord en Servatius tot Lambertus en Bavo — onze streken hebben een rijke geschiedenis van heilige mannen en vrouwen.</p><button onClick={()=>{const nieuw=!alleenNl;setAlleenNl(nieuw);setMaand(null);setDag(null);setCategorie('alle');setZoek('');setWachtOpDag(false)}} className={`saints-outline-button ${alleenNl?'active':''}`}>{alleenNl?'Deselecteer Heiligen van de Lage Landen ×':'Bekijk alle heiligen van de Lage Landen →'}</button></div>
          <blockquote>“Ook in onze streken heeft de Heer Zijn getuigen doen opstaan.”<span>✣</span></blockquote>
        </section>

        {toonResultaten && alleenLageLanden && resultatenBlok}

      </div>
    </main>
    <section className="saints-ending"><div className={CONTENT}><h2>Een wolk van getuigen</h2><p>“Daarom ook, nu wij zo’n grote wolk van getuigen om ons heen hebben…”</p><span>Hebreeën 12:1</span></div></section>
    <LiturgicalPopup open={vandaagOpen} onClose={()=>setVandaagOpen(false)} content={{title:`Heiligen van ${formatMd(dagVandaag.kerkKey)}`,subtitle:`${heiligenVandaag.length} gedachtenissen`,paragraphs:heiligenVandaag.map(h=>`${h.naam}${h.titel?` — ${h.titel}`:''}`)}}/>
    <LiturgicalPopup open={!!geselecteerde} onClose={()=>setGeselecteerde(null)} content={popupContent(geselecteerde)}/>
  </>;
}
