import { supabase } from "../config/database.js";

export class ConfigModel {
  constructor() {
    this.tableName = "system_config";
  }

  async findById(id = 1) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(configData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([
        {
          id: configData.id || 1,
          optimization_enabled: configData.optimizationEnabled,
          optimization_method: configData.optimizationMethod,
          update_interval: configData.updateInterval,
          real_time_notifications: configData.realTimeNotifications,
          activity_logging: configData.activityLogging,
          settings: configData.settings,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return this.formatConfigData(data);
  }

  async update(id, updateData) {
    const updateFields = {};

    if (updateData.optimizationEnabled !== undefined)
      updateFields.optimization_enabled = updateData.optimizationEnabled;
    if (updateData.optimizationMethod !== undefined)
      updateFields.optimization_method = updateData.optimizationMethod;
    if (updateData.updateInterval !== undefined)
      updateFields.update_interval = updateData.updateInterval;
    if (updateData.realTimeNotifications !== undefined)
      updateFields.real_time_notifications = updateData.realTimeNotifications;
    if (updateData.activityLogging !== undefined)
      updateFields.activity_logging = updateData.activityLogging;
    if (updateData.settings !== undefined)
      updateFields.settings = updateData.settings;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.formatConfigData(data);
  }

  async upsert(configData) {
    // Verificar se já existe
    const existing = await this.findById(1).catch(() => null);

    if (existing) {
      return await this.update(1, configData);
    } else {
      return await this.create({ ...configData, id: 1 });
    }
  }

  formatConfigData(data) {
    if (!data) return null;

    return {
      id: data.id,
      optimizationEnabled: data.optimization_enabled,
      optimizationMethod: data.optimization_method,
      updateInterval: data.update_interval,
      realTimeNotifications: data.real_time_notifications,
      activityLogging: data.activity_logging,
      settings: data.settings || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
