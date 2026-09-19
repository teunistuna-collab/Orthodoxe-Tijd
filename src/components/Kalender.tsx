import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { useApp } from '../lib/context';
import { MAANDEN, MAANDEN_KORT, WEEKDAGEN_KORT, formatDatum, hoofdletter, maandRooster } from '../lib/kalender';
import { HEILIGEN } from '../lib/heiligen';
import { LADDER, NIVEAUS } from '../lib/vasten';

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

const KERKELIJKE_TIJD = [
  {
    title: 'Juliaanse kalender',
    text: 'Deze kalender volgt de Juliaanse (oude) kalender: vaste feesten vallen dertien dagen later dan op de burgerlijke kalender. Bovenaan kunt u wisselen tussen de oude en de nieuwe kalender.',
  },
  {
    title: 'Vaste jaarcyclus',
    text: 'Het kerkelijk jaar begint op 1 september en kent voor iedere dag vaste feesten en heiligen, gedragen door het Menaion.',
    href: '#jaar',
    label: 'Meer over de jaarcyclus',
  },
  {
    title: 'Paschale cyclus',
    text: 'Pascha is het Feest der feesten en bepaalt de beweeglijke perioden: de voorbereiding, de Grote Vasten, de Heilige Week, Hemelvaart en Pinksteren.',
    href: '#pascha',
    label: 'Meer over Pascha',
  },
  {
    title: 'Weekcyclus',
    text: 'Iedere week begint met de Dag des Heren, de zondag, en kent voor elke dag van de week een eigen liturgisch karakter.',
    href: '#week',
    label: 'Meer over de weekcyclus',
  },
  {
    title: 'Vasten en feesten',
    text: 'Vasten en feesten wisselen elkaar af door het jaar heen; de kalender toont per dag welk vastenvoorschrift geldt.',
    href: '#vasten',
    label: 'Meer over vasten',
  },
];

