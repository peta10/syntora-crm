import { supabase } from '@/app/lib/supabase/client';
import { DashboardMetrics } from '@/app/types/crm';

export class DashboardAPI {
  /**
   * Get comprehensive dashboard metrics from Supabase
   */
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      // Fetch monthly revenue (current month)
      const { data: currentRevenue, error: revenueError } = await supabase
        .from('crm_revenue_entries')
        .select('amount')
        .gte('revenue_date', currentMonth.toISOString())
        .lt('revenue_date', now.toISOString());

      if (revenueError) throw revenueError;

      const monthlyRevenue = currentRevenue?.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0) || 0;

      // Fetch last month revenue for comparison
      const { data: lastMonthRevenue, error: lastMonthError } = await supabase
        .from('crm_revenue_entries')
        .select('amount')
        .gte('revenue_date', lastMonth.toISOString())
        .lt('revenue_date', currentMonth.toISOString());

      if (lastMonthError) throw lastMonthError;

      const lastMonthTotal = lastMonthRevenue?.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0) || 1;
      const monthlyRevenueChange = lastMonthTotal > 0 
        ? ((monthlyRevenue - lastMonthTotal) / lastMonthTotal) * 100 
        : 0;

      // Fetch active deals (not closed won or closed lost)
      const { data: activeDealsData, error: dealsError } = await supabase
        .from('crm_deals')
        .select('id, stage')
        .not('stage', 'in', '(Closed Won,Closed Lost)');

      if (dealsError) throw dealsError;

      const activeDeals = activeDealsData?.length || 0;

      // Count deals from last month for comparison
      const { data: lastMonthDeals, error: lastMonthDealsError } = await supabase
        .from('crm_deals')
        .select('id')
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', currentMonth.toISOString());

      if (lastMonthDealsError) throw lastMonthDealsError;

      const activeDealsChange = lastMonthDeals?.length || 0;

      // Fetch new contacts this month
      const { data: newContactsData, error: contactsError } = await supabase
        .from('crm_contacts')
        .select('id')
        .gte('created_at', currentMonth.toISOString());

      if (contactsError) throw contactsError;

      const newContacts = newContactsData?.length || 0;

      // Count new contacts from last month for comparison
      const { data: lastMonthContacts, error: lastMonthContactsError } = await supabase
        .from('crm_contacts')
        .select('id')
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', currentMonth.toISOString());

      if (lastMonthContactsError) throw lastMonthContactsError;

      const lastMonthContactsCount = lastMonthContacts?.length || 1;
      const newContactsChange = lastMonthContactsCount > 0
        ? ((newContacts - lastMonthContactsCount) / lastMonthContactsCount) * 100
        : 0;

      // Fetch task completion data
      const { data: tasksData, error: tasksError } = await supabase
        .from('daily_todos')
        .select('completed')
        .gte('created_at', currentMonth.toISOString());

      if (tasksError) throw tasksError;

      const totalTasks = tasksData?.length || 1;
      const completedTasks = tasksData?.filter((t: any) => t.completed).length || 0;
      const taskCompletionRate = (completedTasks / totalTasks) * 100;

      // Fetch revenue history (last 6 months)
      const revenueHistory = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const { data: monthData, error: monthError } = await supabase
          .from('crm_revenue_entries')
          .select('amount')
          .gte('revenue_date', monthStart.toISOString())
          .lt('revenue_date', monthEnd.toISOString());

        if (!monthError) {
          const revenue = monthData?.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0) || 0;
          revenueHistory.push({
            month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
            revenue
          });
        }
      }

      // Fetch pipeline data
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('crm_deals')
        .select('stage, value')
        .not('stage', 'in', '(Closed Won,Closed Lost)');

      if (pipelineError) throw pipelineError;
      // Group by stage
      const stageMap: Record<string, { count: number; value: number }> = {};
      pipelineData?.forEach((deal: { stage: string; value: number }) => {
        if (!stageMap[deal.stage]) {
          stageMap[deal.stage] = { count: 0, value: 0 };
        }
        stageMap[deal.stage].count++;
        stageMap[deal.stage].value += deal.value || 0;
      });

      const pipelineDataArray = Object.entries(stageMap).map(([stage, data]) => ({
        stage,
        count: data.count,
        value: data.value
      }));

      // Fetch contact insights
      const { data: allContacts, error: allContactsError } = await supabase
        .from('crm_contacts')
        .select('contact_type, company');

      if (allContactsError) throw allContactsError;

      const totalContacts = allContacts?.length || 0;

      // Group by type
      const typeMap: Record<string, number> = {};
      const companyMap: Record<string, number> = {};

      allContacts?.forEach((contact: { contact_type?: string; company?: string }) => {
        // Count by type
        const type = contact.contact_type || 'unknown';
        typeMap[type] = (typeMap[type] || 0) + 1;

        // Count by company
        if (contact.company) {
          companyMap[contact.company] = (companyMap[contact.company] || 0) + 1;
        }
      });

      const byType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));
      const topCompanies = Object.entries(companyMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([company, count]) => ({ company, count }));

      return {
        monthlyRevenue,
        monthlyRevenueChange,
        activeDeals,
        activeDealsChange,
        newContacts,
        newContactsChange,
        completedTasks,
        totalTasks,
        taskCompletionRate,
        revenueHistory,
        pipelineData: pipelineDataArray,
        recentActivities: [], // TODO: Implement activities tracking
        upcomingTasks: [], // TODO: Fetch from daily_todos
        contactInsights: {
          totalContacts,
          newThisMonth: newContacts,
          byType,
          topCompanies
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw new Error('Failed to fetch dashboard metrics');
    }
  }
}
