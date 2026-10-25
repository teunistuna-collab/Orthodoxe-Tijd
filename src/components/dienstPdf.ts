// De diensttekst uit de PDF van een dienst (lib/etmaal.ts, public/data/pdfs): regels met hun inspringing, per pagina.
// Gedeeld door het dienstvenster op desktop (UrenCyclus.tsx) en "Over deze dienst" op mobiel (EtmaalMobiel.tsx).

// De PDF-lezer (±420 KB) wordt pas geladen als iemand een dienst of psalm opent, niet bij het openen van de site.
let pdfjsLaden: Promise<typeof import('pdfjs-dist')> | null = null;
function laadPdfjs() {
  pdfjsLaden ??= import('pdfjs-dist')
    .then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      return pdfjsLib;
    })
    .catch((fout) => {
      pdfjsLaden = null; // bij een netwerkfout de volgende keer opnieuw proberen
      throw fout;
    });
  return pdfjsLaden;
}

export type PdfLine = {
  x: number;
  text: string;
};

const pdfTextCache = new Map<string, Array<Array<PdfLine>>>();

/** Al uitgelezen tekst van deze PDF, of undefined. */
export const pdfTekstUitCache = (url: string) => pdfTextCache.get(url);

/** Leest de tekst van een PDF (één keer per url; daarna uit de cache). */
export async function leesPdfTekst(pdfUrl: string): Promise<Array<Array<PdfLine>>> {
  const bekend = pdfTextCache.get(pdfUrl);
  if (bekend) return bekend;
  const pdfjsKlaar = laadPdfjs(); // tegelijk met het PDF-bestand ophalen
  pdfjsKlaar.catch(() => {}); // een fout komt hieronder via Promise.all binnen
  const response = await fetch(pdfUrl);
  if (!response.ok) throw new Error(`PDF is niet beschikbaar (${response.status})`);

  const [buffer, pdfjsLib] = await Promise.all([response.arrayBuffer(), pdfjsKlaar]);
  const pdf = await pdfjsLib.getDocument({ data: buffer, verbosity: 0 }).promise;
  const pages: Array<Array<PdfLine>> = [];

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex);
    const textContent = await page.getTextContent();
    const rows = new Map<number, Array<PdfLine>>();

    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string') {
        const text = item.str.trim();
        if (!text) continue;
        const yKey = Math.round(Number(item.transform?.[5] ?? 0));
        const row = rows.get(yKey) ?? [];
        row.push({ x: Number(item.transform?.[4] ?? 0), text });
        rows.set(yKey, row);
      }
    }

    const pageLines = Array.from(rows.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) => ({
        x: Math.min(...items.map((entry) => entry.x)),
        text: items
          .sort((a, b) => a.x - b.x)
          .map((entry) => entry.text)
          .join(' '),
      }))
      .filter((line) => line.text.length > 0);

    pages.push(pageLines);
  }

  pdfTextCache.set(pdfUrl, pages);
  return pages;
}
