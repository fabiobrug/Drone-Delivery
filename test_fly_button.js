const { DroneService } = require("./backend/services/DroneService.js");
const {
  FlightSimulationService,
} = require("./backend/services/FlightSimulationService.js");

async function testFlyButton() {
  console.log("🧪 Testing Fly Button Implementation...\n");

  try {
    const droneService = new DroneService();

    // 1. Listar todos os drones
    console.log("1️⃣ Getting all drones...");
    const drones = await droneService.getAllDrones();
    console.log(`Found ${drones.length} drones:`);
    drones.forEach((drone) => {
      console.log(
        `  - ${drone.serialNumber}: status=${drone.status}, load=${drone.currentLoad}, battery=${drone.battery}%`
      );
    });

    // 2. Encontrar um drone com carga para testar
    const droneWithLoad = drones.find(
      (d) =>
        d.currentLoad > 0 && (d.status === "loading" || d.status === "idle")
    );

    if (!droneWithLoad) {
      console.log(
        "❌ No drone with load found. Please allocate some orders to drones first."
      );
      return;
    }

    console.log(
      `\n2️⃣ Testing flight with drone: ${droneWithLoad.serialNumber}`
    );
    console.log(`   Status: ${droneWithLoad.status}`);
    console.log(`   Load: ${droneWithLoad.currentLoad}kg`);
    console.log(`   Battery: ${droneWithLoad.battery}%`);
    console.log(`   Position: (${droneWithLoad.x}, ${droneWithLoad.y})`);

    // 3. Iniciar voo
    console.log("\n3️⃣ Starting flight...");
    const result = await droneService.startDroneFlight(droneWithLoad.id);

    if (result.success) {
      console.log("✅ Flight started successfully!");
      console.log(`   Message: ${result.message}`);
      console.log(`   Delivery time: ${result.deliveryTime} seconds`);

      // 4. Verificar status após alguns segundos
      console.log("\n4️⃣ Checking status after 10 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const updatedDrone = await droneService.getDroneById(droneWithLoad.id);
      console.log(`   Status: ${updatedDrone.status}`);
      console.log(`   Battery: ${updatedDrone.battery}%`);
      console.log(
        `   Position: (${updatedDrone.x.toFixed(2)}, ${updatedDrone.y.toFixed(
          2
        )})`
      );

      // 5. Verificar novamente após mais tempo
      console.log("\n5️⃣ Checking status after 20 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const finalDrone = await droneService.getDroneById(droneWithLoad.id);
      console.log(`   Status: ${finalDrone.status}`);
      console.log(`   Battery: ${finalDrone.battery}%`);
      console.log(
        `   Position: (${finalDrone.x.toFixed(2)}, ${finalDrone.y.toFixed(2)})`
      );
    } else {
      console.log("❌ Failed to start flight:");
      console.log(`   Error: ${result.message}`);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testFlyButton()
    .then(() => {
      console.log("\n🏁 Test completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}

module.exports = { testFlyButton };
