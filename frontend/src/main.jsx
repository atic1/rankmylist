import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '12px',
          fontWeight: '600',
        },
        success: {
          style: { background: '#22c55e', color: '#fff' },
        },
        error: {
          style: { background: '#ef4444', color: '#fff' },
        },
      }}
    />
  </StrictMode>,
)
