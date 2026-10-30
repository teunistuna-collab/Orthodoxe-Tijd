import { useState, useSyncExternalStore } from 'react';
import { ChevronRight } from 'lucide-react';
import { JAAR_INFO } from '../lib/cyclusTeksten';
import { Kop, Laag, LeesWeergave, PopupTekst, Sierlijn } from './MobielLaag';
import DeelKnop from './DeelKnop';
import Leesbediening from './Leesbediening';
import { SIERKRUIS } from './symbolen';
import './etmaal-mobiel.css';
import './week-mobiel.css';

// Jaar op mobiel (mock-up jaar), zelfde opbouw als Week (WeekMobiel.tsx): 1. overzicht met de tijd van nu, de zes
// seizoenen van het heil, de feesten en de verdieping; 2. een seizoen (#jaar/<tijd>) met banner en de bestaande tekst;
// 3. de verdieping (#jaar/lees/<onderwerp>). Inhoud uit Jaarcyclus.tsx (PERIOD_POPUPS, "De orthodoxe jaarcyclus.docx")
// en lib/cyclusTeksten.ts (JAAR_INFO). Banner: aangeleverd op 26-10-2026, voor nu voor elk seizoen dezelfde.

export type JaarTijd = { key: string; label: string; short: string; movable: boolean };
export type JaarTekst = { title: string; subtitle?: string; paragraphs: string[]; highlight?: string };
export type JaarNoot = { tekst: string; kop: string };

const BANNER = { src: '/images/jaar/banner-900.webp', srcSet: '/images/jaar/banner-900.webp 900w, /images/jaar/banner-1672.webp 1672w' };
const VERDIEPING = (Object.keys(JAAR_INFO) as Array<keyof typeof JAAR_INFO>).map((key) => ({ key, titel: JAAR_INFO[key].title }));

// Bestaande pagina's die bij een seizoen horen.
const GEBOORTE = { href: '#geboorte', titel: 'Geboorte', onder: 'Het feest van de Geboorte van Christus' };
const PASCHA = { href: '#pascha', titel: 'Pascha', onder: 'Het feest van de Verrijzenis' };
const VERBONDEN: Record<string, Array<{ href: string; titel: string; onder: string }>> = {
  kersttijd: [GEBOORTE, { href: '#feesten', titel: 'Feesten', onder: 'De Twaalf Grote Feesten' }],
  openbaringstijd: [{ href: '#feesten', titel: 'Feesten', onder: 'De Twaalf Grote Feesten' }],
  vastentijd: [PASCHA, { href: '#vasten', titel: 'Vasten', onder: 'Een weg van gebed en onthouding' }],
  passietijd: [PASCHA],
  paschatijd: [PASCHA],
  pinkstertijd: [PASCHA],
};

