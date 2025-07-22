'use client';

import React from 'react';
import { FocusTimer } from '@/app/components/focus/FocusTimer';
import useStore from '@/app/store/slices/todoSlice';
import { FocusSession } from '@/app/types/todo';

export default function FocusPage() {
  const { todos, updateTodo } = useStore();

  const handleSessionComplete = async (session: Omit<FocusSession, 'id'>) => {
    console.log('Focus session completed:', session);
    // Implementation would save session to your Supabase backend
    
    // Update tasks that were worked on during the session
    for (const taskId of session.task_ids) {
      await updateTodo(taskId, {
        // Mark as completed if session was completed
        completed: session.completed
      });
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<typeof todos[0]>) => {
    await updateTodo(taskId, updates);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <FocusTimer
        todos={todos}
        selectedTasks={[]} // Could be passed from URL params or state
        onSessionComplete={handleSessionComplete}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  );
} 