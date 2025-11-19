export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message manquant" });

  try {
    const result = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.GOOGLE_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: {
            messages: [
              { author: "system", content: [{ type: "text", text: "Vous êtes un assistant utile et intelligent." }] },
              { author: "user", content: [{ type: "text", text: message }] }
            ]
          },
          temperature: 0.7,
          maxOutputTokens: 512
        })
      }
    );

    const data = await result.json();
    const aiText = data?.candidates?.[0]?.content?.[0]?.text;

    if (!aiText) return res.status(500).json({ reply: "Erreur : aucune réponse de l’IA" });

    res.status(200).json({ reply: aiText });

  } catch (err) {
    console.error("Erreur interne API :", err);
    res.status(500).json({ reply: "Erreur interne serveur" });
  }
}
