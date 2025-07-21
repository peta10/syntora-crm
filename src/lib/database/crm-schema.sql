-- CRM Database Schema for Supabase
-- This file contains all the tables needed for the CRM functionality

-- Contacts table for managing all contacts/prospects/clients
CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE,
  phone text,
  company text,
  job_title text,
  contact_type text CHECK (contact_type IN ('friend', 'unknown', 'prospect', 'client')) DEFAULT 'unknown',
  contact_source text, -- Where they came from (website, referral, etc.)
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  postal_code text,
  country text,
  website text,
  linkedin_url text,
  twitter_url text,
  tags text[],
  notes text,
  lead_score integer DEFAULT 0,
  last_contact_date timestamp with time zone,
  created_by uuid REFERENCES public.profiles(id),
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  airtable_id text, -- For syncing with Airtable
  custom_fields jsonb DEFAULT '{}',
  CONSTRAINT crm_contacts_pkey PRIMARY KEY (id)
);

-- Pipeline stages for sales process
CREATE TABLE IF NOT EXISTS public.crm_pipeline_stages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  stage_name text NOT NULL,
  stage_order integer NOT NULL,
  probability integer DEFAULT 0, -- Default probability for deals in this stage
  color_hex text DEFAULT '#6366f1',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT crm_pipeline_stages_pkey PRIMARY KEY (id),
  CONSTRAINT crm_pipeline_stages_stage_name_key UNIQUE (stage_name)
);

-- Deals/opportunities table
CREATE TABLE IF NOT EXISTS public.crm_deals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  deal_name text NOT NULL,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  value numeric(15,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  stage text NOT NULL REFERENCES public.crm_pipeline_stages(stage_name),
  probability integer DEFAULT 0,
  expected_close_date date,
  actual_close_date date,
  is_won boolean,
  lost_reason text,
  description text,
  next_action text,
  next_action_date timestamp with time zone,
  tags text[],
  created_by uuid REFERENCES public.profiles(id),
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  custom_fields jsonb DEFAULT '{}',
  CONSTRAINT crm_deals_pkey PRIMARY KEY (id)
);

-- Activities table (calls, emails, meetings, etc.)
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  activity_type text CHECK (activity_type IN ('call', 'email', 'meeting', 'task', 'note', 'follow_up')) NOT NULL,
  subject text NOT NULL,
  description text,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  activity_date timestamp with time zone NOT NULL,
  duration_minutes integer,
  outcome text,
  follow_up_date timestamp with time zone,
  is_completed boolean DEFAULT false,
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  location text,
  attendees text[],
  created_by uuid REFERENCES public.profiles(id),
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT crm_activities_pkey PRIMARY KEY (id)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS public.crm_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  invoice_date date NOT NULL,
  due_date date NOT NULL,
  status text CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  subtotal numeric(15,2) DEFAULT 0,
  tax_rate numeric(5,2) DEFAULT 0,
  tax_amount numeric(15,2) DEFAULT 0,
  total_amount numeric(15,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  payment_terms text,
  notes text,
  payment_date timestamp with time zone,
  payment_method text,
  pdf_url text,
  created_by uuid REFERENCES public.profiles(id),
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT crm_invoices_pkey PRIMARY KEY (id)
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS public.crm_invoice_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.crm_invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(10,2) DEFAULT 1,
  unit_price numeric(15,2) DEFAULT 0,
  total_price numeric(15,2) DEFAULT 0,
  line_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT crm_invoice_items_pkey PRIMARY KEY (id)
);

-- Email campaigns table
CREATE TABLE IF NOT EXISTS public.crm_email_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  template_id uuid,
  status text CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')) DEFAULT 'draft',
  scheduled_date timestamp with time zone,
  sent_date timestamp with time zone,
  recipient_count integer DEFAULT 0,
  open_count integer DEFAULT 0,
  click_count integer DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT crm_email_campaigns_pkey PRIMARY KEY (id)
);

