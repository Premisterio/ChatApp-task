import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

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

  const searchUsers = async () => {
    if (!searchTerm.trim() || !auth?.token) return;
    
    setIsSearching(true);
    try {
      // There's no search users endpoint in my API yet,
      // I'll create a dummy search for demo purposes
      // TODO: create a search endpoint
      const mockUsers: User[] = [
        {
          id: 2,
          username: "john_doe",
          email: "john@example.com",
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          username: "jane_smith",
          email: "jane@example.com",
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ].filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
        user.id !== auth.user?.id
      );
      
      setSearchResults(mockUsers);
    } catch (error) {
      console.error("Failed to search users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user: User) => {
    onSelectUser(user.id, user);
    setShowModal(false);
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center text-2xl"
      >
        +
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Start New Chat</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search users by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && searchUsers()}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={searchUsers}
                    disabled={!searchTerm.trim() || isSearching}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    {isSearching ? "..." : "Search"}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchTerm && searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-4 text-gray-500">
                    No users found matching "{searchTerm}"
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