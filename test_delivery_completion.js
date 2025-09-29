const { DroneService } = require("./backend/services/DroneService.js");
const { OrderService } = require("./backend/services/OrderService.js");
const { DroneTypeService } = require("./backend/services/DroneTypeService.js");

async function testDeliveryCompletion() {
  console.log("🧪 Testando funcionalidades de entrega...\n");

  try {
    const droneService = new DroneService();
    const orderService = new OrderService();
    const droneTypeService = new DroneTypeService();

    // 1. Obter tipos de drone existentes
    console.log("1. 📋 Obtendo tipos de drone...");
    const droneTypes = await droneTypeService.getAllDroneTypes();
    console.log(`   Encontrados ${droneTypes.length} tipos de drone`);

    if (droneTypes.length === 0) {
      console.log(
        "   ❌ Nenhum tipo de drone encontrado. Criando um tipo de teste..."
      );
      const newType = await droneTypeService.createDroneType({
        name: "Teste Delivery",
        capacity: 5,
        batteryRange: 50,
        maxSpeed: 30,
        description: "Tipo para teste de entrega",
      });
      console.log(`   ✅ Tipo criado: ${newType.name} (ID: ${newType.id})`);
      droneTypes.push(newType);
    }

    const testType = droneTypes[0];
    console.log(`   Usando tipo: ${testType.name} (ID: ${testType.id})`);
    console.log(
      `   Estatísticas atuais: ${testType.delivered_orders || 0}/${
        testType.total_orders || 0
      } entregas\n`
    );

    // 2. Obter drones existentes
    console.log("2. 🚁 Obtendo drones...");
    const drones = await droneService.getAllDrones();
    console.log(`   Encontrados ${drones.length} drones`);

    if (drones.length === 0) {
      console.log(
        "   ❌ Nenhum drone encontrado. Criando um drone de teste..."
      );
      const newDrone = await droneService.createDrone({
        serialNumber: "TEST-DELIVERY-001",
        typeId: testType.id,
      });
      console.log(
        `   ✅ Drone criado: ${newDrone.serialNumber} (ID: ${newDrone.id})`
      );
      drones.push(newDrone);
    }

    const testDrone = drones[0];
    console.log(
      `   Usando drone: ${testDrone.serialNumber} (ID: ${testDrone.id})`
    );
    console.log(
      `   Status: ${testDrone.status}, Carga atual: ${testDrone.currentLoad}kg\n`
    );

    // 3. Criar pedido de teste
    console.log("3. 📦 Criando pedido de teste...");
    const testOrder = await orderService.createOrder({
      x: 30,
      y: 30,
      weight: 2,
      priority: "normal",
    });
    console.log(
      `   ✅ Pedido criado: ID ${testOrder.id}, Peso: ${testOrder.weight}kg, Status: ${testOrder.status}\n`
    );

    // 4. Alocar pedido ao drone
    console.log("4. 🔗 Alocando pedido ao drone...");
    const allocationResult = await droneService.allocateOrderToDrone(
      testDrone.id,
      testOrder.id
    );
    console.log(
      `   Resultado: ${allocationResult.success ? "✅" : "❌"} ${
        allocationResult.message
      }`
    );

    if (!allocationResult.success) {
      console.log("   ❌ Falha na alocação. Teste interrompido.");
      return;
    }

    // Verificar estado após alocação
    const droneAfterAllocation = await droneService.getDroneById(testDrone.id);
    const orderAfterAllocation = await orderService.getOrderById(testOrder.id);
    console.log(
      `   Drone após alocação: Status=${droneAfterAllocation.status}, Carga=${droneAfterAllocation.currentLoad}kg`
    );
    console.log(
      `   Pedido após alocação: Status=${orderAfterAllocation.status}, DroneId=${orderAfterAllocation.droneId}\n`
    );

    // 5. Simular entrega (marcar como entregue e remover do drone)
    console.log("5. 🚚 Simulando entrega...");

    // Marcar pedido como entregue e remover do drone
    await orderService.updateOrder(testOrder.id, {
      status: "delivered",
      droneId: null,
    });
    console.log("   ✅ Pedido marcado como entregue e removido do drone");

    // Atualizar estatísticas do tipo de drone
    await droneService.droneTypeModel.updateStats(testType.id, 1);
    console.log("   ✅ Estatísticas do tipo de drone atualizadas");

    // Atualizar drone (retornar à base)
    await droneService.updateDrone(testDrone.id, {
      status: "idle",
      currentLoad: 0,
      x: 25,
      y: 25,
      battery: 100,
      targetX: null,
      targetY: null,
    });
    console.log("   ✅ Drone retornou à base\n");

    // 6. Verificar resultados finais
    console.log("6. 🔍 Verificando resultados finais...");

    const finalDrone = await droneService.getDroneById(testDrone.id);
    const finalOrder = await orderService.getOrderById(testOrder.id);
    const finalType = await droneTypeService.getDroneTypeById(testType.id);

    console.log(
      `   Drone final: Status=${finalDrone.status}, Carga=${finalDrone.currentLoad}kg, Posição=(${finalDrone.x}, ${finalDrone.y})`
    );
    console.log(
      `   Pedido final: Status=${finalOrder.status}, DroneId=${
        finalOrder.droneId || "null"
      }`
    );
    console.log(
      `   Tipo final: Entregas=${finalType.delivered_orders || 0}/${
        finalType.total_orders || 0
      }`
    );

    // Verificações
    const checks = [
      {
        name: "Pedido removido do drone",
        condition: finalOrder.droneId === null,
        expected: true,
      },
      {
        name: "Pedido marcado como entregue",
        condition: finalOrder.status === "delivered",
        expected: true,
      },
      {
        name: "Drone sem carga",
        condition: finalDrone.currentLoad === 0,
        expected: true,
      },
      {
        name: "Drone na base",
        condition: finalDrone.x === 25 && finalDrone.y === 25,
        expected: true,
      },
      {
        name: "Estatísticas atualizadas",
        condition: (finalType.delivered_orders || 0) > 0,
        expected: true,
      },
    ];

    console.log("\n📊 Resultados dos testes:");
    let allPassed = true;
    checks.forEach((check) => {
      const passed = check.condition === check.expected;
      console.log(
        `   ${passed ? "✅" : "❌"} ${check.name}: ${
          passed ? "PASSOU" : "FALHOU"
        }`
      );
      if (!passed) allPassed = false;
    });

    console.log(
      `\n🎯 Teste geral: ${
        allPassed ? "✅ TODOS OS TESTES PASSARAM!" : "❌ ALGUNS TESTES FALHARAM"
      }`
    );
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  }
}

// Executar teste
testDeliveryCompletion();
