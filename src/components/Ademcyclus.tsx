import { useState } from 'react';
import Cross from './Cross';
import Modal from './Modal';
import { CycleTransition, TimeSanctificationTimeline } from './CycleSections';

type PopupKey = 'wat' | 'jezusgebed' | 'gebedskoord' | 'hart';

type PopupContent = {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  highlight?: string;
};

// Inhoud rechtstreeks gebaseerd op "De orthodoxe ademcyclus.docx".
const POPUPS: Record<PopupKey, PopupContent> = {
  wat: {
    title: 'Wat is de ademcyclus?',
    subtitle: 'Een klein ritme binnen het leven van gebed',
    paragraphs: [
      "Met de naam ‘ademcyclus’ wordt hier geen officiële liturgische cyclus van de Orthodoxe Kerk bedoeld. De term wordt gebruikt als een ordenende naam voor het kleinste ritme van het gebedsleven: de voortdurende gedachtenis aan Christus, die zelfs de ademhaling kan begeleiden.",
      'Anders dan de etmaal-, week-, Paschale en jaarcyclus is dit dus geen onderdeel van het kerkelijk Typikon, maar een manier om het orthodoxe ideaal van het onophoudelijke gebed zichtbaar te maken.',
    ],
  },
  jezusgebed: {
    title: 'Het Jezusgebed',
    subtitle: 'Het hart van de ademcyclus',
    highlight: 'Heer Jezus Christus, Zoon van God, ontferm U over mij, zondaar.',
    paragraphs: [
      'In de orthodoxe geestelijke traditie is het Jezusgebed de meest kenmerkende vorm van het onophoudelijke gebed. Door de Naam van de Heer telkens opnieuw aan te roepen, keert het verstand terug tot Christus en wordt het hart geoefend in nederigheid, berouw en de voortdurende gedachtenis aan God.',
      'De woorden belijden tegelijk wie Christus is en wie de mens voor Hem is: Jezus is Heer, Christus en Zoon van God; de bidder vraagt niet om een techniek of een bijzondere ervaring, maar om ontferming. Het doel is de gemeenschap met God en een leven dat steeds opnieuw naar Hem wordt gekeerd.',
      'Binnen de hesychastische traditie is het Jezusgebed soms met de lichamelijke ademhaling verbonden: de ademhaling dient het gebed, het gebed dient niet de ademhaling. Iedere gelovige kan het eenvoudig en aandachtig bidden, ook tijdens de gewone bezigheden van de dag, zonder bijzondere lichaamshouding of ademtechniek. De specifieke hesychastische methoden, waarin ademhaling, houding en het ‘neerdalen van het verstand in het hart’ bewust worden geoefend, behoren traditioneel onder geestelijke begeleiding te worden beoefend. De techniek is nooit het doel; Christus is het middelpunt.',
    ],
  },
  gebedskoord: {
    title: 'Het gebedskoord',
    subtitle: 'Chotki en komboskini',
    paragraphs: [
      'Een chotki of komboskini kan helpen om het Jezusgebed aandachtig en regelmatig te herhalen. De knopen zijn geen doel op zichzelf en de ademhaling is geen teller.',
      'Het gebedskoord ondersteunt de gebedsregel en helpt de aandacht terug te brengen wanneer de gedachten afdwalen. De uiterlijke herhaling is gericht op een innerlijke werkelijkheid: de Naam van Jezus in gedachtenis bewaren.',
    ],
  },
  hart: {
    title: 'Gebed van het hart',
    subtitle: 'Van de lippen naar het hart',
    paragraphs: [
      'Het onophoudelijke gebed begint eenvoudig. Het gebed wordt uitgesproken met de lippen, vervolgens stiller en aandachtiger in het verstand, en de orthodoxe geestelijke schrijvers spreken uiteindelijk over het ‘gebed van het hart’: een toestand waarin de gedachtenis aan God het innerlijke leven steeds dieper doordringt. Dit is geen prestatie die door een ademritme kan worden afgedwongen, maar een gave die wordt gezocht in nederigheid, bekering en het sacramentele en liturgische leven van de Kerk.',
      'Naast het volledige Jezusgebed kent het orthodoxe leven korte aanroepingen en schietgebeden. Zij kunnen opkomen tijdens arbeid, reizen, wachten, vreugde, angst of verzoeking. Hun betekenis ligt niet in een vast ademschema, maar in het telkens terugkeren van hart en verstand tot God. Het Jezusgebed blijft daarbij de centrale en meest karakteristieke korte aanroeping.',
      'Onophoudelijk gebed vervangt de vaste gebeden van de Kerk niet. De orthodoxe traditie houdt beide samen: de gelovige heeft vaste tijden van gebed en neemt de gedachtenis aan God mee in de uren daartussen. Zolang er adem is, kan de Naam van de Heer worden aangeroepen. Zo wordt het kleinste ritme van het lichamelijke leven verbonden met de roeping van de apostel: ‘Bidt zonder ophouden.’',
    ],
  },
};