-- Email campaign recipients
CREATE TABLE IF NOT EXISTS public.crm_email_campaign_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.crm_email_campaigns(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending', 'sent', 'opened', 'clicked', 'bounced', 'unsubscribed')) DEFAULT 'pending',
  sent_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT crm_email_campaign_recipients_pkey PRIMARY KEY (id),
  CONSTRAINT crm_email_campaign_recipients_unique UNIQUE (campaign_id, contact_id)
);

-- Email templates
CREATE TABLE IF NOT EXISTS public.crm_email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  template_type text CHECK (template_type IN ('follow_up', 'proposal', 'invoice', 'welcome', 'newsletter', 'custom')) DEFAULT 'custom',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT crm_email_templates_pkey PRIMARY KEY (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON public.crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_type ON public.crm_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_company ON public.crm_contacts(company);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_created_at ON public.crm_contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_airtable_id ON public.crm_contacts(airtable_id);

CREATE INDEX IF NOT EXISTS idx_crm_deals_contact_id ON public.crm_deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON public.crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_crm_deals_close_date ON public.crm_deals(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_crm_deals_created_at ON public.crm_deals(created_at);

CREATE INDEX IF NOT EXISTS idx_crm_activities_contact_id ON public.crm_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_deal_id ON public.crm_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_date ON public.crm_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_crm_activities_type ON public.crm_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_completed ON public.crm_activities(is_completed);

CREATE INDEX IF NOT EXISTS idx_crm_invoices_contact_id ON public.crm_invoices(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_invoices_status ON public.crm_invoices(status);
CREATE INDEX IF NOT EXISTS idx_crm_invoices_date ON public.crm_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_crm_invoices_due_date ON public.crm_invoices(due_date);

-- Insert default pipeline stages
INSERT INTO public.crm_pipeline_stages (stage_name, stage_order, probability, color_hex) VALUES
('Lead', 1, 10, '#ef4444'),
('Qualified', 2, 25, '#f97316'),
('Proposal', 3, 50, '#eab308'),
('Negotiation', 4, 75, '#22c55e'),
('Closed Won', 5, 100, '#10b981'),
('Closed Lost', 6, 0, '#6b7280')
ON CONFLICT (stage_name) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_email_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (for now, allow all operations for authenticated users)
-- In production, you might want more granular permissions

CREATE POLICY "Allow all operations for authenticated users" ON public.crm_contacts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.crm_pipeline_stages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.crm_deals
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.crm_activities
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.crm_invoices
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.crm_invoice_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.crm_email_campaigns
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.crm_email_campaign_recipients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.crm_email_templates
  FOR ALL USING (auth.role() = 'authenticated');

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_crm_deals_updated_at BEFORE UPDATE ON public.crm_deals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_crm_activities_updated_at BEFORE UPDATE ON public.crm_activities FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_crm_invoices_updated_at BEFORE UPDATE ON public.crm_invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_crm_email_campaigns_updated_at BEFORE UPDATE ON public.crm_email_campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_crm_email_templates_updated_at BEFORE UPDATE ON public.crm_email_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to automatically calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    invoice_subtotal numeric(15,2);
    invoice_tax_amount numeric(15,2);
    invoice_total numeric(15,2);
BEGIN
    -- Calculate subtotal from line items
    SELECT COALESCE(SUM(total_price), 0) INTO invoice_subtotal
    FROM public.crm_invoice_items
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    -- Get tax rate from invoice
    SELECT tax_rate INTO invoice_tax_amount
    FROM public.crm_invoices
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    -- Calculate tax amount
    invoice_tax_amount := invoice_subtotal * (COALESCE(invoice_tax_amount, 0) / 100);
    
    -- Calculate total
    invoice_total := invoice_subtotal + invoice_tax_amount;
    
    -- Update invoice
    UPDATE public.crm_invoices
    SET subtotal = invoice_subtotal,
        tax_amount = invoice_tax_amount,
        total_amount = invoice_total,
        updated_at = now()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for invoice total calculation
CREATE TRIGGER calculate_invoice_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.crm_invoice_items
    FOR EACH ROW EXECUTE PROCEDURE calculate_invoice_totals(); 