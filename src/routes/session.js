const express = require('express');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const sessionId = uuidv4();
    console.log('Creating session with ID:', sessionId);

    const result = await redisClient.setEx(`session:${sessionId}:history`, 86400, JSON.stringify([]));
    console.log('Redis SETEX result:', result);

    res.status(201).json({ sessionId });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

module.exports = router;
