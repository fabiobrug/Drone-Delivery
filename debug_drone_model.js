// Script para testar o modelo de drone diretamente
// Execute este script no console do navegador

async function debugDroneModel() {
  console.log("🔍 Testando modelo de drone...");

  try {
    // 1. Testar busca de todos os drones
    console.log("1. Testando busca de todos os drones...");
    const response = await fetch("http://localhost:3001/api/drones");
    const data = await response.json();

    console.log("Status da resposta:", response.status);
    console.log("Dados brutos:", data);

    if (data.success && data.data.length > 0) {
      const drone = data.data[0];
      console.log("Primeiro drone:", drone);
      console.log("Tipo do drone:", typeof drone);
      console.log("Propriedades do drone:", Object.getOwnPropertyNames(drone));

      // Verificar se currentLoad existe
      console.log("currentLoad existe?", "currentLoad" in drone);
      console.log("currentLoad valor:", drone.currentLoad);
      console.log("currentLoad tipo:", typeof drone.currentLoad);

      // Verificar se current_load existe (formato do banco)
      console.log("current_load existe?", "current_load" in drone);
      console.log("current_load valor:", drone.current_load);
      console.log("current_load tipo:", typeof drone.current_load);

      // Listar todas as propriedades e valores
      console.log("Todas as propriedades e valores:");
      Object.keys(drone).forEach((key) => {
        console.log(`  ${key}: ${drone[key]} (${typeof drone[key]})`);
      });
    }
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  }
}

// Executar teste
console.log("🚀 Iniciando teste do modelo de drone...");
debugDroneModel();
