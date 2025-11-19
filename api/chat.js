let conversation = [];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message manquant" });

  // Ajouter le message utilisateur à la conversation
  conversation.push({ author: "user", content: message });
  const lastMessages = conversation.slice(-20); // garder les 20 derniers

  // Transformer les messages pour Gemini
  const formattedMessages = lastMessages.map(msg => ({
    author: msg.author,
    content: [{ type: "text", text: msg.content }]
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateMessage?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: formattedMessages,
          temperature: 0.7,
          candidate_count: 1,
          max_output_tokens: 1024
        })
      }
    );

    const data = await response.json();
    let aiReply = "";

    // Récupérer le texte de la réponse
    if (data?.candidates?.[0]?.content?.[0]?.text) {
      aiReply = data.candidates[0].content[0].text;
    } else {
      console.log("Réponse brute Gemini :", data);
      aiReply = "Erreur : aucune réponse de l’IA";
    }

    // Ajouter la réponse IA à la conversation
    conversation.push({ author: "assistant", content: aiReply });
    res.status(200).json({ reply: aiReply });

  } catch (err) {
    console.error("Erreur API :", err);
    res.status(500).json({ reply: "Erreur interne serveur" });
  }
}
