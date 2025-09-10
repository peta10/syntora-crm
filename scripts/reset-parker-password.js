#!/usr/bin/env node

/**
 * Quick script to reset Parker's password using Supabase Admin API
 * Run with: node scripts/reset-parker-password.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qcrgacxgwlpltdfpwkiz.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('   Get it from: https://supabase.com/dashboard > Settings > API > Service Role Key');
  console.log('   Set it with: export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetParkerPassword() {
  console.log('🔧 Resetting Parker\'s password...');

  try {
    // Update user password directly using admin API
    const { data: userData, error: updateError } = await supabase.auth.admin.updateUserById(
      '7b4c733a-cd86-4fa2-9b3c-21f7f75f1bae', // Parker's user ID
      {
        password: 'TempPassword123!',
        email_confirm: true, // Ensure email is confirmed
      }
    );

    if (updateError) {
      console.error('❌ Error updating user:', updateError.message);
      return;
    }

    console.log('✅ Password reset successfully!');
    console.log('\n🎯 Login credentials:');
    console.log('   Email: parker@syntora.io');
    console.log('   Password: TempPassword123!');
    console.log('\n⚠️  IMPORTANT: Change this password after logging in!');
    
    // Verify the user is properly set up
    console.log('\n📊 User verification:');
    console.log(`   User ID: ${userData.user.id}`);
    console.log(`   Email: ${userData.user.email}`);
    console.log(`   Email Confirmed: ${userData.user.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`   Last Sign In: ${userData.user.last_sign_in_at || 'Never'}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

resetParkerPassword();
