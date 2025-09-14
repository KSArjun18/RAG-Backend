const express = require('express');
const redisClient = require('../utils/redis');

const router = express.Router();

// Get chat history for a session
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await redisClient.get(`session:${sessionId}:history`);
    
    if (!history) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ history: JSON.parse(history) });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Clear chat history for a session
router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await redisClient.del(`session:${sessionId}:history`);
    
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

module.exports = router;