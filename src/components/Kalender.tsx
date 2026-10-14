import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { MAANDEN, WEEKDAGEN_KORT, formatDag, hoofdletter, maandRooster, formatLang } from '../lib/kalender';
import { LITURGISCHE_KLEUREN, liturgischeKleur } from '../lib/liturgischeKleur';
import { useSwipe } from '../lib/swipe';
import { NIVEAUS, VASTEN_GROEPEN, vastenGroep, type VastenGroep } from '../lib/vasten';
import { lezingSoort, roosterMelding, vertaalRef } from '../lib/htc';
import { OPEN_POPUP_EVENT, type OpenPopupDetail } from '../lib/events';
import { usePaginaOpen } from '../lib/paginaOpen';
import { VastenSymbool, KruisTeken } from './ui';
import { eersteHeilige, heiligeTitel, heiligenVanDag as dagHeiligen } from '../lib/heiligenPopup';
import NisKop from './NisKop';
import { BannerBeeld, MaandNav, Sierlijn } from './onderdelen';
import { BLAD, KERK, KRUIS } from './symbolen';
import './Vandaag.css';
import './ontwerp.css';

// Kalender volgens het overdrachtspakket (referentie kalender-pascha-feesten-vasten.png, paneel 1): de kop met het
// verluchte boek, de maand (maandag eerst, de gekozen dag in bordeaux, vandaag met een stip; tekens voor feest, groot
// feest en vasten en een streepje in de liturgische kleur) met de legenda, en de gekozen dag als register: heiligen,
// lezingen, vasten, feesten en Paascyclus. Alle gegevens uit de bestaande kalender, het leesrooster en het Heiligenjaar;
// elke regel opent het bestaande venster. Op brede schermen staan maand en dag naast elkaar.

const TEKEN = { pascha: <KruisTeken />, groot: '✠', ander: '✦' };
const kleineLetter = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const SOORT_LABEL = { apostel: 'Apostel', evangelie: 'Evangelie', oud: 'Oude Testament' } as const;

function Regel({ titel, symbool, onClick, children }: { titel: string; symbool: ReactNode; onClick: () => void; children: ReactNode }) {
  return (
    <li>
      <button type="button" className="ot-rij" onClick={onClick}>
        <span className="ot-rij-symbool" aria-hidden="true">{symbool}</span>
        <span className="ot-rij-tekst">
          <b>{titel}</b>
          <span>{children}</span>
        </span>
        <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
      </button>
    </li>
  );
}

