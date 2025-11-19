// api/chat.js
let conversation = []; // Stockage temporaire de la conversation en mémoire

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message manquant" });

  // Ajouter le message utilisateur à la conversation
  conversation.push({ role: "user", text: message });

  // Limiter la mémoire aux 20 derniers messages pour éviter trop de tokens
  const lastMessages = conversation.slice(-20);

  // Transformer en format attendu par Gemini
  const contents = lastMessages.map(msg => ({
    role: msg.role === "user" ? "user" : "assistant",
    parts: [{ text: msg.text }]
  }));

  try {
    const result = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.GOOGLE_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      }
    );

    const data = await result.json();

    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log("Réponse brute Gemini :", data);
      return res.status(500).json({ reply: "Erreur : aucune réponse de l’IA" });
    }

    // Récupérer la réponse de l'IA
    const aiReply = data.candidates[0].content.parts[0].text;

    // Ajouter la réponse de l'IA à la conversation
    conversation.push({ role: "assistant", text: aiReply });

    res.status(200).json({ reply: aiReply });

  } catch (err) {
    console.error("Erreur API :", err);
    res.status(500).json({ reply: "Erreur interne serveur" });
  }
}
