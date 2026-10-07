import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../lib/context';
import { BEWEEGLIJKE_FEESTEN, DERTIEN, OVERIGE_VASTE, type Feest } from '../lib/feesten';
import { MAANDEN, daysBetween, formatDag, formatLang, formatMd, hoofdletter, kerkDatum } from '../lib/kalender';
import { volgendeFeestDatum } from '../lib/overzicht';
import { ALLE_HEILIGEN } from '../lib/heiligen';
import { FEEST_HEILIGENJAAR, GEKOPPELDE_FEESTTEKSTEN } from '../lib/feestHeiligenjaar';
import { useHeiligenjaarTekst } from '../lib/heiligenjaarTekst';
import PaginaOpening from './PaginaOpening';
import Modal from './Modal';

// Feesten: het feestelijke hoofdstuk van het kerkboek (opmaak: index.css, Bouw 172). Volgorde: opening, het feest van
// vandaag of het eerstvolgende grote feest, de grote feesten (het ene donkere vlak), vaste en beweeglijke feesten als
// register, en daaronder alle feesten om te zoeken. Data en datums uitsluitend uit lib/feesten.ts en lib/overzicht.ts
// (beweeglijke feesten via de Pascha-berekening); teksten van gekoppelde feesten uit het Heiligenjaar.

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

// Feesten die het Heiligenjaar zelf als feest aanmerkt, niet aan een feest van de site gekoppeld zijn en geen twijfelgeval
// uit de import zijn (bijvoorbeeld voorfeesten en de teruggave van een feest). Alleen in "Alle feesten", met hun eigen tekst.
const HJ_FEESTEN: Feest[] = ALLE_HEILIGEN.filter((h) => h.type === 'feast' && !h.needsReview && !GEKOPPELDE_FEESTTEKSTEN.has(h.id)).map((h) => ({ id: h.id, naam: h.naam, soort: 'gedachtenis', md: h.md, rang: 2 }));
const BEWEEGLIJK_OVERIG = BEWEEGLIJKE_FEESTEN.filter((f) => f.offset !== undefined && !DERTIEN.includes(f) && (f.rang ?? 0) >= 3);
const IN_REGISTER = 8;

type Item = { f: Feest; datum: Date; dagen: number };
type Mode = ReturnType<typeof useApp>['mode'];

/** De eerstvolgende datum van elk feest (lib/overzicht.ts), op volgorde. */
const metDatum = (lijst: Feest[], vandaag: Date, mode: Mode): Item[] =>
  lijst.map((f) => { const datum = volgendeFeestDatum(f, vandaag, mode); return { f, datum, dagen: daysBetween(vandaag, datum) }; }).sort((a, b) => a.dagen - b.dagen);

