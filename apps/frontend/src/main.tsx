import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')!

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Se o root já contém HTML (pre-renderizado no build), hidrata.
// Caso contrário (rota não pre-renderizada), cria do zero.
if (rootEl.children.length > 0) {
  hydrateRoot(rootEl, app)
} else {
  createRoot(rootEl).render(app)
}
