"use client";

import React from "react";
import { createContext, useContext, useState } from "react";

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
  const [droneTypes, setDroneTypes] = useState([
    {
      id: "type-001",
      name: "Cargo Standard",
      capacity: 5,
      batteryRange: 50,
      maxSpeed: 30,
      description: "Drone padrão para entregas urbanas",
    },
    {
      id: "type-002",
      name: "Heavy Lift",
      capacity: 10,
      batteryRange: 40,
      maxSpeed: 25,
      description: "Drone para cargas pesadas",
    },
  ]);

  const [drones, setDrones] = useState([
    {
      id: "drone-001",
      x: 25,
      y: 25,
      status: "idle",
      battery: 85,
      capacity: 5,
      currentLoad: 0,
      serialNumber: "DRN-001",
      typeId: "type-001",
      targetX: null,
      targetY: null,
    },
    {
      id: "drone-002",
      x: 5,
      y: 5,
      status: "flying",
      battery: 72,
      capacity: 5,
      currentLoad: 2.5,
      serialNumber: "DRN-002",
      typeId: "type-001",
      targetX: 12,
      targetY: 8,
    },
    {
      id: "drone-003",
      x: 25,
      y: 25,
      status: "loading",
      battery: 95,
      capacity: 10,
      currentLoad: 0,
      serialNumber: "DRN-003",
      typeId: "type-002",
      targetX: null,
      targetY: null,
    },
  ]);

  const [orders, setOrders] = useState([
    {
      id: "order-001",
      x: 12,
      y: 8,
      weight: 2.5,
      priority: "high",
      status: "in-route",
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "order-002",
      x: 18,
      y: 15,
      weight: 1.2,
      priority: "medium",
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: "order-003",
      x: 7,
      y: 20,
      weight: 3.8,
      priority: "low",
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
  ]);

  const [noFlyZones, setNoFlyZones] = useState([
    {
      id: "nfz-001",
      points: [
        { x: 10, y: 10 },
        { x: 15, y: 10 },
        { x: 15, y: 15 },
        { x: 10, y: 15 },
      ],
    },
  ]);

  const [config, setConfig] = useState({
    optimizationEnabled: true,
    optimizationMethod: "priority-distance-weight",
  });

  const stats = {
    activeDrones: drones.filter((d) => d.status !== "idle").length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    averageDeliveryTime: 25.5,
  };

  const addOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: `order-${Date.now()}`,
      createdAt: new Date(),
    };
    setOrders((prev) => [...prev, newOrder]);
  };

  const updateConfig = (newConfig) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const addNoFlyZone = (zoneData) => {
    const newZone = {
      ...zoneData,
      id: `nfz-${Date.now()}`,
    };
    setNoFlyZones((prev) => [...prev, newZone]);
  };

  const removeNoFlyZone = (id) => {
    setNoFlyZones((prev) => prev.filter((zone) => zone.id !== id));
  };

  const addDrone = (droneData) => {
    const droneType = droneTypes.find((t) => t.id === droneData.typeId);
    const newDrone = {
      ...droneData,
      id: `drone-${Date.now()}`,
      status: "idle",
      battery: 100,
      currentLoad: 0,
      capacity: droneType?.capacity || 5,
      targetX: null,
      targetY: null,
      // Se não especificou posição, usar (25,25) para drones idle
      x: droneData.x || 25,
      y: droneData.y || 25,
    };
    setDrones((prev) => [...prev, newDrone]);
  };

  const updateDrone = (id, updates) => {
    setDrones((prev) =>
      prev.map((drone) => (drone.id === id ? { ...drone, ...updates } : drone))
    );
  };

  const addDroneType = (typeData) => {
    const newType = {
      ...typeData,
      id: `type-${Date.now()}`,
    };
    setDroneTypes((prev) => [...prev, newType]);
  };

  const allocateOrderToDrone = (orderId, droneId) => {
    const order = orders.find((o) => o.id === orderId);
    const drone = drones.find((d) => d.id === droneId);

    if (!order || !drone) {
      return { success: false, message: "Pedido ou drone não encontrado" };
    }

    // Verificar se o drone está disponível (idle ou loading)
    if (drone.status !== "idle" && drone.status !== "loading") {
      return {
        success: false,
        message: "Drone não está disponível para novos pedidos",
      };
    }

    // Verificar capacidade
    const currentLoad = drone.currentLoad;
    const newLoad = currentLoad + order.weight;

    if (newLoad > drone.capacity) {
      return {
        success: false,
        message: `Capacidade excedida! Drone suporta ${drone.capacity}kg, mas tentativa de carregar ${newLoad}kg. Aguarde o drone retornar à base.`,
      };
    }

    // Alocar o pedido ao drone
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, droneId: droneId, status: "allocated" } : o
      )
    );

    // Atualizar carga do drone e definir destino
    setDrones((prev) =>
      prev.map((d) =>
        d.id === droneId
          ? {
              ...d,
              currentLoad: newLoad,
              status: "loading",
              targetX: order.x,
              targetY: order.y,
            }
          : d
      )
    );

    return { success: true, message: "Pedido alocado com sucesso!" };
  };

  const removeOrderFromDrone = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || !order.droneId) return;

    const drone = drones.find((d) => d.id === order.droneId);
    if (!drone) return;

    // Remover pedido do drone
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, droneId: null, status: "pending" } : o
      )
    );

    // Atualizar carga do drone
    const newLoad = Math.max(0, drone.currentLoad - order.weight);
    setDrones((prev) =>
      prev.map((d) =>
        d.id === order.droneId
          ? {
              ...d,
              currentLoad: newLoad,
              status: newLoad === 0 ? "idle" : "loading",
              targetX: newLoad === 0 ? null : d.targetX,
              targetY: newLoad === 0 ? null : d.targetY,
            }
          : d
      )
    );
  };

  const getDroneOrders = (droneId) => {
    return orders.filter((order) => order.droneId === droneId);
  };

  const updateDroneStatus = (droneId, newStatus) => {
    setDrones((prev) =>
      prev.map((drone) =>
        drone.id === droneId
          ? {
              ...drone,
              status: newStatus,
              // Se mudou para idle, posicionar em (25,25)
              x: newStatus === "idle" ? 25 : drone.x,
              y: newStatus === "idle" ? 25 : drone.y,
              // Limpar destino se voltou para idle
              targetX: newStatus === "idle" ? null : drone.targetX,
              targetY: newStatus === "idle" ? null : drone.targetY,
            }
          : drone
      )
    );
  };

  const deleteDrone = (droneId) => {
    // Remover pedidos alocados ao drone antes de excluí-lo
    setOrders((prev) =>
      prev.map((order) =>
        order.droneId === droneId
          ? { ...order, droneId: null, status: "pending" }
          : order
      )
    );

    // Remover o drone
    setDrones((prev) => prev.filter((drone) => drone.id !== droneId));
  };

  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  const deleteDroneType = (typeId) => {
    // Verificar se há drones usando este tipo
    const dronesUsingType = drones.filter((drone) => drone.typeId === typeId);
    if (dronesUsingType.length > 0) {
      return {
        success: false,
        message: `Não é possível excluir este tipo. Há ${dronesUsingType.length} drone(s) usando este tipo.`,
      };
    }

    // Remover o tipo de drone
    setDroneTypes((prev) => prev.filter((type) => type.id !== typeId));
    return { success: true, message: "Tipo de drone excluído com sucesso!" };
  };

  const updateDroneType = (typeId, updates) => {
    setDroneTypes((prev) =>
      prev.map((type) => (type.id === typeId ? { ...type, ...updates } : type))
    );
  };

  // Algoritmo de pathfinding que evita zonas de exclusão
  const calculateDeliveryRoute = (startX, startY, endX, endY, noFlyZones) => {
    const GRID_SIZE = 50;
    const path = [];

    // Função para verificar se uma posição está em uma zona de exclusão
    const isInNoFlyZone = (x, y) => {
      return noFlyZones.some((zone) => {
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
        deleteDrone,
        deleteOrder,
        deleteDroneType,
        updateDroneType,
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