const CARDS: Array<{ key: PopupKey; title: string; intro: string; iconSrc: string }> = [
  {
    key: 'wat',
    title: 'Wat is de ademcyclus?',
    intro: 'Het kleinste ritme van het gebedsleven: de voortdurende gedachtenis aan Christus.',
    iconSrc: '/images/ui/menu/02-Gebed-01-Wat-is-de-ademcyclus.png',
  },
  {
    key: 'jezusgebed',
    title: 'Het Jezusgebed',
    intro: 'Heer Jezus Christus, Zoon van God, ontferm U over mij, zondaar — telkens opnieuw aangeroepen.',
    iconSrc: '/images/ui/menu/02-Gebed-02-Het-Jezusgebed.png',
  },
  {
    key: 'gebedskoord',
    title: 'Het gebedskoord',
    intro: 'De chotki helpt het gebed aandachtig te herhalen zonder de ademhaling tot een teller te maken.',
    iconSrc: '/images/ui/menu/02-Gebed-03-Het-gebedskoord.png',
  },
  {
    key: 'hart',
    title: 'Gebed van het hart',
    intro: 'Van de lippen, naar het verstand, tot een gebed dat het hart zelf doordringt.',
    iconSrc: '/images/ui/menu/02-Gebed-04-Gebed-van-het-hart.png',
  },
];

const TIMELINE_ITEMS = [
  { id: 'adem', label: 'ADEM', title: 'Christus in iedere\nademhaling', href: '#adem' },
  { id: 'etmaal', label: 'ETMAAL', title: 'Gebed door\ndag en nacht', href: '#etmaal' },
  { id: 'week', label: 'WEEK', title: 'Iedere dag\nzijn gedachtenis', href: '#week' },
  { id: 'pascha', label: 'PASCHA', title: 'De weg van Kruis\nnaar Verrijzenis', href: '#pascha' },
  { id: 'jaar', label: 'JAAR', title: 'Het gehele\nkerkelijke jaar geheiligd', href: '#jaar' },
];

const CONTENT = 'mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12';

// Zeer subtiele botanische tak ter decoratie (geen fotomateriaal beschikbaar).
function BranchOrnament({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 220" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M80 210 C 70 160, 90 120, 78 70 C 72 45, 84 20, 78 4" strokeLinecap="round" />
      <path d="M78 70 C 60 62, 45 68, 34 50" strokeLinecap="round" />
      <path d="M78 96 C 96 90, 108 98, 118 82" strokeLinecap="round" />
      <path d="M78 40 C 62 34, 52 40, 42 26" strokeLinecap="round" />
      <path d="M78 20 C 92 16, 100 22, 110 10" strokeLinecap="round" />
      <circle cx="34" cy="50" r="3.5" />
      <circle cx="118" cy="82" r="3.5" />
      <circle cx="42" cy="26" r="3" />
      <circle cx="110" cy="10" r="3" />
    </svg>
  );
}

// Zeer subtiel silhouet van een orthodoxe kerk/klooster ter decoratie.
function ChurchSilhouette({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 180" className={className} fill="currentColor">
      <rect x="20" y="120" width="180" height="50" />
      <rect x="40" y="90" width="38" height="30" />
      <rect x="142" y="90" width="38" height="30" />
      <rect x="86" y="60" width="48" height="60" />
      <path d="M86 60 L110 30 L134 60 Z" />
      <path d="M40 90 L59 68 L78 90 Z" />
      <path d="M142 90 L161 68 L180 90 Z" />
      <rect x="107" y="8" width="6" height="22" />
      <rect x="98" y="14" width="24" height="4" />
    </svg>
  );
}

