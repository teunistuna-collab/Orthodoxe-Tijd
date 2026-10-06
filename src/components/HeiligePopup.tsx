import { LiturgicalPopup } from './CycleSections';
import { popupContent, type Resultaat } from '../lib/heiligenPopup';
import { useHeiligenjaarTekst } from '../lib/heiligenjaarTekst';

// Leespop-up van één heilige of gedachtenis met de volledige tekst uit het Heiligenjaar (en bij een Heilige van de
// Lage Landen de eigen levensbeschrijving). Gebruikt door Vandaag, Kalender, de Heiligen-pagina en de dagpop-up.
export default function HeiligePopup({ heilige, onClose }: { heilige: Resultaat | null; onClose: () => void }) {
  const tekst = useHeiligenjaarTekst(heilige ? (heilige.nl ? heilige.heiligenjaar : heilige.id) : undefined);
  return <LiturgicalPopup lezen open={!!heilige} onClose={onClose} content={popupContent(heilige, tekst)} />;
}
