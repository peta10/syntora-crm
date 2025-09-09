import { supabase } from './client';
import { ProjectKPI } from '@/app/types/todo';

export interface CreateKPIData {
  project_id: string;
  name: string;
  description?: string;
  metric_type: 'number' | 'percentage' | 'currency' | 'time' | 'boolean';
  target_value: number;
  actual_value?: number;
  unit?: string;
  status: 'on_track' | 'at_risk' | 'off_track';
  measurement_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  last_measured_at?: string;
}

export interface UpdateKPIData {
  name?: string;
  description?: string;
  metric_type?: 'number' | 'percentage' | 'currency' | 'time' | 'boolean';
  target_value?: number;
  actual_value?: number;
  unit?: string;
  status?: 'on_track' | 'at_risk' | 'off_track';
  measurement_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  last_measured_at?: string;
}

export const kpisService = {
  getKPIs: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_kpis')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getKPIById: async (id: string) => {
    const { data, error } = await supabase
      .from('project_kpis')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createKPI: async (kpi: CreateKPIData) => {
    const { data, error } = await supabase
      .from('project_kpis')
      .insert(kpi)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateKPI: async (id: string, updates: UpdateKPIData) => {
    const { data, error } = await supabase
      .from('project_kpis')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteKPI: async (id: string) => {
    const { error } = await supabase
      .from('project_kpis')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get KPIs that need measurement based on frequency
  getKPIsNeedingMeasurement: async (projectId: string) => {
    const { data: kpis, error } = await supabase
      .from('project_kpis')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;

    const now = new Date();
    return kpis.filter((kpi: any) => {
      if (!kpi.last_measured_at) return true;

      const lastMeasured = new Date(kpi.last_measured_at);
      const diffDays = Math.ceil((now.getTime() - lastMeasured.getTime()) / (1000 * 60 * 60 * 24));

      switch (kpi.measurement_frequency) {
        case 'daily': return diffDays >= 1;
        case 'weekly': return diffDays >= 7;
        case 'monthly': return diffDays >= 30;
        case 'quarterly': return diffDays >= 90;
        default: return false;
      }
    });
  },

  // Update KPI measurement
  updateMeasurement: async (id: string, actualValue: number) => {
    const { data, error } = await supabase
      .from('project_kpis')
      .update({
        actual_value: actualValue,
        last_measured_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get KPI history (if you have a separate table for measurements)
  getKPIHistory: async (kpiId: string) => {
    const { data, error } = await supabase
      .from('project_kpi_measurements')
      .select('*')
      .eq('kpi_id', kpiId)
      .order('measured_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}; 