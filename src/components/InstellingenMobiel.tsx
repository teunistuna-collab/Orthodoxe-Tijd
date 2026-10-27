import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { BookOpen, CalendarDays, ChevronRight, Clock, Info, Lock, Sun } from 'lucide-react';
import type { Mode } from '../lib/kalender';
import { useApp } from '../lib/context';
import { STANDAARD_PIJLGEBED, bewaarPijlgebed, useEigenPijlgebed } from '../lib/pijlgebed';
import { useLeesvoorkeur, zetKleur, zetStap, type Kleurweergave } from '../lib/leesvoorkeur';
import { Kop, Laag, Sierlijn } from './MobielLaag';
import { HANDEN } from './symbolen';
import './etmaal-mobiel.css';
import './instellingen-mobiel.css';

// Instellingen op mobiel (mock-up instellingen): een overzicht en eigen schermen (#instellingen/<onderdeel>) voor het
// pijlgebed, de gebedsuren, de kleurweergave, de tekstgrootte en de Psalter-leesvoorkeuren. Alles gebruikt de bestaande
// opslag: lib/pijlgebed.ts (localStorage "pijlgebed", ook op Vandaag) en lib/leesvoorkeur.ts (tekstgrootte en licht of
// donker voor alle leesweergaven: gebeden, Psalter, Adem, Etmaal). De kalender: de bestaande keuze uit App.tsx
// (localStorage "orthodoxe-kalender-mode"), dezelfde als op desktop; de berekeningen zelf veranderen niet.

const MAX = 150;
const BANNER = '/images/ontwerp/instellingen-banner.webp';

/** Vier stappen van de bestaande schaal (LEES_STAPPEN: 0.9, 1, 1.1, 1.2, 1.35, 1.5). */
const GROOTTES = [
  { label: 'Klein', stap: 0, px: 15 },
  { label: 'Normaal', stap: 1, px: 18 },
  { label: 'Groot', stap: 3, px: 22 },
  { label: 'Zeer groot', stap: 5, px: 26 },
];
const SCHAAL = [0.9, 1, 1.1, 1.2, 1.35, 1.5];
const groottVan = (stap: number) => GROOTTES.reduce((a, b) => (Math.abs(b.stap - stap) < Math.abs(a.stap - stap) ? b : a));
const KLEUREN: Array<{ id: Kleurweergave; label: string; onder: string }> = [
  { id: 'systeem', label: 'Systeem', onder: 'Volgt de donkere modus van je apparaat' },
  { id: 'licht', label: 'Licht', onder: 'Warm perkament' },
  { id: 'donker', label: 'Donker', onder: 'Ivoor op diep bruin, voor de avond' },
];

