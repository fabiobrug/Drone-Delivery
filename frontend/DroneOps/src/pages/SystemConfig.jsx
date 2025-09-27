"use client";

import React from "react";
import { useState } from "react";
import { useDroneContext } from "../context/DroneContext";
import { PlayIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

const SystemConfig = () => {
  const { config, updateConfig, noFlyZones, addNoFlyZone, removeNoFlyZone } =
    useDroneContext();
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [newZone, setNewZone] = useState({
    x1: "",
    y1: "",
    x2: "",
    y2: "",
  });

  const handleConfigChange = (key, value) => {
    updateConfig({ [key]: value });
  };

  const handleStartSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning);
    // Here you would typically start/stop the actual simulation logic
  };

  const handleAddNoFlyZone = (e) => {
    e.preventDefault();
    if (newZone.x1 && newZone.y1 && newZone.x2 && newZone.y2) {
      const x1 = Number.parseInt(newZone.x1);
      const y1 = Number.parseInt(newZone.y1);
      const x2 = Number.parseInt(newZone.x2);
      const y2 = Number.parseInt(newZone.y2);

      addNoFlyZone({
        points: [
          { x: Math.min(x1, x2), y: Math.min(y1, y2) },
          { x: Math.max(x1, x2), y: Math.min(y1, y2) },
          { x: Math.max(x1, x2), y: Math.max(y1, y2) },
          { x: Math.min(x1, x2), y: Math.max(y1, y2) },
        ],
      });

      setNewZone({ x1: "", y1: "", x2: "", y2: "" });
    }
  };

  return (
    <div className="h-full p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Configurações do Sistema
        </h1>
        <p className="text-gray-400">
          Ajuste os parâmetros gerais e regras da simulação de entregas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optimization Parameters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Parâmetros de Otimização
          </h3>

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={config.optimizationEnabled}
                  onChange={(e) =>
                    handleConfigChange("optimizationEnabled", e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-300">
                  Habilitar Otimização Inteligente
                </span>
              </label>
              <p className="text-xs text-gray-400 mt-1 ml-7">
                Usa algoritmos avançados para otimizar as rotas de entrega
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Método de Otimização
              </label>
              <select
                value={config.optimizationMethod}
                onChange={(e) =>
                  handleConfigChange("optimizationMethod", e.target.value)
                }
                disabled={!config.optimizationEnabled}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="priority-distance-weight">
                  Prioridade + Distância + Peso
                </option>
                <option value="priority-only">Somente Prioridade</option>
                <option value="distance-only">Somente Distância</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Critério usado para otimizar a alocação de pedidos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ordem de Prioridade de Entrega
              </label>
              <select
                value={config.deliveryPriority || "priority"}
                onChange={(e) =>
                  handleConfigChange("deliveryPriority", e.target.value)
                }
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="priority">
                  Importância da Entrega (Alta, Média, Baixa)
                </option>
                <option value="distance">
                  Distância (mais próximo da central)
                </option>
                <option value="first-come-first-served">
                  Pedido Primeiro (FIFO)
                </option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Critério usado para ordenar as entregas de cada drone
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-2">
                Status da Otimização
              </h4>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    config.optimizationEnabled ? "bg-green-500" : "bg-gray-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-300">
                  {config.optimizationEnabled ? "Ativa" : "Desativada"}
                </span>
              </div>
              {config.optimizationEnabled && (
                <p className="text-xs text-gray-400 mt-1">
                  Método:{" "}
                  {config.optimizationMethod === "priority-distance-weight"
                    ? "Prioridade + Distância + Peso"
                    : config.optimizationMethod === "priority-only"
                    ? "Somente Prioridade"
                    : "Somente Distância"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Configurações Gerais
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Intervalo de Atualização (segundos)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                defaultValue="5"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Frequência de atualização dos dados em tempo real
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-300">
                  Notificações em Tempo Real
                </span>
              </label>
              <p className="text-xs text-gray-400 mt-1 ml-7">
                Receber alertas sobre status dos drones e pedidos
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-300">
                  Log de Atividades
                </span>
              </label>
              <p className="text-xs text-gray-400 mt-1 ml-7">
                Registrar todas as ações do sistema para auditoria
              </p>
            </div>
          </div>
        </div>

        {/* No-Fly Zones */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Zonas de Exclusão Aérea
          </h3>

          {/* Add New Zone Form */}
          <form onSubmit={handleAddNoFlyZone} className="mb-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">X1</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={newZone.x1}
                  onChange={(e) =>
                    setNewZone({ ...newZone, x1: e.target.value })
                  }
                  className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Y1</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={newZone.y1}
                  onChange={(e) =>
                    setNewZone({ ...newZone, y1: e.target.value })
                  }
                  className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">X2</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={newZone.x2}
                  onChange={(e) =>
                    setNewZone({ ...newZone, x2: e.target.value })
                  }
                  className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Y2</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={newZone.y2}
                  onChange={(e) =>
                    setNewZone({ ...newZone, y2: e.target.value })
                  }
                  className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Adicionar Zona</span>
            </button>
          </form>

          {/* Existing Zones */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {noFlyZones.map((zone) => {
              const minX = Math.min(...zone.points.map((p) => p.x));
              const minY = Math.min(...zone.points.map((p) => p.y));
              const maxX = Math.max(...zone.points.map((p) => p.x));
              const maxY = Math.max(...zone.points.map((p) => p.y));

              return (
                <div
                  key={zone.id}
                  className="flex items-center justify-between bg-gray-900 rounded-lg p-3"
                >
                  <div className="text-sm text-gray-300">
                    Zona ({minX},{minY}) → ({maxX},{maxY})
                  </div>
                  <button
                    onClick={() => removeNoFlyZone(zone.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            {noFlyZones.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-4">
                Nenhuma zona de exclusão definida
              </div>
            )}
          </div>
        </div>

        {/* Simulation Control */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Controle da Simulação
          </h3>

          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-2">
                Status Atual
              </h4>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isSimulationRunning
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-300">
                  {isSimulationRunning ? "Simulação Ativa" : "Simulação Parada"}
                </span>
              </div>
            </div>

            <button
              onClick={handleStartSimulation}
              className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-lg font-semibold text-lg transition-all ${
                isSimulationRunning
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              <PlayIcon className="h-6 w-6" />
              <span>
                {isSimulationRunning ? "Parar Simulação" : "Iniciar Simulação"}
              </span>
            </button>

            <div className="text-xs text-gray-400 text-center">
              {isSimulationRunning
                ? "A simulação está processando pedidos automaticamente"
                : "Clique para iniciar o processamento automático de pedidos"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
