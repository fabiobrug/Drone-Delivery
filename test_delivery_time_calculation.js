const { createClient } = require("@supabase/supabase-js");

// Configuração do Supabase
const supabaseUrl = "https://your-project.supabase.co";
const supabaseKey = "your-anon-key";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeliveryTimeCalculation() {
  console.log("🚀 Testando cálculo de tempo de entrega...\n");

  try {
    // 1. Buscar um drone com pedidos
    console.log("1. Buscando drones com pedidos...");
    const { data: drones, error: dronesError } = await supabase
      .from("drones")
      .select(
        `
        *,
        drone_types (
          id,
          name,
          capacity,
          battery_range,
          max_speed,
          description
        )
      `
      )
      .limit(1);

    if (dronesError) {
      console.error("❌ Erro ao buscar drones:", dronesError);
      return;
    }

    if (!drones || drones.length === 0) {
      console.log("⚠️ Nenhum drone encontrado. Criando um drone de teste...");

      // Criar um drone de teste
      const { data: droneType, error: typeError } = await supabase
        .from("drone_types")
        .select("*")
        .limit(1)
        .single();

      if (typeError) {
        console.error("❌ Erro ao buscar tipo de drone:", typeError);
        return;
      }

      const { data: newDrone, error: createError } = await supabase
        .from("drones")
        .insert([
          {
            id: "drone-test-" + Date.now(),
            serial_number: "TEST-" + Date.now(),
            type_id: droneType.id,
            x: 25.0,
            y: 25.0,
            status: "idle",
            battery: 100.0,
            capacity: droneType.capacity,
            current_load: 0.0,
            target_x: null,
            target_y: null,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("❌ Erro ao criar drone:", createError);
        return;
      }

      drones.push(newDrone);
    }

    const drone = drones[0];
    console.log("✅ Drone encontrado:", {
      id: drone.id,
      serialNumber: drone.serial_number,
      position: `(${drone.x}, ${drone.y})`,
      maxSpeed: drone.drone_types?.max_speed || "N/A",
    });

    // 2. Buscar pedidos alocados ao drone
    console.log("\n2. Buscando pedidos do drone...");
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("drone_id", drone.id);

    if (ordersError) {
      console.error("❌ Erro ao buscar pedidos:", ordersError);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log(
        "⚠️ Nenhum pedido encontrado para o drone. Criando um pedido de teste..."
      );

      // Criar um pedido de teste
      const { data: newOrder, error: createOrderError } = await supabase
        .from("orders")
        .insert([
          {
            id: "order-test-" + Date.now(),
            x: 30.0,
            y: 30.0,
            weight: 2.5,
            priority: "medium",
            status: "allocated",
            drone_id: drone.id,
          },
        ])
        .select()
        .single();

      if (createOrderError) {
        console.error("❌ Erro ao criar pedido:", createOrderError);
        return;
      }

      orders.push(newOrder);
    }

    const order = orders[0];
    console.log("✅ Pedido encontrado:", {
      id: order.id,
      position: `(${order.x}, ${order.y})`,
      weight: order.weight,
      priority: order.priority,
    });

    // 3. Testar cálculo de tempo de entrega via API
    console.log("\n3. Testando cálculo de tempo de entrega...");

    const API_BASE_URL = "http://localhost:3001/api";

    try {
      const response = await fetch(
        `${API_BASE_URL}/routing/delivery-time/${drone.id}/${order.id}`
      );
      const data = await response.json();

      if (data.success) {
        console.log("✅ Cálculo de tempo de entrega bem-sucedido:");
        console.log("   - Tempo formatado:", data.data.timeFormatted);
        console.log(
          "   - Distância:",
          Math.round(data.data.distance),
          "metros"
        );
        console.log("   - Velocidade máxima:", data.data.maxSpeed, "km/h");
        console.log("   - Tempo em horas:", data.data.timeInHours);
        console.log("   - Tempo em minutos:", data.data.timeInMinutes);
        console.log("   - Número de waypoints:", data.data.waypoints);

        // Verificar se a distância está correta (aproximadamente)
        const expectedDistance =
          Math.sqrt(
            Math.pow(order.x - drone.x, 2) + Math.pow(order.y - drone.y, 2)
          ) * 100; // Converter para metros

        console.log("\n📏 Verificação de distância:");
        console.log(
          "   - Distância calculada pela API:",
          Math.round(data.data.distance),
          "m"
        );
        console.log(
          "   - Distância esperada (linha reta):",
          Math.round(expectedDistance),
          "m"
        );
        console.log(
          "   - Diferença:",
          Math.round(Math.abs(data.data.distance - expectedDistance)),
          "m"
        );

        if (Math.abs(data.data.distance - expectedDistance) < 50) {
          console.log("✅ Distância calculada está próxima do esperado");
        } else {
          console.log(
            "⚠️ Distância calculada difere significativamente do esperado"
          );
        }
      } else {
        console.error("❌ Erro no cálculo de tempo de entrega:", data.error);
      }
    } catch (apiError) {
      console.error("❌ Erro na chamada da API:", apiError.message);
      console.log(
        "💡 Certifique-se de que o servidor backend está rodando na porta 3001"
      );
    }

    // 4. Testar cálculo para todos os pedidos do drone
    console.log("\n4. Testando cálculo para todos os pedidos do drone...");

    try {
      const response = await fetch(
        `${API_BASE_URL}/routing/delivery-times/${drone.id}`
      );
      const data = await response.json();

      if (data.success) {
        console.log("✅ Cálculo de tempos para todos os pedidos bem-sucedido:");
        data.data.forEach((deliveryTime, index) => {
          if (deliveryTime.error) {
            console.log(`   Pedido ${index + 1}: ❌ ${deliveryTime.error}`);
          } else {
            console.log(
              `   Pedido ${index + 1}: ✅ ${
                deliveryTime.timeFormatted
              } (${Math.round(deliveryTime.distance)}m)`
            );
          }
        });
      } else {
        console.error("❌ Erro no cálculo de tempos:", data.error);
      }
    } catch (apiError) {
      console.error("❌ Erro na chamada da API:", apiError.message);
    }

    console.log("\n🎉 Teste de cálculo de tempo de entrega concluído!");
  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

// Executar o teste
testDeliveryTimeCalculation();
