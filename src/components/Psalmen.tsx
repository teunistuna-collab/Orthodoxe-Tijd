import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import PageHero from './PageHero';
import Modal from './Modal';
import Leesbediening from './Leesbediening';
import { OPEN_DIENST_EVENT } from '../lib/events';
import { ETMAAL_GROEPEN, PSALMEN, laadPsalmTeksten, psalmVanHetUur, zoekPsalmen, type Psalm, type PsalmTekst, type PsalmTeksten } from '../lib/psalmen';

// Psalmen: een digitaal psalter. Desktop: lijst links, leesvenster rechts. Mobiel en tablet: de lijst op de pagina,
// een psalm opent in het gewone leesvenster (Modal). Opmaak: Bouw 72 en 74 in index.css.
// Alleen echte data: teksten uit public/data/psalmen.json, gebruik uit het etmaal (lib/etmaal.ts).

// ponytail: introductietekst overgenomen uit de aangeleverde referentieontwerpen; nog door de redactie te bevestigen.
// Mobiel toont alleen de eerste zin: zo blijft de intro kort en staat de lijst hoger.
const INTRO = 'De Psalmen zijn het gebed van de Kerk.';
const INTRO_VERVOLG = 'Zij verwoorden de vreugde, de wanhoop, de dank, de smeekbede en het vertrouwen van de mens voor God. Door alle tijden heen bidden de christenen de Psalmen, in het ritme van het etmaal en in alle omstandigheden van het leven.';

type Filter = 'alle' | 'etmaal';
const FILTERS: [Filter, string][] = [
  ['alle', 'Alle'],
  ['etmaal', 'Etmaal'],
];
// Thema's, A–Z en Favorieten komen er pas bij als daar gecontroleerde data of een favorietensysteem voor is.

const LEESVENSTER_NAAST_LIJST = '(min-width: 1024px)';

