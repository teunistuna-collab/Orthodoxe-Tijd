import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react';
import { Bell, BookOpen, CalendarDays, ChevronRight, Clock, Info, Lock, Sun } from 'lucide-react';
import type { Mode } from '../lib/kalender';
import { useApp } from '../lib/context';
import { MAX_LENGTE, STANDAARD_PIJLGEBED, bewaarPijlgebed, useEigenPijlgebed } from '../lib/pijlgebed';
import { useLeesvoorkeur, zetKleur, zetStap, type Kleurweergave } from '../lib/leesvoorkeur';
import { Kop, Laag, Sierlijn } from './MobielLaag';
import { HANDEN } from './symbolen';
import { naamVan, serviceConfig } from '../lib/etmaal';
import { DERTIEN } from '../lib/feesten';
import { AVOND, OCHTEND, ietsAan, toestemming, toon, useHerinneringen, usePushStatus, volgendeMelding, vraagToestemming, zetHerinneringen, type Herinneringen as HerinneringKeuzes, type PushStatus, type Toestemming } from '../lib/herinneringen';
import './etmaal-mobiel.css';
import './instellingen-mobiel.css';

// Instellingen op mobiel (mock-up instellingen): een overzicht en eigen schermen (#instellingen/<onderdeel>) voor het
// pijlgebed, de gebedsuren, de kleurweergave, de tekstgrootte en de Psalter-leesvoorkeuren. Alles gebruikt de bestaande
// opslag: lib/pijlgebed.ts (localStorage "pijlgebed", ook op Vandaag) en lib/leesvoorkeur.ts (tekstgrootte en licht of
// donker voor alle leesweergaven: gebeden, Psalter, Adem, Etmaal) en lib/herinneringen.ts (herinneringen). De kalender: de bestaande keuze uit App.tsx
// (localStorage "orthodoxe-kalender-mode"), dezelfde als op desktop; de berekeningen zelf veranderen niet.

const MAX = MAX_LENGTE;
const BANNER = '/images/ontwerp/instellingen-banner.webp';

/** Vier stappen van de bestaande schaal (LEES_STAPPEN: 0.9, 1, 1.1, 1.2, 1.35, 1.5). */
const GROOTTES = [
  { label: 'Klein', stap: 0, px: 15 },
  { label: 'Normaal', stap: 1, px: 18 },
  { label: 'Groot', stap: 3, px: 22 },
  { label: 'Zeer groot', stap: 5, px: 26 },
];
const SCHAAL = [0.9, 1, 1.1, 1.2, 1.35, 1.5];
// Precies een van de vier keuzes, of geen (een tussenstap gekozen met Aa in een leesweergave)
const groottVan = (stap: number) => GROOTTES.find((g) => g.stap === stap);
const grootteLabel = (stap: number) => groottVan(stap)?.label ?? 'Aangepast';

/** Pijltjestoetsen in een keuzegroep: naar de vorige of volgende keuze, en die meteen kiezen. */
function pijlen(e: KeyboardEvent<HTMLElement>) {
  const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
  if (!d) return;
  const knoppen = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')];
  const i = knoppen.indexOf(document.activeElement as HTMLButtonElement);
  if (i < 0) return;
  e.preventDefault();
  const volgende = knoppen[(i + d + knoppen.length) % knoppen.length];
  volgende.focus();
  volgende.click();
}
// Eén Tab-stop per groep: de gekozen keuze (of de eerste als er niets gekozen is)
const tabVan = (gekozen: boolean, index: number, ietsGekozen: boolean) => (gekozen || (!ietsGekozen && index === 0) ? 0 : -1);
const KLEUREN: Array<{ id: Kleurweergave; label: string; onder: string }> = [
  { id: 'systeem', label: 'Systeem', onder: 'Volgt de donkere modus van je apparaat' },
  { id: 'licht', label: 'Licht', onder: 'Warm perkament' },
  { id: 'donker', label: 'Donker', onder: 'Lichte tekst op een donkere achtergrond, voor de avond' },
];

