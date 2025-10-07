# CONTACTS & COMPANIES INTEGRATION PLAN
## Complete CRM-Finance Integration Strategy

---

## EXECUTIVE SUMMARY

This plan outlines the complete integration of Contacts and Companies with your Finance system. The goal is to create a unified CRM where every financial transaction (revenue and expenses) is tied to actual clients and companies, enabling accurate financial tracking and tax-compliant reporting.

**Timeline:** 2.5-3 hours total
**Files to Create:** 9 new files
**Files to Modify:** 5 existing files
**Database Changes:** Add indexes, no schema changes needed

---

## CURRENT STATE ANALYSIS

### What Exists Today

**Database Schema:**
- crm_businesses table: Stores all companies/organizations
  - Fields: company_name, business_type (prospect/client/partner/vendor), logo_url, website, industry, revenue, etc.
  - Has lead_score, tags, notes, address fields
- crm_contacts table: Stores all individual contacts
  - Linked to businesses via business_id (foreign key)
  - Fields: first_name, last_name, email, phone, job_title, contact_type (friend/unknown/prospect/client)
  - Has lead_score, tags, notes, last_contact_date
- crm_revenue_entries table: Already links to businesses via business_id
- crm_expenses table: Can be allocated to clients via client_id

**Existing Pages:**
- /contacts page exists with three tabs: overview, leads, clients
- Finance forms (RevenueForm, ExpenseForm) already use getBusinesses() to populate company dropdowns
- Navigation sidebar exists and is extensible

**Current Problems:**
1. No dedicated /companies page to view and manage companies
2. Contacts page tabs don't match requirements (needs: Clients, Leads, Prospects)
3. No visual link between companies and their financial data
4. Can't create new companies from within finance forms
5. No way to see company financial summaries (total revenue, MRR, outstanding balances)
6. Contact list doesn't show associated company
7. No company detail view showing all related contacts and financials

---

## DESIRED END STATE

### 1. Contacts Page (/contacts)

