// 1️⃣ Charger les modules
const express = require("express");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");

// 2️⃣ Charger le fichier .env
dotenv.config();

// 3️⃣ Créer l'app Express
const app = express();
const PORT = process.env.PORT || 3000;

// 4️⃣ Middleware pour JSON
app.use(express.json());

// 5️⃣ Initialiser OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 6️⃣ Route de test serveur
app.get("/", (req, res) => {
  res.send("Serveur chatbot opérationnel");
});

// 7️⃣ Route pour le chat
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: "Message vide" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // modèle rapide et peu coûteux
      messages: [
        { role: "system", content: "Tu es un assistant utile et professionnel." },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur IA" });
  }
});

// 8️⃣ Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
