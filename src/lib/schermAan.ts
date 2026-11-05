import { useEffect } from 'react';

/** Houdt het scherm aan zolang `open` waar is (leesvenster, gebedsweg). Zonder Wake Lock: niets, zonder fout. */
export function useSchermAan(open: boolean) {
  useEffect(() => {
    if (!open || !('wakeLock' in navigator)) return;
    let actief = true;
    let slot: WakeLockSentinel | null = null;
    const vraag = () => {
      navigator.wakeLock
        .request('screen')
        .then((s) => {
          if (actief) slot = s;
          else void s.release();
        })
        .catch(() => {});
    };
    const opZicht = () => {
      if (document.visibilityState === 'visible') vraag();
    };
    vraag();
    document.addEventListener('visibilitychange', opZicht);
    return () => {
      actief = false;
      document.removeEventListener('visibilitychange', opZicht);
      void slot?.release().catch(() => {});
    };
  }, [open]);
}
