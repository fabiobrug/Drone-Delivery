import { OrderService } from "../services/OrderService.js";

export class OrderController {
  constructor() {
    this.orderService = new OrderService();
  }

  async getAllOrders(req, res) {
    try {
      const { status, priority, sortBy, sortOrder } = req.query;
      const orders = await this.orderService.getAllOrders({
        status,
        priority,
        sortBy,
        sortOrder,
      });

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

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Order not found",
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async createOrder(req, res) {
    try {
      const orderData = req.body;
      const order = await this.orderService.createOrder(orderData);

      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateOrder(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const order = await this.orderService.updateOrder(id, updateData);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      await this.orderService.deleteOrder(id);

      res.json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await this.orderService.updateOrderStatus(id, status);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getPendingOrders(req, res) {
    try {
      const orders = await this.orderService.getOrdersByStatus("pending");
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

  async getAllocatedOrders(req, res) {
    try {
      const orders = await this.orderService.getOrdersByStatus("allocated");
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

  async getDeliveredOrders(req, res) {
    try {
      const orders = await this.orderService.getOrdersByStatus("delivered");
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
}
