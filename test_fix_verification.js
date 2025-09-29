// Script para verificar se a correção funcionou
// Execute este script no console do navegador

async function testFixVerification() {
  console.log("🔍 Verificando se a correção funcionou...");

  try {
    // 1. Buscar drones e verificar se currentLoad está presente
    console.log("1. Buscando drones...");
    const droneResponse = await fetch("http://localhost:3001/api/drones");
    const droneData = await droneResponse.json();

    if (droneData.data.length === 0) {
      console.log("❌ Nenhum drone encontrado.");
      return;
    }

    const drone = droneData.data[0];
    console.log("Drone encontrado:", drone);
    console.log("currentLoad existe?", "currentLoad" in drone);
    console.log("currentLoad valor:", drone.currentLoad);
    console.log("currentLoad tipo:", typeof drone.currentLoad);

    if (drone.currentLoad !== undefined) {
      console.log("✅ CORREÇÃO FUNCIONOU! currentLoad está presente!");
    } else {
      console.log("❌ Correção não funcionou. currentLoad ainda é undefined.");
    }

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
          currentLoad: 8.5,
        }),
      }
    );

    const updateData = await updateResponse.json();
    console.log("Resposta da atualização:", updateData);

    if (updateData.success) {
      console.log("Dados retornados:", updateData.data);
      console.log("currentLoad após atualização:", updateData.data.currentLoad);

      if (updateData.data.currentLoad === 8.5) {
        console.log("✅ Atualização funcionou corretamente!");
      } else {
        console.log("❌ Atualização não funcionou corretamente.");
      }
    }

    // 3. Verificar persistência
    console.log("\n3. Verificando persistência...");
    const verifyResponse = await fetch(
      `http://localhost:3001/api/drones/${drone.id}`
    );
    const verifyData = await verifyResponse.json();
    console.log("Dados após verificação:", verifyData.data);
    console.log("currentLoad após verificação:", verifyData.data.currentLoad);

    if (verifyData.data.currentLoad === 8.5) {
      console.log("✅ Persistência funcionou corretamente!");
    } else {
      console.log("❌ Persistência não funcionou corretamente.");
    }
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  }
}

// Executar teste
console.log("🚀 Iniciando verificação da correção...");
testFixVerification();
