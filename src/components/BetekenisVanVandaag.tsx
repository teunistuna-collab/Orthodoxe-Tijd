import { useMemo, useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { formatKort, type DagInfo } from '../lib/kalender';
import type { PopupInhoud } from '../lib/cyclusTeksten';
import { betekenisVoor, type Tekstdeel } from '../lib/betekenisVanVandaag';
import { LiturgicalPopup } from './CycleSections';
import KleurVanDeDag from './KleurVanDeDag';
import { useApp } from '../lib/context';

// "De betekenis van vandaag" (lib/betekenisVanVandaag.ts): alleen tijdens de Paascyclus of de Geboortecyclus, anders niets. Bovenaan direct
// zichtbaar de liturgische kleur en (op Vandaag) de periode in de Paascyclus; daaronder compacte rijen met "Lees meer →",
// die de inhoud in het bestaande venster openen. Onderdelen zonder inhoud worden weggelaten. Opmaak: Vandaag.css (.bv).

const I = '/images/vandaag/iconen';
type Kaart = { sleutel: string; titel: string; kort: string; icoon: ReactNode; popup: PopupInhoud };

const metBron = (titel: string, d: Tekstdeel, voor: Partial<PopupInhoud> = {}): PopupInhoud => ({
  title: titel,
  eyebrow: d.concept ? `Concept · ${d.soort ?? 'Lees meer'}` : d.soort ?? 'Lees meer',
  paragraphs: [d.tekst],
  ...voor,
  sections: [{ note: `Bron: ${d.bron}${d.concept ? '. Deze tekst is een concept en wordt nog gecontroleerd.' : ''}` }],
});
const kortVan = (d: Tekstdeel, tekst = d.soort ?? '') => (d.concept ? `Concept · ${tekst}` : tekst);
const icoon = (bestand: string, b: number, h: number) => <img className="bv-icoon" src={`${I}/${bestand}`} alt="" aria-hidden="true" width={b} height={h} decoding="async" />;

export default function BetekenisVanVandaag({ dag, opPascha = false }: { dag: DagInfo; opPascha?: boolean }) {
  const { mode } = useApp();
  const b = useMemo(() => betekenisVoor(dag, mode), [dag, mode]);
  const [open, setOpen] = useState<PopupInhoud | null>(null);
  if (!b) return null;

  const kaarten: Kaart[] = [];
  if (b.icoon)
    kaarten.push({
      sleutel: 'icoon',
      titel: 'Icoon van de dag',
      kort: b.icoon.naam,
      icoon: <img className="bv-icoon bv-icoon-rond" src={b.icoon.beeld} alt="" aria-hidden="true" width={b.icoon.breedte} height={b.icoon.hoogte} decoding="async" />,
      popup: {
        title: b.icoon.naam,
        eyebrow: b.icoon.periodeIcoon ? 'Icoon van de periode' : 'Icoon van de dag',
        image: { src: b.icoon.beeld, alt: b.icoon.naam },
        paragraphs: [b.icoon.betekenis, ...(b.icoon.schrift ? [`Schrift: ${b.icoon.schrift}.`] : []), ...(b.icoon.periodeIcoon ? ['Dit icoon past bij de periode; het is niet de icoon die aan deze dag is verbonden.'] : [])],
        sections: [{ note: `Bron: ${b.icoon.bron}` }],
      },
    });
  if (b.liturgie)
    kaarten.push({
      sleutel: 'liturgie',
      titel: b.liturgie.titel,
      kort: kortVan(b.liturgie),
      icoon: icoon('02_vasten_feesten_kalender.webp', 66, 71),
      popup: metBron(b.liturgie.titel, b.liturgie, { paragraphs: [b.liturgie.tekst, 'Dit is de liturgische gedachtenis van de dag. De diensten en hun tijden verschillen per parochie; kijk in het rooster van uw eigen parochie.'] }),
    });
  if (b.hymne)
    kaarten.push({
      sleutel: 'hymne',
      titel: b.hymne.titel,
      kort: kortVan(b.hymne),
      icoon: icoon('01_gebedsuur_lamp.webp', 81, 75),
      popup: metBron(b.hymne.titel, b.hymne, { highlight: b.hymne.tekst, paragraphs: [] }),
    });
  if (b.traditie)
    kaarten.push({ sleutel: 'traditie', titel: b.traditie.titel, kort: kortVan(b.traditie), icoon: icoon('03_heiligen_kruis.webp', 69, 77), popup: metBron(b.traditie.titel, b.traditie) });
  if (b.kerkvader)
    kaarten.push({ sleutel: 'kerkvader', titel: b.kerkvader.titel, kort: kortVan(b.kerkvader), icoon: icoon('05_lezingen_boek.webp', 68, 63), popup: metBron(b.kerkvader.titel, b.kerkvader, { highlight: b.kerkvader.tekst, paragraphs: [] }) });
  if (b.weetje)
    kaarten.push({ sleutel: 'weetje', titel: b.weetje.titel, kort: kortVan(b.weetje, b.weetje.tekst), icoon: icoon('02_vasten_feesten_kalender.webp', 66, 71), popup: metBron(b.weetje.titel, b.weetje) });

  return (
    <section className="bv" aria-labelledby={opPascha ? 'bv-kop-pascha' : 'bv-kop'}>
      <h2 id={opPascha ? 'bv-kop-pascha' : 'bv-kop'} className="vg-label bv-kop">De betekenis van vandaag</h2>
      <div className="bv-direct">
        <KleurVanDeDag dag={dag} />
        {!opPascha && (
          <a className="bv-fase" href={b.link}>
            <span className="bv-fase-tekst">
              <span className="bv-fase-label">{b.cyclus === 'pascha' ? 'Paascyclus' : 'Geboortecyclus'}</span> {b.periode.label}
              <span className="bv-fase-bereik">
                {' · '}
                {formatKort(b.periode.van)}
                {b.periode.van.getTime() !== b.periode.tot.getTime() && ` – ${formatKort(b.periode.tot)}`}
              </span>
            </span>
            <ChevronRight aria-hidden="true" />
          </a>
        )}
      </div>
      {kaarten.length > 0 && (
        <ul className="bv-lijst">
          {kaarten.map((k) => (
            <li key={k.sleutel}>
              <button type="button" className="bv-rij" onClick={() => setOpen(k.popup)}>
                <span className="bv-rij-icoon">{k.icoon}</span>
                <span className="bv-rij-tekst">
                  <b>{k.titel}</b>
                  {k.kort && <small>{k.kort}</small>}
                </span>
                <span className="bv-meer">Lees meer <span aria-hidden="true">›</span></span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <LiturgicalPopup open={open !== null} onClose={() => setOpen(null)} content={open} lezen />
    </section>
  );
}
