// Status dos Drones
export const DRONE_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  FLYING: "flying",
  RETURNING: "returning",
};

// Status dos Pedidos
export const ORDER_STATUS = {
  PENDING: "pending",
  ALLOCATED: "allocated",
  IN_ROUTE: "in-route",
  DELIVERED: "delivered",
};

// Prioridades dos Pedidos
export const ORDER_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

// Métodos de Otimização
export const OPTIMIZATION_METHODS = {
  PRIORITY_DISTANCE_WEIGHT: "priority-distance-weight",
  PRIORITY_ONLY: "priority-only",
  DISTANCE_ONLY: "distance-only",
};

// Configurações do Sistema
export const SYSTEM_CONFIG = {
  MAX_DRONES: 50,
  MAX_ORDERS: 1000,
  GRID_SIZE: 100,
  CELL_SIZE: 20,
  BASE_POSITION: { x: 50, y: 50 },
  MAP_BOUNDS: {
    minX: 0,
    minY: 0,
    maxX: 1000,
    maxY: 1000,
  },
  UPDATE_INTERVAL: 5000, // 5 segundos
  MAX_DELIVERY_TIME: 30, // 30 minutos
};

// Códigos de Erro
export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  CAPACITY_EXCEEDED: "CAPACITY_EXCEEDED",
  DRONE_UNAVAILABLE: "DRONE_UNAVAILABLE",
  INVALID_COORDINATES: "INVALID_COORDINATES",
  ROUTE_NOT_FOUND: "ROUTE_NOT_FOUND",
  DATABASE_ERROR: "DATABASE_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};

// Mensagens de Erro
export const ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: "Validation failed",
  [ERROR_CODES.NOT_FOUND]: "Resource not found",
  [ERROR_CODES.DUPLICATE_ENTRY]: "Resource already exists",
  [ERROR_CODES.CAPACITY_EXCEEDED]: "Capacity exceeded",
  [ERROR_CODES.DRONE_UNAVAILABLE]: "Drone is not available",
  [ERROR_CODES.INVALID_COORDINATES]: "Invalid coordinates",
  [ERROR_CODES.ROUTE_NOT_FOUND]: "Route not found",
  [ERROR_CODES.DATABASE_ERROR]: "Database error",
  [ERROR_CODES.UNAUTHORIZED]: "Unauthorized access",
  [ERROR_CODES.FORBIDDEN]: "Access forbidden",
  [ERROR_CODES.INTERNAL_ERROR]: "Internal server error",
};

// Códigos de Sucesso
export const SUCCESS_CODES = {
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  DELETED: "DELETED",
  ALLOCATED: "ALLOCATED",
  DEALLOCATED: "DEALLOCATED",
  ROUTE_CALCULATED: "ROUTE_CALCULATED",
  OPTIMIZED: "OPTIMIZED",
};

// Mensagens de Sucesso
export const SUCCESS_MESSAGES = {
  [SUCCESS_CODES.CREATED]: "Resource created successfully",
  [SUCCESS_CODES.UPDATED]: "Resource updated successfully",
  [SUCCESS_CODES.DELETED]: "Resource deleted successfully",
  [SUCCESS_CODES.ALLOCATED]: "Order allocated successfully",
  [SUCCESS_CODES.DEALLOCATED]: "Order deallocated successfully",
  [SUCCESS_CODES.ROUTE_CALCULATED]: "Route calculated successfully",
  [SUCCESS_CODES.OPTIMIZED]: "Routes optimized successfully",
};

// Configurações de Validação
export const VALIDATION_LIMITS = {
  SERIAL_NUMBER: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  COORDINATES: {
    MIN: 0,
    MAX: 1000,
  },
  WEIGHT: {
    MIN: 0.1,
    MAX: 100,
  },
  CAPACITY: {
    MIN: 0.1,
    MAX: 1000,
  },
  BATTERY: {
    MIN: 0,
    MAX: 100,
  },
  SPEED: {
    MIN: 1,
    MAX: 500,
  },
  RANGE: {
    MIN: 1,
    MAX: 1000,
  },
};

// Configurações de Performance
export const PERFORMANCE_LIMITS = {
  MAX_CONCURRENT_REQUESTS: 100,
  REQUEST_TIMEOUT: 30000, // 30 segundos
  RATE_LIMIT_WINDOW: 900000, // 15 minutos
  RATE_LIMIT_MAX: 100,
  CACHE_TTL: 300, // 5 minutos
};

// Configurações de Logging
export const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  HTTP: "http",
  DEBUG: "debug",
};

// Configurações de WebSocket
export const WEBSOCKET_EVENTS = {
  DRONE_UPDATE: "drone_update",
  ORDER_UPDATE: "order_update",
  ROUTE_UPDATE: "route_update",
  SYSTEM_STATUS: "system_status",
  ERROR: "error",
};

// Configurações de Cache
export const CACHE_KEYS = {
  DRONES: "drones",
  ORDERS: "orders",
  DRONE_TYPES: "drone_types",
  NO_FLY_ZONES: "no_fly_zones",
  CONFIG: "config",
  STATS: "stats",
};

// Configurações de Paginação
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Configurações de Filtros
export const FILTER_OPERATORS = {
  EQUALS: "eq",
  NOT_EQUALS: "neq",
  GREATER_THAN: "gt",
  GREATER_THAN_OR_EQUAL: "gte",
  LESS_THAN: "lt",
  LESS_THAN_OR_EQUAL: "lte",
  LIKE: "like",
  IN: "in",
  NOT_IN: "not_in",
  IS_NULL: "is",
  IS_NOT_NULL: "not.is",
};

// Configurações de Ordenação
export const SORT_ORDERS = {
  ASC: "asc",
  DESC: "desc",
};

// Configurações de Timezone
export const TIMEZONE = "America/Sao_Paulo";

// Configurações de Formato de Data
export const DATE_FORMATS = {
  ISO: "YYYY-MM-DDTHH:mm:ss.SSSZ",
  DATETIME: "YYYY-MM-DD HH:mm:ss",
  DATE: "YYYY-MM-DD",
  TIME: "HH:mm:ss",
};

// Configurações de Encoding
export const ENCODING = "utf8";

// Configurações de CORS
export const CORS_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

// Configurações de Rate Limiting
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
};

// Configurações de Health Check
export const HEALTH_CHECK = {
  INTERVAL: 30000, // 30 segundos
  TIMEOUT: 5000, // 5 segundos
  THRESHOLD: 3, // 3 falhas consecutivas
};

// Configurações de Monitoramento
export const MONITORING = {
  ENABLED: true,
  METRICS_INTERVAL: 60000, // 1 minuto
  ALERT_THRESHOLDS: {
    CPU: 80,
    MEMORY: 80,
    DISK: 90,
    RESPONSE_TIME: 5000,
  },
};
