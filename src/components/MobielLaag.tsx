import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { vergrendelScroll } from '../lib/scrollLock';
import type { PopupInhoud } from '../lib/cyclusTeksten';
import DeelKnop from './DeelKnop';
import { huidigAdres, vorigeAdres } from '../lib/vorigAdres';
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

/** Schermvullende weergave (2, 3, 4): over de onderbalk heen, de pagina eronder scrolt niet mee. De focus gaat naar de
 *  titel (een h1 met tabIndex -1), zodat een schermlezer meldt waar je bent; Esc doet hetzelfde als "Terug". */
export function Laag({ className, label, children }: { className: string; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const los = vergrendelScroll();
    // Na het sluiten de focus terug op wat het venster opende (als dat er nog is)
    const opener = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    const titel = ref.current?.querySelector<HTMLElement>('h1[tabindex="-1"]');
    (titel ?? ref.current)?.focus({ preventScroll: true });
    return () => {
      los();
      if (opener?.isConnected) requestAnimationFrame(() => opener.focus({ preventScroll: true }));
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`am-laag ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key !== 'Escape') return;
        e.stopPropagation();
        ref.current?.querySelector<HTMLAnchorElement>('.am-kop .am-terug')?.click();
      }}
    >
      {children}
    </div>
  );
}


/** Kopbalk met "Terug". Met `slim`: kwam je van een ander scherm van dezelfde pagina (bijv. #pascha → #pascha/goede-week),
 *  dan gaat Terug echt een stap terug (ook de terugknop van de telefoon blijft kloppen); anders naar `terug`, zonder een
 *  extra stap in de geschiedenis. */
export function Kop({ terug, licht, merk = licht, rechts, slim }: { terug: string; licht?: boolean; merk?: boolean; rechts?: ReactNode; slim?: boolean }) {
  const opKlik = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!slim || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const pagina = (h: string) => h.split('/')[0];
    const vorigAdres = vorigeAdres();
    const nu = huidigAdres();
    if (vorigAdres && vorigAdres !== nu && (vorigAdres === terug || pagina(vorigAdres) === pagina(nu))) window.history.back();
    else window.location.replace(terug);
  };
  return (
    <div className={`am-kop${licht ? ' is-licht' : ''}`}>
      <a className="am-terug" href={terug} onClick={opKlik}>
        <ChevronLeft aria-hidden="true" /> Terug
      </a>
      {merk ? <span className="am-merk">Orthodoxe Tijd</span> : <span />}
      <span className="am-kop-rechts">{rechts}</span>
    </div>
  );
}


/** Leesweergave op warm perkament (Adem en Etmaal): kopbalk met Terug, tekstgrootte en delen; daaronder het ornament,
 *  de titel, een sierlijn, de inleiding en de tekst. De tekst volgt de leesbediening (lees-vlak / lees-tekst). */
export function LeesWeergave({ titel, ondertitel, onder, boven, terug, deelPad, className = '', slim, children }: { titel: string; ondertitel?: string; onder?: ReactNode; boven?: ReactNode; terug: string; deelPad: string; className?: string; slim?: boolean; children: ReactNode }) {
  const [bediening, setBediening] = useState(false);
  return (
    <Laag className={`am-lees ${className}`} label={titel}>
      <Kop
        terug={terug}
        licht
        slim={slim}
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
