import { ChevronRight } from 'lucide-react';
import type { LeefTekst } from '../lib/leefVandaag';

// "Leef vandaag met de Kerk" (Vandaag, onder de kolommen): overweeg, bid en breng in praktijk.
// Inhoud: lib/leefVandaag.ts (redactioneel, per liturgische dag). Opmaak: Vandaag.css (.vg-leef).

export default function LeefVandaag({ inhoud }: { inhoud: LeefTekst }) {
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
    </section>
  );
}
