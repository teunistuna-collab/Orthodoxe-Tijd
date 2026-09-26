import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

// Delen via het deelmenu van het toestel (WhatsApp, mail, …); zonder deelmenu (desktop-Firefox) wordt de link gekopieerd.
// Handig in de beginscherm-app, waar geen adresbalk is. `pad` is een deeplink zoals "psalmen/50" of "kalender/2026-09-26".
export default function DeelKnop({ titel, pad, className = '', label = false }: { titel: string; pad: string; className?: string; label?: boolean }) {
  const [gekopieerd, setGekopieerd] = useState(false);
  if (!navigator.share && !navigator.clipboard) return null; // geen van beide (onveilige verbinding): geen knop die niets doet

  const deel = async () => {
    const url = `${location.origin}/#${pad}`;
    if (navigator.share) {
      await navigator.share({ title: `${titel} — Orthodoxe Tijd`, url }).catch(() => {}); // annuleren is geen fout
      return;
    }
    await navigator.clipboard.writeText(url).then(
      () => {
        setGekopieerd(true);
        setTimeout(() => setGekopieerd(false), 2000);
      },
      () => window.prompt('Kopieer deze link:', url), // klembord geweigerd: de link zelf tonen
    );
  };

  const tekst = gekopieerd ? 'Link gekopieerd' : 'Delen';
  return (
    <button type="button" onClick={deel} className={className} aria-label={tekst} title={tekst}>
      {gekopieerd ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
      {label && <span aria-live="polite">{tekst}</span>}
    </button>
  );
}
