// Script para testar diretamente o banco de dados
// Execute este script no console do navegador

async function testDatabaseDirect() {
  console.log("🔍 Testando diretamente o banco de dados...");

  try {
    // 1. Buscar drone
    console.log("1. Buscando drone...");
    const droneResponse = await fetch("http://localhost:3001/api/drones");
    const droneData = await droneResponse.json();

    if (droneData.data.length === 0) {
      console.log("❌ Nenhum drone encontrado.");
      return;
    }

    const drone = droneData.data[0];
    console.log("Drone encontrado:", drone);
    console.log("Carga atual:", drone.currentLoad);

    // 2. Atualizar carga via API
    console.log("\n2. Atualizando carga via API...");
    const updateResponse = await fetch(
      `http://localhost:3001/api/drones/${drone.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentLoad: 7.5,
        }),
      }
    );

    const updateData = await updateResponse.json();
    console.log("Resposta da API:", updateData);

    if (updateData.success) {
      console.log("✅ API retornou sucesso!");
      console.log("Dados retornados pela API:", updateData.data);

      // 3. Verificar se os dados retornados pela API estão corretos
      if (updateData.data.currentLoad === 7.5) {
        console.log("✅ API retornou a carga correta!");
      } else {
        console.log("❌ API retornou carga incorreta!");
        console.log("Esperado: 7.5, Retornado:", updateData.data.currentLoad);
      }

      // 4. Fazer nova consulta para verificar persistência
      console.log("\n3. Fazendo nova consulta para verificar persistência...");
      const verifyResponse = await fetch(
        `http://localhost:3001/api/drones/${drone.id}`
      );
      const verifyData = await verifyResponse.json();
      console.log("Dados da nova consulta:", verifyData.data);

      if (verifyData.data.currentLoad === 7.5) {
        console.log("✅ Carga persistida corretamente no banco!");
      } else {
        console.log("❌ Carga NÃO foi persistida no banco!");
        console.log("Esperado: 7.5, Encontrado:", verifyData.data.currentLoad);
      }
    } else {
      console.log("❌ API retornou erro:", updateData.error);
    }
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  }
}

// Função para testar alocação de pedido
async function testOrderAllocationDirect() {
  console.log("\n🔍 Testando alocação de pedido diretamente...");

  try {
    // 1. Buscar drone
    const droneResponse = await fetch("http://localhost:3001/api/drones");
    const droneData = await droneResponse.json();

    if (droneData.data.length === 0) {
      console.log("❌ Nenhum drone encontrado.");
      return;
    }

    const drone = droneData.data[0];
    console.log("Drone:", drone);
    console.log("Carga atual:", drone.currentLoad);

    // 2. Buscar pedido
    const orderResponse = await fetch("http://localhost:3001/api/orders");
    const orderData = await orderResponse.json();

    const pendingOrders = orderData.data.filter(
      (order) => order.status === "pending"
    );
    if (pendingOrders.length === 0) {
      console.log("❌ Nenhum pedido pendente encontrado.");
      return;
    }

    const order = pendingOrders[0];
    console.log("Pedido:", order);
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
      console.log("Dados após alocação:", verifyData.data);

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
    console.error("❌ Erro durante o teste de alocação:", error);
  }
}

// Executar testes
console.log("🚀 Iniciando testes diretos...");
testDatabaseDirect().then(() => {
  console.log("\n🔄 Aguardando 2 segundos...");
  setTimeout(() => {
    testOrderAllocationDirect();
  }, 2000);
});
