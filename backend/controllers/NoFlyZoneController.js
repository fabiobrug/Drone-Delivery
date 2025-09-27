import { NoFlyZoneService } from "../services/NoFlyZoneService.js";

export class NoFlyZoneController {
  constructor() {
    this.noFlyZoneService = new NoFlyZoneService();
  }

  async getAllNoFlyZones(req, res) {
    try {
      const zones = await this.noFlyZoneService.getAllNoFlyZones();
      res.json({
        success: true,
        data: zones,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getNoFlyZoneById(req, res) {
    try {
      const { id } = req.params;
      const zone = await this.noFlyZoneService.getNoFlyZoneById(id);

      if (!zone) {
        return res.status(404).json({
          success: false,
          error: "No-fly zone not found",
        });
      }

      res.json({
        success: true,
        data: zone,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async createNoFlyZone(req, res) {
    try {
      const zoneData = req.body;
      const zone = await this.noFlyZoneService.createNoFlyZone(zoneData);

      res.status(201).json({
        success: true,
        data: zone,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateNoFlyZone(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const zone = await this.noFlyZoneService.updateNoFlyZone(id, updateData);

      res.json({
        success: true,
        data: zone,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteNoFlyZone(req, res) {
    try {
      const { id } = req.params;
      await this.noFlyZoneService.deleteNoFlyZone(id);

      res.json({
        success: true,
        message: "No-fly zone deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async addPointsToZone(req, res) {
    try {
      const { id } = req.params;
      const { points } = req.body;
      const zone = await this.noFlyZoneService.addPointsToZone(id, points);

      res.json({
        success: true,
        data: zone,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async removePointsFromZone(req, res) {
    try {
      const { id } = req.params;
      await this.noFlyZoneService.removePointsFromZone(id);

      res.json({
        success: true,
        message: "Points removed from zone successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async checkPointInNoFlyZone(req, res) {
    try {
      const { x, y } = req.params;
      const isInZone = await this.noFlyZoneService.checkPointInNoFlyZone(
        parseFloat(x),
        parseFloat(y)
      );

      res.json({
        success: true,
        data: {
          x: parseFloat(x),
          y: parseFloat(y),
          isInNoFlyZone: isInZone,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
