import { useMemo, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { MAANDEN, MAANDEN_KORT, WEEKDAGEN_KORT, formatDatum, hoofdletter, maandRooster } from '../lib/kalender';
import { HEILIGEN } from '../lib/heiligen';
import { NIVEAUS } from '../lib/vasten';
import { VastenKleuren } from './ui';
import { LITURGISCHE_KLEUREN, liturgischeKleur } from '../lib/liturgischeKleur';
import { useSwipe } from '../lib/swipe';

// Zeer subtiel botanisch hoekornament ter decoratie van het kalenderpaneel.
function CornerOrnament({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 4 C 20 6, 30 16, 32 32" strokeLinecap="round" />
      <path d="M4 4 C 6 20, 16 30, 32 32" strokeLinecap="round" />
      <circle cx="32" cy="32" r="2.4" />
      <circle cx="14" cy="6" r="1.8" />
      <circle cx="6" cy="14" r="1.8" />
    </svg>
  );
}

export default function Kalender() {
  const { mode, vandaag, vandaagYmd, openDag } = useApp();
  const [cur, setCur] = useState({ y: vandaag.getUTCFullYear(), m: vandaag.getUTCMonth() + 1 });
  const [geselecteerdeYmd, setGeselecteerdeYmd] = useState(vandaagYmd);

  const cellen = useMemo(() => maandRooster(cur.y, cur.m, mode, vandaagYmd), [cur, mode, vandaagYmd]);
  const inMaand = cellen.filter((c) => c.maand === cur.m);
  const aantalFeesten = inMaand.filter((c) => c.feesten.some((f) => f.groot || f.soort === 'pascha' || f.soort === 'feest')).length;
  const vastendagen = inMaand.filter((c) => !['geen', 'vrij'].includes(c.vasten.niveau)).length;
  const geselecteerd = cellen.find((c) => c.ymd === geselecteerdeYmd) ?? cellen.find((c) => c.isVandaag) ?? cellen.find((c) => c.maand === cur.m) ?? cellen[0];

  const heiligenVanDag = HEILIGEN[geselecteerd.kerkKey] ?? [];
  const hoofdheilige = heiligenVanDag[0];
  const overigeHeiligen = heiligenVanDag.slice(1);

  const vorige = () => setCur((c) => (c.m === 1 ? { y: c.y - 1, m: 12 } : { y: c.y, m: c.m - 1 }));
  const volgende = () => setCur((c) => (c.m === 12 ? { y: c.y + 1, m: 1 } : { y: c.y, m: c.m + 1 }));
  const veegMaand = useSwipe(vorige, volgende);
  const naarVandaag = () => setCur({ y: vandaag.getUTCFullYear(), m: vandaag.getUTCMonth() + 1 });

  return (
    <>
      <section id="kalender" className="bg-bark page-hero-crop">
        <img loading="lazy" decoding="async" src="/images/heroes/hero-kalender.webp" width={2103} height={748} alt="Kalender — het kerkelijk jaar in overzicht" />
      </section>

      <section className="orthodox-pattern parchment-pattern bg-parchment py-12 text-ink sm:py-16">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12">
          <div className="parchment-pattern relative overflow-hidden border border-gold/45 bg-[#f7edda] px-6 py-7 shadow-[0_16px_34px_rgba(56,31,14,0.13)] sm:px-10 sm:py-9">
            <CornerOrnament className="absolute bottom-3 left-3 h-16 w-16 text-gold-deep/20" />
            <CornerOrnament className="absolute right-3 top-3 h-16 w-16 -scale-x-100 text-gold-deep/20" />
            <div className="relative grid gap-6 lg:grid-cols-[7fr_3fr] lg:items-center">
              <div>
                <p className="text-[11px] font-bold tracking-[0.3em] text-gold-deep uppercase sm:text-xs">Leef mee met de liturgische tijd</p>
                <h1 className="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl">De kalender van de Kerk</h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft sm:text-base">{aantalFeesten} feestdagen en {vastendagen} dagen met een vastenvoorschrift deze maand. Elke dag is een ontmoeting met Christus door de heiligen, de feesten, de lezingen en de gebeden van de Kerk.</p>
              </div>
              <blockquote className="border-l border-gold/60 pl-5 font-display text-lg italic leading-relaxed text-ink-soft">“In de tijd komt de Eeuwige ons tegemoet.”</blockquote>
            </div>
          </div>

          <div className="mt-8 parchment-pattern relative overflow-hidden rounded-lg border border-gold/45 bg-[#f8f1e3] shadow-[0_30px_70px_rgba(40,22,14,0.16)]">
            <CornerOrnament className="absolute top-4 left-4 h-12 w-12 text-gold-deep/25" />
            <CornerOrnament className="absolute top-4 right-4 h-12 w-12 -scale-x-100 text-gold-deep/25" />
            <div className="lg:grid lg:grid-cols-[3fr_2fr]">
            <div className="relative min-w-0 border-b border-gold/35 lg:border-b-0 lg:border-r">
            {/* Werkbalk */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gold/30 bg-[#f3e9d2] px-3 py-3 sm:flex-nowrap sm:justify-between sm:gap-3 sm:px-5">
              <button type="button" onClick={vorige} className="order-1 inline-flex items-center gap-1 rounded-full border border-gold/40 bg-[#f8f1e3] px-3 py-1.5 text-sm font-bold text-ink hover:border-gold" aria-label="Vorige maand">
                <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">{MAANDEN_KORT[(cur.m + 10) % 12]}</span>
              </button>
              <div className="order-2 flex min-w-0 basis-full items-center gap-2 sm:basis-auto sm:flex-none">
                <select
                  value={cur.m}
                  onChange={(e) => setCur((c) => ({ ...c, m: Number(e.target.value) }))}
                  className="font-display min-w-0 flex-1 rounded-md border border-gold/40 bg-[#f8f1e3] px-2 py-1 text-lg font-semibold text-ink sm:flex-none"
                  aria-label="Maand"
                >
                  {MAANDEN.map((mn, i) => (
                    <option key={mn} value={i + 1}>
                      {hoofdletter(mn)}
                    </option>
                  ))}
                </select>
                <select
                  value={cur.y}
                  onChange={(e) => setCur((c) => ({ ...c, y: Number(e.target.value) }))}
                  className="font-display rounded-md border border-gold/40 bg-[#f8f1e3] px-2 py-1 text-lg font-semibold text-ink"
                  aria-label="Jaar"
                >
                  {Array.from({ length: 12 }, (_, i) => vandaag.getUTCFullYear() - 2 + i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={volgende} className="order-3 inline-flex items-center gap-1 sm:order-4 rounded-full border border-gold/40 bg-[#f8f1e3] px-3 py-1.5 text-sm font-bold text-ink hover:border-gold" aria-label="Volgende maand">
                <span className="hidden sm:inline">{MAANDEN_KORT[cur.m % 12]}</span> <ChevronRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={naarVandaag} className="order-4 w-full rounded-full bg-gold px-3 py-1.5 text-xs font-bold tracking-wider text-bark uppercase hover:bg-gold-light sm:order-3 sm:w-auto">
                Vandaag
              </button>
            </div>

            {/* Weekdagen */}
            <div className="grid grid-cols-7 border-b border-gold/25 bg-[#f3e9d2] text-center text-[10px] font-bold tracking-widest text-gold-deep uppercase sm:text-[11px]">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <div key={d} className={`py-2 ${d === 0 ? 'text-wine' : ''}`}>
                  {WEEKDAGEN_KORT[d]}
                </div>
              ))}
            </div>

            {/* Cellen */}
            <div className="grid grid-cols-7" {...veegMaand}>
              {cellen.map((c) => {
                const buiten = c.maand !== cur.m;
                const n = NIVEAUS[c.vasten.niveau];
                const feest = c.feesten[0];
                const heilige = HEILIGEN[c.kerkKey]?.[0];
                const isPascha = feest?.soort === 'pascha';
                const groot = feest && feest.groot;
                const beweeglijk = feest && feest.soort === 'beweeglijk' && !groot && !isPascha;
                const isGeselecteerd = c.ymd === geselecteerd.ymd;
                // Zelfde kleur voor rand én gloed: altijd de liturgische kleur van die dag, ook wanneer hij geselecteerd is.
                const ringHex = LITURGISCHE_KLEUREN[liturgischeKleur(c)].hex;
                return (
                  <button
                    key={c.ymd}
                    type="button"
                    onClick={() => {
                      setGeselecteerdeYmd(c.ymd);
                      // Op een smal scherm staat het detailpaneel onder de kalender (buiten beeld): dan een pop-up tonen.
                      if (window.matchMedia('(max-width: 1023px)').matches) openDag(c.ymd);
                    }}
                    className={`relative min-h-[56px] border-r border-b border-gold/20 p-1 text-left align-top transition [&:nth-child(7n)]:border-r-0 sm:min-h-[112px] sm:p-2 ${
                      isGeselecteerd
                        ? 'bg-[#4d1716] text-gold-light ring-2 ring-inset'
                        : `kalender-dag ${buiten ? 'kalender-dag--buiten text-ink-mute' : ''} ${c.isVandaag ? 'ring-[3px] ring-inset' : 'ring-1 ring-inset'}`
                    }`}
                    style={{ '--tw-ring-color': ringHex, '--dag-kleur': ringHex } as CSSProperties}
                    title="Open dagdetail"
                  >
                    <div className="flex items-start justify-center gap-1 sm:justify-between">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-bold sm:h-7 sm:w-7 ${
                          c.isVandaag ? 'today-glow text-cream' : c.isZondag && !buiten ? 'text-wine' : ''
                        }`}
                        style={c.isVandaag ? ({ background: ringHex, '--glow-color': ringHex } as CSSProperties) : undefined}
                      >
                        {c.dag}
                      </span>
                      {mode === 'oud' && <span className="hidden text-[10px] text-ink-mute sm:block">{c.kerk.getUTCDate()} {MAANDEN_KORT[c.kerk.getUTCMonth()]}</span>}
                    </div>
                    {feest && <div className={`mt-0.5 h-3 text-center text-[11px] leading-none sm:hidden ${isPascha || groot ? 'text-wine' : 'text-gold-deep'}`} aria-hidden="true">{isPascha ? '☦' : groot ? '✠' : '•'}</div>}
                    <div className="mt-1 hidden space-y-0.5 sm:block">
                      {feest ? (
                        <div className={`line-clamp-2 text-[10px] leading-tight font-bold sm:text-[11px] ${isPascha ? 'text-wine' : groot ? 'text-wine' : 'text-ink'}`}>
                          {isPascha && <span className="mr-0.5 text-gold-deep">☦</span>}
                          {!isPascha && groot && <span className="mr-0.5 text-gold-deep">✠</span>}
                          {!isPascha && !groot && beweeglijk && <span className="mr-0.5 text-gold-deep">•</span>}
                          {feest.kort ?? feest.naam}
                        </div>
                      ) : heilige ? (
                        <div className="line-clamp-2 text-[10px] leading-tight text-ink-soft sm:text-[11px]">{heilige.naam}</div>
                      ) : null}
                    </div>
                    <div className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-1 sm:inset-x-2 sm:bottom-2">
                      <span className="h-1.5 flex-1 rounded-full" style={{ background: c.vasten.niveau === 'geen' ? 'transparent' : n.kleur, opacity: buiten ? 0.35 : 1 }} />
                      <span className="hidden text-[9px] font-bold tracking-wider uppercase sm:block" style={{ color: n.tekst, opacity: buiten ? 0.5 : 1 }}>
                        {c.vasten.niveau === 'geen' ? '' : n.kort}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gold/25 bg-[#f3e9d2] px-4 py-3 text-[11px] font-semibold text-ink-soft sm:px-5">
              <span className="text-[10px] font-bold tracking-widest text-gold-deep uppercase">Legenda</span>
              <VastenKleuren />
              <span className="inline-flex items-center gap-1.5">
                <span className="text-gold-deep">✠</span> groot feest
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-gold-deep">☦</span> Pascha
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-gold-deep">•</span> beweeglijk
              </span>
              <span className="basis-full" aria-hidden="true" />
              {Object.entries(LITURGISCHE_KLEUREN).map(([k, l]) => (
                <span key={k} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 border-2" style={{ borderColor: l.hex }} /> {l.uitleg}
                </span>
              ))}
            </div>
            </div>

            <aside className="relative flex flex-col bg-[#f3e9d2]/70 px-5 py-7 text-ink sm:px-7 sm:py-9">
              <p className="text-center text-[11px] font-bold tracking-[0.24em] text-gold-deep uppercase">Details van de geselecteerde dag</p>
              <h2 className="font-display mt-3 text-center text-2xl font-semibold leading-tight text-ink sm:text-3xl">{formatDatum(geselecteerd.civil)}</h2>
              <p className="mt-1 text-center text-sm italic text-ink-soft">{formatDatum(geselecteerd.kerk)} · {mode === 'oud' ? 'Juliaanse kalender' : 'kerkelijke datum'}</p>
              <div className="mt-7 flex flex-1 flex-col">
                <section className="cal-saints flex flex-1 flex-col">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">Heilige(n) van de dag</p>
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

            <div className="border-t border-gold/35 bg-[#f3e9d2]/70 px-5 py-6 sm:px-7">
              <div className="grid gap-3 md:grid-cols-3">
                <section className="flex flex-col border border-gold/30 bg-[#fbf3e3]/75 p-4 shadow-[0_6px_14px_rgba(58,33,16,0.06)]"><p className="text-center text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">Feestdag / gedachtenis</p><p className="mt-2 text-sm leading-relaxed text-ink-soft">{geselecteerd.feesten.map((f) => f.naam).join(' · ') || 'Geen groot feest.'}</p></section>
                <section className="flex flex-col border border-gold/30 bg-[#fbf3e3]/75 p-4 shadow-[0_6px_14px_rgba(58,33,16,0.06)]"><p className="text-center text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">Schriftlezingen</p><p className="mt-2 mb-3 text-sm text-ink-soft">De bestaande lezingen en volledige daginformatie staan in het dagdetail.</p><button type="button" onClick={() => openDag(geselecteerd.ymd)} className="btn-pill mt-auto self-start">Lees de lezingen →</button></section>
                <section className="flex flex-col border border-gold/30 bg-[#fbf3e3]/75 p-4 shadow-[0_6px_14px_rgba(58,33,16,0.06)]"><p className="text-center text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">Vasten</p><p className="mt-2 text-sm leading-relaxed text-ink-soft">{geselecteerd.vasten.label}</p><p className="mt-1 mb-3 text-sm text-ink-soft">{geselecteerd.vasten.detail}</p><a href="#vasten" className="btn-pill mt-auto self-start">Meer over vasten →</a></section>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="orthodox-pattern bg-bark py-12 text-cream sm:py-16">
        <div className="mx-auto w-full max-w-[1500px] px-4 text-center sm:px-8 lg:px-12">
          <p className="text-[11px] font-bold tracking-[0.3em] text-gold-light uppercase">Wandel in de tijd met de heiligen</p>
          <p className="mx-auto mt-4 max-w-2xl font-display text-lg italic leading-relaxed text-[#d9c6a3]">Elke dag is een ontmoeting met Christus door de heiligen, de feesten, de lezingen en de gebeden van de Kerk.</p>
        </div>
      </section>
    </>
  );
}

