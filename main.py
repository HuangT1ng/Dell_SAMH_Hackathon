"""
Main module demonstrating the use of NVIDIA NIM integration.
"""

from chat_service import ChatService
from utils import create_user_message, format_response


def main():
    """Main function demonstrating the NVIDIA NIM integration."""
    
    # Initialize the chat service
    chat_service = ChatService()
    
    # Create a user message
    user_message = create_user_message("What is the capital of France?")
    messages = [user_message]
    
    try:
        # Create completion
        completion = chat_service.create_completion(messages)
        
        # Extract response content
        response_content = chat_service.get_response_content(completion)
        
        # Extract reasoning content if available
        reasoning_content = chat_service.get_reasoning_content(completion)
        
        # Format and display the response
        formatted_response = format_response(response_content, reasoning_content)
        print(formatted_response)
        
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main() 