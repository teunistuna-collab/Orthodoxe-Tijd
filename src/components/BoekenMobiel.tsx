import { useEffect, useState, useSyncExternalStore } from 'react';
import { BookOpen, Bookmark, ChevronRight, ExternalLink, Search, User, X } from 'lucide-react';
import { AANBEVOLEN, FILTERS, OMSLAGEN_AAN, laadBoeken, onderwerpen, veiligeLink, zoekBoeken, type Boek } from '../lib/boeken';
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

/** De omslag in vaste verhouding 2 : 3; zolang de omslagen uit staan een rustig perkamentvlak met een boeksymbool. */
function Omslag({ boek, groot }: { boek: Boek; groot?: boolean }) {
  return (
    <span className={`bkm-omslag${groot ? ' is-groot' : ''}`} aria-hidden="true">
      {OMSLAGEN_AAN && boek.omslag ? <img src={boek.omslag} alt="" loading="lazy" decoding="async" /> : <BookOpen strokeWidth={1.1} />}
    </span>
  );
}

function Kaart({ boek }: { boek: Boek }) {
  const label = onderwerpen(boek)[0];
  return (
    <li>
      <a className="bkm-kaart" href={`#${pad(boek)}`}>
        <Omslag boek={boek} />
        <span className="bkm-kaart-tekst">
          <b>{boek.titel}</b>
          <span className="bkm-auteur">{boek.auteur}</span>
          {label && <span className="bkm-label">{label}</span>}
        </span>
      </a>
    </li>
  );
}

