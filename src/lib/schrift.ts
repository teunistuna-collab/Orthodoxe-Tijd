import { laadPsalmTeksten } from './psalmen';

// Schriftwoord: één plek voor verwijzingen en (later) gecontroleerde citaten, voor "Leef vandaag met de Kerk" en, zodra de
// eigen LXX-vertaling er is, ook de Psalmen-pagina. Regels:
// - Bijbel buiten de Psalmen: alleen de NBV21, en een citaat alleen als de exacte tekst en de publicatierechten zijn
//   gecontroleerd (NBV21_CITATEN). Anders alleen de verwijzing.
// - Psalmen: alleen de eigen Nederlandse vertaling van de Septuaginta (LXX-nummering). Die is nog niet aangeleverd;
//   tot dan staat LXX_EIGEN_VERTALING uit en verschijnt alleen de verwijzing. De bestaande teksten in
//   public/data/psalmen.json (uit de aangeleverde PDF's) worden hier bewust niet gebruikt.
//   Activeren: de vertaling in public/data/psalmen.json zetten (zelfde vorm: PsalmTekst met genummerde verzen, zie
//   scripts/psalmen-uit-pdf.mjs) en LXX_EIGEN_VERTALING op true zetten; Psalmen-pagina en Vandaag lezen dan dezelfde bron.

export type Schriftwoord =
  | { soort: 'nbv21'; ref: string }
  /** Psalm met LXX-nummering; mt = Hebreeuws nummer (zoals in de NBV21) als hulp voor de lezer */
  | { soort: 'psalm'; lxx: number; vers: number; mt?: number };

/** Gecontroleerde NBV21-citaten (verwijzing → exacte tekst). Leeg tot tekst en rechten zijn gecontroleerd. */
const NBV21_CITATEN: Record<string, string> = {};

/** Aan zodra de eigen LXX-vertaling in public/data/psalmen.json staat. */
const LXX_EIGEN_VERTALING = false;

export const schriftRef = (w: Schriftwoord): string =>
  w.soort === 'nbv21' ? w.ref : `Psalm ${w.lxx}:${w.vers} (LXX${w.mt ? `; ${w.mt} in de Hebreeuwse telling` : ''})`;

/** Het gecontroleerde citaat, of null: dan wordt alleen de verwijzing getoond. */
export async function schriftCitaat(w: Schriftwoord): Promise<string | null> {
  if (w.soort === 'nbv21') return NBV21_CITATEN[w.ref] ?? null;
  if (!LXX_EIGEN_VERTALING) return null;
  const tekst = (await laadPsalmTeksten())[String(w.lxx)];
  const vers = tekst?.verzen.find((v) => v.n === w.vers);
  return vers ? vers.regels.join(' ') : null;
}
