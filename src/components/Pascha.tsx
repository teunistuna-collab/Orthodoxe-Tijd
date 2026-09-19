import { useMemo, useState } from 'react';
import { Flame } from 'lucide-react';

import { useApp } from '../lib/context';
import { PAASCYCLUS } from '../lib/feesten';
import { addDays, daysBetween, formatDatum, formatKort, formatLang, orthodoxPascha, volgendePascha, westersPasen, ymd } from '../lib/kalender';
import { FeestTag } from './ui';
import { CycleTransition, LiturgicalPopup, TimeSanctificationTimeline } from './CycleSections';

type InfoKey = 'wat' | 'cyclus' | 'betekenis' | 'tradities';

type PopupContent = {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  highlight?: string;
};

// Inhoud rechtstreeks gebaseerd op "De orthodoxe Paschale cyclus.docx".
const INFO_POPUPS: Record<InfoKey, PopupContent> = {
  wat: {
    title: 'Wat is Pascha?',
    subtitle: 'Het Feest der Feesten',
    highlight: 'Christus is opgestaan! — Hij is waarlijk opgestaan!',
    paragraphs: [
      'De Paschale cyclus is het beweeglijke deel van het orthodoxe kerkelijk jaar dat zijn ordening ontvangt vanuit de datum van het heilige Pascha, de Verrijzenis van Christus. Omdat de datum van Pascha van jaar tot jaar verschuift, bewegen ook de perioden en gedachtenissen die ermee verbonden zijn mee.',
      'De cyclus omvat niet alleen de Paasnacht zelf. Zij begint reeds in de voorbereiding op de Grote Vasten, voert door de veertigdagentijd en de Grote en Heilige Week, bereikt haar hoogtepunt in Pascha en gaat daarna verder door de veertig dagen tot Hemelvaart en de vijftig dagen tot Pinksteren. De eerste zondag na Pinksteren, Allerheiligen, vormt een belangrijke overgang naar het verdere kerkelijke jaar.',
      'Daarom is Pascha niet eenvoudig één feest tussen andere feesten. In de orthodoxe eredienst is de Verrijzenis van Christus het centrum waarnaar de voorbereiding wijst en vanwaar de vreugde van de daaropvolgende periode uitgaat.',
      'Christus is opgestaan uit de doden, door Zijn dood heeft Hij de dood vertreden, en aan hen in de graven heeft Hij het leven geschonken. Pascha is het Feest der Feesten: de viering van de Verrijzenis van onze Heer Jezus Christus. Het graf is leeg en de dood heeft niet het laatste woord. De paasvreugde is daarom niet alleen de herinnering aan een gebeurtenis, maar de verkondiging van het nieuwe leven dat in Christus is aangebroken.',
      'De Paschanacht vormt het stralende middelpunt van deze cyclus. De Kerk gaat vanuit de duisternis naar het licht en verkondigt de Verrijzenis. De begroeting ‘Christus is opgestaan!’ en het antwoord ‘Hij is waarlijk opgestaan!’ geven stem aan de vreugde van deze periode.',
      'De week die op Pascha volgt heet de Lichte Week. Zij wordt als één grote feestdag beleefd en heeft een bijzonder vreugdevol liturgisch karakter.',
      'Pascha behoort tot de beweeglijke feesten. De kerkelijke berekening van de Paschadatum — het Paschalion — verbindt de viering met de zondag en met de traditionele kerkelijke berekening rond de lente en de maan. Daardoor valt Orthodox Pascha niet ieder jaar op dezelfde burgerlijke datum.',
    ],
  },
  cyclus: {
    title: 'De Paschale cyclus',
    subtitle: 'Van voorbereiding, door Kruis en graf, naar Verrijzenis en Pinksteren',
    paragraphs: [
      'De Kerk gaat niet plotseling de Grote Vasten binnen. De Triodion-periode opent een geleidelijke geestelijke voorbereiding waarin de gelovige wordt geroepen tot verlangen naar Christus, nederigheid, bekering, barmhartigheid en vergeving: de zondag van Zacheüs — het verlangen om Christus te zien; de zondag van de Tollenaar en de Farizeeër — nederigheid in het gebed; de zondag van de Verloren Zoon — terugkeer naar de Vader; de zondag van het Laatste Oordeel (Vleesverlatingszondag) — liefde tot de naaste; en Vergevingszondag (Kaasverlatingszondag) — wederzijdse vergeving en de ingang in de Grote Vasten.',
      'De Grote Vasten is de veertigdaagse voorbereiding op de viering van de Verrijzenis. Gebed, vasten en aalmoezen vormen samen een weg van bekering. De zondagen van de Grote Vasten zijn: de Zondag van de Orthodoxie (herstelling van de heilige iconen), de Heilige Gregorius Palamas, de Verering van het kostbare en levenschenkende Kruis, de Heilige Johannes Climacus en de Heilige Maria van Egypte. In de vastentijd kent de Kerk onder meer de Liturgie van de Voorafgewijde Gaven, het gebed van de heilige Efrem de Syriër en de Grote Canon van de heilige Andreas van Kreta.',
      'Na de veertig dagen van de Grote Vasten voert de Kerk ons naar Lazaruszaterdag: de opwekking van Lazarus verkondigt reeds Christus’ overwinning op de dood. De volgende dag vieren wij Palmzondag, de intocht van de Heer in Jeruzalem. Deze twee dagen vormen de overgang van de vastentijd naar de Grote en Heilige Week.',
      'In de Grote en Heilige Week volgt de Kerk Christus stap voor stap op Zijn weg naar het Kruis en het graf: Grote en Heilige Maandag (waakzaamheid, de Bruidegom komt), Dinsdag (waakzaam en gereed zijn), Woensdag (bekering en de nadering van het verraad), Donderdag (het Mystieke Avondmaal en de instelling van de Eucharistie), Vrijdag (de Kruisiging, dood en graflegging van Christus) en Zaterdag (Christus rust in het graf en daalt af in het rijk van de dood; de stilte draagt reeds de verwachting van de Verrijzenis).',
      'De paasvreugde wordt gedurende veertig dagen gevierd. De zondagen na Pascha belichten telkens een eigen aspect van de ontmoeting met de verrezen Christus: Thomaszondag, de zondag van de Myrrhedraagsters, de zondag van de Verlamde, Midden-Pinksteren, de zondag van de Samaritaanse vrouw, de zondag van de Blindgeborene, en het Afscheid van Pascha — de voltooiing van de veertigdaagse paasviering.',
      'Veertig dagen na Pascha viert de Kerk de Hemelvaart van Christus: de verrezen Heer stijgt op in heerlijkheid — geen afwezigheid, maar de verheerlijking van de menselijke natuur in Hem en de voorbereiding op de gave van de Heilige Geest. Vijftig dagen na Pascha viert de Kerk het heilige Pinksteren: de nederdaling van de Heilige Geest over de apostelen, de vervulling van de Paschale beweging. De maandag na Pinksteren is in de orthodoxe traditie bijzonder gewijd aan de Heilige Geest.',
      'De eerste zondag na Pinksteren is de Zondag van Allerheiligen: de heiligen zijn de vruchten van Pascha en Pinksteren in het leven van de Kerk. Na Allerheiligen begint de Apostelvasten; de begindatum daarvan beweegt mee met Pascha, terwijl het einde aan een vaste kalenderdatum verbonden is — zo ontmoeten de Paschale en de vaste jaarcyclus elkaar.',
      'Vanuit Pascha worden veel beweeglijke onderdelen van het kerkelijk jaar geordend: de voorbereidende zondagen, het begin van de Grote Vasten, Lazaruszaterdag, Palmzondag, de Grote en Heilige Week, de Lichte Week, Hemelvaart en Pinksteren. Ook de Apostelvasten wordt hierdoor beïnvloed: het begin hangt samen met Pinksteren en Allerheiligen, terwijl het einde aan de vaste gedachtenis van de heilige apostelen Petrus en Paulus verbonden is.',
      'Het Triodion begeleidt de Kerk door de voorbereidende weken, de Grote Vasten en de Grote en Heilige Week. Met Pascha begint het Pentecostarion, dat de periode van de Verrijzenis tot en met Pinksteren begeleidt. Waar het Triodion ons naar het lege graf voert, ontvouwt het Pentecostarion de vreugde en de vruchten van de Verrijzenis.',
    ],
  },
  betekenis: {
    title: 'De betekenis in ons leven',
    subtitle: 'De geestelijke beweging van de Paschale cyclus',
    paragraphs: [
      'De Paschale cyclus kan worden gezien als één geestelijke beweging: verlangen — Christus willen zien; nederigheid — de eigen afhankelijkheid van Gods barmhartigheid erkennen; bekering — terugkeren naar de Vader; vergeving — vrede zoeken met God en de naaste; vasten en gebed — het hart zuiveren en opnieuw richten; het Kruis — met Christus de weg van zelfgave en liefde gaan; het graf — stilte, verwachting en vertrouwen; Verrijzenis — het nieuwe leven ontvangen; Hemelvaart — de verheerlijking van Christus aanschouwen; Pinksteren — leven en getuigen in de kracht van de Heilige Geest; heiligheid — de vrucht van dit nieuwe leven zichtbaar laten worden.',
      'Zo is Pascha niet slechts het eindpunt van de vasten. De hele cyclus vormt een weg waarop de Kerk telkens opnieuw leert sterven aan wat van God verwijdert en leven vanuit de Verrijzenis van Christus.',
    ],
  },
  tradities: {
    title: 'Tradities en viering',
    subtitle: 'Pascha thuis en in het dagelijks gebedsleven',
    paragraphs: [
      'De Paschale cyclus wordt allereerst in de liturgie van de Kerk beleefd, maar kan ook het dagelijkse gebedsleven thuis vormen. Niet door de volledige liturgische diensten zelfstandig na te bootsen, maar door het ritme van de Kerk bewust mee te leven.',
      'Volg de zondagen en belangrijke dagen van de Paschale cyclus. Lees de aangewezen Schriftlezingen en korte uitleg bij de dag. Laat het vasten samengaan met gebed, vergeving en concrete liefde tot de naaste. Neem waar mogelijk deel aan de diensten van de Grote Vasten, de Grote Week en Pascha. Gebruik de paasgroet en paasgezangen in de periode waarin de Kerk de Verrijzenis viert. Laat de vreugde van Pascha doorwerken naar Hemelvaart, Pinksteren en het gewone leven daarna.',
      'Het doel is niet om zoveel mogelijk kalenderinformatie te kennen, maar om de tijd zelf als een weg met Christus te ontvangen.',
    ],
  },
};

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

      <LiturgicalPopup open={infoOpen !== null} onClose={() => setInfoOpen(null)} content={infoOpen ? INFO_POPUPS[infoOpen] : null} />
    </>
  );
}

