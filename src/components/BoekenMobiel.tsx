import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { BookOpen, Bookmark, ChevronRight, ExternalLink, Search, X } from 'lucide-react';
import { AANBEVOLEN, FILTERS, OMSLAGEN_AAN, laadBoeken, onderwerpen, tijdelijkeOmslag, veiligeLink, zoekBoeken, type Boek } from '../lib/boeken';
import { useFavorieten, wisselFavoriet } from '../lib/favorieten';
import { Kop, Laag, Sierlijn } from './MobielLaag';
import './etmaal-mobiel.css';
import './heiligen-mobiel.css';
import './feesten-mobiel.css';
import './meer-mobiel.css';
import './instellingen-mobiel.css';
import './boeken-mobiel.css';

// De boekenbibliotheek op mobiel (mock-up boeken), met een eigen adres per scherm: #boeken (overzicht met zoeken,
// filters en aanbevolen boeken), #boeken/alle (de hele catalogus), #boeken/lijst (Mijn boekenlijst) en #boeken/<slug>
// (een boek). Gegevens: lib/boeken.ts. Bewaren: dezelfde favorieten als psalmen en gebeden (lib/favorieten.ts, op dit
// toestel), met de sleutel "boeken/<slug>". Omslagen: voorlopig een vaste plek in perkament (Omslag), zie OMSLAGEN_AAN.

