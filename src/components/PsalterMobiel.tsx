import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Bookmark, ChevronLeft, ChevronRight, Headphones, Search } from 'lucide-react';
import { useFavorieten, wisselFavoriet } from '../lib/favorieten';
import { KATHISMATA, PSALMEN, beginMetHoofdletter, kathismaStappen, psalmBereik, verzenVanStuk, zoekPsalmen, type Kathisma, type KathismaStap, type Psalm, type PsalmBlok, type PsalmTekst, type PsalmTeksten } from '../lib/psalmen';
import DeelKnop from './DeelKnop';
import Leesbediening from './Leesbediening';
import { Kop, Laag, Sierlijn } from './MobielLaag';
import { vorigeAdres } from '../lib/vorigAdres';
import { KATHISMA_UITLEG, LEESPLEK, NIET_BESCHIKBAAR, kathismaPad, leesPlek, stukNaam } from './psalmenAdres';
import { useApp } from '../lib/context';
import Psalterlezing from './Psalterlezing';
import { SIERKRUIS } from './symbolen';
import './psalter-mobiel.css';

// Het Psalter op mobiel (< 768 px), volgens de goedgekeurde mock-up (07-psalter), met de bestaande adressen:
//   #psalmen (en #psalmen/lijst)        de lijst van alle psalmen (filters, thema's, favorieten), met een knop naar:
//   #psalmen/kathisma                   1. overzicht: banner, zoeken, verder lezen, de twintig kathisma's
//   #psalmen/kathisma/3                 2. één kathisma: de drie stasen, "Bid de volledige kathisma", de psalmen
//   #psalmen/50, #psalmen/kathisma/3/2/18  3/4. de psalm lezen (licht of avondweergave, de bestaande leesvoorkeur)
//   #psalmen/kathisma/3/geheel          het hele kathisma doorlopend
// Alleen bestaande gegevens: lib/psalmen.ts (nummering, kathisma's, stasen) en public/data/psalmen.json (de teksten).

const BANNER = '/images/psalmen/manuscript';
// Alleen de Septuagint-nummering (LXX).
const nummer = (p: Psalm) => `${p.septuagintNumber}`;
const kathismaVan = (nr: number) => KATHISMATA.find((k) => k.delen.flat().some((s) => s.psalm === nr));

/** Verder lezen (of beginnen) waar je gebleven was; op de beginpagina van het Psalter (de lijst van alle psalmen). */
export function VerderLezen({ laatst }: { laatst: number | null }) {
  const plek = leesPlek();
  const verder = laatst ? (plek?.nr === laatst ? `#psalmen/${laatst}/${plek.vers}` : `#psalmen/${laatst}`) : kathismaPad(KATHISMATA[0]);
  return (
    <a className="pm-verder" href={verder}>
      <span className="pm-verder-boek"><BookOpen strokeWidth={1.3} aria-hidden="true" /></span>
      <span className="pm-rij-tekst">
        <b>{laatst ? 'Verder lezen' : 'Begin met lezen'}</b>
        <span>{laatst ? `${PSALMEN[laatst - 1].title}${plek?.nr === laatst ? `, vanaf vers ${plek.vers}` : ''}` : 'Nog niet gelezen: begin bij kathisma 1'}</span>
      </span>
      <ChevronRight className="am-pijl" aria-hidden="true" />
    </a>
  );
}

/** Wat je vandaag bidt: de psalterlezing van vandaag (Metten en Vespers), dezelfde gegevens als op de webversie. */
export function PsalterVandaag() {
  const { mode, vandaagYmd } = useApp();
  return (
    <section className="pm-vandaag" aria-labelledby="pm-vandaag-kop">
      <h2 id="pm-vandaag-kop" className="am-label pm-kop">Vandaag in het Psalter</h2>
      <Psalterlezing datum={vandaagYmd} mode={mode} />
    </section>
  );
}

