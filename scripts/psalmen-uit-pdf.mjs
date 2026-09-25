// Zet de aangeleverde Septuagint-psalmteksten (public/data/pdfs/Psalm N.pdf) om naar public/data/psalmen.json.
// Er wordt niets vertaald of aangevuld: regels en versnummers komen letterlijk uit de PDF.
//
//   node scripts/psalmen-uit-pdf.mjs
//
// Opbouw van een PDF: kopregel "Psalm 24 (25)" (Septuagint, tussen haakjes de Hebreeuwse nummering), daarna
// blokken gescheiden door witruimte. Een blok dat met een getal begint is dat vers; het eerste blok (opschrift en
// soms vers 1) heeft in de bron geen nummer en krijgt er hier ook geen.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const MAP = 'public/data/pdfs';
const uit = {};

for (const bestand of readdirSync(MAP).filter((f) => /^Psalm \d+\.pdf$/.test(f))) {
  const pdf = await getDocument({ data: new Uint8Array(readFileSync(`${MAP}/${bestand}`)), useSystemFonts: true, verbosity: 0 }).promise;
  const regels = []; // { pagina, y, tekst }
  for (let p = 1; p <= pdf.numPages; p++) {
    const inhoud = await (await pdf.getPage(p)).getTextContent();
    const rijen = new Map();
    for (const it of inhoud.items) {
      if (!('str' in it) || !it.str.trim()) continue;
      const y = Math.round(it.transform[5]);
      if (!rijen.has(y)) rijen.set(y, []);
      rijen.get(y).push({ x: it.transform[4], t: it.str });
    }
    for (const [y, delen] of [...rijen].sort((a, b) => b[0] - a[0])) {
      const tekst = delen.sort((a, b) => a.x - b.x).map((d) => d.t).join('').replace(/\s+/g, ' ').replace(/ ([.,;:!?])/g, '$1').trim();
      regels.push({ pagina: p, y, tekst });
    }
  }

  const kop = regels.shift();
  const m = kop.tekst.match(/^Psalm (\d+)(?: \((\d+)\))?$/);
  if (!m) throw new Error(`${bestand}: onverwachte kopregel "${kop.tekst}"`);
  const lxx = Number(m[1]);
  if (`Psalm ${lxx}.pdf` !== bestand) throw new Error(`${bestand}: kop zegt Psalm ${lxx}`);

  // Blokken: witruimte groter dan een gewone regelafstand start een nieuw blok. Een nieuwe pagina die niet met een
  // versnummer begint, loopt door in het vorige blok.
  const blokken = [];
  let vorige = null;
  for (const r of regels) {
    const nieuwePagina = vorige && r.pagina !== vorige.pagina;
    const grotePauze = vorige && !nieuwePagina && vorige.y - r.y > 20;
    const begintMetNummer = /^\d+ /.test(r.tekst);
    if (!vorige || grotePauze || (nieuwePagina && begintMetNummer)) blokken.push([]);
    blokken[blokken.length - 1].push(r.tekst);
    vorige = r;
  }

  const verzen = blokken.map((b) => {
    // Psalm 118 is in de bron verdeeld in stases ("tweede stasis"): dat is een tussenkop, geen versregel.
    if (b.length === 1 && /^(eerste|tweede|derde) stasis$/i.test(b[0])) return { kop: b[0], regels: [] };
    const n = b[0].match(/^(\d+) (.*)$/);
    return n ? { n: Number(n[1]), regels: [n[2], ...b.slice(1)] } : { regels: b };
  });

  // Controle: geen regel kwijt, en de versnummers lopen op.
  const aantal = verzen.reduce((s, v) => s + (v.kop ? 1 : v.regels.length), 0);
  if (aantal !== regels.length) throw new Error(`${bestand}: ${regels.length} regels in, ${aantal} uit`);
  const nummers = verzen.filter((v) => v.n).map((v) => v.n);
  nummers.forEach((n, i) => { if (i && n <= nummers[i - 1]) throw new Error(`${bestand}: vers ${n} na ${nummers[i - 1]}`); });

  uit[lxx] = { lxx, ...(m[2] ? { mt: Number(m[2]) } : {}), bron: `${MAP.replace('public', '')}/${bestand}`, verzen };
  console.log(`Psalm ${lxx}${m[2] ? ` (${m[2]})` : ''}: ${verzen.length} blokken, verzen ${nummers[0]}–${nummers.at(-1)}, ${aantal} regels`);
}

const gesorteerd = Object.fromEntries(Object.keys(uit).map(Number).sort((a, b) => a - b).map((n) => [n, uit[n]]));
writeFileSync('public/data/psalmen.json', JSON.stringify(gesorteerd));
console.log(`Klaar: ${Object.keys(uit).length} psalmen → public/data/psalmen.json`);
