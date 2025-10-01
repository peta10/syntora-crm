/**
 * Offline-first Task Manager using Supabase MCP
 * Provides seamless offline/online task management with automatic sync
 */

import { Todo } from '@/app/types/todo';
import ChicagoTime from '@/app/utils/timezone';

interface OfflineTask extends Todo {
  _localId?: string;
  _needsSync?: boolean;
  _isDeleted?: boolean;
  _lastSyncAt?: string;
  _conflictResolution?: 'local' | 'remote' | 'manual';
  // Database-specific fields that may not be in Todo interface
  date?: string;
  sort_order?: number;
  energy_level_required?: number;
  completed_at?: string;
  actual_duration?: number;
  user_id?: string;
}

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  taskId: string;
  data: any;
  timestamp: number;
  retries: number;
}

class OfflineTaskManager {
  private static instance: OfflineTaskManager;
  private tasks: Map<string, OfflineTask> = new Map();
  private syncQueue: SyncOperation[] = [];
  private isOnline: boolean = typeof window !== 'undefined' ? navigator.onLine : false;
  private syncInProgress: boolean = false;
  private listeners: ((tasks: OfflineTask[]) => void)[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeNetworkListeners();
      this.loadFromStorage();
      this.startPeriodicSync();
    }
  }

  static getInstance(): OfflineTaskManager {
    if (!OfflineTaskManager.instance) {
      OfflineTaskManager.instance = new OfflineTaskManager();
    }
    return OfflineTaskManager.instance;
  }

  private initializeNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('🟢 Network: ONLINE - Starting sync');
      this.isOnline = true;
      this.syncWithSupabase();
    });

    window.addEventListener('offline', () => {
      console.log('🔴 Network: OFFLINE - Switching to local mode');
      this.isOnline = false;
    });
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('syntora_tasks');
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach((task: OfflineTask) => {
          this.tasks.set(task.id, task);
        });
      }

      const queueStored = localStorage.getItem('syntora_sync_queue');
      if (queueStored) {
        this.syncQueue = JSON.parse(queueStored);
      }

      console.log(`📱 Loaded ${this.tasks.size} tasks from local storage`);
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const tasksArray = Array.from(this.tasks.values()).filter(task => !task._isDeleted);
      localStorage.setItem('syntora_tasks', JSON.stringify(tasksArray));
      localStorage.setItem('syntora_sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  private notifyListeners(): void {
    const tasks = Array.from(this.tasks.values()).filter(task => !task._isDeleted);
    this.listeners.forEach(listener => {
      try {
        listener(tasks);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  private startPeriodicSync(): void {
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncWithSupabase();
      }
    }, 30000); // Sync every 30 seconds when online
  }

  // Public API
  subscribe(listener: (tasks: OfflineTask[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async getAllTasks(): Promise<OfflineTask[]> {
    // If this is the first load and we have no local tasks, try to load from remote
    if (this.tasks.size === 0 && this.isOnline) {
      await this.initialLoadFromSupabase();
    }
    
    // If online, try to sync
    if (this.isOnline && !this.syncInProgress) {
      this.syncWithSupabase().catch(error => 
        console.error('Background sync failed:', error)
      );
    }
    
    return Array.from(this.tasks.values()).filter(task => !task._isDeleted);
  }

  private async initialLoadFromSupabase(): Promise<void> {
    try {
      console.log('🔄 Initial load from Supabase...');
      
      // Import Supabase client dynamically
      const { supabase } = await import('@/app/lib/supabase/client');
      
      const { data: remoteTasks, error } = await supabase
        .from('daily_todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Supabase query failed: ${error.message}`);
      }

      if (remoteTasks && remoteTasks.length > 0) {
        console.log(`📥 Loaded ${remoteTasks.length} tasks from Supabase`);
        
        for (const dbTask of remoteTasks) {
          const offlineTask = this.mapDbTaskToOfflineTask(dbTask);
          this.tasks.set(dbTask.id, {
            ...offlineTask,
            _needsSync: false,
            _lastSyncAt: new Date().toISOString()
          });
        }
        
        this.saveToStorage();
        localStorage.setItem('syntora_last_sync', new Date().toISOString());
      }
      
    } catch (error) {
      console.error('Failed to load from Supabase:', error);
      // Continue with local data if available
    }
  }

  async createTask(taskData: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<OfflineTask> {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const task: OfflineTask = {
      id: tempId,
      ...taskData,
      created_at: now,
      updated_at: now,
      _localId: tempId,
      _needsSync: true
    };

    this.tasks.set(tempId, task);
    this.saveToStorage();
    this.notifyListeners();

    // Add to sync queue
    this.addToSyncQueue({
      type: 'create',
      taskId: tempId,
      data: taskData,
      timestamp: Date.now(),
      retries: 0
    });

    // Try immediate sync if online
    if (this.isOnline) {
      this.syncWithSupabase();
    }

    console.log('📝 Created task offline:', task.title);
    return task;
  }

  async updateTask(id: string, updates: Partial<Todo>): Promise<OfflineTask | null> {
    const task = this.tasks.get(id);
    if (!task) {
      console.error('Task not found:', id);
      return null;
    }

    const updatedTask: OfflineTask = {
      ...task,
      ...updates,
      updated_at: new Date().toISOString(),
      _needsSync: true
    };

    this.tasks.set(id, updatedTask);
    this.saveToStorage();
    this.notifyListeners();

    // Add to sync queue
    this.addToSyncQueue({
      type: 'update',
      taskId: id,
      data: updates,
      timestamp: Date.now(),
      retries: 0
    });

    // Try immediate sync if online
    if (this.isOnline) {
      this.syncWithSupabase();
    }

    console.log('✏️ Updated task offline:', updatedTask.title);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task) {
      return false;
    }

    // Mark as deleted instead of removing
    const deletedTask: OfflineTask = {
      ...task,
      _isDeleted: true,
      _needsSync: true,
      updated_at: new Date().toISOString()
    };

    this.tasks.set(id, deletedTask);
    this.saveToStorage();
    this.notifyListeners();

    // Add to sync queue
    this.addToSyncQueue({
      type: 'delete',
      taskId: id,
      data: {},
      timestamp: Date.now(),
      retries: 0
    });

    // Try immediate sync if online
    if (this.isOnline) {
      this.syncWithSupabase();
    }

    console.log('🗑️ Deleted task offline:', task.title);
    return true;
  }

  private addToSyncQueue(operation: Omit<SyncOperation, 'id'>): void {
    const syncOp: SyncOperation = {
      ...operation,
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.syncQueue.push(syncOp);
    this.saveToStorage();
  }

  private async syncWithSupabase(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting Supabase sync...');

    try {
      // Step 1: Pull remote changes
      await this.pullRemoteChanges();
      
      // Step 2: Push local changes
      await this.pushLocalChanges();
      
      // Step 3: Process sync queue
      await this.processSyncQueue();

      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async pullRemoteChanges(): Promise<void> {
    try {
      // Get last sync timestamp
      const lastSync = localStorage.getItem('syntora_last_sync') || '1970-01-01T00:00:00Z';
      
      console.log('📥 Pulling remote changes since:', lastSync);
      
      // Import Supabase client dynamically
      const { supabase } = await import('@/app/lib/supabase/client');
      
      const { data: remoteTasks, error } = await supabase
        .from('daily_todos')
        .select('*')
        .gte('updated_at', lastSync)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Supabase query failed: ${error.message}`);
      }

      if (remoteTasks && remoteTasks.length > 0) {
        console.log(`📥 Found ${remoteTasks.length} remote changes`);
        
        for (const dbTask of remoteTasks) {
          const localTask = this.tasks.get(dbTask.id);
          const remoteTask = this.mapDbTaskToOfflineTask(dbTask);
          
          if (!localTask || new Date(remoteTask.updated_at) > new Date(localTask.updated_at)) {
            // Remote is newer or doesn't exist locally
            this.tasks.set(dbTask.id, {
              ...remoteTask,
              _needsSync: false,
              _lastSyncAt: new Date().toISOString()
            });
          }
        }
        
        this.saveToStorage();
        this.notifyListeners();
      }

      localStorage.setItem('syntora_last_sync', new Date().toISOString());
    } catch (error) {
      console.error('Failed to pull remote changes:', error);
    }
  }

  private async pushLocalChanges(): Promise<void> {
    const tasksNeedingSync = Array.from(this.tasks.values()).filter(task => task._needsSync);
    
    if (tasksNeedingSync.length === 0) {
      return;
    }

    console.log(`📤 Pushing ${tasksNeedingSync.length} local changes to remote...`);
    
    // Import Supabase client dynamically
    const { supabase } = await import('@/app/lib/supabase/client');
    
    for (const task of tasksNeedingSync) {
      try {
        if (task._isDeleted) {
          // Delete from remote
          console.log('🗑️ Deleting from remote:', task.title);
          const { error } = await supabase
            .from('daily_todos')
            .delete()
            .eq('id', task.id);

          if (error) throw error;
          
          // Remove from local storage completely
          this.tasks.delete(task.id);
          
        } else if (task._localId && task.id.startsWith('temp-')) {
          // Create new task in remote
          console.log('📝 Creating in remote:', task.title);
          const dbTask = this.mapOfflineTaskToDb(task);
          
          const { data, error } = await supabase
            .from('daily_todos')
            .insert([dbTask])
            .select()
            .single();

          if (error) throw error;

          // Update local with server-generated ID
          const updatedTask = {
            ...task,
            id: data.id,
            created_at: data.created_at,
            updated_at: data.updated_at,
            _needsSync: false,
            _localId: undefined,
            _lastSyncAt: new Date().toISOString()
          };
          
          this.tasks.delete(task.id); // Remove temp ID
          this.tasks.set(data.id, updatedTask); // Add with real ID
          
        } else {
          // Update existing task
          console.log('✏️ Updating in remote:', task.title);
          const dbTask = this.mapOfflineTaskToDb(task);
          
          const { data, error } = await supabase
            .from('daily_todos')
            .update(dbTask)
            .eq('id', task.id)
            .select()
            .single();

          if (error) throw error;

          // Update local with server response
          const updatedTask = {
            ...task,
            updated_at: data.updated_at,
            _needsSync: false,
            _lastSyncAt: new Date().toISOString()
          };
          
          this.tasks.set(task.id, updatedTask);
        }

      } catch (error) {
        console.error(`Failed to sync task ${task.id}:`, error);
      }
    }

    this.saveToStorage();
    this.notifyListeners();
  }

  // Mapping functions for database compatibility
  private mapDbTaskToOfflineTask(dbTask: any): OfflineTask {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description,
      completed: dbTask.completed,
      show_gratitude: dbTask.show_gratitude,
      created_at: dbTask.created_at,
      updated_at: dbTask.updated_at,
      priority: this.mapPriorityFromDb(dbTask.priority),
      category: dbTask.category,
      tags: dbTask.tags,
      due_date: dbTask.date, // Map date field to due_date
      estimated_duration: dbTask.estimated_duration,
      from_reflection: false,
      reflection_date: undefined,
      order: dbTask.sort_order || 0,
      time_tracking_enabled: dbTask.time_tracking_enabled,
      time_started_at: dbTask.time_started_at,
      time_stopped_at: dbTask.time_stopped_at,
      total_time_spent: dbTask.total_time_spent,
      is_currently_tracking: dbTask.is_currently_tracking,
      // Add offline-specific fields
      date: dbTask.date,
      sort_order: dbTask.sort_order,
      energy_level_required: dbTask.energy_level_required,
      completed_at: dbTask.completed_at,
      actual_duration: dbTask.actual_duration,
      user_id: dbTask.user_id
    };
  }

  private mapOfflineTaskToDb(task: OfflineTask): any {
    return {
      title: task.title,
      description: task.description,
      completed: task.completed,
      show_gratitude: task.show_gratitude,
      priority: typeof task.priority === 'string' ? this.mapPriorityToDb(task.priority) : task.priority,
      category: task.category,
      tags: task.tags,
      estimated_duration: task.estimated_duration,
      sort_order: task.order || 0,
      date: task.due_date || task.date || new Date().toISOString().split('T')[0],
      energy_level_required: task.energy_level_required || 2,
      time_tracking_enabled: task.time_tracking_enabled,
      time_started_at: task.time_started_at,
      time_stopped_at: task.time_stopped_at,
      total_time_spent: task.total_time_spent,
      is_currently_tracking: task.is_currently_tracking,
      updated_at: new Date().toISOString()
    };
  }

  private mapPriorityFromDb(priority: number): 'high' | 'medium' | 'low' {
    if (priority >= 4) return 'high';
    if (priority >= 2) return 'medium';
    return 'low';
  }

  private mapPriorityToDb(priority: 'high' | 'medium' | 'low' | number): number {
    if (typeof priority === 'number') return priority;
    switch (priority) {
      case 'high': return 5;
      case 'medium': return 3;
      case 'low': return 1;
      default: return 3;
    }
  }

  private async processSyncQueue(): Promise<void> {
    const operations = [...this.syncQueue];
    this.syncQueue = [];

    for (const operation of operations) {
      try {
        console.log(`⚡ Processing ${operation.type} operation for task ${operation.taskId}`);
        
        // In real implementation, this would execute the operation via Supabase MCP
        // For now, we'll just mark it as processed
        
      } catch (error) {
        console.error(`Failed to process operation ${operation.id}:`, error);
        
        // Retry logic
        if (operation.retries < 3) {
          operation.retries++;
          this.syncQueue.push(operation);
        }
      }
    }

    this.saveToStorage();
  }

  // Time tracking methods
  async startTimeTracking(taskId: string): Promise<OfflineTask | null> {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.error('Task not found for time tracking:', taskId);
      return null;
    }

    const now = ChicagoTime.toChicagoISO();
    
    // Stop any currently tracking tasks
    for (const [id, t] of this.tasks) {
      if (t.is_currently_tracking) {
        await this.stopTimeTracking(id);
      }
    }

    const updatedTask: OfflineTask = {
      ...task,
      time_tracking_enabled: true,
      time_started_at: now,
      is_currently_tracking: true,
      updated_at: now,
      _needsSync: true
    };

    this.tasks.set(taskId, updatedTask);
    this.saveToStorage();
    this.notifyListeners();

    // Try to sync to remote if online
    if (this.isOnline) {
      try {
        const { supabase } = await import('@/app/lib/supabase/client');
        
        // Stop all other tracking tasks
        await supabase
          .from('daily_todos')
          .update({ 
            is_currently_tracking: false,
            time_stopped_at: now
          })
          .eq('is_currently_tracking', true);

        // Start tracking this task
        await supabase
          .from('daily_todos')
          .update({
            time_tracking_enabled: true,
            time_started_at: now,
            is_currently_tracking: true,
            updated_at: now
          })
          .eq('id', taskId);

        // Mark as synced
        updatedTask._needsSync = false;
        this.tasks.set(taskId, updatedTask);
        this.saveToStorage();

        // Refresh the task from database to ensure we have the latest data
        await this.refreshTaskFromDatabase(taskId);

      } catch (error) {
        console.log('Remote time tracking start failed, will sync later:', error);
      }
    }

    console.log('▶️ Started time tracking for:', task.title);
    return updatedTask;
  }

  async stopTimeTracking(taskId: string): Promise<OfflineTask | null> {
    const task = this.tasks.get(taskId);
    if (!task || !task.is_currently_tracking) {
      return null;
    }

    const now = ChicagoTime.toChicagoISO();
    let additionalTime = 0;
    
    if (task.time_started_at) {
      const startTime = new Date(task.time_started_at);
      const endTime = new Date(now);
      additionalTime = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    }
    
    const newTotalTime = (task.total_time_spent || 0) + additionalTime;

    const updatedTask: OfflineTask = {
      ...task,
      time_stopped_at: now,
      is_currently_tracking: false,
      total_time_spent: newTotalTime,
      updated_at: now,
      _needsSync: true
    };

    this.tasks.set(taskId, updatedTask);
    this.saveToStorage();
    this.notifyListeners();

    // Try to sync to remote if online
    if (this.isOnline) {
      try {
        const { supabase } = await import('@/app/lib/supabase/client');
        
        // Get current total time from database to ensure accuracy
        const { data: currentData, error: fetchError } = await supabase
          .from('daily_todos')
          .select('total_time_spent')
          .eq('id', taskId)
          .single();

        if (fetchError) {
          console.error('Error fetching current time:', fetchError);
        }

        const currentTotal = currentData?.total_time_spent || 0;
        const finalTotalTime = currentTotal + additionalTime;

        console.log(`⏱️ Time calculation: Current: ${currentTotal}m + Session: ${additionalTime}m = Total: ${finalTotalTime}m`);

        const { data: updateData, error: updateError } = await supabase
          .from('daily_todos')
          .update({
            time_stopped_at: now,
            is_currently_tracking: false,
            total_time_spent: finalTotalTime,
            updated_at: now
          })
          .eq('id', taskId)
          .select('total_time_spent, title')
          .single();

        if (updateError) {
          console.error('Database update error:', updateError);
          throw updateError;
        }

        // Update local task with the actual database value
        updatedTask.total_time_spent = updateData.total_time_spent;
        updatedTask._needsSync = false;
        this.tasks.set(taskId, updatedTask);
        this.saveToStorage();
        this.notifyListeners(); // Force UI refresh

        console.log(`✅ Database updated: ${updateData.title} now has ${updateData.total_time_spent} minutes tracked`);

        // Refresh the task from database to ensure we have the latest data
        await this.refreshTaskFromDatabase(taskId);

      } catch (error) {
        console.log('Remote time tracking stop failed, will sync later:', error);
      }
    }

    console.log(`⏹️ Stopped time tracking for: ${task.title}. Duration: ${additionalTime} minutes`);
    return updatedTask;
  }

  // Refresh a specific task from database
  private async refreshTaskFromDatabase(taskId: string): Promise<void> {
    try {
      const { supabase } = await import('@/app/lib/supabase/client');
      
      const { data, error } = await supabase
        .from('daily_todos')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        console.error('Error refreshing task from database:', error);
        return;
      }

      if (data) {
        const refreshedTask = this.mapDbTaskToOfflineTask(data);
        this.tasks.set(taskId, {
          ...refreshedTask,
          _needsSync: false,
          _lastSyncAt: new Date().toISOString()
        });
        
        this.saveToStorage();
        this.notifyListeners();
        
        console.log(`🔄 Refreshed task from database: ${refreshedTask.title} (${refreshedTask.total_time_spent}m tracked)`);
      }

    } catch (error) {
      console.error('Failed to refresh task from database:', error);
    }
  }

  // Utility methods
  getNetworkStatus(): 'online' | 'offline' {
    return this.isOnline ? 'online' : 'offline';
  }

  getPendingSyncCount(): number {
    const needsSync = Array.from(this.tasks.values()).filter(task => task._needsSync).length;
    return needsSync + this.syncQueue.length;
  }

  async forceSyncNow(): Promise<void> {
    if (this.isOnline) {
      await this.syncWithSupabase();
      this.notifyListeners();
    }
  }
}

export default OfflineTaskManager.getInstance();
export type { OfflineTask, SyncOperation };
