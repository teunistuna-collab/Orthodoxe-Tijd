import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useApp } from '../lib/context';
import type { Feest } from '../lib/feesten';
import { addDays, dagInfo, daysBetween, formatDag, formatLang, formatKerkLang, formatMd, hoofdletter, parseYmd, ymd } from '../lib/kalender';
import { FEEST_HEILIGENJAAR, GEKOPPELDE_FEESTTEKSTEN } from '../lib/feestHeiligenjaar';
import { useHeiligenjaarTekst } from '../lib/heiligenjaarTekst';
import { normaliseer } from '../lib/heiligenPopup';
import { Kop, Laag, Sierlijn } from './MobielLaag';
import './etmaal-mobiel.css';
import './heiligen-mobiel.css';
import './feesten-mobiel.css';

// Feesten op mobiel (mock-up 16_feesten), vier schermen met een eigen adres (de terugknop werkt):
// 1. #feesten: banner (het aangeleverde icoon van het Laatste Avondmaal), zoeken, de feesten van een gekozen dag, een
//    voorproef van de grote feesten en de link naar de Kalender; 2. #feesten/zoek: zoekresultaten tijdens het typen;
//    3. #feesten/groot: alle grote feesten; 4. #feesten/<id>: een feest met icoon, datum, betekenis en liturgie.
// Gegevens uit Feesten.tsx (alle feesten met hun eerstvolgende datum), lib/kalender.ts (de feesten van een dag) en het
// Heiligenjaar (teksten van gekoppelde feesten). Iconen: alleen bestaande, authentieke bestanden (public/images/feesten).

export type FeestItem = { f: Feest; datum: Date; dagen: number };

/** Het authentieke icoon per feest, waar dat er is; anders een rustig vlak met een kruis (geen vervangende voorstelling). */
const ICONEN: Record<string, string> = {
  pascha: 'pascha.webp',
  kerstmis: 'kerst.jpg',
  theofanie: 'theofanie.webp',
  palmzondag: 'palmzondag.webp',
  hemelvaart: 'hemelvaart.webp',
  'opdracht-moeder-gods': 'opdracht-moeder-gods.webp',
  kruisverheffing: 'kruisverering.webp',
  besnijdenis: 'besnijdenis.webp',
  'synaxis-johannes': 'synaxis-johannes.webp',
  nicolaas: 'nicolaas.webp',
  stefanus: 'stefanus.webp',
  'kinderen-bethlehem': 'kinderen-bethlehem.webp',
  'synaxis-moeder-gods': 'synaxis-moeder-gods.webp',
  filippus: 'filippus.webp',
  // Aangeleverd op 27-10-2026
  ontslaping: 'ontslaping.webp',
  'geboorte-moeder-gods': 'geboorte-moeder-gods.webp',
  ontmoeting: 'ontmoeting.webp',
  annunciatie: 'annunciatie.webp',
  transfiguratie: 'transfiguratie.webp',
  pinksteren: 'pinksteren.webp',
};
const icoonVan = (id: string) => (ICONEN[id] ? `/images/feesten/${ICONEN[id]}` : null);

/** Titel en ondertitel uit de bestaande naam: "Theofanie — Doop van de Heer in de Jordaan", "… (Palmzondag)". */
function titels(f: Feest): { titel: string; onder?: string } {
  if (f.id === 'pascha') return { titel: 'Pascha', onder: 'De Verrijzenis van onze Heer' };
  const [a, b] = f.naam.split(' — ');
  if (b) return { titel: a, onder: b };
  const haak = f.naam.match(/^(.*) \((.+)\)$/);
  if (haak) return { titel: haak[1], onder: haak[2] };
  return { titel: f.naam };
}
const soortTekst = (f: Feest) => (f.soort === 'pascha' ? 'Feest der feesten' : f.groot ? 'Een van de twaalf grote feesten' : f.offset !== undefined ? 'Beweeglijk feest' : f.id.startsWith('hj-') ? 'Uit het Heiligenjaar' : f.soort === 'feest' ? 'Vast feest' : 'Vaste gedachtenis');

