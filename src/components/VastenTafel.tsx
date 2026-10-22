import { useState } from 'react';
import type { VastenNiveau } from '../lib/vasten';
import { VOEDSELGROEPEN, voedselStatus, type Voedselgroep } from '../lib/voedselgroepen';
import VoedselTegels from './VoedselTegels';

// De vastentafel (Vasten, "Vandaag"/"Morgen"): de vaste tafel (kaars, waterkan, olijftakken, schaal, karaf) met de negen
// voedselgroepen als losse lagen erop, en daaronder de voedseltegels. Tafel en tegels lezen dezelfde status
// (lib/voedselgroepen.ts, uit het vastenniveau van de gekozen dag). Hover of focus op een tegel licht het gerecht op tafel
// op en omgekeerd; aantikken houdt de keuze vast (mobiel). Een niet-toegestaan gerecht blijft weg, ook als zijn tegel
// gekozen is. Posities in pixels van tafel.png (1860 breed) met een strook erboven voor de hoge gerechten, in de pagina
// omgerekend naar procenten binnen een vaste beeldverhouding. Beelden: public/images/vasten/tafel/.

const B = 1860; // breedte van tafel.png
const BOVEN = 70; // ruimte boven de tafel
const H = 371 + BOVEN;
const MAP = '/images/vasten/tafel';

// x = linkerkant, y = onderkant (staat op het tafelblad), s = schaal, z = achter (1) of voor (3); b × h = bestandsmaat
const LAGEN: Array<{ groep: Voedselgroep; x: number; y: number; s: number; z: number; b: number; h: number }> = [
  { groep: 'olie', x: 232, y: 212, s: 0.74, z: 1, b: 253, h: 170 },
  { groep: 'eieren', x: 540, y: 210, s: 0.66, z: 1, b: 254, h: 144 },
  { groep: 'vis', x: 790, y: 210, s: 0.68, z: 1, b: 385, h: 145 },
  { groep: 'peulvruchten', x: 1085, y: 210, s: 0.64, z: 1, b: 264, h: 146 },
  { groep: 'wijn', x: 1600, y: 214, s: 0.72, z: 1, b: 234, h: 162 },
  { groep: 'vlees', x: 330, y: 238, s: 0.68, z: 3, b: 336, h: 136 },
  { groep: 'groenten', x: 620, y: 240, s: 0.7, z: 3, b: 356, h: 145 },
  { groep: 'zuivel', x: 930, y: 238, s: 0.66, z: 3, b: 266, h: 154 },
  { groep: 'graan', x: 1150, y: 240, s: 0.68, z: 3, b: 307, h: 147 },
];

const pct = (v: number, t: number) => `${((v / t) * 100).toFixed(3)}%`;

// Testmodus, alleen in de ontwikkelversie (npm run dev): nooit in de gepubliceerde site, en de kalender blijft onaangeroerd
const TESTS: Array<{ id: string; label: string; niveau: VastenNiveau | null }> = [
  { id: 'kalender', label: 'Kalender (echt)', niveau: null },
  { id: 'geen', label: 'Geen vasten', niveau: 'geen' },
  { id: 'vis', label: 'Zonder vlees, zuivel en eieren', niveau: 'vis' },
  { id: 'streng', label: 'Strenge vastendag', niveau: 'streng' },
];

export default function VastenTafel({ niveau }: { niveau: VastenNiveau }) {
  const [test, setTest] = useState<VastenNiveau | null>(null);
  const [handmatig, setHandmatig] = useState<Partial<Record<Voedselgroep, boolean>>>({});
  const [hover, setHover] = useState<Voedselgroep | null>(null);
  const [gekozen, setGekozen] = useState<Voedselgroep | null>(null);
  const basis = voedselStatus(test ?? niveau);
  const status = import.meta.env.DEV ? { ...basis, ...handmatig } : basis;
  const licht = hover ?? gekozen;

  return (
    <>
      <div className="vt" aria-hidden="true">
        <img className="vt-tafel" src={`${MAP}/tafel.webp`} srcSet={`${MAP}/tafel-930.webp 930w, ${MAP}/tafel.webp 1860w`} sizes="(min-width: 1100px) 1040px, 100vw" alt="" width={B} height={371} decoding="async" />
        {LAGEN.map((l) => {
          const w = l.b * l.s;
          const h = l.h * l.s;
          return (
            <img
              key={l.groep}
              className={`vt-gerecht ${l.z > 1 ? 'vt-voor' : 'vt-achter'}${status[l.groep] ? '' : ' is-weg'}${licht === l.groep && status[l.groep] ? ' is-licht' : ''}`}
              src={`${MAP}/${l.groep}.webp`}
              alt=""
              width={l.b}
              height={l.h}
              decoding="async"
              onMouseEnter={() => setHover(l.groep)}
              onMouseLeave={() => setHover(null)}
              style={{ left: pct(l.x, B), top: pct(l.y + BOVEN - h, H), width: pct(w, B), zIndex: l.z }}
            />
          );
        })}
      </div>

      <h2 className="sr-only">Toegestane spijzen</h2>
      <VoedselTegels status={status} licht={licht} gekozen={gekozen} onLicht={setHover} onKies={(g) => setGekozen((k) => (k === g ? null : g))} />

      {import.meta.env.DEV && (
        <div className="vt-test" role="group" aria-label="Testmodus vastentafel">
          <b>Testmodus (alleen ontwikkeling)</b>
          {TESTS.map((t) => (
            <button key={t.id} type="button" aria-pressed={test === t.niveau && Object.keys(handmatig).length === 0} onClick={() => { setTest(t.niveau); setHandmatig({}); }}>
              {t.label}
            </button>
          ))}
          <span>Eén gerecht wisselen:</span>
          {VOEDSELGROEPEN.map(({ groep, naam }) => (
            <button key={groep} type="button" aria-pressed={!status[groep]} onClick={() => setHandmatig((m) => ({ ...m, [groep]: !status[groep] }))}>
              {naam}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
