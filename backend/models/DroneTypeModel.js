import { supabase } from "../config/database.js";

export class DroneTypeModel {
  constructor() {
    this.tableName = "drone_types";
  }

  async findAll() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(droneTypeData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([
        {
          id: droneTypeData.id,
          name: droneTypeData.name,
          capacity: droneTypeData.capacity,
          battery_range: droneTypeData.batteryRange,
          max_speed: droneTypeData.maxSpeed,
          description: droneTypeData.description,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, updateData) {
    const updateFields = {};
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.capacity !== undefined)
      updateFields.capacity = updateData.capacity;
    if (updateData.batteryRange !== undefined)
      updateFields.battery_range = updateData.batteryRange;
    if (updateData.maxSpeed !== undefined)
      updateFields.max_speed = updateData.maxSpeed;
    if (updateData.description !== undefined)
      updateFields.description = updateData.description;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase.from(this.tableName).delete().eq("id", id);

    if (error) throw error;
    return true;
  }
}
