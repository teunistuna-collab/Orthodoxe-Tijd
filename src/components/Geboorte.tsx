import { useMemo, useState } from 'react';
import { useApp } from '../lib/context';
import { useDesktop, useMobiel } from '../lib/desktop';
import GeboorteMobiel from './GeboorteMobiel';
import { bereikLang, dagInfo, formatDag, formatDatum, ymd } from '../lib/kalender';
import { GROTE_FEESTEN } from '../lib/feesten';
import type { PopupInhoud } from '../lib/cyclusTeksten';
import { geboortecyclusVoor, type GeboorteKey } from '../lib/geboortecyclus';
import { BRON_CONCEPT, GEBOORTE_GEBRUIKEN, GEBOORTE_INTRO, GEBOORTE_UITLEG, GEBOORTE_VERDIEPING, GEBOORTE_WEETJES, KERKVADERS, type GeboorteInfoKey } from '../lib/geboorteInhoud';
import { usePaginaOpen } from '../lib/paginaOpen';
import NisKop from './NisKop';
import { Sierlijn } from './onderdelen';
import CyclusTijdlijn from './CyclusTijdlijn';
import BetekenisVanVandaag from './BetekenisVanVandaag';
import ExactPageFrame from './ExactPageFrame';
import Verdieping from './Verdieping';
import { LiturgicalPopup } from './CycleSections';
import './Vandaag.css';
import './ontwerp.css';

// De Geboortecyclus (#geboorte): het hele jaar te openen, in dezelfde opbouw als Pascha. Bovenaan de huidige periode (of
// "Naar de Geboorte" met de aftelling), de tijdlijn met de twaalf perioden (lib/geboortecyclus.ts), de uitleg van de
// bekeken periode en, alleen tijdens de cyclus, "De betekenis van vandaag". Daaronder de algemene inhoud.
// Inhoud: lib/geboorteInhoud.ts (concepten, gemarkeerd) en de gecontroleerde feestteksten uit lib/feesten.ts.

const KERSTMIS = GROTE_FEESTEN.find((f) => f.id === 'kerstmis')!;
const THEOFANIE = GROTE_FEESTEN.find((f) => f.id === 'theofanie')!;
const dagen = (n: number) => `${n} ${n === 1 ? 'dag' : 'dagen'}`;
const CONCEPT_NOOT = { note: `Concept: ${BRON_CONCEPT}.` };

