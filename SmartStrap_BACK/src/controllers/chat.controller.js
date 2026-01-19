const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini only if the API key is present
let genAI = null;
let model = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
}

/**
 * Intelligent chatbot controller using Google Gemini
 */
const handleChatMessage = async (req, res) => {
  const { message, userContext } = req.body;

  if (!model) {
    return res.status(500).json({ 
      error: "Clé API Gemini manquante. Veuillez configurer GEMINI_API_KEY dans le fichier .env" 
    });
  }

  try {
    const prompt = `
      Tu es un assistant santé pour l'application SmartStrap.
      Tu expliques les données physiologiques sans poser de diagnostic médical strict.
      Tu donnes des conseils préventifs simples et bienveillants.
      Mentionne toujours que tu ne remplaces pas un avis médical professionnel.
      
      Contexte actuel de l'utilisateur : 
      - Rythme cardiaque : ${userContext?.heartRate || "inconnu"} BPM
      - Oxygène (SpO2) : ${userContext?.spo2 || "inconnu"}%
      
      Question de l'utilisateur : ${message}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();
    
    res.json({ reply });
  } catch (error) {
    console.error("Gemini Error Details:", error);
    if (error.message?.includes("API key not valid")) {
      res.status(500).json({ error: "La clé API Gemini semble invalide. Veuillez vérifier votre clé dans le fichier .env" });
    } else if (error.status === 404) {
      res.status(500).json({ error: "Le modèle d'IA est introuvable ou indisponible. Veuillez vérifier la configuration du modèle." });
    } else {
      res.status(500).json({ error: "Désolé, j'ai du mal à réfléchir en ce moment. (Erreur IA)" });
    }
  }
};

module.exports = {
  handleChatMessage,
};
