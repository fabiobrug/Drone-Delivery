// Gerar ID único
export const generateId = (prefix) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}`;
};

// Calcular distância entre dois pontos (em metros)
export const calculateDistance = (x1, y1, x2, y2) => {
  const distanceInUnits = Math.sqrt(
    Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
  );
  return distanceInUnits * 100; // Converter de unidades para metros (1 unidade = 100m)
};

// Verificar se um ponto está dentro de um polígono
export const isPointInPolygon = (point, polygon) => {
  const x = point.x;
  const y = point.y;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
};

// Algoritmo A* simplificado para pathfinding
export const calculateAStarPath = (
  startX,
  startY,
  endX,
  endY,
  noFlyZones,
  gridSize = 50
) => {
  const path = [];

  // Função para verificar se uma posição está em uma zona de exclusão
  const isInNoFlyZone = (x, y) => {
    return noFlyZones.some((zone) => {
      // Usar as informações de área se disponíveis (método mais eficiente)
      if (
        zone.minX !== undefined &&
        zone.maxX !== undefined &&
        zone.minY !== undefined &&
        zone.maxY !== undefined
      ) {
        return (
          x >= zone.minX && x <= zone.maxX && y >= zone.minY && y <= zone.maxY
        );
      }

      // Fallback para verificação por pontos (método antigo)
      if (zone.points && zone.points.length > 0) {
        return isPointInPolygon({ x, y }, zone.points);
      }

      return false;
    });
  };

  // Se não há zonas de exclusão, usar rota direta
  if (noFlyZones.length === 0) {
    const dx = endX - startX;
    const dy = endY - startY;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    for (let i = 0; i <= steps; i++) {
      const x = Math.round(startX + (dx * i) / steps);
      const y = Math.round(startY + (dy * i) / steps);
      path.push({ x, y });
    }
    return path;
  }

  // Implementação simplificada do A*
  const getNeighbors = (x, y) => {
    const neighbors = [];
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1], // Cardinal
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1], // Diagonal
    ];

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        if (!isInNoFlyZone(newX, newY)) {
          neighbors.push({ x: newX, y: newY });
        }
      }
    }

    return neighbors;
  };

  const openSet = [{ x: startX, y: startY, g: 0, h: 0, f: 0, parent: null }];
  const closedSet = new Set();
  const cameFrom = new Map();

  while (openSet.length > 0) {
    // Encontrar nó com menor f
    let current = openSet[0];
    let currentIndex = 0;

    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < current.f) {
        current = openSet[i];
        currentIndex = i;
      }
    }

    openSet.splice(currentIndex, 1);
    closedSet.add(`${current.x},${current.y}`);

    // Se chegou ao destino
    if (current.x === endX && current.y === endY) {
      const path = [];
      let node = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = cameFrom.get(`${node.x},${node.y}`);
      }
      return path;
    }

    // Explorar vizinhos
    const neighbors = getNeighbors(current.x, current.y);

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;

      if (closedSet.has(key)) continue;

      const tentativeG = current.g + 1;
      const h = Math.abs(neighbor.x - endX) + Math.abs(neighbor.y - endY);
      const f = tentativeG + h;

      const existingNode = openSet.find(
        (n) => n.x === neighbor.x && n.y === neighbor.y
      );

      if (!existingNode) {
        openSet.push({
          x: neighbor.x,
          y: neighbor.y,
          g: tentativeG,
          h: h,
          f: f,
          parent: current,
        });
        cameFrom.set(key, current);
      } else if (tentativeG < existingNode.g) {
        existingNode.g = tentativeG;
        existingNode.f = f;
        existingNode.parent = current;
        cameFrom.set(key, current);
      }
    }
  }

  // Se não encontrou caminho, retornar rota direta
  const dx = endX - startX;
  const dy = endY - startY;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  for (let i = 0; i <= steps; i++) {
    const x = Math.round(startX + (dx * i) / steps);
    const y = Math.round(startY + (dy * i) / steps);
    path.push({ x, y });
  }

  return path;
};

// Formatar resposta de erro
export const formatError = (error, message = "An error occurred") => {
  return {
    success: false,
    error: message,
    details: error.message || error,
  };
};

// Formatar resposta de sucesso
export const formatSuccess = (data, message = "Success") => {
  return {
    success: true,
    message,
    data,
  };
};

// Validar coordenadas
export const validateCoordinates = (x, y, maxX = 50, maxY = 50) => {
  return x >= 0 && x <= maxX && y >= 0 && y <= maxY;
};

// Gerar timestamp
export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
