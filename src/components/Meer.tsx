import { ChevronRight } from 'lucide-react';
import { usePaginaOpen } from '../lib/paginaOpen';
import { useApp } from '../lib/context';
import { dagInfo, formatDag } from '../lib/kalender';
import { DERTIEN } from '../lib/feesten';
import { volgendeFeestDatum } from '../lib/overzicht';
import { eersteHeilige, heiligeTitel } from '../lib/heiligenPopup';
import { Sierlijn } from './MobielLaag';
import './etmaal-mobiel.css';
import './meer-mobiel.css';

// Meer (#meer): het overzicht achter Meer in de onderbalk, alleen op mobiel (App.tsx), volgens de mock-up meer: banner met
// de kloostergang (aangeleverd 26-10-2026, alleen verkleind), Heiligen met het icoon Christus de Ware Wijnstok
// (aangeleverd 03-11-2026, alleen omgezet naar webp), de verdieping als kaarten met een uitsnede van hun eigen
// banner en een regel van vandaag, en onderaan Instellingen en Bronnen als sobere tekstregels (mock-up: geen ronde pictogrammen).

type Regel = { id: string; titel: string; ondertitel: string; beeld: string; positie?: string };

const VERDIEPING: Regel[] = [
  { id: 'vasten', titel: 'Vasten', ondertitel: 'Vastenregels en vastenperioden', beeld: '/images/ontwerp/vasten-banner-800.webp', positie: '50% 60%' },
  { id: 'heiligen', titel: 'Heiligen', ondertitel: 'De heiligen en hun levens', beeld: '/images/meer/heiligen-wijnstok.webp', positie: '50% 28%' },
  { id: 'feesten', titel: 'Feesten', ondertitel: 'De feesten van het kerkelijk jaar', beeld: '/images/feesten/laatste-avondmaal-banner.webp', positie: '50% 30%' },
  { id: 'boeken', titel: 'Boeken', ondertitel: 'Een kleine orthodoxe bibliotheek', beeld: '/images/boeken/boeken-banner.webp', positie: '40% 50%' },
];
const OVER: Array<{ id: string; titel: string; ondertitel: string }> = [
  { id: 'instellingen', titel: 'Instellingen', ondertitel: 'Jouw voorkeuren en pijlgebed' },
  { id: 'bronnen', titel: 'Bronnen', ondertitel: 'Bronnen en verwijzingen' },
];

export default function Meer() {
  const open = usePaginaOpen('meer');
  const { vandaag, vandaagYmd, mode, heiligen } = useApp();
  // Een regel van vandaag, alleen uit bestaande gegevens (de vastenregel, de eerste heilige van de dag, het volgende feest)
  const dag = dagInfo(vandaag, mode, vandaagYmd);
  const heilige = eersteHeilige(heiligen?.HEILIGEN[dag.kerkKey]);
  const feest = DERTIEN.map((f) => ({ f, d: volgendeFeestDatum(f, vandaag, mode) })).sort((a, b) => a.d.getTime() - b.d.getTime())[0];
  const nu: Record<string, string | undefined> = {
    vasten: `Vandaag: ${dag.vasten.label}`,
    heiligen: heilige ? `Vandaag: ${heiligeTitel(heilige.naam)}` : undefined,
    feesten: feest ? `${feest.d.getTime() === vandaag.getTime() ? 'Vandaag' : 'Volgende'}: ${feest.f.kort ?? feest.f.naam} · ${formatDag(feest.d)}` : undefined,
  };
  return (
    <section id="meer" className="am mm">
      <div className="em-banner mm-banner">
        <img
          src="/images/ontwerp/meer-gang-800.webp"
          srcSet="/images/ontwerp/meer-gang-800.webp 800w, /images/ontwerp/meer-gang-1536.webp 1536w"
          sizes="100vw"
          alt=""
          width={1536}
          height={1024}
          loading={open ? 'eager' : 'lazy'}
          decoding="async"
        />
        <p className="am-merk mm-merk">Orthodoxe Tijd</p>
        <div className="em-banner-tekst">
          <h1 className="em-titel">Meer</h1>
          <Sierlijn />
          <p className="am-onder">Verdieping en informatie</p>
        </div>
      </div>
      <nav className="mm-papier" aria-label="Verdieping en informatie">
        <h2 className="mm-label">Verdieping</h2>
        <ul className="mm-lijst">
          {VERDIEPING.map(({ id, titel, ondertitel, beeld, positie }) => (
            <li key={id}>
              <a className="mm-kaart mm-met-beeld" href={`#${id}`}>
                <span className="mm-beeld" aria-hidden="true">
                  <img src={beeld} alt="" loading={open ? undefined : 'lazy'} decoding="async" style={positie ? { objectPosition: positie } : undefined} />
                </span>
                <span className="mm-tekst">
                  <b>{titel}</b>
                  <span>{ondertitel}</span>
                  {nu[id] && <span className="mm-nu">{nu[id]}</span>}
                </span>
                <ChevronRight className="mm-pijl" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <h2 className="mm-label">Overige</h2>
        <ul className="mm-lijst mm-klein">
          {OVER.map(({ id, titel, ondertitel }) => (
            <li key={id}>
              <a className="mm-kaart" href={`#${id}`}>
                <span className="mm-tekst">
                  <b>{titel}</b>
                  <span>{ondertitel}</span>
                </span>
                <ChevronRight className="mm-pijl" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
