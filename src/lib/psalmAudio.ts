import { useEffect, useRef, useState } from 'react';

// Afspelen van een psalm-opname (audioSrc uit de centrale psalmendata). Alleen echte, aangeleverde bestanden:
// geen spraaksynthese, geen externe of voorbeeldaudio. Positie en duur staan klaar voor een latere, uitgebreidere speler.
export function usePsalmAudio(src: string | undefined) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speelt, setSpeelt] = useState(false);
  const [positie, setPositie] = useState(0);
  const [duur, setDuur] = useState(0);

  // Een andere psalm (of weg uit beeld): de opname stoppen en opruimen.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      setSpeelt(false);
      setPositie(0);
      setDuur(0);
    };
  }, [src]);

  const wissel = () => {
    if (!src) return;
    let a = audioRef.current;
    if (!a) {
      a = new Audio(src);
      a.preload = 'metadata';
      a.addEventListener('play', () => setSpeelt(true));
      a.addEventListener('pause', () => setSpeelt(false));
      a.addEventListener('ended', () => setSpeelt(false));
      a.addEventListener('timeupdate', () => setPositie(a!.currentTime));
      a.addEventListener('loadedmetadata', () => setDuur(a!.duration));
      audioRef.current = a;
    }
    if (a.paused) void a.play().catch(() => setSpeelt(false));
    else a.pause();
  };

  return { beschikbaar: !!src, speelt, positie, duur, wissel };
}
