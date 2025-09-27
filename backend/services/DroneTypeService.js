import { DroneTypeModel } from "../models/DroneTypeModel.js";
import { DroneModel } from "../models/DroneModel.js";
import { generateId } from "../utils/helpers.js";

export class DroneTypeService {
  constructor() {
    this.droneTypeModel = new DroneTypeModel();
    this.droneModel = new DroneModel();
  }

  async getAllDroneTypes() {
    return await this.droneTypeModel.findAll();
  }

  async getDroneTypeById(id) {
    return await this.droneTypeModel.findById(id);
  }

  async createDroneType(droneTypeData) {
    const droneType = {
      id: generateId("type"),
      name: droneTypeData.name,
      capacity: droneTypeData.capacity,
      batteryRange: droneTypeData.batteryRange,
      maxSpeed: droneTypeData.maxSpeed,
      description: droneTypeData.description || "",
    };

    return await this.droneTypeModel.create(droneType);
  }

  async updateDroneType(id, updateData) {
    const existingType = await this.droneTypeModel.findById(id);
    if (!existingType) {
      throw new Error("Drone type not found");
    }

    return await this.droneTypeModel.update(id, updateData);
  }

  async deleteDroneType(id) {
    // Verificar se há drones usando este tipo
    const dronesUsingType = await this.droneModel.findByTypeId(id);
    if (dronesUsingType.length > 0) {
      return {
        success: false,
        message: `Cannot delete this type. There are ${dronesUsingType.length} drone(s) using this type.`,
      };
    }

    await this.droneTypeModel.delete(id);
    return {
      success: true,
      message: "Drone type deleted successfully!",
    };
  }

  async getDroneTypeStats(id) {
    const droneType = await this.droneTypeModel.findById(id);
    if (!droneType) {
      throw new Error("Drone type not found");
    }

    const dronesOfType = await this.droneModel.findByTypeId(id);
    const activeDrones = dronesOfType.filter(
      (drone) => drone.status !== "idle"
    );
    const totalDeliveries = dronesOfType.reduce(
      (acc, drone) => acc + drone.currentLoad,
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
        activeDrones.length > 0
          ? Math.round((activeDrones.length / dronesOfType.length) * 100)
          : 0,
    };
  }
}
