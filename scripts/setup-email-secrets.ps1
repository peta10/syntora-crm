# PowerShell script to set up Resend email secrets for Supabase Edge Functions
# Run with: .\scripts\setup-email-secrets.ps1

Write-Host "🔧 Setting up Resend email secrets..." -ForegroundColor Green

# Get the webhook secret from user
$webhookSecret = Read-Host "Enter the SEND_EMAIL_HOOK_SECRET from Supabase Auth Hooks dashboard (format: v1,whsec_...)"
if (-not $webhookSecret) {
    Write-Host "❌ SEND_EMAIL_HOOK_SECRET is required" -ForegroundColor Red
    Write-Host "   Get it from: https://supabase.com/dashboard/project/qcrgacxgwlpltdfpwkiz/auth/hooks" -ForegroundColor Yellow
    exit 1
}

# Resend API key from .env.local
$resendApiKey = "re_dg4M1vhK_PACJKCVQ2swisAbVz7LkHWtd"

# Supabase configuration
$supabaseUrl = "https://qcrgacxgwlpltdfpwkiz.supabase.co"
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $serviceRoleKey) {
    Write-Host "❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required" -ForegroundColor Red
    Write-Host "   Get it from: https://supabase.com/dashboard/project/qcrgacxgwlpltdfpwkiz/settings/api" -ForegroundColor Yellow
    Write-Host "   Set it with: `$env:SUPABASE_SERVICE_ROLE_KEY = 'your_service_role_key_here'" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "apikey" = $serviceRoleKey
    "Authorization" = "Bearer $serviceRoleKey"
    "Content-Type" = "application/json"
}

try {
    Write-Host "Setting RESEND_API_KEY secret..." -ForegroundColor Yellow
    
    # Set RESEND_API_KEY
    $resendSecretBody = @{
        name = "RESEND_API_KEY"
        value = $resendApiKey
    } | ConvertTo-Json
    
    $response1 = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/secrets" -Method POST -Headers $headers -Body $resendSecretBody
    Write-Host "✅ RESEND_API_KEY set successfully" -ForegroundColor Green

    Write-Host "Setting SEND_EMAIL_HOOK_SECRET..." -ForegroundColor Yellow
    
    # Set SEND_EMAIL_HOOK_SECRET
    $hookSecretBody = @{
        name = "SEND_EMAIL_HOOK_SECRET"
        value = $webhookSecret
    } | ConvertTo-Json
    
    $response2 = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/secrets" -Method POST -Headers $headers -Body $hookSecretBody
    Write-Host "✅ SEND_EMAIL_HOOK_SECRET set successfully" -ForegroundColor Green

    Write-Host ""
    Write-Host "🎉 Email hook setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Verify auth hook is enabled at: https://supabase.com/dashboard/project/qcrgacxgwlpltdfpwkiz/auth/hooks" -ForegroundColor White
    Write-Host "   2. Test password reset at: https://syntora-crm.vercel.app/reset-password" -ForegroundColor White
    Write-Host "   3. Enter: parker@syntora.io" -ForegroundColor White
    Write-Host "   4. Check email (should arrive via Resend)" -ForegroundColor White

} catch {
    Write-Host "❌ Error setting secrets: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Manual alternative:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://supabase.com/dashboard/project/qcrgacxgwlpltdfpwkiz/settings/functions" -ForegroundColor White
    Write-Host "   2. Add secret: RESEND_API_KEY = $resendApiKey" -ForegroundColor White
    Write-Host "   3. Add secret: SEND_EMAIL_HOOK_SECRET = $webhookSecret" -ForegroundColor White
}
