import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  actions?: ReactNode;
  leadingActions?: ReactNode;
  maxWidth?: string;
  labelledBy?: string;
  centerTitle?: boolean;
};

export default function Modal({ open, onClose, title, eyebrow, children, actions, leadingActions, maxWidth = 'max-w-3xl', labelledBy, centerTitle = false }: ModalProps) {
  if (!open) return null;

  return (
    <div className="exact-modal-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`exact-modal-frame ${maxWidth}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="exact-modal-titlebar">
          <div className="exact-modal-nav exact-modal-nav-left">{leadingActions}</div>
          <div className="exact-modal-heading">
            <div className="exact-modal-heading-line"><span /> <b>✣</b> <span /></div>
            {eyebrow && <p>{eyebrow}</p>}
            <h2 id={labelledBy}>{title}</h2>
          </div>
          <div className="exact-modal-nav exact-modal-nav-right">
            {actions}
            <button type="button" onClick={onClose} className="exact-modal-close" aria-label="Sluiten"><X /></button>
          </div>
        </header>
        <div className={`exact-modal-paper ${centerTitle ? 'exact-modal-centered' : ''}`}>{children}</div>
      </div>
    </div>
  );
}
