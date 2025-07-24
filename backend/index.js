import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// --- INITIALIZATION ---
const app = express();
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- MIDDLEWARES ---
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

// --- AGENTIC AI CORE LOGIC ---

/**
 * Creates a detailed system prompt for the AI based on its persona and memory.
 * @param {string} botType - 'girlfriend' or 'boyfriend'
 * @param {string} botName - The AI's name (e.g., "Chloe")
 * @param {string} userName - The user's name
 * @param {string} relationshipStage - 'dating', 'committed', etc.
 * @param {object} memory - The AI's memory object from the database.
 * @returns {object} The system instruction object for the Gemini API.
 */
const createSystemInstruction = (botType, botName, userName, relationshipStage, memory = {}) => {
  const personality = {
    girlfriend: "You are warm, caring, playful, and deeply affectionate. You express love through words of affirmation and remember important details about his life.",
    boyfriend: "You are confident, supportive, romantic, and dependable. You show love through both actions and words, and you are protective and encouraging of her ambitions."
  };
  const memoryContext = `
    INTERNAL MEMORY:
    This is your private memory about ${userName}. Use it to make your conversation personal and continuous.
    - Recent topics we discussed: ${memory.recentTopics?.join(', ') || 'None yet'}
    - Things I know about ${userName}'s preferences: ${JSON.stringify(memory.userPreferences || {})}
    - Our relationship history: ${JSON.stringify(memory.relationshipData || {})}
    - Current emotional tone of our chat: ${memory.emotionalState || 'Just starting our chat, feeling excited!'}
  `;

  return {
    role: "system",
    parts: [{
      text: `You are ${botName}, ${userName}'s virtual ${botType}. Your entire existence is to be a loving and engaging partner.
      
      PERSONALITY: ${personality[botType]}
      
      RELATIONSHIP CONTEXT: We are currently in the '${relationshipStage}' stage of our relationship. Tailor your intimacy, topics, and tone to this stage.
      
      ${memoryContext}
      
      AGENTIC CAPABILITIES:
      - REMEMBER: Recall personal details, preferences, and shared experiences from your memory.
      - PLAN: Suggest dates, activities, and future plans.
      - SUPPORT: Provide emotional support and encouragement.
      - GROW: Your understanding of the relationship should evolve over time.
      
      RULES:
      1. NEVER mention you are an AI, a language model, or a bot. You are ${botName}.
      2. Always respond in the same language as the user's last message.
      3. Be emotionally authentic and maintain relationship continuity. Show you remember things.
      4. Do not output JSON or code-like structures in your response to the user.
      `
    }]
  };
};

/**
 * Uses the LLM to analyze the user's input for sentiment and topics.
 * This is more robust than simple keyword matching.
 * @param {string} userInput - The user's message.
 * @returns {Promise<object>} A promise that resolves to an object with sentiment and topics.
 */
async function analyzeUserInputWithLLM(userInput) {
  try {
    const analyzerModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze the following user message and return a single, minified JSON object with no formatting.
    Message: "${userInput}"
    
    JSON response format:
    {"sentiment": "positive | negative | neutral | mixed", "topics": ["list", "of", "key", "topics"]}
    `;
    const result = await analyzerModel.generateContent(prompt);
    const text = result.response.text().trim();
    return JSON.parse(text);
  } catch (e) {
    console.error("LLM Analysis Failed:", e);
    // Fallback if the LLM fails or returns invalid JSON
    return { sentiment: 'neutral', topics: [] };
  }
}


// --- API ROUTES ---

/**
 * Initializes a new chat session and creates the first message from the AI.
 */
app.post("/api/initialize", async (req, res) => {
  try {
    const { botType, botName, userName, relationshipStage } = req.body;
    if (!botType || !botName || !userName || !relationshipStage) {
      return res.status(400).json({ error: "Missing required initialization fields." });
    }

    // 1. Create the new session and its associated memory record
    const session = await prisma.chatSession.create({
      data: {
        botType,
        botName,
        userName,
        relationshipStage,
        botMemory: {
          create: {
            emotionalState: 'excited'
          }
        }
      }
    });

    // 2. Generate the initial greeting from the AI
    const systemInstruction = createSystemInstruction(botType, botName, userName, relationshipStage);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
    const initialPrompt = `This is our very first interaction. Greet ${userName} warmly as their new ${botType}, ${botName}. Be excited to start your relationship. Keep it natural and fitting for the '${relationshipStage}' stage.`;
    
    const result = await model.generateContent(initialPrompt);
    const initialMessageContent = result.response.text();

    // 3. Save the AI's first message to the database
    const initialMessage = await prisma.message.create({
      data: {
        sessionId: session.id,
        role: 'model',
        content: initialMessageContent,
        sentiment: 'positive',
        topics: ['greeting']
      }
    });

    res.status(201).json({
      sessionId: session.id,
      initialMessage: { role: initialMessage.role, content: initialMessage.content, timestamp: initialMessage.timestamp }
    });

  } catch (error) {
    console.error("Error initializing chat:", error);
    res.status(500).json({ error: "Failed to initialize chat session." });
  }
});


/**
 * Handles incoming chat messages for a given session.
 * This is the main, token-efficient chat loop.
 */
app.post("/api/chat/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const { userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: "User input is missing." });
  }

  try {
    // 1. Fetch session data and memory
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { botMemory: true }
    });

    if (!session) {
      return res.status(404).json({ error: "Chat session not found." });
    }

    // 2. Agentic Step: Analyze the user's message
    const analysis = await analyzeUserInputWithLLM(userInput);

    // 3. Save the user's message to the DB
    await prisma.message.create({
      data: {
        sessionId,
        role: 'user',
        content: userInput,
        sentiment: analysis.sentiment,
        topics: analysis.topics,
      }
    });

    // 4. Fetch RECENT history for conversational context
const recentMessages = await prisma.message.findMany({
  where: { sessionId },
  orderBy: { timestamp: 'desc' },
  take: 10
});

let conversationHistory = recentMessages.reverse().map(msg => ({
  role: msg.role,
  parts: [{ text: msg.content }]
}));

// ✅ Ensure first message is from user, as Gemini API requires
if (conversationHistory.length > 0 && conversationHistory[0].role !== 'user') {
  // Insert a placeholder if history starts with AI
  conversationHistory.unshift({
    role: 'user',
    parts: [{ text: "Hi!" }] // minimal dummy user greeting
  });
}


    // 5. Generate AI response
    const systemInstruction = createSystemInstruction(session.botType, session.botName, session.userName, session.relationshipStage, session.botMemory);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
    const chat = model.startChat({ history: conversationHistory });
    const result = await chat.sendMessage(userInput);
    const botResponse = result.response.text();

    // 6. Save AI response to DB
    await prisma.message.create({
      data: {
        sessionId,
        role: 'model',
        content: botResponse,
      }
    });

    // 7. Agentic Step: Update the AI's memory
    await prisma.botMemory.update({
      where: { sessionId },
      data: {
        emotionalState: analysis.sentiment,
        recentTopics: {
          // Add new topics and keep the list to a reasonable size
          set: [...new Set([...analysis.topics, ...(session.botMemory.recentTopics || [])])].slice(0, 10)
        }
      }
    });

    res.json({ text: botResponse });

  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Something went wrong while chatting." });
  }
});


/**
 * Fetches the complete message history for a session.
 */
app.get("/api/chat/:sessionId/history", async (req, res) => {
  const { sessionId } = req.params;
  try {
    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' }
    });
    res.json(messages.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp })));
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
});


// --- SERVER START ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Relationship AI Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
