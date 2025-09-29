import React, { useState, useEffect } from "react";
import { useDroneContext } from "../../context/DroneContext";
import { useNotification } from "../../context/NotificationContext";
import api from "../../services/api";

const DroneOrdersModal = ({ drone, isOpen, onClose }) => {
  const {
    orders,
    allocateOrderToDrone,
    removeOrderFromDrone,
    getDroneOrders,
    calculateDeliveryOrder,
    config,
  } = useDroneContext();
  const { showSuccess, showError } = useNotification();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [droneOrders, setDroneOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryTimes, setDeliveryTimes] = useState({});
  const [loadingTimes, setLoadingTimes] = useState({});

  const availableOrders = orders.filter((order) => order.status === "pending");

  useEffect(() => {
    const loadDroneOrders = async () => {
      if (drone?.id && isOpen) {
        try {
          console.log("🔄 Loading drone orders for drone:", drone.id);
          setLoading(true);
          const orders = await getDroneOrders(drone.id);
          console.log("📦 Drone orders loaded:", orders);
          setDroneOrders(orders);

          // Calcular tempos de entrega para os pedidos do drone
          if (orders.length > 0) {
            await loadDeliveryTimes(orders);
          }
        } catch (error) {
          console.error("❌ Error loading drone orders:", error);
          setDroneOrders([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDroneOrders();
  }, [drone?.id, isOpen, getDroneOrders]);

  const loadDeliveryTimes = async (orders) => {
    const times = {};
    const loading = {};

    for (const order of orders) {
      loading[order.id] = true;
      setLoadingTimes({ ...loading });

      try {
        const response = await api.calculateDeliveryTime(drone.id, order.id);
        if (response.success) {
          times[order.id] = response.data;
        }
      } catch (error) {
        console.error(
          `Error calculating delivery time for order ${order.id}:`,
          error
        );
        times[order.id] = { error: "Erro ao calcular tempo" };
      }

      loading[order.id] = false;
      setLoadingTimes({ ...loading });
    }

    setDeliveryTimes(times);
  };

  const handleAllocateOrder = async (orderId) => {
    console.log("🚀 Allocating order", orderId, "to drone", drone.id);
    const result = await allocateOrderToDrone(orderId, drone.id);
    console.log("📋 Allocation result:", result);

    if (result.success) {
      // Recarregar pedidos do drone
      console.log("🔄 Reloading drone orders...");
      const orders = await getDroneOrders(drone.id);
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
    console.log(
      `🔍 DEBUG - Frontend removing order ${orderId} from drone ${drone.id}`
    );

    // Confirmar remoção
    if (
      !window.confirm("Tem certeza que deseja remover este pedido do drone?")
    ) {
      return;
    }

    const result = await removeOrderFromDrone(orderId, drone.id);
    console.log(`🔍 DEBUG - Frontend result:`, result);

    if (result.success) {
      // Recarregar pedidos do drone
      const orders = await getDroneOrders(drone.id);
      setDroneOrders(orders);

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

  const sortedOrders = calculateDeliveryOrder(
    droneOrders,
    config.deliveryPriority
  );

  if (!isOpen || !drone) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Pedidos do Drone - {drone.serialNumber || `Drone ${drone.id}`}
            </h3>
            <div className="text-sm text-gray-300 mt-1">
              Peso usado: {Math.round((drone.currentLoad || 0) * 100) / 100}kg /{" "}
              {drone.capacity}kg
              <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(
                        100,
                        ((drone.currentLoad || 0) / (drone.capacity || 1)) * 100
                      )
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
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
              Pedidos Atuais ({droneOrders.length})
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
                sortedOrders.map((order, index) => (
                  <div
                    key={order.id}
                    className="bg-gray-900 border border-gray-600 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-white">
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

                      {/* Tempo de Entrega */}
                      <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-600">
                        <div className="text-xs text-gray-300 mb-1">
                          Tempo de Entrega:
                        </div>
                        {loadingTimes[order.id] ? (
                          <div className="text-xs text-blue-400">
                            Calculando...
                          </div>
                        ) : deliveryTimes[order.id] ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-green-400">
                              {deliveryTimes[order.id].timeFormatted || "N/A"}
                            </div>
                            <div className="text-xs text-gray-400">
                              Distância:{" "}
                              {Math.round(
                                deliveryTimes[order.id].distance || 0
                              )}
                              m
                            </div>
                            <div className="text-xs text-gray-400">
                              Velocidade:{" "}
                              {deliveryTimes[order.id].maxSpeed || "N/A"} km/h
                            </div>
                            {deliveryTimes[order.id].error && (
                              <div className="text-xs text-yellow-400">
                                ⚠️ {deliveryTimes[order.id].error}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-red-400">
                            {deliveryTimes[order.id]?.error ||
                              "Erro ao calcular"}
                          </div>
                        )}
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
              Pedidos Disponíveis ({availableOrders.length})
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

export default DroneOrdersModal;
