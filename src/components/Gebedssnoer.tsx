import { useEffect, useState } from 'react';
import Cross from './Cross';

// Gebedssnoer (tsjotki / komboskini): tel het Jezusgebed per knoop. De stand blijft op dit toestel bewaard;
// op Android een zacht trilsignaal bij elke tien en bij een volle ronde. Opmaak: Bouw 80 in index.css.

const LENGTES = [33, 50, 100] as const;
type Lengte = (typeof LENGTES)[number];
type Stand = { lengte: Lengte; aantal: number; ronden: number };
const SLEUTEL = 'gebedssnoer';
const BEGIN: Stand = { lengte: 100, aantal: 0, ronden: 0 };

function lees(): Stand {
  try {
    const s = JSON.parse(localStorage.getItem(SLEUTEL) ?? 'null') as Partial<Stand> | null;
    if (s && LENGTES.includes(s.lengte as Lengte) && Number.isInteger(s.aantal) && Number.isInteger(s.ronden)) {
      const lengte = s.lengte as Lengte;
      return { lengte, aantal: Math.min(Math.max(0, s.aantal!), lengte), ronden: Math.max(0, s.ronden!) };
    }
  } catch {
    /* geen opslag */
  }
  return BEGIN;
}

const tril = (patroon: number | number[]) => navigator.vibrate?.(patroon);

// Ring: knopen verdeeld over 330°, met bovenaan ruimte voor het kruis.
const MIDDEN = 150;
const STRAAL = 118;

export default function Gebedssnoer() {
  const [stand, setStand] = useState<Stand>(lees);
  const [vorige, setVorige] = useState<Stand | null>(null);
  const [melding, setMelding] = useState('');
  const { lengte, aantal, ronden } = stand;
  const vol = aantal === lengte;

  useEffect(() => {
    try {
      localStorage.setItem(SLEUTEL, JSON.stringify(stand));
    } catch {
      /* geen opslag: de stand geldt dan alleen voor dit bezoek */
    }
  }, [stand]);

  // "Opnieuw" is zes seconden te herstellen.
  useEffect(() => {
    if (!vorige) return;
    const t = setTimeout(() => setVorige(null), 6000);
    return () => clearTimeout(t);
  }, [vorige]);

  const tel = () => {
    if (vol) {
      setStand({ lengte, aantal: 1, ronden: ronden + 1 });
      return;
    }
    const nieuw = aantal + 1;
    setStand({ ...stand, aantal: nieuw });
    if (nieuw === lengte) {
      tril([40, 70, 40]);
      setMelding(`Ronde ${ronden + 1} voltooid`);
    } else if (nieuw % 10 === 0) {
      tril(18);
      setMelding(String(nieuw));
    }
  };

  const knoopMaat = lengte === 100 ? 3.3 : lengte === 50 ? 5.4 : 7.2;
  const knopen = Array.from({ length: lengte }, (_, i) => {
    const hoek = ((-75 + (i * 330) / (lengte - 1)) * Math.PI) / 180;
    // Bij 50 en 100 knopen markeert een grotere knoop elke tien.
    const merk = lengte !== 33 && (i + 1) % 10 === 0 && i + 1 < lengte;
    return (
      <circle
        key={i}
        cx={MIDDEN + STRAAL * Math.cos(hoek)}
        cy={MIDDEN + STRAAL * Math.sin(hoek)}
        r={merk ? knoopMaat * 1.45 : knoopMaat}
        className={`snoer-knoop${i < aantal ? ' is-gebeden' : ''}${merk ? ' is-merk' : ''}`}
      />
    );
  });

  return (
    <div className="snoer mx-auto w-full rounded-2xl border border-gold/45 bg-[#f8f1e3] px-5 py-10 shadow-[0_30px_70px_rgba(40,22,14,0.16)] sm:px-12 sm:py-14">
      <h2 className="ot-label text-center">Het gebedssnoer</h2>
      <p className="mx-auto mt-3 max-w-md text-center font-display text-xl italic leading-snug text-ink-soft sm:text-2xl">Heer Jezus Christus, Zoon van God, ontferm U over mij, zondaar.</p>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink-soft">Tik bij elk gebed op het snoer. Je stand blijft op dit toestel bewaard.</p>

      <button type="button" className="snoer-ring" onClick={tel} aria-label={`Gebed tellen: ${aantal} van ${lengte}${ronden ? `, ronde ${ronden + 1}` : ''}`}>
        <svg viewBox="0 0 300 300" aria-hidden="true">
          <circle cx={MIDDEN} cy={MIDDEN} r={STRAAL} className="snoer-draad" />
          {knopen}
        </svg>
        <span className="snoer-kruis" aria-hidden="true">
          <Cross className="h-full w-full" />
        </span>
        <span className="snoer-telling" aria-hidden="true">
          <b>{aantal}</b>
          <small>van {lengte}</small>
          {(ronden > 0 || vol) && <em>{vol ? 'Ronde voltooid' : `Ronde ${ronden + 1}`}</em>}
        </span>
      </button>
      <p className="sr-only" aria-live="polite">
        {melding}
      </p>

      <div className="snoer-bediening">
        <div className="snoer-keuze" role="group" aria-label="Aantal knopen">
          {LENGTES.map((n) => (
            <button key={n} type="button" aria-pressed={lengte === n} onClick={() => setStand({ lengte: n, aantal: Math.min(aantal, n), ronden })}>
              {n}
            </button>
          ))}
        </div>
        <div className="snoer-acties">
          <button type="button" onClick={() => setStand({ ...stand, aantal: aantal - 1 })} disabled={aantal === 0}>
            Eén terug
          </button>
          {vorige ? (
            <button
              type="button"
              onClick={() => {
                setStand(vorige);
                setVorige(null);
              }}
            >
              Herstel
            </button>
          ) : (
            <button
              type="button"
              disabled={aantal === 0 && ronden === 0}
              onClick={() => {
                setVorige(stand);
                setStand({ lengte, aantal: 0, ronden: 0 });
              }}
            >
              Opnieuw
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
