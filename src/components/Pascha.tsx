import { useMemo, useState } from 'react';
import { Flame } from 'lucide-react';

import { useApp } from '../lib/context';
import { PAASCYCLUS } from '../lib/feesten';
import { addDays, daysBetween, formatDatum, formatKort, formatLang, orthodoxPascha, volgendePascha, westersPasen, ymd } from '../lib/kalender';
import { FeestTag } from './ui';
import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';
import { PASCHA_INFO } from '../lib/cyclusTeksten';

type InfoKey = 'wat' | 'cyclus' | 'betekenis' | 'tradities';

// Inhoud rechtstreeks gebaseerd op "De orthodoxe Paschale cyclus.docx".

const INFO_CARDS: Array<{ key: InfoKey; title: string; intro: string; iconSrc: string }> = [
  { key: 'wat', title: 'Wat is Pascha?', intro: 'De Verrijzenis van Christus als het hart van het kerkelijk jaar en van ons leven.', iconSrc: '/images/ui/menu/06-Pascha-01-Wat-is-Pascha.png' },
  { key: 'cyclus', title: 'De Paschale cyclus', intro: 'Van de voorbereidende vasten tot Pinksteren: één beweging van dood naar nieuw leven.', iconSrc: '/images/ui/menu/06-Pascha-02-De-paschale-cyclus.png' },
  { key: 'betekenis', title: 'De betekenis in ons leven', intro: 'Pascha vernieuwt de tijd, onze blik en ons bestaan.', iconSrc: '/images/ui/menu/06-Pascha-04-Gebeden.png' },
  { key: 'tradities', title: 'Tradities en viering', intro: 'De rijke schoonheid van de Paasdiensten en de Orthodoxe tradities.', iconSrc: '/images/ui/menu/06-Pascha-03-Tradities-en-vieringen.png' },
];

const TIMELINE_ITEMS = [
  { id: 'adem', label: 'ADEM', title: 'Christus in iedere\nademhaling', href: '#adem' },
  { id: 'etmaal', label: 'ETMAAL', title: 'Gebed door\ndag en nacht', href: '#etmaal' },
  { id: 'week', label: 'WEEK', title: 'Iedere dag\nzijn gedachtenis', href: '#week' },
  { id: 'pascha', label: 'PASCHA', title: 'De weg van Kruis\nnaar Verrijzenis', href: '#pascha' },
  { id: 'jaar', label: 'JAAR', title: 'Het gehele\nkerkelijke jaar geheiligd', href: '#jaar' },
];

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

// Zeer subtiel botanisch hoekornament ter decoratie van het perkamentpaneel.
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

