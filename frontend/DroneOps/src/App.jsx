"use client";

import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import OrderManagement from "./pages/OrderManagement";
import SystemConfig from "./pages/SystemConfig";
import { DroneProvider } from "./context/DroneContext";
import DroneManagement from "./pages/DroneManagement";
import DroneTypes from "./pages/DroneTypes";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "drones":
        return <DroneManagement />;
      case "drone-types":
        return <DroneTypes />;
      case "orders":
        return <OrderManagement />;
      case "config":
        return <SystemConfig />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DroneProvider>
      <div className="flex h-screen bg-gray-900 text-white">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-hidden">{renderContent()}</main>
      </div>
    </DroneProvider>
  );
}

export default App;
