import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Analytics } from "@vercel/analytics/react"


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Analytics/>
    <App />
  </StrictMode>,
)