const INFO: Record<GeboorteInfoKey, PopupInhoud> = {
  menswording: {
    title: 'De menswording',
    eyebrow: 'Concept · De Geboortecyclus',
    highlight: KERKVADERS.menswording.tekst,
    paragraphs: [GEBOORTE_INTRO, `Bron van het citaat: ${KERKVADERS.menswording.bron}.`],
    sections: [{ heading: 'Gregorius de Theoloog', paragraphs: [KERKVADERS.geboorte.tekst, `Bron: ${KERKVADERS.geboorte.bron}.`] }, CONCEPT_NOOT],
  },
  iconen: {
    title: 'De iconen',
    eyebrow: 'Concept · De Geboortecyclus',
    image: { src: '/images/feesten/kerst.jpg', alt: 'Icoon van de Geboorte van Christus' },
    paragraphs: [
      'Op de traditionele icoon van de Geboorte ligt het Kind in een kribbe in een grot, gewikkeld in doeken; de os en de ezel buigen zich over Hem. De Moeder Gods rust naast de kribbe. Boven straalt de ster; engelen verkondigen het nieuws aan de herders en de wijzen naderen met hun geschenken. Onderaan zit Jozef in gedachten, terwijl het Kind wordt gewassen (Lucas 2:1–20; Matteüs 2:1–12).',
      'Op de icoon van Theofanie staat Christus in de Jordaan; Johannes de Voorloper legt zijn hand op Zijn hoofd. Van boven daalt de Heilige Geest neer als een duif, in een lichtstraal uit de hemel waar de stem van de Vader klinkt; aan de oever staan engelen met doeken (Matteüs 3:13–17).',
    ],
    sections: [{ heading: 'Belangrijke iconen van de cyclus', items: ['De heilige voorouders van Christus', 'De heilige vaders vóór de Geboorte', 'De Geboorte van Christus', 'De Synaxis van de Moeder Gods', 'De heilige Jozef de Verloofde', 'De Besnijdenis des Heren', 'De heilige Basilius de Grote', 'De Doop van Christus (Theofanie)', 'De Synaxis van Johannes de Voorloper'] }, { note: 'Op de site: de Geboorte, de Synaxis van de Moeder Gods, de Besnijdenis, Theofanie en Johannes de Voorloper, en daarnaast Filippus, de Intrede, Nicolaas, Stefanus en de kinderen van Bethlehem. Nog te verzamelen: de voorouders, de vaders en Jozef. Teksten: concept.' }],
  },
  liturgie: {
    title: 'Voorbereiding en viering',
    eyebrow: 'Concept · De Geboortecyclus',
    paragraphs: [],
    sections: [
      { heading: 'De Geboortevasten', paragraphs: [GEBOORTE_UITLEG.vasten] },
      { heading: 'De vooravond en de Koninklijke Uren', paragraphs: [GEBOORTE_UITLEG.vooravond] },
      { heading: 'De Geboorte van Christus', paragraphs: [GEBOORTE_UITLEG.geboorte, KERSTMIS.toelichting ?? ''].filter(Boolean) },
      { heading: 'Theofanie en de Grote Waterwijding', paragraphs: [GEBOORTE_UITLEG['vooravond-theofanie'], THEOFANIE.toelichting ?? ''].filter(Boolean) },
      { heading: 'Hymnen', items: [`Troparion van de Geboorte (toon 4): ${KERSTMIS.troparion}`, `Troparion van Theofanie (toon 1): ${THEOFANIE.troparion}`] },
      { note: 'Diensttijden verschillen per parochie. De troparia: eigen Nederlandse weergave (zie Bronnen); overige teksten: concept.' },
    ],
  },
  gebruiken: {
    title: 'Gebruiken en symboliek',
    eyebrow: 'Concept · De Geboortecyclus',
    paragraphs: [],
    sections: [
      { heading: 'Kerkelijke tradities', items: [GEBOORTE_GEBRUIKEN.vasten?.tekst, GEBOORTE_GEBRUIKEN.geboorte?.tekst, GEBOORTE_GEBRUIKEN['voorfeest-theofanie']?.tekst, THEOFANIE.traditie].filter((t): t is string => !!t) },
      { heading: 'Slavische volksgebruiken', paragraphs: [KERSTMIS.traditie ?? ''].filter(Boolean), after: ['Volksgebruiken zijn mooie gewoonten, maar geen kerkelijke verplichting.'] },
      { heading: 'Symboliek', items: (['voorfeest', 'vooravond', 'geboorte', 'vaders', 'voorouders', 'theofanie'] as GeboorteKey[]).map((k) => GEBOORTE_WEETJES[k]) },
      CONCEPT_NOOT,
    ],
  },
};

