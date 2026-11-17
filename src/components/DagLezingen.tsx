import { useEffect, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { datumMetKerk, dagInfo, parseYmd, type DagInfo } from '../lib/kalender';
import { groepeerLezingen, roosterMelding, type HtcLezingRef } from '../lib/htc';
import Modal from './Modal';
import { vergrendelScroll } from '../lib/scrollLock';

interface Props {
  ymd: string | null;
  onClose: () => void;
}

/** De Schriftlezingen van een dag, gegroepeerd: "Lezingen van de dag" en per heilige "Lezingen voor …" (lib/htc.ts
 *  groepeerLezingen). Gedeeld door het leesvenster (Vandaag, Kalender) en het dagvenster, zodat beide hetzelfde tonen.
 *  Een tik op een lezing opent de tekst in de lezingen-pop-up. */
export function LezingenGroepen({ lezingen, dag, Kop = 'h3' }: { lezingen: HtcLezingRef[]; dag: DagInfo; Kop?: 'h3' | 'h4' }) {
  const { openLezing } = useApp();
  const groepen = useMemo(() => groepeerLezingen(lezingen), [lezingen]);
  if (!groepen.length) return <p className="text-sm text-ink-mute">{roosterMelding(dag.ymd)}</p>;
  return (
    <div className="dl-groepen">
      {groepen.map((g) => (
        <section key={g.titel} className="dl-groep">
          <Kop className="dl-groep-kop">{g.titel}</Kop>
          <ul className="grid gap-2">
            {g.lezingen.map((l, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => openLezing({ ref: l.ref, tag: l.tag, julianKey: dag.julianKey, civil: dag.civil })}
                  className="dl-rij flex w-full items-center justify-between gap-3 rounded-lg border border-parchment-3 bg-white/70 px-4 py-3 text-left transition hover:border-gold hover:bg-gold-pale"
                >
                  <span className="dl-tekst">
                    <span className="dl-type">{l.type}</span>
                    <span className="dl-ref font-display text-xl font-semibold">{l.refNl}</span>
                  </span>
                  <ChevronRight className="dl-pijl" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// Pop-up met uitsluitend de Schriftlezingen van één dag (geen heiligen, vasten of feesten).
export default function DagLezingen({ ymd: gekozen, onClose }: Props) {
  const { mode, vandaagYmd, rooster, vraagRooster } = useApp();
  useEffect(() => {
    if (gekozen) vraagRooster(gekozen);
  }, [gekozen, vraagRooster]);
  const dag = useMemo(() => (gekozen ? dagInfo(parseYmd(gekozen), mode, vandaagYmd) : null), [gekozen, mode, vandaagYmd]);

  // Scroll vastzetten; Escape en de terugknop sluiten via de gedeelde pop-upstapel (lib/terug.ts).
  useEffect(() => {
    if (!gekozen) return;
    return vergrendelScroll();
  }, [gekozen]);

  if (!dag) return null;
  return (
    <Modal open onClose={onClose} eyebrow={datumMetKerk(dag.civil, mode)} title="Schriftlezingen" centerTitle maxWidth="max-w-xl">
      <LezingenGroepen lezingen={rooster?.[dag.ymd] ?? []} dag={dag} />
    </Modal>
  );
}
