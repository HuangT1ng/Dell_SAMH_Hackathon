from chat_service import ChatService
from utils import create_user_message, create_assistant_message, format_response


def main():
    """Main function with interactive chat loop using NVIDIA NIM integration."""
    
    # Initialize the chat service
    chat_service = ChatService()
    
    # Initialize conversation history
    messages = []
    
    print("=== NVIDIA NIM Chatbot ===")
    print("Type 'quit', 'exit', or 'q' to end the conversation.")
    print("Type 'clear' to clear conversation history.")
    print("-" * 40)
    
    while True:
        try:
            # Get user input
            user_input = input("\nYou: ").strip()
            
            # Check for exit commands
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
            
            # Check for clear command
            if user_input.lower() == 'clear':
                messages = []
                print("Conversation history cleared.")
                continue
            
            # Skip empty inputs
            if not user_input:
                continue
            
            # Create user message and add to conversation
            user_message = create_user_message(user_input)
            messages.append(user_message)
            
            # Create completion
            completion = chat_service.create_completion(messages)
            
            # Extract response content
            response_content = chat_service.get_response_content(completion)
            
            # Create assistant message and add to conversation
            assistant_message = create_assistant_message(response_content)
            messages.append(assistant_message)
            
            # Display the response
            print(f"\nBot: {response_content}")
            
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")
            print("Please try again.")


if __name__ == "__main__":
    main() 