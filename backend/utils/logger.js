import winston from "winston";
import { config } from "../config/env.js";

// Configuração dos níveis de log
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Configuração das cores para cada nível
const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Adicionar cores ao winston
winston.addColors(logColors);

// Configuração do formato dos logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Configuração dos transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: config.LOG_LEVEL || "info",
    format: logFormat,
  }),
];

// Adicionar file transport em produção
if (config.NODE_ENV === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

// Criar o logger
const logger = winston.createLogger({
  level: config.LOG_LEVEL || "info",
  levels: logLevels,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Middleware para logging de requests HTTP
export const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 400) {
      logger.error(message);
    } else {
      logger.http(message);
    }
  });

  next();
};

// Função para logging de erros
export const logError = (error, context = {}) => {
  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Função para logging de atividades do sistema
export const logActivity = (activity, data = {}) => {
  logger.info(`Activity: ${activity}`, {
    data,
    timestamp: new Date().toISOString(),
  });
};

// Função para logging de performance
export const logPerformance = (operation, duration, details = {}) => {
  logger.info(`Performance: ${operation} took ${duration}ms`, {
    operation,
    duration,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Função para logging de segurança
export const logSecurity = (event, details = {}) => {
  logger.warn(`Security: ${event}`, {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Função para logging de debug
export const logDebug = (message, data = {}) => {
  logger.debug(message, {
    data,
    timestamp: new Date().toISOString(),
  });
};

export default logger;
