import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { BookOpen, ChevronRight, Search, Star } from 'lucide-react';
import { useApp } from '../lib/context';
import { usePaginaOpen } from '../lib/paginaOpen';
import { usePijlgebed } from '../lib/pijlgebed';
import { KruisTeken, VastenSymbool } from './ui';
import { OPEN_DIENST_EVENT, OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';
import { dagInfo, formatDag, hoofdletter } from '../lib/kalender';
import { dienstVanHetUur } from '../lib/etmaal';
import { isPaascyclus, lezingSoort, roosterMelding, vertaalRef, type HtcLezingRef } from '../lib/htc';
import { heiligeTitel } from '../lib/heiligenPopup';
import { vastenGroep } from '../lib/vasten';
import { feestVoorDag } from '../lib/feestdagen';
import { actieveCyclus } from '../lib/seizoen';
import { geboorteBannerTitel, geboortecyclusVoor } from '../lib/geboortecyclus';
import Kaarsgloed from './Kaarsgloed';
import BetekenisVanVandaag from './BetekenisVanVandaag';
import VandaagMobiel from './VandaagMobiel';
import { useMobiel } from '../lib/desktop';
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

const BEELD = '/images/vandaag';

// Een heilige en het feest van de dag zijn dezelfde gedachtenis als een kenmerkend woord van de naam in beide staat
// (bijvoorbeeld "Demetrius"); dan staat de heilige niet nog eens apart. Algemene woorden tellen niet mee.
const ALGEMEEN = new Set(['heilige', 'heiligen', 'martelaar', 'grootmartelaar', 'apostel', 'apostelen', 'profeet', 'moeder', 'grote', 'gelijk', 'evangelist', 'synaxis', 'gedachtenis', 'overbrenging', 'relieken', 'eerbiedwaardige']);
const woorden = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z]+/).filter((w) => w.length >= 5 && !ALGEMEEN.has(w));
const zelfdeGedachtenis = (a: string, b: string) => woorden(a).some((w) => woorden(b).includes(w));

