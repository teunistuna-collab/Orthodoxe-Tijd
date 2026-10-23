import Cross from './Cross';

// De bronnen staan op een eigen pagina (#bronnen, zie App.tsx); de footer linkt ernaar.
export function FooterInhoud() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
      <div>
        <div className="flex items-center gap-3 text-gold">
          <Cross className="h-9 w-6" />
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
          barmhartigheid gaat boven de letter. In de kerkdienst geldt steeds het rooster van uw eigen parochie.
        </p>
        <p className="font-display mt-4 text-lg text-gold-light italic">„Bidt zonder ophouden.” — 1 Tess. 5:17</p>
      </div>
      <div>
        <h2 className="text-sm font-bold tracking-widest text-gold-light uppercase">Bronnen & verwijzingen</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>Heiligen en feestteksten: het Heiligenjaar, teksten samengesteld door archimandriet Adriaan (eeuwige gedachtenis), overgenomen met toestemming van het klooster St. Jan de Voorloper in Den Haag.</li>
          <li>Leesrooster: holytrinityorthodox.com (Juliaanse kalender, 2026 t/m 2035).</li>
          <li>Pascha volgens de Alexandrijnse paasregel (Nicea 325) op de Juliaanse kalender.</li>
          <li>Vastenregels naar het Typikon van Sabbas in zijn gangbare parochiële toepassing.</li>
          <li>Troparia en gebeden in eigen Nederlandse weergave.</li>
        </ul>
        {/* Op mobiel is de footer verborgen; hier blijft het keuzemenu bereikbaar (Meer → Bronnen). */}
        <a href="#instellingen" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-gold-light underline underline-offset-2 hover:text-cream">
          Kalender en traditie kiezen
        </a>
      </div>
    </div>
  );
}
