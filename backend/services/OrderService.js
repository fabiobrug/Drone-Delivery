import { OrderModel } from "../models/OrderModel.js";
import { DroneModel } from "../models/DroneModel.js";
import { generateId } from "../utils/helpers.js";

export class OrderService {
  constructor() {
    this.orderModel = new OrderModel();
    this.droneModel = new DroneModel();
  }

  async getAllOrders(filters = {}) {
    return await this.orderModel.findAll(filters);
  }

  async getOrderById(id) {
    return await this.orderModel.findById(id);
  }

  async createOrder(orderData) {
    const order = {
      id: generateId("order"),
      x: orderData.x,
      y: orderData.y,
      weight: orderData.weight,
      priority: orderData.priority || "medium",
      status: "pending",
    };

    return await this.orderModel.create(order);
  }

  async updateOrder(id, updateData) {
    const existingOrder = await this.orderModel.findById(id);
    if (!existingOrder) {
      throw new Error("Order not found");
    }

    return await this.orderModel.update(id, updateData);
  }

  async deleteOrder(id) {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    // Se o pedido está alocado a um drone, remover da carga do drone
    if (order.droneId) {
      const drone = await this.droneModel.findById(order.droneId);
      if (drone) {
        const newLoad = Math.max(0, drone.currentLoad - order.weight);
        await this.droneModel.update(order.droneId, {
          currentLoad: newLoad,
          status: newLoad === 0 ? "idle" : "loading",
          targetX: newLoad === 0 ? null : drone.targetX,
          targetY: newLoad === 0 ? null : drone.targetY,
        });
      }
    }

    return await this.orderModel.delete(id);
  }

  async updateOrderStatus(id, status) {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    return await this.orderModel.update(id, { status });
  }

  async getOrdersByStatus(status) {
    return await this.orderModel.findByStatus(status);
  }

  async getOrdersByDroneId(droneId) {
    return await this.orderModel.findByDroneId(droneId);
  }

  async allocateOrderToDrone(orderId, droneId) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const drone = await this.droneModel.findById(droneId);
    if (!drone) {
      throw new Error("Drone not found");
    }

    // Verificar se o drone está disponível
    if (drone.status !== "idle" && drone.status !== "loading") {
      throw new Error("Drone is not available for new orders");
    }

    // Verificar capacidade
    const newLoad = drone.currentLoad + order.weight;
    if (newLoad > drone.capacity) {
      throw new Error(
        `Capacity exceeded! Drone supports ${drone.capacity}kg, but trying to load ${newLoad}kg.`
      );
    }

    // Alocar o pedido ao drone
    await this.orderModel.update(orderId, {
      droneId: droneId,
      status: "allocated",
    });

    // Atualizar carga do drone
    await this.droneModel.update(droneId, {
      currentLoad: newLoad,
      status: "loading",
      targetX: order.x,
      targetY: order.y,
    });

    return { success: true, message: "Order allocated successfully!" };
  }

  async removeOrderFromDrone(orderId, droneId) {
    const order = await this.orderModel.findById(orderId);
    if (!order || order.droneId !== droneId) {
      throw new Error("Order not found or not allocated to this drone");
    }

    const drone = await this.droneModel.findById(droneId);
    if (!drone) {
      throw new Error("Drone not found");
    }

    // Verificar se o drone está em status adequado para desalocação
    if (drone.status !== "idle" && drone.status !== "loading") {
      throw new Error(
        "Drone must be in 'idle' or 'loading' status to remove orders"
      );
    }

    // Remover pedido do drone
    await this.orderModel.update(orderId, {
      droneId: null,
      status: "pending",
    });

    // Atualizar carga do drone
    const newLoad = Math.max(0, drone.currentLoad - order.weight);
    const updateData = {
      currentLoad: newLoad,
      status: newLoad === 0 ? "idle" : "loading",
    };

    if (newLoad === 0) {
      updateData.targetX = null;
      updateData.targetY = null;
    }

    await this.droneModel.update(droneId, updateData);

    return { success: true, message: "Order removed from drone successfully!" };
  }
}
