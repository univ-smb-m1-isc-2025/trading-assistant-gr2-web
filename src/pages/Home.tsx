import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import './Home.css';

// Enregistrement des composants Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Home = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState<string>("");
    const [symbol, setSymbol] = useState<string>("AIR.PA"); // Défaut : Airbus
    const [period, setPeriod] = useState<string>("1mo"); // Par défaut, afficher les 1 mois
    const [historicalData, setHistoricalData] = useState<{ date: string; close: number }[]>([]);
    const [favorites, setFavorites] = useState<{ ticker: string; name: string }[]>([]);
    const [loadingFavorites, setLoadingFavorites] = useState<boolean>(false);
    const [favoritesError, setFavoritesError] = useState<string>('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

    const [favoriteStatus, setFavoriteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [favoriteError, setFavoriteError] = useState<string>('');

    const periods = [
        { label: "3 derniers jours", value: "3d" },
        { label: "1 mois", value: "1mo" },
        { label: "3 mois", value: "3mo" },
        { label: "6 mois", value: "6mo" },
        { label: "1 an", value: "1y" },
        { label: "5 ans", value: "5y" }
    ];

    const cac40Symbols = [
        { label: "Airbus", value: "AIR.PA" },
        { label: "Air Liquide", value: "AI.PA" },
        { label: "Accor", value: "ACCP.PA" },
        { label: "ArcelorMittal", value: "AC.PA" },
        { label: "Atos", value: "ATOS.PA" },
        { label: "Schneider Electric", value: "SU.PA" },
        { label: "BNP Paribas", value: "BNPP.PA" },
        { label: "Bouygues", value: "EN.PA" },
        { label: "Capgemini", value: "CAP.PA" },
        { label: "Carrefour", value: "CA.PA" },
        { label: "Saint-Gobain", value: "SGO.PA" },
        { label: "LVMH", value: "MC.PA" },
        { label: "Michelin", value: "ML.PA" },
        { label: "L'Oréal", value: "OR.PA" },
        { label: "Orange", value: "ORA.PA" },
        { label: "Publicis", value: "PUB.PA" },
        { label: "Pernod Ricard", value: "RI.PA" },
        { label: "Renault", value: "RNO.PA" },
        { label: "Safran", value: "SAFT.PA" },
        { label: "Sanofi", value: "SAN.PA" },
        { label: "Société Générale", value: "SGOB.PA" },
        { label: "STMicroelectronics", value: "STM.PA" },
        { label: "TotalEnergies", value: "TTE.PA" },
        { label: "Unibail-Rodamco-Westfield", value: "UG.PA" },
        { label: "Veolia", value: "VIE.PA" },
        { label: "Vivendi", value: "VIV.PA" },
        { label: "Vinci", value: "DG.PA" },
        { label: "Worldline", value: "WLDGF.PA" }
    ];

    //const serverURL = "https://api.berich.oups.net/finance/history/${symbol}?range=${period}";
    //const localURL = "http://localhost:8080/finance/history/${symbol}?range=${period}";

        // useEffect pour fetch data (inchangé, mais attention à l'URL)
        useEffect(() => {
            const API_URL = `http://localhost:8080/finance/history/${symbol}?range=${period}`;
            // const API_URL = `https://api.beRich.oups.net/finance/history/${symbol}?range=${period}`;
    
            axios.get(API_URL, { withCredentials: true }) // Ajoutez withCredentials si votre API le requiert et est configurée pour
                .then(response => {
                    if (response.data && response.data.chart && response.data.chart.result && response.data.chart.result.length > 0) {
                        const result = response.data.chart.result[0];
                        // Vérifier que les indicateurs et timestamps existent
                        if (result.indicators && result.indicators.quote && result.indicators.quote.length > 0 && result.indicators.quote[0].close && result.timestamp) {
                           const closePrices = result.indicators.quote[0].close;
                           const timestamps = result.timestamp;
    
                           const data = closePrices
                                .map((close: number | null, index: number) => ({
                                    date: new Date(timestamps[index] * 1000).toLocaleDateString(),
                                    close // Garder null si c'est null
                                }))
                                .filter((item: { date: string; close: number | null }) => item.close !== null); // Filtrer les points où close est null
    
                            // @ts-ignore -> Forcer le type après filtrage
                            setHistoricalData(data);
                            setMessage(`Historique des prix pour ${symbol} sur ${period}`);
                        } else {
                             console.error("Données de graphique manquantes dans la réponse API:", result);
                             setHistoricalData([]); // Vider les données
                             setMessage(`Données de graphique incomplètes pour ${symbol}.`);
                        }
    
                    } else {
                         console.error("Structure de réponse API inattendue:", response.data);
                         setHistoricalData([]); // Vider les données
                         setMessage(`Impossible de récupérer l'historique pour ${symbol}.`);
                    }
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération des données API:", error);
                    // Afficher une erreur plus spécifique si possible
                    if (axios.isAxiosError(error) && error.response?.status === 401) {
                         setMessage("Erreur: Non autorisé à accéder aux données.");
                         // Rediriger vers login si token invalide?
                         // localStorage.removeItem('authToken');
                         // navigate('/login');
                    } else {
                        setMessage("Erreur lors de la récupération des données.");
                    }
                    setHistoricalData([]); // Vider les données en cas d'erreur
                });
        }, [symbol, period, navigate]); // Ajouter navigate aux dépendances

    const chartData = {
        labels: historicalData.map(data => data.date),
        datasets: [
            {
                label: `Prix de clôture (${symbol})`,
                data: historicalData.map(data => data.close),
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.3
            }
        ]
    };

         // Fonction de déconnexion (inchangée)
         const handleLogout = () => {
            localStorage.removeItem('authToken');
            navigate('/login');
        };

        const handleAddFavorite = async () => {
            setFavoriteStatus('loading');
            setFavoriteError('');
            
            // Récupérer le token et vérifier s'il existe
            const token = localStorage.getItem('authToken');
            if (!token) {
                setFavoriteError("Vous n'êtes pas connecté. Veuillez vous connecter pour ajouter des favoris.");
                setFavoriteStatus('error');
                return;
            }
        
            // Définir l'URL de base de l'API
            const API_BASE_URL = 'http://localhost:8080';
            const endpoint = `${API_BASE_URL}/api/star`;
            console.log("Token présent:", token ? "Oui" : "Non");
            console.log("Tentative d'ajout du favori:", symbol);
            console.log("Appel API vers:", endpoint);
            try {
                // Tester d'abord si le service est disponible
                try {
                    const testResponse = await axios.get(`${API_BASE_URL}/api/hello-favorites`);
                    console.log("Test du service de favoris réussi:", testResponse.data);
                } catch (testErr) {
                    console.warn("Test du service échoué:", testErr);
                }
                
                // Faire la requête principale
                const response = await axios.post(
                    endpoint,
                    { ticker: symbol },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        withCredentials: true
                    }
                );
        
                console.log('Réponse ajout favori:', response);
                setFavoriteStatus('success');
                setMessage(`"${symbol}" ajouté aux favoris !`);
                setTimeout(() => setMessage(''), 2000);
                
            } catch (err) {
                console.error("Erreur lors de l'ajout du favori:", err);
                setFavoriteStatus('error');
                
                let errorMsg = "Impossible d'ajouter le favori.";
                if (axios.isAxiosError(err)) {
                    const status = err.response?.status;
                    console.log("Code d'erreur:", status);
                    console.log("Détails de l'erreur:", err.response?.data);
                    
                    if (status === 403 || status === 401) {
                        errorMsg = "Votre session a expiré. Veuillez vous reconnecter.";
                        localStorage.removeItem('authToken');
                        setTimeout(() => navigate('/login'), 2000);
                    } else if (status === 404) {
                        errorMsg = "L'API de favoris n'est pas disponible. Veuillez vérifier que le serveur est en cours d'exécution.";
                    } else if (err.response?.data) {
                        errorMsg = "Erreur: " + err.response.data;
                    }
                }
                
                setFavoriteError(errorMsg);
                if (!(axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403))) {
                    setTimeout(() => setFavoriteError(''), 5000);
                }
            } finally {
                if (favoriteStatus !== 'success') {
                    setFavoriteStatus('idle');
                }
            }
        };

        // Updated handleDeleteAccount function with better debugging
