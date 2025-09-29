const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://drone-delivery-rjmj.vercel.app/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`🔍 DEBUG - API request URL: ${url}`);
    console.log(`🔍 DEBUG - API request options:`, options);

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      console.log(`🔍 DEBUG - API response status: ${response.status}`);
      const data = await response.json();
      console.log(`🔍 DEBUG - API response data:`, data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Drones
  async getDrones() {
    return this.request("/drones");
  }

  async getDrone(id) {
    return this.request(`/drones/${id}`);
  }

  async createDrone(droneData) {
    return this.request("/drones", {
      method: "POST",
      body: JSON.stringify(droneData),
    });
  }

  async updateDrone(id, droneData) {
    return this.request(`/drones/${id}`, {
      method: "PUT",
      body: JSON.stringify(droneData),
    });
  }

  async deleteDrone(id) {
    return this.request(`/drones/${id}`, {
      method: "DELETE",
    });
  }

  async updateDroneStatus(id, status) {
    return this.request(`/drones/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async getDroneOrders(id) {
    return this.request(`/drones/${id}/orders`);
  }

  async allocateOrderToDrone(droneId, orderId) {
    return this.request(`/drones/${droneId}/orders`, {
      method: "POST",
      body: JSON.stringify({ orderId }),
    });
  }

  async removeOrderFromDrone(droneId, orderId) {
    console.log(
      `🔍 DEBUG - API calling DELETE /drones/${droneId}/orders/${orderId}`
    );
    const result = await this.request(`/drones/${droneId}/orders/${orderId}`, {
      method: "DELETE",
    });
    console.log(`🔍 DEBUG - API result:`, result);
    return result;
  }

  async calculateDroneRoute(id) {
    return this.request(`/drones/${id}/route`);
  }

  async ensureIdleDronesAreAtBase() {
    return this.request("/drones/ensure-idle-at-base", {
      method: "POST",
    });
  }

  async startDroneFlight(droneId) {
    return this.request(`/drones/${droneId}/start-flight`, {
      method: "POST",
    });
  }

  async getDeliveryTimeInfo(droneId) {
    return this.request(`/drones/${droneId}/delivery-time`);
  }

  async stopDroneSimulation(droneId) {
    return this.request(`/drones/${droneId}/stop-simulation`, {
      method: "POST",
    });
  }

  // Drone Types
  async getDroneTypes() {
    return this.request("/drone-types");
  }

  async getDroneType(id) {
    return this.request(`/drone-types/${id}`);
  }

  async createDroneType(typeData) {
    return this.request("/drone-types", {
      method: "POST",
      body: JSON.stringify(typeData),
    });
  }

  async updateDroneType(id, typeData) {
    return this.request(`/drone-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(typeData),
    });
  }

  async deleteDroneType(id) {
    return this.request(`/drone-types/${id}`, {
      method: "DELETE",
    });
  }

  async getDroneTypeStats(id) {
    return this.request(`/drone-types/${id}/stats`);
  }

  // Orders
  async getOrders(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/orders?${queryString}` : "/orders";
    return this.request(endpoint);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id, orderData) {
    return this.request(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id) {
    return this.request(`/orders/${id}`, {
      method: "DELETE",
    });
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async getPendingOrders() {
    return this.request("/orders/filter/pending");
  }

  async getAllocatedOrders() {
    return this.request("/orders/filter/allocated");
  }

  async getDeliveredOrders() {
    return this.request("/orders/filter/delivered");
  }

  // No-Fly Zones
  async getNoFlyZones() {
    return this.request("/no-fly-zones");
  }

  async getNoFlyZone(id) {
    return this.request(`/no-fly-zones/${id}`);
  }

  async createNoFlyZone(zoneData) {
    return this.request("/no-fly-zones", {
      method: "POST",
      body: JSON.stringify(zoneData),
    });
  }

  async updateNoFlyZone(id, zoneData) {
    return this.request(`/no-fly-zones/${id}`, {
      method: "PUT",
      body: JSON.stringify(zoneData),
    });
  }

  async deleteNoFlyZone(id) {
    return this.request(`/no-fly-zones/${id}`, {
      method: "DELETE",
    });
  }

  async addPointsToZone(id, points) {
    return this.request(`/no-fly-zones/${id}/points`, {
      method: "POST",
      body: JSON.stringify({ points }),
    });
  }

  async removePointsFromZone(id) {
    return this.request(`/no-fly-zones/${id}/points`, {
      method: "DELETE",
    });
  }

  async checkPointInNoFlyZone(x, y) {
    return this.request(`/no-fly-zones/check/${x}/${y}`);
  }

  // Config
  async getConfig() {
    return this.request("/config");
  }

  async updateConfig(configData) {
    return this.request("/config", {
      method: "PUT",
      body: JSON.stringify(configData),
    });
  }

  async getOptimizationConfig() {
    return this.request("/config/optimization");
  }

  async updateOptimizationConfig(configData) {
    return this.request("/config/optimization", {
      method: "PUT",
      body: JSON.stringify(configData),
    });
  }

  async getSystemConfig() {
    return this.request("/config/system");
  }

  async updateSystemConfig(configData) {
    return this.request("/config/system", {
      method: "PUT",
      body: JSON.stringify(configData),
    });
  }

  // Stats
  async getGeneralStats() {
    return this.request("/stats");
  }

  async getDroneStats() {
    return this.request("/stats/drones");
  }

  async getOrderStats() {
    return this.request("/stats/orders");
  }

  async getDeliveryStats() {
    return this.request("/stats/delivery");
  }

  async getEfficiencyStats() {
    return this.request("/stats/efficiency");
  }

  async getRealTimeStats() {
    return this.request("/stats/real-time");
  }

  async getDashboardData() {
    return this.request("/stats/dashboard");
  }

  // Routing
  async calculateRoute(startX, startY, endX, endY) {
    return this.request("/routing/calculate", {
      method: "POST",
      body: JSON.stringify({ startX, startY, endX, endY }),
    });
  }

  async optimizeRoutes(droneIds, optimizationMethod) {
    return this.request("/routing/optimize", {
      method: "POST",
      body: JSON.stringify({ droneIds, optimizationMethod }),
    });
  }

  async getAvoidZones() {
    return this.request("/routing/avoid-zones");
  }

  async checkRouteAvoidsZones(route) {
    return this.request("/routing/check-route", {
      method: "POST",
      body: JSON.stringify({ route }),
    });
  }

  async getDroneWaypoints(droneId) {
    return this.request(`/routing/waypoints/${droneId}`);
  }

  async updateDroneWaypoints(droneId, waypoints) {
    return this.request(`/routing/update-waypoints/${droneId}`, {
      method: "POST",
      body: JSON.stringify({ waypoints }),
    });
  }

  // Delivery Time Calculation
  async calculateDeliveryTime(droneId, orderId) {
    return this.request(`/routing/delivery-time/${droneId}/${orderId}`);
  }

  async calculateDroneDeliveryTimes(droneId) {
    return this.request(`/routing/delivery-times/${droneId}`);
  }

  // Health Check
  async healthCheck() {
    return this.request("/health");
  }
}

export default new ApiService();
