"use client";

import React, { useState } from "react";
import { useDroneContext } from "../context/DroneContext";
import {
  PlusIcon,
  CogIcon,
  BoltIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

const DroneTypes = () => {
  const { droneTypes, addDroneType, deleteDroneType, updateDroneType, drones } =
    useDroneContext();
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [newDroneType, setNewDroneType] = useState({
    name: "",
    capacity: 5,
    batteryRange: 50,
    maxSpeed: 30,
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    if (editingType) {
      result = await updateDroneType(editingType.id, newDroneType);
    } else {
      result = await addDroneType(newDroneType);
    }

    if (result.success) {
      setEditingType(null);
      setNewDroneType({
        name: "",
        capacity: 5,
        batteryRange: 50,
        maxSpeed: 30,
        description: "",
      });
      setShowForm(false);
    } else {
      alert(`Erro: ${result.error}`);
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setNewDroneType({
      name: type.name,
      capacity: type.capacity,
      batteryRange: type.battery_range || type.batteryRange,
      maxSpeed: type.max_speed || type.maxSpeed,
      description: type.description,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingType(null);
    setNewDroneType({
      name: "",
      capacity: 5,
      batteryRange: 50,
      maxSpeed: 30,
      description: "",
    });
    setShowForm(false);
  };

  const handleDelete = async (typeId) => {
    const result = await deleteDroneType(typeId);
    if (!result.success) {
      alert(result.message || result.error);
    }
  };

  const getDroneTypeStats = (typeId) => {
    const dronesOfType = drones.filter(
      (drone) => (drone.typeId || drone.type_id) === typeId
    );
    const activeDrones = dronesOfType.filter(
      (drone) => drone.status !== "idle"
    );
    const totalDeliveries = dronesOfType.reduce(
      (acc, drone) => acc + (drone.current_load || drone.currentLoad || 0),
      0
    );
    const avgBattery =
      dronesOfType.length > 0
        ? Math.round(
            dronesOfType.reduce((acc, drone) => acc + drone.battery, 0) /
              dronesOfType.length
          )
        : 0;

    return {
      totalDrones: dronesOfType.length,
      activeDrones: activeDrones.length,
      totalDeliveries: totalDeliveries,
      avgBattery: avgBattery,
      efficiency:
        dronesOfType.length > 0
          ? Math.round((activeDrones.length / dronesOfType.length) * 100)
          : 0,
    };
  };

  return (
    <div className="p-6 space-y-6 min-h-screen overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Tipos de Drones</h1>
          <p className="text-gray-400 mt-1">
            Gerencie os tipos de drones e suas especificações
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Novo Tipo</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Tipos</p>
              <p className="text-2xl font-bold text-white">
                {droneTypes.length}
              </p>
            </div>
            <div className="text-blue-400 text-2xl">🚁</div>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Drones</p>
              <p className="text-2xl font-bold text-green-400">
                {drones.length}
              </p>
            </div>
            <div className="text-green-400 text-2xl">✅</div>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Drones Ativos</p>
              <p className="text-2xl font-bold text-yellow-400">
                {drones.filter((d) => d.status !== "idle").length}
              </p>
            </div>
            <BoltIcon className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Eficiência Média</p>
              <p className="text-2xl font-bold text-purple-400">
                {droneTypes.length > 0
                  ? Math.round(
                      droneTypes.reduce((acc, type) => {
                        const stats = getDroneTypeStats(type.id);
                        return acc + stats.efficiency;
                      }, 0) / droneTypes.length
                    )
                  : 0}
                %
              </p>
            </div>
            <CogIcon className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Drone Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {droneTypes.map((type) => {
          const stats = getDroneTypeStats(type.id);
          return (
            <div
              key={type.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  {type.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(type)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Editar tipo"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Excluir tipo"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4">{type.description}</p>

              {/* Specifications */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Capacidade:</span>
                  <span className="text-white font-medium">
                    {type.capacity} kg
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Autonomia:</span>
                  <span className="text-white font-medium">
                    {type.battery_range || type.batteryRange} km
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Velocidade:</span>
                  <span className="text-white font-medium">
                    {type.max_speed || type.maxSpeed} km/h
                  </span>
                </div>
              </div>

              {/* Statistics */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Estatísticas
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white ml-2 font-medium">
                      {stats.totalDrones}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Ativos:</span>
                    <span className="text-green-400 ml-2 font-medium">
                      {stats.activeDrones}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Entregas:</span>
                    <span className="text-blue-400 ml-2 font-medium">
                      {stats.totalDeliveries} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Bateria:</span>
                    <span className="text-yellow-400 ml-2 font-medium">
                      {stats.avgBattery}%
                    </span>
                  </div>
                </div>

                {/* Efficiency Bar */}
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-xs">Eficiência</span>
                    <span className="text-white text-xs font-medium">
                      {stats.efficiency}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stats.efficiency >= 80
                          ? "bg-green-500"
                          : stats.efficiency >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${stats.efficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingType ? "Editar Tipo de Drone" : "Novo Tipo de Drone"}
              </h3>
              <button
                onClick={handleCancel}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Tipo
                </label>
                <input
                  type="text"
                  value={newDroneType.name}
                  onChange={(e) =>
                    setNewDroneType({ ...newDroneType, name: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Autonomia (km)
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {editingType ? "Atualizar Tipo" : "Criar Tipo"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DroneTypes;
