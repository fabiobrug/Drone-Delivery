import { DroneModel } from "../models/DroneModel.js";
import { OrderModel } from "../models/OrderModel.js";
import { DroneTypeModel } from "../models/DroneTypeModel.js";
import { generateId } from "../utils/helpers.js";

export class DroneService {
  constructor() {
    this.droneModel = new DroneModel();
    this.orderModel = new OrderModel();
    this.droneTypeModel = new DroneTypeModel();
  }

  async getAllDrones() {
    return await this.droneModel.findAll();
  }

  async getDroneById(id) {
    return await this.droneModel.findById(id);
  }

  async createDrone(droneData) {
    // Verificar se o tipo de drone existe
    const droneType = await this.droneTypeModel.findById(droneData.typeId);
    if (!droneType) {
      throw new Error("Drone type not found");
    }

    // Verificar se o serial number já existe
    const existingDrone = await this.droneModel.findBySerialNumber(
      droneData.serialNumber
    );
    if (existingDrone) {
      throw new Error("Serial number already exists");
    }

    const drone = {
      id: generateId("drone"),
      serialNumber: droneData.serialNumber,
      typeId: droneData.typeId,
      x: droneData.x || 25.0,
      y: droneData.y || 25.0,
      status: "idle",
      battery: 100.0,
      capacity: droneType.capacity,
      currentLoad: 0.0,
      targetX: null,
      targetY: null,
    };

    return await this.droneModel.create(drone);
  }

  async updateDrone(id, updateData) {
    const existingDrone = await this.droneModel.findById(id);
    if (!existingDrone) {
      throw new Error("Drone not found");
    }

    // Se está atualizando o serial number, verificar se não existe outro
    if (
      updateData.serialNumber &&
      updateData.serialNumber !== existingDrone.serialNumber
    ) {
      const duplicateDrone = await this.droneModel.findBySerialNumber(
        updateData.serialNumber
      );
      if (duplicateDrone) {
        throw new Error("Serial number already exists");
      }
    }

    return await this.droneModel.update(id, updateData);
  }

  async deleteDrone(id) {
    const drone = await this.droneModel.findById(id);
    if (!drone) {
      throw new Error("Drone not found");
    }

    // Remover pedidos alocados ao drone
    await this.orderModel.removeDroneFromOrders(id);

    return await this.droneModel.delete(id);
  }

  async updateDroneStatus(id, status) {
    const drone = await this.droneModel.findById(id);
    if (!drone) {
      throw new Error("Drone not found");
    }

    const updateData = { status };

    // Se mudou para idle, posicionar em (25,25) e limpar destino
    if (status === "idle") {
      updateData.x = 25.0;
      updateData.y = 25.0;
      updateData.targetX = null;
      updateData.targetY = null;
    }

    return await this.droneModel.update(id, updateData);
  }

  async getDroneOrders(id) {
    return await this.orderModel.findByDroneId(id);
  }

  async allocateOrderToDrone(droneId, orderId) {
    const drone = await this.droneModel.findById(droneId);
    if (!drone) {
      return { success: false, message: "Drone not found" };
    }

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      return { success: false, message: "Order not found" };
    }

    // Verificar se o drone está disponível
    if (drone.status !== "idle" && drone.status !== "loading") {
      return {
        success: false,
        message: "Drone is not available for new orders",
      };
    }

    // Verificar capacidade
    const newLoad = drone.currentLoad + order.weight;
    if (newLoad > drone.capacity) {
      return {
        success: false,
        message: `Capacity exceeded! Drone supports ${drone.capacity}kg, but trying to load ${newLoad}kg. Wait for drone to return to base.`,
      };
    }

    // Alocar o pedido ao drone
    await this.orderModel.update(orderId, {
      droneId: droneId,
      status: "allocated",
    });

    // Atualizar carga do drone e definir destino
    await this.droneModel.update(droneId, {
      currentLoad: newLoad,
      status: "loading",
      targetX: order.x,
      targetY: order.y,
    });

    return { success: true, message: "Order allocated successfully!" };
  }

  async removeOrderFromDrone(droneId, orderId) {
    const order = await this.orderModel.findById(orderId);
    if (!order || order.droneId !== droneId) {
      return {
        success: false,
        message: "Order not found or not allocated to this drone",
      };
    }

    const drone = await this.droneModel.findById(droneId);
    if (!drone) {
      return { success: false, message: "Drone not found" };
    }

    // Verificar se o drone está em status adequado para desalocação
    if (drone.status !== "idle" && drone.status !== "loading") {
      return {
        success: false,
        message: "Drone must be in 'idle' or 'loading' status to remove orders",
      };
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
    return { success: true, message: "Order removed from drone successfully" };
  }
}
