import { useState } from "react";
import axios from "axios";

const EmailSender = () => {
    const [email, setEmail] = useState("");
    const [nomCours, setNomCours] = useState("");
    const [alerteId, setAlerteId] = useState<number>(0);
    const [message, setMessage] = useState("");

    const local = "http://localhost:8080/api/email/send";
    //const serveur = "https://api.berich.oups.net/api/email/send";

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await axios.post(local, {
            email,
            nomCours,
            alerteId
        });
        setMessage(res.data);
    } catch (err) {
        setMessage("Erreur lors de l'envoi de l'email.");
    }
};

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Tester l'envoi d'email</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email : </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>Nom du cours : </label>
                    <input type="text" value={nomCours} onChange={(e) => setNomCours(e.target.value)} required />
                </div>
                <div>
                    <label>ID de l'alerte : </label>
                    <input type="number" value={alerteId} onChange={(e) => setAlerteId(Number(e.target.value))} required />
                </div>
                <button type="submit" style={{ marginTop: "1rem" }}>Envoyer</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default EmailSender;
