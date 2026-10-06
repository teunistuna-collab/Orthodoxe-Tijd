import { useMemo, useState, type CSSProperties } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { MAANDEN, MAANDEN_KORT, WEEKDAGEN_KORT, formatDatum, hoofdletter, maandRooster, formatLang } from '../lib/kalender';
import { LITURGISCHE_KLEUREN, liturgischeKleur } from '../lib/liturgischeKleur';
import { useSwipe } from '../lib/swipe';
import { NIVEAUS, VASTEN_GROEPEN, vastenGroep, type VastenGroep } from '../lib/vasten';
import { VastenSymbool, Hoeksier, KruisTeken } from './ui';
import { eersteHeilige, heiligeTitel, heiligenVanDag as dagHeiligen } from '../lib/heiligenPopup';
import PageHero from './PageHero';

const TEKEN = { pascha: <KruisTeken />, groot: '✠', ander: '✦' };
const kleineLetter = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const PIJL = 'kal-knop inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full border border-gold/40 bg-[#f8f1e3] px-3 text-sm font-bold text-ink hover:border-gold sm:min-h-0 sm:py-1.5';

// Mobiel: ‹ maand jaar › op één rij, daaronder compact "Vandaag". Vanaf sm alles op één rij.
function CalendarToolbar({ maand, jaar, eersteJaar, onMaand, onJaar, onVorige, onVolgende, onVandaag }: {
  maand: number;
  jaar: number;
  eersteJaar: number;
  onMaand: (m: number) => void;
  onJaar: (y: number) => void;
  onVorige: () => void;
  onVolgende: () => void;
  onVandaag: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gold/30 bg-[#f3e9d2] px-3 py-3 sm:flex-nowrap sm:justify-between sm:gap-3 sm:px-5">
      <button type="button" onClick={onVorige} className={`order-1 ${PIJL}`} aria-label="Vorige maand">
        <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">{MAANDEN_KORT[(maand + 10) % 12]}</span>
      </button>
      {/* Onder 360px krijgen maand en jaar een eigen rij (anders wordt "Oktober" afgekapt); de pijlen en Vandaag eronder */}
      <div className="order-2 flex min-w-0 flex-1 items-center justify-center gap-2 max-[359px]:order-first max-[359px]:basis-full sm:flex-none">
        <select value={maand} onChange={(e) => onMaand(Number(e.target.value))} className="kal-knop font-display min-w-0 flex-1 rounded-md border border-gold/40 bg-[#f8f1e3] px-2 py-1.5 text-base font-semibold text-ink sm:flex-none sm:py-1 sm:text-lg" aria-label="Maand">
          {MAANDEN.map((mn, i) => (
            <option key={mn} value={i + 1}>{hoofdletter(mn)}</option>
          ))}
        </select>
        <select value={jaar} onChange={(e) => onJaar(Number(e.target.value))} className="kal-knop font-display rounded-md border border-gold/40 bg-[#f8f1e3] px-2 py-1.5 text-base font-semibold text-ink sm:py-1 sm:text-lg" aria-label="Jaar">
          {Array.from({ length: 12 }, (_, i) => eersteJaar + i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <button type="button" onClick={onVolgende} className={`order-3 sm:order-4 ${PIJL}`} aria-label="Volgende maand">
        <span className="hidden sm:inline">{MAANDEN_KORT[maand % 12]}</span> <ChevronRight className="h-4 w-4" />
      </button>
      <span className="order-4 basis-full sm:hidden" aria-hidden="true" />
      <button type="button" onClick={onVandaag} className="kal-vandaag order-5 mx-auto max-[359px]:order-2 rounded-full bg-gold px-5 py-1.5 text-xs font-bold tracking-wider text-bark uppercase hover:bg-gold-light sm:order-3 sm:mx-0 sm:px-3">
        Vandaag
      </button>
    </div>
  );
}

export default function Kalender() {
  const { mode, vandaag, vandaagYmd, heiligen, openDag } = useApp();
  const [cur, setCur] = useState({ y: vandaag.getUTCFullYear(), m: vandaag.getUTCMonth() + 1 });
  const [geselecteerdeYmd, setGeselecteerdeYmd] = useState(vandaagYmd);
  const [legendaOpen, setLegendaOpen] = useState(false);

  const alleCellen = useMemo(() => maandRooster(cur.y, cur.m, mode, vandaagYmd), [cur, mode, vandaagYmd]);
  // Alleen zoveel weken als de maand nodig heeft (5 of 6).
  const laatste = alleCellen.map((c) => c.maand).lastIndexOf(cur.m);
  const cellen = alleCellen.slice(0, Math.ceil((laatste + 1) / 7) * 7);
  const inMaand = cellen.filter((c) => c.maand === cur.m);
  const aantalFeesten = inMaand.filter((c) => c.feesten.some((f) => f.groot || f.soort === 'pascha' || f.soort === 'feest')).length;
  const vastendagen = inMaand.filter((c) => !['geen', 'vrij'].includes(c.vasten.niveau)).length;
  const geselecteerd = cellen.find((c) => c.ymd === geselecteerdeYmd) ?? cellen.find((c) => c.isVandaag) ?? cellen.find((c) => c.maand === cur.m) ?? cellen[0];

  // Heiligen en gedachtenissen van de gekozen dag uit de centrale lijst (zonder feesten; die staan bij de feesten)
  const heiligenVanDag = dagHeiligen(geselecteerd.kerkKey, heiligen?.HEILIGEN, geselecteerd.ymd);
  const hoofdheilige = heiligenVanDag[0];
  const overigeHeiligen = heiligenVanDag.slice(1);

  const vorige = () => setCur((c) => (c.m === 1 ? { y: c.y - 1, m: 12 } : { y: c.y, m: c.m - 1 }));
  const volgende = () => setCur((c) => (c.m === 12 ? { y: c.y + 1, m: 1 } : { y: c.y, m: c.m + 1 }));
  const veegMaand = useSwipe(vorige, volgende);
  const naarVandaag = () => setCur({ y: vandaag.getUTCFullYear(), m: vandaag.getUTCMonth() + 1 });

  return (
    <>
      <PageHero id="kalender" titel="Kalender" />

      <section className="orthodox-pattern parchment-pattern bg-parchment py-12 text-ink max-md:py-5 sm:py-16">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12">
          <div className="kal-intro relative px-6 py-7 max-md:px-1 max-md:py-2 sm:px-14 sm:py-9">
            <div className="relative grid gap-6 lg:grid-cols-[7fr_3fr] lg:items-center">
              <div>
                <p className="ot-label">Leef mee met de liturgische tijd</p>
                <h1 className="ot-titel font-display mt-2 text-3xl font-semibold sm:text-4xl">De kalender van de Kerk</h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft sm:text-base">{aantalFeesten} feestdagen en {vastendagen} dagen met een vastenvoorschrift deze maand.<span className="max-md:hidden"> Elke dag is een ontmoeting met Christus door de heiligen, de feesten, de lezingen en de gebeden van de Kerk.</span></p>
              </div>
              <blockquote className="border-l border-gold/60 pl-5 font-display text-lg italic leading-relaxed text-ink-soft max-md:hidden">“In de tijd komt de Eeuwige ons tegemoet.”</blockquote>
            </div>
          </div>

          <div className="vlak mt-8 parchment-pattern relative overflow-hidden rounded-lg border border-gold/45 bg-[#f8f1e3] shadow-[0_30px_70px_rgba(40,22,14,0.16)] max-md:mt-4">
            <Hoeksier className="absolute top-4 left-4" />
            <Hoeksier className="absolute top-4 right-4 -scale-x-100" />
            <div className="lg:grid lg:grid-cols-[3fr_2fr]">
            <div className="relative min-w-0 border-b border-gold/35 lg:border-b-0 lg:border-r">
            <CalendarToolbar
              maand={cur.m}
              jaar={cur.y}
              eersteJaar={vandaag.getUTCFullYear() - 2}
              onMaand={(m) => setCur((c) => ({ ...c, m }))}
              onJaar={(y) => setCur((c) => ({ ...c, y }))}
              onVorige={vorige}
              onVolgende={volgende}
              onVandaag={naarVandaag}
            />

            {/* Weekdagen */}
            <div className="grid grid-cols-7 border-b border-gold/25 bg-[#f3e9d2] text-center text-[11px] font-bold tracking-widest text-gold-deep uppercase sm:text-xs">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <div key={d} className={`py-2 ${d === 0 ? 'text-[var(--ot-wijnrood)]' : ''}`}>
                  {WEEKDAGEN_KORT[d]}
                </div>
              ))}
            </div>

            <div className="kal-kleur-balk">
            {/* Cellen */}
            <div className="grid grid-cols-7" {...veegMaand}>
              {cellen.map((c) => {
                const buiten = c.maand !== cur.m;
                const feest = c.feesten[0];
                const heilige = eersteHeilige(heiligen?.HEILIGEN[c.kerkKey]);
                const isPascha = feest?.soort === 'pascha';
                const groot = !!feest?.groot;
                const beweeglijk = feest?.soort === 'beweeglijk' && !groot && !isPascha;
                const teken = isPascha ? TEKEN.pascha : groot ? TEKEN.groot : feest ? TEKEN.ander : null;
                const kleur = liturgischeKleur(c);
                const lit = LITURGISCHE_KLEUREN[kleur];
                const groep = vastenGroep(c.vasten.niveau);
                const isGeselecteerd = c.ymd === geselecteerd.ymd;
                const label = [
                  `${hoofdletter(formatLang(c.civil))}${c.isVandaag ? ' (vandaag)' : ''}`,
                  feest ? feest.naam : heilige ? heiligeTitel(heilige.naam) : '',
                  isPascha ? 'Pascha' : groot ? 'groot feest' : beweeglijk ? 'beweeglijk feest' : '',
                  lit.css ? `liturgische kleur ${lit.naam}` : '',
                  c.vasten.label === NIVEAUS[c.vasten.niveau].label ? kleineLetter(c.vasten.label) : c.vasten.label,
                ].filter(Boolean).join(', ');
                return (
                  <button
                    key={c.ymd}
                    type="button"
                    onClick={() => {
                      setGeselecteerdeYmd(c.ymd);
                      // Op een smal scherm staat het detailpaneel onder de kalender (buiten beeld): dan een pop-up tonen.
                      if (window.matchMedia('(max-width: 1023px)').matches) openDag(c.ymd);
                    }}
                    className={`kal-dag${buiten ? ' is-buiten' : ''}${c.isZondag ? ' is-zondag' : ''}${c.isVandaag ? ' is-vandaag' : ''}${isGeselecteerd ? ' is-gekozen' : ''}`}
                    data-lit={lit.css && !buiten ? kleur : undefined}
                    style={lit.css ? ({ '--lit': lit.css } as CSSProperties) : undefined}
                    title={feest ? feest.naam : 'Open dagdetail'}
                    aria-label={label}
                    aria-current={c.isVandaag ? 'date' : undefined}
                  >
                    <span className="kal-dag-kop">
                      <span className="kal-dag-nr">{c.dag}</span>
                      {mode === 'oud' && <span className="kal-dag-kerk">{c.kerk.getUTCDate()} {MAANDEN_KORT[c.kerk.getUTCMonth()]}</span>}
                    </span>
                    {!buiten && (feest || heilige) && (
                      <span className={`kal-dag-feest${feest ? '' : ' is-heilige'}${isPascha || groot ? ' is-groot' : ''}`} aria-hidden="true">
                        {teken && <span className="kal-dag-teken">{teken}</span>}
                        <span className="kal-dag-naam">{feest ? feest.kort ?? feest.naam : heilige!.naam}</span>
                      </span>
                    )}
                    {!buiten && groep && <VastenSymbool groep={groep} className="kal-dag-vasten" />}
                  </button>
                );
              })}
            </div>

            {/* Legenda: op mobiel en tablet inklapbaar, op desktop altijd zichtbaar */}
            <button type="button" onClick={() => setLegendaOpen((o) => !o)} aria-expanded={legendaOpen} className="flex min-h-11 w-full items-center justify-between border-t border-gold/25 bg-[#f3e9d2] px-4 text-xs font-bold tracking-widest text-gold-deep uppercase lg:hidden">
              Legenda <ChevronDown className={`h-4 w-4 transition ${legendaOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`kal-legenda ${legendaOpen ? 'grid' : 'hidden'} lg:grid`}>
              <p className="kal-legenda-titel max-lg:hidden">Legenda</p>
              <section>
                <h3>Liturgische kleuren</h3>
                <ul>
                  {Object.entries(LITURGISCHE_KLEUREN).map(([k, l]) => (
                    <li key={k}>
                      <span className="kal-staal" data-lit={l.css ? k : undefined} style={l.css ? ({ '--lit': l.css } as CSSProperties) : undefined} aria-hidden="true" />
                      {l.css ? l.uitleg : 'gewone dagen (geen kleur)'}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3>Vasten</h3>
                <ul>
                  {(Object.keys(VASTEN_GROEPEN) as VastenGroep[]).map((g) => (
                    <li key={g}><VastenSymbool groep={g} className="kal-legenda-symbool" /> {VASTEN_GROEPEN[g]}</li>
                  ))}
                  <li><span className="kal-legenda-symbool" aria-hidden="true" /> geen symbool: geen vasten</li>
                </ul>
              </section>
              <section>
                <h3>Tekens</h3>
                <ul>
                  <li><span className="kal-legenda-teken" aria-hidden="true">{TEKEN.groot}</span> groot feest</li>
                  <li><span className="kal-legenda-teken" aria-hidden="true">{TEKEN.pascha}</span> Pascha</li>
                  <li><span className="kal-legenda-teken" aria-hidden="true">{TEKEN.ander}</span> ander feest of gedachtenis (vast of beweeglijk)</li>
                  <li><span className="kal-legenda-zondag" aria-hidden="true">7</span> zondag</li>
                </ul>
              </section>
            </div>
            </div>
            </div>

            <aside className="relative hidden flex-col bg-[#f3e9d2]/70 lg:flex px-5 py-7 text-ink sm:px-7 sm:py-9">
              <p className="ot-label text-center">Details van de geselecteerde dag</p>
              <h2 className="ot-titel font-display mt-3 text-center text-2xl font-semibold leading-tight sm:text-3xl">{formatDatum(geselecteerd.civil)}</h2>
              <p className="mt-1 text-center text-sm italic text-ink-soft">{formatDatum(geselecteerd.kerk)} · {mode === 'oud' ? 'Juliaanse kalender' : 'kerkelijke datum'}</p>
              <div className="mt-7 flex flex-1 flex-col">
                <section className="cal-saints flex flex-1 flex-col">
                  <p className="ot-label">Heilige(n) van de dag</p>
                  {hoofdheilige ? (
                    <>
                      <h3 className="cal-saints-name">{hoofdheilige.naam}</h3>
                      {hoofdheilige.titel && hoofdheilige.titel !== hoofdheilige.naam && <p className="cal-saints-title">{hoofdheilige.titel}</p>}
                      {hoofdheilige.kort && <p className="cal-saints-text">{hoofdheilige.kort}</p>}
                      {overigeHeiligen.length > 0 && (
                        <div className="cal-saints-more">
                          <p className="cal-saints-rule" aria-hidden="true"><span>✣</span></p>
                          <p className="cal-saints-label">Ook gedacht ({overigeHeiligen.length})</p>
                          <ul>
                            {overigeHeiligen.slice(0, 4).map((h, i) => <li key={i}>{h.naam}</li>)}
                          </ul>
                          {overigeHeiligen.length > 4 && (
                            <details>
                              <summary>Toon nog {overigeHeiligen.length - 4} meer</summary>
                              <ul>
                                {overigeHeiligen.slice(4).map((h, i) => <li key={i}>{h.naam}</li>)}
                              </ul>
                            </details>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="cal-saints-text">Geen heiligen opgenomen.</p>
                  )}
                </section>
              </div>
            </aside>
            </div>

            <div className="hidden border-t border-gold/35 bg-[#f3e9d2]/70 px-5 py-6 sm:px-7 lg:block">
              <div className="grid gap-3 md:grid-cols-3">
                <section className="flex flex-col border border-gold/30 bg-[#fbf3e3]/75 p-4 shadow-[0_6px_14px_rgba(58,33,16,0.06)]"><p className="ot-label text-center">Feestdag / gedachtenis</p><p className="mt-2 text-sm leading-relaxed text-ink-soft">{geselecteerd.feesten.map((f) => f.naam).join(' · ') || 'Geen groot feest.'}</p></section>
                <section className="flex flex-col border border-gold/30 bg-[#fbf3e3]/75 p-4 shadow-[0_6px_14px_rgba(58,33,16,0.06)]"><p className="ot-label text-center">Schriftlezingen</p><p className="mt-2 mb-3 text-sm text-ink-soft">De bestaande lezingen en volledige daginformatie staan in het dagdetail.</p><button type="button" onClick={() => openDag(geselecteerd.ymd)} className="btn-pill mt-auto self-start">Lees de lezingen ›</button></section>
                <section className="flex flex-col border border-gold/30 bg-[#fbf3e3]/75 p-4 shadow-[0_6px_14px_rgba(58,33,16,0.06)]"><p className="ot-label text-center">Vasten</p><p className="mt-2 text-sm leading-relaxed text-ink-soft">{geselecteerd.vasten.label}</p><p className="mt-1 mb-3 text-sm text-ink-soft">{geselecteerd.vasten.detail}</p><a href="#vasten" className="btn-pill mt-auto self-start">Meer over vasten ›</a></section>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="orthodox-pattern bg-bark py-12 text-cream sm:py-16">
        <div className="mx-auto w-full max-w-[1500px] px-4 text-center sm:px-8 lg:px-12">
          <p className="ot-label ot-label-licht">Wandel in de tijd met de heiligen</p>
          <p className="mx-auto mt-4 max-w-2xl font-display text-lg italic leading-relaxed text-[#d9c6a3]">Elke dag is een ontmoeting met Christus door de heiligen, de feesten, de lezingen en de gebeden van de Kerk.</p>
        </div>
      </section>
    </>
  );
}

