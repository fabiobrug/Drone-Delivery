import { DroneModel } from "../models/DroneModel.js";
import { OrderModel } from "../models/OrderModel.js";
import { NoFlyZoneService } from "./NoFlyZoneService.js";
import { calculateAStarPath, calculateDistance } from "../utils/helpers.js";

export class RoutingService {
  constructor() {
    this.droneModel = new DroneModel();
    this.orderModel = new OrderModel();
    this.noFlyZoneService = new NoFlyZoneService();
  }

  async calculateRoute(startX, startY, endX, endY) {
    // Validar coordenadas
    if (
      startX < 0 ||
      startX > 50 ||
      startY < 0 ||
      startY > 50 ||
      endX < 0 ||
      endX > 50 ||
      endY < 0 ||
      endY > 50
    ) {
      throw new Error("Coordinates must be between 0 and 50");
    }

    // Obter zonas de exclusão
    const noFlyZones = await this.noFlyZoneService.getAllZonesForPathfinding();

    // Calcular rota usando A*
    const path = calculateAStarPath(startX, startY, endX, endY, noFlyZones);

    // Calcular distância total
    const totalDistance = this.calculatePathDistance(path);

    return {
      path,
      totalDistance,
      waypoints: path.length,
      avoidsNoFlyZones: true,
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
    };
  }

  // Calcular tempo de entrega baseado na velocidade do drone e distância
  async calculateDeliveryTime(droneId, orderId, orderData = null) {
    const drone = await this.droneModel.findById(droneId);
    if (!drone) {
      throw new Error("Drone not found");
    }

    let order;
    if (orderData) {
      // Usar dados do pedido fornecidos (para testes ou pedidos simulados)
      order = orderData;
    } else {
      // Buscar pedido no banco de dados
      order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }
    }

    // Calcular rota do drone para o pedido
    const route = await this.calculateRoute(drone.x, drone.y, order.x, order.y);

    // Obter velocidade máxima do drone (em km/h)
    const maxSpeed = drone.droneType?.maxSpeed || 30; // Velocidade padrão se não especificada

    // Verificar se a velocidade é válida
    if (!maxSpeed || maxSpeed <= 0) {
      console.warn(`Velocidade inválida para drone ${droneId}: ${maxSpeed}`);
      return {
        droneId,
        orderId,
        distance: route.totalDistance,
        maxSpeed: 30, // Usar velocidade padrão
        timeInHours: 0,
        timeInMinutes: 0,
        timeFormatted: "N/A",
        route: route.path,
        waypoints: route.waypoints,
        error: "Velocidade do drone não definida",
      };
    }

    // Calcular tempo em horas
    const distanceInKm = route.totalDistance / 1000; // Converter metros para km
    const timeInHours = distanceInKm / maxSpeed;

    // Converter para minutos e segundos
    const totalMinutes = Math.floor(timeInHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = Math.floor((timeInHours * 3600) % 60);

    return {
      droneId,
      orderId,
      distance: route.totalDistance,
      maxSpeed,
      timeInHours: Math.round(timeInHours * 100) / 100,
      timeInMinutes: totalMinutes,
      timeFormatted: `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`,
      route: route.path,
      waypoints: route.waypoints,
    };
  }

  // Calcular tempo de entrega para todos os pedidos de um drone
  async calculateDroneDeliveryTimes(droneId) {
    const drone = await this.droneModel.findById(droneId);
    if (!drone) {
      throw new Error("Drone not found");
    }

    const orders = await this.orderModel.findByDroneId(droneId);
    const deliveryTimes = [];

    for (const order of orders) {
      try {
        const deliveryTime = await this.calculateDeliveryTime(
          droneId,
          order.id
        );
        deliveryTimes.push(deliveryTime);
      } catch (error) {
        console.error(
          `Error calculating delivery time for order ${order.id}:`,
          error
        );
        deliveryTimes.push({
          droneId,
          orderId: order.id,
          error: error.message,
        });
      }
    }

    return deliveryTimes;
  }

  async calculateDroneRoute(droneId) {
    const drone = await this.droneModel.findById(droneId);
    if (!drone) {
      throw new Error("Drone not found");
    }

    // Se o drone não tem destino, retornar rota vazia
    if (!drone.targetX || !drone.targetY) {
      return {
        path: [],
        totalDistance: 0,
        waypoints: 0,
        avoidsNoFlyZones: true,
        start: { x: drone.x, y: drone.y },
        end: null,
      };
    }

    // Calcular rota do drone para o destino
    return await this.calculateRoute(
      drone.x,
      drone.y,
      drone.targetX,
      drone.targetY
    );
  }

