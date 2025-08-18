import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { WebSocketManager } from "../api/websocket";
import Navbar from "../components/Navbar";
import ChatList from "../components/Chat/ChatList";
import ChatInterface from "../components/Chat/ChatInterface";
import UserSearch from "../components/Chat/UserSearch";

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

const Dashboard = () => {
  const auth = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [wsManager] = useState(() => new WebSocketManager());

  useEffect(() => {
    if (auth?.token) {
      // Connect to WebSocket
      wsManager.connect(auth.token, handleWebSocketMessage);

      return () => {
        wsManager.disconnect();
      };
    }
    // eslint-disable-next-line
  }, [auth?.token]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "connection_status":
        console.log("WebSocket connection:", data.status);
        break;

      case "online_status":
        setOnlineUsers(new Set(Object.keys(data.users).filter(id => data.users[id]).map(Number)));
        break;

      case "user_online":
        setOnlineUsers(prev => new Set([...prev, data.user_id]));
        break;

      case "user_offline":
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.user_id);
          return newSet;
        });
        break;

      default:
        // Handle other message types in ChatInterface
        break;
    }
  };

  const handleSelectUser = (userId: number, user: User) => {
    setSelectedUser(user);

    // Request online status for this user
    wsManager.send({
      type: "get_online_status",
      user_ids: [userId],
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <ChatList
          selectedUserId={selectedUser?.id || null}
          onSelectUser={handleSelectUser}
          onlineUsers={onlineUsers}
        />

        {selectedUser ? (
          <ChatInterface
            selectedUser={selectedUser}
            onlineUsers={onlineUsers}
            wsManager={wsManager}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">✍️(◔◡◔)</div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to Messenger</h2>
              <p className="mb-4">Select a chat to start messaging</p>
              <p className="text-sm">Or click the <span className="text-red-500">+</span> button to start a new conversation</p>
            </div>
          </div>
        )}
      </div>

      <UserSearch onSelectUser={handleSelectUser} />
    </div>
  );
};

export default Dashboard;