const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
  
    const token = localStorage.getItem('authToken');
    if (!token) {
        setDeleteError("Vous n'êtes pas connecté");
        setDeleting(false);
        return;
    }
  
    try {
        const API_BASE_URL = 'http://localhost:8080';
        const endpoint = `${API_BASE_URL}/api/user/delete`;
        
        // Debug the request
        console.log(`Sending DELETE request to: ${endpoint}`);
        console.log(`Using token (first 10 chars): ${token.substring(0, 10)}...`);
        
        // Check if token is properly formatted (should start with "ey")
        if (!token.startsWith('ey')) {
            console.warn("Warning: Token doesn't start with 'ey'. It might not be a valid JWT.");
        }
        
        // Detailed request configuration for debugging
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            withCredentials: true // Important for CORS with credentials
        };
        console.log("Request config:", JSON.stringify(config, null, 2));
        
        // Make the request with explicit debugging
        const response = await axios.delete(endpoint, config);
        
        console.log("Delete account response:", response);
    
        // Déconnexion après suppression réussie
        localStorage.removeItem('authToken');
        navigate('/login', { state: { message: "Votre compte a été supprimé avec succès" } });
    } catch (error) {
        console.error("Erreur lors de la suppression du compte:", error);
        
        // Enhanced error debugging
        if (axios.isAxiosError(error)) {
            console.error("Status code:", error.response?.status);
            console.error("Response data:", error.response?.data);
            console.error("Response headers:", error.response?.headers);
            
            // Handle specific HTTP status codes
            if (error.response?.status === 404) {
                setDeleteError("L'API de suppression de compte n'est pas accessible. Vérifiez que l'endpoint /api/user/delete existe sur le serveur.");
            } else if (error.response?.status === 403) {
                setDeleteError("Vous n'êtes pas autorisé à supprimer ce compte. Essayez de vous reconnecter.");
                
                // Force logout on auth errors
                setTimeout(() => {
                    localStorage.removeItem('authToken');
                    navigate('/login', { state: { message: "Session expirée. Veuillez vous reconnecter." } });
                }, 3000);
            } else if (error.response?.status === 401) {
                setDeleteError("Session expirée. Veuillez vous reconnecter.");
                
                setTimeout(() => {
                    localStorage.removeItem('authToken');
                    navigate('/login');
                }, 2000);
            } else {
                setDeleteError(
                    error.response?.data || "Une erreur est survenue lors de la suppression du compte"
                );
            }
        } else {
            setDeleteError("Une erreur inattendue est survenue. Veuillez réessayer plus tard.");
        }
        
        setDeleting(false);
    }
};
    
        const loadFavorites = async () => {
            setLoadingFavorites(true);
            setFavoritesError('');
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                setFavoritesError("Non connecté");
                setLoadingFavorites(false);
                return;
            }
            
            try {
                const API_BASE_URL = 'http://localhost:8080';
                const response = await axios.get(`${API_BASE_URL}/api/star`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    withCredentials: true
                });
                
                setFavorites(response.data);
            } catch (error) {
                console.error("Erreur lors du chargement des favoris:", error);
                // Correction ici: Vérification du type d'erreur
                if (axios.isAxiosError(error)) {
                    setFavoritesError(error.response?.data?.message || "Impossible de charger les favoris");
                } else {
                    setFavoritesError("Impossible de charger les favoris");
                }
            } finally {
                setLoadingFavorites(false);
            }
        };
    
        // Fonction pour supprimer un favori
        const handleRemoveFavorite = async (ticker: string) => {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            
            try {
                const API_BASE_URL = 'http://localhost:8080';
                await axios.delete(`${API_BASE_URL}/api/star/${ticker}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    withCredentials: true
                });
                
                // Mettre à jour la liste des favoris après suppression
                setFavorites(favorites.filter(fav => fav.ticker !== ticker));
                
            } catch (error) {
                console.error("Erreur lors de la suppression du favori:", error);
                // Correction ici: Vérification du type d'erreur
                if (axios.isAxiosError(error)) {
                    setFavoriteError(error.response?.data?.message || "Impossible de supprimer le favori");
                } else {
                    setFavoriteError("Impossible de supprimer le favori");
                }
            }
        };
    
        // Fonction pour sélectionner un favori et afficher son graphique
        const handleSelectFavorite = (ticker: string) => {
            setSymbol(ticker);
        };
    
        // Ajouter un effet pour charger les favoris au chargement du composant
        useEffect(() => {
            loadFavorites();
        }, []);
    
        // Ajouter un effet pour recharger les favoris après l'ajout d'un nouveau favori
        useEffect(() => {
            if (favoriteStatus === 'success') {
                loadFavorites();
            }
        }, [favoriteStatus]);

   // --- NOUVELLE STRUCTURE DU RETURN ---
return (
    <>
        {/* Modal de confirmation pour la suppression du compte */}
        {showDeleteModal && (
            <div className="modal-backdrop">
                <div className="modal-content">
                    <h3>Supprimer votre compte?</h3>
                    <p>
                        Cette action est irréversible. Toutes vos données, y compris vos favoris, seront définitivement supprimées.
                    </p>
                    {deleteError && <p className="error-message">{deleteError}</p>}
                    <div className="modal-actions">
                        <button 
                            onClick={() => setShowDeleteModal(false)}
                            className="cancel-button"
                            disabled={deleting}
                        >
                            Annuler
                        </button>
                        <button 
                            onClick={handleDeleteAccount}
                            className="confirm-delete-button"
                            disabled={deleting}
                        >
                            {deleting ? "Suppression..." : "Confirmer la suppression"}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Conteneur principal pour la mise en page flex */}
        <div className="dashboard-layout">
            {/* --- Colonne Sidebar (gauche) --- */}
            <aside className="dashboard-sidebar">
                <h3>beRich</h3>

                {/* --- Section Sélection Titre --- */}
                <div className="sidebar-section symbol-selection">
                    <label htmlFor="symbol-select">Titre à Surveiller :</label>
                    <div className="select-with-action">
                        <select
                            id="symbol-select"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            className="select-field"
                        >
                            {cac40Symbols.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddFavorite}
                            className="add-favorite-button"
                            title={`Ajouter ${symbol} aux favoris`}
                            disabled={favoriteStatus === 'loading'}
                        >
                            {favoriteStatus === 'loading' ? '...' : '⭐'}
                        </button>
                    </div>
                    {/* Afficher l'erreur d'ajout de favori */}
                    {favoriteError && <p className="field-error" style={{marginTop: '5px'}}>{favoriteError}</p>}
                </div>

                {/* Section pour choisir la période */}
                <div className="sidebar-section">
                    <label htmlFor="period-select">Période :</label>
                    <select
                        id="period-select"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="select-field"
                    >
                        {periods.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* --- Section Mes Favoris --- */}
                <div className="sidebar-section favorites-section">
                    <h4>Mes Favoris</h4>
                    {loadingFavorites ? (
                        <p>Chargement...</p>
                    ) : favoritesError ? (
                        <p className="error">{favoritesError}</p>
                    ) : favorites.length === 0 ? (
                        <p>Aucun favori ajouté</p>
                    ) : (
                        <ul className="favorites-list">
                            {favorites.map((favorite) => (
                                <li key={favorite.ticker}>
                                    <button 
                                        className="favorite-item" 
                                        onClick={() => handleSelectFavorite(favorite.ticker)}
                                        title={favorite.name}
                                    >
                                        {favorite.ticker}
                                    </button>
                                    <button 
                                        className="remove-favorite-button"
                                        onClick={() => handleRemoveFavorite(favorite.ticker)}
                                        title="Supprimer des favoris"
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Section supprimer le compte */}
                <div className="sidebar-account-actions">
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="delete-account-button"
                    >
                        Supprimer mon compte
                    </button>
                </div>

                {/* Bouton de déconnexion en bas de la sidebar */}
                <div className="sidebar-logout">
                    <button onClick={handleLogout} className="logout-button-sidebar">Déconnexion</button>
                </div>
            </aside>

            {/* --- Zone de Contenu Principal (droite) --- */}
            <main className="dashboard-main">
                <h1 className="home-title">
                    {message || "Chargement..."}
                </h1>

                <div className="chart-container">
                    {historicalData.length > 0 ? (
                        <div className="chart">
                            <Line key={symbol + period} data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    ) : (
                        <p className="no-data">{message.includes("Erreur") ? message : "Aucune donnée à afficher."}</p>
                    )}
                </div>
            </main>
        </div>
    </>
);
};

export default Home;