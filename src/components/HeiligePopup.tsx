import { useMemo, useState } from 'react';
import Modal from './Modal';
import { useApp } from '../lib/context';
import { formatMd } from '../lib/kalender';
import { lageLandenTekst } from '../lib/heiligenIconen';
import type { Resultaat } from '../lib/heiligenPopup';
import { useHeiligenjaarTekst } from '../lib/heiligenjaarTekst';

// Leesvenster van één heilige of gedachtenis, als een blad uit het Synaxarion: bovenaan de kerkelijke datum met
// vorige/volgende dag, de volledige tekst uit het Heiligenjaar (bij een Heilige van de Lage Landen eerst de eigen
// levensbeschrijving), daaronder "Op deze dag" (de andere vermeldingen van de dag, klikbaar), "Feest van de dag" en
// vorige/volgende heilige van dezelfde dag. Gebruikt door Vandaag, Kalender, Heiligen en Zoeken.

const LADEN = ['De tekst wordt geladen…'];

function sorteerMd(a: string, b: string) {
  const [am, ad] = a.split('-').map(Number);
  const [bm, bd] = b.split('-').map(Number);
  return am - bm || ad - bd;
}

function label(h: Resultaat) {
  if (h.nl) return 'Heilige van de Lage Landen';
  if (h.type === 'feast') return 'Feest van de dag';
  if (h.type === 'other') return 'Gedachtenis van de dag';
  return 'Heilige van de dag';
}

export default function HeiligePopup({ heilige, onClose }: { heilige: Resultaat | null; onClose: () => void }) {
  const { heiligen } = useApp();
  const [actief, setActief] = useState<Resultaat | null>(heilige);
  // Een andere heilige van buitenaf geopend: die tonen (state afleiden van de prop, zonder effect).
  const [vorigeProp, setVorigeProp] = useState(heilige);
  if (heilige !== vorigeProp) {
    setVorigeProp(heilige);
    setActief(heilige);
  }

  // Alle vermeldingen van de dag van de actieve heilige (zelfde volgorde als de bron; Lage Landen erachter).
  const dag = useMemo(() => (actief && heiligen ? (heiligen.HEILIGEN[actief.md] ?? []).map((h) => ({ ...h, md: actief.md, bron: h.nl ? 'nl' : 'hj' }) as Resultaat) : []), [actief, heiligen]);
  const vandeDag = dag.filter((h) => h.type !== 'feast');
  const feesten = dag.filter((h) => h.type === 'feast' && h.id !== actief?.id);
  const plek = actief ? vandeDag.findIndex((h) => h.id === actief.id) : -1;
  const vorigeH = plek > 0 ? vandeDag[plek - 1] : null;
  const volgendeH = plek >= 0 && plek < vandeDag.length - 1 ? vandeDag[plek + 1] : null;

  // Vorige/volgende kerkelijke dag: de eerste heilige van die dag.
  const dagen = useMemo(() => (heiligen ? Object.keys(heiligen.HEILIGEN).sort(sorteerMd) : []), [heiligen]);
  const naarDag = (stap: number) => {
    if (!actief || !heiligen) return;
    const i = dagen.indexOf(actief.md);
    const md = dagen[(i + stap + dagen.length) % dagen.length];
    const lijst = heiligen.HEILIGEN[md] ?? [];
    const h = lijst.find((x) => x.type === 'saint') ?? lijst[0];
    if (h) setActief({ ...h, md, bron: h.nl ? 'nl' : 'hj' });
  };

  const tekst = useHeiligenjaarTekst(actief ? (actief.nl ? actief.heiligenjaar : actief.id) : undefined);
  if (!actief) return null;
  const eigen = actief.nl ? lageLandenTekst(actief) ?? (actief.kort ? [actief.kort] : null) : null;
  const alineas = eigen ?? (actief.nl && !actief.heiligenjaar ? [] : tekst ?? LADEN);

  return (
    <Modal
      open
      onClose={onClose}
      lezen
      kopNav
      kopDatum={formatMd(actief.md)}
      onVorige={() => naarDag(-1)}
      onVolgende={() => naarDag(1)}
      vorigeLabel="Vorige dag"
      volgendeLabel="Volgende dag"
      eyebrow={label(actief)}
      title={actief.naam}
      ondertitel={actief.titel && actief.titel !== actief.naam ? actief.titel : undefined}
      inhoudSleutel={actief.id}
      maxWidth="max-w-3xl"
    >
      <div className="exact-popup-reading synax">
        <div className="exact-popup-prose">
          {alineas.map((p, i) => <p key={`${actief.id}-${i}`}>{p}</p>)}
        </div>
        {eigen && actief.heiligenjaar && (
          <section className="exact-popup-sectie">
            <h3>Uit het Heiligenjaar</h3>
            {(tekst ?? LADEN).map((p, i) => <p key={`hj-${i}`}>{p}</p>)}
          </section>
        )}

        {vandeDag.length > 1 && (
          <nav className="synax-blok synax-dag" aria-label="Op deze dag">
            <p className="synax-kop">Op deze dag</p>
            <ul>
              {vandeDag.map((h) => (
                <li key={h.id}>
                  <button type="button" onClick={() => setActief(h)} aria-current={h.id === actief.id ? 'true' : undefined}>{h.naam}</button>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {feesten.length > 0 && (
          <div className="synax-blok synax-feest">
            <p className="synax-kop">Feest van de dag</p>
            {feesten.map((f) => (
              <button key={f.id} type="button" onClick={() => setActief(f)}>{f.naam} <span aria-hidden="true">→</span></button>
            ))}
          </div>
        )}

        {(vorigeH || volgendeH) && (
          <nav className="synax-bladeren" aria-label="Vorige en volgende heilige van deze dag">
            {vorigeH ? <button type="button" onClick={() => setActief(vorigeH)} aria-label={`Vorige: ${vorigeH.naam}`}><span aria-hidden="true">←</span> {vorigeH.naam}</button> : <span />}
            <span className="synax-krul" aria-hidden="true" />
            {volgendeH ? <button type="button" onClick={() => setActief(volgendeH)} aria-label={`Volgende: ${volgendeH.naam}`}>{volgendeH.naam} <span aria-hidden="true">→</span></button> : <span />}
          </nav>
        )}
      </div>
    </Modal>
  );
}
