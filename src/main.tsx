import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = "156580473624-avdc8usdprcdv0h31hahk6sg0ipmcqn1.apps.googleusercontent.com"

if (!googleClientId || googleClientId === "156580473624-avdc8usdprcdv0h31hahk6sg0ipmcqn1.apps.googleusercontent.com") {
  console.warn("Attention: L'ID Client Google n'est pas configuré dans main.tsx ! La connexion Google ne fonctionnera pas."); 
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
