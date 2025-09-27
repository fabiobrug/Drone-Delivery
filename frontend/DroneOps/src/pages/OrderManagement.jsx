"use client";

import React from "react";
import { useState, useMemo } from "react";
import { useDroneContext } from "../context/DroneContext";
import { PlusIcon, FunnelIcon } from "@heroicons/react/24/outline";

const OrderManagement = () => {
  const { orders, addOrder, deleteOrder } = useDroneContext();
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    x: "",
    y: "",
    weight: "",
    priority: "medium",
  });

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
      } else if (result.requiresConfirmation) {
        const confirmed = window.confirm(
          `${result.error}\n\nClique OK para aceitar o pedido mesmo assim.`
        );
        if (confirmed) {
          // Criar o pedido mesmo sem drones disponíveis
          const confirmResult = await addOrder({
            x: Number.parseInt(formData.x),
            y: Number.parseInt(formData.y),
            weight: Number.parseFloat(formData.weight),
            priority: formData.priority,
            forceCreate: true, // Flag para forçar criação
          });

          if (confirmResult.success) {
            setFormData({ x: "", y: "", weight: "", priority: "medium" });
            setShowForm(false);
          } else {
            alert(`Erro ao criar pedido: ${confirmResult.error}`);
          }
        }
      } else {
        alert(`Erro ao criar pedido: ${result.error}`);
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
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                  className="hover:bg-gray-750 transition-all duration-200 animate-slideInRight"
                  style={{ animationDelay: `${index * 50}ms` }}
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
                        if (
                          window.confirm(
                            `Tem certeza que deseja excluir o pedido ${order.id}?`
                          )
                        ) {
                          deleteOrder(order.id);
                        }
                      }}
                      className="text-red-400 hover:text-red-300"
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
    </div>
  );
};

export default OrderManagement;
