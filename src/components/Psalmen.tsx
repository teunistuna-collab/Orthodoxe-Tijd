import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import PageHero from './PageHero';
import { Leeskeuzes } from './Modal';
import { OPEN_DIENST_EVENT } from '../lib/events';
import { PSALMEN, laadPsalmTeksten, psalmVanHetUur, zoekPsalmen, type Psalm, type PsalmTeksten } from '../lib/psalmen';

// Psalmen: een digitaal psalter. Lijst (zoeken, filters) en leesvenster; op desktop naast elkaar, op mobiel onder
// elkaar met een rustig venster van vier psalmen boven de tekst. Opmaak: Bouw 72 in index.css.
// Alleen echte data: teksten uit public/data/psalmen.json, gebruik uit het etmaal (lib/etmaal.ts).

// ponytail: introductietekst overgenomen uit de aangeleverde referentieontwerpen; nog door de redactie te bevestigen.
// Mobiel toont (zoals in de mobiele referentie) alleen de eerste twee zinnen.
const INTRO = 'De Psalmen zijn het gebed van de Kerk. Zij verwoorden de vreugde, de wanhoop, de dank, de smeekbede en het vertrouwen van de mens voor God.';
const INTRO_VERVOLG = 'Door alle tijden heen bidden de christenen de Psalmen, in het ritme van het etmaal en in alle omstandigheden van het leven.';

type Filter = 'alle' | 'etmaal';
const FILTERS: [Filter, string][] = [
  ['alle', 'Alle'],
  ['etmaal', 'Etmaal'],
];
// Thema's, A–Z en Favorieten komen er pas bij als daar gecontroleerde data of een favorietensysteem voor is.

type Bereik = 'alle' | 'tekst' | '1' | '51' | '101';
const BEREIKEN: [Bereik, string][] = [
  ['alle', 'Alle Psalmen'],
  ['tekst', 'Met tekst'],
  ['1', 'Psalm 1–50'],
  ['51', 'Psalm 51–100'],
  ['101', 'Psalm 101–150'],
];

const VENSTER = 4; // aantal psalmrijen boven het leesblok op mobiel

