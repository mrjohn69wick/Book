import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Router, useHashLocation } from 'wouter'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router hook={useHashLocation}>
      <App />
    </Router>
  </StrictMode>,
)
