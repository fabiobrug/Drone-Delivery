import express from "express";
import { ConfigController } from "../controllers/ConfigController.js";
import { validateConfigUpdate } from "../middleware/validation.js";

const router = express.Router();
const configController = new ConfigController();

// GET /api/config - Buscar configurações
router.get("/", (req, res) => configController.getConfig(req, res));

// PUT /api/config - Atualizar configurações
router.put("/", validateConfigUpdate, (req, res) =>
  configController.updateConfig(req, res)
);

// GET /api/config/optimization - Configurações de otimização
router.get("/optimization", (req, res) =>
  configController.getOptimizationConfig(req, res)
);

// PUT /api/config/optimization - Atualizar otimização
router.put("/optimization", (req, res) =>
  configController.updateOptimizationConfig(req, res)
);

// GET /api/config/system - Configurações do sistema
router.get("/system", (req, res) => configController.getSystemConfig(req, res));

// PUT /api/config/system - Atualizar configurações do sistema
router.put("/system", (req, res) =>
  configController.updateSystemConfig(req, res)
);

export default router;
