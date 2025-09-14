from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import logging

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load the embedding model
model = SentenceTransformer('all-mpnet-base-v2')

@app.route('/embed', methods=['POST'])
def embed_text():
    try:
        data = request.get_json()
        text = data.get('text')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        # Generate embedding
        embedding = model.encode(text).tolist()
        
        return jsonify({'embedding': embedding})
    
    except Exception as e:
        logging.error(f"Error generating embedding: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)