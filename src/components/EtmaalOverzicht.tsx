import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { INITIALEN, serviceConfig, type ServiceMapping } from '../lib/etmaal';
import { usePaginaOpen } from '../lib/paginaOpen';
import NisKop from './NisKop';
import './Vandaag.css';

// Bovenkant van Etmaal (UrenCyclus.tsx), volgens het pakket Etmaal, Week en Jaar (ontwerp.png, paneel 2):
// - de kop toont de banner van de gekozen dienst (public/images/etmaal/banner, scripts/etmaal-banners.mjs): op mobiel
//   het hele beeld (3:2), op web de brede webbanner (<slug>-web-*.webp, 2,5:1) (Vandaag.css);
// - de tijdlijn volgt de klok (nuIndex, uit dienstVanHetUur in lib/etmaal.ts) tot iemand zelf een dienst kiest;
//   "Volg het huidige gebedsuur" zet het volgen weer aan;
// - "Open het gebed" opent het bestaande dienstvenster (onOpen).

const slug = (titel: string) => titel.toLowerCase().replace(/ /g, '-');
const banner = (s: ServiceMapping, breedte: number | string) => `/images/etmaal/banner/${slug(s.title)}-${breedte}.webp`;
// Namen zoals op de tijdlijn in het ontwerp: "Middernacht", "Eerste uur".
const naam = (titel: string) => (titel === 'Middernachtdienst' ? 'Middernacht' : titel.replace(' Uur', ' uur'));
const N = serviceConfig.length;
const buren = (i: number) => [i, (i + 1) % N, (i + N - 1) % N];

export default function EtmaalOverzicht({ nuIndex, onOpen }: { nuIndex: number; onOpen: (index: number) => void }) {
  const open = usePaginaOpen('etmaal');
  const [handmatig, setHandmatig] = useState<number | null>(null);
  const gekozen = handmatig ?? nuIndex;
  const dienst = serviceConfig[gekozen];

  // Alleen de gekozen banner en de twee buren laden; eerder getoonde blijven staan, zodat het overvloeien werkt.
  const [geladen, setGeladen] = useState(() => new Set(buren(gekozen)));
  if (buren(gekozen).some((i) => !geladen.has(i))) setGeladen(new Set([...geladen, ...buren(gekozen)]));

  const initiaal = INITIALEN[dienst.title];
  const kernversRef = dienst.kernvers.reference.replace('Psalm Kernvers:', 'Psalm');

  return (
    <section id="etmaal" className="vg vg-etmaal">
      <NisKop
        open={open}
        balk
        terug="#cycli"
        achter={serviceConfig.map((s, i) =>
          geladen.has(i) ? (
            <picture key={s.title}>
              {/* Web: de brede banner (2,5 : 1) uit "Banners Etmaal voor web"; mobiel de banner 3 : 2 */}
              <source media="(min-width: 768px)" srcSet={`${banner(s, 'web-960')} 960w, ${banner(s, 'web-1920')} 1920w`} sizes="960px" width={1920} height={768} />
              <img className={`vg-et-banner${i === gekozen ? ' is-actief' : ''}`} src={banner(s, 800)} srcSet={`${banner(s, 800)} 800w, ${banner(s, 1536)} 1536w`} sizes="(min-width: 768px) 960px, 100vw" alt="" width={1536} height={1024} fetchPriority={i === gekozen && open ? 'high' : 'low'} decoding="async" />
            </picture>
          ) : null,
        )}
      />
      <div className="vg-papier vg-cy">
        <h1 className="vg-cy-titel">De uren van de dag</h1>
        <img className="vg-sierlijn vg-cy-sierlijn" src="/images/vandaag/sierlijn.svg" alt="" aria-hidden="true" width={480} height={40} />
        {/* Mobiel eerst het gekozen gebedsuur, dan de tijdlijn; op web de tijdlijn links en het gebedsuur ernaast */}
        <div className="vg-et-twee">
        <section className={`vg-uur vg-et-uur${dienst.title.length > 12 ? ' vg-uur-lang' : ''}`} aria-labelledby="et-uur-kop" aria-live="polite">
          <h2 id="et-uur-kop" className="vg-label">{handmatig !== null && handmatig !== nuIndex ? 'Gekozen gebedsuur' : 'Dit gebedsuur'}</h2>
          <div className="vg-et-naam">
            {initiaal && <img className="vg-initiaal" src={initiaal} alt="" width={280} height={280} decoding="async" />}
            <p className="vg-dienst">
              {initiaal ? <><span className="sr-only">{dienst.title}</span><span aria-hidden="true">{dienst.title.slice(1)}</span></> : dienst.title}
            </p>
          </div>
          {/* Het kernvers van de dienst: op brede schermen rechts naast de naam, op de telefoon eronder */}
          <blockquote className="vg-kernvers vg-et-vers">“{dienst.kernvers.verses.join(' ')}”</blockquote>
          <p className="vg-bron">{kernversRef}</p>
          <button type="button" className="vg-knop" onClick={() => onOpen(gekozen)}>Open het gebed <span aria-hidden="true">→</span></button>
        </section>

        <div className="vg-et-links">
        <p className="vg-label">Van avond tot avond</p>

        <ol className="vg-et-lijn" aria-label="De diensten van het etmaal">
          {serviceConfig.map((s, i) => (
            <li key={s.title}>
              <button type="button" className={i === gekozen ? 'is-actief' : undefined} aria-pressed={i === gekozen} aria-current={i === nuIndex ? 'time' : undefined} onClick={() => setHandmatig(i)}>
                <time>{s.time}</time>
                <span>{naam(s.title)}</span>
                <ChevronRight aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
        {handmatig !== null && (
          <button type="button" className="vg-link vg-et-volg" onClick={() => setHandmatig(null)}>
            Volg het huidige gebedsuur ›
          </button>
        )}
        </div>
        </div>
      </div>
    </section>
  );
}
