import React from "react";
import InteractiveMap from "../components/features/InteractiveMap";
import StatsPanel from "../components/features/StatsPanel";

const Dashboard = () => {
  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Dashboard de Monitoramento
        </h1>
        <p className="text-gray-400">
          Visão geral em tempo real das operações de entrega por drones
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Map Section - Now takes up more space */}
        <div className="col-span-9 flex flex-col min-h-0">
          <InteractiveMap />
        </div>

        {/* Right Sidebar - Now only contains statistics */}
        <div className="col-span-3 flex flex-col space-y-6 min-h-0">
          {/* Statistics Panel */}
          <div className="flex-shrink-0">
            <StatsPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
