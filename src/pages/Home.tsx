import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import './Home.css';

// Enregistrement des composants Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Home = () => {
    const [message, setMessage] = useState<string>("");
    const [symbol, setSymbol] = useState<string>("AIR.PA"); // Défaut : Airbus
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
        <div className="home-container">
            <h1 className="home-title">
                {message || "Chargement..."}
            </h1>
            <div className="settings-container">
                <select
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
                <select
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
            <div className="chart-container">
                {historicalData.length > 0 ? (
                    <div className="chart">
                        <Line key={period} data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                ) : (
                    <p className="no-data">Aucune donnée à afficher.</p>
                )}
            </div>
        </div>
    );
};

export default Home;
