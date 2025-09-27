import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env.js";

// Import routes
import droneRoutes from "./routes/DroneRoutes.js";
import droneTypeRoutes from "./routes/DroneTypeRoutes.js";
import orderRoutes from "./routes/OrderRoutes.js";
import noFlyZoneRoutes from "./routes/NoFlyZonesRoutes.js";
import configRoutes from "./routes/ConfigRoutes.js";
import statsRoutes from "./routes/StatsRoute.js";
import routingRoutes from "./routes/RoutingRoutes.js";

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/drones", droneRoutes);
app.use("/api/drone-types", droneTypeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/no-fly-zones", noFlyZoneRoutes);
app.use("/api/config", configRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/routing", routingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      ...(config.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found",
      path: req.originalUrl,
    },
  });
});

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

export default app;
