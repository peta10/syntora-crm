// Finance Module - Supabase Queries
import { supabase } from '@/app/lib/supabase/client';
import type { 
  RevenueEntry, 
  Expense, 
  ExpenseCategory,
  ChartOfAccount,
  Vendor1099,
  FinancialKPIs,
  RevenueByMonth,
  ExpenseByCategory
} from './types';

// ============================================================================
// REVENUE QUERIES
// ============================================================================

export async function getRevenueEntries(filters?: {
  startDate?: string;
  endDate?: string;
  businessId?: string;
  paymentStatus?: string;
}) {
  let query = supabase
    .from('crm_revenue_entries')
    .select(`
      *,
      business:crm_businesses!crm_revenue_entries_business_id_fkey(id, company_name, logo_url),
      revenue_account:crm_chart_of_accounts!crm_revenue_entries_revenue_account_id_fkey(account_code, account_name)
    `)
    .order('revenue_date', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('revenue_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('revenue_date', filters.endDate);
  }
  if (filters?.businessId) {
    query = query.eq('business_id', filters.businessId);
  }
  if (filters?.paymentStatus) {
    query = query.eq('payment_status', filters.paymentStatus);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as RevenueEntry[];
}

export async function createRevenueEntry(entry: Partial<RevenueEntry>) {
  const { data, error } = await supabase
    .from('crm_revenue_entries')
    .insert([entry])
    .select()
    .single();

  if (error) throw error;
  return data as RevenueEntry;
}

export async function updateRevenueEntry(id: string, updates: Partial<RevenueEntry>) {
  const { data, error } = await supabase
    .from('crm_revenue_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as RevenueEntry;
}

export async function deleteRevenueEntry(id: string) {
  const { error } = await supabase
    .from('crm_revenue_entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// EXPENSE QUERIES
// ============================================================================

export async function getExpenses(filters?: {
  startDate?: string;
  endDate?: string;
  category?: string;
  vendorName?: string;
  clientId?: string;
}) {
  let query = supabase
    .from('crm_expenses')
    .select(`
      *,
      expense_account:crm_chart_of_accounts!crm_expenses_expense_account_id_fkey(account_code, account_name),
      client:crm_businesses!crm_expenses_client_id_fkey(id, company_name),
      project:projects(id, title)
    `)
    .order('expense_date', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('expense_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('expense_date', filters.endDate);
  }
  if (filters?.category) {
    query = query.eq('primary_category', filters.category);
  }
  if (filters?.vendorName) {
    query = query.ilike('vendor_name', `%${filters.vendorName}%`);
  }
  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Expense[];
}

export async function createExpense(expense: Partial<Expense>) {
  const { data, error } = await supabase
    .from('crm_expenses')
    .insert([expense])
    .select()
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function updateExpense(id: string, updates: Partial<Expense>) {
  const { data, error } = await supabase
    .from('crm_expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase
    .from('crm_expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// EXPENSE CATEGORIES
// ============================================================================

export async function getExpenseCategories(parentOnly: boolean = false) {
  let query = supabase
    .from('crm_expense_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (parentOnly) {
    query = query.is('parent_category_code', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ExpenseCategory[];
}

export async function getSubcategories(parentCode: string) {
  const { data, error } = await supabase
    .from('crm_expense_categories')
    .select('*')
    .eq('parent_category_code', parentCode)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as ExpenseCategory[];
}

// ============================================================================
// CHART OF ACCOUNTS
// ============================================================================

export async function getChartOfAccounts(accountType?: string) {
  let query = supabase
    .from('crm_chart_of_accounts')
    .select('*')
    .eq('is_active', true)
    .order('account_code', { ascending: true });

  if (accountType) {
    query = query.eq('account_type', accountType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ChartOfAccount[];
}

export async function getRevenueAccounts() {
  return getChartOfAccounts('revenue');
}

export async function getExpenseAccounts() {
  const { data, error } = await supabase
    .from('crm_chart_of_accounts')
    .select('*')
    .in('account_type', ['expense', 'cogs'])
    .eq('is_active', true)
    .order('account_code', { ascending: true });

  if (error) throw error;
  return data as ChartOfAccount[];
}

// ============================================================================
// BUSINESSES (for dropdowns)
// ============================================================================

export async function getBusinesses() {
  const { data, error } = await supabase
    .from('crm_businesses')
    .select('id, company_name, business_type, logo_url')
    .order('company_name', { ascending: true });

  if (error) throw error;
  return data;
}

// ============================================================================
// 1099 VENDORS
// ============================================================================

export async function get1099Vendors() {
  const { data, error } = await supabase
    .from('crm_1099_vendors')
    .select('*')
    .eq('is_active', true)
    .order('vendor_name', { ascending: true });

  if (error) throw error;
  return data as Vendor1099[];
}

export async function create1099Vendor(vendor: Partial<Vendor1099>) {
  const { data, error } = await supabase
    .from('crm_1099_vendors')
    .insert([vendor])
    .select()
    .single();

  if (error) throw error;
  return data as Vendor1099;
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

export async function getFinancialKPIs(startDate: string, endDate: string): Promise<FinancialKPIs> {
  // Get total revenue
  const { data: revenueData, error: revenueError } = await supabase
    .from('crm_revenue_entries')
    .select('amount')
    .gte('revenue_date', startDate)
    .lte('revenue_date', endDate)
    .eq('payment_status', 'paid');

  if (revenueError) throw revenueError;

  const total_revenue = revenueData?.reduce((sum: number, r: any) => sum + Number(r.amount), 0) || 0;

  // Get total expenses
  const { data: expenseData, error: expenseError } = await supabase
    .from('crm_expenses')
    .select('amount')
    .gte('expense_date', startDate)
    .lte('expense_date', endDate)
    .eq('payment_status', 'paid');

  if (expenseError) throw expenseError;

  const total_expenses = expenseData?.reduce((sum: number, e: any) => sum + Number(e.amount), 0) || 0;

  // Get MRR
  const { data: mrrData, error: mrrError } = await supabase
    .from('crm_revenue_entries')
    .select('amount')
    .eq('is_recurring', true)
    .eq('recurring_frequency', 'monthly')
    .eq('payment_status', 'paid');

  if (mrrError) throw mrrError;

  const mrr = mrrData?.reduce((sum: number, r: any) => sum + Number(r.amount), 0) || 0;

  const net_profit = total_revenue - total_expenses;
  const profit_margin = total_revenue > 0 ? (net_profit / total_revenue) * 100 : 0;

  return {
    total_revenue,
    total_expenses,
    net_profit,
    profit_margin,
    mrr,
    burn_rate: total_expenses,
    runway_months: mrr > 0 ? (net_profit / mrr) : 0,
    avg_revenue_per_client: 0, // TODO: Calculate
    client_lifetime_value: 0, // TODO: Calculate
  };
}

export async function getRevenueByMonth(startDate: string, endDate: string): Promise<RevenueByMonth[]> {
  // This would use a database function or aggregation
  // For now, returning empty array
  return [];
}

export async function getExpensesByCategory(startDate: string, endDate: string): Promise<ExpenseByCategory[]> {
  const { data, error } = await supabase
    .from('crm_expenses')
    .select('primary_category, amount, deductible_amount')
    .gte('expense_date', startDate)
    .lte('expense_date', endDate);

  if (error) throw error;

  // Group by category
  const categoryMap = new Map<string, { amount: number; deductible_amount: number }>();
  
  data?.forEach((expense: any) => {
    const existing = categoryMap.get(expense.primary_category) || { amount: 0, deductible_amount: 0 };
    categoryMap.set(expense.primary_category, {
      amount: existing.amount + Number(expense.amount),
      deductible_amount: existing.deductible_amount + Number(expense.deductible_amount || 0),
    });
  });

  const total = Array.from(categoryMap.values()).reduce((sum: number, cat: any) => sum + cat.amount, 0);

  return Array.from(categoryMap.entries()).map(([category, values]) => ({
    category,
    amount: values.amount,
    percentage: total > 0 ? (values.amount / total) * 100 : 0,
    deductible_amount: values.deductible_amount,
  }));
}
