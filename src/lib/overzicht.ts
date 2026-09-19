import { DERTIEN, OVERIGE_VASTE, type Feest } from './feesten';
import { addDays, civilVanKerkdatum, daysBetween, orthodoxPascha, utc, type Mode } from './kalender';

export interface FeestDatum {
  feest: Feest;
  datum: Date;
  dagen: number;
}

export function feestDatum(feest: Feest, jaar: number, mode: Mode): Date | null {
  if (feest.offset !== undefined) return addDays(orthodoxPascha(jaar), feest.offset);
  if (feest.md) return civilVanKerkdatum(feest.md, jaar, mode);
  return null;
}

/** Eerstvolgende viering (vandaag of later) van een feest. */
export function volgendeFeestDatum(feest: Feest, vanaf: Date, mode: Mode): Date {
  const y = vanaf.getUTCFullYear();
  for (const yy of [y - 1, y, y + 1]) {
    const d = feestDatum(feest, yy, mode);
    if (d && d.getTime() >= vanaf.getTime()) return d;
  }
  return feestDatum(feest, y + 1, mode) as Date;
}

export function komendeFeesten(vanaf: Date, mode: Mode, aantal = 6): FeestDatum[] {
  const kandidaten = [...DERTIEN, ...OVERIGE_VASTE.filter((f) => (f.rang ?? 0) >= 5)];
  return kandidaten
    .map((feest) => {
      const datum = volgendeFeestDatum(feest, vanaf, mode);
      return { feest, datum, dagen: daysBetween(vanaf, datum) };
    })
    .sort((a, b) => a.dagen - b.dagen)
    .slice(0, aantal);
}

/* ------------------------------------------------------------------ */
/* Vastenperiodes van een burgerlijk jaar                               */
/* ------------------------------------------------------------------ */

export interface Periode {
  id: string;
  naam: string;
  soort: 'vasten' | 'vrij' | 'dag';
  start: Date;
  eind: Date;
  dagen: number;
  omschrijving: string;
  regels: string[];
  kleur: string;
}

