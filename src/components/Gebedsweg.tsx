import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronRight, Moon, Sun } from 'lucide-react';
import { useApp } from '../lib/context';
import { naamVan, slugVan, type ServiceMapping } from '../lib/etmaal';
import { GEBEDEN, GEBEDEN_ZICHTBAAR } from '../lib/gebeden';
import { AANBIDDING, bidPad, gebedTitel, heelUurLabel, isAvonduur, isZonOfFeestdag, kortVan, laadUurBestand, onderdelenVan, stapIndex, type KortStap, type Onderdeel, type UurBestand } from '../lib/gebedsweg';
import { heiligeTitel, zelfdeGedachtenis } from '../lib/heiligenPopup';
import { useGekozenVorm } from '../lib/jezusgebed';
import { dagInfo, formatDag, hoofdletter } from '../lib/kalender';
import { useLeesvoorkeur, vergroot, verklein, zetKleur } from '../lib/leesvoorkeur';
import { PSALMEN, laadPsalmTeksten, type PsalmTeksten } from '../lib/psalmen';
import { useSchermAan } from '../lib/schermAan';
import { Gebedsregels } from './AdemMobiel';
import { Kop, Laag, Sierlijn } from './MobielLaag';
import { Verzen } from './PsalterMobiel';
import { useHexaPsalm, type HexaStrofe } from '../lib/hexapsalm';
import { SIERKRUIS } from './symbolen';
import './gebedsweg.css';

// De gebedsweg op mobiel (spec: docs/superpowers/specs/2026-11-05-gebedsweg-design.md), onder #etmaal/<slug>/bid:
//   …/bid             het begin van het uur: de Kerk van vandaag, Kort of Het hele uur, de inhoud van het uur
//   …/bid/kort/<n>    stap n van Kort (kernvers, Jezusgebed)
//   …/bid/heel/<n>    stap n van Het hele uur (alleen de onderdelen met tekst)
//   …/bid/einde       de afsluiting
// Teksten alleen uit lib/etmaal.ts, lib/gebeden.ts en public/data/psalmen.json.

/** Vervangt het adres (geen extra stap in de geschiedenis), bijvoorbeeld van een oud of onbekend adres naar het begin. */
export function Doorsturen({ adres }: { adres: string }) {
  useEffect(() => window.location.replace(adres), [adres]);
  return null;
}

/** De onderdelen van het uur, of null zolang het aangeleverde bestand (public/data/uren/<slug>.json) nog laadt. */
function useOnderdelen(d: ServiceMapping): Onderdeel[] | null {
  const slug = slugVan(d);
  const { vandaag, vandaagYmd, mode } = useApp();
  const zonOfFeest = useMemo(() => isZonOfFeestdag(dagInfo(vandaag, mode, vandaagYmd)), [vandaag, mode, vandaagYmd]);
  const [bestand, setBestand] = useState<{ slug: string; b: UurBestand | null } | null>(null);
  useEffect(() => {
    let actief = true;
    laadUurBestand(slug).then((b) => actief && setBestand({ slug, b }));
    return () => {
      actief = false;
    };
  }, [slug]);
  return useMemo(
    () => (bestand?.slug === slug ? onderdelenVan(d, bestand.b, (nr) => !!PSALMEN[nr - 1]?.hasText, GEBEDEN_ZICHTBAAR, zonOfFeest) : null),
    [bestand, slug, d, zonOfFeest],
  );
}

/** Systeem: donker bij de avond- en nachturen of als het toestel donker staat; een eigen keuze blijft gelden. */
function useNacht(d: ServiceMapping) {
  const v = useLeesvoorkeur();
  return v.kleur === 'systeem' ? v.nacht || isAvonduur(d) : v.nacht;
}

export default function Gebedsweg({ d, pad, terug, slim, extra }: { d: ServiceMapping; pad: string[]; terug: string; slim: boolean; extra?: ReactNode }) {
  const delen = useOnderdelen(d);
  const nacht = useNacht(d);
  const slug = slugVan(d);
  const [weg, n] = pad;
  if (weg === 'einde') return <Afsluiting d={d} nacht={nacht} terug={terug} />;
  if (weg === 'kort' || weg === 'heel') {
    if (!delen) return null; // het uurbestand laadt nog (kort)
    const stappen: Array<Onderdeel | KortStap> = weg === 'kort' ? kortVan(d, delen) : delen.filter((o) => o.beschikbaar);
    const i = stapIndex(n, stappen.length);
    if (i === null) return <Doorsturen adres={bidPad(slug)} />;
    // Kort sluit met Amen direct af (terug naar waar je vandaan kwam); het hele uur eindigt met de afsluiting
    return <Stap key={`${weg}-${i}`} d={d} weg={weg} stap={stappen[i]} i={i} aantal={stappen.length} nacht={nacht} amen={weg === 'kort' ? terug : bidPad(slug, 'einde')} />;
  }
  if (weg) return <Doorsturen adres={bidPad(slug)} />;
  return <UurBegin d={d} delen={delen} terug={terug} slim={slim} extra={extra} />;
}

