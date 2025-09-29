const { createClient } = require("@supabase/supabase-js");

// Configuração do Supabase
const supabaseUrl = "https://your-project.supabase.co";
const supabaseKey = "your-anon-key";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSpeedIssue() {
  console.log("🔍 Testando problema da velocidade...\n");

  try {
    // 1. Verificar tipos de drone
    console.log("1. Verificando tipos de drone...");
    const { data: droneTypes, error: typesError } = await supabase
      .from("drone_types")
      .select("*");

    if (typesError) {
      console.error("❌ Erro ao buscar tipos:", typesError);
      return;
    }

    if (!droneTypes || droneTypes.length === 0) {
      console.log("⚠️ Nenhum tipo de drone encontrado!");
      console.log("💡 Execute o script check_drone_types_speed.js primeiro");
      return;
    }

    console.log(`✅ Encontrados ${droneTypes.length} tipos:`);
    droneTypes.forEach((type) => {
      console.log(
        `   - ${type.name}: ${type.max_speed || "SEM VELOCIDADE"} km/h`
      );
    });

    // 2. Verificar drones
    console.log("\n2. Verificando drones...");
    const { data: drones, error: dronesError } = await supabase.from("drones")
      .select(`
        *,
        drone_types (
          id,
          name,
          max_speed
        )
      `);

    if (dronesError) {
      console.error("❌ Erro ao buscar drones:", dronesError);
      return;
    }

    if (!drones || drones.length === 0) {
      console.log("⚠️ Nenhum drone encontrado!");
      return;
    }

    console.log(`✅ Encontrados ${drones.length} drones:`);
    drones.forEach((drone) => {
      console.log(`   - ${drone.serial_number}:`);
      console.log(`     * Tipo: ${drone.drone_types?.name || "SEM TIPO"}`);
      console.log(
        `     * Velocidade: ${
          drone.drone_types?.max_speed || "SEM VELOCIDADE"
        } km/h`
      );
    });

    // 3. Testar API diretamente
    console.log("\n3. Testando API de cálculo de tempo...");

    const API_BASE_URL = "http://localhost:3001/api";

    // Buscar um drone com pedidos
    const droneWithOrders = drones.find(
      (drone) => drone.drone_types?.max_speed > 0
    );

    if (!droneWithOrders) {
      console.log("⚠️ Nenhum drone com velocidade definida encontrado!");
      return;
    }

    // Buscar pedidos do drone
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("drone_id", droneWithOrders.id)
      .limit(1);

    if (ordersError) {
      console.error("❌ Erro ao buscar pedidos:", ordersError);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log("⚠️ Nenhum pedido encontrado para o drone!");
      return;
    }

    const order = orders[0];

    console.log(`   Testando com:`);
    console.log(`   - Drone: ${droneWithOrders.serial_number}`);
    console.log(
      `   - Velocidade: ${droneWithOrders.drone_types.max_speed} km/h`
    );
    console.log(`   - Pedido: ${order.id}`);
    console.log(
      `   - Posições: Drone(${droneWithOrders.x}, ${droneWithOrders.y}) -> Pedido(${order.x}, ${order.y})`
    );

    // Chamar API
    try {
      const response = await fetch(
        `${API_BASE_URL}/routing/delivery-time/${droneWithOrders.id}/${order.id}`
      );

      if (!response.ok) {
        console.error(`❌ Erro HTTP: ${response.status}`);
        const errorText = await response.text();
        console.error(`   Resposta: ${errorText}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        console.log("\n✅ Cálculo bem-sucedido:");
        console.log(`   - Tempo: ${data.data.timeFormatted}`);
        console.log(`   - Distância: ${Math.round(data.data.distance)}m`);
        console.log(`   - Velocidade: ${data.data.maxSpeed} km/h`);
        console.log(`   - Waypoints: ${data.data.waypoints}`);

        // Verificar se a velocidade está correta
        if (data.data.maxSpeed === droneWithOrders.drone_types.max_speed) {
          console.log("✅ Velocidade está correta!");
        } else {
          console.log(
            `⚠️ Velocidade incorreta! Esperado: ${droneWithOrders.drone_types.max_speed}, Recebido: ${data.data.maxSpeed}`
          );
        }
      } else {
        console.error("❌ Erro na API:", data.error);
      }
    } catch (apiError) {
      console.error("❌ Erro na chamada da API:", apiError.message);
      console.log(
        "💡 Certifique-se de que o servidor backend está rodando na porta 3001"
      );
    }

    console.log("\n🎉 Teste concluído!");
  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

// Executar o teste
testSpeedIssue();
