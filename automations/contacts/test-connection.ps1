# Test Airtable Connection Script
# Tests the connection to your Airtable base with the configured credentials

Write-Host "🧪 Testing Airtable Connection..." -ForegroundColor Cyan
Write-Host "Base ID: app1Z91z04fuR6Gd0" -ForegroundColor Yellow
Write-Host "Token: patJTLsgN5jMHzK6m" -ForegroundColor Yellow

# Test Airtable API connection
$airtableUrl = "https://api.airtable.com/v0/app1Z91z04fuR6Gd0/Contacts?maxRecords=3"
$headers = @{
    "Authorization" = "Bearer patJTLsgN5jMHzK6m"
    "Content-Type" = "application/json"
}

try {
    Write-Host "`n📡 Making request to Airtable..." -ForegroundColor Blue
    $response = Invoke-RestMethod -Uri $airtableUrl -Method Get -Headers $headers
    
    Write-Host "✅ SUCCESS! Connection to Airtable established" -ForegroundColor Green
    Write-Host "📊 Found $($response.records.Count) records in your Contacts table" -ForegroundColor Green
    
    if ($response.records.Count -gt 0) {
        Write-Host "`n📋 Sample Contact Data:" -ForegroundColor Cyan
        $firstRecord = $response.records[0]
        Write-Host "  Record ID: $($firstRecord.id)" -ForegroundColor White
        
        # Display available fields
        Write-Host "  Available Fields:" -ForegroundColor White
        $firstRecord.fields.PSObject.Properties | ForEach-Object {
            Write-Host "    - $($_.Name): $($_.Value)" -ForegroundColor Gray
        }
        
        # Check for required fields
        Write-Host "`n🔍 Field Validation:" -ForegroundColor Cyan
        $requiredFields = @("First Name", "Last Name", "Phone", "Email", "Company Name", "Website URL", "LinkedIn Profile")
        $availableFields = $firstRecord.fields.PSObject.Properties.Name
        
        foreach ($field in $requiredFields) {
            if ($availableFields -contains $field) {
                Write-Host "  ✅ $field - Found" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  $field - Missing" -ForegroundColor Yellow
            }
        }
        
        Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
        Write-Host "  1. Import the workflow JSON into n8n" -ForegroundColor White
        Write-Host "  2. Configure your Syntora API credentials" -ForegroundColor White
        Write-Host "  3. Test the workflow manually" -ForegroundColor White
        Write-Host "  4. Activate the daily schedule" -ForegroundColor White
        
    } else {
        Write-Host "⚠️  No records found in Contacts table" -ForegroundColor Yellow
        Write-Host "   Add some test contacts to Airtable first" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ ERROR: Failed to connect to Airtable" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*401*") {
        Write-Host "`n🔐 Authentication Error - Check your access token" -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*404*") {
        Write-Host "`n🔍 Not Found Error - Check your Base ID or table name" -ForegroundColor Yellow
    } else {
        Write-Host "`n🌐 Network Error - Check your internet connection" -ForegroundColor Yellow
    }
}

Write-Host "`n📚 For help, see the setup guide in setup-guide.md" -ForegroundColor Cyan
