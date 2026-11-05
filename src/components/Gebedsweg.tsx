import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useApp } from '../lib/context';
import { naamVan, slugVan, type ServiceMapping } from '../lib/etmaal';
import { GEBEDEN, GEBEDEN_ZICHTBAAR } from '../lib/gebeden';
import { KORT, bidPad, gebedTitel, isAvonduur, laadUurBestand, onderdelenVan, stapIndex, type KortStap, type Onderdeel, type UurBestand } from '../lib/gebedsweg';
import { heiligeTitel, zelfdeGedachtenis } from '../lib/heiligenPopup';
import { useGekozenVorm } from '../lib/jezusgebed';
import { dagInfo, formatDag, hoofdletter } from '../lib/kalender';
import { useLeesvoorkeur } from '../lib/leesvoorkeur';
import { PSALMEN, laadPsalmTeksten, type PsalmTeksten } from '../lib/psalmen';
import { useSchermAan } from '../lib/schermAan';
import { Gebedsregels } from './AdemMobiel';
import { Kop, Laag, Sierlijn } from './MobielLaag';
import { Verzen } from './PsalterMobiel';
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
  const [bestand, setBestand] = useState<{ slug: string; b: UurBestand | null } | null>(null);
  useEffect(() => {
    let actief = true;
    laadUurBestand(slug).then((b) => actief && setBestand({ slug, b }));
    return () => {
      actief = false;
    };
  }, [slug]);
  return useMemo(
    () => (bestand?.slug === slug ? onderdelenVan(d, bestand.b, (nr) => !!PSALMEN[nr - 1]?.hasText, GEBEDEN_ZICHTBAAR) : null),
    [bestand, slug, d],
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
  if (weg === 'einde') return <Afsluiting d={d} nacht={nacht} />;
  if (weg === 'kort' || weg === 'heel') {
    if (weg === 'heel' && !delen) return null; // het uurbestand laadt nog (kort)
    const stappen: Array<Onderdeel | KortStap> = weg === 'kort' ? KORT : delen!.filter((o) => o.beschikbaar);
    const i = stapIndex(n, stappen.length);
    if (i === null) return <Doorsturen adres={bidPad(slug)} />;
    return <Stap key={`${weg}-${i}`} d={d} weg={weg} stap={stappen[i]} i={i} aantal={stappen.length} nacht={nacht} />;
  }
  if (weg) return <Doorsturen adres={bidPad(slug)} />;
  return <UurBegin d={d} delen={delen} terug={terug} slim={slim} extra={extra} />;
}

function Kernvers({ d }: { d: ServiceMapping }) {
  return (
    <blockquote className="gw-groot">
      {d.kernvers.verses.map((v) => <span key={v}>{v}</span>)}
      <cite>{d.kernvers.reference.replace('Psalm Kernvers:', 'Psalm')}</cite>
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
        <section className="gw-kerk" aria-label="De Kerk vandaag">
          <p className="gw-label">De Kerk vandaag</p>
          <b>{hoofdletter(dag.weekdagNaam)} {formatDag(mode === 'oud' ? dag.kerk : dag.civil)}</b>
          {gedachtenis && <span>{gedachtenis}</span>}
          <span>{ritme}</span>
        </section>
        <Sierlijn />
        <div className="gw-keuzes">
          <a className="gw-keuze" href={bidPad(slug, 'kort', 1)}>
            <b>Kort · 2 min</b>
            <span>Het kernvers en het Jezusgebed</span>
          </a>
          {tebidden.length ? (
            <a className="gw-keuze is-hoofd" href={bidPad(slug, 'heel', 1)}>
              <b>Het hele uur</b>
              <span>{tebidden.map((o) => o.titel).join(' · ')}</span>
            </a>
          ) : (
            <p className="gw-keuze is-uit" aria-disabled="true">
              <b>Het hele uur</b>
              <span>{delen ? 'De teksten van dit uur volgen nog' : 'Wordt geladen…'}</span>
            </p>
          )}
        </div>
        <h2 className="gw-label gw-inhoud-kop">Inhoud van dit uur</h2>
        <ul className="gw-inhoud">
          {delen?.map((o, i) => (
            <li key={i}>
              <span>{o.titel}</span>
              {!o.beschikbaar &&
                (o.soort === 'psalm' && o.pdf ? (
                  <a href={o.pdf} target="_blank" rel="noreferrer">Als PDF</a>
                ) : (
                  <em>Volgt nog</em>
                ))}
            </li>
          ))}
        </ul>
        {extra}
      </div>
    </Laag>
  );
}

// 2. Bidden: één onderdeel, niets anders
function Stap({ d, weg, stap, i, aantal, nacht }: { d: ServiceMapping; weg: 'kort' | 'heel'; stap: Onderdeel | KortStap; i: number; aantal: number; nacht: boolean }) {
  useSchermAan(true);
  const slug = slugVan(d);
  const laatste = i === aantal - 1;
  return (
    <Laag className={`gw gw-bid${nacht ? ' is-nacht' : ''}`} label={`${gebedTitel(d)}, ${i + 1} van ${aantal}`}>
      <div className="am-kop">
        <a className="am-terug" href={bidPad(slug)} aria-label="Stoppen en terug naar het begin van het uur">×</a>
        <span className="gw-context">{naamVan(d)}</span>
        <span />
      </div>
      <div className="gw-vlak">
        <StapInhoud d={d} stap={stap} />
      </div>
      <div className="gw-voet">
        <a className="gw-verder" href={laatste ? bidPad(slug, 'einde') : bidPad(slug, weg, i + 2)}>{laatste ? 'Amen' : 'Verder'}</a>
        <span className="gw-teller">{i + 1} van {aantal}</span>
      </div>
    </Laag>
  );
}

function StapInhoud({ d, stap }: { d: ServiceMapping; stap: Onderdeel | KortStap }) {
  if (stap.soort === 'kernvers')
    return (
      <>
        <h1 className="sr-only" tabIndex={-1}>Kernvers</h1>
        <Kernvers d={d} />
      </>
    );
  if (stap.soort === 'jezusgebed') return <Jezusgebed />;
  if (stap.soort === 'psalm') return <PsalmStap nr={stap.nr} titel={stap.titel} />;
  const tekst = stap.soort === 'gebed' ? GEBEDEN.find((g) => g.id === stap.id)?.tekst : stap.tekst;
  return (
    <>
      <h1 className="gw-titel" tabIndex={-1}>{stap.titel}</h1>
      <Sierlijn />
      <p className="gw-gebed">{tekst}</p>
    </>
  );
}

function Jezusgebed() {
  const vorm = useGekozenVorm();
  return (
    <>
      <h1 className="sr-only" tabIndex={-1}>Het Jezusgebed</h1>
      <p className="gw-groot"><Gebedsregels tekst={vorm.tekst} /></p>
      <p className="gw-noot">Bid het in stilte</p>
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

// 3. De afsluiting
function Afsluiting({ d, nacht }: { d: ServiceMapping; nacht: boolean }) {
  useSchermAan(true);
  return (
    <Laag className={`gw gw-einde${nacht ? ' is-nacht' : ''}`} label={`${gebedTitel(d)}: einde`}>
      <h1 className="sr-only" tabIndex={-1}>Einde van {gebedTitel(d).toLowerCase()}</h1>
      <span className="gw-kruis">{SIERKRUIS}</span>
      <Kernvers d={d} />
      <a className="gw-verder" href="#vandaag">Terug naar Vandaag</a>
    </Laag>
  );
}
