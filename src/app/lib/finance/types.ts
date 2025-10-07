// Financial Management System - TypeScript Types

export interface ChartOfAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'cogs';
  account_subtype?: string;
  parent_account_id?: string;
  normal_balance: 'debit' | 'credit';
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  entry_type: 'standard' | 'revenue' | 'expense' | 'adjustment' | 'closing';
  description: string;
  reference_type?: string;
  reference_id?: string;
  status: 'draft' | 'posted' | 'void';
  created_by: string;
  posted_by?: string;
  posted_at?: string;
  created_at: string;
  updated_at: string;
  lines?: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description?: string;
  line_order: number;
  account?: ChartOfAccount;
}

export interface ExpenseCategory {
  id: string;
  category_code: string;
  category_name: string;
  parent_category_code?: string;
  tax_deductible: boolean;
  default_deduction_percentage: number;
  irs_schedule?: string;
  requires_receipt: boolean;
  receipt_threshold: number;
  requires_business_purpose: boolean;
  description?: string;
  tax_notes?: string;
  icon?: string;
  sort_order?: number;
  is_active: boolean;
  created_at: string;
}

export interface RevenueEntry {
  id: string;
  
  // Basic Information
  business_id: string;
  revenue_date: string;
  amount: number;
  
  // Classification
  revenue_category: string;
  revenue_account_id: string;
  
  // Recurring Revenue
  is_recurring: boolean;
  recurring_frequency?: 'monthly' | 'quarterly' | 'annually';
  contract_start_date?: string;
  contract_end_date?: string;
  
  // Payment Information
  payment_status: 'paid' | 'invoiced' | 'pending' | 'partially_paid';
  payment_date?: string;
  payment_method?: string;
  
  // Integration
  deal_id?: string;
  invoice_id?: string;
  invoice_number?: string;
  
  // Tax Information
  taxable_amount?: number;
  tax_rate?: number;
  tax_amount?: number;
  tax_jurisdiction?: string;
  
  // Service Details
  project_name?: string;
  service_description: string;
  hours_worked?: number;
  hourly_rate?: number;
  
  // Documentation
  notes?: string;
  attachments?: string[];
  
  // Accounting
  journal_entry_id?: string;
  
  // Audit Trail
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  business?: any; // crm_businesses
  revenue_account?: ChartOfAccount;
}

export interface Expense {
  id: string;
  
  // Basic Information
  expense_date: string;
  amount: number;
  
  // Categorization (TAX CRITICAL)
  primary_category: string;
  subcategory: string;
  expense_account_id: string;
  
  // Tax Information
  tax_deductible: boolean;
  deduction_percentage: number;
  business_use_percentage: number;
  deductible_amount?: number; // Computed
  
  // Vendor Information
  vendor_name: string;
  vendor_type?: string;
  vendor_tax_id?: string;
  vendor_address?: string;
  
  // Payment Information
  payment_status: 'paid' | 'unpaid' | 'reimbursable';
  payment_date?: string;
  payment_method?: string;
  payment_account?: string;
  invoice_number?: string;
  check_number?: string;
  transaction_id?: string;
  reference_number?: string;
  
  // Recurring Expenses
  is_recurring: boolean;
  recurring_frequency?: string;
  auto_renews?: boolean;
  next_billing_date?: string;
  
  // Travel Specific
  trip_purpose?: string;
  trip_destination?: string;
  trip_start_date?: string;
  trip_end_date?: string;
  mileage?: number;
  mileage_rate?: number;
  
  // Meals & Entertainment Specific
  meal_attendees?: string[];
  meal_business_purpose?: string;
  
  // Description & Business Purpose (TAX CRITICAL)
  description: string;
  business_purpose: string;
  
  // Documentation
  receipt_url?: string;
  invoice_url?: string;
  additional_docs?: string[];
  
  // Project/Client Allocation
  project_id?: string;
  client_id?: string;
  billable?: boolean;
  
  // Approval Workflow
  approval_status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  
  // Accounting
  journal_entry_id?: string;
  
  // Audit Trail
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  expense_account?: ChartOfAccount;
  client?: any; // crm_businesses
  project?: any; // projects
}

