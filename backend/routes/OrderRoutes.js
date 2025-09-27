import express from "express";
import { OrderController } from "../controllers/OrderController.js";
import {
  validateOrder,
  validateOrderUpdate,
  validateOrderStatus,
} from "../middleware/validation.js";

const router = express.Router();
const orderController = new OrderController();

// GET /api/orders - Listar todos os pedidos
router.get("/", (req, res) => orderController.getAllOrders(req, res));

// GET /api/orders/:id - Buscar pedido específico
router.get("/:id", (req, res) => orderController.getOrderById(req, res));

// POST /api/orders - Criar novo pedido
router.post("/", validateOrder, (req, res) =>
  orderController.createOrder(req, res)
);

// PUT /api/orders/:id - Atualizar pedido
router.put("/:id", validateOrderUpdate, (req, res) =>
  orderController.updateOrder(req, res)
);

// DELETE /api/orders/:id - Excluir pedido
router.delete("/:id", (req, res) => orderController.deleteOrder(req, res));

// PUT /api/orders/:id/status - Atualizar status do pedido
router.put("/:id/status", validateOrderStatus, (req, res) =>
  orderController.updateOrderStatus(req, res)
);

// GET /api/orders/pending - Pedidos pendentes
router.get("/filter/pending", (req, res) =>
  orderController.getPendingOrders(req, res)
);

// GET /api/orders/allocated - Pedidos alocados
router.get("/filter/allocated", (req, res) =>
  orderController.getAllocatedOrders(req, res)
);

// GET /api/orders/delivered - Pedidos entregues
router.get("/filter/delivered", (req, res) =>
  orderController.getDeliveredOrders(req, res)
);

export default router;
