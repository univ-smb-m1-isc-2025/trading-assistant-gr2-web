import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Enregistrement des composants Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Home = () => {
    const [message, setMessage] = useState<string>("");
    const [symbol, setSymbol] = useState<string>("AAPL"); // Exemple : Apple stock
    const [historicalData, setHistoricalData] = useState<{ date: string; close: number }[]>([]); // Correction du type 'close' en number

    useEffect(() => {
        // Récupération des données historiques depuis l'API Spring Boot
        axios.get(`http://localhost:8080/finance/history/${symbol}`)
            .then(response => {
                // Récupération des données à partir de la structure de la réponse JSON
                const result = response.data.chart.result[0]; // On récupère le premier élément de 'result'
                const closePrices = result.indicators.quote[0].close; // On accède aux prix de clôture
                const timestamps = result.timestamp; // On récupère les timestamps

                // Conversion des timestamps en dates lisibles
                const data = closePrices.map((close: number, index: number) => ({
                    date: new Date(timestamps[index] * 1000).toLocaleDateString(), // Conversion timestamp en date
                    close
                }));

                setHistoricalData(data);
                setMessage(`Historique des prix pour ${symbol}`);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des données API:", error);
                setMessage("Erreur lors de la récupération des données.");
            });
    }, [symbol]);  // Mise à jour à chaque changement de `symbol`

    // Préparer les données pour Chart.js
    const chartData = {
        labels: historicalData.map(data => data.date), // Utilisation des dates
        datasets: [
            {
                label: `Prix de clôture (${symbol})`,
                data: historicalData.map(data => data.close), // Utilisation des prix de clôture
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.3
            }
        ]
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-4">{message || "Chargement..."}</h1>

            {/* Input pour changer le symbole */}
            <div className="mb-4">
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="border px-2 py-1 rounded-md"
                    placeholder="Entrez un symbole (ex: AAPL)"
                />
            </div>

            {/* Affichage du graphique */}
            {historicalData.length > 0 ? (
                <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-2xl">
                    <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
            ) : (
                <p className="mt-4 text-xl text-gray-500">Aucune donnée à afficher.</p>
            )}
        </div>
    );
};

export default Home;
