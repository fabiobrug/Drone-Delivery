import { RoutingService } from "../services/RoutingService.js";

export class RoutingController {
  constructor() {
    this.routingService = new RoutingService();
  }

  async calculateRoute(req, res) {
    try {
      const { startX, startY, endX, endY } = req.body;
      const route = await this.routingService.calculateRoute(
        startX,
        startY,
        endX,
        endY
      );

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

  async optimizeRoutes(req, res) {
    try {
      const { droneIds, optimizationMethod } = req.body;
      const optimizedRoutes = await this.routingService.optimizeRoutes(
        droneIds,
        optimizationMethod
      );

      res.json({
        success: true,
        data: optimizedRoutes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAvoidZones(req, res) {
    try {
      const zones = await this.routingService.getAvoidZones();
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

  async checkRouteAvoidsZones(req, res) {
    try {
      const { route } = req.body;
      const result = await this.routingService.checkRouteAvoidsZones(route);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getDroneWaypoints(req, res) {
    try {
      const { droneId } = req.params;
      const waypoints = await this.routingService.getDroneWaypoints(droneId);

      res.json({
        success: true,
        data: waypoints,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateDroneWaypoints(req, res) {
    try {
      const { droneId } = req.params;
      const { waypoints } = req.body;
      const result = await this.routingService.updateDroneWaypoints(
        droneId,
        waypoints
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
