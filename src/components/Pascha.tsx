import { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';

import { useApp } from '../lib/context';
import { useDesktop, useMobiel } from '../lib/desktop';
import PaschaMobiel from './PaschaMobiel';
import { PAASCYCLUS, type Feest } from '../lib/feesten';
import { addDays, bereikLang, dagInfo, formatDag, formatDatum, formatKort, ymd, type DagInfo } from '../lib/kalender';
import { isPaascyclus, lezingSoort, vertaalRef, type HtcLezingRef } from '../lib/htc';
import { paascyclusVoor, STAPPEN, volgendeZondag, zondagVanDeWeek, type Paascyclus, type StapKey } from '../lib/paascyclus';
import { FeestTag } from './ui';
import { LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { PASCHA_INFO, type PopupInhoud } from '../lib/cyclusTeksten';
import { PERIODE_POPUPS, STAP_INHOUD } from '../lib/paascyclusTeksten';
import Verdieping from './Verdieping';
import CyclusTijdlijn from './CyclusTijdlijn';
import BetekenisVanVandaag from './BetekenisVanVandaag';
import ExactPageFrame from './ExactPageFrame';
import NisKop from './NisKop';
import { Sierlijn } from './onderdelen';
import { usePaginaOpen } from '../lib/paginaOpen';
import './Vandaag.css';
import './ontwerp.css';

type InfoKey = 'wat' | 'cyclus' | 'betekenis' | 'tradities';

// Inhoud rechtstreeks gebaseerd op "De orthodoxe Paschale cyclus.docx".

const INFO_CARDS: Array<{ key: InfoKey; title: string; intro: string }> = [
  { key: 'wat', title: 'Wat is Pascha?', intro: 'De Verrijzenis van Christus als het hart van het kerkelijk jaar en van ons leven.' },
  { key: 'cyclus', title: 'De Paschacyclus', intro: 'Van de voorbereidende vasten tot Pinksteren: één beweging van dood naar nieuw leven.' },
  { key: 'betekenis', title: 'De betekenis in ons leven', intro: 'Pascha vernieuwt de tijd, onze blik en ons bestaan.' },
  { key: 'tradities', title: 'Tradities en viering', intro: 'De rijke schoonheid van de Paasdiensten en de Orthodoxe tradities.' },
];

const PAASFEEST: StapKey[] = ['pascha', 'lichte-week'];

/** "15 mrt – 18 apr", of "2 – 8 mei" wanneer begin en eind in dezelfde maand vallen. */
function formatBereik(a: Date, b: Date): string {
  if (a.getTime() === b.getTime()) return formatKort(a);
  const begin = a.getUTCMonth() === b.getUTCMonth() ? String(a.getUTCDate()) : formatKort(a);
  return `${begin} – ${formatKort(b)}`;
}
const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

const dagen = (n: number) => `${n} ${n === 1 ? 'dag' : 'dagen'}`;
const feestMetId = (id: string) => PAASCYCLUS.find((f) => f.id === id);
/** De korte toelichting van een stap: de eerste alinea van de bestaande uitleg (bij Hemelvaart en Pinksteren van beide). */
const betekenis = (k: StapKey) => {
  const secties = STAP_INHOUD[k].sections ?? [];
  return secties.slice(0, 1).map((x) => x.paragraphs?.[0]).filter((x): x is string => !!x);
};
type Rij = { label: string; titel: string; tekst?: string; open?: () => void; href?: string };

// Lijnsymbool en kleur per stap op de tijdlijn (public/images/ontwerp/pascha-*.svg, uit het overdrachtspakket): paars
// voor de voorbereiding en de Grote Vasten, rood voor de Heilige Week en Pascha, goud voor de Paastijd en Pinksteren.

export default function Pascha() {
  const { vandaag, vandaagYmd, mode, rooster, openDag, openLezing, openDagLezingen } = useApp();
  const desktop = useDesktop();
  const [stapOpen, setStapOpen] = useState<StapKey | null>(null);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const [cyclusOpen, setCyclusOpen] = useState(false);
  const open = usePaginaOpen('pascha');

  // Vandaag kan een pop-up van deze pagina openen.
  useEffect(() => {
    const opPopup = (event: Event) => {
      const { pagina, sleutel } = (event as CustomEvent<OpenPopupDetail>).detail;
      if (pagina === 'pascha') setInfoOpen(sleutel as InfoKey);
    };
    window.addEventListener(OPEN_POPUP_EVENT, opPopup);
    return () => window.removeEventListener(OPEN_POPUP_EVENT, opPopup);
  }, []);

  // Desktop, tablet en mobiel: de lopende cyclus (tijdens de Paastijd nog die van dit jaar), de actuele stap en de stap die
  // de bezoeker bekijkt. Een handmatige keuze blijft staan bij een dagwisseling en bij het wisselen tussen desktop en
  // mobiel; bij een nieuwe cyclus geldt weer de actuele periode.
  const cyclus = useMemo(() => paascyclusVoor(vandaag), [vandaag]);
  const dag = useMemo(() => dagInfo(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);
  const cyclusId = ymd(cyclus.pascha);
  const [keuze, setKeuze] = useState<{ cyclus: string; stap: StapKey } | null>(null);
  const gekozen = keuze?.cyclus === cyclusId ? keuze.stap : null;
  const bekeken = gekozen ?? cyclus.huidige;
  const pascha = cyclus.pascha;
  // Mobiel: de eigen weergave volgens de mock-up (PaschaMobiel.tsx), met dezelfde gegevens.
  const mobiel = useMobiel();

  // Iedere stap-pop-up krijgt de datums van de getoonde cyclus als eyebrow.
  const basis = pascha;
  const stapInhoud = {} as Record<StapKey, PopupInhoud>;
  for (const stap of STAPPEN) {
    const [start, eind] = stap.offsetRange;
    stapInhoud[stap.key] = { ...STAP_INHOUD[stap.key], title: stap.label, eyebrow: formatBereik(addDays(basis, start), addDays(basis, eind)) };
  }

  if (mobiel) return <PaschaMobiel />;

  return (
    <>
      {/* Bovenkant volgens het overdrachtspakket (referentie kalender-pascha-feesten-vasten.png, paneel 2): de boog met
          uitzicht, de datum van het komende Pascha en de zes stappen van de Paschacyclus als tijdlijn, met hun begin- en
          einddatum uit de bestaande berekening. Elke stap opent de bestaande uitleg. */}
      <section id="pascha" className="vg ot-redesign ot-pascha">
        <NisKop
          open={open}
          balk
          terug="#cycli"
          label="De Paschacyclus"
          titel="Van het Kruis naar de Verrijzenis"
          ondertitel="Een heilige weg van inkeer en voorbereiding, door het lijden en de dood van Christus, naar de vreugde van Zijn Verrijzenis."
        />
        <div className="vg-papier ot-inhoud">
          <PaschaInhoud
            mobiel={!desktop}
            cyclus={cyclus}
            bekeken={bekeken}
            gekozen={gekozen}
            dag={dag}
            lezingen={rooster?.[vandaagYmd]?.filter(isPaascyclus)}
            heeftRooster={!!rooster?.[vandaagYmd]}
            kies={(stap) => setKeuze(stap ? { cyclus: cyclusId, stap } : null)}
            openStap={setStapOpen}
            openDag={openDag}
            openDagLezingen={() => openDagLezingen(vandaagYmd)}
            openLezing={(l) => openLezing({ ref: l.ref, tag: l.tag, julianKey: dag.julianKey, civil: vandaag })}
          />
        </div>
      </section>

      <ExactPageFrame title="Pascha">
      <div className="pc-pagina bg-parchment text-ink">
        <div className={CONTENT}>
          {/* De hele Paschacyclus van dit jaar, dag voor dag — ingeklapt */}
          <div className="pc-cyclus">
            <button type="button" onClick={() => setCyclusOpen((o) => !o)} aria-expanded={cyclusOpen} className="pc-cyclus-knop">
              <span>
                <span className="pc-cyclus-titel">Paschacyclus {pascha.getUTCFullYear()}</span>
                <span className="pc-cyclus-onder">Alles wat van de Paasdatum afhangt, dag voor dag</span>
              </span>
              <ChevronRight className={`h-5 w-5 shrink-0 text-gold-deep transition-transform ${cyclusOpen ? 'rotate-90' : ''}`} />
            </button>
            {cyclusOpen && (
              <ol className="thin-scroll pc-cyclus-lijst">
                {PAASCYCLUS.map((f) => {
                  const d = addDays(pascha, f.offset ?? 0);
                  const isPascha = f.soort === 'pascha';
                  const voorbij = d.getTime() < vandaag.getTime();
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => openDag(ymd(d))}
                        className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-gold-pale ${isPascha ? 'bg-wine text-gold-light hover:bg-wine' : ''} ${voorbij && !isPascha ? 'text-ink-mute' : ''}`}
                      >
                        <span className={`w-14 shrink-0 text-xs font-bold ${isPascha ? 'text-gold-light' : 'text-gold-deep'}`}>{formatKort(d)}</span>
                        <span className={`flex-1 text-sm ${isPascha || f.groot ? 'font-bold' : ''}`}>{f.kort ?? f.naam}</span>
                        {(f.groot || isPascha) && <FeestTag feest={f} />}
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* Pascha: de Verrijzenis van onze Heer, met het troparion en de verdieping */}
          <section className="pc-feest" aria-labelledby="pc-feest-titel">
            <h2 id="pc-feest-titel" className="pc-feest-titel">Pascha</h2>
            <p className="pc-feest-onder">De Verrijzenis van onze Heer</p>
            <p className="pc-feest-tekst">In de Nacht van Pascha vieren wij de Verrijzenis van Christus, Die door Zijn dood de dood heeft overwonnen en ons het eeuwige leven heeft geschonken.</p>
            <p className="pascha-groet">„Christus is opgestaan!” <span>„Hij is waarlijk opgestaan!”</span></p>
            <div className="pc-feest-vakken">
              <div className="pc-vak jr-vak">
                <p className="pc-vak-label">Troparion</p>
                <p className="pc-tropaar">{PERIODE_POPUPS.pascha.highlight}</p>
              </div>
            </div>
            <Verdieping items={INFO_CARDS} onOpen={setInfoOpen} />
          </section>
        </div>
      </div>

      <TimeSanctificationTimeline current="pascha" />
      </ExactPageFrame>

      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? PASCHA_INFO[infoOpen] : null} />
      <LiturgicalPopup open={stapOpen !== null} onClose={() => setStapOpen(null)} content={stapOpen ? stapInhoud[stapOpen] : null} />
    </>
  );
}

/** De bovenkant beweegt mee met de actuele periode — waar zijn we, wat betekent het, wat kan ik vandaag lezen of bidden.
 *  Desktop: met de tijdlijn ernaast; mobiel en tablet: compact onder elkaar met de tijdlijn in beeld. Alleen bestaande
 *  gegevens: de cyclus (lib/paascyclus.ts), de dag (dagInfo met de gekozen kalender), de feesten, het leesrooster en de
 *  uitleg van de stappen. Ontbrekende onderdelen worden weggelaten. */
function PaschaInhoud({
  mobiel, cyclus, bekeken, gekozen, dag, lezingen, heeftRooster, kies, openStap, openDag, openDagLezingen, openLezing,
}: {
  mobiel: boolean;
  cyclus: Paascyclus;
  bekeken: StapKey | null;
  gekozen: StapKey | null;
  dag: DagInfo;
  lezingen: HtcLezingRef[] | undefined;
  heeftRooster: boolean;
  kies: (stap: StapKey | null) => void;
  openStap: (stap: StapKey) => void;
  openDag: (ymd: string) => void;
  openDagLezingen: () => void;
  openLezing: (l: HtcLezingRef) => void;
}) {
  const { pascha, offset: off, huidige, dagenTotPascha } = cyclus;
  const stap = bekeken ? cyclus.stappen.find((s) => s.key === bekeken) ?? null : null;
  const isNu = !!stap && stap.key === huidige;
  const datumVan = (f: Feest) => addDays(pascha, f.offset ?? 0);
  const rijOpDag = (label: string, f: Feest): Rij => ({ label: `${label} · ${formatDag(datumVan(f))}`, titel: f.naam, tekst: f.toelichting, open: () => openDag(ymd(datumVan(f))) });

  // Vandaag: de gedachtenis van de dag (eerst de beweeglijke), anders wat de kalender over deze dag in de periode zegt
  const dagFeest = dag.feesten.find((f) => f.offset !== undefined) ?? dag.feesten[0];
  const dagregel =
    huidige === 'pascha'
      ? 'Vandaag is het heilig Pascha'
      : huidige === 'lichte-week'
        ? `${dagFeest?.kort ?? dagFeest?.naam ?? dag.seizoen} · Lichte Week`
      : dagFeest?.offset !== undefined
        ? dagFeest.naam
        : dag.seizoen;

  const rijen: Rij[] = [];
  if (isNu) {
    if (dagFeest && !PAASFEEST.includes(huidige!)) rijen.push({ label: 'Vandaag', titel: dagFeest.naam, tekst: dagFeest.toelichting, open: () => openDag(dag.ymd) });
    if (huidige === 'voorbereiding') {
      const z = volgendeZondag(off, cyclus.stappen[0].offsetRange[1]);
      if (z && z.offset !== off) rijen.push(rijOpDag('Eerstvolgende zondag', z));
    }
    if (huidige === 'grote-vasten' || huidige === 'paastijd') {
      const z = zondagVanDeWeek(off);
      if (z && z.offset !== off) rijen.push(rijOpDag('Zondag van deze week', z));
    }
    if (huidige === 'grote-vasten') rijen.push({ label: 'Vasten vandaag', titel: dag.vasten.label, tekst: dag.vasten.detail, href: '#vasten' });
    const hemelvaart = feestMetId('hemelvaart');
    const pinksteren = feestMetId('pinksteren');
    if (huidige === 'paastijd' && hemelvaart) rijen.push(rijOpDag(`Over ${dagen((hemelvaart.offset ?? 0) - off)}`, hemelvaart));
    if (huidige === 'hemelvaart' || huidige === 'pinksteren') {
      if (!dagFeest || dagFeest.offset === undefined) {
        const vorige = [...PAASCYCLUS].reverse().find((f) => (f.offset ?? 0) < off && (f.offset ?? 0) >= (hemelvaart?.offset ?? 39) && (f.rang ?? 0) >= 4);
        if (vorige) rijen.push(rijOpDag('Laatst gevierd', vorige));
      }
      if (pinksteren && off < (pinksteren.offset ?? 0)) rijen.push(rijOpDag(`Over ${dagen((pinksteren.offset ?? 0) - off)}`, pinksteren));
    }
  }
  const troparion = isNu && !PAASFEEST.includes(huidige!) ? dagFeest?.troparion : undefined;
  // Terug naar de actuele periode: de knop verdwijnt, dus de focus gaat naar de actuele rij op de tijdlijn
  const terug = (e: { currentTarget: HTMLElement }) => {
    const vak = e.currentTarget.closest('.ot-pc-m, .ot-pc-desk');
    kies(null);
    requestAnimationFrame(() => vak?.querySelector<HTMLElement>('.vg-pc-lijn .is-nu')?.focus());
  };
  // Hoogstens drie lezingen (op Goede Vrijdag zijn het er meer dan twintig); de rest via "Alle lezingen van vandaag".
  const heeftVandaag = isNu && (rijen.length > 0 || !!troparion || !!lezingen?.length);

  // Mobiel en tablet (onder 1024 px): dezelfde gegevens, compact onder elkaar — de periode, vandaag (of algemene
  // informatie over een andere periode), de tijdlijn en de uitleg met "Lees meer".
  if (mobiel) {
    const [hoofd, ...overig] = rijen;
    const inPeriode = stap ? PAASCYCLUS.filter((f) => (f.offset ?? 0) >= stap.offsetRange[0] && (f.offset ?? 0) <= stap.offsetRange[1]) : [];
    const kiesMobiel = (k: StapKey, knop: HTMLElement) => {
      kies(k);
      // De rij die de bezoeker koos blijft in beeld, ook als de inhoud erboven van hoogte verandert
      requestAnimationFrame(() => knop.scrollIntoView({ block: 'nearest', behavior: 'auto' }));
    };
    return (
      <div className="ot-pc-m">
        <header className="ot-pc-ctx-kop">
          {stap ? (
            <>
              <p className="vg-label">{isNu ? 'De huidige periode' : 'Periode in de Paschacyclus'}</p>
              <h2 className="ot-titel ot-pc-m-titel">
                {stap.label}
                {isNu && <span className="ot-nu">Nu</span>}
              </h2>
              <p className="ot-pc-bereik">
                {bereikLang(stap.van, stap.tot)} {stap.tot.getUTCFullYear()}
              </p>
              {isNu && <p className="ot-pc-dagregel">{dagregel}</p>}
              {isNu && (
                <button type="button" className="ot-tekstknop ot-pc-bekijk" onClick={() => openStap(stap.key)}>
                  Bekijk deze periode ›
                </button>
              )}
            </>
          ) : (
            <>
              <h2 className="ot-titel ot-pc-m-titel">Naar Pascha</h2>
              <p className="ot-pc-bereik">{formatDatum(pascha)}</p>
            </>
          )}
          <Sierlijn />
          {(!stap || isNu) && dagenTotPascha > 0 && <p className="ot-pc-nog">Nog {dagen(dagenTotPascha)} tot Pascha</p>}
          {gekozen && gekozen !== huidige && (
            <button type="button" className="ot-tekstknop ot-pc-terug" onClick={terug}>
              ‹ {huidige ? 'Terug naar nu' : 'Terug naar het overzicht'}
            </button>
          )}
        </header>

        {!stap && (
          <p className="ot-pc-tekst ot-pc-midden">
            De voorbereiding begint op {formatDag(cyclus.stappen[0].van)} {cyclus.stappen[0].van.getUTCFullYear()}, met de Zondag van de Tollenaar en de Farizeeër.
          </p>
        )}

        {/* Pascha en de Lichte Week: de feestgroet met het bestaande icoon (volledig, eigen verhouding) en het paastroparion */}
        {isNu && PAASFEEST.includes(huidige!) && (
          <div className="ot-pc-feestgroet">
            <img className="ot-pc-icoon" src="/images/feesten/pascha.webp" alt="Icoon van de Verrijzenis van Christus" width={569} height={800} decoding="async" />
            <div>
              <p className="vg-label">{off === 0 ? 'Vandaag vieren wij' : 'In de Lichte Week vieren wij'}</p>
              <p className="ot-pc-groet">
                Christus is opgestaan!<span>Hij is waarlijk opgestaan!</span>
              </p>
            </div>
            <div className="ot-pc-m-trop">
              <p className="vg-label ot-pc-tlabel">Troparion</p>
              <blockquote className="ot-pc-troparion">{PERIODE_POPUPS.pascha.highlight}</blockquote>
            </div>
          </div>
        )}

        {/* Vandaag binnen de actuele periode: de gedachtenis of het dagthema, met hoogstens twee hoofdacties */}
        {isNu && (hoofd || troparion || heeftRooster) && (
          <section className="ot-pc-sectie" aria-labelledby="pc-m-vandaag">
            <h2 id="pc-m-vandaag" className="vg-label">Vandaag binnen deze periode</h2>
            {hoofd && (
              <div className="ot-pc-m-hoofd">
                <small className="ot-pc-rijlabel">{hoofd.label}</small>
                <p className="ot-pc-m-hoofdtitel">{hoofd.titel}</p>
                {hoofd.tekst && <p className="ot-pc-m-hoofdtekst">{hoofd.tekst}</p>}
              </div>
            )}
            {troparion && (
              <>
                <p className="vg-label ot-pc-tlabel">Troparion</p>
                <blockquote className="ot-pc-troparion">{troparion}</blockquote>
              </>
            )}
            {overig.length > 0 && (
              <ul className="ot-register ot-pc-m-overig">
                {overig.map((r) => {
                  const inhoud = (
                    <>
                      <span className="ot-rij-tekst">
                        <small className="ot-pc-rijlabel">{r.label}</small>
                        <b>{r.titel}</b>
                      </span>
                      <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
                    </>
                  );
                  return (
                    <li key={r.label + r.titel}>
                      {r.href ? <a className="ot-rij" href={r.href}>{inhoud}</a> : <button type="button" className="ot-rij" onClick={r.open}>{inhoud}</button>}
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="ot-pc-m-acties">
              {heeftRooster && (
                <button type="button" className="ot-actie" onClick={openDagLezingen}>
                  Lees de lezingen <span aria-hidden="true">›</span>
                </button>
              )}
              <button type="button" className="ot-actie is-omlijnd" onClick={() => openDag(dag.ymd)}>
                Bekijk de dag
              </button>
            </div>
          </section>
        )}

        {/* Alleen tijdens de Paschacyclus en bij de huidige periode: de betekenis van vandaag (kleur, icoon, hymne …) */}
        {isNu && <BetekenisVanVandaag dag={dag} opPascha />}

        {/* Een andere periode bekijken: geen "vandaag", maar de gedachtenissen van die periode met hun datums */}
        {stap && !isNu && inPeriode.length > 0 && (
          <section className="ot-pc-sectie" aria-labelledby="pc-m-periode">
            <h2 id="pc-m-periode" className="vg-label">In deze periode</h2>
            <ul className="ot-register ot-pc-m-overig">
              {inPeriode.map((f) => (
                <li key={f.id}>
                  <button type="button" className="ot-rij" onClick={() => openDag(ymd(datumVan(f)))}>
                    <span className="ot-rij-tekst">
                      <small className="ot-pc-rijlabel">{formatDag(datumVan(f))}</small>
                      <b>{f.kort ?? f.naam}</b>
                    </span>
                    <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* De zes periodes, altijd in beeld */}
        <CyclusTijdlijn stappen={cyclus.stappen} huidige={huidige} bekeken={bekeken} label="De weg naar Pascha" onKies={(k, knop) => kiesMobiel(k, knop)} />

        {/* Uitleg over de bekeken periode, met de bestaande uitgebreide uitleg achter "Lees meer" */}
        {stap && (
          <section className="ot-pc-sectie" aria-labelledby="pc-m-betekenis">
            <h2 id="pc-m-betekenis" className="vg-label">Wat betekent deze periode?</h2>
            {betekenis(stap.key).map((t) => (
              <p key={t} className="ot-pc-tekst">{t}</p>
            ))}
            <button type="button" className="ot-tekstknop ot-pc-meer" onClick={() => openStap(stap.key)}>
              Lees meer over deze periode ›
            </button>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="ot-pc-desk">
      <div className="ot-pc-ctx">
        {stap ? (
          <>
            <header className="ot-pc-ctx-kop">
              <p className="vg-label">{isNu ? 'De huidige periode' : 'Periode in de Paschacyclus'}</p>
              <h2 className="ot-titel">
                {stap.label}
                {isNu && <span className="ot-nu">Nu</span>}
              </h2>
              <p className="ot-pc-bereik">
                {bereikLang(stap.van, stap.tot)} {stap.tot.getUTCFullYear()}
              </p>
              {isNu && <p className="ot-pc-dagregel">{dagregel}</p>}
              {isNu && (
                <button type="button" className="ot-tekstknop ot-pc-bekijk" onClick={() => openStap(stap.key)}>
                  Bekijk deze periode ›
                </button>
              )}
              <Sierlijn />
              {isNu && dagenTotPascha > 0 && <p className="ot-pc-nog">Nog {dagen(dagenTotPascha)} tot Pascha</p>}
            </header>

            {/* Pascha en de Lichte Week: de feestgroet met het bestaande icoon en het paastroparion */}
            {isNu && PAASFEEST.includes(huidige!) && (
              <div className="ot-pc-feestgroet">
                <img className="ot-pc-icoon" src="/images/feesten/pascha.webp" alt="Icoon van de Verrijzenis van Christus" width={569} height={800} decoding="async" />
                <div>
                  <p className="vg-label">{off === 0 ? 'Vandaag vieren wij' : 'In de Lichte Week vieren wij'}</p>
                  <p className="ot-pc-groet">
                    Christus is opgestaan!<span>Hij is waarlijk opgestaan!</span>
                  </p>
                  <p className="vg-label ot-pc-tlabel">Troparion</p>
                  <blockquote className="ot-pc-troparion">{PERIODE_POPUPS.pascha.highlight}</blockquote>
                </div>
              </div>
            )}

            <section className="ot-pc-sectie" aria-labelledby="pc-betekenis">
              <h2 id="pc-betekenis" className="vg-label">Wat betekent deze periode?</h2>
              {betekenis(stap.key).map((t) => (
                <p key={t} className="ot-pc-tekst">{t}</p>
              ))}
              <button type="button" className="ot-tekstknop ot-pc-meer" onClick={() => openStap(stap.key)}>
                Lees meer over deze periode ›
              </button>
            </section>

            {heeftVandaag && (
              <section className="ot-pc-sectie" aria-labelledby="pc-vandaag">
                <h2 id="pc-vandaag" className="vg-label">Vandaag binnen deze periode</h2>
                {rijen.length > 0 && (
                  <ul className="ot-register">
                    {rijen.map((r) => {
                      const inhoud = (
                        <>
                          <span className="ot-rij-tekst">
                            <small className="ot-pc-rijlabel">{r.label}</small>
                            <b>{r.titel}</b>
                            {r.tekst && <span>{r.tekst}</span>}
                          </span>
                          <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
                        </>
                      );
                      return (
                        <li key={r.label + r.titel}>
                          {r.href ? (
                            <a className="ot-rij" href={r.href}>{inhoud}</a>
                          ) : (
                            <button type="button" className="ot-rij" onClick={r.open}>{inhoud}</button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {troparion && (
                  <>
                    <p className="vg-label ot-pc-tlabel">Troparion</p>
                    <blockquote className="ot-pc-troparion">{troparion}</blockquote>
                  </>
                )}
                {lezingen && lezingen.length > 0 && (
                  <ul className="ot-register ot-pc-lezingen" aria-label="Lezingen van vandaag">
                    {lezingen.slice(0, 3).map((l, i) => {
                      const ref = vertaalRef(l.ref);
                      const soort = lezingSoort(ref);
                      return (
                        <li key={`${l.ref}-${i}`}>
                          <button type="button" className="ot-rij" onClick={() => openLezing(l)}>
                            <span className="ot-rij-tekst">
                              <small className="ot-pc-rijlabel">{soort === 'evangelie' ? 'Evangelie' : soort === 'oud' ? 'Oude Testament' : 'Apostel'}</small>
                              <b>{ref}</b>
                            </span>
                            <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {heeftRooster && (
                  <button type="button" className="ot-tekstknop ot-pc-meer" onClick={openDagLezingen}>
                    Alle lezingen van vandaag ›
                  </button>
                )}
              </section>
            )}

            {isNu && <BetekenisVanVandaag dag={dag} opPascha />}

            {gekozen && gekozen !== huidige && (
              <button type="button" className="ot-tekstknop ot-pc-terug" onClick={terug}>
                ‹ {huidige ? 'Terug naar de huidige periode' : 'Terug naar het overzicht'}
              </button>
            )}
          </>
        ) : (
          // Buiten de Paschacyclus: geen periode is "nu"; het komende Pascha, de aftelling en het begin van de voorbereiding
          <header className="ot-pc-ctx-kop">
            <h2 className="ot-titel">Naar Pascha</h2>
            <p className="ot-pc-datum">{formatDatum(pascha)}</p>
            <Sierlijn />
            <p className="ot-pc-nog">Nog {dagen(dagenTotPascha)} tot Pascha</p>
            <p className="ot-pc-tekst ot-pc-midden">
              De voorbereiding begint op {formatDag(cyclus.stappen[0].van)} {cyclus.stappen[0].van.getUTCFullYear()}, met de Zondag van de Tollenaar en de
              Farizeeër. Kies een periode op de tijdlijn om te lezen wat zij betekent.
            </p>
          </header>
        )}
      </div>

      <CyclusTijdlijn stappen={cyclus.stappen} huidige={huidige} bekeken={bekeken} label="De weg naar Pascha" onKies={(k) => kies(k)} />
    </div>
  );
}
