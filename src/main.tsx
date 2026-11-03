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
import Vangnet from './components/Vangnet.tsx'

// Alleen voor de melding "Geen verbinding" (public/sw.js); niet in de ontwikkelserver.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js').catch(() => {}))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Vangnet>
      <App />
    </Vangnet>
  </StrictMode>,
)

// Intro (index.html, alleen mobiel): weg zodra de eerste pagina staat en het bovenste beeld klaar is, hooguit 2,5 s na het laden.
const intro = document.getElementById('intro')
if (intro) {
  const weg = () => {
    intro.classList.add('is-weg')
    setTimeout(() => intro.remove(), 600)
  }
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const beeld = document.querySelector<HTMLImageElement>('main .pagina:not(.pagina-verborgen) img')
    void Promise.race([beeld ? beeld.decode().catch(() => {}) : Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]).then(weg)
  }))
}