// Dezelfde twee kalenders en uitleg als de desktopversie (Instellingen.tsx).
const KALENDERS: Array<{ id: Mode; naam: string; uitleg: string }> = [
  { id: 'oud', naam: 'Juliaanse kalender', uitleg: 'Gebruikt in de meeste orthodoxe kerken.' },
  { id: 'nieuw', naam: 'Gregoriaanse kalender', uitleg: 'Gebruikt door enkele orthodoxe kerken: de vaste feesten op de burgerlijke datum, Pascha blijft juliaans.' },
];

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
const useOnderdeel = () => useSyncExternalStore(volgHash, () => decodeURIComponent(window.location.hash).match(/^#instellingen\/(.+)$/)?.[1] ?? '');

function Regel({ href, symbool, titel, onder, waarde, slot }: { href?: string; symbool: ReactNode; titel: string; onder?: string; waarde?: string; slot?: boolean }) {
  const inhoud = (
    <>
      <span className="ism-symbool" aria-hidden="true">{symbool}</span>
      <span className="ism-tekst">
        <b>{titel}</b>
        {onder && <span>{onder}</span>}
      </span>
      {waarde && <span className="ism-waarde">{waarde}</span>}
      {slot ? <Lock className="ism-slot" aria-label="Niet te wijzigen" /> : <ChevronRight className="ism-pijl" aria-hidden="true" />}
    </>
  );
  return <li>{href ? <a className="ism-regel" href={href}>{inhoud}</a> : <div className="ism-regel">{inhoud}</div>}</li>;
}

function Scherm({ titel, onder, label, beeld = '50% 50%', children }: { titel: string; onder: string; label: string; beeld?: string; children: ReactNode }) {
  return (
    <Laag className="em-laag ism-laag" label={label}>
      <Kop terug="#instellingen" merk />
      <div className="ism-beeld" style={{ backgroundPosition: beeld }} aria-hidden="true" />
      <div className="ism-laag-papier">
        <h1 className="ism-titel" tabIndex={-1}>{titel}</h1>
        <p className="ism-onder">{onder}</p>
        <Sierlijn />
        {children}
      </div>
    </Laag>
  );
}

// Mijn pijlgebed: dezelfde opslag als Vandaag; bewaard met Opslaan.
function Pijlgebed() {
  const eigen = useEigenPijlgebed();
  const [tekst, setTekst] = useState((eigen || STANDAARD_PIJLGEBED).slice(0, MAX));
  const [melding, setMelding] = useState('');
  const opslaan = () => {
    const schoon = tekst.trim();
    bewaarPijlgebed(!schoon || schoon === STANDAARD_PIJLGEBED ? '' : schoon);
    if (!schoon) setTekst(STANDAARD_PIJLGEBED);
    setMelding('Opgeslagen. Je pijlgebed staat nu op Vandaag.');
  };
  return (
    <Scherm titel="Mijn pijlgebed" onder="Een kort gebed voor iedere dag" label="Mijn pijlgebed" beeld="20% 60%">
      <p className="ism-uitleg">Het pijlgebed is een kort gebed dat je gedurende de dag in je hart kunt herhalen. Dit gebed verschijnt ook op de Vandaag-pagina.</p>
      <div className="ism-kaart">
        <label className="ism-veldlabel" htmlFor="ism-pijlgebed">Mijn pijlgebed</label>
        <div className="ism-veld">
          <textarea id="ism-pijlgebed" value={tekst} maxLength={MAX} rows={3} onChange={(e) => { setTekst(e.target.value); setMelding(''); }} />
          <span className="ism-teller" aria-live="polite">{tekst.length} / {MAX}</span>
        </div>
        <p className="ism-klein">Je kunt hier een korte, persoonlijke gebedszin invullen. Deze wordt alleen op jouw apparaat opgeslagen.</p>
        <button type="button" className="ism-opslaan" onClick={opslaan}>Opslaan</button>
        {tekst.trim() !== STANDAARD_PIJLGEBED && (
          <button type="button" className="ism-herstel" onClick={() => { setTekst(STANDAARD_PIJLGEBED); bewaarPijlgebed(''); setMelding('Het standaardgebed is hersteld.'); }}>
            Standaardgebed herstellen
          </button>
        )}
        <p className="ism-melding" role="status">{melding}</p>
      </div>
    </Scherm>
  );
}

function Tekstgrootte() {
  const { stap } = useLeesvoorkeur();
  const gekozen = groottVan(stap);
  return (
    <Scherm titel="Tekstgrootte" onder="Pas de tekstgrootte aan naar wat voor jou prettig is" label="Tekstgrootte" beeld="10% 40%">
      <div className="ism-kaart ism-voorbeeld">
        <p className="ism-veldlabel">Voorbeeldtekst</p>
        <p className="ism-voorbeeld-tekst" style={{ fontSize: `${18 * SCHAAL[stap]}px` }}>Heer Jezus Christus, Zoon van God, ontferm U over mij, een zondaar.</p>
        <p className="ism-voorbeeld-noot" style={{ fontSize: `${15 * SCHAAL[stap]}px` }}>Dit is een voorbeeld van de leesweergave.</p>
      </div>
      <div className="ism-grootte" role="radiogroup" aria-label="Tekstgrootte">
        {GROOTTES.map((g) => (
          <button key={g.label} type="button" role="radio" aria-checked={g === gekozen} className={g === gekozen ? 'is-gekozen' : undefined} onClick={() => zetStap(g.stap)}>
            <span className="ism-a" style={{ fontSize: `${g.px}px` }}>A</span>
            <span>{g.label}</span>
          </button>
        ))}
      </div>
      <p className="ism-klein ism-midden">De tekstgrootte wordt toegepast in de leesweergave van gebeden, de Psalter en andere teksten.</p>
    </Scherm>
  );
}

function Kleur() {
  const { kleur } = useLeesvoorkeur();
  return (
    <Scherm titel="Kleurweergave" onder="Licht of donker lezen" label="Kleurweergave" beeld="60% 50%">
      <ul className="ism-lijst ism-keuzes" role="radiogroup" aria-label="Kleurweergave">
        {KLEUREN.map((k) => (
          <li key={k.id}>
            <button type="button" role="radio" aria-checked={kleur === k.id} className={`ism-regel${kleur === k.id ? ' is-gekozen' : ''}`} onClick={() => zetKleur(k.id)}>
              <span className="ism-tekst"><b>{k.label}</b><span>{k.onder}</span></span>
              <span className="ism-bolletje" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <p className="ism-klein ism-midden">Geldt voor de leesweergaven: gebeden, de Psalter, Adem en Etmaal. Ook te wisselen met Aa in een leesweergave.</p>
    </Scherm>
  );
}

function Psalter() {
  const { stap, kleur } = useLeesvoorkeur();
  return (
    <Scherm titel="Psalter leesvoorkeuren" onder="Zo lees je de psalmen" label="Psalter leesvoorkeuren" beeld="30% 50%">
      <p className="ism-uitleg">De Psalter gebruikt dezelfde leesvoorkeuren als de andere leesweergaven. Wat je hier kiest, geldt dus ook voor de gebeden en andere teksten.</p>
      <ul className="ism-lijst">
        <Regel href="#instellingen/kleur" symbool={<Sun strokeWidth={1.4} />} titel="Licht of donker lezen" waarde={KLEUREN.find((k) => k.id === kleur)?.label} />
        <Regel href="#instellingen/tekst" symbool={<span className="ism-aa">aA</span>} titel="Tekstgrootte" waarde={groottVan(stap).label} />
        <Regel href="#psalmen" symbool={<BookOpen strokeWidth={1.4} />} titel="Naar de Psalter" onder="Verder lezen waar je gebleven was" />
      </ul>
    </Scherm>
  );
}

function Kalender() {
  const { mode, setMode } = useApp();
  return (
    <Scherm titel="Kalendertraditie" onder="Kies je kerkelijke kalender" label="Kalendertraditie" beeld="70% 50%">
      <ul className="ism-lijst ism-keuzes" role="radiogroup" aria-label="Kalender">
        {KALENDERS.map((k) => (
          <li key={k.id}>
            <button type="button" role="radio" aria-checked={mode === k.id} className={`ism-regel${mode === k.id ? ' is-gekozen' : ''}`} onClick={() => setMode(k.id)}>
              <span className="ism-tekst"><b>{k.naam}</b><span>{k.uitleg}</span></span>
              <span className="ism-bolletje" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <p className="ism-klein ism-midden">De kalender bepaalt de liturgische datums in de hele app, zoals heiligen, feesten en vasten. Slavische traditie; andere tradities volgen later. Raadpleeg voor de praktijk ter plaatse je eigen parochie.</p>
    </Scherm>
  );
}

function Gebedsuren() {
  return (
    <Scherm titel="Gebedsuren" onder="Weergave en herinneringen" label="Gebedsuren" beeld="80% 40%">
      <p className="ism-uitleg">Het actuele gebedsuur op Vandaag en Bidden volgt de klok van je apparaat: van de Middernacht tot de Completen.</p>
      <ul className="ism-lijst">
        <Regel href="#etmaal" symbool={<Clock strokeWidth={1.4} />} titel="De uren van de dag" onder="Bekijk alle gebedsuren op Etmaal" />
      </ul>
      <p className="ism-klein ism-midden">Herinneringen voor de gebedsuren komen later beschikbaar.</p>
    </Scherm>
  );
}

function Overzicht() {
  const eigen = useEigenPijlgebed();
  const { stap, kleur } = useLeesvoorkeur();
  const { mode } = useApp();
  return (
    <section id="instellingen" className="am ism">
      <div className="em-banner ism-banner">
        <img src={BANNER} alt="" width={1024} height={420} decoding="async" />
        <Kop terug="#meer" merk />
        <div className="em-banner-tekst">
          <h1 className="em-titel">Instellingen</h1>
          <Sierlijn />
          <p className="am-onder">Stem Orthodoxe Tijd af op jouw dagelijks leven</p>
        </div>
      </div>
      <div className="ism-papier">
        <h2 className="ism-label">Gebed en beleving</h2>
        <ul className="ism-lijst">
          <Regel href="#instellingen/pijlgebed" symbool={HANDEN} titel="Mijn pijlgebed" onder={eigen.trim() || STANDAARD_PIJLGEBED} />
          <Regel href="#instellingen/gebedsuren" symbool={<Clock strokeWidth={1.4} />} titel="Gebedsuren" onder="Weergave en herinneringen" />
        </ul>
        <h2 className="ism-label">Weergave</h2>
        <ul className="ism-lijst">
          <Regel href="#instellingen/kleur" symbool={<Sun strokeWidth={1.4} />} titel="Kleurweergave" waarde={KLEUREN.find((k) => k.id === kleur)?.label} />
          <Regel href="#instellingen/tekst" symbool={<span className="ism-aa">aA</span>} titel="Tekstgrootte" waarde={groottVan(stap).label} />
          <Regel href="#instellingen/psalter" symbool={<BookOpen strokeWidth={1.4} />} titel="Psalter leesvoorkeuren" />
        </ul>
        <h2 className="ism-label">Kerkelijke kalender</h2>
        <ul className="ism-lijst">
          <Regel href="#instellingen/kalender" symbool={<CalendarDays strokeWidth={1.4} />} titel="Kalendertraditie" onder={`${mode === 'oud' ? 'Juliaanse kalender' : 'Gregoriaanse kalender'} · Slavische traditie`} />
        </ul>
        <h2 className="ism-label">Overige</h2>
        <ul className="ism-lijst">
          <Regel href="#bronnen" symbool={<Info strokeWidth={1.4} />} titel="Over Orthodoxe Tijd" onder="Bronnen en verantwoording" />
        </ul>
      </div>
    </section>
  );
}

export default function InstellingenMobiel() {
  const onderdeel = useOnderdeel();
  return (
    <>
      <Overzicht />
      {onderdeel === 'pijlgebed' && <Pijlgebed />}
      {onderdeel === 'tekst' && <Tekstgrootte />}
      {onderdeel === 'kleur' && <Kleur />}
      {onderdeel === 'psalter' && <Psalter />}
      {onderdeel === 'gebedsuren' && <Gebedsuren />}
      {onderdeel === 'kalender' && <Kalender />}
    </>
  );
}
