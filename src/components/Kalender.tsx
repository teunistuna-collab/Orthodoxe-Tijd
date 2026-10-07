import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { MAANDEN, WEEKDAGEN_KORT, formatDag, formatDatum, hoofdletter, maandRooster, formatLang } from '../lib/kalender';
import { LITURGISCHE_KLEUREN, liturgischeKleur } from '../lib/liturgischeKleur';
import { useSwipe } from '../lib/swipe';
import { NIVEAUS, VASTEN_GROEPEN, vastenGroep, type VastenGroep } from '../lib/vasten';
import { lezingSoort, roosterMelding, vertaalRef } from '../lib/htc';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';
import { VastenSymbool, KruisTeken } from './ui';
import { eersteHeilige, heiligeTitel, heiligenVanDag as dagHeiligen } from '../lib/heiligenPopup';
import PaginaOpening from './PaginaOpening';

// Kalender volgens het aangeleverde ontwerp (index.css, Bouw 180): opening; links de maand (cellen in de liturgische kleur,
// tekens voor feest, groot feest en vasten) met de legenda; rechts (op mobiel eronder) de gekozen dag als register:
// heiligen, feesten, Schriftlezingen, vasten en Paascyclus. Alle gegevens uit de bestaande kalender, het leesrooster en
// het Heiligenjaar; elke regel opent het bestaande venster.

const TEKEN = { pascha: <KruisTeken />, groot: '✠', ander: '✦' };
const kleineLetter = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const SOORT_LABEL = { apostel: 'Apostel', evangelie: 'Evangelie', oud: 'Oude Testament' } as const;

function Regel({ titel, onClick, children }: { titel: string; onClick: () => void; children: ReactNode }) {
  return (
    <li>
      <button type="button" className="kl-regel" onClick={onClick}>
        <span className="kl-regel-titel">{titel}</span>
        <span className="kl-regel-tekst">{children}</span>
        <span className="kl-pijl" aria-hidden="true">›</span>
      </button>
    </li>
  );
}