export default function Psalmen({ actief }: { actief: boolean }) {
  const [teksten, setTeksten] = useState<PsalmTeksten | null>(null);
  const [laadFout, setLaadFout] = useState(false);
  const [gekozen, setGekozen] = useState(() => psalmVanHetUur(new Date()));
  const [zoek, setZoek] = useState('');
  const [filter, setFilter] = useState<Filter>('alle');
  const [bereik, setBereik] = useState<Bereik>('alle');
  const [tab, setTab] = useState<'tekst' | 'gebruik'>('tekst');
  const [alles, setAlles] = useState(false);
  const lijstRef = useRef<HTMLDivElement | null>(null);
  // Op een telefoon past alleen een korte hint in het zoekveld.
  const [plaatshouder] = useState(() => (window.matchMedia('(max-width: 767px)').matches ? 'Zoek een psalm…' : 'Zoek een psalmnummer, woord of dienst…'));

  // De teksten (±40 KB) pas ophalen als de pagina wordt geopend.
  useEffect(() => {
    if (!actief || teksten) return;
    let weg = false;
    laadPsalmTeksten()
      .then((t) => !weg && setTeksten(t))
      .catch(() => !weg && setLaadFout(true));
    return () => {
      weg = true;
    };
  }, [actief, teksten]);

  // Desktop: de lijst scrollt zelf naar de gekozen psalm als die buiten beeld staat (de pagina blijft staan).
  useEffect(() => {
    const el = lijstRef.current;
    const rij = el?.querySelector<HTMLElement>('.ps-rij[aria-current]');
    if (!el || !rij || el.scrollHeight <= el.clientHeight) return;
    if (rij.offsetTop < el.scrollTop || rij.offsetTop + rij.offsetHeight > el.scrollTop + el.clientHeight) {
      el.scrollTop = rij.offsetTop - el.clientHeight / 2 + rij.offsetHeight / 2;
    }
  }, [gekozen, filter, bereik, actief]);

  const lijst = useMemo(() => {
    let l = PSALMEN;
    if (filter === 'etmaal') l = l.filter((p) => p.liturgicalUses.length > 0);
    if (bereik === 'tekst') l = l.filter((p) => p.hasText);
    else if (bereik !== 'alle') l = l.filter((p) => p.septuagintNumber >= Number(bereik) && p.septuagintNumber < Number(bereik) + 50);
    return zoekPsalmen(l, zoek, teksten);
  }, [filter, bereik, zoek, teksten]);

  const psalm = PSALMEN[gekozen - 1];
  const tekst = teksten?.[gekozen];

  // Mobiel/tablet zonder zoekopdracht of filter: vier psalmen rond de gekozen psalm, de rest via "alle psalmen".
  const compact = !alles && lijst.length > VENSTER && !zoek.trim() && filter === 'alle' && bereik === 'alle';
  const index = lijst.findIndex((p) => p.septuagintNumber === gekozen);
  const start = Math.max(0, Math.min(index - 1, lijst.length - VENSTER));

  const kies = (p: Psalm) => {
    setGekozen(p.septuagintNumber);
    setTab('tekst');
    // Na kiezen uit de volledige lijst op mobiel: terug naar het rustige venster, met de gekozen psalm in beeld.
    if (alles && window.matchMedia('(max-width: 1023px)').matches) {
      setAlles(false);
      requestAnimationFrame(() => lijstRef.current?.scrollIntoView({ block: 'start' }));
    }
  };

  return (
    <>
      <PageHero id="psalmen" alt="Psalmen — De adem van de ziel" kop />

      <section className="ps-pagina parchment-pattern bg-parchment text-ink">
        <div className="ps-inhoud">
          <div className="ps-intro ps-kader">
            <span className="ps-sier" aria-hidden="true">
              <i />✣<i />
            </span>
            <p>
              {INTRO} <span className="ps-intro-vervolg">{INTRO_VERVOLG}</span>
            </p>
          </div>

          <div className="ps-zoekrij">
            <label className="ps-zoek">
              <Search aria-hidden="true" />
              <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder={plaatshouder} aria-label="Zoek een psalm op nummer, woord of dienst" />
            </label>
            <select className="ps-bereik" value={bereik} onChange={(e) => setBereik(e.target.value as Bereik)} aria-label="Welke psalmen">
              {BEREIKEN.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="ps-filters" role="group" aria-label="Filter">
            {FILTERS.map(([id, label]) => (
              <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>
                {label}
              </button>
            ))}
          </div>

          <div className="ps-psalter">
            <div ref={lijstRef} className={`ps-lijst${compact ? ' is-compact' : ''}`}>
              {lijst.length === 0 && <p className="ps-leeg">Geen psalmen gevonden{zoek.trim() ? ` voor “${zoek.trim()}”` : ''}.</p>}
              {lijst.map((p, i) => {
                const onder = p.liturgicalUses.length ? `Etmaal · ${p.liturgicalUses.map((g) => g.dienst).join(', ')}` : undefined;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`ps-rij${p.hasText ? '' : ' is-zonder-tekst'}`}
                    aria-current={p.septuagintNumber === gekozen ? 'true' : undefined}
                    data-buiten={compact && (i < start || i >= start + VENSTER) ? '' : undefined}
                    onClick={() => kies(p)}
                  >
                    <span className="ps-nummer" aria-hidden="true">
                      {p.septuagintNumber}
                    </span>
                    <span className="ps-rij-tekst">
                      <span className="ps-rij-titel">{p.title}</span>
                      {onder && <span className="ps-rij-onder">{onder}</span>}
                    </span>
                    <ChevronRight className="ps-pijl" aria-hidden="true" />
                  </button>
                );
              })}
              {(compact || alles) && (
                <button type="button" className="ps-meer" onClick={() => setAlles((a) => !a)} aria-expanded={alles}>
                  {alles ? 'Minder psalmen tonen' : `Alle ${lijst.length} psalmen tonen`}
                </button>
              )}
            </div>

            <article className="ps-lezer ps-kader" aria-labelledby="ps-titel">
              <header className="ps-lezer-kop">
                <span className="ps-sier" aria-hidden="true">
                  <i />✣<i />
                </span>
                <h2 id="ps-titel">{psalm.title}</h2>
                {psalm.masoreticNumber && <p>Psalm {psalm.masoreticNumber} in de Hebreeuwse nummering</p>}
                <span className="ps-sier" aria-hidden="true">
                  <i />✣<i />
                </span>
              </header>

              <div className="ps-tabs" role="tablist" aria-label="Weergave">
                <button type="button" role="tab" id="ps-tab-tekst" aria-controls="ps-paneel" aria-selected={tab === 'tekst'} onClick={() => setTab('tekst')}>
                  Septuagint (NL)
                </button>
                {psalm.liturgicalUses.length > 0 && (
                  <button type="button" role="tab" id="ps-tab-gebruik" aria-controls="ps-paneel" aria-selected={tab === 'gebruik'} onClick={() => setTab('gebruik')}>
                    Gebruik
                  </button>
                )}
              </div>

              <div id="ps-paneel" role="tabpanel" aria-labelledby={tab === 'tekst' ? 'ps-tab-tekst' : 'ps-tab-gebruik'} className="ps-paneel">
                {tab === 'gebruik' ? (
                  <ul className="ps-gebruik">
                    {psalm.liturgicalUses.map((g) => (
                      <li key={g.dienst}>
                        <span>
                          <b>{g.dienst}</b> · {g.tijd}
                        </span>
                        <a
                          href="#etmaal"
                          onClick={(e) => {
                            // Opent de dienst in het etmaal als venster over deze pagina, net als vanaf Vandaag.
                            e.preventDefault();
                            window.dispatchEvent(new CustomEvent(OPEN_DIENST_EVENT, { detail: g.dienst }));
                          }}
                        >
                          Open in het etmaal →
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : !psalm.hasText ? (
                  <p className="ps-leeg">Tekst wordt toegevoegd.</p>
                ) : !tekst ? (
                  <p className="ps-leeg">{laadFout ? 'De tekst kon niet worden geladen.' : 'Tekst wordt geladen…'}</p>
                ) : (
                  <>
                    <Leeskeuzes className="ps-leeskeuzes" />
                    <div className="ps-verzen lees-vlak">
                      {tekst.verzen.map((v, k) =>
                        v.kop ? (
                          <p key={k} className="ps-stasis">
                            {v.kop}
                          </p>
                        ) : (
                          <div key={k} className="ps-vers">
                            <span className="ps-versnr">{v.n ?? ''}</span>
                            <p>
                              {v.regels.map((r, j) => (
                                <span key={j}>{r}</span>
                              ))}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                    <p className="ps-bron">Nederlandse vertaling naar de Septuagint.</p>
                  </>
                )}
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
