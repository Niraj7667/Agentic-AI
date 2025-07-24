// index.js

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";

import shortenerRoutes from "./routes/shortnerRoutes.js"
import { verifyAuth } from "./middlewares/verifyAuth.js";
import chatRoutes from './routes/chatRoutes.js';
dotenv.config();

const app = express();

// ✅ Middlewares
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'https://agentic-ai-pi-eight.vercel.app','https://agentic-ai-36w5.vercel.app'],
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// app.use(verifyAuth);

// ✅ Routes
app.use('/', authRoutes);                // /login, /signup
app.use('/url', shortenerRoutes);       // /url/long, /url/:id

app.use('/api/ai', chatRoutes);

// ✅ Auth test route
app.get('/test', verifyAuth, (req, res) => {
  if (req.user) return res.json({ message: "Authenticated", user: req.user });
  return res.status(401).json({ message: "Not Authenticated" });
});


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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