export interface Vendor1099 {
  id: string;
  vendor_name: string;
  vendor_type: string;
  tax_id: string;
  tax_id_type: 'ein' | 'ssn';
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  email?: string;
  phone?: string;
  w9_received: boolean;
  w9_date?: string;
  w9_document_url?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Vendor1099AnnualTotal {
  id: string;
  vendor_id: string;
  tax_year: number;
  total_payments: number;
  requires_1099?: boolean; // Computed
  form_1099_generated: boolean;
  form_1099_sent_date?: string;
  created_at: string;
  vendor?: Vendor1099;
}

export interface Asset {
  id: string;
  asset_name: string;
  account_id: string;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  depreciation_method?: 'straight_line' | 'declining_balance' | 'none';
  useful_life_months?: number;
  salvage_value: number;
  description?: string;
  created_at: string;
  updated_at: string;
  account?: ChartOfAccount;
}

export interface Liability {
  id: string;
  liability_name: string;
  account_id: string;
  liability_type: 'loan' | 'credit_card' | 'payable' | 'other';
  original_amount: number;
  current_balance: number;
  interest_rate?: number;
  due_date?: string;
  creditor_name?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  account?: ChartOfAccount;
}

export interface EquityTransaction {
  id: string;
  transaction_date: string;
  transaction_type: 'investment' | 'withdrawal' | 'dividend' | 'retained_earnings';
  amount: number;
  description?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RevenueForecast {
  id: string;
  forecast_month: string;
  business_id?: string;
  forecasted_amount: number;
  confidence_level?: number;
  forecast_method?: 'linear_regression' | 'moving_average' | 'pipeline_based' | 'seasonal';
  based_on_data?: any;
  created_at: string;
  business?: any;
}

// Form Types
export interface RevenueFormData {
  business_id: string;
  revenue_date: string;
  amount: string;
  revenue_category: string;
  is_recurring: boolean;
  recurring_frequency?: 'monthly' | 'quarterly' | 'annually';
  contract_start_date?: string;
  contract_end_date?: string;
  payment_status: 'paid' | 'invoiced' | 'pending' | 'partially_paid';
  payment_date?: string;
  payment_method?: string;
  invoice_number?: string;
  taxable_amount?: string;
  tax_rate?: string;
  tax_jurisdiction?: string;
  service_description: string;
  project_name?: string;
  hours_worked?: string;
  hourly_rate?: string;
  notes?: string;
}

export interface ExpenseFormData {
  expense_date: string;
  amount: string;
  primary_category: string;
  subcategory: string;
  business_use_percentage: string;
  vendor_name: string;
  vendor_type?: string;
  payment_status: 'paid' | 'unpaid' | 'reimbursable';
  payment_date?: string;
  payment_method?: string;
  payment_account?: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  trip_purpose?: string;
  trip_destination?: string;
  mileage?: string;
  meal_attendees?: string;
  meal_business_purpose?: string;
  description: string;
  business_purpose: string;
  project_id?: string;
  client_id?: string;
  billable: boolean;
}

// Analytics Types
export interface FinancialKPIs {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  mrr: number;
  burn_rate: number;
  runway_months: number;
  avg_revenue_per_client: number;
  client_lifetime_value: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
  percentage: number;
  deductible_amount: number;
}

export interface TopVendor {
  vendor_name: string;
  total_amount: number;
  transaction_count: number;
}

// Financial Statement Types
export interface IncomeStatement {
  period_start: string;
  period_end: string;
  revenue: {
    service_revenue: number;
    product_revenue: number;
    other_income: number;
    total_revenue: number;
  };
  cogs: {
    materials: number;
    labor: number;
    total_cogs: number;
  };
  gross_profit: number;
  operating_expenses: {
    [category: string]: number;
    total_operating_expenses: number;
  };
  operating_income: number;
  other_expenses: {
    interest_expense: number;
    other: number;
    total_other: number;
  };
  net_income: number;
}

export interface BalanceSheet {
  as_of_date: string;
  assets: {
    current_assets: {
      cash: number;
      accounts_receivable: number;
      prepaid_expenses: number;
      total_current: number;
    };
    fixed_assets: {
      equipment: number;
      accumulated_depreciation: number;
      net_fixed_assets: number;
    };
    total_assets: number;
  };
  liabilities: {
    current_liabilities: {
      accounts_payable: number;
      accrued_expenses: number;
      current_debt: number;
      total_current: number;
    };
    long_term_liabilities: {
      long_term_debt: number;
      total_long_term: number;
    };
    total_liabilities: number;
  };
  equity: {
    owner_capital: number;
    retained_earnings: number;
    current_year_earnings: number;
    total_equity: number;
  };
  total_liabilities_and_equity: number;
  balanced: boolean;
}

export interface CashFlowStatement {
  period_start: string;
  period_end: string;
  operating_activities: {
    net_income: number;
    depreciation: number;
    change_in_ar: number;
    change_in_ap: number;
    cash_from_operations: number;
  };
  investing_activities: {
    asset_purchases: number;
    asset_sales: number;
    cash_from_investing: number;
  };
  financing_activities: {
    owner_contributions: number;
    owner_withdrawals: number;
    loan_proceeds: number;
    loan_payments: number;
    cash_from_financing: number;
  };
  net_change_in_cash: number;
  beginning_cash: number;
  ending_cash: number;
}

// Filter Types
export interface FinanceFilters {
  date_range: {
    start: string;
    end: string;
  };
  business_id?: string;
  category?: string;
  payment_status?: string;
  search?: string;
}