// 1. Overzicht van de kathisma's
export function PsalterOverzicht({ teksten }: { teksten: PsalmTeksten | null }) {
  const [zoek, setZoek] = useState('');
  const gevonden = useMemo(() => (zoek.trim() ? zoekPsalmen(PSALMEN, zoek, teksten) : []), [zoek, teksten]);
  return (
    <section id="psalmen" className="am pm">
      <PsalterBanner terug="#psalmen" titel="Kathisma’s" onder="Het Psalter in twintig delen" />
      <div className="pm-papier">
        <label className="pm-zoek">
          <Search aria-hidden="true" />
          <span className="sr-only">Zoek een psalm op nummer, woord of dienst</span>
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek een psalm, woord of dienst" autoComplete="off" />
        </label>
        {zoek.trim() ? (
          <section aria-live="polite" aria-label="Zoekresultaten">
            <p className="pm-aantal">{gevonden.length === 1 ? '1 psalm' : `${gevonden.length} psalmen`}</p>
            <ul className="pm-lijst">
              {gevonden.slice(0, 60).map((p) => (
                <li key={p.id}>
                  <PsalmRij p={p} href={`#psalmen/${p.septuagintNumber}`} />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <>
            <h2 className="am-label pm-kop">De twintig kathisma’s</h2>
            <p className="pm-uitleg">{KATHISMA_UITLEG}</p>
            <ul className="pm-raster">
              {KATHISMATA.map((k) => (
                <li key={k.nr}>
                  <a href={kathismaPad(k)} aria-label={`Kathisma ${k.nr}, ${psalmBereik(k.van, k.tot)}`}>
                    <small>Kathisma</small>
                    <b>{k.nr}</b>
                    <span className="pm-bereik" aria-hidden="true">{psalmBereik(k.van, k.tot).replace(/^Psalmen? /, '')}</span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

/** De manuscriptbanner van het Psalter (overzicht en de lijst van alle psalmen); met `terug` een terugpijl bovenin. */
export function PsalterBanner({ terug, titel = 'Psalter', onder = 'De psalmen als gebed' }: { terug?: string; titel?: string; onder?: string }) {
  return (
    <div className="pm-banner">
      <img src={`${BANNER}-800.webp`} srcSet={`${BANNER}-800.webp 800w, ${BANNER}-1600.webp 1600w`} sizes="100vw" alt="" width={1672} height={941} decoding="async" />
      {terug ? (
        <div className="pm-banner-kop">
          <Kop terug={terug} merk />
        </div>
      ) : (
        <p className="am-merk pm-merk">Orthodoxe Tijd</p>
      )}
      <div className="pm-banner-tekst">
        <h1 className="pm-titel">{titel}</h1>
        <p className="am-onder">{onder}</p>
        <Sierlijn />
      </div>
    </div>
  );
}

function PsalmRij({ p, href, onder }: { p: Psalm; href?: string; onder?: string }) {
  const tekst = (
    <span className="pm-rij-tekst">
      <b>Psalm {nummer(p)}</b>
      <span>{p.hasText ? (onder ?? p.subtitle ?? '') : NIET_BESCHIKBAAR}</span>
    </span>
  );
  return p.hasText && href ? (
    <a className="pm-psalm" href={href}>
      {tekst}
      <ChevronRight className="am-pijl" aria-hidden="true" />
    </a>
  ) : (
    <div className="pm-psalm is-zonder-tekst">{tekst}</div>
  );
}

// 2. Eén kathisma
export function PsalterKathisma({ k, datum }: { k: Kathisma; datum: string | null }) {
  const stappen = kathismaStappen(k);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [k.nr]);
  return (
    <section id="psalmen" className="am pm pm-kat">
      <div className="pm-kat-balk">
        <Kop terug={kathismaPad(null, undefined, datum)} merk />
      </div>
      <div className="pm-papier pm-kat-papier">
        <p className="am-label pm-midden">Het Psalter</p>
        <h1 className="pm-kat-titel">Kathisma {k.nr}</h1>
        <p className="pm-kat-onder">Drie stasen</p>
        <Sierlijn />
        {k.noot && <p className="pm-noot">{k.noot}</p>}
        <ul className="pm-stasen">
          {k.delen.map((deel, d) => {
            const eerste = stappen.find((s) => s.deel === d + 1)!;
            return (
              <li key={d}>
                <a className="pm-stasis" href={kathismaPad(k, eerste, datum)}>
                  <span className="pm-tegel">{SIERKRUIS}</span>
                  <span className="pm-rij-tekst">
                    <b>Stasis {d + 1}</b>
                    <span>{deel.length > 1 ? psalmBereik(deel[0].psalm, deel[deel.length - 1].psalm) : stukNaam(deel[0])}</span>
                  </span>
                  <ChevronRight className="am-pijl" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
        <a className="pm-geheel" href={`#psalmen/kathisma/${k.nr}/geheel${datum ? `?datum=${datum}` : ''}`}>
          <BookOpen strokeWidth={1.3} aria-hidden="true" />
          <span>Bid de volledige kathisma</span>
          <ChevronRight aria-hidden="true" />
        </a>
        <Sierlijn />
        <h2 className="am-label pm-kop">Afzonderlijke psalmen</h2>
        <ul className="pm-lijst">
          {stappen.map((s) => (
            <li key={`${s.deel}-${s.psalm}-${s.vanVers ?? ''}`}>
              <PsalmRij p={PSALMEN[s.psalm - 1]} href={kathismaPad(k, s, datum)} onder={`Stasis ${s.deel}${s.vanVers ? ` · verzen ${s.vanVers}–${s.totVers}` : ''}`} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** De verzen van een psalm: grote rode beginletter per vers, versnummer rechts, regels in de leeskolom. */
// Initialen zoals de uitgave: een grote initiaal aan het begin van de psalm (PsalmBlok.begin, lib/psalmen.ts), daarna een
// rode, vette hoofdletter op regelhoogte bij elk vers dat met een hoofdletter begint.
function Verzen({ verzen, idVoorvoegsel }: { verzen: PsalmBlok[]; idVoorvoegsel: string }) {
  return (
    <div className="pm-verzen lees-tekst">
      {verzen.map((v, i) =>
        v.kop ? (
          <p key={i} className="pm-stasis-kop">{v.kop}</p>
        ) : (
          <div key={i} className={`pm-vers${beginMetHoofdletter(v.regels) ? ' met-initiaal' : ''}${v.begin ? ' is-begin' : ''}`} id={v.n ? `${idVoorvoegsel}-${v.n}` : undefined}>
            <p>
              {v.regels.map((r, j) => (
                <span key={j}>{r}</span>
              ))}
            </p>
            {v.n ? <span className="pm-versnr" aria-label={`vers ${v.n}`}>{v.n}</span> : null}
          </div>
        ),
      )}
    </div>
  );
}

function LeesKop({ terug, titel, deelPad, audioSrc, leeg, slim }: { terug: string; titel: string; deelPad: string; audioSrc?: string; leeg?: boolean; slim?: boolean }) {
  const [bediening, setBediening] = useState(false);
  const bewaard = useFavorieten().includes(deelPad);
  return (
    <>
      <Kop
        terug={terug}
        licht
        slim={slim}
        rechts={
          <>
            <button type="button" className="am-knopje am-aa" aria-expanded={bediening} aria-label="Tekstgrootte, avondweergave en audio" onClick={() => setBediening((b) => !b)}>
              Aa
            </button>
            {/* Bewaren en delen alleen als er tekst is (een lege pagina bewaar je niet) */}
            {!leeg && (
              <>
                <button type="button" className="am-knopje" aria-pressed={bewaard} aria-label="Bewaren bij favorieten" title={bewaard ? 'Bewaard bij favorieten' : 'Bewaren bij favorieten'} onClick={() => wisselFavoriet(deelPad)}>
                  <Bookmark aria-hidden="true" fill={bewaard ? 'currentColor' : 'none'} />
                </button>
                <DeelKnop titel={titel} pad={deelPad} className="am-knopje" />
              </>
            )}
          </>
        }
      />
      {bediening && <Leesbediening className="am-lb" audioSrc={audioSrc} />}
    </>
  );
}

// 3/4. Eén psalm lezen (licht of avondweergave via de leesvoorkeur)
export function PsalterLezer({ nr, vers, tekst, laadFout, kathisma }: { nr: number; vers: number | null; tekst?: PsalmTekst; laadFout: boolean; kathisma?: { k: Kathisma; i: number; datum: string | null } }) {
  const psalm = PSALMEN[nr - 1];
  const k = kathisma?.k ?? kathismaVan(nr);
  const stappen = kathisma ? kathismaStappen(kathisma.k) : [];
  const i = kathisma?.i ?? 0;
  const stap: KathismaStap | undefined = kathisma ? stappen[i] : undefined;
  const deelVerzen = stap?.vanVers && tekst ? verzenVanStuk(tekst, stap) : undefined;
  const verzen = deelVerzen ?? tekst?.verzen;
  const pad = `psalmen/${nr}`;
  const laagRef = useRef<HTMLDivElement | null>(null);
  const vlakRef = useRef<HTMLElement | null>(null);

  // Openen bovenaan of bij het vers (zodra de tekst er is).
  useLayoutEffect(() => {
    const laag = vlakRef.current?.closest('.am-laag');
    laagRef.current = laag as HTMLDivElement | null;
    const doel = vers ? document.getElementById(`pm-vers-${vers}`) : null;
    if (doel && laag) laag.scrollTo({ top: doel.offsetTop - 70, behavior: 'instant' });
    else laag?.scrollTo({ top: 0, behavior: 'instant' });
  }, [vers, tekst, nr, i]);

  // Leesplek bijhouden: het eerste vers onder de kopbalk (zelfde opslag als op het web).
  useEffect(() => {
    const laag = laagRef.current;
    if (!tekst || !laag || kathisma) return;
    let timer = 0;
    const opScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const rand = laag.getBoundingClientRect().top + 64;
        const zichtbaar = [...laag.querySelectorAll<HTMLElement>('[id^="pm-vers-"]')].find((v) => v.getBoundingClientRect().bottom > rand);
        if (!zichtbaar) return;
        try {
          localStorage.setItem(LEESPLEK, `${nr}:${zichtbaar.id.slice('pm-vers-'.length)}`);
        } catch {
          /* geen opslag */
        }
      }, 250);
    };
    const start = window.setTimeout(() => laag.addEventListener('scroll', opScroll, { passive: true }), 400);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(timer);
      laag.removeEventListener('scroll', opScroll);
    };
  }, [nr, tekst, kathisma]);

  // Buiten een kathisma bladeren naar de dichtstbijzijnde psalm met tekst (geen lege pagina's)
  const vorigeMetTekst = PSALMEN.slice(0, nr - 1).reverse().find((p) => p.hasText);
  const volgendeMetTekst = PSALMEN.slice(nr).find((p) => p.hasText);
  const vorige = kathisma ? (i > 0 ? kathismaPad(kathisma.k, stappen[i - 1], kathisma.datum) : kathismaPad(kathisma.k, undefined, kathisma.datum)) : vorigeMetTekst ? `#psalmen/${vorigeMetTekst.septuagintNumber}` : null;
  const volgende = kathisma ? (i < stappen.length - 1 ? kathismaPad(kathisma.k, stappen[i + 1], kathisma.datum) : kathismaPad(kathisma.k, undefined, kathisma.datum)) : volgendeMetTekst ? `#psalmen/${volgendeMetTekst.septuagintNumber}` : null;
  // Kwam je vanuit Etmaal (een psalm van een gebedsuur), dan gaat Terug daarheen terug.
  const [herkomst] = useState(() => (vorigeAdres().startsWith('#etmaal') ? vorigeAdres() : null));
  const terug = kathisma ? kathismaPad(kathisma.k, undefined, kathisma.datum) : herkomst ?? '#psalmen';

  return (
    <Laag className="am-lees pm-lees" label={psalm.title}>
      <LeesKop terug={terug} slim={!!herkomst} titel={psalm.title} deelPad={pad} audioSrc={psalm.hasText ? psalm.audioSrc : undefined} leeg={!psalm.hasText} />
      <article ref={vlakRef} className="pm-lees-vlak lees-vlak">
        <header className="pm-lees-kop">
          {k && <p className="pm-context">Kathisma {k.nr}{stap ? ` · Stasis ${stap.deel}` : ''}</p>}
          <h1 className="pm-nummer" tabIndex={-1}>
            {psalm.septuagintNumber}
          </h1>
          <span className="sr-only">{psalm.title}</span>
          {psalm.subtitle && <p className="pm-opschrift">{psalm.subtitle}</p>}
          {stap?.vanVers && <p className="pm-opschrift">Verzen {stap.vanVers}–{stap.totVers}</p>}
          <Sierlijn />
        </header>
        {/* Luisteren, zoals op de webversie: de aflevering van de podcast "Psalmen van de Vroege Kerk" (NBG) over deze
            psalm; op een telefoon opent die in de Spotify-app (de ingesloten speler speelt daar zonder login alleen een
            voorbeeld) */}
        {psalm.spotify && (
          <a className="pm-podcast" href={psalm.spotify} target="_blank" rel="noopener noreferrer">
            <Headphones aria-hidden="true" />
            <span>Beluister de podcast <i>Psalmen van de Vroege Kerk</i></span>
            <ChevronRight className="am-pijl" aria-hidden="true" />
          </a>
        )}
        {deelVerzen === null && <p className="pm-melding">De afzonderlijke versgedeelten zijn nog niet beschikbaar; hieronder staat de volledige {psalm.title}.</p>}
        {verzen ? (
          <Verzen verzen={verzen} idVoorvoegsel="pm-vers" />
        ) : (
          <p className="pm-melding">{!psalm.hasText ? `${NIET_BESCHIKBAAR}.` : laadFout ? 'De tekst kon niet worden geladen.' : 'De tekst wordt geladen…'}</p>
        )}
        {verzen && <Sierlijn />}
      </article>
      <nav className="pm-blader" aria-label="Bladeren door de psalmen">
        {vorige ? (
          <a href={vorige}><ChevronLeft aria-hidden="true" /> {kathisma && i === 0 ? `Kathisma ${kathisma.k.nr}` : 'Vorige psalm'}</a>
        ) : (
          <span />
        )}
        <span className="pm-blader-nr">Psalm {nummer(psalm)}</span>
        {volgende ? (
          <a href={volgende} className="is-volgende">{kathisma && i === stappen.length - 1 ? 'Einde kathisma' : 'Volgende psalm'} <ChevronRight aria-hidden="true" /></a>
        ) : (
          <span />
        )}
      </nav>
    </Laag>
  );
}

// Het hele kathisma doorlopend: alle psalmen (en de verzen van Psalm 118 per stasis) in de juiste volgorde.
export function PsalterGeheel({ k, teksten, laadFout, datum }: { k: Kathisma; teksten: PsalmTeksten | null; laadFout: boolean; datum: string | null }) {
  const stappen = kathismaStappen(k);
  return (
    <Laag className="am-lees pm-lees" label={`Kathisma ${k.nr}`}>
      <LeesKop terug={kathismaPad(k, undefined, datum)} titel={`Kathisma ${k.nr}`} deelPad={`psalmen/kathisma/${k.nr}/geheel`} />
      <article className="pm-lees-vlak lees-vlak">
        <header className="pm-lees-kop">
          <p className="pm-context">Het Psalter</p>
          <h1 className="pm-nummer pm-nummer-tekst" tabIndex={-1}>Kathisma {k.nr}</h1>
          <p className="pm-opschrift">{psalmBereik(k.van, k.tot)}</p>
          <Sierlijn />
        </header>
        {stappen.map((s, j) => {
          const psalm = PSALMEN[s.psalm - 1];
          const tekst = teksten?.[s.psalm];
          const deel = tekst ? (s.vanVers ? verzenVanStuk(tekst, s) : tekst.verzen) : undefined;
          return (
            <section key={j} className="pm-geheel-psalm" aria-label={stukNaam(s)}>
              {(j === 0 || stappen[j - 1].deel !== s.deel) && <p className="am-label pm-geheel-stasis">Stasis {s.deel}</p>}
              <h2 className="pm-geheel-titel">
                Psalm {nummer(psalm)}
                {s.vanVers ? <small> · verzen {s.vanVers}–{s.totVers}</small> : null}
              </h2>
              {deel ? <Verzen verzen={deel} idVoorvoegsel={`pm-geheel-${j}`} /> : <p className="pm-melding">{!psalm.hasText ? `${NIET_BESCHIKBAAR}.` : laadFout ? 'De tekst kon niet worden geladen.' : tekst && deel === null ? 'De afzonderlijke versgedeelten zijn nog niet beschikbaar.' : 'De tekst wordt geladen…'}</p>}
            </section>
          );
        })}
        <Sierlijn />
      </article>
    </Laag>
  );
}