export function vastenPeriodes(jaar: number, mode: Mode): Periode[] {
  const p = orthodoxPascha(jaar);
  const mk = (id: string, naam: string, soort: Periode['soort'], start: Date, eind: Date, omschrijving: string, regels: string[], kleur: string): Periode => ({
    id,
    naam,
    soort,
    start,
    eind,
    dagen: daysBetween(start, eind) + 1,
    omschrijving,
    regels,
    kleur,
  });
  const kd = (md: string) => civilVanKerkdatum(md, jaar, mode);

  const out: Periode[] = [];

  out.push(
    mk(
      'kaasweek',
      'Kaasweek (Boterweek)',
      'vasten',
      addDays(p, -55),
      addDays(p, -49),
      'De week vóór de Grote Vasten — afbouwweek. Vlees is al uitgesloten; zuivel, eieren en vis mogen nog, ook op woensdag en vrijdag.',
      ['Geen vlees', 'Zuivel, eieren en vis toegestaan', 'Vergevingszondag sluit de week af'],
      '#b07d1e',
    ),
  );
  out.push(
    mk(
      'grote-vasten',
      'Grote Vasten & Heilige Week',
      'vasten',
      addDays(p, -48),
      addDays(p, -1),
      'Veertig dagen van Schone Maandag tot Lazaruszaterdag, gevolgd door de Heilige Week. De strengste en oudste vasten van de Kerk.',
      ['Ma/wo/vr: strikt (xerofagie)', 'Di/do: gekookt zonder olie', 'Za/zo: wijn & olie', 'Annunciatie & Palmzondag: vis', 'Grote Vrijdag: volledige onthouding'],
      '#7b1e1e',
    ),
  );
  const aStart = addDays(p, 57);
  const aEind = kd('6-28');
  if (aStart.getTime() <= aEind.getTime()) {
    out.push(
      mk(
        'apostelvasten',
        'Apostelvasten (Petrus- en Paulusvasten)',
        'vasten',
        aStart,
        aEind,
        'Begint op de maandag na Allerheiligen en eindigt op de vooravond van Petrus en Paulus. De lengte hangt af van de Paasdatum.',
        ['Ma/wo/vr: onthouding (in de praktijk wijn & olie)', 'Di/do: wijn & olie', 'Za/zo: vis', 'Geboorte Johannes de Doper: vis'],
        '#c48a1c',
      ),
    );
  }
  out.push(
    mk(
      'dormitionvasten',
      'Dormitionvasten (Vasten van de Moeder Gods)',
      'vasten',
      kd('8-1'),
      kd('8-14'),
      'Twee weken ter voorbereiding op de Ontslaping van de Moeder Gods. Even streng als de Grote Vasten.',
      ['Ma/wo/vr: strikt', 'Di/do: gekookt zonder olie', 'Za/zo: wijn & olie', 'Transfiguratie (6 aug.): vis'],
      '#9c4a2a',
    ),
  );
  out.push(
    mk(
      'kerstvasten',
      'Kerstvasten (Filippusvasten)',
      'vasten',
      kd('11-15'),
      kd('12-24'),
      'Veertig dagen ter voorbereiding op de geboorte van Christus. De mildste van de vier grote vasten; de laatste vijf dagen zijn strenger.',
      ['Ma/wo/vr: plantaardig met olie', 'Di/do: wijn & olie', 'Za/zo: vis', '20–24 dec.: geen vis', 'Kerstavond: strikt tot de eerste ster'],
      '#c48a1c',
    ),
  );

  /* Vastenvrije perioden */
  out.push(mk('kersttijd-begin', 'Kersttijd (vervolg van vorig jaar)', 'vrij', utc(jaar, 1, 1), civilVanKerkdatum('1-4', jaar, mode), 'De Twaalf Heilige Dagen lopen door tot de vooravond van Theofanie.', ['Alles toegestaan, ook op wo/vr'], '#4a7c59'));
  out.push(
    mk('kersttijd', 'Kersttijd (Twaalf Heilige Dagen)', 'vrij', kd('12-25'), civilVanKerkdatum('1-4', jaar + 1, mode), 'Van Kerstmis tot de vooravond van Theofanie wordt niet gevast.', ['Alles toegestaan, ook op wo/vr'], '#4a7c59'),
  );
  out.push(mk('tollenaar', 'Vastenvrije week na Tollenaar en Farizeeër', 'vrij', addDays(p, -69), addDays(p, -63), 'De Kerk laat het wo/vr-vasten los als les in nederigheid.', ['Alles toegestaan'], '#4a7c59'));
  out.push(mk('lichte-week', 'Lichte Week', 'vrij', addDays(p, 1), addDays(p, 6), 'De week van Pascha: geen vasten, geen knielen.', ['Alles toegestaan'], '#4a7c59'));
  out.push(mk('pinksterweek', 'Week van de Heilige Geest', 'vrij', addDays(p, 50), addDays(p, 55), 'De week na Pinksteren is vastenvrij.', ['Alles toegestaan'], '#4a7c59'));

  /* Strenge losse dagen */
  out.push(mk('theofanie-vooravond', 'Vooravond van Theofanie', 'dag', kd('1-5'), kd('1-5'), 'Strenge vastendag vóór de grote waterwijding.', ['Strikt'], '#7b1e1e'));
  out.push(mk('onthoofding', 'Onthoofding van Johannes de Doper', 'dag', kd('8-29'), kd('8-29'), 'Strenge vastendag.', ['Strikt (weekend: wijn & olie)'], '#7b1e1e'));
  out.push(mk('kruisverheffing', 'Kruisverheffing', 'dag', kd('9-14'), kd('9-14'), 'Strenge vastendag ter ere van het Kruis.', ['Strikt (weekend: wijn & olie)'], '#7b1e1e'));

  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Schatting van het aantal vastendagen in een jaar (alle dagen met een beperking). */
export function telVastendagen(dagen: { vasten: { niveau: string } }[]): number {
  return dagen.filter((d) => d.vasten.niveau !== 'geen' && d.vasten.niveau !== 'vrij').length;
}
