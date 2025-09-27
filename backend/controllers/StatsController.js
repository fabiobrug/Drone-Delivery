import { StatsService } from "../services/StatsService.js";

export class StatsController {
  constructor() {
    this.statsService = new StatsService();
  }

  async getGeneralStats(req, res) {
    try {
      const stats = await this.statsService.getGeneralStats();
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

  async getDroneStats(req, res) {
    try {
      const stats = await this.statsService.getDroneStats();
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

  async getOrderStats(req, res) {
    try {
      const stats = await this.statsService.getOrderStats();
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

  async getDeliveryStats(req, res) {
    try {
      const stats = await this.statsService.getDeliveryStats();
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

  async getEfficiencyStats(req, res) {
    try {
      const stats = await this.statsService.getEfficiencyStats();
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

  async getRealTimeStats(req, res) {
    try {
      const stats = await this.statsService.getRealTimeStats();
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

  async getDashboardData(req, res) {
    try {
      const data = await this.statsService.getDashboardData();
      res.json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
