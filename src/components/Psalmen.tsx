import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import PageHero from './PageHero';
import NaarBoven from './NaarBoven';
import Modal from './Modal';
import Leesbediening from './Leesbediening';
import { OPEN_DIENST_EVENT } from '../lib/events';
import { useFavorieten } from '../lib/favorieten';
import { ETMAAL_GROEPEN, KATHISMATA, PSALMEN, THEMAS, laadPsalmTeksten, psalmVanHetUur, zoekPsalmen, type Psalm, type PsalmTekst, type PsalmTeksten } from '../lib/psalmen';

// Psalmen: een digitaal psalter. Desktop: lijst links, leesvenster rechts. Mobiel en tablet: de lijst op de pagina,
// een psalm opent in het gewone leesvenster (Modal). Opmaak: Bouw 72 en 74 in index.css.
// Alleen echte data: teksten uit public/data/psalmen.json, gebruik uit het etmaal (lib/etmaal.ts).

// ponytail: introductietekst overgenomen uit de aangeleverde referentieontwerpen; nog door de redactie te bevestigen.
// Mobiel toont alleen de eerste zin: zo blijft de intro kort en staat de lijst hoger.
const INTRO = 'De Psalmen zijn het gebed van de Kerk.';
const INTRO_VERVOLG = 'Zij verwoorden de vreugde, de wanhoop, de dank, de smeekbede en het vertrouwen van de mens voor God. Door alle tijden heen bidden de christenen de Psalmen, in het ritme van het etmaal en in alle omstandigheden van het leven.';

type Filter = 'alle' | 'etmaal' | 'kathisma' | 'themas' | 'favorieten';
const FILTERS: [Filter, string][] = [
  ['alle', 'Alle'],
  ['etmaal', 'Etmaal'],
  ['kathisma', 'Kathisma'],
  ['themas', "Thema's"],
  ['favorieten', 'Favorieten'],
];
// A–Z komt er pas bij als er gecontroleerde titels per psalm zijn.

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
  const [kathismaNr, setKathismaNr] = useState(1);
  const kathisma = KATHISMATA[kathismaNr - 1];
  const [thema, setThema] = useState(THEMAS[0]);
  const lijstRef = useRef<HTMLDivElement | null>(null);
  // Zolang je zelf geen psalm koos, volgt de gekozen psalm het uur: ook als de app lang open staat.
  const zelfGekozen = useRef(false);
  useEffect(() => {
    const ververs = () => {
      if (!zelfGekozen.current && document.visibilityState === 'visible') setGekozen(psalmVanHetUur(new Date()));
    };
    document.addEventListener('visibilitychange', ververs);
    window.addEventListener('hashchange', ververs);
    return () => {
      document.removeEventListener('visibilitychange', ververs);
      window.removeEventListener('hashchange', ververs);
    };
  }, []);
  const favorieten = useFavorieten();
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
    () => {
      if (groepen) return groepen.flatMap((g) => g.delen.flatMap((d) => d.psalmen.map((n) => PSALMEN[n - 1])));
      const basis =
        filter === 'etmaal'
          ? PSALMEN.filter((p) => p.liturgicalUses.length > 0)
          : filter === 'kathisma'
            ? PSALMEN.slice(kathisma.van - 1, kathisma.tot)
            : filter === 'themas'
              ? thema.psalmen.map((n) => PSALMEN[n - 1])
              : filter === 'favorieten'
              ? PSALMEN.filter((p) => favorieten.includes(`psalmen/${p.septuagintNumber}`))
              : PSALMEN;
      return zoekPsalmen(basis, zoek, teksten);
    },
    [groepen, filter, kathisma, thema, zoek, teksten, favorieten],
  );

  const kies = (p: Psalm) => {
    zelfGekozen.current = true;
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
        <span className="ps-rij-titel">{p.title}{!p.hasText && <> <span className="ps-rij-label">tekst volgt</span></>}</span>
        {onder && <span className="ps-rij-onder">{onder}</span>}
      </span>
      <span className="ps-pijl pijl" aria-hidden="true">›</span>
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
      <PageHero id="psalmen" titel="Psalmen" kop />

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
          </div>

          <div className="ps-filters" role="group" aria-label="Filter">
            {FILTERS.map(([id, label]) => (
              <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>
                {label}
              </button>
            ))}
          </div>

          {filter === 'kathisma' && (
            <div className="ps-kathismas ps-kies" role="group" aria-label="Kathisma">
              {KATHISMATA.map((k) => (
                <button key={k.nr} type="button" aria-pressed={k.nr === kathismaNr} aria-label={`Kathisma ${k.nr}`} onClick={() => setKathismaNr(k.nr)}>
                  {k.nr}
                </button>
              ))}
            </div>
          )}

          {filter === 'themas' && (
            <div className="ps-themas ps-kies" role="group" aria-label="Thema">
              {THEMAS.map((t) => (
                <button key={t.naam} type="button" aria-pressed={t === thema} onClick={() => setThema(t)}>
                  {t.naam}
                </button>
              ))}
            </div>
          )}

          <div className="ps-psalter">
            <div ref={lijstRef} className="ps-lijst">
              {lijst.length === 0 &&
                (filter === 'favorieten' && !zoek.trim() ? (
                  <p className="ps-leeg">Nog geen favorieten. Tik bij een psalm op de bladwijzer om hem hier te bewaren.</p>
                ) : (
                  <p className="ps-leeg">Geen psalmen gevonden{zoek.trim() ? ` voor “${zoek.trim()}”` : ''}.</p>
                ))}
              {filter === 'kathisma' && (
                <div className="ps-groep">
                  <h3>
                    Kathisma {kathisma.nr} <span>Psalm {kathisma.van === kathisma.tot ? kathisma.van : `${kathisma.van}–${kathisma.tot}`}</span>
                  </h3>
                  {kathisma.noot && <h4>{kathisma.noot}</h4>}
                </div>
              )}
              {filter === 'themas' && (
                <div className="ps-groep">
                  <h3>
                    {thema.naam} <span>{thema.psalmen.length} psalmen</span>
                  </h3>
                </div>
              )}
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
                : lijst.map((p) => {
                    const verzen = filter === 'themas' ? thema.verzen?.[p.septuagintNumber] : undefined;
                    return rij(p, verzen ? `Vers ${verzen}` : p.liturgicalUses.length ? `Etmaal · ${p.liturgicalUses.map((g) => g.dienst).join(', ')}` : undefined);
                  })}
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
              <PsalmLezer key={psalm.id} idVoorvoegsel="ps-pagina" psalm={psalm} tekst={teksten?.[gekozen]} laadFout={laadFout} bediening={psalm.hasText ? <Leesbediening audioSrc={psalm.audioSrc} deel={{ titel: psalm.title, pad: `psalmen/${psalm.septuagintNumber}` }} /> : undefined} />
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
          deel={{ titel: popupPsalm.title, pad: `psalmen/${popupPsalm.septuagintNumber}` }}
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
      <NaarBoven />
    </>
  );
}

