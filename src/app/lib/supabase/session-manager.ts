import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export class SessionManager {
  private static instance: SessionManager;
  private supabase = createClient(supabaseUrl, supabaseAnonKey);

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async validateAndRefreshSession(): Promise<boolean> {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        return false;
      }

      if (!session) {
        console.warn('No active session found');
        return false;
      }

      // Check if session is expired or about to expire (within 5 minutes)
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry <= 0) {
        console.log('Session expired, attempting refresh...');
        return await this.refreshSession();
      }

      if (timeUntilExpiry <= 300) { // 5 minutes
        console.log('Session expiring soon, refreshing preemptively...');
        return await this.refreshSession();
      }

      console.log('Session is valid, expires in:', Math.floor(timeUntilExpiry / 60), 'minutes');
      return true;

    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  private async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      
      if (error || !data.session) {
        console.error('Session refresh failed:', error);
        return false;
      }

      console.log('✅ Session refreshed successfully');
      return true;

    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) {
      console.error('Get user error:', error);
      return null;
    }
    return user;
  }

  async ensureValidSession(): Promise<boolean> {
    const isValid = await this.validateAndRefreshSession();
    if (!isValid) {
      console.error('❌ Cannot establish valid session - user needs to sign in again');
    }
    return isValid;
  }
}

export default SessionManager.getInstance();
