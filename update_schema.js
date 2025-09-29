import { supabase } from "./backend/config/supabase.js";
import fs from "fs";

async function updateNoFlyZonesSchema() {
  try {
    console.log("🔄 Atualizando schema das zonas no-fly...");

    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync(
      "update_no_fly_zones_schema.sql",
      "utf8"
    );

    // Executar o SQL
    const { data, error } = await supabase.rpc("exec_sql", { sql: sqlContent });

    if (error) {
      console.error("❌ Erro ao executar SQL:", error);
      return;
    }

    console.log("✅ Schema atualizado com sucesso!");

    // Verificar se as colunas foram criadas
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_name", "no_fly_zones")
      .in("column_name", ["min_x", "max_x", "min_y", "max_y", "area"]);

    if (columnsError) {
      console.error("❌ Erro ao verificar colunas:", columnsError);
      return;
    }

    console.log("📋 Colunas encontradas:");
    columns.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
  }
}

updateNoFlyZonesSchema();
