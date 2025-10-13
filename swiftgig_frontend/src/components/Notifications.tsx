// Notification.tsx
import React from "react";

interface NotificationProps {
  message: string;
  show: boolean;
}

const Notification: React.FC<NotificationProps> = ({ message, show }) => {
  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium transition-transform duration-500 
        ${show ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"} 
        bg-purple-600/90 backdrop-blur-sm`}
    >
      {message}
    </div>
  );
};

export default Notification;