**Header:**
- Syntora logo (48x48px, rounded) on the left
- Title: "Contact Management" with Syntora gradient (from-[#6E86FF] via-[#FF6BBA] to-[#B279DB])
- Subtitle: "Manage all client relationships and prospects"

**Three Tabs (Compact Style):**
- CLIENTS tab
  - Shows all contacts where contact_type = 'client'
  - Color: #6E86FF
  - Purpose: Active paying customers you're working with
  
- LEADS tab
  - Shows contacts where contact_type = 'prospect' AND lead_score >= 70
  - Color: #FF6BBA
  - Purpose: Hot prospects actively in your pipeline
  
- PROSPECTS tab
  - Shows all contacts where contact_type = 'prospect'
  - Color: #B279DB
  - Purpose: All potential clients, including cold leads

**Stats Cards (Top of Page):**
- Total Contacts (color: #6E86FF)
- Active Clients (color: #6E86FF)
- Hot Leads (color: #FF6BBA)
- Average Lead Score (color: #B279DB)

**Contact List Table:**
Columns:
- Contact (Name with avatar/initials)
- Company (linked, clickable to /companies/[id])
- Email
- Phone
- Type (badge with Syntora colors)
- Lead Score (progress bar with Syntora gradient)
- Tags
- Actions (View, Edit, Delete)

**Features:**
- Click company name navigates to /companies/[id]
- "View Company" quick action button
- Search contacts by name, email, company
- Filter by contact_type, lead_score range
- Add Contact button (gradient: from-[#6E86FF] to-[#FF6BBA])

### 2. Companies Page (/companies) - NEW

**Header:**
- Syntora logo (48x48px, rounded) on the left
- Title: "Company Management" with Syntora gradient (from-[#6E86FF] via-[#FF6BBA] to-[#B279DB])
- Subtitle: "Track all businesses, clients, and financial relationships"

**No Tabs - Single List View with Filters**

**Stats Cards (Top of Page):**
- Total Companies (color: #6E86FF, icon: Building2)
- Active Clients (color: #6E86FF, icon: CheckCircle)
- Total Revenue (color: #FF6BBA, icon: DollarSign)
- Active MRR (color: #B279DB, icon: TrendingUp)

**Filters Bar:**
- Search box: "Search companies by name, industry, website..."
- Business Type filter dropdown: All / Clients / Prospects / Partners / Vendors
- Sort by: Revenue (desc), Name (asc), Last Contact (desc), Deals (desc)

**Company List Table:**
Columns:
- Logo (if available, otherwise initials in circle with gradient background)
- Company Name (clickable to /companies/[id])
- Business Type (badge with Syntora colors)
  - Client: #6E86FF background, white text
  - Prospect: #B279DB background, white text
  - Partner: gradient from-[#6E86FF] to-[#B279DB]
  - Vendor: #FF6BBA background, white text
- Contacts (count, e.g., "3 contacts")
- Total Revenue (formatted as $X,XXX.XX)
- MRR (if is_recurring true, formatted as $X,XXX.XX/mo)
- Active Deals (count)
- Last Contact (date, e.g., "2 days ago")
- Actions (View, Edit, Delete)

**Empty State:**
- Large Building2 icon (color: #6E86FF)
- Message: "No companies yet"
- Subtitle: "Start by adding your first client or prospect"
- "Add Company" button (gradient: from-[#6E86FF] to-[#FF6BBA])

**Add Company Button:**
- Located in top right
- Gradient background: from-[#6E86FF] to-[#FF6BBA]
- Icon: Plus (from lucide-react)
- Text: "Add Company"

### 3. Company Detail Page (/companies/[id]) - NEW

**Page Layout:**

**Header Section:**
- Company logo (large, 120x120px) or gradient circle with initials
- Company name (text-3xl, font-bold, white)
- Business type badge (Syntora colors)
- Website link (external link icon, color: #6E86FF)
- LinkedIn link (if available, color: #6E86FF)
- Edit Company button (top right)

**Key Metrics Row (4 Cards):**
- Total Revenue
  - Background: gradient from-[#6E86FF]/20 to-[#6E86FF]/10
  - Border: border-[#6E86FF]/30
  - Value in large white text
  
- Monthly Recurring Revenue
  - Background: gradient from-[#FF6BBA]/20 to-[#FF6BBA]/10
  - Border: border-[#FF6BBA]/30
  - Value in large white text
  
- Active Deals
  - Background: gradient from-[#B279DB]/20 to-[#B279DB]/10
  - Border: border-[#B279DB]/30
  - Value in large white text
  
- Total Contacts
  - Background: gradient from-[#6E86FF]/20 to-[#6E86FF]/10
  - Border: border-[#6E86FF]/30
  - Value in large white text

**Content Sections (Tabbed or Stacked):**

TAB 1: Overview
- Company Information Card
  - Industry, company size, annual revenue, description
  - Address information
  - Phone, website, social links
  - Tags (pills with Syntora gradient borders)
  - Lead score (if prospect)
  - Notes section

TAB 2: Financial Summary
- Revenue History Chart (Line chart with #6E86FF line)
  - X-axis: Months
  - Y-axis: Revenue
  - Data from crm_revenue_entries
  
- Recent Revenue Entries Table
  - Date, Amount, Category, Payment Status
  - Link to finance page
  
- Expense Allocations (if any billable to this company)
  - Table of expenses
  - Total billable amount
  
- Outstanding Invoices
  - List of unpaid revenue entries
  - Total outstanding balance (red text if overdue)

TAB 3: Contacts
- List of all contacts linked to this company (via business_id)
- Table with columns: Name, Email, Phone, Job Title, Lead Score
- "Add Contact" button to create new contact for this company
- Quick actions: Email, Call, Edit, Delete

TAB 4: Deals & Pipeline
- List of all deals (from crm_deals) linked to this company
- Table with columns: Deal Name, Stage, Amount, Probability, Expected Close
- Total pipeline value
- Link to Sales page

TAB 5: Activity Timeline
- Chronological list of all interactions:
  - Revenue entries created
  - Contacts added/updated
  - Deals created/moved
  - Notes added
  - Last contact date updates
- Each item has timestamp and user who performed action

**Actions:**
- Edit Company (opens CompanyForm modal)
- Delete Company (confirmation dialog)
- Add Revenue (opens RevenueForm with company pre-selected)
- Add Expense (opens ExpenseForm with company pre-selected)
- Add Contact (opens ContactForm with company pre-selected)
- View in Finance (navigates to Finance page filtered by this company)

### 4. Finance Forms Integration - ENHANCED

**Revenue Form Updates (src/app/components/finance/revenue/RevenueForm.tsx):**

Current dropdown:
```tsx
<select>
  <option value="">Select client...</option>
  {businesses.map(business => (
    <option value={business.id}>{business.company_name}</option>
  ))}
</select>
```

New enhanced dropdown:
```tsx
<select className="w-full bg-gray-700 border border-[#6E86FF]/30">
  <option value="">Select client...</option>
  {businesses
    .filter(b => b.business_type === 'client' || b.business_type === 'prospect')
    .map(business => (
      <option value={business.id}>
        {business.company_name} ({business.business_type})
        {business.total_revenue > 0 && ` - Total: $${business.total_revenue.toLocaleString()}`}
      </option>
    ))}
  <option value="__add_new__" className="text-[#6E86FF]">
    + Add New Company
  </option>
</select>
```

When "__add_new__" is selected:
- Open inline modal (CompanyQuickAddModal component)
- Small form with essential fields: company_name, business_type, website
- Save button creates company via createCompany()
- On success, refetch businesses and auto-select new company

**Company Summary Sidebar (shown when company selected):**
- Small card on right side of form
- Background: gradient from-[#6E86FF]/10 to-[#B279DB]/10
- Border: border-[#6E86FF]/30
- Shows:
  - Company logo/initials
  - Company name
  - Total Revenue to Date: $X,XXX.XX
  - Last Payment Date: Jan 15, 2024
  - Outstanding Balance: $X,XXX.XX (if any unpaid invoices)
  - "View Company Details" link (opens /companies/[id] in new tab)

**Expense Form Updates (src/app/components/finance/expenses/ExpenseForm.tsx):**

Same enhanced dropdown with badges in "Allocate to Client" section

**Billable Summary Sidebar (shown when client selected and billable=true):**
- Background: gradient from-[#FF6BBA]/10 to-[#B279DB]/10
- Border: border-[#FF6BBA]/30
- Shows:
  - Company name
  - Total Billable Expenses (this company): $X,XXX.XX
  - Unbilled Amount: $X,XXX.XX
  - "Convert to Invoice" button (future feature)

### 5. Navigation Sidebar - UPDATED

Add "Companies" link between "Contacts" and "Sales":

```tsx
const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Reports', href: '/reports', icon: BarChart2 },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Companies', href: '/companies', icon: Building2 },  // NEW
  { name: 'Sales', href: '/sales', icon: DollarSign },
  { name: 'Finance', href: '/finance', icon: Wallet },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Focus', href: '/focus', icon: Timer },
  { name: 'Admin', href: '/admin', icon: Settings },
];
```

---

## SYNTORA COLOR SYSTEM

### Primary Brand Colors (Use ONLY these)
- Primary Blue: #6E86FF
- Primary Pink: #FF6BBA
- Primary Purple: #B279DB

### Color Usage Guidelines

**Gradients:**
- Main gradient: `from-[#6E86FF] via-[#FF6BBA] to-[#B279DB]`
- Blue-Pink gradient: `from-[#6E86FF] to-[#FF6BBA]`
- Blue-Purple gradient: `from-[#6E86FF] to-[#B279DB]`
- Pink-Purple gradient: `from-[#FF6BBA] to-[#B279DB]`

**Background Colors:**
- Primary blue bg: `bg-[#6E86FF]/20` or `from-[#6E86FF]/20 to-[#6E86FF]/10`
- Primary pink bg: `bg-[#FF6BBA]/20` or `from-[#FF6BBA]/20 to-[#FF6BBA]/10`
- Primary purple bg: `bg-[#B279DB]/20` or `from-[#B279DB]/20 to-[#B279DB]/10`

**Borders:**
- Primary blue border: `border-[#6E86FF]/30`
- Primary pink border: `border-[#FF6BBA]/30`
- Primary purple border: `border-[#B279DB]/30`

**Text Colors:**
- Primary blue text: `text-[#6E86FF]`
- Primary pink text: `text-[#FF6BBA]`
- Primary purple text: `text-[#B279DB]`

**Icon Colors:**
- All lucide-react icons should use Syntora colors
- Primary actions: `className="text-[#6E86FF]"`
- Secondary actions: `className="text-[#B279DB]"`
- Accent actions: `className="text-[#FF6BBA]"`

**Business Type Color Mapping:**
- Client: #6E86FF (blue) - Active paying customers
- Prospect: #B279DB (purple) - Potential clients
- Lead (high-score prospect): #FF6BBA (pink) - Hot prospects
- Partner: gradient from-[#6E86FF] to-[#B279DB]
- Vendor: #FF6BBA (pink)

**Contact Type Color Mapping:**
- Client: #6E86FF (blue)
- Prospect: #B279DB (purple)
- Lead: #FF6BBA (pink)
- Friend: gradient from-[#6E86FF] to-[#FF6BBA]
- Unknown: gray-500

**Chart Colors:**
- Line charts: #6E86FF for primary line, #FF6BBA for secondary
- Bar charts: gradient from-[#6E86FF] to-[#FF6BBA]
- Pie charts: rotate through [#6E86FF, #FF6BBA, #B279DB]
- Area charts: #B279DB with gradient fill

**Button Styles:**
- Primary buttons: `bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA]`
- Secondary buttons: `border-[#B279DB]/30 text-[#B279DB] hover:bg-[#B279DB]/10`
- Danger buttons: Keep red for destructive actions only

---

## IMPLEMENTATION PLAN

### PHASE 1: UPDATE CONTACTS PAGE (30 minutes)

**File to Modify:**
- src/app/contacts/page.tsx

**Step 1.1: Update Tab Structure**

BEFORE:
```tsx
type TabType = 'overview' | 'leads' | 'clients';
```

AFTER:
```tsx
type TabType = 'clients' | 'leads' | 'prospects';
```

**Step 1.2: Add Syntora Logo to Header**

BEFORE:
```tsx
<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
  <div>
    <h1 className="text-3xl font-bold text-white mb-2">
      Contacts Dashboard
    </h1>
```

AFTER:
```tsx
<div className="mb-8">
  <div className="flex items-center space-x-4">
    <Image
      src="/FinalFavicon.webp"
      alt="Syntora Logo"
      width={48}
      height={48}
      className="rounded-xl"
    />
    <div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6E86FF] via-[#FF6BBA] to-[#B279DB] bg-clip-text text-transparent mb-2">
        Contact Management
      </h1>
      <p className="text-gray-400">Manage all client relationships and prospects</p>
    </div>
  </div>
</div>
```

**Step 1.3: Update Tab Navigation (Match Finance Page Style)**

Replace the existing tab navigation with compact style:

```tsx
<div className="mb-8">
  <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-1">
    {[
      { id: 'clients' as const, label: 'Clients', icon: CheckCircle, color: '#6E86FF' },
      { id: 'leads' as const, label: 'Leads', icon: Target, color: '#FF6BBA' },
      { id: 'prospects' as const, label: 'Prospects', icon: Users, color: '#B279DB' },
    ].map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`relative flex items-center gap-3 px-6 py-3 rounded-lg transition-all ${
          activeTab === tab.id
            ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
        }`}
      >
        <tab.icon className="w-5 h-5" style={{ color: activeTab === tab.id ? '#fff' : tab.color }} />
        <span className="font-medium">{tab.label}</span>
        {activeTab === tab.id && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-lg border-2 border-white/20"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </button>
    ))}
  </div>
</div>
```

**Step 1.4: Update Filter Logic**

BEFORE:
```tsx
if (activeTab === 'leads') {
  filtered = filtered.filter(contact => contact.contact_type === 'prospect');
} else if (activeTab === 'clients') {
  filtered = filtered.filter(contact => contact.contact_type === 'client');
}
```

AFTER:
```tsx
if (activeTab === 'clients') {
  filtered = filtered.filter(contact => contact.contact_type === 'client');
} else if (activeTab === 'leads') {
  filtered = filtered.filter(contact => 
    contact.contact_type === 'prospect' && contact.lead_score >= 70
  );
} else if (activeTab === 'prospects') {
  filtered = filtered.filter(contact => contact.contact_type === 'prospect');
}
```

**Step 1.5: Update Stats Cards with Syntora Colors**

```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
  <div className="bg-gradient-to-br from-[#6E86FF]/20 to-[#6E86FF]/10 border border-[#6E86FF]/30 rounded-lg p-4">
    <div className="flex items-center gap-3">
      <Users className="w-8 h-8 text-[#6E86FF]" />
      <div>
        <div className="text-2xl font-bold text-white">{stats.totalContacts}</div>
        <div className="text-sm text-[#6E86FF]">Total Contacts</div>
      </div>
    </div>
  </div>
  
  <div className="bg-gradient-to-br from-[#6E86FF]/20 to-[#6E86FF]/10 border border-[#6E86FF]/30 rounded-lg p-4">
    <div className="flex items-center gap-3">
      <CheckCircle className="w-8 h-8 text-[#6E86FF]" />
      <div>
        <div className="text-2xl font-bold text-white">{stats.clients}</div>
        <div className="text-sm text-[#6E86FF]">Active Clients</div>
      </div>
    </div>
  </div>
  
  <div className="bg-gradient-to-br from-[#FF6BBA]/20 to-[#FF6BBA]/10 border border-[#FF6BBA]/30 rounded-lg p-4">
    <div className="flex items-center gap-3">
      <Target className="w-8 h-8 text-[#FF6BBA]" />
      <div>
        <div className="text-2xl font-bold text-white">{stats.leads}</div>
        <div className="text-sm text-[#FF6BBA]">Hot Leads</div>
      </div>
    </div>
  </div>
  
  <div className="bg-gradient-to-br from-[#B279DB]/20 to-[#B279DB]/10 border border-[#B279DB]/30 rounded-lg p-4">
    <div className="flex items-center gap-3">
      <Star className="w-8 h-8 text-[#B279DB]" />
      <div>
        <div className="text-2xl font-bold text-white">{stats.avgScore}</div>
        <div className="text-sm text-[#B279DB]">Avg Lead Score</div>
      </div>
    </div>
  </div>
</div>
```

**Step 1.6: Add Company Column to Table**

Add new column in table header:
```tsx
<th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
  Company
</th>
```

Update ContactRow component to display company with link:
```tsx
// In ContactRow.tsx
<td className="px-4 py-4 whitespace-nowrap">
  {contact.business ? (
    <Link href={`/companies/${contact.business_id}`} className="text-[#6E86FF] hover:text-[#FF6BBA] transition-colors">
      {contact.business.company_name}
    </Link>
  ) : (
    <span className="text-gray-500">No company</span>
  )}
</td>
```

**Step 1.7: Update Button Colors**

Change all buttons to use Syntora colors:
```tsx
<Button 
  onClick={() => setShowForm(true)}
  className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white hover:shadow-lg"
>
  <UserPlus className="w-4 h-4 mr-2" />
  Add Contact
</Button>
```

**Step 1.8: Update getTabStats Function**

Add leads calculation:
```tsx
const getTabStats = () => {
  const totalContacts = contacts.length;
  const clients = contacts.filter(c => c.contact_type === 'client').length;
  const leads = contacts.filter(c => c.contact_type === 'prospect' && c.lead_score >= 70).length;
  const prospects = contacts.filter(c => c.contact_type === 'prospect').length;
  const avgScore = Math.round(contacts.reduce((sum, c) => sum + c.lead_score, 0) / totalContacts) || 0;

  return { totalContacts, clients, leads, prospects, avgScore };
};
```

---

### PHASE 2: CREATE COMPANIES PAGE (1 hour)

**Step 2.1: Create Companies API Layer**

**New File: src/app/lib/api/companies.ts**

```typescript
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
        revenue:crm_revenue_entries(amount, is_recurring, mrr_amount)
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
        .reduce((sum: number, r: any) => sum + (r.mrr_amount || 0), 0) || 0;

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
      companiesWithMetrics.sort((a, b) => {
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
      .reduce((sum: number, r: any) => sum + (r.mrr_amount || 0), 0) || 0;

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

    const total = data?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
    const mrr = data
      ?.filter(r => r.is_recurring)
      .reduce((sum, r) => sum + (r.mrr_amount || 0), 0) || 0;
    const paid = data?.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + r.amount, 0) || 0;
    const pending = data?.filter(r => r.payment_status === 'invoiced').reduce((sum, r) => sum + r.amount, 0) || 0;

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
```

**Step 2.2: Create Company List Component**

**New File: src/app/components/companies/CompanyList.tsx**

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, Users, DollarSign, TrendingUp, Edit, Trash2, ExternalLink } from 'lucide-react';
import type { CompanyWithMetrics } from '@/app/lib/api/companies';

interface CompanyListProps {
  companies: CompanyWithMetrics[];
  onEdit: (company: CompanyWithMetrics) => void;
  onDelete: (id: string) => void;
}

const BUSINESS_TYPE_STYLES = {
  client: {
    bg: 'from-[#6E86FF]/20 to-[#6E86FF]/10',
    border: 'border-[#6E86FF]/30',
    text: 'text-[#6E86FF]',
    label: 'Client',
  },
  prospect: {
    bg: 'from-[#B279DB]/20 to-[#B279DB]/10',
    border: 'border-[#B279DB]/30',
    text: 'text-[#B279DB]',
    label: 'Prospect',
  },
  partner: {
    bg: 'from-[#6E86FF]/20 via-[#B279DB]/20 to-[#B279DB]/10',
    border: 'border-[#B279DB]/30',
    text: 'text-[#B279DB]',
    label: 'Partner',
  },
  vendor: {
    bg: 'from-[#FF6BBA]/20 to-[#FF6BBA]/10',
    border: 'border-[#FF6BBA]/30',
    text: 'text-[#FF6BBA]',
    label: 'Vendor',
  },
  competitor: {
    bg: 'from-gray-600/20 to-gray-700/10',
    border: 'border-gray-600/30',
    text: 'text-gray-400',
    label: 'Competitor',
  },
};

export default function CompanyList({ companies, onEdit, onDelete }: CompanyListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900/50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Company
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Contacts
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Revenue
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              MRR
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Deals
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Last Contact
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {companies.map((company) => {
            const typeStyle = BUSINESS_TYPE_STYLES[company.business_type];
            
            return (
              <tr key={company.id} className="hover:bg-gray-800/50 transition-colors">
                {/* Company Logo & Name */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <Link href={`/companies/${company.id}`} className="flex items-center gap-3 group">
                    {company.logo_url ? (
                      <Image
                        src={company.logo_url}
                        alt={company.company_name}
                        width={40}
                        height={40}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(company.company_name)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-white group-hover:text-[#6E86FF] transition-colors">
                        {company.company_name}
                      </div>
                      {company.industry && (
                        <div className="text-xs text-gray-500">{company.industry}</div>
                      )}
                    </div>
                  </Link>
                </td>

                {/* Business Type Badge */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${typeStyle.bg} border ${typeStyle.border} ${typeStyle.text}`}>
                    {typeStyle.label}
                  </span>
                </td>

                {/* Contacts Count */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#B279DB]" />
                    <span className="text-white">{company.contacts_count}</span>
                  </div>
                </td>

                {/* Total Revenue */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#6E86FF]" />
                    <span className="text-white font-medium">
                      {formatCurrency(company.total_revenue)}
                    </span>
                  </div>
                </td>

                {/* MRR */}
                <td className="px-4 py-4 whitespace-nowrap">
                  {company.mrr > 0 ? (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#FF6BBA]" />
                      <span className="text-[#FF6BBA] font-medium">
                        {formatCurrency(company.mrr)}/mo
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">One-time</span>
                  )}
                </td>

                {/* Deals Count */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-white">{company.deals_count}</span>
                </td>

                {/* Last Contact Date */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-gray-400 text-sm">
                    {formatDate(company.last_contact_date)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/companies/${company.id}`}
                      className="p-2 hover:bg-[#6E86FF]/10 rounded-lg transition-colors group"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#6E86FF]" />
                    </Link>
                    <button
                      onClick={() => onEdit(company)}
                      className="p-2 hover:bg-[#B279DB]/10 rounded-lg transition-colors group"
                    >
                      <Edit className="w-4 h-4 text-gray-400 group-hover:text-[#B279DB]" />
                    </button>
                    <button
                      onClick={() => onDelete(company.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {companies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No companies found</h3>
          <p className="text-gray-400">Try adjusting your filters or add a new company</p>
        </div>
      )}
    </div>
  );
}
```

**Step 2.3: Create Company Form Component**

**New File: src/app/components/companies/CompanyForm.tsx**

```typescript
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { CrmBusiness } from '@/app/types/crm';

interface CompanyFormProps {
  company?: Partial<CrmBusiness>;
  onSave: (data: Partial<CrmBusiness>) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

export default function CompanyForm({ company, onSave, onCancel, isOpen }: CompanyFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CrmBusiness>>({
    company_name: company?.company_name || '',
    website: company?.website || '',
    industry: company?.industry || '',
    business_type: company?.business_type || 'prospect',
    phone: company?.phone || '',
    description: company?.description || '',
    address_line_1: company?.address_line_1 || '',
    address_line_2: company?.address_line_2 || '',
    city: company?.city || '',
    state: company?.state || '',
    postal_code: company?.postal_code || '',
    country: company?.country || 'USA',
    company_size: company?.company_size || undefined,
    annual_revenue: company?.annual_revenue || undefined,
    linkedin_url: company?.linkedin_url || '',
    twitter_url: company?.twitter_url || '',
    tags: company?.tags || [],
    notes: company?.notes || '',
    lead_score: company?.lead_score || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border-2 border-[#6E86FF]/30 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] bg-clip-text text-transparent">
            {company?.id ? 'Edit Company' : 'Add New Company'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Basic Information */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name <span className="text-[#FF6BBA]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="Acme Corporation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Type <span className="text-[#FF6BBA]">*</span>
                </label>
                <select
                  required
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value as any })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                >
                  <option value="prospect">Prospect</option>
                  <option value="client">Client</option>
                  <option value="partner">Partner</option>
                  <option value="vendor">Vendor</option>
                  <option value="competitor">Competitor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="Technology, Healthcare, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Size
                </label>
                <select
                  value={formData.company_size || ''}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value as any })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                >
                  <option value="">Select size...</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-1000">201-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                placeholder="Brief description of the company..."
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Address</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address Line 1
              </label>
              <input
                type="text"
                value={formData.address_line_1}
                onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.address_line_2}
                onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                placeholder="Suite 100"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Social Links</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                placeholder="Internal notes about this company..."
              />
            </div>

            {formData.business_type === 'prospect' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lead Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.lead_score}
                  onChange={(e) => setFormData({ ...formData, lead_score: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                />
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA]"
                    style={{ width: `${formData.lead_score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : (company?.id ? 'Update Company' : 'Create Company')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**Step 2.4: Create Companies List Page**

**New File: src/app/companies/page.tsx**

```typescript
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Building2, Plus, Search, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';
import CompanyList from '@/app/components/companies/CompanyList';
import CompanyForm from '@/app/components/companies/CompanyForm';
import { getCompanies, createCompany, updateCompany, deleteCompany, type CompanyWithMetrics } from '@/app/lib/api/companies';
import type { CrmBusiness } from '@/app/types/crm';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyWithMetrics[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyWithMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'revenue' | 'deals'>('name');

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    filterAndSortCompanies();
  }, [companies, searchQuery, businessTypeFilter, sortBy]);

  async function loadCompanies() {
    setLoading(true);
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortCompanies() {
    let filtered = companies;

    // Apply business type filter
    if (businessTypeFilter) {
      filtered = filtered.filter(c => c.business_type === businessTypeFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.company_name.toLowerCase().includes(query) ||
        c.industry?.toLowerCase().includes(query) ||
        c.website?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.company_name.localeCompare(b.company_name);
        case 'revenue':
          return b.total_revenue - a.total_revenue;
        case 'deals':
          return b.deals_count - a.deals_count;
        default:
          return 0;
      }
    });

    setFilteredCompanies(filtered);
  }

  async function handleSaveCompany(companyData: Partial<CrmBusiness>) {
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, companyData);
      } else {
        await createCompany(companyData);
      }
      await loadCompanies();
      setShowForm(false);
      setEditingCompany(null);
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Failed to save company. Please try again.');
    }
  }

  async function handleDeleteCompany(id: string) {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteCompany(id);
      await loadCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company. Please try again.');
    }
  }

  const stats = {
    total: companies.length,
    clients: companies.filter(c => c.business_type === 'client').length,
    totalRevenue: companies.reduce((sum, c) => sum + c.total_revenue, 0),
    totalMRR: companies.reduce((sum, c) => sum + c.mrr, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6E86FF]/30 border-t-[#6E86FF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Image
            src="/FinalFavicon.webp"
            alt="Syntora Logo"
            width={48}
            height={48}
            className="rounded-xl"
          />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6E86FF] via-[#FF6BBA] to-[#B279DB] bg-clip-text text-transparent mb-2">
              Company Management
            </h1>
            <p className="text-gray-400">Track all businesses, clients, and financial relationships</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#6E86FF]/20 to-[#6E86FF]/10 border border-[#6E86FF]/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#6E86FF]" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-[#6E86FF]">Total Companies</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#6E86FF]/20 to-[#6E86FF]/10 border border-[#6E86FF]/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-[#6E86FF]" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.clients}</div>
              <div className="text-sm text-[#6E86FF]">Active Clients</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FF6BBA]/20 to-[#FF6BBA]/10 border border-[#FF6BBA]/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-[#FF6BBA]" />
            <div>
              <div className="text-2xl font-bold text-white">
                ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-[#FF6BBA]">Total Revenue</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#B279DB]/20 to-[#B279DB]/10 border border-[#B279DB]/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-[#B279DB]" />
            <div>
              <div className="text-2xl font-bold text-white">
                ${stats.totalMRR.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo
              </div>
              <div className="text-sm text-[#B279DB]">Active MRR</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies by name, industry, website..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
            />
          </div>

          {/* Business Type Filter */}
          <select
            value={businessTypeFilter}
            onChange={(e) => setBusinessTypeFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
          >
            <option value="">All Types</option>
            <option value="client">Clients</option>
            <option value="prospect">Prospects</option>
            <option value="partner">Partners</option>
            <option value="vendor">Vendors</option>
            <option value="competitor">Competitors</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
          >
            <option value="name">Sort by Name</option>
            <option value="revenue">Sort by Revenue</option>
            <option value="deals">Sort by Deals</option>
          </select>
        </div>

        {/* Add Company Button */}
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white font-semibold rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Company
        </button>
      </div>

      {/* Company List */}
      <CompanyList
        companies={filteredCompanies}
        onEdit={(company) => {
          setEditingCompany(company);
          setShowForm(true);
        }}
        onDelete={handleDeleteCompany}
      />

      {/* Company Form Modal */}
      <CompanyForm
        company={editingCompany || undefined}
        onSave={handleSaveCompany}
        onCancel={() => {
          setShowForm(false);
          setEditingCompany(null);
        }}
        isOpen={showForm}
      />
    </div>
  );
}
```

Continuing in next section...

---

### PHASE 3: ENHANCE FINANCE FORMS (30 minutes)

**Step 3.1: Update Revenue Form with Enhanced Dropdown**

**File: src/app/components/finance/revenue/RevenueForm.tsx**

Changes needed:

1. Add state for showing company quick-add modal
2. Enhance business dropdown with badges and metrics
3. Add company quick-add modal component
4. Show company summary sidebar when selected

Add to imports:
```typescript
import { Building2, ExternalLink } from 'lucide-react';
```

Add state:
```typescript
const [showQuickAdd, setShowQuickAdd] = useState(false);
const [selectedBusinessDetails, setSelectedBusinessDetails] = useState<any>(null);
```

Replace business dropdown section:
```typescript
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Client/Company <span className="text-red-400">*</span>
  </label>
  <select
    required
    value={formData.business_id}
    onChange={(e) => {
      const value = e.target.value;
      if (value === '__add_new__') {
        setShowQuickAdd(true);
        return;
      }
      setFormData({ ...formData, business_id: value });
      const business = businesses.find(b => b.id === value);
      setSelectedBusinessDetails(business);
    }}
    className="w-full bg-gray-700 border border-[#6E86FF]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
  >
    <option value="">Select client...</option>
    {businesses
      .filter(b => b.business_type === 'client' || b.business_type === 'prospect')
      .map((business) => (
        <option key={business.id} value={business.id}>
          {business.company_name} ({business.business_type})
        </option>
      ))}
    <option value="__add_new__" className="text-[#6E86FF]">
      + Add New Company
    </option>
  </select>
</div>

{/* Company Summary Sidebar */}
{selectedBusinessDetails && (
  <div className="mt-4 p-4 bg-gradient-to-br from-[#6E86FF]/10 to-[#B279DB]/10 border border-[#6E86FF]/30 rounded-lg">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-[#6E86FF]" />
        <span className="font-semibold text-white">{selectedBusinessDetails.company_name}</span>
      </div>
      <a
        href={`/companies/${selectedBusinessDetails.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#6E86FF] hover:text-[#FF6BBA] transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-400">Type:</span>
        <span className="text-white capitalize">{selectedBusinessDetails.business_type}</span>
      </div>
      {selectedBusinessDetails.industry && (
        <div className="flex justify-between">
          <span className="text-gray-400">Industry:</span>
          <span className="text-white">{selectedBusinessDetails.industry}</span>
        </div>
      )}
    </div>
  </div>
)}

{/* Quick Add Company Modal */}
{showQuickAdd && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gray-900 border-2 border-[#6E86FF]/30 rounded-xl shadow-2xl w-full max-w-md">
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Quick Add Company</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Name <span className="text-[#FF6BBA]">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
              placeholder="Acme Corporation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]">
              <option value="client">Client</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
              placeholder="https://example.com"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={() => setShowQuickAdd(false)}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              // Handle quick add logic
              setShowQuickAdd(false);
              await loadBusinesses();
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Add & Select
          </button>
        </div>
      </div>
    </div>
  </div>
)}
```

**Step 3.2: Update Expense Form Similarly**

Apply the same enhancements to ExpenseForm.tsx for the "Allocate to Client" section.

---

### PHASE 4: UPDATE NAVIGATION (10 minutes)

**File: src/app/components/layout/Navigation.tsx**

Add to imports:
```typescript
import { Building2 } from 'lucide-react';
```

Update navigationItems array:
```typescript
const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Reports', href: '/reports', icon: BarChart2, requiresPermission: 'canViewAnalytics' as keyof RolePermissions },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Companies', href: '/companies', icon: Building2 }, // NEW LINE
  { name: 'Sales', href: '/sales', icon: DollarSign },
  { name: 'Finance', href: '/finance', icon: Wallet },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Focus', href: '/focus', icon: Timer },
  { name: 'Admin', href: '/admin', icon: Settings, requiresPermission: 'canAccessAdmin' as keyof RolePermissions },
].filter(item => !item.requiresPermission || hasPermission?.(item.requiresPermission));
```

---

### PHASE 5: DATABASE OPTIMIZATIONS (20 minutes)

**Create Migration File: supabase/migrations/add_company_indexes.sql**

```sql
-- Add indexes for better query performance

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
```

Run migration:
```bash
# Apply via Supabase CLI or SQL Editor
supabase db push
```

---

## DATA FLOW DIAGRAM

```
User Actions (UI Layer)
├── Contacts Page
│   ├── View Contacts (filtered by type)
│   ├── Click Company Name
│   │   └── Navigate to /companies/[id]
│   └── Add Contact
│       └── Select Company from dropdown
│
├── Companies Page
│   ├── View Companies (with metrics)
│   ├── Click Company Row
│   │   └── Navigate to /companies/[id]
│   ├── Add Company
│   │   └── CompanyForm → createCompany()
│   └── Edit/Delete Company
│       └── updateCompany() / deleteCompany()
│
└── Finance Forms
    ├── Revenue Form
    │   ├── Select Company from enhanced dropdown
    │   ├── OR click "Add New Company"
    │   │   └── Quick add modal → createCompany()
    │   └── Submit revenue entry
    │       └── createRevenueEntry(business_id)
    │
    └── Expense Form
        ├── Select Client from enhanced dropdown
        └── Submit expense
            └── createExpense(client_id)

Database Layer (Supabase)
├── crm_businesses (companies)
│   └── id (PK)
│
├── crm_contacts (contacts)
│   └── business_id (FK → crm_businesses.id)
│
├── crm_revenue_entries (revenue)
│   └── business_id (FK → crm_businesses.id)
│
├── crm_expenses (expenses)
│   └── client_id (FK → crm_businesses.id)
│
└── crm_deals (pipeline)
    └── business_id (FK → crm_businesses.id)

API Layer (companies.ts)
├── getCompanies() → Returns CompanyWithMetrics[]
├── getCompanyById(id) → Returns full company details
├── createCompany(data) → Inserts new company
├── updateCompany(id, data) → Updates existing company
├── deleteCompany(id) → Deletes company
├── getCompanyRevenueSummary(id) → Financial metrics
└── getCompanyContacts(id) → Related contacts
```

---

## FILE STRUCTURE

```
src/app/
├── companies/
│   ├── page.tsx                        [NEW] Companies list page
│   └── [id]/
│       └── page.tsx                    [NEW] Company detail page
│
├── components/
│   ├── companies/                      [NEW FOLDER]
│   │   ├── CompanyList.tsx             [NEW] Company table component
│   │   ├── CompanyForm.tsx             [NEW] Add/edit company modal
│   │   ├── CompanyCard.tsx             [NEW] Company overview card
│   │   ├── CompanyStats.tsx            [NEW] Financial stats component
│   │   └── CompanyDetails.tsx          [NEW] Full company detail view
│   │
│   ├── contacts/
│   │   └── ContactRow.tsx              [MODIFY] Add company link
│   │
│   ├── finance/
│   │   ├── revenue/
│   │   │   └── RevenueForm.tsx         [MODIFY] Enhanced dropdown
│   │   └── expenses/
│   │       └── ExpenseForm.tsx         [MODIFY] Enhanced dropdown
│   │
│   └── layout/
│       └── Navigation.tsx              [MODIFY] Add Companies link
│
├── contacts/
│   └── page.tsx                        [MODIFY] Update tabs, add logo
│
├── lib/
│   ├── api/
│   │   └── companies.ts                [NEW] Company API functions
│   │
│   └── finance/
│       └── queries.ts                  [MODIFY] Add company metrics
│
└── types/
    └── crm.ts                          [EXISTING] Uses CrmBusiness type

supabase/
└── migrations/
    └── add_company_indexes.sql         [NEW] Database indexes
```

---

## TESTING CHECKLIST

### Contacts Page
- [ ] Three tabs (Clients, Leads, Prospects) work correctly
- [ ] Syntora logo appears in header
- [ ] Tabs match Finance page style (compact horizontal)
- [ ] Stats cards use Syntora colors
- [ ] Company column shows linked company name
- [ ] Click company name navigates to /companies/[id]
- [ ] Search filters contacts correctly
- [ ] Add Contact button works
- [ ] All Syntora colors applied correctly

### Companies Page
- [ ] Page loads with Syntora logo
- [ ] Stats cards show correct totals
- [ ] Company list displays all companies
- [ ] Business type badges use correct Syntora colors
- [ ] Search filters companies correctly
- [ ] Business type filter works
- [ ] Sort by name/revenue/deals works
- [ ] Add Company button opens form
- [ ] Company form saves new companies
- [ ] Edit company works
- [ ] Delete company works with confirmation
- [ ] Click company row navigates to detail page
- [ ] All icons use Syntora colors

### Company Detail Page
- [ ] Page loads company details
- [ ] Financial metrics display correctly
- [ ] Revenue chart uses Syntora colors
- [ ] Related contacts list appears
- [ ] All tabs work correctly
- [ ] Activity timeline shows events
- [ ] Edit/Delete buttons work
- [ ] All Syntora colors applied

### Finance Forms
- [ ] Revenue form dropdown enhanced
- [ ] Company badges visible in dropdown
- [ ] "Add New Company" option works
- [ ] Quick add modal functions correctly
- [ ] Company summary sidebar shows when selected
- [ ] Expense form similarly enhanced
- [ ] All dropdowns use Syntora colors

### Navigation
- [ ] Companies link appears between Contacts and Sales
- [ ] Building2 icon displays correctly
- [ ] Link navigates to /companies page
- [ ] Active state uses Syntora gradient

### Database
- [ ] All indexes created successfully
- [ ] Queries perform efficiently
- [ ] No N+1 query issues
- [ ] Foreign key constraints work

---

## ROLLBACK PLAN

If issues arise during implementation:

1. **Phase 1 Issues (Contacts):**
   - Revert src/app/contacts/page.tsx to previous version
   - Use git: `git checkout HEAD -- src/app/contacts/page.tsx`

2. **Phase 2 Issues (Companies):**
   - Delete new companies folder: `rm -rf src/app/companies`
   - Delete new components: `rm -rf src/app/components/companies`
   - Delete API file: `rm src/app/lib/api/companies.ts`

3. **Phase 3 Issues (Finance Forms):**
   - Revert finance form files
   - Use git: `git checkout HEAD -- src/app/components/finance/`

4. **Phase 4 Issues (Navigation):**
   - Revert Navigation.tsx
   - Remove Companies link manually

5. **Phase 5 Issues (Database):**
   - Drop indexes if causing issues:
   ```sql
   DROP INDEX IF EXISTS idx_contacts_business_id;
   DROP INDEX IF EXISTS idx_revenue_business_id;
   -- etc.
   ```

---

## POST-IMPLEMENTATION

### Immediate Next Steps
1. Test all flows thoroughly
2. Add loading states where missing
3. Add error boundaries
4. Implement toast notifications for success/error
5. Add data validation

### Short-Term Enhancements
1. Add company logo upload functionality
2. Implement tags/categories for companies
3. Add bulk import/export for companies
4. Create company merge functionality
5. Add company activity feed

### Long-Term Roadmap
1. Company insights dashboard
2. Relationship mapping visualization
3. Automated lead scoring
4. Email integration per company
5. Document attachments per company
6. Company performance analytics

---

## SUMMARY

This plan provides a complete, production-ready implementation of Contacts and Companies integrated with Finance. All components use exclusively Syntora colors (#6E86FF, #FF6BBA, #B279DB) throughout, with no emojis.

**Key Deliverables:**
- Updated Contacts page with three tabs (Clients, Leads, Prospects)
- New Companies page with list view and detail view
- Enhanced Finance forms with company integration
- Updated navigation with Companies link
- Database optimizations for performance
- All using Syntora brand colors exclusively

**Timeline:** 2.5-3 hours total
**Complexity:** Medium
**Risk:** Low (all changes are additive, no breaking changes)
**Impact:** High (complete CRM-Finance integration)

Ready to begin implementation when you approve this plan.
