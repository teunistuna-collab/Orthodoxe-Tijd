import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useApp } from '../lib/context';
import { addDays, civilVanKerkdatum, daysBetween, formatDag, formatLang, formatMd, hoofdletter, kerkDatum, MAANDEN, parseYmd, ymd } from '../lib/kalender';
import HeiligePopup from './HeiligePopup';
import { normaliseer, tekstVoorIndeling, type Resultaat } from '../lib/heiligenPopup';
import { CATEGORIEEN, categorieenVan } from '../lib/heiligenSoort';
import { usePaginaOpen } from '../lib/paginaOpen';
import NisKop from './NisKop';
import { useMobiel } from '../lib/desktop';
import { Kop, Sierlijn } from './MobielLaag';
import './etmaal-mobiel.css';
import './heiligen-mobiel.css';
import './Vandaag.css';

// De heiligen (#heiligen), volgens het pakket Heiligen en Voorkeuren (referentie.png, scherm 1): zoeken, de twaalf
// maanden en de Heiligen van de Lage Landen. Bron: lib/heiligen.ts (Heiligenjaar + Lage Landen, al ontdubbeld).
// Onderdelen hebben een eigen adres, zodat de terugknop werkt: #heiligen/10 (oktober), #heiligen/lage-landen,
// #heiligen/categorie-<id>. Een heilige opent het bestaande leesvenster (HeiligePopup).
// Tekst in links met een pijl staat in een <span>: index.css vergroot anders het aanraakvlak van "alleen een icoon"-links.

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
/** Het deel na "#heiligen/" ("10", "lage-landen", "categorie-martelaren"), of '' op het overzicht. */
const useOnderdeel = () => useSyncExternalStore(volgHash, () => decodeURIComponent(window.location.hash).match(/^#heiligen\/(.+)$/)?.[1] ?? '');

const sorteerMd = (a: string, b: string) => {
  const [am, ad] = a.split('-').map(Number);
  const [bm, bd] = b.split('-').map(Number);
  return am - bm || ad - bd;
};

const CATEGORIE_LIJST = [...CATEGORIEEN.map((c) => ({ id: c.id, label: c.label })), { id: 'overige', label: 'Overige heiligen' }];

export default function Heiligen() {
  const open = usePaginaOpen('heiligen');
  const { mode, vandaag, heiligen } = useApp();
  const onderdeel = useOnderdeel();
  const [zoek, setZoek] = useState('');
  const [geselecteerde, setGeselecteerde] = useState<Resultaat | null>(null);
  // Een maand of lijst openen (of terug naar het overzicht): bovenaan beginnen.
  useEffect(() => {
    if (open) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [onderdeel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Alleen heiligen; feesten en andere gedachtenissen horen bij de dag (Kalender, Vandaag).
  const alle = useMemo<Resultaat[]>(() => (heiligen?.ALLE_HEILIGEN ?? []).filter((h) => h.type === 'saint').map((h) => ({ ...h, bron: h.nl ? 'nl' : 'hj' })), [heiligen]);

  const maand = /^\d+$/.test(onderdeel) ? Number(onderdeel) : null;
  const categorie = onderdeel.startsWith('categorie-') ? CATEGORIE_LIJST.find((c) => `categorie-${c.id}` === onderdeel) : undefined;
  const lageLanden = onderdeel === 'lage-landen';
  const query = normaliseer(zoek.trim());

  // Op naam (en de andere namen uit de bron) zoeken; op het overzicht vervangen de resultaten dan de maanden.
  const gevonden = useMemo(() => {
    if (maand) return alle.filter((h) => Number(h.md.split('-')[0]) === maand);
    if (lageLanden) return alle.filter((h) => h.nl);
    if (categorie) return alle.filter((h) => categorieenVan(tekstVoorIndeling(h)).includes(categorie.id));
    if (!query) return [];
    return alle.filter((h) => normaliseer(`${h.naam} ${h.titel} ${(h.namen ?? []).join(' ')}`).includes(query));
  }, [alle, maand, lageLanden, categorie, query]);

  const groepen = useMemo(() => {
    const map = new Map<string, Resultaat[]>();
    for (const h of gevonden) map.set(h.md, [...(map.get(h.md) ?? []), h]);
    return [...map.entries()].sort(([a], [b]) => sorteerMd(a, b));
  }, [gevonden]);

  // Datum van de gedachtenis: de kerkelijke datum; bij de oude kalender ook de burgerlijke datum dit jaar.
  const jaar = vandaag.getUTCFullYear();
  const datum = (md: string) => (mode === 'oud' ? `Jul. ${formatMd(md)} · Greg. ${formatDag(civilVanKerkdatum(md, jaar, mode))}` : formatMd(md));

  // Het overzicht opent met de heiligen van vandaag (kerkelijke datum) en markeert de huidige maand.
  const kerkVandaag = kerkDatum(vandaag, mode);
  const huidigeMaand = kerkVandaag.getUTCMonth() + 1;
  const vandaagMd = `${huidigeMaand}-${kerkVandaag.getUTCDate()}`;
  const vanVandaag = useMemo(() => alle.filter((h) => h.md === vandaagMd), [alle, vandaagMd]);

  // Mobiel (mock-up heiligen): de heiligen van een dag met vorige/volgende dag en een datumkiezer; standaard vandaag.
  const mobiel = useMobiel();
  const [verschuiving, setVerschuiving] = useState(0);
  const [alleVanDag, setAlleVanDag] = useState(false);
  const dagDatum = addDays(vandaag, verschuiving);
  const kerkDag = kerkDatum(dagDatum, mode);
  const dagMd = `${kerkDag.getUTCMonth() + 1}-${kerkDag.getUTCDate()}`;
  const vanDag = useMemo(() => alle.filter((h) => h.md === dagMd), [alle, dagMd]);
  const naarDag = (v: number) => {
    setVerschuiving(v);
    setAlleVanDag(false);
  };
  // Alleen de naam van de heilige; het leesvenster toont de rest.
  const heiligeKaart = (h: Resultaat) => (
    <li key={h.id}>
      <button type="button" className="hm-kaart hm-naam" onClick={() => setGeselecteerde(h)}>
        <span className="hm-tekst"><b>{h.naam}</b></span>
        <ChevronRight className="hm-pijl" aria-hidden="true" />
      </button>
    </li>
  );

  const rijKnop = (h: Resultaat) => (
    <li key={h.id}>
      <button type="button" className="vg-hl-rij" onClick={() => setGeselecteerde(h)}>
        <span>
          <b>{h.naam}</b>
          {h.titel && h.titel !== h.naam && <span>{h.titel}</span>}
        </span>
        <ChevronRight aria-hidden="true" />
      </button>
    </li>
  );

  const lijst = (
    <>
      {!heiligen ? (
        <p className="vg-hl-leeg">De heiligen worden geladen…</p>
      ) : groepen.length === 0 ? (
        <p className="vg-hl-leeg">{query ? `Geen heilige gevonden voor “${zoek.trim()}”. Probeer een andere schrijfwijze of een deel van de naam.` : 'Geen heiligen gevonden.'}</p>
      ) : (
        <ol className="vg-hl-dagen">
          {groepen.map(([md, items]) => (
            <li key={md}>
              <h3>{datum(md)}</h3>
              <ul>{items.map(rijKnop)}</ul>
            </li>
          ))}
        </ol>
      )}
    </>
  );

  const titel = maand ? hoofdletter(MAANDEN[maand - 1]) : lageLanden ? 'Heiligen van de Lage Landen' : categorie?.label;

  return (
    <section id="heiligen" className={`vg vg-heiligen${mobiel ? ' am hm' : ''}`}>
      {mobiel ? (
        // Mobiel: het icoon van het Eerste Concilie van Nicea in kaarslicht (aangeleverd 26-10-2026, alleen verkleind), titel als tekst
        <div className="em-banner hm-banner">
          <img src="/images/ontwerp/heiligen-nicea-800.webp" srcSet="/images/ontwerp/heiligen-nicea-800.webp 800w, /images/ontwerp/heiligen-nicea-1086.webp 1086w" sizes="100vw" alt="" width={1086} height={1448} loading={open ? 'eager' : 'lazy'} decoding="async" />
          <Kop terug="#meer" merk />
          <div className="em-banner-tekst">
            <h1 className="em-titel">Heiligen</h1>
            <Sierlijn />
            <p className="am-onder">Getuigen van het geloof</p>
          </div>
        </div>
      ) : (
        <NisKop
          titel="De Heiligen"
          open={open}
          balk
          achter={
            <picture>
              {/* Mobiel: het icoon van Christus de Wijnstok met de apostelen in de nis; web: de bestaande kerkkop */}
              <source media="(max-width: 767.98px)" srcSet="/images/ontwerp/heiligen-mobiel-banner-800.webp 800w, /images/ontwerp/heiligen-mobiel-banner-1536.webp 1536w" sizes="100vw" width={1536} height={1024} />
              <img src="/images/vandaag/kerk-header-800.webp" srcSet="/images/vandaag/kerk-header-800.webp 800w, /images/vandaag/kerk-header-1536.webp 1536w" sizes="(min-width: 960px) 960px, 100vw" alt="" width={1536} height={1024} loading={open ? 'eager' : 'lazy'} decoding="async" />
            </picture>
          }
        >
          {/* Web: het icoon van Christus de Wijnstok met de apostelen in de nis (mobiel staat het al in de banner) */}
          <img className="vg-hl-icoon" src="/images/ontwerp/heiligen-wijnstok-300.webp" srcSet="/images/ontwerp/heiligen-wijnstok-300.webp 300w, /images/ontwerp/heiligen-wijnstok-430.webp 430w" sizes="150px" alt="Icoon van Christus de Wijnstok met de apostelen" width={430} height={582} loading="lazy" decoding="async" />
        </NisKop>
      )}
      <div className={`vg-papier${mobiel ? ' hm-papier' : ''}`}>
        {titel ? (
          <>
            <a className="vg-hl-terug" href="#heiligen">
              <ChevronLeft aria-hidden="true" /> <span>Alle heiligen</span>
            </a>
            <h2 className="vg-hl-kop">{titel}</h2>
            <p className="vg-hl-uitleg">
              {gevonden.length} heiligen{mode === 'oud' ? ' · Jul = juliaanse (oude) kalender, Greg = gregoriaanse (nieuwe) kalender' : ''}
            </p>
            {lijst}
          </>
        ) : (
          <>
            <label className="vg-hl-zoek">
              <Search aria-hidden="true" />
              <span className="sr-only">Zoek een heilige</span>
              <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder={mobiel ? 'Zoek op naam van een heilige…' : 'Zoek een heilige'} autoComplete="off" />
            </label>

            {mobiel && !query ? (
              <>
                <div className="hm-kop">
                  <h2 className="hm-label">Heiligen van de dag</h2>
                  <span>Volgens de kerkelijke kalender</span>
                </div>
                <div className="hm-dagnav">
                  <button type="button" className="hm-stap" aria-label="Vorige dag" onClick={() => naarDag(verschuiving - 1)}><ChevronLeft aria-hidden="true" /></button>
                  <label className="hm-datum">
                    <span aria-live="polite">{hoofdletter(formatLang(dagDatum))}</span>
                    <CalendarDays aria-hidden="true" />
                    <input
                      type="date"
                      aria-label="Kies een datum"
                      value={ymd(dagDatum)}
                      onChange={(e) => e.target.value && naarDag(daysBetween(vandaag, parseYmd(e.target.value)))}
                    />
                  </label>
                  <button type="button" className="hm-stap" aria-label="Volgende dag" onClick={() => naarDag(verschuiving + 1)}><ChevronRight aria-hidden="true" /></button>
                </div>
                {verschuiving !== 0 && (
                  <button type="button" className="hm-vandaag" onClick={() => naarDag(0)}>Terug naar vandaag</button>
                )}
                {!heiligen ? (
                  <p className="vg-hl-leeg">De heiligen worden geladen…</p>
                ) : vanDag.length === 0 ? (
                  <p className="vg-hl-leeg">Geen heiligen opgenomen voor deze dag.</p>
                ) : (
                  <ul className="hm-lijst">{(alleVanDag ? vanDag : vanDag.slice(0, 5)).map(heiligeKaart)}</ul>
                )}
                {vanDag.length > 5 && !alleVanDag && (
                  <button type="button" className="hm-meer" onClick={() => setAlleVanDag(true)}>
                    Nog {vanDag.length - 5} heiligen van deze dag <ChevronRight aria-hidden="true" />
                  </button>
                )}

                <h2 className="hm-label hm-lijnlabel">Heiligen van de Lage Landen</h2>
                <ul className="hm-lijst">
                  <li>
                    <a className="hm-kaart hm-ll" href="#heiligen/lage-landen">
                      <span className="hm-beeld" aria-hidden="true"><img src="/images/decor/lage-landen-kaart.webp" alt="" width={414} height={263} loading="lazy" decoding="async" /></span>
                      <span className="hm-tekst">
                        <b>Onze heiligen</b>
                        <span>Het geloof in onze streken</span>
                      </span>
                      <ChevronRight className="hm-pijl" aria-hidden="true" />
                    </a>
                  </li>
                </ul>

                <h2 className="hm-label hm-lijnlabel">Alle heiligen per maand</h2>
                <nav aria-label="Heiligen per maand">
                  <ul className="vg-hl-maanden">
                    {MAANDEN.map((m, i) => (
                      <li key={m}>
                        <a href={`#heiligen/${i + 1}`} className={i + 1 === huidigeMaand ? 'is-nu' : undefined} aria-current={i + 1 === huidigeMaand ? 'date' : undefined}>
                          <span>{hoofdletter(m)}</span>
                          <ChevronRight aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <nav className="vg-hl-categorieen" aria-labelledby="hm-cat-kop">
                  <h2 id="hm-cat-kop" className="hm-label hm-lijnlabel">Naar categorie</h2>
                  <ul>
                    {CATEGORIE_LIJST.map((c) => (
                      <li key={c.id}>
                        <a href={`#heiligen/categorie-${c.id}`}>{c.label}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </>
            ) : query ? (
              <section aria-live="polite" aria-label="Zoekresultaten">
                <p className="vg-hl-uitleg">{gevonden.length === 1 ? '1 heilige' : `${gevonden.length} heiligen`}</p>
                {lijst}
              </section>
            ) : (
              <>
                {vanVandaag.length > 0 && (
                  <section className="vg-hl-vandaag vg-hl-dagen" aria-labelledby="vg-hl-vandaag-kop">
                    <h2 id="vg-hl-vandaag-kop">Vandaag · {datum(vandaagMd)}</h2>
                    <ul>{vanVandaag.slice(0, 4).map(rijKnop)}</ul>
                    {vanVandaag.length > 4 && (
                      <a className="vg-hl-meer" href={`#heiligen/${huidigeMaand}`}>
                        <span>Nog {vanVandaag.length - 4} heiligen van vandaag in {MAANDEN[huidigeMaand - 1]}</span> <ChevronRight aria-hidden="true" />
                      </a>
                    )}
                  </section>
                )}

                <nav aria-label="Heiligen per maand">
                  <ul className="vg-hl-maanden">
                    {MAANDEN.map((m, i) => (
                      <li key={m}>
                        <a href={`#heiligen/${i + 1}`} className={i + 1 === huidigeMaand ? 'is-nu' : undefined} aria-current={i + 1 === huidigeMaand ? 'date' : undefined}>
                          <span>{hoofdletter(m)}</span>
                          <ChevronRight aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <p className="vg-verd-scheiding" aria-hidden="true"><span>✣</span></p>

                <section className="vg-hl-ll" aria-labelledby="vg-hl-ll-kop">
                  <img className="vg-hl-ll-kaart" src="/images/decor/lage-landen.webp" alt="" loading="lazy" decoding="async" />
                  <h2 id="vg-hl-ll-kop">Heiligen van de Lage Landen</h2>
                  <p className="vg-hl-ll-namen">Willibrord, Servatius, Bavo</p>
                  <p>Heilige mannen en vrouwen die in onze streken hebben geleefd.</p>
                  <a className="vg-knop" href="#heiligen/lage-landen">
                    <span>Lees over hun leven</span> <ChevronRight aria-hidden="true" />
                  </a>
                </section>

                <nav className="vg-hl-categorieen" aria-labelledby="vg-hl-cat-kop">
                  <h2 id="vg-hl-cat-kop" className="vg-label">Naar categorie</h2>
                  <ul>
                    {CATEGORIE_LIJST.map((c) => (
                      <li key={c.id}>
                        <a href={`#heiligen/categorie-${c.id}`}>{c.label}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </>
            )}
          </>
        )}
      </div>
      <HeiligePopup heilige={geselecteerde} onClose={() => setGeselecteerde(null)} />
    </section>
  );
}
