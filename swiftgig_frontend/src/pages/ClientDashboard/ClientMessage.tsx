import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatList from '../../components/chat/ChatList';
import ChatInterface from '../../components/chat/ChatInterface';

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

interface MessagesProps {
  userRole: 'client' | 'talent';
  currentUserId: string;
}

export default function Messages({ userRole, currentUserId }: MessagesProps) {
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);

  const handleSelectChat = (room: ChatRoom) => {
    setSelectedChat(room);
  };

  const getOtherUser = () => {
    if (!selectedChat) return { id: '', name: '' };

    return userRole === 'client'
      ? { id: selectedChat.talentId, name: selectedChat.talentName }
      : { id: selectedChat.clientId, name: selectedChat.clientName };
  };

  const otherUser = getOtherUser();

  return (
    <div className="flex h-screen bg-[#1A031F] text-white">
      {/* Chat List Sidebar */}
      <div
        className={`w-full lg:w-96 border-r border-[#3A0F3F]/40 bg-[#2B0A2F]/60 backdrop-blur-md 
          ${selectedChat ? 'hidden lg:block' : 'block'}`}
      >
        <ChatList
          currentUserRole={userRole}
          onSelectChat={handleSelectChat}
          selectedGigId={selectedChat?.gigId}
        />
      </div>

      {/* Chat Area */}
      <div className={`flex-1 bg-[#1A031F]/80 backdrop-blur-sm ${selectedChat ? 'block' : 'hidden lg:flex'}`}>
        {selectedChat ? (
          <ChatInterface
            gigId={selectedChat.gigId}
            gigName={selectedChat.gigName}
            otherUserId={otherUser.id}
            otherUserName={otherUser.name}
            currentUserRole={userRole}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 pl-50">
            <div className="bg-[#2B0A2F]/70 p-8 rounded-2xl shadow-lg shadow-black/40 backdrop-blur-md flex flex-col items-center">
              <MessageCircle className="w-24 h-24 mb-4 opacity-60 text-purple-400" />
              <h3 className="text-2xl font-semibold text-purple-300">No Conversation Selected</h3>
              <p className="text-center text-gray-300 mt-3 max-w-md">
                Select a conversation from the sidebar to start chatting with your {''}
                <span className="text-purple-400 font-medium">{userRole === 'client' ? 'talents' : 'clients'}</span>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}