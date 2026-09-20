import Cross from './Cross';
import { useApp } from '../lib/context';

export default function Footer() {
  const { openKalenderUitleg } = useApp();
  return (
    <footer className="orthodox-pattern bg-bark text-[#d9cbb0]">
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
          <h3 className="text-sm font-bold tracking-widest text-gold-light uppercase">Bronnen & verwijzingen</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Menologion en leesrooster: holytrinityorthodox.com (Juliaanse kalender, jaar 2026).</li>
            <li>Aanvullende heiligenlevens en biografische gegevens: Orthodox Saint Finder (Cloud of Witnesses); verwerkt in eigen Nederlandse samenvattingen waar een betrouwbare koppeling beschikbaar is.</li>
            <li>Pascha volgens de Alexandrijnse paasregel (Nicea 325) op de Juliaanse kalender.</li>
            <li>Vastenregels naar het Typikon van Sabbas in zijn gangbare parochiële toepassing.</li>
            <li>Troparia en gebeden in eigen Nederlandse weergave.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-widest text-gold-light uppercase">Een woord vooraf</h3>
          <p className="mt-3 text-sm leading-relaxed">
            De kalender is een leidsman, geen wetboek. Zieken, zwangeren, kinderen, ouderen en reizigers vasten altijd in overleg met hun priester —
            barmhartigheid gaat boven de letter. In de kerkdienst geldt steeds het rooster van uw eigen parochie.
          </p>
          <p className="font-display mt-4 text-lg text-gold-light italic">„Bidt zonder ophouden.” — 1 Tess. 5:17</p>
        </div>
      </div>
      <div className="border-t border-gold/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-[#9b8b70] sm:flex-row sm:px-6">
          <span>✠ Eer aan God voor alles.</span>
          <button type="button" onClick={openKalenderUitleg} className="inline-flex min-h-11 items-center px-2 font-semibold text-gold-light underline underline-offset-2 hover:text-cream">
            Oud of nieuw? Uitleg over de kalenders
          </button>
          <span>Gebouwd met liefde voor de Nederlandse orthodoxie.</span>
        </div>
      </div>
    </footer>
  );
}
