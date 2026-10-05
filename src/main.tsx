import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Lettertypen zelf gehost (geen Google Fonts). De browser haalt per gewicht
// alleen het schrift op dat op de pagina staat (Latijn), net als bij Google.
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/700.css'
import '@fontsource/cormorant-garamond/400-italic.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import '@fontsource/cormorant-garamond/600-italic.css'
// Cinzel: paginatitels, kleine hoofdletterlabels en knoppen. EB Garamond: gebeden, psalmen en lange leesteksten.
import '@fontsource/cinzel/400.css'
import '@fontsource/cinzel/500.css'
import '@fontsource/cinzel/600.css'
import '@fontsource/eb-garamond/400.css'
import '@fontsource/eb-garamond/500.css'
import '@fontsource/eb-garamond/400-italic.css'
import './index.css'
import App from './App.tsx'

// Alleen voor de melding "Geen verbinding" (public/sw.js); niet in de ontwikkelserver.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js').catch(() => {}))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