export default function Kalender() {
  const { mode, setMode, vandaag, vandaagYmd, openDag } = useApp();
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
  const naarVandaag = () => setCur({ y: vandaag.getUTCFullYear(), m: vandaag.getUTCMonth() + 1 });

  return (
    <>
      <section id="kalender" className="bg-bark">
        <img src="/images/heroes/hero-kalender.png" alt="Kalender — het kerkelijk jaar in overzicht" className="block h-auto w-full" />
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

          {/* Uitleg oude/nieuwe kalender */}
          <div className="mb-8 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
            <button
              type="button"
              onClick={() => setMode('oud')}
              className={`rounded-xl border p-4 text-left transition ${mode === 'oud' ? 'border-gold bg-gold-pale/70' : 'border-gold/25 bg-[#f8f1e3] hover:border-gold/60'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.22em] text-gold-deep uppercase">Oude kalender · juliaans</span>
                {mode === 'oud' && <span className="rounded-sm bg-gold px-1.5 py-0.5 text-[9px] font-bold text-bark uppercase">actief</span>}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                De vaste feesten vallen dertien dagen later dan op de burgerlijke kalender: Kerstmis op 7 januari, Theofanie op 19 januari. Gevolgd door de Russische, Servische, Georgische parochies en de Athos.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode('nieuw')}
              className={`rounded-xl border p-4 text-left transition ${mode === 'nieuw' ? 'border-gold bg-gold-pale/70' : 'border-gold/25 bg-[#f8f1e3] hover:border-gold/60'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.22em] text-gold-deep uppercase">Nieuwe kalender · gereviseerd juliaans</span>
                {mode === 'nieuw' && <span className="rounded-sm bg-gold px-1.5 py-0.5 text-[9px] font-bold text-bark uppercase">actief</span>}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                De vaste feesten vallen op de burgerlijke datum: Kerstmis op 25 december. Gevolgd door de Griekse, Roemeense, Bulgaarse en Antiocheense parochies. Pascha wordt in beide gevallen volgens de Juliaanse paasregel berekend.
              </p>
            </button>
            <div className="flex items-center justify-center rounded-xl bg-bark p-4 text-center text-cream lg:w-44">
              <div>
                <Repeat className="mx-auto h-5 w-5 text-gold" />
                <p className="mt-2 text-xs leading-snug text-[#d9cbb0]">Wissel bovenaan of hier tussen de twee kalenders. Pascha blijft gelijk.</p>
              </div>
            </div>
          </div>

          <div className="parchment-pattern relative overflow-hidden rounded-lg border border-gold/45 bg-[#f8f1e3] shadow-[0_30px_70px_rgba(40,22,14,0.16)] lg:grid lg:grid-cols-[3fr_2fr]">
            <CornerOrnament className="absolute top-4 left-4 h-12 w-12 text-gold-deep/25" />
            <CornerOrnament className="absolute top-4 right-4 h-12 w-12 -scale-x-100 text-gold-deep/25" />
            <div className="relative min-w-0 border-b border-gold/35 lg:border-b-0 lg:border-r">
            {/* Werkbalk */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gold/30 bg-[#f3e9d2] px-3 py-3 sm:flex-nowrap sm:justify-between sm:gap-3 sm:px-5">
              <button type="button" onClick={vorige} className="order-1 inline-flex items-center gap-1 rounded-full border border-gold/40 bg-[#f8f1e3] px-3 py-1.5 text-sm font-bold text-ink hover:border-gold" aria-label="Vorige maand">
                <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">{MAANDEN_KORT[(cur.m + 10) % 12]}</span>
              </button>
              <div className="order-2 flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
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
            <div className="grid grid-cols-7">
              {cellen.map((c) => {
                const buiten = c.maand !== cur.m;
                const n = NIVEAUS[c.vasten.niveau];
                const feest = c.feesten[0];
                const heilige = HEILIGEN[c.kerkKey]?.[0];
                const isPascha = feest?.soort === 'pascha';
                const groot = feest && feest.groot;
                const beweeglijk = feest && feest.soort === 'beweeglijk' && !groot && !isPascha;
                return (
                  <button
                    key={c.ymd}
                    type="button"
                    onClick={() => setGeselecteerdeYmd(c.ymd)}
                    className={`relative min-h-[56px] border-r border-b border-gold/20 p-1 text-left align-top transition [&:nth-child(7n)]:border-r-0 sm:min-h-[112px] sm:p-2 ${
                      buiten ? 'bg-[#f3e9d2]/50 text-ink-mute' : 'bg-[#fbf6e8] hover:bg-gold-pale/60'
                    } ${c.ymd === geselecteerd.ymd ? 'bg-[#4d1716] text-gold-light ring-2 ring-gold ring-inset' : c.isVandaag ? 'ring-2 ring-gold ring-inset' : ''}`}
                    title="Open dagdetail"
                  >
                    <div className="flex items-start justify-center gap-1 sm:justify-between">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-bold sm:h-7 sm:w-7 ${
                          c.isVandaag ? 'today-glow bg-gold text-bark' : c.isZondag && !buiten ? 'text-wine' : ''
                        }`}
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
              {LADDER.filter((l) => l.id !== 'geen').map((l) => (
                <span key={l.id} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.kleur }} /> {l.kort}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5">
                <span className="text-gold-deep">✠</span> groot feest
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-gold-deep">☦</span> Pascha
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-gold-deep">•</span> beweeglijk
              </span>
            </div>
            </div>

            <aside className="relative bg-[#f3e9d2]/70 px-5 py-7 text-ink sm:px-7 sm:py-9">
              <p className="text-center text-[11px] font-bold tracking-[0.24em] text-gold-deep uppercase">Details van de geselecteerde dag</p>
              <h2 className="font-display mt-3 text-center text-2xl font-semibold leading-tight text-ink sm:text-3xl">{formatDatum(geselecteerd.civil)}</h2>
              <p className="mt-1 text-center text-sm italic text-ink-soft">{formatDatum(geselecteerd.kerk)} · {mode === 'oud' ? 'Juliaanse kalender' : 'kerkelijke datum'}</p>
              <div className="mt-7 space-y-3">
                <section className="cal-saints">
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
                  <button type="button" onClick={() => openDag(geselecteerd.ymd)} className="btn-pill mt-5">Lees meer →</button>
                </section>
                <section className="border border-gold/30 bg-[#fbf3e3]/75 p-4 shadow-[0_6px_14px_rgba(58,33,16,0.06)]"><p className="text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">Feestdag / gedachtenis</p><p className="mt-2 text-sm leading-relaxed text-ink-soft">{geselecteerd.feesten.map((f) => f.naam).join(' · ') || 'Geen groot feest.'}</p></section>
                <section className="border border-gold/30 bg-[#fbf3e3]/75 p-4 shadow-[0_6px_14px_rgba(58,33,16,0.06)]"><p className="text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">Schriftlezingen</p><p className="mt-2 text-sm text-ink-soft">De bestaande lezingen en volledige daginformatie staan in het dagdetail.</p><button type="button" onClick={() => openDag(geselecteerd.ymd)} className="btn-pill mt-3">Lees de lezingen →</button></section>
                <section className="border border-gold/30 bg-[#fbf3e3]/75 p-4 shadow-[0_6px_14px_rgba(58,33,16,0.06)]"><p className="text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">Vasten</p><p className="mt-2 font-display text-lg font-semibold">{geselecteerd.vasten.label}</p><p className="mt-1 text-sm text-ink-soft">{geselecteerd.vasten.detail}</p><a href="#vasten" className="btn-pill mt-3">Meer over vasten →</a></section>
              </div>
            </aside>
          </div>

          <div className="calendar-action-grid mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['/images/ui/menu/01-Hoofdmenu-06-Zoek-een-datum.png', 'Zoek een datum', 'Ontdek welke heiligen, feesten en lezingen er op een bepaalde dag zijn.', '#kalender'],
              ['/images/ui/menu/01-Hoofdmenu-07-Bekijk-een-maand.png', 'Bekijk een maand', 'Blader door het kerkelijk jaar.', '#kalender'],
              ['/images/ui/menu/01-Hoofdmenu-08-Vandaag.png', 'Vandaag', 'Ga naar de huidige dag in de kalender.', '#kalender'],
              ['/images/ui/menu/01-Hoofdmenu-09-Feesten.png', 'Feesten', 'Ontdek de grote en kleine feesten van de Kerk.', '#feesten'],
              ['/images/ui/menu/01-Hoofdmenu-10-Heiligen.png', 'Heiligen', 'Bekijk alle heiligen van de Kerk.', '#heiligen'],
            ].map(([icoon, titel, tekst, href]) => (
              <a key={titel} href={href} className="ornate-card calendar-action-card group">
                <span className="ornate-medallion calendar-action-medallion" aria-hidden="true"><img src={icoon} alt="" className="provided-card-icon" /></span>
                <span className="ornate-side-ornaments" aria-hidden="true">❦ <b>✣</b> ❦</span>
                <h3>{titel}</h3>
                <p>{tekst}</p>
                <span className="ornate-action">Open →</span>
              </a>
            ))}
          </div>

          {/* De kerkelijke tijd */}
          <div className="parchment-pattern relative mt-4 overflow-hidden border border-gold/45 bg-[#f7edda] px-6 py-8 shadow-[0_16px_34px_rgba(56,31,14,0.13)] sm:px-10 sm:py-10">
            <CornerOrnament className="absolute bottom-3 right-3 h-16 w-16 -scale-x-100 text-gold-deep/20" />
            <div className="relative text-center">
              <p className="text-[11px] font-bold tracking-[0.3em] text-gold-deep uppercase sm:text-xs">Een heilig jaar</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-ink sm:text-3xl">Alles heeft zijn tijd</h2>
              <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">Het kerkelijk jaar is een weg van herinnering, verwachting en vervulling in Christus. Door de tijd heen leert de Kerk ons Hem te ontmoeten in alle seizoenen van het leven.</p>
              <p className="mt-6 text-[11px] font-bold tracking-[0.3em] text-gold-deep uppercase sm:text-xs">De kerkelijke tijd</p>
              <h3 className="font-display mt-2 text-xl font-semibold text-ink sm:text-2xl">Vijf ritmes van dezelfde tijd</h3>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {KERKELIJKE_TIJD.map((item) => (
                <div key={item.title} className="rounded-xl border border-gold/30 bg-[#f8f1e3] p-4 shadow-[0_10px_24px_rgba(120,80,30,0.08)]">
                  <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.text}</p>
                  {item.href && (
                    <a href={item.href} className="btn-pill mt-3">
                      {item.label} →
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-gold/25 pt-6 text-xs font-bold tracking-wide text-ink-soft uppercase">
              <a href="#vandaag" className="hover:text-gold-deep hover:underline">Vandaag</a>
              <a href="#vasten" className="hover:text-gold-deep hover:underline">Vasten</a>
              <a href="#heiligen" className="hover:text-gold-deep hover:underline">Heiligen</a>
              <a href="#feesten" className="hover:text-gold-deep hover:underline">Feesten</a>
              <a href="#pascha" className="hover:text-gold-deep hover:underline">Pascha</a>
            </div>
          </div>
        </div>
      </section>

      <section className="orthodox-pattern bg-bark py-12 text-cream sm:py-16">
        <div className="mx-auto w-full max-w-[1500px] px-4 text-center sm:px-8 lg:px-12">
          <p className="text-[11px] font-bold tracking-[0.3em] text-gold-light uppercase">Wandel in de tijd met de heiligen</p>
          <p className="mx-auto mt-4 max-w-2xl font-display text-lg italic leading-relaxed text-[#d9c6a3]">Elke dag is een ontmoeting met Christus door de heiligen, de feesten, de lezingen en de gebeden van de Kerk.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3"><a href="#adem" className="btn-pill">Ontdek de cycli →</a><a href="#vandaag" className="btn-pill">Naar vandaag →</a></div>
        </div>
      </section>
    </>
  );
}

