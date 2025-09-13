import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Loader2, Search, Trash2, Brain } from 'lucide-react';

interface ChatProps {
  darkMode: boolean;
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
}

const Chat: React.FC<ChatProps> = ({ darkMode }) => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Dr. Sarah Wilson',
      avatar: '👩‍⚕️',
      lastMessage: 'How are you feeling today?',
      lastMessageTime: Date.now() - 300000, // 5 minutes ago
      unreadCount: 2,
      isOnline: true,
      messages: [
        {
          id: '1',
          text: 'Hello! I\'m Dr. Sarah, your mental wellness counselor. How can I help you today?',
          sender: 'bot',
          timestamp: Date.now() - 3600000
        },
        {
          id: '2',
          text: 'I\'ve been feeling anxious lately',
          sender: 'user',
          timestamp: Date.now() - 1800000
        },
        {
          id: '3',
          text: 'I understand. Anxiety is very common and manageable. Let\'s talk about what triggers your anxiety.',
          sender: 'bot',
          timestamp: Date.now() - 300000
        }
      ]
    },
    {
      id: '2',
      name: 'AI Wellness Bot',
      avatar: '🤖',
      lastMessage: 'Here are some breathing exercises...',
      lastMessageTime: Date.now() - 600000, // 10 minutes ago
      unreadCount: 0,
      isOnline: true,
      messages: [
        {
          id: '1',
          text: 'Hello! I\'m your AI mental wellness assistant. How can I help you today?',
          sender: 'bot',
          timestamp: Date.now() - 7200000
        }
      ]
    },
    {
      id: '3',
      name: 'Support Group',
      avatar: '👥',
      lastMessage: 'Welcome to our support community!',
      lastMessageTime: Date.now() - 1800000, // 30 minutes ago
      unreadCount: 5,
      isOnline: true,
      messages: [
        {
          id: '1',
          text: 'Welcome to our mental wellness support group! Feel free to share your experiences.',
          sender: 'bot',
          timestamp: Date.now() - 1800000
        }
      ]
    },
    {
      id: '4',
      name: 'Crisis Counselor',
      avatar: '🆘',
      lastMessage: 'I\'m here if you need immediate support',
      lastMessageTime: Date.now() - 86400000, // 1 day ago
      unreadCount: 0,
      isOnline: false,
      messages: [
        {
          id: '1',
          text: 'I\'m here if you need immediate support. You\'re not alone.',
          sender: 'bot',
          timestamp: Date.now() - 86400000
        }
      ]
    }
  ]);

  const [selectedContactId, setSelectedContactId] = useState<string>('1');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectedContact = contacts.find(contact => contact.id === selectedContactId);
  const currentMessages = selectedContact?.messages || [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !selectedContact) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: Date.now()
    };

    // Update the selected contact's messages
    setContacts(prev => prev.map(contact => 
      contact.id === selectedContactId 
        ? { 
            ...contact, 
            messages: [...contact.messages, userMessage],
            lastMessage: inputText,
            lastMessageTime: Date.now()
          }
        : contact
    ));
    
    setInputText('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I understand you're feeling ${inputText.toLowerCase()}. That's completely normal, and I'm here to support you. Would you like to talk more about what's on your mind, or would you prefer some coping strategies?`,
        sender: 'bot',
        timestamp: Date.now()
      };
      
      setContacts(prev => prev.map(contact => 
        contact.id === selectedContactId 
          ? { 
              ...contact, 
              messages: [...contact.messages, userMessage, botMessage],
              lastMessage: botMessage.text,
              lastMessageTime: Date.now()
            }
          : contact
      ));
      setIsLoading(false);
    }, 1500);
  };

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    // Mark messages as read
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

  const confirmDelete = () => {
    if (contactToDelete) {
      // Mark contact as deleted instead of removing it
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

  const restoreContact = (contactId: string) => {
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

  return (
    <div className="space-y-6">
      {/* Main Chat Layout */}
      <div className={`rounded-xl border transition-all duration-300 ${
        darkMode 
          ? 'bg-[#40414F] border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border-blue-100'
      }`}>
        <div className="flex h-[600px]">
          {/* Contact List Sidebar */}
          <div className={`w-80 border-r ${
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
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map((contact) => (
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
                          {contact.avatar}
                        </div>
                        {contact.isOnline && !contact.isDeleted && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
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
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            {selectedContact && (
              <div className={`p-4 border-b ${
                darkMode ? 'border-gray-700' : 'border-blue-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    {selectedContact.avatar}
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
                      {selectedContact.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      {selectedContact?.avatar}
                    </div>
                  )}
                  
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? darkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.text}</p>
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

                  {message.sender === 'user' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      darkMode ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}>
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    {selectedContact?.avatar}
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        AI is typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Recommended Messages */}
            <div className={`border-t px-4 py-2 ${
              darkMode ? 'border-gray-700' : 'border-blue-100'
            }`}>
              <div className="flex items-center gap-3">
                <h4 className={`text-xs font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Suggested:
                </h4>
                <div className="flex gap-3 flex-1 justify-center">
                  {[
                    'How are you feeling today?',
                    'I need help with anxiety',
                    'What are some coping strategies?'
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputText(suggestion)}
                      className={`px-2 py-1 text-xs rounded-full transition-all duration-200 ${
                        darkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className={`border-t p-4 ${
              darkMode ? 'border-gray-700' : 'border-blue-100'
            }`}>
              <div className="flex gap-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className={`flex-1 p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 transition-all duration-200 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                  }`}
                  rows={2}
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
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
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
