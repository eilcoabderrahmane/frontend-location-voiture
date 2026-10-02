import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <main className="min-h-screen bg-blue-100 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-700">
        Tailwind CSS fonctionne !
      </h1>
    </main>
  </StrictMode>,
)