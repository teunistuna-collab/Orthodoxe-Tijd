import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronRight, Moon, Search, Sun, X } from 'lucide-react';
import { GEBEDEN, GEBEDEN_ZICHTBAAR, type Gebed } from '../lib/gebeden';
import { LiturgicalPopup, CycleTransition } from './CycleSections';
import { useFavorieten } from '../lib/favorieten';
import ExactPageFrame from './ExactPageFrame';
import NisKop from './NisKop';
import { BannerBeeld, Sierlijn } from './onderdelen';
import { HANDEN, KRUIS } from './symbolen';
import { usePaginaOpen } from '../lib/paginaOpen';
import './Vandaag.css';
import './ontwerp.css';

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

// De drie soorten gebeden bovenaan de pagina (categorieën uit CATEGORIEN hieronder).
const SOORTEN = [
  { cat: 'ochtend', titel: 'Ochtendgebeden', onder: 'Begin de dag met gebed.', symbool: <Sun strokeWidth={1.3} /> },
  { cat: 'avond', titel: 'Avondgebeden', onder: 'Sluit de dag in gebed af.', symbool: <Moon strokeWidth={1.3} /> },
  { cat: 'dag', titel: 'Gebeden door de dag', onder: 'Korte gebeden voor verschillende momenten.', symbool: KRUIS },
];

const CAT_LABEL: Record<Gebed['categorie'], string> = {
  ochtend: 'Morgengebeden',
  avond: 'Voor het slapengaan',
  dagelijks: 'Dagelijks',
  liturgisch: 'Liturgisch',
  vasten: 'Vasten',
  pascha: 'Pascha',
  akathisten: 'Akathisten',
};

// Gebeden voor vaste momenten van de dag: samen één categorie ("Gebeden door de dag"); elk gebed opent in de gebeden-popup.
const DAGKEUZES = ['gebed-voor-het-werk', 'gebed-voor-het-eten', 'gebed-voor-het-slapen'];

type CategorieDef = {
  id: string;
  label: string;
  omschrijving: string;
  match: (g: Gebed) => boolean;
};

// Groepering is uitsluitend een presentatielaag boven de bestaande GEBEDEN-dataset; geen nieuwe gebedsdata.
const CATEGORIEN: CategorieDef[] = [
  { id: 'ochtend', label: 'Ochtendgebeden', omschrijving: 'Gebeden bij het ontwaken, vóór de iconen.', match: (g) => g.categorie === 'ochtend' },
  { id: 'avond', label: 'Avondgebeden', omschrijving: 'Gebeden voor het slapengaan.', match: (g) => g.categorie === 'avond' },
  { id: 'jezusgebed', label: 'Het Jezusgebed', omschrijving: 'Het onophoudelijke gebed, door de dag heen met het gebedssnoer.', match: (g) => g.id === 'jezusgebed' },
  { id: 'moeder-gods', label: 'Gebeden tot de Moeder Gods', omschrijving: 'Akathist en aanroepingen tot de Moeder Gods.', match: (g) => g.id === 'akathist-moeder-gods' },
  { id: 'gezin', label: 'Gebeden voor gezin en kinderen', omschrijving: 'Voor ouders en kinderen samen.', match: (g) => g.id === 'gebed-voor-het-gezin' },
  { id: 'nood', label: 'Gebeden bij ziekte en nood', omschrijving: 'In tijden van nood, leegte en lijden.', match: (g) => g.id === 'gebed-in-nood' },
  { id: 'overledenen', label: 'Gebeden voor overledenen', omschrijving: 'Gedachtenis van hen die ontslapen zijn.', match: (g) => g.id === 'akathist-ontslapenen' },
  {
    id: 'akathisten',
    label: 'Akathisten',
    omschrijving: 'Lofzangen tot heiligen en de Moeder Gods.',
    match: (g) => g.categorie === 'akathisten' && g.id !== 'akathist-moeder-gods' && g.id !== 'akathist-ontslapenen',
  },
  {
    id: 'dag',
    label: 'Gebeden door de dag',
    omschrijving: 'Voor het werk, het eten en het slapen.',
    match: (g) => DAGKEUZES.includes(g.id),
  },
  {
    id: 'overig',
    label: 'Overige gebeden',
    omschrijving: 'Voor de gebedsregel en de Goddelijke Liturgie.',
    match: (g) => ['inleidende-gebeden-pdf', 'psalm-50-pdf', 'geloofsbelijdenis-pdf', 'kanon-beschermengel'].includes(g.id),
  },
];

// Mobiel een rij zoals op Vandaag en bij de categorieën (vm-rij); vanaf tablet de kaart.
function PrayerCard({ g, onOpen }: { g: Gebed; onOpen: () => void }) {
  return (
    <>
    <button type="button" onClick={onOpen} className="vm-rij gebed-rij md:hidden">
      <span className="vm-rij-tekst">
        <b>{g.titel}</b>
        <small>{g.wanneer}</small>
      </span>
      <span className="pijl" aria-hidden="true">›</span>
    </button>
    <button
      type="button"
      onClick={onOpen}
      className="prayer-choice-card group p-5 text-left transition max-md:hidden"
    >
      <p className="ot-label">{g.wanneer}</p>
      <h4 className="font-display mt-1 text-lg font-semibold text-[#fbf3df]">{g.titel}</h4>
      <span className="btn-pill mt-3">
        Open gebed ›
      </span>
    </button>
    </>
  );
}

