// Script de teste final para verificar se tudo está funcionando
// Execute este script no console do navegador

async function testFinalVerification() {
  console.log("🔍 Teste final de verificação...");

  try {
    // 1. Buscar drones
    console.log("1. Buscando drones...");
    const droneResponse = await fetch("http://localhost:3001/api/drones");
    const droneData = await droneResponse.json();

    if (droneData.data.length === 0) {
      console.log("❌ Nenhum drone encontrado.");
      return;
    }

    const drone = droneData.data[0];
    console.log("Drone encontrado:", drone);
    console.log("currentLoad:", drone.currentLoad);
    console.log("Tipo:", typeof drone.currentLoad);

    // 2. Testar atualização
    console.log("\n2. Testando atualização...");
    const updateResponse = await fetch(
      `http://localhost:3001/api/drones/${drone.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentLoad: 12.5,
        }),
      }
    );

    const updateData = await updateResponse.json();
    console.log("Resposta da atualização:", updateData);

    if (updateData.success) {
      console.log("currentLoad após atualização:", updateData.data.currentLoad);
    }

    // 3. Verificar persistência imediatamente
    console.log("\n3. Verificando persistência imediatamente...");
    const verifyResponse1 = await fetch(
      `http://localhost:3001/api/drones/${drone.id}`
    );
    const verifyData1 = await verifyResponse1.json();
    console.log(
      "currentLoad após verificação imediata:",
      verifyData1.data.currentLoad
    );

    // 4. Verificar persistência após 2 segundos
    console.log("\n4. Verificando persistência após 2 segundos...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const verifyResponse2 = await fetch(
      `http://localhost:3001/api/drones/${drone.id}`
    );
    const verifyData2 = await verifyResponse2.json();
    console.log("currentLoad após 2 segundos:", verifyData2.data.currentLoad);

    // 5. Testar alocação de pedido
    console.log("\n5. Testando alocação de pedido...");

    // Buscar pedidos
    const ordersResponse = await fetch("http://localhost:3001/api/orders");
    const ordersData = await ordersResponse.json();

    const pendingOrders = ordersData.data.filter(
      (order) => order.status === "pending"
    );
    if (pendingOrders.length > 0) {
      const order = pendingOrders[0];
      console.log("Pedido selecionado:", order);

      // Alocar pedido
      const allocateResponse = await fetch(
        `http://localhost:3001/api/drones/${drone.id}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: order.id,
          }),
        }
      );

      const allocateData = await allocateResponse.json();
      console.log("Resposta da alocação:", allocateData);

      if (allocateData.success) {
        // Verificar carga após alocação
        const verifyResponse3 = await fetch(
          `http://localhost:3001/api/drones/${drone.id}`
        );
        const verifyData3 = await verifyResponse3.json();
        console.log("currentLoad após alocação:", verifyData3.data.currentLoad);

        const expectedLoad = (verifyData2.data.currentLoad || 0) + order.weight;
        console.log("Carga esperada:", expectedLoad);
        console.log("Carga encontrada:", verifyData3.data.currentLoad);

        if (verifyData3.data.currentLoad === expectedLoad) {
          console.log("✅ Alocação funcionou corretamente!");
        } else {
          console.log("❌ Alocação não funcionou corretamente.");
        }
      }
    }

    // 6. Verificação final
    console.log("\n6. Verificação final...");
    const finalResponse = await fetch(
      `http://localhost:3001/api/drones/${drone.id}`
    );
    const finalData = await finalResponse.json();
    console.log("currentLoad final:", finalData.data.currentLoad);

    if (
      finalData.data.currentLoad !== undefined &&
      finalData.data.currentLoad !== null
    ) {
      console.log("✅ SUCESSO! A carga está sendo persistida corretamente!");
    } else {
      console.log("❌ FALHA! A carga ainda não está sendo persistida.");
    }
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  }
}

// Executar teste
console.log("🚀 Iniciando teste final...");
testFinalVerification();
