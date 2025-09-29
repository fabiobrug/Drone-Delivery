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
      if (point.x < 0 || point.x > 50 || point.y < 0 || point.y > 50) {
        throw new Error("Coordinates must be between 0 and 50");
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

  async getAllZonesForPathfinding() {
    try {
      const zones = await this.noFlyZoneModel.findAll();
      return zones.map((zone) => {
        // Calcular limites baseado nos pontos
        const points = zone.points || [];
        if (points.length === 0) {
          return {
            id: zone.id,
            name: zone.name,
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
            area: 0,
          };
        }

        const minX = Math.min(...points.map((p) => p.x));
        const maxX = Math.max(...points.map((p) => p.x));
        const minY = Math.min(...points.map((p) => p.y));
        const maxY = Math.max(...points.map((p) => p.y));
        const area = (maxX - minX + 1) * (maxY - minY + 1);

        return {
          id: zone.id,
          name: zone.name,
          minX,
          maxX,
          minY,
          maxY,
          area,
        };
      });
    } catch (error) {
      console.error("Error getting zones for pathfinding:", error);
      return [];
    }
  }

  async checkPointInNoFlyZone(x, y) {
    // Validar coordenadas
    if (typeof x !== "number" || typeof y !== "number") {
      throw new Error("Invalid coordinates");
    }

    if (x < 0 || x > 50 || y < 0 || y > 50) {
      throw new Error("Coordinates must be between 0 and 50");
    }

    return await this.noFlyZoneModel.checkPointInNoFlyZone(x, y);
  }

  async getNoFlyZonesForPoint(x, y) {
    // Validar coordenadas
    if (typeof x !== "number" || typeof y !== "number") {
      throw new Error("Invalid coordinates");
    }

    if (x < 0 || x > 50 || y < 0 || y > 50) {
      throw new Error("Coordinates must be between 0 and 50");
    }

    return await this.noFlyZoneModel.getNoFlyZonesForPoint(x, y);
  }
}
