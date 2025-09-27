import { NoFlyZoneModel } from "../models/NoFlyZoneModel.js";
import { generateId } from "../utils/helpers.js";

export class NoFlyZoneService {
  constructor() {
    this.noFlyZoneModel = new NoFlyZoneModel();
  }

  async getAllNoFlyZones() {
    const zones = await this.noFlyZoneModel.findAll();
    return zones.map((zone) => this.noFlyZoneModel.formatNoFlyZoneData(zone));
  }

  async getNoFlyZoneById(id) {
    const zone = await this.noFlyZoneModel.findById(id);
    return this.noFlyZoneModel.formatNoFlyZoneData(zone);
  }

  async createNoFlyZone(zoneData) {
    const zone = {
      id: generateId("zone"),
      name: zoneData.name || `No-Fly Zone ${Date.now()}`,
      description: zoneData.description || "",
      points: zoneData.points || [],
    };

    return await this.noFlyZoneModel.create(zone);
  }

  async updateNoFlyZone(id, updateData) {
    const existingZone = await this.noFlyZoneModel.findById(id);
    if (!existingZone) {
      throw new Error("No-fly zone not found");
    }

    return await this.noFlyZoneModel.update(id, updateData);
  }

  async deleteNoFlyZone(id) {
    const zone = await this.noFlyZoneModel.findById(id);
    if (!zone) {
      throw new Error("No-fly zone not found");
    }

    return await this.noFlyZoneModel.delete(id);
  }

  async addPointsToZone(id, points) {
    const zone = await this.noFlyZoneModel.findById(id);
    if (!zone) {
      throw new Error("No-fly zone not found");
    }

    // Validar pontos
    if (!Array.isArray(points) || points.length < 3) {
      throw new Error("At least 3 points are required to create a zone");
    }

    // Validar coordenadas
    for (const point of points) {
      if (typeof point.x !== "number" || typeof point.y !== "number") {
        throw new Error("All points must have valid x and y coordinates");
      }
      if (point.x < 0 || point.x > 1000 || point.y < 0 || point.y > 1000) {
        throw new Error("Coordinates must be between 0 and 1000");
      }
    }

    await this.noFlyZoneModel.addPointsToZone(id, points);
    return await this.getNoFlyZoneById(id);
  }

  async removePointsFromZone(id) {
    const zone = await this.noFlyZoneModel.findById(id);
    if (!zone) {
      throw new Error("No-fly zone not found");
    }

    await this.noFlyZoneModel.removePointsFromZone(id);
    return { success: true, message: "Points removed from zone successfully" };
  }

  async checkPointInNoFlyZone(x, y) {
    // Validar coordenadas
    if (typeof x !== "number" || typeof y !== "number") {
      throw new Error("Invalid coordinates");
    }

    if (x < 0 || x > 1000 || y < 0 || y > 1000) {
      throw new Error("Coordinates must be between 0 and 1000");
    }

    return await this.noFlyZoneModel.checkPointInNoFlyZone(x, y);
  }

  async getAllZonesForPathfinding() {
    const zones = await this.getAllNoFlyZones();
    return zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      points: zone.points,
    }));
  }
}
