const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const sessionRoutes = require('./routes/session');
const chatRoutes = require('./routes/chat');
const historyRoutes = require('./routes/history');

app.use('/session', sessionRoutes);
app.use('/chat', chatRoutes);
app.use('/history', historyRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});