const pad = (b: Boek) => `boeken/${b.slug}`;

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
const useOnderdeel = () => useSyncExternalStore(volgHash, () => decodeURIComponent(window.location.hash).match(/^#boeken\/(.+)$/)?.[1] ?? '');

/** De omslag in vaste verhouding 2 : 3. Zolang de echte omslagen uit staan: de tijdelijke afbeelding van de categorie
 *  (lib/boeken.ts), anders een rustig perkamentvlak met een boeksymbool. */
function Omslag({ boek, groot, direct }: { boek: Boek; groot?: boolean; direct?: boolean }) {
  const echt = OMSLAGEN_AAN && boek.omslag;
  const src = echt ? boek.omslag : tijdelijkeOmslag(boek);
  return (
    <span className={`bkm-omslag${groot ? ' is-groot' : ''}${src && !echt ? ' is-tijdelijk' : ''}`} aria-hidden="true">
      {src ? <img src={src} alt="" loading={direct ? undefined : 'lazy'} decoding="async" /> : <BookOpen strokeWidth={1.1} />}
    </span>
  );
}

// Het label: de gekozen categorie als het boek daarin valt, anders de eerste
const labelVan = (boek: Boek, filter?: string) => {
  const cat = FILTERS.find((f) => f.id === filter)?.categorie;
  return cat && boek.categorieen.includes(cat) ? cat : onderwerpen(boek)[0];
};

function Kaart({ boek }: { boek: Boek }) {
  const label = labelVan(boek);
  return (
    <li>
      <a className="bkm-kaart" href={`#${pad(boek)}`}>
        <Omslag boek={boek} direct />
        <span className="bkm-kaart-tekst">
          <b>{boek.titel}</b>
          <span className="bkm-auteur">{boek.auteur}</span>
          {label && <span className="bkm-label">{label}</span>}
        </span>
      </a>
    </li>
  );
}

function Rij({ boek, filter }: { boek: Boek; filter?: string }) {
  const label = labelVan(boek, filter);
  return (
    <li>
      <a className="bkm-rij" href={`#${pad(boek)}`}>
        <Omslag boek={boek} />
        <span className="bkm-rij-tekst">
          <b>{boek.titel}</b>
          <span className="bkm-auteur">{boek.auteur}</span>
          <span className="bkm-samenvatting">{boek.samenvatting}</span>
          {label && <span className="bkm-label">{label}</span>}
        </span>
        <ChevronRight className="hm-pijl" aria-hidden="true" />
      </a>
    </li>
  );
}

// De eerste knop toont op het overzicht de aanbevolen boeken, in de bibliotheek alle boeken
function Filters({ filter, setFilter, eerste }: { filter: string; setFilter: (f: string) => void; eerste: string }) {
  return (
    <div className="bkm-filters" role="group" aria-label="Categorie">
      {FILTERS.map((f) => (
        <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.id === 'alle' ? eerste : f.label}</button>
      ))}
    </div>
  );
}
const aantal = (n: number) => (n === 1 ? '1 boek' : `${n} boeken`);

function Zoekveld({ zoek, setZoek }: { zoek: string; setZoek: (z: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <label className="vg-hl-zoek fm-zoek">
      <Search aria-hidden="true" />
      <span className="sr-only">Zoek een boek</span>
      <input ref={ref} type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek een boek…" autoComplete="off" />
      {zoek && (
        <button
          type="button"
          className="fm-wis"
          aria-label="Zoekopdracht wissen"
          onClick={() => {
            setZoek('');
            ref.current?.focus();
          }}
        >
          <X aria-hidden="true" />
        </button>
      )}
    </label>
  );
}

// 1. Overzicht
function Overzicht({ boeken, fout, opnieuw, lijst, zoek, setZoek, filter, setFilter }: { boeken: Boek[] | null; fout: boolean; opnieuw: () => void; lijst: number; zoek: string; setZoek: (z: string) => void; filter: string; setFilter: (f: string) => void }) {
  const wis = () => {
    setZoek('');
    setFilter('alle');
  };
  const gefilterd = boeken && (zoek.trim() || filter !== 'alle') ? zoekBoeken(boeken, zoek, filter) : null;
  const aanbevolen = (boeken ?? []).filter((b) => AANBEVOLEN.includes(b.slug)).sort((a, b) => AANBEVOLEN.indexOf(a.slug) - AANBEVOLEN.indexOf(b.slug));
  return (
    <section id="boeken" className="am hm bkm">
      <div className="em-banner bkm-banner">
        <img src="/images/boeken/boeken-banner.webp" alt="" width={1280} height={720} decoding="async" />
        <Kop terug="#meer" merk slim />
        <div className="em-banner-tekst">
          <h1 className="em-titel">Boeken</h1>
          <Sierlijn />
          <p className="am-onder">Een kleine orthodoxe bibliotheek</p>
        </div>
      </div>
      <div className="vg-papier hm-papier">
        <Zoekveld zoek={zoek} setZoek={setZoek} />
        <Filters filter={filter} setFilter={setFilter} eerste="Aanbevolen" />
        {/* Een schermlezer hoort alleen het aantal, niet de hele lijst */}
        <p className="sr-only" aria-live="polite">{gefilterd ? aantal(gefilterd.length) : ''}</p>
        {!boeken ? (
          <Laden fout={fout} opnieuw={opnieuw} />
        ) : gefilterd ? (
          <section aria-label="Gevonden boeken">
            <div className="hm-kop">
              <h2 className="hm-label">{zoek.trim() ? 'Gevonden' : FILTERS.find((f) => f.id === filter)?.label}</h2>
              <span>{aantal(gefilterd.length)}</span>
            </div>
            {gefilterd.length ? <ul className="bkm-lijst">{gefilterd.map((b) => <Rij key={b.slug} boek={b} filter={filter} />)}</ul> : <GeenResultaat filter={filter} wis={wis} />}
          </section>
        ) : (
          <>
            <div className="hm-kop fm-kop">
              <h2 className="hm-label">Aanbevolen boeken</h2>
              <a href="#boeken/alle">Alles bekijken <ChevronRight aria-hidden="true" /></a>
            </div>
            <ul className="bkm-raster">{aanbevolen.map((b) => <Kaart key={b.slug} boek={b} />)}</ul>
          </>
        )}
        {/* De ingangen blijven, ook tijdens zoeken of filteren */}
        {boeken && (
            <ul className="bkm-ingangen">
              <li>
                <a className="mm-kaart bkm-ingang" href="#boeken/alle">
                  <span className="mm-tekst"><b>De hele bibliotheek</b><span>{boeken.length} boeken</span></span>
                  <ChevronRight className="mm-pijl" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a className="mm-kaart bkm-ingang" href="#boeken/lijst">
                  <span className="mm-tekst"><b>Mijn boekenlijst</b><span>{lijst === 0 ? 'Nog geen boeken bewaard' : `${aantal(lijst)} bewaard`}</span></span>
                  <ChevronRight className="mm-pijl" aria-hidden="true" />
                </a>
              </li>
            </ul>
        )}
      </div>
    </section>
  );
}

function Laden({ fout, opnieuw }: { fout: boolean; opnieuw: () => void }) {
  return fout ? (
    <div className="vg-hl-leeg bkm-leeg">
      <p>De boeken konden niet worden geladen.</p>
      <button type="button" className="bkm-actie" onClick={opnieuw}>Opnieuw proberen</button>
    </div>
  ) : (
    <p className="vg-hl-leeg">De boeken worden geladen…</p>
  );
}

function GeenResultaat({ filter, wis }: { filter: string; wis: () => void }) {
  return (
    <div className="vg-hl-leeg bkm-leeg">
      <p>Geen boek gevonden. Probeer een ander woord{filter !== 'alle' ? ' of een andere categorie' : ''}.</p>
      <button type="button" className="bkm-actie" onClick={wis}>Wis zoekopdracht</button>
    </div>
  );
}

// 2. De hele bibliotheek (met zoeken en categorieën), of Mijn boekenlijst
function Lijst({ titel, onder, boeken, leeg, zoeken }: { titel: string; onder: string; boeken: Boek[]; leeg: ReactNode; zoeken?: { zoek: string; setZoek: (z: string) => void; filter: string; setFilter: (f: string) => void } }) {
  const getoond = zoeken ? zoekBoeken(boeken, zoeken.zoek, zoeken.filter) : boeken;
  const gefilterd = !!zoeken && (zoeken.zoek.trim() !== '' || zoeken.filter !== 'alle');
  return (
    <Laag className="em-laag fm-laag bkm-laag" label={titel}>
      <Kop terug="#boeken" merk slim />
      <div className="fm-laag-papier">
        <h1 className="fm-titel" tabIndex={-1}>{titel}</h1>
        <p className="fm-onder">{gefilterd ? `${aantal(getoond.length)} van ${boeken.length}` : onder}</p>
        <Sierlijn />
        {zoeken && (
          <>
            <Zoekveld zoek={zoeken.zoek} setZoek={zoeken.setZoek} />
            <Filters filter={zoeken.filter} setFilter={zoeken.setFilter} eerste="Alle" />
            <p className="sr-only" aria-live="polite">{gefilterd ? aantal(getoond.length) : ''}</p>
          </>
        )}
        {getoond.length ? (
          <ul className="bkm-lijst">{getoond.map((b) => <Rij key={b.slug} boek={b} filter={zoeken?.filter} />)}</ul>
        ) : zoeken ? (
          <GeenResultaat filter={zoeken.filter} wis={() => { zoeken.setZoek(''); zoeken.setFilter('alle'); }} />
        ) : (
          <div className="vg-hl-leeg bkm-leeg">{leeg}</div>
        )}
      </div>
    </Laag>
  );
}

// 3. Een boek
function Detail({ boek, terug }: { boek: Boek; terug: string }) {
  const bewaard = useFavorieten().includes(pad(boek));
  const link = veiligeLink(boek);
  const cats = onderwerpen(boek);
  // Titel, auteur en onderwerp, dan meteen de inhoud; daarna bewaren en de winkel
  return (
    <Laag className="em-laag fm-laag bkm-laag bkm-detail" label={boek.titel}>
      <Kop terug={terug} merk slim />
      <div className="bkm-detail-beeld">
        <Omslag boek={boek} groot direct />
      </div>
      <div className="fm-laag-papier">
        <h1 className="bkm-titel" tabIndex={-1}>{boek.titel}</h1>
        <p className="bkm-door">{boek.auteur}</p>
        {cats.length > 0 && <p className="bkm-labels">{cats.map((c) => <span key={c} className="bkm-label">{c}</span>)}</p>}
        <Sierlijn />
        <h2 className="bkm-sectie">Over dit boek</h2>
        <p className="fm-tekst">{boek.samenvatting}</p>
        <button type="button" className={`bkm-bewaar${bewaard ? ' is-bewaard' : ''}`} aria-pressed={bewaard} aria-label="Bewaar in mijn boekenlijst" onClick={() => wisselFavoriet(pad(boek))}>
          <Bookmark aria-hidden="true" /> {bewaard ? 'Bewaard in mijn boekenlijst' : 'Bewaar in mijn boekenlijst'}
        </button>
        {bewaard && <a className="bkm-naar-lijst" href="#boeken/lijst">Naar mijn boekenlijst <ChevronRight aria-hidden="true" /></a>}
        {link && (
          <>
            <a className="ism-opslaan bkm-extern" href={link.url} target="_blank" rel="noopener noreferrer" aria-describedby="bkm-extern-uitleg">
              <ExternalLink aria-hidden="true" /> {link.knop}
            </a>
            <p id="bkm-extern-uitleg" className="ism-klein ism-midden">Je verlaat Orthodoxe Tijd en gaat naar de website van {link.naam} (opent in een nieuw venster).</p>
          </>
        )}
      </div>
    </Laag>
  );
}

function Onbekend() {
  return (
    <Laag className="em-laag fm-laag bkm-laag" label="Boek niet gevonden">
      <Kop terug="#boeken" merk slim />
      <div className="fm-laag-papier">
        <h1 className="fm-titel" tabIndex={-1}>Boek niet gevonden</h1>
        <Sierlijn />
        <div className="vg-hl-leeg bkm-leeg">
          <p>Dit boek staat niet (meer) in de bibliotheek.</p>
          <a className="bkm-actie" href="#boeken/alle">Naar de hele bibliotheek</a>
        </div>
      </div>
    </Laag>
  );
}

export default function BoekenMobiel() {
  const onderdeel = useOnderdeel();
  const favorieten = useFavorieten();
  const [boeken, setBoeken] = useState<Boek[] | null>(null);
  const [fout, setFout] = useState(false);
  useEffect(() => {
    laadBoeken().then(setBoeken, () => setFout(true));
  }, []);
  // Na een laadfout opnieuw proberen (laadBoeken begint dan opnieuw)
  const laad = useCallback(() => {
    setFout(false);
    laadBoeken().then(setBoeken, () => setFout(true));
  }, []);
  // Zoekopdracht en filter blijven staan als je een boek opent en terugkomt; Terug uit een boek gaat naar waar je vandaan kwam.
  const [zoek, setZoek] = useState('');
  const [filter, setFilter] = useState('alle');
  const [herkomst, setHerkomst] = useState('');
  const lijstScherm = onderdeel === '' || onderdeel === 'alle' || onderdeel === 'lijst';
  if (lijstScherm && herkomst !== onderdeel) setHerkomst(onderdeel);
  const boek = !lijstScherm ? boeken?.find((b) => b.slug === onderdeel) : undefined;
  const bewaard = (boeken ?? []).filter((b) => favorieten.includes(pad(b)));
  return (
    <>
      <Overzicht boeken={boeken} fout={fout} opnieuw={laad} lijst={bewaard.length} zoek={zoek} setZoek={setZoek} filter={filter} setFilter={setFilter} />
      {/* De lijst blijft onder een geopend boek staan: terug kom je op dezelfde plek */}
      {(onderdeel === 'alle' || (boek && herkomst === 'alle')) && boeken && <Lijst titel="De hele bibliotheek" onder={`${boeken.length} Nederlandstalige boeken`} boeken={boeken} leeg="Geen boeken." zoeken={{ zoek, setZoek, filter, setFilter }} />}
      {(onderdeel === 'lijst' || (boek && herkomst === 'lijst')) && boeken && (
        <Lijst
          titel="Mijn boekenlijst"
          onder={bewaard.length ? `${aantal(bewaard.length)}, bewaard op dit apparaat` : 'Bewaard op dit apparaat'}
          boeken={bewaard}
          leeg={
            <>
              <p>Je hebt nog geen boeken bewaard. Open een boek en tik op ‘Bewaar in mijn boekenlijst’.</p>
              <a className="bkm-actie" href="#boeken/alle">Naar de hele bibliotheek</a>
            </>
          }
        />
      )}
      {boek && <Detail boek={boek} terug={herkomst ? `#boeken/${herkomst}` : '#boeken'} />}
      {!lijstScherm && boeken && !boek && <Onbekend />}
    </>
  );
}
