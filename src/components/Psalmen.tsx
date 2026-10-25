import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as ToetsEvent } from 'react';
import { BookOpen, Bookmark, ChevronLeft, ChevronRight, MoreHorizontal, Pause, Search, Volume2 } from 'lucide-react';
import NaarBoven from './NaarBoven';
import DeelKnop from './DeelKnop';
import NisKop from './NisKop';
import { ActieKnop, Sierlijn } from './onderdelen';
import { OPEN_DIENST_EVENT } from '../lib/events';
import { useFavorieten, wisselFavoriet } from '../lib/favorieten';
import { gaNaar } from '../lib/navigatie';
import { usePaginaOpen } from '../lib/paginaOpen';
import { useLeesvoorkeur, vergroot, verklein, wisselNacht } from '../lib/leesvoorkeur';
import { usePsalmAudio } from '../lib/psalmAudio';
import { useApp } from '../lib/context';
import { WEEKDAGEN, formatDag, parseYmd, ymd } from '../lib/kalender';
import { psalterlezingen, type Lezing } from '../lib/psalterlezing';
import Psalterlezing from './Psalterlezing';
import { ETMAAL_GROEPEN, KATHISMATA, PSALMEN, THEMAS, kathismaStappen, laadPsalmTeksten, psalmBereik, psalmVanHetUur, verzenVanStuk, zoekPsalmen, type Kathisma, type KathismaStap, type KathismaStuk, type Psalm, type PsalmTekst, type PsalmTeksten } from '../lib/psalmen';
import './Vandaag.css';
import './ontwerp.css';
import './psalmen-knoppen.css';

// De psalmteksten (±12 KB gecomprimeerd) meteen bij het starten ophalen, niet pas als het psalter of een dienst ze vraagt.
laadPsalmTeksten().catch(() => {});

// Psalmen volgens het overdrachtspakket (referentie gebeden-psalmen-adem.png, panelen 2 en 3):
// - #psalmen: het overzicht (kop met sterrengewelf, de P met het aantal psalmen, zoeken, alle filters, de nummers per
//   vijftig of de lijst, "Verder lezen" met de laatst geopende psalm);
// - #psalmen/50: de lezer als eigen weergave (compacte balk, tabs, alle verzen, vorige/volgende psalm);
//   #psalmen/50/12 opent op vers 12 (ook "Ga verder" gebruikt dit, met het laatst gelezen vers);
// - #psalmen/kathisma: dezelfde pagina "Per kathisma" (de twintig kathismata), #psalmen/kathisma/3 één kathisma met zijn
//   drie delen, #psalmen/kathisma/3/2/18 Psalm 18 in de lezer als deel 2 van kathisma 3 (vorige/volgende binnen het kathisma).
// Alleen echte data: teksten uit public/data/psalmen.json, gebruik uit het etmaal (lib/etmaal.ts).

// ponytail: introductietekst overgenomen uit de aangeleverde referentieontwerpen; nog door de redactie te bevestigen.
const INTRO = 'De Psalmen zijn het gebed van de Kerk.';
const INTRO_VERVOLG = 'Zij verwoorden de vreugde, de wanhoop, de dank, de smeekbede en het vertrouwen van de mens voor God. Door alle tijden heen bidden de christenen de Psalmen, in het ritme van het etmaal en in alle omstandigheden van het leven.';

