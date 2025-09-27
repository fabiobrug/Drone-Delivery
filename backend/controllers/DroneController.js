import { DroneService } from "../services/DroneService.js";
import { RoutingService } from "../services/RoutingService.js";

export class DroneController {
  constructor() {
    this.droneService = new DroneService();
    this.routingService = new RoutingService();
  }

  async getAllDrones(req, res) {
    try {
      const drones = await this.droneService.getAllDrones();
      res.json({
        success: true,
        data: drones,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getDroneById(req, res) {
    try {
      const { id } = req.params;
      const drone = await this.droneService.getDroneById(id);

      if (!drone) {
        return res.status(404).json({
          success: false,
          error: "Drone not found",
        });
      }

      res.json({
        success: true,
        data: drone,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async createDrone(req, res) {
    try {
      const droneData = req.body;
      const drone = await this.droneService.createDrone(droneData);

      res.status(201).json({
        success: true,
        data: drone,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateDrone(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const drone = await this.droneService.updateDrone(id, updateData);

      res.json({
        success: true,
        data: drone,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteDrone(req, res) {
    try {
      const { id } = req.params;
      await this.droneService.deleteDrone(id);

      res.json({
        success: true,
        message: "Drone deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateDroneStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const drone = await this.droneService.updateDroneStatus(id, status);

      res.json({
        success: true,
        data: drone,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getDroneOrders(req, res) {
    try {
      const { id } = req.params;
      const orders = await this.droneService.getDroneOrders(id);

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async allocateOrderToDrone(req, res) {
    try {
      const { id } = req.params;
      const { orderId } = req.body;
      const result = await this.droneService.allocateOrderToDrone(id, orderId);

      res.json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async removeOrderFromDrone(req, res) {
    try {
      const { id, orderId } = req.params;
      const result = await this.droneService.removeOrderFromDrone(id, orderId);

      res.json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async calculateDroneRoute(req, res) {
    try {
      const { id } = req.params;
      const route = await this.routingService.calculateDroneRoute(id);

      res.json({
        success: true,
        data: route,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
