import { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get("http://localhost:8080/api/hello")
            .then(response => setMessage(response.data))
            .catch(error => console.error("Error fetching API:", error));
    }, []);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold">{message || "Loading..."}</h1>
        </div>
    );
};

export default Home;