export default function Ademcyclus() {
  const [popup, setPopup] = useState<PopupKey | null>(null);

  return (
    <>
      <section id="adem" className="bg-bark">
        <img src="/images/heroes/hero-adem.png" alt="Ademcyclus — het onophoudelijke gebed" className="block h-auto w-full" />
      </section>

      {/* Het Jezusgebed */}
      <section className="orthodox-pattern parchment-pattern bg-parchment py-16 text-ink sm:py-24">
        <div className={CONTENT}>
          <div className="mx-auto w-full max-w-none rounded-2xl border border-gold/45 bg-[#f8f1e3] px-6 py-12 shadow-[0_30px_70px_rgba(40,22,14,0.16)] sm:px-12 sm:py-16 lg:px-16">
            <p className="text-center text-[13px] font-bold tracking-[0.34em] text-gold-deep uppercase sm:text-sm">Het Jezusgebed</p>

            <div className="mx-auto mt-10 grid gap-12 lg:grid-cols-[7fr_6fr_7fr] lg:items-center lg:gap-8">
              <div className="text-center lg:text-left">
                <p className="font-display text-[28px] leading-[1.25] text-ink sm:text-[32px] lg:text-[34px]">
                  Heer Jezus Christus,
                  <br />
                  Zoon van God,
                  <br />
                  ontferm U over mij, zondaar.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative flex h-[180px] w-[180px] items-center justify-center rounded-full border-2 border-gold/70 sm:h-[200px] sm:w-[200px] lg:h-[220px] lg:w-[220px]">
                  <div className="absolute inset-4 rounded-full border border-gold/45" />
                  <div className="absolute inset-9 rounded-full border border-gold/30" />
                  <div className="absolute inset-14 rounded-full border border-gold/20" />
                  <Cross className="h-12 w-12 text-gold-deep sm:h-14 sm:w-14" />
                </div>
                <div className="text-center">
                  <p className="text-[12px] font-bold tracking-[0.3em] text-gold-deep uppercase sm:text-[13px]">Inademen</p>
                  <p className="mt-1 font-display text-lg text-ink-soft sm:text-xl">Heer Jezus Christus, Zoon van God</p>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <p className="text-[12px] font-bold tracking-[0.3em] text-gold-deep uppercase sm:text-[13px]">Uitademen</p>
                <p className="mt-1 font-display text-[26px] leading-[1.3] text-ink-soft sm:text-[28px]">
                  ontferm U over mij,
                  <br />
                  zondaar.
                </p>
              </div>
            </div>

            <div className="gold-rule my-10" />

            <p className="text-center font-display text-xl leading-relaxed text-ink-soft italic sm:text-2xl">
              De ademhaling dient het gebed;
              <br className="hidden sm:block" /> het gebed dient niet de ademhaling.
            </p>
          </div>
        </div>
      </section>

      {/* Vier informatiekaarten */}
      <section className="bg-parchment pb-16 sm:pb-24">
        <div className={CONTENT}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map(({ key, title, intro, iconSrc }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPopup(key)}
                className="ornate-card group flex min-h-[240px] flex-col px-7 py-8 text-left"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold-light">
                  <img src={iconSrc} alt="" className="provided-card-icon" />
                </div>
                <h3 className="font-display mt-6 text-[20px] font-semibold text-gold-light">{title}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#d9c6a3] sm:text-base">{intro}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Een levend ritme */}
      <section className="border-y border-gold/25 bg-[#f3eada] py-16 sm:py-20">
        <div className={CONTENT}>
          <div className="parchment-pattern relative overflow-hidden rounded-2xl border border-gold/40 bg-[#f8f1e3] px-6 py-12 shadow-[0_24px_55px_rgba(40,22,14,0.12)] sm:px-10 lg:px-14">
            <div className="grid items-center gap-10 lg:grid-cols-[0.7fr_2fr_0.7fr]">
              <BranchOrnament className="mx-auto hidden h-40 w-28 text-gold-deep/25 lg:block" />
              <div className="text-center">
                <div className="provided-inline-icons"><img src="/images/ui/menu/02-Gebed-05-De-betekenis-in-ons-leven.png" alt=""/><img src="/images/ui/menu/02-Gebed-06-Praktisch.png" alt=""/></div><p className="text-[13px] font-bold tracking-[0.32em] text-gold-deep uppercase sm:text-sm">Een levend ritme</p>
                <p className="mx-auto mt-5 max-w-2xl font-display text-lg leading-relaxed text-ink-soft italic sm:text-xl">
                  De ademcyclus is geen afzonderlijke liturgische cyclus van de Kerk, maar het kleinste ritme van het gebedsleven:
                  de voortdurende gedachtenis aan Christus, die zich met iedere ademhaling kan verbinden.
                </p>
              </div>
              <ChurchSilhouette className="mx-auto hidden h-24 w-36 text-gold-deep/20 lg:block" />
            </div>
          </div>
        </div>
      </section>

      {/* Quote + Van adem naar etmaal */}
      <CycleTransition
        quote="De Heere Jezus is het midden van het gebed, het vasteland van de geest en het licht van de ziel."
        citation="Monastieke traditie"
        eyebrow="Van adem naar etmaal"
        text="Wat in de adem begint als de voortdurende gedachtenis aan Christus, krijgt in de etmaalcyclus zijn vaste gestalte: de gebeden die de Kerk door dag en nacht heen bidt."
        buttonLabel="Ontdek de etmaalcyclus"
        buttonHref="#etmaal"
      />

      <TimeSanctificationTimeline current="adem" />

    </>
  );
}

