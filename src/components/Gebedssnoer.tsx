import { useEffect, useId, useRef, useState, type PointerEvent } from 'react';
import { SNOER_PAD } from '../lib/snoerPad';

// Gebedssnoer (tsjotki / komboskini): tel het Jezusgebed per knoop. De stand blijft op dit toestel bewaard.
// Het snoer is het aangeleverde beeld (public/images/adem/gebedssnoer.webp), onveranderd en altijd even groot; 33/50/100
// verandert alleen de telling. Het snoer staat stil; warm licht loopt mee, zoals in "Interactive prayer rope.html": het beeld
// staat drie keer in één SVG — twee gloedlagen erachter (gemaakt uit de omtrek van het snoer zelf: gouden kern + amber
// halo) en het originele snoer ervoor. Welk deel gloeit bepaalt een masker langs de hartlijn (lib/snoerPad.ts); het
// masker wordt nooit getekend, dus het licht volgt precies het touw.
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

// Afmeting van het snoerbeeld (viewBox) en straal van de maskerschijf langs de hartlijn (iets breder dan het touw).
const B = 720;
const H = 1216;
const SCHIJF = 44;
const punt = (i: number) => [(SNOER_PAD[i][0] * B) / 100, (SNOER_PAD[i][1] * H) / 100] as const;

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
  const id = useId().replace(/:/g, '');
  const actiefRef = useRef<SVGGElement | null>(null);
  const gloedRef = useRef<SVGGElement | null>(null);
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
    actiefRef.current?.animate([{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 0.6 }], { duration: 900, easing: 'ease-out' });
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
      if (!rustig()) gloedRef.current?.animate([{ opacity: 1, filter: 'brightness(1)' }, { opacity: 1, filter: 'brightness(1.35)', offset: 0.35 }, { opacity: 1, filter: 'brightness(1)' }], { duration: 2000, easing: 'ease-in-out' });
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
  const n = SNOER_PAD.length;
  const tot = Math.round((aantal / lengte) * n);
  const van = aantal > 0 ? Math.min(tot - 1, Math.round(((aantal - 1) / lengte) * n)) : tot;
  const schijven = (a: number, b: number) =>
    Array.from({ length: Math.max(0, b - a) }, (_, k) => {
      const [x, y] = punt(a + k);
      return <circle key={a + k} cx={x} cy={y} r={SCHIJF} />;
    });

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
        <svg className="snoer-svg" viewBox={`0 0 ${B} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <defs>
            <image id={`${id}-beeld`} href="/images/adem/gebedssnoer.webp" x="0" y="0" width={B} height={H} />
            <mask id={`${id}-licht`} maskUnits="userSpaceOnUse" x={-120} y={-120} width={B + 240} height={H + 240}>
              <g fill="#fff" className="snoer-masker">
                {schijven(0, tot)}
                {vol && <rect x="0" y={H * 0.7} width={B} height={H * 0.3} />}
              </g>
            </mask>
            <mask id={`${id}-actief`} maskUnits="userSpaceOnUse" x={-120} y={-120} width={B + 240} height={H + 240}>
              <g fill="#fff">{schijven(van, tot)}</g>
            </mask>
            <filter id={`${id}-gloed`} x="-25%" y="-15%" width="150%" height="130%" colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="dilate" radius="7" result="vorm" />
              <feFlood floodColor="#E8A33D" result="goud" />
              <feComposite in="goud" in2="vorm" operator="in" result="kern" />
              <feGaussianBlur in="kern" stdDeviation="9" result="kernZacht" />
              <feFlood floodColor="#D98220" floodOpacity="0.75" result="amber" />
              <feComposite in="amber" in2="vorm" operator="in" result="haloVorm" />
              <feGaussianBlur in="haloVorm" stdDeviation="24" result="halo" />
              <feMerge>
                <feMergeNode in="halo" />
                <feMergeNode in="halo" />
                <feMergeNode in="kernZacht" />
              </feMerge>
            </filter>
            <filter id={`${id}-actiefgloed`} x="-30%" y="-20%" width="160%" height="140%" colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="vorm" />
              <feFlood floodColor="#FFD27A" result="licht" />
              <feComposite in="licht" in2="vorm" operator="in" result="kern" />
              <feGaussianBlur in="kern" stdDeviation="11" result="kernZacht" />
              <feFlood floodColor="#E8A33D" floodOpacity="0.8" result="goud" />
              <feComposite in="goud" in2="vorm" operator="in" result="haloVorm" />
              <feGaussianBlur in="haloVorm" stdDeviation="28" result="halo" />
              <feMerge>
                <feMergeNode in="halo" />
                <feMergeNode in="kernZacht" />
              </feMerge>
            </filter>
          </defs>
          <g ref={gloedRef} filter={`url(#${id}-gloed)`} opacity="1">
            <use href={`#${id}-beeld`} mask={`url(#${id}-licht)`} />
          </g>
          <g ref={actiefRef} filter={`url(#${id}-actiefgloed)`} opacity="0.6">
            <use href={`#${id}-beeld`} mask={`url(#${id}-actief)`} />
          </g>
          <use href={`#${id}-beeld`} />
        </svg>
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
