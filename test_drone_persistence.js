// Script de teste para verificar se a carga do drone está sendo persistida
// Execute este script no console do navegador ou como um teste

// Função para testar a persistência da carga do drone
async function testDroneLoadPersistence() {
  console.log("🧪 Iniciando teste de persistência da carga do drone...");

  try {
    // 1. Buscar todos os drones
    console.log("1. Buscando drones...");
    const dronesResponse = await fetch("http://localhost:3001/api/drones");
    const dronesData = await dronesResponse.json();
    console.log("Drones encontrados:", dronesData.data);

    if (dronesData.data.length === 0) {
      console.log("❌ Nenhum drone encontrado. Crie um drone primeiro.");
      return;
    }

    const drone = dronesData.data[0];
    console.log("Drone selecionado para teste:", drone);

    // 2. Verificar carga atual
    console.log("2. Carga atual do drone:", drone.currentLoad);

    // 3. Atualizar carga do drone
    console.log("3. Atualizando carga do drone...");
    const updateResponse = await fetch(
      `http://localhost:3001/api/drones/${drone.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentLoad: 5.5,
        }),
      }
    );

    const updateData = await updateResponse.json();
    console.log("Resposta da atualização:", updateData);

    if (updateData.success) {
      console.log("✅ Carga atualizada com sucesso!");

      // 4. Verificar se a carga foi persistida
      console.log("4. Verificando se a carga foi persistida...");
      const verifyResponse = await fetch(
        `http://localhost:3001/api/drones/${drone.id}`
      );
      const verifyData = await verifyResponse.json();

      console.log("Dados do drone após atualização:", verifyData.data);

      if (verifyData.data.currentLoad === 5.5) {
        console.log(
          "✅ Teste de persistência PASSOU! A carga foi salva corretamente."
        );
      } else {
        console.log(
          "❌ Teste de persistência FALHOU! A carga não foi salva corretamente."
        );
        console.log(
          "Carga esperada: 5.5, Carga encontrada:",
          verifyData.data.currentLoad
        );
      }
    } else {
      console.log("❌ Falha ao atualizar a carga do drone:", updateData.error);
    }
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  }
}

// Função para testar a alocação de pedido
async function testOrderAllocation() {
  console.log("🧪 Iniciando teste de alocação de pedido...");

  try {
    // 1. Buscar drones
    const dronesResponse = await fetch("http://localhost:3001/api/drones");
    const dronesData = await dronesResponse.json();

    if (dronesData.data.length === 0) {
      console.log("❌ Nenhum drone encontrado. Crie um drone primeiro.");
      return;
    }

    const drone = dronesData.data[0];
    console.log("Drone selecionado:", drone);

    // 2. Buscar pedidos pendentes
    const ordersResponse = await fetch("http://localhost:3001/api/orders");
    const ordersData = await ordersResponse.json();

    const pendingOrders = ordersData.data.filter(
      (order) => order.status === "pending"
    );
    console.log("Pedidos pendentes:", pendingOrders);

    if (pendingOrders.length === 0) {
      console.log(
        "❌ Nenhum pedido pendente encontrado. Crie um pedido primeiro."
      );
      return;
    }

    const order = pendingOrders[0];
    console.log("Pedido selecionado:", order);

    // 3. Alocar pedido ao drone
    console.log("3. Alocando pedido ao drone...");
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

      // 4. Verificar se a carga foi atualizada
      console.log("4. Verificando se a carga foi atualizada...");
      const verifyResponse = await fetch(
        `http://localhost:3001/api/drones/${drone.id}`
      );
      const verifyData = await verifyResponse.json();

      console.log("Dados do drone após alocação:", verifyData.data);

      const expectedLoad = drone.currentLoad + order.weight;
      if (verifyData.data.currentLoad === expectedLoad) {
        console.log(
          "✅ Teste de alocação PASSOU! A carga foi atualizada corretamente."
        );
        console.log(
          `Carga esperada: ${expectedLoad}, Carga encontrada: ${verifyData.data.currentLoad}`
        );
      } else {
        console.log(
          "❌ Teste de alocação FALHOU! A carga não foi atualizada corretamente."
        );
        console.log(
          `Carga esperada: ${expectedLoad}, Carga encontrada: ${verifyData.data.currentLoad}`
        );
      }
    } else {
      console.log("❌ Falha ao alocar pedido:", allocateData.message);
    }
  } catch (error) {
    console.error("❌ Erro durante o teste de alocação:", error);
  }
}

// Executar os testes
console.log("🚀 Executando testes de persistência...");
testDroneLoadPersistence().then(() => {
  console.log("🔄 Aguardando 2 segundos antes do próximo teste...");
  setTimeout(() => {
    testOrderAllocation();
  }, 2000);
});
