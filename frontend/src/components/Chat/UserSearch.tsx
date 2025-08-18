import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:8000"; // Change this to .env in prod

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface UserSearchProps {
  onSelectUser: (userId: number, user: User) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onSelectUser }) => {
  const auth = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async () => {
    if (!searchTerm.trim() || !auth?.token) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/users/search`, {
        params: { query: searchTerm, limit: 10 },
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      
      setSearchResults(response.data);
    } catch (error: any) {
      console.error("Failed to search users:", error);
      setError(error.response?.data?.detail || "Failed to search users");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user: User) => {
    onSelectUser(user.id, user);
    setShowModal(false);
    setSearchTerm("");
    setSearchResults([]);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchUsers();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setError(null);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-blue-400 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center text-2xl"
        title="Start new chat"
      >
        +
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Start New Chat</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  clearSearch();
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              {/* Search Input */}
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search users by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  onClick={searchUsers}
                  disabled={!searchTerm.trim() || isSearching}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="flex-1 overflow-y-auto space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Search Results ({searchResults.length})
                  </h4>
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {user.username}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          {user.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div className="text-gray-400">
                        →
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {searchTerm && searchResults.length === 0 && !isSearching && !error && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="font-medium">No users found</p>
                  <p className="text-sm">No users found matching "{searchTerm}"</p>
                  <p className="text-xs mt-2">Try a different search term</p>
                </div>
              )}

              {/* Empty State */}
              {!searchTerm && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="font-medium">Find Users</p>
                  <p className="text-sm">Search for users by username to start a conversation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSearch;