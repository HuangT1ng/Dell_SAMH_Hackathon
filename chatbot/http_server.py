#!/usr/bin/env python3
"""
Simple HTTP server for the chatbot service to handle backend requests.
"""

import json
import sys
from flask import Flask, request, jsonify
from chat_service import ChatService
from utils import create_user_message

app = Flask(__name__)

# Initialize the chat service
chat_service = ChatService()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "chatbot"})

@app.route('/generate', methods=['POST'])
def generate():
    """Generate quick message suggestions."""
    try:
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({"error": "Missing prompt"}), 400
        
        prompt = data['prompt']
        max_tokens = data.get('max_tokens', 100)
        temperature = data.get('temperature', 0.5)
        top_p = data.get('top_p', 0.7)
        
        # Create user message
        user_message = create_user_message(prompt)
        messages = [user_message]
        
        # Create completion with custom parameters
        completion = chat_service.create_completion(
            messages, 
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p
        )
        
        # Extract response content
        response_content = chat_service.get_response_content(completion)
        
        # Return the response content
        return response_content.strip()
        
    except Exception as e:
        print(f"Error in generate endpoint: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"Starting chatbot HTTP server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
