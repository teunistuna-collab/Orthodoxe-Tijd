import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { snoerHoek } from '../lib/snoerPad';

// Gebedssnoer (tsjotki / komboskini): tel het Jezusgebed per knoop. De stand blijft op dit toestel bewaard.
// Het snoer is het aangeleverde beeld (public/images/adem/gebedssnoer.webp), onveranderd en altijd even groot; 33/50/100
// verandert alleen de telling. Het snoer staat stil; warm licht loopt mee: een gouden gloed achter de gebeden knopen en een
// lichte warme zweem erop, de huidige knoop iets sterker (in de vorm van het snoer zelf, hoeken uit lib/snoerPad.ts).
// Het getal wisselt rustig, met een korte zachte trilling waar het toestel dat kan. Ook te tellen door met vinger of muis
// langs het snoer te gaan (draaien rond het midden). Opmaak: index.css, Bouw 181–184.

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

// Alleen na een echte aanraking van de gebruiker (anders weigert de browser het toch).
const tril = (patroon: number | number[]) => {
  try {
    if (navigator.userActivation?.hasBeenActive === false) return;
    navigator.vibrate?.(patroon);
  } catch {
    /* geen trilfunctie */
  }
};
const rustig = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Voortgangsboog rond het getal (viewBox 0 0 100 100).
const BOOG = 2 * Math.PI * 46;
// Midden van de ring in het beeld (percentages), voor het draaigebaar.
const RING_MIDDEN = { x: 0.499, y: 0.362 };
// Draaigebaar: per stap minstens zoveel graden, en per gebaar hoogstens zoveel knopen.
const MIN_GRADEN = 12;
const MAX_PER_GEBAAR = 10;

