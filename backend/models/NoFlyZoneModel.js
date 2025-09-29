import { supabase } from "../config/database.js";

export class NoFlyZoneModel {
  constructor() {
    this.tableName = "no_fly_zones";
    this.pointsTableName = "no_fly_zone_points";
  }

  async findAll() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(
        `
        *,
        no_fly_zone_points (
          id,
          x,
          y
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(
        `
        *,
        no_fly_zone_points (
          id,
          x,
          y
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(zoneData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([
        {
          id: zoneData.id,
          name: zoneData.name || `No-Fly Zone ${Date.now()}`,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Adicionar pontos se fornecidos
    if (zoneData.points && zoneData.points.length > 0) {
      await this.addPointsToZone(data.id, zoneData.points);
    }

    return this.formatNoFlyZoneData(data);
  }

  async update(id, updateData) {
    const updateFields = {};

    if (updateData.name !== undefined) updateFields.name = updateData.name;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.formatNoFlyZoneData(data);
  }

  async delete(id) {
    // Primeiro deletar os pontos
    await supabase.from(this.pointsTableName).delete().eq("zone_id", id);

    // Depois deletar a zona
    const { error } = await supabase.from(this.tableName).delete().eq("id", id);

    if (error) throw error;
    return true;
  }

  async addPointsToZone(zoneId, points) {
    const pointsData = points.map((point, index) => ({
      zone_id: zoneId,
      x: point.x,
      y: point.y,
      point_order: index + 1,
    }));

    const { error } = await supabase
      .from(this.pointsTableName)
      .insert(pointsData);

    if (error) throw error;
    return true;
  }

  async removePointsFromZone(zoneId) {
    const { error } = await supabase
      .from(this.pointsTableName)
      .delete()
      .eq("zone_id", zoneId);

    if (error) throw error;
    return true;
  }

  async checkPointInNoFlyZone(x, y) {
    // Usar a função do banco de dados para verificação mais eficiente
    const { data, error } = await supabase.rpc("is_point_in_no_fly_zone", {
      check_x: x,
      check_y: y,
    });

    if (error) throw error;
    return data === true;
  }

  async getNoFlyZonesForPoint(x, y) {
    const { data, error } = await supabase.rpc("get_no_fly_zones_for_point", {
      check_x: x,
      check_y: y,
    });

    if (error) throw error;
    return data || [];
  }

  async getNoFlyZonesForPathfinding() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("id, name, min_x, max_x, min_y, max_y, area")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  formatNoFlyZoneData(data) {
    if (!data) return null;

    return {
      id: data.id,
      name: data.name || `No-Fly Zone ${data.id}`,
      description: data.description || "",
      points: data.no_fly_zone_points
        ? data.no_fly_zone_points.map((point) => ({
            id: point.id,
            x: parseFloat(point.x),
            y: parseFloat(point.y),
          }))
        : [],
      // Informações de área (se disponíveis)
      area: data.area || 0,
      minX: data.min_x || 0,
      maxX: data.max_x || 0,
      minY: data.min_y || 0,
      maxY: data.max_y || 0,
      width: data.width || 0,
      height: data.height || 0,
      cellCount: data.cell_count || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
