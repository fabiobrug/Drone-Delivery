import { supabase } from "../config/database.js";

export class StatsModel {
  constructor() {
    this.dronesTable = "drones";
    this.ordersTable = "orders";
    this.droneTypesTable = "drone_types";
    this.noFlyZonesTable = "no_fly_zones";
  }

  async getDroneStats() {
    const { data: drones, error: dronesError } = await supabase
      .from(this.dronesTable)
      .select("status, battery, current_load, capacity");

    if (dronesError) throw dronesError;

    const totalDrones = drones.length;
    const activeDrones = drones.filter((d) => d.status !== "idle").length;
    const idleDrones = drones.filter((d) => d.status === "idle").length;
    const avgBattery =
      totalDrones > 0
        ? Math.round(
            drones.reduce((acc, d) => acc + d.battery, 0) / totalDrones
          )
        : 0;
    const totalCapacity = drones.reduce((acc, d) => acc + d.capacity, 0);
    const usedCapacity = drones.reduce((acc, d) => acc + d.current_load, 0);

    return {
      totalDrones,
      activeDrones,
      idleDrones,
      avgBattery,
      totalCapacity,
      usedCapacity,
      capacityUtilization:
        totalCapacity > 0
          ? Math.round((usedCapacity / totalCapacity) * 100)
          : 0,
    };
  }

  async getOrderStats() {
    const { data: orders, error: ordersError } = await supabase
      .from(this.ordersTable)
      .select("status, priority, weight, created_at");

    if (ordersError) throw ordersError;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const allocatedOrders = orders.filter(
      (o) => o.status === "allocated"
    ).length;
    const deliveredOrders = orders.filter(
      (o) => o.status === "delivered"
    ).length;
    const highPriorityOrders = orders.filter(
      (o) => o.priority === "high"
    ).length;
    const totalWeight = orders.reduce((acc, o) => acc + o.weight, 0);

    // Estatísticas por período
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const ordersLast24h = orders.filter(
      (o) => new Date(o.created_at) >= last24h
    ).length;
    const ordersLastWeek = orders.filter(
      (o) => new Date(o.created_at) >= lastWeek
    ).length;

    return {
      totalOrders,
      pendingOrders,
      allocatedOrders,
      deliveredOrders,
      highPriorityOrders,
      totalWeight,
      ordersLast24h,
      ordersLastWeek,
      deliveryRate:
        totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0,
    };
  }

  async getDeliveryStats() {
    const { data: orders, error: ordersError } = await supabase
      .from(this.ordersTable)
      .select("status, created_at, updated_at");

    if (ordersError) throw ordersError;

    const deliveredOrders = orders.filter((o) => o.status === "delivered");
    const totalDeliveries = deliveredOrders.length;

    // Calcular tempo médio de entrega
    const deliveryTimes = deliveredOrders.map((order) => {
      const created = new Date(order.created_at);
      const delivered = new Date(order.updated_at);
      return delivered.getTime() - created.getTime();
    });

    const avgDeliveryTime =
      deliveryTimes.length > 0
        ? Math.round(
            deliveryTimes.reduce((acc, time) => acc + time, 0) /
              deliveryTimes.length /
              1000 /
              60
          ) // em minutos
        : 0;

    return {
      totalDeliveries,
      avgDeliveryTime,
      deliveryEfficiency: totalDeliveries > 0 ? 85 : 0, // Placeholder
    };
  }

  async getEfficiencyStats() {
    const droneStats = await this.getDroneStats();
    const orderStats = await this.getOrderStats();
    const deliveryStats = await this.getDeliveryStats();

    // Cálculo melhorado de eficiência do sistema
    const droneUtilizationScore = droneStats.capacityUtilization;
    const orderProcessingScore =
      orderStats.totalOrders > 0
        ? Math.round(
            ((orderStats.allocatedOrders + orderStats.deliveredOrders) /
              orderStats.totalOrders) *
              100
          )
        : 0;
    const batteryHealthScore = droneStats.avgBattery;
    const deliveryPerformanceScore = orderStats.deliveryRate;

    // Média ponderada para eficiência do sistema
    const systemEfficiency = Math.round(
      droneUtilizationScore * 0.3 +
        orderProcessingScore * 0.3 +
        batteryHealthScore * 0.2 +
        deliveryPerformanceScore * 0.2
    );

    return {
      systemEfficiency: Math.max(0, Math.min(100, systemEfficiency)),
      droneUtilization: droneStats.capacityUtilization,
      orderProcessing: orderProcessingScore,
      batteryHealth: batteryHealthScore,
      deliveryRate: orderStats.deliveryRate,
      avgDeliveryTime: deliveryStats.avgDeliveryTime,
      activeDroneRate:
        droneStats.totalDrones > 0
          ? Math.round((droneStats.activeDrones / droneStats.totalDrones) * 100)
          : 0,
    };
  }

  async getRealTimeStats() {
    const droneStats = await this.getDroneStats();
    const orderStats = await this.getOrderStats();

    return {
      activeDrones: droneStats.activeDrones,
      pendingOrders: orderStats.pendingOrders,
      systemLoad: Math.round(
        (droneStats.activeDrones / Math.max(droneStats.totalDrones, 1)) * 100
      ),
      timestamp: new Date().toISOString(),
    };
  }

  async getDashboardData() {
    const droneStats = await this.getDroneStats();
    const orderStats = await this.getOrderStats();
    const deliveryStats = await this.getDeliveryStats();
    const efficiencyStats = await this.getEfficiencyStats();

    return {
      overview: {
        totalDrones: droneStats.totalDrones,
        activeDrones: droneStats.activeDrones,
        idleDrones: droneStats.idleDrones,
        totalOrders: orderStats.totalOrders,
        pendingOrders: orderStats.pendingOrders,
        allocatedOrders: orderStats.allocatedOrders,
        deliveredOrders: orderStats.deliveredOrders,
        highPriorityOrders: orderStats.highPriorityOrders,
      },
      performance: {
        systemEfficiency: efficiencyStats.systemEfficiency,
        droneUtilization: efficiencyStats.droneUtilization,
        orderProcessing: efficiencyStats.orderProcessing,
        batteryHealth: efficiencyStats.batteryHealth,
        activeDroneRate: efficiencyStats.activeDroneRate,
        deliveryRate: orderStats.deliveryRate,
        avgDeliveryTime: deliveryStats.avgDeliveryTime,
        capacityUtilization: droneStats.capacityUtilization,
        totalCapacity: droneStats.totalCapacity,
        usedCapacity: droneStats.usedCapacity,
      },
      recent: {
        ordersLast24h: orderStats.ordersLast24h,
        ordersLastWeek: orderStats.ordersLastWeek,
        avgBattery: droneStats.avgBattery,
        totalWeight: orderStats.totalWeight,
      },
    };
  }
}
