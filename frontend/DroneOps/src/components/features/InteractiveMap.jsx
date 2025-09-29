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
    loadInitialData,
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
  const [selectedCells, setSelectedCells] = useState(new Set());
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
    setSelectedCells(new Set());
    setSelectedDrone(null);
  };

  const toggleZoneRemoval = () => {
    setIsRemovingZone(!isRemovingZone);
    setIsCreatingZone(false);
    setZonePoints([]);
    setSelectedCells(new Set());
    setSelectedDrone(null);
  };

  const confirmZoneCreation = async () => {
    if (selectedCells.size >= 3) {
      const points = Array.from(selectedCells).map((cellKey) => {
        const [x, y] = cellKey.split(",").map(Number);
        return { x, y };
      });

      try {
        // Criar a zona
        const result = await addNoFlyZone({ points });

        if (result.success) {
          // Recarregar todos os dados do mapa para garantir que a zona apareça
          await loadInitialData();

          // Limpar estado de criação
          setIsCreatingZone(false);
          setZonePoints([]);
          setSelectedCells(new Set());

          console.log("✅ Zona criada e mapa recarregado com sucesso!");
        } else {
          console.error("❌ Erro ao criar zona:", result.error);
        }
      } catch (error) {
        console.error("❌ Erro ao criar zona:", error);
      }
    }
  };

  const cancelZoneCreation = () => {
    setIsCreatingZone(false);
    setZonePoints([]);
    setSelectedCells(new Set());
  };

  const handleMapClick = async (e) => {
    if (isCreatingZone && !isDragging) {
      const rect = mapRef.current.getBoundingClientRect();
      const x = Math.floor(
        (e.clientX - rect.left - panOffset.x) / (CELL_SIZE * zoom)
      );
      const y = Math.floor(
        (e.clientY - rect.top - panOffset.y) / (CELL_SIZE * zoom)
      );

      // Verificar se as coordenadas estão dentro dos limites
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
        return;
      }

      const cellKey = `${x},${y}`;
      const newSelectedCells = new Set(selectedCells);

      if (newSelectedCells.has(cellKey)) {
        // Se já está selecionado, deselecionar
        newSelectedCells.delete(cellKey);
      } else {
        // Se não está selecionado, adicionar
        newSelectedCells.add(cellKey);
      }

      setSelectedCells(newSelectedCells);

      // Se há pelo menos 3 células selecionadas, permitir criar a zona
      if (newSelectedCells.size >= 3) {
        const points = Array.from(newSelectedCells).map((cellKey) => {
          const [x, y] = cellKey.split(",").map(Number);
          return { x, y };
        });
        setZonePoints(points);
      } else {
        setZonePoints([]);
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
        try {
          const result = await removeNoFlyZone(clickedZone.id);

          if (result.success) {
            // Recarregar todos os dados do mapa para garantir que a zona seja removida
            await loadInitialData();
            setIsRemovingZone(false);
            console.log("✅ Zona removida e mapa recarregado com sucesso!");
          } else {
            console.error("❌ Erro ao remover zona:", result.error);
          }
        } catch (error) {
          console.error("❌ Erro ao remover zona:", error);
        }
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
        const cellKey = `${x},${y}`;
        const isSelected = selectedCells.has(cellKey);

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`border ${terrain.border} ${
              terrain.color
            } hover:opacity-80 transition-all duration-150 ${
              isCreatingZone
                ? "hover:bg-rose-300 hover:border-rose-400 cursor-crosshair"
                : ""
            } ${
              isSelected
                ? "bg-rose-500/50 border-rose-500 border-2 shadow-lg"
                : ""
            }`}
            style={{
              width: cellSize,
              height: cellSize,
              position: "absolute",
              left: x * cellSize + panOffset.x,
              top: y * cellSize + panOffset.y,
            }}
            title={`${terrain.type} - (${x}, ${y})${
              isSelected ? " - Selecionado" : ""
            }`}
          />
        );
      }
    }
    return cells;
  };

  const renderNoFlyZones = () => {
    const cellSize = CELL_SIZE * zoom;

    // Verificar se há zonas para renderizar
    if (!noFlyZones || noFlyZones.length === 0) {
      return null;
    }

    return noFlyZones.map((zone) => {
      // Verificar se a zona tem pontos válidos
      if (!zone.points || zone.points.length === 0) {
        return null;
      }

      // Calcular área da zona
      const minX = Math.min(...zone.points.map((p) => p.x));
      const maxX = Math.max(...zone.points.map((p) => p.x));
      const minY = Math.min(...zone.points.map((p) => p.y));
      const maxY = Math.max(...zone.points.map((p) => p.y));

      return (
        <div key={zone.id} className="absolute">
          {/* Área destacada da zona no-fly */}
          <div
            className="absolute bg-red-500/30 border-2 border-red-500 border-dashed shadow-2xl"
            style={{
              left: minX * cellSize + panOffset.x,
              top: minY * cellSize + panOffset.y,
              width: (maxX - minX + 1) * cellSize,
              height: (maxY - minY + 1) * cellSize,
            }}
          />

          {/* Overlay com padrão de proibição */}
          <div
            className="absolute bg-red-500/20"
            style={{
              left: minX * cellSize + panOffset.x,
              top: minY * cellSize + panOffset.y,
              width: (maxX - minX + 1) * cellSize,
              height: (maxY - minY + 1) * cellSize,
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(239, 68, 68, 0.3) 10px,
                rgba(239, 68, 68, 0.3) 20px
              )`,
            }}
          />

          {/* Ícone discreto de proibição */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: minX * cellSize + panOffset.x + 2,
              top: minY * cellSize + panOffset.y + 2,
              width: 16,
              height: 16,
            }}
          >
            <svg
              className="w-4 h-4 text-red-500 drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        </div>
      );
    });
  };

  // Zone creation rendering
  const renderZoneCreation = () => {
    if (!isCreatingZone || selectedCells.size === 0) return null;

    const cellSize = CELL_SIZE * zoom;
    const selectedCellsArray = Array.from(selectedCells);

    return (
      <>
        {/* Mostrar células selecionadas */}
        {selectedCellsArray.map((cellKey) => {
          const [x, y] = cellKey.split(",").map(Number);
          return (
            <div
              key={cellKey}
              className="absolute bg-rose-600/70 border-2 border-rose-400 rounded shadow-lg animate-pulse"
              style={{
                left: x * cellSize + panOffset.x,
                top: y * cellSize + panOffset.y,
                width: cellSize,
                height: cellSize,
              }}
            />
          );
        })}

        {/* Mostrar área da zona se há pelo menos 3 células */}
        {selectedCells.size >= 3 && (
          <div
            className="absolute bg-rose-500/20 border-2 border-rose-500 border-dashed animate-pulse"
            style={{
              left:
                Math.min(
                  ...selectedCellsArray.map((cellKey) => {
                    const [x] = cellKey.split(",").map(Number);
                    return x;
                  })
                ) *
                  cellSize +
                panOffset.x,
              top:
                Math.min(
                  ...selectedCellsArray.map((cellKey) => {
                    const [, y] = cellKey.split(",").map(Number);
                    return y;
                  })
                ) *
                  cellSize +
                panOffset.y,
              width:
                (Math.max(
                  ...selectedCellsArray.map((cellKey) => {
                    const [x] = cellKey.split(",").map(Number);
                    return x;
                  })
                ) -
                  Math.min(
                    ...selectedCellsArray.map((cellKey) => {
                      const [x] = cellKey.split(",").map(Number);
                      return x;
                    })
                  ) +
                  1) *
                cellSize,
              height:
                (Math.max(
                  ...selectedCellsArray.map((cellKey) => {
                    const [, y] = cellKey.split(",").map(Number);
                    return y;
                  })
                ) -
                  Math.min(
                    ...selectedCellsArray.map((cellKey) => {
                      const [, y] = cellKey.split(",").map(Number);
                      return y;
                    })
                  ) +
                  1) *
                cellSize,
            }}
          />
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
          {/* Enhanced drone icon with modern design */}
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
            className={`absolute flex items-center justify-center transition-all duration-300 hover:scale-125 transform shadow-2xl ${
              selectedDrone === drone.id ? "ring-4 ring-white/50 scale-125" : ""
            } ${animatingDrones.has(drone.id) ? "animate-bounce" : ""}`}
            style={{
              left: drone.x * cellSize + panOffset.x - 16,
              top: drone.y * cellSize + panOffset.y - 16,
              width: 32,
              height: 32,
            }}
          >
            {/* Main drone body with gradient */}
            <div
              className={`relative w-full h-full rounded-full border-2 shadow-inner ${
                drone.status === "idle"
                  ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-300"
                  : drone.status === "loading"
                  ? "bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300"
                  : drone.status === "flying"
                  ? "bg-gradient-to-br from-sky-400 to-sky-600 border-sky-300"
                  : "bg-gradient-to-br from-rose-400 to-rose-600 border-rose-300"
              } ${drone.status !== "idle" ? "animate-pulse" : ""}`}
            >
              {/* Inner glow effect */}
              <div className="absolute inset-1 bg-white/20 rounded-full"></div>

              {/* Drone icon */}
              <div className="relative z-10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white drop-shadow-lg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                </svg>
              </div>

              {/* Rotating propellers for flying drones */}
              {drone.status === "flying" && (
                <>
                  <div
                    className="absolute -top-2 -left-1 w-1 h-1 bg-white/60 rounded-full animate-spin"
                    style={{ animationDuration: "0.5s" }}
                  ></div>
                  <div
                    className="absolute -top-2 -right-1 w-1 h-1 bg-white/60 rounded-full animate-spin"
                    style={{
                      animationDuration: "0.5s",
                      animationDelay: "0.25s",
                    }}
                  ></div>
                  <div
                    className="absolute -bottom-2 -left-1 w-1 h-1 bg-white/60 rounded-full animate-spin"
                    style={{
                      animationDuration: "0.5s",
                      animationDelay: "0.125s",
                    }}
                  ></div>
                  <div
                    className="absolute -bottom-2 -right-1 w-1 h-1 bg-white/60 rounded-full animate-spin"
                    style={{
                      animationDuration: "0.5s",
                      animationDelay: "0.375s",
                    }}
                  ></div>
                </>
              )}

              {/* Battery indicator */}
              <div
                className={`absolute -top-1 -right-1 w-3 h-2 rounded-full border border-white/50 ${
                  drone.battery > 50
                    ? "bg-emerald-400"
                    : drone.battery > 20
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-r from-transparent to-white/30"></div>
              </div>

              {/* Status indicator dot */}
              <div
                className={`absolute -bottom-1 -left-1 w-2 h-2 rounded-full border border-white/50 ${
                  drone.status === "idle"
                    ? "bg-emerald-500"
                    : drone.status === "loading"
                    ? "bg-amber-500"
                    : drone.status === "flying"
                    ? "bg-sky-500"
                    : "bg-rose-500"
                } ${drone.status !== "idle" ? "animate-ping" : ""}`}
              ></div>
            </div>

            {/* Outer glow ring */}
            <div
              className={`absolute inset-0 rounded-full opacity-30 ${
                drone.status === "idle"
                  ? "bg-emerald-400"
                  : drone.status === "loading"
                  ? "bg-amber-400"
                  : drone.status === "flying"
                  ? "bg-sky-400"
                  : "bg-rose-400"
              } ${drone.status !== "idle" ? "animate-ping" : ""}`}
              style={{ transform: "scale(1.5)" }}
            ></div>
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
          {/* Enhanced Delivery pin with better visibility */}
          <div
            className={`absolute flex items-center justify-center transition-all duration-300 hover:scale-125 transform shadow-2xl border-2 ${
              order.priority === "high"
                ? "bg-gradient-to-br from-red-500 to-red-700 border-red-300 text-white animate-pulse"
                : order.priority === "medium"
                ? "bg-gradient-to-br from-yellow-500 to-yellow-700 border-yellow-300 text-black"
                : "bg-gradient-to-br from-green-500 to-green-700 border-green-300 text-white"
            } rounded-full`}
            style={{
              left: order.x * cellSize + panOffset.x - 12,
              top: order.y * cellSize + panOffset.y - 24,
              width: 24,
              height: 24,
            }}
            title={`Pedido ${order.id} - ${order.weight}kg - Prioridade ${order.priority}`}
          >
            {/* Enhanced pin icon */}
            <svg className="w-5 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>

          {/* Enhanced Priority indicator with glow effect */}
          <div
            className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-lg ${
              order.priority === "high"
                ? "bg-red-500 animate-ping"
                : order.priority === "medium"
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{
              left: order.x * cellSize + panOffset.x + 8,
              top: order.y * cellSize + panOffset.y - 20,
            }}
          />

          {/* Priority text label */}
          <div
            className={`absolute text-xs font-bold px-2 py-1 rounded-full border ${
              order.priority === "high"
                ? "bg-red-600 text-white border-red-400"
                : order.priority === "medium"
                ? "bg-yellow-600 text-black border-yellow-400"
                : "bg-green-600 text-white border-green-400"
            } shadow-lg`}
            style={{
              left: order.x * cellSize + panOffset.x - 20,
              top: order.y * cellSize + panOffset.y - 40,
              fontSize: "10px",
            }}
          >
            {order.priority === "high"
              ? "ALTA"
              : order.priority === "medium"
              ? "MÉDIA"
              : "BAIXA"}
          </div>

          {/* Order weight indicator */}
          <div
            className="absolute bg-slate-800 text-white text-xs px-2 py-1 rounded-full border border-slate-600 shadow-lg font-semibold"
            style={{
              left: order.x * cellSize + panOffset.x - 15,
              top: order.y * cellSize + panOffset.y + 5,
              fontSize: "9px",
            }}
          >
            {order.weight}kg
          </div>
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

            {isCreatingZone ? (
              <>
                <div className="text-sm text-rose-300 bg-rose-900/50 px-3 py-1 rounded-full border border-rose-500">
                  Selecionadas: {selectedCells.size} células
                </div>
                <button
                  onClick={confirmZoneCreation}
                  disabled={selectedCells.size < 3}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCells.size >= 3
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                      : "bg-gray-500 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  Confirmar Zona ({selectedCells.size >= 3 ? "✓" : "✗"})
                </button>
                <button
                  onClick={cancelZoneCreation}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleZoneCreation}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
                >
                  Criar Zona
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
              </>
            )}

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
              <div className="w-3 h-3 bg-green-500 rounded-full border border-green-300"></div>
              <span className="text-slate-300">Baixa</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-300"></div>
              <span className="text-slate-300">Média</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-red-300 animate-pulse"></div>
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
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-rose-600 rounded-full animate-pulse"></div>
                  <span className="text-rose-300">Criando Zona</span>
                </div>
                <div className="text-xs text-rose-200 ml-5">
                  Clique nos quadrados para selecionar
                </div>
                {selectedCells.size > 0 && (
                  <div className="text-xs text-rose-200 ml-5">
                    {selectedCells.size} células selecionadas
                  </div>
                )}
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
