import { useMemo, useState, type FormEvent } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { useApp } from '../lib/context';
import { formatMd, MAANDEN } from '../lib/kalender';
import { heiligeTitel, zoekVorm, type Resultaat } from '../lib/heiligenPopup';
import { dagenTot, geldigeMd, MAX_HEILIGEN, MAX_TEKST, opVolgorde, type OnzeHeilige } from '../lib/onzeHeiligen';
import { useOnzeHeiligen, verwijder, voegToe, wijzig } from '../lib/onzeHeiligenOpslag';
import { vorigeAdres } from '../lib/vorigAdres';
import { Kop, Laag } from './MobielLaag';

// Onze heiligen (spec: docs/superpowers/specs/2026-11-06-onze-heiligen-design.md) op de Heiligen-pagina (mobiel): het
// blok bovenaan, "Voor wie?" (ook in het leesvenster), toevoegen (#heiligen/onze/toevoegen: zoeken of zelf invullen) en
// bewerken (#heiligen/onze/bewerk/<id>). Opmaak: heiligen-mobiel.css (.oh-…).

const VOL = 'De lijst is vol: hooguit 30 heiligen.';
const VOOR_WIE = 'Bijvoorbeeld Sofia, ikzelf of parochie';

/** Terug naar de Heiligen-pagina: een stap terug als je daarvandaan kwam, anders erheen zonder extra stap. */
const sluit = () => (vorigeAdres().startsWith('#heiligen') ? window.history.back() : window.location.replace('#heiligen'));

