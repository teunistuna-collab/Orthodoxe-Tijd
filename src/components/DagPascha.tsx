import { useEffect, useMemo } from 'react';
import { useApp } from '../lib/context';
import { dagInfo, daysBetween, formatDatum, formatLang, orthodoxPascha, parseYmd } from '../lib/kalender';
import { PAASCYCLUS } from '../lib/feesten';
import Modal from './Modal';
import { vergrendelScroll } from '../lib/scrollLock';

interface Props {
  ymd: string | null;
  onClose: () => void;
}

const dagen = (n: number) => `${n} ${n === 1 ? 'dag' : 'dagen'}`;

function Regel({ label, waarde, klein }: { label: string; waarde: string; klein?: string }) {
  return (
    <div className="rounded-lg border border-parchment-3 bg-white/70 px-4 py-3">
      <p className="text-[11px] font-bold tracking-wider text-gold-deep uppercase">{label}</p>
      <p className="font-display text-2xl leading-snug font-semibold">{waarde}</p>
      {klein && <p className="mt-0.5 text-[13px] text-ink-soft">{klein}</p>}
    </div>
  );
}

// Pop-up "Paschale cyclus" voor één dag: is het een dag uit de Paascyclus (zoals op de Pascha-pagina), dan tonen we welke;
// anders het aantal dagen tot Pascha, de kerkelijke tijd (bijv. "11e week na Pinksteren") en de toon.
export default function DagPascha({ ymd: gekozen, onClose }: Props) {
  const { mode, vandaagYmd } = useApp();
  const dag = useMemo(() => (gekozen ? dagInfo(parseYmd(gekozen), mode, vandaagYmd) : null), [gekozen, mode, vandaagYmd]);

  // Scroll vastzetten; Escape en de terugknop sluiten via de gedeelde pop-upstapel (lib/terug.ts).
  useEffect(() => {
    if (!gekozen) return;
    return vergrendelScroll();
  }, [gekozen]);

  if (!dag) return null;

  const cyclusDagen = PAASCYCLUS.filter((f) => f.offset === dag.offset);
  const positie = dag.offset === 0 ? 'Heilig Pascha' : dag.offset > 0 ? `${dagen(dag.offset)} na Pascha` : `${dagen(-dag.offset)} voor Pascha`;

  // Volgende Pascha: dit jaar als het nog moet komen, anders dat van volgend jaar.
  const volgendePascha = dag.offset < 0 ? dag.pascha : orthodoxPascha(dag.jaar + 1);
  const totPascha = daysBetween(dag.civil, volgendePascha);

  return (
    <Modal open onClose={onClose} eyebrow={formatLang(dag.civil)} title="Paschale cyclus" centerTitle maxWidth="max-w-xl">
      {cyclusDagen.length > 0 ? (
        <div className="grid gap-3">
          {cyclusDagen.map((f) => (
            <Regel key={f.id} label="Vandaag in de Paschale cyclus" waarde={f.naam} klein={positie} />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          <Regel label="Tot Pascha" waarde={dagen(totPascha)} klein={`Pascha: ${formatDatum(volgendePascha)}`} />
          <Regel label="Kerkelijke tijd" waarde={dag.seizoen} />
          <Regel label="Toon" waarde={dag.toon ? `Toon ${dag.toon}` : 'Geen vaste toon'} />
        </div>
      )}
    </Modal>
  );
}
