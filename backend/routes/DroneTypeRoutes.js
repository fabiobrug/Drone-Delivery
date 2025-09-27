import express from "express";
import { DroneTypeController } from "../controllers/DroneTypeController.js";
import {
  validateDroneType,
  validateDroneTypeUpdate,
} from "../middleware/validation.js";

const router = express.Router();
const droneTypeController = new DroneTypeController();

// GET /api/drone-types - Listar todos os tipos
router.get("/", (req, res) => droneTypeController.getAllDroneTypes(req, res));

// GET /api/drone-types/:id - Buscar tipo específico
router.get("/:id", (req, res) =>
  droneTypeController.getDroneTypeById(req, res)
);

// POST /api/drone-types - Criar novo tipo
router.post("/", validateDroneType, (req, res) =>
  droneTypeController.createDroneType(req, res)
);

// PUT /api/drone-types/:id - Atualizar tipo
router.put("/:id", validateDroneTypeUpdate, (req, res) =>
  droneTypeController.updateDroneType(req, res)
);

// DELETE /api/drone-types/:id - Excluir tipo
router.delete("/:id", (req, res) =>
  droneTypeController.deleteDroneType(req, res)
);

// GET /api/drone-types/:id/stats - Estatísticas do tipo
router.get("/:id/stats", (req, res) =>
  droneTypeController.getDroneTypeStats(req, res)
);

export default router;
