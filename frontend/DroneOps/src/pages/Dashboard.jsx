import React from "react";
import InteractiveMap from "../components/features/InteractiveMap";
import StatsPanel from "../components/features/StatsPanel";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-2">
          Dashboard de Monitoramento
        </h1>
        <p className="text-gray-400">
          Visão geral em tempo real das operações de entrega por drones
        </p>
      </div>

      {/* Main Content Grid - Equal height containers */}
      <div
        className="flex-1 grid grid-cols-12 gap-6"
        style={{ minHeight: "70vh" }}
      >
        {/* Map Section - 9 columns */}
        <div className="col-span-9">
          <InteractiveMap />
        </div>

        {/* Right Sidebar - 3 columns, same height as map */}
        <div className="col-span-3">
          <StatsPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
