import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Search, Trash2, Brain, RefreshCw, MoreVertical, ArrowLeft, Mic, Paperclip, X, Download } from 'lucide-react';
import { useSession } from '../utils/sessionContext';
import SAMHWorkerImage from '../Assets/SAMHWorker.png';

interface ChatProps {
  darkMode: boolean;
  initializationData?: { samhUsername: string };
  onInitializationComplete?: () => void;
  onNavigate?: (view: string) => void;
  navigation?: Array<{
    id: string;
    label: string;
    icon: any;
    description: string;
  }>;
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

// Environment-aware API configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'https://backend-ntu.apps.innovate.sg-cna.com';

const Chat: React.FC<ChatProps> = ({ darkMode, initializationData, onInitializationComplete, onNavigate, navigation = [] }) => {
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

  const [isGeneratingQuickMessages, setIsGeneratingQuickMessages] = useState(false);
  const [, setProcessedConversations] = useState<{[conversationId: string]: number}>({});
  const [generatingForConversation, setGeneratingForConversation] = useState<{[conversationId: string]: boolean}>({});
  const processedConversationsRef = useRef<{[conversationId: string]: number}>({});
  const processedMessageIdsRef = useRef<{[conversationId: string]: Set<string>}>({});
  
  // Mobile layout state
  const [showContactList, setShowContactList] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'groups' | 'contacts'>('all');
  const [currentView, setCurrentView] = useState<'list' | 'chat'>('list');
  const [showNavMenu, setShowNavMenu] = useState(false);

  // LLM quick messages state (USP Feature)
  const [quickMessages, setQuickMessages] = useState<string[]>(['Hi there! 👋', 'How are you?', 'What\'s up?']);

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

  // AI Quick Messages Functions (USP Feature)
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

  // Debug: Log when quick messages change
  useEffect(() => {
    console.log('🔄 Quick messages updated:', quickMessages);
  }, [quickMessages]);

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

  // Set body and html background to prevent white areas when scrolling
  useEffect(() => {
    const originalBodyBg = document.body.style.background;
    const originalHtmlBg = document.documentElement.style.background;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    if (currentView === 'chat') {
      // Set both body and html to blue background
      document.body.style.background = '#4a6cf7';
      document.documentElement.style.background = '#4a6cf7';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Set both body and html to white background
      document.body.style.background = '#ffffff';
      document.documentElement.style.background = '#ffffff';
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.background = originalBodyBg;
      document.documentElement.style.background = originalHtmlBg;
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [currentView]);

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
      
      // Keep in list view by default - don't auto-select contacts
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
    // Sample contacts to match the mobile interface design
    const sampleContacts: Contact[] = [
      {
        id: '1',
        name: 'Larry Machigo',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        lastMessage: 'Ok, Let me check',
        lastMessageTime: Date.now() - 300000, // 5 minutes ago
        unreadCount: 0,
        isOnline: true,
        messages: [
          { id: '1', text: 'Hey 👋', sender: 'bot', timestamp: Date.now() - 600000 },
          { id: '2', text: 'Are you available for a New UI Project', sender: 'bot', timestamp: Date.now() - 580000 },
          { id: '3', text: 'Hello!', sender: 'user', timestamp: Date.now() - 560000 },
          { id: '4', text: 'yes, have some space for the new task', sender: 'user', timestamp: Date.now() - 540000 },
          { id: '5', text: 'Cool, should I share the details now?', sender: 'bot', timestamp: Date.now() - 520000 },
          { id: '6', text: 'Yes Sure, please', sender: 'user', timestamp: Date.now() - 500000 },
          { id: '7', text: 'Great, here is the SOW of the Project', sender: 'bot', timestamp: Date.now() - 480000 },
          { id: '8', text: 'UI Brief.docx', sender: 'bot', timestamp: Date.now() - 460000 }
        ],
        accountType: 'user'
      },
      {
        id: '2',
        name: 'Natalie Nora',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        lastMessage: 'Natalie is typing...',
        lastMessageTime: Date.now() - 120000, // 2 minutes ago
        unreadCount: 2,
        isOnline: true,
        messages: [],
        accountType: 'user'
      },
      {
        id: '3',
        name: 'Jennifer Jones',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        lastMessage: '🎵 Voice message',
        lastMessageTime: Date.now() - 7200000, // 2 hours ago
        unreadCount: 0,
        isOnline: false,
        messages: [],
        accountType: 'user'
      },
      {
        id: '4',
        name: 'Larry Machigo',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        lastMessage: 'See you tomorrow, take...',
        lastMessageTime: Date.now() - 86400000, // Yesterday
        unreadCount: 0,
        isOnline: false,
        messages: [],
        accountType: 'user'
      },
      {
        id: '5',
        name: 'Sofia',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
        lastMessage: 'Oh... thank you so...',
        lastMessageTime: Date.now() - 2592000000, // 30 days ago
        unreadCount: 0,
        isOnline: false,
        messages: [],
        accountType: 'user'
      },
      {
        id: '6',
        name: 'Haider Lve',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        lastMessage: '🎯 Sticker',
        lastMessageTime: Date.now() - 1209600000, // 14 days ago
        unreadCount: 0,
        isOnline: false,
        messages: [],
        accountType: 'user'
      },
      {
        id: '7',
        name: 'Mr. elon',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100&h=100&fit=crop&crop=face',
        lastMessage: 'Cool :)))',
        lastMessageTime: Date.now() - 604800000, // 7 days ago
        unreadCount: 0,
        isOnline: false,
        messages: [],
        accountType: 'user'
      },
      {
        id: '8',
        name: 'Gupta',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
        lastMessage: 'hihi',
        lastMessageTime: Date.now() - 1800000, // 30 minutes ago
        unreadCount: 0,
        isOnline: true,
        messages: [],
        accountType: 'user'
      }
    ];
    setContacts(sampleContacts);
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
    setCurrentView('chat');
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

  const formatMessageTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 24) {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 30) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return new Date(timestamp).toLocaleDateString([], { day: 'numeric', month: 'short' });
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
    <div className="min-h-screen" style={{ 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: currentView === 'chat' ? '#4a6cf7' : '#ffffff',
      minHeight: '100vh',
      height: currentView === 'chat' ? '100vh' : 'auto'
    }}>
      {currentView === 'list' ? (
        // Mobile Chat List View - Fullscreen
        <div className="bg-white min-h-screen overflow-hidden">
          {/* Header - Clean and Simple */}
          <div className="px-4 py-3 bg-white">
            <div className="flex justify-between items-center">
              <div className="ml-2" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
                <div className="text-sm text-gray-400 font-light tracking-wide">Hello,</div>
                <div className="text-2xl font-medium text-gray-900 -mt-0.5 tracking-tight">
                  {user?.username || 'Johan'}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowNavMenu(true)}
                  className="w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-blue-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white px-6 py-4">
            <div className="bg-gray-100 rounded-full p-1 flex w-full max-w-sm" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-3 px-4 text-sm font-semibold transition-all duration-200 rounded-full text-center ${
                  activeTab === 'all'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Chats
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`flex-1 py-3 px-4 text-sm font-semibold transition-all duration-200 rounded-full text-center ${
                  activeTab === 'groups'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Groups
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`flex-1 py-3 px-4 text-sm font-semibold transition-all duration-200 rounded-full text-center ${
                  activeTab === 'contacts'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Contacts
              </button>
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto bg-white">
            {filteredContacts.map((contact, index) => (
              <div
                key={contact.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
                onClick={() => handleContactSelect(contact.id)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    {contact.avatar.startsWith('http') ? (
                      <img 
                        src={contact.avatar} 
                        alt={contact.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl">
                        {contact.avatar}
                      </div>
                    )}
                    {/* Fallback initials */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg hidden">
                      {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                  </div>
                  {contact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-blue-700 transition-colors">
                        {contact.name}
                      </h3>
                      {contact.name === 'Larry Machigo' && contact.id === '1' && (
                        <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">⚡</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {formatMessageTime(contact.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate font-medium">
                      {contact.lastMessage}
                    </p>
                    {contact.unreadCount > 0 && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg min-w-[24px] text-center animate-bounce">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        // Chat Conversation View - Fullscreen
        <div className="fixed inset-0 flex flex-col" style={{
          background: '#4a6cf7'
        }}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full blur-2xl"></div>
            <div className="absolute bottom-40 left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          
          {/* Seamless Header - Blended with Chat */}
          {selectedContact && (
            <div className="relative z-20 px-6 pt-6 pb-4 flex items-center gap-4 text-white">
              <button
                onClick={() => setCurrentView('list')}
                className="p-3 hover:bg-white/10 rounded-2xl transition-all duration-300 hover:scale-110"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10 shadow-lg">
                  <img 
                    src={SAMHWorkerImage} 
                    alt={selectedContact.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement!;
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xl text-white">👤</div>';
                    }}
                  />
                </div>
                {selectedContact.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
                )}
              </div>
              <div className="flex-1" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
                <h3 className="text-2xl font-medium text-white tracking-tight">{selectedContact.name}</h3>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto relative z-10 px-6 space-y-4 pb-6">
            {currentMessages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                } animate-fadeIn`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`max-w-[80%] px-5 py-4 rounded-3xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                  message.sender === 'user'
                    ? 'bg-white/95 text-gray-900 shadow-white/20'
                    : 'bg-white/20 text-white shadow-blue-500/30'
                }`}>
                  <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                  {message.text.includes('UI Brief.docx') && (
                    <div className="mt-3 p-3 bg-white/10 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Paperclip className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">UI Brief.docx</p>
                        <p className="text-xs opacity-80">269.18 KB</p>
                      </div>
                      <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>

          {/* AI Quick Messages - Above Input (USP Feature) */}
          {user?.accountType === 'admin' && selectedContactId && (
            <div className="relative z-10 px-6 pb-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    
                    Suggested Messages
                  </h3>
                  <button
                    onClick={refreshQuickMessages}
                    disabled={isGeneratingQuickMessages}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      isGeneratingQuickMessages
                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                    title="Refresh quick messages"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingQuickMessages ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="space-y-2">
                  {isGeneratingQuickMessages ? (
                    <div className="flex items-center gap-2 p-3 bg-white/10 rounded-xl">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span className="text-white/90 text-xs">Generating AI suggestions...</span>
                    </div>
                  ) : (
                    quickMessages.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setInputText(suggestion)}
                        className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left transition-all duration-200 group"
                      >
                        <p className="text-white/90 text-xs group-hover:text-white">{suggestion}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="relative z-10 p-6">
            <div className="flex items-end gap-3 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-3 border border-white/20">
              <div className="flex-1">
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    // Auto-resize like WhatsApp
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 rounded-2xl border-0 focus:outline-none text-gray-900 placeholder-gray-500 font-normal bg-transparent resize-none overflow-hidden leading-relaxed"
                  disabled={isLoading}
                  rows={1}
                  style={{ 
                    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    minHeight: '44px',
                    maxHeight: '100px',
                    lineHeight: '1.4'
                  }}
                />
              </div>
              <button className="p-2 hover:bg-blue-50 rounded-full transition-all duration-200 flex-shrink-0">
                <Mic className="w-5 h-5 text-gray-600 hover:text-blue-600" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
                  !inputText.trim() || isLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slide-out Navigation */}
      {showNavMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={() => setShowNavMenu(false)}
          />
          
          {/* Slide-out Menu */}
          <div className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${
            showNavMenu ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="h-full bg-white border-l border-gray-200 shadow-2xl">
              {/* Menu Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">.AI</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        KAI
                      </h2>
                      <p className="text-sm text-slate-500">
                        Navigation
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNavMenu(false)}
                    className="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="p-4">
                <div className="space-y-2">
                  {navigation.map(({ id, label, icon: Icon, description }) => (
                    <button
                      key={id}
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate(id);
                        }
                        setShowNavMenu(false);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                        id === 'chat'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'hover:bg-gray-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{label}</div>
                        <div className={`text-sm ${
                          id === 'chat'
                            ? 'text-white/80'
                            : 'text-gray-500'
                        }`}>
                          {description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </nav>

              {/* User Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
                    <span className="text-lg text-gray-600">
                      👤
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">
                      {user?.username}
                    </div>
                    <div className="text-sm text-slate-500">
                      {user?.accountType}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hidden original layout for compatibility */}
      <div className="hidden">
        <div className={`flex ${isMobile ? 'h-[calc(100vh-200px)]' : 'h-[600px]'}`}>
          {/* Contact List Sidebar */}
          <div className={`${isMobile ? (showContactList ? 'w-full' : 'hidden') : 'w-80'} border-r ${
            darkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-white'
          }`}>
            {/* Search Bar */}
            <div className={`p-6 border-b border-gray-100 dark:border-slate-600/50 ${
              darkMode ? 'bg-slate-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50'
            }`}>
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-blue-400' : 'text-blue-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search contacts or users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-sm ${
                    darkMode
                      ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                      : 'bg-white border-blue-200 text-slate-900 placeholder-slate-500 hover:border-blue-300'
                  }`}
                />
                {isSearching && (
                  <Loader2 className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin ${
                    darkMode ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                )}
              </div>

            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingContacts ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#4a6cf7' }} />
                    <span className={`text-sm`} style={{
                      color: darkMode ? '#4a6cf7' : '#4a6cf7'
                    }}>
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
                  className={`group p-4 cursor-pointer transition-all duration-300 border-b hover:scale-[1.01] ${
                    contact.isDeleted
                      ? darkMode
                        ? 'bg-slate-800/50 border-slate-600 opacity-60'
                        : 'bg-slate-100/50 border-slate-300 opacity-60'
                      : selectedContactId === contact.id
                        ? darkMode
                          ? 'border-blue-400 bg-blue-600/10 shadow-md'
                          : 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                        : darkMode
                          ? 'hover:bg-slate-700/50 border-slate-700 hover:shadow-sm'
                          : 'hover:border-blue-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div 
                      className="flex-1 flex items-center gap-2 min-w-0"
                      onClick={() => !contact.isDeleted && handleContactSelect(contact.id)}
                    >
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm ${
                          darkMode ? 'bg-gradient-to-br from-slate-600 to-slate-700' : 'bg-gradient-to-br from-blue-100 to-indigo-100'
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
                            <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 shadow-sm ${
                              darkMode ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                            }`}>
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate font-medium ${
                          contact.isDeleted
                            ? darkMode ? 'text-gray-600' : 'text-gray-500'
                            : darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {contact.isDeleted ? 'Deleted' : contact.lastMessage}
                        </p>
                        <p className={`text-xs font-medium ${
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
          <div className={`${isMobile ? (showContactList ? 'hidden' : 'flex-1') : 'flex-1'} flex flex-col min-w-0 overflow-hidden ${
            darkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            {/* Chat Header */}
            {selectedContact && (
              <div className={`p-6 border-b ${
                darkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-200 bg-white'
              }`}>
                <div className="flex items-center gap-4">
                  {/* Back button for mobile */}
                  {isMobile && (
                    <button
                      onClick={() => setShowContactList(true)}
                      className={`p-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
                        darkMode
                          ? 'hover:bg-slate-700 text-slate-300'
                          : 'hover:bg-blue-100 text-blue-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg ${
                    selectedContact.accountType === 'admin' 
                      ? '' 
                      : darkMode ? 'bg-slate-700' : 'bg-slate-100'
                  }`} style={{
                    background: selectedContact.accountType === 'admin' 
                      ? '#4a6cf7' 
                      : undefined
                  }}>
                    {renderUserAvatar(selectedContact.accountType, 'w-6 h-6')}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {selectedContact.name}
                    </h3>
                    <p className={`text-sm font-medium ${
                      selectedContact.isOnline 
                        ? 'text-green-600' 
                        : darkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      {selectedContact.isOnline ? '🟢 Online' : '⚫ Offline'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${
              darkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                    message.sender === 'user'
                      ? 'text-white'
                      : darkMode
                        ? 'bg-gradient-to-br from-green-700 to-green-800 text-white'
                        : 'text-slate-900 border border-green-200'
                  }`} style={{
                    background: message.sender === 'user'
                      ? '#4a6cf7' 
                      : darkMode 
                        ? undefined 
                        : 'linear-gradient(to bottom right, #dcfce7, #bbf7d0)'
                  }}>
                    <p className="text-sm break-words leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-2 font-medium ${
                      message.sender === 'user'
                        ? 'text-white/80'
                        : darkMode
                          ? 'text-slate-400'
                          : 'text-slate-500'
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
                <div className={`border-t p-6 min-w-0 ${
                  darkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-end gap-3 min-w-0">
                    <div className="flex-1">
                      <textarea
                        value={inputText}
                        onChange={(e) => {
                          setInputText(e.target.value);
                          // Auto-resize like WhatsApp
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className={`w-full px-4 py-3 rounded-2xl border resize-none focus:outline-none focus:ring-2 transition-all duration-300 shadow-sm overflow-hidden leading-relaxed ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                            : 'bg-white border-gray-300 text-slate-900 placeholder-slate-500'
                        }`}
                        rows={1}
                        style={{
                          minHeight: '44px',
                          maxHeight: '100px',
                          lineHeight: '1.4'
                        }}
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim() || isLoading}
                      className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 ${
                        !inputText.trim() || isLoading
                          ? darkMode
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'text-white shadow-lg'
                      }`} style={{
                        background: !inputText.trim() || isLoading
                          ? undefined
                          : '#4a6cf7'
                      }}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
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
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600' 
              : 'border-blue-200'
          }`} style={{
            background: darkMode 
              ? undefined 
              : 'linear-gradient(to bottom right, #ffffff, #f8fafc)'
          }}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${
                  darkMode ? 'bg-red-500/20' : 'bg-red-100'
                }`}>
                  <Trash2 className={`w-6 h-6 ${
                    darkMode ? 'text-red-400' : 'text-red-500'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    Delete Chat
                  </h3>
                  <p className={`text-sm ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <p className={`mb-6 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Are you sure you want to delete this chat?
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    darkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-white"
                  style={{ background: '#ec4899' }}
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
