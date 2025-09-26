import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Search, Trash2, Brain, RefreshCw } from 'lucide-react';
import { useSession } from '../utils/sessionContext';

interface ChatProps {
  darkMode: boolean;
  initializationData?: { samhUsername: string };
  onInitializationComplete?: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
  isDeleted?: boolean;
  accountType?: string;
}

interface SearchResult {
  username: string;
  accountType: string;
  lastLogin: string;
  isOnline: boolean;
}

const API_BASE_URL = 'http://localhost:3001';

const Chat: React.FC<ChatProps> = ({ darkMode, initializationData, onInitializationComplete }) => {
  const { user } = useSession();
  const initializationCompleted = useRef(false);
  const startingChatWith = useRef<string | null>(null);

  // Helper function to render user avatar
  const renderUserAvatar = (accountType?: string, size: string = 'w-5 h-5') => {
    if (accountType === 'admin') {
      return <Brain className={size} />;
    }
    return '👤';
  };
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Search functionality state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // LLM quick messages state
  const [quickMessages, setQuickMessages] = useState<string[]>(['Hi there! 👋', 'How are you?', 'What\'s up?']);
  
  // Debug: Log when quick messages change
  useEffect(() => {
    console.log('🔄 Quick messages updated:', quickMessages);
  }, [quickMessages]);
  const [isGeneratingQuickMessages, setIsGeneratingQuickMessages] = useState(false);
  const [, setProcessedConversations] = useState<{[conversationId: string]: number}>({});
  const [generatingForConversation, setGeneratingForConversation] = useState<{[conversationId: string]: boolean}>({});
  const processedConversationsRef = useRef<{[conversationId: string]: number}>({});
  const processedMessageIdsRef = useRef<{[conversationId: string]: Set<string>}>({});
  
  // Mobile layout state
  const [showContactList, setShowContactList] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // API functions
  const fetchConversations = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const conversations = await response.json();
      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/messages?currentUser=${user?.username || ''}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const messages = await response.json();
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  };

  const checkForNewMessages = async (conversationId: string) => {
    try {
      const newMessages = await fetchMessages(conversationId);
      const currentMessageCount = currentMessages.length;
      const lastProcessedCount = processedConversationsRef.current[conversationId] || 0;
      
      console.log(`🔍 Polling conversation ${conversationId}:`, {
        newMessagesCount: newMessages.length,
        currentMessageCount,
        lastProcessedCount,
        hasNewMessages: newMessages.length > currentMessageCount,
        generatingForConversation: generatingForConversation[conversationId],
        userAccountType: user?.accountType
      });
      
      // Initialize processed message IDs for this conversation if not exists
      if (!processedMessageIdsRef.current[conversationId]) {
        processedMessageIdsRef.current[conversationId] = new Set();
      }
      
      // Find truly new messages by comparing with processed message IDs
      const processedIds = processedMessageIdsRef.current[conversationId];
      const newMessagesOnly = newMessages.filter((msg: any) => !processedIds.has(msg.id));
      
      if (newMessagesOnly.length > 0) {
        console.log(`🆕 New messages detected! Count: ${newMessagesOnly.length}, Total: ${newMessages.length}, Current local: ${currentMessageCount}`);
        console.log(`📋 New messages found:`, newMessagesOnly.map((msg: any) => ({ id: msg.id, sender: msg.sender })));
        
        // Update processed message IDs IMMEDIATELY
        newMessagesOnly.forEach((msg: any) => {
          processedIds.add(msg.id);
        });
        
        // Update processed count IMMEDIATELY in both ref and state
        processedConversationsRef.current[conversationId] = newMessages.length;
        setProcessedConversations(prev => ({
          ...prev,
          [conversationId]: newMessages.length
        }));
        console.log(`✅ Updated processed count for ${conversationId}:`, newMessages.length);
        
        setContacts(prev => prev.map(contact => 
          contact.id === conversationId 
            ? { ...contact, messages: newMessages }
            : contact
        ));
        
        // Generate quick messages for admin ONLY when there's a new USER message (sender: 'bot')
        if (user?.accountType === 'admin') {
          const newUserMessages = newMessagesOnly.filter((msg: any) => msg.sender === 'bot');
          
          if (newUserMessages.length > 0 && !generatingForConversation[conversationId]) {
            const lastUserMessage = newUserMessages[newUserMessages.length - 1];
            console.log('🔄 Generating quick messages for new user message:', lastUserMessage.id);
            await generateQuickMessages(conversationId, newMessages);
          } else if (generatingForConversation[conversationId]) {
            console.log('⏳ Skipping generation - already generating for this conversation');
          } else {
            console.log('⏭️ Skipping generation - no new user messages found:', {
              newMessagesCount: newMessagesOnly.length,
              newUserMessagesCount: newUserMessages.length,
              isGenerating: generatingForConversation[conversationId]
            });
          }
        }
        
        // Mark conversation as read since we're viewing it
        await markConversationAsRead(conversationId);
      }
    } catch (error) {
      console.error('Error checking for new messages:', error);
    }
  };

  const createConversation = async (user1: string, user2: string) => {
    try {
      console.log('Creating conversation API call:', { user1, user2 });
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1, user2 })
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to create conversation: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API response result:', result);
      return result.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const sendMessage = async (conversationId: string, senderUsername: string, text: string) => {
    try {
      console.log('Sending message API call:', { conversationId, senderUsername, text });
      const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, senderUsername, text })
      });
      
      console.log('Send message API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Send message API error response:', errorText);
        throw new Error(`Failed to send message: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Send message API response result:', result);
      return result.id;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.username })
      });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const deleteConversation = async (conversationId: string, isDeleted: boolean) => {
    try {
      await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted, userId: user?.username })
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/search/${encodeURIComponent(query)}?exclude=${user?.username || ''}`);
      if (!response.ok) throw new Error('Failed to search users');
      const results = await response.json();
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const refreshQuickMessages = async () => {
    if (!selectedContactId || !user?.accountType || user.accountType !== 'admin') {
      console.log('❌ Cannot refresh quick messages - no selected contact or not admin');
      return;
    }
    
    const currentMessages = selectedContact?.messages || [];
    if (currentMessages.length === 0) {
      console.log('❌ Cannot refresh quick messages - no messages in conversation');
      return;
    }
    
    console.log('🔄 Manually refreshing quick messages...');
    await generateQuickMessages(selectedContactId, currentMessages, true); // Force refresh
  };

  const generateQuickMessages = async (conversationId: string, messages: Message[], forceRefresh: boolean = false) => {
    if (!user?.accountType || user.accountType !== 'admin') {
      console.log('❌ Not generating quick messages - user is not admin');
      return;
    }
    
    // Prevent multiple simultaneous API calls for the same conversation
    if (generatingForConversation[conversationId]) {
      console.log('⏳ Already generating quick messages for this conversation, skipping...');
      return;
    }
    
    console.log('🚀 Starting quick message generation for conversation:', conversationId);
    console.log('📡 Calling NVIDIA NIMs API via backend...');
    setGeneratingForConversation(prev => ({
      ...prev,
      [conversationId]: true
    }));
    setIsGeneratingQuickMessages(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/generate-quick-messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversationId,
          messages: messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          forceRefresh
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate quick messages');
      const result = await response.json();
      console.log('✅ Quick messages generated:', result.suggestions);
      setQuickMessages(result.suggestions || ['Hi there! 👋', 'How are you?', 'What\'s up?']);
    } catch (error) {
      console.error('❌ Error generating quick messages:', error);
      // Keep default messages on error
    } finally {
      setIsGeneratingQuickMessages(false);
      setGeneratingForConversation(prev => ({
        ...prev,
        [conversationId]: false
      }));
    }
  };

  const startChatWithUser = async (username: string, _accountType?: string) => {
    console.log('Starting chat with user:', username);
    if (!user?.username) {
      console.log('No current user found');
      return;
    }

    // Check if we're already starting a chat with this user
    if (startingChatWith.current === username) {
      console.log('Already starting chat with', username, '- skipping duplicate call');
      return;
    }

    startingChatWith.current = username;

    // Check if conversation already exists
    const existingContact = contacts.find(contact => contact.name === username);
    if (existingContact) {
      console.log('Existing conversation found, switching to it');
      setSelectedContactId(existingContact.id);
      setShowSearchResults(false);
      setSearchQuery('');
      startingChatWith.current = null;
      return;
    }

    console.log('Creating new conversation between:', user.username, 'and', username);
    // Create new conversation
    const conversationId = await createConversation(user.username, username);
    if (conversationId) {
      console.log('Conversation created with ID:', conversationId);
      // Add initial message
      await sendMessage(conversationId, user.username, `Hi ${username}! 👋`);
      
      // Add to contacts
      const newContact: Contact = {
        id: conversationId,
        name: username,
        avatar: '👤', // Will be rendered using renderUserAvatar helper
        lastMessage: `Hi ${username}! 👋`,
        lastMessageTime: Date.now(),
        unreadCount: 0,
        isOnline: true,
        messages: [{
          id: Date.now().toString(),
          text: `Hi ${username}! 👋`,
          sender: 'user',
          timestamp: Date.now()
        }]
      };

      setContacts(prev => [newContact, ...prev]);
      setSelectedContactId(conversationId);
      setShowSearchResults(false);
      setSearchQuery('');
      console.log('Chat started successfully');
    } else {
      console.error('Failed to create conversation');
    }
    
    // Clear the starting chat flag
    startingChatWith.current = null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectedContact = contacts.find(contact => contact.id === selectedContactId);
  const currentMessages = selectedContact?.messages || [];

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && selectedContactId) {
        setShowContactList(false);
      } else if (!mobile) {
        setShowContactList(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [selectedContactId]);

  // Load conversations and messages when user is available
  useEffect(() => {
    if (user?.username) {
      loadUserConversations();
    }
  }, [user?.username]);

  // Load messages when a contact is selected
  useEffect(() => {
    if (selectedContactId && user?.username) {
      loadMessagesForContact(selectedContactId);
    }
  }, [selectedContactId, user?.username]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!user?.username) return;

    const pollForNewMessages = async () => {
      try {
        // Only refresh conversation metadata (unread counts, last messages) without re-fetching all messages
        await refreshConversationMetadata();
        
        // If we have a selected contact, check for new messages in that conversation
        if (selectedContactId) {
          await checkForNewMessages(selectedContactId);
        }
      } catch (error) {
        console.error('Error polling for new messages:', error);
      }
    };

    // Poll immediately, then every 3 seconds
    pollForNewMessages();
    const intervalId = setInterval(pollForNewMessages, 3000);

    return () => clearInterval(intervalId);
  }, [user?.username, selectedContactId]);

  // Handle initialization from Reddit Dashboard
  useEffect(() => {
    if (initializationData?.samhUsername && user?.username && !initializationCompleted.current && !isLoadingContacts) {
      console.log('Initializing chat with SAMH username:', initializationData.samhUsername);
      initializationCompleted.current = true;
      
      // Check if we already have a conversation with this user to avoid duplicates
      const existingContact = contacts.find(contact => contact.name === initializationData.samhUsername);
      if (existingContact) {
        console.log('Conversation already exists, switching to it (no new Hi message)');
        setSelectedContactId(existingContact.id);
        setShowSearchResults(false);
        setSearchQuery('');
      } else {
        console.log('No existing conversation found, creating new one with Hi message');
        startChatWithUser(initializationData.samhUsername);
      }
      
      // Clear initialization data after use
      if (onInitializationComplete) {
        onInitializationComplete();
      }
    }
  }, [initializationData, user?.username, onInitializationComplete, isLoadingContacts, contacts]);

  // Reset initialization flag when initializationData changes
  useEffect(() => {
    if (initializationData) {
      initializationCompleted.current = false;
    }
  }, [initializationData]);


  const refreshConversationMetadata = async () => {
    if (!user?.username) return;
    
    try {
      console.log('🔄 Refreshing conversation metadata (unread counts, last messages)');
      const conversations = await fetchConversations(user.username);
      
      // Update only metadata (unread counts, last messages) without re-fetching all messages
      setContacts(prev => prev.map(contact => {
        const updatedConv = conversations.find((conv: any) => conv.id === contact.id);
        if (updatedConv) {
          // Only update if there are actual changes to prevent unnecessary re-renders
          const hasChanges = 
            contact.lastMessage !== (updatedConv.last_message || contact.lastMessage) ||
            contact.lastMessageTime !== (updatedConv.last_message_time || contact.lastMessageTime) ||
            contact.unreadCount !== (updatedConv.unread_count || 0) ||
            contact.isOnline !== (updatedConv.is_online === 1) ||
            contact.isDeleted !== (updatedConv.is_deleted === 1) ||
            contact.accountType !== updatedConv.contact_account_type;
          
          if (hasChanges) {
            console.log(`🔄 Updating metadata for conversation ${contact.id}`);
            return {
              ...contact,
              lastMessage: updatedConv.last_message || contact.lastMessage,
              lastMessageTime: updatedConv.last_message_time || contact.lastMessageTime,
              unreadCount: updatedConv.unread_count || 0,
              isOnline: updatedConv.is_online === 1,
              isDeleted: updatedConv.is_deleted === 1,
              accountType: updatedConv.contact_account_type
            };
          }
        }
        return contact; // Return same object reference if no changes
      }));
    } catch (error) {
      console.error('Error refreshing conversation metadata:', error);
    }
  };

  const loadUserConversations = async (showLoading: boolean = true) => {
    if (!user?.username) return;
    
    if (showLoading) {
      setIsLoadingContacts(true);
    }
    try {
      const conversations = await fetchConversations(user.username);
      
      // Convert database conversations to Contact format
      const contactsData: Contact[] = await Promise.all(
        conversations.map(async (conv: any) => {
          const messages = await fetchMessages(conv.id);
          return {
            id: conv.id,
            name: conv.contact_name,
            avatar: '👤', // Will be rendered using renderUserAvatar helper
            lastMessage: conv.last_message || '',
            lastMessageTime: conv.last_message_time || Date.now(),
            unreadCount: conv.unread_count || 0,
            isOnline: conv.is_online === 1,
            messages: messages.map((msg: any) => ({
              id: msg.id,
              text: msg.text,
              sender: msg.sender,
              timestamp: msg.timestamp
            })),
            isDeleted: conv.is_deleted === 1,
            accountType: conv.contact_account_type
          };
        })
      );
      
      setContacts(contactsData);
      
      // Set first contact as selected if none selected
      if (contactsData.length > 0 && !selectedContactId) {
        setSelectedContactId(contactsData[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Initialize with default contacts if no user data
      initializeDefaultContacts();
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const loadMessagesForContact = async (contactId: string) => {
    try {
      const messages = await fetchMessages(contactId);
      const formattedMessages = messages.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp
      }));
      
      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, messages: formattedMessages }
          : contact
      ));
      
      // Initialize processed count and message IDs for this conversation
      processedConversationsRef.current[contactId] = formattedMessages.length;
      processedMessageIdsRef.current[contactId] = new Set(formattedMessages.map((msg: Message) => msg.id));
      setProcessedConversations(prev => ({
        ...prev,
        [contactId]: formattedMessages.length
      }));
      console.log(`📊 Initialized processed count for ${contactId}:`, formattedMessages.length);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const initializeDefaultContacts = async () => {
    // No default contacts - users will start conversations with real users
    setContacts([]);
  };


  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !selectedContact || !user?.username) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: Date.now()
    };

    // Save user message to database
    if (!selectedContactId) {
      console.error('No contact selected');
      return;
    }
    const messageId = await sendMessage(selectedContactId, user.username, inputText);
    if (!messageId) {
      console.error('Failed to save user message');
      return;
    }

    // Update the selected contact's messages locally
    setContacts(prev => prev.map(contact => 
      contact.id === selectedContactId 
        ? { 
            ...contact, 
            messages: [...contact.messages, { ...userMessage, id: messageId }],
            lastMessage: inputText,
            lastMessageTime: Date.now()
          }
        : contact
    ));
    
    setInputText('');
    setIsLoading(false);
  };


  const handleContactSelect = async (contactId: string) => {
    setSelectedContactId(contactId);
    // On mobile, hide contact list when conversation is selected
    if (isMobile) {
      setShowContactList(false);
    }
    // Mark messages as read in database and locally
    await markConversationAsRead(contactId);
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, unreadCount: 0 }
        : contact
    ));
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Show deleted contacts only when searching, hide them from normal view
    if (contact.isDeleted) {
      return searchQuery.trim() !== '' && matchesSearch;
    }
    // For non-deleted contacts, show them normally
    return !contact.isDeleted && matchesSearch;
  });

  const handleDeleteContact = (contactId: string) => {
    setContactToDelete(contactId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (contactToDelete) {
      // Mark contact as deleted in database and locally
      await deleteConversation(contactToDelete, true);
      setContacts(prev => prev.map(contact => 
        contact.id === contactToDelete 
          ? { ...contact, isDeleted: true }
          : contact
      ));
      // If the deleted contact was selected, switch to the first available contact
      if (selectedContactId === contactToDelete) {
        const remainingContacts = contacts.filter(contact => contact.id !== contactToDelete && !contact.isDeleted);
        if (remainingContacts.length > 0) {
          setSelectedContactId(remainingContacts[0].id);
        }
      }
    }
    setShowDeleteModal(false);
    setContactToDelete(null);
  };

  const restoreContact = async (contactId: string) => {
    // Restore contact in database and locally
    await deleteConversation(contactId, false);
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, isDeleted: false }
        : contact
    ));
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setContactToDelete(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show login prompt if user is not logged in
  if (!user) {
    return (
      <div className="space-y-6">
        <div className={`rounded-xl border transition-all duration-300 ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 backdrop-blur-sm border-blue-100'
        }`}>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Please log in to access chat
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                You need to be logged in to view and send messages
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Chat Layout */}
      <div className={`rounded-xl border transition-all duration-300 ${
        darkMode 
          ? 'bg-[#40414F] border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border-blue-100'
      }`}>
        <div className={`flex ${isMobile ? 'h-[calc(100vh-200px)]' : 'h-[600px]'}`}>
          {/* Contact List Sidebar */}
          <div className={`${isMobile ? (showContactList ? 'w-full' : 'hidden') : 'w-80'} border-r ${
            darkMode ? 'border-gray-700' : 'border-blue-100'
          }`}>
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search contacts or users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                  }`}
                />
                {isSearching && (
                  <Loader2 className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                )}
              </div>

            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingContacts ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Loading conversations...
                    </span>
                  </div>
                </div>
              ) : showSearchResults && searchResults.length > 0 ? (
                // Show search results
                <div>
                  <div className={`px-4 py-2 border-b ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className={`text-xs font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Search Results ({searchResults.length})
                    </div>
                  </div>
                  {searchResults.map((result, index) => (
                    <div
                      key={`search-${index}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Search result clicked:', result.username);
                        startChatWithUser(result.username, result.accountType);
                      }}
                      className={`group p-4 cursor-pointer transition-all duration-200 border-b ${
                        darkMode
                          ? 'hover:bg-gray-700 border-gray-700'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                              darkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                              {renderUserAvatar(result.accountType, 'w-5 h-5')}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className={`font-semibold truncate text-sm ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {result.username}
                              </h3>
                            </div>
                            <p className={`text-xs truncate ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {result.accountType}
                            </p>
                            <p className={`text-xs ${
                              darkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              Click to start chat
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : showSearchResults && searchResults.length === 0 && searchQuery.trim().length >= 2 && !isSearching ? (
                // No search results found
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No users found matching "{searchQuery}"
                    </div>
                    <div className={`text-xs mt-1 ${
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Try a different search term
                    </div>
                  </div>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No conversations found
                  </span>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`group p-4 cursor-pointer transition-all duration-200 border-b ${
                    contact.isDeleted
                      ? darkMode
                        ? 'bg-gray-800/50 border-gray-600 opacity-60'
                        : 'bg-gray-100/50 border-gray-300 opacity-60'
                      : selectedContactId === contact.id
                        ? darkMode
                          ? 'bg-blue-600/20 border-blue-500'
                          : 'bg-blue-50 border-blue-200'
                        : darkMode
                          ? 'hover:bg-gray-700 border-gray-700'
                          : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div 
                      className="flex-1 flex items-center gap-2 min-w-0"
                      onClick={() => !contact.isDeleted && handleContactSelect(contact.id)}
                    >
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          {renderUserAvatar(contact.accountType, 'w-5 h-5')}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold truncate text-sm ${
                            contact.isDeleted
                              ? darkMode ? 'text-gray-500' : 'text-gray-400'
                              : darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {contact.name}
                          </h3>
                          {contact.unreadCount > 0 && !contact.isDeleted && (
                            <span className={`px-1.5 py-0.5 text-xs rounded-full flex-shrink-0 ${
                              darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                            }`}>
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate ${
                          contact.isDeleted
                            ? darkMode ? 'text-gray-600' : 'text-gray-500'
                            : darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {contact.isDeleted ? 'Deleted' : contact.lastMessage}
                        </p>
                        <p className={`text-xs ${
                          darkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {new Date(contact.lastMessageTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    {contact.isDeleted ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          restoreContact(contact.id);
                        }}
                        className={`p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 ${
                          darkMode
                            ? 'hover:bg-green-600/20 text-green-400 hover:text-green-300'
                            : 'hover:bg-green-100 text-green-500 hover:text-green-600'
                        }`}
                        title="Restore chat"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteContact(contact.id);
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 ${
                          darkMode
                            ? 'hover:bg-red-600/20 text-red-400 hover:text-red-300'
                            : 'hover:bg-red-100 text-red-500 hover:text-red-600'
                        }`}
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${isMobile ? (showContactList ? 'hidden' : 'flex-1') : 'flex-1'} flex flex-col min-w-0 overflow-hidden`}>
            {/* Chat Header */}
            {selectedContact && (
              <div className={`p-4 border-b ${
                darkMode ? 'border-gray-700' : 'border-blue-100'
              }`}>
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  {isMobile && (
                    <button
                      onClick={() => setShowContactList(true)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        darkMode
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    {renderUserAvatar(selectedContact.accountType, 'w-6 h-6')}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {selectedContact.name}
                    </h3>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {selectedContact.isOnline ? 'Online' : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`max-w-[85%] px-3 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? darkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm break-words">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user'
                        ? 'text-blue-100'
                        : darkMode
                          ? 'text-gray-400'
                          : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}

              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Messages and Input Area - Only show when a contact is selected */}
            {selectedContactId && (
              <>
                {/* Suggested Messages - Only for Admin Users */}
                {user?.accountType === 'admin' && (
                  <div className={`border-t px-3 py-1.5 min-w-0 ${
                    darkMode ? 'border-gray-700' : 'border-blue-100'
                  }`}>
                    <div className={`flex items-center gap-2 ${isMobile ? 'flex-row min-w-0' : ''}`}>
                      <h4 className={`text-xs font-medium flex-shrink-0 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Suggestions:
                      </h4>
                      <div className={`flex gap-1.5 ${isMobile ? 'flex-1 overflow-x-auto scrollbar-hide min-w-0' : 'flex-1 justify-center'}`}>
                        {isGeneratingQuickMessages ? (
                          <div className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Generating...
                            </span>
                          </div>
                        ) : (
                          quickMessages.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => setInputText(suggestion)}
                              className={`px-2 py-1 text-xs rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                                darkMode
                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                              }`}
                            >
                              {suggestion}
                            </button>
                          ))
                        )}
                      </div>
                      <button
                        onClick={refreshQuickMessages}
                        disabled={isGeneratingQuickMessages}
                        className={`p-1 rounded-lg transition-all duration-200 flex-shrink-0 ${
                          isGeneratingQuickMessages
                            ? darkMode
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : darkMode
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                        }`}
                        title="Refresh quick messages"
                      >
                        <RefreshCw className={`w-3 h-3 ${isGeneratingQuickMessages ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className={`border-t p-3 min-w-0 ${
                  darkMode ? 'border-gray-700' : 'border-blue-100'
                }`}>
                  <div className="flex gap-2 min-w-0">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className={`flex-1 p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 transition-all duration-200 min-w-0 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                      }`}
                      rows={isMobile ? 1 : 2}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim() || isLoading}
                      className={`p-3 rounded-lg transition-all duration-200 ${
                        !inputText.trim() || isLoading
                          ? darkMode
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : darkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cancelDelete}
          />
          
          {/* Modal Content */}
          <div className={`relative w-full max-w-md rounded-xl border transition-all duration-300 ${
            darkMode 
              ? 'bg-[#40414F] border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${
                  darkMode ? 'bg-red-600/20' : 'bg-red-100'
                }`}>
                  <Trash2 className={`w-6 h-6 ${
                    darkMode ? 'text-red-400' : 'text-red-500'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Delete Chat
                  </h3>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <p className={`mb-6 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Are you sure you want to delete this chat?
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
