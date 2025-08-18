import React from "react";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-700">Welcome to the messenger 👋</p>
      </div>
    </div>
  );
};

export default Dashboard;