export default function Kalender() {
  const { mode, vandaag, vandaagYmd, heiligen, rooster, vraagRooster, openDag, openDagLezingen, openDagHeiligen, openDagPascha } = useApp();
  const [cur, setCur] = useState({ y: vandaag.getUTCFullYear(), m: vandaag.getUTCMonth() + 1 });
  const [geselecteerdeYmd, setGeselecteerdeYmd] = useState(vandaagYmd);
  const [legendaOpen, setLegendaOpen] = useState(false);

  const alleCellen = useMemo(() => maandRooster(cur.y, cur.m, mode, vandaagYmd), [cur, mode, vandaagYmd]);
  // Alleen zoveel weken als de maand nodig heeft (5 of 6).
  const laatste = alleCellen.map((c) => c.maand).lastIndexOf(cur.m);
  const cellen = alleCellen.slice(0, Math.ceil((laatste + 1) / 7) * 7);
  const geselecteerd = cellen.find((c) => c.ymd === geselecteerdeYmd) ?? cellen.find((c) => c.isVandaag) ?? cellen.find((c) => c.maand === cur.m) ?? cellen[0];

  useEffect(() => vraagRooster(geselecteerd.ymd), [geselecteerd.ymd, vraagRooster]);

  const heiligenVanDag = dagHeiligen(geselecteerd.kerkKey, heiligen?.HEILIGEN, geselecteerd.ymd);
  const lezingen = rooster?.[geselecteerd.ymd] ?? [];

  const vorige = () => setCur((c) => (c.m === 1 ? { y: c.y - 1, m: 12 } : { y: c.y, m: c.m - 1 }));
  const volgende = () => setCur((c) => (c.m === 12 ? { y: c.y + 1, m: 1 } : { y: c.y, m: c.m + 1 }));
  const veegMaand = useSwipe(vorige, volgende);
  const isHuidigeMaand = cur.y === vandaag.getUTCFullYear() && cur.m === vandaag.getUTCMonth() + 1;
  const naarVandaag = () => {
    setCur({ y: vandaag.getUTCFullYear(), m: vandaag.getUTCMonth() + 1 });
    setGeselecteerdeYmd(vandaagYmd);
  };
  const openVasten = () => window.dispatchEvent(new CustomEvent<OpenPopupDetail>(OPEN_POPUP_EVENT, { detail: { pagina: 'vasten', sleutel: geselecteerd.ymd } }));
  const kerkRegel = `${mode === 'oud' ? 'Kerkelijke datum' : 'Kerkelijk'}: ${formatDag(geselecteerd.kerk)} (${mode === 'oud' ? 'Juliaans' : 'nieuwe kalender'})`;

  return (
    <>
      <PaginaOpening id="kalender" label="De Orthodoxe kerkkalender" titel="Kalender" ondertitel="Leven in het ritme van de Kerk" />

      <section className="kl-pagina bg-parchment text-ink">
        <div className="kl-raster">
          {/* De maand */}
          <div className="kl-maand jr-vak">
            <div className="kl-kop">
              <button type="button" className="kl-knop" onClick={vorige} aria-label="Vorige maand">
                <ChevronLeft aria-hidden="true" />
              </button>
              <h2 className="kl-maandnaam" aria-live="polite">
                {hoofdletter(MAANDEN[cur.m - 1])} {cur.y}
              </h2>
              <button type="button" className="kl-knop" onClick={volgende} aria-label="Volgende maand">
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
            {!isHuidigeMaand && (
              <button type="button" className="kl-naar-vandaag" onClick={naarVandaag}>
                Naar vandaag ›
              </button>
            )}

            <div className="kl-weekdagen" aria-hidden="true">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <span key={d} className={d === 0 ? 'is-zondag' : undefined}>
                  {WEEKDAGEN_KORT[d]}
                </span>
              ))}
            </div>

            <div className="kl-cellen" {...veegMaand}>
              {cellen.map((c) => {
                const buiten = c.maand !== cur.m;
                const feest = c.feesten[0];
                const heilige = eersteHeilige(heiligen?.HEILIGEN[c.kerkKey]);
                const isPascha = feest?.soort === 'pascha';
                const groot = !!feest?.groot;
                const teken = isPascha ? TEKEN.pascha : groot ? TEKEN.groot : feest ? TEKEN.ander : null;
                const kleur = liturgischeKleur(c);
                const lit = LITURGISCHE_KLEUREN[kleur];
                const groep = vastenGroep(c.vasten.niveau);
                const label = [
                  `${hoofdletter(formatLang(c.civil))}${c.isVandaag ? ' (vandaag)' : ''}`,
                  feest ? feest.naam : heilige ? heiligeTitel(heilige.naam) : '',
                  isPascha ? 'Pascha' : groot ? 'groot feest' : '',
                  lit.css ? `liturgische kleur ${lit.naam}` : '',
                  c.vasten.label === NIVEAUS[c.vasten.niveau].label ? kleineLetter(c.vasten.label) : c.vasten.label,
                ].filter(Boolean).join(', ');
                return (
                  <button
                    key={c.ymd}
                    type="button"
                    onClick={() => setGeselecteerdeYmd(c.ymd)}
                    className={`kl-cel${buiten ? ' is-buiten' : ''}${c.isZondag ? ' is-zondag' : ''}${c.isVandaag ? ' is-vandaag' : ''}${c.ymd === geselecteerd.ymd ? ' is-gekozen' : ''}`}
                    style={lit.css && !buiten ? ({ '--lit': lit.css } as CSSProperties) : undefined}
                    data-lit={lit.css && !buiten ? kleur : undefined}
                    aria-label={label}
                    aria-pressed={c.ymd === geselecteerd.ymd}
                    aria-current={c.isVandaag ? 'date' : undefined}
                  >
                    <span className="kl-nr">{c.dag}</span>
                    {!buiten && (
                      <span className="kl-tekens" aria-hidden="true">
                        {c.isVandaag && <span className="kl-ruit">◆</span>}
                        {teken && <span className={`kl-teken${isPascha || groot ? ' is-groot' : ''}`}>{teken}</span>}
                        {groep && <VastenSymbool groep={groep} className="kl-vasten" />}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legenda: op mobiel in te klappen, op het web altijd zichtbaar */}
            <button type="button" className="kl-legenda-knop" aria-expanded={legendaOpen} onClick={() => setLegendaOpen((o) => !o)}>
              Legenda {legendaOpen ? '‹' : '›'}
            </button>
            <div className={`kl-legenda${legendaOpen ? ' is-open' : ''}`}>
              <ul className="kl-legenda-kleuren">
                {Object.entries(LITURGISCHE_KLEUREN).map(([k, l]) => (
                  <li key={k}>
                    <span className="kl-staal" data-lit={l.css ? k : undefined} style={l.css ? ({ '--lit': l.css } as CSSProperties) : undefined} aria-hidden="true" />
                    <span>{hoofdletter(l.naam)}</span>
                    <span className="kl-legenda-uitleg">{l.uitleg}</span>
                  </li>
                ))}
              </ul>
              <ul className="kl-legenda-tekens">
                <li><span className="kl-teken" aria-hidden="true">{TEKEN.ander}</span> Feestdag</li>
                <li><span className="kl-teken is-groot" aria-hidden="true">{TEKEN.groot}</span> Groot feest</li>
                <li><span className="kl-teken is-groot" aria-hidden="true">{TEKEN.pascha}</span> Pascha</li>
                {(Object.keys(VASTEN_GROEPEN) as VastenGroep[]).map((g) => (
                  <li key={g}><VastenSymbool groep={g} className="kl-vasten" /> {hoofdletter(VASTEN_GROEPEN[g])}</li>
                ))}
                <li><span className="kl-ruit" aria-hidden="true">◆</span> Vandaag</li>
                <li><span className="kl-legenda-gekozen" aria-hidden="true" /> Geselecteerd</li>
              </ul>
            </div>
          </div>

          {/* De gekozen dag */}
          <aside className="kl-dag jr-vak" aria-labelledby="kl-dag-datum">
            <div className="kl-dag-kop">
              <p className="kl-weekdag">{hoofdletter(formatLang(geselecteerd.civil).split(' ')[0])}</p>
              <h2 id="kl-dag-datum" className="kl-datum">{formatDatum(geselecteerd.civil)}</h2>
              <p className="kl-kerk">{kerkRegel}</p>
            </div>
            <ul className="kl-register">
              <Regel titel="Heiligen" onClick={() => openDagHeiligen(geselecteerd.ymd)}>
                {heiligenVanDag.length
                  ? `${heiligenVanDag.slice(0, 2).map((h) => h.naam).join(', ')}${heiligenVanDag.length > 2 ? ` en ${heiligenVanDag.length - 2} anderen` : ''}`
                  : 'Geen heiligen opgenomen'}
              </Regel>
              <Regel titel="Feesten" onClick={() => openDag(geselecteerd.ymd)}>
                {geselecteerd.feesten.map((f) => f.naam).join(' · ') || 'Geen groot feest'}
              </Regel>
              <Regel titel="Schriftlezingen" onClick={() => openDagLezingen(geselecteerd.ymd)}>
                {lezingen.length
                  ? lezingen.slice(0, 2).map((l, i) => {
                      const ref = vertaalRef(l.ref);
                      return <span key={i} className="kl-lezing">{SOORT_LABEL[lezingSoort(ref)]}: {ref}</span>;
                    })
                  : roosterMelding(geselecteerd.ymd)}
              </Regel>
              <Regel titel="Vasten" onClick={openVasten}>
                {geselecteerd.vasten.label}
              </Regel>
              <Regel titel="Paascyclus" onClick={() => openDagPascha(geselecteerd.ymd)}>
                {geselecteerd.seizoen}
                {geselecteerd.toon ? ` · Toon ${geselecteerd.toon}` : ''}
              </Regel>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
