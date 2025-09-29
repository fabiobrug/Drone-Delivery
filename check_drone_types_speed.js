const { createClient } = require("@supabase/supabase-js");

// Configuração do Supabase
const supabaseUrl = "https://your-project.supabase.co";
const supabaseKey = "your-anon-key";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixDroneTypes() {
  console.log("🔍 Verificando tipos de drone e suas velocidades...\n");

  try {
    // 1. Buscar todos os tipos de drone
    console.log("1. Buscando tipos de drone...");
    const { data: droneTypes, error: typesError } = await supabase
      .from("drone_types")
      .select("*");

    if (typesError) {
      console.error("❌ Erro ao buscar tipos de drone:", typesError);
      return;
    }

    if (!droneTypes || droneTypes.length === 0) {
      console.log(
        "⚠️ Nenhum tipo de drone encontrado. Criando tipos padrão..."
      );

      // Criar tipos de drone padrão
      const defaultTypes = [
        {
          id: "type-light-" + Date.now(),
          name: "Drone Leve",
          capacity: 5.0,
          battery_range: 10.0,
          max_speed: 30.0, // 30 km/h
          description: "Drone para entregas leves e rápidas",
        },
        {
          id: "type-medium-" + Date.now(),
          name: "Drone Médio",
          capacity: 15.0,
          battery_range: 15.0,
          max_speed: 50.0, // 50 km/h
          description: "Drone para entregas médias",
        },
        {
          id: "type-heavy-" + Date.now(),
          name: "Drone Pesado",
          capacity: 25.0,
          battery_range: 20.0,
          max_speed: 40.0, // 40 km/h
          description: "Drone para entregas pesadas",
        },
      ];

      for (const type of defaultTypes) {
        const { error: createError } = await supabase
          .from("drone_types")
          .insert([type]);

        if (createError) {
          console.error(`❌ Erro ao criar tipo ${type.name}:`, createError);
        } else {
          console.log(`✅ Tipo criado: ${type.name} (${type.max_speed} km/h)`);
        }
      }
    } else {
      console.log(`✅ Encontrados ${droneTypes.length} tipos de drone:`);

      for (const type of droneTypes) {
        console.log(`   - ${type.name}:`);
        console.log(`     * Capacidade: ${type.capacity} kg`);
        console.log(
          `     * Velocidade: ${type.max_speed || "NÃO DEFINIDA"} km/h`
        );
        console.log(`     * Autonomia: ${type.battery_range} km`);

        // Se não tem velocidade definida, atualizar
        if (!type.max_speed || type.max_speed <= 0) {
          console.log(`     ⚠️ Velocidade não definida, atualizando...`);

          let defaultSpeed = 50; // Velocidade padrão
          if (type.capacity <= 5) defaultSpeed = 30;
          else if (type.capacity <= 15) defaultSpeed = 50;
          else defaultSpeed = 40;

          const { error: updateError } = await supabase
            .from("drone_types")
            .update({ max_speed: defaultSpeed })
            .eq("id", type.id);

          if (updateError) {
            console.error(`     ❌ Erro ao atualizar velocidade:`, updateError);
          } else {
            console.log(
              `     ✅ Velocidade atualizada para ${defaultSpeed} km/h`
            );
          }
        }
      }
    }

    // 2. Verificar drones existentes
    console.log("\n2. Verificando drones existentes...");
    const { data: drones, error: dronesError } = await supabase.from("drones")
      .select(`
        *,
        drone_types (
          id,
          name,
          capacity,
          battery_range,
          max_speed,
          description
        )
      `);

    if (dronesError) {
      console.error("❌ Erro ao buscar drones:", dronesError);
      return;
    }

    if (!drones || drones.length === 0) {
      console.log("⚠️ Nenhum drone encontrado.");
    } else {
      console.log(`✅ Encontrados ${drones.length} drones:`);

      for (const drone of drones) {
        console.log(`   - ${drone.serial_number}:`);
        console.log(`     * Posição: (${drone.x}, ${drone.y})`);
        console.log(`     * Status: ${drone.status}`);
        console.log(
          `     * Tipo: ${drone.drone_types?.name || "NÃO DEFINIDO"}`
        );
        console.log(
          `     * Velocidade: ${
            drone.drone_types?.max_speed || "NÃO DEFINIDA"
          } km/h`
        );

        if (!drone.drone_types) {
          console.log(`     ⚠️ Drone sem tipo definido!`);
        }
      }
    }

    // 3. Testar cálculo de tempo de entrega
    console.log("\n3. Testando cálculo de tempo de entrega...");

    if (drones && drones.length > 0) {
      const drone = drones[0];

      // Buscar pedidos do drone
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("drone_id", drone.id)
        .limit(1);

      if (ordersError) {
        console.error("❌ Erro ao buscar pedidos:", ordersError);
        return;
      }

      if (orders && orders.length > 0) {
        const order = orders[0];

        console.log(
          `   Testando com drone ${drone.serial_number} e pedido ${order.id}`
        );
        console.log(`   Drone posição: (${drone.x}, ${drone.y})`);
        console.log(`   Pedido posição: (${order.x}, ${order.y})`);
        console.log(
          `   Velocidade do drone: ${
            drone.drone_types?.max_speed || "NÃO DEFINIDA"
          } km/h`
        );

        // Calcular distância direta para comparação
        const directDistance =
          Math.sqrt(
            Math.pow(order.x - drone.x, 2) + Math.pow(order.y - drone.y, 2)
          ) * 100; // Converter para metros

        console.log(`   Distância direta: ${Math.round(directDistance)}m`);

        if (drone.drone_types?.max_speed) {
          const timeInHours =
            directDistance / 1000 / drone.drone_types.max_speed;
          const minutes = Math.floor(timeInHours * 60);
          const seconds = Math.floor((timeInHours * 3600) % 60);

          console.log(`   Tempo estimado: ${minutes}m ${seconds}s`);
        } else {
          console.log(
            `   ⚠️ Não é possível calcular tempo sem velocidade definida`
          );
        }
      } else {
        console.log("   ⚠️ Nenhum pedido encontrado para teste");
      }
    }

    console.log("\n🎉 Verificação concluída!");
  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

// Executar a verificação
checkAndFixDroneTypes();
