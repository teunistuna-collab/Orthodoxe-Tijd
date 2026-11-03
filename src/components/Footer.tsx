import Cross from './Cross';

// De bronnen staan op een eigen pagina (#bronnen, zie App.tsx); de footer linkt ernaar.
// Mobiel: de bronnen eerst, elk met een eigen kopje, zonder merkblok en zonder de losse link naar Instellingen (die
// staat in Meer). Desktop blijft zoals hij was.

type Bron = { kop: string; tekst: string; desktop: string };
const BRONNEN: Bron[] = [
  {
    kop: 'Heiligen en feestteksten',
    tekst: 'Het Heiligenjaar, teksten samengesteld door archimandriet Adriaan (eeuwige gedachtenis), overgenomen met toestemming van het klooster St. Jan de Voorloper in Den Haag.',
    desktop: 'Heiligen en feestteksten: het Heiligenjaar, teksten samengesteld door archimandriet Adriaan (eeuwige gedachtenis), overgenomen met toestemming van het klooster St. Jan de Voorloper in Den Haag.',
  },
  { kop: 'Leesrooster', tekst: '(Juliaanse kalender, 2026 t/m 2035).', desktop: 'Leesrooster: holytrinityorthodox.com (Juliaanse kalender, 2026 t/m 2035).' },
  { kop: 'Pascha', tekst: 'Volgens de Alexandrijnse paasregel (Nicea 325) op de Juliaanse kalender.', desktop: 'Pascha volgens de Alexandrijnse paasregel (Nicea 325) op de Juliaanse kalender.' },
  { kop: 'Vasten', tekst: 'Naar het Typikon van Sabbas in zijn gangbare parochiële toepassing.', desktop: 'Vastenregels naar het Typikon van Sabbas in zijn gangbare parochiële toepassing.' },
  { kop: 'Gebeden', tekst: 'Troparia en gebeden in eigen Nederlandse weergave.', desktop: 'Troparia en gebeden in eigen Nederlandse weergave.' },
];

export function FooterInhoud() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-6 pb-14 sm:px-6 md:grid-cols-3 md:pt-14">
      <div className="hidden md:block">
        <div className="flex items-center gap-3 text-gold">
          <Cross className="h-9 w-6" title="" />
          <span className="font-display text-2xl font-semibold text-gold-light">Orthodoxe Tijd</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed">
          Een Nederlandstalige gids door de Orthodoxe tijd: gebed door de dag, de week en het kerkelijk jaar, heiligen, Schriftlezingen, Pascha, feesten en vasten — voor thuis, onderweg en in de kerk.
        </p>
      </div>
      <div>
        <h2 className="text-sm font-bold tracking-widest text-gold-light uppercase">Een woord vooraf</h2>
        <p className="mt-3 text-sm leading-relaxed">
          De kalender is een leidsman, geen wetboek. Zieken, zwangeren, kinderen, ouderen en reizigers vasten altijd in overleg met hun priester —
          barmhartigheid gaat boven de letter. In de kerkdienst geldt steeds het rooster van je eigen parochie.
        </p>
        <p className="font-display mt-4 text-lg text-gold-light italic">„Bidt zonder ophouden.” — 1 Tess. 5:17</p>
      </div>
      <div className="order-first md:order-none">
        <h2 className="sr-only text-sm font-bold tracking-widest text-gold-light uppercase md:not-sr-only">Bronnen & verwijzingen</h2>
        <ul className="mt-3 hidden space-y-2 text-sm md:block">
          {BRONNEN.map((b) => <li key={b.kop}>{b.desktop}</li>)}
        </ul>
        <dl className="bronnen-lijst md:hidden">
          {BRONNEN.map((b) => (
            <div key={b.kop}>
              <dt>{b.kop}</dt>
              <dd>
                {b.kop === 'Leesrooster' && (
                  <>
                    <a href="https://www.holytrinityorthodox.com/" target="_blank" rel="noopener noreferrer">
                      holytrinityorthodox.com<span className="sr-only"> (opent in een nieuw venster)</span>
                    </a>{' '}
                  </>
                )}
                {b.tekst}
              </dd>
            </div>
          ))}
        </dl>
        {/* Op mobiel staat Instellingen in Meer; op desktop blijft het keuzemenu hier bereikbaar. */}
        <a href="#instellingen" className="mt-4 hidden min-h-11 items-center text-sm font-semibold text-gold-light underline underline-offset-2 hover:text-cream md:inline-flex">
          Kalender en traditie kiezen
        </a>
      </div>
    </div>
  );
}
