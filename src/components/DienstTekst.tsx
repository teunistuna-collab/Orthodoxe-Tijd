import { useEffect, useState } from 'react';
import type { ServiceMapping } from '../lib/etmaal';
import { leesPdfTekst, pdfTekstUitCache, type PdfLine } from './dienstPdf';

// De diensttekst uit de PDF van een dienst, opgemaakt zoals in het dienstvenster op desktop (UrenCyclus.tsx): regels met
// hun inspringing, nieuwe alinea na een korte regel die met een leesteken eindigt; het kernvers bovenaan valt weg omdat
// het al apart staat.
export default function DienstTekst({ dienst }: { dienst: ServiceMapping }) {
  const url = dienst.pdf;
  const [geladen, setGeladen] = useState<{ url: string; pages: PdfLine[][] | null } | null>(null);
  const pages = pdfTekstUitCache(url) ?? (geladen?.url === url ? geladen.pages : undefined);
  useEffect(() => {
    if (pdfTekstUitCache(url)) return;
    let actief = true;
    leesPdfTekst(url)
      .then((p) => actief && setGeladen({ url, pages: p }))
      .catch(() => actief && setGeladen({ url, pages: null }));
    return () => {
      actief = false;
    };
  }, [url]);

  if (pages === undefined) return <p className="etmaal-pdf-melding">De tekst wordt geladen…</p>;
  if (pages === null)
    return (
      <p className="etmaal-pdf-melding">
        De tekst kon niet worden geladen.{' '}
        <a href={url} target="_blank" rel="noreferrer" className="underline">
          Open de PDF
        </a>
      </p>
    );
  return (
    <div className="etmaal-pdf">
      {pages.map((paginaRegels, pageIndex) => {
        const kernversRegels = 1 + dienst.kernvers.verses.length;
        const lines = pageIndex === 0 && paginaRegels[0]?.text.startsWith('Psalm Kernvers') ? paginaRegels.slice(kernversRegels) : paginaRegels;
        if (lines.length === 0) return null;
        const minX = Math.min(...lines.map((line) => line.x));
        const langste = Math.max(...lines.map((line) => line.text.length));
        return (
          <div key={`${url}-${pageIndex}`} className="etmaal-pdf-pagina">
            {lines.map((line, lineIndex) => {
              const vorige = lines[lineIndex - 1];
              const nieuweAlinea = !!vorige && vorige.text.length < langste * 0.7 && /[.!?:”"’)]$/.test(vorige.text);
              return (
                <p key={lineIndex} className={nieuweAlinea ? 'etmaal-pdf-alinea' : undefined} style={{ paddingLeft: `${Math.min(48, Math.max(0, (line.x - minX) / 2))}px` }}>
                  {line.text}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
