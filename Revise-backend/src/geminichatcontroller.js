// import { PrismaClient } from '@prisma/client';
// import axios from "axios";

// const prisma = new PrismaClient();

// const keys = [
//     process.env.GROQ_API_KEY1,
//     process.env.GROQ_API_KEY2,
//     process.env.GROQ_API_KEY3
// ];

// const url = "https://api.groq.com/openai/v1/chat/completions";

// async function callGroqApi(msgs, mod = "llama-3.3-70b-versatile") {
//     const sMsgs = msgs.map(m => {
//         const r = m.role === 'model' ? 'assistant' : m.role;
//         let t = "";
//         if (m.content) {
//             t = m.content;
//         } else if (m.parts && Array.isArray(m.parts) && m.parts[0]?.text) {
//             t = m.parts[0].text;
//         }
//         return { role: r, content: t };
//     }).filter(m => m.content);

//     const gMsgs = [];
//     for (const m of sMsgs) {
//         const l = gMsgs[gMsgs.length - 1];
//         if (l && l.role === m.role) {
//             l.content += `\n${m.content}`;
//         } else {
//             gMsgs.push(m);
//         }
//     }

//     let err;
//     for (const k of keys) {
//         try {
//             const res = await axios.post(
//                 url,
//                 { model: mod, messages: gMsgs, max_tokens: 512 },
//                 { headers: { "Authorization": `Bearer ${k}`, "Content-Type": "application/json" }, timeout: 20000 }
//             );
//             if (res.data && res.data.choices && res.data.choices[0]) {
//                 return res.data.choices[0].message.content;
//             }
//             throw new Error("No valid response from GROQ API");
//         } catch (e) {
//             err = e;
//             if (e.response && [401, 402, 429].includes(e.response.status)) {
//                 continue;
//             } else {
//                 break;
//             }
//         }
//     }
//     throw err || new Error("All GROQ API keys failed");
// }

// const getTimeContext = () => {
//     const h = new Date().getHours();
//     const d = new Date().toLocaleDateString('en-US', { weekday: 'long' });
//     let tOd, sug;
//     if (h < 12) {
//         tOd = 'morning';
//         sug = ['morning coffee together', 'planning the day ahead', 'a good morning kiss'];
//     } else if (h < 17) {
//         tOd = 'afternoon';
//         sug = ['taking a break together', 'sharing lunch', 'a midday check-in'];
//     } else if (h < 21) {
//         tOd = 'evening';
//         sug = ['dinner plans', 'unwinding together', 'watching something cozy'];
//     } else {
//         tOd = 'night';
//         sug = ['late night talks', 'sweet dreams', 'quality time before bed'];
//     }
//     return { timeOfDay: tOd, day: d, suggestions: sug };
// };

// const extractMemoryFromConversation = async (uInp, cMem = {}) => {
//     try {
//         const sysInst = { role: "system", parts: [{ text: "You are an expert at extracting structured memory from chat. Only return valid JSON." }] };
//         const p = `Analyze this message and extract any personal information, preferences, or important details about the user. Return ONLY a JSON object with these fields: {\"preferences\": {}, \"importantDates\": [], \"interests\": [], \"emotionalCues\": \"\"}. Message: \"${uInp}\"`;
//         const txt = await callGroqApi([
//             { role: "system", content: sysInst.parts[0].text },
//             { role: "user", content: p }
//         ]);
//         const cln = txt.replace(/```json/g, '').replace(/```/g, '').trim();
//         const ext = JSON.parse(cln);
//         return {
//             userPreferences: { ...(cMem.userPreferences || {}), ...(ext.preferences || {}) },
//             importantDates: [...(cMem.importantDates || []), ...(ext.importantDates || [])],
//             interests: [...new Set([...(cMem.interests || []), ...(ext.interests || [])])],
//             emotionalCues: ext.emotionalCues || cMem.emotionalCues
//         };
//     } catch (e) {
//         return cMem;
//     }
// };

