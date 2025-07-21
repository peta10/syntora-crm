export interface Deal {
  id: string;
  title: string;
  contact_id?: string;
  value: number;
  stage: string;
  probability: number;
  close_date: string;
  description?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  stage_name: string;
  stage_order: number;
  probability: number;
  color_hex: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DealFilters {
  stage?: string;
  probability_min?: number;
  probability_max?: number;
  close_date_start?: string;
  close_date_end?: string;
  value_min?: number;
  value_max?: number;
}

export interface CreateDealRequest {
  title: string;
  contact_id: string;
  value: number;
  stage: string;
  probability: number;
  close_date: string;
  description?: string;
  tags?: string[];
} 