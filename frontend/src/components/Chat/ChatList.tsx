import React, { useState, useEffect, useContext } from "react";
import { getChats } from "../../api/messages";
import { AuthContext } from "../../context/AuthContext";

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  recipient_id: number;
  created_at: string;
  updated_at?: string;
  is_edited: boolean;
  is_deleted: boolean;
  sender: User;
  recipient: User;
  attachments: any[];
}

interface Chat {
  user: User;
  last_message?: Message;
  unread_count: number;
}

interface ChatListProps {
  selectedUserId: number | null;
  onSelectUser: (userId: number, user: User) => void;
  onlineUsers: Set<number>;
}

const ChatList: React.FC<ChatListProps> = ({
  selectedUserId,
  onSelectUser,
  onlineUsers,
}) => {
  const auth = useContext(AuthContext);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    if (!auth?.token) return;
    try {
      const data = await getChats(auth.token);
      setChats(data);
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="w-1/3 border-r bg-gray-50 p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/3 border-r bg-gray-50 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No chats yet. Start a conversation!
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.user.id}
              onClick={() => onSelectUser(chat.user.id, chat.user)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors ${
                selectedUserId === chat.user.id ? "bg-blue-50 border-blue-200" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {chat.user.username[0].toUpperCase()}
                  </div>
                  {onlineUsers.has(chat.user.id) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-900 truncate">
                      {chat.user.username}
                    </p>
                    {chat.last_message && (
                      <span className="text-xs text-gray-500">
                        {formatTime(chat.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  
                  {chat.last_message && (
                    <p className="text-sm text-gray-600 truncate">
                      {chat.last_message.is_deleted
                        ? "Message deleted"
                        : chat.last_message.content}
                    </p>
                  )}
                  
                  {chat.unread_count > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;