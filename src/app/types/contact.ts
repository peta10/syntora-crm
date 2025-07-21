export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  contact_type: 'friend' | 'unknown' | 'prospect' | 'client';
  contact_source?: string;
  address_line_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  website?: string;
  linkedin_url?: string;
  notes?: string;
  tags?: string[];
  lead_score: number;
  last_contact_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactFilters {
  contact_type?: 'friend' | 'unknown' | 'prospect' | 'client';
}

export interface CreateContactRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  contact_type?: 'friend' | 'unknown' | 'prospect' | 'client';
  contact_source?: string;
  address_line_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  website?: string;
  linkedin_url?: string;
  notes?: string;
  tags?: string[];
} 