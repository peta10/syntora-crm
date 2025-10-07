-- Add indexes for better query performance on CRM tables

-- Index for contacts by business_id (for company detail page)
CREATE INDEX IF NOT EXISTS idx_contacts_business_id 
ON crm_contacts(business_id) 
WHERE business_id IS NOT NULL;

-- Index for revenue entries by business_id (for financial summaries)
CREATE INDEX IF NOT EXISTS idx_revenue_business_id 
ON crm_revenue_entries(business_id) 
WHERE business_id IS NOT NULL;

-- Index for expenses by client_id (for billable tracking)
CREATE INDEX IF NOT EXISTS idx_expenses_client_id 
ON crm_expenses(client_id) 
WHERE client_id IS NOT NULL;

-- Index for deals by business_id (for pipeline tracking)
CREATE INDEX IF NOT EXISTS idx_deals_business_id 
ON crm_deals(business_id) 
WHERE business_id IS NOT NULL;

-- Composite index for business type filtering
CREATE INDEX IF NOT EXISTS idx_businesses_type_name 
ON crm_businesses(business_type, company_name);

-- Index for contact type filtering
CREATE INDEX IF NOT EXISTS idx_contacts_type 
ON crm_contacts(contact_type);

-- Index for lead score sorting
CREATE INDEX IF NOT EXISTS idx_contacts_lead_score 
ON crm_contacts(lead_score DESC) 
WHERE contact_type = 'prospect';

-- Index for businesses lead score
CREATE INDEX IF NOT EXISTS idx_businesses_lead_score 
ON crm_businesses(lead_score DESC) 
WHERE business_type = 'prospect';

-- Analyze tables for query optimization
ANALYZE crm_businesses;
ANALYZE crm_contacts;
ANALYZE crm_revenue_entries;
ANALYZE crm_expenses;
ANALYZE crm_deals;