export default function Pascha() {
  const { vandaag, openDag } = useApp();
  const startJaar = vandaag.getUTCFullYear();
  const [gekozen, setGekozen] = useState(volgendePascha(vandaag).getUTCFullYear());
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);

  const rijen = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const y = startJaar + i;
        const p = orthodoxPascha(y);
        const w = westersPasen(y);
        return { y, p, w, verschil: daysBetween(w, p), schoneMaandag: addDays(p, -48), hemelvaart: addDays(p, 39), pinksteren: addDays(p, 49) };
      }),
    [startJaar],
  );

  const volgende = volgendePascha(vandaag);
  const tot = daysBetween(vandaag, volgende);
  const pGekozen = orthodoxPascha(gekozen);

  return (
    <>
      <section id="pascha" className="bg-bark">
        <img src="/images/heroes/hero-pascha.png" alt="Pascha — de Verrijzenis van Christus" className="block h-auto w-full" />
      </section>

      {/* Informatiekaarten */}
      <section className="orthodox-pattern parchment-pattern bg-parchment py-16 text-ink sm:py-20">
        <div className={CONTENT}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INFO_CARDS.map(({ key, title, intro, iconSrc }) => (
              <button
                key={key}
                type="button"
                onClick={() => setInfoOpen(key)}
                className="ornate-card group flex min-h-[240px] flex-col px-7 py-8 text-left"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold-light">
                  <img src={iconSrc} alt="" className="provided-card-icon" />
                </div>
                <h3 className="font-display mt-6 text-[20px] font-semibold text-gold-light uppercase">{title}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#d9c6a3] sm:text-base">{intro}</p>
                <span className="btn-pill mt-6">
                  Lees meer →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pascha-kalender */}
      <section className="bg-parchment pb-16 sm:pb-20">
        <div className={CONTENT}>
          <div className="parchment-pattern relative overflow-hidden rounded-2xl border border-gold/40 bg-[#f8f1e3] px-6 py-12 shadow-[0_30px_70px_rgba(40,22,14,0.16)] sm:px-10 lg:px-14">
            <CornerOrnament className="absolute top-6 left-6 h-14 w-14 text-gold-deep/30" />
            <CornerOrnament className="absolute top-6 right-6 h-14 w-14 -scale-x-100 text-gold-deep/30" />
            <CornerOrnament className="absolute bottom-6 left-6 h-14 w-14 -scale-y-100 text-gold-deep/30" />
            <CornerOrnament className="absolute right-6 bottom-6 h-14 w-14 -scale-x-100 -scale-y-100 text-gold-deep/30" />

            <div className="grid gap-8 lg:grid-cols-[62fr_38fr]">
              {/* Links: jaarlijkse data */}
              <div>
                <p className="text-[12px] font-bold tracking-[0.32em] text-gold-deep uppercase sm:text-sm">Jaarlijkse data</p>
                <h2 className="font-display mt-1 text-2xl font-semibold text-ink sm:text-3xl">Pascha-data {startJaar} – {startJaar + 9}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
                  Berekend met de orthodoxe paasregel van Nicea (325): de eerste zondag na de eerste volle maan na de
                  lente-evening, gerekend op de Juliaanse kalender en hier weergegeven in burgerlijke data. Pascha valt voor
                  oude en nieuwe kalender op dezelfde dag. Tik een jaar aan voor de volledige Paascyclus.
                </p>

                <div className="thin-scroll mt-6 overflow-hidden overflow-x-auto rounded-xl border border-gold/35">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-bark text-[10px] font-bold tracking-widest text-gold-light uppercase">
                      <tr>
                        <th className="px-4 py-3">Jaar</th>
                        <th className="px-4 py-3">Orthodox Pascha</th>
                        <th className="hidden px-4 py-3 sm:table-cell">Westers Pasen</th>
                        <th className="hidden px-4 py-3 md:table-cell">Schone Maandag</th>
                        <th className="hidden px-4 py-3 md:table-cell">Pinksteren</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rijen.map((r) => {
                        const actief = r.y === gekozen;
                        const voorbij = r.p.getTime() < vandaag.getTime();
                        return (
                          <tr
                            key={r.y}
                            onClick={() => setGekozen(r.y)}
                            className={`cursor-pointer border-b border-gold/20 bg-[#faf3e2] transition ${actief ? 'bg-gold-pale' : 'hover:bg-[#f3e8d0]'} ${voorbij ? 'text-ink-mute' : ''}`}
                          >
                            <td className="font-display px-4 py-3 text-xl font-bold text-wine">{r.y}</td>
                            <td className="px-4 py-3">
                              <button type="button" onClick={(e) => { e.stopPropagation(); openDag(ymd(r.p)); }} className="font-bold text-ink underline-offset-2 hover:underline">
                                {formatDatum(r.p)}
                              </button>
                              {r.y === volgende.getUTCFullYear() && <span className="ml-2 rounded-sm bg-wine px-1.5 py-0.5 text-[10px] font-bold text-gold-light uppercase">volgende</span>}
                            </td>
                            <td className="hidden px-4 py-3 sm:table-cell">
                              {formatKort(r.w)}
                              <span className="ml-1.5 text-[11px] text-ink-mute">{r.verschil === 0 ? '(zelfde dag)' : `(+${r.verschil / 7} wk)`}</span>
                            </td>
                            <td className="hidden px-4 py-3 md:table-cell">{formatKort(r.schoneMaandag)}</td>
                            <td className="hidden px-4 py-3 md:table-cell">{formatKort(r.pinksteren)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Uitleg onder de tabel */}
                <div className="mt-8 grid gap-6 border-t border-gold/25 pt-8 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setInfoOpen('wat')}
                    className="ornate-card pascha-info-card group flex flex-col items-center text-center"
                  >
                    <span className="ornate-medallion">✣</span><span className="ornate-side-ornaments" aria-hidden="true">❦ <b>✣</b> ❦</span><h3>Waarom valt Pascha elk jaar anders?</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      Pascha wordt gevierd op de eerste zondag na de eerste volle maan na de lente-evening. De Orthodoxe Kerk
                      rekent daarbij met de Juliaanse kalender en de kerkelijke maancyclus van het oude Alexandrië — en altijd
                      ná het Joodse Pesach. Daardoor valt het orthodoxe Pascha meestal één tot vijf weken later dan het
                      westerse Pasen, en soms op dezelfde dag.
                    </p>
                    <span className="ornate-action">
                      Lees meer →
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInfoOpen('cyclus')}
                    className="ornate-card pascha-info-card group flex flex-col items-center text-center"
                  >
                    <span className="ornate-medallion">✣</span><span className="ornate-side-ornaments" aria-hidden="true">❦ <b>✣</b> ❦</span><h3>Alles hangt aan één zondag</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      Pascha bepaalt het Triodion, de Grote Vasten, de Heilige Week, Hemelvaart, Pinksteren en de
                      Apostelvasten — en zelfs de toon van de week en de zondagsevangeliën van het hele jaar. Wie de
                      Paasdatum kent, kent het jaar.
                    </p>
                    <span className="ornate-action">
                      Lees meer →
                    </span>
                  </button>
                </div>
              </div>

              {/* Rechts: afteller + paascyclus */}
              <div className="space-y-6">
                <div className="pascha-countdown relative overflow-hidden border border-gold/60 bg-gradient-to-br from-wine via-wine-deep to-bark p-7 text-cream">
                  <div className="orthodox-pattern absolute inset-0 opacity-60" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-gold-light uppercase">
                      <Flame className="h-4 w-4 flame" /> Aftellen tot Pascha {volgende.getUTCFullYear()}
                    </div>
                    <div className="font-display mt-2 text-6xl font-semibold text-[#fbf3df]">{tot === 0 ? '✠' : tot}</div>
                    <div className="text-sm text-[#e6d9bd]">{tot === 0 ? 'Christus is opgestaan!' : `${tot === 1 ? 'dag' : 'dagen'} · ${formatLang(volgende)}`}</div>
                    <p className="font-display mt-4 text-lg leading-snug text-[#fbf3df] italic">
                      „Christus is opgestaan uit de doden, door Zijn dood heeft Hij de dood vertreden, en aan hen in de graven
                      heeft Hij het leven geschonken.”
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gold/35 bg-[#faf3e2] p-5 shadow-[0_14px_30px_rgba(120,80,30,0.12)]">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-2xl font-semibold text-ink">Paascyclus {gekozen}</h3>
                    <span className="text-xs font-bold text-gold-deep">Pascha {formatDatum(pGekozen)}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-mute">Alles wat van de Paasdatum afhangt, in volgorde. Tik een regel aan om de dag te openen.</p>
                  <ol className="thin-scroll mt-4 max-h-[520px] space-y-1 overflow-y-auto pr-1">
                    {PAASCYCLUS.map((f) => {
                      const d = addDays(pGekozen, f.offset ?? 0);
                      const isPascha = f.soort === 'pascha';
                      const voorbij = d.getTime() < vandaag.getTime();
                      return (
                        <li key={f.id}>
                          <button
                            type="button"
                            onClick={() => openDag(ymd(d))}
                            className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-gold-pale ${isPascha ? 'bg-wine text-gold-light hover:bg-wine' : ''} ${voorbij && !isPascha ? 'text-ink-mute' : ''}`}
                          >
                            <span className={`w-14 shrink-0 text-xs font-bold ${isPascha ? 'text-gold-light' : 'text-gold-deep'}`}>{formatKort(d)}</span>
                            <span className={`flex-1 text-sm ${isPascha || f.groot ? 'font-bold' : ''}`}>{f.kort ?? f.naam}</span>
                            {(f.groot || isPascha) && <FeestTag feest={f} />}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meer dan een datum */}
      <CycleTransition
        quote="Christus is opgestaan uit de doden, door Zijn dood heeft Hij de dood vertreden, en aan hen in de graven heeft Hij het leven geschonken."
        citation="Uit de Paasvespers"
        eyebrow="Meer dan een datum"
        text="Pascha is niet eenvoudig één feest tussen andere feesten. In de orthodoxe eredienst is de Verrijzenis van Christus het centrum waarnaar de voorbereiding wijst en vanwaar de vreugde van de daaropvolgende periode uitgaat — het middelpunt van de gehele beweeglijke liturgische cyclus."
        buttonLabel="Ontdek de feesten"
        buttonHref="#feesten"
      />

      <TimeSanctificationTimeline current="pascha" />

      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? PASCHA_INFO[infoOpen] : null} />
    </>
  );
}

