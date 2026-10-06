import type { ReactNode } from 'react';

type Props = { title: string; eyebrow?: string; children: ReactNode };

export default function ExactPageFrame({ children }: Props) {
  return (
    <div className="exact-design-page">
      <div className="exact-frame">
        {/* Mobiel: de gouden hoeken bovenaan, zoals op Vandaag (vm-hoek, index.css) */}
        <span className="vm-hoek vm-hoek-lb pagina-hoek" aria-hidden="true" />
        <span className="vm-hoek vm-hoek-rb pagina-hoek" aria-hidden="true" />
        <div className="exact-content">{children}</div>
      </div>
    </div>
  );
}