// Dezelfde twee kalenders en uitleg als de desktopversie (Instellingen.tsx).
const KALENDERS: Array<{ id: Mode; naam: string; uitleg: string }> = [
  { id: 'oud', naam: 'Juliaanse kalender', uitleg: 'Gebruikt in de meeste orthodoxe kerken. Kerstmis valt dan op 7 januari.' },
  { id: 'nieuw', naam: 'Gregoriaanse kalender', uitleg: 'Gebruikt door enkele orthodoxe kerken: de vaste feesten op de nieuwe datum, Pascha blijft juliaans. Kerstmis valt dan op 25 december.' },
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
      <Kop terug="#instellingen" merk slim />
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
  // Na "Standaardgebed herstellen" kun je het vorige gebed even terugzetten
  const [vorige, setVorige] = useState<string | null>(null);
  const klok = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(klok.current), []);
  const bewaard = (eigen || STANDAARD_PIJLGEBED).trim();
  const gewijzigd = tekst.trim() !== bewaard && !(tekst.trim() === '' && bewaard === STANDAARD_PIJLGEBED);
  const opslaan = () => {
    const schoon = tekst.trim();
    bewaarPijlgebed(!schoon || schoon === STANDAARD_PIJLGEBED ? '' : schoon);
    setVorige(null);
    if (!schoon) {
      setTekst(STANDAARD_PIJLGEBED);
      setMelding('Het veld was leeg: het standaardgebed staat weer op Vandaag.');
    } else setMelding('Opgeslagen. Je pijlgebed staat nu op Vandaag.');
  };
  const herstel = () => {
    setVorige(eigen);
    setTekst(STANDAARD_PIJLGEBED);
    bewaarPijlgebed('');
    setMelding('Het standaardgebed is hersteld.');
    window.clearTimeout(klok.current);
    klok.current = window.setTimeout(() => setVorige(null), 10000);
  };
  const ongedaan = () => {
    if (vorige === null) return;
    bewaarPijlgebed(vorige);
    setTekst((vorige || STANDAARD_PIJLGEBED).slice(0, MAX));
    setVorige(null);
    setMelding('Je eigen pijlgebed is teruggezet.');
  };
  const over = MAX - tekst.length;
  return (
    <Scherm titel="Mijn pijlgebed" onder="Een kort gebed voor iedere dag" label="Mijn pijlgebed" beeld="20% 60%">
      <p className="ism-uitleg">Het pijlgebed is een kort gebed dat je gedurende de dag in je hart kunt herhalen. Dit gebed verschijnt ook op de Vandaag-pagina.</p>
      <div className="ism-kaart">
        <label className="ism-veldlabel" htmlFor="ism-pijlgebed">Mijn pijlgebed</label>
        <div className="ism-veld">
          <textarea id="ism-pijlgebed" value={tekst} maxLength={MAX} rows={3} aria-describedby="ism-teller" onChange={(e) => { setTekst(e.target.value); setMelding(''); }} />
        </div>
        {/* De teller onder het veld; voorgelezen pas vlak bij de grens */}
        <p id="ism-teller" className="ism-teller">{tekst.length} / {MAX}{gewijzigd ? ' · nog niet opgeslagen' : ''}</p>
        <p className="sr-only" aria-live="polite">{over <= 10 ? `Nog ${over} ${over === 1 ? 'teken' : 'tekens'}` : ''}</p>
        <p className="ism-klein">Je kunt hier een korte, persoonlijke gebedszin invullen. Deze wordt alleen op jouw apparaat opgeslagen.</p>
        <button type="button" className="ism-opslaan" onClick={opslaan}>Opslaan</button>
        {tekst.trim() !== STANDAARD_PIJLGEBED && (
          <button type="button" className="ism-herstel" onClick={herstel}>
            Standaardgebed herstellen
          </button>
        )}
        <p className="ism-melding" role="status">{melding}</p>
        {vorige !== null && <button type="button" className="ism-herstel" onClick={ongedaan}>Ongedaan maken</button>}
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
      <div className="ism-grootte" role="radiogroup" aria-label="Tekstgrootte" onKeyDown={pijlen}>
        {GROOTTES.map((g, i) => (
          <button key={g.label} type="button" role="radio" aria-checked={g === gekozen} tabIndex={tabVan(g === gekozen, i, !!gekozen)} className={g === gekozen ? 'is-gekozen' : undefined} onClick={() => zetStap(g.stap)}>
            <span className="ism-a" aria-hidden="true" style={{ fontSize: `${g.px}px` }}>A</span>
            <span>{g.label}</span>
          </button>
        ))}
      </div>
      {!gekozen && <p className="ism-klein ism-midden">Nu: een aangepaste grootte, gekozen met Aa in een leesweergave.</p>}
      <p className="ism-klein ism-midden">De tekstgrootte wordt toegepast in de leesweergave van gebeden, de Psalter en andere teksten.</p>
    </Scherm>
  );
}

