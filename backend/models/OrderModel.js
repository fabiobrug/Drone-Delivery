import { supabase } from "../config/database.js";

export class OrderModel {
  constructor() {
    this.tableName = "orders";
  }

  async findAll(filters = {}) {
    let query = supabase
      .from(this.tableName)
      .select(
        `
                *,
                drones (
                    id,
                    serial_number,
                    status
                )
            `
      )
      .order("created_at", { ascending: false });

    // Aplicar filtros
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.priority) {
      query = query.eq("priority", filters.priority);
    }
    if (filters.droneId) {
      query = query.eq("drone_id", filters.droneId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(
        `
                *,
                drones (
                    id,
                    serial_number,
                    status
                )
            `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async findByDroneId(droneId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("drone_id", droneId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findByStatus(status) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async create(orderData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([
        {
          id: orderData.id,
          x: orderData.x,
          y: orderData.y,
          weight: orderData.weight,
          priority: orderData.priority,
          status: orderData.status,
          drone_id: orderData.droneId || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return this.formatOrderData(data);
  }

  async update(id, updateData) {
    const updateFields = {};

    if (updateData.x !== undefined) updateFields.x = updateData.x;
    if (updateData.y !== undefined) updateFields.y = updateData.y;
    if (updateData.weight !== undefined)
      updateFields.weight = updateData.weight;
    if (updateData.priority !== undefined)
      updateFields.priority = updateData.priority;
    if (updateData.status !== undefined)
      updateFields.status = updateData.status;
    if (updateData.droneId !== undefined)
      updateFields.drone_id = updateData.droneId;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.formatOrderData(data);
  }

  async delete(id) {
    const { error } = await supabase.from(this.tableName).delete().eq("id", id);

    if (error) throw error;
    return true;
  }

  async removeDroneFromOrders(droneId) {
    const { error } = await supabase
      .from(this.tableName)
      .update({
        drone_id: null,
        status: "pending",
      })
      .eq("drone_id", droneId);

    if (error) throw error;
    return true;
  }

  formatOrderData(data) {
    if (!data) return null;

    return {
      id: data.id,
      x: parseFloat(data.x),
      y: parseFloat(data.y),
      weight: parseFloat(data.weight),
      priority: data.priority,
      status: data.status,
      droneId: data.drone_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      drone: data.drones
        ? {
            id: data.drones.id,
            serialNumber: data.drones.serial_number,
            status: data.drones.status,
          }
        : null,
    };
  }
}
