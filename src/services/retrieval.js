const { QdrantClient } = require('@qdrant/js-client-rest');
const { getEmbedding } = require('./embeddings');

const qdrantClient = new QdrantClient({
  url: "http://localhost:6333"
});

const COLLECTION_NAME = 'news_articles';

// Retrieve relevant chunks from vector DB
async function retrieveRelevantChunks(query, limit = 5) {
  try {
    // Get query embedding
    const queryEmbedding = await getEmbedding(query);
    
    // Search for similar vectors
    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: limit,
      with_payload: true
    });
    
    return searchResult.map(item => ({
      text: item.payload.text,
      score: item.score
    }));
  } catch (error) {
    console.error('Error retrieving chunks:', error);
    throw error;
  }
}

module.exports = {
  retrieveRelevantChunks
};