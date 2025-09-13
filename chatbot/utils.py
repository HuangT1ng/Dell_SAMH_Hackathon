"""
Utility functions for NVIDIA NIM integration.
"""

from typing import List, Dict, Any


def create_message(role: str, content: str) -> Dict[str, str]:
    """
    Create a message dictionary for the chat API.
    
    Args:
        role: The role of the message sender ('user', 'assistant', 'system')
        content: The content of the message
        
    Returns:
        Dict[str, str]: Message dictionary
    """
    return {"role": role, "content": content}


def create_user_message(content: str) -> Dict[str, str]:
    """
    Create a user message.
    
    Args:
        content: The content of the user message
        
    Returns:
        Dict[str, str]: User message dictionary
    """
    return create_message("user", content)


def create_system_message(content: str) -> Dict[str, str]:
    """
    Create a system message.
    
    Args:
        content: The content of the system message
        
    Returns:
        Dict[str, str]: System message dictionary
    """
    return create_message("system", content)


def create_assistant_message(content: str) -> Dict[str, str]:
    """
    Create an assistant message.
    
    Args:
        content: The content of the assistant message
        
    Returns:
        Dict[str, str]: Assistant message dictionary
    """
    return create_message("assistant", content)


def format_response(content: str, reasoning: str = None) -> str:
    """
    Format the response for display.
    
    Args:
        content: The main response content
        reasoning: Optional reasoning content
        
    Returns:
        str: Formatted response string
    """
    output = []
    
    if reasoning:
        output.append(f"Reasoning: {reasoning}")
        output.append("")
    
    output.append(f"Response: {content}")
    return "\n".join(output)


def validate_messages(messages: List[Dict[str, str]]) -> bool:
    """
    Validate that messages have the correct format.
    
    Args:
        messages: List of message dictionaries
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not messages:
        return False
    
    for message in messages:
        if not isinstance(message, dict):
            return False
        if 'role' not in message or 'content' not in message:
            return False
        if message['role'] not in ['user', 'assistant', 'system']:
            return False
    
    return True 