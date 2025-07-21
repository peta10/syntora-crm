"use client";

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TodoItem from '../TodoItem';
import TodoForm from '../TodoForm';
import { Todo } from '@/app/types/todo';
import useStore from '@/app/store/slices/todoSlice';

type FilterType = 'all' | 'active' | 'completed' | 'spiritual';
type SortType = 'priority' | 'date' | 'category';

const TodoList: React.FC = () => {
  const { todos, isLoading, fetchTodos, addTodo, updateTodo, deleteTodo } = useStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date');

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>) => {
    await addTodo(todo);
  };

  const handleComplete = async (id: string) => {
    const todo = todos.find((todo: Todo) => todo.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
  };

  const handleUpdate = async (id: string, updates: Partial<Todo>) => {
    await updateTodo(id, updates);
  };

  const filteredTodos = todos.filter((todo: Todo) => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      case 'spiritual':
        return todo.show_gratitude;
      default:
        return true;
    }
  });

  const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const sortedTodos = [...filteredTodos].sort((a: Todo, b: Todo) => {
    switch (sort) {
      case 'priority':
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      case 'date':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <TodoForm onSubmit={handleAddTodo} />

      {/* Filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          {(['all', 'active', 'completed', 'spiritual'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${filter === f 
                  ? 'bg-spiritual-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortType)}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white"
        >
          <option value="date">Sort by Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>

      {/* Todo List */}
      <motion.div layout className="space-y-4">
        <AnimatePresence>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : sortedTodos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No todos found. Add one above!
            </div>
          ) : (
            sortedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TodoList; 