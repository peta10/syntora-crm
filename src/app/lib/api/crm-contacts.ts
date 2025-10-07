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
        .select('*', { count: 'exact' });

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

      // Transform data to include computed fields and flatten address, map field names
      const transformedData = (data || []).map((contact: any) => ({
        ...contact,
        // Map database field names back to frontend format
        job_title: contact.title,
        contact_source: contact.lead_source,
        // Flatten address for frontend compatibility
        address_line_1: contact.address?.address_line_1,
        city: contact.address?.city,
        state: contact.address?.state,
        postal_code: contact.address?.postal_code,
        country: contact.address?.country,
        // Flatten social profiles for frontend compatibility
        website: contact.social_profiles?.website,
        linkedin_url: contact.social_profiles?.linkedin_url,
        twitter_url: contact.social_profiles?.twitter_url,
        // Set default values for related data
        totalDeals: 0,
        totalActivities: 0,
        totalInvoices: 0,
        lastActivity: null,
        totalRevenue: 0,
        lead_score: 0 // Default lead score since column doesn't exist in DB
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
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Contact not found');

      // Set default values for aggregated data
      const totalRevenue = 0;
      const lastActivity = null;

      return {
        ...data,
        // Map database field names back to frontend format
        job_title: data.title,
        contact_source: data.lead_source,
        // Flatten address for frontend compatibility
        address_line_1: data.address?.address_line_1,
        city: data.address?.city,
        state: data.address?.state,
        postal_code: data.address?.postal_code,
        country: data.address?.country,
        // Flatten social profiles for frontend compatibility
        website: data.social_profiles?.website,
        linkedin_url: data.social_profiles?.linkedin_url,
        twitter_url: data.social_profiles?.twitter_url,
        totalDeals: 0,
        totalRevenue,
        lastActivity,
        lead_score: 0 // Default lead score since column doesn't exist in DB
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

      // Extract fields that need special handling
      const { 
        address_line_1, 
        city, 
        state, 
        postal_code, 
        country, 
        job_title, 
        contact_source,
        website,
        linkedin_url,
        twitter_url,
        ...restData 
      } = categorizedData;
      
      // Only include fields that exist in the database schema
      const transformedData: any = {
        first_name: categorizedData.first_name,
        last_name: categorizedData.last_name,
        email: categorizedData.email || null,
        phone: categorizedData.phone || null,
        company: categorizedData.company || null,
        title: job_title || null,
        contact_type: categorizedData.contact_type || 'unknown',
        lead_source: contact_source || null,
        business_id: (contactData as any).business_id || null,
        tags: categorizedData.tags || null,
        notes: categorizedData.notes || null,
      };
      
      // Only add address if at least one field has a value
      if (address_line_1 || city || state || postal_code || country) {
        transformedData.address = {
          address_line_1: address_line_1 || null,
          city: city || null,
          state: state || null,
          postal_code: postal_code || null,
          country: country || null
        };
      }

      // Only add social profiles if at least one field has a value
      if (website || linkedin_url || twitter_url) {
        transformedData.social_profiles = {
          website: website || null,
          linkedin_url: linkedin_url || null,
          twitter_url: twitter_url || null
        };
      }

      const { data, error } = await supabase
        .from('crm_contacts')
        .insert([transformedData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating contact:', error);
        throw error; // Throw actual error for debugging
      }
      return data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error; // Throw actual error for debugging
    }
  }

  /**
   * Update an existing contact
   */
  static async update(id: string, updates: Partial<CreateContactRequest>): Promise<CrmContact> {
    try {
      // Transform address fields to JSONB format for database if they exist and map field names
      const { 
        address_line_1, 
        city, 
        state, 
        postal_code, 
        country, 
        job_title, 
        contact_source,
        website,
        linkedin_url,
        twitter_url,
        ...restUpdates 
      } = updates;
      
      // Only include fields that exist in the database schema
      const transformedUpdates: any = {};
      
      // Map basic fields
      if (updates.first_name !== undefined) transformedUpdates.first_name = updates.first_name;
      if (updates.last_name !== undefined) transformedUpdates.last_name = updates.last_name;
      if (updates.email !== undefined) transformedUpdates.email = updates.email || null;
      if (updates.phone !== undefined) transformedUpdates.phone = updates.phone || null;
      if (updates.company !== undefined) transformedUpdates.company = updates.company || null;
      if (updates.contact_type !== undefined) transformedUpdates.contact_type = updates.contact_type || 'unknown';
      if ((updates as any).business_id !== undefined) transformedUpdates.business_id = (updates as any).business_id || null;
      if (updates.tags !== undefined) transformedUpdates.tags = updates.tags || null;
      if (updates.notes !== undefined) transformedUpdates.notes = updates.notes || null;
      
      // Map field names for database
      if (job_title !== undefined) {
        transformedUpdates.title = job_title || null;
      }
      if (contact_source !== undefined) {
        transformedUpdates.lead_source = contact_source || null;
      }
      
      // Only add address if any address fields are provided
      if (address_line_1 !== undefined || city !== undefined || state !== undefined || postal_code !== undefined || country !== undefined) {
        transformedUpdates.address = {
          address_line_1: address_line_1 || null,
          city: city || null,
          state: state || null,
          postal_code: postal_code || null,
          country: country || null
        };
      }

      // Only add social profiles if any social fields are provided
      if (website !== undefined || linkedin_url !== undefined || twitter_url !== undefined) {
        transformedUpdates.social_profiles = {
          website: website || null,
          linkedin_url: linkedin_url || null,
          twitter_url: twitter_url || null
        };
      }

      const { data, error } = await supabase
        .from('crm_contacts')
        .update(transformedUpdates)
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

      const byType = (byTypeData as { contact_type: string | null }[] || []).reduce<Record<string, number>>((acc, contact) => {
        const type = contact.contact_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Get top companies
      const { data: companiesData } = await supabase
        .from('crm_contacts')
        .select('company')
        .neq('company', null);

      const companyCount = (companiesData as { company: string | null }[] || []).reduce<Record<string, number>>((acc, contact) => {
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
  private static async autoCategorizeContact(contactData: CreateContactRequest): Promise<CreateContactRequest> {
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
      contact_type: contactType as 'friend' | 'unknown' | 'prospect' | 'client'
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