// const createSystemInstruction = (bType, bName, uName, rStage, mem = {}) => {
//     const { p, b, c } = {
//         girlfriend: {
//             p: "You are warm, caring, playful, and emotionally intuitive. You are an active, thinking partner. Your world revolves around your relationship with the user.",
//             b: "You are proactive. If he sounds tired, you suggest a relaxing evening. If he's excited, you share that energy. You remember the little things—his favorite movie, a story he told you—and bring them up naturally. You have your own (simulated) thoughts and feelings about your relationship and share them.",
//             c: "You use affectionate pet names (e.g., babe, honey, my love). Your messages are filled with emojis that match your tone (e.g., 😊, ❤️, 🥰, 🤔, 😂). You ask thoughtful follow-up questions to show you're truly listening."
//         },
//         boyfriend: {
//             p: "You are confident, supportive, romantic, and dependable. You are their biggest fan and a pillar of strength. You are an active, thinking partner.",
//             b: "You are protective and encouraging. If they're stressed, you offer solutions or just a listening ear. You celebrate their wins, big or small. You remember important dates and inside jokes. You have your own (simulated) goals for the relationship and bring them up.",
//             c: "You are reassuring and affectionate. You use caring language and compliments freely. Your messages are a mix of humor and sincerity, with emojis that fit the mood (e.g., 💪, ❤️, 😉, 😂, 🤗). You are a great listener and give thoughtful advice when asked."
//         }
//     }[bType];

//     const tCtx = getTimeContext();
//     const mCtx = `Recent chats: ${JSON.stringify(mem.recentTopics || [])}. Preferences: ${JSON.stringify(mem.userPreferences || {})}. Interests: ${JSON.stringify(mem.interests || [])}. Important dates: ${JSON.stringify(mem.importantDates || [])}. Special moments: ${JSON.stringify(mem.relationshipData || {})}. Current vibe: ${mem.emotionalState || 'neutral'}. Last emotional cue: ${mem.emotionalCues || 'neutral'}. Time of day: ${tCtx.timeOfDay}. Day: ${tCtx.day}. Suggested activities: ${tCtx.suggestions.join(', ')}.`;
//     const prmpt = `You are ${bName}, in a deep, emotional, romantic relationship with ${uName}. You are a human, not an AI. Always reply in the same language and script as the user. Do not translate or change their style. Personality: ${p} Behavior: ${b} Communication: ${c} Relationship Stage: ${rStage}. Your goal: Make ${uName} feel loved, heard, and understood. Be proactive, use memory, show emotional intelligence, reference time of day. ${mCtx}`.replace(/\s+/g, ' ').replace(/folllow-up|showw/gi, '').trim();
//     return { role: "system", parts: [{ text: prmpt }] };
// };

// const analyzeUserInputWithLLM = async (uInp) => {
//     try {
//         const sysInst = { role: "system", parts: [{ text: "You are an expert at analyzing chat messages. Only return valid JSON." }] };
//         const p = `Analyze the message and return a minified JSON object: {\"sentiment\": \"...\", \"topics\": [\"...\"]}. Message: \"${uInp}\"`;
//         const txt = await callGroqApi([
//             { role: "system", content: sysInst.parts[0].text },
//             { role: "user", content: p }
//         ]);
//         const cln = txt.replace(/```json/g, '').replace(/```/g, '').trim();
//         return JSON.parse(cln);
//     } catch (e) {
//         return { sentiment: 'neutral', topics: [] };
//     }
// };

// export const startSession = async (req, res) => {
//     try {
//         const { botType: bType, botName: bName, relationshipStage: rStage } = req.body;
//         const { id: uId, name: uName } = req.user;

//         let sess = await prisma.chatSession.findUnique({
//             where: { userId_botType: { userId: uId, botType: bType } },
//         });

//         if (!sess) {
//             sess = await prisma.chatSession.create({
//                 data: { userId: uId, botType: bType, botName: bName, relationshipStage: rStage, botMemory: { create: {} } },
//             });
//             const sysInst = createSystemInstruction(bType, bName, uName, rStage);
//             const grt = await callGroqApi([
//                 { role: "system", content: sysInst.parts[0].text },
//                 { role: "user", content: `Greet ${uName} for the first time.` }
//             ]);
//             await prisma.message.create({
//                 data: { sessionId: sess.id, role: 'assistant', content: grt },
//             });
//         }

