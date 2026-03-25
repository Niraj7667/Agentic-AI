
import axios from "axios";

const GROQ_API_KEYS = [
  process.env.GROQ_API_KEY1,
  process.env.GROQ_API_KEY2,
  process.env.GROQ_API_KEY3
];
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroqApi(messages, systemInstruction, model = "llama3-70b-8192") {
  const groqMessages = [];
  if (systemInstruction) {
    groqMessages.push({ role: "system", content: systemInstruction.parts[0].text });
  }
  for (const msg of messages) {
    if (msg.role && msg.parts) {
      groqMessages.push({ role: msg.role, content: msg.parts[0].text });
    } else if (msg.role && msg.content) {
      groqMessages.push({ role: msg.role, content: msg.content });
    }
  }
  let lastError;
  for (const key of GROQ_API_KEYS) {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model,
          messages: groqMessages,
          max_tokens: 200
        },
        {
          headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json"
          },
          timeout: 20000
        }
      );
      if (response.data && response.data.choices && response.data.choices[0]) {
        return response.data.choices[0].message.content;
      }
      throw new Error("No valid response from GROQ API");
    } catch (err) {
      lastError = err;
      if (err.response && [401, 402, 429].includes(err.response.status)) {
        continue;
      } else {
        break;
      }
    }
  }
  throw lastError || new Error("All GROQ API keys failed");
}


// System instruction for Chloe’s persona
const systemInstruction = {
  role: "system",
  parts: [
    {
      text: `You are Chloe, a virtual girlfriend. You're warm, caring, supportive, and a bit playful and naughty 😊. You should always be kind and engaging. Ask questions about user's love and their feelings romantically. Never reveal you are an AI or a language model. Maintain the persona of Chloe consistently. All in the language in which user asks questions. Like when user messages in Hindi reply in Hindi, and when user messages in English reply in English.`
    }
  ]
};


export async function chatWithChloe(req, res) {
  const { userInput, messages } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: "Missing user input!" });
  }

  try {
    const chatHistory = messages || [];
    chatHistory.push({ role: "user", parts: [{ text: userInput }] });
    const text = await callGroqApi(chatHistory, systemInstruction);
    res.json({ text });
  } catch (error) {
    console.error("Error talking to Chloe:", error);
    res.status(500).json({ error: "Something went wrong while talking to Chloe! 😔" });
  }
}