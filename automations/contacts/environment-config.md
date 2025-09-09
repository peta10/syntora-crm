# 🔧 Environment Configuration - Airtable Sync

## Required Environment Variables

### Airtable Configuration
```bash
# Your Airtable access token (provided)
AIRTABLE_ACCESS_TOKEN=patJTLsgN5jMHzK6m

# Your Airtable Base ID (configured)
AIRTABLE_BASE_ID=app1Z91z04fuR6Gd0

# Table name in Airtable
AIRTABLE_TABLE_NAME=Contacts
```

### Syntora App Configuration
```bash
# Your Syntora app API base URL
SYNTORA_API_BASE_URL=https://your-domain.com/api

# API authentication token for Syntora
SYNTORA_API_TOKEN=your-syntora-api-token-here

# API endpoints
SYNTORA_CONTACTS_ENDPOINT=/crm/contacts
```

### Notification Configuration (Optional)
```bash
# Slack webhook URL for notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Email notifications (alternative)
NOTIFICATION_EMAIL=admin@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### n8n Specific Configuration
```bash
# Allow community packages as AI tools
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true

# Workflow execution settings
N8N_WORKFLOW_EXECUTION_TIMEOUT=300000
N8N_WORKFLOW_BATCH_SIZE=50
```

## Quick Setup Commands

### For n8n Cloud Users
1. Go to Settings > Environment Variables
2. Add each variable above with your actual values

### For Self-Hosted n8n
```bash
# Add to your .env file or docker-compose.yml
echo "AIRTABLE_ACCESS_TOKEN=patJTLsgN5jMHzK6m" >> .env
echo "AIRTABLE_BASE_ID=your-base-id" >> .env
echo "SYNTORA_API_BASE_URL=https://your-domain.com/api" >> .env
# ... add other variables
```

## Security Notes

- ⚠️ **Never commit tokens to version control**
- 🔒 **Use environment variables for all secrets**
- 🔄 **Rotate tokens regularly**
- 📝 **Document token permissions and scope**

## Testing Configuration

```bash
# Test Airtable connection
curl -H "Authorization: Bearer patJTLsgN5jMHzK6m" \
     "https://api.airtable.com/v0/YOUR_BASE_ID/Contacts?maxRecords=1"

# Test Syntora API connection
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://your-domain.com/api/crm/contacts?limit=1"
```
