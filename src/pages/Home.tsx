import { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
    const [message, setMessage] = useState("");
    const [financialData, setFinancialData] = useState<string>("");  // Maintenant une chaîne HTML
    const [symbol, setSymbol] = useState("AAPL"); // Exemple : Apple stock symbol

    useEffect(() => {
        // Récupérer les données depuis l'API backend de Spring Boot
        axios.get(`http://localhost:8080/get-financial-data?symbol=${symbol}`)
            .then(response => {
                setFinancialData(response.data);  // Contenu HTML dans `response.data`
                setMessage("Données financières récupérées avec succès.");
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des données API:", error);
                setMessage("Erreur lors de la récupération des données.");
            });
    }, [symbol]);  // L'appel se fera chaque fois que `symbol` change

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">{message || "Chargement..."}</h1>

            {financialData ? (
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold">Données financières pour {symbol}</h2>
                    {/* Affichage du contenu HTML récupéré */}
                    <div
                        className="mt-2 text-sm"
                        dangerouslySetInnerHTML={{ __html: financialData }}
                    />
                </div>
            ) : (
                <p className="mt-4 text-xl text-gray-500">Aucune donnée à afficher.</p>
            )}

            <div className="mt-4">
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="border px-2 py-1 rounded-md"
                    placeholder="Entrez un symbole boursier (ex: AAPL)"
                />
            </div>
        </div>
    );
};

export default Home;
