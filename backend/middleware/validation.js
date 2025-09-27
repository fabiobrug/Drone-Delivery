import { body, param, validationResult } from "express-validator";

// Middleware para verificar erros de validação
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

// Validações para Drones
export const validateDrone = [
  body("serialNumber")
    .notEmpty()
    .withMessage("Serial number is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Serial number must be between 3 and 50 characters"),
  body("typeId")
    .notEmpty()
    .withMessage("Type ID is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Type ID must be between 1 and 50 characters"),
  body("x").optional().isNumeric().withMessage("X coordinate must be a number"),
  body("y").optional().isNumeric().withMessage("Y coordinate must be a number"),
  handleValidationErrors,
];

export const validateDroneUpdate = [
  body("serialNumber")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("Serial number must be between 3 and 50 characters"),
  body("x").optional().isNumeric().withMessage("X coordinate must be a number"),
  body("y").optional().isNumeric().withMessage("Y coordinate must be a number"),
  body("battery")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Battery must be between 0 and 100"),
  body("currentLoad")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Current load must be a positive number"),
  handleValidationErrors,
];

export const validateDroneStatus = [
  body("status")
    .isIn(["idle", "loading", "flying", "returning"])
    .withMessage("Status must be one of: idle, loading, flying, returning"),
  handleValidationErrors,
];

// Validações para Tipos de Drones
export const validateDroneType = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("capacity")
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage("Capacity must be between 0.1 and 1000 kg"),
  body("batteryRange")
    .isFloat({ min: 1, max: 1000 })
    .withMessage("Battery range must be between 1 and 1000 km"),
  body("maxSpeed")
    .isFloat({ min: 1, max: 500 })
    .withMessage("Max speed must be between 1 and 500 km/h"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must be less than 500 characters"),
  handleValidationErrors,
];

export const validateDroneTypeUpdate = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("capacity")
    .optional()
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage("Capacity must be between 0.1 and 1000 kg"),
  body("batteryRange")
    .optional()
    .isFloat({ min: 1, max: 1000 })
    .withMessage("Battery range must be between 1 and 1000 km"),
  body("maxSpeed")
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage("Max speed must be between 1 and 500 km/h"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must be less than 500 characters"),
  handleValidationErrors,
];

// Validações para Pedidos
export const validateOrder = [
  body("x")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("X coordinate must be between 0 and 1000"),
  body("y")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Y coordinate must be between 0 and 1000"),
  body("weight")
    .isFloat({ min: 0.1, max: 100 })
    .withMessage("Weight must be between 0.1 and 100 kg"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be one of: low, medium, high"),
  handleValidationErrors,
];

export const validateOrderUpdate = [
  body("x")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("X coordinate must be between 0 and 1000"),
  body("y")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Y coordinate must be between 0 and 1000"),
  body("weight")
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage("Weight must be between 0.1 and 100 kg"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be one of: low, medium, high"),
  handleValidationErrors,
];

export const validateOrderStatus = [
  body("status")
    .isIn(["pending", "allocated", "in-route", "delivered"])
    .withMessage(
      "Status must be one of: pending, allocated, in-route, delivered"
    ),
  handleValidationErrors,
];

// Validações para Zonas de Exclusão
export const validateNoFlyZone = [
  body("name")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Name must be less than 100 characters"),
  body("points")
    .optional()
    .isArray({ min: 3 })
    .withMessage("Points must be an array with at least 3 points"),
  body("points.*.x")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Point X coordinate must be between 0 and 1000"),
  body("points.*.y")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Point Y coordinate must be between 0 and 1000"),
  handleValidationErrors,
];

export const validateNoFlyZonePoints = [
  body("points")
    .isArray({ min: 3 })
    .withMessage("Points must be an array with at least 3 points"),
  body("points.*.x")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Point X coordinate must be between 0 and 1000"),
  body("points.*.y")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Point Y coordinate must be between 0 and 1000"),
  handleValidationErrors,
];

// Validações para Configurações
export const validateConfigUpdate = [
  body("optimizationEnabled")
    .optional()
    .isBoolean()
    .withMessage("Optimization enabled must be a boolean"),
  body("optimizationMethod")
    .optional()
    .isIn(["priority-distance-weight", "priority-only", "distance-only"])
    .withMessage(
      "Optimization method must be one of: priority-distance-weight, priority-only, distance-only"
    ),
  body("updateInterval")
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage("Update interval must be between 1 and 60 seconds"),
  body("realTimeNotifications")
    .optional()
    .isBoolean()
    .withMessage("Real time notifications must be a boolean"),
  body("activityLogging")
    .optional()
    .isBoolean()
    .withMessage("Activity logging must be a boolean"),
  handleValidationErrors,
];

// Validações para Roteamento
export const validateRouteCalculation = [
  body("startX")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Start X coordinate must be between 0 and 1000"),
  body("startY")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Start Y coordinate must be between 0 and 1000"),
  body("endX")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("End X coordinate must be between 0 and 1000"),
  body("endY")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("End Y coordinate must be between 0 and 1000"),
  handleValidationErrors,
];

// Validação de parâmetros de ID
export const validateId = [
  param("id")
    .isLength({ min: 1, max: 50 })
    .withMessage("ID must be between 1 and 50 characters"),
  handleValidationErrors,
];