// De kathismata staan sinds "Per kathisma" niet meer als filter bij "Per psalm".
type Filter = 'alle' | 'etmaal' | 'themas' | 'favorieten';
const FILTERS: [Filter, string][] = [
  ['alle', 'Alle'],
  ['etmaal', 'Etmaal'],
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

// Leesplek binnen de laatst geopende psalm: het eerste zichtbare vers ("50:12"), zodat hervatten ook bij een andere
// schermbreedte of tekstgrootte klopt. Alleen op dit toestel; ongeldig of ontbrekend = gewoon bovenaan beginnen.
const LEESPLEK = 'psalmen-leesplek';
const leesPlek = () => {
  try {
    const [nr, vers] = (localStorage.getItem(LEESPLEK) ?? '').split(':').map(Number);
    return nr >= 1 && nr <= AANTAL && vers >= 1 ? { nr, vers } : null;
  } catch {
    return null;
  }
};

// Deep link: #psalmen/50 opent Psalm 50 in de lezer (bovenaan), #psalmen/50/12 op vers 12. Vanaf Vandaag, Etmaal, zoeken.
const psalmUitHash = () => {
  const m = /^#psalmen\/(\d+)(?:\/(\d+))?$/.exec(window.location.hash);
  const nr = Number(m?.[1]);
  return nr >= 1 && nr <= AANTAL ? { nr, vers: Number(m?.[2]) || null } : null;
};

// Kathismata: #psalmen/kathisma (overzicht), #psalmen/kathisma/3 (één kathisma), #psalmen/kathisma/3/2/18 (lezen).
// Een onbekend kathisma geeft het overzicht; een psalm die niet bij dat deel hoort het kathisma zelf.
// Met ?datum=2026-10-17 (vanaf Vandaag en het etmaal) toont "Per kathisma" de psalterlezing van die datum; zonder: vandaag.
const kathismaUitHash = () => {
  const m = /^#psalmen\/kathisma(?:\/(\d+)(?:\/(\d)\/(\d+))?)?(?:\?datum=(\d{4}-\d{2}-\d{2}))?$/.exec(window.location.hash);
  if (!m) return null;
  const k = KATHISMATA[Number(m[1]) - 1] ?? null;
  const i = k ? kathismaStappen(k).findIndex((s) => s.deel === Number(m[2]) && s.psalm === Number(m[3])) : -1;
  const datum = m[4] && ymd(parseYmd(m[4])) === m[4] ? m[4] : null;
  return { k, i: i >= 0 ? i : null, datum };
};
const kathismaPad = (k: Kathisma | null, s?: KathismaStap, datum?: string | null) =>
  `#psalmen/kathisma${k ? `/${k.nr}` : ''}${k && s ? `/${s.deel}/${s.psalm}` : ''}${datum ? `?datum=${datum}` : ''}`;
const bevat = (l: Lezing, nr: number): boolean => (l.soort === 'keuze' ? l.opties.some((o) => bevat(o, nr)) : l.soort !== 'polyeleos' && l.nr === nr);
const datumTekst = (d: string) => `${WEEKDAGEN[parseYmd(d).getUTCDay()]} ${formatDag(parseYmd(d))} ${parseYmd(d).getUTCFullYear()}`;
/** "Psalm 18" of "Psalm 118, verzen 73–131" */
const stukNaam = (s: KathismaStuk) => `Psalm ${s.psalm}${s.vanVers ? `, verzen ${s.vanVers}–${s.totVers}` : ''}`;
const NIET_BESCHIKBAAR = 'Tekst nog niet beschikbaar';

// Diepte van een adres binnen de pagina: overzicht (0), één kathisma (1), lezer (2). Terug naar een minder diepe weergave
// zet de onthouden scrollpositie terug; dieper (een kathisma openen) brengt de tabbladen in beeld.
const diepte = (adres: string) => {
  const h = adres.split('?')[0];
  return /^#psalmen\/(\d+|kathisma\/\d+\/\d\/\d+)(\/|$)/.test(h) ? 2 : /^#psalmen\/kathisma\/\d+$/.test(h) ? 1 : 0;
};

export default function Psalmen({ actief }: { actief: boolean }) {
  const open = usePaginaOpen('psalmen');
  const [teksten, setTeksten] = useState<PsalmTeksten | null>(null);
  const [laadFout, setLaadFout] = useState(false);
  const [lezen, setLezen] = useState(psalmUitHash);
  const [kat, setKat] = useState(kathismaUitHash);
  // Scrollposities per adres binnen deze pagina, om na de lezer (of een kathisma) op dezelfde plek terug te komen.
  const posities = useRef<Record<string, number>>({});
  const vorigeHash = useRef(window.location.hash);
  const overgang = useRef<'terug' | 'dieper' | null>(null);
  const weergaveRef = useRef<HTMLDivElement | null>(null);
  const [laatst, setLaatst] = useState(leesLaatst);
  const [zoek, setZoek] = useState('');
  const [filter, setFilter] = useState<Filter>('alle');
  // Zolang niet alle psalmen tekst hebben: desgewenst alleen de psalmen met tekst tonen.
  const [alleenTekst, setAlleenTekst] = useState(false);
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
      const h = window.location.hash;
      // Binnen deze pagina: de plek van de vorige weergave onthouden (de pagina staat dan nog op die weergave).
      const zichtbaar = !document.getElementById('psalmen')?.closest('.pagina')?.classList.contains('pagina-verborgen');
      const vorige = vorigeHash.current;
      if (zichtbaar && vorige.startsWith('#psalmen')) {
        posities.current[vorige] = window.scrollY;
        overgang.current = diepte(h) < diepte(vorige) ? 'terug' : diepte(h) > diepte(vorige) ? 'dieper' : null;
      } else overgang.current = null;
      vorigeHash.current = h;
      setLezen(n);
      setKat(kathismaUitHash());
      if (n) {
        try {
          localStorage.setItem(LAATST, String(n.nr));
        } catch {
          /* geen opslag */
        }
        setLaatst(n.nr);
      }
    };
    opHash();
    window.addEventListener('hashchange', opHash);
    return () => window.removeEventListener('hashchange', opHash);
  }, []);

  const leest = !!lezen || (kat?.i ?? null) !== null;
  useLayoutEffect(() => {
    const actie = overgang.current;
    overgang.current = null;
    if (leest) return; // de lezer zet zichzelf bovenaan of bij het vers
    const y = posities.current[window.location.hash];
    if (actie === 'terug' && y !== undefined) window.scrollTo({ top: y, behavior: 'instant' });
    else if (actie === 'dieper' && (weergaveRef.current?.getBoundingClientRect().top ?? 0) < 0) weergaveRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [lezen, kat, leest]);

  // Etmaal zonder zoekterm: gegroepeerd per dienst, in de volgorde van het etmaal.
  const groepen = filter === 'etmaal' && !zoek.trim() && !alleenTekst ? ETMAAL_GROEPEN : null;
  const lijst = useMemo(
    () => {
      if (groepen) return groepen.flatMap((g) => g.delen.flatMap((d) => d.psalmen.map((n) => PSALMEN[n - 1])));
      const basis =
        filter === 'etmaal'
          ? PSALMEN.filter((p) => p.liturgicalUses.length > 0)
          : filter === 'themas'
            ? thema.psalmen.map((n) => PSALMEN[n - 1])
            : filter === 'favorieten'
              ? PSALMEN.filter((p) => favorieten.includes(`psalmen/${p.septuagintNumber}`))
              : PSALMEN;
      return zoekPsalmen(alleenTekst ? basis.filter((p) => p.hasText) : basis, zoek, teksten);
    },
    [groepen, filter, thema, zoek, teksten, favorieten, alleenTekst],
  );

  const raster = filter === 'alle' && !zoek.trim() && !alleenTekst;
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
  if (lezen) return <Lezer key={lezen.nr} nr={lezen.nr} vers={lezen.vers} tekst={teksten?.[lezen.nr]} laadFout={laadFout} />;
  if (kat?.k && kat.i !== null) {
    const psalm = kathismaStappen(kat.k)[kat.i].psalm;
    return <Lezer key={`k${kat.k.nr}-${kat.i}`} nr={psalm} vers={null} tekst={teksten?.[psalm]} laadFout={laadFout} kathisma={{ k: kat.k, i: kat.i, datum: kat.datum }} />;
  }
  const perKathisma = !!kat;
  // Tabbladen "Per psalm" en "Per kathisma": pijltjes, Home en End wisselen (en verplaatsen de focus), zoals bij tabs.
  const kiesWeergave = (kathisma: boolean) => gaNaar(kathisma ? 'psalmen/kathisma' : 'psalmen');
  const tabToets = (e: ToetsEvent<HTMLButtonElement>) => {
    const naar = e.key === 'ArrowRight' || e.key === 'End' ? 1 : e.key === 'ArrowLeft' || e.key === 'Home' ? 0 : -1;
    if (naar < 0) return;
    e.preventDefault();
    kiesWeergave(naar === 1);
    e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[naar]?.focus();
  };

  return (
    <>
      <section id="psalmen" className="vg ot-redesign ot-psalmen">
        {/* Mobiel: de kop van Verdieping (kerkgewelf) met het icoon van David in het midden; web: de brede banner met David */}
        <NisKop
          open={open}
          balk
          terug="#bidden"
          achter={
            <picture>
              <source media="(min-width: 768px)" srcSet="/images/ontwerp/psalmen-banner-800.webp 800w, /images/ontwerp/psalmen-banner-1536.webp 1536w" sizes="1360px" width={1536} height={512} />
              <img className="ot-banner ot-ps-gewelf" src="/images/vandaag/kerk-header-800.webp" srcSet="/images/vandaag/kerk-header-800.webp 800w, /images/vandaag/kerk-header-1536.webp 1536w" sizes="100vw" alt="" width={1536} height={1024} fetchPriority={open ? 'high' : 'auto'} decoding="async" />
            </picture>
          }
        >
          <img className="ot-ps-icoon" src="/images/psalmen/david-icoon.webp" alt="Icoon van de heilige profeet en koning David" width={600} height={726} decoding="async" />
        </NisKop>
        <div className="vg-papier ot-inhoud">
          <h1 className="sr-only">Psalter</h1>

          <div ref={weergaveRef} className="ot-ps-weergave" role="tablist" aria-label="Indeling van de psalmen">
            <button type="button" role="tab" id="ps-tab-psalm" aria-controls="ps-weergave" aria-selected={!perKathisma} tabIndex={perKathisma ? -1 : 0} onClick={() => kiesWeergave(false)} onKeyDown={tabToets}>
              Per psalm
            </button>
            <button type="button" role="tab" id="ps-tab-kathisma" aria-controls="ps-weergave" aria-selected={perKathisma} tabIndex={perKathisma ? 0 : -1} onClick={() => kiesWeergave(true)} onKeyDown={tabToets}>
              Per kathisma
            </button>
          </div>

          <div id="ps-weergave" role="tabpanel" aria-labelledby={perKathisma ? 'ps-tab-kathisma' : 'ps-tab-psalm'}>
          {perKathisma ? (
            kat.k ? <KathismaDelen k={kat.k} datum={kat.datum} /> : <KathismaOverzicht datum={kat.datum} />
          ) : (
          <>
          <label className="ot-zoekveld">
            <Search aria-hidden="true" />
            <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek een psalm, woord of dienst" aria-label="Zoek een psalm op nummer, woord of dienst" />
          </label>

          {/* Bediening volgens het pakket "Psalmen tabbladen en boekrollen" (psalmen-knoppen.css): perkamenten tabbladen
              voor de filters, tekstkoppen op een gouden lijn voor de delen van vijftig. Zelfde state, filters en aantallen als hiervoor. */}
          <section className="psalm-controls" aria-label="Psalmen selecteren">
            <div className="pc-filters" role="group" aria-label="Psalmfilter">
              {FILTERS.map(([id, label]) => (
                <button key={id} type="button" className="pc-tab" aria-pressed={filter === id} onClick={() => setFilter(id)}>
                  {label}
                </button>
              ))}
            </div>

            {filter === 'themas' && (
              <div className="ot-segmenten" role="group" aria-label="Thema">
                {THEMAS.map((t) => (
                  <button key={t.naam} type="button" aria-pressed={t === thema} onClick={() => setThema(t)}>
                    {t.naam}
                  </button>
                ))}
              </div>
            )}

            {MET_TEKST < AANTAL && (
              <label className="pc-note pc-alleen">
                <input type="checkbox" checked={alleenTekst} onChange={(e) => setAlleenTekst(e.target.checked)} />
                <span>Alleen psalmen met tekst ({MET_TEKST} van de {AANTAL})</span>
              </label>
            )}

            {raster && (
              <div className="pc-ranges" role="group" aria-label="Psalmreeks">
                {BLOKKEN.map((b, i) => (
                  <button key={b.van} type="button" className="pc-scroll" aria-label={`Psalmen ${b.van} tot en met ${b.tot}`} aria-pressed={blok === i} onClick={() => setBlok(i)}>
                    Psalmen {b.van}–{b.tot}
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
          </>
          )}
          </div>

          {/* Verder lezen: alleen met echte leesgeschiedenis op dit toestel; hervat op het laatst gelezen vers */}
          {laatst && (() => {
            const plek = leesPlek();
            return (
              <aside className="ot-verder" aria-label="Verder lezen">
                <div>
                  <span className="ot-verder-label">Verder lezen</span>
                  <p>{PSALMEN[laatst - 1].title}</p>
                </div>
                <ActieKnop href={plek?.nr === laatst ? `#psalmen/${laatst}/${plek.vers}` : `#psalmen/${laatst}`}>Ga verder</ActieKnop>
              </aside>
            );
          })()}
          <p className="ot-ps-intro">
            {INTRO} {INTRO_VERVOLG}
          </p>
        </div>
      </section>
      <NaarBoven />
    </>
  );
}

const KATHISMA_UITLEG = 'Het Psalter is verdeeld in twintig kathisma’s. Elk kathisma bestaat uit drie delen. De nummering volgt de Septuaginta.';

/** Per kathisma: de psalterlezing van de datum, en de twintig kathismata als klikbare kaarten (vaste volgorde). */
function KathismaOverzicht({ datum }: { datum: string | null }) {
  const { mode, vandaagYmd } = useApp();
  const dag = datum ?? vandaagYmd;
  return (
    <>
      <section className="ot-kt-psalter" aria-labelledby="ot-kt-psalter-kop">
        <h2 id="ot-kt-psalter-kop">Psalterlezing</h2>
        <p className="psl-datum">
          <time dateTime={dag}>{datumTekst(dag)}</time>
          {dag === vandaagYmd ? ' · vandaag' : ''}
        </p>
        <Psalterlezing datum={dag} mode={mode} />
      </section>
      <p className="ot-kt-uitleg">{KATHISMA_UITLEG}</p>
      <ul className="ot-kt-raster">
        {KATHISMATA.map((k) => (
          <li key={k.nr}>
            <a className="ot-kt-kaart" href={kathismaPad(k, undefined, datum)}>
              <span className="ot-kt-titel">Kathisma {k.nr}</span>
              <span className="ot-kt-onder">{psalmBereik(k.van, k.tot)}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Eén kathisma: de drie delen met hun psalmen. Psalmen met tekst openen de lezer (in dit kathisma), de andere zijn
 *  gewone tekst met "Tekst nog niet beschikbaar". */
function KathismaDelen({ k, datum }: { k: Kathisma; datum: string | null }) {
  const { mode } = useApp();
  const stappen = kathismaStappen(k);
  // Binnengekomen met een datum (Vandaag, etmaal): bij welke dienst van die datum dit kathisma hoort
  const bij = datum ? Object.values(psalterlezingen(datum, mode)).filter((r) => r.lezingen.some((l) => bevat(l, k.nr))) : [];
  return (
    <section className="ot-kt" aria-labelledby="ot-kt-titel">
      <a className="ot-kt-terug" href={kathismaPad(null, undefined, datum)}>
        <ChevronLeft aria-hidden="true" />
        <span>Alle kathisma’s</span>
      </a>
      <header className="ot-kt-kop">
        <h2 id="ot-kt-titel">Kathisma {k.nr}</h2>
        <p>{psalmBereik(k.van, k.tot)}</p>
        {k.noot && <p className="ot-kt-noot">{k.noot}</p>}
        {datum && bij.length > 0 && (
          <p className="ot-kt-vandaag">
            {datumTekst(datum)}: {bij.map((r) => (r.dienst === 'metten' ? 'Metten' : 'Vespers')).join(' en ')}
          </p>
        )}
      </header>
      {k.delen.map((deel, d) => {
        const beschikbaar = deel.filter((s) => PSALMEN[s.psalm - 1].hasText).length;
        return (
          <section key={d} className="ot-kt-deel" aria-labelledby={`ot-kt-deel-${d + 1}`}>
            <h3 id={`ot-kt-deel-${d + 1}`}>
              Deel {d + 1} {deel.length > 1 && <span>{psalmBereik(deel[0].psalm, deel[deel.length - 1].psalm)}</span>}
            </h3>
            {deel.length > 1 && beschikbaar > 0 && beschikbaar < deel.length && (
              <p className="ot-kt-stand">
                {beschikbaar} van de {deel.length} psalmen {beschikbaar === 1 ? 'heeft' : 'hebben'} al tekst.
              </p>
            )}
            <ul className="ot-kt-lijst">
              {deel.map((s) => {
                const stap = stappen.find((t) => t.deel === d + 1 && t.psalm === s.psalm)!;
                return (
                  <li key={s.psalm}>
                    {PSALMEN[s.psalm - 1].hasText ? (
                      <a href={kathismaPad(k, stap, datum)}>
                        <span>{stukNaam(s)}</span>
                        <span className="ot-kt-pijl" aria-hidden="true">›</span>
                      </a>
                    ) : (
                      <div className="is-zonder-tekst">
                        <span>{stukNaam(s)}</span>
                        <span className="ot-kt-mist">{NIET_BESCHIKBAAR}</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </section>
  );
}

/** De psalm als eigen leesweergave: compacte balk, tabs en tekst (PsalmLezer), vorige/volgende psalm. Hervat op `vers`
 *  (verslink of "Ga verder") en houdt tijdens het lezen het eerste zichtbare vers bij. */
function Lezer({ nr, vers, tekst, laadFout, kathisma }: { nr: number; vers: number | null; tekst?: PsalmTekst; laadFout: boolean; kathisma?: { k: Kathisma; i: number; datum: string | null } }) {
  const psalm = PSALMEN[nr - 1];
  // Vanuit een kathisma: de stap in de leesvolgorde van dat kathisma; bij Psalm 118 alleen de verzen van dat deel.
  const k = kathisma?.k;
  const stappen = k ? kathismaStappen(k) : [];
  const i = kathisma?.i ?? 0;
  const stap = k ? stappen[i] : undefined;
  const deelVerzen = stap?.vanVers && tekst ? verzenVanStuk(tekst, stap) : undefined;
  const leesTekst = tekst && deelVerzen ? { ...tekst, verzen: deelVerzen } : tekst;
  const blader = (s: KathismaStap) => `${s.deel !== stap?.deel ? `Deel ${s.deel} · ` : ''}${stukNaam(s)}${PSALMEN[s.psalm - 1].hasText ? '' : ` · ${NIET_BESCHIKBAAR.toLowerCase()}`}`;
  const pad = `psalmen/${nr}`;
  const { nacht, min, max } = useLeesvoorkeur();
  const bewaard = useFavorieten().includes(pad);
  const audio = usePsalmAudio(psalm.hasText ? psalm.audioSrc : undefined);
  const vlakRef = useRef<HTMLElement | null>(null);
  const balkRef = useRef<HTMLDivElement | null>(null);
  const meerRef = useRef<HTMLDetailsElement | null>(null);

  // Openen: bovenaan, of bij een vers (zodra de tekst er is). Vóór het tekenen, dus zonder zichtbaar verspringen.
  // Nogmaals vlak voor het tekenen: bij een paginawissel zet App.tsx daarna nog de onthouden scrollpositie van de pagina.
  useLayoutEffect(() => {
    const plaats = () => {
      const doel = vers ? document.getElementById(`ps-vers-${vers}`) : null;
      if (doel) doel.scrollIntoView({ block: 'start', behavior: 'instant' });
      else if (!vers || tekst || laadFout || !psalm.hasText) window.scrollTo({ top: 0, behavior: 'instant' });
    };
    plaats();
    const frame = requestAnimationFrame(plaats);
    return () => cancelAnimationFrame(frame);
  }, [vers, tekst, laadFout, psalm.hasText]);

  // Leesplek bijhouden: pas na het openen (het herstel telt niet als lezen), gedempt, het eerste vers onder de balk.
  useEffect(() => {
    if (!tekst) return;
    let timer = 0;
    const opScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        // Bovenrand van het leesbare deel: onder de plakkende balk (mobiel) of de vaste sitekop (web)
        const rand = Math.max(balkRef.current?.getBoundingClientRect().bottom ?? 0, document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0, 0) + 8;
        const zichtbaar = [...(vlakRef.current?.querySelectorAll<HTMLElement>('[id^="ps-vers-"]') ?? [])].find((v) => v.getBoundingClientRect().bottom > rand);
        if (!zichtbaar) return;
        try {
          localStorage.setItem(LEESPLEK, `${nr}:${zichtbaar.id.slice('ps-vers-'.length)}`);
        } catch {
          /* geen opslag */
        }
      }, 250);
    };
    const start = window.setTimeout(() => window.addEventListener('scroll', opScroll, { passive: true }), 400);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(timer);
      window.removeEventListener('scroll', opScroll);
    };
  }, [nr, tekst]);

  // Het "Meer"-menu sluit met Escape (focus terug op de knop) en bij een klik ernaast.
  useEffect(() => {
    const buiten = (e: MouseEvent) => {
      if (meerRef.current?.open && !meerRef.current.contains(e.target as Node)) meerRef.current.open = false;
    };
    document.addEventListener('click', buiten);
    return () => document.removeEventListener('click', buiten);
  }, []);

  return (
    <section id="psalmen" className="vg ot-redesign ot-lezer">
      <article ref={vlakRef} className="vg-papier ot-inhoud lees-vlak ot-lezer-vlak" aria-labelledby="ps-lezer-titel">
        <div ref={balkRef} className="ot-lezer-balk" role="toolbar" aria-label="Leesbediening">
          <a className="ot-terug" href={k ? kathismaPad(k, undefined, kathisma?.datum) : '#psalmen'}><ChevronLeft aria-hidden="true" />{k ? <span>Kathisma<span className="ot-terug-nr"> {k.nr}</span></span> : <span>Psalmen</span>}</a>
          <span className="ot-lezer-nr" aria-hidden="true">{stap ? `Deel ${stap.deel}` : `Psalm ${nr}`}</span>
          <div className="ot-lezer-knoppen">
            {/* Zelfde volgorde als de leesbediening van gebeden en heiligenlevens (Leesbediening.tsx): A+ · A− · avondweergave */}
            <button type="button" onClick={vergroot} disabled={max} aria-label="Tekst vergroten" title="Tekst vergroten"><span className="ot-lb-a is-groot">A<sup>+</sup></span></button>
            <button type="button" onClick={verklein} disabled={min} aria-label="Tekst verkleinen" title="Tekst verkleinen"><span className="ot-lb-a">A<sup>−</sup></span></button>
            <button type="button" onClick={wisselNacht} aria-pressed={nacht} aria-label="Avondweergave" title="Avondweergave"><BookOpen aria-hidden="true" /></button>
            <button type="button" onClick={() => wisselFavoriet(pad)} aria-pressed={bewaard} aria-label="Bewaren bij favorieten" title={bewaard ? 'Bewaard bij favorieten' : 'Bewaren bij favorieten'}><Bookmark aria-hidden="true" /></button>
            <details
              ref={meerRef}
              className="ot-lezer-meer"
              onKeyDown={(e) => {
                if (e.key === 'Escape' && meerRef.current?.open) {
                  meerRef.current.open = false;
                  meerRef.current.querySelector('summary')?.focus();
                }
              }}
            >
              <summary aria-label="Meer leesopties" title="Meer leesopties"><MoreHorizontal aria-hidden="true" /></summary>
              <div className="ot-lezer-menu">
                {audio.beschikbaar && (
                  <button type="button" onClick={audio.wissel}>{audio.speelt ? <Pause aria-hidden="true" /> : <Volume2 aria-hidden="true" />}<span>{audio.speelt ? 'Audio pauzeren' : 'Audio afspelen'}</span></button>
                )}
                <DeelKnop titel={psalm.title} pad={pad} label />
              </div>
            </details>
          </div>
        </div>
        <header className="ot-lezer-kop">
          {k && stap && <p className="ot-lezer-context">Kathisma {k.nr} · Deel {stap.deel}</p>}
          <h1 id="ps-lezer-titel">{psalm.title}</h1>
          {stap?.vanVers && <p className="ot-lezer-verzen">Verzen {stap.vanVers}–{stap.totVers}</p>}
          <p>Septuagint (NL){psalm.masoreticNumber ? ` · Psalm ${psalm.masoreticNumber} in de Hebreeuwse nummering` : ''}</p>
          <Sierlijn />
        </header>
        {/* Geen betrouwbare versnummers voor dit deel: niet knippen, de hele psalm tonen */}
        {deelVerzen === null && <p className="ps-leeg">De afzonderlijke versgedeelten zijn nog niet beschikbaar; hieronder staat de volledige {psalm.title}.</p>}
        <PsalmLezer idVoorvoegsel="ps-lezer" psalm={psalm} tekst={leesTekst} laadFout={laadFout} ontwerp {...(k ? { zonderTekst: `${NIET_BESCHIKBAAR}.` } : {})} />
        {k && stap ? (
          <nav className="ot-lezer-blader ot-lezer-blader-kt" aria-label={`Bladeren in kathisma ${k.nr}`}>
            {i > 0 ? (
              <a href={kathismaPad(k, stappen[i - 1], kathisma?.datum)}><ChevronLeft aria-hidden="true" /><span>Vorige<small>{blader(stappen[i - 1])}</small></span></a>
            ) : (
              <a href={kathismaPad(k, undefined, kathisma?.datum)}><ChevronLeft aria-hidden="true" /><span>Kathisma {k.nr}<small>Alle delen</small></span></a>
            )}
            {i < stappen.length - 1 ? (
              <a href={kathismaPad(k, stappen[i + 1], kathisma?.datum)} className="is-volgende"><span>Volgende<small>{blader(stappen[i + 1])}</small></span><ChevronRight aria-hidden="true" /></a>
            ) : (
              <a href={kathismaPad(k, undefined, kathisma?.datum)} className="is-volgende"><span>Einde van kathisma {k.nr}<small>Terug naar de delen</small></span><ChevronRight aria-hidden="true" /></a>
            )}
          </nav>
        ) : (
          <nav className="ot-lezer-blader" aria-label="Bladeren door de psalmen">
            {nr > 1 ? <a href={`#psalmen/${nr - 1}`}><ChevronLeft aria-hidden="true" /><span>Vorige psalm</span></a> : <span />}
            {nr < AANTAL ? <a href={`#psalmen/${nr + 1}`} className="is-volgende"><span>Volgende psalm</span><ChevronRight aria-hidden="true" /></a> : <span />}
          </nav>
        )}
      </article>
    </section>
  );
}

/** Tabs en tekst van één psalm; gedeeld door de lezer en het dienstvenster van Etmaal. Met `ontwerp` (alleen de lezer op
 *  #psalmen/…) een versierde eerste letter en de opmaak uit ontwerp.css; de tekst en nummering blijven ongewijzigd. */
export function PsalmLezer({ psalm, tekst, laadFout, idVoorvoegsel, ontwerp, zonderTekst = 'Tekst wordt toegevoegd.' }: { psalm: Psalm; tekst?: PsalmTekst; laadFout: boolean; idVoorvoegsel: string; ontwerp?: boolean; zonderTekst?: string }) {
  const [tab, setTab] = useState<'tekst' | 'themas' | 'gebruik'>('tekst');
  // De Spotify-speler pas laden na een tik (geen Spotify-cookies zolang niemand luistert).
  const [speler, setSpeler] = useState(false);
  const aflevering = psalm.spotify?.split('/episode/')[1];
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
          <p className="ps-leeg">{zonderTekst}</p>
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
                  <div key={k} className={`ps-vers${v.n ? ' heeft-nr' : ''}`} id={ontwerp && v.n ? `ps-vers-${v.n}` : undefined}>
                    <span className="ps-versnr">{v.n ?? ''}</span>
                    <p>
                      {v.regels.map((r, j) => <span key={j}>{r}</span>)}
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
