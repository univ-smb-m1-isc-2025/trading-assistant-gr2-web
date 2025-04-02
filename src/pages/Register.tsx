import React, { useState, ChangeEvent, FormEvent } from "react";
import axios, { AxiosError } from "axios"; // Import Axios types
import { Link, useNavigate } from "react-router-dom";
import "./Form.css";
import logoPath from "../assets/logo.svg";

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
  // Add other fields if needed
}

// Interface for the expected successful response structure (adjust as needed)
interface RegistrationSuccessResponse {
  message: string;
  userId: number;
  username: string;
}

// Interface for expected error response (e.g., conflict)
interface ErrorResponse {
  error?: string; // For general errors like 409 Conflict
  message?: string; // Could be used by some errors
  // If validation errors (400) have a different structure, handle separately
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
  const [message, setMessage] = useState<string>(""); // For success/general messages
  const [error, setError] = useState<string>(""); // For general error messages
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({}); // For specific field errors

  const { username, email, password } = formData;

  // IMPORTANT: Update API URL to your backend host
  const API_URL = "http://localhost:8080/api/register";

  //https://api.beRich.oups.net/api/register

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
      // Using Axios with types for response
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
      setFormData({ username: "", email: "", password: "" }); // Clear form on success

      setTimeout(() => {
        navigate("/login"); // Redirige vers la page de connexion
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        "Registration failed. Please check the details below or try again."
      ); // Default error

      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError; // Type assertion
        if (axiosError.response) {
          // Backend responded with an error status code
          const status = axiosError.response.status;
          const data = axiosError.response.data; // data can be anything, needs checking
          console.error(`Backend error: Status ${status}`, data);

          if (status === 400 && typeof data === "object" && data !== null) {
            // Handle validation errors (assuming data is FieldErrors)
            setError("Please fix the errors below.");
            // Be careful with direct type assertion, ensure backend sends this structure
            setFieldErrors(data as FieldErrors);
          } else if (status === 409) {
            // Handle conflict errors (assuming data is ErrorResponse or string)
            if (typeof data === "string") {
              setError(data);
            } else if (
              typeof data === "object" &&
              data !== null &&
              (data as ErrorResponse).error
            ) {
              setError((data as ErrorResponse).error!);
            } else {
              setError("Username or email already exists."); // Fallback
            }
          } else if (typeof data === "string" && data) {
            setError(data); // Display string error from backend
          } else if (
            typeof data === "object" &&
            data !== null &&
            (data as ErrorResponse).message
          ) {
            setError((data as ErrorResponse).message!); // Display message if available
          }
        } else if (axiosError.request) {
          // Request was made but no response received (network error, backend down)
          setError("Could not connect to the server. Please try again later.");
        } else {
          // Something happened in setting up the request
          setError(`An error occurred: ${axiosError.message}`);
        }
      } else {
        // Handle non-Axios errors (e.g., JavaScript errors)
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
                name="username" // Must match key in FormData state
                value={username}
                onChange={onChange}
                required
                minLength={3}
                aria-invalid={!!fieldErrors.username} // Accessibility
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
