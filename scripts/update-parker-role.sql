-- ✅ COMPLETED: Update Parker's profile to SUPERADMIN role
-- This has been successfully applied via Supabase MCP

-- Verify the role update (should show 'superadmin')
SELECT id, email, role, full_name, updated_at 
FROM profiles 
WHERE email = 'parker@syntora.io';

-- ✅ COMPLETED: Database constraint updated to allow 'superadmin' role
-- The profiles_role_check constraint now includes: 'user', 'moderator', 'admin', 'superadmin'

-- 🔧 NEXT STEPS FOR PASSWORD RESET:
-- Option 1: Use the app's password reset flow
--   1. Go to https://syntora-todo-app.vercel.app/reset-password
--   2. Enter: parker@syntora.io  
--   3. Check email for reset link
--   4. Click link → goes to /update-password
--   5. Set new password → redirects to dashboard

-- Option 2: Manual password reset in Supabase Dashboard
--   1. Go to Authentication → Users in Supabase Dashboard
--   2. Click on parker@syntora.io user
--   3. Set new password (e.g., TempPassword123!)
--   4. Ensure "Email Confirmed" is true
--   5. Try logging in

-- 📊 Current Status:
-- ✅ User exists: 7b4c733a-cd86-4fa2-9b3c-21f7f75f1bae
-- ✅ Email confirmed: 2025-09-09 22:40:29.435035+00
-- ✅ Profile role: superadmin
-- ❌ Never signed in: last_sign_in_at is null (password issue)

-- 🎯 The login issue is purely password-related - user account is properly set up!
