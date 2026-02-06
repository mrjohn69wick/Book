import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Router } from 'wouter'


import { useHashLocation } from 'wouter/use-hash-location'
import './index.css'

import App from './App.jsx'

window.addEventListener('error', (event) => {
  sessionStorage.setItem('last-global-error', JSON.stringify({
    type: 'error',
    message: event?.message,
    stack: event?.error?.stack,
    filename: event?.filename,
    lineno: event?.lineno,
    colno: event?.colno,
    ts: Date.now(),
  }));
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event?.reason;
  sessionStorage.setItem('last-global-error', JSON.stringify({
    type: 'unhandledrejection',
    message: reason?.message || String(reason),
    stack: reason?.stack,
    ts: Date.now(),
  }));
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router hook={useHashLocation}>
      <App />
    </Router>
  </StrictMode>,
)
