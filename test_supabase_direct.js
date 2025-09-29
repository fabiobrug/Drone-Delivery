// Script para testar diretamente o Supabase
// Execute este script no console do navegador

async function testSupabaseDirect() {
  console.log("🔍 Testando diretamente o Supabase...");

  try {
    // 1. Buscar drone e verificar todos os campos retornados
    console.log("1. Buscando drone e verificando campos...");
    const droneResponse = await fetch("http://localhost:3001/api/drones");
    const droneData = await droneResponse.json();

    if (droneData.data.length === 0) {
      console.log("❌ Nenhum drone encontrado.");
      return;
    }

    const drone = droneData.data[0];
    console.log("Drone completo:", drone);
    console.log("Chaves do objeto drone:", Object.keys(drone));
    console.log("currentLoad:", drone.currentLoad);
    console.log("current_load:", drone.current_load);

    // 2. Verificar se há algum campo relacionado à carga
    const loadFields = Object.keys(drone).filter(
      (key) =>
        key.toLowerCase().includes("load") ||
        key.toLowerCase().includes("carga") ||
        key.toLowerCase().includes("weight")
    );
    console.log("Campos relacionados à carga:", loadFields);

    // 3. Testar atualização e verificar resposta
    console.log("\n2. Testando atualização...");
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
      console.log("Dados retornados pela atualização:", updateData.data);
      console.log("Chaves dos dados retornados:", Object.keys(updateData.data));
      console.log(
        "currentLoad nos dados retornados:",
        updateData.data.currentLoad
      );
      console.log(
        "current_load nos dados retornados:",
        updateData.data.current_load
      );
    }
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  }
}

// Executar teste
console.log("🚀 Iniciando teste do Supabase...");
testSupabaseDirect();
