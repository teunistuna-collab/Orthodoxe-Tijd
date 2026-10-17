import { Fragment } from 'react';
import { WEEKDAGEN, formatDag, parseYmd, type Mode } from '../lib/kalender';
import { STATUS_TEKST, psalterlezing, tekstBeschikbaar, type Dienst, type Lezing, type Psalterlezing as Uitkomst } from '../lib/psalterlezing';
import './psalterlezing.css';

// De psalterlezing (lib/psalterlezing.ts) als compact blok: op Vandaag (Metten en Vespers), in het etmaal (één dienst)
// en op de Psalmen-pagina bij "Per kathisma". Elke kathisma-verwijzing opent dat kathisma op de Psalmen-pagina, met de
// datum erbij (#psalmen/kathisma/4?datum=2026-10-17). Zonder eigen kleuren: de tokens van de site (Vandaag.css).

const NAAM: Record<Dienst, string> = { metten: 'Metten', vespers: 'Vespers' };

const kathismaLink = (nr: number, datum: string) => `#psalmen/kathisma/${nr}?datum=${datum}`;

/** De lezingen als losse verwijzingen: kathisma's (en een deel) zijn links, de Polyeleos gewone tekst. */
function Lezingen({ lezingen, datum, onKies }: { lezingen: Lezing[]; datum: string; onKies?: () => void }) {
  const item = (l: Lezing, i: number) =>
    l.soort === 'keuze' ? (
      <Fragment key={i}>
        {l.opties.map((o, j) => (
          <Fragment key={j}>
            {j > 0 && <span className="psl-of">of</span>}
            {item(o, j)}
          </Fragment>
        ))}
      </Fragment>
    ) : l.soort === 'polyeleos' ? (
      <span key={i} className="psl-polyeleos">Polyeleos <small>(Psalm 134 en 135)</small></span>
    ) : (
      <a key={i} className="psl-kathisma" href={kathismaLink(l.nr, datum)} onClick={onKies}>
        Kathisma {l.nr}
        {l.soort === 'deel' && <small> · deel {l.deel}</small>}
      </a>
    );
  return <div className="psl-lezingen">{lezingen.map(item)}</div>;
}

const beschikbaarheid = (lezingen: Lezing[]) => {
  const stand = lezingen.flatMap((l) => (l.soort === 'keuze' ? l.opties : [l])).map(tekstBeschikbaar);
  if (stand.every((s) => s === 'nee')) return 'Tekst nog niet beschikbaar.';
  return stand.every((s) => s === 'ja') ? null : 'Nog niet alle teksten zijn beschikbaar.';
};

const lezingTekst = (ls: Lezing[]): string =>
  ls.map((l) => (l.soort === 'keuze' ? lezingTekst(l.opties).replace(', ', ' of ') : l.soort === 'polyeleos' ? 'Polyeleos' : `kathisma ${l.nr}${l.soort === 'deel' ? `, deel ${l.deel}` : ''}`)).join(', ');

/** Eén dienst: de lezingen of de status, met de toelichting. */
export function PsalterDienst({ r, onKies, naam = true }: { r: Uitkomst; onKies?: () => void; naam?: boolean }) {
  const dag = parseYmd(r.liturgischeDag);
  const status = STATUS_TEKST[r.status];
  const tekst = r.lezingen.length ? beschikbaarheid(r.lezingen) : null;
  return (
    <div className={`psl-dienst is-${r.status}`}>
      {naam && (
        <p className="psl-naam">
          {NAAM[r.dienst]}
          {r.dienst === 'vespers' && <small>avond · vesper van {WEEKDAGEN[dag.getUTCDay()]} {formatDag(dag)}</small>}
        </p>
      )}
      {r.lezingen.length > 0 ? <Lezingen lezingen={r.lezingen} datum={r.datum} onKies={onKies} /> : <p className="psl-hoofd">{status}</p>}
      {r.lezingen.length > 0 && status && <p className="psl-status">{status}</p>}
      {tekst && <p className="psl-status">{tekst}</p>}
      {r.toelichting.map((t) => (
        <p key={t} className="psl-noot">{t}</p>
      ))}
      {r.zonderFeest && <p className="psl-noot">Gewone indeling zonder feest: {lezingTekst(r.zonderFeest)}.</p>}
    </div>
  );
}

/** Metten en Vespers van één burgerlijke datum, naast elkaar (of één dienst met `dienst`). */
export default function Psalterlezing({ datum, mode, dienst, onKies, className = '' }: { datum: string; mode: Mode; dienst?: Dienst; onKies?: () => void; className?: string }) {
  const diensten: Dienst[] = dienst ? [dienst] : ['metten', 'vespers'];
  const uitkomsten = diensten.map((d) => psalterlezing(datum, d, mode));
  return (
    <div className={`psl ${className}`}>
      <div className="psl-diensten">
        {uitkomsten.map((r) => (
          <PsalterDienst key={r.dienst} r={r} onKies={onKies} naam={!dienst} />
        ))}
      </div>
    </div>
  );
}
