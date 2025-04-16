import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register"; // Ou pages/RegisterPage
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import EmailSender from "./components/EmailSender";
import './App.css';
import { JSX } from "react";

// --- Optionnel: Composant pour les routes privées ---
const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('authToken'); // Vérification simple pour l'exemple
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
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


                {/* Vous pouvez ajouter une page 404 */}
                {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
        </Router>
    );
}

export default App;