import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register"; 
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import EmailSender from "./components/EmailSender";
import './App.css';
import { JSX } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId ="156580473624-avdc8usdprcdv0h31hahk6sg0ipmcqn1.apps.googleusercontent.com"

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('authToken'); 
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Route d'accueil protégée */}
                <Route
                    path="/home"
                    element={
                        <PrivateRoute>
                            <HomePage />
                        </PrivateRoute>
                    }
                />

                {/* Redirection par défaut */}
                {/* Si l'utilisateur est déjà connecté, aller à /home, sinon à /login */}
                <Route
                    path="/"
                    element={localStorage.getItem('authToken') ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/test-email"
                    element={
                        <PrivateRoute>
                            <EmailSender />
                        </PrivateRoute>
                    }
                />

            </Routes>
        </Router>
        </GoogleOAuthProvider>
    );
}

export default App;