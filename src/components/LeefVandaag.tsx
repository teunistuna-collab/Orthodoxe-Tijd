import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { LeefTekst } from '../lib/leefVandaag';
import { schriftCitaat, schriftLink, schriftRef, type Schriftwoord } from '../lib/schrift';

// "Leef vandaag met de Kerk" (Vandaag, onder de kolommen): overweeg, bid, breng in praktijk en een schriftwoord.
// Inhoud: lib/leefVandaag.ts (redactioneel, per liturgische dag). Het schriftwoord toont alleen een verwijzing, tenzij
// lib/schrift.ts een gecontroleerd citaat heeft. Opmaak: Vandaag.css (.vg-leef).

export default function LeefVandaag({ inhoud }: { inhoud: LeefTekst }) {
  const [citaat, setCitaat] = useState<{ voor: Schriftwoord; tekst: string | null } | null>(null);
  useEffect(() => {
    const w = inhoud.schrift;
    if (!w) return;
    let actief = true;
    schriftCitaat(w).then((tekst) => actief && setCitaat({ voor: w, tekst })).catch(() => {});
    return () => {
      actief = false;
    };
  }, [inhoud.schrift]);
  const tekst = citaat && citaat.voor === inhoud.schrift ? citaat.tekst : null;
  const link = inhoud.schrift ? schriftLink(inhoud.schrift) : null;

  return (
    <section className="vg-leef" aria-labelledby="vg-leef-kop">
      <h2 id="vg-leef-kop" className="vg-leef-titel">Leef vandaag met de Kerk</h2>
      <img className="vg-sierlijn vg-leef-sierlijn" src="/images/vandaag/sierlijn.svg" alt="" aria-hidden="true" width={480} height={40} />
      <div className="vg-leef-delen">
        <div className="vg-leef-deel">
          <h3 className="vg-label">Overweeg</h3>
          <p>{inhoud.overweeg}</p>
        </div>
        <div className="vg-leef-deel">
          <h3 className="vg-label">Bid</h3>
          <p>{inhoud.bid}</p>
          {inhoud.link && (
            <a className="vg-leef-link" href={inhoud.link.href}>
              {inhoud.link.label}
              <ChevronRight aria-hidden="true" />
            </a>
          )}
        </div>
        <div className="vg-leef-deel">
          <h3 className="vg-label">Breng in praktijk</h3>
          <p>{inhoud.praktijk}</p>
        </div>
      </div>
      {inhoud.schrift && (
        <figure className="vg-leef-schrift">
          <figcaption className="vg-label">Schriftwoord</figcaption>
          {tekst && <blockquote>{tekst}</blockquote>}
          <cite>
            {link ? (
              <a href={link.href} {...(link.extern ? { target: '_blank', rel: 'noreferrer', 'aria-label': `${schriftRef(inhoud.schrift)}, lezen in de NBV21 (opent debijbel.nl)` } : {})}>
                {schriftRef(inhoud.schrift)}
                <ChevronRight aria-hidden="true" />
              </a>
            ) : (
              schriftRef(inhoud.schrift)
            )}
          </cite>
        </figure>
      )}
    </section>
  );
}
