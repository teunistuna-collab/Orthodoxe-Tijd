import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { useApp } from '../lib/context';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';
import { BEWEEGLIJKE_FEESTEN, DERTIEN, OVERIGE_VASTE, type Feest } from '../lib/feesten';
import { MAANDEN, daysBetween, formatDag, formatLang, formatMd, hoofdletter, kerkDatum } from '../lib/kalender';
import { volgendeFeestDatum } from '../lib/overzicht';
import { FEEST_HEILIGENJAAR, GEKOPPELDE_FEESTTEKSTEN } from '../lib/feestHeiligenjaar';
import { useHeiligenjaarTekst } from '../lib/heiligenjaarTekst';
import { KopBalk } from './NisKop';
import { ActieKnop, Sierlijn, TijdlijnRij } from './onderdelen';
import './Vandaag.css';
import './ontwerp.css';
import Modal from './Modal';

// Feesten: het feestelijke hoofdstuk van het kerkboek (opmaak: ontwerp.css). Volgorde: opening, het feest van
// vandaag of het eerstvolgende grote feest, de grote feesten, vaste en beweeglijke feesten als
// register, en daaronder alle feesten om te zoeken. Data en datums uitsluitend uit lib/feesten.ts en lib/overzicht.ts
// (beweeglijke feesten via de Pascha-berekening); teksten van gekoppelde feesten uit het Heiligenjaar.

// Feesten die het Heiligenjaar zelf als feest aanmerkt, niet aan een feest van de site gekoppeld zijn en geen twijfelgeval
// uit de import zijn (bijvoorbeeld voorfeesten en de teruggave van een feest). Alleen in "Alle feesten", met hun eigen tekst.
// De heiligenlijst wordt apart geladen (App.tsx, useApp().heiligen); tot dan is deze lijst leeg.
const hjFeesten = (lijst: NonNullable<ReturnType<typeof useApp>['heiligen']>['ALLE_HEILIGEN']): Feest[] =>
  lijst.filter((h) => h.type === 'feast' && !h.needsReview && !GEKOPPELDE_FEESTTEKSTEN.has(h.id)).map((h) => ({ id: h.id, naam: h.naam, soort: 'gedachtenis', md: h.md, rang: 2 }));
const BEWEEGLIJK_OVERIG = BEWEEGLIJKE_FEESTEN.filter((f) => f.offset !== undefined && !DERTIEN.includes(f) && (f.rang ?? 0) >= 3);

type Item = { f: Feest; datum: Date; dagen: number };
type Mode = ReturnType<typeof useApp>['mode'];

/** De eerstvolgende datum van elk feest (lib/overzicht.ts), op volgorde. */
const metDatum = (lijst: Feest[], vandaag: Date, mode: Mode): Item[] =>
  lijst.map((f) => { const datum = volgendeFeestDatum(f, vandaag, mode); return { f, datum, dagen: daysBetween(vandaag, datum) }; }).sort((a, b) => a.dagen - b.dagen);

