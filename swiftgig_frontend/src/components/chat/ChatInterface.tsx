import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Paperclip, Smile, MoreVertical, ArrowLeft, Phone, Video } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!account?.address) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);

      // Join as user
      newSocket.emit('user:join', {
        userId: account.address,
        userName: account.address.slice(0, 6) + '...' + account.address.slice(-4),
        role: currentUserRole
      });

      // Join chat room
      newSocket.emit('chat:join', {
        gigId
      });

      console.log(`Joined room: gig-${gigId}`);
    });

    // Listen for new messages
    newSocket.on('message:receive', (message: Message) => {
      console.log('New message received:', message);
      setMessages(prev => [...prev, message]);
      setTimeout(scrollToBottom, 100);
    });

    // Listen for typing indicator
    newSocket.on('typing:show', ({ userName, userId }) => {
      if (userId !== account.address) {
        setIsTyping(true);
      }
    });

    newSocket.on('typing:hide', ({ userId }) => {
      if (userId !== account.address) {
        setIsTyping(false);
      }
    });

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Cleanup
    return () => {
      console.log('Disconnecting socket');
      newSocket.disconnect();
    };
  }, [gigId, account?.address, currentUserRole]);

  // Fetch initial messages
  useEffect(() => {
    fetchMessages();
  }, [gigId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SOCKET_URL}/api/chat/messages/${gigId}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Fetched messages:', data.messages.length);
        setMessages(data.messages); // Already sorted by timestamp ascending
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || isSending || !account?.address) return;

    setIsSending(true);
    
    const messageData = {
      gigId,
      senderId: account.address,
      senderName: account.address.slice(0, 6) + '...' + account.address.slice(-4),
      senderRole: currentUserRole,
      receiverId: otherUserId,
      message: newMessage.trim(),
      messageType: 'text'
    };

    console.log('Sending message:', messageData);
    socket.emit('message:send', messageData);

    setNewMessage('');
    setIsSending(false);
    handleStopTyping();
  };

  const handleTyping = () => {
    if (!socket || !account?.address) return;

    socket.emit('typing:start', {
      gigId,
      userId: account.address,
      userName: account.address.slice(0, 6) + '...' + account.address.slice(-4)
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
    if (!socket || !account?.address) return;
    socket.emit('typing:stop', {
      gigId,
      userId: account.address
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

  // Get message bubble colors based on sender
  const getMessageStyles = (isCurrentUser: boolean) => {
    if (isCurrentUser) {
      // Current user's messages - Purple/Green (like WhatsApp sent messages)
      return {
        container: 'justify-end',
        bubble: 'bg-[#7c3aed] text-white rounded-br-none', // Purple for sent messages
        alignment: 'text-right'
      };
    } else {
      // Other user's messages - Dark gray (like WhatsApp received messages)
      return {
        container: 'justify-start',
        bubble: 'bg-[#2a2a2a] text-white rounded-bl-none', // Dark gray for received
        alignment: 'text-left'
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1a1a1a]">
        <div className="text-purple-400">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1f1f1f] border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <button className="lg:hidden text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold shadow-lg">
            {otherUserName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{otherUserName}</h3>
            <p className="text-sm text-gray-400">{gigName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full">
            <Phone className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full">
            <Video className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.03) 0%, transparent 50%)',
          backgroundColor: '#0a0a0a'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-center">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.senderId === account?.address;
            const styles = getMessageStyles(isCurrentUser);
            
            return (
              <div
                key={msg._id}
                className={`flex ${styles.container} animate-fadeIn`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-lg ${styles.bubble}`}
                >
                  {!isCurrentUser && (
                    <p className="text-xs text-purple-400 font-medium mb-1">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {msg.message}
                  </p>
                  <p className={`text-[10px] text-gray-400 mt-1.5 ${styles.alignment}`}>
                    {formatTime(msg.timestamp)}
                    {isCurrentUser && (
                      <span className="ml-1">
                        {msg.read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-[#2a2a2a] px-5 py-3 rounded-2xl rounded-bl-none shadow-lg">
              <div className="flex space-x-1.5">
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
      <div className="px-6 py-4 bg-[#1f1f1f] border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full">
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
              className="w-full bg-[#2a2a2a] border border-gray-700 rounded-full px-5 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-3.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50 disabled:hover:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}