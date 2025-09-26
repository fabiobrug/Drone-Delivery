"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useDroneContext } from "../../context/DroneContext";

const InteractiveMap = () => {
  const {
    drones,
    orders,
    noFlyZones,
    addNoFlyZone,
    removeNoFlyZone,
    calculateDeliveryRoute,
  } = useDroneContext();
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [animatingDrones, setAnimatingDrones] = useState(new Set());
  const mapRef = useRef(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [isRemovingZone, setIsRemovingZone] = useState(false);
  const [zonePoints, setZonePoints] = useState([]);
  const [deliveryRoute, setDeliveryRoute] = useState([]);

  const GRID_SIZE = 50;
  const CELL_SIZE = 16;
  const BASE_POSITION = { x: 25, y: 25 };

  const getTerrainType = useCallback((x, y) => {
    // Main streets (light gray)
    if (
      x === 0 ||
      x === 49 ||
      y === 0 ||
      y === 49 ||
      x % 10 === 0 ||
      y % 10 === 0 ||
      (x >= 9 && x <= 11) ||
      (x >= 19 && x <= 21) ||
      (x >= 29 && x <= 31) ||
      (x >= 39 && x <= 41) ||
      (y >= 9 && y <= 11) ||
      (y >= 19 && y <= 21) ||
      (y >= 29 && y <= 31) ||
      (y >= 39 && y <= 41)
    ) {
      return {
        type: "street",
        color: "bg-slate-300",
        border: "border-slate-400",
      };
    }

    // Commercial center (blue)
    else if (x >= 22 && x <= 28 && y >= 22 && y <= 28) {
      return {
        type: "commercial",
        color: "bg-blue-200",
        border: "border-blue-300",
      };
    }

    // Secondary commercial areas
    else if (
      (x >= 12 && x <= 18 && y >= 12 && y <= 18) ||
      (x >= 32 && x <= 38 && y >= 32 && y <= 38)
    ) {
      return {
        type: "commercial",
        color: "bg-blue-100",
        border: "border-blue-200",
      };
    }

    // Industrial zones (dark gray)
    else if (
      (x >= 5 && x <= 15 && y >= 5 && y <= 15) ||
      (x >= 35 && x <= 45 && y >= 35 && y <= 45)
    ) {
      return {
        type: "industrial",
        color: "bg-slate-600",
        border: "border-slate-500",
      };
    }

    // Residential areas (green)
    else if (
      (x >= 2 && x <= 8 && y >= 2 && y <= 8) ||
      (x >= 42 && x <= 48 && y >= 2 && y <= 8) ||
      (x >= 2 && x <= 8 && y >= 42 && y <= 48) ||
      (x >= 42 && x <= 48 && y >= 42 && y <= 48)
    ) {
      return {
        type: "residential",
        color: "bg-emerald-200",
        border: "border-emerald-300",
      };
    }

    // Parks (dark green)
    else if (
      (x >= 8 && x <= 12 && y >= 8 && y <= 12) ||
      (x >= 38 && x <= 42 && y >= 38 && y <= 42)
    ) {
      return {
        type: "park",
        color: "bg-emerald-600",
        border: "border-emerald-500",
      };
    }

    // Water bodies (blue)
    else if (
      (x >= 15 && x <= 20 && y >= 0 && y <= 5) ||
      (x >= 30 && x <= 35 && y >= 45 && y <= 49)
    ) {
      return { type: "water", color: "bg-cyan-400", border: "border-cyan-500" };
    }

    // Default terrain
    else {
      return {
        type: "default",
        color: "bg-slate-500",
        border: "border-slate-600",
      };
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const flyingDrones = drones.filter((d) => d.status === "flying");
      if (flyingDrones.length > 0) {
        setAnimatingDrones(new Set(flyingDrones.map((d) => d.id)));
        setTimeout(() => setAnimatingDrones(new Set()), 800);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [drones]);

  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        setAnimatingDrones(new Set());
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      if (isCreatingZone || isRemovingZone) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    },
    [isCreatingZone, isRemovingZone, panOffset]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging && !isCreatingZone && !isRemovingZone) {
        const newPanOffset = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        };

        const maxPan = GRID_SIZE * CELL_SIZE * zoom * 0.5;
        newPanOffset.x = Math.max(-maxPan, Math.min(maxPan, newPanOffset.x));
        newPanOffset.y = Math.max(-maxPan, Math.min(maxPan, newPanOffset.y));

        setPanOffset(newPanOffset);
      }
    },
    [isDragging, isCreatingZone, isRemovingZone, dragStart, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback(
    (e) => {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.3, Math.min(3, zoom * delta));

      const rect = mapRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomRatio = newZoom / zoom;
      const newPanOffset = {
        x: mouseX - (mouseX - panOffset.x) * zoomRatio,
        y: mouseY - (mouseY - panOffset.y) * zoomRatio,
      };

      setZoom(newZoom);
      setPanOffset(newPanOffset);
    },
    [zoom, panOffset]
  );

  const resetView = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const handleTouchStart = useCallback(
    (e) => {
      if (isCreatingZone || isRemovingZone) return;

      if (e.touches.length === 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - panOffset.x,
          y: e.touches[0].clientY - panOffset.y,
        });
      } else if (e.touches.length === 2) {
        const distance = Math.sqrt(
          Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
            Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
        );
        setLastTouchDistance(distance);
      }
    },
    [isCreatingZone, isRemovingZone, panOffset]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (
        e.touches.length === 1 &&
        isDragging &&
        !isCreatingZone &&
        !isRemovingZone
      ) {
        const newPanOffset = {
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y,
        };

        const maxPan = GRID_SIZE * CELL_SIZE * zoom * 0.5;
        newPanOffset.x = Math.max(-maxPan, Math.min(maxPan, newPanOffset.x));
        newPanOffset.y = Math.max(-maxPan, Math.min(maxPan, newPanOffset.y));

        setPanOffset(newPanOffset);
      } else if (e.touches.length === 2) {
        const distance = Math.sqrt(
          Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
            Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
        );

        if (lastTouchDistance > 0) {
          const scale = distance / lastTouchDistance;
          const newZoom = Math.max(0.3, Math.min(3, zoom * scale));
          setZoom(newZoom);
        }
        setLastTouchDistance(distance);
      }
    },
    [
      isDragging,
      isCreatingZone,
      isRemovingZone,
      dragStart,
      zoom,
      lastTouchDistance,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastTouchDistance(0);
  }, []);

  // Zone creation/removal functions
  const toggleZoneCreation = () => {
    setIsCreatingZone(!isCreatingZone);
    setIsRemovingZone(false);
    setZonePoints([]);
    setSelectedDrone(null);
  };

  const toggleZoneRemoval = () => {
    setIsRemovingZone(!isRemovingZone);
    setIsCreatingZone(false);
    setZonePoints([]);
    setSelectedDrone(null);
  };

  const handleMapClick = (e) => {
    if (isCreatingZone && !isDragging) {
      const rect = mapRef.current.getBoundingClientRect();
      const x = Math.floor(
        (e.clientX - rect.left - panOffset.x) / (CELL_SIZE * zoom)
      );
      const y = Math.floor(
        (e.clientY - rect.top - panOffset.y) / (CELL_SIZE * zoom)
      );

      if (
        zonePoints.length > 2 &&
        zonePoints[0].x === x &&
        zonePoints[0].y === y
      ) {
        addNoFlyZone({ points: zonePoints });
        setIsCreatingZone(false);
        setZonePoints([]);
      } else {
        setZonePoints([...zonePoints, { x, y }]);
      }
    } else if (isRemovingZone && !isDragging) {
      const rect = mapRef.current.getBoundingClientRect();
      const x = Math.floor(
        (e.clientX - rect.left - panOffset.x) / (CELL_SIZE * zoom)
      );
      const y = Math.floor(
        (e.clientY - rect.top - panOffset.y) / (CELL_SIZE * zoom)
      );

      const clickedZone = noFlyZones.find((zone) => {
        const minX = Math.min(...zone.points.map((p) => p.x));
        const maxX = Math.max(...zone.points.map((p) => p.x));
        const minY = Math.min(...zone.points.map((p) => p.y));
        const maxY = Math.max(...zone.points.map((p) => p.y));
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
      });

      if (clickedZone) {
        removeNoFlyZone(clickedZone.id);
        setIsRemovingZone(false);
      }
    } else if (!isDragging) {
      setSelectedDrone(null);
    }
  };

  const getDroneColor = (status) => {
    switch (status) {
      case "idle":
        return "text-emerald-400 bg-emerald-900/20 border-emerald-400";
      case "loading":
        return "text-amber-400 bg-amber-900/20 border-amber-400";
      case "flying":
        return "text-sky-400 bg-sky-900/20 border-sky-400";
      case "returning":
        return "text-rose-400 bg-rose-900/20 border-rose-400";
      default:
        return "text-slate-400 bg-slate-900/20 border-slate-400";
    }
  };

  const getOrderColor = (priority) => {
    switch (priority) {
      case "low":
        return "text-emerald-300 bg-emerald-900/30 border-emerald-300";
      case "medium":
        return "text-amber-400 bg-amber-900/30 border-amber-400";
      case "high":
        return "text-rose-400 bg-rose-900/30 border-rose-400";
      default:
        return "text-slate-400 bg-slate-900/30 border-slate-400";
    }
  };

  const renderGrid = () => {
    const cells = [];
    const cellSize = CELL_SIZE * zoom;

    // Only render visible cells for better performance
    const startX = Math.max(0, Math.floor(-panOffset.x / cellSize) - 2);
    const endX = Math.min(
      GRID_SIZE,
      Math.ceil((-panOffset.x + window.innerWidth) / cellSize) + 2
    );
    const startY = Math.max(0, Math.floor(-panOffset.y / cellSize) - 2);
    const endY = Math.min(
      GRID_SIZE,
      Math.ceil((-panOffset.y + window.innerHeight) / cellSize) + 2
    );

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const terrain = getTerrainType(x, y);
        cells.push(
          <div
            key={`${x}-${y}`}
            className={`border ${terrain.border} ${
              terrain.color
            } hover:opacity-80 transition-opacity duration-150 ${
              isCreatingZone ? "hover:bg-rose-300 hover:border-rose-400" : ""
            }`}
            style={{
              width: cellSize,
              height: cellSize,
              position: "absolute",
              left: x * cellSize + panOffset.x,
              top: y * cellSize + panOffset.y,
            }}
            title={`${terrain.type} - (${x}, ${y})`}
          />
        );
      }
    }
    return cells;
  };

  const renderNoFlyZones = () => {
    const cellSize = CELL_SIZE * zoom;
    return noFlyZones.map((zone) => (
      <div
        key={zone.id}
        className="absolute bg-rose-500/20 border-2 border-rose-500 border-dashed animate-pulse"
        style={{
          left:
            Math.min(...zone.points.map((p) => p.x)) * cellSize + panOffset.x,
          top:
            Math.min(...zone.points.map((p) => p.y)) * cellSize + panOffset.y,
          width:
            (Math.max(...zone.points.map((p) => p.x)) -
              Math.min(...zone.points.map((p) => p.x))) *
            cellSize,
          height:
            (Math.max(...zone.points.map((p) => p.y)) -
              Math.min(...zone.points.map((p) => p.y))) *
            cellSize,
        }}
      />
    ));
  };

  // Zone creation rendering
  const renderZoneCreation = () => {
    const cellSize = CELL_SIZE * zoom;
    return (
      <>
        {zonePoints.map((point, index) => (
          <div
            key={index}
            className="absolute bg-rose-600 border-2 border-rose-400 rounded-full shadow-lg"
            style={{
              left: point.x * cellSize + panOffset.x - 6,
              top: point.y * cellSize + panOffset.y - 6,
              width: 12,
              height: 12,
            }}
          />
        ))}
        {zonePoints.length > 1 && (
          <svg
            className="absolute pointer-events-none"
            style={{
              left: panOffset.x,
              top: panOffset.y,
              width: GRID_SIZE * cellSize,
              height: GRID_SIZE * cellSize,
            }}
          >
            {zonePoints.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = zonePoints[index - 1];
              return (
                <line
                  key={index}
                  x1={prevPoint.x * cellSize}
                  y1={prevPoint.y * cellSize}
                  x2={point.x * cellSize}
                  y2={point.y * cellSize}
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="6,6"
                />
              );
            })}
          </svg>
        )}
      </>
    );
  };

  const renderBase = () => {
    const cellSize = CELL_SIZE * zoom;
    return (
      <div
        className="absolute flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 rounded-full border-4 border-blue-300 shadow-2xl animate-pulse"
        style={{
          left: BASE_POSITION.x * cellSize + panOffset.x - cellSize * 0.8,
          top: BASE_POSITION.y * cellSize + panOffset.y - cellSize * 0.8,
          width: cellSize * 1.6,
          height: cellSize * 1.6,
        }}
      >
        <div className="absolute inset-0 bg-blue-400/30 rounded-full animate-ping"></div>
        <svg
          className="w-8 h-8 text-white z-10"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-900/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap font-semibold">
          Central de Distribuição
        </div>
      </div>
    );
  };

  const calculateDeliveryTime = (drone) => {
    if (drone.status !== "flying") return null;
    const distance = Math.sqrt(
      Math.pow(drone.x - drone.targetX, 2) +
        Math.pow(drone.y - drone.targetY, 2)
    );
    const speed = 2; // cells per minute
    return Math.ceil(distance / speed);
  };

  const renderDrones = () => {
    const cellSize = CELL_SIZE * zoom;

    return drones.map((drone) => {
      const deliveryTime = calculateDeliveryTime(drone);

      return (
        <div key={drone.id} className="absolute">
          {/* Enhanced flight path for flying drones */}
          {drone.status === "flying" && drone.targetX && drone.targetY && (
            <svg
              className="absolute pointer-events-none z-10"
              style={{
                left: Math.min(drone.x, drone.targetX) * cellSize + panOffset.x,
                top: Math.min(drone.y, drone.targetY) * cellSize + panOffset.y,
                width: Math.abs(drone.targetX - drone.x) * cellSize,
                height: Math.abs(drone.targetY - drone.y) * cellSize,
              }}
            >
              <defs>
                <linearGradient
                  id={`gradient-${drone.id}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <line
                x1={(drone.x - Math.min(drone.x, drone.targetX)) * cellSize}
                y1={(drone.y - Math.min(drone.y, drone.targetY)) * cellSize}
                x2={
                  (drone.targetX - Math.min(drone.x, drone.targetX)) * cellSize
                }
                y2={
                  (drone.targetY - Math.min(drone.y, drone.targetY)) * cellSize
                }
                stroke={`url(#gradient-${drone.id})`}
                strokeWidth="4"
                strokeDasharray="12,8"
                className="animate-pulse"
                style={{
                  animation: "dash 3s linear infinite",
                }}
              />
              {/* Direction arrow */}
              <polygon
                points={`${
                  (drone.targetX - Math.min(drone.x, drone.targetX)) *
                    cellSize -
                  8
                },${
                  (drone.targetY - Math.min(drone.y, drone.targetY)) *
                    cellSize -
                  4
                } ${
                  (drone.targetX - Math.min(drone.x, drone.targetX)) * cellSize
                },${
                  (drone.targetY - Math.min(drone.y, drone.targetY)) * cellSize
                } ${
                  (drone.targetX - Math.min(drone.x, drone.targetX)) *
                    cellSize -
                  8
                },${
                  (drone.targetY - Math.min(drone.y, drone.targetY)) *
                    cellSize +
                  4
                }`}
                fill="#60A5FA"
                className="animate-pulse"
              />
            </svg>
          )}

          {/* Enhanced drone icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDrone(selectedDrone === drone.id ? null : drone.id);

              // Se o drone tem pedidos alocados, calcular e mostrar a rota
              const droneOrders = orders.filter(
                (order) => order.droneId === drone.id
              );
              if (droneOrders.length > 0) {
                // Usar o primeiro pedido como destino
                const targetOrder = droneOrders[0];
                const route = calculateDeliveryRoute(
                  drone.x,
                  drone.y,
                  targetOrder.x,
                  targetOrder.y,
                  noFlyZones
                );
                setDeliveryRoute(route);
              } else {
                setDeliveryRoute([]);
              }
            }}
            className={`absolute flex items-center justify-center rounded-full border-3 transition-all duration-300 hover:scale-125 transform shadow-lg ${
              selectedDrone === drone.id ? "ring-4 ring-white/50 scale-125" : ""
            } ${getDroneColor(drone.status)} ${
              drone.status !== "idle" ? "animate-pulse" : ""
            } ${animatingDrones.has(drone.id) ? "animate-bounce" : ""}`}
            style={{
              left: drone.x * cellSize + panOffset.x - 12,
              top: drone.y * cellSize + panOffset.y - 12,
              width: 24,
              height: 24,
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
            </svg>
            {/* Battery indicator */}
            <div
              className={`absolute -top-1 -right-1 w-2 h-1 rounded-full ${
                drone.battery > 50
                  ? "bg-emerald-400"
                  : drone.battery > 20
                  ? "bg-amber-400"
                  : "bg-rose-400"
              }`}
            />
          </button>

          {/* Enhanced drone info tooltip */}
          {selectedDrone === drone.id && (
            <div
              className="absolute bg-slate-900/95 backdrop-blur-sm border border-slate-600 rounded-xl p-4 shadow-2xl z-20 min-w-64 animate-in fade-in-0 zoom-in-95 duration-200"
              style={{
                left: drone.x * cellSize + panOffset.x + 30,
                top: drone.y * cellSize + panOffset.y - 20,
              }}
            >
              <div className="text-sm">
                <div className="font-bold text-white mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                  </svg>
                  {drone.serialNumber}
                </div>
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span
                      className={`font-semibold ${
                        getDroneColor(drone.status).split(" ")[0]
                      }`}
                    >
                      {drone.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bateria:</span>
                    <div className="flex items-center">
                      <div className="w-12 h-2 bg-slate-700 rounded-full mr-2">
                        <div
                          className={`h-full rounded-full ${
                            drone.battery > 50
                              ? "bg-emerald-400"
                              : drone.battery > 20
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                          style={{ width: `${drone.battery}%` }}
                        />
                      </div>
                      <span className="font-semibold">{drone.battery}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Carga:</span>
                    <span className="font-semibold">
                      {drone.currentLoad}/{drone.capacity} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Posição:</span>
                    <span className="font-mono">
                      ({drone.x}, {drone.y})
                    </span>
                  </div>
                  {deliveryTime && (
                    <div className="flex items-center justify-between border-t border-slate-700 pt-2">
                      <span>Tempo estimado:</span>
                      <span className="font-semibold text-sky-400">
                        {deliveryTime} min
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  const renderOrders = () => {
    const cellSize = CELL_SIZE * zoom;

    return orders
      .filter(
        (order) => order.status === "pending" || order.status === "allocated"
      )
      .map((order) => (
        <div key={order.id} className="absolute">
          {/* Delivery pin */}
          <div
            className={`absolute flex items-center justify-center transition-all duration-300 hover:scale-110 ${getOrderColor(
              order.priority
            )} ${order.priority === "high" ? "animate-pulse" : ""} shadow-lg`}
            style={{
              left: order.x * cellSize + panOffset.x - 8,
              top: order.y * cellSize + panOffset.y - 16,
              width: 16,
              height: 20,
            }}
            title={`Pedido ${order.id} - ${order.weight}kg - Prioridade ${order.priority}`}
          >
            {/* Pin shape */}
            <svg className="w-4 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>

          {/* Priority indicator */}
          <div
            className={`absolute w-2 h-2 rounded-full ${
              order.priority === "high"
                ? "bg-rose-400 animate-ping"
                : order.priority === "medium"
                ? "bg-amber-400"
                : "bg-emerald-400"
            }`}
            style={{
              left: order.x * cellSize + panOffset.x + 6,
              top: order.y * cellSize + panOffset.y - 18,
            }}
          />
        </div>
      ));
  };

  const renderDeliveryRoute = () => {
    if (deliveryRoute.length === 0) return null;

    const cellSize = CELL_SIZE * zoom;

    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {/* Rota principal - linha simples e forte */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          <path
            d={deliveryRoute
              .map((point, index) => {
                const x = point.x * CELL_SIZE + CELL_SIZE / 2;
                const y = point.y * CELL_SIZE + CELL_SIZE / 2;
                return `${index === 0 ? "M" : "L"} ${x} ${y}`;
              })
              .join(" ")}
            stroke="#FF0000"
            strokeWidth={4 / zoom}
            fill="none"
          />

          {/* Pontos de início e fim */}
          {deliveryRoute.length > 0 && (
            <>
              {/* Ponto de início */}
              <circle
                cx={deliveryRoute[0].x * CELL_SIZE + CELL_SIZE / 2}
                cy={deliveryRoute[0].y * CELL_SIZE + CELL_SIZE / 2}
                r={6 / zoom}
                fill="#00FF00"
              />
              {/* Ponto de destino */}
              <circle
                cx={
                  deliveryRoute[deliveryRoute.length - 1].x * CELL_SIZE +
                  CELL_SIZE / 2
                }
                cy={
                  deliveryRoute[deliveryRoute.length - 1].y * CELL_SIZE +
                  CELL_SIZE / 2
                }
                r={6 / zoom}
                fill="#FF0000"
              />
            </>
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden h-full flex flex-col shadow-2xl">
      <div className="bg-slate-800 px-6 py-3 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-sky-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
            </svg>
            Mapa Interativo da Cidade
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
              Zoom: {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={toggleZoneCreation}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isCreatingZone
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg"
                  : "bg-slate-600 hover:bg-slate-700 text-white"
              }`}
            >
              {isCreatingZone ? "Cancelar Zona" : "Criar Zona"}
            </button>
            <button
              onClick={toggleZoneRemoval}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isRemovingZone
                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
                  : "bg-slate-600 hover:bg-slate-700 text-white"
              }`}
            >
              {isRemovingZone ? "Cancelar Remoção" : "Remover Zona"}
            </button>
            <button
              onClick={resetView}
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
            >
              Resetar Vista
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-3 text-xs">
          <div className="space-y-1">
            <div className="font-semibold text-slate-300 mb-1">Drones</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
              <span className="text-slate-300">Ocioso</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <span className="text-slate-300">Carregando</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-sky-400 rounded-full"></div>
              <span className="text-slate-300">Em Voo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
              <span className="text-slate-300">Retornando</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-slate-300 mb-1">Entregas</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-300 rounded-full"></div>
              <span className="text-slate-300">Baixa</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <span className="text-slate-300">Média</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
              <span className="text-slate-300">Alta</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-slate-300 mb-1">Terreno</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
              <span className="text-slate-300">Ruas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
              <span className="text-slate-300">Comercial</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-200 rounded-full"></div>
              <span className="text-slate-300">Residencial</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-slate-300 mb-1">Áreas</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
              <span className="text-slate-300">Industrial</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
              <span className="text-slate-300">Parques</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
              <span className="text-slate-300">Água</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-slate-300 mb-1">Status</div>
            {isCreatingZone && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-rose-600 rounded-full animate-pulse"></div>
                <span className="text-rose-300">Criando Zona</span>
              </div>
            )}
            {isRemovingZone && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse"></div>
                <span className="text-amber-300">Removendo Zona</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <div
          ref={mapRef}
          className={`relative bg-slate-900 border-2 border-slate-600 overflow-hidden select-none rounded-xl shadow-2xl ${
            isCreatingZone
              ? "cursor-crosshair"
              : isRemovingZone
              ? "cursor-pointer"
              : isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
          }`}
          style={{
            width: "100%",
            height: "100%",
            minHeight: "500px",
            touchAction: "pan-x pan-y",
            userSelect: "none",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleMapClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {renderGrid()}
          {renderNoFlyZones()}
          {renderZoneCreation()}
          {renderDeliveryRoute()}
          {renderBase()}
          {renderOrders()}
          {renderDrones()}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
