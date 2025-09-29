"use client";

import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

// DroneType structure for reference
// { id: string, name: string, capacity: number, batteryRange: number, maxSpeed: number, description: string }

// Drone structure for reference
// { id: string, x: number, y: number, status: string, battery: number, capacity: number, currentLoad: number, serialNumber: string, typeId: string }

// Order structure for reference
// { id: string, x: number, y: number, weight: number, priority: string, status: string, createdAt: Date, droneId?: string }

// NoFlyZone structure for reference
// { id: string, points: Array<{x: number, y: number}> }

// SystemConfig structure for reference
// { optimizationEnabled: boolean, optimizationMethod: string }

// Context type structure for reference
// Contains drones, orders, noFlyZones, config, droneTypes, stats and various functions

const DroneContext = createContext(null);

export const DroneProvider = ({ children }) => {
  const [droneTypes, setDroneTypes] = useState([]);
  const [drones, setDrones] = useState([]);
  const [orders, setOrders] = useState([]);
  const [noFlyZones, setNoFlyZones] = useState([]);
  const [config, setConfig] = useState({
    optimizationEnabled: true,
    optimizationMethod: "priority-distance-weight",
    deliveryPriority: "priority",
  });
  const [stats, setStats] = useState({
    overview: {
      totalDrones: 0,
      activeDrones: 0,
      idleDrones: 0,
      totalOrders: 0,
      pendingOrders: 0,
      allocatedOrders: 0,
      deliveredOrders: 0,
      highPriorityOrders: 0,
    },
    performance: {
      systemEfficiency: 0,
      droneUtilization: 0,
      orderProcessing: 0,
      batteryHealth: 0,
      activeDroneRate: 0,
      deliveryRate: 0,
      avgDeliveryTime: 0,
      capacityUtilization: 0,
      totalCapacity: 0,
      usedCapacity: 0,
    },
    recent: {
      ordersLast24h: 0,
      ordersLastWeek: 0,
      avgBattery: 0,
      totalWeight: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Polling automático para drones em movimento
  useEffect(() => {
    const interval = setInterval(async () => {
      // Verificar se há drones voando ou retornando
      const activeDrones = drones.filter(
        (drone) => drone.status === "flying" || drone.status === "returning"
      );

      if (activeDrones.length > 0) {
        console.log(`🔄 Atualizando ${activeDrones.length} drones ativos...`);
        try {
          await refreshDrones();
          await refreshOrders();
        } catch (error) {
          console.error("Erro ao atualizar drones ativos:", error);
        }
      }
    }, 3000); // Atualizar a cada 3 segundos

    return () => clearInterval(interval);
  }, [drones]); // Dependência dos drones para recalcular quando mudarem

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        droneTypesResponse,
        dronesResponse,
        ordersResponse,
        noFlyZonesResponse,
        configResponse,
        statsResponse,
      ] = await Promise.all([
        api.getDroneTypes(),
        api.getDrones(),
        api.getOrders(),
        api.getNoFlyZones(),
        api.getConfig(),
        api.getDashboardData(),
      ]);

      setDroneTypes(droneTypesResponse.data || []);
      setDrones(dronesResponse.data || []);
      setOrders(ordersResponse.data || []);
      setNoFlyZones(noFlyZonesResponse.data || []);
      setConfig(configResponse.data || config);
      setStats(statsResponse.data || stats);

      // Garantir que todos os drones IDLE estejam na posição correta
      // Removido o timeout automático para evitar resetar a carga dos drones
      // setTimeout(async () => {
      //   await ensureIdleDronesAreAtBase();
      // }, 1000);
    } catch (err) {
      console.error("Error loading initial data:", err);
      setError(err.message);
      // Fallback to empty arrays if API fails
      setDroneTypes([]);
      setDrones([]);
      setOrders([]);
      setNoFlyZones([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      console.log("🔄 Refreshing stats...");
      const statsResponse = await api.getDashboardData();
      console.log("📊 New stats received:", statsResponse.data);
      setStats(statsResponse.data || stats);
      console.log("✅ Stats updated successfully");
    } catch (err) {
      console.error("❌ Error refreshing stats:", err);
    }
  };

  const refreshDrones = async () => {
    try {
      console.log("🔄 Refreshing drones...");
      const response = await api.getDrones();
      setDrones(response.data);
      console.log("✅ Drones refreshed successfully");
    } catch (err) {
      console.error("❌ Error refreshing drones:", err);
    }
  };

  const refreshOrders = async () => {
    try {
      console.log("🔄 Refreshing orders...");
      const response = await api.getOrders();
      setOrders(response.data);
      console.log("✅ Orders refreshed successfully");
    } catch (err) {
      console.error("❌ Error refreshing orders:", err);
    }
  };

  const addOrder = async (orderData) => {
    try {
      // Verificar se existe algum tipo de drone que pode carregar o peso
      if (droneTypes.length === 0) {
        return {
          success: false,
          error: "Não há tipos de drones cadastrados no sistema",
        };
      }

      // Verificar se há algum tipo de drone capaz de carregar o peso
      const capableDroneTypes = droneTypes.filter(
        (type) => type.capacity >= orderData.weight
      );

      if (capableDroneTypes.length === 0) {
        const maxCapacity = Math.max(
          ...droneTypes.map((type) => type.capacity || 0)
        );
        return {
          success: false,
          error: `Peso máximo suportado pelos tipos de drones é ${maxCapacity}kg. Peso solicitado: ${orderData.weight}kg`,
        };
      }

      // Criar o pedido sempre que houver capacidade suficiente
      const response = await api.createOrder({
        ...orderData,
        status: "pending",
      });
      setOrders((prev) => [...prev, response.data]);

      // Recarregar estatísticas para atualizar eficiência
      await refreshStats();

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating order:", error);
      return { success: false, error: error.message };
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      const response = await api.updateConfig(newConfig);
      setConfig(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating config:", error);
      return { success: false, error: error.message };
    }
  };

  const addNoFlyZone = async (zoneData) => {
    // Criar uma zona temporária com ID único para atualização imediata
    const tempZone = {
      id: `temp-${Date.now()}`,
      name: zoneData.name || `No-Fly Zone ${Date.now()}`,
      description: zoneData.description || "",
      points: zoneData.points || [],
    };

    try {
      // Atualizar o estado local imediatamente
      setNoFlyZones((prev) => [...prev, tempZone]);

      // Fazer a chamada para a API em background
      const response = await api.createNoFlyZone(zoneData);

      // Substituir a zona temporária pela zona real da API
      setNoFlyZones((prev) => {
        return prev.map((zone) => {
          if (zone.id === tempZone.id) {
            // Garantir que a zona da API tenha a estrutura correta
            return {
              id: response.data.id,
              name: response.data.name,
              description: response.data.description || "",
              points: response.data.points || [],
            };
          }
          return zone;
        });
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating no-fly zone:", error);

      // Remover a zona temporária em caso de erro
      setNoFlyZones((prev) => prev.filter((zone) => zone.id !== tempZone.id));

      return { success: false, error: error.message };
    }
  };

  const removeNoFlyZone = async (id) => {
    try {
      // Armazenar a zona que será removida para possível rollback
      const zoneToRemove = noFlyZones.find((zone) => zone.id === id);

      // Remover imediatamente do estado local
      setNoFlyZones((prev) => prev.filter((zone) => zone.id !== id));

      // Fazer a chamada para a API em background
      await api.deleteNoFlyZone(id);

      return { success: true };
    } catch (error) {
      console.error("Error deleting no-fly zone:", error);

      // Em caso de erro, restaurar a zona (se ainda existir)
      const zoneToRemove = noFlyZones.find((zone) => zone.id === id);
      if (zoneToRemove) {
        setNoFlyZones((prev) => [...prev, zoneToRemove]);
      }

      return { success: false, error: error.message };
    }
  };

  const addDrone = async (droneData) => {
    try {
      const response = await api.createDrone({
        ...droneData,
        x: droneData.x || 25,
        y: droneData.y || 25,
      });
      setDrones((prev) => [...prev, response.data]);

      // Recarregar estatísticas para atualizar eficiência
      await refreshStats();

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating drone:", error);
      return { success: false, error: error.message };
    }
  };

  const updateDrone = async (id, updates) => {
    try {
      const response = await api.updateDrone(id, updates);
      setDrones((prev) =>
        prev.map((drone) => (drone.id === id ? response.data : drone))
      );

      // Recarregar estatísticas para atualizar eficiência
      await refreshStats();

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating drone:", error);
      return { success: false, error: error.message };
    }
  };

  const addDroneType = async (typeData) => {
    try {
      const response = await api.createDroneType(typeData);
      setDroneTypes((prev) => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating drone type:", error);
      return { success: false, error: error.message };
    }
  };

  const allocateOrderToDrone = async (orderId, droneId) => {
    try {
      // Buscar o pedido e o drone para validação local
      const order = orders.find((o) => o.id === orderId);
      const drone = drones.find((d) => d.id === droneId);

      if (!order) {
        return {
          success: false,
          message: "Pedido não encontrado",
        };
      }

      if (!drone) {
        return {
          success: false,
          message: "Drone não encontrado",
        };
      }

      // Verificar se o drone pode carregar o peso
      const newLoad = (drone.currentLoad || 0) + order.weight;
      if (newLoad > drone.capacity) {
        return {
          success: false,
          message: `Capacidade excedida! O drone suporta ${
            drone.capacity
          }kg, mas tentando carregar ${newLoad}kg. Peso atual: ${
            drone.currentLoad || 0
          }kg, Peso do pedido: ${order.weight}kg.`,
        };
      }

      const response = await api.allocateOrderToDrone(droneId, orderId);

      if (response.success) {
        // Atualizar estado local
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, droneId: droneId, status: "allocated" }
              : o
          )
        );

        // Atualizar carga do drone localmente
        setDrones((prev) =>
          prev.map((d) =>
            d.id === droneId
              ? { ...d, currentLoad: newLoad, status: "loading" }
              : d
          )
        );

        // Recarregar estatísticas para atualizar eficiência
        await refreshStats();
      }

      return response;
    } catch (error) {
      console.error("Error allocating order to drone:", error);
      return { success: false, message: error.message };
    }
  };

  const removeOrderFromDrone = async (orderId, droneId = null) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        return {
          success: false,
          message: "Pedido não encontrado",
        };
      }

      // Se droneId não foi fornecido, usar o droneId do pedido
      const targetDroneId = droneId || order.droneId;
      if (!targetDroneId) {
        return {
          success: false,
          message: "Pedido não está alocado a nenhum drone",
        };
      }

      // Buscar o drone para calcular a nova carga
      const drone = drones.find((d) => d.id === targetDroneId);
      if (!drone) {
        return {
          success: false,
          message: "Drone não encontrado",
        };
      }

      console.log(
        `🔍 DEBUG - Context calling API with droneId: ${targetDroneId}, orderId: ${orderId}`
      );
      const response = await api.removeOrderFromDrone(targetDroneId, orderId);
      console.log(`🔍 DEBUG - Context API response:`, response);

      if (response && response.success) {
        // Atualizar estado local
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, droneId: null, status: "pending" } : o
          )
        );

        // Atualizar carga do drone localmente
        const newLoad = Math.max(0, drone.currentLoad - order.weight);
        setDrones((prev) =>
          prev.map((d) =>
            d.id === targetDroneId
              ? {
                  ...d,
                  currentLoad: newLoad,
                  status: newLoad === 0 ? "idle" : "loading",
                  x: newLoad === 0 ? 25.0 : d.x,
                  y: newLoad === 0 ? 25.0 : d.y,
                  battery: newLoad === 0 ? 100.0 : d.battery,
                }
              : d
          )
        );

        // Recarregar estatísticas para atualizar eficiência
        await refreshStats();
      }

      return response;
    } catch (error) {
      console.error("Error removing order from drone:", error);
      return { success: false, message: error.message };
    }
  };

  const getDroneOrders = async (droneId) => {
    try {
      const response = await api.getDroneOrders(droneId);
      return response.data || [];
    } catch (error) {
      console.error("Error getting drone orders:", error);
      return [];
    }
  };

  const updateDroneStatus = async (droneId, newStatus) => {
    try {
      const response = await api.updateDroneStatus(droneId, newStatus);
      setDrones((prev) =>
        prev.map((drone) => (drone.id === droneId ? response.data : drone))
      );

      // Recarregar estatísticas para atualizar eficiência
      await refreshStats();

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating drone status:", error);
      return { success: false, error: error.message };
    }
  };

  // Função para garantir que todos os drones IDLE estejam na posição (25,25) e com 100% de bateria
  const ensureIdleDronesAreAtBase = async () => {
    try {
      const response = await api.ensureIdleDronesAreAtBase();

      if (response.success) {
        // Recarregar dados dos drones
        const dronesResponse = await api.getDrones();
        setDrones(dronesResponse.data || []);
        await refreshStats();
      }

      return response;
    } catch (error) {
      console.error("Error ensuring idle drones are at base:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteDrone = async (droneId) => {
    try {
      // Primeiro, desalocar todos os pedidos do drone
      const droneOrders = orders.filter((order) => order.droneId === droneId);

      // Desalocar cada pedido individualmente
      for (const order of droneOrders) {
        try {
          await api.removeOrderFromDrone(droneId, order.id);
        } catch (error) {
          console.warn(
            `Failed to remove order ${order.id} from drone ${droneId}:`,
            error
          );
        }
      }

      // Depois deletar o drone
      await api.deleteDrone(droneId);
      setDrones((prev) => prev.filter((drone) => drone.id !== droneId));

      // Atualizar pedidos para status pending
      setOrders((prev) =>
        prev.map((order) =>
          order.droneId === droneId
            ? { ...order, droneId: null, status: "pending" }
            : order
        )
      );

      // Recarregar estatísticas para atualizar eficiência
      await refreshStats();

      return { success: true };
    } catch (error) {
      console.error("Error deleting drone:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await api.deleteOrder(orderId);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting order:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteDroneType = async (typeId) => {
    try {
      const response = await api.deleteDroneType(typeId);
      if (response.success) {
        setDroneTypes((prev) => prev.filter((type) => type.id !== typeId));
      }
      return response;
    } catch (error) {
      console.error("Error deleting drone type:", error);
      return { success: false, error: error.message };
    }
  };

  const updateDroneType = async (typeId, updates) => {
    try {
      const response = await api.updateDroneType(typeId, updates);
      setDroneTypes((prev) =>
        prev.map((type) => (type.id === typeId ? response.data : type))
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating drone type:", error);
      return { success: false, error: error.message };
    }
  };

  // Calcular distância entre dois pontos
  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Calcular tempo de entrega baseado na distância e velocidade do drone
  const calculateDeliveryTime = (drone, order) => {
    const distance = calculateDistance(drone.x, drone.y, order.x, order.y);
    const droneType = droneTypes.find((type) => type.id === drone.typeId);
    const speed = droneType?.maxSpeed || 30; // velocidade padrão se não encontrar o tipo ou se for 0

    // Verificar se a velocidade é válida
    if (!speed || speed <= 0) {
      console.warn(`Velocidade inválida para drone ${drone.id}: ${speed}`);
      return 0; // Retornar 0 se a velocidade for inválida
    }

    return distance / speed; // tempo em horas
  };

  // Calcular ordem de entrega baseada na prioridade configurada
  const calculateDeliveryOrder = (droneOrders, priorityMethod = "priority") => {
    const centralX = 25;
    const centralY = 25;

    return droneOrders.sort((a, b) => {
      switch (priorityMethod) {
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];

        case "distance":
          const distanceA = calculateDistance(centralX, centralY, a.x, a.y);
          const distanceB = calculateDistance(centralX, centralY, b.x, b.y);
          return distanceA - distanceB;

        case "first-come-first-served":
          return (
            new Date(a.created_at || a.createdAt) -
            new Date(b.created_at || b.createdAt)
          );

        default:
          return 0;
      }
    });
  };

  // Algoritmo de pathfinding que evita zonas de exclusão
  const calculateDeliveryRoute = (startX, startY, endX, endY, noFlyZones) => {
    const GRID_SIZE = 50;
    const path = [];

    // Função para verificar se uma posição está em uma zona de exclusão
    const isInNoFlyZone = (x, y) => {
      return noFlyZones.some((zone) => {
        // Usar as informações de área se disponíveis
        if (
          zone.minX !== undefined &&
          zone.maxX !== undefined &&
          zone.minY !== undefined &&
          zone.maxY !== undefined
        ) {
          return (
            x >= zone.minX && x <= zone.maxX && y >= zone.minY && y <= zone.maxY
          );
        }

        // Fallback para o método antigo
        const minX = Math.min(...zone.points.map((p) => p.x));
        const maxX = Math.max(...zone.points.map((p) => p.x));
        const minY = Math.min(...zone.points.map((p) => p.y));
        const maxY = Math.max(...zone.points.map((p) => p.y));
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
      });
    };

    // Algoritmo A* simplificado
    const getNeighbors = (x, y) => {
      const neighbors = [];
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1], // Cardinal
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1], // Diagonal
      ];

      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
          if (!isInNoFlyZone(newX, newY)) {
            neighbors.push({ x: newX, y: newY });
          }
        }
      }

      return neighbors;
    };

    // Se não há zonas de exclusão, usar rota direta
    if (noFlyZones.length === 0) {
      const dx = endX - startX;
      const dy = endY - startY;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));

      for (let i = 0; i <= steps; i++) {
        const x = Math.round(startX + (dx * i) / steps);
        const y = Math.round(startY + (dy * i) / steps);
        path.push({ x, y });
      }
      return path;
    }

    // Implementação simplificada do A*
    const openSet = [{ x: startX, y: startY, g: 0, h: 0, f: 0, parent: null }];
    const closedSet = new Set();
    const cameFrom = new Map();

    while (openSet.length > 0) {
      // Encontrar nó com menor f
      let current = openSet[0];
      let currentIndex = 0;

      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < current.f) {
          current = openSet[i];
          currentIndex = i;
        }
      }

      openSet.splice(currentIndex, 1);
      closedSet.add(`${current.x},${current.y}`);

      // Se chegou ao destino
      if (current.x === endX && current.y === endY) {
        const path = [];
        let node = current;
        while (node) {
          path.unshift({ x: node.x, y: node.y });
          node = cameFrom.get(`${node.x},${node.y}`);
        }
        return path;
      }

      // Explorar vizinhos
      const neighbors = getNeighbors(current.x, current.y);

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;

        if (closedSet.has(key)) continue;

        const tentativeG = current.g + 1;
        const h = Math.abs(neighbor.x - endX) + Math.abs(neighbor.y - endY);
        const f = tentativeG + h;

        const existingNode = openSet.find(
          (n) => n.x === neighbor.x && n.y === neighbor.y
        );

        if (!existingNode) {
          openSet.push({
            x: neighbor.x,
            y: neighbor.y,
            g: tentativeG,
            h: h,
            f: f,
            parent: current,
          });
          cameFrom.set(key, current);
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.f = f;
          existingNode.parent = current;
          cameFrom.set(key, current);
        }
      }
    }

    // Se não encontrou caminho, retornar rota direta
    const dx = endX - startX;
    const dy = endY - startY;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    for (let i = 0; i <= steps; i++) {
      const x = Math.round(startX + (dx * i) / steps);
      const y = Math.round(startY + (dy * i) / steps);
      path.push({ x, y });
    }

    return path;
  };

  return (
    <DroneContext.Provider
      value={{
        drones,
        orders,
        noFlyZones,
        config,
        droneTypes,
        stats,
        loading,
        error,
        addOrder,
        updateConfig,
        addNoFlyZone,
        removeNoFlyZone,
        addDrone,
        updateDrone,
        addDroneType,
        allocateOrderToDrone,
        removeOrderFromDrone,
        getDroneOrders,
        updateDroneStatus,
        calculateDeliveryRoute,
        calculateDistance,
        calculateDeliveryTime,
        calculateDeliveryOrder,
        deleteDrone,
        deleteOrder,
        deleteDroneType,
        updateDroneType,
        loadInitialData,
        refreshStats,
        refreshDrones,
        refreshOrders,
        ensureIdleDronesAreAtBase,
      }}
    >
      {children}
    </DroneContext.Provider>
  );
};

export const useDroneContext = () => {
  const context = useContext(DroneContext);
  if (!context) {
    throw new Error("useDroneContext must be used within a DroneProvider");
  }
  return context;
};
