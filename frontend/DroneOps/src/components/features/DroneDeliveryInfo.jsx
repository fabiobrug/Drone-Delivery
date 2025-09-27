import React, { useState, useEffect } from "react";
import { useDroneContext } from "../../context/DroneContext";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const DroneDeliveryInfo = ({ drone }) => {
  const {
    getDroneOrders,
    calculateDeliveryTime,
    calculateDeliveryOrder,
    config,
  } = useDroneContext();
  const [droneOrders, setDroneOrders] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDroneOrders = async () => {
      if (drone.id) {
        setLoading(true);
        try {
          const orders = await getDroneOrders(drone.id);
          setDroneOrders(orders);
        } catch (error) {
          console.error("Error loading drone orders:", error);
          setDroneOrders([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDroneOrders();
  }, [drone.id, getDroneOrders]);

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return "Desconhecida";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-900";
      case "medium":
        return "text-yellow-400 bg-yellow-900";
      case "low":
        return "text-green-400 bg-green-900";
      default:
        return "text-gray-400 bg-gray-900";
    }
  };

  const formatTime = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const sortedOrders = calculateDeliveryOrder(
    droneOrders,
    config.deliveryPriority
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors"
      >
        <span>{droneOrders.length} pedidos</span>
        {isExpanded ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
          <div className="p-4">
            <h4 className="text-sm font-semibold text-white mb-3">
              Informações de Entrega
            </h4>

            {loading ? (
              <div className="text-gray-400 text-center py-2">
                Carregando pedidos...
              </div>
            ) : droneOrders.length === 0 ? (
              <div className="text-gray-400 text-center py-2">
                Nenhum pedido alocado
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {sortedOrders.map((order, index) => {
                  const deliveryTime = calculateDeliveryTime(drone, order);
                  return (
                    <div
                      key={order.id}
                      className="bg-gray-900 border border-gray-700 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-white">
                          #{index + 1} - Pedido {order.id.split("-")[1]}
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs ${getPriorityColor(
                            order.priority
                          )}`}
                        >
                          {getPriorityText(order.priority)}
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 space-y-1">
                        <div>
                          Coordenadas: ({order.x}, {order.y})
                        </div>
                        <div>Peso: {order.weight} kg</div>
                        <div className="text-blue-400">
                          Tempo estimado: {formatTime(deliveryTime)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DroneDeliveryInfo;
