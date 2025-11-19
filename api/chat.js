export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message manquant" });

  try {
    const result = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.GOOGLE_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: message }] }
          ]
        })
      }
    );

    const data = await result.json();
    console.log("Réponse API Gemini =", data);

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiText) return res.status(500).json({ reply: "Erreur : aucune réponse de l’IA" });

    res.status(200).json({ reply: aiText });

  } catch (err) {
    console.error("Erreur interne API :", err);
    res.status(500).json({ reply: "Erreur interne serveur" });
  }
}