export function OnzeHeiligenBlok({ onLees }: { onLees: (h: OnzeHeilige) => void }) {
  const { vandaag, mode } = useApp();
  const lijst = useOnzeHeiligen();
  const rijen = useMemo(() => opVolgorde(lijst, vandaag, mode), [lijst, vandaag, mode]);
  return (
    <section className="oh" aria-labelledby="oh-kop">
      <div className="hm-kop is-midden">
        <h2 id="oh-kop" className="hm-label">Onze heiligen</h2>
      </div>
      {rijen.length ? (
        <ul className="oh-lijst">
          {rijen.map((h) => (
            <li key={h.id} className="oh-rij">
              <button type="button" className="oh-open" onClick={() => onLees(h)}>
                <b>{heiligeTitel(h.heilige)}</b>
                <span>{[h.voor, dagenTot(h, vandaag, mode) === 0 ? 'Vandaag' : formatMd(h.md)].filter(Boolean).join(' · ')}</span>
              </button>
              <a className="oh-bewerk" href={`#heiligen/onze/bewerk/${h.id}`} aria-label={`Bewerken: ${heiligeTitel(h.heilige)}`}>Bewerken</a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="oh-leeg">Kies de naam- en beschermheiligen van je gezin. Op hun dag zie je het op Vandaag, en als je wilt krijg je een herinnering.</p>
      )}
      {lijst.length >= MAX_HEILIGEN ? (
        <p className="oh-leeg">{VOL}</p>
      ) : (
        <a className="hm-meer oh-toevoegen" href="#heiligen/onze/toevoegen">Heilige toevoegen <ChevronRight aria-hidden="true" /></a>
      )}
    </section>
  );
}

/** "Voor wie?" en opslaan, voor een heilige uit de lijst (leesvenster en toevoegen). */
function VoorWie({ heilige, onKlaar }: { heilige: Resultaat; onKlaar: () => void }) {
  const [voor, setVoor] = useState('');
  const lijst = useOnzeHeiligen();
  if (lijst.length >= MAX_HEILIGEN) return <p className="oh-leeg">{VOL}</p>;
  return (
    <form
      className="oh-form"
      onSubmit={(e) => {
        e.preventDefault();
        voegToe({ heilige: heilige.naam, md: heilige.md, voor, bron: heilige.id });
        onKlaar();
      }}
    >
      <label className="oh-veld">
        <span>Voor wie?</span>
        <input value={voor} onChange={(e) => setVoor(e.target.value)} maxLength={MAX_TEKST} placeholder={VOOR_WIE} autoComplete="off" />
      </label>
      <button type="submit" className="oh-knop">Toevoegen aan onze heiligen</button>
    </form>
  );
}

/** In het leesvenster van een heilige (alleen op de Heiligen-pagina, mobiel). Met key={heilige.id} gebruiken. */
export function ToevoegenInLeesvenster({ heilige }: { heilige: Resultaat }) {
  const [stap, setStap] = useState<'knop' | 'voor' | 'klaar'>('knop');
  return (
    <section className="exact-popup-sectie oh-popup">
      {stap === 'klaar' ? (
        <p>Toegevoegd aan onze heiligen.</p>
      ) : stap === 'voor' ? (
        <VoorWie heilige={heilige} onKlaar={() => setStap('klaar')} />
      ) : (
        <button type="button" className="oh-knop" onClick={() => setStap('voor')}>Toevoegen aan onze heiligen</button>
      )}
    </section>
  );
}

/** Naam, gedenkdag en voor wie: zelf invullen (zonder h) of bewerken. Bij een heilige uit de lijst alleen voor wie. */
function HeiligeFormulier({ h, onKlaar }: { h?: OnzeHeilige; onKlaar: () => void }) {
  const [m0, d0] = (h?.md ?? '0-0').split('-').map(Number);
  const [naam, setNaam] = useState(h?.heilige ?? '');
  const [dag, setDag] = useState(d0);
  const [maand, setMaand] = useState(m0);
  const [voor, setVoor] = useState(h?.voor ?? '');
  const [fout, setFout] = useState('');
  const uitLijst = !!h?.bron;
  const opslaan = (e: FormEvent) => {
    e.preventDefault();
    const md = `${maand}-${dag}`;
    if (!uitLijst && !naam.trim()) return setFout('Vul de naam van de heilige in.');
    if (!uitLijst && !geldigeMd(md)) return setFout('Kies een bestaande dag en maand.');
    if (h) wijzig(h.id, uitLijst ? { voor } : { heilige: naam, md, voor });
    else voegToe({ heilige: naam, md, voor });
    onKlaar();
  };
  return (
    <form className="oh-form" onSubmit={opslaan} noValidate>
      {!uitLijst && (
        <>
          <label className="oh-veld">
            <span>Naam van de heilige</span>
            <input value={naam} onChange={(e) => setNaam(e.target.value)} maxLength={MAX_TEKST} autoComplete="off" />
          </label>
          <fieldset className="oh-datum">
            <legend>Gedenkdag (kerkelijke kalender)</legend>
            <label>
              <span className="sr-only">Dag</span>
              <select value={dag} onChange={(e) => setDag(Number(e.target.value))}>
                <option value={0}>Dag</option>
                {Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Maand</span>
              <select value={maand} onChange={(e) => setMaand(Number(e.target.value))}>
                <option value={0}>Maand</option>
                {MAANDEN.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
              </select>
            </label>
          </fieldset>
        </>
      )}
      <label className="oh-veld">
        <span>Voor wie?</span>
        <input value={voor} onChange={(e) => setVoor(e.target.value)} maxLength={MAX_TEKST} placeholder={VOOR_WIE} autoComplete="off" />
      </label>
      {fout && <p className="oh-fout" role="alert">{fout}</p>}
      <button type="submit" className="oh-knop">{h ? 'Opslaan' : 'Toevoegen aan onze heiligen'}</button>
    </form>
  );
}

function Toevoegen({ alle }: { alle: Resultaat[] }) {
  const lijst = useOnzeHeiligen();
  const [zoek, setZoek] = useState('');
  const [gekozen, setGekozen] = useState<Resultaat | null>(null);
  const [zelf, setZelf] = useState(false);
  const q = zoekVorm(zoek);
  // Zelfde rangorde als het zoekveld van de Heiligen-pagina: wie precies zo heet, dan wie zo begint, dan de rest
  const gevonden = useMemo(() => {
    if (!q) return [];
    const score = (h: Resultaat) => {
      const naam = zoekVorm(h.naam);
      return naam === q ? 0 : naam.startsWith(q) && !h.naam.includes(',') ? 1 : 2;
    };
    return alle
      .filter((h) => zoekVorm(`${h.naam} ${h.titel} ${(h.namen ?? []).join(' ')}`).includes(q))
      .map((h, i) => ({ h, i, s: score(h) }))
      .sort((x, y) => x.s - y.s || x.i - y.i)
      .slice(0, 50)
      .map((x) => x.h);
  }, [alle, q]);
  const titel = gekozen ? heiligeTitel(gekozen.naam) : zelf ? 'Zelf invullen' : 'Heilige toevoegen';
  return (
    <Laag className="em-laag oh-laag" label={titel}>
      <Kop terug="#heiligen" merk slim />
      <div className="oh-papier">
        <h1 className="oh-titel" tabIndex={-1}>{titel}</h1>
        {lijst.length >= MAX_HEILIGEN ? (
          <p className="oh-leeg">{VOL}</p>
        ) : gekozen ? (
          <>
            <p className="oh-uitleg">Gedenkdag: {formatMd(gekozen.md)}</p>
            <VoorWie heilige={gekozen} onKlaar={sluit} />
          </>
        ) : zelf ? (
          <HeiligeFormulier onKlaar={sluit} />
        ) : (
          <>
            <label className="vg-hl-zoek">
              <Search aria-hidden="true" />
              <span className="sr-only">Zoek een heilige</span>
              <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek op naam van een heilige…" autoComplete="off" />
            </label>
            {!alle.length && <p className="oh-leeg">De heiligen worden geladen…</p>}
            {q && alle.length > 0 && !gevonden.length && <p className="oh-leeg">Geen heilige gevonden.</p>}
            <ul className="oh-lijst">
              {gevonden.map((h) => (
                <li key={h.id} className="oh-rij">
                  <button type="button" className="oh-open" onClick={() => setGekozen(h)}>
                    <b>{heiligeTitel(h.naam)}</b>
                    <span>{formatMd(h.md)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="hm-meer oh-zelf" onClick={() => setZelf(true)}>
              Staat je heilige er niet bij? Zelf invullen <ChevronRight aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </Laag>
  );
}

function Bewerken({ id }: { id: string }) {
  const h = useOnzeHeiligen().find((x) => x.id === id);
  if (!h) return null;
  const naam = heiligeTitel(h.heilige);
  return (
    <Laag className="em-laag oh-laag" label={`Bewerken: ${naam}`}>
      <Kop terug="#heiligen" merk slim />
      <div className="oh-papier">
        <h1 className="oh-titel" tabIndex={-1}>{naam}</h1>
        {h.bron && <p className="oh-uitleg">Gedenkdag: {formatMd(h.md)}</p>}
        <HeiligeFormulier h={h} onKlaar={sluit} />
        <button
          type="button"
          className="oh-verwijder"
          onClick={() => {
            if (!window.confirm(`${naam} verwijderen uit onze heiligen?`)) return;
            sluit();
            verwijder(h.id);
          }}
        >
          Verwijderen
        </button>
      </div>
    </Laag>
  );
}

/** De schermen boven de Heiligen-pagina: #heiligen/onze/toevoegen en #heiligen/onze/bewerk/<id>. */
export function OnzeHeiligenLagen({ onderdeel, alle }: { onderdeel: string; alle: Resultaat[] }) {
  if (onderdeel === 'onze/toevoegen') return <Toevoegen alle={alle} />;
  const id = onderdeel.match(/^onze\/bewerk\/(.+)$/)?.[1];
  return id ? <Bewerken id={id} /> : null;
}