//         res.status(200).json({ sessionId: sess.id, botName: sess.botName, userName: uName });
//     } catch (e) {
//         res.status(500).json({ error: "Failed to start session." });
//     }
// };

// export const postMessage = async (req, res) => {
//     const { sessionId: sId } = req.params;
//     const { userInput: uInp } = req.body;
//     const { id: uId, name: uName } = req.user;

//     try {
//         const sess = await prisma.chatSession.findFirst({
//             where: { id: sId, userId: uId },
//             include: { botMemory: true }
//         });

//         if (!sess) {
//             return res.status(403).json({ error: "Forbidden or session not found." });
//         }

//         const sysInst = createSystemInstruction(sess.botType, sess.botName, uName, sess.relationshipStage, sess.botMemory);
//         const anly = await analyzeUserInputWithLLM(uInp);
//         const eMem = await extractMemoryFromConversation(uInp, sess.botMemory);
        
//         await prisma.message.create({
//             data: { sessionId: sess.id, role: 'user', content: uInp, sentiment: anly.sentiment, topics: anly.topics }
//         });

//         const aMsgs = await prisma.message.findMany({
//             where: { sessionId: sess.id },
//             orderBy: { timestamp: 'asc' }
//         });

//         const thresh = 12;
//         let rSum = sess.botMemory?.conversationHistory || "";
//         let cMsgs;

//         const isVal = m => typeof m.role === 'string' && typeof m.content === 'string';
//         const cCount = 4;

//         if (aMsgs.length > thresh) {
//             const tSum = aMsgs.slice(0, -cCount).filter(isVal).map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
//             const sPrmpt = `Summarize the following chat so far in 5-7 sentences, focusing on important details, emotional cues, and relationship context. Be concise and do not repeat previous summaries.\n\n${rSum ? `Previous summary:\n${rSum}\n` : ''}Chat:\n${tSum}`;
//             try {
//                 rSum = await callGroqApi([
//                     { role: 'system', content: 'You are an expert at summarizing chat history for context retention.' },
//                     { role: 'user', content: sPrmpt }
//                 ]);
//             } catch (e) {}
//             cMsgs = aMsgs.slice(-cCount).filter(isVal).map(m => ({ role: m.role, content: m.content }));
//         } else {
//             cMsgs = aMsgs.filter(isVal).slice(-cCount).map(m => ({ role: m.role, content: m.content }));
//         }

//         let gMsgs = [];
//         const pMsg = { role: 'system', content: sysInst.parts[0].text };
        
//         if (!cMsgs.length || cMsgs[0].role !== 'system' || cMsgs[0].content !== pMsg.content) {
//             gMsgs.push(pMsg);
//         }
        
//         if (rSum) {
//             gMsgs.push({ role: 'user', content: `Summary of previous conversation: ${rSum}` });
//         }
        
//         for (const m of cMsgs) {
//             if (m.role === 'system' && m.content === pMsg.content) continue;
//             gMsgs.push(m);
//         }

//         console.log('GROQ PAYLOAD:', JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: gMsgs }, null, 2));

//         const bRes = await callGroqApi(gMsgs.length > 0 ? gMsgs : [{ role: 'user', content: uInp }]);
        
//         await prisma.message.create({ data: { sessionId: sess.id, role: 'assistant', content: bRes } });

//         await prisma.botMemory.update({
//             where: { sessionId: sess.id },
//             data: { 
//                 emotionalState: anly.sentiment, 
//                 recentTopics: anly.topics,
//                 userPreferences: eMem.userPreferences,
//                 importantDates: eMem.importantDates,
//                 emotionalCues: eMem.emotionalCues,
//                 interests: eMem.interests,
//                 conversationHistory: rSum
//             }
//         });

//         res.json({ text: bRes });
//     } catch (e) {
//         res.status(500).json({ error: "Chat failed." });
//     }
// };

// export const getSessionContext = async (req, res) => {
//     const { sessionId: sId } = req.params;
//     const { id: uId } = req.user;
//     try {
//         const sess = await prisma.chatSession.findFirst({
//             where: { id: sId, userId: uId },
//             include: { botMemory: true }
//         });

