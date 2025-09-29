import { ConfigModel } from "../models/ConfigModel.js";

export class ConfigService {
  constructor() {
    this.configModel = new ConfigModel();
  }

  async getConfig() {
    try {
      return await this.configModel.findById(1);
    } catch (error) {
      // Se não existe configuração, criar uma padrão
      return await this.createDefaultConfig();
    }
  }

  async updateConfig(updateData) {
    return await this.configModel.upsert(updateData);
  }

  async getOptimizationConfig() {
    const config = await this.getConfig();
    return {
      optimizationEnabled: config.optimizationEnabled,
      optimizationMethod: config.optimizationMethod,
      updateInterval: config.updateInterval,
    };
  }

  async updateOptimizationConfig(updateData) {
    const currentConfig = await this.getConfig();
    return await this.updateConfig({
      ...currentConfig,
      optimizationEnabled: updateData.optimizationEnabled,
      optimizationMethod: updateData.optimizationMethod,
      updateInterval: updateData.updateInterval,
    });
  }

  async getSystemConfig() {
    const config = await this.getConfig();
    return {
      realTimeNotifications: config.realTimeNotifications,
      activityLogging: config.activityLogging,
      settings: config.settings,
    };
  }

  async updateSystemConfig(updateData) {
    const currentConfig = await this.getConfig();
    return await this.updateConfig({
      ...currentConfig,
      realTimeNotifications: updateData.realTimeNotifications,
      activityLogging: updateData.activityLogging,
      settings: updateData.settings,
    });
  }

  async createDefaultConfig() {
    const defaultConfig = {
      optimizationEnabled: true,
      optimizationMethod: "priority-distance-weight",
      updateInterval: 5,
      realTimeNotifications: true,
      activityLogging: true,
      settings: {
        maxDrones: 50,
        maxOrders: 1000,
        gridSize: 50,
        cellSize: 20,
        basePosition: { x: 25, y: 25 },
        mapBounds: { minX: 0, minY: 0, maxX: 50, maxY: 50 },
      },
    };

    return await this.configModel.create(defaultConfig);
  }

  async resetToDefaults() {
    return await this.createDefaultConfig();
  }

  async getSettings() {
    const config = await this.getConfig();
    return config.settings || {};
  }

  async updateSettings(settings) {
    const currentConfig = await this.getConfig();
    return await this.updateConfig({
      ...currentConfig,
      settings: { ...currentConfig.settings, ...settings },
    });
  }
}
