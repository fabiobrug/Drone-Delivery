import { ConfigService } from "../services/ConfigService.js";

export class ConfigController {
  constructor() {
    this.configService = new ConfigService();
  }

  async getConfig(req, res) {
    try {
      const config = await this.configService.getConfig();
      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateConfig(req, res) {
    try {
      const updateData = req.body;
      const config = await this.configService.updateConfig(updateData);

      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getOptimizationConfig(req, res) {
    try {
      const config = await this.configService.getOptimizationConfig();
      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateOptimizationConfig(req, res) {
    try {
      const updateData = req.body;
      const config = await this.configService.updateOptimizationConfig(
        updateData
      );

      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getSystemConfig(req, res) {
    try {
      const config = await this.configService.getSystemConfig();
      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateSystemConfig(req, res) {
    try {
      const updateData = req.body;
      const config = await this.configService.updateSystemConfig(updateData);

      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
