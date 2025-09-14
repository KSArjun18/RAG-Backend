const axios = require('axios');

async function getEmbedding(text) {
  try {
    const response = await axios.post(`${process.env.EMBEDDINGS_SERVICE_URL}/embed`, {
      text: text
    });
    
    return response.data.embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    throw error;
  }
}

module.exports = {
  getEmbedding
};