export default function Feesten() {
  const { mode, vandaag, heiligen } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  // Vandaag (feesttijd) kan het venster van een feest openen, bijvoorbeeld de Geboorte van Christus.
  useEffect(() => {
    const opPopup = (event: Event) => {
      const { pagina, sleutel } = (event as CustomEvent<OpenPopupDetail>).detail;
      if (pagina === 'feesten') setOpen(sleutel);
    };
    window.addEventListener(OPEN_POPUP_EVENT, opPopup);
    return () => window.removeEventListener(OPEN_POPUP_EVENT, opPopup);
  }, []);
  const [zoek, setZoek] = useState('');
  const [maand, setMaand] = useState<number | null>(vandaag.getUTCMonth());
  const [dag, setDag] = useState<number | null>(null);

  const groot = useMemo(() => metDatum(DERTIEN, vandaag, mode), [vandaag, mode]);
  const vast = useMemo(() => metDatum(OVERIGE_VASTE.filter((f) => (f.rang ?? 0) >= 3), vandaag, mode), [vandaag, mode]);
  const beweeglijk = useMemo(() => metDatum(BEWEEGLIJK_OVERIG, vandaag, mode), [vandaag, mode]);
  const hj = useMemo(() => metDatum(heiligen ? hjFeesten(heiligen.ALLE_HEILIGEN) : [], vandaag, mode), [heiligen, vandaag, mode]);
  const alleItems = useMemo(() => [...groot, ...vast, ...beweeglijk, ...hj].sort((a, b) => a.dagen - b.dagen), [groot, vast, beweeglijk, hj]);
  const eerstvolgende = groot[0];
  // De komende feesten zonder het eerstvolgende grote feest (dat staat er al boven).
  const komend = useMemo(() => [...groot, ...vast, ...beweeglijk].filter((x) => x !== eerstvolgende).sort((a, b) => a.dagen - b.dagen).slice(0, 5), [groot, vast, beweeglijk, eerstvolgende]);

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
      <button type="button" className="ot-rij" onClick={() => openFeest(f)}>
        <span className="ot-fs-datum">
          {formatDag(datum)}
          {dagen === 0 && ' · vandaag'}
        </span>
        <span className="ot-rij-tekst">
          <b>{f.naam}</b>
          {onder && <span>{onder}</span>}
        </span>
        <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
      </button>
    </li>
  );

  return (
    <>
      {/* Feesten in de oude volgorde (opening, eerstvolgend feest, de grote feesten, vaste en beweeglijke feesten, alle
          feesten), in de stijl van het overdrachtspakket: bloemenrand op perkament, nachtblauwe titels, registerrijen.
          Alle feesten en datums uit lib/feesten.ts en lib/overzicht.ts (beweeglijke feesten via de Pascha-berekening). */}
      <section id="feesten" className="vg ot-redesign ot-feesten">
        <div className="ot-strook"><KopBalk /></div>
        {/* Web: eigen brede banner (bloemenrand rondom, 3 : 1); mobiel: de bloemenhoek */}
        <picture>
          <source media="(min-width: 768px)" srcSet="/images/ontwerp/feesten-banner-web.webp" width={2000} height={667} />
          <img className="ot-bloemen" src="/images/ontwerp/feesten-bloemen-800.webp" srcSet="/images/ontwerp/feesten-bloemen-800.webp 800w, /images/ontwerp/feesten-bloemen-1536.webp 1536w" sizes="(min-width: 768px) 960px, 100vw" alt="" aria-hidden="true" width={1536} height={1024} decoding="async" />
        </picture>
        <div className="vg-papier ot-inhoud">
          <div className="ot-fs-kop">
            <h1 className="ot-titel">De feesten</h1>
            <Sierlijn />
            <img className="ot-fs-icoon" src="/images/Moeder-Gods-icoon.webp" alt="Icoon van de Moeder Gods met het Kind" width={640} height={640} loading="lazy" decoding="async" />
            <p className="ot-fs-intro">Het kerkelijk jaar ontvouwt het leven van Christus en de Moeder Gods in vaste en beweeglijke feesten.</p>
          </div>

          {/* Het feest van vandaag of het eerstvolgende grote feest */}
          {eerstvolgende && (
            <article className="ot-fs-nu">
              {eerstvolgende.f.id === 'pascha' ? (
                <img className="ot-fs-nu-icoon" src="/images/Pascha-icoon.webp" alt="Icoon van de Verrijzenis" width={640} height={640} loading="lazy" decoding="async" />
              ) : (
                <p className="ot-fs-nu-datum" aria-hidden="true">
                  <span>{eerstvolgende.datum.getUTCDate()}</span>
                  {MAANDEN[eerstvolgende.datum.getUTCMonth()]}
                </p>
              )}
              <p className="ot-fs-label">{eerstvolgende.dagen === 0 ? 'Groot feest van vandaag' : 'Eerstvolgend groot feest'}</p>
              <h2 className="ot-dagtitel">{eerstvolgende.f.naam}</h2>
              <p className="ot-fs-wanneer">
                {formatLang(eerstvolgende.datum)}
                {eerstvolgende.dagen === 0 ? '' : eerstvolgende.dagen === 1 ? ' · morgen' : ` · over ${eerstvolgende.dagen} dagen`}
              </p>
              {eerstvolgende.f.toelichting && <p className="ot-fs-omschrijving">{eerstvolgende.f.toelichting}</p>}
              <ActieKnop onClick={() => openFeest(eerstvolgende.f)}>{eerstvolgende.f.id === 'pascha' ? 'Naar de Pascha-pagina' : 'Lees meer'}</ActieKnop>
            </article>
          )}

          {/* De komende feesten (grote, vaste en beweeglijke), als tijdlijn */}
          <section className="ot-fs-blok" aria-labelledby="fs-komend-titel">
            <h2 id="fs-komend-titel" className="ot-fs-titel">Komende feesten</h2>
            <ol className="ot-tijdlijn ot-tijdlijn-stip">
              {komend.map(({ f, datum, dagen }) => (
                <TijdlijnRij
                  key={`${f.id}-${datum.toISOString()}`}
                  kleur={f.soort === 'pascha' ? '#850d17' : f.offset !== undefined ? '#1d3f66' : '#c99a45'}
                  titel={`${formatDag(datum)}${dagen === 0 ? ' · vandaag' : ''}`}
                  onder={f.naam}
                  onClick={() => openFeest(f)}
                />
              ))}
            </ol>
          </section>

          {/* De grote feesten: Pascha en de twaalf, in de volgorde van het kerkelijk jaar */}
          <section className="ot-fs-blok" aria-labelledby="fs-groot-titel">
            <h2 id="fs-groot-titel" className="ot-fs-titel">De grote feesten</h2>
            <p className="ot-fs-citaat">In de feesten wordt niet alleen herinnerd wat geweest is: de Kerk treedt binnen in het heil dat Christus schenkt.</p>
            <ol className="ot-register">
              {DERTIEN.map((f) => {
                const { datum } = groot.find((x) => x.f.id === f.id)!;
                return (
                  <li key={f.id}>
                    <button type="button" className={`ot-rij${f.id === 'pascha' ? ' is-pascha' : ''}`} onClick={() => openFeest(f)}>
                      <span className="ot-fs-datum">{f.offset !== undefined ? 'Beweeglijk' : formatMd(f.md!)}</span>
                      <span className="ot-rij-tekst">
                        <b>{f.naam}</b>
                        <span>{f.id === 'pascha' ? `${formatLang(datum)} · naar de Pascha-pagina` : formatLang(datum)}</span>
                      </span>
                      <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Alle feesten: zoeken op naam, maand of dag */}
          <section className="ot-fs-blok" aria-labelledby="fs-alle-titel">
            <h2 id="fs-alle-titel" className="ot-fs-titel">Alle feesten</h2>
            <label className="ot-zoekveld">
              <Search aria-hidden="true" />
              <input type="search" value={zoek} onChange={(e) => { setZoek(e.target.value); setDag(null); }} placeholder="Zoek een feest…" aria-label="Zoek een feest" />
            </label>
            <div className="ot-segmenten ot-fs-maanden" role="group" aria-label="Maand">
              {MAANDEN.map((m, i) => <button key={m} type="button" aria-pressed={maand === i} onClick={() => { setMaand(maand === i ? null : i); setDag(null); setZoek(''); }}>{hoofdletter(m)}</button>)}
            </div>
            {maand !== null && dagenInMaand.length > 0 && (
              <div className="ot-segmenten ot-segmenten-klein" role="group" aria-label={`Dag in ${MAANDEN[maand]}`}>
                {dagenInMaand.map((d) => <button key={d} type="button" aria-pressed={dag === d} onClick={() => setDag(dag === d ? null : d)}>{d}</button>)}
              </div>
            )}
            <p className="ot-fs-aantal">{dag !== null && maand !== null ? `${dag} ${MAANDEN[maand]}` : maand !== null && !zoek.trim() ? hoofdletter(MAANDEN[maand]) : 'Gevonden'} · {alle.length} {alle.length === 1 ? 'feest' : 'feesten'}</p>
            <ol className="ot-register">{alle.slice(0, 40).map((x) => rij(x, `${soortTekst(x.f)}${mode === 'oud' && x.f.md ? ` · Juliaans ${formatDag(kerkDatum(x.datum, mode))}` : ''}`))}</ol>
            <p className="ot-fs-links">
              <a className="ot-tekstknop" href="#jaar">Vaste feesten: naar de jaarcyclus ›</a>
              <a className="ot-tekstknop" href="#pascha">Beweeglijke feesten: naar de Paascyclus ›</a>
            </p>
          </section>
        </div>
      </section>

      {gekozen && (
        <Modal
          open
          onClose={() => setOpen(null)}
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
