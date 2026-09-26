import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../lib/context';
import { formatLang } from '../lib/kalender';
import { popupContent } from '../lib/heiligenPopup';
import { bouwIndex, zoek, type ZoekTreffer } from '../lib/zoeken';
import { vergrendelScroll } from '../lib/scrollLock';
import { useTerugSluit } from '../lib/terug';
import { gaNaar } from '../lib/navigatie';
import { LiturgicalPopup } from './CycleSections';
import type { PopupInhoud } from '../lib/cyclusTeksten';

// Centraal zoekvenster: op desktop een donker paneel onder de kop, op mobiel schermvullend (Bouw 70 in index.css).
// Openen via de zoekknop in de kop, "Zoeken" onder Meer, het vergrootglas op Vandaag (mobiel), of de toets / en Ctrl+K.
export default function Zoeken({ open, onOpen, onClose }: { open: boolean; onOpen: () => void; onClose: () => void }) {
  const { htc, heiligen, vandaag, mode, openDag } = useApp();
  const [invoer, setInvoer] = useState('');
  const [popup, setPopup] = useState<{ content: PopupInhoud; lezen: boolean } | null>(null);
  const invoerRef = useRef<HTMLInputElement | null>(null);
  const lijstRef = useRef<HTMLDivElement | null>(null);

  useTerugSluit(open, onClose);

  const index = useMemo(() => (open ? bouwIndex(htc, heiligen?.ALLE_HEILIGEN ?? []) : null), [open, htc, heiligen]);
  const groepen = useMemo(() => (index ? zoek(invoer, index, vandaag, mode) : []), [index, invoer, vandaag, mode]);

  // Sneltoetsen: "/" (niet tijdens het typen in een veld) en Ctrl/Cmd+K.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const typt = e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]');
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typt && !e.ctrlKey && !e.metaKey && !e.altKey)) {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onOpen]);

  // Open: scroll vastzetten en het veld focussen (select() focust ook); dicht: focus terug naar waar hij vandaan kwam.
  useEffect(() => {
    if (!open) return;
    const terug = document.activeElement as HTMLElement | null;
    const ontgrendel = vergrendelScroll();
    // De vorige zoekterm blijft staan maar is geselecteerd: typen vervangt hem.
    invoerRef.current?.select();
    return () => {
      ontgrendel();
      terug?.focus?.();
    };
  }, [open]);

  const kies = (t: ZoekTreffer) => {
    onClose();
    if (t.soort === 'pagina') gaNaar(t.id);
    else if (t.soort === 'datum') openDag(t.ymd);
    else if (t.soort === 'gebed') setPopup({ lezen: true, content: { title: t.gebed.titel, subtitle: t.gebed.wanneer, highlight: t.gebed.rubriek, paragraphs: t.gebed.tekst.split('\n\n') } });
    else if (t.soort === 'feest') {
      const f = t.feest;
      setPopup({ lezen: false, content: { title: f.naam, subtitle: formatLang(t.datum), highlight: f.troparion, paragraphs: [f.toelichting, ...(f.traditie ? [`Gebruiken: ${f.traditie}`] : [])].filter((p): p is string => Boolean(p)) } });
    } else {
      const c = popupContent(t.heilige);
      if (c) setPopup({ lezen: false, content: c });
    }
  };

  // Pijltjes omhoog/omlaag lopen door het veld en de resultaten; Enter in het veld opent het eerste resultaat.
  // Escape en de terugknop sluiten via de gedeelde pop-upstapel (lib/terug.ts).
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const knoppen = [invoerRef.current, ...(lijstRef.current?.querySelectorAll('button') ?? [])].filter(Boolean) as HTMLElement[];
    const i = knoppen.indexOf(document.activeElement as HTMLElement);
    const volgende = knoppen[Math.min(knoppen.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))];
    if (volgende) {
      e.preventDefault();
      volgende.focus();
    }
  };

  const eerste = groepen[0]?.items[0];
  const zoekterm = invoer.trim();

  return (
    <>
      {open && (
        <div className="zoek-achtergrond" onClick={onClose}>
          <div role="dialog" aria-modal="true" aria-label="Zoeken" className="zoek-paneel" onClick={(e) => e.stopPropagation()} onKeyDown={onKeyDown}>
            <div className="zoek-veld">
              <Search aria-hidden="true" />
              <input
                ref={invoerRef}
                type="search"
                value={invoer}
                onChange={(e) => setInvoer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && eerste) kies(eerste);
                }}
                placeholder="Zoek een gebed, feest, heilige of datum"
                aria-label="Zoeken"
                aria-controls="zoek-resultaten"
                enterKeyHint="search"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" onClick={onClose} className="zoek-sluit" aria-label="Zoeken sluiten">
                <X aria-hidden="true" />
              </button>
            </div>

            <div id="zoek-resultaten" ref={lijstRef} className="zoek-resultaten" aria-live="polite">
              {zoekterm.length < 2 ? (
                <p className="zoek-hint">Bijvoorbeeld: <i>Jezusgebed</i> · <i>Kruisverheffing</i> · <i>Nicolaas</i> · <i>6 augustus</i> · <i>Pascha 2027</i></p>
              ) : groepen.length === 0 ? (
                <p className="zoek-hint">Niets gevonden voor “{zoekterm}”.</p>
              ) : (
                groepen.map((g) => (
                  <section key={g.titel} className="zoek-groep">
                    <h2 className="ot-label ot-label-licht">{g.titel}</h2>
                    <ul>
                      {g.items.map((t, i) => (
                        <li key={`${t.soort}-${t.titel}-${i}`}>
                          <button type="button" onClick={() => kies(t)}>
                            <span className="zoek-titel">{t.titel}</span>
                            <span className="zoek-onder">{t.onder}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      <LiturgicalPopup lezen={popup?.lezen} open={popup !== null} onClose={() => setPopup(null)} content={popup?.content ?? null} />
    </>
  );
}