// Beelden voor de kop op mobiel (public/images/vandaag), aangeleverd en alleen verkleind.
const FOTO_KOP = {
  gewoon: { naam: 'kaarslicht', srcSet: '/images/vandaag/christus-kaarslicht-800.webp 800w, /images/vandaag/christus-kaarslicht-1086.webp 1086w', breedte: 1086, hoogte: 1003 },
  pascha: { naam: 'pascha', srcSet: '/images/vandaag/pascha-verrijzenis-800.webp 800w, /images/vandaag/pascha-verrijzenis-1600.webp 1600w', breedte: 2000, hoogte: 1526 },
  // De Geboorte van Christus en de Kersttijd (lib/feestdagen.ts): het geboorte-icoon in kaarslicht (aangeleverd 26-10-2026)
  // Theofanie en het nafeest (lib/geboortecyclus.ts): het icoon van de Doop van Christus (aangeleverd 26-10-2026)
  theofanie: { naam: 'theofanie', srcSet: '/images/vandaag/theofanie-800.webp 800w, /images/vandaag/theofanie-1536.webp 1536w', breedte: 1536, hoogte: 1024 },
  kerst: { naam: 'kerst', srcSet: '/images/vandaag/kerst-geboorte-800.webp 800w, /images/vandaag/kerst-geboorte-1086.webp 1086w', breedte: 1086, hoogte: 1448 },
};

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
  // Op Vandaag alleen de lezingen van de paascyclus; alle lezingen van de dag staan achter "Lezingen van vandaag".
  const lezingen = rooster?.[dag.ymd]?.filter(isPaascyclus);
  const hoofdFeest = dag.feesten[0];
  // De eerste echte heilige van de dag (geen voorfeest, "Zaterdag vóór …" of icoon) die niet al het feest van de dag is.
  const heilige = heiligen?.HEILIGEN[dag.kerkKey]?.find((h) => h.type === 'saint' && !(hoofdFeest && zelfdeGedachtenis(h.naam, hoofdFeest.naam)));
  // Feestdagen (lib/feestdagen.ts): tijdens Pascha en de Geboorte van Christus vervangt het feesticoon het Christusicoon
  // in de kop, met de begroeting en een feestlink eronder. Bij een dagwisseling of andere kalenderkeuze opnieuw bepaald.
  const feest = useMemo(() => feestVoorDag(vandaag, mode), [vandaag, mode]);
  const geboorteNu = useMemo(() => geboortecyclusVoor(vandaag, mode).huidige, [vandaag, mode]);
  const theofanie = geboorteNu === 'theofanie' || geboorteNu === 'nafeest-theofanie';
  const fotoKop = !feest ? (theofanie ? FOTO_KOP.theofanie : FOTO_KOP.gewoon) : feest.id === 'pascha' ? FOTO_KOP.pascha : FOTO_KOP.kerst;
  const feestNaam = feest?.id === 'pascha' ? 'De Verrijzenis van onze Heer' : 'De Geboorte van onze Heer Jezus Christus';
  const openPopup = (detail: OpenPopupDetail) => window.dispatchEvent(new CustomEvent<OpenPopupDetail>(OPEN_POPUP_EVENT, { detail }));
  const openDienst = () => window.dispatchEvent(new CustomEvent(OPEN_DIENST_EVENT, { detail: uurMoment.title }));
  // Kernvers van de dienst, zoals in de Etmaal-cyclus ("Psalm Kernvers: 50:12" → "Psalm 50:12").
  const kernversRef = uurMoment.kernvers.reference.replace('Psalm Kernvers:', 'Psalm');
  // Kerkelijke datum in twee delen: mobiel op twee regels (datum, dan de kalender), web op één regel met een punt ertussen.
  const kerkDatumDeel = mode === 'oud' ? formatDag(dag.kerk) : null;
  const kalenderNaam = mode === 'oud' ? 'Juliaanse kalender' : 'Nieuwe kalender (gereviseerd juliaans)';
  const heiligenRegel = heilige ? heiligeTitel(heilige.naam) : heiligen ? 'Bekijk de heiligen van vandaag' : 'Heiligen worden geladen…';
  const feestLabel = hoofdFeest && (hoofdFeest.groot || hoofdFeest.soort === 'pascha' || (hoofdFeest.rang ?? 0) >= 4) ? 'Feest van vandaag' : 'Gedachtenis van vandaag';
  const groep = vastenGroep(dag.vasten.niveau);
  const betekenis = useMemo(() => actieveCyclus(dag.civil, mode) !== null, [dag, mode]);
  const seizoenTitel = useMemo(() => (actieveCyclus(dag.civil, mode) === 'geboorte' ? geboorteBannerTitel(dag.civil, mode) : null), [dag, mode]);
  // Mobiel (mock-up vandaag): kaarten onder de kop (VandaagMobiel.tsx), met dezelfde gegevens en vensters.
  const mobiel = useMobiel();
  const cyclusNu = actieveCyclus(dag.civil, mode);
  const geboorteDagen = useMemo(() => geboortecyclusVoor(vandaag, mode).dagenTotGeboorte, [vandaag, mode]);
  const alleLezingen = rooster?.[dag.ymd];
  const mobielKaarten = (
    <VandaagMobiel
      dag={dag}
      pijlgebed={pijlgebed}
      uur={{ titel: uurMoment.title, onder: uurMoment.hoofdgedachtenis, open: openDienst }}
      vasten={{ groep, open: () => openPopup({ pagina: 'vasten', sleutel: dag.ymd }) }}
      feest={
        hoofdFeest
          ? { label: 'Feesten & heiligen', naam: hoofdFeest.naam, open: () => openDag(dag.ymd) }
          : { label: 'Feesten & heiligen', naam: heiligenRegel, open: () => openDagHeiligen(dag.ymd) }
      }
      lezingen={{ lijst: lezingen?.length ? lezingen : alleLezingen, geladen: !!rooster, open: () => openDagLezingen(dag.ymd) }}
      ritme={cyclusNu === 'pascha' ? { href: '#pascha', onClick: () => openDagPascha(dag.ymd) } : { href: cyclusNu === 'geboorte' ? '#geboorte' : '#jaar' }}
      geboorte={geboorteDagen > 0 ? { dagen: geboorteDagen } : null}
    />
  );
  const lezingRij = (l: HtcLezingRef, i: number) => {
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
  };

  return (
    <section id="vandaag" className="vg">
      {/* A. Kerkelijke kop: nis met sterren, het Christusmedaillon en de datum (de kop van de pagina). De onderrand volgt de sierboog. */}
      {/* Mobiel: een aangeleverd beeld vult de kop ("Christus Pantocrator in kaarslicht"; in de Paastijd het icoon van de
          Verrijzenis); het medaillon of feesticoon blijft onzichtbaar op zijn plek, zodat de kop even hoog blijft. In de
          Kersttijd en op het web: de nis met het medaillon of feesticoon. */}
      <div className={`vg-kop${fotoKop ? ` vg-kop-foto vg-kop-${fotoKop.naam}` : ''}`}>
        <div className="vg-kop-achter" aria-hidden="true">
          <picture>
            {fotoKop && <source media="(max-width: 767.98px)" srcSet={fotoKop.srcSet} sizes="100vw" width={fotoKop.breedte} height={fotoKop.hoogte} />}
            <img src={`${BEELD}/kerk-header-800.webp`} srcSet={`${BEELD}/kerk-header-800.webp 800w, ${BEELD}/kerk-header-1536.webp 1536w`} sizes="(min-width: 960px) 960px, 100vw" alt="" width={1536} height={1024} fetchPriority={open ? 'high' : 'auto'} decoding="async" />
          </picture>
          <Kaarsgloed />
        </div>
        <div className="vg-balk">
          <a href="#vandaag" className="vg-merk">
            <img src="/images/ui/kruis.webp" alt="" width={218} height={256} />
            Orthodoxe Tijd
          </a>
          <button type="button" onClick={openZoeken} className="vg-zoek" aria-label="Zoeken"><Search aria-hidden="true" /></button>
        </div>
        {/* Feesticoon op de plek en in de maat van het Christusicoon: helemaal zichtbaar (contain), zonder filter */}
        {feest ? (
          <img className="vg-christus vg-feesticoon" src={feest.beeld} alt={feest.alt} width={feest.breedte} height={feest.hoogte} fetchPriority={open ? 'high' : 'auto'} decoding="async" />
        ) : (
          <img className="vg-christus" src="/images/Christus-afbeelding.webp" alt="Christus" width={640} height={633} fetchPriority={open ? 'high' : 'auto'} decoding="async" />
        )}
        <h1 className="vg-datum"><span className="sr-only">Vandaag, </span><time dateTime={dag.ymd}>{dag.weekdagNaam}<span aria-hidden="true"> · </span><span className="sr-only">, </span>{formatDag(dag.civil)}</time></h1>
        <img className="vg-sierboog" src={`${BEELD}/sierboog.svg`} alt="" aria-hidden="true" width={1000} height={140} />
      </div>

      <div className={`vg-papier${mobiel ? ' vm2-papier' : ''}`}>
        {/* Feesttijd: de begroeting en de link naar het feest, in de stijl van de andere rijen op Vandaag */}
        {feest && (
          <section className="vg-feest" aria-labelledby="vg-feest-kop">
            <h2 id="vg-feest-kop" className="vg-label">{feest.fase === 'dag' ? 'Vandaag vieren wij' : 'In deze feesttijd vieren wij'}</h2>
            <p className="vg-feest-groet">
              {feest.groet}
              <span>{feest.antwoord}</span>
            </p>
            <div className="vg-lezingen vg-feest-rij">
              {feest.id === 'pascha' ? <span className="vg-boek vg-feest-symbool" aria-hidden="true"><KruisTeken /></span> : <Star className="vg-boek" aria-hidden="true" />}
              <div>
                {/* Pascha: naar de Paschapagina; Geboorte: het venster van het feest (Feesten) boven deze pagina */}
                {feest.id === 'pascha' ? (
                  <a className="vg-rij vg-rij-kop" href="#pascha">
                    <span>{feest.linkLabel}</span>
                    <ChevronRight aria-hidden="true" />
                  </a>
                ) : (
                  <Actie className="vg-rij vg-rij-kop" href="#feesten" onClick={() => openPopup({ pagina: 'feesten', sleutel: 'kerstmis' })}>
                    <span>{feest.linkLabel}</span>
                    <ChevronRight aria-hidden="true" />
                  </Actie>
                )}
                <p className="vg-feest-sub">{feestNaam}</p>
              </div>
            </div>
          </section>
        )}

        {/* Vier hoofdonderdelen met dezelfde sectiekop (.vg-sectiekop): Pijlgebed, Dit gebedsuur, Vasten & feesten,
            Lezingen van vandaag. Vanaf 1024 px twee kolommen (Vandaag.css): links het gebed, rechts de dag. De kleine
            gecentreerde regels (.vg-cyclusregel) zijn de naam van het gebedsuur en de week-, kerkelijke en paascyclus. */}
        {mobiel ? mobielKaarten : (
        <div className="vg-kolommen">
          <div className="vg-kol">
            {/* 1. Het pijlgebed: het eigen pijlgebed uit Instellingen, anders het standaardgebed; de tekst linkt naar Instellingen. */}
            <section className="vg-gebed" aria-labelledby="vg-gebed-kop">
              <h2 id="vg-gebed-kop" className="vg-label vg-sectiekop">Pijlgebed</h2>
              <a href="#instellingen" className="vg-gebed-tekst" title="Pijlgebed aanpassen in Instellingen">{pijlgebed}</a>
              <img className="vg-sierlijn" src={`${BEELD}/sierlijn.svg`} alt="" aria-hidden="true" width={480} height={40} />
            </section>

            {/* 2. Het gebedsuur van nu (lib/etmaal.ts): de naam klein en gecentreerd, het kernvers met zijn psalm. */}
            <section className="vg-uur" aria-labelledby="vg-uur-kop">
              <h2 id="vg-uur-kop" className="vg-label vg-sectiekop vg-sectiekop-lees">
                {/* Mobiel: de olielamp links van de titel, zoals het kalendericoon bij Vasten & feesten */}
                <span className="vg-lamp-teken" aria-hidden="true" />
                <img className="vg-icoon-m" src="/images/vandaag/iconen/01_gebedsuur_lamp.webp" alt="" aria-hidden="true" width={81} height={75} decoding="async" />
                <span>Gebedsuur</span>
              </h2>
              <img className="vg-sierlijn vg-uur-sier" src={`${BEELD}/sierlijn.svg`} alt="" aria-hidden="true" width={480} height={40} />
              <p className="vg-cyclusregel vg-uurnaam">{uurMoment.title}</p>
              <blockquote className="vg-kernvers">“{uurMoment.kernvers.verses.join(' ')}”</blockquote>
              <p className="vg-bron"><a href={`#psalmen/${kernversRef.match(/\d+/)?.[0]}`}>{kernversRef}</a></p>
              <Actie className="vg-knop" href="#etmaal" onClick={openDienst}>Open het gebed <span aria-hidden="true">›</span></Actie>
            </section>
            <Scheiding />
          </div>
          <div className="vg-kol">
            {/* 3. Vasten & feesten: de dag in de week-, vaste en paascyclus, het feest of de gedachtenis, de heiligen en het vasten. */}
            <section className="vg-vf" aria-labelledby="vg-vf-kop">
              <h2 id="vg-vf-kop" className="vg-label vg-sectiekop vg-sectiekop-lees">
                {/* Mobiel: het kalendericoon links van de titel, in de kleur van het kruis bij de heiligen (Vandaag.css) */}
                <span className="vg-kal-teken" aria-hidden="true" />
                <img className="vg-icoon-m" src="/images/vandaag/iconen/02_vasten_feesten_kalender.webp" alt="" aria-hidden="true" width={66} height={71} decoding="async" />
                <span>Vasten &amp; feesten</span>
              </h2>
              <div className="vg-meer vg-cyclus">
                <div className="vg-cyclus-regels">
                {/* De weekdag opent meteen het venster van die dag uit de weekcyclus */}
                <Actie className="vg-cyclusregel vg-cyclus-link vg-cyclus-week" href="#week" onClick={() => openPopup({ pagina: 'week', sleutel: WEEKDAG_SLEUTELS[dag.weekdag] })}>
                  <span>{hoofdletter(dag.weekdagNaam)} · {weekthema.titel}</span>
                  <ChevronRight aria-hidden="true" />
                </Actie>
                {/* De kerkelijke datum opent de volledige dag, de paascyclus het venster "Paascyclus" van vandaag */}
                <button type="button" className="vg-cyclusregel vg-cyclus-link" onClick={() => openDag(dag.ymd)}>
                  <span>
                    {kerkDatumDeel ? `Juliaanse datum: ${kerkDatumDeel}` : 'Kerkelijke datum:'}
                    <span className="vg-cyclus-sub"><span className="vg-cyclus-punt">{kerkDatumDeel ? ' · ' : ' '}</span>{kalenderNaam}</span>
                  </span>
                  <ChevronRight aria-hidden="true" />
                </button>
                <Actie className="vg-cyclusregel vg-cyclus-link" href="#pascha" onClick={() => openDagPascha(dag.ymd)}>
                  <span>{dag.seizoen}{dag.toon ? ` · Toon ${dag.toon}` : ''}</span>
                  <ChevronRight aria-hidden="true" />
                </Actie>
                </div>
              </div>

              {/* Het feest of de gedachtenis van de dag; alleen als de kalender er een heeft */}
              {hoofdFeest && (
                <div className="vg-ingang vg-feestdag">
                  <Star className="vg-ingang-icoon vg-ster" aria-hidden="true" />
                  <div>
                    <h3><Actie className="vg-ingang-link" href="#kalender" onClick={() => openDag(dag.ymd)}>{feestLabel}<ChevronRight aria-hidden="true" /></Actie></h3>
                    <p className="vg-sub">{hoofdFeest.naam}</p>
                  </div>
                  <ChevronRight className="vg-ingang-pijl" aria-hidden="true" />
                </div>
              )}

              {/* De hele vlakken zijn klikbaar: de link in de kop strekt zich uit over het vlak (CSS). */}
              <div className="vg-duo">
                <div className="vg-ingang">
                  <span className="vg-ingang-icoon" aria-hidden="true"><KruisTeken /><img className="vg-icoon-m" src="/images/vandaag/iconen/03_heiligen_kruis.webp" alt="" width={69} height={77} decoding="async" /></span>
                  <div>
                    <h3><Actie className="vg-ingang-link" href="#heiligen" onClick={() => openDagHeiligen(dag.ymd)}>Heiligen van <span className="vg-nw">vandaag<ChevronRight aria-hidden="true" /></span></Actie></h3>
                    <p className="vg-sub">{heiligenRegel}</p>
                  </div>
                  <ChevronRight className="vg-ingang-pijl" aria-hidden="true" />
                </div>
                <div className="vg-ingang">
                  {/* Mobiel de vis uit het iconenpakket; bij een ander vastenniveau het bestaande symbool (olie, zuivel …) */}
                  <span className={`vg-ingang-icoon${(groep ?? 'vis') === 'vis' ? ' met-icoon-m' : ''}`} aria-hidden="true"><VastenSymbool groep={groep ?? 'vis'} className="vg-vis" />{(groep ?? 'vis') === 'vis' && <img className="vg-icoon-m" src="/images/vandaag/iconen/04_vasten_vis.webp" alt="" width={70} height={32} decoding="async" />}</span>
                  <div>
                    <h3><Actie className="vg-ingang-link" href="#vasten" onClick={() => openPopup({ pagina: 'vasten', sleutel: dag.ymd })}>Vasten <span className="vg-nw">vandaag<ChevronRight aria-hidden="true" /></span></Actie></h3>
                    <p className="vg-sub">{dag.vasten.label}{dag.vasten.periode ? ` · ${dag.vasten.periode}` : ''}</p>
                  </div>
                  <ChevronRight className="vg-ingang-pijl" aria-hidden="true" />
                </div>
              </div>
            </section>
            <Scheiding />

            {/* 4. Lezingen van vandaag: de lezingen van de paascyclus uit het leesrooster; alle lezingen van de dag erachter. */}
            <section className="vg-lezingen-sectie" aria-labelledby="vg-lezingen-kop">
              <h2 id="vg-lezingen-kop" className="vg-label vg-sectiekop">Lezingen van vandaag</h2>
              <div className="vg-lezingen">
                <BookOpen className="vg-boek" aria-hidden="true" />
                <img className="vg-icoon-m vg-boek-m" src="/images/vandaag/iconen/05_lezingen_boek.webp" alt="" aria-hidden="true" width={68} height={63} decoding="async" />
                <div>
                  <ul>
                    {lezingen === undefined ? (
                      <li className="vg-leeg">{rooster ? roosterMelding(dag.ymd) : 'Lezingen worden geladen…'}</li>
                    ) : lezingen.length === 0 ? (
                      <li className="vg-leeg">Vandaag geen lezingen uit de paascyclus.</li>
                    ) : (
                      <>
                        {lezingen.slice(0, 2).map(lezingRij)}
                        {/* Meer dan twee lezingen (bijvoorbeeld verschoven lezingen): de rest klapt uit. */}
                        {lezingen.length > 2 && (
                          <li>
                            <details className="vg-meer-lezingen">
                              <summary className="vg-rij">Nog {lezingen.length - 2} {lezingen.length - 2 === 1 ? 'lezing' : 'lezingen'}<ChevronRight aria-hidden="true" /></summary>
                              <ul>{lezingen.slice(2).map(lezingRij)}</ul>
                            </details>
                          </li>
                        )}
                      </>
                    )}
                    <li>
                      <Actie className="vg-rij vg-rij-kop" href="#kalender" onClick={() => openDagLezingen(dag.ymd)}>{/* Opent het venster met alle lezingen van de dag (ook buiten de paascyclus); mobiel met een korter label */}
                      <span className="vg-niet-mobiel">Alle lezingen van vandaag</span><span className="vg-alleen-mobiel">Open de lezingen</span><ChevronRight aria-hidden="true" /></Actie>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Alleen tijdens de Paascyclus of de Geboortecyclus (lib/seizoen.ts): de betekenis van vandaag */}
            {betekenis && (
              <>
                <Scheiding />
                {seizoenTitel && (
                  <a className="vg-seizoen" href="#geboorte">
                    <span className="vg-seizoen-label">De Geboortecyclus</span>
                    <span className="vg-seizoen-titel">{seizoenTitel}</span>
                    <ChevronRight aria-hidden="true" />
                  </a>
                )}
                <BetekenisVanVandaag dag={dag} />
              </>
            )}
          </div>
        </div>
        )}
      </div>

      {/* E. Stilte: olijftak en stenen rand, met de lamp van de site erop (mobiel niet: de mock-up eindigt met de kaarten). */}
      {!mobiel && (
      <div className="vg-stilte">
        <img className="vg-stilte-achter" src={`${BEELD}/stilte-olijftak-900.webp`} srcSet={`${BEELD}/stilte-olijftak-900.webp 900w, ${BEELD}/stilte-olijftak-1774.webp 1774w`} sizes="(min-width: 960px) 960px, 100vw" alt="" aria-hidden="true" width={1774} height={887} loading="lazy" decoding="async" />
        <span className="vg-lamp">
          <span className="vg-lampgloed" aria-hidden="true" />
          <img src="/images/decor/kaars.webp" alt="" width={220} height={200} loading="lazy" decoding="async" />
          {/* Flakkerende gloed op de vlam, zoals bij de kaarsen in de banners (Kaarsgloed) */}
          <i className="vg-lamp-vlam" aria-hidden="true" />
        </span>
        <p className="vg-stilte-tekst">Een moment van stilte.<img src={`${BEELD}/sierlijn.svg`} alt="" aria-hidden="true" width={480} height={40} /></p>
      </div>
      )}
    </section>
  );
}

/** Mobiel: scheiding tussen de hoofdonderdelen, een gouden lijn met een ornament in het midden (web verborgen). */
function Scheiding() {
  return (
    <div className="vg-scheiding" aria-hidden="true">
      <svg viewBox="0 0 20 20" width="20" height="20"><path d="M10 1.5c1.1 2.3 1.1 4.6 0 6.9-1.1-2.3-1.1-4.6 0-6.9Zm0 17c-1.1-2.3-1.1-4.6 0-6.9 1.1 2.3 1.1 4.6 0 6.9ZM1.5 10c2.3-1.1 4.6-1.1 6.9 0-2.3 1.1-4.6 1.1-6.9 0Zm17 0c-2.3 1.1-4.6 1.1-6.9 0 2.3-1.1 4.6-1.1 6.9 0ZM10 8.3l1.7 1.7-1.7 1.7-1.7-1.7Z" fill="currentColor" /></svg>
    </div>
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
