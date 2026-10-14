import { useRef, useState } from 'react';
import { CalendarCheck, Smartphone } from 'lucide-react';
import { useApp } from '../lib/context';
import type { Mode } from '../lib/kalender';
import { usePaginaOpen } from '../lib/paginaOpen';
import { MAX_LENGTE, STANDAARD_PIJLGEBED, bewaarPijlgebed, useEigenPijlgebed } from '../lib/pijlgebed';
import NisKop from './NisKop';
import { HANDEN, SIERKRUIS } from './symbolen';
import './Vandaag.css';

// Jouw voorkeuren (#instellingen), volgens het pakket Heiligen en Voorkeuren (referentie.png, scherm 3).
// - Pijlgebed: lib/pijlgebed.ts (localStorage "pijlgebed", ook in andere tabbladen); leeg = het standaardgebed.
// - Kalender: de bestaande kalenderkeuze uit App.tsx (localStorage "orthodoxe-kalender-mode"); de Paschaberekening
//   blijft voor beide kalenders juliaans (lib/kalender.ts).
// - Andere tradities: nog niet beschikbaar.

const KALENDERS: { id: Mode; naam: string; uitleg: string }[] = [
  { id: 'oud', naam: 'Juliaanse kalender', uitleg: 'Gebruikt in de meeste orthodoxe kerken.' },
  { id: 'nieuw', naam: 'Herziene Juliaanse kalender', uitleg: 'Gebruikt door enkele orthodoxe kerken: de vaste feesten op de burgerlijke datum, Pascha blijft juliaans.' },
];

const bewaar = (t: string) => {
  const schoon = t.trim();
  bewaarPijlgebed(schoon === STANDAARD_PIJLGEBED ? '' : schoon);
};

export default function Instellingen() {
  const open = usePaginaOpen('instellingen');
  const { mode, setMode } = useApp();
  const eigen = useEigenPijlgebed();

  // Het veld toont het eigen gebed of anders het standaardgebed. Bewaard wordt kort na het typen en bij het verlaten
  // van het veld; een leeg veld wordt weer het standaardgebed.
  const [tekst, setTekst] = useState(eigen || STANDAARD_PIJLGEBED);
  const [bewaard, setBewaard] = useState(eigen);
  const [typen, setTypen] = useState(false);
  // In een ander tabblad gewijzigd: overnemen, tenzij u hier aan het typen bent.
  if (eigen !== bewaard) {
    setBewaard(eigen);
    if (!typen) setTekst(eigen || STANDAARD_PIJLGEBED);
  }
  // Alleen wat hier getypt wordt bewaren (niet een waarde die uit een ander tabblad binnenkwam: die zou een nieuwere
  // wijziging kunnen overschrijven).
  const wacht = useRef(0);
  const wijzig = (t: string) => {
    setTekst(t);
    window.clearTimeout(wacht.current);
    wacht.current = window.setTimeout(() => bewaar(t), 600);
  };

  return (
    <section id="instellingen" className="vg vg-voorkeuren">
      <NisKop titel="Jouw voorkeuren" open={open} />
      <div className="vg-papier">
        <section className="vg-vk-vak" aria-labelledby="vk-pijlgebed">
          <span className="vg-vk-symbool">{HANDEN}</span>
          <div>
            <h2 id="vk-pijlgebed">Pijlgebed</h2>
            <p>Stel hier je persoonlijke pijlgebed in. Dit gebed verschijnt op verschillende plaatsen in de app.</p>
            <label className="vg-vk-veld">
              <span className="sr-only">Je pijlgebed</span>
              <textarea
                value={tekst}
                maxLength={MAX_LENGTE}
                rows={2}
                onChange={(e) => wijzig(e.target.value)}
                onFocus={() => setTypen(true)}
                onBlur={() => {
                  setTypen(false);
                  window.clearTimeout(wacht.current);
                  if (!tekst.trim()) setTekst(STANDAARD_PIJLGEBED);
                  bewaar(tekst);
                }}
              />
            </label>
            <p className="vg-vk-voet">
              <Smartphone aria-hidden="true" /> Opgeslagen op dit apparaat.
              <span className="vg-vk-teller">{tekst.length}/{MAX_LENGTE}</span>
            </p>
            {tekst.trim() !== STANDAARD_PIJLGEBED && (
              <button type="button" className="vg-link" onClick={() => { setTekst(STANDAARD_PIJLGEBED); bewaar(''); }}>
                Standaardgebed terugzetten
              </button>
            )}
          </div>
        </section>

        <p className="vg-verd-scheiding" aria-hidden="true"><span>✣</span></p>

        <section className="vg-vk-vak" aria-labelledby="vk-kalender">
          <span className="vg-vk-symbool"><CalendarCheck strokeWidth={1.3} aria-hidden="true" /></span>
          <div>
            <h2 id="vk-kalender">Kalender</h2>
            <p>Kies welke kalender je wilt gebruiken voor de liturgische data.</p>
          </div>
        </section>
        <fieldset className="vg-vk-keuzes">
          <legend className="sr-only">Kalender</legend>
          {KALENDERS.map(({ id, naam, uitleg }) => (
            <label key={id} className="vg-vk-keuze">
              <input type="radio" name="kalender" value={id} checked={mode === id} onChange={() => setMode(id)} />
              <span>
                <b>{naam}</b>
                <span>{uitleg}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <p className="vg-vk-noot">De kalender bepaalt de liturgische datums in de hele app, zoals heiligen, feesten en vasten. Raadpleeg voor de praktijk ter plaatse je eigen parochie.</p>

        <p className="vg-verd-scheiding" aria-hidden="true"><span>✣</span></p>

        <section className="vg-vk-vak vg-vk-later" aria-labelledby="vk-tradities">
          <span className="vg-vk-symbool">{SIERKRUIS}</span>
          <div>
            <h2 id="vk-tradities">Andere tradities <span className="vg-vk-binnenkort">Binnenkort</span></h2>
            <p>In de toekomst kun je hier ook voorkeuren voor andere tradities instellen.</p>
          </div>
        </section>
      </div>
    </section>
  );
}
