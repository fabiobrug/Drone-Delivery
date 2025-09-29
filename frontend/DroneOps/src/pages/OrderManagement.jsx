"use client";

import React from "react";
import { useState, useMemo, useEffect } from "react";
import { useDroneContext } from "../context/DroneContext";
import { PlusIcon, FunnelIcon } from "@heroicons/react/24/outline";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import api from "../services/api";

const OrderManagement = () => {
  const { orders, addOrder, deleteOrder, drones, droneTypes, refreshOrders } =
    useDroneContext();
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    x: "",
    y: "",
    weight: "",
    priority: "medium",
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: null,
  });

  // Atualizar pedidos automaticamente a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refreshOrders();
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, [refreshOrders]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState(null);
  const [loadingDeliveryTime, setLoadingDeliveryTime] = useState(false);

  // Calcular peso máximo suportado por QUALQUER drone (independente do status)
  const maxWeight = useMemo(() => {
    if (droneTypes.length === 0) {
      return 0;
    }

    // Buscar a maior capacidade entre todos os tipos de drones
    const maxCapacity = Math.max(
      ...droneTypes.map((type) => type.capacity || 0)
    );

    return maxCapacity;
  }, [droneTypes]);

  const calculateDeliveryTime = async (order) => {
    if (!order.droneId) {
      setDeliveryTime({ error: "Pedido não alocado a nenhum drone" });
      return;
    }

    setLoadingDeliveryTime(true);
    try {
      const response = await api.calculateDeliveryTime(order.droneId, order.id);
      if (response.success) {
        setDeliveryTime(response.data);
      } else {
        setDeliveryTime({ error: "Erro ao calcular tempo de entrega" });
      }
    } catch (error) {
      console.error("Error calculating delivery time:", error);
      setDeliveryTime({ error: "Erro ao calcular tempo de entrega" });
    } finally {
      setLoadingDeliveryTime(false);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setDeliveryTime(null);
    calculateDeliveryTime(order);
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders;

    if (filterStatus !== "all") {
      filtered = orders.filter((order) => order.status === filterStatus);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "weight":
          return b.weight - a.weight;
        case "createdAt":
          return (
            new Date(b.created_at || b.createdAt).getTime() -
            new Date(a.created_at || a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });
  }, [orders, sortBy, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.x && formData.y && formData.weight) {
      const result = await addOrder({
        x: Number.parseInt(formData.x),
        y: Number.parseInt(formData.y),
        weight: Number.parseFloat(formData.weight),
        priority: formData.priority,
      });

      if (result.success) {
        setFormData({ x: "", y: "", weight: "", priority: "medium" });
        setShowForm(false);
      } else {
        setConfirmationModal({
          isOpen: true,
          title: "Erro",
          message: result.error,
          type: "error",
          onConfirm: () =>
            setConfirmationModal({
              isOpen: false,
              title: "",
              message: "",
              type: "warning",
              onConfirm: null,
            }),
        });
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-500 text-white";
      case "allocated":
        return "bg-blue-500 text-white";
      case "in-route":
        return "bg-purple-500 text-white";
      case "delivered":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Aguardando";
      case "allocated":
        return "Alocado";
      case "in-route":
        return "Em Rota";
      case "delivered":
        return "Entregue";
      default:
        return status;
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
        return priority;
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fadeInUp">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Gerenciamento de Pedidos
          </h1>
          <p className="text-gray-400">
            Gerencie todos os pedidos de entrega do sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover-lift hover:shadow-lg"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Novo Pedido</span>
        </button>
      </div>

      {/* Add Order Form */}
      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6 animate-fadeInUp">
          <h3 className="text-lg font-semibold text-white mb-4">
            Adicionar Novo Pedido
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Coordenada X
              </label>
              <input
                type="number"
                min="0"
                max="49"
                value={formData.x}
                onChange={(e) =>
                  setFormData({ ...formData, x: e.target.value })
                }
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Coordenada Y
              </label>
              <input
                type="number"
                min="0"
                max="49"
                value={formData.y}
                onChange={(e) =>
                  setFormData({ ...formData, y: e.target.value })
                }
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Peso (kg) {maxWeight > 0 && `(máximo: ${maxWeight}kg)`}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max={maxWeight > 0 ? maxWeight : undefined}
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder={
                  maxWeight > 0 ? `0.1 - ${maxWeight}kg` : "Digite o peso"
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div className="col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover-lift"
              >
                Adicionar Pedido
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Controls */}
      <div
        className="flex items-center justify-between mb-4 animate-fadeInUp"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-400">Filtros:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Aguardando</option>
            <option value="allocated">Alocado</option>
            <option value="in-route">Em Rota</option>
            <option value="delivered">Entregue</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Data de Criação</option>
            <option value="priority">Prioridade</option>
            <option value="weight">Peso</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover-lift">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  ID do Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Coordenadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Peso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Prioridade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredAndSortedOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-750 transition-all duration-200 animate-slideInRight cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleOrderClick(order)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ({order.x}, {order.y})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.weight} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                        order.priority
                      )}`}
                    >
                      {getPriorityText(order.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(
                      order.created_at || order.createdAt
                    ).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setConfirmationModal({
                          isOpen: true,
                          title: "Confirmar Exclusão",
                          message: `Tem certeza que deseja excluir o pedido ${order.id}?`,
                          type: "warning",
                          onConfirm: async () => {
                            console.log(`🗑️ Deleting order: ${order.id}`);
                            const result = await deleteOrder(order.id);
                            console.log(`📋 Delete result:`, result);

                            if (!result.success) {
                              setConfirmationModal({
                                isOpen: true,
                                title: "Erro",
                                message: `Erro ao excluir pedido: ${result.error}`,
                                type: "error",
                                onConfirm: () =>
                                  setConfirmationModal({
                                    isOpen: false,
                                    title: "",
                                    message: "",
                                    type: "warning",
                                    onConfirm: null,
                                  }),
                              });
                            } else {
                              console.log(
                                `✅ Order ${order.id} deleted successfully`
                              );
                              setConfirmationModal({
                                isOpen: false,
                                title: "",
                                message: "",
                                type: "warning",
                                onConfirm: null,
                              });
                            }
                          },
                        });
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Excluir Pedido"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">Nenhum pedido encontrado</div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-md mx-4">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Detalhes do Pedido
              </h3>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setDeliveryTime(null);
                }}
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

            <div className="p-4 space-y-4">
              <div>
                <div className="text-sm text-gray-400">ID do Pedido</div>
                <div className="text-white font-medium">{selectedOrder.id}</div>
              </div>

              <div>
                <div className="text-sm text-gray-400">Coordenadas</div>
                <div className="text-white">
                  ({selectedOrder.x}, {selectedOrder.y})
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400">Peso</div>
                <div className="text-white">{selectedOrder.weight} kg</div>
              </div>

              <div>
                <div className="text-sm text-gray-400">Prioridade</div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                    selectedOrder.priority
                  )}`}
                >
                  {getPriorityText(selectedOrder.priority)}
                </span>
              </div>

              <div>
                <div className="text-sm text-gray-400">Status</div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>

              {selectedOrder.droneId && (
                <div>
                  <div className="text-sm text-gray-400">Drone Alocado</div>
                  <div className="text-white">{selectedOrder.droneId}</div>
                </div>
              )}

              {/* Tempo de Entrega */}
              <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-600">
                <div className="text-sm text-gray-300 mb-2">
                  Tempo de Entrega:
                </div>
                {loadingDeliveryTime ? (
                  <div className="text-blue-400">Calculando...</div>
                ) : deliveryTime ? (
                  deliveryTime.error ? (
                    <div className="text-red-400">{deliveryTime.error}</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-lg font-medium text-green-400">
                        {deliveryTime.timeFormatted}
                      </div>
                      <div className="text-sm text-gray-400">
                        Distância: {Math.round(deliveryTime.distance)}m
                      </div>
                      <div className="text-sm text-gray-400">
                        Velocidade: {deliveryTime.maxSpeed || "N/A"} km/h
                      </div>
                      <div className="text-sm text-gray-400">
                        Waypoints: {deliveryTime.waypoints}
                      </div>
                      {deliveryTime.maxSpeed && deliveryTime.maxSpeed <= 0 && (
                        <div className="text-sm text-yellow-400">
                          ⚠️ Velocidade não definida no tipo de drone
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="text-gray-400">Clique para calcular</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal({ ...confirmationModal, isOpen: false })
        }
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
      />
    </div>
  );
};

export default OrderManagement;
