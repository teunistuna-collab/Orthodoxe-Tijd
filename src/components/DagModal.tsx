import { useEffect, useMemo, useState } from 'react';
import { BookOpenText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { addDays, dagInfo, formatDag, formatLang, parseYmd, ymd } from '../lib/kalender';
import { HEILIGEN } from '../lib/heiligen';
import { LEZINGEN_JAAR, lezingSoort, rangLabel, vertaalLeven, vertaalRef, vertaalTag } from '../lib/htc';
import { NIVEAUS } from '../lib/vasten';
import { FeestTag, VastenBadge } from './ui';
import Modal from './Modal';
import { vergrendelScroll } from '../lib/scrollLock';

interface Props {
  ymd: string | null;
  onClose: () => void;
  onNavigate: (ymd: string) => void;
}

export default function DagModal({ ymd: geselecteerd, onClose, onNavigate }: Props) {
  const { mode, vandaagYmd, htc, openLezing } = useApp();
  const [origineel, setOrigineel] = useState(false);

  const dag = useMemo(() => (geselecteerd ? dagInfo(parseYmd(geselecteerd), mode, vandaagYmd) : null), [geselecteerd, mode, vandaagYmd]);

  useEffect(() => {
    if (!geselecteerd) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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

  const curated = dag ? HEILIGEN[dag.kerkKey] ?? [] : [];
  const htcDag = dag ? htc?.[dag.kerkKey] : undefined;
  const lezingen = dag && dag.jaar === LEZINGEN_JAAR ? htc?.[dag.julianKey]?.r ?? [] : [];
  const niveau = dag ? NIVEAUS[dag.vasten.niveau] : null;

  if (!dag || !niveau) return null;

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={dag ? `${formatLang(dag.civil)}${mode === 'oud' ? ` · kerkelijk ${formatDag(dag.kerk)}` : ''}` : undefined}
      title={dag ? dag.feesten[0]?.naam ?? (curated[0] ? `H. ${curated[0].naam}` : htcDag?.l[0] ? vertaalLeven(htcDag.l[0][1]).replace(/\.$/, '') : 'Dag door het jaar') : ''}
      centerTitle
      maxWidth="max-w-4xl"
      actions={dag ? (
        <>
          {/* Op een smal scherm is in de titelbalk geen ruimte voor twee extra tikdoelen: daar staan ze in de balk onder de titel. */}
          <button type="button" onClick={() => onNavigate(ymd(addDays(dag.civil, -1)))} className="hidden rounded-full p-2 text-[#f0cf7b] hover:bg-white/10 sm:inline-block" aria-label="Vorige dag"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => onNavigate(ymd(addDays(dag.civil, 1)))} className="hidden rounded-full p-2 text-[#f0cf7b] hover:bg-white/10 sm:inline-block" aria-label="Volgende dag"><ChevronRight className="h-5 w-5" /></button>
        </>
      ) : undefined}
    >
            <div className="mb-5 flex items-center justify-between gap-3 sm:hidden">
              <button type="button" onClick={() => onNavigate(ymd(addDays(dag.civil, -1)))} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-gold/40 bg-[#f8f1e3] pl-2.5 pr-4 text-sm font-bold text-ink hover:border-gold"><ChevronLeft className="h-4 w-4" /> Vorige dag</button>
              <button type="button" onClick={() => onNavigate(ymd(addDays(dag.civil, 1)))} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-gold/40 bg-[#f8f1e3] pl-4 pr-2.5 text-sm font-bold text-ink hover:border-gold">Volgende dag <ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="space-y-7">
              {/* Vasten */}
              <div className="rounded-xl p-4" style={{ background: niveau.zacht, border: `1px solid ${niveau.kleur}33` }}>
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

              {/* Feesten */}
              {dag.feesten.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold tracking-[0.25em] text-gold-deep uppercase">Feesten & gedachtenissen</h3>
                  <ul className="mt-3 space-y-3">
                    {dag.feesten.map((f) => (
                      <li key={f.id} className="rounded-lg border border-parchment-3 bg-white/60 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-xl font-semibold">{f.naam}</span>
                          <FeestTag feest={f} />
                        </div>
                        {f.toelichting && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.toelichting}</p>}
                        {f.traditie && <p className="mt-2 text-sm leading-relaxed text-ink-soft"><span className="font-bold text-gold-deep">Gebruik: </span>{f.traditie}</p>}
                        {f.troparion && (
                          <blockquote className="font-display mt-3 border-l-2 border-gold pl-3 text-[17px] leading-relaxed text-ink italic">
                            {f.troparion}
                            <span className="mt-1 block text-xs font-bold tracking-wider text-gold-deep uppercase not-italic">Troparion</span>
                          </blockquote>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Heiligen */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold tracking-[0.25em] text-gold-deep uppercase">Heiligen van de dag</h3>
                  {htcDag && (
                    <button type="button" onClick={() => setOrigineel((v) => !v)} className="-mr-2 inline-flex min-h-11 items-center px-2 text-[11px] font-bold text-gold-deep underline-offset-2 hover:underline sm:min-h-0">
                      {origineel ? 'Nederlands' : 'Origineel (EN)'}
                    </button>
                  )}
                </div>
                {curated.length > 0 && (
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {curated.map((h) => (
                      <li key={h.naam} className="rounded-lg bg-parchment-2 p-3">
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-lg font-semibold">{h.naam}</span>
                          {h.nl && <span className="rounded-sm bg-wine px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-gold-light uppercase">Lage Landen</span>}
                        </div>
                        <div className="text-xs font-semibold text-gold-deep">{h.titel}</div>
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{h.kort}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {htcDag ? (
                  <ul className="mt-3 space-y-1.5 text-sm leading-snug">
                    {htcDag.l.map(([icon, tekst], i) => {
                      const r = rangLabel(icon);
                      return (
                        <li key={i} className="flex gap-2">
                          <span className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${r && r.rang >= 4 ? 'bg-gold' : 'bg-parchment-4'}`} />
                          <span className={r && r.rang >= 5 ? 'font-semibold' : ''}>
                            {origineel ? tekst : vertaalLeven(tekst)}
                            {r && <span className="ml-1.5 text-[10px] font-bold tracking-wider text-gold-deep uppercase">{r.label}</span>}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-ink-mute">{htc ? 'Geen gegevens voor deze dag.' : 'Heiligen worden geladen…'}</p>
                )}
                <p className="mt-2 text-[11px] text-ink-mute">Bron: holytrinityorthodox.com · kerkelijke datum {formatDag(dag.kerk)} · vertaling automatisch</p>
              </div>

              {/* Lezingen */}
              <div>
                <h3 className="flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-gold-deep uppercase">
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
                            className="flex w-full items-center justify-between gap-3 rounded-lg border border-parchment-3 bg-white/70 px-3 py-2 text-left transition hover:border-gold hover:bg-gold-pale"
                          >
                            <span>
                              <span className="block text-[10px] font-bold tracking-wider text-gold-deep uppercase">{vertaalTag(l.tag, refNl)}</span>
                              <span className="font-display text-lg font-semibold">{refNl}</span>
                            </span>
                            <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase ${soort === 'evangelie' ? 'bg-wine text-gold-light' : soort === 'oud' ? 'bg-parchment-3 text-ink' : 'bg-gold-pale text-gold-deep'}`}>
                              {soort === 'evangelie' ? 'Evangelie' : soort === 'oud' ? 'OT' : 'Apostel'}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-ink-mute">
                    {dag.jaar === LEZINGEN_JAAR ? (htc ? 'Geen lezingen gevonden voor deze dag.' : 'Lezingen worden geladen…') : `Het leesrooster is beschikbaar voor het kerkjaar ${LEZINGEN_JAAR}.`}
                  </p>
                )}
              </div>
            </div>
    </Modal>
  );
}