// Gangbare Nederlandse namen, alleen om op te zoeken (geen tekst op de pagina)
const ANDERE_NAMEN: Record<string, string> = {
  pascha: 'Pasen Paaszondag Verrijzenis Opstanding',
  kerstmis: 'Kerst Kerstfeest',
  theofanie: 'Driekoningen Doop van de Heer Epifanie',
  ontmoeting: 'Lichtmis Maria-Lichtmis Opdracht van de Heer',
  annunciatie: 'Maria-Boodschap Verkondiging Aankondiging',
  transfiguratie: 'Gedaanteverandering',
  ontslaping: 'Maria-Hemelvaart Ontslapenis',
  hemelvaart: 'Hemelvaartsdag',
  pinksteren: 'Pinksteren Heilige Geest',
  palmzondag: 'Intocht in Jeruzalem',
  kruisverheffing: 'Kruisverheffing Heilig Kruis',
};
const zoektekst = (f: Feest) => normaliseer(`${f.naam} ${f.kort ?? ''} ${titels(f).onder ?? ''} ${ANDERE_NAMEN[f.id] ?? ''}`);
const metJaar = (d: Date, jaar: number) => (d.getUTCFullYear() === jaar ? formatDag(d) : `${formatDag(d)} ${d.getUTCFullYear()}`);

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
const useOnderdeel = () => useSyncExternalStore(volgHash, () => decodeURIComponent(window.location.hash).match(/^#feesten\/(.+)$/)?.[1] ?? '');

// Zonder icoon: het kruis van de site (ook in de webkop), op perkament
const KRUIS = () => <img className="fm-kruis" src="/images/ui/kruis.webp" alt="" width={218} height={256} decoding="async" />;

function Beeld({ id, direct }: { id: string; direct?: boolean }) {
  const src = icoonVan(id);
  return (
    <span className="hm-beeld" aria-hidden="true">
      {src ? <img src={src} alt="" loading={direct ? undefined : 'lazy'} decoding="async" /> : <span className="hm-kader"><KRUIS /></span>}
    </span>
  );
}

function Kaart({ f, onder, klein, direct }: { f: Feest; onder: string; klein?: string; direct?: boolean }) {
  const t = titels(f);
  return (
    <li>
      <a className="hm-kaart fm-kaart" href={`#feesten/${f.id}`}>
        <Beeld id={f.id} direct={direct} />
        <span className="hm-tekst">
          <b>{t.titel}</b>
          <span>{onder}</span>
          {klein && <span className="fm-klein-datum">{klein}</span>}
        </span>
        <ChevronRight className="hm-pijl" aria-hidden="true" />
      </a>
    </li>
  );
}

function Banner() {
  return (
    <div className="em-banner fm-banner">
      <img src="/images/feesten/laatste-avondmaal-banner.webp" alt="" width={500} height={231} decoding="async" />
      <Kop terug="#meer" merk slim />
      <div className="em-banner-tekst">
        <h1 className="em-titel">Feesten</h1>
        <Sierlijn />
        <p className="am-onder">De heilswerken van Christus</p>
      </div>
    </div>
  );
}

function Zoekveld({ zoek, setZoek, autoFocus }: { zoek: string; setZoek: (z: string) => void; autoFocus?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus({ preventScroll: true });
  }, [autoFocus]);
  return (
    <label className="vg-hl-zoek fm-zoek">
      <Search aria-hidden="true" />
      <span className="sr-only">Zoek een feest</span>
      <input
        ref={ref}
        type="search"
        value={zoek}
        placeholder="Zoek op naam van een feest…"
        autoComplete="off"
        onChange={(e) => {
          setZoek(e.target.value);
          if (e.target.value.trim() && !window.location.hash.startsWith('#feesten/zoek')) window.location.hash = '#feesten/zoek';
        }}
      />
      {zoek && (
        <button type="button" className="fm-wis" aria-label="Zoekopdracht wissen" onClick={() => { setZoek(''); ref.current?.focus(); }}>
          <X aria-hidden="true" />
        </button>
      )}
    </label>
  );
}

// 1. Overzicht
function Overzicht({ alle, groot, zoek, setZoek, verschuiving, setVerschuiving }: {
  alle: FeestItem[];
  groot: FeestItem[];
  zoek: string;
  setZoek: (z: string) => void;
  verschuiving: number;
  setVerschuiving: (v: number) => void;
}) {
  const { vandaag, mode, heiligen } = useApp();
  const dag = addDays(vandaag, verschuiving);
  const info = dagInfo(dag, mode);
  // De feesten van de dag: de kalender (vaste en beweeglijke feesten) en de feesten uit het Heiligenjaar die niet al bij een
  // feest van de site horen.
  const hj = (heiligen?.HEILIGEN[info.kerkKey] ?? []).filter((h) => h.type === 'feast' && !h.needsReview && !GEKOPPELDE_FEESTTEKSTEN.has(h.id));
  const vanDag: Feest[] = [...info.feesten, ...hj.map((h) => ({ id: h.id, naam: h.naam, soort: 'gedachtenis' as const, md: info.kerkKey, rang: 2 }))];
  // Voorproef: de eerstvolgende twee grote feesten
  const voorproef = [...groot].sort((a, b) => a.dagen - b.dagen).slice(0, 2);
  // Komende feesten (geen kleine gedachtenissen) en, op een dag zonder feest, het eerstvolgende
  const komend = alle.filter(({ f, dagen }) => dagen > 0 && f.soort !== 'gedachtenis').sort((a, b) => a.dagen - b.dagen).slice(0, 5);
  const volgend = vanDag.length ? null : [...alle].filter(({ datum }) => datum > dag).sort((a, b) => a.datum.getTime() - b.datum.getTime())[0];
  const jaar = vandaag.getUTCFullYear();
  return (
    <section id="feesten" className="am hm fm">
      <Banner />
      <div className="vg-papier hm-papier">
        <Zoekveld zoek={zoek} setZoek={setZoek} />
        <div className="hm-kop">
          <h2 className="hm-label">Feesten van de dag</h2>
          <span>Volgens de kerkelijke kalender</span>
        </div>
        <div className="hm-dagnav">
          <button type="button" className="hm-stap" aria-label="Vorige dag" onClick={() => setVerschuiving(verschuiving - 1)}><ChevronLeft aria-hidden="true" /></button>
          <label className="hm-datum">
            <span>{hoofdletter(formatLang(dag))}</span>
            <CalendarDays aria-hidden="true" />
            <input type="date" aria-label="Kies een datum" value={ymd(dag)} onChange={(e) => e.target.value && setVerschuiving(daysBetween(vandaag, parseYmd(e.target.value)))} />
          </label>
          <button type="button" className="hm-stap" aria-label="Volgende dag" onClick={() => setVerschuiving(verschuiving + 1)}><ChevronRight aria-hidden="true" /></button>
        </div>
        {/* Een schermlezer hoort de dag en hoeveel feesten er zijn */}
        <p className="sr-only" aria-live="polite">{verschuiving === 0 ? '' : `${hoofdletter(formatLang(dag))}: ${vanDag.length === 0 ? 'geen feest' : vanDag.length === 1 ? '1 feest' : `${vanDag.length} feesten`}`}</p>
        {verschuiving !== 0 && <button type="button" className="hm-vandaag" onClick={() => setVerschuiving(0)}>Terug naar vandaag</button>}
        {vanDag.length ? (
          <ul className="hm-lijst">{vanDag.map((f) => <Kaart key={f.id} f={f} onder={soortTekst(f)} direct />)}</ul>
        ) : (
          <>
            <p className="vg-hl-leeg">Voor deze dag staat geen feest in de kalender.</p>
            {volgend && <ul className="hm-lijst"><Kaart f={volgend.f} onder={`Eerstvolgend feest · ${metJaar(volgend.datum, jaar)}`} direct /></ul>}
          </>
        )}

        <div className="hm-kop fm-kop">
          <h2 className="hm-label">De grote feesten</h2>
          <a href="#feesten/groot">Alle grote feesten <ChevronRight aria-hidden="true" /></a>
        </div>
        <ul className="hm-lijst">{voorproef.map(({ f, datum }) => <Kaart key={f.id} f={f} onder={titels(f).onder ?? soortTekst(f)} klein={metJaar(datum, jaar)} direct />)}</ul>

        <div className="hm-kop fm-kop">
          <h2 className="hm-label">Komende feesten</h2>
          <a href="#kalender">Bekijk de kalender <ChevronRight aria-hidden="true" /></a>
        </div>
        <ul className="hm-lijst">{komend.map(({ f, datum }) => <Kaart key={f.id} f={f} onder={soortTekst(f)} klein={metJaar(datum, jaar)} />)}</ul>
      </div>
    </section>
  );
}

// 2. Zoekresultaten
function Zoeken({ alle, zoek, setZoek }: { alle: FeestItem[]; zoek: string; setZoek: (z: string) => void }) {
  const { vandaag } = useApp();
  const q = normaliseer(zoek.trim());
  const gevonden = q ? alle.filter(({ f }) => zoektekst(f).includes(q)) : [];
  const aantal = gevonden.length === 1 ? '1 resultaat' : `${gevonden.length} resultaten`;
  return (
    <Laag className="em-laag fm-laag" label="Zoek een feest">
      <Kop terug="#feesten" merk slim />
      <div className="fm-laag-papier">
        <h1 className="sr-only">Zoek een feest</h1>
        <Zoekveld zoek={zoek} setZoek={setZoek} autoFocus />
        {/* Altijd aanwezig, zodat het eerste aantal ook wordt voorgelezen */}
        <p className="sr-only" aria-live="polite">{q ? aantal : ''}</p>
        {q && (
          <div className="hm-kop">
            <h2 className="hm-label">Zoekresultaten</h2>
            <span>{aantal}</span>
          </div>
        )}
        {!q ? (
          <p className="vg-hl-leeg">Typ de naam van een feest, bijvoorbeeld Pascha, Theofanie of Nicolaas.</p>
        ) : gevonden.length === 0 ? (
          <div className="vg-hl-leeg fm-leegblok">
            <p>Geen feest gevonden voor “{zoek.trim()}”. Probeer een deel van de naam.</p>
            <a className="fm-actie" href="#feesten/groot">Bekijk de grote feesten</a>
          </div>
        ) : (
          <ul className="hm-lijst">{gevonden.map(({ f, datum }) => <Kaart key={f.id} f={f} onder={titels(f).onder ?? soortTekst(f)} klein={metJaar(datum, vandaag.getUTCFullYear())} />)}</ul>
        )}
      </div>
    </Laag>
  );
}

// 3. De grote feesten
function Groot({ groot }: { groot: FeestItem[] }) {
  const { vandaag, mode } = useApp();
  const jaar = vandaag.getUTCFullYear();
  // In de volgorde van het kerkelijk jaar (vanaf 1 september): eerst Pascha, dan de vaste feesten op kerkelijke datum, de
  // beweeglijke met hun datum van dit jaar.
  return (
    <Laag className="em-laag fm-laag" label="De grote feesten">
      <Kop terug="#feesten" merk slim />
      <div className="fm-laag-papier">
        <h1 className="fm-titel" tabIndex={-1}>De grote feesten</h1>
        <p className="fm-onder">De belangrijkste feesten van het kerkelijk jaar</p>
        <Sierlijn />
        <ul className="hm-lijst">
          {groot.map(({ f, datum }) => (
            <Kaart key={f.id} f={f} direct onder={f.offset !== undefined ? `Beweeglijk · ${metJaar(datum, jaar)}` : mode === 'oud' ? `${metJaar(datum, jaar)} · kerkelijk ${formatMd(f.md!)}` : metJaar(datum, jaar)} />
          ))}
        </ul>
      </div>
    </Laag>
  );
}

/** De tekst uit het Heiligenjaar; na een laadfout opnieuw te proberen (een nieuwe poging laadt de maand opnieuw). */
function HjTekst({ id }: { id: string }) {
  const [poging, setPoging] = useState(0);
  return <HjAlineas key={poging} id={id} opnieuw={() => setPoging((p) => p + 1)} />;
}
function HjAlineas({ id, opnieuw }: { id: string; opnieuw: () => void }) {
  const tekst = useHeiligenjaarTekst(id);
  if (!tekst) return <p className="fm-tekst fm-leeg" aria-busy="true">De tekst wordt geladen…</p>;
  const fout = tekst.length === 1 && tekst[0].startsWith('De tekst kon niet worden geladen');
  return (
    <>
      {tekst.map((p, i) => <p key={i} className={`fm-tekst${fout ? ' fm-leeg' : ''}`}>{p}</p>)}
      {fout && <button type="button" className="fm-actie" onClick={opnieuw}>Opnieuw proberen</button>}
    </>
  );
}

function Onbekend() {
  return (
    <Laag className="em-laag fm-laag" label="Feest niet gevonden">
      <Kop terug="#feesten" merk slim />
      <div className="fm-laag-papier">
        <h1 className="fm-titel" tabIndex={-1}>Feest niet gevonden</h1>
        <Sierlijn />
        <div className="vg-hl-leeg fm-leegblok">
          <p>Dit feest staat niet (meer) in de lijst.</p>
          <a className="fm-actie" href="#feesten/groot">Bekijk de grote feesten</a>
        </div>
      </div>
    </Laag>
  );
}

// 4. Een feest
function Detail({ item, terug }: { item: FeestItem; terug: string }) {
  const { openDag, mode } = useApp();
  const { f, datum } = item;
  const t = titels(f);
  const hjId = FEEST_HEILIGENJAAR[f.id] ?? (f.id.startsWith('hj-') ? f.id : undefined);
  const icoon = icoonVan(f.id);
  return (
    <Laag className="em-laag fm-laag fm-detail" label={t.titel}>
      <Kop terug={terug} merk slim />
      <div className={`fm-icoon${icoon ? '' : ' is-leeg'}`}>
        {icoon ? <img src={icoon} alt={`Icoon: ${t.titel}`} decoding="async" /> : <span className="hm-kader"><KRUIS /></span>}
      </div>
      <div className="fm-laag-papier">
        <h1 className="fm-titel" tabIndex={-1}>{t.titel}</h1>
        {t.onder && <p className="fm-onder">{t.onder}</p>}
        <p className="fm-soort">{soortTekst(f)}</p>
        <Sierlijn />
        <p className="fm-datum">
          <CalendarDays aria-hidden="true" />
          <span>
            {f.id === 'pascha'
              ? `Eerstvolgend: ${formatLang(datum)}`
              : f.offset !== undefined
                ? `Beweeglijk, met de datum van Pascha; eerstvolgend: ${formatLang(datum)}`
                : `Eerstvolgend: ${(f.md ? formatKerkLang(datum, mode) : formatLang(datum))}`}
          </span>
        </p>
        {/* De toelichting is de betekenis; de langere tekst uit het Heiligenjaar volgt apart na de liturgie */}
        <h2 className="hm-label hm-lijnlabel">Betekenis</h2>
        {f.toelichting ? <p className="fm-tekst">{f.toelichting}</p> : hjId ? <HjTekst id={hjId} /> : <p className="fm-tekst fm-leeg">Voor dit feest is nog geen uitleg beschikbaar.</p>}
        {(f.troparion || f.traditie) && (
          <>
            <h2 className="hm-label hm-lijnlabel">In de liturgie</h2>
            {f.troparion && (
              <>
                <p className="fm-klein">Troparion</p>
                <blockquote className="fm-troparion">{f.troparion}</blockquote>
              </>
            )}
            {f.traditie && <p className="fm-tekst"><b>Gebruiken:</b> {f.traditie}</p>}
          </>
        )}
        {f.toelichting && hjId && (
          <>
            <h2 className="hm-label hm-lijnlabel">Uit het Heiligenjaar</h2>
            <HjTekst id={hjId} />
          </>
        )}
        <div className="fm-links">
          {f.id === 'pascha' && <a className="gm-knop" href="#pascha">Naar de Paschacyclus <ChevronRight aria-hidden="true" /></a>}
          {f.id === 'kerstmis' && <a className="gm-knop" href="#geboorte">Naar de Geboortecyclus <ChevronRight aria-hidden="true" /></a>}
          <button type="button" className="gm-knop" onClick={() => openDag(ymd(datum))}>Bekijk deze dag in de kalender <ChevronRight aria-hidden="true" /></button>
        </div>
      </div>
    </Laag>
  );
}

export default function FeestenMobiel({ alle, groot }: { alle: FeestItem[]; groot: FeestItem[] }) {
  const onderdeel = useOnderdeel();
  // Zoekopdracht en gekozen dag blijven bewaard zolang de pagina open is (ook bij terugkeer uit een feest).
  const [zoek, setZoek] = useState('');
  const [verschuiving, setVerschuiving] = useState(0);
  const lijst = onderdeel === '' || onderdeel === 'zoek' || onderdeel === 'groot';
  const item = !lijst ? alle.find(({ f }) => f.id === onderdeel) : undefined;
  // Terug uit een feest gaat naar de lijst waar het feest geopend werd (overzicht, zoekresultaten of de grote feesten).
  const [herkomst, setHerkomst] = useState('');
  if (lijst && herkomst !== onderdeel) setHerkomst(onderdeel);
  return (
    <>
      <Overzicht alle={alle} groot={groot} zoek={zoek} setZoek={setZoek} verschuiving={verschuiving} setVerschuiving={setVerschuiving} />
      {/* De lijst blijft onder een geopend feest staan: terug kom je op dezelfde plek */}
      {(onderdeel === 'zoek' || (item && herkomst === 'zoek')) && <Zoeken alle={alle} zoek={zoek} setZoek={setZoek} />}
      {(onderdeel === 'groot' || (item && herkomst === 'groot')) && <Groot groot={groot} />}
      {item && <Detail key={item.f.id} item={item} terug={herkomst ? `#feesten/${herkomst}` : '#feesten'} />}
      {!lijst && !item && <Onbekend />}
    </>
  );
}
