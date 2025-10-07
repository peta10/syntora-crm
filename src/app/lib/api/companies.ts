import { supabase } from '@/app/lib/supabase/client';
import type { CrmBusiness } from '@/app/types/crm';

export interface CompanyWithMetrics extends CrmBusiness {
  contacts_count: number;
  deals_count: number;
  total_revenue: number;
  mrr: number;
  last_contact_date: string | null;
}

export interface CompanyFilters {
  business_type?: 'prospect' | 'client' | 'partner' | 'vendor' | 'competitor';
  search?: string;
  sortBy?: 'name' | 'revenue' | 'deals' | 'last_contact';
  sortOrder?: 'asc' | 'desc';
}

// Get all companies with financial metrics
export async function getCompanies(filters?: CompanyFilters): Promise<CompanyWithMetrics[]> {
  try {
    let query = supabase
      .from('crm_businesses')
      .select(`
        *,
        contacts:crm_contacts(count),
        deals:crm_deals(count),
        revenue:crm_revenue_entries(amount, is_recurring)
      `);

    // Apply filters
    if (filters?.business_type) {
      query = query.eq('business_type', filters.business_type);
    }

    if (filters?.search) {
      query = query.or(`company_name.ilike.%${filters.search}%,website.ilike.%${filters.search}%,industry.ilike.%${filters.search}%`);
    }

    // Execute query
    const { data, error } = await query;

    if (error) throw error;

    // Calculate metrics
    const companiesWithMetrics = (data || []).map((company: any) => {
      const total_revenue = company.revenue?.reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0;
      const mrr = company.revenue
        ?.filter((r: any) => r.is_recurring)
        .reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0;

      return {
        ...company,
        contacts_count: company.contacts?.[0]?.count || 0,
        deals_count: company.deals?.[0]?.count || 0,
        total_revenue,
        mrr,
        last_contact_date: null, // Will implement later
      };
    });

    // Apply sorting
    if (filters?.sortBy) {
      companiesWithMetrics.sort((a: CompanyWithMetrics, b: CompanyWithMetrics) => {
        let aVal, bVal;
        switch (filters.sortBy) {
          case 'name':
            aVal = a.company_name.toLowerCase();
            bVal = b.company_name.toLowerCase();
            break;
          case 'revenue':
            aVal = a.total_revenue;
            bVal = b.total_revenue;
            break;
          case 'deals':
            aVal = a.deals_count;
            bVal = b.deals_count;
            break;
          default:
            return 0;
        }
        return filters.sortOrder === 'desc' 
          ? (bVal > aVal ? 1 : -1)
          : (aVal > bVal ? 1 : -1);
      });
    }

    return companiesWithMetrics;
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

// Get single company by ID with full details
export async function getCompanyById(id: string): Promise<CompanyWithMetrics | null> {
  try {
    const { data, error } = await supabase
      .from('crm_businesses')
      .select(`
        *,
        contacts:crm_contacts(*),
        deals:crm_deals(*),
        revenue:crm_revenue_entries(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Calculate metrics
    const total_revenue = data.revenue?.reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0;
    const mrr = data.revenue
      ?.filter((r: any) => r.is_recurring)
      .reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0;

    return {
      ...data,
      contacts_count: data.contacts?.length || 0,
      deals_count: data.deals?.length || 0,
      total_revenue,
      mrr,
      last_contact_date: null,
    };
  } catch (error) {
    console.error('Error fetching company:', error);
    return null;
  }
}

// Create new company
export async function createCompany(companyData: Partial<CrmBusiness>): Promise<CrmBusiness | null> {
  try {
    const { data, error } = await supabase
      .from('crm_businesses')
      .insert([{
        company_name: companyData.company_name,
        website: companyData.website,
        industry: companyData.industry,
        business_type: companyData.business_type || 'prospect',
        phone: companyData.phone,
        description: companyData.description,
        address_line_1: companyData.address_line_1,
        city: companyData.city,
        state: companyData.state,
        postal_code: companyData.postal_code,
        country: companyData.country,
        tags: companyData.tags || [],
        lead_score: companyData.lead_score || 0,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating company:', error);
    return null;
  }
}

// Update company
export async function updateCompany(id: string, companyData: Partial<CrmBusiness>): Promise<CrmBusiness | null> {
  try {
    const { data, error } = await supabase
      .from('crm_businesses')
      .update({
        ...companyData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating company:', error);
    return null;
  }
}

// Delete company
export async function deleteCompany(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('crm_businesses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting company:', error);
    return false;
  }
}

// Get company revenue summary
export async function getCompanyRevenueSummary(companyId: string) {
  try {
    const { data, error } = await supabase
      .from('crm_revenue_entries')
      .select('*')
      .eq('business_id', companyId)
      .order('revenue_date', { ascending: false });

    if (error) throw error;

    const total = data?.reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0;
    const mrr = data
      ?.filter((r: any) => r.is_recurring)
      .reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0;
    const paid = data?.filter((r: any) => r.payment_status === 'paid').reduce((sum: number, r: any) => sum + r.amount, 0) || 0;
    const pending = data?.filter((r: any) => r.payment_status === 'invoiced').reduce((sum: number, r: any) => sum + r.amount, 0) || 0;

    return {
      total_revenue: total,
      mrr,
      paid_amount: paid,
      pending_amount: pending,
      entries: data || [],
    };
  } catch (error) {
    console.error('Error fetching company revenue:', error);
    return {
      total_revenue: 0,
      mrr: 0,
      paid_amount: 0,
      pending_amount: 0,
      entries: [],
    };
  }
}

// Get company contacts
export async function getCompanyContacts(companyId: string) {
  try {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('business_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching company contacts:', error);
    return [];
  }
}
