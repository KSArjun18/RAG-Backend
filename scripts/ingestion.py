import requests
import feedparser
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http import models
import hashlib
import json
import os
from typing import List
import logging

# Initialize components
model = SentenceTransformer('all-mpnet-base-v2')
qdrant_client = QdrantClient(host="localhost", port=6333)

# Collection name
COLLECTION_NAME = "news_articles"

def fetch_news_from_rss(rss_urls: List[str], max_articles=50):
    """Fetch news articles from RSS feeds"""
    articles = []
    
    for rss_url in rss_urls:
        try:
            feed = feedparser.parse(rss_url)
            
            for entry in feed.entries[:max_articles]:
                if len(articles) >= max_articles:
                    break
                    
                try:
                    # Extract content from the article URL
                    article_content = extract_article_content(entry.link)
                    
                    if article_content:
                        articles.append({
                            'title': entry.title,
                            'url': entry.link,
                            'published': entry.published if hasattr(entry, 'published') else None,
                            'content': article_content
                        })
                except Exception as e:
                    logging.error(f"Error processing article {entry.link}: {str(e)}")
                    continue
                    
        except Exception as e:
            logging.error(f"Error parsing RSS feed {rss_url}: {str(e)}")
            continue
    
    return articles

def extract_article_content(url):
    """Extract main content from a news article URL"""
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'footer', 'aside']):
            element.decompose()
        
        # Try to find the main content
        article = soup.find('article')
        if article:
            return article.get_text().strip()
        
        # Fallback to body text
        return soup.body.get_text().strip()
    
    except Exception as  e:
        logging.error(f"Error extracting content from {url}: {str(e)}")
        return None

def chunk_text(text, chunk_size=500, overlap=50):
    """Split text into overlapping chunks"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk)
        
        if i + chunk_size >= len(words):
            break
    
    return chunks

def create_collection():
    """Create Qdrant collection if it doesn't exist"""
    try:
        collections = qdrant_client.get_collections()
        collection_names = [col.name for col in collections.collections]
        
        if COLLECTION_NAME not in collection_names:
            qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=models.VectorParams(
                    size=768,  # all-mpnet-base-v2 embedding size
                    distance=models.Distance.COSINE
                )
            )
            print(f"Created collection: {COLLECTION_NAME}")
        else:
            print(f"Collection {COLLECTION_NAME} already exists")
            
    except Exception as e:
        logging.error(f"Error creating collection: {str(e)}")
        raise

def ingest_articles(articles):
    """Process and ingest articles into Qdrant"""
    points = []
    
    for article in articles:
        chunks = chunk_text(article['content'])
        
        for i, chunk in enumerate(chunks):
            embedding = model.encode(chunk).tolist()
            
            chunk_id = hashlib.md5(f"{article['url']}_{i}".encode()).hexdigest()
            
            payload = {
                "url": article['url'],
                "title": article['title'],
                "text": chunk,
                "chunk_index": i,
                "published": article['published']
            }
            
            points.append(models.PointStruct(
                id=chunk_id,
                vector=embedding,
                payload=payload
            ))
    
    # Upload points to Qdrant
    if points:
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print(f"Inserted {len(points)} chunks into Qdrant")
    
    return len(points)

if __name__ == "__main__":
    rss_feeds = [
    "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",   
    "https://www.ndtv.com/rss/india",                               
    "https://www.hindustantimes.com/rss/topnews/rssfeed.xml",
    "https://www.thehindu.com/news/national/feeder/default.rss"      
]

    
    print("Fetching news articles...")
    articles = fetch_news_from_rss(rss_feeds, max_articles=50)
    print(f"Fetched {len(articles)} articles")
    
    print("Creating Qdrant collection...")
    create_collection()
    
    print("Ingesting articles into Qdrant...")
    chunks_count = ingest_articles(articles)
    print(f"Ingestion complete. Processed {chunks_count} chunks")