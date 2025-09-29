import { DroneModel } from "../models/DroneModel.js";
import { OrderModel } from "../models/OrderModel.js";
import { DroneTypeModel } from "../models/DroneTypeModel.js";

export class FlightSimulationService {
  constructor() {
    this.droneModel = new DroneModel();
    this.orderModel = new OrderModel();
    this.droneTypeModel = new DroneTypeModel();
    this.simulationIntervals = new Map(); // Armazena os intervalos de simulação por drone
    this.deliveryTimers = new Map(); // Armazena os timers de entrega por drone
    this.deliveryQueues = new Map(); // Armazena a fila de entregas por drone
    this.currentDeliveryIndex = new Map(); // Armazena o índice da entrega atual por drone
  }

  // Inicia a simulação de voo para um drone
  async startFlightSimulation(droneId) {
    try {
      console.log(`🚁 Starting flight simulation for drone ${droneId}`);

      const drone = await this.droneModel.findById(droneId);
      if (!drone) {
        throw new Error("Drone not found");
      }

      console.log(
        `🔍 Drone found: ${drone.serialNumber}, status: ${drone.status}, load: ${drone.currentLoad}`
      );

      if (drone.status !== "loading") {
        throw new Error("Drone must be in loading status to start flight");
      }

      // Atualizar status para flying
      await this.droneModel.update(droneId, { status: "flying" });
      console.log(`✅ Drone ${droneId} status updated to flying`);

      // Obter pedidos do drone
      const orders = await this.orderModel.findByDroneId(droneId);
      if (orders.length === 0) {
        throw new Error("No orders found for this drone");
      }

      console.log(`📦 Found ${orders.length} orders for drone ${droneId}`);

      // Ordenar pedidos por prioridade (high > medium > low) e depois por distância
      const sortedOrders = this.sortOrdersByPriorityAndDistance(drone, orders);

      // Armazenar fila de entregas e índice atual
      this.deliveryQueues.set(droneId, sortedOrders);
      this.currentDeliveryIndex.set(droneId, 0);

      // Atualizar status do primeiro pedido para "A caminho"
      const currentOrder = sortedOrders[0];
      await this.orderModel.update(currentOrder.id, { status: "in-route" });
      console.log(`📦 Order ${currentOrder.id} status updated to "in-route"`);

      // Calcular tempo de entrega baseado na distância e velocidade
      const deliveryTime = this.calculateDeliveryTime(drone, currentOrder);
      console.log(`⏱️ Delivery time calculated: ${deliveryTime} seconds`);

      // Iniciar timer de entrega
      this.startDeliveryTimer(droneId, deliveryTime);
      console.log(`⏰ Delivery timer started for ${deliveryTime} seconds`);

      // Iniciar simulação de bateria (redução a cada 5 segundos)
      this.startBatterySimulation(droneId);
      console.log(`🔋 Battery simulation started`);

      // Iniciar simulação de movimento
      this.startMovementSimulation(droneId, currentOrder);
      console.log(`🎯 Movement simulation started`);

      return {
        success: true,
        message: "Flight simulation started",
        deliveryTime: deliveryTime,
      };
    } catch (error) {
      console.error("Error starting flight simulation:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Ordena pedidos por prioridade e depois por distância
  sortOrdersByPriorityAndDistance(drone, orders) {
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    return orders.sort((a, b) => {
      // Primeiro por prioridade
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Se prioridade igual, ordenar por distância
      const distanceA = Math.sqrt(
        Math.pow(a.x - drone.x, 2) + Math.pow(a.y - drone.y, 2)
      );
      const distanceB = Math.sqrt(
        Math.pow(b.x - drone.x, 2) + Math.pow(b.y - drone.y, 2)
      );

      return distanceA - distanceB;
    });
  }

  // Calcula o tempo de entrega baseado na distância e velocidade do drone
  calculateDeliveryTime(drone, order) {
    const distance = Math.sqrt(
      Math.pow(order.x - drone.x, 2) + Math.pow(order.y - drone.y, 2)
    );

    // Velocidade em unidades por segundo (assumindo que maxSpeed está em km/h)
    // Para testes, usar velocidade mais rápida: 1 unidade = 100 metros
    // Converter km/h para unidades/segundo - 1 unidade = 100m, então 1km = 10 unidades
    const speedPerSecond = (drone.droneType.maxSpeed * 10) / 3600; // Converter km/h para unidades/s

    // Tempo em segundos
    const timeInSeconds = distance / speedPerSecond;

    return Math.max(5, Math.round(timeInSeconds)); // Mínimo de 5 segundos para teste
  }

  // Inicia o timer de entrega
  startDeliveryTimer(droneId, deliveryTimeSeconds) {
    const timer = setTimeout(async () => {
      await this.completeDelivery(droneId);
    }, deliveryTimeSeconds * 1000);

    this.deliveryTimers.set(droneId, timer);
  }

  // Inicia a simulação de redução de bateria
  startBatterySimulation(droneId) {
    const interval = setInterval(async () => {
      try {
        const drone = await this.droneModel.findById(droneId);
        if (!drone || drone.status !== "flying") {
          this.stopBatterySimulation(droneId);
          return;
        }

        // Reduzir bateria em 1% a cada 30 segundos (mais realista)
        const newBattery = Math.max(0, drone.battery - 1);

        await this.droneModel.update(droneId, { battery: newBattery });

        console.log(`🔋 Drone ${droneId} battery: ${newBattery}%`);

        // Se bateria chegou a 0, parar o drone
        if (newBattery === 0) {
          await this.emergencyLanding(droneId);
        }
      } catch (error) {
        console.error("Error in battery simulation:", error);
        this.stopBatterySimulation(droneId);
      }
    }, 30000); // 30 segundos para ser mais realista

    this.simulationIntervals.set(droneId, interval);
  }

  // Inicia a simulação de movimento do drone
  startMovementSimulation(droneId, order) {
    const interval = setInterval(async () => {
      try {
        const drone = await this.droneModel.findById(droneId);
        if (!drone || drone.status !== "flying") {
          this.stopMovementSimulation(droneId);
          return;
        }

        // Calcular movimento em direção ao destino
        const deltaX = order.x - drone.x;
        const deltaY = order.y - drone.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Se chegou ao destino (tolerância de 0.1 unidades)
        if (distance < 0.1) {
          await this.completeDelivery(droneId);
          this.stopMovementSimulation(droneId);
          return;
        }

        // Calcular próximo passo (movimento suave)
        const speedPerSecond = (drone.droneType.maxSpeed * 10) / 3600; // Mesma velocidade do cálculo de tempo
        const stepSize = speedPerSecond * 2; // Movimento a cada 2 segundos

        const moveX = (deltaX / distance) * stepSize;
        const moveY = (deltaY / distance) * stepSize;

        const newX = Math.min(order.x, drone.x + moveX);
        const newY = Math.min(order.y, drone.y + moveY);

        await this.droneModel.update(droneId, {
          x: newX,
          y: newY,
        });

        console.log(
          `🚁 Drone ${droneId} moved to (${newX.toFixed(2)}, ${newY.toFixed(
            2
          )})`
        );
      } catch (error) {
        console.error("Error in movement simulation:", error);
        this.stopMovementSimulation(droneId);
      }
    }, 2000); // Atualizar posição a cada 2 segundos

    this.simulationIntervals.set(`${droneId}_movement`, interval);
  }

  // Completa a entrega atual
  async completeDelivery(droneId) {
    try {
      const drone = await this.droneModel.findById(droneId);
      if (!drone) return;

      const deliveryQueue = this.deliveryQueues.get(droneId);
      const currentIndex = this.currentDeliveryIndex.get(droneId);

      if (!deliveryQueue || currentIndex >= deliveryQueue.length) {
        console.log(`❌ No more deliveries for drone ${droneId}`);
        return;
      }

      const currentOrder = deliveryQueue[currentIndex];
      console.log(`📦 Completing delivery for order ${currentOrder.id}`);

      // Marcar pedido atual como entregue (manter associação até todas as entregas)
      await this.orderModel.update(currentOrder.id, {
        status: "delivered",
        // NÃO remover droneId ainda - será removido quando todas as entregas terminarem
      });
      console.log(`✅ Order ${currentOrder.id} delivered successfully`);

      // Atualizar estatísticas do tipo de drone
      await this.updateDroneTypeStats(drone.typeId, 1);

      // Atualizar carga do drone (reduzir peso do pedido entregue)
      const newLoad = Math.max(0, drone.currentLoad - currentOrder.weight);
      await this.droneModel.update(droneId, { currentLoad: newLoad });

      // Incrementar índice para próxima entrega
      const nextIndex = currentIndex + 1;
      this.currentDeliveryIndex.set(droneId, nextIndex);

      // Verificar se há mais entregas
      if (nextIndex < deliveryQueue.length) {
        console.log(
          `🔄 Moving to next delivery: ${nextIndex + 1}/${deliveryQueue.length}`
        );

        const nextOrder = deliveryQueue[nextIndex];

        // Atualizar status do próximo pedido para "A caminho"
        await this.orderModel.update(nextOrder.id, { status: "in-route" });
        console.log(`📦 Order ${nextOrder.id} status updated to "in-route"`);

        // Calcular tempo para próxima entrega
        const nextDeliveryTime = this.calculateDeliveryTime(drone, nextOrder);
        console.log(
          `⏱️ Next delivery time calculated: ${nextDeliveryTime} seconds`
        );

        // Atualizar destino do drone
        await this.droneModel.update(droneId, {
          targetX: nextOrder.x,
          targetY: nextOrder.y,
        });

        // Reiniciar timer para próxima entrega
        this.stopDeliveryTimer(droneId);
        this.startDeliveryTimer(droneId, nextDeliveryTime);

        // Reiniciar simulação de movimento para próximo destino
        this.stopMovementSimulation(droneId);
        this.startMovementSimulation(droneId, nextOrder);

        return {
          success: true,
          message: `Order ${currentOrder.id} delivered. Moving to next delivery.`,
        };
      } else {
        console.log(`✅ All deliveries completed for drone ${droneId}`);

        // Todas as entregas foram concluídas - agora remover associação dos pedidos
        for (const order of deliveryQueue) {
          await this.orderModel.update(order.id, {
            droneId: null, // Remover associação com o drone
          });
          console.log(`🔗 Order ${order.id} disassociated from drone`);
        }

        // Todas as entregas foram concluídas
        this.stopAllSimulations(droneId);

        // Atualizar drone para retornando
        await this.droneModel.update(droneId, {
          status: "returning",
          currentLoad: 0,
          targetX: 25,
          targetY: 25,
        });

        // Limpar filas de entrega
        this.deliveryQueues.delete(droneId);
        this.currentDeliveryIndex.delete(droneId);

        // Iniciar retorno à base
        this.startReturnToBase(droneId);

        return {
          success: true,
          message: "All deliveries completed successfully",
        };
      }
    } catch (error) {
      console.error("Error completing delivery:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Inicia o retorno à base
  startReturnToBase(droneId) {
    const interval = setInterval(async () => {
      try {
        const drone = await this.droneModel.findById(droneId);
        if (!drone || drone.status !== "returning") {
          this.stopReturnSimulation(droneId);
          return;
        }

        const baseX = 25;
        const baseY = 25;

        const deltaX = baseX - drone.x;
        const deltaY = baseY - drone.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Se chegou à base
        if (distance < 0.1) {
          await this.droneModel.update(droneId, {
            status: "idle",
            x: baseX,
            y: baseY,
            battery: 100,
            targetX: null,
            targetY: null,
          });

          this.stopReturnSimulation(droneId);
          return;
        }

        // Calcular movimento em direção à base
        const speedPerSecond = (drone.droneType.maxSpeed * 10) / 3600; // Mesma velocidade
        const stepSize = speedPerSecond * 5;

        const moveX = (deltaX / distance) * stepSize;
        const moveY = (deltaY / distance) * stepSize;

        const newX = Math.min(baseX, drone.x + moveX);
        const newY = Math.min(baseY, drone.y + moveY);

        await this.droneModel.update(droneId, {
          x: newX,
          y: newY,
        });
      } catch (error) {
        console.error("Error in return simulation:", error);
        this.stopReturnSimulation(droneId);
      }
    }, 5000);

    this.simulationIntervals.set(`${droneId}_return`, interval);
  }

  // Atualiza estatísticas do tipo de drone
  async updateDroneTypeStats(droneTypeId, deliveredCount) {
    try {
      await this.droneTypeModel.updateStats(droneTypeId, deliveredCount);
      console.log(
        `Drone type ${droneTypeId} delivered ${deliveredCount} orders`
      );
    } catch (error) {
      console.error("Error updating drone type stats:", error);
    }
  }

  // Pouso de emergência quando bateria acaba
  async emergencyLanding(droneId) {
    try {
      await this.droneModel.update(droneId, {
        status: "idle",
        battery: 0,
      });

      this.stopAllSimulations(droneId);

      return {
        success: true,
        message: "Emergency landing completed",
      };
    } catch (error) {
      console.error("Error in emergency landing:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Para todas as simulações de um drone
  stopAllSimulations(droneId) {
    this.stopBatterySimulation(droneId);
    this.stopMovementSimulation(droneId);
    this.stopReturnSimulation(droneId);
    this.stopDeliveryTimer(droneId);

    // Limpar filas de entrega
    this.deliveryQueues.delete(droneId);
    this.currentDeliveryIndex.delete(droneId);
  }

  // Para simulação de bateria
  stopBatterySimulation(droneId) {
    const interval = this.simulationIntervals.get(droneId);
    if (interval) {
      clearInterval(interval);
      this.simulationIntervals.delete(droneId);
    }
  }

  // Para simulação de movimento
  stopMovementSimulation(droneId) {
    const interval = this.simulationIntervals.get(`${droneId}_movement`);
    if (interval) {
      clearInterval(interval);
      this.simulationIntervals.delete(`${droneId}_movement`);
    }
  }

  // Para simulação de retorno
  stopReturnSimulation(droneId) {
    const interval = this.simulationIntervals.get(`${droneId}_return`);
    if (interval) {
      clearInterval(interval);
      this.simulationIntervals.delete(`${droneId}_return`);
    }
  }

  // Para timer de entrega
  stopDeliveryTimer(droneId) {
    const timer = this.deliveryTimers.get(droneId);
    if (timer) {
      clearTimeout(timer);
      this.deliveryTimers.delete(droneId);
    }
  }

  // Obtém informações de tempo de entrega em tempo real
  async getDeliveryTimeInfo(droneId) {
    try {
      const drone = await this.droneModel.findById(droneId);
      if (!drone) {
        throw new Error("Drone not found");
      }

      if (drone.status !== "flying") {
        return {
          success: false,
          message: "Drone is not flying",
        };
      }

      const deliveryQueue = this.deliveryQueues.get(droneId);
      const currentIndex = this.currentDeliveryIndex.get(droneId);

      if (!deliveryQueue || currentIndex >= deliveryQueue.length) {
        return {
          success: false,
          message: "No orders found for this drone",
        };
      }

      const currentOrder = deliveryQueue[currentIndex];
      const distance = Math.sqrt(
        Math.pow(currentOrder.x - drone.x, 2) +
          Math.pow(currentOrder.y - drone.y, 2)
      );

      const speedPerSecond = (drone.droneType.maxSpeed * 10) / 3600; // Mesma velocidade
      const remainingTime = Math.max(0, Math.round(distance / speedPerSecond));

      return {
        success: true,
        data: {
          remainingTime,
          distance,
          currentPosition: { x: drone.x, y: drone.y },
          destination: { x: currentOrder.x, y: currentOrder.y },
          battery: drone.battery,
          currentDelivery: currentIndex + 1,
          totalDeliveries: deliveryQueue.length,
        },
      };
    } catch (error) {
      console.error("Error getting delivery time info:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
