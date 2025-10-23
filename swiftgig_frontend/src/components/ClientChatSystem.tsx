import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, MessageCircle, Send, X, User, Briefcase, Search, ArrowLeft } from 'lucide-react';

interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface Chat {
  id: number;
  name: string;
  type: 'client' | 'talent';
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

const mockChats: Chat[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    type: 'client',
    avatar: 'SJ',
    lastMessage: 'Thanks for the quick turnaround!',
    timestamp: '2 min ago',
    unread: 2,
    messages: [
      { id: 1, sender: 'them', text: 'Hi! Are you available for a new project?', time: '10:30 AM' },
      { id: 2, sender: 'me', text: 'Yes, I am! What kind of project are you looking for?', time: '10:32 AM' },
      { id: 3, sender: 'them', text: 'I need a logo design for my startup. Can you handle that?', time: '10:35 AM' },
      { id: 4, sender: 'me', text: 'Absolutely! I specialize in logo design. When do you need it by?', time: '10:37 AM' },
      { id: 5, sender: 'them', text: 'Thanks for the quick turnaround!', time: '10:40 AM' },
    ]
  },
  {
    id: 2,
    name: 'Michael Chen',
    type: 'talent',
    avatar: 'MC',
    lastMessage: 'The files are ready for review',
    timestamp: '1 hour ago',
    unread: 0,
    messages: [
      { id: 1, sender: 'them', text: 'Hey, I wanted to discuss the project timeline', time: '9:15 AM' },
      { id: 2, sender: 'me', text: 'Sure, what would you like to know?', time: '9:20 AM' },
      { id: 3, sender: 'them', text: 'The files are ready for review', time: '9:45 AM' },
    ]
  },
];

const ChatSystem: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chats, setChats] = useState<Chat[]>(mockChats);

  const handleSendMessage = (): void => {
    if (!messageInput.trim() || !selectedChat) return;

    const updatedChats = chats.map(chat => {
      if (chat.id === selectedChat.id) {
        return {
          ...chat,
          messages: [
            ...chat.messages,
            {
              id: chat.messages.length + 1,
              sender: 'me' as const,
              text: messageInput,
              time: 'Just now'
            }
          ],
          lastMessage: messageInput,
          timestamp: 'Just now'
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setSelectedChat(updatedChats.find(c => c.id === selectedChat.id) || null);
    setMessageInput('');
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unread, 0);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-10 w-16 h-16 bg-purple-500 hover:bg-[#65206E] rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-50"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
            {totalUnread}
          </span>
        )}
      </button>

      {/* Chat Interface */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-[#2B0A2F]/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-[#641374]/70 backdrop-blur-md">
          {!selectedChat ? (
            <>
              {/* Chat List Header */}
              <div className="bg-gradient-to-r from-[#4B1656] to-[#65206E] p-4 flex items-center justify-between border-b border-[#641374]/60">
                <h3 className="text-xl font-bold text-white">Messages</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="hover:bg-[#641374]/40 rounded-lg p-1 transition text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-[#641374]/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1A031F]/70 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#641374]"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className="p-4 border-b border-[#641374]/40 hover:bg-[#4B1656]/50 cursor-pointer transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#65206E] flex items-center justify-center font-semibold flex-shrink-0 text-white">
                        {chat.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{chat.name}</p>
                            {chat.type === 'client' ? (
                              <User className="w-4 h-4 text-[#B366D8]" />
                            ) : (
                              <Briefcase className="w-4 h-4 text-[#B366D8]" />
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{chat.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                          {chat.unread > 0 && (
                            <span className="ml-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white">
                              {chat.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-[#4B1656] to-[#65206E] p-4 flex items-center gap-3 border-b border-[#641374]/60">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="hover:bg-[#641374]/40 rounded-lg p-1 transition text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-[#65206E] flex items-center justify-center font-semibold text-white">
                  {selectedChat.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{selectedChat.name}</p>
                    {selectedChat.type === 'client' ? (
                      <User className="w-4 h-4 text-[#B366D8]" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-[#B366D8]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 capitalize">{selectedChat.type}</p>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="hover:bg-[#641374]/40 rounded-lg p-1 transition text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1A031F]/40">
                {selectedChat.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${message.sender === 'me' ? 'bg-[#65206E]' : 'bg-[#2B0A2F]/80'} rounded-2xl px-4 py-2 border border-[#641374]/50`}>
                      <p className="text-sm text-white">{message.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{message.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-[#641374]/60 bg-[#2B0A2F]/80">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-[#1A031F]/60 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#641374]"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-[#641374] hover:bg-[#4B1656] rounded-lg p-2 transition"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ✅ Floating Button to Full Messages Page */}
          <Link
            to="/client-dashboard/messages"
            className="absolute bottom-4 left-4 w-10 h-10 rounded-full bg-[#641374] hover:bg-[#4B1656] flex items-center justify-center shadow-lg transition"
          >
            <MessageSquare className="w-5 h-5 text-white" />
          </Link>
        </div>
      )}
    </>
  );
};

export default ChatSystem;
