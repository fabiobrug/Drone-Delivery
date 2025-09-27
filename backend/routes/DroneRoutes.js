import express from "express";
import { DroneController } from "../controllers/DroneController.js";
import {
  validateDrone,
  validateDroneUpdate,
  validateDroneStatus,
} from "../middleware/validation.js";

const router = express.Router();
const droneController = new DroneController();

// GET /api/drones - Listar todos os drones
router.get("/", (req, res) => droneController.getAllDrones(req, res));

// GET /api/drones/:id - Buscar drone específico
router.get("/:id", (req, res) => droneController.getDroneById(req, res));

// POST /api/drones - Criar novo drone
router.post("/", validateDrone, (req, res) =>
  droneController.createDrone(req, res)
);

// PUT /api/drones/:id - Atualizar drone
router.put("/:id", validateDroneUpdate, (req, res) =>
  droneController.updateDrone(req, res)
);

// DELETE /api/drones/:id - Excluir drone
router.delete("/:id", (req, res) => droneController.deleteDrone(req, res));

// PUT /api/drones/:id/status - Atualizar status do drone
router.put("/:id/status", validateDroneStatus, (req, res) =>
  droneController.updateDroneStatus(req, res)
);

// GET /api/drones/:id/orders - Pedidos do drone
router.get("/:id/orders", (req, res) =>
  droneController.getDroneOrders(req, res)
);

// POST /api/drones/:id/orders - Alocar pedido ao drone
router.post("/:id/orders", (req, res) =>
  droneController.allocateOrderToDrone(req, res)
);

// DELETE /api/drones/:id/orders/:orderId - Remover pedido do drone
router.delete("/:id/orders/:orderId", (req, res) =>
  droneController.removeOrderFromDrone(req, res)
);

// GET /api/drones/:id/route - Calcular rota do drone
router.get("/:id/route", (req, res) =>
  droneController.calculateDroneRoute(req, res)
);

export default router;
