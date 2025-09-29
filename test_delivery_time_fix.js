const API_BASE_URL = "http://localhost:3001/api";

async function testDeliveryTimeAPI() {
  try {
    console.log("🧪 Testando API de cálculo de tempo de entrega...\n");

    // 1. Buscar drones disponíveis
    console.log("1. Buscando drones...");
    const dronesResponse = await fetch(`${API_BASE_URL}/drones`);
    const dronesData = await dronesResponse.json();

    if (!dronesData.success || dronesData.data.length === 0) {
      console.log("❌ Nenhum drone encontrado");
      return;
    }

    const drone = dronesData.data[0];
    console.log(`✅ Drone encontrado: ${drone.serialNumber} (ID: ${drone.id})`);
    console.log(`   Velocidade: ${drone.droneType?.maxSpeed || "N/A"} km/h`);

    // 2. Buscar pedidos
    console.log("\n2. Buscando pedidos...");
    const ordersResponse = await fetch(`${API_BASE_URL}/orders`);
    const ordersData = await ordersResponse.json();

    if (!ordersData.success || ordersData.data.length === 0) {
      console.log("❌ Nenhum pedido encontrado");
      return;
    }

    const order = ordersData.data[0];
    console.log(`✅ Pedido encontrado: ${order.id}`);
    console.log(`   Posição: (${order.x}, ${order.y})`);

    // 3. Testar cálculo de tempo de entrega
    console.log("\n3. Testando cálculo de tempo de entrega...");
    const deliveryTimeResponse = await fetch(
      `${API_BASE_URL}/routing/delivery-time/${drone.id}/${order.id}`
    );
    const deliveryTimeData = await deliveryTimeResponse.json();

    if (deliveryTimeData.success) {
      console.log("✅ Cálculo de tempo bem-sucedido:");
      console.log(`   Distância: ${deliveryTimeData.data.distance}m`);
      console.log(`   Velocidade: ${deliveryTimeData.data.maxSpeed} km/h`);
      console.log(`   Tempo: ${deliveryTimeData.data.timeFormatted}`);

      if (deliveryTimeData.data.error) {
        console.log(`   ⚠️ Aviso: ${deliveryTimeData.data.error}`);
      }
    } else {
      console.log("❌ Erro no cálculo:", deliveryTimeData.error);
    }

    // 4. Testar cálculo para todos os pedidos do drone
    console.log("\n4. Testando cálculo para todos os pedidos do drone...");
    const allDeliveryTimesResponse = await fetch(
      `${API_BASE_URL}/routing/delivery-times/${drone.id}`
    );
    const allDeliveryTimesData = await allDeliveryTimesResponse.json();

    if (allDeliveryTimesData.success) {
      console.log(
        `✅ Cálculo para ${allDeliveryTimesData.data.length} pedidos:`
      );
      allDeliveryTimesData.data.forEach((deliveryTime, index) => {
        if (deliveryTime.error) {
          console.log(`   ${index + 1}. Erro: ${deliveryTime.error}`);
        } else {
          console.log(
            `   ${index + 1}. Tempo: ${deliveryTime.timeFormatted} (${
              deliveryTime.distance
            }m)`
          );
        }
      });
    } else {
      console.log("❌ Erro no cálculo múltiplo:", allDeliveryTimesData.error);
    }

    console.log("\n🎉 Teste concluído!");
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

// Aguardar um pouco para o servidor inicializar
setTimeout(testDeliveryTimeAPI, 3000);
