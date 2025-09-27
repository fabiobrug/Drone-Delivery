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
          name: zoneData.name,
          description: zoneData.description,
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
    if (updateData.description !== undefined)
      updateFields.description = updateData.description;

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
    const pointsData = points.map((point) => ({
      zone_id: zoneId,
      x: point.x,
      y: point.y,
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
    const { data, error } = await supabase
      .from(this.pointsTableName)
      .select(
        `
        zone_id,
        no_fly_zones (
          id,
          name
        )
      `
      )
      .eq("x", x)
      .eq("y", y);

    if (error) throw error;
    return data && data.length > 0;
  }

  formatNoFlyZoneData(data) {
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      points: data.no_fly_zone_points
        ? data.no_fly_zone_points.map((point) => ({
            id: point.id,
            x: parseFloat(point.x),
            y: parseFloat(point.y),
          }))
        : [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
