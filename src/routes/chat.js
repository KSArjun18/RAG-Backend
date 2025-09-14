const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const redisClient = require('../utils/redis');
const { retrieveRelevantChunks } = require('../services/retrieval');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
  try {
    const { sessionId, query } = req.body;
    if (!sessionId || !query) {
      return res.status(400).json({ error: 'sessionId and query are required' });
    }

    // Retrieve relevant chunks from vector DB
    const relevantChunks = await retrieveRelevantChunks(query);

    // Create context safely
    let context;
    if (relevantChunks.length > 0) {
      context = relevantChunks.map(chunk => `- ${chunk.text}`).join('\n');
    } else {
      context = "No relevant articles found in the database.";
    }

    // Create prompt for Gemini
    const prompt = `
Based on the following news articles, answer the user's question. 
If the information isn't in the provided context, answer using your general knowledge.

Context:
${context}

User question: ${query}

Answer:`;

    // Generate response from Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    // Update chat history in Redis safely
    const historyKey = `session:${sessionId}:history`;
    const currentHistory = JSON.parse(await redisClient.get(historyKey) || '[]');

    const newHistory = [
      ...currentHistory,
      { role: 'user', content: query, timestamp: new Date().toISOString() },
      { role: 'assistant', content: answer, timestamp: new Date().toISOString() }
    ];

    await redisClient.set(historyKey, JSON.stringify(newHistory));

    res.json({ answer, sessionId });

  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

module.exports = router;
