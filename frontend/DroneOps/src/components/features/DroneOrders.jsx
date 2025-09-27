import React, { useState, useEffect } from "react";
import { useDroneContext } from "../../context/DroneContext";
import { useNotification } from "../../context/NotificationContext";

const DroneOrders = ({ droneId, onClose }) => {
  const {
    orders,
    allocateOrderToDrone,
    removeOrderFromDrone,
    getDroneOrders,
    drones,
  } = useDroneContext();
  const { showSuccess, showError } = useNotification();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [droneOrders, setDroneOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const availableOrders = orders.filter((order) => order.status === "pending");
  const currentDrone = drones.find((d) => d.id === droneId);

  useEffect(() => {
    const loadDroneOrders = async () => {
      try {
        console.log("🔄 Loading drone orders for drone:", droneId);
        setLoading(true);
        const orders = await getDroneOrders(droneId);
        console.log("📦 Drone orders loaded:", orders);
        setDroneOrders(orders);
      } catch (error) {
        console.error("❌ Error loading drone orders:", error);
        setDroneOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (droneId) {
      loadDroneOrders();
    }
  }, [droneId, getDroneOrders]);

  const handleAllocateOrder = async (orderId) => {
    console.log("🚀 Allocating order", orderId, "to drone", droneId);
    const result = await allocateOrderToDrone(orderId, droneId);
    console.log("📋 Allocation result:", result);

    if (result.success) {
      // Recarregar pedidos do drone
      console.log("🔄 Reloading drone orders...");
      const orders = await getDroneOrders(droneId);
      setDroneOrders(orders);
      console.log("✅ Drone orders reloaded:", orders);

      // Mostrar notificação de sucesso
      showSuccess("Pedido alocado com sucesso ao drone!");
    } else {
      const errorMessage =
        result.message || result.error || "Erro ao alocar pedido";
      setAlertMessage(errorMessage);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      showError(errorMessage);
    }
  };

  const handleRemoveOrder = async (orderId) => {
    console.log("🗑️ Removing order", orderId, "from drone", droneId);
    const result = await removeOrderFromDrone(orderId);
    console.log("📋 Removal result:", result);

    if (result.success) {
      // Recarregar pedidos do drone
      console.log("🔄 Reloading drone orders...");
      const orders = await getDroneOrders(droneId);
      setDroneOrders(orders);
      console.log("✅ Drone orders reloaded:", orders);

      // Mostrar notificação de sucesso
      showSuccess("Pedido removido com sucesso do drone!");
    } else {
      const errorMessage =
        result.message || result.error || "Erro ao remover pedido";
      setAlertMessage(errorMessage);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      showError(errorMessage);
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
          <div>
            <h3 className="text-lg font-semibold text-white">
              Pedidos do Drone
            </h3>
            {currentDrone && (
              <div className="text-sm text-gray-300 mt-1">
                Peso usado: {currentDrone.currentLoad}kg /{" "}
                {currentDrone.capacity}kg
                <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (currentDrone.currentLoad / currentDrone.capacity) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
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
              {loading ? (
                <div className="text-gray-400 text-center py-4">
                  Carregando pedidos...
                </div>
              ) : droneOrders.length === 0 ? (
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
                        Criado:{" "}
                        {new Date(
                          order.created_at || order.createdAt
                        ).toLocaleString()}
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
                        Criado:{" "}
                        {new Date(
                          order.created_at || order.createdAt
                        ).toLocaleString()}
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
