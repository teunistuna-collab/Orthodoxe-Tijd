import { useApp } from '../lib/context';
import type { Mode } from '../lib/kalender';
import PaginaOpening from './PaginaOpening';

// Instellingen: de kalender (oud of nieuw) en, later, de traditie. De gekozen kalender krijgt het rode kader
// (cyclus-nu, zoals "nu" in de cycli). Opmaak: index.css, Bouw 179.

const KALENDERS: { id: Mode; naam: string; uitleg: string }[] = [
  { id: 'oud', naam: 'Oude kalender', uitleg: 'Juliaans: de kerkelijke datums volgen de juliaanse kalender.' },
  { id: 'nieuw', naam: 'Nieuwe kalender', uitleg: 'Gereviseerd juliaans: de vaste feesten op de burgerlijke datum; Pascha blijft juliaans.' },
];

const TRADITIES = ['Koptisch Orthodox', 'Syrisch Orthodox', 'Oosters Orthodox'];

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

export default function Instellingen() {
  const { mode, setMode } = useApp();
  return (
    <>
      <PaginaOpening id="instellingen" label="Persoonlijk" titel="Instellingen" ondertitel="Uw kalender en traditie" />
      <section className="in-pagina bg-parchment text-ink">
        <div className={CONTENT}>
          <section className="in-vak jr-vak" aria-labelledby="in-kalender">
            <h2 id="in-kalender" className="pc-kop">Kalender</h2>
            <div className="in-keuzes" role="radiogroup" aria-labelledby="in-kalender">
              {KALENDERS.map(({ id, naam, uitleg }) => (
                <button key={id} type="button" role="radio" aria-checked={mode === id} className={`in-keuze${mode === id ? ' cyclus-nu' : ''}`} onClick={() => setMode(id)}>
                  <span className="in-keuze-naam">{naam}</span>
                  <span className="in-keuze-uitleg">{uitleg}</span>
                  {mode === id && <span className="cyclus-nu-label">Gekozen</span>}
                </button>
              ))}
            </div>
          </section>

          <section className="in-vak jr-vak" aria-labelledby="in-traditie">
            <h2 id="in-traditie" className="pc-kop">Traditie</h2>
            <p className="in-binnenkort">Binnenkort kiest u hier welke traditie u volgt: {TRADITIES.slice(0, -1).join(', ')} of {TRADITIES[TRADITIES.length - 1]}.</p>
          </section>
        </div>
      </section>
    </>
  );
}
