"""
Client module for NVIDIA NIM API client setup.
"""

from openai import OpenAI
from config import NVIDIA_BASE_URL, NVIDIA_API_KEY


class NIMClient:
    """Client class for interacting with NVIDIA NIM API."""
    
    def __init__(self, base_url: str = None, api_key: str = None):
        """
        Initialize the NIM client.
        
        Args:
            base_url: The base URL for the NVIDIA API
            api_key: The API key for authentication
        """
        self.base_url = base_url or NVIDIA_BASE_URL
        self.api_key = api_key or NVIDIA_API_KEY
        self.client = self._create_client()
    
    def _create_client(self) -> OpenAI:
        """
        Create and return an OpenAI client configured for NVIDIA NIM.
        
        Returns:
            OpenAI: Configured OpenAI client
        """
        return OpenAI(
            base_url=self.base_url,
            api_key=self.api_key
        )
    
    def get_client(self) -> OpenAI:
        """
        Get the configured OpenAI client.
        
        Returns:
            OpenAI: The configured client
        """
        return self.client 