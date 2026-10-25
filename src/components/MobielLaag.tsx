import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { vergrendelScroll } from '../lib/scrollLock';
import type { PopupInhoud } from '../lib/cyclusTeksten';
import DeelKnop from './DeelKnop';
import Leesbediening from './Leesbediening';
import './adem-mobiel.css';

// Gedeelde onderdelen van de mobiele weergaven volgens de mock-ups (Adem, Etmaal): sierlijn, schermvullende laag en
// kopbalk met "Terug". Opmaak: adem-mobiel.css (.am-…).

export function Sierlijn({ licht }: { licht?: boolean }) {
  return (
    <span className={`am-sierlijn${licht ? ' is-licht' : ''}`} aria-hidden="true">
      <span />
      <svg viewBox="0 0 24 24"><path d="M12 4v16M6 12h12" /><path d="m12 4-1.5 2.5h3ZM12 20l-1.5-2.5h3ZM6 12l2.5-1.5v3ZM18 12l-2.5-1.5v3Z" /></svg>
      <span />
    </span>
  );
}

/** Schermvullende weergave (2, 3, 4): over de onderbalk heen, de pagina eronder scrolt niet mee. */
export function Laag({ className, label, children }: { className: string; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const los = vergrendelScroll();
    ref.current?.focus({ preventScroll: true });
    return los;
  }, []);
  return (
    <div ref={ref} className={`am-laag ${className}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
      {children}
    </div>
  );
}

export function Kop({ terug, licht, merk = licht, rechts }: { terug: string; licht?: boolean; merk?: boolean; rechts?: ReactNode }) {
  return (
    <div className={`am-kop${licht ? ' is-licht' : ''}`}>
      <a className="am-terug" href={terug}>
        <ChevronLeft aria-hidden="true" /> Terug
      </a>
      {merk ? <span className="am-merk">Orthodoxe Tijd</span> : <span />}
      <span className="am-kop-rechts">{rechts}</span>
    </div>
  );
}


/** Leesweergave op warm perkament (Adem en Etmaal): kopbalk met Terug, tekstgrootte en delen; daaronder het ornament,
 *  de titel, een sierlijn, de inleiding en de tekst. De tekst volgt de leesbediening (lees-vlak / lees-tekst). */
export function LeesWeergave({ titel, ondertitel, onder, boven, terug, deelPad, className = '', children }: { titel: string; ondertitel?: string; onder?: ReactNode; boven?: ReactNode; terug: string; deelPad: string; className?: string; children: ReactNode }) {
  const [bediening, setBediening] = useState(false);
  return (
    <Laag className={`am-lees ${className}`} label={titel}>
      <Kop
        terug={terug}
        licht
        rechts={
          <>
            <button type="button" className="am-knopje am-aa" aria-expanded={bediening} aria-label="Tekstgrootte en avondweergave" onClick={() => setBediening((b) => !b)}>
              Aa
            </button>
            <DeelKnop titel={titel} pad={deelPad} className="am-knopje" />
          </>
        }
      />
      {bediening && <Leesbediening className="am-lb" />}
      <article className="am-lees-vlak lees-vlak">
        {boven}
        <h1 className="am-lees-titel" tabIndex={-1}>{titel}</h1>
        {ondertitel && <p className="am-lees-ondertitel">{ondertitel}</p>}
        <Sierlijn />
        {onder && <p className="am-lees-onder">{onder}</p>}
        <div className="lees-tekst">{children}</div>
        <Sierlijn />
      </article>
    </Laag>
  );
}

/** De tekst van een verdieping (lib/cyclusTeksten.ts): citaat, alinea's en secties met koppen, lijsten en tabellen. */
export function PopupTekst({ inhoud }: { inhoud: PopupInhoud }) {
  return (
    <>
      {inhoud.highlight && <blockquote className="am-lees-citaat">{inhoud.highlight}</blockquote>}
      {inhoud.paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {inhoud.sections?.map((s, i) => (
        <section key={i}>
          {s.heading && <h2>{s.heading}</h2>}
          {s.paragraphs?.map((p, j) => <p key={j}>{p}</p>)}
          {s.items && (
            <ul>
              {s.items.map((it, j) => <li key={j}>{it}</li>)}
            </ul>
          )}
          {s.after?.map((p, j) => <p key={j}>{p}</p>)}
          {s.note && <p className="am-noot">{s.note}</p>}
          {s.table && (
            <div className="am-tabel-wrap">
              <table className="am-tabel">
                <thead>
                  <tr>{s.table.head.map((k) => <th key={k}>{k}</th>)}</tr>
                </thead>
                <tbody>
                  {s.table.rows.map((r, j) => (
                    <tr key={j}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </>
  );
}
