import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import NaarBoven from './NaarBoven';
import Leesbediening from './Leesbediening';
import NisKop from './NisKop';
import { ActieKnop, BannerBeeld, Sierlijn } from './onderdelen';
import { OPEN_DIENST_EVENT } from '../lib/events';
import { useFavorieten } from '../lib/favorieten';
import { gaNaar } from '../lib/navigatie';
import { usePaginaOpen } from '../lib/paginaOpen';
import { letterBeeld } from '../lib/letters';
import { ETMAAL_GROEPEN, KATHISMATA, PSALMEN, THEMAS, laadPsalmTeksten, psalmVanHetUur, zoekPsalmen, type Psalm, type PsalmTekst, type PsalmTeksten } from '../lib/psalmen';
import './Vandaag.css';
import './ontwerp.css';
import './psalmen-knoppen.css';

// De psalmteksten (±12 KB gecomprimeerd) meteen bij het starten ophalen, niet pas als het psalter of een dienst ze vraagt.
laadPsalmTeksten().catch(() => {});

// Psalmen volgens het overdrachtspakket (referentie gebeden-psalmen-adem.png, panelen 2 en 3):
// - #psalmen: het overzicht (kop met sterrengewelf, de P met het aantal psalmen, zoeken, alle filters, de nummers per
//   vijftig of de lijst, "Verder lezen" met de laatst geopende psalm);
// - #psalmen/50: de lezer als eigen weergave (terug, leesbediening, tabs, alle verzen, vorige/volgende psalm).
// Alleen echte data: teksten uit public/data/psalmen.json, gebruik uit het etmaal (lib/etmaal.ts).

// ponytail: introductietekst overgenomen uit de aangeleverde referentieontwerpen; nog door de redactie te bevestigen.
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

const AANTAL = PSALMEN.length;
const MET_TEKST = PSALMEN.filter((p) => p.hasText).length;
const BLOKKEN = Array.from({ length: Math.ceil(AANTAL / 50) }, (_, b) => ({ van: b * 50 + 1, tot: Math.min(AANTAL, b * 50 + 50) }));

// Laatst geopende psalm, voor "Verder lezen" (alleen op dit toestel).
const LAATST = 'psalmen-laatst';
const leesLaatst = () => {
  try {
    const n = Number(localStorage.getItem(LAATST));
    return n >= 1 && n <= AANTAL ? n : null;
  } catch {
    return null;
  }
};

