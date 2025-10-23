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
    <div className="flex h-screen bg-[#1A031F]/80 text-white">
      {/* Chat List Sidebar */}
      <div className={`w-full lg:w-96 ${selectedChat ? 'hidden lg:block' : 'block'}`}>
        <ChatList
          currentUserRole={userRole}
          onSelectChat={handleSelectChat}
          selectedGigId={selectedChat?.gigId}
        />
      </div>

      {/* Chat Interface */}
      <div className={`flex-1 ${selectedChat ? 'block' : 'hidden lg:flex'}`}>
        {selectedChat ? (
          <ChatInterface
            gigId={selectedChat.gigId}
            gigName={selectedChat.gigName}
            otherUserId={otherUser.id}
            otherUserName={otherUser.name}
            currentUserRole={userRole}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-purple-300 pl-30">
            <MessageCircle className="w-24 h-24 mb-4 opacity-60 text-purple-400" />
            <h3 className="text-xl font-semibold mb-2 text-white">No conversation selected</h3>
            <p className="text-center max-w-md text-purple-300">
              Select a conversation from the sidebar to start messaging with your {userRole === 'client' ? 'talents' : 'clients'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}