// Deep link: #psalmen/50 opent Psalm 50 (desktop in het leesvenster, mobiel als pop-up); te gebruiken vanaf Vandaag, Etmaal, zoeken.
const psalmUitHash = () => {
  const n = Number(/^#psalmen\/(\d+)$/.exec(window.location.hash)?.[1]);
  return n >= 1 && n <= 150 ? PSALMEN[n - 1] : null;
};

export default function Psalmen({ actief }: { actief: boolean }) {
  const [teksten, setTeksten] = useState<PsalmTeksten | null>(null);
  const [laadFout, setLaadFout] = useState(false);
  const [gekozen, setGekozen] = useState(() => psalmVanHetUur(new Date()));
  const [popup, setPopup] = useState<number | null>(null);
  const [zoek, setZoek] = useState('');
  const [filter, setFilter] = useState<Filter>('alle');
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
  }, [gekozen, filter, actief]);

  // Etmaal zonder zoekterm: gegroepeerd per dienst, in de volgorde van het etmaal.
  const groepen = filter === 'etmaal' && !zoek.trim() ? ETMAAL_GROEPEN : null;
  const lijst = useMemo(
    () => (groepen ? groepen.flatMap((g) => g.delen.flatMap((d) => d.psalmen.map((n) => PSALMEN[n - 1]))) : zoekPsalmen(filter === 'etmaal' ? PSALMEN.filter((p) => p.liturgicalUses.length > 0) : PSALMEN, zoek, teksten)),
    [groepen, filter, zoek, teksten],
  );

  const kies = (p: Psalm) => {
    setGekozen(p.septuagintNumber);
    // Op desktop staat het leesvenster naast de lijst; kleiner opent de psalm in een leesvenster.
    if (!window.matchMedia(LEESVENSTER_NAAST_LIJST).matches) setPopup(p.septuagintNumber);
  };

  useEffect(() => {
    const opHash = () => {
      const p = psalmUitHash();
      if (p) kies(p);
    };
    opHash();
    window.addEventListener('hashchange', opHash);
    return () => window.removeEventListener('hashchange', opHash);
  }, []);

  const rij = (p: Psalm, onder?: string) => (
    <button key={p.id} type="button" className={`ps-rij${p.hasText ? '' : ' is-zonder-tekst'}`} aria-current={p.septuagintNumber === gekozen ? 'true' : undefined} onClick={() => kies(p)}>
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

  // Vegen in het leesvenster: vorige/volgende psalm uit de huidige lijst.
  const blader = (stap: number) => {
    const i = lijst.findIndex((p) => p.septuagintNumber === popup);
    const volgende = lijst[i + stap];
    if (i !== -1 && volgende) {
      setPopup(volgende.septuagintNumber);
      setGekozen(volgende.septuagintNumber);
    }
  };

  const psalm = PSALMEN[gekozen - 1];
  const popupPsalm = popup !== null ? PSALMEN[popup - 1] : null;

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
            <select className="ps-bereik" value="" onChange={(e) => kies(PSALMEN[Number(e.target.value) - 1])} aria-label="Ga naar psalm">
              <option value="" disabled>
                Ga naar Psalm
              </option>
              {PSALMEN.map((p) => (
                <option key={p.id} value={p.septuagintNumber}>
                  {p.title}
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
            <div ref={lijstRef} className="ps-lijst">
              {lijst.length === 0 && <p className="ps-leeg">Geen psalmen gevonden{zoek.trim() ? ` voor “${zoek.trim()}”` : ''}.</p>}
              {groepen
                ? groepen.map((g) => (
                    <section key={g.dienst} className="ps-groep" aria-label={g.dienst}>
                      <h3>
                        {g.dienst} <span>{g.tijd}</span>
                      </h3>
                      {g.delen.map((d) => (
                        <Fragment key={d.onderdeel ?? ''}>
                          {d.onderdeel && <h4>{d.onderdeel}</h4>}
                          {d.psalmen.map((n) => rij(PSALMEN[n - 1]))}
                        </Fragment>
                      ))}
                    </section>
                  ))
                : lijst.map((p) => rij(p, p.liturgicalUses.length ? `Etmaal · ${p.liturgicalUses.map((g) => g.dienst).join(', ')}` : undefined))}
            </div>

            {/* Desktop: leesvenster naast de lijst (op kleinere schermen verborgen, daar opent het leesvenster als pop-up) */}
            <article className="ps-lezer ps-kader lees-vlak" aria-labelledby="ps-titel">
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
              <PsalmLezer key={psalm.id} idVoorvoegsel="ps-pagina" psalm={psalm} tekst={teksten?.[gekozen]} laadFout={laadFout} bediening={psalm.hasText ? <Leesbediening audioSrc={psalm.audioSrc} /> : undefined} />
            </article>
          </div>
        </div>
      </section>

      {/* Mobiel en tablet: dezelfde psalm-inhoud in het gewone leesvenster, met de leesbediening onderaan */}
      {popupPsalm && (
        <Modal
          open
          onClose={() => setPopup(null)}
          eyebrow="Psalter"
          title={popupPsalm.title}
          maxWidth="max-w-3xl"
          lezen={popupPsalm.hasText}
          leesAudio={popupPsalm.audioSrc}
          onVorige={() => blader(-1)}
          onVolgende={() => blader(1)}
        >
          {popupPsalm.masoreticNumber && <p className="ps-ondertitel">Psalm {popupPsalm.masoreticNumber} in de Hebreeuwse nummering</p>}
          <span className="ps-sier ps-sier-popup" aria-hidden="true">
            <i />✣<i />
          </span>
          <PsalmLezer key={popupPsalm.id} idVoorvoegsel="ps-popup" psalm={popupPsalm} tekst={teksten?.[popupPsalm.septuagintNumber]} laadFout={laadFout} />
        </Modal>
      )}
    </>
  );
}

/** Tabs en tekst van één psalm; gedeeld door het desktopvenster en het leesvenster op mobiel. */
function PsalmLezer({ psalm, tekst, laadFout, idVoorvoegsel, bediening }: { psalm: Psalm; tekst?: PsalmTekst; laadFout: boolean; idVoorvoegsel: string; bediening?: ReactNode }) {
  const [tab, setTab] = useState<'tekst' | 'gebruik'>('tekst');
  const id = (s: string) => `${idVoorvoegsel}-${s}`;

  // Een tab "Thema's" komt er pas bij als psalm.themes gecontroleerde data bevat (nu nog leeg).
  return (
    <>
      <div className="ps-tabrij">
        <div className="ps-tabs" role="tablist" aria-label="Weergave">
          <button type="button" role="tab" id={id('tab-tekst')} aria-controls={id('paneel')} aria-selected={tab === 'tekst'} onClick={() => setTab('tekst')}>
            Septuagint (NL)
          </button>
          {psalm.liturgicalUses.length > 0 && (
            <button type="button" role="tab" id={id('tab-gebruik')} aria-controls={id('paneel')} aria-selected={tab === 'gebruik'} onClick={() => setTab('gebruik')}>
              Liturgisch gebruik
            </button>
          )}
        </div>
        {bediening}
      </div>

      <div id={id('paneel')} role="tabpanel" aria-labelledby={id(tab === 'tekst' ? 'tab-tekst' : 'tab-gebruik')} className="ps-paneel">
        {tab === 'gebruik' ? (
          <ul className="ps-gebruik">
            {psalm.liturgicalUses.map((g) => (
              <li key={g.dienst}>
                <span>
                  <b>{g.dienst}</b>
                  {g.onderdeel && ` · ${g.onderdeel}`} · {g.tijd}
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
            <div className="ps-verzen lees-tekst">
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
    </>
  );
}