export default function Gebeden() {
  const [zoek, setZoek] = useState('');
  const [actieveCat, setActieveCat] = useState<string | null>(null);
  const [popupGebed, setPopupGebed] = useState<Gebed | null>(null);
  const favorieten = useFavorieten();
  const favorieteGebeden = GEBEDEN.filter((g) => favorieten.includes(`gebeden/${g.id}`));

  // Deeplink (bijvoorbeeld gedeeld vanuit de pop-up): #gebeden/<id> opent dat gebed.
  useEffect(() => {
    const opHash = () => {
      const g = GEBEDEN_ZICHTBAAR && GEBEDEN.find((x) => window.location.hash === `#gebeden/${x.id}`);
      if (g) setPopupGebed(g);
    };
    opHash();
    window.addEventListener('hashchange', opHash);
    return () => window.removeEventListener('hashchange', opHash);
  }, []);

  const open = usePaginaOpen('gebeden');
  const overzichtRef = useRef<HTMLElement>(null);
  const openCategorie = (cat: string) => {
    setActieveCat(cat);
    requestAnimationFrame(() => overzichtRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const zoekterm = zoek.trim().toLowerCase();
  const gezocht = useMemo(
    () =>
      zoekterm
        ? GEBEDEN.filter((g) => g.titel.toLowerCase().includes(zoekterm) || g.wanneer.toLowerCase().includes(zoekterm) || CAT_LABEL[g.categorie].toLowerCase().includes(zoekterm))
        : [],
    [zoekterm],
  );

  const categorieMetData = CATEGORIEN.map((cat) => ({ ...cat, items: GEBEDEN.filter(cat.match) })).filter((cat) => cat.items.length > 0);
  const huidigeCat = categorieMetData.find((c) => c.id === actieveCat) ?? null;

  const popupContent = popupGebed
    ? {
        title: popupGebed.titel,
        subtitle: popupGebed.wanneer,
        highlight: popupGebed.rubriek,
        paragraphs: popupGebed.tekst.split('\n\n'),
      }
    : null;

  return (
    <>
      {/* Bovenkant volgens het overdrachtspakket (referentie gebeden-psalmen-adem.png, paneel 1): de kop met het open boek,
          de titel, het gebedssymbool, de drie soorten gebeden (zolang de gebeden niet zichtbaar zijn eerlijk "Binnenkort",
          zonder schijnbaar werkende link) en de wegen naar de Psalmen en het Jezusgebed. */}
      <section id="gebeden" className="vg ot-redesign ot-gebeden">
        <NisKop open={open} balk terug="#bidden" achter={<BannerBeeld naam="gebeden-banner" open={open} />} />
        <div className="vg-papier ot-inhoud">
          <h1 className="ot-titel">Een moment <br />van gebed</h1>
          <Sierlijn />
          <span className="ot-gb-symbool" aria-hidden="true">{HANDEN}</span>
          {GEBEDEN_ZICHTBAAR && (
            <ul className="ot-gb-soorten">
              {SOORTEN.map(({ cat, titel, onder, symbool }) => (
                <li key={cat}>
                  <button type="button" className="ot-rij ot-gb-kaart" onClick={() => openCategorie(cat)}>
                    <span className="ot-rij-symbool" aria-hidden="true">{symbool}</span>
                    <span className="ot-rij-tekst"><b>{titel}</b><span>{onder}</span></span>
                    <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <ul className="ot-register ot-gb-verder">
            <li>
              <a className="ot-rij" href="#psalmen">
                <span className="ot-rij-symbool" aria-hidden="true"><BookOpen strokeWidth={1.3} /></span>
                <span className="ot-rij-tekst"><b>Lees een psalm</b><span>Vind troost in de Psalmen.</span></span>
                <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a className="ot-rij" href="#adem">
                <span className="ot-rij-symbool" aria-hidden="true">{KRUIS}</span>
                <span className="ot-rij-tekst"><b>Het Jezusgebed</b><span>Een eenvoudig en diep gebed.</span></span>
                <ChevronRight className="ot-rij-pijl" aria-hidden="true" />
              </a>
            </li>
          </ul>
          {!GEBEDEN_ZICHTBAAR && <p className="ot-gb-melding">Binnenkort: ochtendgebeden, avondgebeden en gebeden door de dag.</p>}
        </div>
      </section>

      <ExactPageFrame title="Gebeden">
      {/* Uit de vroegere opening: de inleiding over het gebedenboek */}
      <div className="ot-gb-intro">
        <p className="psr-intro">
          Morgengebeden, gebeden voor het slapengaan en gebeden door de dag, naar het Orthodox Gebedenboek volgens de
          Russische traditie.{GEBEDEN_ZICHTBAAR && ' Tik een gebed aan om het groot te lezen.'}
        </p>
      </div>

      {/* Gebedscategorieën / overzicht; zolang de gebeden uit staan alleen de melding */}
      {GEBEDEN_ZICHTBAAR && (
      <section ref={overzichtRef} className="gebed-overzicht orthodox-pattern parchment-pattern bg-parchment py-14 text-ink sm:py-20">
        <div className={CONTENT}>
          <div className="mx-auto max-w-xl">
            <div className="ot-zoek relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gold-deep" />
              <input
                type="text"
                value={zoek}
                onChange={(e) => setZoek(e.target.value)}
                placeholder="Zoek een gebed"
                aria-label="Zoek een gebed"
                className="w-full rounded-full border border-gold/40 bg-[#f8f1e3] py-3 pr-10 pl-11 text-sm text-ink placeholder:text-ink-mute focus:border-gold focus:outline-none"
              />
              {zoek && (
                <button type="button" onClick={() => setZoek('')} aria-label="Wis zoekopdracht" className="absolute top-1/2 right-4 -translate-y-1/2 text-ink-mute hover:text-gold-deep">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {zoekterm ? (
            <div className="mt-10">
              <p className="text-center text-sm text-ink-soft">{gezocht.length} gebed{gezocht.length === 1 ? '' : 'en'} gevonden</p>
              {gezocht.length > 0 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {gezocht.map((g) => (
                    <PrayerCard key={g.id} g={g} onOpen={() => setPopupGebed(g)} />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-center text-sm text-ink-mute">Geen gebeden gevonden voor "{zoek}".</p>
              )}
            </div>
          ) : huidigeCat ? (
            <div className="mt-10">
              <button
                type="button"
                onClick={() => setActieveCat(null)}
                className="btn-pill mb-6"
              >
                ‹ Terug naar categorieën
              </button>
              <h3 className="ot-titel font-display text-2xl font-semibold sm:text-3xl">{huidigeCat.label}</h3>
              <p className="mt-2 text-sm text-ink-soft">{huidigeCat.omschrijving}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {huidigeCat.items.map((g) => (
                  <PrayerCard key={g.id} g={g} onOpen={() => setPopupGebed(g)} />
                ))}
              </div>
              {huidigeCat.id === 'jezusgebed' && (
                <a
                  href="#adem"
                  className="btn-pill cyclus-verder mt-6"
                >
                  Naar de ademcyclus ›
                </a>
              )}
            </div>
          ) : (
            <>
            {favorieteGebeden.length > 0 && (
              <div className="mt-10">
                <h3 className="ot-titel font-display text-2xl font-semibold sm:text-3xl">Uw favorieten</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {favorieteGebeden.map((g) => (
                    <PrayerCard key={g.id} g={g} onOpen={() => setPopupGebed(g)} />
                  ))}
                </div>
              </div>
            )}
            {/* Mobiel: dezelfde rijen als op Vandaag (vm-rij, Bouw 82/91/92), met de omschrijving als subregel; vanaf tablet de tegels. */}
            <div className="vm-lijst gebed-lijst md:hidden">
              {categorieMetData.map((cat) => (
                <button key={cat.id} type="button" onClick={() => setActieveCat(cat.id)} className="vm-rij">
                  <span className="vm-rij-tekst">
                    <b>{cat.label}</b>
                    <small>{cat.omschrijving}</small>
                  </span>
                  <span className="pijl" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
            <div className="prayer-category-grid mt-10 grid gap-5 max-md:hidden sm:grid-cols-2 lg:grid-cols-4">
              {categorieMetData.map((cat) => {
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActieveCat(cat.id)}
                    className="ornate-card group flex min-h-[240px] flex-col px-7 py-8 text-left"
                  >
                    <h3 className="font-display mt-6 text-[20px] font-semibold text-gold-light">{cat.label}</h3>
                    <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#d9c6a3] sm:text-base">{cat.omschrijving}</p>
                    <span className="btn-pill mt-4">Bekijk gebeden ›</span>
                  </button>
                );
              })}
            </div>
            </>
          )}
        </div>
      </section>
      )}

      {/* Contemplatieve afsluiting */}
      <CycleTransition
        quote="Er is geen noodzaak om veel woorden te gebruiken. Zeg: Heer, zoals U wilt en zoals U weet, ontferm U."
        citation="Abba Macarius de Grote"
        text="De ademcyclus is geen afzonderlijke liturgische cyclus van de Kerk, maar het kleinste ritme van het gebedsleven: de voortdurende gedachtenis aan Christus, die zich met iedere ademhaling kan verbinden."
        buttonLabel="Naar de ademcyclus"
        buttonHref="#adem"
      />
      </ExactPageFrame>

      <LiturgicalPopup lezen open={popupGebed !== null} onClose={() => setPopupGebed(null)} content={popupContent} deel={popupGebed ? { titel: popupGebed.titel, pad: `gebeden/${popupGebed.id}` } : undefined} />
    </>
  );
}

