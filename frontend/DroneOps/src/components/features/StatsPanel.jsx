"use client";

import React from "react";
import { useDroneContext } from "../../context/DroneContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StatsPanel = () => {
  const { drones, stats } = useDroneContext();
  const [displayStats, setDisplayStats] = useState(stats);
  const navigate = useNavigate();

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
    <div
      className="bg-gray-800 border border-gray-700 rounded-lg hover-lift flex flex-col"
      style={{ minHeight: "70vh" }}
    >
      <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex-shrink-0">
        <h3 className="text-lg font-semibold text-white">Estatísticas</h3>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Drone Status Overview */}
        <div className="animate-fadeInUp">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Drones Ativos
          </h4>
          <div className="bg-gray-900 rounded-lg p-3 hover:bg-gray-850 transition-colors">
            <div className="text-2xl font-bold text-blue-400 mb-1 transition-all duration-300">
              {displayStats.overview?.activeDrones || 0}
            </div>
            <div className="text-sm text-gray-400">
              de {displayStats.overview?.totalDrones || 0} total
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="animate-fadeInUp" style={{ animationDelay: "100ms" }}>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Pedidos</h4>
          <div className="bg-gray-900 rounded-lg p-3 hover:bg-gray-850 transition-colors">
            <div className="text-2xl font-bold text-orange-400 mb-1 transition-all duration-300">
              {displayStats.overview?.pendingOrders || 0}
            </div>
            <div className="text-sm text-gray-400">Pendentes</div>
          </div>
        </div>

        {/* System Efficiency */}
        <div className="animate-fadeInUp" style={{ animationDelay: "200ms" }}>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Eficiência</h4>
          <div className="bg-gray-900 rounded-lg p-3 hover:bg-gray-850 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-400 mb-1 transition-all duration-300">
                  {displayStats.performance?.systemEfficiency || 0}%
                </div>
                <div className="text-sm text-gray-400">
                  Eficiência do Sistema
                </div>
              </div>
              <button
                onClick={() => navigate("/efficiency-analysis")}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
              >
                Saiba Mais
              </button>
            </div>
          </div>
        </div>

        {/* Battery Status */}
        <div className="animate-fadeInUp" style={{ animationDelay: "300ms" }}>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Bateria</h4>
          <div className="bg-gray-900 rounded-lg p-3 hover:bg-gray-850 transition-colors">
            <div className="text-2xl font-bold text-yellow-400 mb-1 transition-all duration-300">
              {displayStats.recent?.avgBattery || 0}%
            </div>
            <div className="text-sm text-gray-400">Média</div>
          </div>
        </div>

        {/* Capacity Usage */}
        <div className="animate-fadeInUp" style={{ animationDelay: "400ms" }}>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Capacidade</h4>
          <div className="bg-gray-900 rounded-lg p-3 hover:bg-gray-850 transition-colors">
            <div className="text-2xl font-bold text-green-400 mb-1 transition-all duration-300">
              {displayStats.performance?.usedCapacity || 0}kg
            </div>
            <div className="text-sm text-gray-400">
              de {displayStats.performance?.totalCapacity || 0}kg
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="animate-fadeInUp" style={{ animationDelay: "500ms" }}>
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Status dos Drones
          </h4>
          <div className="space-y-2">
            {Object.entries(dronesByStatus).map(([status, count], index) => (
              <div
                key={status}
                className="flex justify-between items-center p-2 bg-gray-900 rounded hover:bg-gray-850 transition-colors"
                style={{
                  animationDelay: `${600 + index * 100}ms`,
                }}
              >
                <span className="text-gray-300 text-sm">
                  {getStatusText(status)}
                </span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="animate-fadeInUp" style={{ animationDelay: "700ms" }}>
          <div className="bg-gray-900 rounded-lg p-3 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>
                Eficiência: {displayStats.performance?.systemEfficiency || 0}% |
                Drones Ativos: {displayStats.overview?.activeDrones || 0}/
                {displayStats.overview?.totalDrones || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