function Kleur() {
  const { kleur } = useLeesvoorkeur();
  const [melding, setMelding] = useState('');
  return (
    <Scherm titel="Kleurweergave" onder="Licht of donker lezen" label="Kleurweergave" beeld="60% 50%">
      <ul className="ism-lijst ism-keuzes" role="radiogroup" aria-label="Kleurweergave" onKeyDown={pijlen}>
        {KLEUREN.map((k, i) => (
          <li key={k.id}>
            <button type="button" role="radio" aria-checked={kleur === k.id} tabIndex={tabVan(kleur === k.id, i, true)} className={`ism-regel${kleur === k.id ? ' is-gekozen' : ''}`} onClick={() => { zetKleur(k.id); setMelding(`Kleurweergave: ${k.label}.`); }}>
              <span className="ism-tekst"><b>{k.label}</b><span>{k.onder}</span></span>
              <span className="ism-bolletje" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <p className="ism-melding" role="status">{melding}</p>
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
        <Regel href="#instellingen/tekst" symbool={<span className="ism-aa">aA</span>} titel="Tekstgrootte" waarde={grootteLabel(stap)} />
        <Regel href="#psalmen" symbool={<BookOpen strokeWidth={1.4} />} titel="Naar de Psalter" onder="Verder lezen waar je gebleven was" />
      </ul>
    </Scherm>
  );
}

function Kalender() {
  const { mode, setMode } = useApp();
  const [melding, setMelding] = useState('');
  return (
    <Scherm titel="Kalendertraditie" onder="Kies je kerkelijke kalender" label="Kalendertraditie" beeld="70% 50%">
      <ul className="ism-lijst ism-keuzes" role="radiogroup" aria-label="Kalender" onKeyDown={pijlen}>
        {KALENDERS.map((k, i) => (
          <li key={k.id}>
            <button type="button" role="radio" aria-checked={mode === k.id} tabIndex={tabVan(mode === k.id, i, true)} className={`ism-regel${mode === k.id ? ' is-gekozen' : ''}`} onClick={() => { setMode(k.id); setMelding(`Je gebruikt nu de ${k.naam.toLowerCase()}.`); }}>
              <span className="ism-tekst"><b>{k.naam}</b><span>{k.uitleg}</span></span>
              <span className="ism-bolletje" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <p className="ism-melding" role="status">{melding}</p>
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
        <Regel href="#instellingen/herinneringen" symbool={<Bell strokeWidth={1.4} />} titel="Herinneringen" onder="Een melding bij de gebedsuren" />
      </ul>
    </Scherm>
  );
}

// Herinneringen: gebedsuren, vastendagen en feesten (lib/herinneringen.ts). Met de meldingenserver komen ze ook als de app
// gesloten is; anders alleen terwijl de app open is. Wat op dit apparaat geldt, staat er eerlijk bij, net als ontbrekende
// ondersteuning of toestemming en wat de server bewaart.
const VOORAF = [
  { id: 0, label: 'Op het moment zelf' },
  { id: 15, label: '15 minuten vooraf' },
  { id: 30, label: '30 minuten vooraf' },
] as const;
const uurTekst = (u: number) => `${u}.00 uur`;
const VASTEN_MOMENT = [
  { id: 'avond', label: 'De avond ervoor', onder: `Om ${uurTekst(AVOND)}` },
  { id: 'ochtend', label: 'De ochtend van de vastendag', onder: `Om ${uurTekst(OCHTEND)}` },
  { id: 'beide', label: 'Beide', onder: `Om ${uurTekst(AVOND)} en om ${uurTekst(OCHTEND)}` },
] as const;
const FEEST_KEUZE = [
  { id: 'alle', label: 'Alle grote feesten', onder: 'Pascha en de twaalf grote feesten' },
  { id: 'eigen', label: 'Zelf kiezen' },
] as const;
const FEEST_MOMENT = [
  { id: 'ervoor', label: 'De dag ervoor', onder: `Om ${uurTekst(AVOND)}` },
  { id: 'dag', label: 'Op de feestdag', onder: `Om ${uurTekst(OCHTEND)}` },
] as const;
const feestNaam = (naam: string) => naam.split(' — ')[0];

function Schakel({ titel, onder, aan, uit, onWissel }: { titel: string; onder?: string; aan: boolean; uit?: boolean; onWissel: () => void }) {
  return (
    <li>
      <button type="button" role="switch" aria-checked={aan} disabled={uit} className="ism-regel" onClick={onWissel}>
        <span className="ism-tekst"><b>{titel}</b>{onder && <span>{onder}</span>}</span>
        <span className="ism-schakel" aria-hidden="true" />
      </button>
    </li>
  );
}

function Keuzes<T extends string | number>({ label, keuzes, waarde, uit, onKies }: { label: string; keuzes: ReadonlyArray<{ id: T; label: string; onder?: string }>; waarde: T; uit?: boolean; onKies: (id: T) => void }) {
  return (
    <ul className="ism-lijst ism-keuzes" role="radiogroup" aria-label={label} onKeyDown={pijlen}>
      {keuzes.map((k, i) => (
        <li key={k.id}>
          <button type="button" role="radio" aria-checked={waarde === k.id} tabIndex={tabVan(waarde === k.id, i, keuzes.some((x) => x.id === waarde))} disabled={uit} className={`ism-regel${waarde === k.id ? ' is-gekozen' : ''}`} onClick={() => onKies(k.id)}>
            <span className="ism-tekst"><b>{k.label}</b>{k.onder && <span>{k.onder}</span>}</span>
            <span className="ism-bolletje" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

const BEZORGING: Record<PushStatus, string> = {
  aan: 'Herinneringen komen ook als Orthodoxe Tijd gesloten is. Daarvoor bewaart de meldingenserver je keuzes, je kalender, je tijdzone en het meldingsadres van je browser, geen naam of e-mailadres. Zet je alles uit, dan wordt dat daar verwijderd.',
  uit: 'Zet je een herinnering aan, dan meldt Orthodoxe Tijd zich aan bij de meldingenserver, zodat herinneringen ook komen als de app gesloten is.',
  fout: 'De meldingenserver is nu niet bereikbaar. Herinneringen komen daarom alleen terwijl Orthodoxe Tijd geopend is; de app probeert het opnieuw als je hem weer opent.',
  'niet-ondersteund': 'Deze browser kan geen meldingen ontvangen als de app gesloten is. Herinneringen komen alleen terwijl Orthodoxe Tijd geopend is.',
  'geen-server': 'Herinneringen verschijnen alleen terwijl Orthodoxe Tijd geopend is op dit apparaat. Is de app gesloten, of legt je telefoon hem op de achtergrond stil, dan komt er geen melding. Meldingen bij een gesloten app vragen een server; die is er nog niet.',
};

const STATUS: Partial<Record<Toestemming, { titel: string; tekst: string }>> = {
  'niet-ondersteund': {
    titel: 'Meldingen niet beschikbaar',
    tekst: 'Deze browser kan geen meldingen tonen. Op een iPhone of iPad werkt dit alleen als je Orthodoxe Tijd eerst via Deel → Zet op beginscherm installeert (iOS 16.4 of nieuwer) en de app daarna vanaf het beginscherm opent.',
  },
  denied: {
    titel: 'Meldingen zijn geblokkeerd',
    tekst: 'Je hebt meldingen voor Orthodoxe Tijd niet toegestaan. Sta ze toe in de instellingen van je browser of telefoon; daarna kun je hier herinneringen kiezen.',
  },
};

function HerinneringScherm() {
  const h = useHerinneringen();
  const { mode } = useApp();
  const pushStatus = usePushStatus();
  const [status, setStatus] = useState(toestemming);
  const [melding, setMelding] = useState('');
  // Kom je terug uit de instellingen van je telefoon of browser, dan opnieuw kijken of meldingen nu mogen
  useEffect(() => {
    const kijk = () => document.visibilityState === 'visible' && setStatus(toestemming());
    document.addEventListener('visibilitychange', kijk);
    window.addEventListener('focus', kijk);
    return () => {
      document.removeEventListener('visibilitychange', kijk);
      window.removeEventListener('focus', kijk);
    };
  }, []);
  const controleer = () => {
    const t = toestemming();
    setStatus(t);
    setMelding(STATUS[t] ? 'Meldingen zijn nog niet toegestaan.' : 'Meldingen zijn toegestaan; je kunt nu herinneringen kiezen.');
  };
  const fout = STATUS[status];
  const uit = Boolean(fout);
  // Toestemming pas vragen als je zelf iets aanzet.
  const zet = async (w: Partial<HerinneringKeuzes>, aanzetten = false) => {
    if (aanzetten && status !== 'granted') {
      const t = await vraagToestemming();
      setStatus(t);
      if (t !== 'granted') return;
    }
    zetHerinneringen(w);
  };
  const wisselUur = (titel: string) => {
    const aan = h.uren.includes(titel);
    void zet({ uren: aan ? h.uren.filter((u) => u !== titel) : [...h.uren, titel] }, !aan);
  };
  const wisselFeest = (id: string) => {
    const aan = h.feestIds.includes(id);
    void zet({ feestIds: aan ? h.feestIds.filter((f) => f !== id) : [...h.feestIds, id] }, !aan);
  };
  const volgende = status === 'granted' && ietsAan(h) ? volgendeMelding(h, mode) : undefined;
  const proef = async () => {
    const t = await vraagToestemming();
    setStatus(t);
    if (t !== 'granted') return;
    await toon({ id: 'proef', titel: 'Orthodoxe Tijd', tekst: 'Zo ziet een herinnering eruit.', url: '#instellingen/herinneringen' }).then(
      () => setMelding('De proefmelding is verstuurd.'),
      () => setMelding('Deze melding kon niet worden getoond.'),
    );
  };
  return (
    <Scherm titel="Herinneringen" onder="Gebedsuren, vastendagen en feesten" label="Herinneringen" beeld="40% 50%">
      {fout && (
        <div className="ism-kaart ism-waarschuwing">
          <p className="ism-veldlabel">{fout.titel}</p>
          <p className="ism-tekstblok">{fout.tekst}</p>
          {status === 'denied' && (
            <details className="ism-hoe">
              <summary>Hoe zet ik dit aan?</summary>
              <ul>
                <li><b>Android (Chrome):</b> tik naast het adres op het symbool voor de site-instellingen, kies Meldingen en zet ze op Toestaan.</li>
                <li><b>iPhone of iPad:</b> open Instellingen › Meldingen › Orthodoxe Tijd en zet Sta meldingen toe aan (alleen als de app op je beginscherm staat).</li>
                <li><b>Computer:</b> klik links van het adres op het symbool voor de site-instellingen en zet Meldingen op Toestaan.</li>
              </ul>
            </details>
          )}
          <button type="button" className="ism-actie" onClick={controleer}>Opnieuw controleren</button>
          <p className="ism-melding" role="status">{melding}</p>
        </div>
      )}
      <div className="ism-kaart ism-let-op">
        <p className="ism-veldlabel">Goed om te weten</p>
        <p className="ism-tekstblok">{BEZORGING[pushStatus]}</p>
        {volgende && <p className="ism-klein">Volgende herinnering: {volgende.titel}, {volgende.tijd.toLocaleString('nl-NL', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}.</p>}
      </div>

      {uit ? (
        <p className="ism-klein ism-midden">Zodra meldingen zijn toegestaan, kies je hier je herinneringen bij de gebedsuren, vastendagen en feesten.</p>
      ) : (
      <>
      <h2 className="ism-label">Gebedsuren</h2>
      <ul className="ism-lijst">
        {serviceConfig.map((s) => (
          <Schakel key={s.title} titel={naamVan(s)} onder={`${s.time.replace(':', '.')} uur`} aan={h.uren.includes(s.title)} uit={uit} onWissel={() => wisselUur(s.title)} />
        ))}
      </ul>
      <p className="ism-veldlabel ism-sublabel">Wanneer</p>
      <Keuzes label="Wanneer bij een gebedsuur" keuzes={VOORAF} waarde={h.vooraf} uit={uit} onKies={(id) => void zet({ vooraf: id })} />

      <h2 className="ism-label">Vastendagen</h2>
      <ul className="ism-lijst">
        <Schakel titel="Herinner mij aan vastendagen" onder="Volgens de vastenkalender van de app" aan={h.vasten} uit={uit} onWissel={() => void zet({ vasten: !h.vasten }, !h.vasten)} />
        {h.vasten && <Schakel titel="Alleen de grote vastenperioden" onder="Grote Vasten, Apostelvasten, Ontslapenisvasten en Kerstvasten" aan={h.alleenGroteVasten} uit={uit} onWissel={() => void zet({ alleenGroteVasten: !h.alleenGroteVasten })} />}
      </ul>
      {h.vasten && (
        <>
          <p className="ism-veldlabel ism-sublabel">Wanneer</p>
          <Keuzes label="Wanneer bij een vastendag" keuzes={VASTEN_MOMENT} waarde={h.vastenMoment} uit={uit} onKies={(id) => void zet({ vastenMoment: id })} />
        </>
      )}

      <h2 className="ism-label">Heilige feesten</h2>
      <ul className="ism-lijst">
        <Schakel titel="Herinner mij aan feesten" onder="Volgens de kerkelijke kalender, ook de beweeglijke feesten" aan={h.feesten} uit={uit} onWissel={() => void zet({ feesten: !h.feesten }, !h.feesten)} />
      </ul>
      {h.feesten && (
        <>
          <p className="ism-veldlabel ism-sublabel">Welke feesten</p>
          <Keuzes label="Welke feesten" keuzes={FEEST_KEUZE} waarde={h.feestKeuze} uit={uit} onKies={(id) => void zet({ feestKeuze: id })} />
          {h.feestKeuze === 'eigen' && (
            <ul className="ism-lijst ism-feestkeuze">
              {DERTIEN.map((f) => (
                <Schakel key={f.id} titel={feestNaam(f.naam)} aan={h.feestIds.includes(f.id)} uit={uit} onWissel={() => wisselFeest(f.id)} />
              ))}
            </ul>
          )}
          <p className="ism-veldlabel ism-sublabel">Wanneer</p>
          <Keuzes label="Wanneer bij een feest" keuzes={FEEST_MOMENT} waarde={h.feestMoment} uit={uit} onKies={(id) => void zet({ feestMoment: id })} />
        </>
      )}
      </>
      )}

      {!uit && (
        <>
          <button type="button" className="ism-herstel" onClick={() => void proef()}>Stuur een proefmelding</button>
          <p className="ism-melding" role="status">{melding}</p>
        </>
      )}
      <p className="ism-klein ism-midden">Je keuzes worden alleen op dit apparaat bewaard. Tijden volgen de klok en tijdzone van je apparaat, ook bij zomer- en wintertijd.</p>
    </Scherm>
  );
}

function Overzicht() {
  const eigen = useEigenPijlgebed();
  const { stap, kleur } = useLeesvoorkeur();
  const { mode } = useApp();
  const h = useHerinneringen();
  const actief = [h.uren.length > 0 && 'Gebedsuren', h.vasten && 'Vastendagen', h.feesten && 'Feesten'].filter(Boolean).join(' · ');
  const geblokkeerd = ['denied', 'niet-ondersteund'].includes(toestemming());
  return (
    <section id="instellingen" className="am ism">
      <div className="em-banner ism-banner">
        <img src={BANNER} alt="" width={1024} height={420} decoding="async" />
        <Kop terug="#meer" merk slim />
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
          {/* Rechtstreeks naar de herinneringen; het scherm Gebedsuren blijft bereikbaar via #instellingen/gebedsuren */}
          <Regel href="#instellingen/herinneringen" symbool={<Bell strokeWidth={1.4} />} titel="Herinneringen" onder={geblokkeerd ? 'Meldingen zijn niet toegestaan' : actief || 'Gebedsuren, vastendagen en feesten'} waarde={geblokkeerd ? 'Geblokkeerd' : actief ? undefined : 'Uit'} />
        </ul>
        <h2 className="ism-label">Weergave</h2>
        <ul className="ism-lijst">
          <Regel href="#instellingen/kleur" symbool={<Sun strokeWidth={1.4} />} titel="Kleurweergave" waarde={KLEUREN.find((k) => k.id === kleur)?.label} />
          <Regel href="#instellingen/tekst" symbool={<span className="ism-aa">aA</span>} titel="Tekstgrootte" waarde={grootteLabel(stap)} />
        </ul>
        <p className="ism-klein">Kleur en tekstgrootte gelden voor alle leesweergaven, ook de Psalter.</p>
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
      {onderdeel === 'herinneringen' && <HerinneringScherm />}
    </>
  );
}
