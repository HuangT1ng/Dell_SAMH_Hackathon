"""
Chat service module for handling NVIDIA NIM chat completions.
"""

from typing import List, Dict, Any, Optional
from client import NIMClient
from config import (
    DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_TOP_P, 
    DEFAULT_MAX_TOKENS, DEFAULT_STREAM
)


class ChatService:
    """Service class for handling chat completions with NVIDIA NIM."""
    
    def __init__(self, client: NIMClient = None):
        """
        Initialize the chat service.
        
        Args:
            client: NIM client instance, creates default if None
        """
        self.client = client or NIMClient()
        self.openai_client = self.client.get_client()
    
    def create_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = None,
        temperature: float = None,
        top_p: float = None,
        max_tokens: int = None,
        stream: bool = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create a chat completion using NVIDIA NIM.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            model: Model to use for completion
            temperature: Sampling temperature
            top_p: Top-p sampling parameter
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
            **kwargs: Additional parameters to pass to the API
            
        Returns:
            Dict containing the completion response
        """
        # Use default values if not provided
        model = model or DEFAULT_MODEL
        temperature = temperature if temperature is not None else DEFAULT_TEMPERATURE
        top_p = top_p if top_p is not None else DEFAULT_TOP_P
        max_tokens = max_tokens if max_tokens is not None else DEFAULT_MAX_TOKENS
        stream = stream if stream is not None else DEFAULT_STREAM
        
        try:
            completion = self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens,
                stream=stream,
                **kwargs
            )
            return completion
        except Exception as e:
            raise Exception(f"Error creating chat completion: {str(e)}")
    
    def get_response_content(self, completion) -> str:
        """
        Extract the response content from a completion.
        
        Args:
            completion: The completion response from the API
            
        Returns:
            str: The response content
        """
        return completion.choices[0].message.content
    
    def get_reasoning_content(self, completion) -> Optional[str]:
        """
        Extract the reasoning content from a completion if available.
        
        Args:
            completion: The completion response from the API
            
        Returns:
            Optional[str]: The reasoning content if available, None otherwise
        """
        return getattr(completion.choices[0].message, "reasoning_content", None) 