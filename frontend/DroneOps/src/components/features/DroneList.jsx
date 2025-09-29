import React, { useState, useEffect } from "react";
import { useDroneContext } from "../../context/DroneContext";
import api from "../../services/api";
import DroneOrders from "./DroneOrders";

const DroneList = () => {
  const { drones, refreshDrones, refreshOrders } = useDroneContext();
  const [selectedDroneId, setSelectedDroneId] = useState(null);
  const [deliveryTimes, setDeliveryTimes] = useState({});
  const [loadingFlights, setLoadingFlights] = useState(new Set());

  const getStatusColor = (status) => {
    switch (status) {
      case "idle":
        return "bg-green-500";
      case "loading":
        return "bg-orange-500";
      case "flying":
        return "bg-blue-500";
      case "returning":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "idle":
        return "Ocioso";
      case "loading":
        return "Carregando";
      case "flying":
        return "Em Voo";
      case "returning":
        return "Retornando";
      default:
        return "Desconhecido";
    }
  };

  // Função para iniciar voo do drone
  const startDroneFlight = async (droneId) => {
    try {
      setLoadingFlights((prev) => new Set(prev).add(droneId));
      const result = await api.startDroneFlight(droneId);

      if (result.success) {
        await refreshDrones();
        await refreshOrders(); // Atualizar pedidos também
        // Iniciar polling para atualizar informações de entrega
        startDeliveryTimePolling(droneId);
      } else {
        alert(`Erro ao iniciar voo: ${result.message}`);
      }
    } catch (error) {
      console.error("Error starting drone flight:", error);
      alert("Erro ao iniciar voo do drone");
    } finally {
      setLoadingFlights((prev) => {
        const newSet = new Set(prev);
        newSet.delete(droneId);
        return newSet;
      });
    }
  };

  // Função para parar simulação do drone
  const stopDroneSimulation = async (droneId) => {
    try {
      const result = await api.stopDroneSimulation(droneId);

      if (result.success) {
        await refreshDrones();
        // Parar polling de informações de entrega
        stopDeliveryTimePolling(droneId);
      } else {
        alert(`Erro ao parar simulação: ${result.message}`);
      }
    } catch (error) {
      console.error("Error stopping drone simulation:", error);
      alert("Erro ao parar simulação do drone");
    }
  };

  // Função para iniciar polling de informações de entrega
  const startDeliveryTimePolling = (droneId) => {
    const interval = setInterval(async () => {
      try {
        const result = await api.getDeliveryTimeInfo(droneId);
        if (result.success) {
          setDeliveryTimes((prev) => ({
            ...prev,
            [droneId]: result.data,
          }));
        } else {
          // Se não conseguiu obter informações, parar polling
          stopDeliveryTimePolling(droneId);
        }
      } catch (error) {
        console.error("Error getting delivery time info:", error);
        stopDeliveryTimePolling(droneId);
      }
    }, 5000); // Atualizar a cada 5 segundos

    // Armazenar o interval para poder parar depois
    if (!window.deliveryTimeIntervals) {
      window.deliveryTimeIntervals = new Map();
    }
    window.deliveryTimeIntervals.set(droneId, interval);
  };

  // Função para parar polling de informações de entrega
  const stopDeliveryTimePolling = (droneId) => {
    if (window.deliveryTimeIntervals) {
      const interval = window.deliveryTimeIntervals.get(droneId);
      if (interval) {
        clearInterval(interval);
        window.deliveryTimeIntervals.delete(droneId);
      }
    }

    // Remover informações de entrega do estado
    setDeliveryTimes((prev) => {
      const newTimes = { ...prev };
      delete newTimes[droneId];
      return newTimes;
    });
  };

  // Formatar tempo em formato legível
  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  // Effect para limpar intervals quando componente desmontar
  useEffect(() => {
    return () => {
      if (window.deliveryTimeIntervals) {
        window.deliveryTimeIntervals.forEach((interval) =>
          clearInterval(interval)
        );
        window.deliveryTimeIntervals.clear();
      }
    };
  }, []);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg">
      <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
        <h3 className="text-lg font-semibold text-white">Lista de Drones</h3>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {drones.map((drone) => (
          <div
            key={drone.id}
            className="bg-gray-900 border border-gray-600 rounded-lg p-3 hover:bg-gray-850 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-white">{drone.serialNumber}</div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(
                    drone.status
                  )}`}
                ></div>
                <span className="text-sm text-gray-300">
                  {getStatusText(drone.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
              <div>
                Bateria: <span className="text-white">{drone.battery}%</span>
              </div>
              <div>
                Posição:{" "}
                <span className="text-white">
                  ({drone.x.toFixed(1)}, {drone.y.toFixed(1)})
                </span>
              </div>
              <div>
                Carga:{" "}
                <span className="text-white">
                  {drone.currentLoad}/{drone.capacity} kg
                </span>
              </div>
              <div>
                Capacidade:{" "}
                <span className="text-white">{drone.capacity} kg</span>
              </div>
            </div>

            {/* Informações de entrega em tempo real */}
            {deliveryTimes[drone.id] && (
              <div className="mt-2 p-2 bg-blue-900/30 border border-blue-700 rounded">
                <div className="text-sm text-blue-300 font-medium mb-1">
                  Informações de Entrega
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-blue-200">
                  <div>
                    Tempo restante:{" "}
                    <span className="text-white font-medium">
                      {formatTime(deliveryTimes[drone.id].remainingTime)}
                    </span>
                  </div>
                  <div>
                    Distância:{" "}
                    <span className="text-white font-medium">
                      {deliveryTimes[drone.id].distance.toFixed(1)} km
                    </span>
                  </div>
                  <div>
                    Destino:{" "}
                    <span className="text-white font-medium">
                      ({deliveryTimes[drone.id].destination.x},{" "}
                      {deliveryTimes[drone.id].destination.y})
                    </span>
                  </div>
                  <div>
                    Bateria atual:{" "}
                    <span className="text-white font-medium">
                      {deliveryTimes[drone.id].battery}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Battery indicator */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Bateria</span>
                <span>{drone.battery}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    drone.battery > 60
                      ? "bg-green-500"
                      : drone.battery > 30
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${drone.battery}%` }}
                ></div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex space-x-2 min-h-[40px]">
              {/* Botão Fly - sempre visível na frente */}
              <button
                onClick={() => startDroneFlight(drone.id)}
                disabled={
                  loadingFlights.has(drone.id) ||
                  drone.status === "flying" ||
                  drone.status === "returning" ||
                  drone.currentLoad === 0
                }
                className={`flex-1 px-3 py-2 rounded text-sm transition-colors min-h-[36px] font-semibold ${
                  drone.status === "flying" || drone.status === "returning"
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : drone.currentLoad === 0
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                title={
                  drone.currentLoad === 0
                    ? "Drone precisa ter pedidos para voar"
                    : drone.status === "flying" || drone.status === "returning"
                    ? "Drone já está voando"
                    : "Iniciar voo do drone"
                }
              >
                {loadingFlights.has(drone.id)
                  ? "Iniciando..."
                  : drone.status === "flying" || drone.status === "returning"
                  ? "Voando"
                  : "Fly"}
              </button>

              <button
                onClick={() => {
                  console.log("Abrir pedidos do drone:", drone.id);
                  setSelectedDroneId(drone.id);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors min-h-[36px]"
              >
                Pedidos
              </button>

              {/* Botão para parar simulação */}
              {(drone.status === "flying" || drone.status === "returning") && (
                <button
                  onClick={() => stopDroneSimulation(drone.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors min-h-[36px]"
                >
                  Parar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Pedidos */}
      {selectedDroneId && (
        <DroneOrders
          droneId={selectedDroneId}
          onClose={() => setSelectedDroneId(null)}
        />
      )}
    </div>
  );
};

export default DroneList;