function Kernvers({ kernvers }: { kernvers: ServiceMapping['kernvers'] }) {
  return (
    <blockquote className="gw-groot">
      {kernvers.verses.map((v) => <span key={v}>{v}</span>)}
      <cite>{kernvers.reference.replace('Psalm Kernvers:', 'Psalm')}</cite>
    </blockquote>
  );
}

// 1. Het begin van het uur
function UurBegin({ d, delen, terug, slim, extra }: { d: ServiceMapping; delen: Onderdeel[] | null; terug: string; slim: boolean; extra?: ReactNode }) {
  const { vandaag, vandaagYmd, mode, heiligen } = useApp();
  const dag = useMemo(() => dagInfo(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);
  const slug = slugVan(d);
  // Zelfde afleiding als de kaart "Feesten & heiligen" op Vandaag
  const hoofdFeest = dag.feesten[0];
  const lijst = heiligen?.HEILIGEN[dag.kerkKey]?.filter((h) => h.type === 'saint') ?? [];
  const heilige = lijst.find((h) => !(hoofdFeest && zelfdeGedachtenis(h.naam, hoofdFeest.naam)));
  const meer = lijst.length - 1;
  const gedachtenis = hoofdFeest
    ? hoofdFeest.naam
    : heilige
      ? `${heiligeTitel(heilige.naam)}${meer > 0 ? ` en nog ${meer} ${meer === 1 ? 'heilige' : 'heiligen'}` : ''}`
      : null;
  const ritme = [dag.toon ? `Toon ${dag.toon}` : null, dag.seizoen, dag.vasten.label.toLowerCase()].filter(Boolean).join(' · ');
  const tebidden = delen?.filter((o) => o.beschikbaar) ?? [];
  const kort = delen ? kortVan(d, delen).filter((s) => s.soort === 'kernvers').length : 1; // aantal kernverzen in Kort
  return (
    <Laag className="gw gw-begin" label={gebedTitel(d)}>
      <div className="gw-banner">
        <img src={`/images/etmaal/onder/${slug}.webp`} alt="" width={900} height={507} decoding="async" />
        <Kop terug={terug} merk slim={slim} />
        <div className="gw-banner-tekst">
          <h1 tabIndex={-1}>{gebedTitel(d)}</h1>
          <p>{d.hoofdgedachtenis}</p>
        </div>
      </div>
      <div className="gw-papier">
        {/* Kaartvorm van het pijlgebed op Vandaag (.m-kader), maar compact en ingetogen: wie hier komt, komt om te bidden */}
        <section className="gw-kerk m-kader" aria-label="De Kerk vandaag">
          <p className="gw-label">De Kerk vandaag</p>
          <b className="m-kader-titel">{hoofdletter(dag.weekdagNaam)} {formatDag(mode === 'oud' ? dag.kerk : dag.civil)}</b>
          {gedachtenis && <span className="m-kader-onder">{gedachtenis}</span>}
          <span className="m-kader-onder">{ritme}</span>
        </section>
        {/* Het hele uur is de kern en staat bovenaan; Kort eronder, soberder. Een pijltje rechts nodigt uit om te tikken. */}
        <div className="gw-keuzes">
          {tebidden.length ? (
            <a className="gw-keuze is-hoofd" href={bidPad(slug, 'heel', 1)}>
              {/* Zegt wat de knop werkelijk opent: het hele uur, of alleen de onderdelen die er al zijn */}
              <b>{heelUurLabel(delen ?? [])}</b>
              <span className="gw-keuze-onder">{tebidden.map((o) => o.titel).join(' · ')}</span>
              <ChevronRight className="gw-keuze-pijl" aria-hidden="true" />
            </a>
          ) : (
            <p className="gw-keuze is-hoofd is-uit" aria-disabled="true">
              <b>Bid het hele uur</b>
              <span className="gw-keuze-onder">{delen ? 'De teksten van dit uur volgen nog' : 'Wordt geladen…'}</span>
            </p>
          )}
          <a className="gw-keuze is-sober" href={bidPad(slug, 'kort', 1)}>
            <b>Bid kort · 2 min</b>
            <span className="gw-keuze-onder">{kort > 1 ? `${kort} kernverzen en het Jezusgebed` : 'Het kernvers en het Jezusgebed'}</span>
            <ChevronRight className="gw-keuze-pijl" aria-hidden="true" />
          </a>
        </div>
        <h2 className="gw-label gw-inhoud-kop">Inhoud van dit uur</h2>
        <ul className="gw-inhoud">
          {delen?.map((o, i) => (
            <li key={i}>
              {o.beschikbaar ? (
                // Elk onderdeel met tekst opent die stap van Het hele uur (daarna gaat Verder door het uur)
                <a className="gw-inhoud-link" href={bidPad(slug, 'heel', tebidden.indexOf(o) + 1)}>
                  <span>{o.titel}</span>
                  <ChevronRight className="am-pijl" aria-hidden="true" />
                </a>
              ) : (
                <>
                  <span>{o.titel}</span>
                  {o.soort === 'psalm' && o.pdf ? (
                    <a href={o.pdf} target="_blank" rel="noreferrer">Als PDF</a>
                  ) : (
                    <em>Volgt nog</em>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
        {extra}
      </div>
    </Laag>
  );
}

// 2. Bidden: één onderdeel, niets anders
function Stap({ d, weg, stap, i, aantal, nacht, amen }: { d: ServiceMapping; weg: 'kort' | 'heel'; stap: Onderdeel | KortStap; i: number; aantal: number; nacht: boolean; amen: string }) {
  useSchermAan(true);
  const lees = useLeesvoorkeur();
  const slug = slugVan(d);
  const laatste = i === aantal - 1;
  return (
    <Laag className={`gw gw-bid${weg === 'kort' ? ' is-kort' : nacht ? ' is-nacht' : ''}`} label={`${gebedTitel(d)}, ${i + 1} van ${aantal}`}>
      <div className="am-kop">
        <a className="am-terug" href={bidPad(slug)} aria-label="Stoppen en terug naar het begin van het uur">×</a>
        <span className="gw-context">{naamVan(d)}</span>
        {/* Rechtsboven: tekstgrootte en donker of licht scherm (de leesvoorkeur, ook voor de afsluiting en andere
            leesteksten); Bid kort heeft altijd het donkere beeld van het pijlgebed, dus daar alleen de tekstgrootte */}
        <div className="gw-bediening" role="group" aria-label="Leesweergave">
          <button type="button" className="gw-nachtknop gw-aa" onClick={verklein} disabled={lees.min} aria-label="Tekst verkleinen" title="Tekst verkleinen">A<sup>−</sup></button>
          <button type="button" className="gw-nachtknop gw-aa" onClick={vergroot} disabled={lees.max} aria-label="Tekst vergroten" title="Tekst vergroten">A<sup>+</sup></button>
          {weg !== 'kort' && (
            <button type="button" className="gw-nachtknop" onClick={() => zetKleur(nacht ? 'licht' : 'donker')} aria-pressed={nacht} aria-label={nacht ? 'Licht scherm' : 'Donker scherm'} title={nacht ? 'Licht scherm' : 'Donker scherm'}>
              {nacht ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
      <div className="gw-vlak">
        <StapInhoud stap={stap} />
      </div>
      <div className="gw-voet">
        <a className="gw-verder" href={laatste ? amen : bidPad(slug, weg, i + 2)}>{laatste ? 'Amen' : 'Verder'}</a>
        <span className="gw-teller">{i + 1} van {aantal}</span>
      </div>
    </Laag>
  );
}

function StapInhoud({ stap }: { stap: Onderdeel | KortStap }) {
  if (stap.soort === 'kernvers')
    return (
      <>
        <h1 className="sr-only" tabIndex={-1}>Kernvers</h1>
        <Kernvers kernvers={stap.kernvers} />
      </>
    );
  if (stap.soort === 'jezusgebed') return <Jezusgebed />;
  if (stap.soort === 'aanbidding')
    return (
      <>
        <h1 className="sr-only" tabIndex={-1}>Aanbidding</h1>
        {AANBIDDING.map((alinea) => <p key={alinea} className="gw-gebed gw-aanbidding">{alinea}</p>)}
      </>
    );
  if (stap.soort === 'psalm') return <PsalmStap nr={stap.nr} titel={stap.titel} />;
  if (stap.soort === 'hexapsalm') return <HexapsalmStap nr={stap.nr} />;
  const tekst = stap.soort === 'gebed' ? GEBEDEN.find((g) => g.id === stap.id)?.tekst : stap.tekst;
  return (
    <>
      <h1 className="gw-titel" tabIndex={-1}>{stap.titel}</h1>
      <Sierlijn />
      <p className="gw-gebed">{tekst}</p>
    </>
  );
}

export function Jezusgebed() {
  const vorm = useGekozenVorm();
  return (
    <>
      <h1 className="sr-only" tabIndex={-1}>Het Jezusgebed</h1>
      <p className="gw-groot"><Gebedsregels tekst={vorm.tekst} /></p>
      <p className="gw-noot">Bid het in stilte</p>
    </>
  );
}

/** Strofen van de Hexapsalm: de tekst in de gewone psalmopmaak, liturgische aanwijzingen ("(3x)", "en nogmaals:",
 *  "Eer … Nu en …") kleiner en in rood, zodat ze niet hardop worden gelezen. */
function HexaStrofen({ strofen }: { strofen: HexaStrofe[] }) {
  return (
    <div className="pm-verzen lees-tekst gw-hexa">
      {strofen.map((s, i) => (
        // De rode beginletter alleen bij een strofe die met tekst begint, niet bij een aanwijzing
        <div key={i} className={`pm-vers${s.regels[0]?.rubriek ? '' : ' met-initiaal'}`}>
          <p>
            {s.regels.map((r, j) => (
              <span key={j} className={r.inspring ? 'is-in' : undefined}>
                {r.rubriek && <span className="gw-rubriek">{r.rubriek}</span>}
                {r.rubriek && r.tekst && ' '}
                {r.tekst}
                {r.na && <span className="gw-rubriek"> {r.na}</span>}
              </span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
}

function HexapsalmStap({ nr }: { nr: number }) {
  const psalm = useHexaPsalm(nr);
  return (
    <>
      <p className="gw-label gw-hexa-label">Hexapsalm</p>
      <h1 className="gw-titel" tabIndex={-1}>Psalm {nr}</h1>
      <Sierlijn />
      {psalm === null ? (
        <p className="gw-noot">De tekst wordt geladen…</p>
      ) : psalm === 'fout' ? (
        <p className="gw-noot">De tekst kon niet worden geladen.</p>
      ) : (
        <>
          {psalm.voor && <HexaStrofen strofen={psalm.voor} />}
          <HexaStrofen strofen={psalm.strofen} />
        </>
      )}
    </>
  );
}

function PsalmStap({ nr, titel }: { nr: number; titel: string }) {
  const [teksten, setTeksten] = useState<PsalmTeksten | null>(null);
  const [fout, setFout] = useState(false);
  useEffect(() => {
    laadPsalmTeksten().then(setTeksten, () => setFout(true));
  }, []);
  const tekst = teksten?.[nr];
  return (
    <>
      <h1 className="gw-titel" tabIndex={-1}>{titel}</h1>
      <Sierlijn />
      {tekst ? <Verzen verzen={tekst.verzen} idVoorvoegsel="gw-vers" /> : <p className="gw-noot">{fout ? 'De tekst kon niet worden geladen.' : 'De tekst wordt geladen…'}</p>}
    </>
  );
}

// Waar "Terug" na het bidden heen gaat, in woorden: de ingang waarvandaan het uur werd geopend.
const INGANG: Record<string, string> = { '#vandaag': 'Vandaag', '#bidden': 'Bidden', '#cycli': 'Ontdek', '#etmaal': 'Etmaal' };
const terugTekst = (terug: string) => (INGANG[terug] ? `Terug naar ${INGANG[terug]}` : terug.startsWith('#etmaal/') ? 'Terug naar het gebedsuur' : 'Terug');

// 3. De afsluiting
function Afsluiting({ d, nacht, terug }: { d: ServiceMapping; nacht: boolean; terug: string }) {
  useSchermAan(true);
  return (
    <Laag className={`gw gw-einde${nacht ? ' is-nacht' : ''}`} label={`${gebedTitel(d)}: einde`}>
      <h1 className="sr-only" tabIndex={-1}>Einde van {gebedTitel(d).toLowerCase()}</h1>
      <span className="gw-kruis">{SIERKRUIS}</span>
      <Kernvers kernvers={d.kernvers} />
      <a className="gw-verder" href={terug}>{terugTekst(terug)}</a>
    </Laag>
  );
}
