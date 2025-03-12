import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="bg-black w-screen h-screen flex justify-center items-center ">
    <App />
    </div>
  </StrictMode>,
)
