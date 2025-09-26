import React, { useState } from "react";
import { useDroneContext } from "../../context/DroneContext";

const DroneOrders = ({ droneId, onClose }) => {
  const { orders, allocateOrderToDrone, removeOrderFromDrone, getDroneOrders } =
    useDroneContext();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const droneOrders = getDroneOrders(droneId);
  const availableOrders = orders.filter((order) => order.status === "pending");

  const handleAllocateOrder = (orderId) => {
    const result = allocateOrderToDrone(orderId, droneId);

    if (!result.success) {
      setAlertMessage(result.message);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  const handleRemoveOrder = (orderId) => {
    removeOrderFromDrone(orderId);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Pedidos do Drone</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Alert */}
        {showAlert && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 mx-4 mt-4 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {alertMessage}
            </div>
          </div>
        )}

        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Pedidos Atuais do Drone */}
          <div>
            <h4 className="text-md font-semibold text-white mb-3">
              Pedidos Atuais
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {droneOrders.length === 0 ? (
                <div className="text-gray-400 text-center py-4">
                  Nenhum pedido alocado
                </div>
              ) : (
                droneOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-900 border border-gray-600 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-white">
                        Pedido {order.id.split("-")[1]}
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs ${getPriorityColor(
                          order.priority
                        )}`}
                      >
                        {getPriorityText(order.priority)}
                      </div>
                    </div>

                    <div className="text-sm text-gray-400 space-y-1">
                      <div>
                        Coordenadas: ({order.x}, {order.y})
                      </div>
                      <div>Peso: {order.weight} kg</div>
                      <div>
                        Criado: {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveOrder(order.id)}
                      className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Remover Pedido
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pedidos Disponíveis */}
          <div>
            <h4 className="text-md font-semibold text-white mb-3">
              Pedidos Disponíveis
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {availableOrders.length === 0 ? (
                <div className="text-gray-400 text-center py-4">
                  Nenhum pedido disponível
                </div>
              ) : (
                availableOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-900 border border-gray-600 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-white">
                        Pedido {order.id.split("-")[1]}
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs ${getPriorityColor(
                          order.priority
                        )}`}
                      >
                        {getPriorityText(order.priority)}
                      </div>
                    </div>

                    <div className="text-sm text-gray-400 space-y-1">
                      <div>
                        Coordenadas: ({order.x}, {order.y})
                      </div>
                      <div>Peso: {order.weight} kg</div>
                      <div>
                        Criado: {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAllocateOrder(order.id)}
                      className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Alocar Pedido
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneOrders;
