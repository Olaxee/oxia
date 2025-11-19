let conversation = [];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message manquant" });

  conversation.push({ role: "user", content: message });
  const lastMessages = conversation.slice(-20);

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.GOOGLE_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: { messages: lastMessages },
          temperature: 0.7,
          candidate_count: 1,
          max_output_tokens: 1024
        })
      }
    );

    const data = await response.json();

    if (!data?.candidates?.[0]?.content) {
      console.log("Réponse brute Gemini :", data);
      return res.status(500).json({ reply: "Erreur : aucune réponse de l’IA" });
    }

    const aiReply = data.candidates[0].content[0].text || "…";
    conversation.push({ role: "assistant", content: aiReply });

    res.status(200).json({ reply: aiReply });

  } catch (err) {
    console.error("Erreur API :", err);
    res.status(500).json({ reply: "Erreur interne serveur" });
  }
}
