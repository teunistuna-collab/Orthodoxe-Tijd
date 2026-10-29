import { Component, type ReactNode } from 'react';

// Vangnet voor de hele app: een onverwachte fout in één pagina (bijvoorbeeld een oude of verkeerde link) geeft geen
// wit scherm, maar een rustige melding met de weg terug naar Vandaag. Opmaak inline, zodat hij ook werkt als de rest
// van de opmaak niet geladen is.
export default class Vangnet extends Component<{ children: ReactNode }, { fout: boolean }> {
  state = { fout: false };

  static getDerivedStateFromError() {
    return { fout: true };
  }

  componentDidCatch(fout: unknown) {
    console.error('Orthodoxe Tijd: onverwachte fout', fout);
  }

  render() {
    if (!this.state.fout) return this.props.children;
    return (
      <main role="alert" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '24px', background: '#f5e6c8', color: '#2b1d12', fontFamily: '"EB Garamond", Georgia, serif', textAlign: 'center' }}>
        <div style={{ maxWidth: 340 }}>
          <h1 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 500 }}>Deze pagina kon niet worden geopend</h1>
          <p style={{ margin: '0 0 22px', fontSize: 18, lineHeight: 1.45, color: '#5d5040' }}>Er ging iets mis bij het tonen van deze pagina. Ga terug naar Vandaag en probeer het opnieuw.</p>
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#vandaag';
              window.location.reload();
            }}
            style={{ minHeight: 48, padding: '0 24px', border: '1px solid #09283d', borderRadius: 4, background: '#103b59', color: '#f3d48e', fontFamily: 'inherit', fontSize: 19, cursor: 'pointer' }}
          >
            Terug naar Vandaag
          </button>
        </div>
      </main>
    );
  }
}
