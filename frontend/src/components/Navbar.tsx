import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const auth = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  if (!auth?.user) return null;

  return (
    <nav className="flex justify-between items-center px-4 py-2 bg-blue-600 text-white">
      <h1 className="font-bold">Messenger</h1>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            {auth.user.username[0].toUpperCase()}
          </div>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg p-3">
            <p className="font-semibold">{auth.user.username}</p>
            <p className="text-sm text-gray-600">{auth.user.email}</p>
            <button
              onClick={() => auth.logout()}
              className="w-full mt-2 bg-red-500 text-white py-1 rounded hover:bg-red-600"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
