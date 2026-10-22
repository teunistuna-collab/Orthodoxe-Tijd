import Modal from './Modal';
import type { Deel } from './Leesbediening';
import type { PopupInhoud } from '../lib/cyclusTeksten';

export function GoldDivider() {
  return <div className="gold-rule my-8" />;
}

// Gedeeld donker overgangsblok (citaat links, tekst + knop rechts) voor alle cycluspagina's. De knop naar de volgende cyclus
// alleen vanaf tablet; op mobiel staan de cycli al onder Cycli in de onderbalk.
export function CycleTransition({
  quote,
  citation,
  eyebrow,
  text,
  buttonLabel,
  buttonHref,
}: {
  quote: string;
  citation: string;
  eyebrow: string;
  text: string;
  buttonLabel: string;
  buttonHref: string;
}) {
  return (
    <section className="orthodox-pattern box-border w-full overflow-hidden bg-bark text-cream">
      <div className="mx-auto box-border w-full max-w-[1500px] px-5 py-8 min-[900px]:px-16 min-[900px]:py-12">
        <div className="grid min-w-0 gap-8 min-[900px]:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] min-[900px]:items-center min-[900px]:gap-14">
          <div className="min-w-0 border-l border-gold/50 pl-6 min-[900px]:pl-8">
            <blockquote className="font-display text-xl leading-relaxed break-words text-gold-light italic sm:text-2xl min-[900px]:text-[26px]">
              “{quote}”
            </blockquote>
            <cite className="ot-label ot-label-licht mt-4 block not-italic">{citation}</cite>
          </div>
          <div className="min-w-0 text-left">
            <p className="ot-label ot-label-licht">{eyebrow}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed break-words text-[#d9c6a3] min-[900px]:text-lg">{text}</p>
            <a
              href={buttonHref}
              className="btn-pill cyclus-verder mt-6"
            >
              {buttonLabel} ›
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

type PopupContent = PopupInhoud;

export function LiturgicalPopup({ open, onClose, content, lezen = false, deel }: { open: boolean; onClose: () => void; content: PopupContent | null; lezen?: boolean; deel?: Deel }) {
  if (!open || !content) return null;

  return (
    <Modal open={open} onClose={onClose} eyebrow={content.eyebrow ?? 'Lees meer'} title={content.title} centerTitle maxWidth="max-w-3xl" lezen={lezen} deel={deel}>
      <div className="exact-popup-reading">
        {content.image && <img loading="lazy" decoding="async" src={content.image.src} alt={content.image.alt} className="exact-popup-icoon" />}
        {content.subtitle && <p className="exact-popup-subtitle">{content.subtitle}</p>}
        {content.highlight && <blockquote className="exact-popup-highlight">{content.highlight}</blockquote>}
        {content.paragraphs.length > 0 && (
          <div className="exact-popup-prose">
            {content.paragraphs.map((paragraph, index) => (
              <p key={`${content.title}-${index}`}>{paragraph}</p>
            ))}
          </div>
        )}
        {content.sections?.map((sectie, sectieIndex) => (
          <section key={`${content.title}-s${sectieIndex}`} className="exact-popup-sectie">
            {sectie.heading && <h3>{sectie.heading}</h3>}
            {sectie.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            {sectie.items && (
              <ul>
                {sectie.items.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            )}
            {sectie.after?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            {sectie.note && <p className="exact-popup-note">{sectie.note}</p>}
            {sectie.table && (
              <div className="exact-popup-tabel-wrap">
                <table className="exact-popup-tabel">
                  <thead>
                    <tr>{sectie.table.head.map((kolom) => <th key={kolom}>{kolom}</th>)}</tr>
                  </thead>
                  <tbody>
                    {sectie.table.rows.map((rij, rijIndex) => (
                      <tr key={rijIndex}>{rij.map((cel, celIndex) => <td key={celIndex}>{cel}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </Modal>
  );
}

export function TimeSanctificationTimeline({ current }: { current: string }) {
  const items = [
    { id: 'adem', label: 'ADEM', title: 'Christus in iedere ademhaling', href: '#adem', image: '/images/ui/medaillons/Adem.webp' },
    { id: 'etmaal', label: 'ETMAAL', title: 'Gebed door dag en nacht', href: '#etmaal', image: '/images/ui/medaillons/Etmaal.webp' },
    { id: 'week', label: 'WEEK', title: 'Iedere dag zijn gedachtenis', href: '#week', image: '/images/ui/medaillons/Week.webp' },
    { id: 'pascha', label: 'PASCHA', title: 'De weg van Kruis naar Verrijzenis', href: '#pascha', image: '/images/ui/medaillons/Pascha.webp' },
    { id: 'jaar', label: 'JAAR', title: 'Het gehele kerkelijke jaar geheiligd', href: '#jaar', image: '/images/ui/medaillons/Jaar.webp' },
  ];
  return <section className="v15-cycle-timeline"><p className="ot-label ot-label-licht mb-6 text-center">De heiliging van de tijd</p><div className="timeline-track">{items.map((item,index)=><div className="timeline-node" key={item.id}><a href={item.href} className={`timeline-core ${item.id===current?'active':''}`}><span className="timeline-medallion"><img loading="lazy" decoding="async" src={item.image} alt="" className="h-full w-full object-contain" /></span><span className="timeline-label">{item.label}</span><span className="timeline-title">{item.title}</span></a>{index<items.length-1&&<span className="timeline-line"/>}</div>)}</div></section>;
}