export default function Kalender() {
  const { mode, vandaag, vandaagYmd, heiligen, rooster, vraagRooster, openDag, openDagLezingen, openDagHeiligen, openDagPascha } = useApp();
  const open = usePaginaOpen('kalender');
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
  const groepGekozen = vastenGroep(geselecteerd.vasten.niveau);

  return (
    <section id="kalender" className="vg ot-redesign ot-kalender">
      <NisKop open={open} balk achter={<BannerBeeld naam="kalender-banner" open={open} />} />
      <h1 className="sr-only">Kalender</h1>

      <div className="vg-papier ot-inhoud ot-twee">
        {/* De maand */}
        <div className="ot-maand">
          <MaandNav titel={`${hoofdletter(MAANDEN[cur.m - 1])} ${cur.y}`} onVorige={vorige} onVolgende={volgende} />
          {!isHuidigeMaand && (
            <button type="button" className="ot-tekstknop ot-naar-vandaag" onClick={naarVandaag}>
              Naar vandaag ›
            </button>
          )}

          <div className="ot-raster" {...veegMaand}>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <span key={d} className="ot-weekdag" aria-hidden="true">{WEEKDAGEN_KORT[d]}</span>
            ))}
            {cellen.map((c) => {
              if (c.maand !== cur.m) return <span key={c.ymd} className="ot-cel is-leeg" aria-hidden="true" />;
              const feest = c.feesten[0];
              const heilige = eersteHeilige(heiligen?.HEILIGEN[c.kerkKey]);
              const isPascha = feest?.soort === 'pascha';
              const groot = !!feest?.groot;
              const teken = isPascha ? TEKEN.pascha : groot ? TEKEN.groot : feest ? TEKEN.ander : null;
              const lit = LITURGISCHE_KLEUREN[liturgischeKleur(c)];
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
                  className={`ot-cel${c.isZondag ? ' is-zondag' : ''}${c.isVandaag ? ' is-vandaag' : ''}${c.ymd === geselecteerd.ymd ? ' is-gekozen' : ''}`}
                  style={lit.css ? ({ '--lit': lit.css } as CSSProperties) : undefined}
                  aria-label={label}
                  aria-pressed={c.ymd === geselecteerd.ymd}
                  aria-current={c.isVandaag ? 'date' : undefined}
                >
                  <span className="ot-cel-nr">{c.dag}</span>
                  <span className="ot-cel-tekens" aria-hidden="true">
                    {teken && <span className={`ot-teken${isPascha || groot ? ' is-groot' : ''}`}>{teken}</span>}
                    {groep && <VastenSymbool groep={groep} className="ot-vastenteken" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legenda: liturgische kleuren en tekens */}
          <button type="button" className="ot-tekstknop" aria-expanded={legendaOpen} onClick={() => setLegendaOpen((o) => !o)}>
            Legenda {legendaOpen ? '‹' : '›'}
          </button>
          {legendaOpen && (
            <div className="ot-legenda">
              <ul>
                {Object.entries(LITURGISCHE_KLEUREN).map(([k, l]) => (
                  <li key={k}>
                    <span className="ot-staal" style={l.css ? ({ '--lit': l.css } as CSSProperties) : undefined} aria-hidden="true" />
                    <span>{hoofdletter(l.naam)} <small>· {l.uitleg}</small></span>
                  </li>
                ))}
              </ul>
              <ul>
                <li><span className="ot-teken" aria-hidden="true">{TEKEN.ander}</span> Feestdag</li>
                <li><span className="ot-teken is-groot" aria-hidden="true">{TEKEN.groot}</span> Groot feest</li>
                <li><span className="ot-teken is-groot" aria-hidden="true">{TEKEN.pascha}</span> Pascha</li>
                {(Object.keys(VASTEN_GROEPEN) as VastenGroep[]).map((g) => (
                  <li key={g}><VastenSymbool groep={g} className="ot-vastenteken" /> {hoofdletter(VASTEN_GROEPEN[g])}</li>
                ))}
                <li><span className="ot-stip" aria-hidden="true" /> Vandaag</li>
                <li><span className="ot-gekozen-staal" aria-hidden="true" /> Geselecteerd</li>
              </ul>
            </div>
          )}
        </div>

        {/* De gekozen dag */}
        <div className="ot-dag">
          <h2 id="kl-dag-datum" className="ot-dagtitel">
            {hoofdletter(formatLang(geselecteerd.civil).split(' ')[0])} {formatDag(geselecteerd.civil)}
          </h2>
          <Sierlijn />
          <p className="ot-kerkdatum">{kerkRegel}</p>
          <ul className="ot-register" aria-labelledby="kl-dag-datum">
            <Regel titel="Heiligen" symbool={KRUIS} onClick={() => openDagHeiligen(geselecteerd.ymd)}>
              {heiligenVanDag.length
                ? `${heiligenVanDag.slice(0, 2).map((h) => h.naam).join(', ')}${heiligenVanDag.length > 2 ? ` en ${heiligenVanDag.length - 2} anderen` : ''}`
                : 'Geen heiligen opgenomen'}
            </Regel>
            <Regel titel="Lezingen" symbool={<BookOpen strokeWidth={1.3} />} onClick={() => openDagLezingen(geselecteerd.ymd)}>
              {lezingen.length
                ? lezingen.slice(0, 2).map((l, i) => {
                    const ref = vertaalRef(l.ref);
                    return <span key={i} className="ot-lezing">{SOORT_LABEL[lezingSoort(ref)]}: {ref}</span>;
                  })
                : roosterMelding(geselecteerd.ymd)}
            </Regel>
            <Regel titel="Vasten" symbool={groepGekozen ? <VastenSymbool groep={groepGekozen} className="ot-rij-vasten" /> : BLAD} onClick={openVasten}>
              {geselecteerd.vasten.label}
            </Regel>
            <Regel titel="Feesten" symbool={KERK} onClick={() => openDag(geselecteerd.ymd)}>
              {geselecteerd.feesten.map((f) => f.naam).join(' · ') || 'Geen groot feest'}
            </Regel>
            <Regel titel="Paascyclus" symbool={<span className="ot-rij-teken"><KruisTeken /></span>} onClick={() => openDagPascha(geselecteerd.ymd)}>
              {geselecteerd.seizoen}
              {geselecteerd.toon ? ` · Toon ${geselecteerd.toon}` : ''}
            </Regel>
          </ul>
        </div>
      </div>
    </section>
  );
}
