import { DroneModel } from "../models/DroneModel.js";
import { OrderModel } from "../models/OrderModel.js";
import { DroneTypeModel } from "../models/DroneTypeModel.js";
import { FlightSimulationService } from "./FlightSimulationService.js";
import { generateId } from "../utils/helpers.js";

export class DroneService {
  constructor() {
    this.droneModel = new DroneModel();
    this.orderModel = new OrderModel();
    this.droneTypeModel = new DroneTypeModel();
    this.flightSimulationService = new FlightSimulationService();
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

    // Se mudou para idle, posicionar em (25,25), limpar destino e recarregar bateria
    if (status === "idle") {
      updateData.x = 25.0;
      updateData.y = 25.0;
      updateData.battery = 100.0;
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
    try {
      console.log(`🔍 DEBUG - Removing order ${orderId} from drone ${droneId}`);

      const order = await this.orderModel.findById(orderId);
      console.log(`🔍 DEBUG - Order found:`, order);

      if (!order) {
        console.log(`❌ DEBUG - Order not found`);
        return {
          success: false,
          message: "Order not found",
        };
      }

      // Comparação mais robusta considerando tipos
      const orderDroneId = String(order.droneId || "").trim();
      const expectedDroneId = String(droneId || "").trim();

      console.log(
        `🔍 DEBUG - Order droneId: "${orderDroneId}" (length: ${orderDroneId.length})`
      );
      console.log(
        `🔍 DEBUG - Expected droneId: "${expectedDroneId}" (length: ${expectedDroneId.length})`
      );
      console.log(`🔍 DEBUG - Order object:`, JSON.stringify(order, null, 2));

      // Verificar se ambos são strings válidas e não vazias
      if (!orderDroneId || !expectedDroneId) {
        console.log(
          `❌ DEBUG - Empty droneId values - orderDroneId: "${orderDroneId}", expectedDroneId: "${expectedDroneId}"`
        );
        return {
          success: false,
          message: "Invalid drone ID values",
        };
      }

      if (orderDroneId !== expectedDroneId) {
        console.log(`❌ DEBUG - Drone ID mismatch`);
        return {
          success: false,
          message: "Order not allocated to this drone",
        };
      }

      const drone = await this.droneModel.findById(droneId);
      if (!drone) {
        return { success: false, message: "Drone not found" };
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
        // Quando o drone fica idle, garantir que esteja na posição (25,25) e com 100% de bateria
        updateData.x = 25.0;
        updateData.y = 25.0;
        updateData.battery = 100.0;
      }

      await this.droneModel.update(droneId, updateData);

      return {
        success: true,
        message: "Order removed from drone successfully",
      };
    } catch (error) {
      console.error("Error removing order from drone:", error);
      return {
        success: false,
        message: `Error removing order: ${error.message}`,
      };
    }
  }

  // Função para garantir que todos os drones IDLE estejam na posição (25,25) e com 100% de bateria
  async ensureIdleDronesAreAtBase() {
    try {
      const allDrones = await this.droneModel.findAll();
      const idleDrones = allDrones.filter((drone) => drone.status === "idle");

      for (const drone of idleDrones) {
        const needsUpdate =
          drone.x !== 25 || drone.y !== 25 || drone.battery !== 100;
        if (needsUpdate) {
          // Só resetar posição e bateria se o drone estiver realmente idle e sem carga
          // Se o drone tem carga (currentLoad > 0), não deve ser resetado para idle
          if (drone.currentLoad === 0) {
            await this.droneModel.update(drone.id, {
              x: 25.0,
              y: 25.0,
              battery: 100.0,
              targetX: null,
              targetY: null,
            });
          } else {
            // Se tem carga, apenas ajustar posição e bateria mas manter status loading
            await this.droneModel.update(drone.id, {
              x: 25.0,
              y: 25.0,
              battery: 100.0,
              status: "loading", // Manter como loading se tem carga
              targetX: null,
              targetY: null,
            });
          }
        }
      }

      return { success: true, message: "Idle drones positioned at base" };
    } catch (error) {
      console.error("Error ensuring idle drones are at base:", error);
      return { success: false, message: error.message };
    }
  }

  // Inicia o voo do drone
  async startDroneFlight(droneId) {
    try {
      console.log(`🚁 DroneService: Starting flight for drone ${droneId}`);

      const drone = await this.droneModel.findById(droneId);
      if (!drone) {
        console.log(`❌ DroneService: Drone ${droneId} not found`);
        return { success: false, message: "Drone not found" };
      }

      console.log(
        `🔍 DroneService: Drone found - ${drone.serialNumber}, status: ${drone.status}, load: ${drone.currentLoad}`
      );

      // Permitir voo se drone está em loading OU idle com carga > 0
      if (drone.status !== "loading" && drone.status !== "idle") {
        console.log(
          `❌ DroneService: Drone must be in loading or idle status to start flight`
        );
        return {
          success: false,
          message: "Drone must be in loading or idle status to start flight",
        };
      }

      if (drone.currentLoad === 0) {
        console.log(`❌ DroneService: Drone has no load to deliver`);
        return {
          success: false,
          message: "Drone must have orders to start flight",
        };
      }

      // Se drone está idle mas tem carga, mudar para loading primeiro
      if (drone.status === "idle" && drone.currentLoad > 0) {
        console.log(
          `🔄 DroneService: Changing drone status from idle to loading`
        );
        await this.droneModel.update(droneId, { status: "loading" });
      }

      const result = await this.flightSimulationService.startFlightSimulation(
        droneId
      );

      console.log(`✅ DroneService: Flight simulation result:`, result);
      return result;
    } catch (error) {
      console.error("Error starting drone flight:", error);
      return { success: false, message: error.message };
    }
  }

  // Obtém informações de tempo de entrega em tempo real
  async getDeliveryTimeInfo(droneId) {
    try {
      return await this.flightSimulationService.getDeliveryTimeInfo(droneId);
    } catch (error) {
      console.error("Error getting delivery time info:", error);
      return { success: false, message: error.message };
    }
  }

  // Para todas as simulações de um drone
  async stopDroneSimulation(droneId) {
    try {
      this.flightSimulationService.stopAllSimulations(droneId);

      // Resetar drone para idle
      await this.droneModel.update(droneId, {
        status: "idle",
        x: 25.0,
        y: 25.0,
        battery: 100.0,
        targetX: null,
        targetY: null,
      });

      return { success: true, message: "Drone simulation stopped" };
    } catch (error) {
      console.error("Error stopping drone simulation:", error);
      return { success: false, message: error.message };
    }
  }
}
