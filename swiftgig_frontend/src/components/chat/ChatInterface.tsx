import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, ArrowLeft, Phone, Video } from 'lucide-react';
import io, { Socket } from 'socket.io-client';
import { useCurrentAccount } from '@mysten/dapp-kit';

const SOCKET_URL = 'http://localhost:1880';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface ChatRoom {
  gigId: string;
  gigName: string;
  clientId: string;
  clientName: string;
  talentId: string;
  talentName: string;
  lastMessage: string;
  lastMessageTime: Date;
}

interface ChatInterfaceProps {
  gigId: string;
  gigName: string;
  otherUserId: string;
  otherUserName: string;
  currentUserRole: 'client' | 'talent';
}

export default function ChatInterface({ 
  gigId, 
  gigName, 
  otherUserId, 
  otherUserName, 
  currentUserRole 
}: ChatInterfaceProps) {
  const account = useCurrentAccount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Join as user
    newSocket.emit('user:join', {
      userId: account?.address,
      userName: 'Current User',
      role: currentUserRole
    });

    // Join chat room
    newSocket.emit('chat:join', {
      gigId,
      userId: account?.address
    });

    // Listen for new messages
    newSocket.on('message:receive', (message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    // Listen for typing indicator
    newSocket.on('typing:show', ({ userName }) => {
      setIsTyping(true);
    });

    newSocket.on('typing:hide', () => {
      setIsTyping(false);
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [gigId, account?.address]);

  // Fetch initial messages
  useEffect(() => {
    fetchMessages();
  }, [gigId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/chat/messages/${gigId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages.reverse());
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || isSending) return;

    setIsSending(true);
    socket.emit('message:send', {
      gigId,
      senderId: account?.address,
      senderName: 'Current User',
      senderRole: currentUserRole,
      receiverId: otherUserId,
      message: newMessage,
      messageType: 'text'
    });

    setNewMessage('');
    setIsSending(false);
    handleStopTyping();
  };

  const handleTyping = () => {
    if (!socket) return;

    socket.emit('typing:start', {
      gigId,
      userId: account?.address,
      userName: 'Current User'
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (!socket) return;
    socket.emit('typing:stop', {
      gigId,
      userId: account?.address
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0f0f0f] border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <button className="lg:hidden text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-12 h-12 rounded-full bg-[#622578] flex items-center justify-center text-white font-semibold">
            {otherUserName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-semibold">{otherUserName}</h3>
            <p className="text-sm text-gray-400">{gigName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.senderId === account?.address;
            return (
              <div
                key={msg._id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    isCurrentUser
                      ? 'bg-[#622578] text-white rounded-br-none'
                      : 'bg-[#2a2a2a] text-white rounded-bl-none'
                  }`}
                >
                  {!isCurrentUser && (
                    <p className="text-xs text-gray-400 mb-1">{msg.senderName}</p>
                  )}
                  <p className="text-sm break-words">{msg.message}</p>
                  <p className="text-xs text-gray-300 mt-1 text-right">
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#2a2a2a] px-4 py-2 rounded-2xl rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 bg-[#0f0f0f] border-t border-gray-800">
        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="w-full bg-[#2a2a2a] border border-gray-700 rounded-full px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#622578] transition-colors"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-[#622578] hover:bg-[#7a2e94] text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}