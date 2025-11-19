export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { history } = req.body;
  if (!history || !Array.isArray(history) || history.length === 0) {
    return res.status(400).json({ error: "Historique manquant ou invalide" });
  }

  try {
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const result = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.GOOGLE_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      }
    );

    const data = await result.json();
    console.log("Réponse API Gemini =", data);

    const aiText = data?.candidates?.[0]?.content?.[0]?.text || null;
    if (!aiText) return res.status(500).json({ reply: "Erreur : aucune réponse de l’IA" });

    res.status(200).json({ reply: aiText });

  } catch (err) {
    console.error("Erreur interne API :", err);
    res.status(500).json({ reply: "Erreur interne serveur" });
  }
}
