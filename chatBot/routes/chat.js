import express from "express";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message, userContext } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Tu es un assistant santé.
Tu expliques les données physiologiques sans poser de diagnostic médical.
Tu donnes des conseils préventifs simples.
Mentionne que tu ne remplaces pas un médecin.
          `,
        },
        {
          role: "system",
          content: `Contexte utilisateur : ${JSON.stringify(userContext)}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur OpenAI" });
  }
});

export default router;