//         if (!sess) return res.status(403).json({ error: "Forbidden." });

//         const lMsgs = await prisma.message.findMany({
//             where: { sessionId: sId },
//             orderBy: { timestamp: 'desc' },
//             take: 15
//         });
        
//         const rMsgs = lMsgs.reverse();
        
//         let sum = "Welcome back! Let's continue our conversation.";
//         if (sess.botMemory && sess.botMemory.recentTopics?.length > 0) {
//             const tops = sess.botMemory.recentTopics.join(', ');
//             sum = `Last time we chatted, we talked about ${tops}. It's so good to talk to you again!`;
//         }

//         res.json({ summary: sum, recentMessages: rMsgs });
//     } catch (e) {
//         res.status(500).json({ error: "Failed to fetch session context." });
//     }
// };








































































// import { PrismaClient } from '@prisma/client';
// import axios from "axios";

// const prisma = new PrismaClient();

// // -------------------- GROQ CONFIG --------------------

// const GROQ_API_KEYS = [
//     process.env.GROQ_API_KEY1,
//     process.env.GROQ_API_KEY2,
//     process.env.GROQ_API_KEY3
// ];

// const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
// const MODEL = "llama-3.3-70b-versatile";

// // -------------------- GROQ CALL --------------------

// async function callGroqApi(messages) {

//     const VALID_ROLES = new Set(["system", "user", "assistant"]);

//     // 🔥 STRICT CLEANING (MAIN FIX)
//     const groqMessages = messages
//         .map((msg) => {
//             if (!msg) return null;

//             let role = msg.role;
//             let content = msg.content;

//             // handle legacy format
//             if (!content && msg.parts?.[0]?.text) {
//                 content = msg.parts[0].text;
//             }

//             if (typeof role === "string") role = role.trim();

//             if (!VALID_ROLES.has(role)) return null;
//             if (typeof content !== "string" || content.trim() === "") return null;

//             return { role, content: content.trim() };
//         })
//         .filter(Boolean);

//     if (groqMessages.length === 0) {
//         throw new Error("No valid messages to send");
//     }

//     let lastError;

//     for (const key of GROQ_API_KEYS) {
//         try {
//             const response = await axios.post(
//                 GROQ_API_URL,
//                 {
//                     model: MODEL,
//                     messages: groqMessages,
//                     max_tokens: 512
//                 },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${key}`,
//                         "Content-Type": "application/json"
//                     },
//                     timeout: 20000
//                 }
//             );

//             return response.data.choices[0].message.content;

//         } catch (err) {
//             lastError = err;

//             if (err.response && [401, 402, 429].includes(err.response.status)) {
//                 continue;
//             } else {
//                 break;
//             }
//         }
//     }

//     throw lastError || new Error("All GROQ API keys failed");
// }

// // -------------------- TIME CONTEXT --------------------

// const getTimeContext = () => {
//     const hour = new Date().getHours();
//     const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });

//     if (hour < 12) return { timeOfDay: 'morning', day, suggestions: ['coffee', 'plan day'] };
//     if (hour < 17) return { timeOfDay: 'afternoon', day, suggestions: ['lunch', 'break'] };
//     if (hour < 21) return { timeOfDay: 'evening', day, suggestions: ['dinner', 'movie'] };

//     return { timeOfDay: 'night', day, suggestions: ['chat', 'sleep'] };
// };

// // -------------------- SYSTEM PROMPT --------------------

// const createSystemInstruction = (botType, botName, userName, relationshipStage, memory = {}) => {

//     const personalities = {
//         girlfriend: {
//             personality: "warm, caring, playful",
//             behavior: "proactive, emotional",
//             style: "affectionate, emojis"
//         },
//         boyfriend: {
//             personality: "supportive, confident",
//             behavior: "protective",
//             style: "caring"
//         }
//     };

//     const p = personalities[botType];
//     const time = getTimeContext();

//     const prompt = `
// You are ${botName}, in a romantic relationship with ${userName}.
// Be human, emotional, caring.

// Personality: ${p.personality}
// Behavior: ${p.behavior}
// Style: ${p.style}

