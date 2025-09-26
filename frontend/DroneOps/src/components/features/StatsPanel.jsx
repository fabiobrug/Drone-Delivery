"use client";

import React from "react";
import { useDroneContext } from "../../context/DroneContext";
import { useState, useEffect } from "react";

const StatsPanel = () => {
  const { drones, stats } = useDroneContext();
  const [displayStats, setDisplayStats] = useState(stats);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayStats(stats);
    }, 100);
    return () => clearTimeout(timer);
  }, [stats]);

  const dronesByStatus = drones.reduce((acc, drone) => {
    acc[drone.status] = (acc[drone.status] || 0) + 1;
    return acc;
  }, {});

  const getStatusText = (status) => {
    switch (status) {
      case "idle":
        return "Ociosos";
      case "loading":
        return "Carregando";
      case "flying":
        return "Em Voo";
      case "returning":
        return "Retornando";
      default:
        return status;
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg hover-lift">
      <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
        <h3 className="text-lg font-semibold text-white">Estatísticas</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Drone Status Overview */}
        <div className="animate-fadeInUp">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Drones Ativos
          </h4>
          <div className="bg-gray-900 rounded-lg p-3 hover:bg-gray-850 transition-colors">
            <div className="text-2xl font-bold text-white mb-1 transition-all duration-300">
              {drones.length}
            </div>
            <div className="text-sm text-gray-400">Total de Drones</div>

            <div className="mt-3 space-y-1">
              {Object.entries(dronesByStatus).map(([status, count], index) => (
                <div
                  key={status}
                  className="flex justify-between text-sm animate-slideInRight"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-gray-400">{getStatusText(status)}</span>
                  <span className="text-white font-medium transition-all duration-300">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="animate-fadeInUp" style={{ animationDelay: "100ms" }}>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Pedidos</h4>
          <div className="bg-gray-900 rounded-lg p-3 hover:bg-gray-850 transition-colors">
            <div className="text-2xl font-bold text-orange-400 mb-1 transition-all duration-300">
              {displayStats.pendingOrders}
            </div>
            <div className="text-sm text-gray-400">Pendentes</div>
          </div>
        </div>

        {/* Average Delivery Time */}
        <div className="animate-fadeInUp" style={{ animationDelay: "200ms" }}>
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Performance
          </h4>
          <div className="bg-gray-900 rounded-lg p-3 hover:bg-gray-850 transition-colors">
            <div className="text-2xl font-bold text-blue-400 mb-1 transition-all duration-300">
              {displayStats.averageDeliveryTime}min
            </div>
            <div className="text-sm text-gray-400">Tempo Médio de Entrega</div>
          </div>
        </div>

        {/* System Status */}
        <div className="animate-fadeInUp" style={{ animationDelay: "300ms" }}>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Sistema</h4>
          <div className="bg-gray-900 rounded-lg p-3 hover:bg-gray-850 transition-colors">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Operacional</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Todos os sistemas funcionando normalmente
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
