import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Enregistrement des composants Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Home = () => {
    const [message, setMessage] = useState<string>("");
    const [symbol, setSymbol] = useState<string>("AAPL"); // Exemple : Apple stock
    const [period, setPeriod] = useState<string>("1mo"); // Par défaut, afficher les 1 mois
    const [historicalData, setHistoricalData] = useState<{ date: string; close: number }[]>([]);

    const periods = [
        { label: "3 derniers jours", value: "3d" },
        { label: "1 mois", value: "1mo" },
        { label: "3 mois", value: "3mo" },
        { label: "6 mois", value: "6mo" },
        { label: "1 an", value: "1y" },
        { label: "5 ans", value: "5y" }
    ];

    useEffect(() => {
        axios.get(`http://localhost:8080/finance/history/${symbol}?range=${period}`)
            .then(response => {
                const result = response.data.chart.result[0];
                const closePrices = result.indicators.quote[0].close;
                const timestamps = result.timestamp;

                const data = closePrices.map((close: number, index: number) => ({
                    date: new Date(timestamps[index] * 1000).toLocaleDateString(),
                    close
                }));

                setHistoricalData(data);
                setMessage(`Historique des prix pour ${symbol} sur ${period}`);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des données API:", error);
                setMessage("Erreur lors de la récupération des données.");
            });
    }, [symbol, period]);

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

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 py-8 px-4">
            
            {/* Titre Principal */}
            <h1 className="text-5xl font-bold text-gray-800 text-center mb-8">
                {message || "Chargement..."}
            </h1>

            {/* Zone des paramètres */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10 w-full max-w-5xl">
                
                {/* Input du symbole */}
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="w-full md:w-1/3 px-4 py-3 text-lg border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Entrez un symbole (ex: AAPL)"
                />

                {/* Sélecteur de période */}
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full md:w-1/4 px-4 py-3 text-lg border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {periods.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Graphique agrandi */}
            <div className="bg-white shadow-lg rounded-lg w-full max-w-6xl p-8">
                {historicalData.length > 0 ? (
                    <div className="h-[500px]">
                        <Line key={period} data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                ) : (
                    <p className="text-xl text-gray-500 text-center">Aucune donnée à afficher.</p>
                )}
            </div>
        </div>
    );
};

export default Home;
