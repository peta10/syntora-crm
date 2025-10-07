// CRM TypeScript Types
// These types match the database schema for the CRM system

export interface CrmBusiness {
  id: string;
  company_name: string;
  website?: string;
  industry?: string;
  company_size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  annual_revenue?: number;
  description?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  logo_url?: string;
  tags?: string[];
  notes?: string;
  business_type: 'prospect' | 'client' | 'partner' | 'vendor' | 'competitor';
  lead_score: number;
  airtable_id?: string;
  custom_fields?: Record<string, any>;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CrmContact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  business_id?: string; // Foreign key to CrmBusiness
  business?: CrmBusiness; // Populated when joining
  company?: string; // Legacy field
  job_title?: string;
  contact_type: 'friend' | 'unknown' | 'prospect' | 'client' | 'vendor' | 'partner'; // Match database constraint
  contact_source?: string;
  address?: {
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  website?: string;
  linkedin_url?: string;
  twitter_url?: string;
  tags?: string[];
  notes?: string;
  lead_score: number;
  last_contact_date?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  airtable_id?: string;
  custom_fields?: Record<string, string | number | boolean | null>;
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

export interface CrmDeal {
  id: string;
  deal_name: string;
  contact_id: string;
  contact?: CrmContact;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expected_close_date?: string;
  actual_close_date?: string;
  is_won?: boolean;
  lost_reason?: string;
  description?: string;
  next_action?: string;
  next_action_date?: string;
  tags?: string[];
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  custom_fields?: Record<string, string | number | boolean | null>;
}

export interface CrmActivity {
  id: string;
  activity_type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'follow_up';
  subject: string;
  description?: string;
  contact_id: string;
  contact?: CrmContact;
  deal_id?: string;
  deal?: CrmDeal;
  activity_date: string;
  duration_minutes?: number;
  outcome?: string;
  follow_up_date?: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  location?: string;
  attendees?: string[];
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CrmInvoice {
  id: string;
  invoice_number: string;
  contact_id: string;
  contact?: CrmContact;
  deal_id?: string;
  deal?: CrmDeal;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_terms?: string;
  notes?: string;
  payment_date?: string;
  payment_method?: string;
  pdf_url?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  items?: CrmInvoiceItem[];
}

export interface CrmInvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  line_order: number;
  created_at: string;
}

export interface EmailCampaign {
  id: string;
  campaign_name: string;
  subject: string;
  content: string;
  template_id?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  scheduled_date?: string;
  sent_date?: string;
  recipient_count: number;
  open_count: number;
  click_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaignRecipient {
  id: string;
  campaign_id: string;
  contact_id: string;
  contact?: CrmContact;
  status: 'pending' | 'sent' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  template_name: string;
  subject: string;
  content: string;
  template_type: 'follow_up' | 'proposal' | 'invoice' | 'welcome' | 'newsletter' | 'custom';
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Form types for creating/updating
export interface CreateContactRequest {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  contact_type?: 'friend' | 'unknown' | 'prospect' | 'client' | 'vendor' | 'partner';
  contact_source?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  website?: string;
  linkedin_url?: string;
  twitter_url?: string;
  tags?: string[];
  notes?: string;
}

export interface CreateDealRequest {
  deal_name: string;
  contact_id: string;
  value?: number;
  currency?: string;
  stage: string;
  probability?: number;
  expected_close_date?: string;
  description?: string;
  next_action?: string;
  next_action_date?: string;
  tags?: string[];
}

export interface CreateActivityRequest {
  activity_type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'follow_up';
  subject: string;
  description?: string;
  contact_id: string;
  deal_id?: string;
  activity_date: string;
  duration_minutes?: number;
  priority?: 'low' | 'medium' | 'high';
  location?: string;
  attendees?: string[];
}

export interface CreateInvoiceRequest {
  contact_id: string;
  deal_id?: string;
  invoice_date: string;
  due_date: string;
  tax_rate?: number;
  payment_terms?: string;
  notes?: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
}

// Filter types
export interface ContactFilters {
  search?: string;
  contact_type?: 'friend' | 'unknown' | 'prospect' | 'client';
  company?: string;
  tags?: string[];
  created_after?: string;
  created_before?: string;
  page?: number;
  limit?: number;
}

export interface DealFilters {
  stage?: string;
  contact_id?: string;
  value_min?: number;
  value_max?: number;
  expected_close_after?: string;
  expected_close_before?: string;
  page?: number;
  limit?: number;
}

export interface ActivityFilters {
  activity_type?: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'follow_up';
  contact_id?: string;
  deal_id?: string;
  is_completed?: boolean;
  activity_date_after?: string;
  activity_date_before?: string;
  priority?: 'low' | 'medium' | 'high';
  page?: number;
  limit?: number;
}

export interface InvoiceFilters {
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  contact_id?: string;
  invoice_date_after?: string;
  invoice_date_before?: string;
  due_date_after?: string;
  due_date_before?: string;
  page?: number;
  limit?: number;
}

// Dashboard metrics types
export interface DashboardMetrics {
  monthlyRevenue: number;
  monthlyRevenueChange: number;
  activeDeals: number;
  activeDealsChange: number;
  newContacts: number;
  newContactsChange: number;
  completedTasks: number;
  totalTasks: number;
  taskCompletionRate: number;
  revenueHistory: {
    month: string;
    revenue: number;
  }[];
  pipelineData: {
    stage: string;
    count: number;
    value: number;
  }[];
  recentActivities: CrmActivity[];
  upcomingTasks: CrmActivity[];
  contactInsights: {
    totalContacts: number;
    newThisMonth: number;
    byType: {
      type: string;
      count: number;
    }[];
    topCompanies: {
      company: string;
      count: number;
    }[];
  };
}

// Airtable sync types
export interface AirtableContact {
  id: string;
  fields: {
    'First Name': string;
    'Last Name': string;
    'Email': string;
    'Phone': string;
    'Company': string;
    'Job Title': string;
    'Contact Type': string;
    'Notes': string;
    'Tags': string;
    'Website': string;
    'LinkedIn': string;
    'Address': string;
    'City': string;
    'State': string;
    'Postal Code': string;
    'Country': string;
  };
}

export interface SyncStatus {
  isRunning: boolean;
  lastSync?: string;
  totalSynced?: number;
  errors?: string[];
  progress?: number;
}

// Utility types
export type ContactWithRelations = CrmContact & {
  deals?: CrmDeal[];
  activities?: CrmActivity[];
  invoices?: CrmInvoice[];
  lastActivity?: CrmActivity;
  totalDeals?: number;
  totalRevenue?: number;
};

export type DealWithRelations = CrmDeal & {
  contact: CrmContact;
  activities?: CrmActivity[];
  invoices?: CrmInvoice[];
  stage_info?: PipelineStage;
};

export type ActivityWithRelations = CrmActivity & {
  contact: CrmContact;
  deal?: CrmDeal;
};

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 