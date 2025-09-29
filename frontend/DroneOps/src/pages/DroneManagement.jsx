"use client";

import React from "react";
import { useState } from "react";
import { useDroneContext } from "../context/DroneContext";
import {
  PlusIcon,
  CogIcon,
  BoltIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import DroneDeliveryInfo from "../components/features/DroneDeliveryInfo";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import api from "../services/api";

const DroneManagement = () => {
  const {
    drones,
    addDrone,
    updateDrone,
    droneTypes,
    addDroneType,
    updateDroneStatus,
    deleteDrone,
    refreshDrones,
    refreshOrders,
  } = useDroneContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [selectedDroneForStatus, setSelectedDroneForStatus] = useState(null);
  const [selectedDroneForEdit, setSelectedDroneForEdit] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newDroneType, setNewDroneType] = useState({
    name: "",
    capacity: 5,
    batteryRange: 50,
    maxSpeed: 30,
    description: "",
  });
  const [newDrone, setNewDrone] = useState({
    serialNumber: "",
    typeId: "",
    x: 25,
    y: 25,
  });
  const [editDrone, setEditDrone] = useState({
    serialNumber: "",
    typeId: "",
    x: 25,
    y: 25,
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: null,
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "idle":
        return "text-gray-400";
      case "loading":
        return "text-yellow-400";
      case "flying":
        return "text-green-400";
      case "returning":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "idle":
        return "⏸️";
      case "loading":
        return "📦";
      case "flying":
        return "🚁";
      case "returning":
        return "🔄";
      default:
        return "❓";
    }
  };

  const handleCreateDroneType = async (e) => {
    e.preventDefault();
    const result = await addDroneType(newDroneType);
    if (result.success) {
      setNewDroneType({
        name: "",
        capacity: 5,
        batteryRange: 50,
        maxSpeed: 30,
        description: "",
      });
      setShowTypeForm(false);
    } else {
      alert(`Erro ao criar tipo de drone: ${result.error}`);
    }
  };

  const handleCreateDrone = async (e) => {
    e.preventDefault();
    const result = await addDrone(newDrone);
    if (result.success) {
      setNewDrone({ serialNumber: "", typeId: "", x: 25, y: 25 });
      setShowCreateForm(false);
    } else {
      alert(`Erro ao criar drone: ${result.error}`);
    }
  };

  const handleEditDrone = async (e) => {
    e.preventDefault();
    const result = await updateDrone(selectedDroneForEdit, editDrone);
    if (result.success) {
      setEditDrone({ serialNumber: "", typeId: "", x: 25, y: 25 });
      setShowEditForm(false);
      setSelectedDroneForEdit(null);
    } else {
      alert(`Erro ao editar drone: ${result.error}`);
    }
  };

  const handleDeleteDrone = async (droneId) => {
    const drone = drones.find((d) => d.id === droneId);
    setConfirmationModal({
      isOpen: true,
      title: "Confirmar Exclusão",
      message: `Tem certeza que deseja excluir o drone ${
        drone?.serialNumber || droneId
      }?`,
      type: "warning",
      onConfirm: async () => {
        const result = await deleteDrone(droneId);
        if (!result.success) {
          setConfirmationModal({
            isOpen: true,
            title: "Erro",
            message: `Erro ao excluir drone: ${result.error}`,
            type: "error",
            onConfirm: () =>
              setConfirmationModal({ ...confirmationModal, isOpen: false }),
          });
        }
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
    });
  };

  const openEditForm = (drone) => {
    setEditDrone({
      serialNumber: drone.serialNumber,
      typeId: drone.typeId,
      x: drone.x,
      y: drone.y,
    });
    setSelectedDroneForEdit(drone.id);
    setShowEditForm(true);
  };

  return (
    <div className="p-6 space-y-6 min-h-screen overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Gerenciamento de Drones
          </h1>
          <p className="text-gray-400 mt-1">
            Monitore, configure e gerencie sua frota de drones
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTypeForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <CogIcon className="h-5 w-5" />
            <span>Novo Tipo</span>
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Novo Drone</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Drones</p>
              <p className="text-2xl font-bold text-white">{drones.length}</p>
            </div>
            <div className="text-blue-400 text-2xl">🚁</div>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ativos</p>
              <p className="text-2xl font-bold text-green-400">
                {drones.filter((d) => d.status !== "idle").length}
              </p>
            </div>
            <div className="text-green-400 text-2xl">✅</div>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Bateria Média</p>
              <p className="text-2xl font-bold text-yellow-400">
                {Math.round(
                  drones.reduce((acc, d) => acc + d.battery, 0) / drones.length
                )}
                %
              </p>
            </div>
            <BoltIcon className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tipos de Drone</p>
              <p className="text-2xl font-bold text-purple-400">
                {droneTypes.length}
              </p>
            </div>
            <CogIcon className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Drone List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Lista de Drones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Drone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status / Pedidos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Bateria
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Carga
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {drones.map((drone) => (
                <tr
                  key={drone.id}
                  className="hover:bg-gray-700 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">
                        {getStatusIcon(drone.status)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {drone.serialNumber || `Drone ${drone.id}`}
                        </div>
                        <div className="text-sm text-gray-400">
                          ID: {drone.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-sm font-medium ${getStatusColor(
                          drone.status
                        )}`}
                      >
                        {drone.status.toUpperCase()}
                      </span>
                      <DroneDeliveryInfo drone={drone} />
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-600 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            drone.battery > 50
                              ? "bg-green-400"
                              : drone.battery > 20
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          }`}
                          style={{ width: `${drone.battery}%` }}
                        />
                      </div>
                      <span className="text-sm text-white">
                        {drone.battery}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {Math.round((drone.currentLoad || 0) * 100) / 100}kg /{" "}
                      {drone.capacity}kg
                    </div>
                    <div className="w-16 bg-gray-600 rounded-full h-1 mt-1">
                      <div
                        className="h-1 rounded-full bg-blue-400"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              ((drone.currentLoad || 0) /
                                (drone.capacity || 1)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPinIcon className="h-4 w-4 mr-1" />({drone.x},{" "}
                      {drone.y})
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {/* Botão Fly */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const result = await api.startDroneFlight(drone.id);
                            if (result.success) {
                              // Atualizar a lista de drones e pedidos
                              await refreshDrones();
                              await refreshOrders();
                            } else {
                              alert(`Erro ao iniciar voo: ${result.message}`);
                            }
                          } catch (error) {
                            console.error(
                              "Error starting drone flight:",
                              error
                            );
                            alert("Erro ao iniciar voo do drone");
                          }
                        }}
                        disabled={
                          drone.status === "flying" ||
                          drone.status === "returning" ||
                          drone.currentLoad === 0
                        }
                        className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                          drone.status === "flying" ||
                          drone.status === "returning"
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : drone.currentLoad === 0
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                        title={
                          drone.currentLoad === 0
                            ? "Drone precisa ter pedidos para voar"
                            : drone.status === "flying" ||
                              drone.status === "returning"
                            ? "Drone já está voando"
                            : "Iniciar voo do drone"
                        }
                      >
                        {drone.status === "flying" ||
                        drone.status === "returning"
                          ? "Voando"
                          : "Fly"}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDroneForStatus(drone.id);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                        title="Configurar Status"
                      >
                        <CogIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(drone);
                        }}
                        className="text-yellow-400 hover:text-yellow-300"
                        title="Editar Drone"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDrone(drone.id);
                        }}
                        className="text-red-400 hover:text-red-300"
                        title="Excluir Drone"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Drone Type Modal */}
      {showTypeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md my-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              Criar Novo Tipo de Drone
            </h3>
            <form onSubmit={handleCreateDroneType} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nome do Tipo
                </label>
                <input
                  type="text"
                  value={newDroneType.name}
                  onChange={(e) =>
                    setNewDroneType({ ...newDroneType, name: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Capacidade (kg)
                </label>
                <input
                  type="number"
                  value={newDroneType.capacity}
                  onChange={(e) =>
                    setNewDroneType({
                      ...newDroneType,
                      capacity: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Autonomia da Bateria (km)
                </label>
                <input
                  type="number"
                  value={newDroneType.batteryRange}
                  onChange={(e) =>
                    setNewDroneType({
                      ...newDroneType,
                      batteryRange: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Velocidade Máxima (km/h)
                </label>
                <input
                  type="number"
                  value={newDroneType.maxSpeed}
                  onChange={(e) =>
                    setNewDroneType({
                      ...newDroneType,
                      maxSpeed: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={newDroneType.description}
                  onChange={(e) =>
                    setNewDroneType({
                      ...newDroneType,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Criar Tipo
                </button>
                <button
                  type="button"
                  onClick={() => setShowTypeForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Drone Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md my-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              Editar Drone
            </h3>
            <form onSubmit={handleEditDrone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Número de Série
                </label>
                <input
                  type="text"
                  value={editDrone.serialNumber}
                  onChange={(e) =>
                    setEditDrone({ ...editDrone, serialNumber: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo de Drone
                </label>
                <select
                  value={editDrone.typeId}
                  onChange={(e) =>
                    setEditDrone({ ...editDrone, typeId: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  required
                >
                  <option value="">Selecione um tipo</option>
                  {droneTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {type.capacity}kg
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Posição X
                  </label>
                  <input
                    type="number"
                    value={editDrone.x}
                    onChange={(e) =>
                      setEditDrone({ ...editDrone, x: Number(e.target.value) })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Posição Y
                  </label>
                  <input
                    type="number"
                    value={editDrone.y}
                    onChange={(e) =>
                      setEditDrone({ ...editDrone, y: Number(e.target.value) })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedDroneForEdit(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Drone Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md my-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              Adicionar Novo Drone
            </h3>
            <form onSubmit={handleCreateDrone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Número de Série
                </label>
                <input
                  type="text"
                  value={newDrone.serialNumber}
                  onChange={(e) =>
                    setNewDrone({ ...newDrone, serialNumber: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo de Drone
                </label>
                <select
                  value={newDrone.typeId}
                  onChange={(e) =>
                    setNewDrone({ ...newDrone, typeId: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  required
                >
                  <option value="">Selecione um tipo</option>
                  {droneTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {type.capacity}kg
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Posição X
                  </label>
                  <input
                    type="number"
                    value={newDrone.x}
                    onChange={(e) =>
                      setNewDrone({ ...newDrone, x: Number(e.target.value) })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Posição Y
                  </label>
                  <input
                    type="number"
                    value={newDrone.y}
                    onChange={(e) =>
                      setNewDrone({ ...newDrone, y: Number(e.target.value) })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Adicionar Drone
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Configuração de Status */}
      {selectedDroneForStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Configurar Status do Drone
              </h3>
              <button
                onClick={() => setSelectedDroneForStatus(null)}
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

            {(() => {
              const drone = drones.find((d) => d.id === selectedDroneForStatus);
              if (!drone) return null;

              return (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">
                      Drone: {drone.serialNumber}
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Status atual:{" "}
                      <span className="font-semibold">{drone.status}</span>
                    </p>
                    <p className="text-gray-300 text-sm">
                      Posição: ({drone.x}, {drone.y})
                    </p>
                    <p className="text-gray-300 text-sm">
                      Bateria: {drone.battery}%
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Novo Status:
                    </label>
                    <select
                      value={drone.status}
                      onChange={(e) =>
                        updateDroneStatus(drone.id, e.target.value)
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="idle">Idle (Parado)</option>
                      <option value="loading">Loading (Carregando)</option>
                      <option value="flying">Flying (Voando)</option>
                      <option value="returning">Returning (Retornando)</option>
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedDroneForStatus(null)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              );
            })()}
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

export default DroneManagement;
