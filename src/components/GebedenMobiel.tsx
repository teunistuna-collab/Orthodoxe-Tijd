import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { ChevronRight, Search, X } from 'lucide-react';
import { GEBEDEN, GEBEDEN_ZICHTBAAR, type Gebed } from '../lib/gebeden';
import { normaliseer } from '../lib/heiligenPopup';
import { Kop, Laag, LeesWeergave, Sierlijn } from './MobielLaag';
import { BLAD, HANDEN, KERK, KRUIS, SIERKRUIS } from './symbolen';
import './etmaal-mobiel.css';
import './heiligen-mobiel.css';
import './gebeden-mobiel.css';

// Gebeden op mobiel (mock-up 06_gebeden), vier schermen met een eigen adres:
// 1. #gebeden: banner (aangeleverd, alleen verkleind), zoeken en de zes categorieën; 2. #gebeden/<categorie>: de gebeden
// van die categorie; 3. #gebeden/<categorie>/<gebed>: de leesweergave (licht, of donker met de avondweergave van de
// leesinstellingen). De gebeden worden later aangeleverd: zolang GEBEDEN_ZICHTBAAR (lib/gebeden.ts) false is toont de
// leesweergave alleen de melding, nooit de bestaande tekst. Titels en categorieën komen uit lib/gebeden.ts; een
// categorie zonder gebeden toont dezelfde melding. Een gebed toevoegen = een regel in GEBEDEN met de juiste categorie.

type CatKey = 'ochtend' | 'avond' | 'dagelijks' | 'dank' | 'bijzonder' | 'liturgisch';

const ZON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
  </svg>
);
const MAAN = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    <path d="m17 4 .6 1.4L19 6l-1.4.6L17 8l-.6-1.4L15 6l1.4-.6Z" />
  </svg>
);

