import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { GEBEDEN, type Gebed } from '../lib/gebeden';
import { LiturgicalPopup, CycleTransition } from './CycleSections';

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

const CAT_LABEL: Record<Gebed['categorie'], string> = {
  ochtend: 'Morgengebeden',
  avond: 'Voor het slapengaan',
  dagelijks: 'Dagelijks',
  liturgisch: 'Liturgisch',
  vasten: 'Vasten',
  pascha: 'Pascha',
  akathisten: 'Akathisten',
};

type CategorieDef = {
  id: string;
  label: string;
  omschrijving: string;
  iconSrc: string;
  match: (g: Gebed) => boolean;
};

// Groepering is uitsluitend een presentatielaag boven de bestaande GEBEDEN-dataset; geen nieuwe gebedsdata.
const CATEGORIEN: CategorieDef[] = [
  { id: 'ochtend', label: 'Ochtendgebeden', omschrijving: 'Gebeden bij het ontwaken, vóór de iconen.', iconSrc: '/images/ui/gebeden/01-Ochtendgebeden.png', match: (g) => g.categorie === 'ochtend' },
  { id: 'avond', label: 'Avondgebeden', omschrijving: 'Gebeden voor het slapengaan.', iconSrc: '/images/ui/gebeden/02-Avondgebeden.png', match: (g) => g.categorie === 'avond' },
  { id: 'jezusgebed', label: 'Het Jezusgebed', omschrijving: 'Het onophoudelijke gebed, door de dag heen met het gebedssnoer.', iconSrc: '/images/ui/gebeden/03-Het-Jezusgebed.png', match: (g) => g.id === 'jezusgebed' },
  { id: 'moeder-gods', label: 'Gebeden tot de Moeder Gods', omschrijving: 'Akathist en aanroepingen tot de Moeder Gods.', iconSrc: '/images/ui/gebeden/04-Moeder-Gods.png', match: (g) => g.id === 'akathist-moeder-gods' },
  { id: 'gezin', label: 'Gebeden voor gezin en kinderen', omschrijving: 'Voor ouders en kinderen samen.', iconSrc: '/images/ui/gebeden/05-Gezin-en-kinderen.png', match: (g) => g.id === 'gebed-voor-het-gezin' },
  { id: 'nood', label: 'Gebeden bij ziekte en nood', omschrijving: 'In tijden van nood, leegte en lijden.', iconSrc: '/images/ui/gebeden/06-Ziekte-en-nood.png', match: (g) => g.id === 'gebed-in-nood' },
  { id: 'overledenen', label: 'Gebeden voor overledenen', omschrijving: 'Gedachtenis van hen die ontslapen zijn.', iconSrc: '/images/ui/gebeden/07-Overledenen.png', match: (g) => g.id === 'akathist-ontslapenen' },
  {
    id: 'akathisten',
    label: 'Akathisten',
    omschrijving: 'Lofzangen tot heiligen en de Moeder Gods.',
    iconSrc: '/images/ui/gebeden/08-Akathisten.png',
    match: (g) => g.categorie === 'akathisten' && g.id !== 'akathist-moeder-gods' && g.id !== 'akathist-ontslapenen',
  },
  {
    id: 'overig',
    label: 'Overige gebeden',
    omschrijving: 'Voor de gebedsregel en de Goddelijke Liturgie.',
    iconSrc: '/images/ui/gebeden/09-Overige-gebeden.png',
    match: (g) => ['inleidende-gebeden-pdf', 'psalm-50-pdf', 'geloofsbelijdenis-pdf', 'kanon-beschermengel'].includes(g.id),
  },
];

function PrayerCard({ g, onOpen }: { g: Gebed; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="prayer-choice-card group p-5 text-left transition"
    >
      <p className="text-[10px] font-bold tracking-[0.2em] text-gold-deep uppercase">{g.wanneer}</p>
      <h4 className="font-display mt-1 text-lg font-semibold text-[#fbf3df]">{g.titel}</h4>
      <span className="btn-pill mt-3">
        Open gebed →
      </span>
    </button>
  );
}

export default function Gebeden() {
  const [zoek, setZoek] = useState('');
  const [actieveCat, setActieveCat] = useState<string | null>(null);
  const [popupGebed, setPopupGebed] = useState<Gebed | null>(null);

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
      <section id="gebeden" className="bg-bark">
        <img src="/images/heroes/hero-gebeden.png" width={2103} height={748} alt="Gebeden — het gebedenboek van de Kerk" className="block h-auto w-full" />
      </section>

      {/* Introductie */}
      <section className="orthodox-pattern bg-bark py-16 text-center text-cream sm:py-20">
        <div className={CONTENT}>
          <p className="text-[12px] font-bold tracking-[0.32em] text-gold-light uppercase sm:text-sm">Het gebedenboek</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-gold-light sm:text-4xl">Het gebed van de Kerk</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#d9c6a3] sm:text-lg">
            Morgengebeden, gebeden voor het slapengaan en gebeden door de dag, naar het Orthodox Gebedenboek volgens de
            Russische traditie. Tik een gebed aan om het groot te lezen.
          </p>
        </div>
      </section>

      {/* Gebedscategorieën / overzicht */}
      <section className="orthodox-pattern parchment-pattern bg-parchment py-14 text-ink sm:py-20">
        <div className={CONTENT}>
          <div className="mx-auto max-w-xl">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gold-deep" />
              <input
                type="text"
                value={zoek}
                onChange={(e) => setZoek(e.target.value)}
                placeholder="Zoek een gebed"
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
                ← Terug naar categorieën
              </button>
              <h3 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{huidigeCat.label}</h3>
              <p className="mt-2 text-sm text-ink-soft">{huidigeCat.omschrijving}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {huidigeCat.items.map((g) => (
                  <PrayerCard key={g.id} g={g} onOpen={() => setPopupGebed(g)} />
                ))}
              </div>
              {huidigeCat.id === 'jezusgebed' && (
                <a
                  href="#adem"
                  className="btn-pill mt-6"
                >
                  Ontdek de ademcyclus →
                </a>
              )}
            </div>
          ) : (
            <div className="prayer-category-grid mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categorieMetData.map((cat) => {
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActieveCat(cat.id)}
                    className="ornate-card group flex min-h-[240px] flex-col px-7 py-8 text-left"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold-light">
                      <img src={cat.iconSrc} alt="" className="provided-card-icon" />
                    </div>
                    <h3 className="font-display mt-6 text-[20px] font-semibold text-gold-light">{cat.label}</h3>
                    <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#d9c6a3] sm:text-base">{cat.omschrijving}</p>
                    <span className="btn-pill mt-4">Bekijk gebeden →</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Contemplatieve afsluiting */}
      <CycleTransition
        quote="De Heere Jezus is het midden van het gebed, het vasteland van de geest en het licht van de ziel."
        citation="Monastieke traditie"
        eyebrow="Gebed als leven"
        text="De ademcyclus is geen afzonderlijke liturgische cyclus van de Kerk, maar het kleinste ritme van het gebedsleven: de voortdurende gedachtenis aan Christus, die zich met iedere ademhaling kan verbinden."
        buttonLabel="Ontdek de ademcyclus"
        buttonHref="#adem"
      />

      <LiturgicalPopup open={popupGebed !== null} onClose={() => setPopupGebed(null)} content={popupContent} />
    </>
  );
}

