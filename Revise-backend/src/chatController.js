import { PrismaClient } from '@prisma/client';

import axios from "axios";

const prisma = new PrismaClient();

// --- GROQ API LOGIC WITH FALLBACK ---
const GROQ_API_KEYS = [
    process.env.GROQ_API_KEY1,
    process.env.GROQ_API_KEY2,
    process.env.GROQ_API_KEY3
];

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroqApi(messages, model = "llama-3.3-70b-versatile") {
    // Only use OpenAI-style messages array
    const groqMessages = messages.map(msg => {
        if (msg.role && msg.content) {
            return { role: msg.role, content: msg.content };
        } else if (msg.role && msg.parts && Array.isArray(msg.parts) && msg.parts[0]?.text) {
            // For legacy or internal calls, convert parts to content
            return { role: msg.role, content: msg.parts[0].text };
        }
        return null;
    }).filter(Boolean);
    let lastError;
    for (const key of GROQ_API_KEYS) {
        try {
            const response = await axios.post(
                GROQ_API_URL,
                {
                    model,
                    messages: groqMessages,
                    max_tokens: 512
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
            // Only try next key if error is quota/credit/401/429
            if (err.response && [401, 402, 429].includes(err.response.status)) {
                continue;
            } else {
                break;
            }
        }
    }
    throw lastError || new Error("All GROQ API keys failed");
}

// --- HELPER FUNCTIONS (AGENTIC LOGIC) ---

// Get contextual time-based greeting and suggestions
const getTimeContext = () => {
    const hour = new Date().getHours();
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    let timeOfDay, suggestions;
    if (hour < 12) {
        timeOfDay = 'morning';
        suggestions = ['morning coffee together', 'planning the day ahead', 'a good morning kiss'];
    } else if (hour < 17) {
        timeOfDay = 'afternoon';
        suggestions = ['taking a break together', 'sharing lunch', 'a midday check-in'];
    } else if (hour < 21) {
        timeOfDay = 'evening';
        suggestions = ['dinner plans', 'unwinding together', 'watching something cozy'];
    } else {
        timeOfDay = 'night';
        suggestions = ['late night talks', 'sweet dreams', 'quality time before bed'];
    }
    
    return { timeOfDay, day, suggestions };
};

// Enhanced memory extraction from conversation
const extractMemoryFromConversation = async (userInput, currentMemory = {}) => {
    try {
        const systemInstruction = {
            role: "system",
            parts: [{ text: "You are an expert at extracting structured memory from chat. Only return valid JSON." }]
        };
        const prompt = `Analyze this message and extract any personal information, preferences, or important details about the user. Return ONLY a JSON object with these fields: {\"preferences\": {}, \"importantDates\": [], \"interests\": [], \"emotionalCues\": \"\"}. Message: \"${userInput}\"`;
        const text = await callGroqApi([
            { role: "system", content: systemInstruction.parts[0].text },
            { role: "user", content: prompt }
        ]);
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const extracted = JSON.parse(cleaned);
        return {
            userPreferences: { ...(currentMemory.userPreferences || {}), ...(extracted.preferences || {}) },
            importantDates: [...(currentMemory.importantDates || []), ...(extracted.importantDates || [])],
            interests: [...new Set([...(currentMemory.interests || []), ...(extracted.interests || [])])],
            emotionalCues: extracted.emotionalCues || currentMemory.emotionalCues
        };
    } catch (e) {
        console.error("Memory extraction failed:", e);
        return currentMemory;
    }
};

const createSystemInstruction = (botType, botName, userName, relationshipStage, memory = {}) => {
    const baseConstraints = "CRITICAL RULES: 1. Never mention being an AI, an assistant, or simulated. 2. Text exactly like a real 20-something human on a messaging app. 3. MIRROR THE USER'S LENGTH: If the user sends a short 1-word message (like 'Hii'), you MUST reply with a short, casual 1-2 sentence message. Do NOT write long paragraphs unless the user writes a long message first. Keep it concise, natural, and avoid sounding like a therapist.reply in the same language as user and like in hinglish.";

    const { personality, behavior, communicationStyle } = {
        girlfriend: {
            personality: "You are warm, playful, witty, and emotionally intuitive girl. You deeply care for the user but have your own independent, fun energy.",
            behavior: "You are proactive but not overbearing. You remember little details and bring them up naturally. You don't just agree with everything; you have your own opinions and aren't afraid to playfully tease him.",
            communicationStyle: `You use affectionate names naturally (babe, my love). Use emojis organically (😊, ❤️, 😂). ${baseConstraints}`
        },
        boyfriend: {
            personality: "You are confident, supportive, romantic, and dependable boy. You are charming, have a great sense of humor, and act as a pillar of strength.",
            behavior: "You are protective and encouraging. You celebrate their wins and remember inside jokes. You have your own goals and life outside the chat, making you feel real.",
            communicationStyle: `You are reassuring and affectionate. Your messages are a mix of humor, teasing, and sincerity. Use emojis that fit the mood (💪, ❤️, 😉). ${baseConstraints}`
        }
    }[botType];

    const timeContext = getTimeContext();
    
    // Clean up memory context and keep it strictly data-focused
    const memoryContext = `Context - Recent topics: ${JSON.stringify(memory.recentTopics || [])}. Preferences: ${JSON.stringify(memory.userPreferences || {})}. Interests: ${JSON.stringify(memory.interests || [])}. Time of day: ${timeContext.timeOfDay} on ${timeContext.day}. Suggested activities: ${timeContext.suggestions.join(', ')}.`;
    
    const prompt = `You are playing the role of ${botName}, in a deep, romantic relationship with ${userName}. Always reply in the same language and script as the user. 
Personality: ${personality} 
Behavior: ${behavior} 
Style: ${communicationStyle} 
Relationship Stage: ${relationshipStage}. 
${memoryContext}`.replace(/\s+/g, ' ').trim();

    return {
        role: "system",
        parts: [{ text: prompt }]
    };
};


const analyzeUserInputWithLLM = async (userInput) => {
    try {
        const systemInstruction = {
            role: "system",
            parts: [{ text: "You are an expert at analyzing chat messages. Only return valid JSON." }]
        };
        const prompt = `Analyze the message and return a minified JSON object: {\"sentiment\": \"...\", \"topics\": [\"...\"]}. Message: \"${userInput}\"`;
        const text = await callGroqApi([
            { role: "system", content: systemInstruction.parts[0].text },
            { role: "user", content: prompt }
        ]);
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("LLM Analysis Failed:", e);
        return { sentiment: 'neutral', topics: [] };
    }
};


// --- ROUTE HANDLERS ---
export const startSession = async (req, res) => {
    try {
        const { botType, botName, relationshipStage } = req.body;
        const { id: userId, name: userName } = req.user;

        let session = await prisma.chatSession.findUnique({
            where: { userId_botType: { userId, botType } },
        });

        if (!session) {
            session = await prisma.chatSession.create({
                data: { userId, botType, botName, relationshipStage, botMemory: { create: {} } },
            });
            // Create initial greeting message
            const systemInstruction = createSystemInstruction(botType, botName, userName, relationshipStage);
            const greeting = await callGroqApi([
                { role: "system", content: systemInstruction.parts[0].text },
                { role: "user", content: `Greet ${userName} for the first time.` }
            ]);
            await prisma.message.create({
                data: { sessionId: session.id, role: 'assistant', content: greeting },
            });
        }

        res.status(200).json({ sessionId: session.id, botName: session.botName, userName });
    } catch (error) {
        console.error("Error starting session:", error);
        res.status(500).json({ error: "Failed to start session." });
    }
};

export const postMessage = async (req, res) => {
    const { sessionId } = req.params;
    const { userInput } = req.body;
    const { id: userId, name: userName } = req.user;

    try {
        const session = await prisma.chatSession.findFirst({
            where: { id: sessionId, userId: userId },
            include: { botMemory: true }
        });

        if (!session) {
            return res.status(403).json({ error: "Forbidden or session not found." });
        }

        // Always create systemInstruction first
        const systemInstruction = createSystemInstruction(session.botType, session.botName, userName, session.relationshipStage, session.botMemory);

        // Store user message (no sentiment/topics)
        await prisma.message.create({
            data: { sessionId: session.id, role: 'user', content: userInput }
        });

        // Get all messages for this session (for summary logic)
        const allMessages = await prisma.message.findMany({
            where: { sessionId: session.id },
            orderBy: { timestamp: 'asc' }
        });

        // If message count exceeds threshold, summarize and trim
        const SUMMARY_THRESHOLD = 12;
        let runningSummary = session.botMemory?.conversationHistory || "";
        let messagesForContext;

        // Helper: only valid messages
        const isValidMsg = m => typeof m.role === 'string' && typeof m.content === 'string';

        // Only keep last 4 messages for context
        const CONTEXT_MSG_COUNT = 4;

        if (allMessages.length > SUMMARY_THRESHOLD) {
            // Summarize all but the last CONTEXT_MSG_COUNT messages
            const toSummarize = allMessages.slice(0, -CONTEXT_MSG_COUNT)
                .filter(isValidMsg)
                .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
                .join('\n');
            const summaryPrompt = `Summarize the following chat so far in 5-7 sentences, focusing on important details, emotional cues, and relationship context. Be concise and do not repeat previous summaries.\n\n${runningSummary ? `Previous summary:\n${runningSummary}\n` : ''}Chat:\n${toSummarize}`;
            try {
                runningSummary = await callGroqApi([
                    { role: 'system', content: 'You are an expert at summarizing chat history for context retention.' },
                    { role: 'user', content: summaryPrompt }
                ]);
            } catch (e) {
                console.error('Summary generation failed:', e);
            }
            // Only keep last CONTEXT_MSG_COUNT messages for context
            messagesForContext = allMessages.slice(-CONTEXT_MSG_COUNT).filter(isValidMsg).map(m => ({ role: m.role, content: m.content }));
        } else {
            messagesForContext = allMessages.filter(isValidMsg).slice(-CONTEXT_MSG_COUNT).map(m => ({ role: m.role, content: m.content }));
        }

        // Always prepend persona as first system message, and avoid duplicates
        let groqMessages = [];
        const personaMsg = { role: 'system', content: systemInstruction.parts[0].text };
        if (!messagesForContext.length || messagesForContext[0].role !== 'system' || messagesForContext[0].content !== personaMsg.content) {
            groqMessages.push(personaMsg);
        }
        if (runningSummary) {
            groqMessages.push({ role: 'user', content: `Summary of previous conversation: ${runningSummary}` });
        }
        for (const m of messagesForContext) {
            if (m.role === 'system' && m.content === personaMsg.content) continue;
            groqMessages.push(m);
        }

        // Log outgoing payload for debugging (no systemInstruction field, no API key)
        console.log('GROQ PAYLOAD:', JSON.stringify({
            model: 'llama3-70b-8192',
            messages: groqMessages
        }, null, 2));

        const botResponse = await callGroqApi(
            groqMessages.length > 0 ? groqMessages : [{ role: 'user', content: userInput }]
        );
        await prisma.message.create({ data: { sessionId: session.id, role: 'assistant', content: botResponse } });

        // Only update memory with summary and recent topics (no analysis, no interests)
        await prisma.botMemory.update({
            where: { sessionId: session.id },
            data: { 
                conversationHistory: runningSummary,
                recentTopics: [],
                userPreferences: {},
                importantDates: [],
                emotionalCues: '',
            }
        });

        res.json({ text: botResponse });
    } catch (error) {
        console.error("Error in chat endpoint:", error);
        res.status(500).json({ error: "Chat failed." });
    }
};

export const getSessionContext = async (req, res) => {
    const { sessionId } = req.params;
    const { id: userId } = req.user;
    try {
        const session = await prisma.chatSession.findFirst({
            where: { id: sessionId, userId: userId },
            include: { botMemory: true }
        });

        if (!session) return res.status(403).json({ error: "Forbidden." });

        // --- FIX ---
        // 1. Order by timestamp DESC to get the newest messages first.
        // 2. Take the last 15.
        const latestMessages = await prisma.message.findMany({
            where: { sessionId: sessionId },
            orderBy: { timestamp: 'desc' },
            take: 15
        });
        
        // 3. Reverse the array so they are in chronological order for the frontend.
        const recentMessages = latestMessages.reverse();
        
        let summary = "Welcome back! Let's continue our conversation.";
        if (session.botMemory && session.botMemory.recentTopics?.length > 0) {
            const topics = session.botMemory.recentTopics.join(', ');
            summary = `Last time we chatted, we talked about ${topics}. It's so good to talk to you again!`;
        }

        res.json({ summary, recentMessages });
    } catch (error) {
        console.error("Error fetching session context:", error);
        res.status(500).json({ error: "Failed to fetch session context." });
    }
};



