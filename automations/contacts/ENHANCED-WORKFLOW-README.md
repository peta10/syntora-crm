# Enhanced Business-Contacts Sync Workflow

## Overview

This enhanced n8n workflow creates a proper normalized database structure by:
1. **Creating businesses first** from unique company names in Airtable
2. **Associating contacts** to their respective businesses via foreign key relationships
3. **Maintaining referential integrity** between contacts and businesses
4. **Preventing duplicates** for both businesses and contacts

## Database Architecture

### Before (Flat Structure)
```
crm_contacts
├── id
├── first_name
├── last_name
├── company (text field) ❌ Denormalized
└── ...other fields
```

### After (Normalized Structure)
```
crm_businesses                    crm_contacts
├── id (PK)                      ├── id (PK)
├── company_name                 ├── first_name
├── business_type                ├── last_name
├── lead_score                   ├── business_id (FK) ✅ Normalized
├── website                      └── ...other fields
└── ...other fields
```

## Workflow Process

### 1. Data Fetching (Parallel)
- **Fetch Airtable Contacts**: Gets all contact records from Airtable
- **Fetch Supabase Contacts**: Gets existing contacts for duplicate detection
- **Fetch Supabase Businesses**: Gets existing businesses for duplicate detection

### 2. Data Processing & Classification
The JavaScript code node processes data in this order:

#### Step 1: Extract Unique Businesses
```javascript
// Extract unique companies from Airtable contacts
const uniqueBusinesses = new Map();
for (const contact of airtableContacts) {
  const companyName = contact['Company Name']?.trim();
  if (companyName && !uniqueBusinesses.has(companyName.toLowerCase())) {
    uniqueBusinesses.set(companyName.toLowerCase(), {
      originalName: companyName,
      website: contact['Website URL'] || null
    });
  }
}
```

#### Step 2: Classify Business Types
```javascript
// Intelligent business classification
let businessType = 'prospect';
const hasCorpEmail = businessContacts.some(c => {
  if (!c['Email']) return false;
  const domain = c['Email'].split('@')[1]?.toLowerCase();
  const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  return !personalDomains.includes(domain);
});

if (hasCorpEmail) businessType = 'client';
```

#### Step 3: Process Contacts with Business Links
```javascript
// Link contacts to businesses via business_key
const contactData = {
  // ...contact fields
  business_key: companyName?.toLowerCase() // For linking later
};
```

### 3. Routing & Processing

#### Business Processing Path
```
Route by Item Type → Route Business Create/Update
                  ├── Create New Businesses (POST)
                  └── Update Existing Businesses (PATCH)
```

#### Contact Processing Path
```
Route by Item Type → Route Contact Create/Update → Link Contacts to Businesses
                                                 ├── Create New Contacts (POST)
                                                 └── Update Existing Contacts (PATCH)
```

### 4. Business-Contact Linking
```javascript
// Create business lookup map from created/updated businesses
const businessMap = new Map();
for (const item of items) {
  const data = item.json;
  if (data.company_name && data.business_key) {
    businessMap.set(data.business_key, data.id || data.business_id);
  }
}

// Link contacts to businesses
for (const item of items) {
  const contact = item.json;
  if (contact.item_type === 'contact') {
    let businessId = null;
    if (contact.business_key) {
      businessId = businessMap.get(contact.business_key);
    }
    // Add business_id to contact data
  }
}
```

## Field Mappings

### Airtable → Supabase Businesses
| Airtable Field | Supabase Field | Notes |
|----------------|----------------|-------|
| Company Name | company_name | Primary identifier |
| Website URL | website | Optional |
| (Derived) | business_type | Based on email domains |
| (Generated) | lead_score | 60 for corporate, 40 for others |
| (Static) | tags | ['airtable-sync'] |

### Airtable → Supabase Contacts
| Airtable Field | Supabase Field | Notes |
|----------------|----------------|-------|
| First Name | first_name | Required |
| Last Name | last_name | Optional |
| Email | email | Lowercased |
| Phone | phone | Optional |
| Job Title | title | Optional |
| LinkedIn Profile | linkedin_url | Handles object/string formats |
| Company Name | business_id | Resolved via business lookup |
| (Derived) | contact_type | Based on email domain + company |
| (Static) | lead_source | 'airtable' |
| (Static) | tags | ['airtable-sync'] |

## Benefits

### 1. **Normalized Data Structure**
- Eliminates duplicate company information
- Enables proper business-level analytics
- Supports multiple contacts per business

### 2. **Intelligent Classification**
- Automatic business type detection (prospect vs client)
- Contact type classification based on email domains
- Lead scoring based on business characteristics

### 3. **Robust Duplicate Prevention**
- Business deduplication by company name
- Contact deduplication by email and airtable_id
- Update existing records instead of creating duplicates

### 4. **Scalable Architecture**
- Foreign key relationships for data integrity
- Supports future CRM features (deals, activities, etc.)
- Proper indexing for performance

## Usage

### 1. Import the Workflow
```bash
# Copy the JSON workflow to your n8n instance
# File: automations/contacts/enhanced-business-contacts-sync.json
```

### 2. Configure Credentials
- **Airtable**: Personal Access Token
- **Supabase**: Service Role Key and Project URL

### 3. Test the Workflow
- Run manually first to verify data processing
- Check logs in the JavaScript nodes for processing details
- Verify businesses and contacts are created with proper relationships

### 4. Schedule Execution
- Default: Daily at 6AM
- Modify cron expression as needed: `0 6 * * *`

## Monitoring

### Success Metrics
- Number of businesses created/updated
- Number of contacts created/updated
- Processing time and error rates

### Log Analysis
Check console logs for:
```javascript
console.log('Business stats:', stats.businesses);
console.log('Contact stats:', stats.contacts);
console.log('Business mapping:', Object.fromEntries(businessMap));
```

### Error Handling
- Individual contact/business errors don't stop the entire workflow
- Comprehensive error logging with specific failure reasons
- Summary statistics include error counts

## Future Enhancements

1. **Industry Classification**: Auto-detect business industries
2. **Contact Enrichment**: Add external data sources for contact details
3. **Activity Tracking**: Log sync activities for audit trails
4. **Advanced Deduplication**: Fuzzy matching for similar company names
5. **Webhook Support**: Real-time sync instead of scheduled batches

## Troubleshooting

### Common Issues

1. **Missing Business Links**
   - Check business_key matching logic
   - Verify company name normalization (toLowerCase, trim)

2. **Duplicate Businesses**
   - Review company name uniqueness constraint
   - Check for case sensitivity issues

3. **Failed Contact Creation**
   - Verify business_id references exist
   - Check required field validation

### Debug Steps

1. **Enable Detailed Logging**: Uncomment debug console.log statements
2. **Test Individual Nodes**: Run nodes separately to isolate issues
3. **Check Database Constraints**: Verify foreign key relationships
4. **Validate Field Mappings**: Ensure Airtable field names match exactly