/** De zes categorieën van de mock-up; `bron` = de categorieën uit lib/gebeden.ts die eronder vallen. */
const CATEGORIEEN: Array<{ key: CatKey; titel: string; onder: string; symbool: ReactNode; bron: Gebed['categorie'][] }> = [
  { key: 'ochtend', titel: 'Ochtendgebeden', onder: 'Begin de dag in gebed', symbool: ZON, bron: ['ochtend'] },
  { key: 'avond', titel: 'Avondgebeden', onder: 'Sluit de dag in stilte af', symbool: MAAN, bron: ['avond'] },
  { key: 'dagelijks', titel: 'Dagelijkse gebeden', onder: 'Voor verschillende momenten', symbool: KRUIS, bron: ['dagelijks'] },
  { key: 'dank', titel: 'Dankgebeden', onder: 'Dankzegging aan God', symbool: HANDEN, bron: [] },
  { key: 'bijzonder', titel: 'Gebeden in bijzondere tijden', onder: 'Bij ziekte, rouw en andere noden', symbool: BLAD, bron: ['vasten', 'pascha'] },
  { key: 'liturgisch', titel: 'Liturgische gebeden', onder: 'Uit de goddelijke diensten', symbool: KERK, bron: ['liturgisch', 'akathisten'] },
];
const catVan = (g: Gebed) => CATEGORIEEN.find((c) => c.bron.includes(g.categorie));
const gebedenVan = (k: CatKey) => GEBEDEN.filter((g) => catVan(g)?.key === k);

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
const useOnderdeel = () => useSyncExternalStore(volgHash, () => decodeURIComponent(window.location.hash).match(/^#gebeden\/(.+)$/)?.[1] ?? '');

function Regel({ href, symbool, titel, onder }: { href: string; symbool: ReactNode; titel: string; onder?: string }) {
  return (
    <li>
      <a className="gbm-kaart" href={href}>
        <span className="gbm-symbool" aria-hidden="true">{symbool}</span>
        <span className="hm-tekst">
          <b>{titel}</b>
          {onder && <span>{onder}</span>}
        </span>
        <ChevronRight className="hm-pijl" aria-hidden="true" />
      </a>
    </li>
  );
}

function Melding({ terug }: { terug: string }) {
  return (
    <div className="gbm-melding">
      <span className="gbm-melding-kruis" aria-hidden="true">{SIERKRUIS}</span>
      <p className="gbm-melding-titel">Dit gebed wordt binnenkort toegevoegd</p>
      <p>We werken aan een zorgvuldige verzameling orthodoxe gebeden.</p>
      <a className="gm-knop gbm-terug" href={terug}>Terug naar gebeden</a>
    </div>
  );
}

// 1. Overzicht
function Overzicht({ zoek, setZoek }: { zoek: string; setZoek: (z: string) => void }) {
  const q = normaliseer(zoek.trim());
  const cats = q ? CATEGORIEEN.filter((c) => normaliseer(`${c.titel} ${c.onder}`).includes(q)) : [];
  const gebeden = q ? GEBEDEN.filter((g) => catVan(g) && normaliseer(`${g.titel} ${g.wanneer}`).includes(q)) : [];
  return (
    <section id="gebeden" className="am hm gbm">
      <div className="em-banner gbm-banner">
        <img src="/images/ontwerp/gebeden-banner-700.webp" srcSet="/images/ontwerp/gebeden-banner-700.webp 700w, /images/ontwerp/gebeden-banner-941.webp 941w" sizes="100vw" alt="" width={941} height={1671} decoding="async" />
        <Kop terug="#bidden" merk />
        <div className="em-banner-tekst">
          <h1 className="em-titel">Gebeden</h1>
          <Sierlijn />
          <p className="am-onder">In stilte voor Gods aangezicht</p>
        </div>
      </div>
      <div className="vg-papier hm-papier">
        <label className="vg-hl-zoek fm-zoek">
          <Search aria-hidden="true" />
          <span className="sr-only">Zoek een gebed</span>
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek een gebed…" autoComplete="off" />
          {zoek && (
            <button type="button" className="fm-wis" aria-label="Zoekopdracht wissen" onClick={() => setZoek('')}>
              <X aria-hidden="true" />
            </button>
          )}
        </label>
        {q ? (
          <section aria-live="polite" aria-label="Zoekresultaten">
            <div className="hm-kop">
              <h2 className="hm-label">Zoekresultaten</h2>
              <span>{cats.length + gebeden.length === 1 ? '1 resultaat' : `${cats.length + gebeden.length} resultaten`}</span>
            </div>
            {cats.length + gebeden.length === 0 ? (
              <p className="vg-hl-leeg">Niets gevonden voor “{zoek.trim()}”.</p>
            ) : (
              <ul className="hm-lijst">
                {cats.map((c) => <Regel key={c.key} href={`#gebeden/${c.key}`} symbool={c.symbool} titel={c.titel} onder={c.onder} />)}
                {gebeden.map((g) => <Regel key={g.id} href={`#gebeden/${catVan(g)!.key}/${g.id}`} symbool={SIERKRUIS} titel={g.titel} onder={g.wanneer} />)}
              </ul>
            )}
          </section>
        ) : (
          <>
            <h2 className="hm-label gbm-kop">Categorieën</h2>
            <ul className="hm-lijst">{CATEGORIEEN.map((c) => <Regel key={c.key} href={`#gebeden/${c.key}`} symbool={c.symbool} titel={c.titel} onder={c.onder} />)}</ul>
          </>
        )}
      </div>
    </section>
  );
}

// 2. Een categorie
function Categorie({ cat }: { cat: (typeof CATEGORIEEN)[number] }) {
  const lijst = gebedenVan(cat.key);
  return (
    <Laag className="em-laag fm-laag gbm-laag" label={cat.titel}>
      <Kop terug="#gebeden" merk />
      <div className="fm-laag-papier">
        <h1 className="fm-titel" tabIndex={-1}>{cat.titel}</h1>
        <p className="fm-onder">{cat.onder}</p>
        <Sierlijn />
        {lijst.length ? (
          <ul className="hm-lijst">{lijst.map((g) => <Regel key={g.id} href={`#gebeden/${cat.key}/${g.id}`} symbool={SIERKRUIS} titel={g.titel} onder={g.wanneer} />)}</ul>
        ) : (
          <Melding terug="#gebeden" />
        )}
      </div>
    </Laag>
  );
}

export default function GebedenMobiel() {
  const onderdeel = useOnderdeel();
  const [zoek, setZoek] = useState('');
  const [catKey, gebedId] = onderdeel.split('/');
  const cat = CATEGORIEEN.find((c) => c.key === catKey);
  const gebed = cat && gebedId ? GEBEDEN.find((g) => g.id === gebedId) : undefined;
  return (
    <>
      <Overzicht zoek={zoek} setZoek={setZoek} />
      {cat && !gebedId && <Categorie cat={cat} />}
      {cat && gebed && (
        // 3. en 4. De leesweergave: licht, of donker via de avondweergave (Aa). De tekst pas na vrijgave (GEBEDEN_ZICHTBAAR).
        <LeesWeergave className="em-laag em-lees gbm-lees" titel={gebed.titel} ondertitel="Orthodoxe gebeden" terug={`#gebeden/${cat.key}`} deelPad={`gebeden/${cat.key}/${gebed.id}`} boven={<span className="em-ornament">{SIERKRUIS}</span>}>
          {GEBEDEN_ZICHTBAAR ? (
            gebed.tekst.split(/\n\s*\n/).map((alinea, i) => <p key={i} className="gbm-gebedstekst">{alinea}</p>)
          ) : (
            <Melding terug={`#gebeden/${cat.key}`} />
          )}
        </LeesWeergave>
      )}
    </>
  );
}