export default function Geboorte() {
  const { vandaag, vandaagYmd, mode } = useApp();
  const open = usePaginaOpen('geboorte');
  const desktop = useDesktop();
  const cyclus = useMemo(() => geboortecyclusVoor(vandaag, mode), [vandaag, mode]);
  const dag = useMemo(() => dagInfo(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);
  const cyclusId = ymd(cyclus.geboorte);
  const [keuze, setKeuze] = useState<{ cyclus: string; stap: GeboorteKey } | null>(null);
  const gekozen = keuze?.cyclus === cyclusId ? keuze.stap : null;
  const huidige = cyclus.huidige;
  const bekeken = gekozen ?? huidige;
  const stap = bekeken ? cyclus.stappen.find((s) => s.key === bekeken) ?? null : null;
  const isNu = !!stap && stap.key === huidige;
  const [popup, setPopup] = useState<PopupInhoud | null>(null);
  const eerste = cyclus.stappen[0];
  // Mobiel: de eigen weergave volgens de mock-up (GeboorteMobiel.tsx), met dezelfde gegevens en verdieping.
  const mobiel = useMobiel();
  if (mobiel) return <GeboorteMobiel info={INFO} />;

  const periodePopup = (k: GeboorteKey): PopupInhoud => {
    const s = cyclus.stappen.find((x) => x.key === k)!;
    return { title: s.label, eyebrow: `Concept · ${bereikLang(s.van, s.tot)} ${s.tot.getUTCFullYear()}`, paragraphs: [GEBOORTE_UITLEG[k], `Weetje: ${GEBOORTE_WEETJES[k]}`], sections: [CONCEPT_NOOT] };
  };

  return (
    <>
      <section id="geboorte" className="vg ot-redesign ot-pascha ot-geboorte">
        <NisKop
          open={open}
          balk
          terug="#cycli"
          label="De Geboortecyclus"
          titel="Het Licht komt in de wereld"
          ondertitel="Van de stilte van het vasten tot de vreugde van Christus’ geboorte en Zijn openbaring in de Jordaan."
        />
        <div className="vg-papier ot-inhoud">
          <div className={desktop ? 'ot-pc-desk' : 'ot-pc-m'}>
            <div className="ot-pc-ctx">
              <header className="ot-pc-ctx-kop">
                {stap ? (
                  <>
                    <p className="vg-label">{isNu ? 'De huidige periode' : 'Periode in de Geboortecyclus'}</p>
                    <h2 className={desktop ? 'ot-titel' : 'ot-titel ot-pc-m-titel'}>
                      {stap.label}
                      {isNu && <span className="ot-nu">Nu</span>}
                    </h2>
                    <p className="ot-pc-bereik">
                      {bereikLang(stap.van, stap.tot)} {stap.tot.getUTCFullYear()}
                    </p>
                    <button type="button" className="ot-tekstknop ot-pc-bekijk" onClick={() => setPopup(periodePopup(stap.key))}>
                      Bekijk deze periode ›
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className={desktop ? 'ot-titel' : 'ot-titel ot-pc-m-titel'}>Naar de Geboorte</h2>
                    <p className="ot-pc-datum">{formatDatum(cyclus.geboorte)}</p>
                  </>
                )}
                <Sierlijn />
                {(!stap || isNu) && cyclus.dagenTotGeboorte > 0 && <p className="ot-pc-nog">Nog {dagen(cyclus.dagenTotGeboorte)} tot de Geboorte</p>}
              </header>

              {stap ? (
                <section className="ot-pc-sectie" aria-labelledby="gb-betekenis">
                  <h2 id="gb-betekenis" className="vg-label">Wat betekent deze periode?</h2>
                  <p className="ot-pc-tekst">{GEBOORTE_UITLEG[stap.key]}</p>
                  <button type="button" className="ot-tekstknop ot-pc-meer" onClick={() => setPopup(periodePopup(stap.key))}>
                    Lees meer over deze periode ›
                  </button>
                </section>
              ) : (
                <p className="ot-pc-tekst ot-pc-midden">
                  De Geboortevasten begint op {formatDag(eerste.van)} {eerste.van.getUTCFullYear()}. Kies een periode op de tijdlijn om te lezen wat zij betekent.
                </p>
              )}

              {/* Alleen tijdens de cyclus en bij de huidige periode */}
              {isNu && <BetekenisVanVandaag dag={dag} opPascha />}

              {gekozen && gekozen !== huidige && (
                <button type="button" className="ot-tekstknop ot-pc-terug" onClick={() => setKeuze(null)}>
                  ‹ {huidige ? 'Terug naar de huidige periode' : 'Terug naar het overzicht'}
                </button>
              )}
            </div>

            <CyclusTijdlijn stappen={cyclus.stappen} huidige={huidige} bekeken={bekeken} label="De Geboortecyclus" onKies={(k) => setKeuze({ cyclus: cyclusId, stap: k })} />
          </div>
        </div>
      </section>

      {/* Algemene inhoud, het hele jaar: de menswording, het feest met zijn troparion en de verdieping */}
      <ExactPageFrame title="De Geboorte">
        <div className="pc-pagina bg-parchment text-ink">
          <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12">
            <section className="pc-feest" aria-labelledby="gb-feest-titel">
              <h2 id="gb-feest-titel" className="pc-feest-titel">De Geboorte van Christus</h2>
              <p className="pc-feest-onder">God wordt mens</p>
              <p className="pc-feest-tekst">{GEBOORTE_INTRO}</p>
              <p className="pascha-groet">„Christus is geboren!” <span>„Verheerlijkt Hem!”</span></p>
              <div className="pc-feest-vakken">
                <div className="pc-vak jr-vak">
                  <p className="pc-vak-label">Troparion · toon 4</p>
                  <p className="pc-tropaar">{KERSTMIS.troparion}</p>
                </div>
              </div>
              <Verdieping items={GEBOORTE_VERDIEPING} onOpen={(k) => setPopup(INFO[k])} />
            </section>
          </div>
        </div>
      </ExactPageFrame>

      <LiturgicalPopup open={popup !== null} onClose={() => setPopup(null)} content={popup} lezen />
    </>
  );
}
