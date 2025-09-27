"use client";

import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import OrderManagement from "./pages/OrderManagement";
import SystemConfig from "./pages/SystemConfig";
import { DroneProvider, useDroneContext } from "./context/DroneContext";
import { NotificationProvider } from "./context/NotificationContext";
import DroneManagement from "./pages/DroneManagement";
import DroneTypes from "./pages/DroneTypes";
import EfficiencyAnalysis from "./pages/EfficiencyAnalysis";
import LoadingSpinner from "./components/ui/LoadingSpinner";

function AppContent() {
  const { loading, error } = useDroneContext();
  const location = useLocation();

  // Se estiver na página de análise de eficiência, não mostrar sidebar
  if (location.pathname === "/efficiency-analysis") {
    return <EfficiencyAnalysis />;
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900 text-white">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <LoadingSpinner size="xl" text="Carregando dados do sistema..." />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-900 text-white">
        <Sidebar />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Erro ao carregar dados
            </h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/drones" element={<DroneManagement />} />
          <Route path="/drone-types" element={<DroneTypes />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/config" element={<SystemConfig />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <DroneProvider>
        <Router>
          <AppContent />
        </Router>
      </DroneProvider>
    </NotificationProvider>
  );
}

export default App;
