import express from "express";
import { NoFlyZoneController } from "../controllers/NoFlyZoneController.js";
import {
  validateNoFlyZone,
  validateNoFlyZonePoints,
} from "../middleware/validation.js";

const router = express.Router();
const noFlyZoneController = new NoFlyZoneController();

// GET /api/no-fly-zones - Listar todas as zonas
router.get("/", (req, res) => noFlyZoneController.getAllNoFlyZones(req, res));

// GET /api/no-fly-zones/:id - Buscar zona específica
router.get("/:id", (req, res) =>
  noFlyZoneController.getNoFlyZoneById(req, res)
);

// POST /api/no-fly-zones - Criar nova zona
router.post("/", validateNoFlyZone, (req, res) =>
  noFlyZoneController.createNoFlyZone(req, res)
);

// PUT /api/no-fly-zones/:id - Atualizar zona
router.put("/:id", validateNoFlyZone, (req, res) =>
  noFlyZoneController.updateNoFlyZone(req, res)
);

// DELETE /api/no-fly-zones/:id - Excluir zona
router.delete("/:id", (req, res) =>
  noFlyZoneController.deleteNoFlyZone(req, res)
);

// POST /api/no-fly-zones/:id/points - Adicionar pontos à zona
router.post("/:id/points", validateNoFlyZonePoints, (req, res) =>
  noFlyZoneController.addPointsToZone(req, res)
);

// DELETE /api/no-fly-zones/:id/points - Remover pontos da zona
router.delete("/:id/points", (req, res) =>
  noFlyZoneController.removePointsFromZone(req, res)
);

// GET /api/no-fly-zones/check/:x/:y - Verificar se ponto está em zona de exclusão
router.get("/check/:x/:y", (req, res) =>
  noFlyZoneController.checkPointInNoFlyZone(req, res)
);

export default router;
