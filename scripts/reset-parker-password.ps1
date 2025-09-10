# PowerShell script to reset Parker's password using Supabase Admin API
# Run with: .\scripts\reset-parker-password.ps1

Write-Host "🔧 Resetting Parker's password..." -ForegroundColor Green

# Check if required environment variable exists
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY
if (-not $serviceRoleKey) {
    Write-Host "❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required" -ForegroundColor Red
    Write-Host "   Get it from: https://supabase.com/dashboard > Settings > API > Service Role Key" -ForegroundColor Yellow
    Write-Host "   Set it with: `$env:SUPABASE_SERVICE_ROLE_KEY = 'your_service_role_key_here'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔍 Alternative: Manual password reset in Supabase Dashboard:" -ForegroundColor Cyan
    Write-Host "   1. Go to Authentication → Users" -ForegroundColor White
    Write-Host "   2. Click on parker@syntora.io" -ForegroundColor White
    Write-Host "   3. Set password to: TempPassword123!" -ForegroundColor White
    Write-Host "   4. Ensure 'Email Confirmed' is checked" -ForegroundColor White
    exit 1
}

# Supabase configuration
$supabaseUrl = "https://qcrgacxgwlpltdfpwkiz.supabase.co"
$headers = @{
    "apikey" = $serviceRoleKey
    "Authorization" = "Bearer $serviceRoleKey"
    "Content-Type" = "application/json"
}

try {
    # Update user password using admin API
    $updateUserBody = @{
        password = "TempPassword123!"
        email_confirm = $true
    } | ConvertTo-Json -Depth 2

    Write-Host "Updating password for user 7b4c733a-cd86-4fa2-9b3c-21f7f75f1bae..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$supabaseUrl/auth/v1/admin/users/7b4c733a-cd86-4fa2-9b3c-21f7f75f1bae" -Method PUT -Headers $headers -Body $updateUserBody

    Write-Host "✅ Password reset successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Login credentials:" -ForegroundColor Cyan
    Write-Host "   Email: parker@syntora.io" -ForegroundColor White
    Write-Host "   Password: TempPassword123!" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Change this password after logging in!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📊 User verification:" -ForegroundColor Cyan
    Write-Host "   User ID: $($response.id)" -ForegroundColor White
    Write-Host "   Email: $($response.email)" -ForegroundColor White
    Write-Host "   Email Confirmed: $(if ($response.email_confirmed_at) { 'Yes' } else { 'No' })" -ForegroundColor White
    Write-Host "   Role: superadmin (set in profiles table)" -ForegroundColor White

} catch {
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        $responseBody = $_.ErrorDetails.Message
        Write-Host "❌ HTTP Error $statusCode`: $responseBody" -ForegroundColor Red
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔍 Manual alternative:" -ForegroundColor Cyan
    Write-Host "   1. Go to https://supabase.com/dashboard/project/qcrgacxgwlpltdfpwkiz/auth/users" -ForegroundColor White
    Write-Host "   2. Click on parker@syntora.io user" -ForegroundColor White
    Write-Host "   3. Set password to: TempPassword123!" -ForegroundColor White
    Write-Host "   4. Ensure 'Email Confirmed' is checked" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Production app: https://syntora-crm.vercel.app/" -ForegroundColor Cyan
}
