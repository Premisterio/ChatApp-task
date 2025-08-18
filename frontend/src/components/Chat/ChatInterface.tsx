import React, { useState, useEffect, useContext, useRef } from "react";
import { getMessages, sendMessage, editMessage, deleteMessage } from "../../api/messages";
import { AuthContext } from "../../context/AuthContext";
import { WebSocketManager } from "../../api/websocket";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface Attachment {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  content_type?: string;
  uploaded_at: string;
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
  attachments: Attachment[];
}

interface ChatInterfaceProps {
  selectedUser: User;
  onlineUsers: Set<number>;
  wsManager: WebSocketManager;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  selectedUser,
  onlineUsers,
  wsManager,
}) => {
  const auth = useContext(AuthContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [selectedUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  const loadMessages = async () => {
    if (!auth?.token) return;
    setLoading(true);
    try {
      const data = await getMessages(selectedUser.id, auth.token);
      setMessages(data.reverse()); // API returns newest first, we want oldest first
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string, files: File[]) => {
    if (!auth?.token) return;

    try {
      const newMessage = await sendMessage(content, selectedUser.id, files, auth.token);
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleEditMessage = async (messageId: number, content: string) => {
    if (!auth?.token) return;

    try {
      const updatedMessage = await editMessage(messageId, content, auth.token);
      setMessages(prev =>
        prev.map(msg => (msg.id === messageId ? updatedMessage : msg))
      );
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!auth?.token) return;
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      await deleteMessage(messageId, auth.token);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, is_deleted: true, content: "" } : msg
        )
      );
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleTypingChange = (typing: boolean) => {
    setIsTyping(typing);
    if (wsManager) {
      wsManager.send({
        type: "typing",
        recipient_id: selectedUser.id,
        is_typing: typing,
      });
    }
  };

  // WebSocket message handler
  useEffect(() => {
    if (!wsManager) return;

    const handleWebSocketMessage = (data: any) => {
      switch (data.type) {
        case "new_message":
          if (data.message.sender_id === selectedUser.id || data.message.recipient_id === selectedUser.id) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.find(m => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
          }
          break;

        case "message_updated":
          if (data.message.sender_id === selectedUser.id || data.message.recipient_id === selectedUser.id) {
            setMessages(prev =>
              prev.map(msg => (msg.id === data.message.id ? data.message : msg))
            );
          }
          break;

        case "message_deleted":
          setMessages(prev =>
            prev.map(msg =>
              msg.id === data.message_id
                ? { ...msg, is_deleted: true, content: "" }
                : msg
            )
          );
          break;

        case "typing":
          if (data.sender_id === selectedUser.id) {
            setOtherUserTyping(data.is_typing);
            if (data.is_typing) {
              // Clear typing indicator after 3 seconds
              setTimeout(() => setOtherUserTyping(false), 3000);
            }
          }
          break;
      }
    };

    // Store the handler reference for cleanup
    const originalConnect = wsManager.connect;
    wsManager.connect = (token: string, onMessage: (data: any) => void) => {
      return originalConnect.call(wsManager, token, (data: any) => {
        onMessage(data);
        handleWebSocketMessage(data);
      });
    };

    return () => {
      wsManager.connect = originalConnect;
    };
  }, [wsManager, selectedUser.id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat header */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {selectedUser.username[0].toUpperCase()}
            </div>
            {onlineUsers.has(selectedUser.id) && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{selectedUser.username}</h2>
            <p className="text-sm text-gray-500">
              {onlineUsers.has(selectedUser.id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === auth?.user?.id}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
            ))}
            {otherUserTyping && <TypingIndicator username={selectedUser.username} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
        onTypingChange={handleTypingChange}
      />
    </div>
  );
};

export default ChatInterface;
