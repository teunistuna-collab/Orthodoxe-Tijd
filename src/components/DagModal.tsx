import { useEffect, useMemo, useState } from 'react';
import { BookOpenText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { addDays, dagInfo, formatDag, formatLang, parseYmd, ymd } from '../lib/kalender';
import { lezingSoort, roosterMelding, vertaalRef, vertaalTag } from '../lib/htc';
import { NIVEAUS } from '../lib/vasten';
import { FeestTag, VastenBadge } from './ui';
import Modal from './Modal';
import DeelKnop from './DeelKnop';
import { vergrendelScroll } from '../lib/scrollLock';
import { eersteHeilige, feestenUitHeiligenjaar, heiligeTitel, heiligenVanDag, type Resultaat } from '../lib/heiligenPopup';
import { FEEST_HEILIGENJAAR, GEKOPPELDE_FEESTTEKSTEN } from '../lib/feestHeiligenjaar';
import type { Heilige } from '../lib/heiligen';
import HeiligePopup from './HeiligePopup';

interface Props {
  ymd: string | null;
  onClose: () => void;
  onNavigate: (ymd: string) => void;
}

// Heilige of gedachtenis als kaartje (tik = volledige tekst); `los` = in het "Meer"-lijstje, anders met bovenmarge onder de kop.
function HeiligeKaart({ h, los = false, onOpen }: { h: Heilige; los?: boolean; onOpen: () => void }) {
  const kaart = (
    <li><button type="button" onClick={onOpen} className="dag-blok w-full text-left">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-lg font-semibold">{h.naam}</span>
        {h.nl && <span className="rounded-sm bg-wine px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-gold-light uppercase">Lage Landen</span>}
      </div>
      {h.titel && h.titel !== h.naam && <div className="text-xs font-semibold text-gold-deep">{h.titel}</div>}
      {h.kort && h.kort !== h.naam && h.kort !== h.titel && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{h.kort}</p>}
      <span className="mt-1 block text-sm text-gold-deep">Lees ›</span>
    </button></li>
  );
  return los ? kaart : <ul className="mt-3">{kaart}</ul>;
}

export default function DagModal({ ymd: geselecteerd, onClose, onNavigate }: Props) {
  const { mode, vandaagYmd, rooster, vraagRooster, heiligen, openLezing } = useApp();
  const [leesFeest, setLeesFeest] = useState<Resultaat | null>(null);

  const dag = useMemo(() => (geselecteerd ? dagInfo(parseYmd(geselecteerd), mode, vandaagYmd) : null), [geselecteerd, mode, vandaagYmd]);

  useEffect(() => {
    if (!geselecteerd) return;
    // Escape sluit via de gedeelde pop-upstapel (lib/terug.ts); hier alleen bladeren met de pijltjes.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && dag) onNavigate(ymd(addDays(dag.civil, -1)));
      if (e.key === 'ArrowRight' && dag) onNavigate(ymd(addDays(dag.civil, 1)));
    };
    window.addEventListener('keydown', onKey);
    const ontgrendel = vergrendelScroll();
    return () => {
      window.removeEventListener('keydown', onKey);
      ontgrendel();
    };
  }, [geselecteerd, dag, onClose, onNavigate]);

  useEffect(() => {
    if (geselecteerd) vraagRooster(geselecteerd);
  }, [geselecteerd, vraagRooster]);

  // Heiligen en gedachtenissen uit de centrale lijst (Heiligenjaar + Lage Landen), in de volgorde van de bron;
  // feesten uit het Heiligenjaar die niet al als feest van de site op deze dag staan, komen bij de feesten.
  const curated = dag ? heiligenVanDag(dag.kerkKey, heiligen?.HEILIGEN, dag.ymd) : [];
  const extraFeesten = dag ? feestenUitHeiligenjaar(dag.kerkKey, heiligen?.HEILIGEN, dag.ymd).filter((f) => !GEKOPPELDE_FEESTTEKSTEN.has(f.id)) : [];
  const eerste = eersteHeilige(curated);
  const lezingen = dag ? rooster?.[dag.ymd] ?? [] : [];
  const niveau = dag ? NIVEAUS[dag.vasten.niveau] : null;

  if (!dag || !niveau) return null;

  return (
    <>
    <Modal
      open
      onClose={onClose}
      eyebrow={dag ? `${formatLang(dag.civil)}${mode === 'oud' ? ` · kerkelijk ${formatDag(dag.kerk)}` : ''}` : undefined}
      title={dag ? dag.feesten[0]?.naam ?? (eerste ? heiligeTitel(eerste.naam) : 'Dag door het jaar') : ''}
      centerTitle
      maxWidth="max-w-4xl"
      onVorige={() => onNavigate(ymd(addDays(dag.civil, -1)))}
      onVolgende={() => onNavigate(ymd(addDays(dag.civil, 1)))}
      actions={dag ? (
        <>
          {/* Op een smal scherm is in de titelbalk geen ruimte voor twee extra tikdoelen: daar staan ze in de balk onder de titel. */}
          <button type="button" onClick={() => onNavigate(ymd(addDays(dag.civil, -1)))} className="hidden rounded-full p-2 text-[#f0cf7b] hover:bg-white/10 sm:inline-block" aria-label="Vorige dag"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => onNavigate(ymd(addDays(dag.civil, 1)))} className="hidden rounded-full p-2 text-[#f0cf7b] hover:bg-white/10 sm:inline-block" aria-label="Volgende dag"><ChevronRight className="h-5 w-5" /></button>
          <DeelKnop titel={formatLang(dag.civil)} pad={`kalender/${dag.ymd}`} className="dag-deel hidden rounded-full p-2 text-[#f0cf7b] hover:bg-white/10 sm:inline-block" />
        </>
      ) : undefined}
    >
            <div className="dag-navrij mb-5 flex items-center justify-between gap-3 sm:hidden">
              <button type="button" onClick={() => onNavigate(ymd(addDays(dag.civil, -1)))} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-gold/40 bg-[#f8f1e3] pl-2.5 pr-4 text-sm font-bold text-ink hover:border-gold"><ChevronLeft className="h-4 w-4" /> Vorige dag</button>
              <DeelKnop titel={formatLang(dag.civil)} pad={`kalender/${dag.ymd}`} className="dag-deel inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-gold/40 bg-[#f8f1e3] text-ink hover:border-gold" />
              <button type="button" onClick={() => onNavigate(ymd(addDays(dag.civil, 1)))} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-gold/40 bg-[#f8f1e3] pl-4 pr-2.5 text-sm font-bold text-ink hover:border-gold">Volgende dag <ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="space-y-7">
              {/* Vasten */}
              <div className="dag-blok">
                <div className="flex flex-wrap items-center gap-3">
                  <VastenBadge regel={dag.vasten} size="lg" />
                  <span className="text-sm font-semibold" style={{ color: niveau.tekst }}>
                    {niveau.toegestaan}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: niveau.tekst }}>
                  {dag.vasten.detail}
                </p>
              </div>

              {/* Feesten (logica en metadata uit lib/feesten.ts; tekst uit het Heiligenjaar waar gekoppeld) */}
              {(dag.feesten.length > 0 || extraFeesten.length > 0) && (
                <div>
                  <h3 className="ot-label dag-kop">Feesten & gedachtenissen</h3>
                  <ul className="mt-3 space-y-3">
                    {dag.feesten.map((f) => (
                      <li key={f.id} className="dag-blok">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-xl font-semibold">{f.naam}</span>
                          <FeestTag feest={f} />
                        </div>
                        {!FEEST_HEILIGENJAAR[f.id] && f.toelichting && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.toelichting}</p>}
                        {!FEEST_HEILIGENJAAR[f.id] && f.traditie && <p className="mt-2 text-sm leading-relaxed text-ink-soft"><span className="font-bold text-gold-deep">Gebruik: </span>{f.traditie}</p>}
                        {!FEEST_HEILIGENJAAR[f.id] && f.troparion && (
                          <blockquote className="font-display mt-3 border-l-2 border-gold pl-3 text-[17px] leading-relaxed text-ink italic">
                            {f.troparion}
                            <span className="mt-1 block text-xs font-bold tracking-wider text-gold-deep uppercase not-italic">Troparion</span>
                          </blockquote>
                        )}
                        {FEEST_HEILIGENJAAR[f.id] && (
                          <button type="button" className="today-link mt-3" onClick={() => setLeesFeest({ id: FEEST_HEILIGENJAAR[f.id], md: dag.kerkKey, naam: f.naam, titel: '', kort: '', type: 'feast', bron: 'hj' })}>
                            Uit het Heiligenjaar ›
                          </button>
                        )}
                      </li>
                    ))}
                    {extraFeesten.map((f) => (
                      <li key={f.id}>
                        <button type="button" onClick={() => setLeesFeest(f)} className="dag-blok w-full text-left">
                          <span className="font-display text-xl font-semibold">{f.naam}</span>
                          <span className="mt-1 block text-sm text-gold-deep">Lees ›</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Heiligen en andere gedachtenissen (Heiligenjaar en Heiligen van de Lage Landen) */}
              <div>
                <h3 className="ot-label dag-kop">Heiligen van de dag</h3>
                {/* Eén heilige zichtbaar, de rest onder "Meer", zodat de lezingen niet ver naar beneden verdwijnen */}
                {curated.length > 0 ? (
                  <HeiligeKaart h={curated[0]} onOpen={() => setLeesFeest(curated[0])} />
                ) : (
                  <p className="mt-2 text-sm text-ink-mute">{heiligen ? 'Geen gegevens voor deze dag.' : 'Heiligen worden geladen…'}</p>
                )}
                {curated.length > 1 && (
                  <details className="dag-meer mt-3">
                    <summary>Meer heiligen en gedachtenissen ({curated.length - 1})</summary>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                      {curated.slice(1).map((h) => <HeiligeKaart key={h.id} h={h} los onOpen={() => setLeesFeest(h)} />)}
                    </ul>
                  </details>
                )}
              </div>

              {/* Lezingen */}
              <div>
                <h3 className="ot-label dag-kop">
                  <BookOpenText className="h-3.5 w-3.5" /> Schriftlezingen
                </h3>
                {lezingen.length > 0 ? (
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {lezingen.map((l, i) => {
                      const refNl = vertaalRef(l.ref);
                      const soort = lezingSoort(refNl);
                      return (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => openLezing({ ref: l.ref, tag: l.tag, julianKey: dag.julianKey, civil: dag.civil })}
                            className="dag-lezing flex w-full items-center justify-between gap-3 text-left"
                          >
                            <span>
                              <span className="block text-[10px] font-bold tracking-wider text-gold-deep uppercase">{vertaalTag(l.tag, refNl)}</span>
                              <span className="font-display text-lg font-semibold">{refNl}</span>
                            </span>
                            <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase ${soort === 'evangelie' ? 'bg-wine text-gold-light' : soort === 'oud' ? 'bg-parchment-3 text-ink' : 'bg-gold-pale text-gold-deep'}`}>
                              {soort === 'evangelie' ? 'Evangelie' : soort === 'oud' ? 'OT' : 'Apostel'}
                            </span>
                            <span className="pijl" aria-hidden="true">›</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-ink-mute">
                    {roosterMelding(dag.ymd)}
                  </p>
                )}
              </div>
            </div>
    </Modal>
    <HeiligePopup heilige={leesFeest} onClose={() => setLeesFeest(null)} />
    </>
  );
}