export default function Gebedssnoer() {
  const [stand, setStand] = useState<Stand>(lees);
  const [vorige, setVorige] = useState<Stand | null>(null);
  const [bevestig, setBevestig] = useState(false);
  const [melding, setMelding] = useState('');
  const [oudGetal, setOudGetal] = useState<number | null>(null);
  const beeldRef = useRef<HTMLSpanElement | null>(null);
  const actiefRef = useRef<HTMLSpanElement | null>(null);
  const haloRef = useRef<HTMLSpanElement | null>(null);
  const [uitdoven, setUitdoven] = useState(false);
  const gloedRef = useRef<HTMLSpanElement | null>(null);
  const gebaar = useRef<{ hoek: number; som: number; telde: number; id: number } | null>(null);
  const negeerKlik = useRef(false);
  const { lengte, aantal, ronden } = stand;
  const vol = aantal === lengte;
  // De actuele stand, ook tussen twee renders in (snelle tikken en het draaigebaar volgen elkaar binnen één render op).
  const standRef = useRef(stand);

  useEffect(() => {
    standRef.current = stand;
    try {
      localStorage.setItem(SLEUTEL, JSON.stringify(stand));
    } catch {
      /* geen opslag: de stand geldt dan alleen voor dit bezoek */
    }
  }, [stand]);

  // "Opnieuw" vraagt eerst bevestiging (4 s) en is daarna zes seconden te herstellen.
  useEffect(() => {
    if (!vorige) return;
    const t = setTimeout(() => setVorige(null), 6000);
    return () => clearTimeout(t);
  }, [vorige]);
  useEffect(() => {
    if (!bevestig) return;
    const t = setTimeout(() => setBevestig(false), 4000);
    return () => clearTimeout(t);
  }, [bevestig]);

  // De nieuwe knoop gloeit kort sterker op; het snoer zelf staat stil.
  const beweeg = (richting: 1 | -1) => {
    if (rustig() || richting < 0) return;
    actiefRef.current?.animate([{ opacity: 1, filter: 'brightness(1.25)' }, { opacity: 1, filter: 'brightness(1)' }], { duration: 380, easing: 'ease-out' });
    haloRef.current?.animate([{ opacity: 1 }, { opacity: 0.8 }], { duration: 400, easing: 'ease-out' });
  };
  const wissel = (nieuw: Stand) => {
    setOudGetal(standRef.current.aantal);
    standRef.current = nieuw;
    setStand(nieuw);
  };

  const tel = () => {
    const { lengte, aantal, ronden } = standRef.current;
    if (aantal === lengte) {
      wissel({ lengte, aantal: 1, ronden: ronden + 1 });
      beweeg(1);
      tril(8);
      return;
    }
    const nieuw = aantal + 1;
    wissel({ lengte, aantal: nieuw, ronden });
    beweeg(1);
    if (nieuw === lengte) {
      tril([12, 60, 12]);
      setMelding(`Ronde ${ronden + 1} voltooid`);
      // Het hele snoer licht één keer zacht warm op en komt weer tot rust.
      if (!rustig()) gloedRef.current?.animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.35 }, { opacity: 0 }], { duration: 1800, easing: 'ease-in-out' });
    } else {
      tril(8);
      if (nieuw % 10 === 0) setMelding(String(nieuw));
    }
  };

  const terug = () => {
    const huidig = standRef.current;
    if (huidig.aantal === 0) return;
    wissel({ ...huidig, aantal: huidig.aantal - 1 });
    beweeg(-1);
  };

  // Draaigebaar rond het midden van de ring; tikken blijft gewoon werken (een klik zonder telling uit het gebaar).
  const hoekVan = (e: PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height * RING_MIDDEN.y), e.clientX - (r.left + r.width * RING_MIDDEN.x)) * 180) / Math.PI;
  };
  const omlaag = (e: PointerEvent<HTMLButtonElement>) => {
    negeerKlik.current = false;
    gebaar.current = { hoek: hoekVan(e), som: 0, telde: 0, id: e.pointerId };
  };
  const beweegt = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gebaar.current;
    if (!g || g.id !== e.pointerId) return;
    const h = hoekVan(e);
    let d = h - g.hoek;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    g.hoek = h;
    g.som += Math.abs(d);
    const stap = Math.max(MIN_GRADEN, 360 / lengte);
    if (g.som >= stap && g.telde < MAX_PER_GEBAAR) {
      g.som = 0;
      g.telde += 1;
      negeerKlik.current = true;
      tel();
    }
  };
  const omhoog = () => {
    gebaar.current = null;
  };

  // Het verlichte deel loopt van de kraal onderaan tot en met de huidige knoop; de huidige knoop apart, iets sterker.
  const lichtTot = aantal > 0 ? snoerHoek(aantal / lengte) : 0;
  const actiefVan = aantal > 0 ? snoerHoek((aantal - 1) / lengte) : 0;

  return (
    <div className="snoer ad-paneel jr-vak">
      {['lb', 'rb', 'lo', 'ro'].map((h) => <span key={h} className={`ad-hoek ad-hoek-${h}`} aria-hidden="true" />)}
      <h2 className="ad-kop">Het gebedssnoer</h2>

      <button
        type="button"
        className="snoer-beeld"
        onClick={() => {
          if (negeerKlik.current) {
            negeerKlik.current = false;
            return;
          }
          tel();
        }}
        onPointerDown={omlaag}
        onPointerMove={beweegt}
        onPointerUp={omhoog}
        onPointerCancel={omhoog}
        aria-label={`Gebed tellen: ${aantal} van ${lengte}${ronden ? `, ronde ${ronden + 1}` : ''}`}
      >
        <span ref={beeldRef} className={`snoer-draaier${uitdoven ? ' is-uitdoven' : ''}`}>
          {/* Warm licht achter het snoer: het silhouet van de gebeden knopen, vervaagd tot een gouden rand eromheen */}
          <span className="snoer-halo" aria-hidden="true">
            <span style={{ '--tot': `${lichtTot}deg` } as CSSProperties} />
          </span>
          <span ref={haloRef} className="snoer-halo is-actief" aria-hidden="true">
            <span style={{ '--van': `${actiefVan}deg`, '--tot': `${lichtTot}deg` } as CSSProperties} />
          </span>
          <img src="/images/adem/gebedssnoer.webp" alt="" width={720} height={1216} draggable={false} decoding="async" />
          <span className="snoer-licht" aria-hidden="true" style={{ '--tot': `${lichtTot}deg` } as CSSProperties} />
          <span ref={actiefRef} className="snoer-licht is-actief" aria-hidden="true" style={{ '--van': `${actiefVan}deg`, '--tot': `${lichtTot}deg` } as CSSProperties} />
          <span ref={gloedRef} className="snoer-gloed" aria-hidden="true" />
        </span>
        <span className="snoer-telling" aria-hidden="true">
          <svg className="snoer-boog" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" />
            <circle cx="50" cy="50" r="46" className="is-voortgang" style={{ strokeDasharray: BOOG, strokeDashoffset: BOOG * (1 - aantal / lengte) }} />
          </svg>
          <span className="snoer-getal">
            {oudGetal !== null && oudGetal !== aantal && (
              <b key={`oud-${oudGetal}-${aantal}`} className="is-oud">
                {oudGetal}
              </b>
            )}
            <b key={`nu-${aantal}`} className={oudGetal !== null && oudGetal !== aantal ? 'is-nieuw' : undefined}>
              {aantal}
            </b>
          </span>
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
          <button type="button" onClick={terug} disabled={aantal === 0}>
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
              aria-live="polite"
              onClick={() => {
                if (!bevestig) {
                  setBevestig(true);
                  return;
                }
                setBevestig(false);
                setVorige(stand);
                setOudGetal(null);
                setUitdoven(true);
                window.setTimeout(() => setUitdoven(false), 1300);
                setStand({ lengte, aantal: 0, ronden: 0 });
              }}
            >
              {bevestig ? 'Zeker? Opnieuw' : 'Opnieuw'}
            </button>
          )}
        </div>
      </div>
      <p className="snoer-uitleg">
        Tik op het snoer om te tellen.
        <br />
        Je stand blijft op dit toestel bewaard.
      </p>
    </div>
  );
}