// Deep link: #psalmen/50 opent Psalm 50 in de lezer; te gebruiken vanaf Vandaag, Etmaal, zoeken.
const psalmUitHash = () => {
  const n = Number(/^#psalmen\/(\d+)$/.exec(window.location.hash)?.[1]);
  return n >= 1 && n <= AANTAL ? n : null;
};

export default function Psalmen({ actief }: { actief: boolean }) {
  const open = usePaginaOpen('psalmen');
  const [teksten, setTeksten] = useState<PsalmTeksten | null>(null);
  const [laadFout, setLaadFout] = useState(false);
  const [lezen, setLezen] = useState(psalmUitHash);
  const [laatst, setLaatst] = useState(leesLaatst);
  const [zoek, setZoek] = useState('');
  const [filter, setFilter] = useState<Filter>('alle');
  const [kathismaNr, setKathismaNr] = useState(1);
  const kathisma = KATHISMATA[kathismaNr - 1];
  const [thema, setThema] = useState(THEMAS[0]);
  const favorieten = useFavorieten();

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

  // Het adres bepaalt de weergave: #psalmen is het overzicht, #psalmen/50 de lezer (ook met de terugknop van de browser).
  useEffect(() => {
    const opHash = () => {
      const n = psalmUitHash();
      setLezen(n);
      if (n) {
        try {
          localStorage.setItem(LAATST, String(n));
        } catch {
          /* geen opslag */
        }
        setLaatst(n);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };
    opHash();
    window.addEventListener('hashchange', opHash);
    return () => window.removeEventListener('hashchange', opHash);
  }, []);

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

  const raster = filter === 'alle' && !zoek.trim();
  // Het raster in delen van vijftig; begint bij het deel met de psalm van het uur.
  const [uurPsalm] = useState(() => psalmVanHetUur(new Date()));
  const [blok, setBlok] = useState(() => Math.floor((uurPsalm - 1) / 50));

  const kies = (p: Psalm) => gaNaar(`psalmen/${p.septuagintNumber}`);

  const rij = (p: Psalm, onder?: string) => (
    <button key={p.id} type="button" className={`psr-rij${p.hasText ? '' : ' is-zonder-tekst'}`} onClick={() => kies(p)}>
      <span className="psr-tekst">
        <span className="psr-titel">
          {p.title}
          {!p.hasText && <span className="sr-only">, tekst wordt nog toegevoegd</span>}
        </span>
        {onder && <span className="psr-onder">{onder}</span>}
      </span>
      <span className="psr-pijl" aria-hidden="true">
        ›
      </span>
    </button>
  );

  // De lezer: één psalm als eigen weergave.
  if (lezen) {
    const psalm = PSALMEN[lezen - 1];
    return (
      <section id="psalmen" className="vg ot-redesign ot-lezer">
        <div className="ot-lezer-strook" aria-hidden="true">
          <BannerBeeld naam="psalmen-banner" open={open} />
        </div>
        <article className="vg-papier ot-inhoud lees-vlak ot-lezer-vlak" aria-labelledby="ps-lezer-titel">
          <div className="ot-lezer-bediening">
            <a className="ot-terug" href="#psalmen"><ChevronLeft aria-hidden="true" /><span>Psalmen</span></a>
            {psalm.hasText && <Leesbediening audioSrc={psalm.audioSrc} deel={{ titel: psalm.title, pad: `psalmen/${psalm.septuagintNumber}` }} />}
          </div>
          <header className="ot-lezer-kop">
            <h1 id="ps-lezer-titel">{psalm.title}</h1>
            <p>Septuagint (NL){psalm.masoreticNumber ? ` · Psalm ${psalm.masoreticNumber} in de Hebreeuwse nummering` : ''}</p>
            <Sierlijn />
          </header>
          <PsalmLezer key={psalm.id} idVoorvoegsel="ps-lezer" psalm={psalm} tekst={teksten?.[lezen]} laadFout={laadFout} ontwerp />
          <Sierlijn />
          <nav className="ot-lezer-blader" aria-label="Bladeren door de psalmen">
            {lezen > 1 ? (
              <a className="ot-actie is-omlijnd" href={`#psalmen/${lezen - 1}`}><ChevronLeft aria-hidden="true" /><span>Vorige psalm</span></a>
            ) : <span />}
            {lezen < AANTAL ? (
              <a className="ot-actie" href={`#psalmen/${lezen + 1}`}><span>Volgende psalm</span><ChevronRight aria-hidden="true" /></a>
            ) : <span />}
          </nav>
        </article>
      </section>
    );
  }

  return (
    <>
      <section id="psalmen" className="vg ot-redesign ot-psalmen">
        <NisKop open={open} balk achter={<BannerBeeld naam="psalmen-banner" open={open} />} />
        <div className="vg-papier ot-inhoud">
          <h1 className="sr-only">Psalter</h1>

          <label className="ot-zoekveld">
            <Search aria-hidden="true" />
            <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek een psalm, woord of dienst" aria-label="Zoek een psalm op nummer, woord of dienst" />
          </label>

          {/* Bediening volgens het pakket "Psalmen tabbladen en boekrollen" (psalmen-knoppen.css): perkamenten tabbladen
              voor de filters, boekrollen voor de delen van vijftig. Zelfde state, filters en aantallen als hiervoor. */}
          <section className="psalm-controls" aria-label="Psalmen selecteren">
            <div className="pc-filters" role="group" aria-label="Psalmfilter">
              {FILTERS.map(([id, label]) => (
                <button key={id} type="button" className="pc-tab" aria-pressed={filter === id} onClick={() => setFilter(id)}>
                  {label}
                </button>
              ))}
            </div>

            {filter === 'kathisma' && (
              <div className="ot-segmenten ot-segmenten-klein" role="group" aria-label="Kathisma">
                {KATHISMATA.map((k) => (
                  <button key={k.nr} type="button" aria-pressed={k.nr === kathismaNr} aria-label={`Kathisma ${k.nr}`} onClick={() => setKathismaNr(k.nr)}>
                    {k.nr}
                  </button>
                ))}
              </div>
            )}

            {filter === 'themas' && (
              <div className="ot-segmenten" role="group" aria-label="Thema">
                {THEMAS.map((t) => (
                  <button key={t.naam} type="button" aria-pressed={t === thema} onClick={() => setThema(t)}>
                    {t.naam}
                  </button>
                ))}
              </div>
            )}

            <p className="pc-note">
              {MET_TEKST} van de {AANTAL} psalmen hebben al tekst{MET_TEKST < AANTAL ? '; de andere worden toegevoegd.' : '.'}
            </p>

            {raster && (
              <div className="pc-ranges" role="group" aria-label="Psalmreeks">
                {BLOKKEN.map((b, i) => (
                  <button key={b.van} type="button" className="pc-scroll" aria-label={`Psalmen ${b.van} tot en met ${b.tot}`} aria-pressed={blok === i} onClick={() => setBlok(i)}>
                    {b.van} – {b.tot}
                  </button>
                ))}
              </div>
            )}
          </section>

          {raster ? (
            <>
              <div className="ot-psalmraster" role="group" aria-label={`Psalm ${BLOKKEN[blok].van} tot ${BLOKKEN[blok].tot}`}>
                {PSALMEN.slice(BLOKKEN[blok].van - 1, BLOKKEN[blok].tot).map((p) => (
                  <button key={p.id} type="button" className={p.hasText ? 'heeft-tekst' : undefined} aria-label={`${p.title}${p.hasText ? '' : ', tekst wordt nog toegevoegd'}`} onClick={() => kies(p)}>
                    {p.septuagintNumber}
                  </button>
                ))}
              </div>
              <p className="ot-ps-legenda"><span className="ot-ps-stip" aria-hidden="true" /> heeft al tekst</p>
            </>
          ) : (
            <div className="psr-lijst ot-ps-lijst">
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
          )}

          {/* Verder lezen: de laatst geopende psalm; zonder leesgeschiedenis de psalm van dit uur */}
          <aside className="ot-verder" aria-label={laatst ? 'Verder lezen' : 'Psalm van dit uur'}>
            <div>
              <span className="ot-verder-label">{laatst ? 'Verder lezen' : 'Psalm van dit uur'}</span>
              <p>{PSALMEN[(laatst ?? uurPsalm) - 1].title}</p>
            </div>
            <ActieKnop href={`#psalmen/${laatst ?? uurPsalm}`}>Open de psalm</ActieKnop>
          </aside>
          <p className="ot-ps-intro">
            {INTRO} {INTRO_VERVOLG}
          </p>
        </div>
      </section>
      <NaarBoven />
    </>
  );
}

/** Tabs en tekst van één psalm; gedeeld door de lezer en het dienstvenster van Etmaal. Met `ontwerp` (alleen de lezer op
 *  #psalmen/…) een versierde eerste letter en de opmaak uit ontwerp.css; de tekst en nummering blijven ongewijzigd. */
export function PsalmLezer({ psalm, tekst, laadFout, idVoorvoegsel, ontwerp }: { psalm: Psalm; tekst?: PsalmTekst; laadFout: boolean; idVoorvoegsel: string; ontwerp?: boolean }) {
  const [tab, setTab] = useState<'tekst' | 'themas' | 'gebruik'>('tekst');
  // De Spotify-speler pas laden na een tik (geen Spotify-cookies zolang niemand luistert).
  const [speler, setSpeler] = useState(false);
  const aflevering = psalm.spotify?.split('/episode/')[1];
  const id = (s: string) => `${idVoorvoegsel}-${s}`;
  // De eerste vers-regel met tekst krijgt in de lezer de versierde eerste letter (schermlezers lezen de regel één keer).
  const eersteVers = ontwerp && tekst ? tekst.verzen.findIndex((v) => !v.kop && v.regels[0]?.trim()) : -1;

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
            {aflevering &&
              (speler ? (
                <div className="ps-speler-vak">
                <iframe
                  className="ps-speler"
                  title={`Podcast over ${psalm.title} op Spotify`}
                  src={`https://open.spotify.com/embed/episode/${aflevering}`}
                  width="100%"
                  height="80"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
                {/* Speelt de speler niet (bijvoorbeeld op een telefoon zonder Spotify-login in de browser), dan via de app */}
                <a className="ps-spotify-app" href={psalm.spotify} target="_blank" rel="noopener noreferrer">
                  Speelt hij niet? Open in Spotify ›
                </a>
                </div>
              ) : (
                <>
                  {/* Op een telefoon speelt de ingesloten Spotify-speler zonder Spotify-login alleen een voorbeeld: daar opent de knop de aflevering in de Spotify-app */}
                  <a className="ps-spotify ps-spotify-mobiel" href={psalm.spotify} target="_blank" rel="noopener noreferrer">
                    Beluister de podcast in Spotify ›
                  </a>
                  <button type="button" className="ps-spotify ps-spotify-web" onClick={() => setSpeler(true)}>
                    Beluister de podcast „Psalmen van de Vroege Kerk” ›
                  </button>
                </>
              ))}
            <div className={`ps-verzen lees-tekst${ontwerp ? ' ot-verzen' : ''}`}>
              {tekst.verzen.map((v, k) =>
                v.kop ? (
                  <p key={k} className="ps-stasis">
                    {v.kop}
                  </p>
                ) : (
                  <div key={k} className="ps-vers">
                    <span className="ps-versnr">{v.n ?? ''}</span>
                    <p>
                      {v.regels.map((r, j) => {
                        if (k !== eersteVers || j !== 0) return <span key={j}>{r}</span>;
                        // Eerste regel: versierde letter uit het alfabet en de rest van de regel; voor schermlezers de hele regel.
                        const tekstStart = r.trimStart();
                        const letter = tekstStart.charAt(0);
                        const beeld = letterBeeld(letter);
                        if (!beeld) return <span key={j}>{r}</span>;
                        return (
                          <span key={j} className="ot-eerste-regel">
                            <span className="sr-only">{tekstStart}</span>
                            <img className="ot-vers-initiaal" src={beeld} alt="" width={400} height={400} decoding="async" />
                            {/* De rest van het woord sluit op de voetlijn van de letter aan, zoals de dienst op Vandaag */}
                            <span className="ot-vers-rest" aria-hidden="true">{tekstStart.slice(1)}</span>
                          </span>
                        );
                      })}
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
