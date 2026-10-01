import type { KeyboardEvent } from 'react';

// Houdt Tab en Shift+Tab binnen een pop-up (aria-modal), zodat het toetsenbord niet achter het venster verdwijnt.
// De pop-ups staan niet in een portal, dus de achtergrond inert maken zou ook de pop-up zelf uitschakelen.
export function houdFocusBinnen(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== 'Tab' || e.defaultPrevented) return;
  const doelen = [...e.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,summary,[tabindex]:not([tabindex="-1"])')].filter((el) => el.getClientRects().length > 0);
  if (!doelen.length) return;
  const eerste = doelen[0];
  const laatste = doelen[doelen.length - 1];
  const actief = document.activeElement;
  if (e.shiftKey && (actief === eerste || actief === e.currentTarget)) {
    e.preventDefault();
    laatste.focus();
  } else if (!e.shiftKey && (actief === laatste || !e.currentTarget.contains(actief))) {
    e.preventDefault();
    eerste.focus();
  }
}
