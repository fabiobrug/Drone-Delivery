// Script de debug para investigar o problema da carga do drone
// Execute este script no console do navegador

async function debugDroneLoad() {
  console.log("🔍 Iniciando debug da carga do drone...");

  try {
    // 1. Buscar todos os drones
    console.log("1. Buscando todos os drones...");
    const dronesResponse = await fetch("http://localhost:3001/api/drones");
    const dronesData = await dronesResponse.json();
    console.log("Drones encontrados:", dronesData.data);

    if (dronesData.data.length === 0) {
      console.log("❌ Nenhum drone encontrado. Crie um drone primeiro.");
      return;
    }

    const drone = dronesData.data[0];
    console.log("Drone selecionado:", drone);
    console.log("Carga atual:", drone.currentLoad);
    console.log("Status:", drone.status);

    // 2. Testar atualização direta da carga
    console.log("\n2. Testando atualização direta da carga...");
    const updateResponse = await fetch(
      `http://localhost:3001/api/drones/${drone.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentLoad: 3.5,
        }),
      }
    );

    const updateData = await updateResponse.json();
    console.log("Resposta da atualização:", updateData);

    if (updateData.success) {
      console.log("✅ Atualização bem-sucedida!");
      console.log("Dados retornados:", updateData.data);

      // 3. Verificar imediatamente após a atualização
      console.log("\n3. Verificando imediatamente após atualização...");
      const verifyResponse = await fetch(
        `http://localhost:3001/api/drones/${drone.id}`
      );
      const verifyData = await verifyResponse.json();
      console.log("Dados verificados:", verifyData.data);

      if (verifyData.data.currentLoad === 3.5) {
        console.log("✅ Carga persistida corretamente!");
      } else {
        console.log("❌ Carga NÃO foi persistida!");
        console.log("Esperado: 3.5, Encontrado:", verifyData.data.currentLoad);
      }

      // 4. Aguardar 2 segundos e verificar novamente
      console.log("\n4. Aguardando 2 segundos e verificando novamente...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const verifyResponse2 = await fetch(
        `http://localhost:3001/api/drones/${drone.id}`
      );
      const verifyData2 = await verifyResponse2.json();
      console.log("Dados após 2 segundos:", verifyData2.data);

      if (verifyData2.data.currentLoad === 3.5) {
        console.log("✅ Carga ainda persistida após 2 segundos!");
      } else {
        console.log("❌ Carga foi perdida após 2 segundos!");
        console.log("Esperado: 3.5, Encontrado:", verifyData2.data.currentLoad);
      }
    } else {
      console.log("❌ Falha na atualização:", updateData.error);
    }
  } catch (error) {
    console.error("❌ Erro durante o debug:", error);
  }
}

// Função para testar alocação de pedido
async function debugOrderAllocation() {
  console.log("\n🔍 Iniciando debug da alocação de pedido...");

  try {
    // 1. Buscar drones
    const dronesResponse = await fetch("http://localhost:3001/api/drones");
    const dronesData = await dronesResponse.json();

    if (dronesData.data.length === 0) {
      console.log("❌ Nenhum drone encontrado.");
      return;
    }

    const drone = dronesData.data[0];
    console.log("Drone selecionado:", drone);
    console.log("Carga atual do drone:", drone.currentLoad);

    // 2. Buscar pedidos pendentes
    const ordersResponse = await fetch("http://localhost:3001/api/orders");
    const ordersData = await ordersResponse.json();

    const pendingOrders = ordersData.data.filter(
      (order) => order.status === "pending"
    );
    console.log("Pedidos pendentes:", pendingOrders);

    if (pendingOrders.length === 0) {
      console.log("❌ Nenhum pedido pendente encontrado.");
      return;
    }

    const order = pendingOrders[0];
    console.log("Pedido selecionado:", order);
    console.log("Peso do pedido:", order.weight);

    // 3. Alocar pedido
    console.log("\n3. Alocando pedido...");
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
      console.log("✅ Pedido alocado com sucesso!");

      // 4. Verificar carga após alocação
      console.log("\n4. Verificando carga após alocação...");
      const verifyResponse = await fetch(
        `http://localhost:3001/api/drones/${drone.id}`
      );
      const verifyData = await verifyResponse.json();
      console.log("Dados do drone após alocação:", verifyData.data);

      const expectedLoad = drone.currentLoad + order.weight;
      console.log("Carga esperada:", expectedLoad);
      console.log("Carga encontrada:", verifyData.data.currentLoad);

      if (verifyData.data.currentLoad === expectedLoad) {
        console.log("✅ Carga atualizada corretamente!");
      } else {
        console.log("❌ Carga NÃO foi atualizada corretamente!");
      }
    } else {
      console.log("❌ Falha na alocação:", allocateData.message);
    }
  } catch (error) {
    console.error("❌ Erro durante o debug de alocação:", error);
  }
}

// Executar debug
console.log("🚀 Iniciando debug completo...");
debugDroneLoad().then(() => {
  console.log("\n🔄 Aguardando 3 segundos antes do próximo teste...");
  setTimeout(() => {
    debugOrderAllocation();
  }, 3000);
});
