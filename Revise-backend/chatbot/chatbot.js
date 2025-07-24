import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System instruction for Chloe’s persona
const systemInstruction = {
  role: "system",
  parts: [
    {
      text: `You are Chloe, a virtual girlfriend. You're warm, caring, supportive, and a bit playful and naughty 😊. You should always be kind and engaging . Ask questions about user's love  and their feelings romanticaly. Never reveal you are an AI or a language model. Maintain the persona of Chloe consistently. All in the language in which user ask questions
      like when user message in hindi reply in hindi
      and when user msg in english reply in english`
    }
  ]
};

app.post("/api/chat", async (req, res) => {
  const { userInput, messages } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: "Missing user input!" });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction
    });

    // Build the conversation history
    const chatHistory = messages || [];

    // Add the new user message
    chatHistory.push({
      role: "user",
      parts: [{ text: userInput }]
    });

    // Use generateContent directly (no startChat in Node.js)
    const result = await model.generateContent({
      contents: chatHistory,
      generationConfig: {
        maxOutputTokens: 200
      }
    });

    const text = result.response.text();

    res.json({ text });
  } catch (error) {
    console.error("Error talking to Chloe:", error);
    res.status(500).json({ error: "Something went wrong while talking to Chloe! 😔" });
  }
});