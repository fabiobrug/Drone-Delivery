import { StatsModel } from "../models/StatsModel.js";

export class StatsService {
  constructor() {
    this.statsModel = new StatsModel();
  }

  async getGeneralStats() {
    const droneStats = await this.statsModel.getDroneStats();
    const orderStats = await this.statsModel.getOrderStats();
    const deliveryStats = await this.statsModel.getDeliveryStats();
    const efficiencyStats = await this.statsModel.getEfficiencyStats();

    return {
      drones: droneStats,
      orders: orderStats,
      delivery: deliveryStats,
      efficiency: efficiencyStats,
      timestamp: new Date().toISOString(),
    };
  }

  async getDroneStats() {
    return await this.statsModel.getDroneStats();
  }

  async getOrderStats() {
    return await this.statsModel.getOrderStats();
  }

  async getDeliveryStats() {
    return await this.statsModel.getDeliveryStats();
  }

  async getEfficiencyStats() {
    return await this.statsModel.getEfficiencyStats();
  }

  async getRealTimeStats() {
    return await this.statsModel.getRealTimeStats();
  }

  async getDashboardData() {
    return await this.statsModel.getDashboardData();
  }

  async getSystemHealth() {
    const realTimeStats = await this.getRealTimeStats();
    const efficiencyStats = await this.getEfficiencyStats();

    let healthStatus = "healthy";
    let healthScore = 100;

    // Verificar saúde baseada em métricas
    if (realTimeStats.systemLoad > 90) {
      healthStatus = "critical";
      healthScore -= 30;
    } else if (realTimeStats.systemLoad > 75) {
      healthStatus = "warning";
      healthScore -= 15;
    }

    if (efficiencyStats.systemEfficiency < 50) {
      healthStatus = "warning";
      healthScore -= 20;
    }

    if (realTimeStats.pendingOrders > 50) {
      healthStatus = "warning";
      healthScore -= 10;
    }

    return {
      status: healthStatus,
      score: Math.max(0, healthScore),
      metrics: {
        systemLoad: realTimeStats.systemLoad,
        efficiency: efficiencyStats.systemEfficiency,
        pendingOrders: realTimeStats.pendingOrders,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getPerformanceMetrics() {
    const droneStats = await this.getDroneStats();
    const orderStats = await this.getOrderStats();
    const deliveryStats = await this.getDeliveryStats();

    return {
      capacity: {
        total: droneStats.totalCapacity,
        used: droneStats.usedCapacity,
        utilization: droneStats.capacityUtilization,
      },
      orders: {
        total: orderStats.totalOrders,
        pending: orderStats.pendingOrders,
        delivered: orderStats.deliveredOrders,
        deliveryRate: orderStats.deliveryRate,
      },
      delivery: {
        totalDeliveries: deliveryStats.totalDeliveries,
        avgTime: deliveryStats.avgDeliveryTime,
        efficiency: deliveryStats.deliveryEfficiency,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