/** Tabs en tekst van één psalm; gedeeld door het desktopvenster en het leesvenster op mobiel. */
function PsalmLezer({ psalm, tekst, laadFout, idVoorvoegsel, bediening }: { psalm: Psalm; tekst?: PsalmTekst; laadFout: boolean; idVoorvoegsel: string; bediening?: ReactNode }) {
  const [tab, setTab] = useState<'tekst' | 'themas' | 'gebruik'>('tekst');
  const id = (s: string) => `${idVoorvoegsel}-${s}`;

  return (
    <>
      <div className="ps-tabrij">
        <div className="ps-tabs" role="tablist" aria-label="Weergave">
          <button type="button" role="tab" id={id('tab-tekst')} aria-controls={id('paneel')} aria-selected={tab === 'tekst'} onClick={() => setTab('tekst')}>
            Septuagint (NL)
          </button>
          {psalm.themes.length > 0 && (
            <button type="button" role="tab" id={id('tab-themas')} aria-controls={id('paneel')} aria-selected={tab === 'themas'} onClick={() => setTab('themas')}>
              Thema's
            </button>
          )}
          {psalm.liturgicalUses.length > 0 && (
            <button type="button" role="tab" id={id('tab-gebruik')} aria-controls={id('paneel')} aria-selected={tab === 'gebruik'} onClick={() => setTab('gebruik')}>
              Liturgisch gebruik
            </button>
          )}
        </div>
        {bediening}
      </div>

      <div id={id('paneel')} role="tabpanel" aria-labelledby={id(`tab-${tab}`)} className="ps-paneel">
        {tab === 'themas' ? (
          <ul className="ps-gebruik">
            {psalm.themes.map((t) => (
              <li key={t}>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        ) : tab === 'gebruik' ? (
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
                  Open in het etmaal ›
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
