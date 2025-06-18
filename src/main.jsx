import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ParejasProvider } from './context/ParejasContext.jsx'
import { PartidosProvider } from './context/PartidosContext.jsx'
import './styles/global.css'
import { AuthProvider } from './context/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ParejasProvider>
      <PartidosProvider>
        <AuthProvider>
         <App />
        </AuthProvider>
      </PartidosProvider>
    </ParejasProvider>
  </React.StrictMode>,
)
