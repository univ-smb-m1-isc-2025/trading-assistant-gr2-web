import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
// Importez votre contexte d'authentification si vous en utilisez un
// import { AuthContext } from '../context/AuthContext';
import "./Form.css"; // Réutilisez le style si applicable'
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

// Interfaces pour la requête et la réponse
interface LoginFormData {
  usernameOrEmail: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { usernameOrEmail, password } = formData;

  const API_LOGIN_URL = "https://api.beRich.oups.net/api/login";
  //const API_LOGIN_URL = 'http://localhost:8080/api/login';
  const API_GOOGLE_AUTH_URL = "https://api.beRich.oups.net/api/auth/google";
  //const API_GOOGLE_AUTH_URL = 'http://localhost:8080/api/auth/google'

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Efface l'erreur quand l'utilisateur tape
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        API_LOGIN_URL,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const token = response.data.token;
      console.log("Login successful, token:", token);

      // --- Stocker le token ---
      // Méthode simple : localStorage (accessible par JS, sensible au XSS)
      localStorage.setItem("authToken", token);

      // --- Mettre à jour l'état global (si Contexte/Redux/Zustand utilisé) ---
      // auth?.login(token); // Exemple avec contexte

      // --- Rediriger vers la page d'accueil ---
      navigate("/home"); // Ou la route de votre tableau de bord
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError("Identifiant ou mot de passe incorrect.");
        } else {
          setError(
            err.response.data?.message ||
              err.response.data ||
              "Une erreur serveur est survenue."
          );
        }
      } else {
        setError("La connexion a échoué. Vérifiez votre réseau.");
      }
    }
  };

  const handleGoogleLoginSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    console.log("Google Login Success Response:", credentialResponse);
    setError("");
    // Note : Pas besoin de setLoading ici car le bouton Google gère son état

    // Le token ID JWT de Google se trouve dans credentialResponse.credential
    const googleIdToken = credentialResponse.credential;

    if (!googleIdToken) {
      setError("Erreur: Token ID Google non reçu.");
      return;
    }

    try {
      // Envoyer ce token ID à VOTRE backend pour validation
      // Le backend vérifiera le token Google, trouvera/créera l'utilisateur,
      // et renverra VOTRE propre token JWT d'application.
      const response = await axios.post<LoginResponse>(
        API_GOOGLE_AUTH_URL,
        { token: googleIdToken },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const appToken = response.data.token; // Le token JWT de VOTRE application
      console.log(
        "Connexion via Google réussie (backend), token app:",
        appToken
      );

      // Stocker VOTRE token et naviguer
      localStorage.setItem("authToken", appToken);
      navigate("/home");
    } catch (err) {
      console.error("Erreur lors de la validation Google backend:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(
          `Échec connexion Google : ${
            err.response.data?.message || err.response.data || "Erreur serveur"
          }`
        );
      } else {
        setError("Échec connexion Google. Vérifiez la console.");
      }
    }
  };

  const handleGoogleLoginError = () => {
    console.error("Google Login Failed");
    setError("La connexion via Google a échoué.");
  };

  return (
    <div className="auth-layout">
      {/* --- Colonne Gauche : Formulaire --- */}
      <div className="auth-form-column">
        <div className="form-container">
          {" "}
          {/* Réutiliser la classe CSS ou créer une nouvelle */}
          <h2>Connectez-vous</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="usernameOrEmail">
                Nom d'utilisateur ou Email
              </label>
              <input
                type="text" // ou 'email' si vous préférez
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={usernameOrEmail}
                onChange={onChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Connexion"}
            </button>
          </form>
          {/* --- Séparateur --- */}
          <div className="divider">OU</div>
          {/* --- Bouton Google Login --- */}
          <div className="google-login-button-container">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              // theme="outline" // autres options: outline, filled_black, filled_blue
              // size="large"
              // shape="rectangular" // ou circle, pill
              // width="320px" // Ajustez si besoin
              useOneTap // Permet le "One Tap Sign-in" s'il est configuré
            />
          </div>
          <p className="navigation-link">
            Pas encore de compte ? <Link to="/register">S'inscrire ici</Link>
          </p>
        </div>
      </div>

      {/* --- Colonne Droite : Image --- */}
      <div className="auth-image-column">
        <img src="/form.jpg" alt="Illustration Trading" />{" "}
        {/* Assurez-vous que le chemin est correct */}
      </div>
    </div>
  );
};

export default LoginPage;