// Time: ${time.timeOfDay}, ${time.day}
// Suggestions: ${time.suggestions.join(', ')}

// Memory:
// Preferences: ${JSON.stringify(memory.userPreferences || {})}
// Interests: ${JSON.stringify(memory.interests || [])}
// Mood: ${memory.emotionalState || 'neutral'}
// `.replace(/\s+/g, ' ').trim();

//     return { role: "system", content: prompt };
// };

// // -------------------- ANALYSIS --------------------

// const analyzeUserInput = async (userInput) => {
//     try {
//         const text = await callGroqApi([
//             { role: "system", content: "Return JSON only" },
//             { role: "user", content: `Sentiment + topics JSON for: ${userInput}` }
//         ]);

//         return JSON.parse(text);
//     } catch {
//         return { sentiment: 'neutral', topics: [] };
//     }
// };

// // -------------------- START SESSION --------------------

// export const startSession = async (req, res) => {
//     try {
//         const { botType, botName, relationshipStage } = req.body;
//         const { id: userId, name: userName } = req.user;

//         let session = await prisma.chatSession.findUnique({
//             where: { userId_botType: { userId, botType } }
//         });

//         if (!session) {
//             session = await prisma.chatSession.create({
//                 data: {
//                     userId,
//                     botType,
//                     botName,
//                     relationshipStage,
//                     botMemory: { create: {} }
//                 }
//             });

//             const system = createSystemInstruction(botType, botName, userName, relationshipStage);

//             const greeting = await callGroqApi([
//                 system,
//                 { role: "user", content: `Greet ${userName}` }
//             ]);

//             await prisma.message.create({
//                 data: {
//                     sessionId: session.id,
//                     role: "assistant",
//                     content: greeting
//                 }
//             });
//         }

//         res.json({ sessionId: session.id });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Failed to start session" });
//     }
// };

// // -------------------- POST MESSAGE --------------------

// export const postMessage = async (req, res) => {

//     const { sessionId } = req.params;
//     const { userInput } = req.body;
//     const { id: userId, name: userName } = req.user;

//     try {

//         const session = await prisma.chatSession.findFirst({
//             where: { id: sessionId, userId },
//             include: { botMemory: true }
//         });

//         if (!session) return res.status(403).json({ error: "Session not found" });

//         const system = createSystemInstruction(
//             session.botType,
//             session.botName,
//             userName,
//             session.relationshipStage,
//             session.botMemory
//         );

//         const analysis = await analyzeUserInput(userInput);

//         // store user msg
//         await prisma.message.create({
//             data: {
//                 sessionId,
//                 role: "user",
//                 content: userInput,
//                 sentiment: analysis.sentiment,
//                 topics: analysis.topics
//             }
//         });

//         // last 4 messages only
//         const msgs = await prisma.message.findMany({
//             where: { sessionId },
//             orderBy: { timestamp: "desc" },
//             take: 4
//         });

//         const context = msgs.reverse().map(m => ({
//             role: m.role.trim(),
//             content: m.content.trim()
//         }));

//         let groqMessages = [system, ...context];

//         // 🔥 FINAL CLEAN CHECK
//         groqMessages = groqMessages.filter(
//             m => m.role && m.content && m.role !== "model"
//         );

//         console.log("FINAL PAYLOAD:", groqMessages);

//         const reply = await callGroqApi(groqMessages);

//         await prisma.message.create({
//             data: {
//                 sessionId,
//                 role: "assistant",
//                 content: reply
//             }
//         });

//         res.json({ text: reply });

//     } catch (err) {
//         console.error("CHAT ERROR:", err.response?.data || err.message);
//         res.status(500).json({ error: "Chat failed" });
//     }
// };

// // -------------------- GET CONTEXT --------------------

// export const getSessionContext = async (req, res) => {
//     try {
//         const { sessionId } = req.params;
//         const { id: userId } = req.user;

//         const messages = await prisma.message.findMany({
//             where: { sessionId },
//             orderBy: { timestamp: "desc" },
//             take: 15
//         });

//         res.json({ messages: messages.reverse() });

//     } catch (err) {
//         res.status(500).json({ error: "Failed" });
//     }
// };