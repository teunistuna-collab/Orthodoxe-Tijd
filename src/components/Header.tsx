import { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronDown, Search, Settings } from 'lucide-react';
import { useApp } from '../lib/context';
import { groepVan } from '../lib/navigatie';

// De kop volgt de vijf tabs van de app-mapping (mobile/docs/APP-MAPPING.md): Vandaag, Kalender, Bidden en Ontdek als
// uitklapmenu, daarna de pagina's van Meer. Adem en Etmaal staan onder Bidden én Ontdek.
const VOOR = [
  { id: 'vandaag', label: 'Vandaag' },
  { id: 'kalender', label: 'Kalender' },
];
const NA = [
  { id: 'vasten', label: 'Vasten' },
  { id: 'heiligen', label: 'Heiligen' },
  { id: 'feesten', label: 'Feesten' },
];

type Item = { id: string; label: string; description: string };
const ADEM: Item = { id: 'adem', label: 'Adem', description: 'Het Jezusgebed' };
const ETMAAL: Item = { id: 'etmaal', label: 'Etmaal', description: 'De gebeden van dag en nacht' };
const BIDDEN: Item[] = [
  { id: 'gebeden', label: 'Gebeden', description: 'Het gebed van de Kerk' },
  { id: 'psalmen', label: 'Psalter', description: 'De Psalmen, per psalm of per kathisma' },
  ADEM,
  ETMAAL,
];
const ONTDEK: Item[] = [
  ADEM,
  ETMAAL,
  { id: 'week', label: 'Week', description: 'Van zondag tot zaterdag' },
  { id: 'jaar', label: 'Jaar', description: 'Het ritme van het kerkelijk jaar' },
  { id: 'pascha', label: 'Pascha', description: 'Van het Kruis naar de Verrijzenis' },
  { id: 'geboorte', label: 'Geboorte', description: 'Van de Geboortevasten tot Theofanie' },
];

/** Uitklapmenu in de kop: opent bij aanwijzen of klikken, sluit kort nadat de muis het verlaat, bij Escape of een klik erbuiten. */
function Uitklap({ label, items, actief, groepActief }: { label: string; items: Item[]; actief: string; groepActief: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const sluitTimer = useRef<number | null>(null);
  const annuleer = () => {
    if (sluitTimer.current !== null) {
      window.clearTimeout(sluitTimer.current);
      sluitTimer.current = null;
    }
  };
  const openMenu = () => {
    annuleer();
    setOpen(true);
  };
  const planSluiten = () => {
    annuleer();
    sluitTimer.current = window.setTimeout(() => setOpen(false), 400);
  };
  useEffect(() => {
    const opKlik = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const opToets = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', opKlik);
    document.addEventListener('keydown', opToets);
    return () => {
      document.removeEventListener('mousedown', opKlik);
      document.removeEventListener('keydown', opToets);
    };
  }, []);

  return (
    <div ref={ref} className="relative shrink-0" onMouseEnter={openMenu} onMouseLeave={planSluiten}>
      <button type="button" onClick={openMenu} aria-expanded={open} className={`kop-link${groepActief ? ' is-actief' : ''}`}>
        {label}
        <ChevronDown className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-[200] -translate-x-1/2 pt-3">
          <div className="w-[320px] rounded-lg border border-[#c9a227]/55 bg-[#1b110d] p-2 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
            {items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => {
                  annuleer();
                  setOpen(false);
                }}
                aria-current={actief === item.id ? 'page' : undefined}
                className={`block rounded-md border px-3 py-2.5 transition ${actief === item.id ? 'border-[#c9a227]/60 bg-[#2a1d16]' : 'border-transparent hover:border-[#c9a227]/35 hover:bg-[#241813]'}`}
              >
                <div className="ot-label ot-label-licht">{item.label}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-[#e9dcc0] opacity-90">{item.description}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Er staat één pagina tegelijk in beeld (App.tsx); de actieve link volgt die pagina.
export default function Header({ pagina: actief }: { pagina: string }) {
  const { openZoeken } = useApp();
  const groep = groepVan(actief);
  const link = ({ id, label }: { id: string; label: string }) => (
    <a key={id} href={`#${id}`} className={`kop-link${actief === id ? ' is-actief' : ''}`} aria-current={actief === id ? 'page' : undefined}>
      {label}
    </a>
  );

  return (
    <header className="site-header sticky top-0 z-50 overflow-visible">
      <a href="#inhoud" className="naar-inhoud" onClick={(e) => { e.preventDefault(); const m = document.getElementById('inhoud'); m?.focus({ preventScroll: true }); m?.scrollIntoView(); }}>Naar de inhoud</a>
      {/* Eén donkere balk (vanaf 768px; daaronder de onderbalk): merk links, navigatie in het midden, kalenderkeuze rechts.
          De sierlijst staat als border-image (Bouw 69), zodat de hoekornamenten op elke breedte even groot blijven. */}
      <div className="relative bg-bark text-cream">
        <div className="relative mx-auto flex items-center">
          <a href="#vandaag" className="kop-merk">
            {/* Het kruis van de site (public/images/ui/kruis.webp) */}
            <img src="/images/ui/kruis.webp" alt="" width={33} height={40} />
            <span className="min-w-0">
              <span className="kop-naam">Orthodoxe Tijd</span>
              <span className="kop-tagline">Een weg door de tijd · een leven met Christus</span>
            </span>
          </a>

          <nav className="kop-nav" aria-label="Hoofdnavigatie">
            {VOOR.map(link)}
            <Uitklap label="Bidden" items={BIDDEN} actief={actief} groepActief={groep === 'bidden'} />
            <Uitklap label="Ontdek" items={ONTDEK} actief={actief} groepActief={groep === 'ontdek'} />
            {NA.map(link)}
          </nav>

          <div className="kop-acties">
            <button type="button" onClick={openZoeken} className="kop-zoek" aria-label="Zoeken" title="Zoeken  ( /  of  Ctrl+K )">
              <Search aria-hidden="true" />
            </button>

            {/* Bronnen en verwijzingen (op web de enige weg erheen sinds de voettekst weg is; mobiel ook via Meer) */}
            <a href="#bronnen" className={`kop-zoek kop-instellingen${actief === 'bronnen' ? ' is-actief' : ''}`} aria-label="Bronnen en verwijzingen" title="Bronnen en verwijzingen">
              <BookOpen aria-hidden="true" />
            </a>

            {/* De kalender (en later de traditie) kies je op de pagina Instellingen */}
            <a href="#instellingen" className={`kop-zoek kop-instellingen${actief === 'instellingen' ? ' is-actief' : ''}`} aria-label="Instellingen" title="Instellingen">
              <Settings aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
