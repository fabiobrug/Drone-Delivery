import express from "express";
import { RoutingController } from "../controllers/RoutingController.js";
import { validateRouteCalculation } from "../middleware/validation.js";

const router = express.Router();
const routingController = new RoutingController();

// POST /api/routing/calculate - Calcular rota entre pontos
router.post("/calculate", validateRouteCalculation, (req, res) =>
  routingController.calculateRoute(req, res)
);

// POST /api/routing/optimize - Otimizar rotas
router.post("/optimize", (req, res) =>
  routingController.optimizeRoutes(req, res)
);

// GET /api/routing/avoid-zones - Verificar zonas de exclusão
router.get("/avoid-zones", (req, res) =>
  routingController.getAvoidZones(req, res)
);

// POST /api/routing/check-route - Verificar se rota evita zonas
router.post("/check-route", (req, res) =>
  routingController.checkRouteAvoidsZones(req, res)
);

// GET /api/routing/waypoints/:droneId - Obter waypoints do drone
router.get("/waypoints/:droneId", (req, res) =>
  routingController.getDroneWaypoints(req, res)
);

// POST /api/routing/update-waypoints/:droneId - Atualizar waypoints do drone
router.post("/update-waypoints/:droneId", (req, res) =>
  routingController.updateDroneWaypoints(req, res)
);

// GET /api/routing/delivery-time/:droneId/:orderId - Calcular tempo de entrega
router.get("/delivery-time/:droneId/:orderId", (req, res) =>
  routingController.calculateDeliveryTime(req, res)
);

// GET /api/routing/delivery-times/:droneId - Calcular tempos de entrega do drone
router.get("/delivery-times/:droneId", (req, res) =>
  routingController.calculateDroneDeliveryTimes(req, res)
);

export default router;
