import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Service worker removed — it was caching index.html and serving it in place
// of CSS/JS assets, causing MIME type errors. The kill-switch sw.js will
// unregister any previously installed SW for existing visitors.
