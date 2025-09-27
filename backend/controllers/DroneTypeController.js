import { DroneTypeService } from "../services/DroneTypeService.js";

export class DroneTypeController {
  constructor() {
    this.droneTypeService = new DroneTypeService();
  }

  async getAllDroneTypes(req, res) {
    try {
      const droneTypes = await this.droneTypeService.getAllDroneTypes();
      res.json({
        success: true,
        data: droneTypes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getDroneTypeById(req, res) {
    try {
      const { id } = req.params;
      const droneType = await this.droneTypeService.getDroneTypeById(id);

      if (!droneType) {
        return res.status(404).json({
          success: false,
          error: "Drone type not found",
        });
      }

      res.json({
        success: true,
        data: droneType,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async createDroneType(req, res) {
    try {
      const droneTypeData = req.body;
      const droneType = await this.droneTypeService.createDroneType(
        droneTypeData
      );

      res.status(201).json({
        success: true,
        data: droneType,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateDroneType(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const droneType = await this.droneTypeService.updateDroneType(
        id,
        updateData
      );

      res.json({
        success: true,
        data: droneType,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteDroneType(req, res) {
    try {
      const { id } = req.params;
      const result = await this.droneTypeService.deleteDroneType(id);

      res.json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getDroneTypeStats(req, res) {
    try {
      const { id } = req.params;
      const stats = await this.droneTypeService.getDroneTypeStats(id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
