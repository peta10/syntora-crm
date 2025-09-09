# 🚀 Airtable Daily Contact Sync - Setup Guide

## Overview
This guide will help you set up the **Airtable Daily Contact Sync** automation that synchronizes contacts from your Airtable base to your Syntora todo application daily at 6 AM.

---

## 📋 Prerequisites

### ✅ Required Information
- **Airtable Access Token**: `patJTLsgN5jMHzK6m` (provided)
- **Airtable Base ID**: You need to find this in your Airtable base
- **Syntora API URL**: Your app's API endpoint
- **Slack Webhook URL**: For notifications (optional)

### ✅ Required Services
- n8n instance (cloud or self-hosted)
- Airtable account with Contacts base
- Syntora app running with API access
- Slack workspace (for notifications)

---

## 🔧 Step 1: Find Your Airtable Base ID

1. **Open your Airtable base** in the browser
2. **Copy the Base ID** from the URL:
   ```
   https://airtable.com/app[BASE_ID]/tbl...
   ```
   Example: `appXYZ123ABC456DEF`
3. **Verify your table name** is exactly "Contacts"
4. **Ensure your Airtable has these fields**:
   - First Name
   - Last Name
   - Phone
   - Email
   - Company Name
   - Website URL
   - LinkedIn Profile

---

## 🔐 Step 2: Set Up n8n Credentials

### Airtable Token Credential
1. In n8n, go to **Settings > Credentials**
2. Click **Create New Credential**
3. Select **Airtable Token API**
4. **Name**: `airtable-token`
5. **Access Token**: `patJTLsgN5jMHzK6m`
6. **Test connection** and save

### Syntora API Auth Credential
1. Create new credential: **HTTP Header Auth**
2. **Name**: `syntora-api-auth`
3. **Header Name**: `Authorization`
4. **Header Value**: `Bearer YOUR_API_TOKEN` (replace with your actual API token)
5. Save the credential

---

## 📥 Step 3: Import the Workflow

1. **Copy the workflow JSON** from `airtable-daily-sync.json`
2. In n8n, click **Import from JSON**
3. **Paste the JSON** and import
4. The workflow will be created as "Airtable Daily Contact Sync"

---

## ⚙️ Step 4: Configure the Workflow

### Update Airtable Base ID
1. **Open the workflow** in n8n
2. **Click on "Fetch Airtable Contacts" node**
3. **Verify Base ID** is set to `app1Z91z04fuR6Gd0` ✅ (Already configured!)
4. **Verify table name** is "Contacts"

### Update API URLs
1. **Click on "Fetch App Contacts" node**
2. **Update URL** to your Syntora app: `https://your-domain.com/api/crm/contacts`
3. **Repeat for other HTTP Request nodes**:
   - "Create New Contacts": `https://your-domain.com/api/crm/contacts`
   - "Update Existing Contacts": `https://your-domain.com/api/crm/contacts/{{ $json.id }}`

### Configure Notifications (Optional)
1. **Get your Slack webhook URL**:
   - Go to Slack App settings
   - Create incoming webhook
   - Copy the webhook URL
2. **Update notification nodes**:
   - "Send Error Notification"
   - "Send Success Notification"
   - Replace `YOUR_SLACK_WEBHOOK_URL` with your actual webhook URL

---

## 🧪 Step 5: Test the Workflow

### Manual Test
1. **Click "Execute Workflow"** to run manually
2. **Check the execution log** for any errors
3. **Verify contacts** are created/updated in your Syntora app
4. **Check Slack notifications** (if configured)

### Test Scenarios
- **New contact**: Add a contact in Airtable, run workflow
- **Updated contact**: Modify a contact in Airtable, run workflow
- **Invalid data**: Test with missing required fields
- **Duplicate email**: Test with existing email address

---

## 📅 Step 6: Activate the Workflow

1. **Toggle the workflow to "Active"**
2. **Verify the schedule**: Daily at 6 AM
3. **Monitor first few runs** to ensure stability

---

## 🔍 Monitoring & Maintenance

### Daily Monitoring
- **Check Slack notifications** for sync status
- **Review execution logs** in n8n for errors
- **Monitor app performance** during sync times

### Weekly Maintenance
- **Review error patterns** in sync reports
- **Check data quality** in both Airtable and app
- **Update field mappings** if needed

