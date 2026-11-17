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

// Web (vanaf 768 px): dezelfde weergave als op de telefoon, in een kolom op telefoonbreedte. De site laadt zichzelf in
// een iframe; daarbinnen gelden alle mobiele schermen, media-queries en de onderbalk precies zoals op mobiel.
const breed = window.matchMedia('(min-width: 768px)')
if (window.top === window && breed.matches) {
  document.documentElement.classList.add('web-kader-pagina')
  document.getElementById('intro')?.remove()
  const kader = document.createElement('iframe')
  kader.className = 'web-kader'
  kader.title = 'Orthodoxe Tijd'
  kader.src = location.pathname + location.search + location.hash
  document.getElementById('root')!.replaceWith(kader)
  // Tablet (aanraakscherm): de kolom op de grootste mobiele breedte (767 px) en opgeschaald tot de volle schermbreedte,
  // zodat alles van de mobiele weergave blijft en niets naast de kolom leeg staat.
  const tablet = window.matchMedia('(pointer: coarse)')
  const pasAan = () => {
    if (!tablet.matches) return void kader.removeAttribute('style')
    const schaal = window.innerWidth / 767
    kader.style.cssText = `left:0;width:767px;height:${window.innerHeight / schaal}px;transform:scale(${schaal});transform-origin:0 0;box-shadow:none`
  }
  pasAan()
  window.addEventListener('resize', pasAan)
  tablet.addEventListener('change', pasAan)
  // Adres en titel van de kolom overnemen, zodat delen, bladwijzers en herladen dezelfde pagina geven.
  // ponytail: korte poll (dekt pushState én replaceState in de app); naar events als dat ooit telt.
  setInterval(() => {
    const w = kader.contentWindow
    if (!w) return
    if (w.location.hash !== location.hash) history.replaceState(null, '', w.location.hash || location.pathname + location.search)
    if (w.document.title && w.document.title !== document.title) document.title = w.document.title
  }, 400)
  // Zelf een ander anker in de adresbalk getypt: de kolom gaat mee.
  window.addEventListener('hashchange', () => { if (kader.contentWindow) kader.contentWindow.location.hash = location.hash })
  // Venster smaller gemaakt tot telefoonbreedte: gewoon de app zonder kolom.
  breed.addEventListener('change', () => location.reload())
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Vangnet>
        <App />
      </Vangnet>
    </StrictMode>,
  )
}

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
