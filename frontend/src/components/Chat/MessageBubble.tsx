import React, { useState } from "react";

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

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onEdit: (messageId: number, content: string) => void;
  onDelete: (messageId: number) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleEdit = () => {
    if (editContent.trim() !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getAttachmentUrl = (filename: string) => {
    return `http://localhost:8000/attachments/${filename}`;
  };

  if (message.is_deleted) {
    return (
      <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
        <div className="max-w-xs lg:max-w-md px-4 py-2 bg-gray-200 rounded-lg">
          <p className="text-gray-500 italic text-sm">Message deleted</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatTime(message.created_at)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative group">
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isOwnMessage
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {isEditing ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded text-black resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEdit();
                  }
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }
                }}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }}
                  className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="break-words">{message.content}</p>
              
              {message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center space-x-2 p-2 bg-white bg-opacity-10 rounded"
                    >
                      <div className="flex-1">
                        <a
                          href={getAttachmentUrl(attachment.filename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline hover:no-underline"
                        >
                          {attachment.original_filename}
                        </a>
                        <p className="text-xs opacity-75">
                          {formatFileSize(attachment.file_size)}
                        </p>
                      </div>
                      <div className="text-lg">📎</div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs opacity-75">
                  {formatTime(message.created_at)}
                  {message.is_edited && " (edited)"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Action buttons for own messages */}
        {isOwnMessage && showActions && !isEditing && (
          <div className="absolute top-0 -left-16 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(message.id)}
              className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
