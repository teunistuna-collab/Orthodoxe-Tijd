import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useApp } from '../lib/context';
import type { Feest } from '../lib/feesten';
import { addDays, dagInfo, daysBetween, formatDag, formatLang, formatMd, hoofdletter, parseYmd, ymd } from '../lib/kalender';
import { FEEST_HEILIGENJAAR, GEKOPPELDE_FEESTTEKSTEN } from '../lib/feestHeiligenjaar';
import { useHeiligenjaarTekst } from '../lib/heiligenjaarTekst';
import { normaliseer } from '../lib/heiligenPopup';
import { Kop, Laag, Sierlijn } from './MobielLaag';
import { SIERKRUIS } from './symbolen';
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
const soortTekst = (f: Feest) => (f.soort === 'pascha' ? 'Feest der feesten' : f.groot ? 'Een van de twaalf grote feesten' : f.offset !== undefined ? 'Beweeglijk feest' : f.id.startsWith('hj-') ? 'Uit het Heiligenjaar' : 'Vaste gedachtenis');

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
const useOnderdeel = () => useSyncExternalStore(volgHash, () => decodeURIComponent(window.location.hash).match(/^#feesten\/(.+)$/)?.[1] ?? '');

function Beeld({ id }: { id: string }) {
  const src = icoonVan(id);
  return (
    <span className="hm-beeld" aria-hidden="true">
      {src ? <img src={src} alt="" loading="lazy" decoding="async" /> : <span className="hm-kader">{SIERKRUIS}</span>}
    </span>
  );
}

function Kaart({ f, onder, klein }: { f: Feest; onder: string; klein?: string }) {
  const t = titels(f);
  return (
    <li>
      <a className="hm-kaart fm-kaart" href={`#feesten/${f.id}`}>
        <Beeld id={f.id} />
        <span className="hm-tekst">
          <b>{t.titel}</b>
          <span>{onder}</span>
          {klein && <small>{klein}</small>}
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
      <Kop terug="#meer" merk />
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
            <span aria-live="polite">{hoofdletter(formatLang(dag))}</span>
            <CalendarDays aria-hidden="true" />
            <input type="date" aria-label="Kies een datum" value={ymd(dag)} onChange={(e) => e.target.value && setVerschuiving(daysBetween(vandaag, parseYmd(e.target.value)))} />
          </label>
          <button type="button" className="hm-stap" aria-label="Volgende dag" onClick={() => setVerschuiving(verschuiving + 1)}><ChevronRight aria-hidden="true" /></button>
        </div>
        {verschuiving !== 0 && <button type="button" className="hm-vandaag" onClick={() => setVerschuiving(0)}>Terug naar vandaag</button>}
        {vanDag.length ? (
          <ul className="hm-lijst">{vanDag.map((f) => <Kaart key={f.id} f={f} onder={soortTekst(f)} />)}</ul>
        ) : (
          <p className="vg-hl-leeg">Voor deze dag staat geen feest in de kalender.</p>
        )}

        <div className="hm-kop fm-kop">
          <h2 className="hm-label">De grote feesten</h2>
          <a href="#feesten/groot">Alle grote feesten <ChevronRight aria-hidden="true" /></a>
        </div>
        <ul className="hm-lijst">{voorproef.map(({ f, datum }) => <Kaart key={f.id} f={f} onder={titels(f).onder ?? soortTekst(f)} klein={formatDag(datum)} />)}</ul>

        <div className="hm-kop fm-kop">
          <h2 className="hm-label">Feesten door het jaar</h2>
          <a href="#kalender">Bekijk de kalender <ChevronRight aria-hidden="true" /></a>
        </div>
        <p className="fm-aantal">{alle.length} feesten en gedachtenissen; zoek hierboven op naam.</p>
      </div>
    </section>
  );
}

// 2. Zoekresultaten
function Zoeken({ alle, zoek, setZoek }: { alle: FeestItem[]; zoek: string; setZoek: (z: string) => void }) {
  const q = normaliseer(zoek.trim());
  const gevonden = q ? alle.filter(({ f }) => normaliseer(`${f.naam} ${f.kort ?? ''}`).includes(q)) : [];
  return (
    <Laag className="em-laag fm-laag" label="Zoek een feest">
      <Kop terug="#feesten" merk />
      <div className="fm-laag-papier">
        <Zoekveld zoek={zoek} setZoek={setZoek} autoFocus />
        {q && (
          <div className="hm-kop">
            <h2 className="hm-label">Zoekresultaten</h2>
            <span aria-live="polite">{gevonden.length === 1 ? '1 resultaat' : `${gevonden.length} resultaten`}</span>
          </div>
        )}
        {!q ? (
          <p className="vg-hl-leeg">Typ de naam van een feest, bijvoorbeeld Pascha, Theofanie of Nicolaas.</p>
        ) : gevonden.length === 0 ? (
          <p className="vg-hl-leeg">Geen feest gevonden voor “{zoek.trim()}”. Probeer een deel van de naam.</p>
        ) : (
          <ul className="hm-lijst">{gevonden.map(({ f, datum }) => <Kaart key={f.id} f={f} onder={titels(f).onder ?? soortTekst(f)} klein={`${soortTekst(f)} · ${formatDag(datum)}`} />)}</ul>
        )}
      </div>
    </Laag>
  );
}

// 3. De grote feesten
function Groot({ groot }: { groot: FeestItem[] }) {
  // In de volgorde van het kerkelijk jaar (vanaf 1 september): eerst Pascha, dan de vaste feesten op kerkelijke datum, de
  // beweeglijke met hun datum van dit jaar.
  return (
    <Laag className="em-laag fm-laag" label="De grote feesten">
      <Kop terug="#feesten" merk />
      <div className="fm-laag-papier">
        <h1 className="fm-titel" tabIndex={-1}>De grote feesten</h1>
        <p className="fm-onder">De belangrijkste feesten van het kerkelijk jaar</p>
        <Sierlijn />
        <ul className="hm-lijst">
          {groot.map(({ f, datum }) => (
            <Kaart key={f.id} f={f} onder={f.offset !== undefined ? `Beweeglijk · dit jaar ${formatDag(datum)}` : `${formatMd(f.md!)} (kerkelijk) · ${formatDag(datum)}`} />
          ))}
        </ul>
      </div>
    </Laag>
  );
}

// 4. Een feest
function Detail({ item }: { item: FeestItem }) {
  const { openDag, mode } = useApp();
  const { f, datum } = item;
  const t = titels(f);
  const hjId = FEEST_HEILIGENJAAR[f.id] ?? (f.id.startsWith('hj-') ? f.id : undefined);
  const hjTekst = useHeiligenjaarTekst(hjId);
  const icoon = icoonVan(f.id);
  const kerk = f.md && mode === 'oud' ? ` (Juliaans ${formatMd(f.md)})` : '';
  return (
    <Laag className="em-laag fm-laag fm-detail" label={t.titel}>
      <Kop terug="#feesten" merk />
      <div className={`fm-icoon${icoon ? '' : ' is-leeg'}`}>
        {icoon ? <img src={icoon} alt={`Icoon: ${t.titel}`} decoding="async" /> : <span className="hm-kader">{SIERKRUIS}</span>}
      </div>
      <div className="fm-laag-papier">
        <h1 className="fm-titel" tabIndex={-1}>{t.titel}</h1>
        {t.onder && <p className="fm-onder">{t.onder}</p>}
        <Sierlijn />
        <p className="fm-datum">
          <CalendarDays aria-hidden="true" />
          <span>
            {f.offset !== undefined
              ? `Herdenkingsdatum: wisselend (hangt af van Pascha); dit jaar ${formatLang(datum)}`
              : `Herdenkingsdatum: ${formatLang(datum)}${kerk}`}
          </span>
        </p>
        <h2 className="hm-label hm-lijnlabel">Betekenis</h2>
        {f.toelichting && <p className="fm-tekst">{f.toelichting}</p>}
        {hjId && (hjTekst ?? ['De tekst wordt geladen…']).map((p, i) => <p key={i} className="fm-tekst">{p}</p>)}
        {!f.toelichting && !hjId && <p className="fm-tekst fm-leeg">Voor dit feest is nog geen uitleg beschikbaar.</p>}
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
  const item = onderdeel && onderdeel !== 'zoek' && onderdeel !== 'groot' ? alle.find(({ f }) => f.id === onderdeel) : undefined;
  return (
    <>
      <Overzicht alle={alle} groot={groot} zoek={zoek} setZoek={setZoek} verschuiving={verschuiving} setVerschuiving={setVerschuiving} />
      {onderdeel === 'zoek' && <Zoeken alle={alle} zoek={zoek} setZoek={setZoek} />}
      {onderdeel === 'groot' && <Groot groot={groot} />}
      {item && <Detail item={item} />}
    </>
  );
}
