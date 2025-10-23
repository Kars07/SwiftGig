import React, { useState, useEffect } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';

const API_URL = 'http://localhost:1880';

interface ChatRoom {
  gigId: string;
  gigName: string;
  clientId: string;
  clientName: string;
  talentId: string;
  talentName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: { client: number; talent: number };
}

interface ChatListProps {
  currentUserRole: 'client' | 'talent';
  onSelectChat: (room: ChatRoom) => void;
  selectedGigId?: string;
}

export default function ChatList({ currentUserRole, onSelectChat, selectedGigId }: ChatListProps) {
  const account = useCurrentAccount();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (account?.address) {
      fetchChatRooms();
    }
  }, [account?.address]);

  const fetchChatRooms = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/rooms/${account?.address}`);
      const data = await response.json();
      
      if (data.success) {
        setChatRooms(data.rooms);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = chatRooms.filter(room => {
    const otherUserName = currentUserRole === 'client' ? room.talentName : room.clientName;
    return otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           room.gigName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = Math.abs(now.getTime() - messageDate.getTime()) / 36e5;

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getUnreadCount = (room: ChatRoom) => {
    return currentUserRole === 'client' 
      ? room.unreadCount.client 
      : room.unreadCount.talent;
  };

  return (
    <div className="flex flex-col h-screen bg-[#1A031F]/80 backdrop-blur-sm border-r border-purple-900/30">
      {/* Header */}
      <div className="px-4 py-6 border-b border-purple-900/30">
        <h2 className="text-2xl font-bold text-purple-300 mb-4">Messages</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-[#3A0F3F]/70 border border-purple-700/40 rounded-lg pl-10 pr-4 py-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-purple-400">Loading conversations...</div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-purple-400 px-6">
            <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-center">
              {searchQuery 
                ? 'No conversations match your search'
                : 'No conversations yet. Start chatting with your ' + 
                  (currentUserRole === 'client' ? 'talents' : 'clients') + '!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-purple-900/20">
            {filteredRooms.map((room) => {
              const otherUserName = currentUserRole === 'client' 
                ? room.talentName 
                : room.clientName;
              const unreadCount = getUnreadCount(room);
              const isSelected = selectedGigId === room.gigId;

              return (
                <div
                  key={room.gigId}
                  onClick={() => onSelectChat(room)}
                  className={`px-4 py-4 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-purple-700/20 border-l-4 border-purple-500' 
                      : 'hover:bg-[#2B0A2F]/60'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {otherUserName.charAt(0).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-gray-200 font-semibold truncate">
                          {otherUserName}
                        </h3>
                        <span className="text-xs text-purple-300 ml-2">
                          {formatTime(room.lastMessageTime)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-400 truncate mb-1">
                        {room.gigName}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate flex-1">
                          {room.lastMessage}
                        </p>
                        {unreadCount > 0 && (
                          <span className="ml-2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