const volgHash = (f: () => void) => {
  window.addEventListener('hashchange', f);
  return () => window.removeEventListener('hashchange', f);
};
const useOnderdeel = () => useSyncExternalStore(volgHash, () => decodeURIComponent(window.location.hash).match(/^#jaar\/(.+)$/)?.[1] ?? '');

function Overzicht({ tijden, nu, komend, inleiding }: { tijden: JaarTijd[]; nu: string; komend: { titel: string; tekst: string }; inleiding: string }) {
  const nuTijd = tijden.find((t) => t.key === nu) ?? tijden[0];
  return (
    <section id="jaar" className="am em wm">
      <div className="em-banner wm-banner">
        <img src={BANNER.src} srcSet={BANNER.srcSet} sizes="100vw" alt="" width={1672} height={941} decoding="async" />
        <div className="em-banner-tekst">
          <p className="am-merk">Orthodoxe Tijd</p>
          <h1 className="em-titel">Jaar</h1>
          <p className="am-onder">Het kerkelijk jaar</p>
          <Sierlijn />
        </div>
      </div>
      <div className="em-papier">
        <a className="em-nu" href={`#jaar/${nuTijd.key}`}>
          <span className="em-nu-tekst">
            <span className="am-label">Nu in het kerkelijk jaar</span>
            <b>{nuTijd.label}</b>
            <span>{nuTijd.short}</span>
          </span>
          <ChevronRight className="am-pijl" aria-hidden="true" />
        </a>
        <Sierlijn />
        <h2 className="am-label em-kop">De seizoenen van het heil</h2>
        <p className="wm-inleiding">{inleiding}</p>
        <ul className="em-lijst wm-lijst">
          {tijden.map((t) => (
            <li key={t.key}>
              <a className={t.key === nu ? 'is-nu' : undefined} href={`#jaar/${t.key}`} aria-current={t.key === nu ? 'true' : undefined}>
                <span className="wm-dag">
                  <b>{t.label}</b>
                  <small>{t.short}{t.movable ? ' · beweeglijk' : ''}</small>
                </span>
                <ChevronRight className="am-pijl" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <Sierlijn />
        <h2 className="am-label em-kop">Feesten</h2>
        <ul className="em-lijst wm-lijst">
          <li>
            <a href="#feesten">
              <span className="wm-dag"><b>{komend.titel}</b><small>{komend.tekst}</small></span>
              <ChevronRight className="am-pijl" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href="#feesten">
              <span className="wm-dag"><b>Vaste feesten</b><small>De feesten van de vaste jaarcyclus</small></span>
              <ChevronRight className="am-pijl" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href="#pascha">
              <span className="wm-dag"><b>Beweeglijke feesten</b><small>De feesten van de Paschacyclus</small></span>
              <ChevronRight className="am-pijl" aria-hidden="true" />
            </a>
          </li>
        </ul>
        <Sierlijn />
        <h2 className="am-label em-kop">Verdieping</h2>
        <ul className="em-lijst wm-verdieping">
          {VERDIEPING.map(({ key, titel }) => (
            <li key={key}>
              <a href={`#jaar/lees/${key}`}>
                <span className="em-kaart-kruis">{SIERKRUIS}</span>
                <span className="wm-verd-titel">{titel}</span>
                <ChevronRight className="am-pijl" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Een seizoen: banner met de naam en de korte omschrijving, daaronder de bestaande tekst; geen beeld onderaan.
function Seizoen({ tijd, tekst, noten }: { tijd: JaarTijd; tekst: JaarTekst; noten: JaarNoot[] }) {
  const [bediening, setBediening] = useState(false);
  const eigen = tekst.paragraphs.filter((p) => !noten.some((n) => n.tekst === p));
  const gedeeld = noten.filter((n) => tekst.paragraphs.includes(n.tekst));
  const verbonden = VERBONDEN[tijd.key] ?? [];
  return (
    <Laag className="em-laag em-dienst wm-dagweergave" label={tijd.label}>
      <Kop
        terug="#jaar"
        merk
        rechts={
          <>
            <button type="button" className="am-knopje am-aa" aria-expanded={bediening} aria-label="Tekstgrootte en avondweergave" onClick={() => setBediening((b) => !b)}>
              Aa
            </button>
            <DeelKnop titel={tijd.label} pad={`jaar/${tijd.key}`} className="am-knopje" />
          </>
        }
      />
      {bediening && <Leesbediening className="am-lb wm-lb" />}
      <div className="em-dienst-beeld wm-dag-beeld">
        <img src={BANNER.src} srcSet={BANNER.srcSet} sizes="100vw" alt="" width={1672} height={941} decoding="async" />
        <div className="em-dienst-tekst">
          <h1 className="em-titel" tabIndex={-1}>{tijd.label}</h1>
          <p className="em-dienst-onder">{tijd.short}</p>
          <Sierlijn />
        </div>
      </div>
      <article className="wm-tekst lees-vlak">
        <div className="lees-tekst">
          {tekst.subtitle && (
            <section>
              <h2 className="am-label">Plaats in het kerkelijk jaar</h2>
              <p>{tekst.subtitle}</p>
            </section>
          )}
          {tekst.highlight && (
            <section>
              <h2 className="am-label">Feesten</h2>
              <p>{tekst.highlight}</p>
            </section>
          )}
          {eigen.length > 0 && (
            <section>
              <Sierlijn />
              <h2 className="am-label">Betekenis</h2>
              {eigen.map((p, i) => <p key={i}>{p}</p>)}
            </section>
          )}
          {gedeeld.map((n) => (
            <section key={n.kop}>
              <Sierlijn />
              <h2 className="am-label">{n.kop}</h2>
              <p>{n.tekst}</p>
            </section>
          ))}
          {verbonden.length > 0 && (
            <section>
              <Sierlijn />
              <h2 className="am-label">Verbonden pagina’s</h2>
              {verbonden.map((v) => (
                <a key={v.href} className="em-kaart wm-kalender" href={v.href}>
                  <span className="em-kaart-tekst">
                    <b>{v.titel}</b>
                    <span>{v.onder}</span>
                  </span>
                  <ChevronRight className="am-pijl" aria-hidden="true" />
                </a>
              ))}
            </section>
          )}
          <section>
            <Sierlijn />
            <h2 className="am-label">Verdieping</h2>
            <a className="em-kaart wm-kalender" href="#jaar/lees/jaarcyclus">
              <span className="em-kaart-kruis">{SIERKRUIS}</span>
              <span className="em-kaart-tekst">
                <b>Lees meer</b>
                <span>{JAAR_INFO.jaarcyclus.title}</span>
              </span>
              <ChevronRight className="am-pijl" aria-hidden="true" />
            </a>
          </section>
        </div>
      </article>
    </Laag>
  );
}

export default function JaarMobiel({ tijden, teksten, noten, nu, komend, inleiding }: { tijden: JaarTijd[]; teksten: Record<string, JaarTekst>; noten: JaarNoot[]; nu: string; komend: { titel: string; tekst: string }; inleiding: string }) {
  const onderdeel = useOnderdeel();
  const [eerste, tweede] = onderdeel.split('/');
  const tijd = tijden.find((t) => t.key === eerste);
  const info = eerste === 'lees' && tweede && tweede in JAAR_INFO ? (tweede as keyof typeof JAAR_INFO) : null;
  return (
    <>
      <Overzicht tijden={tijden} nu={nu} komend={komend} inleiding={inleiding} />
      {tijd && <Seizoen tijd={tijd} tekst={teksten[tijd.key]} noten={noten} />}
      {info && (
        <LeesWeergave className="em-laag em-lees" titel={JAAR_INFO[info].title} ondertitel={JAAR_INFO[info].subtitle} terug="#jaar" deelPad={`jaar/lees/${info}`} boven={<span className="em-ornament">{SIERKRUIS}</span>}>
          <PopupTekst inhoud={JAAR_INFO[info]} />
        </LeesWeergave>
      )}
    </>
  );
}
