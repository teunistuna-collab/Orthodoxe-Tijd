import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { BookOpen, ChevronRight, Search } from 'lucide-react';
import { useApp } from '../lib/context';
import { usePaginaOpen } from '../lib/paginaOpen';
import { usePijlgebed } from '../lib/pijlgebed';
import { KruisTeken, VastenSymbool } from './ui';
import { OPEN_DIENST_EVENT, OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';
import { dagInfo, formatDag, hoofdletter } from '../lib/kalender';
import { dienstVanHetUur } from '../lib/etmaal';
import { lezingSoort, roosterMelding, vertaalRef } from '../lib/htc';
import { eersteHeilige, heiligeTitel } from '../lib/heiligenPopup';
import { LITURGISCHE_KLEUREN, liturgischeKleur } from '../lib/liturgischeKleur';
import { vastenGroep } from '../lib/vasten';
import './Vandaag.css';

const WEEKDAG_SLEUTELS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

const WEEKTHEMAS: Record<number, { titel: string; uitleg: string }> = {
  0: { titel: 'De Verrijzenis van Christus', uitleg: 'De zondag is de Dag des Heren, een wekelijkse gedachtenis van de Verrijzenis.' },
  1: { titel: 'De heilige Engelen', uitleg: 'Maandag gedenkt de Kerk de hemelse, onlichamelijke machten.' },
  2: { titel: 'De heilige Johannes de Voorloper', uitleg: 'Dinsdag staat in het teken van de Voorloper en de profetische voorbereiding.' },
  3: { titel: 'Het heilig Kruis', uitleg: 'Woensdag gedenkt het verraad van Christus en richt ons op het Kruis.' },
  4: { titel: 'De heilige apostelen en de heilige Nicolaas', uitleg: 'Donderdag gedenkt de Kerk de heilige apostelen en de heilige Nicolaas van Myra: verkondiging, herderschap en trouw aan Christus.' },
  5: { titel: 'Het lijden en Kruis van Christus', uitleg: 'Vrijdag gedenkt de Kruisiging en het vrijwillige lijden van de Heer.' },
  6: { titel: 'Alle heiligen en de ontslapenen', uitleg: 'Zaterdag is verbonden met rust, de ontslapenen en de verwachting van de Verrijzenis.' },
};

// Versierde initiaal per dienst (startpagina-pakket, implementatie/diensten.json); sleutel = title in lib/etmaal.ts.
const INITIALEN: Record<string, string> = {
  Vespers: 'vespers-V',
  Completen: 'completen-C',
  Middernachtdienst: 'middernacht-M',
  Metten: 'metten-M',
  'Eerste Uur': 'eerste-uur-E',
  'Derde Uur': 'derde-uur-D',
  'Zesde Uur': 'zesde-uur-Z',
  'Negende Uur': 'negende-uur-N',
};

const BEELD = '/images/vandaag';

export default function Vandaag() {
  const open = usePaginaOpen('vandaag');
  const { mode, vandaag, vandaagYmd, rooster, heiligen, openDag, openLezing, openDagLezingen, openDagHeiligen, openDagPascha, openZoeken } = useApp();
  const pijlgebed = usePijlgebed();
  const [uurMoment, setUurMoment] = useState(() => dienstVanHetUur(new Date()));

  useEffect(() => {
    const update = () => setUurMoment(dienstVanHetUur(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const dag = useMemo(() => dagInfo(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);
  const weekthema = WEEKTHEMAS[dag.weekdag];
  const lezingen = rooster?.[dag.ymd];
  const hoofdFeest = dag.feesten[0];
  // De eerste echte heilige van de dag (geen voorfeest, "Zaterdag vóór …" of icoon).
  const heilige = eersteHeilige(heiligen?.HEILIGEN[dag.kerkKey]);
  const kleur = liturgischeKleur(dag);
  const openPopup = (detail: OpenPopupDetail) => window.dispatchEvent(new CustomEvent<OpenPopupDetail>(OPEN_POPUP_EVENT, { detail }));
  const openDienst = () => window.dispatchEvent(new CustomEvent(OPEN_DIENST_EVENT, { detail: uurMoment.title }));
  // Kernvers van de dienst, zoals in de Etmaal-cyclus ("Psalm Kernvers: 50:12" → "Psalm 50:12").
  const kernversRef = uurMoment.kernvers.reference.replace('Psalm Kernvers:', 'Psalm');
  const initiaal = INITIALEN[uurMoment.title];
  const kerkelijkeDatum = mode === 'oud' ? `${formatDag(dag.kerk)} · Juliaanse kalender` : 'Nieuwe kalender (gereviseerd juliaans)';
  const heiligenRegel = hoofdFeest?.naam ?? (heilige ? heiligeTitel(heilige.naam) : heiligen ? 'Bekijk de heiligen van vandaag' : 'Heiligen worden geladen…');
  const groep = vastenGroep(dag.vasten.niveau);

  return (
    <section id="vandaag" className="vg">
      {/* A. Kerkelijke kop: nis met sterren, het Christusmedaillon en de datum (de kop van de pagina). De onderrand volgt de sierboog. */}
      <div className="vg-kop">
        <div className="vg-kop-achter" aria-hidden="true">
          <img src={`${BEELD}/kerk-header-800.webp`} srcSet={`${BEELD}/kerk-header-800.webp 800w, ${BEELD}/kerk-header-1536.webp 1536w`} sizes="(min-width: 960px) 960px, 100vw" alt="" width={1536} height={1024} fetchPriority={open ? 'high' : 'auto'} decoding="async" />
        </div>
        <div className="vg-balk">
          <a href="#vandaag" className="vg-merk">
            <img src="/images/ui/kruis.webp" alt="" width={218} height={256} />
            Orthodoxe Tijd
          </a>
          <button type="button" onClick={openZoeken} className="vg-zoek" aria-label="Zoeken"><Search aria-hidden="true" /></button>
        </div>
        <img className="vg-christus" src="/images/Christus-afbeelding.webp" alt="Christus" width={640} height={633} fetchPriority={open ? 'high' : 'auto'} decoding="async" />
        <h1 className="vg-datum"><span className="sr-only">Vandaag, </span><time dateTime={dag.ymd}>{dag.weekdagNaam}<span aria-hidden="true"> · </span><span className="sr-only">, </span>{formatDag(dag.civil)}</time></h1>
        <img className="vg-sierboog" src={`${BEELD}/sierboog.svg`} alt="" aria-hidden="true" width={1000} height={140} />
      </div>

      <div className="vg-papier">
        {/* B. Het Jezusgebed: het eigen pijlgebed uit Instellingen, anders het standaardgebed. */}
        <section className="vg-gebed" aria-labelledby="vg-gebed-kop">
          <h2 id="vg-gebed-kop" className="vg-label">Het Jezusgebed</h2>
          <a href="#adem" className="vg-gebed-tekst">{pijlgebed}</a>
          <img className="vg-sierlijn" src={`${BEELD}/sierlijn.svg`} alt="" aria-hidden="true" width={480} height={40} />
        </section>

        {/* C. Het gebedsuur van nu (lib/etmaal.ts), met de versierde initiaal van die dienst. */}
        <section className="vg-uur" aria-labelledby="vg-uur-kop">
          {initiaal && <img className="vg-initiaal" src={`${BEELD}/${initiaal}.webp`} alt="" width={280} height={280} decoding="async" />}
          <div className="vg-uur-tekst">
            <h2 id="vg-uur-kop" className="vg-label">Dit gebedsuur</h2>
            <p className="vg-dienst">{uurMoment.title}</p>
            <blockquote className="vg-kernvers">“{uurMoment.kernvers.verses.join(' ')}”</blockquote>
            <p className="vg-bron"><a href={`#psalmen/${kernversRef.match(/\d+/)?.[0]}`}>{kernversRef}</a></p>
            <Actie className="vg-knop" href="#etmaal" onClick={openDienst}>Open het gebed <span aria-hidden="true">→</span></Actie>
          </div>
        </section>

        {/* D. Lezingen, heiligen en vasten van vandaag, uit het leesrooster en de dagdata. */}
        <section className="vg-lezingen" aria-labelledby="vg-lezingen-kop">
          <BookOpen className="vg-boek" aria-hidden="true" />
          <div>
            <h2 id="vg-lezingen-kop"><Actie className="vg-rij vg-rij-kop" href="#kalender" onClick={() => openDagLezingen(dag.ymd)}>Lezingen van vandaag<ChevronRight aria-hidden="true" /></Actie></h2>
            <ul>
              {lezingen === undefined ? (
                <li className="vg-leeg">{rooster ? roosterMelding(dag.ymd) : 'Lezingen worden geladen…'}</li>
              ) : lezingen.length === 0 ? (
                <li className="vg-leeg">{roosterMelding(dag.ymd)}</li>
              ) : (
                lezingen.map((l, i) => {
                  const ref = vertaalRef(l.ref);
                  const soort = lezingSoort(ref);
                  return (
                    <li key={`${l.ref}-${i}`}>
                      <button type="button" className="vg-rij" onClick={() => openLezing({ ref: l.ref, tag: l.tag, julianKey: dag.julianKey, civil: vandaag })}>
                        <span className="sr-only">{soort === 'evangelie' ? 'Evangelie' : soort === 'oud' ? 'Oude Testament' : 'Apostel'}: </span>
                        {ref}
                        <ChevronRight aria-hidden="true" />
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </section>

        <div className="vg-duo">
          {/* De hele vlakken zijn klikbaar: de link in de kop strekt zich uit over het vlak (CSS). */}
          <section className="vg-ingang">
            <span className="vg-ingang-icoon" aria-hidden="true"><KruisTeken /></span>
            <div>
              <h2><Actie className="vg-ingang-link" href="#heiligen" onClick={() => openDagHeiligen(dag.ymd)}>Heiligen van <span className="vg-nw">vandaag<ChevronRight aria-hidden="true" /></span></Actie></h2>
              <p className="vg-sub">{heiligenRegel}</p>
            </div>
          </section>
          <section className="vg-ingang">
            <span className="vg-ingang-icoon" aria-hidden="true"><VastenSymbool groep={groep ?? 'vis'} className="vg-vis" /></span>
            <div>
              <h2><Actie className="vg-ingang-link" href="#vasten" onClick={() => openPopup({ pagina: 'vasten', sleutel: dag.ymd })}>Vasten <span className="vg-nw">vandaag<ChevronRight aria-hidden="true" /></span></Actie></h2>
              <p className="vg-sub">{dag.vasten.label}{dag.vasten.periode ? ` · ${dag.vasten.periode}` : ''}</p>
            </div>
          </section>
        </div>

        {/* Overige daginformatie (weekcyclus, kerkelijke datum, paascyclus), compact om uit te klappen. */}
        <div className="vg-meer">
          <details>
            <summary><span>Weekcyclus · {hoofdletter(dag.weekdagNaam)}</span><span className="vg-waarde">{weekthema.titel}</span><ChevronRight aria-hidden="true" /></summary>
            <p>{weekthema.uitleg}</p>
            <Actie className="vg-link" href="#week" onClick={() => openPopup({ pagina: 'week', sleutel: WEEKDAG_SLEUTELS[dag.weekdag] })}>Bekijk de week ›</Actie>
          </details>
          <details>
            <summary><span>Kerkelijke datum</span><span className="vg-waarde">{kerkelijkeDatum}</span><ChevronRight aria-hidden="true" /></summary>
            <p>
              <i className="vg-kleur" style={{ background: LITURGISCHE_KLEUREN[kleur].hex }} aria-hidden="true" />
              Liturgische kleur: {kleur} ({LITURGISCHE_KLEUREN[kleur].uitleg})
            </p>
            <button type="button" className="vg-link" onClick={() => openDag(dag.ymd)}>Bekijk de volledige dag ›</button>
          </details>
          <details>
            <summary><span>Paascyclus</span><span className="vg-waarde">{dag.seizoen}{dag.toon ? ` · Toon ${dag.toon}` : ''}</span><ChevronRight aria-hidden="true" /></summary>
            <Actie className="vg-link" href="#pascha" onClick={() => openDagPascha(dag.ymd)}>Bekijk de cyclus ›</Actie>
          </details>
        </div>
      </div>

      {/* E. Stilte: olijftak en stenen rand, met de lamp van de site erop. */}
      <div className="vg-stilte">
        <img className="vg-stilte-achter" src={`${BEELD}/stilte-olijftak-900.webp`} srcSet={`${BEELD}/stilte-olijftak-900.webp 900w, ${BEELD}/stilte-olijftak-1774.webp 1774w`} sizes="(min-width: 960px) 960px, 100vw" alt="" aria-hidden="true" width={1774} height={887} loading="lazy" decoding="async" />
        <span className="vg-lamp">
          <span className="vg-lampgloed" aria-hidden="true" />
          <img src="/images/decor/kaars.webp" alt="" width={220} height={200} loading="lazy" decoding="async" />
        </span>
        <p className="vg-stilte-tekst">Een moment van stilte.<img src={`${BEELD}/sierlijn.svg`} alt="" aria-hidden="true" width={480} height={40} /></p>
      </div>
    </section>
  );
}

/** Link met een eigen actie (pop-up); zonder JavaScript of met een nieuwe tab gewoon naar de pagina. */
function Actie({ className, href, onClick, children }: { className: string; href: string; onClick: () => void; children: ReactNode }) {
  return (
    <a className={className} href={href} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); onClick(); }}>
      {children}
    </a>
  );
}