  async optimizeRoutes(
    droneIds,
    optimizationMethod = "priority-distance-weight"
  ) {
    const drones = [];
    const orders = [];

    // Obter dados dos drones e pedidos
    for (const droneId of droneIds) {
      const drone = await this.droneModel.findById(droneId);
      if (drone) {
        drones.push(drone);
        const droneOrders = await this.orderModel.findByDroneId(droneId);
        orders.push(...droneOrders);
      }
    }

    if (drones.length === 0) {
      throw new Error("No valid drones found");
    }

    // Implementar algoritmo de otimização baseado no método
    switch (optimizationMethod) {
      case "priority-only":
        return this.optimizeByPriority(drones, orders);
      case "distance-only":
        return this.optimizeByDistance(drones, orders);
      case "priority-distance-weight":
      default:
        return this.optimizeByPriorityDistanceWeight(drones, orders);
    }
  }

  async getAvoidZones() {
    return await this.noFlyZoneService.getAllZonesForPathfinding();
  }

  async checkRouteAvoidsZones(route) {
    if (!Array.isArray(route) || route.length < 2) {
      throw new Error("Invalid route format");
    }

    const noFlyZones = await this.noFlyZoneService.getAllZonesForPathfinding();
    const violations = [];

    for (let i = 0; i < route.length - 1; i++) {
      const point = route[i];
      const isInZone = await this.noFlyZoneService.checkPointInNoFlyZone(
        point.x,
        point.y
      );
      if (isInZone) {
        violations.push({
          point: { x: point.x, y: point.y },
          index: i,
        });
      }
    }

    return {
      avoidsZones: violations.length === 0,
      violations,
      totalViolations: violations.length,
    };
  }

  async getDroneWaypoints(droneId) {
    const route = await this.calculateDroneRoute(droneId);
    return {
      waypoints: route.path,
      totalDistance: route.totalDistance,
      currentPosition: route.start,
      targetPosition: route.end,
    };
  }

  async updateDroneWaypoints(droneId, waypoints) {
    const drone = await this.droneModel.findById(droneId);
    if (!drone) {
      throw new Error("Drone not found");
    }

    if (!Array.isArray(waypoints) || waypoints.length < 2) {
      throw new Error("Invalid waypoints format");
    }

    // Validar waypoints
    for (const waypoint of waypoints) {
      if (
        typeof waypoint.x !== "number" ||
        typeof waypoint.y !== "number" ||
        waypoint.x < 0 ||
        waypoint.x > 50 ||
        waypoint.y < 0 ||
        waypoint.y > 50
      ) {
        throw new Error("Invalid waypoint coordinates");
      }
    }

    // Atualizar posição do drone para o primeiro waypoint
    const firstWaypoint = waypoints[0];
    await this.droneModel.update(droneId, {
      x: firstWaypoint.x,
      y: firstWaypoint.y,
    });

    return {
      success: true,
      message: "Waypoints updated successfully",
      waypoints,
    };
  }

  calculatePathDistance(path) {
    if (path.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      totalDistance += calculateDistance(
        path[i].x,
        path[i].y,
        path[i + 1].x,
        path[i + 1].y
      );
    }
    return Math.round(totalDistance * 100) / 100; // Arredondar para 2 casas decimais
  }

  optimizeByPriority(drones, orders) {
    // Ordenar pedidos por prioridade
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const sortedOrders = orders.sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    return {
      method: "priority-only",
      optimizedRoutes: sortedOrders.map((order) => ({
        orderId: order.id,
        priority: order.priority,
        weight: order.weight,
        coordinates: { x: order.x, y: order.y },
      })),
    };
  }

  optimizeByDistance(drones, orders) {
    // Ordenar pedidos por distância da base (25, 25)
    const baseX = 25;
    const baseY = 25;

    const sortedOrders = orders.sort((a, b) => {
      const distA = calculateDistance(baseX, baseY, a.x, a.y);
      const distB = calculateDistance(baseX, baseY, b.x, b.y);
      return distA - distB;
    });

    return {
      method: "distance-only",
      optimizedRoutes: sortedOrders.map((order) => ({
        orderId: order.id,
        distance: calculateDistance(baseX, baseY, order.x, order.y),
        weight: order.weight,
        coordinates: { x: order.x, y: order.y },
      })),
    };
  }

  optimizeByPriorityDistanceWeight(drones, orders) {
    const baseX = 25;
    const baseY = 25;
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    // Calcular score para cada pedido
    const scoredOrders = orders.map((order) => {
      const distance = calculateDistance(baseX, baseY, order.x, order.y);
      const priority = priorityWeight[order.priority];
      const weight = order.weight;

      // Score = (priority * 100) - (distance * 0.1) - (weight * 0.5)
      const score = priority * 100 - distance * 0.1 - weight * 0.5;

      return {
        ...order,
        score,
        distance,
      };
    });

    // Ordenar por score (maior primeiro)
    const sortedOrders = scoredOrders.sort((a, b) => b.score - a.score);

    return {
      method: "priority-distance-weight",
      optimizedRoutes: sortedOrders.map((order) => ({
        orderId: order.id,
        score: order.score,
        priority: order.priority,
        distance: order.distance,
        weight: order.weight,
        coordinates: { x: order.x, y: order.y },
      })),
    };
  }
}