### Monthly Review
- **Analyze sync performance** and optimize if needed
- **Review contact classification** accuracy
- **Update business rules** based on data patterns

---

## 🚨 Troubleshooting

### Common Issues

#### "Base ID not found"
- **Verify Base ID** is correct in the Airtable node
- **Check access permissions** for the Airtable token
- **Ensure base is not deleted** or moved

#### "API Authentication Failed"
- **Verify API credentials** in n8n settings
- **Check API token** is valid and not expired
- **Ensure correct header format**: `Bearer YOUR_TOKEN`

#### "Table 'Contacts' not found"
- **Verify table name** is exactly "Contacts" (case-sensitive)
- **Check table exists** in the specified base
- **Ensure table is not hidden** or archived

#### "Email validation errors"
- **Check email format** in Airtable data
- **Review validation logic** in the Code node
- **Consider updating email regex** if needed

#### "Rate limit exceeded"
- **Reduce batch size** in the workflow
- **Add delays** between API calls
- **Check API rate limits** for your plan

### Debug Steps
1. **Run workflow manually** with test data
2. **Check each node output** for data format
3. **Review error messages** in execution logs
4. **Test API endpoints** independently
5. **Verify credentials** are working

---

## 📊 Business Logic Details

### Contact Classification Rules
```javascript
// Personal email domains
const personalDomains = [
  'gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 
  'icloud.com', 'aol.com', 'protonmail.com', 'mail.com'
];

// Classification logic
if (personalDomains.includes(emailDomain)) {
  return companyName ? 'friend' : 'unknown';
} else {
  return companyName ? 'client' : 'prospect';
}
```

### Data Validation
- **Required fields**: First Name, Last Name
- **Email validation**: RFC-compliant regex
- **URL validation**: Adds https:// if missing
- **Phone formatting**: US format (xxx) xxx-xxxx

### Change Detection
- **Compares key fields**: name, email, phone, company, website, LinkedIn
- **Skips unnecessary updates** to improve performance
- **Preserves app-specific data**: lead_score, notes, last_contact_date

---

## 🎯 Performance Optimization

### Current Settings
- **Batch size**: 50 contacts per batch
- **Concurrent requests**: Limited by n8n settings
- **Retry logic**: Built-in HTTP Request retries
- **Error handling**: Continue on individual failures

### Scaling Considerations
- **Large datasets**: Consider pagination for >1000 contacts
- **API limits**: Monitor rate limits and adjust batching
- **Memory usage**: Watch for large contact lists
- **Execution time**: Optimize for n8n timeout limits

---

## 📈 Success Metrics

### Daily Sync Health
- **Success rate**: >99% successful syncs
- **Processing time**: <5 minutes typical
- **Error rate**: <1% failed records
- **Data accuracy**: 100% field mapping accuracy

### Weekly Review Metrics
- **New contacts added**: Track growth
- **Contact updates**: Monitor data changes
- **Error patterns**: Identify data quality issues
- **Performance trends**: Watch for slowdowns

---

## 🔄 Backup & Recovery

### Workflow Backup
- **Export workflow JSON** regularly
- **Version control** workflow changes
- **Document modifications** with dates

### Data Recovery
- **Airtable history**: Use Airtable's revision history
- **App backups**: Ensure regular database backups
- **Manual recovery**: Process for fixing sync errors

---

## 📞 Support & Resources

### Documentation
- [n8n Documentation](https://docs.n8n.io/)
- [Airtable API Reference](https://airtable.com/developers/web/api/introduction)
- [Syntora API Documentation](./api-docs.md)

### Community
- [n8n Community Forum](https://community.n8n.io/)
- [Airtable Community](https://community.airtable.com/)

### Emergency Contacts
- **System Admin**: [Your contact info]
- **Development Team**: [Team contact]
- **Airtable Support**: Via Airtable help center

---

## ✅ Completion Checklist

- [ ] Airtable Base ID configured
- [ ] Credentials set up and tested
- [ ] API URLs updated for your domain
- [ ] Slack webhooks configured (optional)
- [ ] Workflow tested manually
- [ ] First automated run successful
- [ ] Monitoring alerts configured
- [ ] Team trained on troubleshooting
- [ ] Documentation updated with your specifics
- [ ] Backup procedures established

**🎉 Congratulations! Your Airtable sync automation is now live!**
