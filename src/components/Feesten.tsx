import { useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useApp } from '../lib/context';
import { DERTIEN, OVERIGE_VASTE } from '../lib/feesten';
import { MAANDEN, daysBetween, formatDag, formatLang, formatMd, hoofdletter, kerkDatum, ymd } from '../lib/kalender';
import { volgendeFeestDatum } from '../lib/overzicht';
import { LiturgicalPopup } from './CycleSections';

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

export default function Feesten() {
  const { mode, vandaag, openDag } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  const [zoek, setZoek] = useState('');
  const [maand, setMaand] = useState<number | null>(vandaag.getUTCMonth());
  const [dag, setDag] = useState<number | null>(null);
  const [categorie, setCategorie] = useState<'alle'|'vast'|'beweeglijk'>('alle');

  const lijst = useMemo(() => DERTIEN.map(f => { const datum = volgendeFeestDatum(f,vandaag,mode); return {f,datum,dagen:daysBetween(vandaag,datum)}; }).sort((a,b)=>a.dagen-b.dagen), [vandaag,mode]);
  const eerstvolgende = lijst[0];
  const overige = useMemo(() => OVERIGE_VASTE.filter(f => (f.rang ?? 0) >= 3).map(f => { const datum=volgendeFeestDatum(f,vandaag,mode); return {f,datum,dagen:daysBetween(vandaag,datum)}; }).sort((a,b)=>a.dagen-b.dagen), [vandaag,mode]);
  const alleItems = useMemo(() => [...lijst,...overige], [lijst,overige]);
  const dagenInMaand = useMemo(() => maand===null ? [] : Array.from(new Set(alleItems.filter(x=>x.datum.getUTCMonth()===maand).map(x=>x.datum.getUTCDate()))).sort((a,b)=>a-b), [alleItems,maand]);
  const alle = useMemo(() => alleItems.filter(({f,datum}) => { const q=zoek.trim().toLowerCase(); if(q && !f.naam.toLowerCase().includes(q)) return false; if(categorie==='vast' && f.offset!==undefined) return false; if(categorie==='beweeglijk' && f.offset===undefined) return false; if(!q && maand!==null && datum.getUTCMonth()!==maand) return false; if(!q && dag!==null && datum.getUTCDate()!==dag) return false; return true; }), [alleItems,zoek,maand,dag,categorie]);
  const gekozen = open ? [...lijst,...overige].find(({f})=>f.id===open) : undefined;

  return <>
    <section id="feesten" className="bg-bark"><img src="/images/heroes/hero-feesten.png" width={2103} height={748} alt="Feesten — Orthodoxe Tijd" className="block h-auto w-full"/></section>
    <section className="feasts-page bg-parchment py-12 text-ink sm:py-16"><div className={CONTENT}>
      <div className="overflow-hidden border border-gold/45 bg-[#f7edda] shadow-[0_24px_55px_rgba(56,31,14,.16)]">
        <section className="grid border-b border-gold/30 lg:grid-cols-[.8fr_1.2fr]">
          <div className="bg-bark px-7 py-9 text-cream sm:px-10 sm:py-12"><p className="text-[10px] font-bold tracking-[.3em] text-gold-light uppercase">De feesten van de Kerk</p><h1 className="font-display mt-2 text-4xl text-gold-light sm:text-5xl">Licht in de tijd</h1><p className="mt-4 max-w-xl text-sm leading-7 text-[#d8c6a5]">Het kerkelijk jaar ontvouwt het leven van Christus en de Moeder Gods in vaste en beweeglijke feesten.</p></div>
          <div className="px-7 py-9 sm:px-10 sm:py-12"><p className="text-[10px] font-bold tracking-[.25em] text-gold-deep uppercase">Eerstvolgende grote feest</p>{eerstvolgende && <><h2 className="font-display mt-2 text-3xl text-wine-deep">{eerstvolgende.f.naam}</h2><p className="mt-2 text-sm text-ink-soft"><strong>{formatLang(eerstvolgende.datum)}</strong>{eerstvolgende.dagen===0?' · vandaag':` · over ${eerstvolgende.dagen} dagen`}</p><p className="mt-4 max-w-2xl text-sm leading-6 text-ink-soft">{eerstvolgende.f.toelichting}</p><button onClick={()=>setOpen(eerstvolgende.f.id)} className="btn-pill mt-5">Lees meer →</button></>}</div>
        </section>

        <section className="border-b border-gold/30 px-6 py-9 sm:px-10 sm:py-12"><div className="text-center"><p className="text-[10px] font-bold tracking-[.3em] text-gold-deep uppercase">Pascha en de twaalf grote feesten</p><h2 className="font-display mt-2 text-4xl text-ink">De grote feesten</h2></div><div className="mt-8 grid gap-px overflow-hidden border border-gold/30 bg-gold/30 md:grid-cols-2 xl:grid-cols-3">{DERTIEN.map(f => { const item=lijst.find(x=>x.f.id===f.id)!; return <button key={f.id} onClick={()=>setOpen(f.id)} className="ornate-card feast-tile group flex flex-col items-center text-center"><span className="ornate-medallion feast-medallion">✣</span><span className="ornate-side-ornaments" aria-hidden="true">❦ <b>✣</b> ❦</span><span className="feast-meta">{f.offset!==undefined?'Beweeglijk':`Vast · ${formatMd(f.md!)}`}</span><h3>{f.naam}</h3><p>{formatLang(item.datum)}</p><span className="ornate-action">Lees meer →</span></button>})}</div></section>

        <section className="grid border-b border-gold/30 lg:grid-cols-2"><div className="px-7 py-9 sm:px-10 lg:border-r lg:border-gold/30"><p className="text-[10px] font-bold tracking-[.28em] text-gold-deep uppercase">Één jaar — twee ritmes</p><h3 className="font-display mt-2 text-3xl">Vaste feesten</h3><p className="mt-3 text-sm leading-6 text-ink-soft">Deze gedachtenissen keren ieder kerkelijk jaar terug op dezelfde kerkelijke datum en worden door de jaarcyclus gedragen.</p><a href="#jaar" className="btn-pill mt-5">Ontdek de jaarcyclus →</a></div><div className="bg-[#efe3cb]/55 px-7 py-9 sm:px-10"><p className="text-[10px] font-bold tracking-[.28em] text-gold-deep uppercase">Rond Pascha</p><h3 className="font-display mt-2 text-3xl">Beweeglijke feesten</h3><p className="mt-3 text-sm leading-6 text-ink-soft">De datum van Pascha bepaalt onder meer de Grote Week, Hemelvaart en Pinksteren. Deze data komen uit dezelfde centrale Pascha-berekening als de kalender.</p><a href="#pascha" className="btn-pill mt-5">Ontdek de Paschacyclus →</a></div></section>

        <section className="feast-discover px-6 py-9 sm:px-10 sm:py-12">
          <div><p className="text-[10px] font-bold tracking-[.28em] text-gold-deep uppercase">Door het kerkelijk jaar</p><h2 className="font-display mt-1 text-4xl">Ontdek alle feesten</h2><p className="mt-2 text-sm text-ink-soft">Zoek op naam, maand of soort en kies daarna desgewenst een dag.</p></div>
          <div className="saints-search-row">
            <label><Search/><input value={zoek} onChange={e=>{setZoek(e.target.value);setDag(null)}} placeholder="Zoek een feest…" /></label>
            <div className="saints-select"><select value={maand===null?'':maand} onChange={e=>{setMaand(e.target.value===''?null:Number(e.target.value));setDag(null)}}><option value="">Alle maanden</option>{MAANDEN.map((m,i)=><option key={m} value={i}>{hoofdletter(m)}</option>)}</select><ChevronDown/></div>
            <div className="saints-select"><select value={categorie} onChange={e=>setCategorie(e.target.value as 'alle'|'vast'|'beweeglijk')}><option value="alle">Alle categorieën</option><option value="vast">Vaste feesten</option><option value="beweeglijk">Beweeglijke feesten</option></select><ChevronDown/></div>
            <button type="button" className="saints-search-button">Zoeken →</button>
          </div>
          <div className="saints-rule-title mt-8"><h2>Feesten per maand</h2><span>{alleItems.length}+ feesten</span></div>
          <div className="feast-month-grid mt-4">{MAANDEN.map((m,i)=><button key={m} onClick={()=>{setMaand(i);setDag(null);setZoek('')}} className={maand===i?'active':''}>{m}</button>)}</div>
          {maand!==null && <><div className="saints-rule-title mt-8"><h2>Kies een dag in {MAANDEN[maand]}</h2><span>{dagenInMaand.length} dagen met feesten</span></div><div className="feast-day-grid mt-4">{dagenInMaand.map(d=><button key={d} onClick={()=>setDag(d)} className={dag===d?'active':''}>{d}</button>)}</div></>}
          <div className="saints-rule-title mt-8"><h2>{dag!==null&&maand!==null?`${dag} ${MAANDEN[maand]}`:'Geselecteerde feesten'}</h2><span>{alle.length} resultaten</span></div>
          <div className="mt-4 space-y-1">{alle.slice(0,30).map(({f,datum,dagen})=><button key={`${f.id}-${datum.toISOString()}`} onClick={()=>setOpen(f.id)} className="group grid w-full border-t border-gold/25 py-4 text-left sm:grid-cols-[120px_1fr_auto] sm:items-center sm:gap-5"><span className="text-[10px] font-bold tracking-[.15em] text-gold-deep uppercase">{MAANDEN[datum.getUTCMonth()]} {datum.getUTCDate()}</span><span><span className="font-display block text-xl group-hover:text-wine">{f.naam}</span><span className="text-xs text-ink-mute">{f.offset!==undefined?'beweeglijk feest':'vaste gedachtenis'}{mode==='oud'&&f.md?` · kerkelijk ${formatDag(kerkDatum(datum,mode))}`:''}</span></span><span className="btn-pill mt-2 sm:mt-0">{dagen===0?'Vandaag':'Open →'}</span></button>)}</div>
        </section>
      </div>
    </div></section>
    <section className="bg-bark py-12 text-cream"><div className={CONTENT}><div className="mx-auto max-w-3xl text-center"><p className="text-[10px] font-bold tracking-[.3em] text-gold-light uppercase">De tijd wordt geheiligd</p><p className="font-display mt-3 text-2xl italic text-[#e7d8ba]">In de feesten wordt niet alleen herinnerd wat geweest is: de Kerk treedt binnen in het heil dat Christus schenkt.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><a href="#kalender" className="btn-pill">Bekijk de kalender →</a><a href="#pascha" className="btn-pill">Ontdek Pascha →</a></div></div></div></section>
    <LiturgicalPopup open={!!gekozen} onClose={()=>setOpen(null)} content={gekozen ? {title:gekozen.f.naam, subtitle:formatLang(gekozen.datum), highlight:gekozen.f.troparion, paragraphs:[gekozen.f.toelichting, ...(gekozen.f.traditie?[`Gebruiken: ${gekozen.f.traditie}`]:[])].filter((p): p is string => Boolean(p))}:null}/>
  </>;
}
