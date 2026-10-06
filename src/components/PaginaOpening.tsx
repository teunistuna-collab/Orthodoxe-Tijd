import type { ReactNode } from 'react';

// Opening van een pagina, als het begin van een hoofdstuk in een kerkboek (index.css, Bouw 165). Drie soorten:
// - rustig: label, titel, ondertitel, kleine sierlijn (Adem, Gebeden, Psalmen);
// - cyclisch: daarbij het eigen medaillon van de cyclus en een kleuraccent (Etmaal, Week, Jaar);
// - hoogfeest: donker anker met een eigen beeld naast de titel (Pascha, Feesten).
// Alleen bestaande beelden gebruiken; zonder beeld blijft de opening gewoon tekst.

type Props = {
  id: string;
  soort?: 'rustig' | 'cyclisch' | 'hoogfeest';
  label?: string;
  titel: string;
  ondertitel?: string;
  beeld?: { src: string; alt: string };
  children?: ReactNode;
};

export default function PaginaOpening({ id, soort = 'rustig', label, titel, ondertitel, beeld, children }: Props) {
  return (
    <section id={id} className={`opening opening-${soort}`}>
      <div className="opening-binnen">
        {beeld && <img className="opening-beeld" src={beeld.src} alt={beeld.alt} width={192} height={192} decoding="async" />}
        <div className="opening-tekst">
          {label && <p className="opening-label">{label}</p>}
          <h1 className="opening-titel">{titel}</h1>
          {ondertitel && <p className="opening-onder">{ondertitel}</p>}
          <span className="opening-sierlijn" aria-hidden="true" />
          {children}
        </div>
      </div>
    </section>
  );
}
