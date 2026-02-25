import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import App1 from './App1.jsx'

import { TooltipProvider } from "@/components/ui/tooltip"
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
createRoot(document.getElementById('root')).render(
  <StrictMode>
      <TooltipProvider>
     <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/me" element={<App1 />} />
      </Routes>
    </Router>
    </TooltipProvider>
  </StrictMode>,
)
