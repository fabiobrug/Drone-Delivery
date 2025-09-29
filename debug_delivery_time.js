import { DroneModel } from "./backend/models/DroneModel.js";
import { DroneTypeModel } from "./backend/models/DroneTypeModel.js";
import { RoutingService } from "./backend/services/RoutingService.js";

async function debugDeliveryTime() {
  try {
    console.log("🔍 Debugando cálculo de tempo de entrega...\n");

    const droneModel = new DroneModel();
    const droneTypeModel = new DroneTypeModel();
    const routingService = new RoutingService();

    // 1. Verificar tipos de drone
    console.log("=== Verificando tipos de drone ===");
    const droneTypes = await droneTypeModel.findAll();
    console.log(`Tipos de drone encontrados: ${droneTypes.length}`);
    droneTypes.forEach((type) => {
      console.log(
        `- ID: ${type.id}, Nome: ${type.name}, Velocidade: ${type.max_speed} km/h`
      );
    });

    // 2. Verificar drones
    console.log("\n=== Verificando drones ===");
    const drones = await droneModel.findAll();
    console.log(`Drones encontrados: ${drones.length}`);
    drones.forEach((drone) => {
      console.log(
        `- ID: ${drone.id}, Serial: ${drone.serialNumber}, Tipo: ${drone.typeId}`
      );
      console.log(`  DroneType: ${drone.droneType ? "Sim" : "Não"}`);
      if (drone.droneType) {
        console.log(`  Velocidade: ${drone.droneType.maxSpeed} km/h`);
      }
    });

    // 3. Testar cálculo de tempo de entrega
    console.log("\n=== Testando cálculo de tempo de entrega ===");
    if (drones.length > 0) {
      const drone = drones[0];
      console.log(
        `Testando com drone: ${drone.serialNumber} (ID: ${drone.id})`
      );

      // Simular um pedido próximo
      const testOrder = {
        id: "test-order",
        x: drone.x + 5,
        y: drone.y + 5,
      };

      try {
        const deliveryTime = await routingService.calculateDeliveryTime(
          drone.id,
          testOrder.id
        );
        console.log("✅ Cálculo bem-sucedido:");
        console.log(`  Distância: ${deliveryTime.distance}m`);
        console.log(`  Velocidade: ${deliveryTime.maxSpeed} km/h`);
        console.log(`  Tempo: ${deliveryTime.timeFormatted}`);
        if (deliveryTime.error) {
          console.log(`  ⚠️ Erro: ${deliveryTime.error}`);
        }
      } catch (error) {
        console.log(`❌ Erro no cálculo: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
    console.error(error.stack);
  }
}

debugDeliveryTime();
