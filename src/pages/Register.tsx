import React, { useState, ChangeEvent, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Form.css";

// --- Define Interfaces for Structure and Type Safety ---

// Interface for the form data state
interface FormData {
  username: string;
  email: string;
  password: string;
}

// Interface for backend validation errors (adjust based on your actual backend response)
interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
}

// Interface for the expected successful response structure (adjust as needed)
interface RegistrationSuccessResponse {
  message: string;
  userId: number;
  username: string;
}

// Interface for expected error response (e.g., conflict)
interface ErrorResponse {
  error?: string; 
  message?: string; 
}

// --- Component ---

const Register: React.FC = () => {
  // Use React.FC for functional components
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<string>(""); 
  const [error, setError] = useState<string>(""); 
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({}); 
  
  const { username, email, password } = formData;
  
  const API_URL = "https://api.beRich.oups.net/api/register";

  //const API_URL = "http://localhost:8080/api/register";

  // --- Event Handlers ---

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear specific field error when user starts typing again
    if (fieldErrors[e.target.name as keyof FieldErrors]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
    }
    // Clear general error when user types
    if (error) setError("");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setError("");
    setFieldErrors({});

    try {
      const response = await axios.post<RegistrationSuccessResponse>(
        API_URL,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Registration successful:", response.data);
      setMessage(
        response.data.message ||
          `Registration successful for ${response.data.username}!`
      );
      setFormData({ username: "", email: "", password: "" }); 

      setTimeout(() => {
        navigate("/login"); 
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        "Registration failed. Please check the details below or try again."
      ); // Default error

      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError; 
        if (axiosError.response) {
          // Backend responded with an error status code
          const status = axiosError.response.status;
          const data = axiosError.response.data; 
          console.error(`Backend error: Status ${status}`, data);

          if (status === 400 && typeof data === "object" && data !== null) {
            setError("Please fix the errors below.");
            setFieldErrors(data as FieldErrors);
          } else if (status === 409) {
            if (typeof data === "string") {
              setError(data);
            } else if (
              typeof data === "object" &&
              data !== null &&
              (data as ErrorResponse).error
            ) {
              setError((data as ErrorResponse).error!);
            } else {
              setError("Username or email already exists."); 
            }
          } else if (typeof data === "string" && data) {
            setError(data); 
          } else if (
            typeof data === "object" &&
            data !== null &&
            (data as ErrorResponse).message
          ) {
            setError((data as ErrorResponse).message!); 
          }
        } else if (axiosError.request) {
          setError("Could not connect to the server. Please try again later.");
        } else {
          setError(`An error occurred: ${axiosError.message}`);
        }
      } else {
        setError(
          `An unexpected error occurred: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }
    }
  };

  // --- Render ---
  return (
    // --- Nouvelle structure pour les deux colonnes ---
    <div className="auth-layout">
      {/* --- Colonne Gauche : Formulaire --- */}
      <div className="auth-form-column">
        <div className="form-container">
          <h2>Créer un compte</h2>
          {message && <p className="success-message">{message}</p>}
          {/* Display general error only if there are no specific field errors */}
          {error && Object.keys(fieldErrors).length === 0 && (
            <p className="error-message">{error}</p>
          )}
          {/* Display specific error message if validation fails */}
          {error && Object.keys(fieldErrors).length > 0 && (
            <p className="error-message">{error}</p>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                name="username" 
                value={username}
                onChange={onChange}
                required
                minLength={3}
                aria-invalid={!!fieldErrors.username} 
                aria-describedby={
                  fieldErrors.username ? "username-error" : undefined
                }
              />
              {fieldErrors.username && (
                <span id="username-error" className="field-error">
                  {fieldErrors.username}
                </span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {fieldErrors.email && (
                <span id="email-error" className="field-error">
                  {fieldErrors.email}
                </span>
              )}
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
                minLength={6}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
              />
              {fieldErrors.password && (
                <span id="password-error" className="field-error">
                  {fieldErrors.password}
                </span>
              )}
            </div>
            <button type="submit">Créer mon compte</button>
            <p className="navigation-link">
              {" "}
              {/* <-- Classe pour le style du lien */}
              Déjà un compte ? <Link to="/login">Se connecter ici</Link>
            </p>
          </form>
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

export default Register;
