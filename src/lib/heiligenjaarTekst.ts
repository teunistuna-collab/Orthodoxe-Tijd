import { useEffect, useState } from 'react';

// Volledige teksten uit het Heiligenjaar, per maand pas geladen als een leespop-up ze nodig heeft
// (public/data/heiligenjaar/MM.json, gemaakt door scripts/heiligenjaar.mjs).

export interface Vermelding {
  id: string;
  title: string;
  names?: string[];
  text: string[];
  type: 'saint' | 'feast' | 'other';
  needsReview?: boolean;
  sourceFile: string;
  sourceImages?: string[];
}
type Maand = { importVersion: number; days: Record<string, { sourceFile: string; sourceImages?: string[]; commemorations: Vermelding[] }> };

const maanden = new Map<string, Promise<Maand>>();

/** Maand van een id als 'hj-1004-3' → '10'. */
const maandVan = (id: string) => id.slice(3, 5);

export function laadMaand(mm: string): Promise<Maand> {
  let p = maanden.get(mm);
  if (!p) {
    p = fetch(`/data/heiligenjaar/${mm}.json`).then((r) => {
      if (!r.ok) throw new Error(`heiligenjaar ${mm}: ${r.status}`);
      return r.json() as Promise<Maand>;
    });
    p.catch(() => maanden.delete(mm));
    maanden.set(mm, p);
  }
  return p;
}

export async function laadVermelding(id: string): Promise<Vermelding | null> {
  const maand = await laadMaand(maandVan(id));
  for (const dag of Object.values(maand.days)) {
    const v = dag.commemorations.find((c) => c.id === id);
    if (v) return v;
  }
  return null;
}

/** De alinea's van een vermelding uit het Heiligenjaar; null zolang ze laden (of zonder id). */
export function useHeiligenjaarTekst(id: string | undefined): string[] | null {
  const [tekst, setTekst] = useState<{ id: string; alineas: string[] } | null>(null);
  useEffect(() => {
    if (!id) return;
    let actief = true;
    laadVermelding(id)
      .then((v) => { if (actief) setTekst({ id, alineas: v?.text ?? ['Deze tekst kon niet worden gevonden.'] }); })
      .catch(() => { if (actief) setTekst({ id, alineas: ['De tekst kon niet worden geladen. Controleer de verbinding en probeer het opnieuw.'] }); });
    return () => { actief = false; };
  }, [id]);
  return id && tekst?.id === id ? tekst.alineas : null;
}
