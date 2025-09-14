## Backend

# News RAG Chatbot Backend

This repository contains the backend services for a **Retrieval-Augmented Generation (RAG) News Chatbot**. It provides APIs for session management, chat handling, and embeddings retrieval.

### 🛠 Tech Stack

* **Node.js + Express** → REST API server
* **Redis** → session management & chat history caching
* **Qdrant** → vector database for semantic search
* **Python + Flask** → embeddings microservice using `all-mpnet-base-v2`
* **Google Gemini API** → LLM for answering queries
* **BeautifulSoup + Feedparser** → news ingestion from RSS feeds

### 📂 Folder Structure

```
chat-bot-backend/
├─ embeddings-service/      # Flask embeddings microservice
├─ scripts/                # Ingestion scripts for news articles
├─ routes/                 # Express routes (chat, session, history)
├─ src/services/           # Services for embeddings & retrieval
├─ utils/                  # Redis utility
├─ src/server.js           # Main Express server entry point
├─ .env.example            # Environment variables example
├─ package.json
└─ README.md
```

### ⚡ Features

* Fetches news articles from multiple RSS feeds and generates embeddings.
* Stores embeddings in Qdrant for semantic search.
* Supports multiple user sessions with Redis caching.
* Generates answers using Google Gemini LLM with context from retrieved news chunks.
* Chat history can be fetched or reset per session.

### 🚀 Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/KSArjun18/backend.git
cd chat-bot-backend
```

2. **Install dependencies**

```bash
npm install
cd embeddings-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirement.txt
```

3. **Set environment variables**

```env
PORT=3001
REDIS_URL=redis://<your-redis-url>
GEMINI_API_KEY=<your-google-gemini-key>
QDRANT_URL=http://localhost:6333
EMBEDDINGS_SERVICE_URL=http://localhost:5000
```

4. **Start services**

* **Embeddings microservice:**

```bash
cd embeddings-service
python app.py
```

* **Qdrant server** → Make sure Qdrant is running locally.
* **Backend server:**

```bash
cd chat-bot-backend
npm start
```

### 📌 Endpoints

| Route                 | Method | Description                                                                  |
| --------------------- | ------ | ---------------------------------------------------------------------------- |
| `/session`            | POST   | Create a new session and store empty chat history                            |
| `/chat`               | POST   | Send a query; retrieves context from Qdrant and generates answer from Gemini |
| `/history/:sessionId` | GET    | Retrieve chat history for a session                                          |
| `/history/:sessionId` | DELETE | Clear chat history for a session                                             |
| `/health`             | GET    | Health check                                                                 |

### 🔍 Design Decisions

* **Embeddings microservice** separates concerns for scalability.
* **Redis caching** for fast in-memory session management.
* **Vector search (Qdrant)** ensures relevant contextual answers.
* **Typing effect in frontend** improves UX without streaming API.

### 🔧 Potential Improvements

* Stream responses via WebSockets.
* Use SQL/NoSQL for long-term storage of chat transcripts.
* Containerize backend + Qdrant + Redis using Docker Compose.

### 🎬 Demo

* Record or host an unlisted video showing:

  * Starting the backend
  * Ingesting articles
  * Handling chat queries
  * Resetting sessions