export default function Feesten() {
  const { mode, vandaag } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  const [zoek, setZoek] = useState('');
  const [maand, setMaand] = useState<number | null>(vandaag.getUTCMonth());
  const [dag, setDag] = useState<number | null>(null);
  // "Alle vaste/beweeglijke feesten" klapt het register van die kolom helemaal uit.
  const [heelVast, setHeelVast] = useState(false);
  const [heelBeweeglijk, setHeelBeweeglijk] = useState(false);

  const groot = useMemo(() => metDatum(DERTIEN, vandaag, mode), [vandaag, mode]);
  const vast = useMemo(() => metDatum(OVERIGE_VASTE.filter((f) => (f.rang ?? 0) >= 3), vandaag, mode), [vandaag, mode]);
  const beweeglijk = useMemo(() => metDatum(BEWEEGLIJK_OVERIG, vandaag, mode), [vandaag, mode]);
  const hj = useMemo(() => metDatum(HJ_FEESTEN, vandaag, mode), [vandaag, mode]);
  const alleItems = useMemo(() => [...groot, ...vast, ...beweeglijk, ...hj].sort((a, b) => a.dagen - b.dagen), [groot, vast, beweeglijk, hj]);
  const eerstvolgende = groot[0];

  const dagenInMaand = useMemo(() => (maand === null ? [] : Array.from(new Set(alleItems.filter((x) => x.datum.getUTCMonth() === maand).map((x) => x.datum.getUTCDate()))).sort((a, b) => a - b)), [alleItems, maand]);
  const alle = useMemo(
    () =>
      alleItems.filter(({ f, datum }) => {
        const q = zoek.trim().toLowerCase();
        if (q && !f.naam.toLowerCase().includes(q)) return false;
        if (!q && maand !== null && datum.getUTCMonth() !== maand) return false;
        if (!q && dag !== null && datum.getUTCDate() !== dag) return false;
        return true;
      }),
    [alleItems, zoek, maand, dag],
  );

  const gekozen = open ? alleItems.find(({ f }) => f.id === open) : undefined;
  // Feesten met een tekst uit het Heiligenjaar (lib/feestHeiligenjaar.ts of zelf een Heiligenjaar-feest) tonen alleen die tekst.
  const hjId = gekozen ? (FEEST_HEILIGENJAAR[gekozen.f.id] ?? (gekozen.f.id.startsWith('hj-') ? gekozen.f.id : undefined)) : undefined;
  const hjTekst = useHeiligenjaarTekst(hjId);
  const blader = (stap: number) => {
    const i = alleItems.findIndex(({ f }) => f.id === open);
    const volgende = alleItems[i + stap];
    if (i !== -1 && volgende) setOpen(volgende.f.id);
  };

  // Pascha heeft een eigen pagina; de andere feesten openen als bladzijde.
  const openFeest = (f: Feest) => (f.id === 'pascha' ? window.location.assign('#pascha') : setOpen(f.id));
  const soortTekst = (f: Feest) => (f.id.startsWith('hj-') ? 'uit het Heiligenjaar' : f.offset !== undefined ? 'beweeglijk feest' : 'vaste gedachtenis');

  const rij = ({ f, datum, dagen }: Item, onder?: string) => (
    <li key={`${f.id}-${datum.toISOString()}`}>
      <button type="button" className="fs-rij" onClick={() => openFeest(f)}>
        <span className="fs-datum">
          {formatDag(datum)}
          {dagen === 0 && ' · vandaag'}
        </span>
        <span className="fs-rij-naam">{f.naam}</span>
        {onder && <span className="fs-rij-onder">{onder}</span>}
        <span className="fs-pijl" aria-hidden="true">
          ›
        </span>
      </button>
    </li>
  );

  return (
    <>
      <PaginaOpening id="feesten" label="Het kerkelijk jaar" titel="Feesten" ondertitel="Licht in de tijd" beeld={{ src: '/images/Moeder-Gods-icoon.webp', alt: 'Icoon van de Moeder Gods met het Kind' }}>
        <p className="fs-intro">Het kerkelijk jaar ontvouwt het leven van Christus en de Moeder Gods in vaste en beweeglijke feesten.</p>
      </PaginaOpening>

      <section className="fs-pagina bg-parchment text-ink">
        <div className={CONTENT}>
          {/* Het feest van vandaag of het eerstvolgende grote feest: het rijkste blok van de pagina */}
          {eerstvolgende && (
            <article className="fs-nu">
              {eerstvolgende.f.id === 'pascha' ? (
                <img className="fs-nu-icoon" src="/images/Pascha-icoon.webp" alt="Icoon van de Verrijzenis" width={640} height={640} decoding="async" />
              ) : (
                <p className="fs-nu-datum" aria-hidden="true">
                  <span>{eerstvolgende.datum.getUTCDate()}</span>
                  {MAANDEN[eerstvolgende.datum.getUTCMonth()]}
                </p>
              )}
              <div className="fs-nu-tekst">
                <p className="opening-label">{eerstvolgende.dagen === 0 ? 'Feest van vandaag' : 'Eerstvolgend feest'}</p>
                <h2 className="ot-titel fs-nu-naam">{eerstvolgende.f.naam}</h2>
                <p className="fs-nu-wanneer">
                  {formatLang(eerstvolgende.datum)}
                  {eerstvolgende.dagen === 0 ? '' : eerstvolgende.dagen === 1 ? ' · morgen' : ` · over ${eerstvolgende.dagen} dagen`}
                </p>
                <span className="opening-sierlijn" aria-hidden="true" />
                {eerstvolgende.f.toelichting && <p className="fs-nu-omschrijving">{eerstvolgende.f.toelichting}</p>}
                <button type="button" className="fs-link" onClick={() => openFeest(eerstvolgende.f)}>
                  {eerstvolgende.f.id === 'pascha' ? 'Naar de Pascha-pagina ›' : 'Lees meer ›'}
                </button>
              </div>
            </article>
          )}
        </div>

        {/* De grote feesten: het ene donkere vlak, als geïllustreerde inhoudsopgave in de volgorde van het kerkelijk jaar */}
        <section className="fs-groot" aria-labelledby="fs-groot-titel">
          <div className={CONTENT}>
            <div className="fs-groot-kop">
              <p className="opening-label">Pascha en de twaalf grote feesten</p>
              <h2 id="fs-groot-titel">De grote feesten</h2>
              <p className="fs-groot-citaat">In de feesten wordt niet alleen herinnerd wat geweest is: de Kerk treedt binnen in het heil dat Christus schenkt.</p>
            </div>
            <ol className="fs-groot-lijst">
              {DERTIEN.map((f) => {
                const { datum } = groot.find((x) => x.f.id === f.id)!;
                return (
                  <li key={f.id} className={f.id === 'pascha' ? 'is-pascha' : undefined}>
                    <button type="button" onClick={() => openFeest(f)}>
                      <span className="fs-datum">{f.offset !== undefined ? 'Beweeglijk' : formatMd(f.md!)}</span>
                      <span className="fs-groot-naam">{f.naam}</span>
                      <span className="fs-groot-wanneer">{f.id === 'pascha' ? `${formatLang(datum)} · naar de Pascha-pagina ›` : formatLang(datum)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Vaste en beweeglijke feesten naast elkaar, als register */}
        <div className={CONTENT}>
          <div className="fs-ritmes">
            <p className="opening-label fs-ritmes-label">Eén jaar — twee ritmes</p>
            <section className="fs-kolom" aria-labelledby="fs-vast-titel">
              <h2 id="fs-vast-titel" className="ot-titel">Vaste feesten</h2>
              <p className="fs-kolom-tekst">Deze gedachtenissen keren ieder kerkelijk jaar terug op dezelfde kerkelijke datum en worden door de jaarcyclus gedragen.</p>
              <ol className="fs-register">{(heelVast ? vast : vast.slice(0, IN_REGISTER)).map((x) => rij(x))}</ol>
              <p className="fs-links">
                <button type="button" className="fs-link" aria-expanded={heelVast} onClick={() => setHeelVast(!heelVast)}>{heelVast ? 'Minder tonen ‹' : 'Alle vaste feesten ›'}</button>
                <a className="fs-link" href="#jaar">Ontdek de jaarcyclus ›</a>
              </p>
            </section>
            <section className="fs-kolom" aria-labelledby="fs-beweeglijk-titel">
              <h2 id="fs-beweeglijk-titel" className="ot-titel">Beweeglijke feesten</h2>
              <p className="fs-kolom-tekst">De datum van Pascha bepaalt onder meer de Grote Week, Hemelvaart en Pinksteren. Deze data komen uit dezelfde centrale Pascha-berekening als de kalender.</p>
              <ol className="fs-register">{(heelBeweeglijk ? beweeglijk : beweeglijk.slice(0, IN_REGISTER)).map((x) => rij(x))}</ol>
              <p className="fs-links">
                <button type="button" className="fs-link" aria-expanded={heelBeweeglijk} onClick={() => setHeelBeweeglijk(!heelBeweeglijk)}>{heelBeweeglijk ? 'Minder tonen ‹' : 'Alle beweeglijke feesten ›'}</button>
                <a className="fs-link" href="#pascha">Ontdek de Paascyclus ›</a>
              </p>
            </section>
          </div>

          {/* Alle feesten: zoeken op naam, maand of soort */}
          <section className="fs-alle feast-discover bibliotheek" aria-labelledby="fs-alle-titel">
            <div className="fs-sectiekop">
              <p className="opening-label">Door het kerkelijk jaar</p>
              <h2 id="fs-alle-titel" className="ot-titel">Alle feesten</h2>
            </div>
            <div className="saints-search-row">
              <label><Search /><input value={zoek} onChange={(e) => { setZoek(e.target.value); setDag(null); }} placeholder="Zoek een feest…" aria-label="Zoek een feest" /></label>
            </div>
            <div className="fs-maanden" role="group" aria-label="Maand">
              {MAANDEN.map((m, i) => <button key={m} type="button" aria-pressed={maand === i} onClick={() => { setMaand(maand === i ? null : i); setDag(null); setZoek(''); }}>{m}</button>)}
            </div>
            {maand !== null && dagenInMaand.length > 0 && (
              <div className="fs-dagen" role="group" aria-label={`Dag in ${MAANDEN[maand]}`}>
                {dagenInMaand.map((d) => <button key={d} type="button" aria-pressed={dag === d} onClick={() => setDag(dag === d ? null : d)}>{d}</button>)}
              </div>
            )}
            <p className="fs-aantal">{dag !== null && maand !== null ? `${dag} ${MAANDEN[maand]}` : maand !== null && !zoek.trim() ? hoofdletter(MAANDEN[maand]) : 'Gevonden'} · {alle.length} {alle.length === 1 ? 'feest' : 'feesten'}</p>
            <ol className="fs-register">{alle.slice(0, 40).map((x) => rij(x, `${soortTekst(x.f)}${mode === 'oud' && x.f.md ? ` · kerkelijk ${formatDag(kerkDatum(x.datum, mode))}` : ''}`))}</ol>
          </section>
        </div>
      </section>

      {gekozen && (
        <Modal
          open
          onClose={() => setOpen(null)}
          eyebrow="Feest"
          title={gekozen.f.naam}
          centerTitle
          maxWidth="max-w-3xl"
          lezen
          kopDatum={formatDag(gekozen.datum)}
          kopNav
          onVorige={() => blader(-1)}
          onVolgende={() => blader(1)}
          ondertitel={`${hoofdletter(formatLang(gekozen.datum))}${soortTekst(gekozen.f) === 'vaste gedachtenis' ? '' : ` · ${soortTekst(gekozen.f)}`}`}
          inhoudSleutel={gekozen.f.id}
        >
          <div className="exact-popup-reading fs-lees">
            {hjId ? (
              <div className="exact-popup-prose">{(hjTekst ?? ['De tekst wordt geladen…']).map((p, i) => <p key={i}>{p}</p>)}</div>
            ) : (
              <>
                {gekozen.f.troparion && <blockquote className="exact-popup-highlight">{gekozen.f.troparion}</blockquote>}
                <div className="exact-popup-prose">
                  {[gekozen.f.toelichting, gekozen.f.traditie && `Gebruiken: ${gekozen.f.traditie}`].filter((p): p is string => Boolean(p)).map((p, i) => <p key={i}>{p}</p>)}
                  {!gekozen.f.toelichting && !gekozen.f.troparion && <p>Voor dit feest is nog geen tekst beschikbaar.</p>}
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
