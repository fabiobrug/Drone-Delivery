import { supabase } from "../config/database.js";

export class DroneModel {
  constructor() {
    this.tableName = "drones";
  }

  async findAll() {
    const { data, error } = await supabase
      .from(this.tableName)
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
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((drone) => this.formatDroneData(drone));
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
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
      .eq("id", id)
      .single();

    if (error) throw error;
    return this.formatDroneData(data);
  }

  async findBySerialNumber(serialNumber) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("serial_number", serialNumber)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data ? this.formatDroneData(data) : null;
  }

  async findByTypeId(typeId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("type_id", typeId);

    if (error) throw error;
    return (data || []).map((drone) => this.formatDroneData(drone));
  }

  async create(droneData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([
        {
          id: droneData.id,
          serial_number: droneData.serialNumber,
          type_id: droneData.typeId,
          x: droneData.x,
          y: droneData.y,
          status: droneData.status,
          battery: droneData.battery,
          capacity: droneData.capacity,
          current_load: droneData.currentLoad,
          target_x: droneData.targetX,
          target_y: droneData.targetY,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return this.formatDroneData(data);
  }

  async update(id, updateData) {
    const updateFields = {};

    if (updateData.serialNumber !== undefined)
      updateFields.serial_number = updateData.serialNumber;
    if (updateData.typeId !== undefined)
      updateFields.type_id = updateData.typeId;
    if (updateData.x !== undefined) updateFields.x = updateData.x;
    if (updateData.y !== undefined) updateFields.y = updateData.y;
    if (updateData.status !== undefined)
      updateFields.status = updateData.status;
    if (updateData.battery !== undefined)
      updateFields.battery = updateData.battery;
    if (updateData.capacity !== undefined)
      updateFields.capacity = updateData.capacity;
    if (updateData.currentLoad !== undefined)
      updateFields.current_load = updateData.currentLoad;
    if (updateData.targetX !== undefined)
      updateFields.target_x = updateData.targetX;
    if (updateData.targetY !== undefined)
      updateFields.target_y = updateData.targetY;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.formatDroneData(data);
  }

  async delete(id) {
    const { error } = await supabase.from(this.tableName).delete().eq("id", id);

    if (error) throw error;
    return true;
  }

  formatDroneData(data) {
    if (!data) return null;

    return {
      id: data.id,
      serialNumber: data.serial_number,
      typeId: data.type_id,
      x: parseFloat(data.x),
      y: parseFloat(data.y),
      status: data.status,
      battery: parseFloat(data.battery),
      capacity: parseFloat(data.capacity),
      currentLoad: parseFloat(data.current_load),
      targetX: data.target_x ? parseFloat(data.target_x) : null,
      targetY: data.target_y ? parseFloat(data.target_y) : null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      droneType: data.drone_types
        ? {
            id: data.drone_types.id,
            name: data.drone_types.name,
            capacity: parseFloat(data.drone_types.capacity),
            batteryRange: parseFloat(data.drone_types.battery_range),
            maxSpeed: parseFloat(data.drone_types.max_speed),
            description: data.drone_types.description,
          }
        : null,
    };
  }
}
