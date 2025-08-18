import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const auth = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  if (!auth?.user) return null;

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-white border-b shadow-sm">
      <div className="flex items-center space-x-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="font-bold text-xl text-gray-800">Messenger</h1>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* User status indicator */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {auth.user.username[0].toUpperCase()}
              </span>
            </div>
            <span className="font-medium text-gray-700">{auth.user.username}</span>
            <svg
              className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border py-2 z-50">
              <div className="px-4 py-2 border-b">
                <p className="font-semibold text-gray-900">{auth.user.username}</p>
                <p className="text-sm text-gray-500">{auth.user.email}</p>
              </div>
              
              <div className="py-2">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <span>⚙️</span>
                  <span>Settings</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <span>🌙</span>
                  <span>Dark mode</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <span>❓</span>
                  <span>Help & Support</span>
                </button>
              </div>
              
              <div className="border-t pt-2">
                <button
                  onClick={() => {
                    auth.logout();
                    setOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <span>🚪</span>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;