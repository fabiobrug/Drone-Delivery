import express from "express";
import { StatsController } from "../controllers/StatsController.js";

const router = express.Router();
const statsController = new StatsController();

// GET /api/stats - Estatísticas gerais
router.get("/", (req, res) => statsController.getGeneralStats(req, res));

// GET /api/stats/drones - Estatísticas dos drones
router.get("/drones", (req, res) => statsController.getDroneStats(req, res));

// GET /api/stats/orders - Estatísticas dos pedidos
router.get("/orders", (req, res) => statsController.getOrderStats(req, res));

// GET /api/stats/delivery - Estatísticas de entrega
router.get("/delivery", (req, res) =>
  statsController.getDeliveryStats(req, res)
);

// GET /api/stats/efficiency - Eficiência do sistema
router.get("/efficiency", (req, res) =>
  statsController.getEfficiencyStats(req, res)
);

// GET /api/stats/real-time - Estatísticas em tempo real
router.get("/real-time", (req, res) =>
  statsController.getRealTimeStats(req, res)
);

// GET /api/stats/dashboard - Dados para dashboard
router.get("/dashboard", (req, res) =>
  statsController.getDashboardData(req, res)
);

export default router;
