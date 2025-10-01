/**
 * Time Tracking Manager with Supabase integration
 * Handles start/stop time tracking with real-time updates and offline support
 */

import ChicagoTime from '@/app/utils/timezone';

interface TimeTrackingState {
  taskId: string;
  startTime: string;
  elapsedSeconds: number;
  isTracking: boolean;
}

interface TimeEntry {
  taskId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  date: string;
}

class TimeTrackingManager {
  private static instance: TimeTrackingManager;
  private currentTracking: TimeTrackingState | null = null;
  private timerInterval: NodeJS.Timeout | null = null;
  private listeners: ((state: TimeTrackingState | null) => void)[] = [];
  private projectId = 'qcrgacxgwlpltdfpwkiz';

  private constructor() {
    this.loadFromStorage();
    this.startTimerUpdates();
  }

  static getInstance(): TimeTrackingManager {
    if (!TimeTrackingManager.instance) {
      TimeTrackingManager.instance = new TimeTrackingManager();
    }
    return TimeTrackingManager.instance;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('syntora_time_tracking');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.isTracking) {
          this.currentTracking = {
            ...data,
            elapsedSeconds: Math.floor((Date.now() - new Date(data.startTime).getTime()) / 1000)
          };
          console.log('📊 Resumed time tracking for task:', this.currentTracking?.taskId);
        }
      }
    } catch (error) {
      console.error('Failed to load time tracking state:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      if (this.currentTracking) {
        localStorage.setItem('syntora_time_tracking', JSON.stringify(this.currentTracking));
      } else {
        localStorage.removeItem('syntora_time_tracking');
      }
    } catch (error) {
      console.error('Failed to save time tracking state:', error);
    }
  }

  private startTimerUpdates(): void {
    if (typeof window === 'undefined') return;
    
    this.timerInterval = setInterval(() => {
      if (this.currentTracking && this.currentTracking.isTracking) {
        this.currentTracking.elapsedSeconds = Math.floor(
          (Date.now() - new Date(this.currentTracking.startTime).getTime()) / 1000
        );
        this.notifyListeners();
      }
    }, 1000);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentTracking);
      } catch (error) {
        console.error('Time tracking listener error:', error);
      }
    });
  }

  // Public API
  subscribe(listener: (state: TimeTrackingState | null) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately notify with current state
    listener(this.currentTracking);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async startTracking(taskId: string): Promise<boolean> {
    try {
      console.log('▶️ Starting time tracking for task:', taskId);
      
      // Stop any currently tracking task first
      if (this.currentTracking && this.currentTracking.isTracking) {
        await this.stopTracking();
      }

      const startTime = ChicagoTime.toChicagoISO();
      
      // Update database - stop all other tracking tasks and start this one
      const { supabase } = await import('@/app/lib/supabase/client');
      
      // First, stop any currently tracking tasks
      await supabase
        .from('daily_todos')
        .update({ 
          is_currently_tracking: false,
          time_stopped_at: startTime
        })
        .eq('is_currently_tracking', true);

      // Start tracking this task
      const { data, error } = await supabase
        .from('daily_todos')
        .update({
          time_tracking_enabled: true,
          time_started_at: startTime,
          is_currently_tracking: true,
          updated_at: startTime
        })
        .eq('id', taskId)
        .select('title')
        .single();

      if (error) {
        console.error('Database error starting time tracking:', error);
        throw error;
      }

      // Update local state
      this.currentTracking = {
        taskId,
        startTime,
        elapsedSeconds: 0,
        isTracking: true
      };

      this.saveToStorage();
      this.notifyListeners();

      console.log('✅ Time tracking started for:', data?.title || taskId);
      return true;

    } catch (error) {
      console.error('Failed to start time tracking:', error);
      return false;
    }
  }

  async stopTracking(): Promise<TimeEntry | null> {
    if (!this.currentTracking || !this.currentTracking.isTracking) {
      console.log('⏹️ No active time tracking to stop');
      return null;
    }

    try {
      console.log('⏹️ Stopping time tracking for task:', this.currentTracking.taskId);
      
      const endTime = ChicagoTime.toChicagoISO();
      const startTime = new Date(this.currentTracking.startTime);
      const endTimeDate = new Date(endTime);
      const durationMinutes = Math.floor((endTimeDate.getTime() - startTime.getTime()) / (1000 * 60));

      // Update database
      const { supabase } = await import('@/app/lib/supabase/client');
      
      // Get current total time spent
      const { data: currentTask, error: fetchError } = await supabase
        .from('daily_todos')
        .select('total_time_spent, title')
        .eq('id', this.currentTracking.taskId)
        .single();

      if (fetchError) {
        console.error('Error fetching current task:', fetchError);
        throw fetchError;
      }

      const newTotalTime = (currentTask.total_time_spent || 0) + durationMinutes;

      // Update the task with stopped time tracking
      const { error: updateError } = await supabase
        .from('daily_todos')
        .update({
          time_stopped_at: endTime,
          is_currently_tracking: false,
          total_time_spent: newTotalTime,
          updated_at: endTime
        })
        .eq('id', this.currentTracking.taskId);

      if (updateError) {
        console.error('Database error stopping time tracking:', updateError);
        throw updateError;
      }

      // Create time entry record
      const timeEntry: TimeEntry = {
        taskId: this.currentTracking.taskId,
        startTime: this.currentTracking.startTime,
        endTime,
        durationMinutes,
        date: ChicagoTime.getTodayString()
      };

      // Clear local state
      const taskId = this.currentTracking.taskId;
      this.currentTracking = null;
      this.saveToStorage();
      this.notifyListeners();

      console.log(`✅ Time tracking stopped. Duration: ${durationMinutes} minutes for ${currentTask.title}`);
      
      // Show notification if available
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Time Tracking Stopped', {
          body: `Tracked ${durationMinutes} minutes on "${currentTask.title}"`,
          icon: '/FinalFavicon.webp'
        });
      }

      return timeEntry;

    } catch (error) {
      console.error('Failed to stop time tracking:', error);
      return null;
    }
  }

  async toggleTracking(taskId: string): Promise<boolean> {
    if (this.currentTracking && this.currentTracking.taskId === taskId && this.currentTracking.isTracking) {
      const result = await this.stopTracking();
      return result !== null;
    } else {
      return await this.startTracking(taskId);
    }
  }

  getCurrentTracking(): TimeTrackingState | null {
    return this.currentTracking;
  }

  isTrackingTask(taskId: string): boolean {
    return this.currentTracking?.taskId === taskId && this.currentTracking.isTracking;
  }

  getElapsedTime(taskId: string): number {
    if (this.isTrackingTask(taskId)) {
      return this.currentTracking?.elapsedSeconds || 0;
    }
    return 0;
  }

  formatElapsedTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  formatTotalTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  }

  // Get time tracking statistics
  async getTimeTrackingStats(taskId?: string): Promise<{
    totalTimeToday: number;
    totalTimesTracked: number;
    averageSessionLength: number;
    longestSession: number;
  }> {
    try {
      const { supabase } = await import('@/app/lib/supabase/client');
      const today = ChicagoTime.getTodayString();
      
      let query = supabase
        .from('daily_todos')
        .select('total_time_spent, time_tracking_enabled')
        .eq('date', today)
        .gt('total_time_spent', 0);

      if (taskId) {
        query = query.eq('id', taskId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const totalTimeToday = data?.reduce((sum: number, task: any) => sum + (task.total_time_spent || 0), 0) || 0;
      const totalTimesTracked = data?.filter((task: any) => task.time_tracking_enabled).length || 0;
      const averageSessionLength = totalTimesTracked > 0 ? totalTimeToday / totalTimesTracked : 0;
      const longestSession = Math.max(...(data?.map((task: any) => task.total_time_spent || 0) || [0]));

      return {
        totalTimeToday,
        totalTimesTracked,
        averageSessionLength,
        longestSession
      };

    } catch (error) {
      console.error('Failed to get time tracking stats:', error);
      return {
        totalTimeToday: 0,
        totalTimesTracked: 0,
        averageSessionLength: 0,
        longestSession: 0
      };
    }
  }

  destroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.listeners = [];
  }
}

export default TimeTrackingManager.getInstance();
export type { TimeTrackingState, TimeEntry };
