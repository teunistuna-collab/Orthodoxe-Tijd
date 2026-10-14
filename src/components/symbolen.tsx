import type { ReactNode } from 'react';

// Goudkleurige lijnsymbolen (uit de ontwerppakketten voor Verdieping en Voorkeuren) voor onderwerpen waarvoor de app
// zelf geen passend symbool heeft. Kleur via currentColor.

const pad = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

export const HANDEN = pad(<path d="M11 3v10l-5 8-4-3 5-7 2-7q1-3 2-1Zm2 0v10l5 8 4-3-5-7-2-7q-1-3-2-1Z" />);
export const BLAD = pad(<path d="M5 22Q7 11 18 3M9 15q-7 0-6-6 6 0 6 6ZM12 11q-2-7 4-9 3 5-4 9ZM13 14q7-5 9 0-4 5-9 0ZM8 19q6-4 10 0-5 5-10 0Z" />);
export const KRUIS = pad(<path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6Z" />);
export const KERK = pad(<path d="M4 22V10h5m6 0h5v12M8 22V10q0-5 4-7 4 2 4 7v12M3 22h18M10 22v-6a2 2 0 0 1 4 0v6M10 2h4M12 0v4M5 14h1M18 14h1" />);
/** Kruis met uitlopende armen en een ruit in het midden (Andere tradities). */
export const SIERKRUIS = pad(<><path d="M12 2v20M2 12h20" /><path d="m12 2-2 3h4ZM12 22l-2-3h4ZM2 12l3-2v4ZM22 12l-3-2v4Z" /><path d="m12 9 3 3-3 3-3-3Z" /></>);
