import { BookOpen, Pause, Volume2 } from 'lucide-react';
import { useLeesvoorkeur, vergroot, verklein, wisselNacht } from '../lib/leesvoorkeur';
import { usePsalmAudio } from '../lib/psalmAudio';
import DeelKnop from './DeelKnop';

export type Deel = { titel: string; pad: string };

// De leesbediening van de hele site: ronde knoppen A+ · A− · (audio) · avondweergave · (delen). Opmaak: Bouw 74 in index.css.
// Alleen gebruiken bij echte leesteksten (gebed, dienst, schriftlezing, psalm), niet in korte informatieve pop-ups.
// Audio verschijnt alleen als er een echt audiobestand is (psalmen).
export default function Leesbediening({ audioSrc, deel, className = '' }: { audioSrc?: string; deel?: Deel; className?: string }) {
  const { nacht, min, max } = useLeesvoorkeur();
  const audio = usePsalmAudio(audioSrc);

  return (
    <div className={`leesbediening ${className}`} role="group" aria-label="Leesweergave">
      <button type="button" onClick={vergroot} disabled={max} aria-label="Tekst vergroten" title="Tekst vergroten">
        <span className="lb-a">
          A<sup>+</sup>
        </span>
      </button>
      <button type="button" onClick={verklein} disabled={min} aria-label="Tekst verkleinen" title="Tekst verkleinen">
        <span className="lb-a lb-a-klein">
          A<sup>−</sup>
        </span>
      </button>
      {audio.beschikbaar && (
        <button type="button" onClick={audio.wissel} aria-label={audio.speelt ? 'Audio pauzeren' : 'Audio afspelen'} title={audio.speelt ? 'Audio pauzeren' : 'Audio afspelen'}>
          {audio.speelt ? <Pause aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
        </button>
      )}
      <button type="button" onClick={wisselNacht} aria-pressed={nacht} aria-label="Avondweergave" title="Avondweergave">
        <BookOpen aria-hidden="true" />
      </button>
      {deel && <DeelKnop titel={deel.titel} pad={deel.pad} />}
    </div>
  );
}
