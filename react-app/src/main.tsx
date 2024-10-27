import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './component/App/App.tsx'
import { CookiesProvider } from 'react-cookie'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CookiesProvider defaultSetOptions={{ path: '/'}}>
      <App />
    </CookiesProvider>
  </StrictMode>,
)