function Rij({ boek }: { boek: Boek }) {
  const label = onderwerpen(boek)[0];
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

function Filters({ filter, setFilter }: { filter: string; setFilter: (f: string) => void }) {
  return (
    <div className="bkm-filters" role="group" aria-label="Categorie">
      {FILTERS.map((f) => (
        <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
      ))}
    </div>
  );
}

function Zoekveld({ zoek, setZoek }: { zoek: string; setZoek: (z: string) => void }) {
  return (
    <label className="vg-hl-zoek fm-zoek">
      <Search aria-hidden="true" />
      <span className="sr-only">Zoek een boek</span>
      <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek een boek…" autoComplete="off" />
      {zoek && (
        <button type="button" className="fm-wis" aria-label="Zoekopdracht wissen" onClick={() => setZoek('')}>
          <X aria-hidden="true" />
        </button>
      )}
    </label>
  );
}

// 1. Overzicht
function Overzicht({ boeken, fout, zoek, setZoek, filter, setFilter }: { boeken: Boek[] | null; fout: boolean; zoek: string; setZoek: (z: string) => void; filter: string; setFilter: (f: string) => void }) {
  const lijst = useFavorieten().filter((f) => f.startsWith('boeken/')).length;
  const gefilterd = boeken && (zoek.trim() || filter !== 'alle') ? zoekBoeken(boeken, zoek, filter) : null;
  const aanbevolen = (boeken ?? []).filter((b) => AANBEVOLEN.includes(b.slug)).sort((a, b) => AANBEVOLEN.indexOf(a.slug) - AANBEVOLEN.indexOf(b.slug));
  return (
    <section id="boeken" className="am hm bkm">
      <div className="em-banner bkm-banner">
        <img src="/images/ontwerp/instellingen-banner.webp" alt="" width={1024} height={420} decoding="async" />
        <Kop terug="#meer" merk />
        <div className="em-banner-tekst">
          <h1 className="em-titel">Boeken</h1>
          <Sierlijn />
          <p className="am-onder">Een kleine orthodoxe bibliotheek</p>
        </div>
      </div>
      <div className="vg-papier hm-papier">
        <Zoekveld zoek={zoek} setZoek={setZoek} />
        <Filters filter={filter} setFilter={setFilter} />
        {!boeken ? (
          <p className="vg-hl-leeg">{fout ? 'De boeken konden niet worden geladen.' : 'De boeken worden geladen…'}</p>
        ) : gefilterd ? (
          <section aria-live="polite" aria-label="Gevonden boeken">
            <div className="hm-kop">
              <h2 className="hm-label">Gevonden</h2>
              <span>{gefilterd.length === 1 ? '1 boek' : `${gefilterd.length} boeken`}</span>
            </div>
            {gefilterd.length ? <ul className="bkm-lijst">{gefilterd.map((b) => <Rij key={b.slug} boek={b} />)}</ul> : <p className="vg-hl-leeg">Geen boek gevonden. Probeer een ander woord of een andere categorie.</p>}
          </section>
        ) : (
          <>
            <div className="hm-kop fm-kop">
              <h2 className="hm-label">Aanbevolen boeken</h2>
              <a href="#boeken/alle">Alles bekijken <ChevronRight aria-hidden="true" /></a>
            </div>
            <ul className="bkm-raster">{aanbevolen.map((b) => <Kaart key={b.slug} boek={b} />)}</ul>
            <ul className="bkm-ingangen">
              <li>
                <a className="mm-kaart bkm-ingang" href="#boeken/alle">
                  <span className="mm-tekst"><b>De hele bibliotheek</b><span>{boeken.length} boeken</span></span>
                  <ChevronRight className="mm-pijl" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a className="mm-kaart bkm-ingang" href="#boeken/lijst">
                  <span className="mm-tekst"><b>Mijn boekenlijst</b><span>{lijst === 0 ? 'Nog geen boeken bewaard' : lijst === 1 ? '1 boek bewaard' : `${lijst} boeken bewaard`}</span></span>
                  <ChevronRight className="mm-pijl" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

// 2. De hele bibliotheek, of Mijn boekenlijst
function Lijst({ titel, onder, boeken, leeg }: { titel: string; onder: string; boeken: Boek[]; leeg: string }) {
  return (
    <Laag className="em-laag fm-laag bkm-laag" label={titel}>
      <Kop terug="#boeken" merk />
      <div className="fm-laag-papier">
        <h1 className="fm-titel" tabIndex={-1}>{titel}</h1>
        <p className="fm-onder">{onder}</p>
        <Sierlijn />
        {boeken.length ? <ul className="bkm-lijst">{boeken.map((b) => <Rij key={b.slug} boek={b} />)}</ul> : <p className="vg-hl-leeg">{leeg}</p>}
      </div>
    </Laag>
  );
}

// 3. Een boek
function Detail({ boek, terug }: { boek: Boek; terug: string }) {
  const bewaard = useFavorieten().includes(pad(boek));
  const link = veiligeLink(boek);
  const cats = onderwerpen(boek);
  return (
    <Laag className="em-laag fm-laag bkm-laag bkm-detail" label={boek.titel}>
      <Kop terug={terug} merk />
      <div className="bkm-detail-beeld">
        <Omslag boek={boek} groot />
      </div>
      <div className="fm-laag-papier">
        <h1 className="bkm-titel" tabIndex={-1}>{boek.titel}</h1>
        {cats.length > 0 && <p className="bkm-labels">{cats.map((c) => <span key={c} className="bkm-label">{c}</span>)}</p>}
        <ul className="bkm-gegevens">
          <li><User aria-hidden="true" /><span><small>Auteur</small>{boek.auteur}</span></li>
          <li><BookOpen aria-hidden="true" /><span><small>Categorie</small>{cats.join(' · ') || boek.categorieen.join(' · ')}</span></li>
          <li><span className="bkm-taal" aria-hidden="true">Aa</span><span><small>Taal</small>{boek.taal}</span></li>
        </ul>
        <button type="button" className={`bkm-bewaar${bewaard ? ' is-bewaard' : ''}`} aria-pressed={bewaard} onClick={() => wisselFavoriet(pad(boek))}>
          <Bookmark aria-hidden="true" /> {bewaard ? 'Bewaard in mijn boekenlijst' : 'Bewaar in mijn boekenlijst'}
        </button>
        {link && (
          <>
            <a className="ism-opslaan bkm-extern" href={link} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" /> Bekijk bij Orthodox Logos
            </a>
            <p className="ism-klein ism-midden">Je verlaat Orthodoxe Tijd en gaat naar de website van Orthodox Logos.</p>
          </>
        )}
        <Sierlijn />
        <h2 className="bkm-sectie">Over dit boek</h2>
        <p className="fm-tekst">{boek.samenvatting}</p>
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
      <Overzicht boeken={boeken} fout={fout} zoek={zoek} setZoek={setZoek} filter={filter} setFilter={setFilter} />
      {onderdeel === 'alle' && boeken && <Lijst titel="De hele bibliotheek" onder={`${boeken.length} boeken van Orthodox Logos`} boeken={boeken} leeg="Geen boeken." />}
      {onderdeel === 'lijst' && boeken && <Lijst titel="Mijn boekenlijst" onder="Bewaard op dit apparaat" boeken={bewaard} leeg="Je hebt nog geen boeken bewaard. Open een boek en tik op ‘Bewaar in mijn boekenlijst’." />}
      {boek && <Detail boek={boek} terug={herkomst ? `#boeken/${herkomst}` : '#boeken'} />}
    </>
  );
}
