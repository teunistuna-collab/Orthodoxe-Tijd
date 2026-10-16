import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useApp } from '../lib/context';
import { civilVanKerkdatum, formatDag, formatMd, hoofdletter, MAANDEN } from '../lib/kalender';
import HeiligePopup from './HeiligePopup';
import { normaliseer, tekstVoorIndeling, type Resultaat } from '../lib/heiligenPopup';
import { CATEGORIEEN, categorieenVan } from '../lib/heiligenSoort';
import { usePaginaOpen } from '../lib/paginaOpen';
import NisKop from './NisKop';
import './Vandaag.css';

// De heiligen (#heiligen), volgens het pakket Heiligen en Voorkeuren (referentie.png, scherm 1): zoeken, de twaalf
// maanden en de Heiligen van de Lage Landen. Bron: lib/heiligen.ts (Heiligenjaar + Lage Landen, al ontdubbeld).
// Onderdelen hebben een eigen adres, zodat de terugknop werkt: #heiligen/10 (oktober), #heiligen/lage-landen,
// #heiligen/categorie-<id>. Een heilige opent het bestaande leesvenster (HeiligePopup).
// Tekst in links met een pijl staat in een <span>: index.css vergroot anders het aanraakvlak van "alleen een icoon"-links.

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
/** Het deel na "#heiligen/" ("10", "lage-landen", "categorie-martelaren"), of '' op het overzicht. */
const useOnderdeel = () => useSyncExternalStore(volgHash, () => decodeURIComponent(window.location.hash).match(/^#heiligen\/(.+)$/)?.[1] ?? '');

const sorteerMd = (a: string, b: string) => {
  const [am, ad] = a.split('-').map(Number);
  const [bm, bd] = b.split('-').map(Number);
  return am - bm || ad - bd;
};

const CATEGORIE_LIJST = [...CATEGORIEEN.map((c) => ({ id: c.id, label: c.label })), { id: 'overige', label: 'Overige heiligen' }];

export default function Heiligen() {
  const open = usePaginaOpen('heiligen');
  const { mode, vandaag, heiligen } = useApp();
  const onderdeel = useOnderdeel();
  const [zoek, setZoek] = useState('');
  const [geselecteerde, setGeselecteerde] = useState<Resultaat | null>(null);
  // Een maand of lijst openen (of terug naar het overzicht): bovenaan beginnen.
  useEffect(() => {
    if (open) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [onderdeel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Alleen heiligen; feesten en andere gedachtenissen horen bij de dag (Kalender, Vandaag).
  const alle = useMemo<Resultaat[]>(() => (heiligen?.ALLE_HEILIGEN ?? []).filter((h) => h.type === 'saint').map((h) => ({ ...h, bron: h.nl ? 'nl' : 'hj' })), [heiligen]);

  const maand = /^\d+$/.test(onderdeel) ? Number(onderdeel) : null;
  const categorie = onderdeel.startsWith('categorie-') ? CATEGORIE_LIJST.find((c) => `categorie-${c.id}` === onderdeel) : undefined;
  const lageLanden = onderdeel === 'lage-landen';
  const query = normaliseer(zoek.trim());

  // Op naam (en de andere namen uit de bron) zoeken; op het overzicht vervangen de resultaten dan de maanden.
  const gevonden = useMemo(() => {
    if (maand) return alle.filter((h) => Number(h.md.split('-')[0]) === maand);
    if (lageLanden) return alle.filter((h) => h.nl);
    if (categorie) return alle.filter((h) => categorieenVan(tekstVoorIndeling(h)).includes(categorie.id));
    if (!query) return [];
    return alle.filter((h) => normaliseer(`${h.naam} ${h.titel} ${(h.namen ?? []).join(' ')}`).includes(query));
  }, [alle, maand, lageLanden, categorie, query]);

  const groepen = useMemo(() => {
    const map = new Map<string, Resultaat[]>();
    for (const h of gevonden) map.set(h.md, [...(map.get(h.md) ?? []), h]);
    return [...map.entries()].sort(([a], [b]) => sorteerMd(a, b));
  }, [gevonden]);

  // Datum van de gedachtenis: de kerkelijke datum; bij de oude kalender ook de burgerlijke datum dit jaar.
  const jaar = vandaag.getUTCFullYear();
  const datum = (md: string) => (mode === 'oud' ? `${formatMd(md)} · ${formatDag(civilVanKerkdatum(md, jaar, mode))}` : formatMd(md));

  const lijst = (
    <>
      {!heiligen ? (
        <p className="vg-hl-leeg">De heiligen worden geladen…</p>
      ) : groepen.length === 0 ? (
        <p className="vg-hl-leeg">{query ? `Geen heilige gevonden voor “${zoek.trim()}”. Probeer een andere schrijfwijze of een deel van de naam.` : 'Geen heiligen gevonden.'}</p>
      ) : (
        <ol className="vg-hl-dagen">
          {groepen.map(([md, items]) => (
            <li key={md}>
              <h3>{datum(md)}</h3>
              <ul>
                {items.map((h) => (
                  <li key={h.id}>
                    <button type="button" className="vg-hl-rij" onClick={() => setGeselecteerde(h)}>
                      <span>
                        <b>{h.naam}</b>
                        {h.titel && h.titel !== h.naam && <span>{h.titel}</span>}
                      </span>
                      <ChevronRight aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </>
  );

  const titel = maand ? hoofdletter(MAANDEN[maand - 1]) : lageLanden ? 'Heiligen van de Lage Landen' : categorie?.label;

  return (
    <section id="heiligen" className="vg vg-heiligen">
      <NisKop
        titel="De Heiligen"
        open={open}
        achter={
          <picture>
            {/* Mobiel: het icoon van Christus de Wijnstok met de apostelen in de nis; web: de bestaande kerkkop */}
            <source media="(max-width: 767px)" srcSet="/images/ontwerp/heiligen-mobiel-banner-800.webp 800w, /images/ontwerp/heiligen-mobiel-banner-1536.webp 1536w" sizes="100vw" width={1536} height={1024} />
            <img src="/images/vandaag/kerk-header-800.webp" srcSet="/images/vandaag/kerk-header-800.webp 800w, /images/vandaag/kerk-header-1536.webp 1536w" sizes="(min-width: 960px) 960px, 100vw" alt="" width={1536} height={1024} loading={open ? 'eager' : 'lazy'} decoding="async" />
          </picture>
        }
      />
      <div className="vg-papier">
        {titel ? (
          <>
            <a className="vg-hl-terug" href="#heiligen">
              <ChevronLeft aria-hidden="true" /> <span>Alle heiligen</span>
            </a>
            <h2 className="vg-hl-kop">{titel}</h2>
            <p className="vg-hl-uitleg">
              {gevonden.length} heiligen{mode === 'oud' ? ' · kerkelijke datum, daarna de burgerlijke datum' : ''}
            </p>
            {lijst}
          </>
        ) : (
          <>
            <label className="vg-hl-zoek">
              <Search aria-hidden="true" />
              <span className="sr-only">Zoek een heilige</span>
              <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek een heilige" autoComplete="off" />
            </label>

            {query ? (
              <section aria-live="polite" aria-label="Zoekresultaten">
                <p className="vg-hl-uitleg">{gevonden.length === 1 ? '1 heilige' : `${gevonden.length} heiligen`}</p>
                {lijst}
              </section>
            ) : (
              <>
                <nav aria-label="Heiligen per maand">
                  <ul className="vg-hl-maanden">
                    {MAANDEN.map((m, i) => (
                      <li key={m}>
                        <a href={`#heiligen/${i + 1}`}>
                          <span>{hoofdletter(m)}</span>
                          <ChevronRight aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <p className="vg-verd-scheiding" aria-hidden="true"><span>✣</span></p>

                <section className="vg-hl-ll" aria-labelledby="vg-hl-ll-kop">
                  <img className="vg-hl-ll-kaart" src="/images/decor/lage-landen.webp" alt="" loading="lazy" decoding="async" />
                  <h2 id="vg-hl-ll-kop">Heiligen van de Lage Landen</h2>
                  <p className="vg-hl-ll-namen">Willibrord, Servatius, Bavo</p>
                  <p>Ontdek de rijke erfenis van heilige mannen en vrouwen in onze streken.</p>
                  <a className="vg-knop" href="#heiligen/lage-landen">
                    <span>Ontdek hun leven</span> <ArrowRight aria-hidden="true" />
                  </a>
                </section>

                <nav className="vg-hl-categorieen" aria-labelledby="vg-hl-cat-kop">
                  <h2 id="vg-hl-cat-kop" className="vg-label">Naar categorie</h2>
                  <ul>
                    {CATEGORIE_LIJST.map((c) => (
                      <li key={c.id}>
                        <a href={`#heiligen/categorie-${c.id}`}>{c.label}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </>
            )}
          </>
        )}
      </div>
      <HeiligePopup heilige={geselecteerde} onClose={() => setGeselecteerde(null)} />
    </section>
  );
}
