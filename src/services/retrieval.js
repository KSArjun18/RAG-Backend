const { QdrantClient } = require('@qdrant/js-client-rest');
const { getEmbedding } = require('./embeddings');

const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
const qdrantApiKey = process.env.QDRANT_API_KEY || undefined;

const qdrantClient = new QdrantClient({
  url: qdrantUrl,
  apiKey: qdrantApiKey
});

const COLLECTION_NAME = 'news_articles';

async function retrieveRelevantChunks(query, limit = 5) {
  try {
    // Get query embedding from embeddings service
    const queryEmbedding = await getEmbedding(query);

    let rawResult;
    try {
      // Modern client pattern
      rawResult = await qdrantClient.search({
        collection_name: COLLECTION_NAME,
        vector: queryEmbedding,
        limit,
        with_payload: true
      });
    } catch (err) {
      // Fallback to older signature that some versions use
      rawResult = await qdrantClient.search(COLLECTION_NAME, {
        vector: queryEmbedding,
        limit,
        with_payload: true
      });
    }

    // Normalize results: some client versions return an object with `.result` array, others return array directly.
    let hits = Array.isArray(rawResult) ? rawResult : (rawResult?.result || rawResult);

    // Map to consistent shape
    const mapped = (hits || []).map(item => {
      const payload = item.payload || {};
      return {
        text: payload.text || payload?.content || payload?.body || '',
        score: item.score ?? null
      };
    });

    return mapped;
  } catch (error) {
    console.error('Error retrieving chunks from Qdrant:', error);
    throw error;
  }
}

module.exports = {
  retrieveRelevantChunks
};
