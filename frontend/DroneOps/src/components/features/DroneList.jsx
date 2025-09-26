import React, { useState } from "react";
import { useDroneContext } from "../../context/DroneContext";
import DroneOrders from "./DroneOrders";

const DroneList = () => {
  const { drones } = useDroneContext();
  const [selectedDroneId, setSelectedDroneId] = useState(null);

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
                  ({drone.x}, {drone.y})
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
              <button
                onClick={() => {
                  console.log("Abrir pedidos do drone:", drone.id);
                  setSelectedDroneId(drone.id);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors min-h-[36px]"
              >
                Pedidos
              </button>
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
