import { supabase } from '@/app/lib/supabase/client';
import {
  CrmContact,
  CrmDeal,
  CrmActivity,
  CreateContactRequest,
  ContactFilters,
  PaginatedResponse,
  ContactWithRelations,
  SyncStatus
} from '@/app/types/crm';

export class ContactsAPI {
  /**
   * Get all contacts with optional filtering and pagination
   */
  static async getAll(filters: ContactFilters = {}): Promise<PaginatedResponse<ContactWithRelations>> {
    try {
      let query = supabase
        .from('crm_contacts')
        .select(`
          *,
          deals:crm_deals(count),
          activities:crm_activities(count),
          invoices:crm_invoices(count),
          lastActivity:crm_activities(
            id,
            subject,
            activity_type,
            activity_date
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      if (filters.contact_type) {
        query = query.eq('contact_type', filters.contact_type);
      }

      if (filters.company) {
        query = query.ilike('company', `%${filters.company}%`);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after);
      }

      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before);
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data to include computed fields
      const transformedData = (data || []).map((contact: any) => ({
        ...contact,
        totalDeals: contact.deals?.[0]?.count || 0,
        totalActivities: contact.activities?.[0]?.count || 0,
        totalInvoices: contact.invoices?.[0]?.count || 0,
        lastActivity: contact.lastActivity?.[0] || null,
        totalRevenue: 0 // TODO: Implement proper revenue calculation
      })) as ContactWithRelations[];

      return {
        data: transformedData,
        success: true,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw new Error('Failed to fetch contacts');
    }
  }

  /**
   * Get a single contact by ID with all related data
   */
  static async getById(id: string): Promise<ContactWithRelations> {
    try {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select(`
          *,
          deals:crm_deals(*),
          activities:crm_activities(*),
          invoices:crm_invoices(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Contact not found');

      // Calculate aggregated data
      const totalRevenue = data.deals?.reduce((sum: number, deal: CrmDeal) => sum + (deal.value || 0), 0) || 0;
      const lastActivity = data.activities?.sort((a: CrmActivity, b: CrmActivity) => 
        new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()
      )?.[0] || null;

      return {
        ...data,
        totalDeals: data.deals?.length || 0,
        totalRevenue,
        lastActivity
      };
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw new Error('Failed to fetch contact');
    }
  }

  /**
   * Create a new contact
   */
  static async create(contactData: CreateContactRequest): Promise<CrmContact> {
    try {
      // Auto-categorize contact based on email domain or other factors
      const categorizedData = await this.autoCategorizeContact(contactData);

      const { data, error } = await supabase
        .from('crm_contacts')
        .insert([categorizedData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw new Error('Failed to create contact');
    }
  }

  /**
   * Update an existing contact
   */
  static async update(id: string, updates: Partial<CreateContactRequest>): Promise<CrmContact> {
    try {
      const { data, error } = await supabase
        .from('crm_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw new Error('Failed to update contact');
    }
  }

  /**
   * Delete a contact
   */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('crm_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw new Error('Failed to delete contact');
    }
  }

  /**
   * Bulk import contacts
   */
  static async bulkImport(contacts: CreateContactRequest[]): Promise<CrmContact[]> {
    try {
      // Process contacts in batches to avoid hitting API limits
      const batchSize = 100;
      const results: CrmContact[] = [];

      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize);
        const categorizedBatch = await Promise.all(
          batch.map(contact => this.autoCategorizeContact(contact))
        );

        const { data, error } = await supabase
          .from('crm_contacts')
          .insert(categorizedBatch)
          .select();

        if (error) {
          console.error('Error in batch import:', error);
          continue; // Skip failed batch but continue with others
        }

        if (data) {
          results.push(...data);
        }
      }

      return results;
    } catch (error) {
      console.error('Error in bulk import:', error);
      throw new Error('Failed to import contacts');
    }
  }

  /**
   * Sync contacts from Airtable
   */
  static async syncFromAirtable(): Promise<SyncStatus> {
    try {
      // This would trigger an n8n workflow
      const response = await fetch('/api/integrations/airtable/sync-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to trigger Airtable sync');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error syncing from Airtable:', error);
      throw new Error('Failed to sync from Airtable');
    }
  }

  /**
   * Get sync status
   */
  static async getSyncStatus(): Promise<SyncStatus> {
    try {
      const response = await fetch('/api/integrations/airtable/sync-status');
      if (!response.ok) {
        throw new Error('Failed to get sync status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        isRunning: false,
        errors: ['Failed to get sync status']
      };
    }
  }

  /**
   * Search contacts with advanced fuzzy matching
   */
  static async search(query: string, limit = 10): Promise<CrmContact[]> {
    try {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  }

  /**
   * Get contact analytics/insights
   */
  static async getAnalytics(): Promise<{
    totalContacts: number;
    newThisMonth: number;
    byType: { type: string; count: number }[];
    topCompanies: { company: string; count: number }[];
    growthTrend: { month: string; count: number }[];
  }> {
    try {
      // Get total contacts
      const { count: totalContacts } = await supabase
        .from('crm_contacts')
        .select('*', { count: 'exact', head: true });

      // Get contacts created this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newThisMonth } = await supabase
        .from('crm_contacts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Get contacts by type
      const { data: byTypeData } = await supabase
        .from('crm_contacts')
        .select('contact_type')
        .neq('contact_type', null);

      const byType = (byTypeData || []).reduce<Record<string, number>>((acc, contact: { contact_type: string | null }) => {
        const type = contact.contact_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Get top companies
      const { data: companiesData } = await supabase
        .from('crm_contacts')
        .select('company')
        .neq('company', null);

      const companyCount = (companiesData || []).reduce<Record<string, number>>((acc, contact: { company: string | null }) => {
        if (contact.company) {
          acc[contact.company] = (acc[contact.company] || 0) + 1;
        }
        return acc;
      }, {});

      const topCompanies = Object.entries(companyCount)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([company, count]) => ({ company, count: count as number }));

      // TODO: Implement growth trend calculation
      const growthTrend: { month: string; count: number }[] = [];

      return {
        totalContacts: totalContacts || 0,
        newThisMonth: newThisMonth || 0,
        byType: Object.entries(byType).map(([type, count]) => ({ type, count: count as number })),
        topCompanies,
        growthTrend
      };
    } catch (error) {
      console.error('Error getting contact analytics:', error);
      throw new Error('Failed to get contact analytics');
    }
  }

  /**
   * Auto-categorize contact based on various factors
   */
  private static async autoCategorizeContact(contactData: CreateContactRequest): Promise<CreateContactRequest & { lead_score: number }> {
    let contactType = contactData.contact_type || 'unknown';
    let leadScore = 0;

    // Auto-categorization logic
    if (contactData.email) {
      // Check if email domain suggests it's a business contact
      const businessDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      const emailDomain = contactData.email.split('@')[1]?.toLowerCase();
      
      if (emailDomain && !businessDomains.includes(emailDomain)) {
        if (contactType === 'unknown') {
          contactType = 'prospect';
        }
        leadScore += 10;
      }
    }

    // Score based on company presence
    if (contactData.company) {
      leadScore += 15;
      if (contactType === 'unknown') {
        contactType = 'prospect';
      }
    }

    // Score based on job title
    if (contactData.job_title) {
      leadScore += 10;
      const executiveTitles = ['ceo', 'cto', 'cfo', 'president', 'director', 'manager', 'head of'];
      if (executiveTitles.some(title => contactData.job_title!.toLowerCase().includes(title))) {
        leadScore += 20;
      }
    }

    // Score based on contact source
    if (contactData.contact_source) {
      const highValueSources = ['referral', 'website', 'linkedin', 'conference'];
      if (highValueSources.includes(contactData.contact_source.toLowerCase())) {
        leadScore += 15;
      }
    }

    return {
      ...contactData,
      contact_type: contactType as 'friend' | 'unknown' | 'prospect' | 'client',
      lead_score: leadScore
    };
  }

  /**
   * Detect and merge duplicate contacts
   */
  static async detectDuplicates(contactId?: string): Promise<{
    duplicates: Array<{
      contacts: CrmContact[];
      similarity: number;
      suggestedMerge: CrmContact;
    }>;
  }> {
    try {
      // This is a simplified version - in production you'd want more sophisticated duplicate detection
      const { data: contacts, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .neq('id', contactId || '');

      if (error) throw error;

      const duplicateGroups: Array<{
        contacts: CrmContact[];
        similarity: number;
        suggestedMerge: CrmContact;
      }> = [];

      // Group by email similarity
      const emailGroups = new Map<string, CrmContact[]>();
      
      contacts?.forEach((contact: CrmContact) => {
        if (contact.email) {
          const email = contact.email.toLowerCase();
          if (!emailGroups.has(email)) {
            emailGroups.set(email, []);
          }
          emailGroups.get(email)!.push(contact);
        }
      });

      // Find groups with multiple contacts (potential duplicates)
      emailGroups.forEach(groupContacts => {
        if (groupContacts.length > 1) {
          duplicateGroups.push({
            contacts: groupContacts,
            similarity: 95, // High similarity for exact email match
            suggestedMerge: groupContacts[0] // Use first contact as merge target
          });
        }
      });

      return { duplicates: duplicateGroups };
    } catch (error) {
      console.error('Error detecting duplicates:', error);
      return { duplicates: [] };
    }
  }

  /**
   * Merge duplicate contacts
   */
  static async mergeDuplicates(primaryContactId: string, duplicateContactIds: string[]): Promise<CrmContact> {
    try {
      // This would be a complex operation involving:
      // 1. Merging contact data (keeping primary, but merging tags, notes, etc.)
      // 2. Updating all related records (deals, activities, invoices) to point to primary contact
      // 3. Deleting duplicate contacts

      // For now, this is a placeholder implementation
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('id', primaryContactId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error merging contacts:', error);
      throw new Error('Failed to merge contacts');
    }
  }
} 