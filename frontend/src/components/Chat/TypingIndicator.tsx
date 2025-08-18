import React from "react";

interface TypingIndicatorProps {
  username: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ username }) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs lg:max-w-md px-4 py-2 bg-gray-200 rounded-lg">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">{username} is typing</span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;